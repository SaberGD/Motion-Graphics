const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://one.horix.live/#layout', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(30000);
  await p.screenshot({ path: 'raw/x/l1.png' });
  await p.mouse.click(116, 119); await p.waitForTimeout(2500);
  await p.screenshot({ path: 'raw/x/l2.png' });
  await b.close();
})();
