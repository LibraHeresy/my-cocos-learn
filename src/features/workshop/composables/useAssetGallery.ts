import { computed } from 'vue'
import { GAME_ASSETS, ASSET_CATEGORIES } from '@/features/workshop/data/asset-map'
import { getAllCompletedChallenges, useWorkshopState } from '@/features/workshop/stores/workshopStore'
import type { GameAsset } from '@/features/workshop/data/asset-map'
import type { PracticeEntry } from '@/features/workshop/types/workshop'

export interface AssetWithStatus extends GameAsset {
  unlocked: boolean
  practice?: PracticeEntry
}

export function useAssetGallery() {
  const state = useWorkshopState()

  const assets = computed<AssetWithStatus[]>(() => {
    const completedChallenges = getAllCompletedChallenges()
    return GAME_ASSETS.map((asset) => {
      const unlocked = completedChallenges.includes(asset.phase)
      const practice = state.practiceLog.find((p) => p.phase === asset.phase)
      return { ...asset, unlocked, practice }
    })
  })

  const progress = computed(() => {
    const unlocked = assets.value.filter((a) => a.unlocked).length
    return {
      unlocked,
      total: GAME_ASSETS.length,
      percent: Math.round((unlocked / GAME_ASSETS.length) * 100),
    }
  })

  function getAssetsByCategory(): Map<string, AssetWithStatus[]> {
    const map = new Map<string, AssetWithStatus[]>()
    for (const cat of ASSET_CATEGORIES) {
      map.set(cat.key, assets.value.filter((a) => a.category === cat.key))
    }
    return map
  }

  return {
    assets,
    progress,
    categories: ASSET_CATEGORIES,
    getAssetsByCategory,
  }
}
