// Render an SG MOTION composition to JPEG frames.
// usage: node render.js <comp.html> <outDir> <fps> <duration_s> [workers] [t0] [t1]
//        TIMES=1.0,5.2 node render.js ...   -> only those times (style frames / screenshots)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const [comp, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
const FPS = +process.argv[4], DUR = +process.argv[5], W = +(process.argv[6] || 4);
const f0 = process.argv[7] != null ? Math.round(+process.argv[7] * FPS) : 0, f1 = process.argv[8] != null ? Math.round(+process.argv[8] * FPS) : Math.round(DUR * FPS);
fs.mkdirSync(out, { recursive: true });
const frames = process.env.TIMES ? process.env.TIMES.split(',').map(x => Math.round(+x * FPS)) : Array.from({ length: f1 - f0 }, (_, i) => f0 + i);
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  await Promise.all(Array.from({ length: W }, async (_, wi) => {
    const [VW, VH] = (process.env.VIEWPORT || '1080x1920').split('x').map(Number);   // e.g. VIEWPORT=1920x1080
    const page = await browser.newPage({ viewport: { width: VW, height: VH } });
    page.on('pageerror', e => console.log(`[w${wi}] ERR`, e.message));
    await page.goto('file://' + comp + (process.env.QUERY ? '?' + process.env.QUERY : ''));   // e.g. QUERY=v=mix
    await page.evaluate(() => window.ready);
    for (let k = wi; k < frames.length; k += W) {
      const f = frames[k];
      await page.evaluate(t => window.render(t), f / FPS);
      await page.screenshot({ path: path.join(out, `f_${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 96 });
      if (k % 250 < W) console.log('frame', f);
    }
    await page.close();
  }));
  await browser.close();
})();
