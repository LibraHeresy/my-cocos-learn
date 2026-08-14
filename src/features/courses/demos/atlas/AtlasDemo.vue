<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import '@/features/courses/demos/demo-shell.css'
import { useDemoVisibility } from '../useDemoVisibility'

defineProps<{ course?: string; phase?: number }>()

const rootEl = ref<HTMLElement | null>(null)
const { visible: demoVisible } = useDemoVisibility(rootEl)

/* ---------- 常量 ---------- */
const SPRITE = 64 // 精灵显示尺寸 (px)
const CELL = 64 // 图集每格尺寸 (px)
const ATLAS = CELL * 2 // 图集 2×2 总尺寸 (px)
const STAGE = 240 // 舞台内框尺寸 (px)
const MAX = STAGE - SPRITE // 拖拽坐标上限
const LABELS = ['A', 'B', 'C', 'D'] as const

/* 画到 canvas 上的颜色全部取自设计系统 CSS 变量（不硬编码 hex） */
function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'transparent'
}

/* 4 个图标：既是 4 张独立贴图的内容，也是同一张图集的 4 个切片 */
const ITEMS = [
  { emoji: '🍎', label: 'A' as const, tint: '--color-accent-soft' },
  { emoji: '🍋', label: 'B' as const, tint: '--color-primary-soft' },
  { emoji: '🥝', label: 'C' as const, tint: '--color-success-soft' },
  { emoji: '🍇', label: 'D' as const, tint: '--color-bg-soft' },
]

/* ---------- 状态 ---------- */
const batchOn = ref(false) // 合批开关
const independentCount = ref(0) // 独立模式累计 draw call
const atlasCount = ref(0) // 图集模式累计 draw call

const positions = reactive([
  { x: 8, y: 8 },
  { x: MAX - 8, y: 8 },
  { x: 8, y: MAX - 8 },
  { x: MAX - 8, y: MAX - 8 },
])

const dragging = ref<number | null>(null)
const dragOffset = reactive({ x: 0, y: 0 })

const atlasCanvas = ref<HTMLCanvasElement | null>(null)
const texUrls: string[] = [] // 4 张独立贴图的 dataURL
let atlasUrl = '' // 整张图集的 dataURL
let rafId = 0

/* ---------- 图集：一张 2×2 大纹理 ---------- */
function drawAtlas(g: CanvasRenderingContext2D) {
  ITEMS.forEach((it, i) => {
    const cx = (i % 2) * CELL
    const cy = Math.floor(i / 2) * CELL
    g.fillStyle = cssVar(it.tint)
    g.fillRect(cx, cy, CELL, CELL)
    g.strokeStyle = cssVar('--color-border')
    g.lineWidth = 1
    g.strokeRect(cx + 0.5, cy + 0.5, CELL - 1, CELL - 1)
    g.font = '30px "Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",sans-serif'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(it.emoji, cx + CELL / 2, cy + CELL / 2 + 2)
    g.font = '9px ui-monospace, monospace'
    g.fillStyle = cssVar('--color-text-muted')
    g.textBaseline = 'alphabetic'
    g.fillText(LABELS[i], cx + 4, cy + CELL - 5)
  })
}

/* ---------- 4 张独立贴图：同一个图标各自一张小图 ---------- */
function drawTexture(emoji: string, tint: string, label: string): string {
  const c = document.createElement('canvas')
  c.width = SPRITE
  c.height = SPRITE
  const g = c.getContext('2d')!
  g.fillStyle = tint
  g.fillRect(0, 0, SPRITE, SPRITE)
  g.strokeStyle = cssVar('--color-border')
  g.lineWidth = 1
  g.strokeRect(0.5, 0.5, SPRITE - 1, SPRITE - 1)
  g.font = '30px "Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(emoji, SPRITE / 2, SPRITE / 2 + 2)
  g.font = '9px ui-monospace, monospace'
  g.fillStyle = cssVar('--color-text-muted')
  g.textBaseline = 'alphabetic'
  g.fillText(label, 4, SPRITE - 5)
  return c.toDataURL('image/png')
}

