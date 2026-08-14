import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { buildSync } from 'esbuild'
import { createMarkdown, parsePhaseMd, phaseToSearchText } from './src/content/pipeline'
import type { PhaseMdData } from './src/features/courses/types/phase'
import type { Challenge } from './src/features/workshop/data/challenges'
import { COURSE_LIST } from './src/features/courses/data/courses'

const md = createMarkdown()

const PHASE_META_ID = '\0virtual:phase-meta'

/** 在 Node 侧动态读取纯数据 TS 模块（esbuild 打包后 import）。 */
async function loadTsData<T>(entryPoint: string, aliasRoot: string): Promise<T> {
  const outfile = path.join(
    os.tmpdir(),
    `load-ts-data-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`,
  )
  buildSync({
    entryPoints: [entryPoint],
    bundle: true,
    format: 'esm',
    outfile,
    alias: { '@': aliasRoot },
  })
  return (await import(pathToFileURL(outfile).href)) as T
}

/* ---------------- md 解析共享缓存（M16：buildStart 与 transform 只解析一次） ---------------- */
interface CachedPhase {
  code: string
  parsed: PhaseMdData
}
const mdParseCache = new Map<string, CachedPhase>()

function normPath(p: string): string {
  return p.replace(/\\/g, '/')
}

function parsePhaseCached(filePath: string, code: string): PhaseMdData {
  const key = normPath(filePath)
  const hit = mdParseCache.get(key)
  if (hit && hit.code === code) return hit.parsed
  const parsed = parsePhaseMd(code, md)
  mdParseCache.set(key, { code, parsed })
  return parsed
}

function readPhaseFile(courseId: string, phase: number): PhaseMdData | null {
  const fileName = `phase-${String(phase).padStart(2, '0')}.md`
  const abs = path.resolve('src/content', courseId, fileName)
  let raw: string
  try {
    raw = fs.readFileSync(abs, 'utf8')
  } catch {
    return null
  }
  return parsePhaseCached(abs, raw)
}

function phaseMdPlugin() {
  return {
    name: 'phase-md',
    transform(code: string, id: string) {
      if (!normPath(id).includes('/src/content/') || !id.endsWith('.md')) return
      const parsed = parsePhaseCached(id, code)
      return {
        code: `export default ${JSON.stringify(parsed)}`,
        map: null,
      }
    },
  }
}

function searchIndexPlugin(): Plugin {
  return {
    name: 'search-index',
    async buildStart() {
      try {
        const docs: unknown[] = []

        // Phase documents：以 COURSE_LIST 为单一来源枚举（不再扫目录，避免与 courses.ts 漂移）
        for (const course of COURSE_LIST) {
          for (let n = 1; n <= course.phaseCount; n++) {
            const parsed = readPhaseFile(course.id, n)
            if (!parsed) continue
            docs.push({
              type: 'phase',
              course: course.id,
              phase: n,
              url: `/${course.id}/phase/${n}`,
              title: parsed.title,
              icon: course.icon,
              text: phaseToSearchText(parsed),
            })
          }
        }

        // Workshop challenges.
        const { CHALLENGES } = await loadTsData<{ CHALLENGES: Challenge[] }>(
          'src/features/workshop/data/challenges.ts',
          path.resolve('src'),
        )
        for (const ch of CHALLENGES) {
          const text = [
            ch.title,
            ch.prompt,
            ...ch.constraints,
            ...ch.selfCheck.map((s) => s.question),
            ch.skillReward ? ch.skillReward.capability : '',
            ...ch.helpRefs.map((r) => r.label),
          ].join(' ').slice(0, 1200)
          docs.push({
            type: 'challenge',
            course: 'workshop',
            id: ch.id,
            url: `/workshop/phase/${ch.id}`,
            title: ch.title,
            icon: ch.icon,
            text,
          })
        }

        const index = {
          version: 1,
          builtAt: new Date().toISOString(),
          records: docs,
        }
        const outFile = path.resolve('public/search-index.json')
        fs.mkdirSync(path.dirname(outFile), { recursive: true })
        fs.writeFileSync(outFile, JSON.stringify(index))
        console.log(`[search-index] ${docs.length} docs -> public/search-index.json`)

        // Sitemap（Web History 后 URL 可收录；站点地址通过 SITE_URL 注入，默认 GitHub Pages 项目页）
        const siteUrl = process.env.SITE_URL ?? 'https://libraheresy.github.io/my-cocos-learn'
        const sitemap = buildSitemap(siteUrl, CHALLENGES.length)
        fs.writeFileSync(path.resolve('public/sitemap.xml'), sitemap)
        console.log(`[sitemap] -> public/sitemap.xml`)
      } catch (e) {
        console.warn('[search-index] index generation failed (build unaffected):', e)
      }
    },
  }
}

