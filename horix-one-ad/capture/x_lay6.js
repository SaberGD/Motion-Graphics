const L = require('./lib.js');
(async () => {
  const S = await L.open('x'); const ctx = await S.browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(require('fs').readFileSync('lib.js', 'utf8').match(/const CURSOR = `([\s\S]*?)`;/)[1]);
  const p = await ctx.newPage(); S.page = p;
  await p.goto('https://one.horix.live/#layout', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(30000);
  await L.cur(S, 700, 500);
  await L.click(S, 116, 130, 500); await p.waitForTimeout(6000);
  await L.click(S, 1175, 775, 500); await p.waitForTimeout(5000);
  await L.click(S, 1293, 111, 300); await p.waitForTimeout(600);
  for (let i = 0; i < 2; i++) { await L.click(S, 1394, 866, 300); await p.waitForTimeout(1000); }
  await p.mouse.dblclick(1300, 297); await p.waitForTimeout(1800);
  await p.keyboard.press('Alt+Control+0'); await p.waitForTimeout(1500);
  await L.click(S, 20, 353, 400);                                   // rectangle frame tool
  await L.move(S, 135, 230, 400); await p.mouse.down(); await L.move(S, 578, 520, 600); await p.mouse.up(); await p.waitForTimeout(800);
  await p.screenshot({ path: 'raw/x/r1.png' });
  await L.drop(p, '/layout/', L.A + 'photos/food_01.jpg', 'image/jpeg'); await p.waitForTimeout(5000);
  await p.screenshot({ path: 'raw/x/r2.png' });
  await S.browser.close();
})();
