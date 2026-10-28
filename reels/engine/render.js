// Composite base-plate frames + graphics in Chromium and write JPEG frames.
// usage: node render.js <spec.json> <words.json> <baseFramesDir> <outDir> [workers] [t0] [t1] [step]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const [specP, wordsP, baseDir, out] = process.argv.slice(2, 6).map(p => path.resolve(p));
const W = +(process.argv[6] || 3), T0 = process.argv[7], T1 = process.argv[8], STEP = +(process.argv[9] || 1);
const FPS = 30;
const spec = JSON.parse(fs.readFileSync(specP, 'utf8'));
const words = JSON.parse(fs.readFileSync(wordsP, 'utf8'));
fs.mkdirSync(out, { recursive: true });
const baseFrames = fs.readdirSync(baseDir).filter(f => f.endsWith('.jpg')).sort();
const N = Math.round(spec._dur * FPS);
const f0 = T0 != null ? Math.round(+T0 * FPS) : 0, f1 = T1 != null ? Math.round(+T1 * FPS) : N;
const frames = process.env.TIMES ? process.env.TIMES.split(',').map(x => Math.round(+x * FPS)) : Array.from({ length: Math.ceil((f1 - f0) / STEP) }, (_, i) => f0 + i * STEP);
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const work = async (wi) => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on('console', m => console.log(`[w${wi}]`, m.text()));
    page.on('pageerror', e => console.log(`[w${wi}] ERR`, e.message));
    await page.goto('file://' + path.join(__dirname, 'stage.html'));
    await page.evaluate(() => document.fonts.ready);
    const chunks = await page.evaluate(([s, w]) => window.init(s, w), [spec, words]);
    if (wi === 0) fs.writeFileSync(path.join(out, '_chunks.txt'), chunks.join('\n'));
    await page.evaluate(() => document.fonts.ready);
    for (let k = wi; k < frames.length; k += W) {
      const f = frames[k];
      const bf = baseFrames[Math.min(f, baseFrames.length - 1)];
      await page.evaluate(src => window.setBg(src), 'file://' + path.join(baseDir, bf));
      await page.evaluate(t => window.render(t), f / FPS);
      await page.screenshot({ path: path.join(out, `f_${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 93 });
      if (k % 150 < W) console.log('frame', f, '/', N);
    }
    await page.close();
  };
  await Promise.all(Array.from({ length: W }, (_, i) => work(i)));
  await browser.close();
})();
