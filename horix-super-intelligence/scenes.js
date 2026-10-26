// HORIX SUPER INTELLIGENCE, 16:9 master. One function per scene; render(t) shows the scene whose
// [t0, t1) holds t. Real screenshots stay locked layers: they enter, cut and sit straight-on; all
// motion is on the backgrounds, type and external callouts (kit: 07_EDIT_AUDIO, MASTER_BRIEF).
const stage = $("#stage");
const SRC = (id) => (id[0] === "R" ? `assets/R/${id}.png` : `assets/G/${id}.png`);
const LABEL = { R01: "HORIX Home", R02: "HORIX workspace", R03: "Vectors Home", R05: "Light Home", R07: "Layout Home", R08: "Layout sample magazine", R09: "One · Vector", R10: "One · Pixel", R11: "Light sample", R13: "Vectors path" };
const S = {}; // built scenes by id
const entry = (t, a, d = F(12)) => prog(t, a, a + d, E.out);

function build() {
  for (const sc of SCENES) {
    const root = el("div", "scene", stage);
    const bg = el("div", "bg", root);
    bg.style.backgroundImage = `url(${SRC(sc.bg)})`;
    const o = { sc, root, bg };
    if (sc.shots) {
      o.name = el("div", "pname", root, `<i></i>${sc.name}`);
      o.card = el("div", "card", root);
      o.shots = sc.shots.map(([id, at]) => ({ id, at, box: Shot(o.card, id, SRC(id), LABEL[id]) }));
      o.hl = Headline(root, sc.copy, "podium");
    }
    S[sc.id] = o;
  }
  // S01: the falcon, and the line on the right half
  const s1 = S.S01;
  s1.hl = Headline(s1.root, "فكرتك تستاهل");
  css(s1.hl.line, { right: "150px", top: "330px", fontSize: "92px" });
  s1.hl2 = Headline(s1.root, "*تنطلق");
  css(s1.hl2.line, { right: "150px", top: "440px", fontSize: "150px" });
  s1.brand = el("div", "pname", s1.root, "HORIX");
  css(s1.brand, { left: "auto", right: "150px", top: "650px", fontSize: "40px" });
  s1.trail = el("div", "trail", s1.root);
  // S02: the official lockup (symbol, HORIX, descriptor) and the headline as its own layer
  const s2 = S.S02;
  s2.logo = el("div", "logo", s2.root, `<img src="assets/brand/horix-wordmark-dark.svg">`);
  css(s2.logo, { width: "560px", height: "558px", marginLeft: "-280px", top: "110px" });
  s2.hl = Headline(s2.root, SCENES[1].copy, "podium");
  css(s2.hl.line, { top: "720px", fontSize: "84px" });
  // S03: a labelled detail lens on the Layers panel of R02
  const s3 = S.S03;
  s3.lens = el("div", "lens", s3.card);
  const li = el("img", "", s3.lens); li.src = SRC("R02");
  s3.lensTag = el("div", "tag", s3.card, "تفصيلة مكبّرة · <bdi>Layers</bdi>");
  // S04: an outline frame around the path in R13
  const s4 = S.S04;
  s4.frm = el("div", "frm", s4.card);
  s4.frmTag = el("div", "tag", s4.card, "مسار مرسوم بالـ<bdi>Pen</bdi>");
  // S07: which persona is showing, and the badge
  const s7 = S.S07;
  s7.pill = el("div", "pill", s7.root);
  css(s7.pill, { right: "96px", top: "70px" });
  s7.badge = el("div", "badge", s7.card, SCENES[6].badge);
  css(s7.badge, { left: "18px", bottom: "18px" });
  // S08: the five family cards, the symbol and the campaign title
  const s8 = S.S08;
  s8.sym = el("div", "logo", s8.root, `<img src="assets/brand/horix-symbol-dark.svg">`);
  css(s8.sym, { width: "220px", height: "220px", marginLeft: "-110px", top: "90px" });
  s8.title = el("div", "title", s8.root, `HORIX <span>SUPER INTELLIGENCE</span>`);
  css(s8.title, { top: "330px" });
  s8.cards = FAMILY.map(([n, id]) => { const c = el("div", "fam", s8.root); Shot(c, id, SRC(id), n); el("div", "lab", c, n); return c; });
  // S09: lockup, campaign name, CTA
  const s9 = S.S09;
  s9.logo = el("div", "logo", s9.root, `<img src="assets/brand/horix-wordmark-dark.svg">`);
  css(s9.logo, { width: "430px", height: "428px", marginLeft: "-215px", top: "40px" });
  s9.si = el("div", "cta si", s9.root, "SUPER INTELLIGENCE"); s9.si.style.top = "478px";
  s9.hl = Headline(s9.root, SCENES[8].copy, "podium"); css(s9.hl.line, { top: "552px", fontSize: "80px" });
  s9.url = el("div", "cta url", s9.root, "horix.si"); s9.url.style.top = "668px";
  s9.sub = el("div", "cta sub", s9.root, SCENES[8].cta); s9.sub.style.top = "800px";
}

