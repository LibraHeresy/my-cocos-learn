/// <reference types="vite/client" />

/** vite.config.ts 注入的构建时间戳，用作搜索索引缓存失效版本号 */
declare const __SEARCH_INDEX_VERSION__: string

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '*.md' {
  import type { PhaseMdData } from '@/features/courses/types/phase'
  const data: PhaseMdData
  export default data
}

declare module 'virtual:phase-meta' {
  import type { PhaseMetaIndex } from '@/features/courses/types/phase-meta'
  const index: PhaseMetaIndex
  export default index
}
