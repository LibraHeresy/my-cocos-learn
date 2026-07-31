<script setup lang="ts">
/**
 * 调色板演示（art 课程 · 阶段 3 色彩理论）
 *
 * H/S/L 三个滑块实时调整「主色」，按派生规则自动算出 4 色调色板
 * （主色 → 亮色 L+20/S-20、暗色 L-20/S-40、对比色 H+180）；
 * 每个色块显示 hex 值；16×16 小画布点选色板颜色后点击格子即可上色，
 * 且整幅画随调色板实时重着色。「2色 vs 4色」开关演示颜色限制让画面更简洁。
 */
import { computed, ref, watch } from 'vue'
import PixelView from './PixelView.vue'
import { hslToHex } from './hslToHex'

defineProps<{
  course?: string
  phase?: number
}>()

/** 初始主色取站点品牌色 #e07b3c（≈ HSL 24 / 70 / 56） */
const HUE = ref(24)
const SAT = ref(70)
const LIG = ref(56)

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

interface Swatch {
  name: string
  h: number
  s: number
  l: number
  hex: string
}

/** 主色 */
const mainColor = computed(() => ({
  h: HUE.value,
  s: SAT.value,
  l: LIG.value,
  hex: hslToHex(HUE.value, SAT.value, LIG.value),
}))

/** 派生 4 色调色板：亮色 L+20/S-20，暗色 L-20/S-40，对比色 H+180 */
const palette = computed<Swatch[]>(() => {
  const { h, s, l, hex } = mainColor.value
  const lightS = clamp(s - 20, 0, 100)
  const lightL = clamp(l + 20, 0, 100)
  const darkS = clamp(s - 40, 0, 100)
  const darkL = clamp(l - 20, 0, 100)
  const contrastH = (h + 180) % 360
  return [
    { name: '主色', h, s, l, hex },
    { name: '亮色', h, s: lightS, l: lightL, hex: hslToHex(h, lightS, lightL) },
    { name: '暗色', h, s: darkS, l: darkL, hex: hslToHex(h, darkS, darkL) },
    { name: '对比', h: contrastH, s, l, hex: hslToHex(contrastH, s, l) },
  ]
})

/** 调色板索引：0 主色 / 1 亮色 / 2 暗色 / 3 对比 */
const GRID_SIZE = 16
type CellIndex = -1 | 0 | 1 | 2 | 3

/** 预设示例：晚霞风景（天空=亮色、太阳=对比色、水面=主色、远山=暗色） */
const PRESET = [
  '1111111111111111',
  '1111111111111111',
  '1111111331111111',
  '1111113333311111',
  '1111133333331111',
  '1111133333331111',
  '1111113333311111',
  '1111111331111111',
  '1111111111111111',
  '0000000000000000',
  '0000000000000000',
  '..........2222..',
  '...2222222222...',
  '..222222222222..',
  '.22222222222222.',
  '2222222222222222',
]

function parsePreset(rows: string[]): number[][] {
  return rows.map((row) =>
    row.split('').map((ch): number => {
      if (ch === '0' || ch === '1' || ch === '2' || ch === '3') return Number(ch)
      return -1
    }),
  )
}

const emptyGrid = (): number[][] =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(-1))

/** 像素画网格：存调色板索引（-1 = 空），画作随调色板变化实时重着色 */
const indexGrid = ref<number[][]>(parsePreset(PRESET))

/** 配色限制模式：four = 主/亮/暗/对比，two = 仅主色 + 暗色 */
type Mode = 'four' | 'two'
const mode = ref<Mode>('four')

/** 当前选中用于上色的色块索引 */
const selected = ref(0)

/** 当前模式下可用的色块 */
const activeSwatches = computed<number[]>(() => (mode.value === 'two' ? [0, 2] : [0, 1, 2, 3]))

/** 派生出 PixelView 需要的 hex 网格 */
const displayGrid = computed<string[][]>(() => {
  const [main, light, dark, contrast] = palette.value
  return indexGrid.value.map((row) =>
    row.map((i): string => {
      if (i < 0) return ''
      if (mode.value === 'two') return i <= 1 ? main.hex : dark.hex
      switch (i as CellIndex) {
        case 1:
          return light.hex
        case 2:
          return dark.hex
        case 3:
          return contrast.hex
        default:
          return main.hex
      }
    }),
  )
})

/** 切到 2 色时把选中色收敛到主色/暗色 */
watch(mode, (m) => {
  if (m === 'two' && selected.value !== 0 && selected.value !== 2) selected.value = 0
})

function onCell(col: number, row: number) {
  if (selected.value < 0) return
  const grid = indexGrid.value.map((r) => [...r])
  grid[row][col] = selected.value
  indexGrid.value = grid
}

function clearArt() {
  indexGrid.value = emptyGrid()
}

function loadSample() {
  indexGrid.value = parsePreset(PRESET)
}
</script>

