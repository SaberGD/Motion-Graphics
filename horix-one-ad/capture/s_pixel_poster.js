// Scene P: poster built in Pixel. AI-select the burger, paste it on the orange background, add the Vector headline + logo, export PNG.
const L = require('./lib.js'); const fs = require('fs');
(async () => {
  const S = await L.open('pixel_poster');
  const ctx = await L.startRec(S); const p = await ctx.newPage(); S.page = p; S.t0 = Date.now();
  const shot = n => p.screenshot({ path: S.dir + '/' + n + '.png' });
  await p.goto('https://one.horix.live/#pixel', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(26000); L.mark(S, 'loaded');
  await L.cur(S, 800, 560);
  await L.drop(p, '/pixel/', L.A + 'photos/burger_busy_bg.jpg', 'image/jpeg'); await p.waitForTimeout(5500); L.mark(S, 'burger_open');
  await L.click(S, 262, 56, 700); await p.waitForTimeout(500);
  await L.click(S, 292, 370, 500); L.mark(S, 'subject_click');
  await p.waitForTimeout(26000); L.mark(S, 'subject_done'); await shot('c1');
  await p.keyboard.press('Control+c'); await p.waitForTimeout(1200); L.mark(S, 'copied');
  await L.drop(p, '/pixel/', L.A + 'backgrounds/bg_orange_warm.jpg', 'image/jpeg'); await p.waitForTimeout(3500); L.mark(S, 'bg_dropped');
  await p.keyboard.press('Control+v'); await p.waitForTimeout(3500); L.mark(S, 'pasted'); await shot('c2');
  // headline, sub-headline, logo as smart objects; size/position through the Properties fields
  async function place(file, W, X, Y, tag) {
    await L.drop(p, '/pixel/', L.A + file, 'image/svg+xml'); await p.waitForTimeout(3500);
    await p.mouse.click(1225, 347, { clickCount: 3 }); await p.keyboard.type(String(W)); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
    await p.mouse.click(1225, 375, { clickCount: 3 }); await p.keyboard.type(String(X)); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
    await p.mouse.click(1370, 375, { clickCount: 3 }); await p.keyboard.type(String(Y)); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
    await shot(tag); L.mark(S, tag);
  }
  await place('headline_poster.svg', 1560, 520, 112, 'd1');
  await place('headline_sub.svg', 1300, 550, 2650, 'd2');
  await place('logo_akltk.svg', 270, 90, 100, 'd3');
  // export via File > Export > Quick Export as PNG (the page's hook captures the file)
  await p.frames().find(f => f.url().includes('/pixel/')).evaluate(() => { window.horixOneCapture = (name, data) => { window.__cap = { name, b64: btoa(String.fromCharCode.apply(null, new Uint8Array(data).subarray(0, 0))), n: data.byteLength, data: data }; }; });
  await L.click(S, 57, 56, 600); await p.waitForTimeout(600);
  await L.click(S, 93, 427, 400); await p.waitForTimeout(600);
  await L.click(S, 372, 427, 400); L.mark(S, 'export');
  await p.waitForTimeout(12000);
  const px = p.frames().find(f => f.url().includes('/pixel/'));
  const got = await px.evaluate(() => { if (!window.__cap) return null; const u = new Uint8Array(window.__cap.data); let s = ''; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return { name: window.__cap.name, b64: btoa(s) }; });
  if (got) { fs.writeFileSync(L.A + 'poster_akltk.png', Buffer.from(got.b64, 'base64')); console.log('poster saved', got.name); } else console.log('NO CAPTURE');
  await shot('c9'); L.mark(S, 'end');
  await L.finish(S, ctx);
})();
