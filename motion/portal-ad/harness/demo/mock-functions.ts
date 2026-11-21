// Stand-in for 'firebase/functions'. Telegram state is "already linked", so no onboarding gate.
export const getFunctions = (app?: any) => ({ app });
export const connectFunctionsEmulator = () => {};
const TELEGRAM_STATE = {
  managed: true, ready: true, active: true, linked: true, username: 'demo_student',
  steps: { link: true, channel: true, group: true, topic: true },
  tasksLink: 'https://t.me/demo_tasks', channelLink: 'https://t.me/demo_channel', groupLink: 'https://t.me/demo_group',
  phone: 'verified', collapsed: true, completedAt: Date.now() - 20 * 864e5,
};
export const httpsCallable = (_f: any, name: string) => async (_data: any) => {
  if (name === 'telegramPortalState') {
    let mode = '';
    try { mode = localStorage.getItem('demoTg') || ''; } catch { /* ignore */ }
    if (mode === 'unmanaged') return { data: { managed: false } };
    if (mode === 'expanded') return { data: { ...TELEGRAM_STATE, collapsed: false } };
    return { data: TELEGRAM_STATE };
  }
  return { data: { ok: true } };
};
