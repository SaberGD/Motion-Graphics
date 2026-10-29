const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://one.horix.live/#vector', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(14000);
  await p.mouse.click(116, 119); await p.waitForTimeout(1000);
  await p.mouse.click(766, 159); await p.waitForTimeout(800);
  await p.mouse.click(310, 295); await p.mouse.click(1170, 736); await p.waitForTimeout(4000);
  await p.mouse.click(30, 229); await p.waitForTimeout(300);              // ellipse tool
  await p.mouse.move(420, 300); await p.mouse.down(); await p.mouse.move(560, 440, { steps: 12 }); await p.mouse.up();
  await p.waitForTimeout(1000);
  await p.mouse.click(1122, 97); await p.waitForTimeout(1500);           // color panel
  await p.screenshot({ path: 'raw/x/v4.png' });
  await b.close();
})();
