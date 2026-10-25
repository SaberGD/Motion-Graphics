// HORIX One promo, 9:16: "work on your design and move it between Vector and Pixel as you like".
// A designer builds the «بُنّ» coffee brand: logo in Vector, onto a product photo in Pixel, back to Vector for the poster.
// Times are in music seconds on the 88 BPM grid; B(n) = start of bar n (engine.js), so the El Behery music cut fits as is.
const DURATION = 58.2;
const BT = BEAT;
const hT = B(8) + BT * 2; // click «افتح التصميم في Pixel»
const sT = B(12) + BT * 3; // AI select click
const cT = B(16) + 0.05; // click «افتح الصورة في Vector»

const world = $("#cam"), bg = $("#bg"), fx = $("#fx");
function center(e) { e.style.marginLeft = -e.offsetWidth / 2 + "px"; e.style.marginTop = -e.offsetHeight / 2 + "px"; }
const bob = (t, a = 8, f = 1.3, ph = 0) => Math.sin(t * f + ph) * a;
const beatPulse = (t) => Math.pow(1 - (((t - OFF) % BT + BT) % BT) / BT, 6);
const popIn = (t, a, d = 0.6) => prog(t, a, a + d, E.spring);
const flyOut = (t, a, d = 0.35) => prog(t, a, a + d, E.expoIn);
const rnd = (i, k = 1) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const win01 = (t, a, b, f = 0.15) => Math.min(prog(t, a - f, a), 1 - prog(t, b, b + f)); // fade in at a, out at b

// ---------- logo geometry in artboard coordinates (logo.js is relative to the bean centre) ----------
const RC = Math.cos((LOGO.bean.rot * Math.PI) / 180), RS = Math.sin((LOGO.bean.rot * Math.PI) / 180);
const R = ([x, y]) => [LOGO.bean.cx + x * RC - y * RS, LOGO.bean.cy + x * RS + y * RC];
const NODES = LOGO.nodes.map((n) => ({ p: R(n.p), hin: R([n.p[0] - n.h[0], n.p[1] - n.h[1]]), hout: R([n.p[0] + n.h[0], n.p[1] + n.h[1]]) }));
const segD = (i) => { const [a, c1, c2, b] = beanSeg(i).map(R); return `M ${a} C ${c1} ${c2} ${b}`; };
const fullD = "M " + R(LOGO.nodes[0].p) + [0, 1, 2, 3].map((i) => { const [, c1, c2, b] = beanSeg(i).map(R); return ` C ${c1} ${c2} ${b}`; }).join("") + " Z";
const creaseD = (() => { const n = LOGO.crease.match(/-?\d+(\.\d+)?/g).map(Number); const P = []; for (let i = 0; i < n.length; i += 2) P.push(R([n[i], n[i + 1]])); return { d: `M ${P[0]} C ${P[1]} ${P[2]} ${P[3]}`, a: P[0], b: P[3] }; })();
const LOGO_SVG = (o = {}) => `
  <path class="fill" d="${fullD}" fill="${LOGO.colors.bean}"/>
  <path class="crease" d="${creaseD.d}" fill="none" stroke="${LOGO.colors.ink}" stroke-width="13" stroke-linecap="round" pathLength="1"/>
  <text class="word" x="280" y="438" text-anchor="middle" font-family="Cairo" font-weight="900" font-size="150" fill="${LOGO.colors.ink}" direction="rtl">${o.word ?? LOGO.word.text}</text>
  ${o.tag === false ? "" : `<text class="tag" x="280" y="508" text-anchor="middle" font-family="Cairo" font-weight="700" font-size="34" fill="${LOGO.colors.tag}" direction="rtl">${LOGO.tag.text}</text>`}`;
function logoCanvas(px, o = {}) { const c = document.createElement("canvas"); c.width = c.height = px; c._o = o; return c; }
function drawLogoCanvas(c) {
  const x = c.getContext("2d");
  x.clearRect(0, 0, c.width, c.height);
  if (c._o.bg) { x.fillStyle = c._o.bg; x.fillRect(0, 0, c.width, c.height); }
  drawLogo(x, c.width / 560, c._o);
}
const canvases = [];
const LC = (px, o) => { const c = logoCanvas(px, o); canvases.push(c); return c; };

// ---------- background ----------
el("div", "dots", bg);
const blobA = el("div", "blob", bg), blobB = el("div", "blob", bg);
css(blobA, { width: "900px", height: "900px", background: "rgba(234,153,63,.13)" });
css(blobB, { width: "800px", height: "800px", background: "rgba(214,60,50,.10)" });
const bgCurve = el("div", "bgcurve", bg, `<svg viewBox="0 0 1800 1800" width="1800" height="1800"><path d="M 200 1300 C 500 300, 1300 1500, 1600 500" fill="none" stroke="rgba(243,239,232,.08)" stroke-width="3"/><path d="M 200 1300 L 500 300 M 1600 500 L 1300 1500" stroke="rgba(234,153,63,.14)" stroke-width="2"/><rect x="186" y="1286" width="28" height="28" fill="none" stroke="rgba(243,239,232,.16)" stroke-width="3"/><rect x="1586" y="486" width="28" height="28" fill="none" stroke="rgba(243,239,232,.16)" stroke-width="3"/><circle cx="500" cy="300" r="9" fill="rgba(234,153,63,.3)"/><circle cx="1300" cy="1500" r="9" fill="rgba(234,153,63,.3)"/></svg>`);
const sqs = [60, 90, 40, 120, 70, 50, 34, 80].map((z) => { const s = el("div", "bgsq", bg); css(s, { width: z + "px", height: z + "px" }); return s; });

// ---------- the old way ----------
const SKETCH = `<svg class="sketch" viewBox="0 0 560 560">${LOGO_SVG()}</svg>`;
const oldA = el("div", "obj old", world, `<div class="tb"><i></i><i></i><i></i><b>logo_final_v3.ai</b></div><div class="body">${SKETCH}</div>`);
const oldB = el("div", "obj old photo", world, `<div class="tb"><i></i><i></i><i></i><b>post_FINAL_final.psd</b></div><div class="body"><img src="assets/cup/full.png"></div>`);
const CHIPS = [["download", "Export As…"], ["image", "Save as PNG…"], ["layers", "Import…"], ["download", "Export… again"], ["image", "Place…"], ["layers", "Flatten image?"], ["type", "Missing fonts ⚠", "warn"], ["image", "logo_v7_FINAL.png"], ["download", "Export As…"], ["type", "Missing fonts ⚠", "warn"]];
const CHIP_T = [0.45, 1.12, 1.72, 2.26, 2.76, 3.2, 3.6, 3.95, 4.27, 4.55];
const chips = CHIPS.map(([ic, tx, c]) => el("div", "obj fchip" + (c ? " " + c : ""), world, `${icon(ic)}${tx}`));
const adot = el("div", "obj adot", world);
const awipe = el("div", "awipe", fx);

// ---------- HORIX One window ----------
const WW = 940, WH = 1140, WY = 122, WS = 0.94; // window size, home y and scale
const AB = { x: 103, y: 330 }; // square artboard, window coords
const TALL = { x: 123, y: 292, w: 520, h: 650 }; // portrait artboard, window coords
const win = el("div", "obj win", world);
const frame = el("div", "frame", win, `
  <div class="bar"><div class="sym"></div>
    <div class="pill"><div class="hi"></div><span class="ps v">${icon("pen-tool")}Vector</span><span class="ps p">${icon("brush")}Pixel</span><span class="ps l">${icon("layout")}Layout <small>قريبًا</small></span></div>
    <div class="sp"></div><div class="act"><span class="lbl"></span>${icon("arrow-left")}</div></div>
  <div class="menu"><span class="mv">${"File Edit Object Type Select Effect View Window Help".split(" ").map((w) => `<span>${w}</span>`).join("")}</span><span class="mp">${"File Edit Image Layer Type Select Filter View Window Help".split(" ").map((w) => `<span>${w}</span>`).join("")}</span></div>
  <div class="row2"><span class="rv"><span class="tab t1">بُنّ.svg</span><span class="tab t2">بوستر.svg</span></span>
    <span class="rp">${icon("brush")}<span>Mode:</span><span class="fld">Normal</span><span>Opacity:</span><span class="fld">100 %</span><span>Flow:</span><span class="fld">100 %</span></span></div>
  <div class="tools"><div class="tv"></div><div class="tp"></div></div>
  <div class="cv"></div>
  <div class="panel"><div class="pv"><div class="ptabs"><span>Properties</span><span class="on">Layers</span><span>Libraries</span></div><div class="rows"></div></div>
    <div class="pp"><div class="swatch"><i style="background:#0E0E0F;border:2px solid #555"></i><i style="background:#F3EFE8"></i><i style="background:#EA993F"></i><i style="background:#D63C32"></i><i style="background:#1D1510"></i></div><div class="ptabs"><span class="on">Layers</span><span>Channels</span><span>Paths</span></div><div class="rows"></div>
      <div class="adj">${[["sun", "السطوع"], ["droplet", "الدفا"], ["contrast", "التباين"], ["circle", "الإطار الغامق"]].map(([i, n]) => `<div class="a"><div>${icon(i)}${n}</div><div class="trk"><b></b><i></i></div></div>`).join("")}</div></div></div>
  <div class="status"><span class="z">100%</span><span class="sl"></span><span class="ai"></span></div>`);
