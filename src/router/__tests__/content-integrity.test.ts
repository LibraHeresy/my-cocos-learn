import { describe, it, expect } from 'vitest'
import { COURSES } from '@/features/courses/data/courses'
import { CHALLENGES } from '@/features/workshop/data/challenges'

const rawModules = import.meta.glob('../../content/*/phase-*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const homeModules = import.meta.glob('../../features/courses/views/*/Home.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/

function parseFrontmatter(raw: string): Record<string, string> {
  const text = raw.replace(/\r\n/g, '\n')
  const m = text.match(FRONTMATTER_RE)
  if (!m) return {}
  const out: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([A-Za-z]+):\s*(.*)$/)
    if (mm) out[mm[1]] = mm[2]
  }
  return out
}

describe('content integrity', () => {
  it('every phase md has complete frontmatter with phase matching filename', () => {
    expect(Object.keys(rawModules).length).toBeGreaterThan(0)
    for (const [path, raw] of Object.entries(rawModules)) {
      const fm = parseFrontmatter(raw)
      expect(fm.phase, `${path}: missing phase`).toBeTruthy()
      expect(fm.title, `${path}: missing title`).toBeTruthy()
      expect(fm.duration, `${path}: missing duration`).toBeTruthy()
      const m = path.match(/phase-(\d+)\.md$/)
      if (m) {
        expect(Number(fm.phase), `${path}: frontmatter phase !== filename`).toBe(Number(m[1]))
      }
    }
  })

  it('every challenge helpRef points to an existing course phase', () => {
    expect(CHALLENGES.length).toBeGreaterThan(0)
    for (const ch of CHALLENGES) {
      for (const ref of ch.helpRefs) {
        const meta = COURSES[ref.course]
        expect(meta, `challenge ${ch.id} helpRef course "${ref.course}" unknown`).toBeTruthy()
        if (meta) {
          expect(ref.phase, `challenge ${ch.id} helpRef ${ref.course}/${ref.phase}`).toBeGreaterThanOrEqual(1)
          expect(ref.phase, `challenge ${ch.id} helpRef ${ref.course}/${ref.phase}`).toBeLessThanOrEqual(meta.phaseCount)
        }
      }
    }
  })

  it('every course home phaseGroups max phase id matches COURSES.phaseCount', () => {
    expect(Object.keys(homeModules).length).toBeGreaterThan(0)
    for (const [path, src] of Object.entries(homeModules)) {
      const course = path.match(/views\/(\w+)\/Home\.vue$/)?.[1]
      if (!course || course === 'workshop' || !COURSES[course]) continue
      const ids = [...src.matchAll(/\bid:\s*(\d+),/g)].map((m) => Number(m[1]))
      const maxId = Math.max(...ids)
      expect(maxId, `${course}: phaseGroups max id vs phaseCount`).toBe(COURSES[course].phaseCount)
    }
  })
})
