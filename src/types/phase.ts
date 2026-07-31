export interface Phase {
  id: number
  icon: string
  title: string
  duration: string
  summary: string
  concepts: string[]
}

export interface PhaseGroup {
  label: string
  tagline: string
  phases: Phase[]
}

import type { DemoId } from '../demos/ids'

/** 内容块的一个片段：普通 HTML 或交互演示（:::demo 标记） */
export type ContentSegment =
  | { type: 'html'; html: string }
  | { type: 'demo'; id: DemoId; props?: Record<string, string> }

export interface BlockMdData {
  icon: string
  title: string
  segments: ContentSegment[]
}

export interface PhaseMdData {
  phase: number
  title: string
  duration: string
  blocks: BlockMdData[]
}
