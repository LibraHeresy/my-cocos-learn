import { reactive, ref, type Ref } from 'vue'
import type { WorkshopState, PracticeEntry, SkillProgress } from '@/types/workshop'
import { computeSkillLevels, SKILL_LINES } from '@/data/skill-tree'
import { CHALLENGES } from '@/data/challenges'
import { migrateV1ToV2 } from '@/utils/idb.migration'
import { idbBackend, type StorageBackend } from '@/stores/idb'

const STORAGE_KEY = '__workshop_state__'
const CURRENT_VERSION = 2
const PERSIST_DEBOUNCE_MS = 400

function makeDefaultState(): WorkshopState {
  const progress: Record<string, SkillProgress> = {}
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

/**
 * 从 localStorage 缓存同步读取（快速首帧 + last-known-good 兜底）。
 * 版本守卫：只接受已知版本（当前 {1,2}）；未知/更高版本才重置（防未来 schema 误解）。
 */
function loadLocal(): WorkshopState {
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

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** 剥离旧版内联 base64 字段（避免 base64 重新进入 localStorage 缓存） */
function stripLegacyImageUrls(s: WorkshopState): WorkshopState {
  const out = JSON.parse(JSON.stringify(s)) as WorkshopState
  for (const e of out.practiceLog) {
    delete (e as unknown as { imageDataUrl?: string }).imageDataUrl
  }
  return out
}

export interface WorkshopStore {
  readonly state: WorkshopState
  readonly saveError: Ref<string | null>
  hydrate(): Promise<void>
  flushPersist(): Promise<void>
  isBlobReferenced(id: string): boolean
  getAllCompletedChallenges(): number[]
  recomputeSkillProgress(): void
  updateStreak(): void
  addPractice(entry: Omit<PracticeEntry, 'id'>): PracticeEntry
  updatePractice(id: string, patch: Partial<PracticeEntry>): void
  removePractice(id: string): void
  getPracticeForPhase(phase: number): PracticeEntry | undefined
  getRecentPractices(limit?: number): PracticeEntry[]
  getGroupedPractices(): Map<string, PracticeEntry[]>
  getStats(): {
    totalPractices: number
    streak: number
    totalSkillLevels: number
    maxSkillLevels: number
    unlockedChallenges: number
    totalChallenges: number
  }
  getSkillProgress(): Record<string, number>
  useWorkshopState(): WorkshopState
}

function createStore(backend: StorageBackend): WorkshopStore {
  const loaded = loadLocal()
  // 同步把版本提升到 CURRENT_VERSION；旧 imageDataUrl 数据在内存中保留，待 hydrate 迁移
  const state = reactive<WorkshopState>({ ...loaded, version: CURRENT_VERSION })

  const saveError = ref<string | null>(null)
  let dirty = false
  let persistTimer: ReturnType<typeof setTimeout> | null = null
  let persistChain: Promise<void> = Promise.resolve()

  function saveLocal(s: WorkshopState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } catch {
      saveError.value = '本地缓存写入失败'
    }
  }

  function snapshot(): WorkshopState {
    return stripLegacyImageUrls(state)
  }

  /** 同步改镜像 → 立即刷新 localStorage 缓存（极小、无图）→ 防抖异步写 IDB */
  function persist() {
    dirty = true
    saveLocal(snapshot())
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => { void flushPersist() }, PERSIST_DEBOUNCE_MS)
  }

  function flushPersist(): Promise<void> {
    if (persistTimer) {
      clearTimeout(persistTimer)
      persistTimer = null
    }
    if (!dirty) return Promise.resolve()
    dirty = false
    const snap = snapshot()
    // 串行化：防止「后写先落盘」
    persistChain = persistChain.then(async () => {
      try {
        await backend.putState(snap)
        saveError.value = null
      } catch {
        dirty = true
        saveError.value = '保存失败，请稍后重试'
      }
    })
    return persistChain
  }

  async function hydrate() {
    try {
      const idbState = await backend.getState()
      const hasLegacyImages = state.practiceLog.some(
        (e) => typeof (e as unknown as { imageDataUrl?: string }).imageDataUrl === 'string',
      )

      // IDB 已有权威 v2 且用户未改动 → 直接用
      if (!dirty && idbState && idbState.version === CURRENT_VERSION) {
        Object.assign(state, idbState)
        saveLocal(snapshot())
        return
      }

      // 需要迁移：源取「当前镜像（可能已含用户改动）」优先，否则 IDB，否则缓存
      const source = dirty || hasLegacyImages
        ? (state as unknown as WorkshopState)
        : (idbState ?? loadLocal())
      const { state: migrated, blobs } = migrateV1ToV2(source)
      await backend.writeMigrated(migrated, blobs)

      if (dirty) {
        // 用户已改动：不整体覆盖，把迁移出的 blobId 合并进现有条目
        const byId = new Map(migrated.practiceLog.map((e) => [e.id, e]))
        for (const entry of state.practiceLog) {
          const m = byId.get(entry.id)
          if (m && m.imageBlobId) entry.imageBlobId = m.imageBlobId
          delete (entry as unknown as { imageDataUrl?: string }).imageDataUrl
        }
        state.version = CURRENT_VERSION
        saveLocal(snapshot())
        await backend.putState(snapshot())
      } else {
        Object.assign(state, migrated)
        saveLocal(snapshot())
      }
    } catch (e) {
      saveError.value = '数据初始化失败：' + (e instanceof Error ? e.message : String(e))
    }
  }

  function isBlobReferenced(id: string): boolean {
    return state.practiceLog.some((p) => p.imageBlobId === id)
  }

  // === 读取 ===

  function getAllCompletedChallenges(): number[] {
    const challenges = new Set<number>()
    for (const entry of state.practiceLog) {
      challenges.add(entry.phase)
    }
    return Array.from(challenges).sort((a, b) => a - b)
  }

  function getPracticeForPhase(phase: number): PracticeEntry | undefined {
    return state.practiceLog.find((p) => p.phase === phase)
  }

  function getRecentPractices(limit = 5): PracticeEntry[] {
    return [...state.practiceLog].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
  }

  function getGroupedPractices(): Map<string, PracticeEntry[]> {
    const groups = new Map<string, PracticeEntry[]>()
    const sorted = [...state.practiceLog].sort((a, b) => b.date.localeCompare(a.date))
    for (const entry of sorted) {
      const day = entry.date.slice(0, 10)
      if (!groups.has(day)) groups.set(day, [])
      groups.get(day)!.push(entry)
    }
    return groups
  }

  function getStats() {
    const completedChallenges = getAllCompletedChallenges()
    const skillLevels = computeSkillLevels(completedChallenges)
    let totalSkillLevels = 0
    for (const lv of Object.values(skillLevels)) {
      totalSkillLevels += lv
    }
    return {
      totalPractices: state.practiceLog.length,
      streak: state.dailyStreak,
      totalSkillLevels,
      maxSkillLevels: SKILL_LINES.reduce((s, l) => s + l.levels.length, 0),
      unlockedChallenges: completedChallenges.length,
      totalChallenges: CHALLENGES.length,
    }
  }

  function getSkillProgress(): Record<string, number> {
    return computeSkillLevels(getAllCompletedChallenges())
  }

  function recomputeSkillProgress() {
    const completedChallenges = getAllCompletedChallenges()
    const newLevels = computeSkillLevels(completedChallenges)
    for (const lineId of Object.keys(newLevels)) {
      const newLevel = newLevels[lineId]
      state.skillProgress[lineId].currentLevel = newLevel
      while (state.skillProgress[lineId].completedAt.length < newLevel) {
        state.skillProgress[lineId].completedAt.push(new Date().toISOString())
      }
      state.skillProgress[lineId].completedAt.length = newLevel
    }
  }

  function updateStreak() {
    const today = new Date().toISOString().slice(0, 10)
    const last = state.lastPracticeDate
    if (!last) {
      state.dailyStreak = 1
      state.lastPracticeDate = today
      return
    }
    if (last === today) return
    const lastDate = new Date(last)
    const todayDate = new Date(today)
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000)
    if (diffDays === 1) {
      state.dailyStreak += 1
    } else if (diffDays > 1) {
      state.dailyStreak = 1
    }
    state.lastPracticeDate = today
  }

  // === 写入 ===

  function addPractice(entry: Omit<PracticeEntry, 'id'>): PracticeEntry {
    const newEntry: PracticeEntry = {
      ...entry,
      id: generateId(),
      date: new Date().toISOString(),
    }

    // 检查该挑战是否已有记录
    const existingIdx = state.practiceLog.findIndex((p) => p.phase === entry.phase)
    if (existingIdx >= 0) {
      const old = state.practiceLog[existingIdx]
      // 图片被替换：删除旧 blob
      if (old.imageBlobId && old.imageBlobId !== newEntry.imageBlobId) {
        void backend.deleteBlob(old.imageBlobId).catch(() => {})
      }
      state.practiceLog[existingIdx] = newEntry
    } else {
      state.practiceLog.push(newEntry)
    }

    updateStreak()
    recomputeSkillProgress()
    persist()
    return newEntry
  }

  function updatePractice(id: string, patch: Partial<PracticeEntry>): void {
    const idx = state.practiceLog.findIndex((p) => p.id === id)
    if (idx < 0) return
    const old = state.practiceLog[idx]
    const next = { ...old, ...patch }
    // 图片被替换或清空：删除旧 blob
    if (old.imageBlobId && patch.imageBlobId !== old.imageBlobId) {
      void backend.deleteBlob(old.imageBlobId).catch(() => {})
    }
    state.practiceLog[idx] = next
    recomputeSkillProgress()
    persist()
  }

  function removePractice(id: string): void {
    const idx = state.practiceLog.findIndex((p) => p.id === id)
    if (idx < 0) return
    const old = state.practiceLog[idx]
    if (old.imageBlobId) {
      void backend.deleteBlob(old.imageBlobId).catch(() => {})
    }
    state.practiceLog.splice(idx, 1)
    recomputeSkillProgress()
    persist()
  }

  function useWorkshopState(): WorkshopState {
    return state
  }

  // 页面隐藏时尽力 flush（异步 IDB 在关页瞬间不可靠，localStorage 缓存已同步兜底）
  if (typeof window !== 'undefined') {
    const doFlush = () => { void flushPersist() }
    window.addEventListener('pagehide', doFlush)
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') doFlush()
    })
  }

  // 启动 hydrate（仅浏览器且 IDB 可用；node/vitest 环境跳过）
  if (typeof window !== 'undefined' && backend.isAvailable()) {
    void hydrate()
  }

  return {
    state,
    saveError,
    hydrate,
    flushPersist,
    isBlobReferenced,
    getAllCompletedChallenges,
    recomputeSkillProgress,
    updateStreak,
    addPractice,
    updatePractice,
    removePractice,
    getPracticeForPhase,
    getRecentPractices,
    getGroupedPractices,
    getStats,
    getSkillProgress,
    useWorkshopState,
  }
}

const store = createStore(idbBackend)

export const state = store.state
export const saveError = store.saveError
export const hydrate = store.hydrate
export const flushPersist = store.flushPersist
export const isBlobReferenced = store.isBlobReferenced
export const getAllCompletedChallenges = store.getAllCompletedChallenges
export const recomputeSkillProgress = store.recomputeSkillProgress
export const updateStreak = store.updateStreak
export const addPractice = store.addPractice
export const updatePractice = store.updatePractice
export const removePractice = store.removePractice
export const getPracticeForPhase = store.getPracticeForPhase
export const getRecentPractices = store.getRecentPractices
export const getGroupedPractices = store.getGroupedPractices
export const getStats = store.getStats
export const getSkillProgress = store.getSkillProgress
export const useWorkshopState = store.useWorkshopState
