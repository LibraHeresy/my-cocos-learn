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
