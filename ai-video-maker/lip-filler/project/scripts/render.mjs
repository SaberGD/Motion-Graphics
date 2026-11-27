// Renders index.html frame-by-frame with headless Chromium (Playwright).
// Usage: node scripts/render.mjs <pass> [workers] [frames]
//   pass = yellow | green          -> frames/<pass>/f0001.jpg ...   (plates + graphics, no captions)
//          caps                    -> frames/caps/f0001.png ...     (captions only, transparent)
//   frames = optional comma list of frame numbers (1-based) for quick checks
import {createServer} from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import {extname, join, resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({chromium} = require('playwright')); } catch { ({chromium} = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [pass = 'yellow', workers = '4', only] = process.argv.slice(2);
const N = 826;
const HQ = process.env.HQ === '1';
const isCaps = pass === 'caps';
const qs = isCaps ? 'bg=0&caps=1' : `v=${pass}&bg=1&caps=0`;
const outDir = join(ROOT, 'frames', pass + (HQ ? '_png' : ''));
await mkdir(outDir, {recursive: true});

const MIME = {'.html': 'text/html', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.js': 'text/javascript'};
const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(ROOT)) throw 0;
    const body = await readFile(p);
    res.writeHead(200, {'content-type': MIME[extname(p)] || 'application/octet-stream'}); res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const frames = only ? only.split(',').map(Number) : [...Array(N)].map((_, i) => i + 1);
const browser = await chromium.launch({args: ['--disable-web-security', '--font-render-hinting=none']});
const t0 = Date.now();
let done = 0;
await Promise.all([...Array(+workers)].map(async (_, w) => {
  const page = await browser.newPage({viewport: {width: 1080, height: 1920}, deviceScaleFactor: 1});
  page.on('pageerror', e => console.error('pageerror', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html?${qs}`);
  await page.evaluate(() => window.ready);
  for (let k = w; k < frames.length; k += +workers) {
    const f = frames[k];
    await page.evaluate(t => window.renderFrame(t), (f - 1) / 30);
    const path = join(outDir, `f${String(f).padStart(4, '0')}.${isCaps || HQ ? 'png' : 'jpg'}`);
    await page.screenshot(isCaps ? {path, omitBackground: true} : HQ ? {path, type: 'png'} : {path, type: 'jpeg', quality: 95});
    if (++done % 100 === 0) console.log(`${pass}: ${done}/${frames.length}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}));
await browser.close(); server.close();
console.log(`${pass}: done ${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
