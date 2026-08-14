import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { COURSES, detectCourseFromRoute, parsePhaseFromRoute } from '@/features/courses/data/courses'
import { getChallenge } from '@/features/workshop/data/challenges'
import phaseMeta from 'virtual:phase-meta'

const SITE_NAME = 'Cocos Creator 学习之路 — 像素飞机大战'

function setMeta(name: string, content: string) {
  let meta = document.head.querySelector(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

/** 设置 Open Graph 属性（og:title 等），供社交平台分享卡片使用。 */
function setPropertyMeta(property: string, content: string) {
  let meta = document.head.querySelector(`meta[property="${property}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('property', property)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

/** canonical 指向当前完整 URL（Web History 模式下无 hash，可被搜索引擎收录）。 */
function setCanonical(url: string) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

/** 路由级 title/description/OG 单一起源，afterEach 调用。
 *  阶段标题直接查构建期生成的 virtual:phase-meta（不再为取标题动态 import 整份 md chunk）。 */
export function applyRouteMeta(to: RouteLocationNormalizedLoaded) {
  const name = to.name as string | undefined

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
      const title = phaseMeta[course]?.[n]?.title
      document.title = title
        ? `第 ${n} 阶段 ${title} · ${COURSES[course].label} — ${SITE_NAME}`
        : `${COURSES[course].label} · 第 ${n} 阶段 — ${SITE_NAME}`
    }
  }

  setMeta('description', document.title)
  setPropertyMeta('og:title', document.title)
  setPropertyMeta('og:description', document.title)
  setPropertyMeta('og:url', window.location.href)
  setCanonical(window.location.href)
}
