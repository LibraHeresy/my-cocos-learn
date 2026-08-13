import { defineAsyncComponent, type Component } from 'vue'
import type { DemoId } from '@/features/courses/demos/ids'

/** 演示注册表：id → 懒加载组件。每个 demo 独立 chunk，按需加载。 */
export const demoRegistry: Record<DemoId, Component> = {
  palette: defineAsyncComponent(() => import('@/features/courses/demos/palette/PaletteDemo.vue')),
  'anchor-point': defineAsyncComponent(() => import('@/features/courses/demos/anchor-point/AnchorPointDemo.vue')),
  'easing-curves': defineAsyncComponent(() => import('@/features/courses/demos/easing/EasingDemo.vue')),
  waveform: defineAsyncComponent(() => import('@/features/courses/demos/waveform/WaveformDemo.vue')),
  'atlas-batching': defineAsyncComponent(() => import('@/features/courses/demos/atlas/AtlasDemo.vue')),
  'shader-compare': defineAsyncComponent(() => import('@/features/courses/demos/shader/ShaderDemo.vue')),
}
