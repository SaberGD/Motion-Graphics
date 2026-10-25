// Motion engine (from the El Behery promo, scenes-v2/engine2.js; same 88 BPM bar grid so its music cut fits). Every frame is a pure function of t (seconds): render(t) sets styles and
// the capture script screenshots it. Objects get a pose function; motion blur comes from the
// difference between the pose at t and one frame earlier.
const BEAT = 60 / 88, BAR = BEAT * 4, OFF = -0.077, FPS_DT = 1 / 60;
const B = (n) => OFF + n * BAR; // start of bar n
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const E = {
  lin: (p) => p,
  out: (p) => 1 - Math.pow(1 - p, 3),
  out5: (p) => 1 - Math.pow(1 - p, 5),
  in: (p) => p * p * p,
  in2: (p) => p * p,
  io: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  expo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  expoIn: (p) => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10)),
  expoIo: (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2),
  back: (p) => { const c = 1.9, c3 = c + 1; return 1 + c3 * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
  // damped spring, settles by p=1
  spring: (p) => (p >= 1 ? 1 : 1 - Math.exp(-6.5 * p) * Math.cos(11 * p)),
};
const prog = (t, a, b, e = E.lin) => e(clamp((t - a) / (b - a)));
function K(t, keys, defEase = E.io) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const p = (e || defEase)(clamp((t - t0) / (t1 - t0)));
      return Array.isArray(v0) ? v0.map((a, j) => lerp(a, v1[j], p)) : lerp(v0, v1, p);
    }
  }
  return keys[keys.length - 1][1];
}
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
const pending = [];
const imgCache = new Map();
function preload(list) {
  return Promise.all(list.map((src) => {
    if (!imgCache.has(src)) { const im = new Image(); im.src = src; imgCache.set(src, im.decode().catch(() => {})); }
    return imgCache.get(src);
  }));
}
function setSrc(img, src) {
  if (img.dataset.src === src) return;
  img.dataset.src = src; img.src = src;
  pending.push(img.decode().catch(() => {}));
}

// ---------- objects with poses ----------
// pose: {x, y, z, s, rx, ry, rz, o, blur}
function tf(p) {
  return `translate3d(${(p.x || 0).toFixed(2)}px, ${(p.y || 0).toFixed(2)}px, ${(p.z || 0).toFixed(1)}px) rotateX(${(p.rx || 0).toFixed(2)}deg) rotateY(${(p.ry || 0).toFixed(2)}deg) rotateZ(${(p.rz || 0).toFixed(2)}deg) scale(${(p.s ?? 1).toFixed(4)})`;
}
// Apply pose fn at t, with velocity-based blur.
function place(e, fn, t, mb = 1) {
  const p = fn(t);
  if (!p || (p.o ?? 1) <= 0.002) { show(e, false); return null; }
  show(e, true);
  let blur = p.blur || 0;
  if (mb) {
    const q = fn(t - FPS_DT) || p;
    const dx = (p.x || 0) - (q.x || 0), dy = (p.y || 0) - (q.y || 0);
    const ds = ((p.s ?? 1) - (q.s ?? 1)) * 500;
    const dr = ((p.ry || 0) - (q.ry || 0)) * 6 + ((p.rx || 0) - (q.rx || 0)) * 6 + ((p.rz || 0) - (q.rz || 0)) * 6;
    blur += Math.min(16, Math.hypot(dx, dy, ds, dr) * 0.12 * mb);
  }
  e.style.transform = tf(p);
  e.style.opacity = (p.o ?? 1).toFixed(3);
  e.style.filter = blur > 0.25 ? `blur(${blur.toFixed(2)}px)` : "none";
  return p;
}

// ---------- typing ----------
// Smooth typing: chars appear at a steady rate, the newest char fades in; caret blinks when idle.
function Typer(e, opts = {}) {
  const span = el("span", "typed", e);
  const ghost = el("span", "typed-last", e);
  const caret = el("span", "caret", e);
  return {
    set(t, text, t0, cps = 16, hideCaretAfter = Infinity) {
      const f = (t - t0) * cps;
      const n = clamp(Math.floor(f), 0, text.length);
      const frac = f - Math.floor(f);
      span.textContent = text.slice(0, n);
      // fade the next char in for smoothness (only while typing)
      ghost.textContent = n < text.length && f > 0 ? text.slice(n, n + 1) : "";
      ghost.style.opacity = (frac * 0.9).toFixed(2);
      const typing = f > 0 && f < text.length;
      const blink = typing ? 1 : (Math.floor((t - t0) * 2.2) % 2 === 0 ? 1 : 0);
      caret.style.opacity = t < t0 - 0.6 || t > hideCaretAfter ? 0 : blink;
      return n >= text.length;
    },
  };
}

// ---------- counter ----------
const fmt = (n) => Math.round(n).toLocaleString("en-US");

