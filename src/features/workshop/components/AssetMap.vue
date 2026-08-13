<script setup lang="ts">
import { useAssetGallery } from '@/features/workshop/composables/useAssetGallery'
import AssetCard from '@/features/workshop/components/AssetCard.vue'

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
        <AssetCard
          v-for="asset in assetsByCategory.get(cat.key)"
          :key="asset.id"
          :asset="asset"
        />
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
</style>
