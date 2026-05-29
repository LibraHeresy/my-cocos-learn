<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { PhaseGroup } from '@/types/phase'

defineProps<{
  groups: PhaseGroup[]
  course: string
}>()

const activePhaseId = ref(-1)
const scrollSeq = ref(0)

let observer: IntersectionObserver | null = null

function blockWheel(e: WheelEvent) {
  if (scrollSeq.value > 0) e.preventDefault()
}

function lockScroll() {
  scrollSeq.value++
  const seq = scrollSeq.value
  document.addEventListener('scrollend', () => { if (scrollSeq.value === seq) scrollSeq.value = 0 }, { once: true })
  setTimeout(() => { if (scrollSeq.value === seq) scrollSeq.value = 0 }, 1000)
}

function scrollToPhase(phaseId: number) {
  activePhaseId.value = phaseId
  lockScroll()
  const el = document.getElementById(`phase-${phaseId}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToExtra(id: string) {
  activePhaseId.value = -1
  lockScroll()
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  document.addEventListener('wheel', blockWheel, { capture: true, passive: false })

  observer = new IntersectionObserver(
    (entries) => {
      if (scrollSeq.value > 0) return
      let best = -1
      let bestY = Infinity
      for (const entry of entries) {
        if (entry.isIntersecting && entry.target.id.startsWith('phase-')) {
          const id = parseInt(entry.target.id.replace('phase-', ''))
          if (entry.boundingClientRect.top < bestY) {
            bestY = entry.boundingClientRect.top
            best = id
          }
        }
      }
      if (best >= 0) activePhaseId.value = best
    },
    { rootMargin: '-80px 0px -60% 0px' },
  )
  document.querySelectorAll('[id^="phase-"]').forEach((el) => observer!.observe(el))
})

onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('wheel', blockWheel, { capture: true } as any)
})
</script>

<template>
  <nav v-if="groups.length" class="home-sidebar" aria-label="课程导航">
    <h4 class="sidebar-title">课程目录</h4>
    <ul class="sidebar-list">
      <li v-for="g in groups" :key="g.label" class="sidebar-group">
        <span class="sidebar-group-label">{{ g.label }}</span>
        <ul class="sidebar-sub-list">
          <li v-for="p in g.phases" :key="p.id" class="sidebar-sub-item">
            <a
              :href="`#phase-${p.id}`"
              class="sidebar-sub-link"
              :class="{ active: activePhaseId === p.id }"
              @click.prevent="scrollToPhase(p.id)"
            >
              {{ p.title }}
            </a>
          </li>
        </ul>
      </li>
      <li class="sidebar-group">
        <span class="sidebar-group-label">其他</span>
        <ul class="sidebar-sub-list">
          <li class="sidebar-sub-item">
            <a href="#path-section" class="sidebar-sub-link" @click.prevent="scrollToExtra('path-section')">核心路径</a>
          </li>
          <li class="sidebar-sub-item">
            <a href="#tools-section" class="sidebar-sub-link" @click.prevent="scrollToExtra('tools-section')">使用工具</a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.home-sidebar {
  position: fixed;
  top: 10rem;
  right: max(1.5rem, calc((100vw - var(--max-width)) / 2 - var(--toc-width) - 2rem));
  width: var(--toc-width);
  max-height: calc(100vh - 12rem);
  overflow-y: auto;
  padding-left: 1.5rem;
  border-left: 1px solid var(--color-border-light);
  scrollbar-width: none;
}

.home-sidebar::-webkit-scrollbar {
  display: none;
}

@media (max-width: 1200px) {
  .home-sidebar {
    display: none;
  }
}

.sidebar-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
}

.sidebar-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-group {
  margin-bottom: 0.6rem;
}

.sidebar-group-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.2em 0;
  margin-bottom: 0.15rem;
}

.sidebar-sub-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-sub-item {
  margin-bottom: 0;
}

.sidebar-sub-link {
  display: block;
  width: max-content;
  font-size: 0.76rem;
  color: var(--color-text-muted);
  padding: 0.2em 0.25em 0.2em 0.5em;
  margin-left: -0.5em;
  border-left: 2px solid transparent;
  transition: color 0.3s, border-color 0.3s;
  border-radius: 0 4px 4px 0;
}

.sidebar-sub-link:hover {
  color: var(--color-primary);
}

.sidebar-sub-link.active {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
}
</style>