const Q = (s) => frame.querySelector(s);
const pillHi = Q(".hi"), psV = Q(".ps.v"), psP = Q(".ps.p"), act = Q(".act"), actLbl = Q(".act .lbl");
const parts = { mv: Q(".mv"), mp: Q(".mp"), rv: Q(".rv"), rp: Q(".rp"), tv: Q(".tv"), tp: Q(".tp"), pv: Q(".pv"), pp: Q(".pp") };
const tab1 = Q(".tab.t1"), tab2 = Q(".tab.t2");
const cv = Q(".cv"), zoomTx = Q(".status .z"), statL = Q(".status .sl"), statAI = Q(".status .ai");
const TOOLS_V = ["pointer", "move", "pen-tool", "spline", "type", "square", "circle", "hexagon", "pencil", "eraser", "shapes", "gradient", "pipette", "zoom"];
const TOOLS_P = ["move", "square", "lasso", "wand", "crop", "pipette", "brush", "stamp", "eraser", "gradient", "droplet", "pen-tool", "type", "zoom"];
const toolsV = TOOLS_V.map((n) => el("div", "tl", parts.tv, icon(n)));
const toolsP = TOOLS_P.map((n) => el("div", "tl", parts.tp, icon(n)));
const adjEls = [...frame.querySelectorAll(".adj .a")].map((a) => ({ b: a.querySelector("b"), i: a.querySelector("i") }));
const adjBox = Q(".adj");

// layer rows: [panel, doc, appear time, thumb html, name, badge]
const rowsV = Q(".pv .rows"), rowsP = Q(".pp .rows");
const SHAPE = icon("hexagon"), TYPE = icon("type");
const ROWS = [
  [rowsV, "logo", B(6) + BT * 2 + 0.3, TYPE, "قهوة مختصة"],
  [rowsV, "logo", B(6) + 0.3, TYPE, "بُنّ"],
  [rowsV, "logo", B(5) + BT * 3 - 0.1, SHAPE, "الخط"],
  [rowsV, "logo", B(5) + 0.45, SHAPE, "حبة البن"],
  [rowsP, "logo", B(10) + 0.1, SHAPE, "قهوة مختصة", "شكل"],
  [rowsP, "logo", B(10) + 0.1 + BT * 0.6, SHAPE, "بُنّ", "شكل"],
  [rowsP, "logo", B(10) + 0.1 + BT * 1.2, SHAPE, "الخط", "شكل"],
  [rowsP, "logo", B(10) + 0.1 + BT * 1.8, SHAPE, "حبة البن", "شكل"],
  [rowsP, "cup", B(14) + BT * 2 + 0.5, SHAPE, "بُنّ", "شكل"],
  [rowsP, "cup", B(13) + BT * 2.3, `<img src="assets/cup/cut.png">`, "الكوباية"],
  [rowsP, "cup", B(14), `<span style="width:100%;height:100%;background:#2a1a0e"></span>`, "خلفية جديدة"],
  [rowsP, "cup", B(12), `<img src="assets/cup/full.png">`, "الصورة"],
  [rowsV, "poster", B(16) + BT * 3.3, SHAPE, "اللوجو"],
  [rowsV, "poster", B(16) + BT * 2, TYPE, "صباحك بُنّ"],
  [rowsV, "poster", cT + 0.6, `<img src="assets/cup/logo.png">`, "cup.png", "صورة"],
].map(([box, doc, at, th, name, badge]) => {
  const r = el("div", "lrow", box, `<span class="th">${th ?? ""}</span><span>${name}</span>${badge ? `<small>${badge}</small>` : ""}<span class="eye">${icon("eye")}</span>`);
  return { r, doc, at, th: r.querySelector(".th"), name };
});

// --- vector artboard (logo) ---
const abV = el("div", "ab sq", cv, `<div class="ablab">بوست 1080×1080</div><svg class="art" viewBox="0 0 560 560">
  <path class="fill" d="${fullD}" fill="${LOGO.colors.bean}"/>
  ${[0, 1, 2, 3].map((i) => `<path class="seg" d="${segD(i)}" fill="none" stroke="${LOGO.colors.ink}" stroke-width="3" pathLength="1"/>`).join("")}
  <path class="crease" d="${creaseD.d}" fill="none" stroke="${LOGO.colors.ink}" stroke-width="13" stroke-linecap="round" pathLength="1"/>
  <text class="word" x="280" y="438" text-anchor="middle" font-family="Cairo" font-weight="900" font-size="150" fill="${LOGO.colors.ink}"></text>
  <text class="tag" x="280" y="508" text-anchor="middle" font-family="Cairo" font-weight="700" font-size="34" fill="${LOGO.colors.tag}"></text>
  <rect class="caret" width="5" height="120" fill="${"#EA993F"}"/>
  <g class="hand" stroke="#EA993F" stroke-width="2"></g><g class="nodes"></g>
</svg>`);
const vSvg = abV.querySelector("svg"), vFill = vSvg.querySelector(".fill"), vSegs = [...vSvg.querySelectorAll(".seg")], vCrease = vSvg.querySelector(".crease");
const vWord = vSvg.querySelector(".word"), vTag = vSvg.querySelector(".tag"), vCaret = vSvg.querySelector(".caret"), vHand = vSvg.querySelector(".hand"), vNodes = vSvg.querySelector(".nodes");
// anchors + handles drawn per frame (they keep a constant on-screen size while zooming)
const NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, parent, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
const anchors = [...NODES.map((n) => n.p), creaseD.a, creaseD.b].map(() => svgEl("rect", vNodes, { fill: "#fff", stroke: "#EA993F" }));
const hLines = NODES.map(() => [svgEl("line", vHand), svgEl("line", vHand)]);
const hDots = NODES.map(() => [svgEl("circle", vHand, { fill: "#EA993F", stroke: "none" }), svgEl("circle", vHand, { fill: "#EA993F", stroke: "none" })]);

// --- pixel artboard (logo) ---
const abP = el("div", "ab sq", cv, `<div class="ablab">بُنّ.svg · طبقات أشكال</div>`);
const pCrisp = LC(1120, { bg: "#fff" }); abP.appendChild(pCrisp);
const pMosaic = LC(28, { bg: "#fff" }); pMosaic.className = "mosaic"; abP.appendChild(pMosaic);

// --- poster (vector) ---
const poster = el("div", "ab tall poster", cv, `<div class="ablab">بوستر 1080×1350</div>
  <svg class="blobs" viewBox="0 0 520 650"><path class="arc" d="M 300 632 C 360 600, 430 640, 496 606" fill="none" stroke="#E58A2E" stroke-width="6" stroke-linecap="round" pathLength="1"/></svg>
  <h2><span class="w1">صباحك</span> <em class="w2">بُنّ</em></h2><p>قهوة مختصة · من 7 الصبح</p><div class="plogo"></div>`);
const pW1 = poster.querySelector(".w1"), pW2 = poster.querySelector(".w2"), pSub = poster.querySelector("p"), pArc = poster.querySelector(".arc");
const pLogo = poster.querySelector(".plogo"); { const c = LC(220, { tag: false }); css(c, { width: "100%", height: "100%" }); pLogo.appendChild(c); }

// --- the cup document (pixel); also travels into the poster frame ---
const comp = el("div", "comp", cv, `<div class="in">
  <div class="lay checker"></div><div class="lay newbg"></div><div class="glow"></div><div class="cshadow"></div>
  <div class="tiles"></div><img class="full cut" src="assets/cup/cut.png"><img class="full lg" src="assets/cup/logo.png">
  <div class="vign"></div><svg class="ants" viewBox="0 0 1040 1300" preserveAspectRatio="none"><path class="a1" fill="none"/><path class="a2" fill="none"/></svg><div class="scan"></div></div>`);
const cin = comp.querySelector(".in");
const cParts = { checker: comp.querySelector(".checker"), newbg: comp.querySelector(".newbg"), glow: comp.querySelector(".glow"), shadow: comp.querySelector(".cshadow"), cut: comp.querySelector(".cut"), lg: comp.querySelector(".lg"), vign: comp.querySelector(".vign"), ants: comp.querySelector(".ants"), a1: comp.querySelector(".a1"), a2: comp.querySelector(".a2"), scan: comp.querySelector(".scan") };
const TC = 8, TR = 10, TS = 65;
const tiles = [];
for (let r = 0; r < TR; r++) for (let c = 0; c < TC; c++) {
  const i = el("i", "", comp.querySelector(".tiles"));
  css(i, { left: c * TS + "px", top: r * TS + "px", width: TS + 0.5 + "px", height: TS + 0.5 + "px", backgroundImage: "url(assets/cup/full.png)", backgroundPosition: `${-c * TS}px ${-r * TS}px` });
  tiles.push({ e: i, d: rnd(r * TC + c, 3) });
}
const flyLogo = LC(460, { tag: false }); flyLogo.className = "flylogo"; cin.insertBefore(flyLogo, cParts.vign);
const toast = el("div", "toast", cv, `${icon("check")}Quick Export as PNG · بتتفتح في Vector`);

