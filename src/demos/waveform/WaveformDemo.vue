<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'

defineProps<{ course?: string; phase?: number }>()

const WAVEFORMS = ['sine', 'square', 'sawtooth', 'triangle'] as const
type WaveType = (typeof WAVEFORMS)[number]

const WAVE_LABELS: Record<WaveType, string> = {
  sine: '正弦波 sine',
  square: '方波 square',
  sawtooth: '锯齿波 sawtooth',
  triangle: '三角波 triangle',
}

/** 频率三档（220 / 440 / 880），演示「频率翻倍 = 音高升八度」 */
const FREQ_OPTIONS = [220, 440, 880]

/* ---------------- 界面状态 ---------------- */
const playing = ref(false)
const compare = ref(false) // 方波 vs 锯齿波 对比
const waveType = ref<WaveType>('sine')
const freqIndex = ref(1) // 0→220, 1→440, 2→880
const amp = ref(0.5) // 0..1

const freq = computed(() => FREQ_OPTIONS[freqIndex.value])

const status = ref('')
function updateStatus() {
  const wave = compare.value ? '方波 + 锯齿波（对比）' : WAVE_LABELS[waveType.value]
  const octave =
    freq.value === 220
      ? '低八度'
      : freq.value === 880
        ? '高八度'
        : '中央 A'
  const state = playing.value ? '播放中' : '已停止'
  status.value = `${state} · ${wave} · ${freq.value}Hz（${octave}）· 振幅 ${Math.round(amp.value * 100)}%`
}

/* ---------------- WebAudio 节点 ---------------- */
let ctx: AudioContext | null = null
let gain: GainNode | null = null
let analyser: AnalyserNode | null = null
let dataBuf: Float32Array | null = null
let oscs: OscillatorNode[] = []
let rafId: number | null = null

/* ---------------- 画布（颜色取自设计系统 CSS 变量） ---------------- */
const canvasEl = ref<HTMLCanvasElement | null>(null)
const colors = reactive({
  surface: 'transparent',
  border: 'transparent',
  primary: 'transparent',
  accent: 'transparent',
  textSoft: 'transparent',
})

async function toggle() {
  if (playing.value) stop()
  else await start()
}

