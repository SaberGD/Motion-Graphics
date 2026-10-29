// Builds Arabic headline art in Vector (outlined), exports it as SVG for use in Pixel / Layout.
// usage: node s_vector_text.js out.svg "line1|size1" "line2|size2" ...  (white, centred, stacked)
const L = require('./lib.js'); const fs = require('fs');
const [out, ...lines] = process.argv.slice(2);
(async () => {
  const b = await require('playwright').chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://one.horix.live/#vector', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(16000);
  await p.mouse.click(116, 119); await p.waitForTimeout(2000);
  await p.mouse.click(766, 159); await p.waitForTimeout(800);
  await p.mouse.click(626, 295); await p.waitForTimeout(500);           // landscape 1200x630
  await p.mouse.click(1170, 736); await p.waitForTimeout(3500);
  const v = p.frames().find(f => f.url().includes('/vector/'));
  let first = true, y = 0;
  for (const spec of lines) {
    const [txt, size, weight = '800'] = spec.split('|');
    await p.mouse.click(30, 606); await p.waitForTimeout(300);
    await p.mouse.click(380, 380); await p.waitForTimeout(400);
    await p.keyboard.insertText(txt); await p.waitForTimeout(400); await p.keyboard.press('Escape'); await p.waitForTimeout(600);
    await p.mouse.click(1278, 339); await p.waitForTimeout(500); await p.keyboard.type('Noto Sans Arabic'); await p.waitForTimeout(900);
    await p.mouse.click(1215, 510); await p.waitForTimeout(900);
    await p.mouse.click(1225, 430, { clickCount: 3 }); await p.keyboard.type(size); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
    await p.mouse.click(1280, 398); await p.waitForTimeout(500);
    await p.mouse.click(1340, 431, { clickCount: 3 }); await p.keyboard.type(weight); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
    await v.evaluate(() => window.vectorcraft.execute('type.createOutlines', {})); await p.waitForTimeout(900);
    await p.mouse.click(1117, 97); await p.waitForTimeout(800);
    await p.mouse.click(1035, 388); await p.keyboard.press('Control+A'); await p.keyboard.type('FFFFFF'); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
    await p.mouse.click(1117, 97); await p.waitForTimeout(500);
    await v.evaluate(() => window.vectorcraft.execute('object.align', { horizontal: 'center', to: 'artboard', vertical: 'center' })); await p.waitForTimeout(700);
    await p.screenshot({ path: 'raw/x/h_' + (y++) + '.png' });
    await p.mouse.click(1000, 790); await p.waitForTimeout(400);       // deselect
  }
  const res = await v.evaluate(async () => await window.vectorcraft.execute('document.export', { format: 'svg', outlineText: true }));
  const svg = res && res.dataBase64 ? Buffer.from(res.dataBase64, 'base64').toString('utf8') : (res && res.text) || '';
  fs.writeFileSync(out, svg); console.log('svg', svg.length);
  await p.screenshot({ path: 'raw/x/h_end.png' });
  await b.close();
})();