// background: slow push only (kit: up to ~4%), never on the screenshots
function bgPush(o, t, amt = 0.03) {
  const p = prog(t, o.sc.t0, o.sc.t1, E.lin);
  o.bg.style.transform = `scale(${(1 + amt * p).toFixed(4)})`;
}
// a product scene: name, card entry (12 frames, 24 px), hard cuts between shots, headline
function product(o, t, push = 0.015) {
  const { sc } = o;
  bgPush(o, t);
  const q = entry(t, sc.t0);
  o.name.style.opacity = entry(t, sc.t0 + F(4), F(8)).toFixed(3);
  o.name.style.transform = `translateX(${((1 - entry(t, sc.t0 + F(4), F(8))) * -24).toFixed(1)}px)`;
  const s = 1 + push * prog(t, sc.t0, sc.t1, E.lin);
  o.card.style.opacity = q.toFixed(3);
  o.card.style.transform = `translateY(${((1 - q) * 24).toFixed(1)}px) scale(${s.toFixed(4)})`;
  let cur = o.shots[0];
  for (const sh of o.shots) if (t >= sh.at) cur = sh;
  o.shots.forEach((sh) => show(sh.box, sh === cur));
  o.hl.set(t, sc.t0 + F(6), sc.t1 - F(6));
  return cur;
}

