import { reactive } from 'vue'
import type { WorkshopState, PracticeEntry } from '@/types/workshop'
import { computeSkillLevels, SKILL_LINES } from '@/data/skill-tree'

const STORAGE_KEY = '__workshop_state__'
const MAX_IMAGE_SIZE = 500 * 1024

function makeDefaultState(): WorkshopState {
  const progress: Record<string, import('@/types/workshop').SkillProgress> = {}
  for (const line of SKILL_LINES) {
    progress[line.id] = { currentLevel: 0, completedAt: [] }
  }
  return {
    skillProgress: progress,
    practiceLog: [],
    dailyStreak: 0,
    lastPracticeDate: null,
    version: 1,
  }
}

function loadState(): WorkshopState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return makeDefaultState()
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== 1) return makeDefaultState()
    return parsed as WorkshopState
  } catch {
    return makeDefaultState()
  }
}

function saveState(state: WorkshopState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full
  }
}

const state = reactive<WorkshopState>(loadState())

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// === Public API ===

export function getAllCompletedChallenges(): number[] {
  const challenges = new Set<number>()
  for (const entry of state.practiceLog) {
    challenges.add(entry.phase)
  }
  return Array.from(challenges).sort((a, b) => a - b)
}

export function recomputeSkillProgress() {
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

export function updateStreak() {
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

export function addPractice(entry: Omit<PracticeEntry, 'id'>): PracticeEntry {
  const newEntry: PracticeEntry = {
    ...entry,
    id: generateId(),
    date: new Date().toISOString(),
  }

  if (newEntry.imageDataUrl && newEntry.imageDataUrl.length > MAX_IMAGE_SIZE) {
    newEntry.imageDataUrl = undefined
  }

  // check if this challenge already has a record
  const existingIdx = state.practiceLog.findIndex((p) => p.phase === entry.phase)
  if (existingIdx >= 0) {
    state.practiceLog[existingIdx] = newEntry
  } else {
    state.practiceLog.push(newEntry)
  }

  updateStreak()
  recomputeSkillProgress()
  saveState(state)
  return newEntry
}

export function updatePractice(id: string, patch: Partial<PracticeEntry>): void {
  const idx = state.practiceLog.findIndex((p) => p.id === id)
  if (idx < 0) return
  state.practiceLog[idx] = { ...state.practiceLog[idx], ...patch }
  recomputeSkillProgress()
  saveState(state)
}

export function removePractice(id: string): void {
  const idx = state.practiceLog.findIndex((p) => p.id === id)
  if (idx < 0) return
  state.practiceLog.splice(idx, 1)
  recomputeSkillProgress()
  saveState(state)
}

export function getPracticeForPhase(phase: number): PracticeEntry | undefined {
  return state.practiceLog.find((p) => p.phase === phase)
}

export function getRecentPractices(limit = 5): PracticeEntry[] {
  return [...state.practiceLog].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
}

export function getGroupedPractices(): Map<string, PracticeEntry[]> {
  const groups = new Map<string, PracticeEntry[]>()
  const sorted = [...state.practiceLog].sort((a, b) => b.date.localeCompare(a.date))
  for (const entry of sorted) {
    const day = entry.date.slice(0, 10)
    if (!groups.has(day)) groups.set(day, [])
    groups.get(day)!.push(entry)
  }
  return groups
}

export function getStats() {
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
    totalChallenges: 34,
  }
}

export function getSkillProgress(): Record<string, number> {
  const completedChallenges = getAllCompletedChallenges()
  return computeSkillLevels(completedChallenges)
}

export function useWorkshopState() {
  return state
}
