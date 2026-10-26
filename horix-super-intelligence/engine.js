// Motion helpers. Every frame is a pure function of t (seconds): render(t) sets styles and the
// render script screenshots it. Same idiom as horix-one-promo/engine.js, without the beat grid
// (this film's cuts come from timeline.js).
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const E = {
  lin: (p) => p,
  out: (p) => 1 - Math.pow(1 - p, 3), // cubic ease-out: the kit's entry curve
  in: (p) => p * p * p,
  io: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
};
const prog = (t, a, b, e = E.lin) => e(clamp((t - a) / (b - a)));
const F = (n) => n / 30; // frames to seconds
const $ = (s, r = document) => r.querySelector(s);
function el(tag, cls, parent, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  (parent || document.body).appendChild(e);
  return e;
}
const css = (e, o) => { for (const k in o) e.style[k] = o[k]; };
const show = (e, on) => { const v = on ? "" : "none"; if (e.style.display !== v) e.style.display = v; };

// ---------- images ----------
// Missing assets (screenshots not delivered yet) render as a labelled placeholder, never as a fake UI.
const ASSET_OK = {};
async function probe(id, src) {
  const im = new Image(); im.src = src;
  try { await im.decode(); ASSET_OK[id] = true; } catch { ASSET_OK[id] = false; }
}
function Shot(parent, id, src, label) {
  const box = el("div", "shot", parent);
  if (ASSET_OK[id]) el("img", "", box).src = src;
  else el("div", "ph", box, `<b>${id}</b><span>${label}</span><small>placeholder: real screenshot pending</small>`);
  return box;
}

// ---------- headline (Arabic, RTL) ----------
// Words rise in over `dur`, one after another; *word = Horix Red.
function Headline(parent, text, cls = "") {
  const line = el("div", "hl " + cls, parent);
  // a Latin run (joined with no-break spaces) stays one span, so it keeps its own order inside RTL
  const words = text.split(" ").map((w) => el("span", "w" + (w.startsWith("*") ? " em" : ""), line, `<bdi>${w.replace(/^\*/, "")}</bdi>`));
  return {
    line,
    set(t, inT, outT, o = {}) {
      const st = o.stagger ?? F(2), dur = o.dur ?? F(8), od = o.outDur ?? F(6);
      const vis = t >= inT && (outT == null || t < outT + od);
      show(line, vis);
      if (!vis) return;
      words.forEach((w, i) => {
        const p = prog(t, inT + i * st, inT + i * st + dur, E.out);
        const q = outT == null ? 0 : prog(t, outT, outT + od, E.in);
        w.style.opacity = (p * (1 - q)).toFixed(3);
        w.style.transform = `translateY(${((1 - p) * 28 - q * 16).toFixed(1)}px)`;
      });
    },
  };
}
