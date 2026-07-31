/** 全部可用的交互演示 id（在内容 md 中用 `:::demo <id>` 引用） */
export const demoIds = [
  'palette',
  'anchor-point',
  'easing-curves',
  'waveform',
  'atlas-batching',
  'shader-compare',
] as const

export type DemoId = typeof demoIds[number]
