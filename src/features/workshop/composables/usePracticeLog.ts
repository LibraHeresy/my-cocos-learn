import { computed } from 'vue'
import {
  useWorkshopState,
  addPractice as storeAddPractice,
  updatePractice as storeUpdatePractice,
  removePractice as storeRemovePractice,
  getPracticeForPhase,
  getRecentPractices,
  getGroupedPractices,
} from '@/features/workshop/stores/workshopStore'
import type { PracticeEntry } from '@/features/workshop/types/workshop'

export function usePracticeLog() {
  const state = useWorkshopState()

  const entries = computed<PracticeEntry[]>(() => {
    return [...state.practiceLog].sort((a, b) => b.date.localeCompare(a.date))
  })

  const groupedEntries = computed(() => {
    return getGroupedPractices()
  })

  const recentEntries = computed(() => {
    return getRecentPractices(5)
  })

  const stats = computed(() => {
    let totalRating = 0
    let ratingCount = 0
    for (const e of state.practiceLog) {
      if (e.selfRating) {
        totalRating += e.selfRating
        ratingCount++
      }
    }
    return {
      total: state.practiceLog.length,
      avgRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null,
    }
  })

  function addPractice(entry: Omit<PracticeEntry, 'id'>): PracticeEntry {
    return storeAddPractice(entry)
  }

  function updatePractice(id: string, patch: Partial<PracticeEntry>): void {
    storeUpdatePractice(id, patch)
  }

  function removePractice(id: string): void {
    storeRemovePractice(id)
  }

  function getPhasePractice(phase: number): PracticeEntry | undefined {
    return getPracticeForPhase(phase)
  }

  return {
    entries,
    groupedEntries,
    recentEntries,
    stats,
    addPractice,
    updatePractice,
    removePractice,
    getPhasePractice,
  }
}
