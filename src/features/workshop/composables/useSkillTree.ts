import { computed } from 'vue'
import { SKILL_LINES } from '@/features/workshop/data/skill-tree'
import { getSkillProgress } from '@/features/workshop/stores/workshopStore'
import type { SkillTreeNode } from '@/features/workshop/types/workshop'

export function useSkillTree() {

  const nodes = computed<SkillTreeNode[]>(() => {
    const result: SkillTreeNode[] = []
    const skillLevels = getSkillProgress()

    for (const line of SKILL_LINES) {
      const currentLevel = skillLevels[line.id] ?? 0
      for (const lv of line.levels) {
        const completed = lv.level <= currentLevel
        // unlocked: previous level completed, or first level
        const prevLevelCompleted = lv.level === 1 || (lv.level - 1) <= currentLevel
        const unlocked = prevLevelCompleted
        const isCurrent = unlocked && !completed

        result.push({
          lineId: line.id,
          lineName: line.name,
          lineIcon: line.icon,
          level: lv.level,
          levelName: lv.name,
          description: lv.description,
          unlocked,
          completed,
          isCurrent,
        })
      }
    }
    return result
  })

  const progress = computed(() => {
    const skillLevels = getSkillProgress()
    let completed = 0
    let total = 0
    for (const line of SKILL_LINES) {
      total += line.levels.length
      completed += skillLevels[line.id] ?? 0
    }
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
  })

  return { nodes, progress, skillLines: SKILL_LINES }
}
