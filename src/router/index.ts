import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const cocosPhases: RouteRecordRaw[] = [
  {
    path: '/cocos/phase/1',
    name: 'cocos-phase1',
    component: () => import('@/views/cocos/Phase1.vue'),
  },
  {
    path: '/cocos/phase/2',
    name: 'cocos-phase2',
    component: () => import('@/views/cocos/Phase2.vue'),
  },
  {
    path: '/cocos/phase/3',
    name: 'cocos-phase3',
    component: () => import('@/views/cocos/Phase3.vue'),
  },
  {
    path: '/cocos/phase/4',
    name: 'cocos-phase4',
    component: () => import('@/views/cocos/Phase4.vue'),
  },
  {
    path: '/cocos/phase/5',
    name: 'cocos-phase5',
    component: () => import('@/views/cocos/Phase5.vue'),
  },
  {
    path: '/cocos/phase/6',
    name: 'cocos-phase6',
    component: () => import('@/views/cocos/Phase6.vue'),
  },
  {
    path: '/cocos/phase/7',
    name: 'cocos-phase7',
    component: () => import('@/views/cocos/Phase7.vue'),
  },
]

const artPhases: RouteRecordRaw[] = [
  {
    path: '/art/phase/1',
    name: 'art-phase1',
    component: () => import('@/views/art/Phase1.vue'),
  },
  {
    path: '/art/phase/2',
    name: 'art-phase2',
    component: () => import('@/views/art/Phase2.vue'),
  },
  {
    path: '/art/phase/3',
    name: 'art-phase3',
    component: () => import('@/views/art/Phase3.vue'),
  },
  {
    path: '/art/phase/4',
    name: 'art-phase4',
    component: () => import('@/views/art/Phase4.vue'),
  },
]

const audioPhases: RouteRecordRaw[] = [
  {
    path: '/audio/phase/1',
    name: 'audio-phase1',
    component: () => import('@/views/audio/Phase1.vue'),
  },
  {
    path: '/audio/phase/2',
    name: 'audio-phase2',
    component: () => import('@/views/audio/Phase2.vue'),
  },
  {
    path: '/audio/phase/3',
    name: 'audio-phase3',
    component: () => import('@/views/audio/Phase3.vue'),
  },
  {
    path: '/audio/phase/4',
    name: 'audio-phase4',
    component: () => import('@/views/audio/Phase4.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/cocos/Home.vue') },
    { path: '/cocos', redirect: '/' },
    ...cocosPhases,
    {
      path: '/art',
      name: 'art',
      component: () => import('@/views/art/Home.vue'),
    },
    ...artPhases,
    {
      path: '/audio',
      name: 'audio',
      component: () => import('@/views/audio/Home.vue'),
    },
    ...audioPhases,
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
