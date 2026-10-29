const L = require('./lib.js');
(async () => {
  const b = await require('playwright').chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://one.horix.live/#layout', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(30000);
  await p.mouse.click(116, 130); await p.waitForTimeout(4000);
  await p.mouse.click(973, 376, { clickCount: 3 }); await p.keyboard.type('4'); await p.keyboard.press('Tab'); await p.waitForTimeout(500);
  await p.mouse.click(1175, 775); await p.waitForTimeout(6000);
  await L.drop(p, '/layout/', L.A + 'poster_akltk.png', 'image/png'); await p.waitForTimeout(6000);
  await p.screenshot({ path: 'raw/x/n1.png' });
  await p.mouse.click(1293, 111); await p.waitForTimeout(1500);                       // Pages panel
  await p.screenshot({ path: 'raw/x/n2.png' });
  await b.close();
})();
