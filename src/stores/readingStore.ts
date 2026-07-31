import { reactive } from 'vue'
import type { ReadingState, CourseReading } from '@/types/reading'
import { loadVersioned, saveJSON } from '@/stores/storage'
import { getPhaseCount } from '@/data/courses'

const STORAGE_KEY = '__reading_state__'
const CURRENT_VERSION = 1

function makeDefault(): ReadingState {
  return { courses: {}, version: CURRENT_VERSION }
}

const state = reactive<ReadingState>(
  loadVersioned<ReadingState>(STORAGE_KEY, CURRENT_VERSION, makeDefault()),
)

function ensureCourse(course: string): CourseReading {
  if (!state.courses[course]) {
    state.courses[course] = { completed: [], lastPhase: 0, lastReadAt: '' }
  }
  return state.courses[course]
}

function persist() {
  saveJSON(STORAGE_KEY, state)
}

/** 记录一次访问（阶段页挂载时调用），驱动「继续学习」 */
export function recordVisit(course: string, phase: number) {
  const c = ensureCourse(course)
  c.lastPhase = phase
  c.lastReadAt = new Date().toISOString()
  persist()
}

export function isCompleted(course: string, phase: number): boolean {
  return state.courses[course]?.completed.includes(phase) ?? false
}

export function markCompleted(course: string, phase: number) {
  const c = ensureCourse(course)
  if (!c.completed.includes(phase)) {
    c.completed.push(phase)
    c.completed.sort((a, b) => a - b)
    persist()
  }
}

export function toggleCompleted(course: string, phase: number) {
  const c = ensureCourse(course)
  const idx = c.completed.indexOf(phase)
  if (idx >= 0) c.completed.splice(idx, 1)
  else c.completed.push(phase)
  c.completed.sort((a, b) => a - b)
  persist()
}

export function getCompleted(course: string): number[] {
  return [...(state.courses[course]?.completed ?? [])]
}

export function getProgress(course: string): { done: number; total: number } {
  const total = getPhaseCount(course)
  const done = getCompleted(course).filter((n) => n >= 1 && n <= total).length
  return { done, total }
}

/** 第一个未完成阶段（与工坊 currentStage 同逻辑） */
export function getNextPhase(course: string): number | null {
  const total = getPhaseCount(course)
  const done = new Set(getCompleted(course))
  for (let i = 1; i <= total; i++) {
    if (!done.has(i)) return i
  }
  return null
}

/** 全课程最近阅读位置，用于全局「继续学习」 */
export function getLastPosition(): { course: string; phase: number } | null {
  let best: { course: string; phase: number; at: string } | null = null
  for (const [course, c] of Object.entries(state.courses)) {
    if (!c.lastReadAt) continue
    if (!best || c.lastReadAt > best.at) {
      best = { course, phase: c.lastPhase, at: c.lastReadAt }
    }
  }
  return best ? { course: best.course, phase: best.phase } : null
}

export function useReadingState() {
  return state
}
