// Captures the real StudentPortal (demo harness, mocked Firebase) at phone and desktop sizes.
// Usage: node capture.cjs <outDir> [mobile|desktop|all]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:5199/demo.html';
const OUT = process.argv[2];
const WHICH = process.argv[3] || 'all';
const SESSION = JSON.stringify({ id: 'demo-student-1', groupId: 'demo-group-1', studentIdNum: '48213', name: 'أحمد محمد' });
const external = new Set();

async function page(ctx, { hash = '', loggedIn = true, greet = false, maro = false, tg = '' } = {}) {
  const p = await ctx.newPage();
  p.on('request', r => { const u = new URL(r.url()); if (u.hostname !== '127.0.0.1') external.add(u.hostname); });
  p.on('pageerror', e => console.log('  pageerror', e.message));
  await p.addInitScript(([session, loggedIn, greet, tg]) => {
    try {
      localStorage.clear();
      if (loggedIn) localStorage.setItem('studentSession', session); else localStorage.setItem('demoSignedOut', '1');
      localStorage.setItem('saber-theme', 'dark');
      sessionStorage.clear();
      if (!greet) sessionStorage.setItem('maro-ai-greeted', '1');
      if (tg) localStorage.setItem('demoTg', tg);
    } catch {}
  }, [SESSION, loggedIn, greet, tg]);
  await p.goto(`${BASE}#/student-portal${hash}`);
  await p.waitForLoadState('networkidle');
  await p.evaluate(() => document.fonts.ready);
  if (!maro && !greet) await p.addStyleTag({ content: '.maro-ai-fab, .maro-ai-bubble { display: none !important; }' });
  await p.waitForTimeout(1800);
  return p;
}

async function shot(p, name, { full = false } = {}) {
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, `${name}.png`) });
  if (full) {
    const vp = p.viewportSize();
    const y = await p.evaluate(() => window.scrollY);
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.setViewportSize({ width: vp.width, height: h });
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(OUT, `${name}_full.png`) });
    await p.setViewportSize(vp);
    await p.evaluate(y => window.scrollTo(0, y), y);
    await p.waitForTimeout(300);
  }
  console.log('  saved', name, full ? '(+full)' : '');
}

async function scrollTo(p, selectorOrText, extra = 12) {
  await p.evaluate(([s, extra]) => {
    let el = null;
    try { el = document.querySelector(s); } catch {}
    if (!el) {
      const all = [...document.querySelectorAll('main *')].filter(e => e.offsetParent && e.textContent.includes(s));
      el = all[all.length - 1] || null;
      if (el) el = el.closest('section, .rounded-4xl, .rounded-3xl') || el;
    }
    if (!el) return;
    const header = document.querySelector('.sg-portal-header');
    const nav = document.querySelector('.sg-portal-navigation');
    let off = (header ? header.getBoundingClientRect().height : 0) + extra;
    if (nav && getComputedStyle(nav).position === 'sticky') off += nav.getBoundingClientRect().height + 8;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off);
  }, [selectorOrText, extra]);
  await p.waitForTimeout(400);
}