/* 精灵背景：合批开 → 从图集切片；关 → 各自独立贴图 */
function spriteBg(i: number): Record<string, string> {
  if (batchOn.value) {
    const col = i % 2
    const row = Math.floor(i / 2)
    return {
      backgroundImage: `url(${atlasUrl})`,
      backgroundSize: `${ATLAS}px ${ATLAS}px`,
      backgroundPosition: `${-col * CELL}px ${-row * CELL}px`,
    }
  }
  return {
    backgroundImage: `url(${texUrls[i]})`,
    backgroundSize: `${SPRITE}px ${SPRITE}px`,
    backgroundPosition: '0 0',
  }
}

/* 合批开：4 个精灵同步脉冲（1 次绘制）；关：错峰脉冲（4 次绘制） */
function spriteDelay(i: number): string {
  return batchOn.value ? '0s' : `-${(i * 0.125).toFixed(3)}s`
}

/* ---------- 拖拽（pointer 交互，不用方向键） ---------- */
function onSpriteDown(e: PointerEvent, i: number) {
  e.preventDefault()
  dragging.value = i
  dragOffset.x = e.clientX - positions[i].x
  dragOffset.y = e.clientY - positions[i].y
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onSpriteMove(e: PointerEvent) {
  if (dragging.value === null) return
  const i = dragging.value
  positions[i].x = Math.max(0, Math.min(MAX, e.clientX - dragOffset.x))
  positions[i].y = Math.max(0, Math.min(MAX, e.clientY - dragOffset.y))
}

function onSpriteUp() {
  dragging.value = null
}

/* ---------- 每帧累加 draw call 计数（不可见时暂停，省 CPU） ---------- */
function startTick() {
  if (rafId) return
  const loop = () => {
    rafId = 0
    if (!demoVisible.value) return // 不可见：不再调度，等 watcher 恢复
    if (batchOn.value) atlasCount.value += 1
    else independentCount.value += 4
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
}

function stopTick() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

// 离开视口/切后台：计数暂停；回到视口自动恢复
watch(demoVisible, (v) => {
  if (v) startTick()
  else stopTick()
})

function toggleBatch() {
  batchOn.value = !batchOn.value
}

function reset() {
  independentCount.value = 0
  atlasCount.value = 0
}

function fmt(n: number) {
  return n.toLocaleString()
}

onMounted(() => {
  ITEMS.forEach((it) => texUrls.push(drawTexture(it.emoji, cssVar(it.tint), it.label)))

  const tmp = document.createElement('canvas')
  tmp.width = ATLAS
  tmp.height = ATLAS
  drawAtlas(tmp.getContext('2d')!)
  atlasUrl = tmp.toDataURL('image/png')

  if (atlasCanvas.value) drawAtlas(atlasCanvas.value.getContext('2d')!)

  startTick()
})

onUnmounted(() => stopTick())
</script>

<template>
  <div ref="rootEl" class="demo-shell atlas-demo">
    <div class="demo-head">
      <h4 class="demo-title">🗂️ 图集 vs 独立贴图 · 一次 draw call 画完 4 张图</h4>
      <div class="controls">
        <label class="switch" :class="{ on: batchOn }">
          <input type="checkbox" role="switch" :checked="batchOn" @change="toggleBatch" />
          <span class="switch-track"><span class="switch-thumb" /></span>
          <span class="switch-label">合批 {{ batchOn ? '开' : '关' }}</span>
        </label>
        <button class="btn" type="button" @click="reset">清零计数器</button>
        <span class="dc-badge" :class="{ batch: batchOn }">
          本帧 {{ batchOn ? '1' : '4' }} 次 DrawCall
        </span>
      </div>
    </div>

    <div class="demo-body">
      <div class="stage">
        <div
          v-for="(_, i) in ITEMS"
          :key="i"
          class="sprite"
          :style="{ left: positions[i].x + 'px', top: positions[i].y + 'px' }"
          @pointerdown="onSpriteDown($event, i)"
          @pointermove="onSpriteMove"
          @pointerup="onSpriteUp"
          @pointercancel="onSpriteUp"
        >
          <span class="sprite-ring" :style="{ animationDelay: spriteDelay(i) }" />
          <div class="sprite-bg" :style="spriteBg(i)" />
        </div>
        <span class="stage-hint">← 拖拽精灵，每个都有独立 transform</span>
      </div>

      <div class="atlas-panel" :class="{ dim: !batchOn }">
        <canvas ref="atlasCanvas" width="128" height="128" class="atlas-canvas" />
        <p class="atlas-note">
          {{ batchOn ? '整张图集常驻，切 4 个矩形 → 1 次 draw call' : '图集未启用（合批关）' }}
        </p>
      </div>
    </div>

    <table class="cmp-table">
      <thead>
        <tr>
          <th>渲染策略</th>
          <th>每帧 DrawCall</th>
          <th>累计 DrawCall</th>
          <th>当前</th>
        </tr>
      </thead>
      <tbody>
        <tr :class="{ active: !batchOn }">
          <td>🧩 独立贴图（4 张纹理）</td>
          <td><strong>4</strong> 次</td>
          <td class="num">{{ fmt(independentCount) }} 次</td>
          <td class="status">{{ !batchOn ? '● 使用中' : '—' }}</td>
        </tr>
        <tr :class="{ active: batchOn }">
          <td>🗂️ 图集合批（1 张纹理）</td>
          <td><strong>1</strong> 次</td>
          <td class="num">{{ fmt(atlasCount) }} 次</td>
          <td class="status">{{ batchOn ? '● 使用中' : '—' }}</td>
        </tr>
      </tbody>
    </table>

    <p class="saving">
      同样的 4 张图，图集把 4 次绘制合并成 1 次，每帧省下 <strong>75%</strong> 的 draw call —— 这正是 Phase 6 的 Auto Atlas 想让你看到的事。
    </p>

    <p class="demo-caption">
      左侧 4 个精灵可拖拽，各自带独立 transform。合批关闭时每个精灵各持一张贴图，一帧发 4 次 draw call（计数器每帧 +4）；合批开启后，4 个精灵共用右侧这一张 2×2 图集，用 background-position 从同一张图里切出 4 个矩形，只需 1 次 draw call（计数器每帧 +1）——和前端 CSS Sprite 是同一个思路。
    </p>
  </div>
</template>

<style scoped>
.demo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.demo-title {
  margin: 0;
  color: var(--color-text);
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  flex-wrap: wrap;
}

/* ---- 合批开关 ---- */
.switch {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  font-size: 0.85rem;
  color: var(--color-text);
}

.switch input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  margin: 0;
}

.switch-track {
  position: relative;
  width: 42px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--color-border);
  transition: background 0.2s;
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s;
}

