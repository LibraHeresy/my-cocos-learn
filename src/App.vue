<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { detectCourseFromRoute, getPhaseCount, COURSES } from '@/data/courses'

const router = useRouter()
const route = useRoute()

function getRouteInfo() {
  const name = route.name as string
  if (name === 'home') return { course: 'cocos', phase: null }
  // 课程首页路由名即课程 id
  if (name in COURSES) return { course: name, phase: null }
  const m = detectCourseFromRoute(name)
  if (m) return { course: m, phase: parseInt(name.match(/-phase(\d+)$/)![1]) }
  return { course: null, phase: null }
}

function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

  const { course, phase } = getRouteInfo()
  if (!course) return

  const maxPhase = getPhaseCount(course)

  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (phase === null) {
      router.push({ name: `${course}-phase${maxPhase}` })
    } else if (phase > 1) {
      router.push({ name: `${course}-phase${phase - 1}` })
    } else {
      if (course === 'cocos') router.push({ name: 'home' })
      else router.push({ name: course })
    }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (phase === null) {
      router.push({ name: `${course}-phase1` })
    } else if (phase < maxPhase) {
      router.push({ name: `${course}-phase${phase + 1}` })
    } else {
      if (course === 'cocos') router.push({ name: 'home' })
      else router.push({ name: course })
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <NavBar />
  <RouterView />
</template>
