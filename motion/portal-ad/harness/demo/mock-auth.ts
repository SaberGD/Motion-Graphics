// Stand-in for 'firebase/auth'. The portal app ("student-portal") is signed in as the demo
// student unless localStorage 'demoSignedOut' is set (used to capture the login screen).
import { DEMO_STUDENT } from './fixture';

const claims = { portal: 'student', sidn: DEMO_STUDENT.studentIdNum, pak: 'demo-account', psid: 'demo-session' };
const demoUser = {
  uid: 'demo-portal-uid', email: null, displayName: DEMO_STUDENT.name,
  getIdToken: async () => 'demo-token',
  getIdTokenResult: async () => ({ claims, token: 'demo-token' }),
};
const signedOut = () => { try { return localStorage.getItem('demoSignedOut') === '1'; } catch { return false; } };
const auths = new Map<string, any>();
export function getAuth(app?: any) {
  const name = app?.name || '[DEFAULT]';
  if (!auths.has(name)) {
    const isPortal = name === 'student-portal';
    auths.set(name, { name, cbs: new Set<any>(), currentUser: isPortal && !signedOut() ? demoUser : null, signOut: async () => {} });
  }
  return auths.get(name);
}
export function onAuthStateChanged(auth: any, cb: any) {
  auth.cbs.add(cb);
  setTimeout(() => cb(auth.currentUser), 0);
  return () => auth.cbs.delete(cb);
}
export const onIdTokenChanged = onAuthStateChanged;
const emit = (auth: any) => auth.cbs.forEach((cb: any) => cb(auth.currentUser));
export async function signInWithCustomToken(auth: any) { try { localStorage.removeItem('demoSignedOut'); } catch {} auth.currentUser = demoUser; emit(auth); return { user: demoUser }; }
export async function signOut(auth: any) { auth.currentUser = null; emit(auth); }
export async function signInWithEmailAndPassword() { throw new Error('demo: staff sign-in disabled'); }
export async function updatePassword() {}
export async function reauthenticateWithCredential() {}
export const EmailAuthProvider = { credential: () => ({}) };
export const GoogleAuthProvider = function () {} as any;
export async function signInWithPopup() { throw new Error('demo'); }
export const browserLocalPersistence = {};
export async function setPersistence() {}
