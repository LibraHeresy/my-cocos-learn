import { describe, it, expect } from 'vitest'
import { makePhaseRoutes } from '@/router/routes'
import { COURSES } from '@/data/courses'

describe('makePhaseRoutes', () => {
  it('generates correct number of routes for all courses matching courses.ts', () => {
    for (const [id, meta] of Object.entries(COURSES)) {
      expect(makePhaseRoutes(id, meta.phaseCount)).toHaveLength(meta.phaseCount)
    }
  })

  it('total phase count across all courses matches courses.ts phaseCounts', () => {
    const total = Object.values(COURSES).reduce((sum, m) => sum + makePhaseRoutes(m.id, m.phaseCount).length, 0)
    const expected = Object.values(COURSES).reduce((sum, m) => sum + m.phaseCount, 0)
    expect(total).toBe(expected)
  })

  it('generates correct path and name format', () => {
    const routes = makePhaseRoutes('cocos', 3)
    expect(routes[0]).toMatchObject({ path: '/cocos/phase/1', name: 'cocos-phase1' })
    expect(routes[1]).toMatchObject({ path: '/cocos/phase/2', name: 'cocos-phase2' })
    expect(routes[2]).toMatchObject({ path: '/cocos/phase/3', name: 'cocos-phase3' })
  })

  it('works for all course path prefixes', () => {
    expect(makePhaseRoutes('art', 1)[0].path).toBe('/art/phase/1')
    expect(makePhaseRoutes('audio', 1)[0].path).toBe('/audio/phase/1')
    expect(makePhaseRoutes('engineering', 1)[0].path).toBe('/engineering/phase/1')
  })

  it('returns empty array for count 0', () => {
    expect(makePhaseRoutes('cocos', 0)).toEqual([])
  })

  it('each generated route has a lazy component function', () => {
    const routes = makePhaseRoutes('cocos', 1)
    expect(routes[0].component).toBeInstanceOf(Function)
    // 验证是动态 import（返回 Promise 的工厂函数）
    expect(typeof routes[0].component).toBe('function')
  })

  it('phase numbers start at 1 and are sequential', () => {
    const routes = makePhaseRoutes('cocos', 5)
    const nums = routes.map(r => parseInt(r.path.split('/').pop()!))
    expect(nums).toEqual([1, 2, 3, 4, 5])
  })

  it('phase names use correct format: course-phaseN', () => {
    const routes = makePhaseRoutes('cocos', 3)
    expect(routes.map(r => r.name)).toEqual(['cocos-phase1', 'cocos-phase2', 'cocos-phase3'])

    const artRoutes = makePhaseRoutes('art', 2)
    expect(artRoutes.map(r => r.name)).toEqual(['art-phase1', 'art-phase2'])
  })
})
