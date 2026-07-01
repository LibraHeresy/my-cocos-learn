<script setup lang="ts">
import { useAssetGallery } from '@/composables/useAssetGallery'

const { progress, categories, getAssetsByCategory } = useAssetGallery()
const assetsByCategory = getAssetsByCategory()
</script>

<template>
  <div class="asset-map">
    <div class="asset-map-header">
      <h2 class="section-title">🗺️ 游戏资产地图</h2>
      <span class="asset-progress">{{ progress.unlocked }}/{{ progress.total }} 已解锁</span>
    </div>
    <div v-for="cat in categories" :key="cat.key" class="asset-category">
      <div class="category-label">
        <span>{{ cat.icon }}</span>
        <span>{{ cat.label }}</span>
      </div>
      <div class="asset-grid">
        <div
          v-for="asset in assetsByCategory.get(cat.key)"
          :key="asset.id"
          class="asset-card"
          :class="{ unlocked: asset.unlocked }"
        >
          <template v-if="asset.unlocked && asset.practice?.imageDataUrl">
            <img
              :src="asset.practice.imageDataUrl"
              :alt="asset.name"
              class="asset-thumb"
            />
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.asset-map {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.asset-map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.1rem;
  color: var(--color-text);
  margin: 0;
}

.asset-progress {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.asset-category {
  margin-bottom: 1rem;
}
.asset-category:last-child { margin-bottom: 0; }

.category-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

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