// --- window level: the lifted logo and its pixels ---
const lift = el("div", "lift", win);
const liftSvg = el("div", "liftsvg", lift, `<svg viewBox="0 0 560 560" width="560" height="560" style="overflow:visible">${LOGO_SVG()}<path d="${fullD}" fill="none" stroke="#EA993F" stroke-width="2.5"/>${NODES.map((n) => `<rect x="${n.p[0] - 7}" y="${n.p[1] - 7}" width="14" height="14" fill="#fff" stroke="#EA993F" stroke-width="2.5"/>`).join("")}</svg>`);
css(liftSvg, { left: AB.x + "px", top: AB.y + "px" });
let CELLS = [];
const cursor = Cursor(win);

// ---------- campaign pieces ----------
const miniComp = (w, h, x = 0, y = 0) => {
  const k = Math.max(w / 520, h / 650);
  return `<div class="comp" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div class="in" style="transform:translate(${(w - 520 * k) / 2}px,${(h - 650 * k) / 2}px) scale(${k})"><div class="lay newbg"></div><div class="glow"></div><div class="cshadow"></div><img class="full" src="assets/cup/logo.png"><div class="vign"></div></div></div>`;
};
const PIECES = [
  { w: 340, h: 340, slot: [-300, -300, -6], cls: "", lbl: "بوست", html: (w, h) => miniComp(w, 250) + `<h3 style="right:22px;top:262px;font-size:44px">صباحك <em>بُنّ</em></h3><div class="pl" style="left:16px;top:262px;width:66px;height:66px"></div>` },
  { w: 270, h: 480, slot: [330, -190, 5], cls: "dark", lbl: "ستوري", html: (w, h) => miniComp(w, 300) + `<h3 style="right:20px;top:316px;font-size:40px;line-height:1.25">قهوتك<br><em>جاهزة</em></h3><div class="pl" style="left:16px;top:398px;width:66px;height:66px"></div>` },
  { w: 560, h: 290, slot: [-200, 470, 4], cls: "", lbl: "لافتة", html: (w, h) => miniComp(270, h) + `<h3 style="right:26px;top:56px;font-size:50px;line-height:1.25">صباحك<br><em>بُنّ</em></h3><div class="pl" style="right:200px;top:180px;width:86px;height:86px"></div>` },
  { w: 300, h: 420, slot: [330, 400, -5], cls: "menuc", lbl: "منيو", html: () => `<div class="pl" style="left:50%;margin-left:-60px;top:12px;width:120px;height:120px"></div><ul><li><span>إسبريسو</span><b>45</b></li><li><span>لاتيه</span><b>65</b></li><li><span>كابتشينو</span><b>60</b></li><li><span>V60</span><b>70</b></li></ul>` },
].map((p) => {
  const e = el("div", "obj piece " + p.cls, world, p.html(p.w, p.h) + `<div class="lbl">${p.lbl}</div>`);
  css(e, { width: p.w + "px", height: p.h + "px", overflow: "visible" });
  e.querySelectorAll(".comp").forEach((c) => (c.style.borderRadius = "22px 22px 0 0"));
  e.querySelectorAll(".pl").forEach((pl) => { const c = LC(240, { tag: false, colors: p.cls === "dark" ? { ink: "#F3EFE8" } : {} }); css(c, { width: "100%", height: "100%" }); pl.appendChild(c); });
  return { ...p, e };
});

// ---------- end: the HORIX One icon assembles ----------
const endIcon = el("div", "obj endicon", world, `<div class="shine"><i></i></div>`);
const endShine = endIcon.querySelector(".shine i");
let IC = {};
const wordmark = el("div", "obj word", world, `<b>HORIX <span>ONE</span></b><div class="by">BY SABER GROUP</div>`);
const endTag = el("div", "obj endtag", world, `Vector و Pixel في <em>برنامج واحد</em>`);
const plat = el("div", "obj plat", world, `<span>${icon("globe")}ويب</span><span>${icon("monitor")}ويندوز</span><span>${icon("monitor")}ماك</span>`);
const url = el("div", "obj url", world, `one.horix.live`);
const soon = el("div", "obj soon", world, `<b>Layout</b> قريبًا · بديل InDesign`);

// ---------- pixel wipe ----------
const PW = [];
for (let r = 0; r < 21; r++) for (let c = 0; c < 12; c++) {
  const i = el("i", "", $("#pw"));
  const k = r * 12 + c, u = rnd(k, 7);
  css(i, { left: c * 90 + "px", top: r * 92 + "px", background: u < 0.1 ? "#EA993F" : u < 0.14 ? "#D63C32" : "#141415" });
  PW.push({ e: i, a: rnd(k, 1), b: rnd(k, 2) });
}
function pixelWipe(t, tc, d = 0.32) {
  if (t < tc - d - 0.1 || t > tc + d + 0.1) return false;
  PW.forEach(({ e, a, b }) => {
    const pin = prog(t, tc - d + a * d * 0.7, tc - d + a * d * 0.7 + 0.09);
    const pout = prog(t, tc + b * d * 0.7, tc + b * d * 0.7 + 0.09);
    const s = pin * (1 - pout);
    e.style.transform = `scale(${s.toFixed(3)})`;
  });
  return true;
}

// ---------- kinetic text ----------
const topT = el("div", "texts", fx);
const mid = el("div", "texts", fx); mid.style.top = "860px";
const low = el("div", "texts", fx); low.style.top = "1640px";
const T = {
  o1: Words(topT, "بتصدّر."), o2: Words(topT, "بتفتح."), o3: Words(topT, "بتصدّر *تاني؟"), o4: Words(topT, "والخط *ضاع."),
  r1: Words(mid, "برنامج *واحد.", "l on-amber"),
  r2: Words(topT, "فيكتور؟"), r3: Words(topT, "بكسل؟"), r4: Words(topT, "الاتنين *مع بعض."),
  v1: Words(topT, "ارسم *فيكتور."), v2: Words(topT, "خطوط *نضيفة."), v3: Words(topT, "نص عربي *مظبوط."), v4: Words(topT, "حادّ في *أي مقاس."),
  h1: Words(topT, "من Vector *لـPixel."), h2: Words(topT, "بضغطة *واحدة."), h3: Words(topT, "أشكال *تتعدّل."),
  g1: Words(topT, "Vector.", "l lat"), g2: Words(topT, "*Pixel.", "l lat"), g3: Words(topT, "Vector.", "l lat"), g4: Words(topT, "*Pixel.", "l lat"),
  gL: Words(low, "اتنقّل بينهم *براحتك."),
  c1: Words(topT, "صورة *المنتج."), c2: Words(topT, "اختيار *بالـAI."), c3: Words(topT, "شيل *الخلفية."), c4: Words(topT, "خلفية *جديدة."), c5: Words(topT, "واللوجو *عليها."), c6: Words(topT, "عدّل *براحتك."),
  b1: Words(topT, "وارجع *لـVector."), b2: Words(topT, "وقفّل *البوستر."),
  m1: Words(topT, "بوست.", "l"), m2: Words(topT, "ستوري.", "l"), m3: Words(topT, "لافتة.", "l"), m4: Words(topT, "منيو.", "l"),
  m5: Words(topT, "حملة *كاملة."), m6: Words(low, "من برنامج *واحد."),
  e1: Words(topT, "Vector.", "xl lat"), e2: Words(topT, "Pixel.", "xl lat"), e3: Words(topT, "*One.", "xl lat"),
};

// ---------- persona state ----------
// pill moves on the click; the app UI follows a beat later on the hand-offs
const PILL = [[-9, "v"], [B(3) + BT, "p"], [B(3) + BT * 2, "v"], [hT, "p"], [B(11), "v"], [B(11) + BT, "p"], [B(11) + BT * 2, "v"], [B(11) + BT * 3, "p"], [cT, "v"]];
const UI = [[-9, "v"], [B(3) + BT, "p"], [B(3) + BT * 2, "v"], [hT + 0.35, "p"], [B(11), "v"], [B(11) + BT, "p"], [B(11) + BT * 2, "v"], [B(11) + BT * 3, "p"], [cT + 0.35, "v"]];
const stateAt = (L, t) => { let i = 0; while (i + 1 < L.length && t >= L[i + 1][0]) i++; return { cur: L[i][1], prev: i ? L[i - 1][1] : L[i][1], at: L[i][0] }; };
let PILLX = {};

