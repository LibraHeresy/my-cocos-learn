<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PhaseGroup } from '@/types/phase'
import { useScrollSpy } from '@/composables/useScrollSpy'

defineProps<{
  groups: PhaseGroup[]
}>()

const activePhaseId = ref(-1)
const { activeId, lockScroll } = useScrollSpy('[id^="phase-"]')

watch(activeId, (id) => {
  if (id.startsWith('phase-')) {
    const n = parseInt(id.slice('phase-'.length), 10)
    activePhaseId.value = Number.isNaN(n) ? -1 : n
  } else {
    activePhaseId.value = -1
  }
})

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
              :aria-current="activePhaseId === p.id ? 'location' : undefined"
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
  <details v-if="groups.length" class="sidebar-mobile">
    <summary>课程目录</summary>
    <ul class="sidebar-list">
      <li v-for="g in groups" :key="g.label" class="sidebar-group">
        <span class="sidebar-group-label">{{ g.label }}</span>
        <ul class="sidebar-sub-list">
          <li v-for="p in g.phases" :key="p.id" class="sidebar-sub-item">
            <a
              :href="`#phase-${p.id}`"
              class="sidebar-sub-link"
              :class="{ active: activePhaseId === p.id }"
              :aria-current="activePhaseId === p.id ? 'location' : undefined"
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
  </details>
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

@media (min-width: 1201px) {
  .sidebar-mobile {
    display: none;
  }
}

.sidebar-mobile {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
}

.sidebar-mobile summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text);
}

.sidebar-mobile .sidebar-list {
  margin-top: 0.5rem;
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
  font-size: 0.72rem;
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
  font-size: 0.78rem;
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
