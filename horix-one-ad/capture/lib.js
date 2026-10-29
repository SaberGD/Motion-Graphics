// Shared helpers: browser with video recording, a visible cursor, smooth mouse, file drop.
const { chromium } = require('playwright');
const fs = require('fs');
const A = '/home/user/Motion-Graphics/horix-one-ad/assets/';
exports.A = A;

const CURSOR = `(()=>{ const go=()=>{ if(document.getElementById('__cur'))return;
 const c=document.createElement('div'); c.id='__cur';
 c.style.cssText='position:fixed;left:0;top:0;width:26px;height:26px;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px);will-change:transform';
 c.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24"><path d="M3 2l7 19 2.6-7.6L20 11z" fill="#fff" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg>';
 document.documentElement.appendChild(c);
 const r=document.createElement('div'); r.id='__ring';
 r.style.cssText='position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid #D63C32;z-index:2147483646;pointer-events:none;opacity:0;transform:translate(-100px,-100px)';
 document.documentElement.appendChild(r);
 window.__cur=(x,y)=>{c.style.transform='translate('+x+'px,'+y+'px)';r.style.transform='translate('+x+'px,'+y+'px)';};
 window.__click=()=>{r.animate([{opacity:.9,scale:.4},{opacity:0,scale:1.4}],{duration:380,easing:'ease-out'});};
}; if(document.documentElement)go(); else document.addEventListener('DOMContentLoaded',go); })()`;

exports.open = async function (name, opts = {}) {
  const dir = __dirname + '/raw/' + name;
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage();
  const S = { browser, ctx, page, dir, x: 720, y: 450, t0: Date.now() };
  S.rec = null;
  return S;
};
exports.startRec = async function (S, name) {
  const o = { viewport: { width: 1440, height: 900 } }; if (process.env.REC) o.recordVideo = { dir: S.dir, size: { width: 1440, height: 900 } };
  const ctx = await S.browser.newContext(o);
  await ctx.addInitScript(CURSOR);
  return ctx;
};
exports.cur = async (S, x, y) => { S.x = x; S.y = y; await S.page.evaluate(([x, y]) => window.__cur && window.__cur(x, y), [x, y]); };
exports.move = async (S, x, y, ms = 500) => {
  const n = Math.max(6, Math.round(ms / 25)), x0 = S.x, y0 = S.y;
  for (let i = 1; i <= n; i++) {
    const t = i / n, e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const cx = x0 + (x - x0) * e, cy = y0 + (y - y0) * e - Math.sin(Math.PI * e) * 12;
    await S.page.mouse.move(cx, cy); await exports.cur(S, cx, cy);
    await S.page.waitForTimeout(ms / n);
  }
  S.x = x; S.y = y;
};
exports.click = async (S, x, y, ms = 500) => {
  await exports.move(S, x, y, ms);
  await S.page.evaluate(() => window.__click && window.__click());
  await S.page.mouse.down(); await S.page.waitForTimeout(70); await S.page.mouse.up();
};
exports.drag = async (S, x1, y1, x2, y2, ms = 700) => {
  await exports.move(S, x1, y1, 400);
  await S.page.mouse.down();
  await exports.move(S, x2, y2, ms);
  await S.page.mouse.up();
};
exports.drop = async function (page, frameMatch, path, mime) {
  const fr = page.frames().find(f => f.url().includes(frameMatch));
  const b64 = fs.readFileSync(path).toString('base64'), name = path.split('/').pop();
  return fr.evaluate(async ({ b64, name, mime }) => {
    const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const dt = new DataTransfer(); dt.items.add(new File([u], name, { type: mime }));
    const cv = document.querySelector('canvas'), r = cv.getBoundingClientRect();
    for (const t of ['dragenter', 'dragover', 'drop']) cv.dispatchEvent(new DragEvent(t, { dataTransfer: dt, bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
  }, { b64, name, mime });
};
exports.persona = { vector: [180, 19], pixel: [262, 19], layout: [345, 19] };

exports.mark = (S, label) => { (S.marks = S.marks || []).push([label, (Date.now() - S.t0) / 1000]); console.log('mark', label, ((Date.now() - S.t0) / 1000).toFixed(1)); };
exports.finish = async (S, ctx) => { require('fs').writeFileSync(S.dir + '/marks.json', JSON.stringify(S.marks || [])); await ctx.close(); await S.browser.close(); };
