// SG MOTION helpers: brand tokens, easing, the 12-principles motion primitives and element builders.
// Loaded by a piece's comp.html. Everything is deterministic in t (seconds), so frames render in any order.
(function () {
  const K = {
    bg: '#0A0A0A', surface: '#151515', surface2: '#1C1C1C', red: '#C4321F', deep: '#7A1B12', org: '#FF8A1F',
    text: '#F6F3F2', text2: '#C7C9CD', light: '#F6F3F2', lightSurf: '#FFFFFF', ink: '#151515', ink2: '#5C5F66',
    SAFE: { x0: 86, x1: 994, y0: 192, y1: 1574 },
  };
  // ---------- easing (kit: cubic-bezier(.16,1,.3,1)) ----------
  function bezier(p1x, p1y, p2x, p2y) {
    const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx, cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
    const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t, dX = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const d = dX(t); if (Math.abs(d) < 1e-6) break; t -= (X(t) - x) / d; } return Y(Math.min(1, Math.max(0, t))); };
  }
  const ease = bezier(.16, 1, .3, 1);              // slow-in / slow-out (principle 6), the kit curve
  const easeIn = bezier(.5, 0, .75, 0);            // for exits / anticipation wind-up
  const inOut = bezier(.65, 0, .35, 1);
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lin = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const IN = .48, OUT = .32, STAG = .08;           // kit: 12f in, 8f out, 2f stagger @25fps

  // follow-through / overlapping action (principle 5): a tiny damped settle after the main move
  const settle = (q, amt) => q <= 0 ? 0 : q >= 1 ? 0 : amt * Math.sin(q * Math.PI * 2) * Math.exp(-q * 4);

  /** pose(t, o): the animated state of one element.
   *  o.at      entrance time;  o.out exit time (optional)
   *  o.dy/dx   entrance offset in px (kit 12-24px);  o.arc  curved path amount (principle 7)
   *  o.s0      start scale;  o.antic  anticipation dip before 'at' (principle 2)
   *  o.squash  squash/stretch on landing (principle 1), kept tiny (<=.04)
   *  o.follow  overshoot after landing (principle 5, <=.02);  o.dur  entrance length
   *  o.exitDy  exit drift.  Returns {o, x, y, s, sx, sy} */
  function pose(t, o) {
    const at = o.at, dur = o.dur || IN, outD = o.outDur || OUT;
    let k = ease(lin(t, at, at + dur)), op = clamp((t - at) / (dur * .55));
    let x = (o.dx || 0) * (1 - k), y = (o.dy ?? 18) * (1 - k), s = lerp(o.s0 ?? 1, 1, k), sx = 1, sy = 1;
    if (o.arc) x += o.arc * Math.sin(Math.PI * k) * (1 - k);
    if (o.antic && t < at && t > at - .14) { const a = easeIn(lin(t, at - .14, at)); s *= 1 - .025 * a; y += 4 * a; }
    if (o.follow) s *= 1 + settle(lin(t, at + dur * .55, at + dur * 1.6), o.follow);
    if (o.squash) { const q = lin(t, at + dur * .45, at + dur * .45 + .22); const sq = Math.sin(Math.PI * q) * o.squash; sx = 1 + sq; sy = 1 - sq; }
    if (t < at - (o.antic ? .14 : 0)) op = 0;
    if (o.out != null && t > o.out) { const e = easeIn(lin(t, o.out, o.out + outD)); op *= 1 - e; y += (o.exitDy ?? -12) * e; x += (o.exitDx || 0) * e; }
    return { o: op, x, y, s, sx, sy };
  }
  function apply(el, p, extra = '') {
    if (!el) return;
    el.style.opacity = p.o.toFixed(3);
    el.style.visibility = p.o <= .001 ? 'hidden' : 'visible';
    el.style.transform = `translate(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px) scale(${(p.s * p.sx).toFixed(4)},${(p.s * p.sy).toFixed(4)}) ${extra}`;
  }
  // masked word reveal: the word rises inside its own clip (kit "masked reveal"; whole words, never letters)
  function maskRise(el, t, at, out) {
    const k = ease(lin(t, at, at + IN)); const e = out != null ? easeIn(lin(t, out, out + OUT)) : 0;
    el.style.transform = `translateY(${((1 - k) * 160 + e * -160).toFixed(2)}%)`;   // 160%: fully below the vertical mask
    el.style.opacity = (t < at ? 0 : 1) * (1 - e);
  }

  // ---------- DOM builders ----------
  const $ = (tag, cls, parent, css, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; (parent || document.getElementById('stage')).appendChild(e); return e; };
  /** a line of whole words; each word masked separately so it can rise on its spoken time */
  function line(parent, words, css, cls = '') {
    const row = $('div', 'line ' + cls, parent, css);
    const ws = words.map(w => {
      const m = $('span', 'wm', row); const i = $('span', 'wi' + (w.c ? ' ' + w.c : ''), m, w.css || '', w.t);
      if (/^[A-Za-z0-9 .:/+%-]+$/.test(w.t)) { i.style.direction = 'ltr'; i.style.unicodeBidi = 'isolate'; }
      return { m, i, at: w.at, out: w.out };
    });
    return { row, ws };
  }
  function lineUpdate(L, t, out) { L.ws.forEach(w => maskRise(w.i, t, w.at, w.out ?? out)); }

  const ICON = {
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    gift: '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5C10 4 6 5 7.5 7.4 8.3 8.6 12 8.5 12 8.5zM12 8.5c2-4.5 6-3.5 4.5-1.1-.8 1.2-4.5 1.1-4.5 1.1z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    pen: '<path d="M14.5 4.5l5 5L9 20H4v-5z"/><path d="M12.5 6.5l5 5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    chat: '<path d="M20 15a3 3 0 0 1-3 3H9l-5 4V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  };
  const icon = (n, size = 40, color = 'currentColor', sw = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;

  window.SG = { K, bezier, ease, easeIn, inOut, clamp, lin, lerp, IN, OUT, STAG, settle, pose, apply, maskRise, $, line, lineUpdate, icon };
})();
