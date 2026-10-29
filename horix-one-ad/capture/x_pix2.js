const L = require('./lib.js');
(async () => {
  const b = await require('playwright').chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://one.horix.live/#pixel', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(24000);
  await L.drop(p, '/pixel/', L.A + 'photos/burger_clean.png', 'image/png'); await p.waitForTimeout(6000);
  await p.mouse.click(262, 56); await p.waitForTimeout(500); await p.mouse.click(292, 370);   // Select > Subject
  await p.waitForTimeout(22000);
  
  await p.screenshot({ path: 'raw/x/q1.png' });
  await b.close();
})();
