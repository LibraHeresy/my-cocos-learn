<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { usePracticeLog } from '@/composables/usePracticeLog'
import type { PracticeEntry } from '@/types/workshop'

const { groupedEntries, stats } = usePracticeLog()

const expandedId = ref<string | null>(null)
const filterCourse = ref<string>('all')
const imageViewer = ref<{ src: string; title: string } | null>(null)

const uniqueCourses = computed(() => {
  const set = new Set<string>()
  for (const [, entries] of groupedEntries.value) {
    for (const e of entries) {
      if (e) set.add(e.course)
    }
  }
  return Array.from(set).sort()
})

const filteredGroups = computed(() => {
  const groups: [string, PracticeEntry[]][] = []
  for (const [date, entries] of groupedEntries.value) {
    const filtered = filterCourse.value === 'all'
      ? entries
      : entries.filter((e) => e.course === filterCourse.value)
    if (filtered.length > 0) {
      groups.push([date, filtered])
    }
  }
  return groups
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000)

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const fullDate = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`

  let relative = ''
  if (diffDays === 0) relative = '今天'
  else if (diffDays === 1) relative = '昨天'
  else if (diffDays === 2) relative = '前天'
  else if (diffDays <= 7) relative = `${diffDays} 天前`

  const weekday = `星期${weekDays[d.getDay()]}`
  const label = relative ? `${fullDate} (${weekday}) · ${relative}` : `${fullDate} (${weekday})`
  return label
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function openImage(src: string, title: string) {
  imageViewer.value = { src, title }
}

function closeImageViewer() {
  imageViewer.value = null
}
</script>

<template>
  <div class="gallery">
    <div class="gallery-header">
      <RouterLink to="/workshop" class="back-link">← 返回工坊</RouterLink>
      <h1>📸 作品画廊</h1>
      <div class="gallery-stats">
        <span>{{ stats.total }} 次练习</span>
        <span v-if="stats.avgRating"> · 均分 ⭐{{ stats.avgRating }}</span>
      </div>
    </div>

    <div v-if="uniqueCourses.length > 1" class="filter-bar">
      <button
        v-for="c in ['all', ...uniqueCourses]"
        :key="c"
        class="filter-btn"
        :class="{ active: filterCourse === c }"
        @click="filterCourse = c"
      >
        {{ c === 'all' ? '全部' : c === 'art' ? '🎨 美术' : c === 'cocos' ? '🎮 Cocos' : c === 'audio' ? '🔊 音效' : '⚙️ 工程' }}
      </button>
    </div>

    <div v-if="filteredGroups.length === 0" class="empty-state">
      <div class="empty-icon">🎨</div>
      <p>还没有作品。</p>
      <RouterLink to="/workshop/phase/1" class="empty-cta">去完成第一个练习 →</RouterLink>
    </div>

    <div v-for="[date, entries] in filteredGroups" :key="date" class="day-group">
      <div class="day-divider">{{ formatDate(date) }}</div>
      <div class="day-entries">
        <div v-for="entry in entries" :key="entry.id" class="gallery-card">
          <div
            v-if="entry.imageDataUrl"
            class="card-image"
            @click="openImage(entry.imageDataUrl!, entry.title)"
          >
            <img :src="entry.imageDataUrl" :alt="entry.title" loading="lazy" />
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-course">
                {{ entry.course === 'art' ? '🎨' : entry.course === 'cocos' ? '🎮' : entry.course === 'audio' ? '🔊' : '⚙️' }}
              </span>
              <span class="card-phase">Phase {{ entry.phase }}</span>
              <span class="card-title">{{ entry.title }}</span>
            </div>
            <div v-if="entry.selfRating" class="card-rating">
              {{ '★'.repeat(entry.selfRating) }}{{ '☆'.repeat(5 - entry.selfRating) }}
            </div>
            <button
              v-if="entry.reflections && entry.reflections.length > 0"
              class="expand-btn"
              @click="toggleExpand(entry.id)"
            >
              {{ expandedId === entry.id ? '收起反思' : '查看反思' }}
            </button>
            <div v-if="expandedId === entry.id && entry.reflections" class="card-reflections">
              <div v-for="(r, i) in entry.reflections" :key="i" class="reflection-text">
                <span class="reflection-num">Q{{ i + 1 }}.</span> {{ r }}
              </div>
            </div>
            <div class="card-actions">
              <RouterLink :to="`/workshop/phase/${entry.phase}`" class="card-link">
                查看练习 →
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Viewer Modal -->
    <Teleport to="body">
      <div v-if="imageViewer" class="image-viewer-overlay" @click="closeImageViewer">
        <div class="image-viewer-content" @click.stop>
          <img :src="imageViewer.src" :alt="imageViewer.title" />
          <div class="viewer-title">{{ imageViewer.title }}</div>
          <button class="viewer-close" @click="closeImageViewer">✕</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.gallery {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.gallery-header {
  text-align: center;
  margin-bottom: 2rem;
}

.gallery-header h1 {
  font-size: 1.6rem;
  color: var(--color-text);
  margin: 0.75rem 0 0.25rem;
}

.back-link {
  font-size: 0.85rem;
  color: var(--color-primary);
  font-weight: 600;
}

.gallery-stats {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.filter-bar {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.filter-btn.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }
.empty-state p { color: var(--color-text-muted); margin-bottom: 0.75rem; }

.empty-cta {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.95rem;
}

.day-group {
  margin-bottom: 1.5rem;
}

.day-divider {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 600;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: 0.75rem;
}

.day-entries {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}

.gallery-card {
  display: flex;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.gallery-card:hover {
  border-color: var(--color-primary);
}

.card-image {
  width: 80px;
  min-height: 80px;
  flex-shrink: 0;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-right: 1px solid var(--color-border-light);
}

.card-image img {
  max-width: 72px;
  max-height: 72px;
  object-fit: contain;
  image-rendering: pixelated;
}

.card-body {
  flex: 1;
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
}

.card-course { font-size: 0.85rem; }
.card-phase {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.7rem;
}

.card-title {
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.82rem;
}

.card-rating {
  font-size: 0.72rem;
  color: #f0b428;
}

.expand-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.72rem;
  cursor: pointer;
  padding: 0;
  text-align: left;
}

.card-reflections {
  background: var(--color-bg);
  padding: 0.5rem;
  border-radius: 6px;
}

.reflection-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 0.3rem;
}
.reflection-text:last-child { margin-bottom: 0; }
.reflection-num { font-weight: 600; color: var(--color-text); }

.card-actions {
  margin-top: auto;
}

.card-link {
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: 600;
}

/* Image Viewer */
.image-viewer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-viewer-content {
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 90vw;
  max-height: 90vh;
}

.image-viewer-content img {
  max-width: 100%;
  max-height: 70vh;
  image-rendering: pixelated;
  display: block;
}

.viewer-title {
  text-align: center;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 600;
}

.viewer-close {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--color-text-muted);
}

.viewer-close:hover { color: var(--color-text); }
</style>
