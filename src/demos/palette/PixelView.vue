<script setup lang="ts">
/**
 * PixelView：通用像素网格画布（由 PixelCanvas.vue 的渲染核心迁移而来）。
 * props.grid 为 2D hex 颜色网格（空字符串 = 透明），按 scale 放大绘制，
 * 并在鼠标点击时向父级派发单元格坐标。
 */
import { ref, onMounted, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 2D 颜色网格：每个单元格为 hex 颜色（如 '#e07b3c'），空字符串表示透明 */
    grid: string[][]
    /** 像素放大倍率（默认 12，16×16 网格 ≈ 192px） */
    scale?: number
    /** 是否绘制浅色网格分隔线，便于点选单元格 */
    showGrid?: boolean
  }>(),
  { scale: 12, showGrid: false },
)

const emit = defineEmits<{ (e: 'cell', col: number, row: number): void }>()

const canvasRef = ref<HTMLCanvasElement>()

/** 网格线颜色：取自设计系统阴影同源的暖棕，贴合全站暖色风格 */
const GRID_LINE = 'rgba(139, 100, 70, 0.22)'

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !props.grid.length) return

  const rows = props.grid.length
  const cols = Math.max(...props.grid.map((r) => r.length))
  const px = props.scale

  canvas.width = cols * px
  canvas.height = rows * px

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < rows; r++) {
    const row = props.grid[r]
    if (!row) continue
    for (let c = 0; c < row.length; c++) {
      const color = row[c]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(c * px, r * px, px, px)
    }
  }

  if (props.showGrid && px >= 6) {
    ctx.strokeStyle = GRID_LINE
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let c = 1; c < cols; c++) {
      ctx.moveTo(c * px + 0.5, 0)
      ctx.lineTo(c * px + 0.5, canvas.height)
    }
    for (let r = 1; r < rows; r++) {
      ctx.moveTo(0, r * px + 0.5)
      ctx.lineTo(canvas.width, r * px + 0.5)
    }
    ctx.stroke()
  }
}

onMounted(draw)
watch(() => props.grid, draw, { deep: true })
watch(() => props.scale, draw)
watch(() => props.showGrid, draw)

function onClick(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas || !props.grid.length) return
  const rect = canvas.getBoundingClientRect()
  const cols = Math.max(...props.grid.map((r) => r.length))
  const col = Math.floor(((e.clientX - rect.left) / rect.width) * cols)
  const row = Math.floor(((e.clientY - rect.top) / rect.height) * props.grid.length)
  if (row < 0 || col < 0 || row >= props.grid.length || col >= cols) return
  emit('cell', col, row)
}
</script>

<template>
  <canvas
    ref="canvasRef"
    class="pixel-view"
    role="img"
    aria-label="像素画上色画布"
    @click="onClick"
  />
</template>

<style scoped>
.pixel-view {
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  /* 像素锐利化（含 Safari<16 兜底） */
  image-rendering: pixelated;
  -webkit-image-rendering: pixelated;
  image-rendering: crisp-edges;
  /* 透明格显示为暖色棋盘格纸面 */
  background-color: var(--color-surface);
  background-image: conic-gradient(
    var(--color-bg-soft) 0 25%,
    transparent 0 50%,
    var(--color-bg-soft) 0 75%,
    transparent 0
  );
  background-size: 16px 16px;
}
</style>
