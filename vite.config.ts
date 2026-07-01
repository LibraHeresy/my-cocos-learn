import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'

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
          return { icon, title, html: md.render(body) }
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

export default defineConfig({
  plugins: [vue(), phaseMdPlugin()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 7777,
  },
})