// ---------- helpers ----------
const S = (p, lx, ly) => ({ x: (p.x || 0) + (lx - WW / 2) * (p.s ?? 1), y: (p.y || 0) + (ly - WH / 2) * (p.s ?? 1) });
function background(t) {
  css($(".dots", bg), { transform: `translate(${(t * 12) % 46}px, ${(t * -18) % 46}px)` });
  css(blobA, { left: `${40 + Math.sin(t * 0.31) * 30}%`, top: `${30 + Math.cos(t * 0.23) * 20}%`, transform: "translate(-50%,-50%)" });
  css(blobB, { left: `${62 + Math.cos(t * 0.27) * 30}%`, top: `${74 + Math.sin(t * 0.2) * 14}%`, transform: "translate(-50%,-50%)" });
  bgCurve.style.transform = `rotate(${t * 3}deg) scale(${1 + beatPulse(t) * 0.012})`;
  sqs.forEach((s, i) => css(s, { left: `${(rnd(i, 4) * 100 + t * (2 + i)) % 110 - 5}%`, top: `${(rnd(i, 5) * 100 - t * (1.5 + i * 0.6) + 300) % 110 - 5}%`, transform: `rotate(${t * (i % 2 ? -12 : 9)}deg)` }));
}
// camera: keeps the focus point (fx, fy) fixed on screen while zooming by s
function camera(t) {
  const H = { x: 0, y: WY, s: WS };
  const btn = S(H, 800, 33), pill = S(H, 290, 33), art = S(H, AB.x + 280, AB.y + 280), pnl = S(H, 822, 330);
  const [fx_, fy_, s] = K(t, [
    [B(3) - 0.3, [pill.x, pill.y, 1]], [B(3) + 0.1, [pill.x, pill.y, 1.42], E.expoIo], [B(4) - 0.35, [pill.x, pill.y, 1.42]], [B(4) + 0.1, [art.x, art.y, 1], E.expoIo],
    [B(5), [art.x, art.y, 1.1]], [B(7), [art.x, art.y, 1.12]], [B(8), [art.x, art.y, 1.0]],
    [hT - 0.75, [btn.x, btn.y, 1.0]], [hT - 0.15, [btn.x, btn.y, 1.38], E.expoIo], [hT + 0.35, [btn.x, btn.y, 1.38]], [B(9) - 0.05, [art.x, art.y, 1], E.expoIo],
    [B(10) - 0.05, [pnl.x, pnl.y, 1]], [B(10) + 0.35, [pnl.x, pnl.y, 1.32], E.expoIo], [B(11) - 0.4, [pnl.x, pnl.y, 1.32]], [B(11) - 0.02, [art.x, art.y, 1], E.expoIo],
    [B(12), [art.x, art.y, 1]], [B(13), [art.x, art.y, 1.08]], [B(15), [art.x, art.y, 1.1]], [B(15) + BT * 3, [art.x, art.y, 1.0]],
    [cT - 0.45, [btn.x, btn.y, 1.0]], [cT - 0.05, [btn.x, btn.y, 1.32], E.expoIo], [cT + 0.3, [btn.x, btn.y, 1.32]], [cT + 0.75, [art.x, art.y, 1.04], E.expoIo], [B(17) - 0.15, [art.x, art.y, 1.0]],
  ]);
  const rz = Math.sin(t * 0.35) * 0.5;
  world.style.transform = `translate(${(-fx_ * (s - 1) + bob(t, 5, 0.5)).toFixed(2)}px, ${(-fy_ * (s - 1) + bob(t, 6, 0.43, 1)).toFixed(2)}px) scale(${s.toFixed(4)}) rotate(${rz.toFixed(3)}deg)`;
}

const TOP = [oldA, oldB, ...chips, adot, win, ...PIECES.map((p) => p.e), endIcon, wordmark, endTag, plat, url, soon];
function hideAll() {
  for (const k in T) show(T[k].line, false);
  TOP.forEach((e) => show(e, false));
  show(awipe, false);
}

// ---------- 0: the old way (bars 0-2) ----------
function sOld(t) {
  if (t > B(2) + 0.35) return;
  const k = (t) => prog(t, B(2) - 0.55, B(2) - 0.05, E.expoIn);
  const shake = (t, a, ph) => [Math.sin(t * 53 + ph) * a, Math.cos(t * 47 + ph) * a];
  const pose = (x0, y0, r0, ph) => (t) => {
    const q = popIn(t, 0.05 + ph * 0.12, 0.8), kk = k(t);
    if (kk >= 1) return null;
    const [sx, sy] = shake(t, prog(t, B(1) + BT * 2, B(2) - 0.6) * 9, ph);
    return { x: lerp(x0, 0, kk) + sx, y: lerp(y0 + 500 * (1 - q), 40, kk) + sy + bob(t, 8, 1.1, ph), s: lerp(0.98, 0.02, kk), rz: r0 + kk * (ph ? 160 : -160), ry: lerp(ph ? -14 : 14, 0, kk), o: Math.min(1, q * 3) };
  };
  const pA = pose(-130, -170, -6, 0), pB = pose(130, 420, 5, 1);
  place(oldA, pA, t); place(oldB, pB, t);
  // files thrown back and forth, faster and faster
  chips.forEach((c, i) => place(c, (t) => {
    const a = CHIP_T[i], d = 0.62;
    if (t < a || t > a + d || k(t) > 0.2) return null;
    const p = prog(t, a, a + d, E.io), dir = i % 2 ? -1 : 1;
    const [x0, y0, x1, y1] = dir > 0 ? [-130, -170, 130, 420] : [130, 420, -130, -170];
    return { x: lerp(x0, x1, p) + Math.sin(p * Math.PI) * 330 * dir * (i % 4 < 2 ? 1 : -1), y: lerp(y0, y1, p), z: 220, s: Math.sin(p * Math.PI) * 1.25 + 0.2, rz: lerp(-12, 12, p) * dir, o: Math.min(1, Math.sin(p * Math.PI) * 3) };
  }, t));
  const w = { rise: 80, lift: 80, dir: 0, from: 1.15, dur: 0.36, outDur: 0.2 };
  T.o1.set(t, 0.25, 0.25 + BT * 2 - 0.2, w);
  T.o2.set(t, 0.25 + BT * 2, B(1) - 0.15, w);
  T.o3.set(t, B(1), B(1) + BT * 2 - 0.2, w);
  T.o4.set(t, B(1) + BT * 2, B(2) - 0.6, w);
  // everything gets sucked into an amber dot, which blows up into the amber wipe
  place(adot, (t) => {
    if (t < B(2) - 0.6 || t > B(2) + 0.05) return null;
    const q = popIn(t, B(2) - 0.6, 0.4);
    return { y: 40, s: q * (1 + beatPulse(t) * 0.25) + prog(t, B(2) - 0.15, B(2), E.expoIn) * 2, o: 1 };
  }, t, 0);
  if (t >= B(2) - 0.05) {
    show(awipe, true);
    const g = prog(t, B(2) - 0.05, B(2) + 0.3, E.expo);
    awipe.style.transform = `translate(0, 40px) scale(${lerp(0.04, 1, g).toFixed(4)})`;
  }
}

// ---------- the window ----------
function pWin(t) {
  const inn = prog(t, B(2) + BT * 3 - 0.1, B(2) + BT * 3 + 0.8, E.out5);
  if (t < B(2) + BT * 3 - 0.1) return null;
  let p = { x: 0, y: lerp(1500, WY, inn) + bob(t, 6, 1.0), z: 0, s: WS, rx: lerp(34, 2, inn) + bob(t, 0.8, 0.9), ry: lerp(-14, -3, inn) + bob(t, 1.4, 0.7), rz: 0, o: 1 };
  // ping-pong bar: back off a little so the line underneath has room
  const pp = Math.min(prog(t, B(11) - 0.3, B(11) + 0.1, E.io), 1 - prog(t, B(12) - 0.35, B(12), E.io));
  p.s *= lerp(1, 0.9, pp); p.y = lerp(p.y, 20, pp);
  // campaign: the window steps back and the pieces fly out of it
  const back = prog(t, B(17) - 0.1, B(17) + 0.5, E.expoIo);
  p.s *= lerp(1, 0.56, back); p.y = lerp(p.y, 40, back); p.z = -80 * back; p.ry += back * bob(t, 6, 0.6);
  const dive = prog(t, B(19) - 0.4, B(19) - 0.02, E.expoIn);
  if (dive >= 1) return null;
  p.z += dive * 900; p.o = 1 - dive;
  return p;
}

