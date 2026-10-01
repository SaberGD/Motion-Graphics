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
  // VARIANT=2: alternate-hook edit (first two blocks swapped); render old-timeline graphics at remapped times
  const V2 = process.env.VARIANT === '2';
  const oldFrame = n => !V2 ? n : n < 290 ? n + 137 : n < 427 ? n - 290 : n;
  if (V2) await page.evaluate(() => window.setVariant([[5.90, 9.667], [14.233, 16.10], [22.95, 25.067], [35.00, 37.75]]));
  const f0 = Math.round(t0 * fps), f1 = Math.round(t1 * fps);
  const list = process.env.TIMES ? process.env.TIMES.split(',').map(x => Math.round(+x * fps)) : null;
  const frames = list || Array.from({ length: Math.ceil((f1 - f0) / step) }, (_, i) => f0 + i * step);
  for (const f of frames) {
    await page.evaluate(([t, tn]) => window.render(t, tn), [oldFrame(f) / fps, f / fps]);
    await page.screenshot({ path: path.join(out, `ov_${String(f).padStart(5, '0')}.png`), omitBackground: true });
    if (f % 150 === 0) console.log('frame', f);
  }
  await browser.close();
})();
