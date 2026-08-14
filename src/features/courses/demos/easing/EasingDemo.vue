<script setup lang="ts">
/**
 * easing-curves · cocos 课程 Phase 8（cc.tween）
 *
 * 一张 canvas 叠画 4 条缓动曲线：linear / easeOutQuad / backOut / easeOutElastic。
 * 共享一条时间轴：<input type=range> 拖进度，或点「播放」用 rAF 让 4 个圆点
 * 沿各自的曲线移动（圆点位置 = (t, eased(t))）。暂停时圆点停在当前位置。
 *
 * 颜色全部取自设计系统 CSS 变量（getComputedStyle 解析，canvas 不支持 var()）。
 * onUnmounted 中 cancelAnimationFrame 并断开 ResizeObserver。
 */
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useDemoVisibility } from '../useDemoVisibility'

const props = defineProps<{ course?: string; phase?: number }>()

const rootEl = ref<HTMLElement | null>(null)
const { visible: demoVisible } = useDemoVisibility(rootEl)

/* ---------------- 缓动函数（Penner 公式） ---------------- */
type Easing = (t: number) => number

const linear: Easing = (t) => t
const easeOutQuad: Easing = (t) => 1 - (1 - t) ** 2

const C1 = 1.70158 // backOut 标准超调系数
const C3 = C1 + 1 // = 2.70158
const backOut: Easing = (t) => 1 + C3 * (t - 1) ** 3 + C1 * (t - 1) ** 2

const C4 = (2 * Math.PI) / 3 // easeOutElastic 周期参数
const easeOutElastic: Easing = (t) => {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * C4) + 1
}

const CURVES = [
  { key: 'linear', label: 'linear', fn: linear, var: '--color-text-muted' },
  { key: 'easeOutQuad', label: 'easeOutQuad', fn: easeOutQuad, var: '--color-primary' },
  { key: 'backOut', label: 'backOut', fn: backOut, var: '--color-accent' },
  { key: 'easeOutElastic', label: 'easeOutElastic', fn: easeOutElastic, var: '--color-success' },
] as const

/* ---------------- 设计系统色 → canvas 色 ---------------- */
let pal: Record<string, string> = {}

function withAlpha(rgba: string, alpha: number): string {
  return rgba.replace(/1\)$/, `${alpha})`)
}

function getPalette(): Record<string, string> {
  if (Object.keys(pal).length) return pal
  const cs = getComputedStyle(document.documentElement)
  const vars = [
    '--color-primary',
    '--color-accent',
    '--color-success',
    '--color-text',
    '--color-text-muted',
    '--color-border-light',
    '--color-surface',
  ]
  const out: Record<string, string> = {}
  for (const v of vars) {
    const raw = (cs.getPropertyValue(v) || '').trim().replace('#', '')
    out[v] = `rgba(${parseInt(raw.slice(0, 2), 16)},${parseInt(raw.slice(2, 4), 16)},${parseInt(raw.slice(4, 6), 16)},1)`
  }
  pal = out
  return out
}

/* ---------------- 画布与动画状态 ---------------- */
const t = ref(0) // 时间进度 0→1
const playing = ref(false)
const canvasEl = ref<HTMLCanvasElement | null>(null)

let dpr = 1
let W = 0
let H = 0
let rafId = 0
let lastTs = 0
let ro: ResizeObserver | null = null

const PAD = { left: 44, right: 14, top: 14, bottom: 30 }
const Y_MIN = -0.2
const Y_MAX = 1.45 // 留出超调空间（elastic 峰值 ≈ 1.35）
const SPEED = 0.6 // 播放时 t 每秒前进量
const SAMPLES = 240

function xPx(x: number): number {
  return PAD.left + x * (W - PAD.left - PAD.right)
}
function yPx(v: number): number {
  return PAD.top + ((Y_MAX - v) / (Y_MAX - Y_MIN)) * (H - PAD.top - PAD.bottom)
}

function draw(): void {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx || W < 10 || H < 10) return
  const colors = getPalette()
  const plotW = W - PAD.left - PAD.right

  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = colors['--color-surface']
  ctx.fillRect(0, 0, W, H)

  // 超调区（v > 1）
  ctx.fillStyle = withAlpha(colors['--color-primary'], 0.05)
  ctx.fillRect(PAD.left, yPx(Y_MAX), plotW, yPx(1) - yPx(Y_MAX))

  // 网格线
  ctx.strokeStyle = colors['--color-border-light']
  ctx.lineWidth = 1
  for (const v of [0, 0.5, 1]) {
    ctx.beginPath()
    ctx.moveTo(PAD.left, yPx(v))
    ctx.lineTo(W - PAD.right, yPx(v))
    ctx.stroke()
  }
  for (const g of [0, 0.25, 0.5, 0.75, 1]) {
    ctx.beginPath()
    ctx.moveTo(xPx(g), PAD.top)
    ctx.lineTo(xPx(g), H - PAD.bottom)
    ctx.stroke()
  }

  // 目标线 v = 1（虚线强调）
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = colors['--color-primary']
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(PAD.left, yPx(1))
  ctx.lineTo(W - PAD.right, yPx(1))
  ctx.stroke()
  ctx.setLineDash([])

  // 基线 v = 0
  ctx.strokeStyle = withAlpha(colors['--color-text'], 0.5)
  ctx.beginPath()
  ctx.moveTo(PAD.left, yPx(0))
  ctx.lineTo(W - PAD.right, yPx(0))
  ctx.stroke()

  // 坐标刻度
  ctx.fillStyle = colors['--color-text-muted']
  ctx.font = '11px system-ui, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText('1', PAD.left - 6, yPx(1))
  ctx.fillText('0.5', PAD.left - 6, yPx(0.5))
  ctx.fillText('0', PAD.left - 6, yPx(0))
  ctx.textAlign = 'left'
  ctx.fillText('v > 1（超调）', PAD.left + 6, yPx(1) - 14)
  ctx.fillText('t →', W - PAD.right - 2, H - 6)

  // 曲线
  for (const c of CURVES) {
    ctx.strokeStyle = colors[c.var]
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= SAMPLES; i++) {
      const x = i / SAMPLES
      const px = xPx(x)
      const py = yPx(c.fn(x))
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }

  // 当前时间引导线
  ctx.strokeStyle = withAlpha(colors['--color-text'], 0.25)
  ctx.setLineDash([3, 3])
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(xPx(t.value), PAD.top)
  ctx.lineTo(xPx(t.value), H - PAD.bottom)
  ctx.stroke()
  ctx.setLineDash([])

  // 4 个圆点：位置 = (t, eased(t))
  for (const c of CURVES) {
    ctx.beginPath()
    ctx.arc(xPx(t.value), yPx(c.fn(t.value)), 5, 0, Math.PI * 2)
    ctx.fillStyle = colors[c.var]
    ctx.fill()
    ctx.strokeStyle = withAlpha(colors['--color-text'], 0.35)
    ctx.lineWidth = 1
    ctx.stroke()
  }

  ctx.restore()
}

