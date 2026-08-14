import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createWorkshopPersistence, makeDefaultState } from '../workshopPersistence'
import type { StorageBackend } from '../idb'
import type { WorkshopState } from '../../types/workshop'

const STORAGE_KEY = '__workshop_state__'

// node 环境无内置 localStorage：用内存 mock 注入全局
const localStore = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => localStore.get(k) ?? null,
  setItem: (k: string, v: string) => {
    localStore.set(k, v)
  },
  removeItem: (k: string) => {
    localStore.delete(k)
  },
  clear: () => {
    localStore.clear()
  },
})

function createFakeBackend(initial: WorkshopState | null = null): StorageBackend {
  let state = initial
  const blobs = new Map<string, Blob>()
  return {
    isAvailable: () => true,
    getState: async () => state,
    putState: async (s) => {
      state = s
    },
    getBlob: async (id) => blobs.get(id) ?? null,
    putBlob: async (id, blob) => {
      blobs.set(id, blob)
    },
    deleteBlob: async (id) => {
      blobs.delete(id)
    },
    writeMigrated: async (s, entries) => {
      blobs.clear()
      for (const [id, blob] of entries) blobs.set(id, blob)
      state = s
    },
  }
}

/** v1 旧数据：内联 base64 图片（等待迁移） */
function makeV1State(): WorkshopState {
  return {
    version: 1,
    skillProgress: {},
    practiceLog: [
      { id: 'p1', date: '2026-01-01T00:00:00.000Z', phase: 1, title: '旧练习', imageDataUrl: 'data:image/png;base64,AAAA' },
    ],
    dailyStreak: 1,
    lastPracticeDate: '2026-01-01',
  } as unknown as WorkshopState
}

/** v2 新数据：图片已迁移为 blobId */
function makeV2State(): WorkshopState {
  return {
    version: 2,
    skillProgress: { color: { currentLevel: 1 } },
    practiceLog: [
      { id: 'p2', date: '2026-02-01T00:00:00.000Z', phase: 2, title: '新练习', imageBlobId: 'img-p2-abc' },
    ],
    dailyStreak: 2,
    lastPracticeDate: '2026-02-01',
  }
}

describe('workshopPersistence.hydrate 权威源判定', () => {
  beforeEach(() => {
    localStore.clear()
  })

  it('无镜像 + IDB v1：迁移 IDB 数据，默认态不覆盖', async () => {
    const backend = createFakeBackend(makeV1State())
    const target = makeDefaultState()
    const p = createWorkshopPersistence(backend, () => target, () => {})
    await p.hydrate(target)

    expect(target.practiceLog).toHaveLength(1)
    expect(target.practiceLog[0].phase).toBe(1)
    expect(target.version).toBe(2)
    expect((target.practiceLog[0] as { imageBlobId?: string }).imageBlobId).toBeTruthy()
  })

  it('镜像 v2 + IDB v1：优先镜像，不丢新数据（修复旧 IDB 覆盖新镜像）', async () => {
    const backend = createFakeBackend(makeV1State())
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeV2State()))
    const target = makeDefaultState()
    const p = createWorkshopPersistence(backend, () => target, () => {})
    await p.hydrate(target)

    expect(target.practiceLog.map((e) => e.phase)).toEqual([2])
    expect(target.version).toBe(2)
  })

  it('镜像 v2 + IDB v2：直接采用（数据一致）', async () => {
    const backend = createFakeBackend(makeV2State())
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeV2State()))
    const target = makeDefaultState()
    const p = createWorkshopPersistence(backend, () => target, () => {})
    await p.hydrate(target)

    expect(target.practiceLog.map((e) => e.phase)).toEqual([2])
  })

  it('镜像 v1 + IDB v2：优先更新的 IDB', async () => {
    const backend = createFakeBackend(makeV2State())
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeV1State()))
    const target = makeDefaultState()
    const p = createWorkshopPersistence(backend, () => target, () => {})
    await p.hydrate(target)

    expect(target.practiceLog.map((e) => e.phase)).toEqual([2])
    expect(target.version).toBe(2)
  })

  it('无镜像 + 无 IDB：默认态', async () => {
    const backend = createFakeBackend(null)
    const target = makeDefaultState()
    const p = createWorkshopPersistence(backend, () => target, () => {})
    await p.hydrate(target)

    expect(target.practiceLog).toHaveLength(0)
  })

  it('会话内已有改动（dirty）：不整体覆盖 state', async () => {
    const backend = createFakeBackend(makeV1State())
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeV2State()))
    const target = makeDefaultState()
    target.practiceLog.push({ id: 'new', date: '2026-03-01T00:00:00.000Z', phase: 3, title: '本会话新增' })
    const p = createWorkshopPersistence(backend, () => target, () => {})
    p.markDirty()
    await p.hydrate(target)

    // 本会话新增条目保留，不被镜像/IDB 覆盖
    expect(target.practiceLog.map((e) => e.phase)).toContain(3)
    expect(target.practiceLog.find((e) => e.id === 'new')).toBeTruthy()
  })
})
