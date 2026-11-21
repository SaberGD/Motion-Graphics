// Every fetch is answered locally. Only same-origin dev-server files and Google Fonts pass through.
import { DEMO_STUDENT, FIXTURE, DEMO_POINTS, DEMO_RANK_GAP } from './fixture';

const realFetch = window.fetch.bind(window);
const json = (body: any, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const MARO_QUESTION = 'نقاطي وترتيبي عامل إزاي؟';

async function maro(body: any) {
  const msgs = body?.messages || [];
  const last = msgs[msgs.length - 1];
  if (typeof last?.content === 'string') {
    // First step: ask the browser to run the real `my_summary` tool on the loaded demo data.
    return json({ stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'demo-tool-1', name: 'my_summary', input: {} }] });
  }
  let s: any = {};
  try { s = JSON.parse(last.content[0].content); } catch { /* keep defaults */ }
  const pos = s?.rank?.position ?? 2;
  const outOf = s?.rank?.outOf ?? 12;
  const pts = s?.points?.finalScore ?? DEMO_POINTS;
  const att = s?.attendance?.ratePercent ?? 92;
  const text = `إنت في **المركز التاني** في جروبك من ${outOf} طالب بـ **${pts} نقطة** 🔥\n\n`
    + `- الحضور: ${att}% (غبت محاضرة واحدة بس)\n- التاسكات: ${s?.tasks?.delivered ?? 23} من ${s?.tasks?.required ?? 24} اتسلّموا\n- الخصومات: ${s?.points?.penalties ?? 3} نقط\n\n`
    + `فاضلك **${DEMO_RANK_GAP} نقط** وتبقى الأول 💪 سلّم تاسك المحاضرة الجاية في معاده وخد البونص.`;
  void pos;
  return json({ stop_reason: 'end_turn', content: [{ type: 'text', text }] });
}

async function studentPortal(body: any) {
  if (body?.action === 'login') {
    return json({ token: 'demo-token', primaryId: DEMO_STUDENT.id, records: [FIXTURE.students[DEMO_STUDENT.id] && { ...DEMO_STUDENT }] });
  }
  if (body?.action === 'checkIn') return json({ ok: true, alreadyRegistered: false });
  return json({ ok: true });
}

window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const u = new URL(url, location.href);
  let body: any = null;
  try { body = init?.body ? JSON.parse(String(init.body)) : null; } catch { /* not JSON */ }
  if (u.pathname.endsWith('/studentPortal')) return studentPortal(body);
  if (u.pathname.includes('maro-assistant')) { await new Promise(r => setTimeout(r, 400)); return maro(body); }
  if (u.origin === location.origin && !u.pathname.startsWith('/api/')) return realFetch(input as any, init);
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') return realFetch(input as any, init);
  console.info('[demo-fetch] blocked', u.href);
  return json({ ok: false, error: 'demo_offline' }, 503);
}) as any;

export { MARO_QUESTION };