function sWindow(t) {
  const wp = place(win, pWin, t, t > B(9) - 0.1 && t < B(10) + 0.3 ? 0 : 0.5);
  if (!wp) return;
  const pill = stateAt(PILL, t), ui = stateAt(UI, t).cur;
  // pill highlight slides between Vector and Pixel
  const k = prog(t, pill.at, pill.at + 0.38, E.spring);
  const a = PILLX[pill.prev], b = PILLX[pill.cur];
  css(pillHi, { left: lerp(a.x, b.x, k) + "px", width: lerp(a.w, b.w, k) + "px" });
  psV.classList.toggle("on", (k > 0.5 ? pill.cur : pill.prev) === "v");
  psP.classList.toggle("on", (k > 0.5 ? pill.cur : pill.prev) === "p");
  const pix = ui === "p";
  show(parts.mv, !pix); show(parts.mp, pix); show(parts.rv, !pix); show(parts.rp, pix); show(parts.tv, !pix); show(parts.tp, pix); show(parts.pv, !pix); show(parts.pp, pix);
  cv.classList.toggle("dotted", pix);
  actLbl.textContent = pill.cur === "p" ? "افتح الصورة في Vector" : "افتح التصميم في Pixel";
  const hot = (t > hT - 0.35 && t < hT + 0.4) || (t > cT - 0.35 && t < cT + 0.4);
  act.classList.toggle("hot", hot);
  act.style.transform = `scale(${(Math.abs(t - hT) < Math.abs(t - cT) ? pressK(t, hT) : pressK(t, cT)).toFixed(3)})`;
  // tools
  const vTool = t >= B(4) && t < B(6) ? 2 : t >= B(6) && t < B(7) ? 4 : t >= B(7) && t < B(8) ? 13 : 0;
  const pTool = t >= B(12) + 0.4 && t < B(14) ? 3 : t >= B(14) + BT * 2 && t < B(15) ? 0 : 6;
  toolsV.forEach((e, i) => e.classList.toggle("on", i === vTool));
  toolsP.forEach((e, i) => e.classList.toggle("on", i === pTool));
  // documents
  const posterDoc = t >= cT + 0.35, cupDoc = (t >= B(12) - 0.05 && !posterDoc) || (t < B(4) && pix);
  show(abV, !pix && !posterDoc);
  show(abP, pix && !cupDoc);
  show(comp, cupDoc && (pix || t >= cT) || posterDoc);
  show(poster, posterDoc);
  tab1.classList.toggle("on", !posterDoc); tab2.style.display = posterDoc ? "" : "none"; tab2.classList.toggle("on", posterDoc);
  // layer rows
  const doc = posterDoc ? "poster" : cupDoc ? "cup" : "logo";
  ROWS.forEach((r) => {
    const vis = r.doc === doc && t >= r.at;
    show(r.r, vis);
    if (vis) { const q = popIn(t, r.at, 0.45); r.r.style.transform = `translateX(${((1 - q) * -60).toFixed(1)}px) scale(${lerp(0.9, 1, q).toFixed(3)})`; r.r.style.opacity = Math.min(1, q * 2).toFixed(2); }
    r.r.classList.toggle("sel", vis && t - r.at < 0.9);
  });
  show(adjBox, pix && t >= B(15) - 0.15 && t < cT + 0.35);
  // status bar
  statAI.textContent = pix ? (t >= sT && t < B(14) ? "AI select · MobileSAM ✓" : "AI ready") : "";
  statL.textContent = pix ? (cupDoc ? "cup.jpg · 1080×1350" : "بُنّ.svg") : t >= B(4) && t < B(6) ? "Pen" : t >= B(6) && t < B(7) ? "Type" : "Selection";
  zoomTx.textContent = "100%";
  show(toast, false);
  sVectorLogo(t, wp, pix);
  sPixelLogo(t, wp, pix);
  sCup(t, wp, pix, cupDoc, posterDoc);
  sPoster(t, posterDoc);
  sCursor(t);
}

// ---------- bars 4-7: drawing the logo in Vector ----------
const NT = [0, 1, 2, 3, 4].map((i) => B(4) + 0.35 + i * BT);
function sVectorLogo(t, wp, pix) {
  if (pix) return;
  const done = t >= B(8); // fully built (ping-pong and later)
  // outline segments follow the pen
  vSegs.forEach((s, i) => {
    const p = done ? 1 : prog(t, NT[i] + 0.08, NT[i + 1] - 0.04, E.io);
    s.style.strokeDashoffset = (1 - p).toFixed(4); s.style.strokeDasharray = "1 1";
    s.style.opacity = t < NT[i] ? 0 : 1;
  });
  const fillP = done ? 1 : prog(t, B(5) + 0.42, B(5) + 0.85, E.out5);
  vFill.style.opacity = fillP.toFixed(3);
  vFill.style.transformOrigin = `${LOGO.bean.cx}px ${LOGO.bean.cy}px`;
  vFill.style.transform = `scale(${(1 + (fillP > 0 && fillP < 1 ? Math.sin(fillP * Math.PI) * 0.05 : 0)).toFixed(3)})`;
  const cr = done ? 1 : prog(t, B(5) + BT * 2, B(5) + BT * 3 - 0.05, E.io);
  vCrease.style.strokeDasharray = "1 1"; vCrease.style.strokeDashoffset = (1 - cr).toFixed(4); vCrease.style.opacity = cr > 0 ? 1 : 0;
  // type: «بُنّ» then the tagline
  const W = LOGO.word.text, TG = LOGO.tag.text;
  const nW = done ? W.length : clamp(Math.floor((t - B(6) - 0.35) * 8), 0, W.length);
  vWord.textContent = W.slice(0, nW);
  const wp2 = popIn(t, B(6) + BT * 2 - 0.05, 0.5);
  vWord.style.transformOrigin = "280px 400px";
  vWord.style.transform = `scale(${(t > B(6) + BT * 2 - 0.05 && !done ? 1 + Math.sin(wp2 * Math.PI) * 0.08 : 1).toFixed(3)})`;
  const nT = done ? TG.length : clamp(Math.floor((t - B(6) - BT * 2 - 0.15) * 20), 0, TG.length);
  vTag.textContent = TG.slice(0, nT);
  const typing = t >= B(6) + 0.25 && t < B(7) - 0.1 && !done;
  show(vCaret, typing && Math.floor(t * 2.4) % 2 === 0 || (typing && (nW < W.length || (nT > 0 && nT < TG.length))));
  if (typing) {
    const onTag = t >= B(6) + BT * 2 + 0.1;
    const tEl = onTag ? vTag : vWord, len = tEl.textContent ? tEl.getComputedTextLength() : 0;
    vCaret.setAttribute("x", 280 - len / 2 - 10); vCaret.setAttribute("y", onTag ? 474 : 318); vCaret.setAttribute("height", onTag ? 44 : 140);
  }
  // zoom demo (bar 7): zoom into the right anchor; vectors stay sharp
  const z = done ? 1 : K(t, [[B(7) + 0.05, 1], [B(7) + BT * 2.3, 16, E.expoIo], [B(8) - 0.5, 16], [B(8) - 0.12, 1, E.expoIo]]);
  const f = NODES[1].p, vw = 560 / z;
  const cx = lerp(280, f[0], 1 - 1 / z), cy = lerp(280, f[1], 1 - 1 / z);
  vSvg.setAttribute("viewBox", `${(cx - vw / 2).toFixed(3)} ${(cy - vw / 2).toFixed(3)} ${vw.toFixed(3)} ${vw.toFixed(3)}`);
  if (z > 1.01) zoomTx.textContent = Math.round(z * 100) + "%";
  // anchors and handles (constant on-screen size)
  const u = vw / 560;
  const nodesOn = (t >= NT[0] - 0.05 && t < B(6) - 0.1) || (t >= B(7) && t < B(8) - 0.3) || (t >= B(11) && t < B(12));
  show(vNodes, nodesOn); show(vHand, nodesOn);
  if (nodesOn) {
    const pts = [...NODES.map((n) => n.p), creaseD.a, creaseD.b];
    anchors.forEach((r, i) => {
      const at = i < 4 ? NT[i] : B(5) + BT * 2 + (i - 4) * BT;
      const q = t >= B(7) ? 1 : popIn(t, at, 0.4);
      const sz = 15 * u * q;
      r.setAttribute("x", pts[i][0] - sz / 2); r.setAttribute("y", pts[i][1] - sz / 2); r.setAttribute("width", sz); r.setAttribute("height", sz); r.setAttribute("stroke-width", 2.5 * u);
      r.setAttribute("fill", t >= B(7) || (i === 0 && t >= NT[4]) ? "#EA993F" : "#fff");
      r.style.display = t >= at || t >= B(7) ? "" : "none";
    });
    NODES.forEach((n, i) => {
      const hp = t >= B(7) ? 1 : prog(t, NT[i], NT[i] + 0.28, E.out);
      const show_ = t >= B(7) ? i === 1 || i === 0 || i === 2 : t >= NT[i] && t < NT[i] + BT * 1.6;
      [n.hin, n.hout].forEach((h, j) => {
        const x = lerp(n.p[0], h[0], hp), y = lerp(n.p[1], h[1], hp);
        const L = hLines[i][j], D = hDots[i][j];
        L.setAttribute("x1", n.p[0]); L.setAttribute("y1", n.p[1]); L.setAttribute("x2", x); L.setAttribute("y2", y); L.setAttribute("stroke-width", 2 * u);
        D.setAttribute("cx", x); D.setAttribute("cy", y); D.setAttribute("r", 6 * u);
        L.style.display = D.style.display = show_ ? "" : "none";
      });
    });
  }
}

