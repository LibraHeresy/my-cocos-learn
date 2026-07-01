import { describe, it, expect } from 'vitest'
import { COURSES } from '@/data/courses'

const contentModules = import.meta.glob('../../content/*/phase-*.md')

describe('route-content consistency', () => {
  it('every course phase count matches actual .md files on disk', () => {
    for (const [id, meta] of Object.entries(COURSES)) {
      const actualCount = Object.keys(contentModules).filter((p) =>
        p.includes(`/content/${id}/phase-`),
      ).length
      expect(actualCount, `${id}: files=${actualCount} vs COURSES.phaseCount=${meta.phaseCount}`).toBe(meta.phaseCount)
    }
  })

  it('no .md files exist for unknown courses', () => {
    const knownIds = Object.keys(COURSES)
    const unknownFiles = Object.keys(contentModules).filter((p) => {
      const m = p.match(/\/content\/(\w+)\/phase-/)
      return m && !knownIds.includes(m[1])
    })
    expect(unknownFiles, `orphan content files: ${unknownFiles.join(', ')}`).toEqual([])
  })
})
