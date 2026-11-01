import * as realDb from 'firebase/database'
import { getSystemConfigSync, isMockDbActive } from './systemConfig'

export * from 'firebase/database'

// ─── Chronological Firebase Push ID Generator ───
const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'
let lastPushTime = 0
const lastRandChars = new Array<number>(12).fill(0)

function generateFirebasePushId(): string {
  let now = Date.now()
  const duplicateTime = now === lastPushTime
  lastPushTime = now

  const timeStampChars = new Array<string>(8)
  for (let i = 7; i >= 0; i--) {
    timeStampChars[i] = PUSH_CHARS.charAt(now % 64)
    now = Math.floor(now / 64)
  }

  let id = timeStampChars.join('')
  if (!duplicateTime) {
    for (let i = 0; i < 12; i++) {
      lastRandChars[i] = Math.floor(Math.random() * 64)
    }
  } else {
    let i = 11
    while (i >= 0 && lastRandChars[i] === 63) {
      lastRandChars[i] = 0
      i--
    }
    if (i >= 0) {
      lastRandChars[i]++
    }
  }
  for (let i = 0; i < 12; i++) {
    id += PUSH_CHARS.charAt(lastRandChars[i])
  }
  return id
}

function normalizeDbPath(rawPath?: string | null): string {
  if (!rawPath) return ''
  return String(rawPath)
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/')
}

function joinDbPath(base: string, sub?: string | null): string {
  const a = normalizeDbPath(base)
  const b = normalizeDbPath(sub)
  if (!a) return b
  if (!b) return a
  return `${a}/${b}`
}

export class MockDatabase {
  readonly __isMockDb = true
  readonly app: any
  constructor(app?: any) {
    this.app = app || null
  }
}

export class MockDatabaseReference {
  readonly __isMockRef = true
  readonly db: MockDatabase
  readonly path: string

  constructor(db: MockDatabase, path?: string) {
    this.db = db
    this.path = normalizeDbPath(path)
  }

  get key(): string | null {
    if (!this.path) return null
    const parts = this.path.split('/')
    return parts[parts.length - 1] || null
  }

  get parent(): MockDatabaseReference | null {
    if (!this.path) return null
    const parts = this.path.split('/')
    parts.pop()
    return new MockDatabaseReference(this.db, parts.join('/'))
  }

  get root(): MockDatabaseReference {
    return new MockDatabaseReference(this.db, '')
  }

  toString(): string {
    return `mock-rtdb://local/${this.path}`
  }
}

export class MockDataSnapshot {
  readonly ref: MockDatabaseReference
  private readonly _data: any

  constructor(ref: MockDatabaseReference, data: any) {
    this.ref = ref
    this._data = data === undefined ? null : data
  }

  get key(): string | null {
    return this.ref.key
  }

  exists(): boolean {
    return this._data !== null && this._data !== undefined
  }

  val(): any {
    if (!this.exists()) return null
    return this._data
  }

  toJSON(): any {
    return this.val()
  }

  get size(): number {
    if (!this._data || typeof this._data !== 'object') return 0
    return Object.keys(this._data).length
  }

  hasChildren(): boolean {
    return this.size > 0
  }

  hasChild(path: string): boolean {
    return this.child(path).exists()
  }

  child(subPath: string): MockDataSnapshot {
    const clean = normalizeDbPath(subPath)
    const childRef = new MockDatabaseReference(this.ref.db, joinDbPath(this.ref.path, clean))
    if (!clean) return new MockDataSnapshot(childRef, this._data)
    const parts = clean.split('/')
    let cur = this._data
    for (const seg of parts) {
      if (cur === null || cur === undefined || typeof cur !== 'object') {
        cur = null
        break
      }
      cur = cur[seg]
    }
    return new MockDataSnapshot(childRef, cur ?? null)
  }

  forEach(action: (childSnap: MockDataSnapshot) => boolean | void): boolean {
    if (!this._data || typeof this._data !== 'object') return false
    const entries = Array.isArray(this._data)
      ? this._data.map((v, idx) => [String(idx), v] as const)
      : Object.entries(this._data)
    for (const [k, v] of entries) {
      if (v === null || v === undefined) continue
      const cRef = new MockDatabaseReference(this.ref.db, joinDbPath(this.ref.path, k))
      if (action(new MockDataSnapshot(cRef, v)) === true) {
        return true
      }
    }
    return false
  }
}

