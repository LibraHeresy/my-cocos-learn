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

export interface BlockMdData {
  icon: string
  title: string
  html: string
}

export interface PhaseMdData {
  phase: number
  title: string
  duration: string
  blocks: BlockMdData[]
}
