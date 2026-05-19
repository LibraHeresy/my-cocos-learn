<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  icon?: string
}>()

const slugId = computed(() =>
  props.title
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, ''),
)
</script>

<template>
  <section :id="slugId" class="concept-block">
    <h2 class="block-title">
      <span v-if="icon" class="block-icon">{{ icon }}</span>
      {{ title }}
    </h2>
    <div class="block-content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.concept-block {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem 1.65rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.25s;
  scroll-margin-top: 4.5rem;
}

.concept-block:hover {
  box-shadow: var(--shadow-md);
}

.block-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-left: none;
  padding-left: 0;
  margin-bottom: 1.15rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-light);
  font-size: 1.2rem;
}

.block-icon {
  font-size: 1.15rem;
  line-height: 1;
}

.block-content {
  /* 保持子元素间距一致 */
}

.block-content :deep(h3) {
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.block-content :deep(h3:first-child) {
  margin-top: 0;
}

.block-content :deep(table) {
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .concept-block {
    padding: 1rem 1.1rem;
  }

  .block-title {
    font-size: 1.05rem;
  }
}
</style>
