<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'

const router = useRouter()
const route = useRoute()

function handleKeydown(e: KeyboardEvent) {
  // 忽略输入框中的按键
  const tag = (e.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    navigatePrev()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    navigateNext()
  }
}

function navigatePrev() {
  const name = route.name as string
  if (name === 'home') {
    router.push({ name: 'phase7' })
  } else if (name === 'phase1') {
    router.push({ name: 'home' })
  } else {
    const num = parseInt(name.replace('phase', ''))
    if (num > 1) router.push({ name: `phase${num - 1}` })
  }
}

function navigateNext() {
  const name = route.name as string
  if (name === 'home') {
    router.push({ name: 'phase1' })
  } else if (name === 'phase7') {
    router.push({ name: 'home' })
  } else {
    const num = parseInt(name.replace('phase', ''))
    if (num < 7) router.push({ name: `phase${num + 1}` })
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
  <RouterView />
</template>
