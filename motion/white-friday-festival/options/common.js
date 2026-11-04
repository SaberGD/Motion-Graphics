// Shared helpers for the White Friday design options: phrase lines, auto-fit, chrome, readiness.
(function () {
  const { $, maskRise, ease, easeIn, lin, clamp } = SG;
  const LOGO = '../../../brand-kit/assets/logos/saber-group-wordmark.png';
  const FITS = [];
  /** a centred phrase line of whole words (each masked vertically, rising on its spoken time) */
  function phraseLine(parent, p, o = {}) {
    const row = $('div', 'pl', parent, `top:${o.y ?? 860}px;font-size:${o.size || 120}px;color:${o.color || '#F6F3F2'};${o.wrap ? 'flex-wrap:wrap;align-content:center;row-gap:0;' : ''}${o.css || ''}`);
    const ws = p.w.map(([t, at, f]) => {
      const m = $('span', 'wm', row), i = $('span', 'wi' + (f === 'k' ? ' key' : '') + (f === 's' ? ' st' : ''), m, '', t);
      if (/^[A-Za-z0-9 .:/+%-]+$/.test(t)) { i.style.direction = 'ltr'; i.style.unicodeBidi = 'isolate'; }
      return { m, i, at, f };
    });
    FITS.push({ row, max: o.size || 120, maxW: o.maxW || 908, wrap: o.wrap, lines: o.lines || 2, yc: o.center ? (o.y ?? 860) : null });
    return { row, ws, p };
  }
  // shrink a line's font size until it fits the safe width (never grows past its design size)
  function fitAll() {
    FITS.forEach(F => { let fs = F.max; F.row.style.fontSize = fs + 'px'; F.row.style.visibility = 'hidden'; F.row.style.display = 'flex';
      const tooBig = () => F.row.scrollWidth > F.maxW + 1 || (F.wrap && F.row.scrollHeight > fs * 1.2 * F.lines + fs * .5);
      while (tooBig() && fs > 36) { fs -= 4; F.row.style.fontSize = fs + 'px'; }
      if (F.yc != null) F.row.style.top = (F.yc - F.row.offsetHeight / 2) + 'px';          // keep the block centred on its y
      F.row.style.visibility = ''; });
  }
  const words = (L, t, out) => L.ws.forEach(w => maskRise(w.i, t, w.at, out));
  function ready() {
    return Promise.all([document.fonts.load('700 60px Cairo'), document.fonts.load('500 40px Cairo'), document.fonts.load('60px Bebas'),
      ...[...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))]).then(() => document.fonts.ready).then(fitAll);
  }
  window.OPT = { LOGO, phraseLine, fitAll, words, ready };
})();
