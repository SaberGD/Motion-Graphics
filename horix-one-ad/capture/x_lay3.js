const L = require('./lib.js');
(async () => {
  const b = await require('playwright').chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://one.horix.live/#layout', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(30000);
  await p.mouse.click(116, 130); await p.waitForTimeout(4000);
  await p.mouse.click(973, 376, { clickCount: 3 }); await p.keyboard.type('8'); await p.keyboard.press('Tab'); await p.waitForTimeout(500);
  await p.mouse.click(1175, 775); await p.waitForTimeout(6000);
  await p.mouse.click(20, 254); await p.waitForTimeout(400);                         // Type tool
  await p.mouse.move(380, 220); await p.mouse.down(); await p.mouse.move(800, 330, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(600);
  await p.keyboard.insertText('منيو أكلتك'); await p.waitForTimeout(1200);
  await p.screenshot({ path: 'raw/x/m1.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  await p.screenshot({ path: 'raw/x/m2.png' });
  await b.close();
})();
