<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { usePracticeLog } from '@/features/workshop/composables/usePracticeLog'
import { useBlobImage } from '@/features/workshop/composables/useBlobImage'
import { useFocusTrap } from '@/features/workshop/composables/useFocusTrap'
import GalleryCard from '@/features/workshop/components/GalleryCard.vue'

const { groupedEntries, stats } = usePracticeLog()

const imageViewer = ref<{ blobId: string; title: string } | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
let lastFocused: HTMLElement | null = null
const { url: viewerUrl } = useBlobImage(computed(() => imageViewer.value?.blobId))

useFocusTrap(overlayRef)

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

function openImage(blobId: string, title: string) {
  lastFocused = document.activeElement as HTMLElement | null
  imageViewer.value = { blobId, title }
  void nextTick(() => overlayRef.value?.focus())
}

function closeImageViewer() {
  imageViewer.value = null
  lastFocused?.focus()
  lastFocused = null
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

    <div v-if="groupedEntries.size === 0" class="empty-state">
      <div class="empty-icon">🎨</div>
      <p>还没有作品。</p>
      <RouterLink to="/workshop/phase/1" class="empty-cta">去完成第一个练习 →</RouterLink>
    </div>

    <div v-for="[date, entries] in groupedEntries" :key="date" class="day-group">
      <div class="day-divider">{{ formatDate(date) }}</div>
      <div class="day-entries">
        <GalleryCard
          v-for="entry in entries"
          :key="entry.id"
          :entry="entry"
          @open-image="openImage"
        />
      </div>
    </div>

    <!-- Image Viewer Modal -->
    <Teleport to="body">
      <div
        v-if="imageViewer"
        ref="overlayRef"
        class="image-viewer-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewer-title"
        tabindex="-1"
        @click="closeImageViewer"
        @keydown.esc="closeImageViewer"
      >
        <div class="image-viewer-content" @click.stop>
          <img v-if="viewerUrl" :src="viewerUrl" :alt="imageViewer.title" />
          <div id="viewer-title" class="viewer-title">{{ imageViewer.title }}</div>
          <button type="button" class="viewer-close" @click="closeImageViewer">✕</button>
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

/* Image Viewer */
.image-viewer-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-viewer-content {
  position: relative;
  background: var(--color-viewer-bg);
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
