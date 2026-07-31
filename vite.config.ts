import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { pathToFileURL } from 'node:url'
import { buildSync } from 'esbuild'
import { splitSegments } from './src/utils/markdownSegments'
import { tokenize } from './src/utils/tokenize'
import type { Challenge } from './src/data/challenges'

const md = MarkdownIt({ html: true })

function phaseMdPlugin() {
  return {
    name: 'phase-md',
    transform(code: string, id: string) {
      if (!id.includes('/src/content/') || !id.endsWith('.md')) return

      const { data, content } = matter(code)
      const blocks = content
        .split(/^## /m)
        .filter(Boolean)
        .map((block) => {
          const newlineIdx = block.indexOf('\n')
          const heading = newlineIdx === -1 ? block : block.slice(0, newlineIdx).trim()
          const body = newlineIdx === -1 ? '' : block.slice(newlineIdx + 1).trim()
          const iconMatch = heading.match(/^(\p{Emoji_Presentation}|\p{Emoji}️?)\s*/u)
          const icon = iconMatch ? iconMatch[0].trim() : '📄'
          const title = iconMatch ? heading.slice(iconMatch[0].length) : heading
          // 按 `:::demo <id>` 标记切分：html 段交给 md.render，demo 段由前端渲染真实组件
          return { icon, title, segments: splitSegments(body, md) }
        })
        .filter((b) => b.title.length > 0)

      const result = {
        phase: data.phase ?? 0,
        title: data.title ?? '',
        duration: data.duration ?? '',
        blocks,
      }

      return {
        code: `export default ${JSON.stringify(result)}`,
        map: null,
      }
    },
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * 构建期生成全文搜索倒排索引 → public/search-index.json（gitignore）。
 * 扫描 src/content/**&#47;*.md + src/data/challenges.ts（纯数据，esbuild 打包后动态 import）。
 */
function searchIndexPlugin(): Plugin {
  return {
    name: 'search-index',
    async buildStart() {
      try {
        const docs: unknown[] = []

        // 1) 阶段文档
        const contentDir = path.resolve('src/content')
        for (const course of fs.readdirSync(contentDir)) {
          const courseDir = path.join(contentDir, course)
          if (!fs.statSync(courseDir).isDirectory()) continue
          for (const file of fs.readdirSync(courseDir)) {
            if (!file.endsWith('.md')) continue
            const raw = fs.readFileSync(path.join(courseDir, file), 'utf8')
            const { data, content } = matter(raw)
            const n = parseInt(file.match(/phase-(\d+)/)?.[1] ?? '0', 10)
            const blocks = content
              .split(/^## /m)
              .filter(Boolean)
              .map((block) => {
                const nl = block.indexOf('\n')
                const heading = (nl === -1 ? block : block.slice(0, nl)).trim()
                const body = nl === -1 ? '' : block.slice(nl + 1)
                return { heading, html: md.render(body) }
              })
            const text = blocks.map((b) => `${b.heading} ${stripHtml(b.html)}`).join(' ').slice(0, 4000)
            docs.push({
              type: 'phase',
              course,
              phase: n,
              url: `/${course}/phase/${n}`,
              title: data.title ?? '',
              icon: '',
              duration: data.duration ?? '',
              blocks: blocks.map((b) => ({ title: b.heading.replace(/^(\p{Emoji_Presentation}|\p{Emoji}️?)\s*/u, '').trim() })),
              text,
            })
          }
        }

        // 2) 工坊挑战（esbuild 打包纯数据 TS）
        const tmpOut = path.join(os.tmpdir(), `challenges-${process.pid}.mjs`)
        buildSync({
          entryPoints: ['src/data/challenges.ts'],
          bundle: true,
          format: 'esm',
          outfile: tmpOut,
          alias: { '@': path.resolve('src') },
        })
        const { CHALLENGES } = (await import(
          `${pathToFileURL(tmpOut).href}?t=${process.pid}`
        )) as { CHALLENGES: Challenge[] }
        for (const ch of CHALLENGES) {
          const text = [
            ch.title,
            ch.prompt,
            ...ch.constraints,
            ...ch.selfCheck.map((s) => s.question),
            ch.skillReward ? ch.skillReward.capability : '',
            ...ch.helpRefs.map((r) => r.label),
          ].join(' ').slice(0, 2000)
          docs.push({
            type: 'challenge',
            course: 'workshop',
            id: ch.id,
            url: `/workshop/phase/${ch.id}`,
            title: ch.title,
            icon: ch.icon,
            duration: '',
            blocks: [],
            text,
          })
        }

        // 3) bigram 倒排（Object.create(null)：防 __proto__/constructor 等 token 污染原型）
        const bigrams: Record<string, number[]> = Object.create(null)
        docs.forEach((doc, docId) => {
          const docObj = doc as { title: string; text: string }
          for (const t of tokenize(`${docObj.title} ${docObj.text}`)) {
            if (!bigrams[t]) bigrams[t] = []
            bigrams[t].push(docId)
          }
        })
        // 剪枝：出现在 >60% 文档中的高频 token 不具区分度，丢弃以控制索引体积
        const commonCutoff = Math.floor(docs.length * 0.6)
        for (const [t, ids] of Object.entries(bigrams)) {
          if (ids.length > commonCutoff) delete bigrams[t]
        }

        const index = { version: 1, docs, bigrams }
        const outFile = path.resolve('public/search-index.json')
        fs.mkdirSync(path.dirname(outFile), { recursive: true })
        fs.writeFileSync(outFile, JSON.stringify(index))
        console.log(`[search-index] ${docs.length} docs → public/search-index.json`)
      } catch (e) {
        console.warn('[search-index] 索引生成失败（不影响构建）：', e)
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), phaseMdPlugin(), searchIndexPlugin()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 7777,
  },
})
