import { describe, it, expect } from 'vitest'
import MarkdownIt from 'markdown-it'
import { splitSegments } from '@/utils/markdownSegments'

const md = MarkdownIt({ html: true })

describe('splitSegments', () => {
  it('splits a demo marker out of html', () => {
    const segs = splitSegments('hello\n\n:::demo palette\n\nworld', md)
    expect(segs).toHaveLength(3)
    expect(segs[1]).toEqual({ type: 'demo', id: 'palette' })
    if (segs[0].type === 'html') expect(segs[0].html).toContain('<p>hello</p>')
    if (segs[2].type === 'html') expect(segs[2].html).toContain('<p>world</p>')
  })

  it('parses k=v and quoted props', () => {
    const segs = splitSegments(':::demo palette mode=2color foo="a b"', md)
    expect(segs).toEqual([{ type: 'demo', id: 'palette', props: { mode: '2color', foo: 'a b' } }])
  })

  it('ignores :::demo inside code fences', () => {
    const segs = splitSegments('```\n:::demo palette\n```\nafter', md)
    expect(segs.filter((s) => s.type === 'demo')).toHaveLength(0)
    expect(segs.some((s) => s.type === 'html' && s.html.includes(':::demo palette'))).toBe(true)
  })

  it('preserves order for mixed content', () => {
    const segs = splitSegments('a\n:::demo easing-curves\nb\n:::demo waveform\nc', md)
    expect(segs.map((s) => s.type)).toEqual(['html', 'demo', 'html', 'demo', 'html'])
  })

  it('handles empty body', () => {
    expect(splitSegments('', md)).toEqual([])
  })
})
