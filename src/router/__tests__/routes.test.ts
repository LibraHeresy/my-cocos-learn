import { describe, it, expect } from 'vitest'
import { makePhaseRoutes } from '@/router/routes'

describe('makePhaseRoutes', () => {
  it('generates correct number of routes', () => {
    expect(makePhaseRoutes('cocos', 3)).toHaveLength(3)
    expect(makePhaseRoutes('art', 1)).toHaveLength(1)
    expect(makePhaseRoutes('audio', 7)).toHaveLength(7)
  })

  it('generates correct path and name', () => {
    const routes = makePhaseRoutes('cocos', 3)
    expect(routes[0]).toMatchObject({ path: '/cocos/phase/1', name: 'cocos-phase1' })
    expect(routes[1]).toMatchObject({ path: '/cocos/phase/2', name: 'cocos-phase2' })
    expect(routes[2]).toMatchObject({ path: '/cocos/phase/3', name: 'cocos-phase3' })
  })

  it('works for engineering course', () => {
    const routes = makePhaseRoutes('engineering', 2)
    expect(routes[0].path).toBe('/engineering/phase/1')
    expect(routes[0].name).toBe('engineering-phase1')
  })

  it('returns empty array for count 0', () => {
    expect(makePhaseRoutes('cocos', 0)).toHaveLength(0)
    expect(makePhaseRoutes('cocos', 0)).toEqual([])
  })

  it('each route has a component function', () => {
    const routes = makePhaseRoutes('cocos', 1)
    expect(routes[0].component).toBeDefined()
  })
})