// ---------- kinetic text ----------
// Words blur in one after another; *word = amber.
function Words(parent, text, cls = "") {
  const line = el("div", "kline " + cls, parent);
  const words = text.split(" ").map((w) => el("span", "kword" + (w.startsWith("*") ? " hl" : ""), line, w.replace(/^\*/, "")));
  return {
    line, words,
    set(t, inT, outT, o = {}) {
      const st = o.stagger ?? 0.075, dur = o.dur ?? 0.42, od = o.outDur ?? 0.28;
      const vis = t >= inT - 0.01 && t < outT + od + 0.01;
      show(line, vis);
      if (!vis) return false;
      const lp = o.pose ? o.pose(t) : null;
      if (lp) line.style.transform = tf(lp);
      words.forEach((w, i) => {
        const p = prog(t, inT + i * st, inT + i * st + dur, E.out5);
        const q = prog(t, outT + (o.outStagger ? i * 0.04 : 0), outT + od, E.in);
        const blur = (1 - p) * 26 + q * 26;
        const dir = o.dir ?? 1;
        const dx = (1 - p) * -90 * dir + q * 120 * dir;
        const dy = (1 - p) * (o.rise ?? 0) - q * (o.lift ?? 0);
        const sc = lerp(o.from ?? 1.35, 1, p) * lerp(1, 0.9, q);
        w.style.opacity = (p * (1 - q)).toFixed(3);
        w.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
        w.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${sc.toFixed(3)})`;
      });
      return true;
    },
  };
}

// ---------- particles burst ----------
function Burst(parent, n = 14, cls = "spark") {
  const box = el("div", "burst", parent);
  const ps = Array.from({ length: n }, (_, i) => ({ e: el("i", cls, box), a: (i / n) * Math.PI * 2 + (i % 3) * 0.3, r: 90 + (i * 37) % 110, s: 0.6 + ((i * 53) % 10) / 12 }));
  return {
    box,
    set(t, t0, x, y, dur = 0.7) {
      const vis = t >= t0 && t < t0 + dur;
      show(box, vis);
      if (!vis) return;
      box.style.left = x + "px"; box.style.top = y + "px";
      const p = prog(t, t0, t0 + dur, E.out5), f = 1 - prog(t, t0 + dur * 0.4, t0 + dur, E.lin);
      ps.forEach(({ e, a, r, s }) => {
        e.style.transform = `translate(${(Math.cos(a) * r * p).toFixed(1)}px, ${(Math.sin(a) * r * p).toFixed(1)}px) rotate(${(a * 57 + p * 90).toFixed(0)}deg) scale(${(s * (1 - p * 0.6)).toFixed(2)})`;
        e.style.opacity = f.toFixed(2);
      });
    },
  };
}

// ---------- desktop cursor ----------
// kind: arrow | pen | text | wand. Moves along keys [[t, x, y], ...] in window-local px; click(t0) presses.
const CURSORS = {
  arrow: `<svg viewBox="0 0 24 24" width="44" height="44"><path d="M4 2.5 4 19.5 8.6 15.4 11.6 22 14.6 20.7 11.7 14.2 18 14.2Z" fill="#F3EFE8" stroke="#0E0E0F" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  pen: `<svg viewBox="0 0 24 24" width="48" height="48" style="transform:translate(-4px,-4px)"><path d="M3 3 13.5 6.5 17.5 15 15 17.5 6.5 13.5Z" fill="#F3EFE8" stroke="#0E0E0F" stroke-width="1.3" stroke-linejoin="round"/><path d="M3 3 9.3 9.3" stroke="#0E0E0F" stroke-width="1.3"/><circle cx="10.2" cy="10.2" r="1.5" fill="#0E0E0F"/><path d="M15.5 17.6 21 23 23 21 17.6 15.5" fill="#F3EFE8" stroke="#0E0E0F" stroke-width="1.3"/></svg>`,
  text: `<svg viewBox="0 0 24 24" width="44" height="44" style="transform:translate(-22px,-22px)"><path d="M8 3h3l1 1 1-1h3M12 4v16M8 21h3l1-1 1 1h3M10 12h4" fill="none" stroke="#0E0E0F" stroke-width="3.4" stroke-linecap="round"/><path d="M8 3h3l1 1 1-1h3M12 4v16M8 21h3l1-1 1 1h3M10 12h4" fill="none" stroke="#F3EFE8" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  wand: `<svg viewBox="0 0 24 24" width="50" height="50"><path d="M3 3 6 4.2 4.2 6Z" fill="#EA993F"/><path d="M5 5 21 21" stroke="#0E0E0F" stroke-width="4.4" stroke-linecap="round"/><path d="M5 5 21 21" stroke="#F3EFE8" stroke-width="2.4" stroke-linecap="round"/><path d="M9 1.5v3M1.5 9h3M3.2 3.2l1.5 1.5" stroke="#EA993F" stroke-width="1.6" stroke-linecap="round"/></svg>`,
};
function Cursor(parent) {
  const e = el("div", "cursor", parent);
  const ring = el("div", "cring", parent);
  let kind = "";
  return {
    set(t, keys, k = "arrow", vis = true) {
      show(e, vis);
      if (!vis) { show(ring, false); return; }
      if (k !== kind) { kind = k; e.innerHTML = CURSORS[k]; }
      const [x, y] = K(t, keys.map(([tt, x, y, ea]) => [tt, [x, y], ea]));
      e.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      return [x, y];
    },
    // a click: the cursor dips and a ring expands at its tip
    click(t, t0, x, y) {
      const vis = t >= t0 - 0.1 && t < t0 + 0.5;
      show(ring, vis);
      const press = t >= t0 - 0.08 && t < t0 + 0.12;
      e.style.scale = press ? "0.86" : "1";
      if (!vis) return;
      const p = prog(t, t0, t0 + 0.5, E.out5);
      css(ring, { left: x + "px", top: y + "px", opacity: (1 - p).toFixed(2), transform: `translate(-50%,-50%) scale(${lerp(0.3, 1.6, p).toFixed(3)})` });
    },
  };
}
// press-and-release scale for buttons clicked at t0
const pressK = (t, t0, d = 0.08) => (t < t0 ? 1 - prog(t, t0 - 0.1, t0) * d : lerp(1 - d, 1, prog(t, t0, t0 + 0.35, E.spring)));
