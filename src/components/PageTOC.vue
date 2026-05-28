<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'

interface TocItem {
  id: string
  title: string
}

const items = ref<TocItem[]>([])
const activeId = ref('')
const route = useRoute()

function extractTitle(el: Element): string {
  const h2 = el.querySelector('h2')
  if (!h2) return ''
  // Remove icon span text, keep the rest
  const clone = h2.cloneNode(true) as HTMLElement
  const iconClone = clone.querySelector('.block-icon')
  if (iconClone) iconClone.remove()
  return (clone.textContent || '').trim()
}

function buildToc() {
  const sections = document.querySelectorAll('section[id]')
  items.value = Array.from(sections).map((el) => ({
    id: el.id,
    title: extractTitle(el),
  }))
}

let observer: IntersectionObserver | null = null

function setupObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px' },
  )
  const sections = document.querySelectorAll('section[id]')
  sections.forEach((s) => observer!.observe(s))
}

onMounted(() => {
  nextTick(() => {
    buildToc()
    setupObserver()
  })
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

watch(
  () => route.path,
  () => {
    nextTick(() => {
      buildToc()
      // re-observe new sections
      observer?.disconnect()
      setupObserver()
    })
  },
)

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}
</script>

<template>
  <nav v-if="items.length" class="page-toc" aria-label="页面目录">
    <h4 class="toc-title">本页目录</h4>
    <ul class="toc-list">
      <li v-for="item in items" :key="item.id" class="toc-item">
        <a
          :href="`#${item.id}`"
          class="toc-link"
          :class="{ active: activeId === item.id }"
          @click.prevent="scrollTo(item.id)"
        >
          {{ item.title }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.page-toc {
  width: var(--toc-width);
  overflow-y: auto;
  padding-left: 1.5rem;
  border-left: 1px solid var(--color-border-light);
}

@media (max-width: 1200px) {
  .page-toc {
    display: none;
  }
}

.toc-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin-bottom: 0.15rem;
}

.toc-link {
  display: block;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  padding: 0.3em 0;
  transition: color 0.2s;
  border-radius: 4px;
}

.toc-link:hover {
  color: var(--color-primary);
}

.toc-link.active {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
