const L = require('./lib.js');
(async () => {
  const S = await L.open('pixel_ai');
  const ctx = await L.startRec(S); const p = await ctx.newPage(); S.page = p; S.t0 = Date.now();
  await p.goto('https://one.horix.live/#pixel', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(24000);
  await L.cur(S, 900, 600);
  await L.drop(p, '/pixel/', L.A + 'photos/burger_busy_bg.jpg', 'image/jpeg');
  await p.waitForTimeout(6000); L.mark(S, 'ready');
  await L.click(S, 262, 56, 700); await p.waitForTimeout(500);
  await L.click(S, 292, 370, 500); L.mark(S, 'subject_clicked');
  for (let i = 0; i < 8; i++) { await p.waitForTimeout(6000); await p.screenshot({ path: S.dir + '/t' + i + '.png' }); }
  L.mark(S, 'end');
  await L.finish(S, ctx);
})();