interface ListenerEntry {
  id: number
  ref: MockDatabaseReference
  path: string
  callback: (snap: any) => void
  errorCallback?: (err: Error) => void
}

let nextListenerId = 1
const activeListeners = new Map<number, ListenerEntry>()

const mockSyncChannel =
  typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('sonai_mock_rtdb_sync_v1')
    : null

if (mockSyncChannel) {
  mockSyncChannel.onmessage = (ev) => {
    const mutatedPath = typeof ev.data?.path === 'string' ? ev.data.path : ''
    notifyMockListeners(mutatedPath, false)
  }
}

function pathsOverlap(listenerPath: string, mutatedPath: string): boolean {
  if (!listenerPath || !mutatedPath) return true
  if (listenerPath === mutatedPath) return true
  return (
    listenerPath.startsWith(mutatedPath + '/') || mutatedPath.startsWith(listenerPath + '/')
  )
}

async function fetchMockPathData(path: string): Promise<any> {
  const clean = normalizeDbPath(path)
  const res = await window.fetch(`/__mock_rtdb/data?path=${encodeURIComponent(clean)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    throw new Error(`Mock RTDB read error (${res.status}): ${errText}`)
  }
  const payload = await res.json()
  return payload?.data ?? null
}

async function mutateMockPathData(
  op: 'set' | 'update' | 'remove',
  path: string,
  value?: any
): Promise<void> {
  const clean = normalizeDbPath(path)
  const res = await window.fetch('/__mock_rtdb/mutate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op, path: clean, value })
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    throw new Error(`Mock RTDB write error (${res.status}): ${errText}`)
  }
  notifyMockListeners(clean, true)
}

function notifyMockListeners(mutatedPath: string, broadcastToTabs = true): void {
  if (broadcastToTabs && mockSyncChannel) {
    try {
      mockSyncChannel.postMessage({ path: mutatedPath, ts: Date.now() })
    } catch {
      // ignore
    }
  }
  for (const entry of activeListeners.values()) {
    if (pathsOverlap(entry.path, mutatedPath)) {
      fetchMockPathData(entry.path)
        .then((data) => {
          if (activeListeners.has(entry.id)) {
            entry.callback(new MockDataSnapshot(entry.ref, data))
          }
        })
        .catch((err) => {
          if (entry.errorCallback) entry.errorCallback(err)
        })
    }
  }
}

function isMockObject(obj: any): boolean {
  return Boolean(obj && (obj.__isMockDb || obj.__isMockRef))
}

// ─── Proxied Firebase Realtime Database API ───

export function getDatabase(app?: any, url?: string): any {
  if (isMockDbActive()) {
    return new MockDatabase(app)
  }
  const sysDbUrl = url || getSystemConfigSync().firebase.databaseURL || undefined
  return realDb.getDatabase(app, sysDbUrl)
}

export function ref(db: any, path?: string): any {
  if (isMockDbActive() || isMockObject(db)) {
    const mockDb = db instanceof MockDatabase ? db : new MockDatabase()
    return new MockDatabaseReference(mockDb, path)
  }
  return realDb.ref(db, path)
}

export function child(parent: any, path: string): any {
  if (isMockDbActive() || isMockObject(parent)) {
    const baseRef =
      parent instanceof MockDatabaseReference
        ? parent
        : new MockDatabaseReference(new MockDatabase(), '')
    return new MockDatabaseReference(baseRef.db, joinDbPath(baseRef.path, path))
  }
  return realDb.child(parent, path)
}

export async function get(query: any): Promise<any> {
  if (isMockDbActive() || isMockObject(query)) {
    const mRef =
      query instanceof MockDatabaseReference
        ? query
        : new MockDatabaseReference(new MockDatabase(), '')
    const data = await fetchMockPathData(mRef.path)
    return new MockDataSnapshot(mRef, data)
  }
  return realDb.get(query)
}

export async function set(reference: any, value: unknown): Promise<void> {
  if (isMockDbActive() || isMockObject(reference)) {
    const mRef =
      reference instanceof MockDatabaseReference
        ? reference
        : new MockDatabaseReference(new MockDatabase(), '')
    await mutateMockPathData('set', mRef.path, value === undefined ? null : value)
    return
  }
  return realDb.set(reference, value)
}

export async function update(reference: any, values: object): Promise<void> {
  if (isMockDbActive() || isMockObject(reference)) {
    const mRef =
      reference instanceof MockDatabaseReference
        ? reference
        : new MockDatabaseReference(new MockDatabase(), '')
    await mutateMockPathData('update', mRef.path, values || {})
    return
  }
  return realDb.update(reference, values)
}

export async function remove(reference: any): Promise<void> {
  if (isMockDbActive() || isMockObject(reference)) {
    const mRef =
      reference instanceof MockDatabaseReference
        ? reference
        : new MockDatabaseReference(new MockDatabase(), '')
    await mutateMockPathData('remove', mRef.path)
    return
  }
  return realDb.remove(reference)
}

export function push(parent: any, value?: unknown): any {
  if (isMockDbActive() || isMockObject(parent)) {
    const baseRef =
      parent instanceof MockDatabaseReference
        ? parent
        : new MockDatabaseReference(new MockDatabase(), '')
    const newKey = generateFirebasePushId()
    const pushedRef = new MockDatabaseReference(baseRef.db, joinDbPath(baseRef.path, newKey))

    const writePromise: Promise<MockDatabaseReference> =
      value !== undefined
        ? mutateMockPathData('set', pushedRef.path, value).then(() => pushedRef)
        : Promise.resolve(pushedRef)

    return Object.assign(pushedRef, {
      then: writePromise.then.bind(writePromise),
      catch: writePromise.catch.bind(writePromise)
    })
  }
  return realDb.push(parent, value)
}

export function onValue(
  query: any,
  callback: (snapshot: any) => unknown,
  cancelCallbackOrListenOptions?: ((error: Error) => unknown) | realDb.ListenOptions,
  options?: realDb.ListenOptions
): realDb.Unsubscribe {
  if (isMockDbActive() || isMockObject(query)) {
    const mRef =
      query instanceof MockDatabaseReference
        ? query
        : new MockDatabaseReference(new MockDatabase(), '')
    const cancelCb =
      typeof cancelCallbackOrListenOptions === 'function'
        ? (cancelCallbackOrListenOptions as (error: Error) => void)
        : undefined
    const listenOpts =
      typeof cancelCallbackOrListenOptions === 'object'
        ? cancelCallbackOrListenOptions
        : options

    if (listenOpts?.onlyOnce) {
      fetchMockPathData(mRef.path)
        .then((data) => callback(new MockDataSnapshot(mRef, data)))
        .catch((err) => cancelCb && cancelCb(err))
      return () => {}
    }

    const id = nextListenerId++
    const entry: ListenerEntry = {
      id,
      ref: mRef,
      path: mRef.path,
      callback: callback as (snap: any) => void,
      errorCallback: cancelCb
    }
    activeListeners.set(id, entry)

    fetchMockPathData(mRef.path)
      .then((data) => {
        if (activeListeners.has(id)) {
          callback(new MockDataSnapshot(mRef, data))
        }
      })
      .catch((err) => {
        if (activeListeners.has(id) && cancelCb) {
          cancelCb(err)
        }
      })

    return () => {
      activeListeners.delete(id)
    }
  }

  return realDb.onValue(query, callback, cancelCallbackOrListenOptions as any, options as any)
}

export function off(
  query?: any,
  eventType?: realDb.EventType,
  callback?: (snapshot: any, previousChildName?: string | null) => unknown
): void {
  if (isMockDbActive() || isMockObject(query)) {
    if (!query) {
      activeListeners.clear()
      return
    }
    const targetPath =
      query instanceof MockDatabaseReference ? query.path : normalizeDbPath(String(query))
    for (const [id, entry] of activeListeners.entries()) {
      if (entry.path === targetPath && (!callback || entry.callback === callback)) {
        activeListeners.delete(id)
      }
    }
    return
  }
  return realDb.off(query, eventType, callback)
}
