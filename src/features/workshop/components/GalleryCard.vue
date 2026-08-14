<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useBlobImage } from '@/features/workshop/composables/useBlobImage'
import type { PracticeEntry } from '@/features/workshop/types/workshop'
import { MAX_SELF_RATING } from '@/features/workshop/types/workshop'

const props = defineProps<{
  entry: PracticeEntry
}>()

const emit = defineEmits<{
  (e: 'open-image', blobId: string, title: string): void
}>()

const expanded = ref(false)
const { url } = useBlobImage(() => props.entry.imageBlobId)

function toggleExpand() {
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="gallery-card">
    <button
      v-if="url"
      type="button"
      class="card-image"
      :aria-label="`查看 ${entry.title} 大图`"
      @click="emit('open-image', entry.imageBlobId!, entry.title)"
    >
      <img :src="url" :alt="entry.title" loading="lazy" />
    </button>
    <div class="card-body">
      <div class="card-meta">
        <span class="card-phase">Phase {{ entry.phase }}</span>
        <span class="card-title">{{ entry.title }}</span>
      </div>
      <div v-if="entry.selfRating" class="card-rating">
        {{ '★'.repeat(entry.selfRating) }}{{ '☆'.repeat(MAX_SELF_RATING - entry.selfRating) }}
      </div>
      <button
        v-if="entry.reflections && entry.reflections.length > 0"
        type="button"
        class="expand-btn"
        @click="toggleExpand"
      >
        {{ expanded ? '收起反思' : '查看反思' }}
      </button>
      <div v-if="expanded && entry.reflections" class="card-reflections">
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
</template>

<style scoped>
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
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-right: 1px solid var(--color-border-light);
  padding: 0;
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
  color: var(--color-star);
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
</style>
