// In-memory stand-in for 'firebase/firestore'. Nothing leaves the browser.
import { FIXTURE } from './fixture';

export class Timestamp {
  seconds: number; nanoseconds: number;
  constructor(seconds: number, nanoseconds = 0) { this.seconds = seconds; this.nanoseconds = nanoseconds; }
  static now() { return Timestamp.fromMillis(Date.now()); }
  static fromDate(d: Date) { return Timestamp.fromMillis(d.getTime()); }
  static fromMillis(ms: number) { return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6); }
  toDate() { return new Date(this.toMillis()); }
  toMillis() { return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6); }
  isEqual(o: Timestamp) { return o.toMillis() === this.toMillis(); }
  valueOf() { return String(this.toMillis()).padStart(16, '0'); }
}

// store: collection path -> id -> data
const store = new Map<string, Map<string, any>>();
const reviveTs = (v: any): any => {
  if (v && typeof v === 'object' && v.__ts) return Timestamp.fromMillis(v.__ts);
  if (Array.isArray(v)) return v.map(reviveTs);
  if (v && typeof v === 'object') { const o: any = {}; for (const k of Object.keys(v)) o[k] = reviveTs(v[k]); return o; }
  return v;
};
for (const [col, docs] of Object.entries(FIXTURE)) {
  const m = new Map<string, any>();
  for (const [id, data] of Object.entries(docs as any)) m.set(id, reviveTs(data));
  store.set(col, m);
}
const colMap = (path: string) => { if (!store.has(path)) store.set(path, new Map()); return store.get(path)!; };

type Listener = { ref: any; next: (s: any) => void };
const listeners = new Set<Listener>();
const notify = () => { for (const l of listeners) setTimeout(() => l.next(snapshotOf(l.ref)), 0); };

const mkDb = (app?: any) => ({ type: 'firestore', app });
export const getFirestore = (app?: any) => mkDb(app);
export const initializeFirestore = (app?: any) => mkDb(app);
export const persistentLocalCache = (o?: any) => o || {};
export const persistentMultipleTabManager = () => ({});
export const memoryLocalCache = () => ({});
export const enableIndexedDbPersistence = async () => {};
export const connectFirestoreEmulator = () => {};

const join = (segs: string[]) => segs.filter(Boolean).join('/');
export function collection(parent: any, ...segs: string[]) {
  const base = parent?.type === 'doc' ? parent.path : parent?.type === 'collection' ? parent.path : '';
  const path = join([base, ...segs]);
  return { type: 'collection', path, id: path.split('/').pop() };
}
export const collectionGroup = (_db: any, id: string) => ({ type: 'collection', path: id, id, group: true });
let autoId = 0;
export function doc(parent: any, ...segs: string[]) {
  let path: string;
  if (parent?.type === 'collection') path = join([parent.path, ...(segs.length ? segs : [`auto_${Date.now()}_${++autoId}`])]);
  else path = join(segs);
  const parts = path.split('/');
  const id = parts.pop()!;
  return { type: 'doc', path, id, colPath: parts.join('/'), parent: { type: 'collection', path: parts.join('/') } };
}
export const documentId = () => '__name__';
export const where = (field: any, op: string, value: any) => ({ kind: 'where', field, op, value });
export const orderBy = (field: string, dir: 'asc' | 'desc' = 'asc') => ({ kind: 'orderBy', field, dir });
export const limit = (n: number) => ({ kind: 'limit', n });
export const limitToLast = (n: number) => ({ kind: 'limit', n });
export const startAfter = (..._a: any[]) => ({ kind: 'noop' });
export const startAt = (..._a: any[]) => ({ kind: 'noop' });
export const endBefore = (..._a: any[]) => ({ kind: 'noop' });
export const and = (...c: any[]) => ({ kind: 'and', c });
export const or = (...c: any[]) => ({ kind: 'or', c });
export function query(ref: any, ...constraints: any[]) {
  return { type: 'query', path: ref.path, constraints: [...(ref.constraints || []), ...constraints] };
}

const getField = (data: any, id: string, field: any) => {
  if (field === '__name__') return id;
  return String(field).split('.').reduce((o, k) => (o == null ? undefined : o[k]), data);
};
const cmp = (a: any, b: any) => {
  const va = a?.toMillis ? a.toMillis() : a; const vb = b?.toMillis ? b.toMillis() : b;
  return va < vb ? -1 : va > vb ? 1 : 0;
};
const matches = (c: any, id: string, data: any): boolean => {
  if (c.kind === 'and') return c.c.every((x: any) => matches(x, id, data));
  if (c.kind === 'or') return c.c.some((x: any) => matches(x, id, data));
  if (c.kind !== 'where') return true;
  const v = getField(data, id, c.field);
  switch (c.op) {
    case '==': return v === c.value || (v?.toMillis && c.value?.toMillis && v.toMillis() === c.value.toMillis());
    case '!=': return v !== c.value;
    case '<': return cmp(v, c.value) < 0;
    case '<=': return cmp(v, c.value) <= 0;
    case '>': return cmp(v, c.value) > 0;
    case '>=': return cmp(v, c.value) >= 0;
    case 'in': return (c.value || []).includes(v);
    case 'not-in': return !(c.value || []).includes(v);
    case 'array-contains': return Array.isArray(v) && v.includes(c.value);
    case 'array-contains-any': return Array.isArray(v) && v.some((x: any) => (c.value || []).includes(x));
    default: return true;
  }
};

