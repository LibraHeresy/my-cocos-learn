import { describe, it, expect } from 'vitest'
import { COURSES } from '@/features/courses/data/courses'
import { COURSE_HOME_CONFIG } from '@/features/courses/data/course-home'
import { CHALLENGES } from '@/features/workshop/data/challenges'
import { getSkillLevelForChallenge } from '@/features/workshop/data/skill-tree'

const rawModules = import.meta.glob('../../content/*/phase-*.md', {
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

  it('every course home config covers exactly phases 1..phaseCount', () => {
    for (const [course, cfg] of Object.entries(COURSE_HOME_CONFIG)) {
      const meta = COURSES[course]
      expect(meta, `course "${course}" not in COURSES`).toBeTruthy()
      if (!meta) continue
      const ids = cfg.phaseGroups.flatMap((g) => g.phases.map((p) => p.id))
      expect(ids.length, `${course}: config phase count vs COURSES.phaseCount`).toBe(meta.phaseCount)
      for (let i = 1; i <= meta.phaseCount; i++) {
        expect(ids, `${course}: missing phase ${i}`).toContain(i)
      }
    }
  })

  it('every challenge skillReward belongs to a real skill-line level', () => {
    for (const ch of CHALLENGES) {
      if (!ch.skillReward) continue
      const levelInfo = getSkillLevelForChallenge(ch.skillReward.skillId, ch.id)
      expect(
        levelInfo,
        `challenge ${ch.id} skillReward skillId "${ch.skillReward.skillId}" not in any requiredChallenges of that skill line`,
      ).toBeTruthy()
    }
  })
})
