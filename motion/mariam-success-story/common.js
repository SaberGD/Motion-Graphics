// Shared helpers for the Mariam success-story options (A / B / C): phrase lines with word-timed masked rises, auto-fit,
// image layers, chips, readiness. Every option reads the same VO word times (story.js) and the same mix.
(function () {
  const { $, maskRise, ease, easeIn, lin, clamp, lerp } = SG;
  const A = 'assets/', LOGO = '../../brand-kit/assets/logos/saber-group-wordmark.png';
  const IMG = { quote: A + 'chat_jul_first.png', ex1: A + 'ex1_building.jpg', ex2: A + 'ex2_cutout.jpg', ex3: A + 'ex3_moon.jpg',
    p1: A + 'poster_discover.jpg', p2: A + 'poster_mood.jpg', p3: A + 'poster_presence.jpg', p4: A + 'poster_citrus.jpg', p5: A + 'poster_ice.jpg',
    fb: A + 'chat_oct_feedback.png', grid: A + 'chat_oct_grid.png',
    lip: A + 'work_lipstick.png', fbY: A + 'fb_yasmin.png', fbF: A + 'fb_followup.png', fbS: A + 'fb_sami.png',
    me: A + 'mariam_photo_bright.jpg', meS: A + 'mariam_photo_selfie.jpg' };   // her own photos: shown with her consent
  const PH = {}; MS.PH.forEach(p => PH[p.k] = p);
  const FITS = [];
  /** a centred phrase line of whole words; each word masked vertically and rising on its spoken time */
  function phraseLine(parent, p, o = {}) {
    const row = $('div', 'pl', parent, `top:${o.y ?? 860}px;font-size:${o.size || 96}px;color:${o.color || '#F6F3F2'};${o.wrap ? 'flex-wrap:wrap;align-content:center;row-gap:0;' : ''}${o.css || ''}`);
    const list = p.w || p;
    const ws = list.map(([t, at, f]) => {
      const m = $('span', 'wm', row), i = $('span', 'wi', m, '', t.replace(/[ً-ْ]/g, ''));
      if (/^[A-Za-z0-9 .:/+%-]+$/.test(t)) { i.style.direction = 'ltr'; i.style.unicodeBidi = 'isolate'; }
      if (f === 'k' && o.key) i.style.color = o.key;
      return { m, i, at, f };
    });
    FITS.push({ row, max: o.size || 96, maxW: o.maxW || 908, wrap: o.wrap, lines: o.lines || 2, yc: o.center ? (o.y ?? 860) : null });
    return { row, ws, p };
  }
  function fitAll() {
    FITS.forEach(F => { let fs = F.max; F.row.style.fontSize = fs + 'px'; const d = F.row.style.display; F.row.style.visibility = 'hidden'; F.row.style.display = 'flex';
      const tooBig = () => F.row.scrollWidth > F.maxW + 1 || (F.wrap && F.row.scrollHeight > fs * 1.25 * F.lines + fs * .5);
      while (tooBig() && fs > 34) { fs -= 3; F.row.style.fontSize = fs + 'px'; }
      if (F.yc != null) F.row.style.top = (F.yc - F.row.offsetHeight / 2) + 'px';
      F.row.style.visibility = ''; F.row.style.display = d; });
  }
  const words = (L, t, out) => L.ws.forEach(w => maskRise(w.i, t, w.at, out));
  /** show a line only around its phrase, words rise on their times, the whole line leaves at `out` */
  function phrase(U, parent, key, o = {}) {
    const p = PH[key], L = phraseLine(parent, p, o), out = o.out ?? (p.next != null ? p.next - .12 : null);
    U.push(t => { const v = t >= p.t0 - .3 && (out == null || t < out + .4); L.row.style.display = v ? 'flex' : 'none'; if (v) words(L, t, out); });
    return L;
  }
  const img = (parent, src, css, cls = 'abs') => { const i = $('img', cls, parent, css); i.src = src; return i; };
  function ready() {
    return Promise.all([document.fonts.load('700 60px Cairo'), document.fonts.load('500 40px Cairo'), document.fonts.load('60px Bebas'),
      ...[...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))]).then(() => document.fonts.ready).then(fitAll);
  }
  // envelope helper: 0 → 1 over [a, a+IN], back to 0 over [b, b+OUT]
  const env = (t, a, b, i = SG.IN, o = SG.OUT) => ease(lin(t, a, a + i)) * (b == null ? 1 : 1 - easeIn(lin(t, b, b + o)));
  window.MO = { LOGO, IMG, PH, phraseLine, phrase, fitAll, words, img, ready, env };
})();
