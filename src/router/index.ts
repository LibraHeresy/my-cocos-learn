import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const phases: RouteRecordRaw[] = [
  { path: '/phase/1', name: 'phase1', component: () => import('@/views/Phase1.vue') },
  { path: '/phase/2', name: 'phase2', component: () => import('@/views/Phase2.vue') },
  { path: '/phase/3', name: 'phase3', component: () => import('@/views/Phase3.vue') },
  { path: '/phase/4', name: 'phase4', component: () => import('@/views/Phase4.vue') },
  { path: '/phase/5', name: 'phase5', component: () => import('@/views/Phase5.vue') },
  { path: '/phase/6', name: 'phase6', component: () => import('@/views/Phase6.vue') },
  { path: '/phase/7', name: 'phase7', component: () => import('@/views/Phase7.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/Home.vue') },
    ...phases,
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
