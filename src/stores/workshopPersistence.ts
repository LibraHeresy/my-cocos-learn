import { migrateV1ToV2 } from '@/utils/idb.migration'
import type { StorageBackend } from '@/stores/idb'
import { SKILL_LINES } from '@/data/skill-tree'
import type { WorkshopState } from '@/types/workshop'

const STORAGE_KEY = '__workshop_state__'
const CURRENT_VERSION = 2
const PERSIST_DEBOUNCE_MS = 400

export function makeDefaultState(): WorkshopState {
  const progress: WorkshopState['skillProgress'] = {}
  for (const line of SKILL_LINES) {
    progress[line.id] = { currentLevel: 0, completedAt: [] }
  }
  return {
    skillProgress: progress,
    practiceLog: [],
    dailyStreak: 0,
    lastPracticeDate: null,
    version: CURRENT_VERSION,
  }
}

function loadLocalState(): WorkshopState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return makeDefaultState()
    const parsed = JSON.parse(raw) as WorkshopState
    if (!parsed || typeof parsed.version !== 'number' || parsed.version > CURRENT_VERSION) {
      return makeDefaultState()
    }
    return parsed
  } catch {
    return makeDefaultState()
  }
}

function saveLocalState(state: WorkshopState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

/** 剥离旧版内联 base64 字段，避免 base64 重新进入 localStorage 缓存。 */
export function stripLegacyImageUrls(state: WorkshopState): WorkshopState {
  const out = JSON.parse(JSON.stringify(state)) as WorkshopState
  for (const entry of out.practiceLog) {
    delete (entry as unknown as { imageDataUrl?: string }).imageDataUrl
  }
  return out
}

export interface WorkshopPersistence {
  markDirty(): void
  flush(): Promise<void>
  hydrate(state: WorkshopState): Promise<void>
}

/** 负责 localStorage 同步缓存 + IndexedDB 防抖落盘 + v1->v2 迁移。 */
export function createWorkshopPersistence(
  backend: StorageBackend,
  getState: () => WorkshopState,
  onError: (message: string | null) => void,
): WorkshopPersistence {
  let dirty = false
  let persistTimer: ReturnType<typeof setTimeout> | null = null
  let persistChain: Promise<void> = Promise.resolve()

  function snapshot(): WorkshopState {
    return stripLegacyImageUrls(getState())
  }

  function markDirty() {
    dirty = true
    if (!saveLocalState(snapshot())) {
      onError('本地缓存写入失败')
    }
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      void flush()
    }, PERSIST_DEBOUNCE_MS)
  }

  function flush(): Promise<void> {
    if (persistTimer) {
      clearTimeout(persistTimer)
      persistTimer = null
    }
    if (!dirty) return Promise.resolve()
    dirty = false
    const snap = snapshot()
    // 串行化，防止“后写先落盘”。
    persistChain = persistChain.then(async () => {
      try {
        await backend.putState(snap)
        onError(null)
      } catch {
        dirty = true
        onError('保存失败，请稍后重试')
      }
    })
    return persistChain
  }

  async function hydrate(state: WorkshopState) {
    try {
      const idbState = await backend.getState()
      const hasLegacyImages = state.practiceLog.some(
        (entry) => typeof (entry as unknown as { imageDataUrl?: string }).imageDataUrl === 'string',
      )

      // IDB 已有权威 v2 且用户未改动 -> 直接使用。
      if (!dirty && idbState && idbState.version === CURRENT_VERSION) {
        Object.assign(state, idbState)
        saveLocalState(snapshot())
        return
      }

      // 需要迁移：源取“当前镜像（可能已含用户改动）”优先，否则 IDB，否则缓存。
      const source = dirty || hasLegacyImages ? (state as WorkshopState) : (idbState ?? loadLocalState())
      const { state: migrated, blobs } = migrateV1ToV2(source)
      await backend.writeMigrated(migrated, blobs)

      if (dirty) {
        // 用户已改动：不整体覆盖，把迁移出的 blobId 合并进现有条目。
        const byId = new Map(migrated.practiceLog.map((entry) => [entry.id, entry]))
        for (const entry of state.practiceLog) {
          const matched = byId.get(entry.id)
          if (matched && matched.imageBlobId) entry.imageBlobId = matched.imageBlobId
          delete (entry as unknown as { imageDataUrl?: string }).imageDataUrl
        }
        state.version = CURRENT_VERSION
        saveLocalState(snapshot())
        await backend.putState(snapshot())
      } else {
        Object.assign(state, migrated)
        saveLocalState(snapshot())
      }
    } catch (e) {
      onError('数据初始化失败：' + (e instanceof Error ? e.message : String(e)))
    }
  }

  return { markDirty, flush, hydrate }
}

/** 供 store 启动时同步读取 localStorage 缓存（快速首屏 + last-known-good 兜底）。 */
export function loadWorkshopLocalState(): WorkshopState {
  return loadLocalState()
}