const SCENE_FN = {
  S01(o, t) {
    o.bg.style.transform = `scale(${(1 + 0.04 * prog(t, 0, 3, E.lin)).toFixed(4)})`;
    o.hl.set(t, F(6), null); o.hl2.set(t, F(12), null, { dur: F(8) });
    o.brand.style.opacity = entry(t, F(22), F(10)).toFixed(3);
    // the red trail crosses toward the cut at 2.7 s
    const p = prog(t, 2.55, 3.0, E.in);
    show(o.trail, p > 0);
    css(o.trail, { left: `${lerp(-400, 1920, p)}px`, top: "780px", width: "520px", opacity: (1 - prog(t, 2.9, 3)).toFixed(2) });
  },
  S02(o, t) {
    bgPush(o, t, 0.02);
    o.logo.style.opacity = prog(t, 3 + F(3), 3 + F(13), E.out).toFixed(3); // opacity reveal over 10 frames, then hold
    o.hl.set(t, 3 + F(14), 6 - F(6));
  },
  S03(o, t) {
    const cur = product(o, t);
    // lens on the Layers panel (R02 x 1000-1280, y 375-520), shown magnified 1.6x beside it
    const on = cur.id === "R02" && t >= 8.2 + F(18);
    show(o.lens, on); show(o.lensTag, on);
    if (on) {
      const q = entry(t, 8.2 + F(18), F(10)), k = 1.6, sx = 1000, sy = 375, w = 280, h = 145;
      css(o.lens, { left: `${1280 - w * k + 40}px`, top: `${sy - h * k - 30}px`, width: `${w * k}px`, height: `${h * k}px`, opacity: q.toFixed(3), transform: `translateY(${((1 - q) * 20).toFixed(1)}px)` });
      css(o.lens.firstChild, { transform: `translate(${-sx * k}px, ${-sy * k}px) scale(${k})` });
      css(o.lensTag, { left: `${1280 - w * k + 40}px`, top: `${sy - h * k - 80}px`, opacity: q.toFixed(3) });
    }
  },
  S04(o, t) {
    const cur = product(o, t);
    const on = cur.id === "R13" && t >= 13 + F(10);
    show(o.frm, on); show(o.frmTag, on);
    if (on) {
      const q = entry(t, 13 + F(10), F(10)), pad = 14 + (1 - q) * 30;
      css(o.frm, { left: `${370 - pad}px`, top: `${255 - pad}px`, width: `${252 + pad * 2}px`, height: `${205 + pad * 2}px`, opacity: q.toFixed(3) });
      css(o.frmTag, { left: `${370 - 14}px`, top: `${255 - 14 - 52}px`, opacity: q.toFixed(3) });
    }
  },
  S05(o, t) { product(o, t, 0.03); },
  S06(o, t) {
    const cur = product(o, t);
    // straight mask reveal for the magazine shot
    const m = cur.id === "R08" ? prog(t, 19.8, 19.8 + F(10), E.out) : 1;
    cur.box.style.clipPath = `inset(0 ${((1 - m) * 100).toFixed(2)}% 0 0)`;
  },
  S07(o, t) {
    const cur = product(o, t);
    o.pill.textContent = cur.id === "R09" ? "VECTOR" : "PIXEL";
    const q = entry(t, cur.at, F(8));
    o.pill.style.opacity = q.toFixed(3);
    o.badge.style.opacity = entry(t, 23 + F(16), F(8)).toFixed(3);
  },
  S08(o, t) {
    bgPush(o, t, 0.02);
    const q = entry(t, 28, F(12));
    o.cards.forEach((c, i) => {
      const x = (i - 2) * 340, y = 210;
      const fromX = (i - 2) * 520, fromY = 330;
      css(c, { transform: `translate(${lerp(fromX, x, q).toFixed(1)}px, ${lerp(fromY, y, q).toFixed(1)}px)`, opacity: q.toFixed(3) });
    });
    o.sym.style.opacity = entry(t, 28 + F(4), F(10)).toFixed(3);
    const tq = entry(t, 28 + F(10), F(10));
    o.title.style.opacity = tq.toFixed(3);
    o.title.style.transform = `translateY(${((1 - tq) * 24).toFixed(1)}px)`;
  },
  S09(o, t) {
    bgPush(o, t, 0.015);
    o.logo.style.opacity = entry(t, 31, F(8)).toFixed(3);
    o.si.style.opacity = entry(t, 31 + F(3), F(8)).toFixed(3);
    o.hl.set(t, 31 + F(4), null);
    o.url.style.opacity = entry(t, 31 + F(6), F(6)).toFixed(3); // the CTA is in before 31.4 s and holds to the end
    o.sub.style.opacity = entry(t, 31 + F(8), F(6)).toFixed(3);
  },
};

function render(t) {
  for (const sc of SCENES) {
    const o = S[sc.id], on = t >= sc.t0 && (t < sc.t1 || (sc.id === "S09" && t <= DURATION));
    show(o.root, on);
    if (on) SCENE_FN[sc.id](o, t);
  }
  return Promise.resolve();
}

window.DURATION = DURATION;
window.FPS = FPS;
window.render = render;
window.ready = (async () => {
  await Promise.all(["400 40px Cairo", "800 40px Cairo", "400 20px Inter", "600 20px Inter", "800 40px Barlow"].map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  const ids = new Set();
  SCENES.forEach((s) => { ids.add(s.bg); (s.shots || []).forEach(([id]) => ids.add(id)); });
  FAMILY.forEach(([, id]) => ids.add(id));
  await Promise.all([...ids].map((id) => probe(id, SRC(id))));
  build();
  await Promise.all([...document.images].map((im) => im.decode().catch(() => {})));
  return true;
})();