async function start() {
  try {
    // 关键：AudioContext 只在用户点击「播放」时创建/恢复（自动播放策略）
    if (!ctx) {
      ctx = new AudioContext()
      gain = ctx.createGain()
      analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      dataBuf = new Float32Array(analyser.fftSize)
      gain.connect(analyser)
      analyser.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') await ctx.resume()
    rebuildOscillators()
    playing.value = true
    startDraw()
    updateStatus()
  } catch (err) {
    status.value = `无法播放音频：${err}`
  }
}

function rebuildOscillators() {
  if (!ctx || !gain) return
  for (const o of oscs) {
    try { o.stop() } catch { /* 已停止则忽略 */ }
    o.disconnect()
  }
  oscs = []
  // 对比模式：两个振荡器同时播，直观听「方波 vs 锯齿波」的音色差异
  const types: OscillatorType[] = compare.value ? ['square', 'sawtooth'] : [waveType.value]
  for (const t of types) {
    const o = ctx.createOscillator()
    o.type = t
    o.frequency.value = freq.value
    o.connect(gain)
    o.start()
    oscs.push(o)
  }
  // 双振荡器时各自减半，避免叠加削波
  gain.gain.value = amp.value * (compare.value ? 0.5 : 1)
}

function stop() {
  for (const o of oscs) {
    try { o.stop() } catch { /* 已停止则忽略 */ }
    o.disconnect()
  }
  oscs = []
  playing.value = false
  stopDraw()
  draw()
  updateStatus()
}

function updateFreq(v: number) {
  if (!ctx) return
  const t = ctx.currentTime
  for (const o of oscs) o.frequency.setTargetAtTime(v, t, 0.02)
}

function updateAmp(v: number) {
  if (!ctx || !gain) return
  gain.gain.setTargetAtTime(v * (compare.value ? 0.5 : 1), ctx.currentTime, 0.02)
}

function onWaveChange(e: Event) {
  waveType.value = (e.target as HTMLSelectElement).value as WaveType
}

function toggleCompare() {
  compare.value = !compare.value
}

/* ---------------- 绘制 ---------------- */
function drawCurve(
  c: CanvasRenderingContext2D,
  w: number,
  mid: number,
  pad: number,
  sample: (u: number) => number, // u ∈ [0,1]，返回 -1..1
  pts: number,
) {
  c.beginPath()
  for (let i = 0; i <= pts; i++) {
    const u = i / pts
    const v = sample(u)
    const x = u * w
    const y = mid - v * (mid - pad)
    if (i === 0) c.moveTo(x, y)
    else c.lineTo(x, y)
  }
}

function idealSample(type: WaveType, phase: number): number {
  const p = ((phase % 1) + 1) % 1
  switch (type) {
    case 'sine':
      return Math.sin(p * Math.PI * 2)
    case 'square':
      return Math.sin(p * Math.PI * 2) >= 0 ? 1 : -1
    case 'sawtooth':
      return p * 2 - 1
    case 'triangle':
      return 4 * Math.abs(p - 0.5) - 1
  }
}

function badge(c: CanvasRenderingContext2D, text: string) {
  c.font = '11px system-ui, sans-serif'
  c.fillStyle = colors.textSoft
  c.textBaseline = 'top'
  c.fillText(text, 8, 8)
}

function draw() {
  const cv = canvasEl.value
  if (!cv) return
  const c = cv.getContext('2d')
  if (!c) return
  const w = cv.width
  const h = cv.height
  const mid = h / 2
  const pad = 12

  // 背景
  c.fillStyle = colors.surface
  c.fillRect(0, 0, w, h)

  // 网格 + 中线
  c.strokeStyle = colors.border
  c.lineWidth = 1
  c.globalAlpha = 0.6
  for (let x = 60; x < w; x += 60) {
    c.beginPath()
    c.moveTo(x, 0)
    c.lineTo(x, h)
    c.stroke()
  }
  c.globalAlpha = 0.4
  c.beginPath()
  c.moveTo(0, mid)
  c.lineTo(w, mid)
  c.stroke()
  c.globalAlpha = 1

  const hasLive = playing.value && analyser && dataBuf != null

  if (hasLive) {
    // 实时波形：AnalyserNode.getFloatTimeDomainData
    const usable = Math.floor(analyser!.frequencyBinCount / 2)
    analyser!.getFloatTimeDomainData(dataBuf!)
    drawCurve(c, w, mid, pad, (u) => dataBuf![Math.floor(u * (usable - 1))], 512)
    c.strokeStyle = colors.primary
    c.lineWidth = 2
    c.stroke()
    badge(c, '● 实时波形（AnalyserNode）')
  } else {
    // 示意波形：按当前频率绘制理想波形（窗口 10ms，频率越高周期越密）
    const cycles = Math.max(1.5, freq.value * 0.01)
    if (compare.value) {
      c.globalAlpha = 0.85
      drawCurve(c, w, mid, pad, (u) => idealSample('square', u * cycles), 900)
      c.strokeStyle = colors.primary
      c.lineWidth = 2
      c.stroke()
      drawCurve(c, w, mid, pad, (u) => idealSample('sawtooth', u * cycles), 900)
      c.strokeStyle = colors.accent
      c.lineWidth = 2
      c.stroke()
      c.globalAlpha = 1
      badge(c, '示意 · 方波 / 锯齿波（对比）')
    } else {
      drawCurve(c, w, mid, pad, (u) => idealSample(waveType.value, u * cycles), 900)
      c.strokeStyle = colors.primary
      c.lineWidth = 2
      c.stroke()
      badge(c, `示意 · ${WAVE_LABELS[waveType.value]}`)
    }
  }
}

function startDraw() {
  stopDraw()
  const loop = () => {
    draw()
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
}

function stopDraw() {
  if (rafId != null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

/* ---------------- 监听 ---------------- */
watch(freq, (v) => {
  if (playing.value) updateFreq(v)
  else draw()
  updateStatus()
})

watch(amp, (v) => {
  if (playing.value) updateAmp(v)
  updateStatus()
})

watch(waveType, () => {
  if (playing.value && !compare.value) rebuildOscillators()
  if (!playing.value) draw()
  updateStatus()
})

watch(compare, () => {
  if (playing.value) rebuildOscillators()
  else draw()
  updateStatus()
})

/* ---------------- 生命周期 ---------------- */
onMounted(() => {
  const cs = getComputedStyle(document.documentElement)
  const read = (name: string) => cs.getPropertyValue(name).trim() || 'transparent'
  colors.surface = read('--color-surface')
  colors.border = read('--color-border')
  colors.primary = read('--color-primary')
  colors.accent = read('--color-accent')
  colors.textSoft = read('--color-text-soft')
  draw()
  updateStatus()
})

onUnmounted(() => {
  stopDraw()
  for (const o of oscs) {
    try { o.stop() } catch { /* 已停止则忽略 */ }
    o.disconnect()
  }
  oscs = []
  if (ctx) ctx.close().catch(() => {})
  ctx = null
  gain = null
  analyser = null
  dataBuf = null
})
</script>

<template>
  <div class="demo-shell waveform-demo">
    <div class="demo-controls">
      <button class="demo-btn" :class="playing ? 'danger' : 'primary'" @click="toggle">
        {{ playing ? '停止' : '播放' }}
      </button>

      <label class="demo-field">
        <span class="demo-label">波形</span>
        <select :value="waveType" :disabled="compare" @change="onWaveChange">
          <option v-for="t in WAVEFORMS" :key="t" :value="t">{{ WAVE_LABELS[t] }}</option>
        </select>
      </label>

      <button class="demo-btn compare" :class="{ active: compare }" @click="toggleCompare">
        {{ compare ? '退出对比' : '方波 vs 锯齿波' }}
      </button>
    </div>

    <div class="slider-row">
      <div class="slider-head">
        <span class="slider-name">频率（八度）</span>
        <span class="slider-value">{{ freq }} Hz</span>
      </div>
      <input type="range" min="0" max="2" step="1" v-model.number="freqIndex" aria-label="频率" />
      <div class="slider-ticks"><span>220</span><span>440</span><span>880</span></div>
    </div>

    <div class="slider-row">
      <div class="slider-head">
        <span class="slider-name">振幅</span>
        <span class="slider-value">{{ Math.round(amp * 100) }}%</span>
      </div>
      <input type="range" min="0" max="1" step="0.01" v-model.number="amp" aria-label="振幅" />
    </div>

    <div class="demo-canvas-wrap">
      <canvas ref="canvasEl" width="720" height="200" class="waveform-canvas"></canvas>
    </div>

    <p class="demo-status">{{ status }}</p>

    <p class="demo-caption">
      点击「播放」后由 OscillatorNode 生成声波，AnalyserNode 实时采样并绘制波形。切换波形改变音色（方波是 NES 音色的来源，锯齿波更锋利）；频率 220→440→880 每翻倍一次音高升八度；「对比」模式同时播放方波与锯齿波，直观感受同频不同波形的差异。
    </p>
  </div>
</template>

<style scoped>
.waveform-demo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 0.9rem;
  align-items: center;
}

.demo-field {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.demo-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.demo-btn {
  appearance: none;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.4rem 0.85rem;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.08s ease, background 0.2s ease, color 0.2s ease;
}

.demo-btn:hover {
  background: var(--color-bg-soft);
}

.demo-btn:active {
  transform: scale(0.96);
}

.demo-btn.primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-surface);
}

.demo-btn.primary:hover {
  background: var(--color-primary);
  filter: brightness(1.05);
}

.demo-btn.danger {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-surface);
}

.demo-btn.danger:hover {
  background: var(--color-accent);
  filter: brightness(1.05);
}

.demo-btn.compare.active {
  background: var(--color-accent-soft);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

select {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.5rem;
  font-size: 0.85rem;
  font-family: inherit;
}

select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider-row {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.slider-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.slider-name {
  color: var(--color-text-muted);
}

.slider-value {
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

input[type='range'] {
  width: 100%;
  max-width: 480px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  max-width: 480px;
  font-size: 0.72rem;
  color: var(--color-text-soft);
}

.demo-canvas-wrap {
  margin-top: 0.25rem;
}

.waveform-canvas {
  width: 100%;
  max-width: 720px;
  height: auto;
  display: block;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.demo-status {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin: 0;
}

.demo-caption {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}
</style>
