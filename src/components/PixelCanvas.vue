<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 2D color grid: each cell is a hex color (e.g. '#ff0000') or empty string for transparent */
    grid: string[][]
    /** Pixel scale multiplier (default: 4) */
    scale?: number
  }>(),
  { scale: 4 },
)

const canvasRef = ref<HTMLCanvasElement>()

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

  // Fill with transparent first
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
}

onMounted(draw)
watch(() => props.grid, draw, { deep: true })
watch(() => props.scale, draw)
</script>

<template>
  <canvas ref="canvasRef" class="pixel-canvas" role="img" aria-label="像素画示意图" />
</template>

<style scoped>
.pixel-canvas {
  display: inline-block;
  vertical-align: middle;
  image-rendering: pixelated;
  box-shadow: 0 2px 8px rgba(139, 100, 70, 0.18);
}
</style>
