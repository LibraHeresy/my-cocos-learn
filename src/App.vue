<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { saveError } from '@/stores/workshopStore'
import { detectCourseFromRoute, getPhaseCount, parsePhaseFromRoute, COURSES } from '@/data/courses'

const router = useRouter()
const route = useRoute()

function getRouteInfo() {
  const name = route.name
  if (!name || typeof name !== 'string') return { course: null, phase: null }
  if (name === 'home') return { course: 'cocos', phase: null }
  // 课程首页路由名即课程 id
  if (name in COURSES) return { course: name, phase: null }
  const m = detectCourseFromRoute(name)
  if (m) return { course: m, phase: parsePhaseFromRoute(name) ?? 0 }
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
      router.push(COURSES[course].courseHome)
    }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (phase === null) {
      router.push({ name: `${course}-phase1` })
    } else if (phase < maxPhase) {
      router.push({ name: `${course}-phase${phase + 1}` })
    } else {
      router.push(COURSES[course].courseHome)
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
  <div v-if="saveError" class="save-error-toast" role="alert">{{ saveError }}</div>
</template>

<style scoped>
.save-error-toast {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-accent);
  color: #fff;
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  box-shadow: var(--shadow-md);
  z-index: 2000;
  max-width: 90vw;
}
</style>
