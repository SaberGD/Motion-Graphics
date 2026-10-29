const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://one.horix.live/#vector', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(14000);
  await p.mouse.click(116, 119); await p.waitForTimeout(1000);
  await p.mouse.click(766, 159); await p.waitForTimeout(800);
  await p.mouse.click(310, 295); await p.mouse.click(1170, 736); await p.waitForTimeout(4000);
  await p.mouse.click(30, 606); await p.mouse.click(330, 420); await p.waitForTimeout(400);
  await p.keyboard.insertText('أكلتك'); await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  await p.mouse.click(1278, 339); await p.waitForTimeout(1200);
  await p.keyboard.type('Noto Sans Arabic'); await p.waitForTimeout(1200);
  await p.mouse.click(1215, 510); await p.waitForTimeout(1200);
  await p.mouse.click(1225, 401, {clickCount:3}); await p.keyboard.type('170'); await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  await p.screenshot({ path: 'raw/x/v10.png' });
  await p.mouse.click(1278, 370); await p.waitForTimeout(900); await p.screenshot({ path: 'raw/x/v11.png' });
  await b.close();
})();