async function run(kind) {
  const mobile = kind === 'mobile';
  const b = await chromium.launch();
  const ctx = await b.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 },
    deviceScaleFactor: mobile ? 3 : 2, isMobile: mobile, hasTouch: mobile,
    locale: 'ar-EG', timezoneId: 'Africa/Cairo', colorScheme: 'dark',
  });
  await ctx.grantPermissions(['notifications'], { origin: 'http://127.0.0.1:5199' });
  const sfx = mobile ? '' : '_desktop';
  const top = mobile ? 90 : 110;
  console.log(kind);

  // 1. login
  let p = await page(ctx, { loggedIn: false });
  await shot(p, `01_login${sfx}`, { full: true });
  await p.close();

  // 2. home (+ the Maro greeting variant)
  p = await page(ctx, { hash: '?view=home' });
  await shot(p, `02_home${sfx}`, { full: true });
  await scrollTo(p, '.sg-portal-session-card');
  await shot(p, `02b_home_next_lecture${sfx}`);
  await scrollTo(p, '.sg-portal-deliver');
  await shot(p, `02c_home_stats${sfx}`);
  await p.close();
  p = await page(ctx, { hash: '?view=home', greet: true });
  await shot(p, `02d_home_maro_greeting${sfx}`);
  await p.close();

  // 3. lectures list + one opened lecture
  p = await page(ctx, { hash: '?view=lectures' });
  await shot(p, `03_lectures${sfx}`, { full: true });
  await p.evaluate(() => { const d = document.querySelectorAll('.sg-lecture-details')[1]; if (d) d.open = true; });
    await scrollTo(p, '.sg-lecture-row:nth-child(3)');
  await shot(p, `03b_lecture_detail${sfx}`);
  const row = (await p.$$('.sg-lecture-row'))[1];
  if (row) { await row.screenshot({ path: path.join(OUT, `03c_lecture_detail_card${sfx}.png`) }); console.log('  saved 03c'); }
  await p.close();

  // 4. attendance success (QR check-in link, signed in)
  p = await page(ctx, { hash: '?attendance=true&groupId=demo-group-1&sessionId=demo-session-14&sessionNumber=14&qrToken=demo' });
  await p.waitForTimeout(1500);
  await shot(p, `04_attendance_success${sfx}`, { full: true });
  await p.close();

  // 5. progress + 8. certificate (both live in «تقدمي»)
  p = await page(ctx, { hash: '?view=progress' });
  await shot(p, `05_progress${sfx}`, { full: true });
  await scrollTo(p, 'نقاط الضعف ومواضع التطوير');
  await shot(p, `05b_progress_weaknesses${sfx}`);
  await scrollTo(p, 'الخطة الجدولية للمجموعة');
  await shot(p, `05c_progress_schedule${sfx}`);
  await scrollTo(p, 'شهادة تخرج الكورس - SABER GROUP');
  await shot(p, `08_certificate${sfx}`);
  const cert = await p.evaluateHandle(() => [...document.querySelectorAll('h2')].find(h => h.textContent.includes('شهادة تخرج الكورس'))?.closest('.rounded-4xl'));
  if (cert && cert.asElement()) { await cert.asElement().screenshot({ path: path.join(OUT, `08b_certificate_card${sfx}.png`) }); console.log('  saved 08b'); }
  await p.close();

  // 6. Maro Q/A
  p = await page(ctx, { hash: '?view=home', maro: true });
  await p.click('[aria-label="افتح مارو، المساعد الذكي"]', { force: true });
  await p.waitForTimeout(800);
  await shot(p, `06a_maro_open${sfx}`);
  await p.fill('[aria-label="سؤالك لمارو"]', 'نقاطي وترتيبي عامل إزاي؟');
  await p.click('.maro-ai-send');
  await p.waitForTimeout(250);
  await shot(p, `06b_maro_thinking${sfx}`);
  await p.waitForSelector('.maro-ai-used', { timeout: 10000 }).catch(() => console.log('  maro answer not found'));
  await p.waitForTimeout(1200);
  await shot(p, `06_maro_answer${sfx}`);
  await p.close();

  // 7. project + result dialog + details dialog
  p = await page(ctx, { hash: '?view=project' });
  await shot(p, `07_project${sfx}`, { full: true });
  await p.getByText('عرض تفاصيل التقييم وملاحظات الديزاين').click();
  await p.waitForTimeout(800);
  await shot(p, `07b_project_result_dialog${sfx}`);
  await p.evaluate(() => { const d = document.querySelector('[role="dialog"]'); const sc = d && ([d, ...d.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 20 && getComputedStyle(e).overflowY !== 'visible')); if (sc) sc.scrollTop = sc.scrollHeight; });
  await shot(p, `07c_project_result_dialog_comments${sfx}`);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  await p.goto(`${BASE}#/student-portal?view=project&x=1`);
  await p.waitForTimeout(1800);
  await p.getByText('تفاصيل وقواعد المشروع').first().click();
  await p.waitForTimeout(800);
  await shot(p, `07d_project_details_dialog${sfx}`);
  await p.close();

  // 9. notifications
  p = await page(ctx, { hash: '?view=home' });
  await p.click('[aria-label="الإشعارات"]');
  await p.waitForTimeout(600);
  await shot(p, `09_notifications${sfx}`);
  await p.close();

  // 10. help
  p = await page(ctx, { hash: '?view=help' });
  await shot(p, `10_help${sfx}`, { full: true });
  await p.close();
  p = await page(ctx, { hash: '?view=help', tg: 'expanded' });
  await shot(p, `10b_help_telegram_card${sfx}`, { full: true });
  await p.close();
  p = await page(ctx, { hash: '?view=help', tg: 'unmanaged' });
  await shot(p, `10c_help_channels${sfx}`, { full: true });
  await scrollTo(p, 'قناة التليجرام الأكاديمية للمجموعة');
  await shot(p, `10d_help_channels_scrolled${sfx}`);
  await p.close();

  // 11. referral
  p = await page(ctx, { hash: '?view=home' });
  const ref = await p.$('[aria-label="كود الترشيح"]');
  if (ref) { await ref.screenshot({ path: path.join(OUT, `11_referral${sfx}.png`) }); console.log('  saved 11'); }
  await p.click('[aria-label="يعني إيه كود الترشيح؟"]');
  await p.waitForTimeout(300);
  const ref2 = await p.$('[aria-label="كود الترشيح"]');
  if (ref2) { await ref2.screenshot({ path: path.join(OUT, `11b_referral_info${sfx}.png`) }); console.log('  saved 11b'); }
  await p.close();

  await b.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  if (WHICH === 'all' || WHICH === 'mobile') await run('mobile');
  if (WHICH === 'all' || WHICH === 'desktop') await run('desktop');
  console.log('external hosts contacted:', [...external].join(', ') || 'none');
})();
