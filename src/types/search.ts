/** 单个可检索文档（阶段或工坊挑战） */
export interface SearchRecord {
  type: 'phase' | 'challenge'
  course: string
  /** phase 类型：阶段号 */
  phase?: number
  /** challenge 类型：挑战 id */
  id?: number
  url: string
  title: string
  icon?: string
  duration?: string
  blocks: { title: string; icon?: string }[]
  /** 检索正文（构建期拼接，截断到合理长度） */
  text: string
}

/** 静态倒排索引（构建期生成，见 vite.config.ts searchIndexPlugin） */
export interface SearchIndex {
  version: number
  docs: SearchRecord[]
  /** bigram/词 → docId 列表 */
  bigrams: Record<string, number[]>
}
