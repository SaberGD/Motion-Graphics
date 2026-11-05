// Shared helpers for the Mariam success-story options (A / B / C): phrase lines with word-timed masked rises, auto-fit,
// image layers, chips, readiness. Every option reads the same VO word times (story.js) and the same mix.
(function () {
  const { $, maskRise, ease, easeIn, lin, clamp, lerp } = SG;
  const A = 'assets/', LOGO = '../../brand-kit/assets/logos/saber-group-wordmark.png';
  const IMG = { quote: A + 'chat_jul_first.png', ex1: A + 'ex1_building.jpg', ex2: A + 'ex2_cutout.jpg', ex3: A + 'ex3_moon.jpg',
    p1: A + 'poster_discover.jpg', p2: A + 'poster_mood.jpg', p3: A + 'poster_presence.jpg', p4: A + 'poster_citrus.jpg', p5: A + 'poster_ice.jpg',
    fb: A + 'chat_oct_feedback.png', grid: A + 'chat_oct_grid.png',
    lip: A + 'work_lipstick.png', fbY: A + 'fb_yasmin.png', fbF: A + 'fb_followup.png', fbS: A + 'fb_sami.png',
    me: A + 'mariam_photo_bright.jpg', post: A + 'fb_post_mastery.png', meS: A + 'mariam_photo_selfie.jpg' };   // her own photos: shown with her consent
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

  // the «Free access» insert: the rest of the timeline freezes at T0 for D seconds, then resumes (shifted by D)
  const map = t => t < MS.T0 ? t : t < MS.T0 + MS.D ? MS.T0 : t - MS.D;
  /** the reward scene (real time): her photo, «مريم ليها», a course ticket FREE ACCESS · MASTERY LEVEL (+ the Arabic level line),
   *  «مبروك يا مريم!» with confetti. Its own full background and chrome, so whatever is frozen underneath never shows. */
  function reward(parent, dark, hide = []) {
    const G = MS.GIFT, T0 = MS.T0, T1 = MS.T0 + MS.D, { pose, apply, icon } = SG, U2 = [];
    const ink = dark ? '#F6F3F2' : '#151515', sub = dark ? '#C7C9CD' : '#5C5F66', pageBg = dark ? '#0A0A0A' : '#F6F3F2';
    const R = $('div', 'abs', parent, `inset:0;z-index:60;background:${pageBg};overflow:hidden`);
    $('div', 'abs', R, `inset:0;background-size:72px 72px;background-image:linear-gradient(${dark ? 'rgba(246,243,242,.03)' : 'rgba(21,21,21,.035)'} 1px,transparent 1px),linear-gradient(90deg,${dark ? 'rgba(246,243,242,.03)' : 'rgba(21,21,21,.035)'} 1px,transparent 1px)`);
    if (dark) $('div', 'abs', R, 'inset:0;background:radial-gradient(ellipse 90% 70% at 50% 50%,transparent 58%,rgba(122,27,18,.3) 100%)');
    // chrome (same places as the options)
    $('div', 'abs', R, 'left:86px;top:192px;width:46px;height:46px;border:solid #C4321F;border-width:4px 0 0 4px'); $('div', 'abs', R, 'right:86px;top:1528px;width:46px;height:46px;border:solid #C4321F;border-width:0 4px 4px 0');
    const lp = $('div', 'abs', R, `left:400px;top:196px;width:280px;height:70px;border-radius:12px;display:grid;place-items:center;${dark ? '' : 'background:#151515'}`); img(lp, LOGO, 'position:static;width:236px', '');
    $('div', 'abs', R, 'left:86px;top:1506px;font-size:30px;font-weight:500;line-height:40px;color:' + sub + ';direction:ltr', 'sabergroupacademy.com');
    $('div', 'abs', R, 'right:150px;top:1506px;font-size:32px;color:#C4321F;direction:ltr;font-family:Bebas', 'SABER GROUP ACADEMY');
    // (no photo here: the success scene just before already shows her)
    const L1 = phraseLine(R, G.name, { y: 470, size: 76, color: ink, key: '#C4321F', center: true });
    // the ticket
    const tk = $('div', 'abs', R, `left:130px;right:130px;top:570px;height:480px;border-radius:30px;background:#151515;${dark ? 'border:3px solid #C4321F;' : ''}box-shadow:0 26px 70px rgba(21,21,21,${dark ? .5 : .22});overflow:hidden`);
    $('div', 'abs', tk, 'left:0;right:0;top:0;height:12px;background:linear-gradient(90deg,#7A1B12,#C4321F,#FF8A1F)');
    const f1 = $('div', 'abs', tk, 'left:0;right:0;top:44px;text-align:center;font-family:Bebas;font-size:156px;line-height:1;color:#FF8A1F;direction:ltr', 'FREE ACCESS');
    const cut = $('div', 'abs', tk, 'left:40px;right:40px;top:232px;border-top:4px dashed rgba(246,243,242,.22)');
    [0, 1].forEach(i => $('div', 'abs', tk, `${i ? 'right' : 'left'}:-34px;top:200px;width:68px;height:68px;border-radius:50%;background:${pageBg}`));
    const f2 = $('div', 'abs', tk, 'left:0;right:0;top:262px;text-align:center;font-family:Bebas;font-size:104px;line-height:1;color:#F6F3F2;direction:ltr', 'MASTERY LEVEL');
    const L2 = phraseLine(tk, G.sub, { y: 400, size: 40, color: '#C7C9CD', key: '#FF8A1F', center: true, maxW: 760, css: 'left:30px;right:30px;font-weight:500' });
    const L3 = phraseLine(R, G.wow, { y: 1215, size: 112, color: ink, key: '#C4321F', center: true });
    const CF = [...Array(24)].map((_, i) => $('div', 'abs', R, `left:0;top:0;width:16px;height:34px;border-radius:4px;background:${['#C4321F', '#FF8A1F', dark ? '#F6F3F2' : '#151515'][i % 3]}`));
    U2.push(t => { if (t >= T0) hide.forEach(e => { if (e) e.style.display = 'none'; }); });
    U2.push(t => { const on = t > T0 - .2 && t < T1 + .1; R.style.display = on ? '' : 'none'; if (!on) return;
      R.style.opacity = clamp((t - (T0 - .15)) / .25) * (1 - easeIn(lin(t, T1 - .06, T1 + .08)));
      words(L1, t); apply(tk, pose(t, { at: G.free - .12, dy: 40, s0: .92, follow: .012 }));
      apply(f1, pose(t, { at: G.free, dy: 30, s0: 1.12, dur: .4 })); apply(f2, pose(t, { at: G.level, dy: 24, dur: .4 }));
      cut.style.transform = `scaleX(${ease(lin(t, G.free + .2, G.level))})`; words(L2, t); words(L3, t);
      CF.forEach((c, i) => { const s = t - G.wow[0][1]; const v = s > 0 && s < 1.3; c.style.display = v ? '' : 'none'; if (!v) return; const side = i % 2 ? 1 : -1;
        const a = (side > 0 ? -150 + (i % 6) * 9 : -30 - (i % 6) * 9) * Math.PI / 180, sp = 900 + (i % 4) * 150, x0 = side > 0 ? 1000 : 80;
        c.style.opacity = 1 - lin(s, .9, 1.3); c.style.transform = `translate(${x0 + Math.cos(a) * sp * s}px,${1120 + Math.sin(a) * sp * s + 1250 * s * s}px) rotate(${i * 37 + s * 560}deg)`; }); });
    return U2;
  }

  /** the CTA as a Facebook post (light or dark mode): the academy's Mastery Graphic Level post, a viewer types a comment
   *  on «سيب كومنت», it posts on «وهنتواصل», the academy replies on «معاك». Runs on the (mapped) original times. */
  function fbPost(parent, dark, U) {
    const { pose, apply, icon } = SG, vis = (el, on) => { el.style.display = on ? '' : 'none'; return on; };
    const C = dark ? { card: '#242526', ink: '#E4E6EB', sub: '#B0B3B8', line: '#3E4042', field: '#3A3B3C', fieldB: '#4E4F50', bub: '#3A3B3C', av: '#4E4F50', rep: '#3b2a1c' }
                   : { card: '#FFFFFF', ink: '#151515', sub: '#5C5F66', line: '#EEEAE9', field: '#F3EFEE', fieldB: '#E4DFDE', bub: '#F3EFEE', av: '#D9D4D3', rep: '#FFF1E6' };
    const HEART = c => `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.2 0 3.9 1.3 5.3 3.2 1.4-1.9 3.1-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" fill="${c}"/></svg>`;
    const LIKE = '<path d="M7 10v11H4V10zM7 10l4-7c1.6 0 2.6 1.2 2.2 2.8L12.6 9H19a2 2 0 0 1 2 2.3l-1.2 7.4A2.6 2.6 0 0 1 17.2 21H7"/>';
    const SHARE = '<path d="M14 5l7 7-7 7v-4c-5 0-8.5 1.6-11 5 1-5.5 4-10 11-11z"/>', CHAT = '<path d="M20 15a3 3 0 0 1-3 3H9l-5 4V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z"/>';
    const ic = (path, sz, col) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    const P = $('div', 'abs', parent, `left:110px;right:110px;top:300px;height:1010px;border-radius:28px;overflow:hidden;background:${C.card};box-shadow:0 18px 50px rgba(0,0,0,${dark ? .5 : .1})`);
    const hd = $('div', 'abs', P, 'left:0;right:0;top:0;height:104px;display:flex;align-items:center;justify-content:space-between;padding:0 30px;direction:rtl');
    const hp = $('div', '', hd, 'display:flex;align-items:center;gap:16px');
    const hl = $('div', '', hp, 'width:200px;height:56px;background:#151515;border-radius:10px;display:grid;place-items:center' + (dark ? ';box-shadow:0 0 0 2px #3E4042' : '')); img(hl, LOGO, 'position:static;width:170px', '');
    $('div', '', hp, `font-size:24px;font-weight:500;color:${C.sub}`, '· الآن');
    $('div', '', hd, 'display:flex;gap:7px', `<i style="width:9px;height:9px;border-radius:50%;background:${C.sub};display:block"></i>`.repeat(3));
    $('div', 'abs', P, `left:30px;right:30px;top:104px;font-size:30px;font-weight:500;color:${C.ink};direction:rtl;white-space:nowrap`, 'عندك فرصة تاخد <span style="direction:ltr;unicode-bidi:isolate">Access</span> لمستويين بدل مستوى واحد!');
    // the post's visual: the academy's Mastery Graphic Level poster (its own headline and line), never the student's photo
    const PI = $('div', 'abs', P, 'left:0;right:0;top:160px;height:470px;overflow:hidden;background:linear-gradient(160deg,#151515 0%,#2a0b07 48%,#C4321F 100%)');
    $('div', 'abs', PI, 'inset:0;background-size:60px 60px;background-image:linear-gradient(rgba(246,243,242,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(246,243,242,.04) 1px,transparent 1px)');
    $('div', 'abs', PI, 'left:150px;right:150px;top:70px;height:6px;background:#FF8A1F');
    $('div', 'abs', PI, 'left:0;right:0;top:96px;text-align:center;font-family:Bebas;font-size:124px;line-height:.92;color:#F6F3F2;direction:ltr', 'MASTERY<br>GRAPHIC LEVEL');
    $('div', 'abs', PI, 'left:150px;right:150px;top:332px;height:6px;background:#FF8A1F');
    $('div', 'abs', PI, 'left:0;right:0;top:366px;text-align:center;font-size:40px;font-weight:700;color:#F6F3F2;direction:rtl', 'مش مجرد كورس… <span style="color:#FF8A1F">دي نقلة</span> في مستواك.');
    const rx = $('div', 'abs', P, 'right:30px;top:646px;height:40px;display:flex;align-items:center;gap:6px;direction:rtl');
    const R1 = $('div', '', rx, 'width:38px;height:38px;border-radius:50%;background:#C4321F;padding:8px'); R1.innerHTML = HEART('#fff');
    const R2 = $('div', '', rx, 'width:38px;height:38px;border-radius:50%;background:#FF8A1F;display:grid;place-items:center', ic(LIKE, 22, '#fff'));
    const bar = $('div', 'abs', P, `left:24px;right:24px;top:700px;height:76px;border-top:2px solid ${C.line};border-bottom:2px solid ${C.line};display:flex;direction:rtl`);
    const ACT = [[LIKE, 'أعجبني'], [CHAT, 'تعليق'], [SHARE, 'مشاركة']].map(([p, l]) =>
      $('div', '', bar, `flex:1;display:flex;align-items:center;justify-content:center;gap:12px;font-size:27px;font-weight:700;color:${C.sub}`, ic(p, 30, 'currentColor') + `<span>${l}</span>`));
    const CM = $('div', 'abs', P, 'left:30px;right:30px;top:800px;height:200px;direction:rtl');
    const box = $('div', 'abs', CM, `left:0;right:0;top:0;height:76px;border-radius:999px;background:${C.field};border:3px solid ${C.fieldB};display:flex;align-items:center;gap:14px;padding:0 14px 0 26px;direction:rtl`);
    $('div', '', box, `width:52px;height:52px;border-radius:50%;background:${C.av};display:grid;place-items:center;flex:none`, icon('user', 30, '#fff', 2.2));
    const TYP = $('div', '', box, `flex:1;font-size:28px;font-weight:500;color:${C.ink};white-space:nowrap;overflow:hidden`);
    const SEND = $('div', '', box, 'width:52px;height:52px;border-radius:50%;background:#C4321F;display:grid;place-items:center;transform:scaleX(-1);flex:none', icon('arrow', 28, '#fff', 2.6));
    const TXT = 'عايز أبدأ قصة نجاحي!';
    const C1 = $('div', 'abs', CM, 'right:0;top:0;display:flex;gap:14px;align-items:flex-start;direction:rtl');
    $('div', '', C1, `width:52px;height:52px;border-radius:50%;background:${C.av};display:grid;place-items:center;flex:none`, icon('user', 30, '#fff', 2.2));
    $('div', '', C1, `background:${C.bub};border-radius:24px;padding:10px 22px;font-size:28px;font-weight:500;color:${C.ink}`, TXT);
    const C2 = $('div', 'abs', CM, 'right:66px;top:96px;display:flex;gap:12px;align-items:center;direction:rtl');
    const c2l = $('div', '', C2, 'width:150px;height:46px;background:#151515;border-radius:10px;display:grid;place-items:center;flex:none'); img(c2l, LOGO, 'position:static;width:128px', '');
    $('div', '', C2, `background:${C.rep};border:2px solid #FF8A1F;border-radius:24px;padding:8px 20px;font-size:27px;font-weight:700;color:${C.ink};display:flex;align-items:center;gap:10px`, icon('check', 28, '#C4321F', 3) + '<span>هنتواصل معاك</span>');
    U.push(t => { if (!vis(P, t > 18.2 && t < 24.4)) return;
      apply(P, pose(t, { at: 18.38, dy: 30, s0: .94, follow: .01, out: 24.0 }));
      [R1, R2].forEach((r, i) => apply(r, pose(t, { at: 19.06 + i * .1, dy: 0, s0: .3, dur: .35, follow: .04 })));
      const onC = t >= 21.06; ACT.forEach((a, i) => { const h = i === 1 && onC && t < 21.9; a.style.color = h ? '#C4321F' : i === 0 && t > 19.06 ? '#C4321F' : C.sub; a.style.transform = `scale(${h ? 1.06 : 1})`; });
      TYP.textContent = TXT.slice(0, Math.round(TXT.length * clamp((t - 21.2) / .6))); box.style.borderColor = onC ? '#FF8A1F' : C.fieldB;
      const posted = t >= 21.86; box.style.opacity = posted ? 1 - ease(lin(t, 21.86, 22.0)) : clamp((t - 20.9) / .25); box.style.visibility = !posted || t < 22.0 ? 'visible' : 'hidden';
      SEND.style.transform = `scaleX(-1) scale(${1 + .15 * Math.sin(Math.PI * lin(t, 21.7, 21.9))})`;
      apply(C1, pose(t, { at: 21.86, dy: 14, s0: .96, dur: .35 })); apply(C2, pose(t, { at: 22.64, dy: 14, s0: .9, follow: .02 })); });
    return P;
  }
  /** a key-word block that travels WITH its word (no block left behind when the word leaves) */
  function keyBlock(U, L, color = '#C4321F') { L.ws.forEach(w => { if (w.f !== 'k') return; w.i.style.zIndex = 1;
    const b = $('span', '', w.i, `position:absolute;left:-.1em;right:-.1em;top:.2em;bottom:.06em;background:${color};transform-origin:100% 50%;z-index:-1;transform:scaleX(0)`);
    U.push(t => { b.style.transform = `scaleX(${ease(lin(t, w.at + .06, w.at + .32))})`; }); }); }
  window.MO = { LOGO, IMG, PH, phraseLine, phrase, fitAll, words, img, ready, env, map, reward, fbPost, keyBlock };
})();
