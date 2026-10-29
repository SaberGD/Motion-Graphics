const L = require('./lib.js');
(async () => {
  const S = await L.open('x'); const ctx = await S.browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(`(${require('fs').readFileSync('lib.js','utf8').match(/const CURSOR = `([\s\S]*?)`;/)[1] ? 'function(){}' : ''})`);
  const p = await ctx.newPage(); S.page = p;
  await p.goto('https://one.horix.live/#vector', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(14000);
  await p.mouse.click(116, 119); await p.waitForTimeout(1200);
  await p.mouse.click(766, 159); await p.waitForTimeout(1200);   // Social tab
  await p.screenshot({ path: 'raw/x/v1.png' });
  await p.mouse.click(310, 295); await p.waitForTimeout(500);
  await p.screenshot({ path: 'raw/x/v2.png' });
  await p.mouse.click(1170, 736); await p.waitForTimeout(5000);
  await p.screenshot({ path: 'raw/x/v3.png' });
  await S.browser.close();
})();
