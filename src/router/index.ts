import { createRouter, createWebHashHistory } from 'vue-router'
import { makePhaseRoutes } from './routes'
import { COURSE_LIST, SPEEDRUN } from '@/data/courses'

const speedrunDayModules = import.meta.glob('../views/speedrun/Day*.vue')

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/speedrun/Landing.vue') },
    ...COURSE_LIST.flatMap((c) => [
      {
        path: c.path,
        name: c.id,
        component: () => import(`@/views/${c.id}/Home.vue`),
      },
      ...makePhaseRoutes(c.id, c.phaseCount),
    ]),
    {
      path: '/speedrun',
      name: 'speedrun',
      component: () => import('@/views/speedrun/Landing.vue'),
    },
    ...Array.from({ length: SPEEDRUN.dayCount }, (_, i) => {
      const n = i + 1
      return {
        path: `/speedrun/day/${n}`,
        name: `speedrun-day${n}`,
        component: speedrunDayModules[`../views/speedrun/Day${n}.vue`],
      }
    }),
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'instant' as const }
  },
})

export default router
