// Deterministic motion helpers shared by every explainer page.
// A page defines window.SCENE = { setup(E), render(t, E) } and the renderer calls window.render(t).
(function () {
  const E = {};
  const $ = (s, r = document) => r.querySelector(s);
  E.$ = $;
  E.clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  E.k = (t, t0, t1) => E.clamp((t - t0) / (t1 - t0));
  E.easeOut = (x) => 1 - Math.pow(1 - x, 3);
  E.easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  E.back = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  E.lerp = (a, b, x) => a + (b - a) * x;
  E.events = [];
  E.ev = (t, type) => { E.events.push({ t: +t.toFixed(3), type }); return t; };

  // ---- timeline lookups
  E.init = (tl) => {
    E.tl = tl;
    E.lines = {};
    tl.lines.forEach((l) => (E.lines[l.id] = l));
    buildCaptions(tl);
  };
  E.L = (id) => { const l = E.lines[id]; return { start: l.start, end: l.start + l.dur }; };
  E.W = (id, i) => E.lines[id].words[i].s;

  // ---- captions: stable pages, words revealed in place (no reflow)
  function buildCaptions(tl) {
    const cap = $('#cap');
    E.pages = [];
    tl.lines.forEach((line, li) => {
      let page = [];
      const flush = () => { if (page.length) E.pages.push({ line: li, words: page }); page = []; };
      line.words.forEach((w, i) => {
        page.push(w);
        const bare = w.w.replace(/[»*]+$/, '');
        const end = /[.؟?!]$/.test(bare);               // sentence end: always break
        const soft = /[…:،,]$/.test(bare);              // clause end: break if the page has some words
        if (end || (soft && page.length >= 4) || page.length >= 8) flush();
      });
      flush();
    });
    E.pages.forEach((p, pi) => {
      const next = E.pages[pi + 1];
      const line = tl.lines[p.line];
      p.t0 = p.words[0].s - 0.08;
      p.t1 = next && next.line === p.line ? next.words[0].s - 0.08 : (next ? Math.min(next.words[0].s - 0.08, line.start + line.dur + 0.5) : line.start + line.dur + 0.5);
      const el = document.createElement('div');
      el.className = 'page';
      p.words.forEach((w) => {
        const s = document.createElement('span');
        s.className = 'w' + (w.hl ? ' hl' : '');
        s.textContent = w.w.replace(/[.،,]$/, '');
        el.appendChild(s);
        w.el = s;
      });
      cap.appendChild(el);
      p.el = el;
    });
  }
  E.captions = (t) => {
    E.pages.forEach((p) => {
      const on = t >= p.t0 && t < p.t1;
      p.el.style.display = on ? 'flex' : 'none';
      if (!on) return;
      const out = E.k(t, p.t1 - 0.12, p.t1);
      p.el.style.opacity = 1 - out;
      p.words.forEach((w) => {
        const x = E.k(t, w.s - 0.04, w.s + 0.12);
        w.el.style.opacity = x;
        w.el.style.transform = w.hl ? `scale(${E.lerp(0.6, 1, E.back(x))})` : `translateY(${(1 - E.easeOut(x)) * 14}px)`;
      });
    });
  };

  // ---- layers (screens inside the phone)
  // schedule: [{t, id, tr: 'app'|'push'|'back'|'fade'|'cut'}], sorted by t
  E.layers = (t, schedule, dur = 0.38) => {
    let cur = 0;
    schedule.forEach((s, i) => { if (t >= s.t) cur = i; });
    const now = schedule[cur], prev = schedule[cur - 1];
    const x = now.tr === 'cut' || !prev ? 1 : E.easeInOut(E.k(t, now.t, now.t + dur));
    document.querySelectorAll('#screen .layer').forEach((el) => { el.style.display = 'none'; el.style.zIndex = 1; });
    const show = (id, z) => { const el = document.getElementById(id); el.style.display = 'block'; el.style.zIndex = z; return el; };
    const a = show(now.id, 3);
    a.style.opacity = 1; a.style.transform = 'none'; a.style.filter = 'none';
    if (x < 1 && prev && prev.id !== now.id) {
      const b = show(prev.id, 2);
      b.style.opacity = 1; b.style.transform = 'none'; b.style.filter = 'none';
      if (now.tr === 'app') {
        a.style.opacity = x; a.style.transform = `scale(${E.lerp(0.9, 1, x)})`;
        b.style.transform = `scale(${E.lerp(1, 1.06, x)})`; b.style.filter = `brightness(${1 - 0.5 * x})`;
      } else if (now.tr === 'push') {           // forward navigation (RTL apps slide in from the left)
        a.style.transform = `translateX(${(x - 1) * 100}%)`;
        b.style.transform = `translateX(${x * 30}%)`; b.style.filter = `brightness(${1 - 0.35 * x})`;
      } else if (now.tr === 'back') {
        a.style.transform = `translateX(${(1 - x) * 30}%)`; a.style.filter = `brightness(${0.65 + 0.35 * x})`;
        b.style.zIndex = 4; b.style.transform = `translateX(${-x * 100}%)`;
      } else {
        a.style.opacity = x;
      }
    }
    return { id: now.id, since: t - now.t };
  };

  // ---- element centre in screen coordinates (390x844 space)
  E.pos = (sel) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    const sr = $('#screen').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const s = sr.width / 390;
    return { x: (r.left + r.width / 2 - sr.left) / s, y: (r.top + r.height / 2 - sr.top) / s, w: r.width / s, h: r.height / s };
  };

  // ---- finger taps: [{t, sel}]
  E.taps = (t, taps) => {
    const f = $('#finger'), rp = $('#ripple');
    f.style.opacity = 0; rp.style.opacity = 0;
    for (const tap of taps) {
      if (t < tap.t - 0.5 || t > tap.t + 0.45) continue;
      const p = E.pos(tap.sel);
      const inX = E.easeOut(E.k(t, tap.t - 0.5, tap.t - 0.12));
      const press = t >= tap.t - 0.06 && t < tap.t + 0.1 ? 0.82 : 1;
      f.style.left = p.x + (1 - inX) * 40 + 'px';
      f.style.top = p.y + (1 - inX) * 60 + 'px';
      f.style.opacity = Math.min(inX, 1 - E.k(t, tap.t + 0.2, tap.t + 0.45));
      f.style.transform = `scale(${press})`;
      const r = E.k(t, tap.t, tap.t + 0.45);
      if (t >= tap.t) {
        rp.style.left = p.x + 'px'; rp.style.top = p.y + 'px';
        rp.style.opacity = 1 - r; rp.style.transform = `scale(${1 + r * 1.6})`;
      }
    }
  };

  // ---- camera on the phone: [{t0, t1, sel|x,y, s}] zoom in over 0.45s from t0, hold, snap or ease back at t1
  E.camera = (t, segs, base) => {
    let s = 1, fx = 195, fy = 422, x = 0;
    for (const g of segs) {
      if (t < g.t0 || t > g.t1 + (g.out || 0)) continue;
      const p = g.sel ? E.pos(g.sel) : { x: g.x, y: g.y };
      x = E.easeInOut(E.k(t, g.t0, g.t0 + (g.in || 0.45)));
      if (g.out && t > g.t1) x *= 1 - E.easeInOut(E.k(t, g.t1, g.t1 + g.out));
      s = E.lerp(1, g.s || 1.16, x);
      fx = p.x; fy = p.y;
    }
    const S = base.scale, top = base.top || 24, cx = 540, cy = base.cy || 590, pull = base.pull ?? 0.6;
    // where the focus point sits with no zoom, and where we want it (drifting toward the frame centre)
    const bx = cx + (fx + 12 - 207) * S, by = top + (fy + 12) * S;
    const wx = E.lerp(bx, cx, pull * x), wy = E.lerp(by, cy, pull * x);
    const dx = wx - (cx + (fx + 12 - 207) * S * s);
    const dy = wy - (top + (fy + 12) * S * s);
    $('#phoneWrap').style.transform = `translate(${dx}px, ${dy}px) scale(${S * s})`;
    return s;
  };

  window.E = E;
  window.render = (t) => window.SCENE.render(t, E);
  window.setup = (tl) => { E.init(tl); window.SCENE.setup(E); return { events: E.events, total: tl.total }; };
})();
