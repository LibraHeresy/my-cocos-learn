import { createRouter, createWebHistory } from 'vue-router'
import { makePhaseRoutes } from './routes'
import { COURSE_LIST } from '@/features/courses/data/courses'

// 4 门课程首页共用同一个配置驱动组件（数据来自 COURSE_HOME_CONFIG + virtual:phase-meta）
const courseHome = () => import('@/features/courses/components/CourseHome.vue')

const router = createRouter({
  // Web History：独立 URL 可被搜索引擎收录（hash 路由会让全部页面塌缩成一个 URL）。
  // 静态托管需 SPA fallback：GitHub Pages 用 public/404.html 重定向（构建期生成）。
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/features/workshop/views/WorkshopHome.vue') },
    ...COURSE_LIST.flatMap((c) => [
      {
        path: c.path,
        name: c.id,
        component: courseHome,
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
