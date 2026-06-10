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

  it('converts fullwidth punctuation to hyphens in mixed content', () => {
    // （ ） ： —— are non-word chars, get converted to hyphens
    expect(slug('帧动画实战（上）')).toBe('帧动画实战-上')
    expect(slug('数值设计（上）——伤害公式')).toBe('数值设计-上-伤害公式')
    expect(slug('Phase 1：游戏引擎世界观')).toBe('phase-1-游戏引擎世界观')
  })

  it('strips leading/trailing whitespace', () => {
    expect(slug('  开始  ')).toBe('开始')
  })
})
