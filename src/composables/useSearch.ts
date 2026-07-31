import type { SearchIndex, SearchRecord } from '@/types/search'
import { tokenize } from '@/utils/tokenize'

let indexPromise: Promise<SearchIndex> | null = null

function loadIndex(): Promise<SearchIndex> {
  if (!indexPromise) {
    indexPromise = fetch(`${import.meta.env.BASE_URL}search-index.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .catch(() => ({ version: 0, docs: [], bigrams: {} }))
  }
  return indexPromise
}

export interface SearchResult {
  record: SearchRecord
  snippet: string
}

function makeSnippet(doc: SearchRecord, q: string): string {
  const idx = doc.text.indexOf(q)
  if (idx < 0) return doc.text.slice(0, 80)
  const start = Math.max(0, idx - 20)
  return `…${doc.text.slice(start, idx + q.length + 40)}…`
}

/** 倒排检索：Σidf（df 小者加权）+ 标题/整句命中加成；单字符回退子串扫描 */
export async function search(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (!q) return []
  const index = await loadIndex()
  if (!index.docs.length) return []

  const qTokens = tokenize(q)
  const scores = new Map<number, number>()
  const docCount = index.docs.length

  if (qTokens.length > 0) {
    for (const t of qTokens) {
      const hits = index.bigrams[t] ?? []
      const idf = Math.log((docCount + 1) / (hits.length + 1)) + 1
      for (const docId of hits) {
        scores.set(docId, (scores.get(docId) ?? 0) + idf)
      }
    }
  }

  // 单字符 / 短查询回退：全文子串扫描（索引只覆盖 bigram）
  if (q.length <= 1 || qTokens.length === 0) {
    index.docs.forEach((doc, docId) => {
      if (doc.title.includes(q) || doc.text.includes(q)) {
        scores.set(docId, (scores.get(docId) ?? 0) + 3)
      }
    })
  }

  // 标题命中加成
  index.docs.forEach((doc, docId) => {
    if (doc.title.includes(q)) scores.set(docId, (scores.get(docId) ?? 0) + 5)
  })

  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)

  const results: SearchResult[] = []
  for (const [docId] of ranked) {
    const doc = index.docs[docId]
    if (doc) results.push({ record: doc, snippet: makeSnippet(doc, q) })
  }
  return results
}

/** 测试/热更新时清缓存 */
export function resetSearchCache() {
  indexPromise = null
}
