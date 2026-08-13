<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getProgress, getNextPhase } from '@/stores/readingStore'

const props = defineProps<{
  course: string
}>()

const progress = computed(() => getProgress(props.course))
const next = computed(() => getNextPhase(props.course))
</script>

<template>
  <div v-if="progress.total > 0" class="course-progress">
    <div class="cp-head">
      <span class="cp-label">学习进度</span>
      <span class="cp-count">{{ progress.done }}/{{ progress.total }} 已读</span>
    </div>
    <div class="cp-bar">
      <div class="cp-fill" :style="{ width: (progress.done / progress.total * 100) + '%' }" />
    </div>
    <RouterLink v-if="next" :to="`/${course}/phase/${next}`" class="cp-next">
      继续学习：第 {{ next }} 阶段 →
    </RouterLink>
    <span v-else class="cp-next cp-done">🎉 全部阶段已读</span>
  </div>
</template>

<style scoped>
.course-progress {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  padding: 0.85rem 1.1rem;
  margin-bottom: 1.25rem;
}

.cp-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.cp-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.cp-count {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.cp-bar {
  height: 3px;
  background: var(--color-border-light);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.cp-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.cp-next {
  font-size: 0.78rem;
  color: var(--color-primary);
  font-weight: 600;
}

.cp-done {
  color: var(--color-success);
}
</style>
