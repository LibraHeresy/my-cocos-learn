/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '*.md' {
  interface BlockData {
    icon: string
    title: string
    html: string
  }

  interface PhaseData {
    phase: number
    title: string
    duration: string
    blocks: BlockData[]
  }

  const data: PhaseData
  export default data
}
