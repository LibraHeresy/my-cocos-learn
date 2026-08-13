import { describe, it, expect } from 'vitest'
import { createMarkdown, parsePhaseMd } from '../pipeline'
import type { ContentSegment } from '../../features/courses/types/phase'

const md = createMarkdown()

function firstHtml(segments: ContentSegment[]): string {
  const segment = segments.find((s) => s.type === 'html')
  return segment && segment.type === 'html' ? segment.html : ''
}

function parse(body: string) {
  return parsePhaseMd(
    `---\nphase: 1\ntitle: test\nduration: 1 day\n---\n\n## 🧭 Test\n${body}\n`,
    md,
  )
}

describe('pipeline HTML sanitization', () => {
  it('strips script tags and event handler attributes', () => {
    const html = firstHtml(
      parse('<script>alert(1)</script>\n<img src="x.png" onerror="alert(1)">').blocks[0].segments,
    )
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
  })

  it('strips javascript: links', () => {
    const html = firstHtml(
      parse('<a href="javascript:alert(1)">click</a>').blocks[0].segments,
    )
    expect(html).not.toContain('javascript:')
  })

  it('keeps whitelisted markup', () => {
    const html = firstHtml(
      parse('<div class="tip-box">hello</div>\n\n| a | b |\n|---|---|\n| 1 | 2 |').blocks[0].segments,
    )
    expect(html).toContain('tip-box')
    expect(html).toContain('<table')
  })

  it('leaves demo segments untouched', () => {
    const segments = parse(':::demo palette').blocks[0].segments
    expect(segments[0]?.type).toBe('demo')
  })
})
