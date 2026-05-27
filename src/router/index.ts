import { createRouter, createWebHashHistory } from 'vue-router'
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
  {
    path: '/cocos/phase/8',
    name: 'cocos-phase8',
    component: () => import('@/views/cocos/Phase8.vue'),
  },
  {
    path: '/cocos/phase/9',
    name: 'cocos-phase9',
    component: () => import('@/views/cocos/Phase9.vue'),
  },
  {
    path: '/cocos/phase/10',
    name: 'cocos-phase10',
    component: () => import('@/views/cocos/Phase10.vue'),
  },
  {
    path: '/cocos/phase/11',
    name: 'cocos-phase11',
    component: () => import('@/views/cocos/Phase11.vue'),
  },
  {
    path: '/cocos/phase/12',
    name: 'cocos-phase12',
    component: () => import('@/views/cocos/Phase12.vue'),
  },
  {
    path: '/cocos/phase/13',
    name: 'cocos-phase13',
    component: () => import('@/views/cocos/Phase13.vue'),
  },
  {
    path: '/cocos/phase/14',
    name: 'cocos-phase14',
    component: () => import('@/views/cocos/Phase14.vue'),
  },
  {
    path: '/cocos/phase/15',
    name: 'cocos-phase15',
    component: () => import('@/views/cocos/Phase15.vue'),
  },
  {
    path: '/cocos/phase/16',
    name: 'cocos-phase16',
    component: () => import('@/views/cocos/Phase16.vue'),
  },
  {
    path: '/cocos/phase/17',
    name: 'cocos-phase17',
    component: () => import('@/views/cocos/Phase17.vue'),
  },
  {
    path: '/cocos/phase/18',
    name: 'cocos-phase18',
    component: () => import('@/views/cocos/Phase18.vue'),
  },
  {
    path: '/cocos/phase/19',
    name: 'cocos-phase19',
    component: () => import('@/views/cocos/Phase19.vue'),
  },
  {
    path: '/cocos/phase/20',
    name: 'cocos-phase20',
    component: () => import('@/views/cocos/Phase20.vue'),
  },
  {
    path: '/cocos/phase/21',
    name: 'cocos-phase21',
    component: () => import('@/views/cocos/Phase21.vue'),
  },
  {
    path: '/cocos/phase/22',
    name: 'cocos-phase22',
    component: () => import('@/views/cocos/Phase22.vue'),
  },
  {
    path: '/cocos/phase/23',
    name: 'cocos-phase23',
    component: () => import('@/views/cocos/Phase23.vue'),
  },
  {
    path: '/cocos/phase/24',
    name: 'cocos-phase24',
    component: () => import('@/views/cocos/Phase24.vue'),
  },
  {
    path: '/cocos/phase/25',
    name: 'cocos-phase25',
    component: () => import('@/views/cocos/Phase25.vue'),
  },
  {
    path: '/cocos/phase/26',
    name: 'cocos-phase26',
    component: () => import('@/views/cocos/Phase26.vue'),
  },
  {
    path: '/cocos/phase/27',
    name: 'cocos-phase27',
    component: () => import('@/views/cocos/Phase27.vue'),
  },
  {
    path: '/cocos/phase/28',
    name: 'cocos-phase28',
    component: () => import('@/views/cocos/Phase28.vue'),
  },
  {
    path: '/cocos/phase/29',
    name: 'cocos-phase29',
    component: () => import('@/views/cocos/Phase29.vue'),
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
  {
    path: '/art/phase/5',
    name: 'art-phase5',
    component: () => import('@/views/art/Phase5.vue'),
  },
  {
    path: '/art/phase/6',
    name: 'art-phase6',
    component: () => import('@/views/art/Phase6.vue'),
  },
  {
    path: '/art/phase/7',
    name: 'art-phase7',
    component: () => import('@/views/art/Phase7.vue'),
  },
  {
    path: '/art/phase/8',
    name: 'art-phase8',
    component: () => import('@/views/art/Phase8.vue'),
  },
  {
    path: '/art/phase/9',
    name: 'art-phase9',
    component: () => import('@/views/art/Phase9.vue'),
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
  {
    path: '/audio/phase/5',
    name: 'audio-phase5',
    component: () => import('@/views/audio/Phase5.vue'),
  },
  {
    path: '/audio/phase/6',
    name: 'audio-phase6',
    component: () => import('@/views/audio/Phase6.vue'),
  },
  {
    path: '/audio/phase/7',
    name: 'audio-phase7',
    component: () => import('@/views/audio/Phase7.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
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
    {
      path: '/engineering',
      name: 'engineering',
      component: () => import('@/views/engineering/Home.vue'),
    },
    {
      path: '/engineering/phase/1',
      name: 'engineering-phase1',
      component: () => import('@/views/engineering/Phase1.vue'),
    },
    {
      path: '/engineering/phase/2',
      name: 'engineering-phase2',
      component: () => import('@/views/engineering/Phase2.vue'),
    },
    {
      path: '/engineering/phase/3',
      name: 'engineering-phase3',
      component: () => import('@/views/engineering/Phase3.vue'),
    },
    {
      path: '/engineering/phase/4',
      name: 'engineering-phase4',
      component: () => import('@/views/engineering/Phase4.vue'),
    },
    {
      path: '/engineering/phase/5',
      name: 'engineering-phase5',
      component: () => import('@/views/engineering/Phase5.vue'),
    },
    {
      path: '/engineering/phase/6',
      name: 'engineering-phase6',
      component: () => import('@/views/engineering/Phase6.vue'),
    },
    {
      path: '/engineering/phase/7',
      name: 'engineering-phase7',
      component: () => import('@/views/engineering/Phase7.vue'),
    },
    {
      path: '/engineering/phase/8',
      name: 'engineering-phase8',
      component: () => import('@/views/engineering/Phase8.vue'),
    },
    {
      path: '/engineering/phase/9',
      name: 'engineering-phase9',
      component: () => import('@/views/engineering/Phase9.vue'),
    },
    {
      path: '/engineering/phase/10',
      name: 'engineering-phase10',
      component: () => import('@/views/engineering/Phase10.vue'),
    },
    {
      path: '/engineering/phase/11',
      name: 'engineering-phase11',
      component: () => import('@/views/engineering/Phase11.vue'),
    },
    {
      path: '/engineering/phase/12',
      name: 'engineering-phase12',
      component: () => import('@/views/engineering/Phase12.vue'),
    },
    {
      path: '/engineering/phase/13',
      name: 'engineering-phase13',
      component: () => import('@/views/engineering/Phase13.vue'),
    },
    {
      path: '/engineering/phase/14',
      name: 'engineering-phase14',
      component: () => import('@/views/engineering/Phase14.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'instant' }
  },
})

export default router
