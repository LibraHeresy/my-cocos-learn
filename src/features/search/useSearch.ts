import MiniSearch from 'minisearch'
import type { SearchIndex, SearchRecord } from './types'
import { tokenize } from './tokenize'

let indexPromise: Promise<SearchIndex> | null = null
let searcherPromise: Promise<MiniSearch> | null = null
let recordMap: Map<string, SearchRecord> | null = null

function loadIndex(): Promise<SearchIndex> {
  if (!indexPromise) {
    // ?v= 用构建时间戳做缓存失效：每次部署后老用户强制拉到新索引
    indexPromise = fetch(`${import.meta.env.BASE_URL}search-index.json?v=${__SEARCH_INDEX_VERSION__}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .catch(() => {
        // 失败不缓存结果，下次搜索自动重试
        indexPromise = null
        return { version: 0, records: [] as SearchRecord[] }
      })
  }
  return indexPromise
}

function getSearcher(): Promise<MiniSearch> {
  if (!searcherPromise) {
    searcherPromise = loadIndex().then((index) => {
      recordMap = new Map(index.records.map((r) => [r.url, r]))
      const searcher = new MiniSearch({
        fields: ['title', 'text'],
        idField: 'id',
        tokenize: (text: string) => tokenize(text),
      })
      searcher.addAll(index.records.map((r) => ({ id: r.url, title: r.title, text: r.text })))
      return searcher
    })
  }
  return searcherPromise
}

export interface SearchResult {
  record: SearchRecord
  snippet: string
}

function makeSnippet(doc: SearchRecord, query: string, terms: string[]): string {
  const candidates = [query, ...terms].filter(Boolean)
  const lower = doc.text.toLowerCase()
  for (const candidate of candidates) {
    const idx = lower.indexOf(candidate.toLowerCase())
    if (idx >= 0) {
      const start = Math.max(0, idx - 20)
      const end = Math.min(doc.text.length, idx + candidate.length + 40)
      return `…${doc.text.slice(start, end)}…`
    }
  }
  return doc.text.slice(0, 80)
}

export async function search(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (!q) return []

  const searcher = await getSearcher()
  const hits = searcher.search(q, {
    boost: { title: 3 },
    prefix: true,
  })

  const results: SearchResult[] = []
  for (const hit of hits.slice(0, 12)) {
    const record = recordMap?.get(hit.id as string)
    if (!record) continue
    results.push({ record, snippet: makeSnippet(record, q, hit.terms ?? []) })
  }
  return results
}
