/** 单个阶段的首页展示元数据：title/duration 由构建期从 md frontmatter 合并（virtual:phase-meta），
 *  icon/summary/concepts 来自 COURSE_HOME_CONFIG。 */
export interface PhaseMeta {
  title: string
  duration: string
  icon: string
  summary: string
  concepts: string[]
}

/** 课程 id → 阶段号 → 元数据（构建期生成，virtual:phase-meta 提供） */
export interface PhaseMetaIndex {
  [course: string]: Record<number, PhaseMeta>
}
