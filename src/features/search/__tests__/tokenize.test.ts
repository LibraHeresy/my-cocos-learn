import { describe, it, expect } from 'vitest'
import { tokenize } from '../tokenize'

describe('tokenize', () => {
  it('splits latin words and identifiers', () => {
    expect(tokenize('Cocos Creator AABB cc.tween')).toEqual(['cocos', 'creator', 'aabb', 'cc.tween'])
  })

  it('generates bigrams for CJK', () => {
    const t = tokenize('帧驱动')
    expect(t).toContain('帧驱')
    expect(t).toContain('驱动')
  })

  it('handles mixed text and dedupes', () => {
    const t = tokenize('坐标系 坐标系')
    expect(t).toContain('坐标')
    expect(t).toContain('标系')
  })

  it('handles single CJK char', () => {
    expect(tokenize('画')).toContain('画')
  })

  it('lowercases ASCII', () => {
    expect(tokenize('WebGL')).toContain('webgl')
  })
})
