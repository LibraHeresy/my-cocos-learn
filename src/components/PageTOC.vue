<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useScrollLock } from '@/composables/useScrollLock'

interface TocItem {
  id: string
  title: string
}

const items = ref<TocItem[]>([])
const activeId = ref('')
const { scrollSeq, lockScroll } = useScrollLock()
const route = useRoute()

function extractTitle(el: Element): string {
  const h2 = el.querySelector('h2')
  if (!h2) return ''
  const icon = h2.querySelector('.block-icon')
  return icon ? h2.textContent!.replace(icon.textContent!, '').trim() : (h2.textContent || '').trim()
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
      if (scrollSeq.value > 0) return
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
  requestAnimationFrame(() => {
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
    requestAnimationFrame(() => {
      buildToc()
      observer?.disconnect()
      setupObserver()
    })
  },
)

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  activeId.value = id
  lockScroll()
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

.page-toc::-webkit-scrollbar {
  display: none;
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
  font-size: 0.78rem;
  color: var(--color-text-muted);
  padding: 0.3em 0.3em 0.3em 0.5em;
  margin-left: -0.5em;
  border-left: 2px solid transparent;
  transition: color 0.3s, border-color 0.3s;
  border-radius: 0 4px 4px 0;
  line-height: 1.45;
  overflow-wrap: break-word;
}

.toc-link:hover {
  color: var(--color-primary);
}

.toc-link.active {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
}
</style>
