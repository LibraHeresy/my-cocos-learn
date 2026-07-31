import type MarkdownIt from 'markdown-it'
import type { ContentSegment } from '../types/phase'
import type { DemoId } from '../demos/ids'

const DEMO_RE = /^:::demo\s+([a-z0-9-]+)(.*)$/

/**
 * 把 md 内容块正文按 `:::demo <id>` 标记切分成类型化 segment。
 * - fence-aware：``` 栅栏内的 `:::demo` 字面量不误切（文档约定：标记必须独立成行、不出现在代码块内）。
 * - html 段在切分后交给 md.render；demo 段不进 markdown 渲染。
 */
export function splitSegments(body: string, md: MarkdownIt): ContentSegment[] {
  const segments: ContentSegment[] = []
  const lines = body.split(/\r?\n/)
  let buffer: string[] = []
  let inFence = false

  function flush() {
    const text = buffer.join('\n').trim()
    if (text) {
      segments.push({ type: 'html', html: md.render(text) })
    }
    buffer = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) {
      buffer.push(line)
      inFence = !inFence
      continue
    }
    if (!inFence) {
      const m = trimmed.match(DEMO_RE)
      if (m) {
        flush()
        const id = m[1] as DemoId
        const props = parseProps(m[2])
        segments.push({ type: 'demo', id, ...(props ? { props } : {}) })
        continue
      }
    }
    buffer.push(line)
  }
  flush()
  return segments
}

function parseProps(raw: string): Record<string, string> | undefined {
  const text = raw.trim()
  if (!text) return undefined
  const props: Record<string, string> = {}
  for (const m of text.matchAll(/(\w+)=("([^"]*)"|(\S+))/g)) {
    props[m[1]] = m[3] ?? m[4] ?? ''
  }
  return Object.keys(props).length > 0 ? props : undefined
}