.switch.on .switch-track {
  background: var(--color-primary);
}

.switch.on .switch-thumb {
  transform: translateX(20px);
}

.switch input:focus-visible + .switch-track {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ---- 按钮 ---- */
.btn {
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, transform 0.1s;
}

.btn:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.btn:active {
  transform: scale(0.97);
}

/* ---- 本帧 badge ---- */
.dc-badge {
  font-size: 0.76rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  white-space: nowrap;
}

.dc-badge.batch {
  background: var(--color-success-soft);
  color: var(--color-success);
}

/* ---- 主体两栏 ---- */
.demo-body {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-top: 0.9rem;
}

.stage {
  position: relative;
  width: 240px;
  height: 240px;
  flex-shrink: 0;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  touch-action: none;
}

.sprite {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.sprite:active {
  cursor: grabbing;
}

.sprite-bg {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.sprite-ring {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  border: 2px solid var(--color-primary);
  opacity: 0;
  pointer-events: none;
  animation: ring-pulse 0.5s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%, 100% {
    opacity: 0;
  }
  30% {
    opacity: 0.5;
  }
}

.stage-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 5px;
  text-align: center;
  font-size: 0.68rem;
  color: var(--color-text-soft);
  pointer-events: none;
}

/* ---- 右侧图集 ---- */
.atlas-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  flex-shrink: 0;
}

.atlas-canvas {
  width: 128px;
  height: 128px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  transition: opacity 0.3s;
}

.atlas-panel.dim .atlas-canvas {
  opacity: 0.4;
}

.atlas-note {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-align: center;
  max-width: 150px;
  margin: 0;
  line-height: 1.5;
}

/* ---- 对比表 ---- */
.cmp-table tr.active td {
  background: var(--color-primary-soft);
}

.cmp-table tr.active td:first-child {
  border-left: 3px solid var(--color-primary);
}

.cmp-table tr.active .status {
  color: var(--color-primary);
  font-weight: 600;
}

.num {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  white-space: nowrap;
}

.saving {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-top: 0.6rem;
  margin-bottom: 0;
}
</style>
