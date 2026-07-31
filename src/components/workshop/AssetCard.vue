<script setup lang="ts">
import { useBlobImage } from '@/composables/useBlobImage'
import type { AssetWithStatus } from '@/composables/useAssetGallery'

const props = defineProps<{
  asset: AssetWithStatus
}>()

const { url } = useBlobImage(() => props.asset.practice?.imageBlobId)
</script>

<template>
  <div class="asset-card" :class="{ unlocked: asset.unlocked }">
    <template v-if="asset.unlocked && url">
      <img :src="url" :alt="asset.name" class="asset-thumb" />
    </template>
    <template v-else-if="asset.unlocked">
      <div class="asset-placeholder completed-ph">
        <span>✓</span>
      </div>
    </template>
    <template v-else>
      <div class="asset-placeholder">
        <span class="asset-phase-hint">Phase {{ asset.phase }}</span>
      </div>
    </template>
    <div class="asset-name">{{ asset.name }}</div>
    <div class="asset-size">{{ asset.size }}</div>
  </div>
</template>

<style scoped>
.asset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border-light);
  background: var(--color-bg);
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
}

.asset-card.unlocked {
  border-color: var(--color-success);
  background: var(--color-success-soft);
}

.asset-thumb {
  width: 64px;
  height: 64px;
  object-fit: contain;
  image-rendering: pixelated;
  border-radius: 4px;
  background: #fff;
}

.asset-placeholder {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-soft);
  border-radius: 4px;
  border: 1px dashed var(--color-border);
}

.asset-placeholder.completed-ph {
  border-color: var(--color-success);
  color: var(--color-success);
  font-size: 1.2rem;
}

.asset-placeholder .asset-phase-hint {
  font-size: 0.65rem;
  color: var(--color-text-soft);
}

.asset-name {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text);
  margin-top: 0.3rem;
}

.asset-size {
  font-size: 0.62rem;
  color: var(--color-text-muted);
}
</style>
