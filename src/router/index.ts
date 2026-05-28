import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const phaseModules = import.meta.glob('../views/*/Phase*.vue')

function makePhaseRoutes(course: string, count: number): RouteRecordRaw[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1
    return {
      path: `/${course}/phase/${n}`,
      name: `${course}-phase${n}`,
      component: phaseModules[`../views/${course}/Phase${n}.vue`],
    }
  })
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/cocos/Home.vue') },
    { path: '/cocos', redirect: '/' },
    ...makePhaseRoutes('cocos', 29),
    {
      path: '/art',
      name: 'art',
      component: () => import('@/views/art/Home.vue'),
    },
    ...makePhaseRoutes('art', 9),
    {
      path: '/audio',
      name: 'audio',
      component: () => import('@/views/audio/Home.vue'),
    },
    ...makePhaseRoutes('audio', 7),
    {
      path: '/engineering',
      name: 'engineering',
      component: () => import('@/views/engineering/Home.vue'),
    },
    ...makePhaseRoutes('engineering', 14),
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'instant' as const }
  },
})

export default router
