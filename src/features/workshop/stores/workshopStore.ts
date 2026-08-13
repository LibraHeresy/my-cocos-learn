import { reactive, ref, type Ref } from 'vue'
import type { WorkshopState, PracticeEntry } from '@/features/workshop/types/workshop'
import { computeSkillLevels, SKILL_LINES } from '@/features/workshop/data/skill-tree'
import { CHALLENGES } from '@/features/workshop/data/challenges'
import { idbBackend, type StorageBackend } from '@/features/workshop/stores/idb'
import { createWorkshopPersistence, loadWorkshopLocalState } from '@/features/workshop/stores/workshopPersistence'

const CURRENT_VERSION = 2

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
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
  const loaded = loadWorkshopLocalState()
  const state = reactive<WorkshopState>({ ...loaded, version: CURRENT_VERSION })
  const saveError = ref<string | null>(null)

  const persistence = createWorkshopPersistence(backend, () => state, (message) => {
    saveError.value = message
  })

  function isBlobReferenced(id: string): boolean {
    return state.practiceLog.some((p) => p.imageBlobId === id)
  }

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
      maxSkillLevels: SKILL_LINES.reduce((sum, line) => sum + line.levels.length, 0),
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
      const progress = state.skillProgress[lineId] ?? { currentLevel: 0, completedAt: [] }
      progress.currentLevel = newLevel
      while (progress.completedAt.length < newLevel) {
        progress.completedAt.push(new Date().toISOString())
      }
      progress.completedAt.length = newLevel
      state.skillProgress[lineId] = progress
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

  function addPractice(entry: Omit<PracticeEntry, 'id'>): PracticeEntry {
    const newEntry: PracticeEntry = {
      ...entry,
      id: generateId(),
      date: new Date().toISOString(),
    }

    const existingIdx = state.practiceLog.findIndex((p) => p.phase === entry.phase)
    if (existingIdx >= 0) {
      const old = state.practiceLog[existingIdx]
      if (old.imageBlobId && old.imageBlobId !== newEntry.imageBlobId) {
        void backend.deleteBlob(old.imageBlobId).catch(() => {})
      }
      state.practiceLog[existingIdx] = newEntry
    } else {
      state.practiceLog.push(newEntry)
    }

    updateStreak()
    recomputeSkillProgress()
    persistence.markDirty()
    return newEntry
  }

  function updatePractice(id: string, patch: Partial<PracticeEntry>): void {
    const idx = state.practiceLog.findIndex((p) => p.id === id)
    if (idx < 0) return
    const old = state.practiceLog[idx]
    const next = { ...old, ...patch }
    if (old.imageBlobId && patch.imageBlobId !== old.imageBlobId) {
      void backend.deleteBlob(old.imageBlobId).catch(() => {})
    }
    state.practiceLog[idx] = next
    recomputeSkillProgress()
    persistence.markDirty()
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
    persistence.markDirty()
  }

  function useWorkshopState(): WorkshopState {
    return state
  }

  if (typeof window !== 'undefined') {
    const doFlush = () => {
      void persistence.flush()
    }
    window.addEventListener('pagehide', doFlush)
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') doFlush()
    })
  }

  if (typeof window !== 'undefined' && backend.isAvailable()) {
    void persistence.hydrate(state)
  }

  return {
    state,
    saveError,
    hydrate: () => persistence.hydrate(state),
    flushPersist: () => persistence.flush(),
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
