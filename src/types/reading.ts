/** 单门课程的阅读进度 */
export interface CourseReading {
  /** 已读完的阶段号（升序） */
  completed: number[]
  /** 最近读到的阶段 */
  lastPhase: number
  /** 最近一次阅读时间（ISO） */
  lastReadAt: string
}

/** 阅读进度整体状态（v1） */
export interface ReadingState {
  courses: Record<string, CourseReading>
  version: number
}
