// Stand-in for 'firebase/app': no network, no real project.
const apps: any[] = [];
export function initializeApp(options: any = {}, name = '[DEFAULT]') {
  const app = { name, options: { projectId: 'demo-project' }, automaticDataCollectionEnabled: false };
  apps.push(app);
  return app;
}
export const getApps = () => apps;
export const getApp = (name = '[DEFAULT]') => apps.find(a => a.name === name) || initializeApp({}, name);
export const deleteApp = async () => {};
export const registerVersion = () => {};
export const SDK_VERSION = 'demo';