function resize(): void {
  const canvas = canvasEl.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  if (rect.width < 2 || rect.height < 2) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = rect.width
  H = rect.height
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  draw()
}

/* ---------------- 播放 / 暂停 / 重置 / 拖动 ---------------- */
function tick(now: number): void {
  if (lastTs) {
    const dt = Math.min((now - lastTs) / 1000, 0.05)
    let nt = t.value + dt * SPEED
    if (nt >= 1) nt = nt % 1 // 循环播放
    t.value = nt
    draw()
  }
  lastTs = now
  rafId = requestAnimationFrame(tick)
}

function resume(): void {
  // 播放中且可见才启动；不可见时由 demoVisible watcher 在回到视口后恢复
  if (!playing.value || !demoVisible.value || rafId) return
  lastTs = 0 // 恢复后从零计时，避免 dt 跳变
  rafId = requestAnimationFrame(tick)
}

function play(): void {
  if (playing.value) return
  playing.value = true
  resume()
}

function pause(): void {
  playing.value = false
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

// 离开视口/切后台：暂停循环但保持 playing 状态；回到视口自动续播
watch(demoVisible, (v) => {
  if (v) resume()
  else if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
})

function togglePlay(): void {
  playing.value ? pause() : play()
}

function reset(): void {
  pause()
  t.value = 0
  draw()
}

function onSeek(e: Event): void {
  const v = parseFloat((e.target as HTMLInputElement).value)
  t.value = Number.isFinite(v) ? v : 0
  lastTs = 0 // 播放中拖动时让下一帧重新计时，避免跳变
  draw()
}

onMounted(() => {
  if (canvasEl.value && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => resize())
    ro.observe(canvasEl.value)
  }
  resize()
})

onUnmounted(() => {
  pause()
  ro?.disconnect()
  ro = null
})
</script>

<template>
  <div ref="rootEl" class="demo-shell easing-demo">
    <div class="demo-head">
      <span class="demo-title">缓动曲线 Easing</span>
      <span v-if="props.phase" class="demo-ctx">{{ props.course }} · Phase {{ props.phase }} · cc.tween</span>
    </div>

    <div class="canvas-wrap">
      <canvas ref="canvasEl" aria-label="缓动曲线图"></canvas>
    </div>

    <div class="controls">
      <button type="button" class="btn btn-primary" @click="togglePlay">
        {{ playing ? '暂停' : '播放' }}
      </button>
      <button type="button" class="btn" @click="reset">重置</button>
      <input
        type="range"
        class="timeline"
        :value="t"
        min="0"
        max="1"
        step="0.001"
        :aria-label="'时间进度 t = ' + t.toFixed(2)"
        @input="onSeek"
      />
      <span class="t-value">t = {{ t.toFixed(2) }}</span>
    </div>

    <div class="legend">
      <span v-for="c in CURVES" :key="c.key" class="legend-item">
        <i class="dot" :style="{ background: c.var }"></i>
        <span class="lname">{{ c.label }}</span>
        <span class="lval">v = {{ c.fn(t).toFixed(2) }}</span>
      </span>
    </div>

    <div class="demo-caption">
      拖动时间轴或点击「播放」：4 个圆点沿各自的缓动曲线移动，圆点位置 = (t, eased(t))。
      linear 匀速；easeOutQuad 快→慢；backOut 与 easeOutElastic 会先超过 1 再回落（超调回弹）。
      暂停时圆点停在当前位置。
    </div>
  </div>
</template>

<style scoped>
.canvas-wrap canvas {
  display: block;
  width: 100%;
  height: 260px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.demo-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}
.demo-title {
  font-weight: 700;
  color: var(--color-text);
}
.demo-ctx {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.75rem;
}

.btn {
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.35rem 0.85rem;
  transition: border-color 0.15s ease, transform 0.08s ease;
}
.btn:hover {
  border-color: var(--color-primary);
}
.btn:active {
  transform: scale(0.96);
}
.btn-primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-surface);
}
.btn-primary:hover {
  filter: brightness(1.05);
}

.timeline {
  flex: 1;
  min-width: 160px;
  cursor: pointer;
  accent-color: var(--color-primary);
}
.t-value {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.1rem;
  margin-top: 0.6rem;
  font-size: 0.8rem;
  color: var(--color-text);
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  line-height: 1.2;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.lname {
  font-weight: 600;
}
.lval {
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
