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
  await L.drop(p, '/layout/', L.A + 'poster_akltk.png', 'image/png'); await p.waitForTimeout(5000);
  await L.click(S, 1226, 111, 300); await p.waitForTimeout(800);
  const f = async (x, y, v) => { await L.click(S, x, y, 250); await p.mouse.click(x, y, { clickCount: 3 }); await p.keyboard.type(v); await p.keyboard.press('Tab'); await p.waitForTimeout(700); };
  await f(1364, 219, '45p0'); await f(1364, 244, '56p3'); await f(1283, 219, '3p0'); await f(1283, 244, '3p0');
  await p.screenshot({ path: 'raw/x/o4.png' });
  await L.click(S, 235, 58, 400); await p.waitForTimeout(700); await L.click(S, 235, 714, 400); await p.waitForTimeout(700);
  await L.click(S, 530, 714, 400); await p.waitForTimeout(1500);
  await p.screenshot({ path: 'raw/x/o6.png' });
  await L.click(S, 1293, 111, 300); await p.waitForTimeout(800);
  for (let i = 0; i < 3; i++) { await L.click(S, 1394, 866, 300); await p.waitForTimeout(1000); }
  await p.mouse.dblclick(1300, 297); await p.waitForTimeout(1800);               // go to spread 2-3
  await p.keyboard.press('Control+0'); await p.waitForTimeout(1500);              // fit spread in window
  await p.keyboard.press('Control+Shift+a'); await p.waitForTimeout(600);
  await L.drop(p, '/layout/', L.A + 'photos/food_01.jpg', 'image/jpeg'); await p.waitForTimeout(5000);
  await p.waitForTimeout(5000);
  await p.keyboard.press('Control+x'); await p.waitForTimeout(1200);
  await L.click(S, 1293, 111, 300); await p.waitForTimeout(800);
  await p.mouse.dblclick(1300, 297); await p.waitForTimeout(1800);
  await p.keyboard.press('Control+0'); await p.waitForTimeout(1200);
  await p.keyboard.press('Control+v'); await p.waitForTimeout(2500);
  await p.screenshot({ path: 'raw/x/o7.png' });
  await L.click(S, 326, 58, 300); await p.waitForTimeout(900);
  await p.screenshot({ path: 'raw/x/o8.png' });
  await S.browser.close();
})();
