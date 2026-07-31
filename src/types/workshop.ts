/** 单条练习记录 */
export interface PracticeEntry {
  id: string
  date: string
  course?: string
  phase: number
  title: string
  /** IndexedDB blobs store 中的图片引用（v2 起替代 imageDataUrl） */
  imageBlobId?: string
  reflections?: string[]
  selfRating?: number
}

/** 技能线进度 */
export interface SkillProgress {
  currentLevel: number
  completedAt: string[]
}

/** 完整 workshop 状态 */
export interface WorkshopState {
  skillProgress: Record<string, SkillProgress>
  practiceLog: PracticeEntry[]
  dailyStreak: number
  lastPracticeDate: string | null
  version: number
}

/** 技能树节点（用于 UI 渲染）*/
export interface SkillTreeNode {
  lineId: string
  lineName: string
  lineIcon: string
  level: number
  levelName: string
  description: string
  unlocked: boolean
  completed: boolean
  isCurrent: boolean
}
