import { createRouter, createWebHashHistory } from 'vue-router'
import { makePhaseRoutes } from './routes'
import { COURSE_LIST } from '@/features/courses/data/courses'

const homeModules = import.meta.glob('../features/courses/views/*/Home.vue')

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/features/workshop/views/WorkshopHome.vue') },
    ...COURSE_LIST.flatMap((c) => [
      {
        path: c.path,
        name: c.id,
        component: homeModules[`../features/courses/views/${c.id}/Home.vue`],
      },
      ...makePhaseRoutes(c.id, c.phaseCount),
    ]),
    {
      path: '/workshop',
      name: 'workshop',
      component: () => import('@/features/workshop/views/WorkshopHome.vue'),
    },
    {
      path: '/workshop/gallery',
      name: 'workshop-gallery',
      component: () => import('@/features/workshop/views/GalleryView.vue'),
    },
    {
      path: '/workshop/phase/:phase',
      name: 'workshop-phase',
      component: () => import('@/features/workshop/views/WorkshopPhase.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'instant' as const }
  },
})

export default router
