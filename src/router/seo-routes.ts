import { COURSE_LIST } from '@/data/courses'
import { CHALLENGES } from '@/data/challenges'

/**
 * 站点全部可索引的绝对路径（单一起源：由 COURSES + CHALLENGES 派生）。
 * 供预渲染脚本与 sitemap 生成共用；新增课程/阶段/挑战只改数据源即可自动纳入。
 */
export const SEO_ROUTES: string[] = [
  '/',
  ...COURSE_LIST.flatMap((c) => [
    c.path,
    ...Array.from({ length: c.phaseCount }, (_, i) => `${c.path}/phase/${i + 1}`),
  ]),
  '/workshop',
  '/workshop/gallery',
  ...CHALLENGES.map((ch) => `/workshop/phase/${ch.id}`),
]
