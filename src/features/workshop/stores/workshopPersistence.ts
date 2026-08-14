import { migrateV1ToV2 } from '@/features/workshop/utils/idb.migration'
import type { StorageBackend } from '@/features/workshop/stores/idb'
import { SKILL_LINES } from '@/features/workshop/data/skill-tree'
import type { WorkshopState } from '@/features/workshop/types/workshop'
import { WORKSHOP_STATE_VERSION } from '@/features/workshop/types/workshop'
import { loadJSON, saveJSON } from '@/stores/storage'
import { toRaw } from 'vue'

const STORAGE_KEY = '__workshop_state__'
const CURRENT_VERSION = WORKSHOP_STATE_VERSION
const PERSIST_DEBOUNCE_MS = 400
const LOCAL_MIRROR_DEBOUNCE_MS = 200

export function makeDefaultState(): WorkshopState {
  const progress: WorkshopState['skillProgress'] = {}
  for (const line of SKILL_LINES) {
    progress[line.id] = { currentLevel: 0 }
  }
  return {
    skillProgress: progress,
    practiceLog: [],
    dailyStreak: 0,
    lastPracticeDate: null,
    version: CURRENT_VERSION,
  }
}

/** 读 localStorage 镜像：复用共享适配器；版本语义为「≤ 当前版本可接受」（旧版数据交给迁移）。 */
function loadLocalState(): WorkshopState {
  const parsed = loadJSON<WorkshopState | null>(STORAGE_KEY, null)
  if (!parsed || typeof parsed.version !== 'number' || parsed.version > CURRENT_VERSION) {
    return makeDefaultState()
  }
  return parsed
}

function saveLocalState(state: WorkshopState): boolean {
  return saveJSON(STORAGE_KEY, state)
}

/** 是否存在 localStorage 镜像（区分「无镜像」与「默认空态」，避免默认态误判为最新 v2）。 */
function hasLocalState(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

/** 剥离旧版内联 base64 字段，避免 base64 重新进入 localStorage 缓存。 */
export function stripLegacyImageUrls(state: WorkshopState): WorkshopState {
  const out = structuredClone(toRaw(state)) as WorkshopState
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
  let localMirrorTimer: ReturnType<typeof setTimeout> | null = null
  let persistChain: Promise<void> = Promise.resolve()

  function snapshot(): WorkshopState {
    return stripLegacyImageUrls(getState())
  }

  /** 写 localStorage 镜像（防抖调用；失败可见）。 */
  function writeLocalMirror(): boolean {
    return saveLocalState(snapshot())
  }

  function markDirty() {
    dirty = true
    // localStorage 镜像同样防抖，避免连续编辑时每次同步 clone + stringify + 写盘。
    if (localMirrorTimer) clearTimeout(localMirrorTimer)
    localMirrorTimer = setTimeout(() => {
      localMirrorTimer = null
      if (!writeLocalMirror()) {
        onError('本地缓存写入失败')
      }
    }, LOCAL_MIRROR_DEBOUNCE_MS)
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
    // 兜底：把尚未落盘的镜像写掉（pagehide/visibilitychange 时调用）
    if (localMirrorTimer) {
      clearTimeout(localMirrorTimer)
      localMirrorTimer = null
      if (!writeLocalMirror()) {
        onError('本地缓存写入失败')
      }
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
      const mirror = loadLocalState()
      const mirrorExists = hasLocalState()

      // 权威源判定：会话内改动 > 镜像（每次变更先写镜像、时间上最新）> IDB > 默认态。
      // 镜像缺失时退回 IDB，避免默认空态覆盖 IDB v1 数据；镜像比 IDB 新时优先镜像，
      // 修复「IDB 旧版本覆盖 localStorage 新数据」的问题。
      let source: WorkshopState
      if (dirty || hasLegacyImages) {
        source = state as WorkshopState
      } else if (mirrorExists && mirror.version >= (idbState?.version ?? -1)) {
        source = mirror
      } else {
        source = idbState ?? mirror
      }

      // 已是当前版本：直接采用，无需迁移。
      if (source.version === CURRENT_VERSION && source !== state) {
        Object.assign(state, source)
        saveLocalState(snapshot())
        return
      }

      // 需要迁移（v1 → v2）。
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
