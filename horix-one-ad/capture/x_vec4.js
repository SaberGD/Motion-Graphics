const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://one.horix.live/#vector', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(14000);
  await p.mouse.click(116, 119); await p.waitForTimeout(1000);
  await p.mouse.click(766, 159); await p.waitForTimeout(800);
  await p.mouse.click(310, 295); await p.mouse.click(1170, 736); await p.waitForTimeout(4000);
  await p.mouse.click(30, 606); await p.waitForTimeout(300);                 // Type tool
  await p.mouse.click(330, 420); await p.waitForTimeout(500);
  await p.keyboard.insertText('أكلتك'); await p.waitForTimeout(800);
  await p.screenshot({ path: 'raw/x/v7.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  await p.screenshot({ path: 'raw/x/v8.png' });
  await b.close();
})();
