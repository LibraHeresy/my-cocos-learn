import type { WorkshopState } from '@/types/workshop'

/**
 * IndexedDB 存储层 —— 薄 Promise 封装，不依赖 Vue 响应式。
 *
 * 设计要点（长期可拓展）：
 * - 'state' store：整条工坊状态单记录（不含图片字节，极小），key 固定。
 * - 'blobs' store：媒体无关（blobId → Blob），当前存图片，将来音频/视频/导出素材复用。
 * - 迁移原子性：writeMigrated 用「跨 state+blobs 的单事务」一次写入。
 * - 失败可见：所有写操作把错误 reject 出来，由调用方上报 saveError，绝不静默。
 */
export interface StorageBackend {
  isAvailable(): boolean
  getState(): Promise<WorkshopState | null>
  putState(state: WorkshopState): Promise<void>
  getBlob(id: string): Promise<Blob | null>
  putBlob(id: string, blob: Blob): Promise<void>
  deleteBlob(id: string): Promise<void>
  /** 原子迁移：blobs + state 同事务写入 */
  writeMigrated(state: WorkshopState, blobs: Array<[string, Blob]>): Promise<void>
}

const DB_NAME = 'pixel-workshop-db'
const DB_VERSION = 2
const STATE_KEY = 'workshop'
const STATE_STORE = 'state'
const BLOB_STORE = 'blobs'

function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) return Promise.reject(new Error('IndexedDB 不可用'))
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STATE_STORE)) db.createObjectStore(STATE_STORE)
        if (!db.objectStoreNames.contains(BLOB_STORE)) db.createObjectStore(BLOB_STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

function toPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function onTxDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export const idbBackend: StorageBackend = {
  isAvailable: isIndexedDbAvailable,

  async getState() {
    if (!isIndexedDbAvailable()) return null
    const db = await openDb()
    const tx = db.transaction([STATE_STORE], 'readonly')
    const result = await toPromise(tx.objectStore(STATE_STORE).get(STATE_KEY))
    return (result as WorkshopState | undefined) ?? null
  },

  async putState(state) {
    if (!isIndexedDbAvailable()) throw new Error('IndexedDB 不可用')
    const db = await openDb()
    const tx = db.transaction([STATE_STORE], 'readwrite')
    tx.objectStore(STATE_STORE).put(state, STATE_KEY)
    await onTxDone(tx)
  },

  async getBlob(id) {
    if (!isIndexedDbAvailable()) return null
    const db = await openDb()
    const tx = db.transaction([BLOB_STORE], 'readonly')
    const result = await toPromise(tx.objectStore(BLOB_STORE).get(id))
    return (result as Blob | undefined) ?? null
  },

  async putBlob(id, blob) {
    if (!isIndexedDbAvailable()) throw new Error('IndexedDB 不可用')
    const db = await openDb()
    const tx = db.transaction([BLOB_STORE], 'readwrite')
    tx.objectStore(BLOB_STORE).put(blob, id)
    await onTxDone(tx)
  },

  async deleteBlob(id) {
    if (!isIndexedDbAvailable()) return
    const db = await openDb()
    const tx = db.transaction([BLOB_STORE], 'readwrite')
    tx.objectStore(BLOB_STORE).delete(id)
    await onTxDone(tx)
  },

  async writeMigrated(state, blobs) {
    if (!isIndexedDbAvailable()) throw new Error('IndexedDB 不可用')
    const db = await openDb()
    const tx = db.transaction([STATE_STORE, BLOB_STORE], 'readwrite')
    for (const [id, blob] of blobs) {
      tx.objectStore(BLOB_STORE).put(blob, id)
    }
    tx.objectStore(STATE_STORE).put(state, STATE_KEY)
    await onTxDone(tx)
  },
}

// 具名便捷导出（实现内部不使用 this，可安全直接引用）
export const getBlob = idbBackend.getBlob
export const putBlob = idbBackend.putBlob
export const deleteBlob = idbBackend.deleteBlob
