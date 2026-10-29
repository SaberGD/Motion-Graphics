// Scene V1: draw the أكلتك logo in Vector (disc + chord dot + Arabic wordmark), then export the SVG.
const L = require('./lib.js'); const fs = require('fs');
(async () => {
  const S = await L.open('vector_logo');
  const ctx = await L.startRec(S); const p = await ctx.newPage(); S.page = p; S.t0 = Date.now();
  const shot = n => p.screenshot({ path: S.dir + '/' + n + '.png' });
  await p.goto('https://one.horix.live/#vector', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(16000); L.mark(S, 'loaded');
  await L.cur(S, 700, 500);
  await L.click(S, 116, 119, 700); await p.waitForTimeout(1500);       // New file
  await L.click(S, 766, 159, 500); await p.waitForTimeout(700);        // Social
  await L.click(S, 310, 295, 400); await p.waitForTimeout(500);        // Square 1080
  await L.click(S, 1170, 736, 500); await p.waitForTimeout(3500); L.mark(S, 'doc');
  // disc
  await L.click(S, 30, 229, 500);
  await L.drag(S, 335, 240, 805, 710, 900); await p.waitForTimeout(600); L.mark(S, 'disc');
  await L.click(S, 1122, 97, 500); await p.waitForTimeout(900);                      // Color panel
  await L.click(S, 1040, 388, 500); await p.keyboard.press('Control+A'); await p.keyboard.type('F26B21', { delay: 90 }); await p.keyboard.press('Enter'); await p.waitForTimeout(800); L.mark(S, 'orange');
  await shot('a1');
  // chords: open list, show types, pick Triadic
  await L.click(S, 935, 528, 500); await p.waitForTimeout(700);
  await L.click(S, 882, 676, 500); await p.waitForTimeout(900); L.mark(S, 'triadic');
  await shot('a2');
  // switch to Analogous, new accent dot, colour it from the chord
  await L.click(S, 935, 528, 500); await p.waitForTimeout(600); await L.click(S, 893, 618, 450); await p.waitForTimeout(900); L.mark(S, 'analogous');
  await L.click(S, 30, 229, 400);
  await L.drag(S, 668, 262, 768, 362, 600); await p.waitForTimeout(500);
  await shot('a3');
  await L.click(S, 1047, 563, 600); await p.waitForTimeout(800); L.mark(S, 'chord_applied');
  await L.click(S, 1034, 599, 500); await p.waitForTimeout(800); L.mark(S, 'swatches');
  await shot('a4');
  // wordmark
  await L.click(S, 1117, 97, 400); await p.waitForTimeout(700);                      // close the colour popup
  await L.click(S, 30, 606, 500);
  await L.click(S, 420, 480, 500); await p.waitForTimeout(400);
  await p.keyboard.insertText('أكلتك'); await p.waitForTimeout(500); await p.keyboard.press('Escape'); await p.waitForTimeout(700); L.mark(S, 'typed');
  await L.click(S, 1278, 339, 500); await p.waitForTimeout(600); await p.keyboard.type('Noto Sans Arabic', { delay: 40 }); await p.waitForTimeout(900);
  await L.click(S, 1215, 510, 400); await p.waitForTimeout(1000);
  await L.move(S, 1225, 430, 300); await p.mouse.click(1225, 430, { clickCount: 3 }); await p.keyboard.type('190'); await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
  await shot('b1');
  await L.click(S, 1280, 398, 400); await p.waitForTimeout(600);
  await L.move(S, 1340, 431, 300); await p.mouse.click(1340, 431, { clickCount: 3 }); await p.keyboard.type('800'); await p.keyboard.press('Enter'); await p.waitForTimeout(1000); L.mark(S, 'styled');
  await L.click(S, 150, 617, 500); await p.waitForTimeout(1200); L.mark(S, 'outlined');       // Create Outlines
  await L.click(S, 1117, 97, 400); await p.waitForTimeout(900);
  await L.click(S, 1035, 388, 400); await p.keyboard.press('Control+A'); await p.keyboard.type('FFFFFF', { delay: 70 }); await p.keyboard.press('Enter'); await p.waitForTimeout(900); L.mark(S, 'white');
  const v = p.frames().find(f => f.url().includes('/vector/'));
  await v.evaluate(() => window.vectorcraft.execute('object.align', { horizontal: 'center', to: 'artboard', vertical: 'center' })); await p.waitForTimeout(900);
  await L.click(S, 1117, 97, 300); await p.waitForTimeout(500);
  await L.click(S, 1000, 780, 400); await p.waitForTimeout(500);                            // click empty area: deselect
  await shot('b3'); L.mark(S, 'logo_done');
  const out = await v.evaluate(async () => await window.vectorcraft.execute('document.export', { format: 'svg', outlineText: true }));
  const svg = out && out.dataBase64 ? Buffer.from(out.dataBase64, 'base64').toString('utf8') : (out && out.text) || '';
  fs.writeFileSync(L.A + 'logo_akltk.svg', svg); console.log('svg bytes', svg.length);
  // hand-off to Pixel, on camera
  await p.waitForTimeout(800);
  await L.click(S, 1237, 19, 800); L.mark(S, 'handoff_click');
  await p.waitForTimeout(45000); await shot('b4'); L.mark(S, 'pixel_opened');
  await L.finish(S, ctx);
})();