// ---------- bars 8-11: the hand-off, Vector to Pixel ----------
function sPixelLogo(t, wp, pix) {
  // lifted logo floats out of the window after the click
  const liftOn = t >= hT + 0.05 && t < B(9);
  show(liftSvg, liftOn);
  if (liftOn) {
    const q = popIn(t, hT + 0.05, 0.7);
    liftSvg.style.transform = `translateZ(${(q * 260).toFixed(1)}px) rotateY(${(bob(t, 8, 3) * q).toFixed(2)}deg) rotateX(${(bob(t, 5, 2.4, 1) * q).toFixed(2)}deg) scale(${(1 + q * 0.04).toFixed(3)})`;
  }
  if (t < hT) abV.style.opacity = 1;
  else if (t < B(11)) abV.style.opacity = 0;
  else abV.style.opacity = 1;
  // ... then breaks into pixels, which fly and land in Pixel
  const cellsOn = t >= B(9) && t < B(10) + 0.25;
  CELLS.forEach((c) => show(c.e, cellsOn));
  if (cellsOn) {
    const ex = prog(t, B(9), B(9) + BT * 1.6, E.out5);
    const fade = 1 - prog(t, B(10) - 0.02, B(10) + 0.22);
    CELLS.forEach((c) => {
      const as_ = prog(t, B(9) + BT * 1.55 + c.d * 0.25, B(10) - 0.04, E.expoIo);
      const e_ = ex * (1 - as_);
      const x = AB.x + c.x + c.dx * e_, y = AB.y + c.y + c.dy * e_, z = 260 * (1 - as_) * (1 - ex * 0.2) + c.dz * e_;
      c.e.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotate(${(c.r * e_).toFixed(1)}deg) scale(${(1 + e_ * 0.5).toFixed(3)})`;
      c.e.style.opacity = fade.toFixed(3);
    });
  }
  if (!pix) return;
  // the Pixel document: empty until the pixels land, sharp after; a mosaic in the ping-pong
  const landed = prog(t, B(10) - 0.1, B(10) + 0.15);
  const mosaic = t >= B(11) && t < B(12);
  pCrisp.style.opacity = mosaic ? 0 : landed.toFixed(3);
  show(pMosaic, mosaic);
}

// ---------- bars 12-15: the product photo in Pixel ----------
let ADJY = [];
const ADJ = [[1, 1.1], [0, 0.2], [1, 1.14], [0, 1]]; // brightness, warmth (sepia), contrast, vignette
function sCup(t, wp, pix, cupDoc, posterDoc) {
  if (!cupDoc && !posterDoc && !(t >= cT && t < cT + 0.35)) return;
  // where the composite sits: the portrait artboard, then the poster's photo frame
  const mv = prog(t, cT + 0.3, cT + 0.95, E.expoIo);
  const r0 = { x: 61, y: 132, w: 520, h: 650 }, r1 = { x: 85, y: 156, w: 472, h: 440 };
  const R_ = { x: lerp(r0.x, r1.x, mv), y: lerp(r0.y, r1.y, mv), w: lerp(r0.w, r1.w, mv), h: lerp(r0.h, r1.h, mv) };
  css(comp, { left: R_.x + "px", top: R_.y + "px", width: R_.w + "px", height: R_.h + "px", borderRadius: (mv * 26).toFixed(1) + "px", boxShadow: mv > 0 ? "none" : "0 20px 60px rgba(0,0,0,.6)" });
  const k = Math.max(R_.w / 520, R_.h / 650);
  cin.style.transform = `translate(${((R_.w - 520 * k) / 2).toFixed(1)}px, ${((R_.h - 650 * k) / 2 - mv * 40).toFixed(1)}px) scale(${k.toFixed(4)})`;
  const pre = t < B(4); // the quick peek during the reveal
  // background removal: tiles of the photo drop out
  const rm = B(13) + BT * 2;
  tiles.forEach(({ e, d }) => {
    const p = pre ? 0 : prog(t, rm + d * 0.42, rm + d * 0.42 + 0.14, E.in);
    e.style.opacity = (1 - p).toFixed(3);
    e.style.transform = `scale(${lerp(1, 0.3, p).toFixed(3)})`;
  });
  show(cParts.checker, !pre && t >= rm && t < B(14) + 0.2);
  const nb = pre ? 0 : prog(t, B(14) - 0.06, B(14) + 0.12, E.out);
  cParts.newbg.style.opacity = cParts.glow.style.opacity = cParts.shadow.style.opacity = nb.toFixed(3);
  show(cParts.cut, !pre && t >= rm);
  // the logo flies in from the layers and settles on the cup
  const lt = B(14) + BT * 2;
  const lp = prog(t, lt, B(15) - 0.12, E.expoIo);
  const lfade = prog(t, B(15) - 0.3, B(15) - 0.02);
  show(flyLogo, !pre && t >= lt && lfade < 1);
  if (t >= lt) css(flyLogo, { left: "0px", top: "0px", transform: `translate(${lerp(420, 156, lp).toFixed(1)}px, ${lerp(-260, 294, lp).toFixed(1)}px) scale(${lerp(1.6, 0.76, lp).toFixed(3)}) rotate(${lerp(-25, 0, lp).toFixed(2)}deg)`, transformOrigin: "0 0", opacity: (1 - lfade).toFixed(3) });
  cParts.lg.style.opacity = pre ? 0 : prog(t, B(15) - 0.3, B(15) - 0.02).toFixed(3);
  // AI select: a scan, the outline draws, then marching ants
  const antsOn = !pre && t >= sT && t < B(14) + 0.1;
  show(cParts.ants, antsOn);
  if (antsOn) {
    const dr = prog(t, sT, sT + 0.5, E.io);
    cParts.a1.setAttribute("stroke", dr < 1 ? "#EA993F" : "#fff");
    cParts.a1.setAttribute("stroke-width", dr < 1 ? 9 : 5);
    cParts.a1.style.strokeDasharray = dr < 1 ? "1 1" : "none";
    cParts.a1.setAttribute("pathLength", dr < 1 ? 1 : "");
    if (dr < 1) cParts.a1.style.strokeDashoffset = (1 - dr).toFixed(4); else cParts.a1.style.strokeDashoffset = "0";
    show(cParts.a2, dr >= 1);
    cParts.a2.style.strokeDashoffset = (-t * 60).toFixed(1);
    cParts.ants.style.filter = dr < 1 ? "drop-shadow(0 0 10px rgba(234,153,63,.9))" : "none";
  }
  const sc = !pre && t >= sT - 0.05 && t < sT + 0.65;
  show(cParts.scan, sc);
  if (sc) cParts.scan.style.top = lerp(-90, 650, prog(t, sT - 0.05, sT + 0.65, E.io)).toFixed(1) + "px";
  // adjustments, one per beat of bar 15
  const ap = ADJ.map((_, i) => (pre ? 0 : t >= cT + 0.35 ? 1 : prog(t, B(15) + i * BT + 0.05, B(15) + i * BT + 0.4, E.out5)));
  cin.style.filter = ap.some((v) => v > 0) ? `brightness(${lerp(1, 1.1, ap[0]).toFixed(3)}) sepia(${(0.2 * ap[1]).toFixed(3)}) contrast(${lerp(1, 1.14, ap[2]).toFixed(3)}) saturate(${lerp(1, 1.15, ap[2]).toFixed(3)})` : "none";
  cParts.vign.style.opacity = ap[3].toFixed(3);
  adjEls.forEach((a, i) => { const v = lerp(0.5, 0.8, ap[i]); a.b.style.width = v * 100 + "%"; a.i.style.left = v * 100 + "%"; });
  const pulse = Math.max(prog(t, B(14) - 0.05, B(14) + 0.35, E.lin) > 0 && t < B(14) + 0.35 ? Math.sin(prog(t, B(14) - 0.05, B(14) + 0.35) * Math.PI) : 0, 0);
  comp.style.transform = `scale(${(1 + pulse * 0.025).toFixed(4)})`;
  // the export toast
  const ts = !pre && t >= cT + 0.05 && t < cT + 1.3;
  show(toast, ts);
  if (ts) { const q = popIn(t, cT + 0.05, 0.45), o = prog(t, cT + 1.0, cT + 1.3); toast.style.opacity = (Math.min(1, q * 2) * (1 - o)).toFixed(2); toast.style.transform = `translate(-50%, ${((1 - q) * 40).toFixed(1)}px)`; }
}

// ---------- bars 16-17: back in Vector, the poster ----------
function sPoster(t, on) {
  if (!on) return;
  const a = B(16) + BT * 2;
  const q1 = popIn(t, a, 0.5), q2 = popIn(t, a + BT * 0.5, 0.5);
  pW1.style.opacity = Math.min(1, q1 * 3).toFixed(2); pW1.style.display = "inline-block"; pW1.style.transform = `translateY(${((1 - q1) * 40).toFixed(1)}px)`;
  pW2.style.opacity = Math.min(1, q2 * 3).toFixed(2); pW2.style.display = "inline-block"; pW2.style.transform = `scale(${lerp(1.6, 1, q2).toFixed(3)})`;
  const q3 = prog(t, a + BT, a + BT + 0.4, E.out5);
  pSub.style.opacity = q3.toFixed(2); pSub.style.transform = `translateX(${((1 - q3) * -30).toFixed(1)}px)`;
  const q4 = popIn(t, a + BT * 1.3, 0.55);
  pLogo.style.opacity = Math.min(1, q4 * 3).toFixed(2); pLogo.style.transform = `scale(${q4.toFixed(3)}) rotate(${((1 - q4) * -40).toFixed(1)}deg)`;
  pArc.style.strokeDasharray = "1 1"; pArc.style.strokeDashoffset = (1 - prog(t, a, a + 0.6, E.io)).toFixed(4);
}

// ---------- the cursor ----------
function sCursor(t) {
  const n = (i) => [AB.x + NODES[i % 4].p[0], AB.y + NODES[i % 4].p[1]];
  const hd = (i) => [AB.x + NODES[i % 4].hout[0], AB.y + NODES[i % 4].hout[1]];
  const BTN = [800, 33];
  let vis = false, kind = "arrow", keys = [[0, 0, 0]];
  if (t >= B(4) - 0.2 && t < B(6) + 0.1) {
    vis = true; kind = "pen";
    keys = [[B(4) - 0.2, 600, 980]];
    NT.forEach((nt, i) => { keys.push([nt - 0.04, ...n(i), E.io]); if (i < 4) keys.push([nt + 0.24, ...hd(i), E.out]); });
    const ca = [AB.x + creaseD.a[0], AB.y + creaseD.a[1]], cb = [AB.x + creaseD.b[0], AB.y + creaseD.b[1]];
    keys.push([B(5) + BT * 2 - 0.05, ...ca, E.io], [B(5) + BT * 3 - 0.05, ...cb, E.io], [B(6) + 0.1, 470, 760, E.io]);
  } else if (t >= B(6) + 0.1 && t < B(7)) {
    vis = true; kind = "text";
    keys = [[B(6) + 0.1, 470, 760], [B(6) + 0.25, AB.x + 300, AB.y + 380, E.out]];
    if (t > B(6) + 0.3) keys = [[B(6) + 0.3, AB.x + 300, AB.y + 380], [B(7), AB.x + 420, AB.y + 560, E.io]];
  } else if (t >= B(8) - 0.2 && t < hT + 0.5) {
    vis = true; kind = "arrow";
    keys = [[B(8) - 0.2, 520, 820], [hT - 0.08, ...BTN, E.io], [hT + 0.5, BTN[0] - 20, BTN[1] + 60, E.io]];
  } else if (t >= B(12) + 0.3 && t < B(14) + 0.4) {
    vis = true; kind = "wand";
    const cup = [TALL.x + 250, TALL.y + 370];
    keys = [[B(12) + 0.3, 760, 900], [sT - 0.06, ...cup, E.io], [B(13) + BT * 2 - 0.2, cup[0] + 20, cup[1] + 30], [B(14) + 0.4, 600, 1000, E.io]];
  } else if (t >= B(15) - 0.3 && t < cT + 0.5) {
    vis = true; kind = "arrow";
    keys = [[B(15) - 0.3, 600, 1000]];
    adjEls.forEach((a, i) => {
      const y = ADJY[i], x0 = WW - 236 + 14 + (236 - 28) * 0.5, x1 = WW - 236 + 14 + (236 - 28) * 0.8;
      keys.push([B(15) + i * BT, x0, y, E.io], [B(15) + i * BT + 0.4, x1, y, E.out5]);
    });
    keys.push([cT - 0.08, ...BTN, E.io], [cT + 0.5, BTN[0] - 20, BTN[1] + 60, E.io]);
  }
  const pos = cursor.set(t, keys, kind, vis);
  if (!vis) return;
  const clicks = [...NT, B(5) + BT * 2, B(6) + 0.25, hT, sT, cT];
  const c = clicks.find((c) => t >= c - 0.1 && t < c + 0.5);
  cursor.click(t, c ?? -9, pos[0], pos[1]);
}

// ---------- reveal (bars 2-3) and kinetic lines for the window scenes ----------
function sTexts(t) {
  if (t >= B(2) - 0.05 && t < B(2) + BT * 3 + 0.6) {
    T.r1.set(t, B(2) + 0.12, B(2) + BT * 3 - 0.15, { stagger: 0.09, from: 1.3, dir: 0, rise: 60, lift: 60 });
    // the amber screen slides up off the window
    show(awipe, true);
    const g = prog(t, B(2) - 0.05, B(2) + 0.3, E.expo), up = prog(t, B(2) + BT * 3 - 0.05, B(2) + BT * 3 + 0.45, E.expoIo);
    awipe.style.transform = `translate(0, ${(40 - up * 2700).toFixed(1)}px) scale(${lerp(0.04, 1, g).toFixed(4)})`;
  }
  T.r2.set(t, B(3) + 0.02, B(3) + BT - 0.12, { dur: 0.3, outDur: 0.14 });
  T.r3.set(t, B(3) + BT, B(3) + BT * 2 - 0.12, { dur: 0.3, outDur: 0.14 });
  T.r4.set(t, B(3) + BT * 2, B(4) - 0.3);
  T.v1.set(t, B(4) + 0.08, B(5) - 0.25);
  T.v2.set(t, B(5) + 0.05, B(6) - 0.25);
  T.v3.set(t, B(6) + 0.05, B(7) - 0.25);
  T.v4.set(t, B(7) + 0.05, B(8) - 0.3);
  T.h1.set(t, B(8) + 0.05, B(9) - 0.25);
  T.h2.set(t, B(9) + 0.05, B(10) - 0.25);
  T.h3.set(t, B(10) + 0.05, B(11) - 0.25);
  const g = { dur: 0.26, outDur: 0.12, from: 1.3, stagger: 0.05 };
  T.g1.set(t, B(11), B(11) + BT - 0.12, g); T.g2.set(t, B(11) + BT, B(11) + BT * 2 - 0.12, g);
  T.g3.set(t, B(11) + BT * 2, B(11) + BT * 3 - 0.12, g); T.g4.set(t, B(11) + BT * 3, B(12) - 0.3, g);
  T.gL.set(t, B(11) + 0.15, B(12) - 0.35, { stagger: 0.06 });
  T.c1.set(t, B(12) + 0.3, B(13) - 0.25);
  T.c2.set(t, B(13) + 0.05, B(13) + BT * 2 - 0.15);
  T.c3.set(t, B(13) + BT * 2, B(14) - 0.2);
  T.c4.set(t, B(14) + 0.05, B(14) + BT * 2 - 0.15);
  T.c5.set(t, B(14) + BT * 2, B(15) - 0.2);
  T.c6.set(t, B(15) + 0.05, B(16) - 0.35);
  T.b1.set(t, B(16) + 0.1, B(16) + BT * 2 - 0.15);
  T.b2.set(t, B(16) + BT * 2, B(17) - 0.25);
}

// ---------- bars 17-18: the campaign ----------
function sCampaign(t) {
  if (t < B(17) - 0.2 || t > B(19) + 0.1) return;
  PIECES.forEach((p, i) => place(p.e, (t) => {
    const a = B(17) + i * BT - 0.04, q = popIn(t, a, 0.62);
    if (t < a) return null;
    const dive = prog(t, B(19) - 0.42 + i * 0.03, B(19) - 0.02, E.expoIn);
    if (dive >= 1) return null;
    const [x, y, r] = p.slot;
    const drift = prog(t, B(18), B(19), E.lin);
    return { x: lerp(0, x, q) + bob(t, 8, 1.1, i) + (x > 0 ? 1 : -1) * drift * 30, y: lerp(40, y, q) + bob(t, 10, 1.3, i * 2), z: lerp(-200, 120, q) + dive * 900, s: lerp(0.15, 1, q), rz: r * q + (1 - q) * 30, ry: (1 - q) * (x > 0 ? -40 : 40) + bob(t, 4, 0.8, i), o: 1 - dive };
  }, t));
  const m = { dur: 0.3, outDur: 0.14, from: 1.3 };
  T.m1.set(t, B(17), B(17) + BT - 0.12, m); T.m2.set(t, B(17) + BT, B(17) + BT * 2 - 0.12, m);
  T.m3.set(t, B(17) + BT * 2, B(17) + BT * 3 - 0.12, m); T.m4.set(t, B(17) + BT * 3, B(18) - 0.12, m);
  T.m5.set(t, B(18) + 0.05, B(19) - 0.45);
  T.m6.set(t, B(18) + BT, B(19) - 0.45);
}

// ---------- bars 19-21: Vector. Pixel. One. -> the logo ----------
function sEnd(t) {
  if (t < B(19) - 0.05) return;
  const e = { dur: 0.3, outDur: 0.16, from: 1.4, stagger: 0.05 };
  T.e1.set(t, B(19) + 0.02, B(19) + BT - 0.14, e);
  T.e2.set(t, B(19) + BT, B(19) + BT * 2 - 0.14, e);
  T.e3.set(t, B(19) + BT * 2, B(20) - 0.3, { ...e, outDur: 0.2 });
  const up = prog(t, B(20) - 0.1, B(20) + 0.55, E.expoIo);
  place(endIcon, (t) => ({ y: lerp(30, -440, prog(t, B(20) - 0.1, B(20) + 0.55, E.expoIo)) + bob(t, 6, 1.1), s: lerp(1, 0.62, prog(t, B(20) - 0.1, B(20) + 0.55, E.expoIo)) * (1 + beatPulse(t) * 0.01), o: 1 }), t, 0);
  // build order: the pen curve (vector), the four squares (pixel), the red tile (one), then the full icon
  const curve = prog(t, B(19) + 0.05, B(19) + BT - 0.05, E.io);
  IC.curve.style.strokeDashoffset = (1 - curve).toFixed(4);
  IC.anchors.forEach((a, i) => { const q = popIn(t, B(19) + 0.05 + i * (BT - 0.15), 0.4); a.style.transform = `scale(${q.toFixed(3)})`; });
  IC.sq.forEach((s, i) => { const q = popIn(t, B(19) + BT + i * BT * 0.2, 0.4); s.style.transform = `scale(${q.toFixed(3)})`; });
  const slam = popIn(t, B(19) + BT * 2, 0.55);
  IC.rt.style.opacity = Math.min(1, slam * 4).toFixed(2);
  IC.rt.style.transform = `scale(${lerp(1.5, 1, slam).toFixed(3)})`;
  const asm = prog(t, B(19) + BT * 3, B(20) + 0.05, E.expoIo);
  IC.red.setAttribute("transform", `translate(${lerp(512, 760, asm).toFixed(2)} ${lerp(512, 760, asm).toFixed(2)}) scale(${lerp(1.55, 1, asm).toFixed(4)})`);
  IC.tile.style.opacity = asm.toFixed(3);
  IC.tile.style.transform = `scale(${lerp(0.4, 1, asm).toFixed(3)})`;
  const eg = prog(t, B(19) + BT * 3.4, B(20) + 0.25, E.out5);
  IC.eagle.style.opacity = eg.toFixed(3);
  IC.eagle.style.transform = `translate(${lerp(-120, 0, eg).toFixed(1)}px, ${lerp(60, 0, eg).toFixed(1)}px)`;
  const sp = prog(t, B(20) + 0.6, B(20) + 1.4, E.io);
  endShine.style.transform = `translateX(${lerp(-200, 700, sp).toFixed(0)}px) skewX(-20deg)`;
  endShine.style.opacity = sp > 0 && sp < 1 ? 1 : 0;
  // the lockup
  const tx = (o, a, y) => place(o, (t) => { const q = prog(t, a, a + 0.55, E.out5); if (t < a) return null; return { y: y + (1 - q) * 50, s: lerp(1.15, 1, q), o: q, blur: (1 - q) * 18 }; }, t, 0);
  tx(wordmark, B(20) + 0.1, -40);
  tx(endTag, B(20) + BT * 1.2, 190);
  tx(plat, B(20) + BT * 2, 330);
  tx(url, B(20) + BT * 2.8, 480);
  tx(soon, B(20) + BT * 3.4, 640);
  const by = wordmark.querySelector(".by"), qb = prog(t, B(20) + 0.4, B(20) + 0.9, E.out5);
  by.style.opacity = qb.toFixed(2); by.style.letterSpacing = lerp(30, 12, qb).toFixed(1) + "px";
}

function render(t) {
  pending.length = 0;
  hideAll();
  background(t);
  camera(t);
  sOld(t);
  sTexts(t);
  sWindow(t);
  sCampaign(t);
  sEnd(t);
  const wipeOn = pixelWipe(t, B(12)) || pixelWipe(t, B(19));
  $("#pw").style.display = wipeOn ? "" : "none";
  $("#fade").style.opacity = Math.max(prog(t, DURATION - 0.5, DURATION), 1 - prog(t, 0, 0.25)).toFixed(3);
  return Promise.all(pending);
}

window.DURATION = DURATION;
window.render = render;
window.ready = (async () => {
  for (const w of [600, 700, 800, 900]) await document.fonts.load(`${w} 50px Cairo`);
  for (const w of [500, 600, 700]) await document.fonts.load(`${w} 20px Inter`);
  await document.fonts.load("800 50px Barlow");
  await document.fonts.ready;
  canvases.forEach(drawLogoCanvas);
  // icon: the brand's own SVG, with its parts named so they can be built up
  const svgText = await (await fetch("assets/horix-one-icon.svg")).text();
  endIcon.insertAdjacentHTML("afterbegin", svgText);
  const isvg = endIcon.querySelector("svg");
  const [tileR] = isvg.querySelectorAll(":scope > rect"), [eagle, red] = isvg.querySelectorAll(":scope > g");
  const reds = red.querySelectorAll("rect");
  IC = { tile: tileR, eagle, red, rt: reds[0], sq: [...reds].slice(1, 5), anchors: [...reds].slice(5), curve: red.querySelector("path") };
  [IC.tile, IC.rt, ...IC.sq, ...IC.anchors].forEach((r) => { r.style.transformBox = "fill-box"; r.style.transformOrigin = "center"; });
  IC.curve.setAttribute("pathLength", 1); IC.curve.style.strokeDasharray = "1 1";
  Q(".sym").innerHTML = `<svg viewBox="80 260 700 480" width="44" height="44">${eagle.outerHTML}</svg>`;
  // the pixels the logo breaks into: 20px cells sampled from the drawn logo
  const c = document.createElement("canvas"); c.width = c.height = 560;
  const x = c.getContext("2d"); drawLogo(x, 1);
  const px = x.getImageData(0, 0, 560, 560).data;
  for (let gy = 0; gy < 28; gy++) for (let gx = 0; gx < 28; gx++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let yy = 0; yy < 20; yy++) for (let xx = 0; xx < 20; xx++) { const i = ((gy * 20 + yy) * 560 + gx * 20 + xx) * 4, al = px[i + 3]; r += px[i] * al; g += px[i + 1] * al; b += px[i + 2] * al; a += al; }
    if (a / (400 * 255) < 0.28) continue;
    const e = el("div", "cell", lift);
    e.style.background = `rgb(${(r / a) | 0},${(g / a) | 0},${(b / a) | 0})`;
    const k = CELLS.length, ang = Math.atan2(gy - 14, gx - 14) + (rnd(k, 1) - 0.5) * 1.2, dist = 220 + rnd(k, 2) * 520;
    CELLS.push({ e, x: gx * 20, y: gy * 20, dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist * 1.2, dz: 100 + rnd(k, 3) * 700, r: (rnd(k, 4) - 0.5) * 360, d: rnd(k, 5) });
  }
  // pill positions
  for (const [k, e] of [["v", psV], ["p", psP]]) PILLX[k] = { x: e.offsetLeft, w: e.offsetWidth };
  // marching ants path
  const ol = await (await fetch("assets/cup/outline.json")).json();
  [cParts.a1, cParts.a2].forEach((p) => p.setAttribute("d", ol.d));
  cParts.a1.setAttribute("stroke-linejoin", "round");
  Object.assign(cParts.a2.style, { stroke: "#111", strokeWidth: "5", strokeDasharray: "14 12" });
  [oldA, oldB, ...chips, ...PIECES.map((p) => p.e), wordmark, endTag, plat, url, soon].forEach((e) => { show(e, true); if (!e.classList.contains("old") && !e.classList.contains("fchip")) center(e); });
  PIECES.forEach((p) => { p.e.style.marginLeft = -p.w / 2 + "px"; p.e.style.marginTop = -p.h / 2 + "px"; });
  // slider rows in the Pixel panel (window coords)
  show(parts.pv, false); ADJY = adjEls.map((a) => 160 + a.b.parentNode.offsetTop + 3); show(parts.pv, true);
  await preload(["assets/cup/full.png", "assets/cup/cut.png", "assets/cup/logo.png"]);
  return true;
})();
