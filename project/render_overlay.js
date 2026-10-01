// Renders overlay.html to a transparent PNG sequence.
// usage: node render_overlay.js <outDir> [fps] [t0] [t1] [step]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const out = process.argv[2], fps = +(process.argv[3] || 30);
  const t0 = +(process.argv[4] || 0), t1 = +(process.argv[5] || 45.4667), step = +(process.argv[6] || 1);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', m => console.log('page:', m.text()));
  await page.goto('file://' + path.join(__dirname, 'overlay.html'));
  await page.evaluate(() => document.fonts.ready);
  const words = JSON.parse(fs.readFileSync(path.join(__dirname, 'words.json'), 'utf8'));
  console.log('chunks', await page.evaluate(w => window.init(w), words));
  const f0 = Math.round(t0 * fps), f1 = Math.round(t1 * fps);
  const list = process.env.TIMES ? process.env.TIMES.split(',').map(x => Math.round(+x * fps)) : null;
  const frames = list || Array.from({ length: Math.ceil((f1 - f0) / step) }, (_, i) => f0 + i * step);
  for (const f of frames) {
    await page.evaluate(t => window.render(t), f / fps);
    await page.screenshot({ path: path.join(out, `ov_${String(f).padStart(5, '0')}.png`), omitBackground: true });
    if (f % 150 === 0) console.log('frame', f);
  }
  await browser.close();
})();
