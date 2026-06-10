import { createRouter, createWebHashHistory } from 'vue-router'
import { makePhaseRoutes } from './routes'

const speedrunDayModules = import.meta.glob('../views/speedrun/Day*.vue')

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/speedrun/Landing.vue') },
    {
      path: '/cocos',
      name: 'cocos',
      component: () => import('@/views/cocos/Home.vue'),
    },
    ...makePhaseRoutes('cocos', 25),
    {
      path: '/art',
      name: 'art',
      component: () => import('@/views/art/Home.vue'),
    },
    ...makePhaseRoutes('art', 14),
    {
      path: '/audio',
      name: 'audio',
      component: () => import('@/views/audio/Home.vue'),
    },
    ...makePhaseRoutes('audio', 12),
    {
      path: '/engineering',
      name: 'engineering',
      component: () => import('@/views/engineering/Home.vue'),
    },
    ...makePhaseRoutes('engineering', 16),
    // Speedrun
    {
      path: '/speedrun',
      name: 'speedrun',
      component: () => import('@/views/speedrun/Landing.vue'),
    },
    ...Array.from({ length: 30 }, (_, i) => {
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
