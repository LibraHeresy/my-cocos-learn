import { defineAsyncComponent, type Component } from 'vue'
import type { DemoId } from '@/demos/ids'

/** 演示注册表：id → 懒加载组件。每个 demo 独立 chunk，按需加载。 */
export const demoRegistry: Record<DemoId, Component> = {
  palette: defineAsyncComponent(() => import('@/demos/palette/PaletteDemo.vue')),
  'anchor-point': defineAsyncComponent(() => import('@/demos/anchor-point/AnchorPointDemo.vue')),
  'easing-curves': defineAsyncComponent(() => import('@/demos/easing/EasingDemo.vue')),
  waveform: defineAsyncComponent(() => import('@/demos/waveform/WaveformDemo.vue')),
  'atlas-batching': defineAsyncComponent(() => import('@/demos/atlas/AtlasDemo.vue')),
  'shader-compare': defineAsyncComponent(() => import('@/demos/shader/ShaderDemo.vue')),
}