/** 生成 sitemap.xml：全部课程首页 + 阶段页 + 工坊首页/画廊/挑战。 */
function buildSitemap(siteUrl: string, challengeCount: number): string {
  const urls: string[] = ['/', '/workshop', '/workshop/gallery']
  for (const course of COURSE_LIST) {
    urls.push(course.path)
    for (let n = 1; n <= course.phaseCount; n++) {
      urls.push(`${course.path}/phase/${n}`)
    }
  }
  for (let id = 1; id <= challengeCount; id++) {
    urls.push(`/workshop/phase/${id}`)
  }
  const base = siteUrl.replace(/\/+$/, '')
  const lastmod = new Date().toISOString().slice(0, 10)
  const items = urls
    .map((u) => `  <url><loc>${base}${u}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`
}

/** GitHub Pages SPA fallback：构建期生成带 base 的 404.html（深层路径 404 时保存路径并跳回站点根）。 */
function ghPagesSpaPlugin(): Plugin {
  let base = '/'
  return {
    name: 'gh-pages-spa',
    configResolved(config) {
      base = config.base || '/'
    },
    async writeBundle() {
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8" /><title>404 — 页面不存在</title></head>
<body>
<script>
  ;(function () {
    // GitHub Pages 无 SPA fallback：保存真实路径后跳回站点根，由 index.html 恢复并交给 Vue Router
    var root = location.origin + ${JSON.stringify(base)}
    sessionStorage.setItem('gh-pages-redirect', location.pathname + location.search + location.hash)
    location.replace(root)
  })()
<\/script>
</body>
</html>
`
      await fs.promises.writeFile(path.resolve('dist/404.html'), html)
      console.log('[gh-pages-spa] -> dist/404.html')
    },
  }
}

/** virtual:phase-meta —— 构建期把 md frontmatter（title/duration）与 COURSE_HOME_CONFIG
 *  （icon/summary/concepts）合并成首页/路由标题的单一数据源。 */
function phaseMetaPlugin(): Plugin {
  return {
    name: 'phase-meta',
    resolveId(id) {
      if (id === 'virtual:phase-meta') return PHASE_META_ID
      return null
    },
    async load(id) {
      if (id !== PHASE_META_ID) return null
      try {
        const { COURSE_HOME_CONFIG } = await loadTsData<{
          COURSE_HOME_CONFIG: Record<
            string,
            {
              phaseGroups: {
                phases: { id: number; icon: string; summary: string; concepts: string[] }[]
              }[]
            }
          >
        }>('src/features/courses/data/course-home.ts', path.resolve('src'))

        const index: Record<string, Record<number, unknown>> = {}
        for (const [courseId, cfg] of Object.entries(COURSE_HOME_CONFIG)) {
          const phases: Record<number, unknown> = {}
          for (const group of cfg.phaseGroups) {
            for (const p of group.phases) {
              const parsed = readPhaseFile(courseId, p.id)
              phases[p.id] = {
                title: parsed?.title ?? '',
                duration: parsed?.duration ?? '',
                icon: p.icon,
                summary: p.summary,
                concepts: p.concepts,
              }
            }
          }
          index[courseId] = phases
        }
        return `export default ${JSON.stringify(index)}`
      } catch (e) {
        console.warn('[phase-meta] generation failed:', e)
        return 'export default {}'
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), phaseMdPlugin(), searchIndexPlugin(), phaseMetaPlugin(), ghPagesSpaPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 构建/启动时间戳：作为搜索索引的缓存失效版本号（每次部署后老用户自动拉到新索引）
  define: {
    __SEARCH_INDEX_VERSION__: JSON.stringify(String(Date.now())),
  },
  server: {
    port: 7777,
  },
})
