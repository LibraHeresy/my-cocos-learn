import type { RouteRecordRaw } from 'vue-router'

const phaseModules = import.meta.glob('../views/*/Phase*.vue')

export function makePhaseRoutes(course: string, count: number): RouteRecordRaw[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1
    return {
      path: `/${course}/phase/${n}`,
      name: `${course}-phase${n}`,
      component: phaseModules[`../views/${course}/Phase${n}.vue`],
    }
  })
}
