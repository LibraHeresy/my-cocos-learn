import { describe, it, expect } from 'vitest'
import { slug } from '@/utils/slug'

describe('slug', () => {
  it('leaves CJK text unchanged', () => {
    expect(slug('微信小游戏篇')).toBe('微信小游戏篇')
  })

  it('lowercases and replaces spaces with hyphens', () => {
    expect(slug('Hello World')).toBe('hello-world')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slug('  A B  ')).toBe('a-b')
  })

  it('returns empty string for empty input', () => {
    expect(slug('')).toBe('')
  })

  it('replaces consecutive non-word chars with a single hyphen', () => {
    expect(slug('foo---bar')).toBe('foo-bar')
  })

  it('returns empty string for all-special-chars input', () => {
    expect(slug('!@#$%')).toBe('')
  })

  it('preserves CJK and lowers ASCII mixed together', () => {
    expect(slug('Cocos入门-101')).toBe('cocos入门-101')
  })
})
