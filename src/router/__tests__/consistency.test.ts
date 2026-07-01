import { describe, it, expect } from 'vitest'
import { COURSES } from '@/data/courses'

const phaseModules = import.meta.glob('../../views/*/Phase*.vue')

describe('route-content consistency', () => {
  it('every course phase count matches actual files on disk', () => {
    for (const [id, meta] of Object.entries(COURSES)) {
      const actualCount = Object.keys(phaseModules).filter((p) =>
        p.includes(`/${id}/Phase`),
      ).length
      expect(actualCount, `${id}: files=${actualCount} vs COURSES.phaseCount=${meta.phaseCount}`).toBe(meta.phaseCount)
    }
  })

  it('no Phase files exist for unknown courses', () => {
    const knownIds = Object.keys(COURSES)
    const unknownFiles = Object.keys(phaseModules).filter((p) => {
      const m = p.match(/\/views\/(\w+)\/Phase/)
      return m && !knownIds.includes(m[1])
    })
    expect(unknownFiles, `orphan phase files: ${unknownFiles.join(', ')}`).toEqual([])
  })
})
