import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { COURSES, detectCourseFromRoute, parsePhaseFromRoute } from '@/data/courses'
import { getChallenge } from '@/data/challenges'
import { loadPhase, phaseKey } from '@/content/loader'

const SITE_NAME = 'Cocos Creator 学习之路 — 像素飞机大战'

const titleCache = new Map<string, string>()

let current: { name: string; course: string; n: number } | null = null

function setMeta(name: string, content: string) {
  let meta = document.head.querySelector(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

function applyPhaseTitle(course: string, n: number, cached: string | undefined) {
  if (cached) {
    document.title = `第 ${n} 阶段 ${cached} · ${COURSES[course].label} — ${SITE_NAME}`
  } else {
    document.title = `${COURSES[course].label} · 第 ${n} 阶段 — ${SITE_NAME}`
  }
}

async function loadPhaseTitle(course: string, n: number) {
  const key = phaseKey(course, n)
  if (titleCache.has(key)) return
  const loaded = await loadPhase(course, n)
  titleCache.set(key, loaded?.title ?? '')
  // 若当前路由仍是该阶段，用真实标题刷新。
  if (current && current.course === course && current.n === n) {
    applyPhaseTitle(course, n, titleCache.get(key))
  }
}

/** 路由级 title/description 单一起源，afterEach 调用；阶段标题懒加载后自动刷新。 */
export function applyRouteMeta(to: RouteLocationNormalizedLoaded) {
  const name = to.name as string | undefined
  current = null

  if (name === 'home') {
    document.title = `像素画工坊 — ${SITE_NAME}`
  } else if (name && name in COURSES) {
    document.title = `${COURSES[name].label} — ${SITE_NAME}`
  } else if (name && name.startsWith('workshop')) {
    if (name === 'workshop-gallery') {
      document.title = `作品画廊 — ${SITE_NAME}`
    } else if (name === 'workshop-phase') {
      const n = parseInt((to.params.phase as string | undefined) ?? '', 10)
      const ch = Number.isNaN(n) ? undefined : getChallenge(n)
      document.title = ch ? `${ch.title} · 像素画工坊 — ${SITE_NAME}` : `像素画工坊 — ${SITE_NAME}`
    } else {
      document.title = `像素画工坊 — ${SITE_NAME}`
    }
  } else if (name) {
    const course = detectCourseFromRoute(name)
    const n = parsePhaseFromRoute(name)
    if (course && n) {
      current = { name, course, n }
      applyPhaseTitle(course, n, titleCache.get(phaseKey(course, n)))
      void loadPhaseTitle(course, n)
    }
  }

  setMeta('description', document.title)
}
