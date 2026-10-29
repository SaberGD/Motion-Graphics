const L = require('./lib.js');
(async () => {
  const b = await require('playwright').chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://one.horix.live/#pixel', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(24000);
  await L.drop(p, '/pixel/', L.A + 'backgrounds/bg_orange_warm.jpg', 'image/jpeg'); await p.waitForTimeout(5000);
  await L.drop(p, '/pixel/', L.A + 'logo_akltk.svg', 'image/svg+xml'); await p.waitForTimeout(5000);
  await p.screenshot({ path: 'raw/x/t3.png' });
  await p.mouse.click(57, 56); await p.waitForTimeout(700); await p.mouse.move(100, 427); await p.waitForTimeout(900);
  await p.screenshot({ path: 'raw/x/t4.png' });
  await b.close();
})();
