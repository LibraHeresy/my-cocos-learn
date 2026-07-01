import { createRouter, createWebHashHistory } from 'vue-router'
import { makePhaseRoutes } from './routes'
import { COURSE_LIST } from '@/data/courses'

const homeModules = import.meta.glob('../views/*/Home.vue')

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/workshop/WorkshopHome.vue') },
    ...COURSE_LIST.flatMap((c) => [
      {
        path: c.path,
        name: c.id,
        component: homeModules[`../views/${c.id}/Home.vue`],
      },
      ...makePhaseRoutes(c.id, c.phaseCount),
    ]),
    {
      path: '/workshop',
      name: 'workshop',
      component: () => import('@/views/workshop/WorkshopHome.vue'),
    },
    {
      path: '/workshop/gallery',
      name: 'workshop-gallery',
      component: () => import('@/views/workshop/GalleryView.vue'),
    },
    {
      path: '/workshop/phase/:phase',
      name: 'workshop-phase',
      component: () => import('@/views/workshop/WorkshopPhase.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'instant' as const }
  },
})

export default router
