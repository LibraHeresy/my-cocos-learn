/**
 * 工坊状态 schema 版本——唯一来源。
 * workshopStore / workshopPersistence / idb.migration 全部引用此处，升级只改这一处。
 */
export const WORKSHOP_STATE_VERSION = 2

/** 自评星级上限（唯一来源，UI 各处引用） */
export const MAX_SELF_RATING = 5

/** 单条练习记录 */
export interface PracticeEntry {
  id: string
  date: string
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
