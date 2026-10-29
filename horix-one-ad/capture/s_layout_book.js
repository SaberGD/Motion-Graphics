// Scene B: booklet in Layout. Cover from the Pixel poster, spread with two dishes and Arabic text frames.
const L = require('./lib.js');
(async () => {
  const S = await L.open('layout_book');
  const ctx = await L.startRec(S); const p = await ctx.newPage(); S.page = p; S.t0 = Date.now();
  const shot = n => p.screenshot({ path: S.dir + '/' + n + '.png' });
  const F = async (x, y, v) => { await L.click(S, x, y, 250); await p.mouse.click(x, y, { clickCount: 3 }); await p.keyboard.type(v); await p.keyboard.press('Tab'); await p.waitForTimeout(700); };
  const FIT = async () => { await L.click(S, 235, 58, 350); await p.waitForTimeout(600); await L.click(S, 235, 714, 300); await p.waitForTimeout(600); await L.click(S, 530, 714, 300); await p.waitForTimeout(1200); };
  const PROPS = () => L.click(S, 1226, 111, 250), PAGES = () => L.click(S, 1293, 111, 250);
  await p.goto('https://one.horix.live/#layout', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(30000); L.mark(S, 'loaded');
  await L.cur(S, 700, 500);
  await L.click(S, 116, 130, 600); await p.waitForTimeout(6000);
  await L.click(S, 1175, 775, 500); await p.waitForTimeout(5000); L.mark(S, 'doc');
  // cover
  await L.drop(p, '/layout/', L.A + 'poster_akltk.png', 'image/png'); await p.waitForTimeout(5000);
  await PROPS(); await F(1364, 219, '45p0'); await F(1364, 244, '56p3'); await FIT(); L.mark(S, 'cover'); await shot('e1');
  // pages
  await PAGES(); await p.waitForTimeout(500);
  for (let i = 0; i < 2; i++) { await L.click(S, 1394, 866, 300); await p.waitForTimeout(1000); }
  L.mark(S, 'pages_added');
  // spread 2-3: draw an image frame on the page, then drop the photo into it
  await p.mouse.dblclick(1300, 297); await p.waitForTimeout(1800);
  await p.keyboard.press('Alt+Control+0'); await p.waitForTimeout(1500);
  await PROPS(); await p.waitForTimeout(600);
  async function dish(file, x0, tag) {
    await L.click(S, 20, 353, 350);                                              // rectangle frame tool
    await L.move(S, x0, 209, 400); await p.mouse.down(); await L.move(S, x0 + 443, 575, 600); await p.mouse.up(); await p.waitForTimeout(700);
    await L.drop(p, '/layout/', L.A + file, 'image/jpeg'); await p.waitForTimeout(5000); await shot(tag); L.mark(S, tag);
  }
  async function words(x0, head, body, tag) {
    for (const [txt, size, y1, y2] of [[head, '34', 595, 650], [body, '18', 660, 780]]) {
      await L.click(S, 20, 254, 350);                                            // type tool
      await L.move(S, x0, y1, 350); await p.mouse.down(); await L.move(S, x0 + 443, y2, 450); await p.mouse.up(); await p.waitForTimeout(600);
      await p.keyboard.insertText(txt); await p.waitForTimeout(500);
      await p.keyboard.press('Control+a'); await p.waitForTimeout(500);
      await L.click(S, 1300, 495, 300); await p.keyboard.press('Control+A'); await p.keyboard.type('Noto Sans Arabic'); await p.waitForTimeout(500); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
      await L.click(S, 1260, 549, 250); await p.keyboard.press('Control+A'); await p.keyboard.type(size); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
      await L.click(S, 1259, 692, 300); await p.waitForTimeout(600);               // align right
      await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    }
    await shot(tag); L.mark(S, tag);
  }
  await dish('photos/food_01.jpg', 125, 'e2');
  await words(125, 'بيتزا مارجريتا', 'عجينة طازجة وجبنة موتزاريلا وصوص طماطم وتوصيلها لحد باب بيتك', 'e3');
  await dish('photos/food_02.jpg', 627, 'e4');
  await words(627, 'شاورما دجاج', 'دجاج متبّل مشوي مع ثوم وصوص خاص وبطاطس مقرمشة', 'e5');
  await L.click(S, 20, 123, 350); await p.mouse.click(1000, 860); await p.waitForTimeout(1200);   // selection tool, click empty
  await shot('e6'); L.mark(S, 'end');
  await L.finish(S, ctx);
})();
