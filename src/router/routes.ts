import type { RouteRecordRaw } from 'vue-router'

export function makePhaseRoutes(course: string, count: number): RouteRecordRaw[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1
    return {
      path: `/${course}/phase/${n}`,
      name: `${course}-phase${n}`,
      component: () => import('@/features/courses/components/PhasePage.vue'),
    }
  })
}