const docSnap = (path: string, id: string, data: any) => ({
  id, ref: doc({ type: 'x' }, path, id), exists: () => data !== undefined, data: () => (data === undefined ? undefined : { ...data }),
  get: (f: string) => getField(data, id, f), metadata: { hasPendingWrites: false, fromCache: false },
});
function runQuery(ref: any) {
  const m = colMap(ref.path);
  let rows = [...m.entries()].filter(([id, d]) => (ref.constraints || []).every((c: any) => matches(c, id, d)));
  for (const c of (ref.constraints || []).filter((c: any) => c.kind === 'orderBy').reverse()) {
    rows.sort((a, b) => cmp(getField(a[1], a[0], c.field), getField(b[1], b[0], c.field)) * (c.dir === 'desc' ? -1 : 1));
  }
  const lim = (ref.constraints || []).find((c: any) => c.kind === 'limit');
  if (lim) rows = rows.slice(0, lim.n);
  const docs = rows.map(([id, d]) => docSnap(ref.path, id, d));
  return { docs, empty: docs.length === 0, size: docs.length, forEach: (f: any) => docs.forEach(f), docChanges: () => docs.map(d => ({ type: 'added', doc: d })), metadata: { hasPendingWrites: false, fromCache: false } };
}
function snapshotOf(ref: any) {
  if (ref.type === 'doc') return docSnap(ref.colPath, ref.id, colMap(ref.colPath).get(ref.id));
  return runQuery(ref);
}

export const getDoc = async (ref: any) => snapshotOf(ref);
export const getDocFromServer = getDoc;
export const getDocFromCache = getDoc;
export const getDocs = async (ref: any) => snapshotOf(ref);
export const getDocsFromServer = getDocs;
export const getDocsFromCache = getDocs;
export const getCountFromServer = async (ref: any) => { const n = runQuery(ref).size; return { data: () => ({ count: n }) }; };
export const getAggregateFromServer = async (ref: any) => { const n = runQuery(ref).size; return { data: () => ({ count: n }) }; };
export const count = () => ({});
export const sum = () => ({});

export function onSnapshot(ref: any, a: any, b?: any, c?: any) {
  const next = typeof a === 'function' ? a : (a?.next || (typeof b === 'function' ? b : () => {}));
  const l: Listener = { ref, next };
  listeners.add(l);
  setTimeout(() => { if (listeners.has(l)) next(snapshotOf(ref)); }, 0);
  return () => { listeners.delete(l); };
}

const SERVER_TS = { __serverTs: true };
export const serverTimestamp = () => SERVER_TS;
export const deleteField = () => ({ __delete: true });
export const increment = (n: number) => ({ __inc: n });
export const arrayUnion = (...v: any[]) => ({ __union: v });
export const arrayRemove = (...v: any[]) => ({ __remove: v });
const applyVal = (old: any, v: any) => {
  if (v === SERVER_TS) return Timestamp.now();
  if (v && v.__inc !== undefined) return (old || 0) + v.__inc;
  if (v && v.__union) return [...new Set([...(old || []), ...v.__union])];
  if (v && v.__remove) return (old || []).filter((x: any) => !v.__remove.includes(x));
  return v;
};
const write = (ref: any, data: any, merge: boolean) => {
  const m = colMap(ref.colPath);
  const base = merge ? { ...(m.get(ref.id) || {}) } : {};
  for (const [k, v] of Object.entries(data || {})) {
    if (v && (v as any).__delete) delete base[k]; else base[k] = applyVal(base[k], v);
  }
  m.set(ref.id, base);
  console.info('[demo-firestore] local write (in-memory only):', ref.path);
  notify();
};
export const setDoc = async (ref: any, data: any, opts?: any) => write(ref, data, !!opts?.merge);
export const updateDoc = async (ref: any, data: any) => write(ref, data, true);
export const addDoc = async (col: any, data: any) => { const ref = doc(col); write(ref, data, false); return ref; };
export const deleteDoc = async (ref: any) => { colMap(ref.colPath).delete(ref.id); notify(); };
export const writeBatch = () => {
  const ops: (() => void)[] = [];
  return {
    set: (r: any, d: any, o?: any) => { ops.push(() => write(r, d, !!o?.merge)); },
    update: (r: any, d: any) => { ops.push(() => write(r, d, true)); },
    delete: (r: any) => { ops.push(() => colMap(r.colPath).delete(r.id)); },
    commit: async () => { ops.forEach(f => f()); },
  };
};
export const runTransaction = async (_db: any, fn: any) => fn({
  get: getDoc,
  set: (r: any, d: any, o?: any) => write(r, d, !!o?.merge),
  update: (r: any, d: any) => write(r, d, true),
  delete: (r: any) => colMap(r.colPath).delete(r.id),
});
export const disableNetwork = async () => {};
export const enableNetwork = async () => {};
export const terminate = async () => {};
export const clearIndexedDbPersistence = async () => {};
export const FieldValue = {};
export const FieldPath = function () {};
