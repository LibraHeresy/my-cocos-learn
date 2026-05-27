<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const router = useRouter()
const route = useRoute()

const PHASE_COUNTS: Record<string, number> = (() => {
  const counts: Record<string, number> = {}
  for (const r of router.getRoutes()) {
    const m = (r.name as string)?.match(/^(cocos|art|audio)-phase(\d+)$/)
    if (m) {
      const num = parseInt(m[2])
      if (num > (counts[m[1]] ?? 0)) counts[m[1]] = num
    }
  }
  return counts
})()

function getRouteInfo() {
  const name = route.name as string
  if (name === 'home' || name === 'art' || name === 'audio') {
    return { course: name === 'home' ? 'cocos' : name, phase: null }
  }
  const match = name.match(/^(cocos|art|audio)-phase(\d+)$/)
  if (match) {
    return { course: match[1], phase: parseInt(match[2]) }
  }
  return { course: null, phase: null }
}

function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

  const { course, phase } = getRouteInfo()
  if (!course) return

  const maxPhase = PHASE_COUNTS[course] ?? 7

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
