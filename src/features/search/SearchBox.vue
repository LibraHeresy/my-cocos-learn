<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { search, type SearchResult } from './useSearch'
import { COURSES } from '@/features/courses/data/courses'

const router = useRouter()

const open = ref(false)
const query = ref('')
const results = ref<SearchResult[]>([])
const activeIndex = ref(-1)
const searching = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// 课程标签由 COURSES 派生（单一起源），工坊不在 COURSES 中单独特例
const COURSE_LABEL: Record<string, string> = {
  ...Object.fromEntries(Object.values(COURSES).map((meta) => [meta.id, `${meta.icon} ${meta.label}`])),
  workshop: '🛠️ 工坊',
}

async function runSearch(q: string) {
  const qq = q.trim()
  if (!qq) {
    results.value = []
    return
  }
  searching.value = true
  try {
    results.value = await search(qq)
  } finally {
    searching.value = false
  }
}

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { void runSearch(query.value) }, 150)
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    results.value = []
    query.value = ''
    activeIndex.value = -1
    void nextTick(() => inputEl.value?.focus())
  }
}

function openResult(r: SearchResult) {
  router.push(r.record.url)
  open.value = false
}

function onPanelKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    open.value = false
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, -1)
    return
  }
  if (e.key === 'Enter') {
    const r = results.value[activeIndex.value]
    if (r) openResult(r)
  }
}

function globalShortcut(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    toggle()
    return
  }
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const tag = (e.target as HTMLElement | null)?.tagName
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
      e.preventDefault()
      if (!open.value) toggle()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', globalShortcut)
})
onUnmounted(() => {
  window.removeEventListener('keydown', globalShortcut)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div class="search-wrap">
    <button
      type="button"
      class="search-trigger"
      aria-label="搜索（Ctrl+K 或 /）"
      @click="toggle"
    >
      <span class="search-icon">🔍</span>
      <span class="search-label">搜索</span>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        class="search-panel"
        role="search"
        aria-label="站内搜索"
        @keydown="onPanelKeydown"
      >
        <div class="search-input-row">
          <input
            ref="inputEl"
            v-model="query"
            class="search-input"
            type="search"
            placeholder="搜索课程、概念、挑战…"
            aria-label="搜索关键词"
            @input="onInput"
          />
          <button type="button" class="search-close" aria-label="关闭搜索" @click="toggle">✕</button>
        </div>
        <div v-if="searching" class="search-hint">搜索中…</div>
        <div v-else-if="!query.trim()" class="search-hint">输入关键词，↑↓ 选择、Enter 打开、Esc 关闭</div>
        <div v-else-if="results.length === 0" class="search-hint">没有匹配结果</div>
        <ul v-else class="search-results">
          <li
            v-for="(r, i) in results"
            :key="r.record.url"
            class="search-item"
            :class="{ active: i === activeIndex }"
            @mouseenter="activeIndex = i"
            @click="openResult(r)"
          >
            <span class="si-course">{{ COURSE_LABEL[r.record.course] ?? r.record.course }}</span>
            <span class="si-title">{{ r.record.icon }} {{ r.record.title }}</span>
            <span class="si-snippet">{{ r.snippet }}</span>
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.search-wrap {
  position: relative;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  padding: 0.3rem 0.65rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  height: 100%;
}

.search-trigger:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.search-icon {
  font-size: 0.85rem;
  line-height: 1;
}

.search-panel {
  position: fixed;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  width: min(520px, calc(100vw - 2rem));
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1100;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.search-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem;
  border-bottom: 1px solid var(--color-border-light);
}

.search-input {
  flex: 1;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  padding: 0.45rem 0.7rem;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.search-close {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.search-hint {
  padding: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-align: center;
}

.search-results {
  list-style: none;
  margin: 0;
  padding: 0.4rem;
  overflow-y: auto;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  cursor: pointer;
}

.search-item.active {
  background: var(--color-primary-soft);
}

.si-course {
  font-size: 0.65rem;
  color: var(--color-primary);
  font-weight: 600;
}

.si-title {
  font-size: 0.85rem;
  color: var(--color-text);
  font-weight: 600;
}

.si-snippet {
  font-size: 0.74rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}
</style>