<template>
  <div class="demo-shell palette-demo">
    <!-- 主色预览 + H/S/L 滑块 -->
    <div class="palette-top">
      <div class="palette-preview">
        <span class="preview-chip" :style="{ background: mainColor.hex }" />
        <div class="preview-text">
          <div class="preview-title">主色</div>
          <div class="preview-hsl">
            H {{ HUE }} · S {{ SAT }}% · L {{ LIG }}%
          </div>
          <div class="preview-hex">{{ mainColor.hex }}</div>
        </div>
      </div>
      <div class="sliders">
        <label class="slider-row">
          <span class="slider-name">H 色相</span>
          <input v-model.number="HUE" type="range" min="0" max="360" step="1" />
          <span class="slider-val">{{ HUE }}</span>
        </label>
        <label class="slider-row">
          <span class="slider-name">S 饱和度</span>
          <input v-model.number="SAT" type="range" min="0" max="100" step="1" />
          <span class="slider-val">{{ SAT }}%</span>
        </label>
        <label class="slider-row">
          <span class="slider-name">L 亮度</span>
          <input v-model.number="LIG" type="range" min="0" max="100" step="1" />
          <span class="slider-val">{{ LIG }}%</span>
        </label>
      </div>
    </div>

    <!-- 派生调色板色块 -->
    <div class="palette-swatches" role="group" aria-label="调色板">
      <button
        v-for="idx in activeSwatches"
        :key="idx"
        class="swatch"
        :class="{ active: selected === idx }"
        type="button"
        @click="selected = idx"
      >
        <span class="swatch-chip" :style="{ background: palette[idx].hex }" />
        <span class="swatch-name">{{ palette[idx].name }}</span>
        <span class="swatch-hex">{{ palette[idx].hex }}</span>
      </button>
    </div>

    <!-- 像素画 + 配色限制控制 -->
    <div class="palette-art">
      <PixelView :grid="displayGrid" :scale="12" show-grid @cell="onCell" />
      <div class="art-side">
        <div class="mode-toggle" role="group" aria-label="配色数量">
          <button
            class="mode-btn"
            :class="{ on: mode === 'two' }"
            type="button"
            @click="mode = 'two'"
          >
            2色
          </button>
          <button
            class="mode-btn"
            :class="{ on: mode === 'four' }"
            type="button"
            @click="mode = 'four'"
          >
            4色
          </button>
        </div>
        <p class="mode-hint">
          {{ mode === 'two' ? '只用主色 + 暗色：画面只剩明暗两层，更简洁、对比更强。' : '主 / 亮 / 暗 / 对比四色，层次更丰富。' }}
        </p>
        <div class="art-actions">
          <button class="mini-btn" type="button" @click="clearArt">清空</button>
          <button class="mini-btn" type="button" @click="loadSample">示例</button>
        </div>
      </div>
    </div>

    <p class="demo-caption">
      拖动 H/S/L 实时调整主色，4 个色块按派生规则自动更新（亮色 L+20/S-20、暗色 L-20/S-40、对比色 H+180）。
      先点选色块，再点画布格子上色——整幅画会随调色板同步刷新。切换到「2色」看看限制带来的简洁感。
    </p>
  </div>
</template>

<style scoped>
.palette-demo {
  color: var(--color-text);
}

/* ---- 顶部：主色预览 + 滑块 ---- */
.palette-top {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  align-items: stretch;
}

.palette-preview {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1 1 220px;
}

.preview-chip {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.preview-title {
  font-weight: 600;
}

.preview-hsl {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.preview-hex {
  font-size: 0.78rem;
  color: var(--color-text-soft);
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
}

.sliders {
  flex: 2 1 300px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.82rem;
}

.slider-name {
  flex: 0 0 74px;
  color: var(--color-text-muted);
}

.slider-row input[type='range'] {
  flex: 1;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.slider-val {
  flex: 0 0 40px;
  text-align: right;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

/* ---- 派生色块 ---- */
.palette-swatches {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 76px;
  padding: 0.55rem 0.6rem 0.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: inherit;
  color: var(--color-text);
  transition:
    box-shadow 0.15s,
    transform 0.1s;
}

.swatch:hover {
  box-shadow: var(--shadow-md);
}

.swatch:active {
  transform: scale(0.97);
}

.swatch.active {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.swatch-chip {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
}

.swatch-name {
  font-size: 0.78rem;
  font-weight: 500;
}

.swatch-hex {
  font-size: 0.72rem;
  color: var(--color-text-soft);
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
}

/* ---- 像素画区域 ---- */
.palette-art {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-top: 1rem;
}

.art-side {
  flex: 1 1 220px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.mode-toggle {
  display: inline-flex;
  align-self: flex-start;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.mode-btn {
  padding: 0.3rem 0.9rem;
  border: none;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-family: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.mode-btn.on {
  background: var(--color-primary);
  color: var(--color-surface);
  font-weight: 600;
}

.mode-hint {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.art-actions {
  display: flex;
  gap: 0.5rem;
}

.mini-btn {
  padding: 0.25rem 0.8rem;
  font-size: 0.78rem;
  font-family: inherit;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s;
}

.mini-btn:hover {
  background: var(--color-surface);
}

.mini-btn:active {
  transform: scale(0.97);
}
</style>
