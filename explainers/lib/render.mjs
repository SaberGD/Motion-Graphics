// Render an explainer page to stills or a silent video.
//   node explainers/lib/render.mjs <videoDir> stills 1.5 9 20     -> <videoDir>/build/stills/t_<sec>.png
//   node explainers/lib/render.mjs <videoDir> video [fps]         -> <videoDir>/build/video_silent.mp4 + events.json
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import url from 'url';

const require = createRequire(import.meta.url);
const here = path.dirname(url.fileURLToPath(import.meta.url));
const { chromium } = require(path.join(here, '../../node_modules/playwright-core'));

const HOME = os.homedir();
const EXE = process.env.CHROME || path.join(HOME, '.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell');
const LIBS = path.join(HOME, '.local/chromelibs/root');
const FFMPEG = process.env.FFMPEG || path.join(HOME, '.local/bin/ffmpeg');

const [, , dirArg, mode = 'stills', ...rest] = process.argv;
const dir = path.resolve(dirArg);
const build = path.join(dir, 'build');
const timeline = JSON.parse(fs.readFileSync(path.join(build, 'timeline.json'), 'utf8'));

const browser = await chromium.launch({
  executablePath: EXE,
  env: { ...process.env, LD_LIBRARY_PATH: [`${LIBS}/usr/lib/x86_64-linux-gnu`, `${LIBS}/lib/x86_64-linux-gnu`].join(':') },
  args: ['--allow-file-access-from-files', '--font-render-hinting=none'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
// inline <!--#include path--> (relative to the video folder) into a generated _page.html
const src = fs.readFileSync(path.join(dir, 'index.html'), 'utf8')
  .replace(/<!--#include\s+(\S+)\s*-->/g, (_, p) => fs.readFileSync(path.join(dir, p), 'utf8'));
fs.writeFileSync(path.join(dir, '_page.html'), src);
await page.goto(url.pathToFileURL(path.join(dir, '_page.html')).href);
await page.evaluate(() => document.fonts.ready);
const info = await page.evaluate((tl) => window.setup(tl), timeline);
fs.writeFileSync(path.join(build, 'events.json'), JSON.stringify(info.events, null, 1));

const frame = async (t, type = 'png', quality) => {
  await page.evaluate((t) => window.render(t), t);
  return page.screenshot({ type, quality, animations: 'disabled', caret: 'hide' });
};

if (mode === 'stills') {
  const out = path.join(build, 'stills');
  fs.mkdirSync(out, { recursive: true });
  for (const s of rest.length ? rest : ['1', '5', '10']) {
    fs.writeFileSync(path.join(out, `t_${s}.png`), await frame(+s));
    console.log('still', s);
  }
} else {
  const fps = +(rest[0] || 25);
  const n = Math.ceil(info.total * fps);
  const outFile = path.join(build, 'video_silent.mp4');
  const ff = spawn(FFMPEG, ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-vf', 'scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await frame(i / fps, 'jpeg', 95);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('wrote', outFile, n, 'frames');
}
await browser.close();
