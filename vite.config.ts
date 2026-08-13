import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { buildSync } from 'esbuild'
import { createMarkdown, parsePhaseMd, phaseToSearchText } from './src/content/pipeline'
import type { Challenge } from './src/features/workshop/data/challenges'

const md = createMarkdown()

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

function phaseMdPlugin() {
  return {
    name: 'phase-md',
    transform(code: string, id: string) {
      if (!id.includes('/src/content/') || !id.endsWith('.md')) return
      return {
        code: `export default ${JSON.stringify(parsePhaseMd(code, md))}`,
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

        // Phase documents.
        const contentDir = path.resolve('src/content')
        for (const course of fs.readdirSync(contentDir)) {
          const courseDir = path.join(contentDir, course)
          if (!fs.statSync(courseDir).isDirectory()) continue
          for (const file of fs.readdirSync(courseDir)) {
            if (!file.endsWith('.md')) continue
            const raw = fs.readFileSync(path.join(courseDir, file), 'utf8')
            const parsed = parsePhaseMd(raw, md)
            const n = parseInt(file.match(/phase-(\d+)/)?.[1] ?? '0', 10)
            docs.push({
              type: 'phase',
              course,
              phase: n,
              url: `/${course}/phase/${n}`,
              title: parsed.title,
              icon: '',
              duration: parsed.duration,
              blocks: parsed.blocks.map((b) => ({ title: b.title })),
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
            duration: '',
            blocks: [],
            text,
          })
        }

        const index = { version: 1, records: docs }
        const outFile = path.resolve('public/search-index.json')
        fs.mkdirSync(path.dirname(outFile), { recursive: true })
        fs.writeFileSync(outFile, JSON.stringify(index))
        console.log(`[search-index] ${docs.length} docs -> public/search-index.json`)
      } catch (e) {
        console.warn('[search-index] index generation failed (build unaffected):', e)
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), phaseMdPlugin(), searchIndexPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 7777,
  },
})
