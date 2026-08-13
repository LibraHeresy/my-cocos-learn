import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'
import sanitizeHtml from 'sanitize-html'
import { splitSegments } from '../utils/markdownSegments'
import type { BlockMdData, PhaseMdData } from '../features/courses/types/phase'

const DEFAULT_ICON = '📋'

/** 供构建期插件与测试共用的 markdown 渲染器工厂。 */
const ALLOWED_TAGS = [
  'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'strong', 'b', 'code', 'em', 'i', 'ul', 'ol', 'li',
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
  'a', 'img', 'span', 'br', 'hr',
]

const ALLOWED_ATTRIBUTES = {
  a: ['href', 'title'],
  img: ['src', 'alt', 'title'],
  '*': ['class'],
}

/** 清洗 markdown 渲染出的 HTML，只保留受信任的标签与属性。 */
function sanitizeRenderedHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
  })
}

export function createMarkdown(): MarkdownIt {
  return new MarkdownIt({ html: true })
}

/** 从 `## 标题` 中提取首个 emoji 作为图标，其余作为标题。 */
function parseHeading(heading: string): { icon: string; title: string } {
  const m = heading.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u)
  if (!m) return { icon: DEFAULT_ICON, title: heading.trim() }
  return { icon: m[0].trim(), title: heading.slice(m[0].length).trim() }
}

/** 解析阶段 Markdown（YAML frontmatter + `## 标题` 内容块）为页面数据。 */
export function parsePhaseMd(raw: string, md: MarkdownIt = createMarkdown()): PhaseMdData {
  const { data, content } = matter(raw)
  const blocks: BlockMdData[] = content
    .split(/^## /m)
    .filter(Boolean)
    .map((block) => {
      const newlineIdx = block.indexOf('\n')
      const heading = newlineIdx === -1 ? block : block.slice(0, newlineIdx).trim()
      const body = newlineIdx === -1 ? '' : block.slice(newlineIdx + 1).trim()
      const { icon, title } = parseHeading(heading)
      const segments = splitSegments(body, md).map((segment) =>
        segment.type === 'html'
          ? { ...segment, html: sanitizeRenderedHtml(segment.html) }
          : segment,
      )
      return { icon, title, segments }
    })
    .filter((b) => b.title.length > 0)

  return {
    phase: data.phase ?? 0,
    title: data.title ?? '',
    duration: data.duration ?? '',
    blocks,
  }
}

/** 去掉 HTML 标签，用于搜索索引正文提取。 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** 从已解析的阶段数据中提取可检索纯文本。 */
export function phaseToSearchText(parsed: PhaseMdData, maxLen = 2000): string {
  const parts: string[] = []
  for (const block of parsed.blocks) {
    parts.push(block.title)
    for (const segment of block.segments) {
      if (segment.type === 'html') parts.push(stripHtml(segment.html))
    }
  }
  return parts.join(' ').slice(0, maxLen)
}
