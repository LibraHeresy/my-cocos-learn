<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'

interface Phase {
  id: number
  icon: string
  title: string
  duration: string
  summary: string
  concepts: string[]
}

interface PhaseGroup {
  label: string
  tagline: string
  phases: Phase[]
}

defineProps<{
  groups: PhaseGroup[]
  course: string
}>()

const activeIndex = ref(0)

let observer: IntersectionObserver | null = null

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function scrollTo(label: string) {
  const el = document.getElementById(slug(label))
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.index || '0')
          activeIndex.value = idx
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px' },
  )
  document.querySelectorAll('[data-group-index]').forEach((el) => observer!.observe(el))
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <nav v-if="groups.length" class="home-sidebar" aria-label="课程导航">
    <h4 class="sidebar-title">课程目录</h4>
    <ul class="sidebar-list">
      <li v-for="(g, i) in groups" :key="g.label" class="sidebar-group">
        <a
          :href="`#${slug(g.label)}`"
          class="sidebar-link sidebar-group-link"
          :class="{ active: activeIndex === i }"
          @click.prevent="scrollTo(g.label)"
        >
          {{ g.label }}
        </a>
        <ul class="sidebar-sub-list">
          <li v-for="p in g.phases" :key="p.id" class="sidebar-sub-item">
            <RouterLink :to="`/${course}/phase/${p.id}`" class="sidebar-sub-link">
              {{ p.title }}
            </RouterLink>
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

.sidebar-group-link {
  display: block;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  padding: 0.3em 0;
  transition: color 0.2s;
  border-radius: 4px;
}

.sidebar-group-link:hover {
  color: var(--color-primary);
}

.sidebar-group-link.active {
  color: var(--color-primary);
  font-weight: 600;
}

.sidebar-sub-list {
  list-style: none;
  padding: 0;
  margin: 0.15rem 0 0 0;
}

.sidebar-sub-item {
  margin-bottom: 0;
}

.sidebar-sub-link {
  display: block;
  font-size: 0.76rem;
  color: var(--color-text-muted);
  padding: 0.2em 0 0.2em 0.75rem;
  transition: color 0.2s;
  border-radius: 4px;
}

.sidebar-sub-link:hover {
  color: var(--color-primary);
}

.sidebar-sub-link.router-link-active {
  color: var(--color-primary);
  font-weight: 500;
}
</style>
