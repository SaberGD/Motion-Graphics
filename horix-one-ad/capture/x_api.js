const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://one.horix.live/#vector', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(14000);
  const v = p.frames().find(f => f.url().includes('/vector/'));
  console.log(await v.evaluate(() => { const o = window.vectorcraft; return o ? Object.keys(o).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(o)||{})).join(',') : 'none'; }));
  console.log(await p.evaluate(() => typeof window.horixOneCapture + ' ' + Object.keys(window).filter(k=>/horix/i.test(k)).join(',')));
  await b.close();
})();
