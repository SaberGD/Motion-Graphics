// Render the reel covers: node reels/saber7/thumbnail/render_thumb.js  -> thumbnail/thumbnail_a.png, thumbnail_b.png
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const v of ['a', 'b']) {
    await p.goto('file://' + path.join(__dirname, 'thumb.html') + '?v=' + v);
    await p.evaluate(() => Promise.all(['900 100px Cairo', '600 100px Poppins'].map(f => document.fonts.load(f, 'اختبار Visual'))));
    await p.waitForFunction(() => document.getElementById('bg').complete);
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(__dirname, `thumbnail_${v}.png`) });
  }
  await b.close();
})();
