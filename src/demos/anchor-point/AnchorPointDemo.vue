<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'

defineProps<{
  course?: string
  phase?: number
}>()

/* ------------------------------------------------------------------ *
 * 设计系统取色：canvas 无法直接读 CSS 变量，运行时从 :root 读取一次。
 * ------------------------------------------------------------------ */
function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const C = {
  surface: cssVar('--color-surface'),
  borderLight: cssVar('--color-border-light'),
  text: cssVar('--color-text'),
  textMuted: cssVar('--color-text-muted'),
  textSoft: cssVar('--color-text-soft'),
  primary: cssVar('--color-primary'),
  primarySoft: cssVar('--color-primary-soft'),
  accent: cssVar('--color-accent'),
  success: cssVar('--color-success'),
  successSoft: cssVar('--color-success-soft'),
}

/* ------------------------------------------------------------------ *
 * 状态
 * ------------------------------------------------------------------ */
interface Vec2 {
  x: number
  y: number
}

// 左区：Y 轴朝上（Cocos）vs Y 轴朝下（浏览器）
const cocosPoint = reactive<Vec2>({ x: 80, y: 50 })
const browserPoint = reactive<Vec2>({ x: 80, y: 50 })

// 中区：锚点 + 旋转
const anchorPos = reactive<Vec2>({ x: 0, y: 40 }) // 锚点世界坐标（即 node.position）
const anchor = reactive<Vec2>({ x: 0.5, y: 0.5 }) // 锚点比例 0..1
const rotation = ref(25)

// 下区：父子链
const parentPos = reactive<Vec2>({ x: -70, y: 50 })
const childLocal = reactive<Vec2>({ x: 90, y: -55 })

const yupCanvas = ref<HTMLCanvasElement | null>(null)
const yDownCanvas = ref<HTMLCanvasElement | null>(null)
const anchorCanvas = ref<HTMLCanvasElement | null>(null)
const parentCanvas = ref<HTMLCanvasElement | null>(null)

// 父子画布拖拽命中的目标
let grabMode: 'parent' | 'child' | null = null

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)
const fmt = (v: number) => Math.round(v)
const worldChildX = () => parentPos.x + childLocal.x
const worldChildY = () => parentPos.y + childLocal.y

/* ------------------------------------------------------------------ *
 * 绘图工具
 * ------------------------------------------------------------------ */
function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-7, -4)
  ctx.lineTo(-7, 4)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

/** Y 轴朝上的通用网格（原点在中心），返回中心像素坐标 */
function drawYGrid(ctx: CanvasRenderingContext2D, W: number, H: number, labels: boolean) {
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = C.surface
  ctx.fillRect(0, 0, W, H)

  const cx = W / 2
  const cy = H / 2
  const step = 30

  ctx.strokeStyle = C.borderLight
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = cx % step; x < W; x += step) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
  }
  for (let y = cy % step; y < H; y += step) {
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
  }
  ctx.stroke()

  ctx.strokeStyle = C.primary
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, cy)
  ctx.lineTo(W, cy)
  ctx.moveTo(cx, 0)
  ctx.lineTo(cx, H)
  ctx.stroke()
  drawArrow(ctx, W - 4, cy, 0, C.primary) // → +X
  drawArrow(ctx, cx, 3, -Math.PI / 2, C.primary) // ↑ +Y

  if (labels) {
    ctx.fillStyle = C.textMuted
    ctx.font = '11px sans-serif'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText('+X →', W - 46, cy - 10)
    ctx.fillText('+Y ↑', cx + 10, 12)
    ctx.fillText('原点 (0,0)', cx + 12, cy + 16)
  }
  return { cx, cy }
}

/** Y 轴朝下的网格（原点在左上角） */
function drawBrowserGrid(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = C.surface
  ctx.fillRect(0, 0, W, H)

  const step = 30
  ctx.strokeStyle = C.borderLight
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = step; x < W; x += step) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
  }
  for (let y = step; y < H; y += step) {
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
  }
  ctx.stroke()

  ctx.strokeStyle = C.primary
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(W, 0) // 顶边 = X 轴
  ctx.moveTo(0, 0)
  ctx.lineTo(0, H) // 左边 = Y 轴
  ctx.stroke()
  drawArrow(ctx, W - 4, 3, 0, C.primary) // → +X
  drawArrow(ctx, 3, H - 3, Math.PI / 2, C.primary) // ↓ +Y

  ctx.fillStyle = C.textMuted
  ctx.font = '11px sans-serif'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillText('+X →', W - 46, 14)
  ctx.fillText('+Y ↓', 8, H - 8)
  ctx.fillText('原点 (0,0)', 10, 26)
}

function drawPoint(ctx: CanvasRenderingContext2D, px: number, py: number, label: string) {
  ctx.beginPath()
  ctx.arc(px, py, 6, 0, Math.PI * 2)
  ctx.fillStyle = C.primary
  ctx.fill()
  ctx.strokeStyle = C.surface
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(px, py, 9, 0, Math.PI * 2)
  ctx.strokeStyle = C.accent
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = C.text
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, px + 13, py - 12)
}

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  const r = 8
  ctx.beginPath()
  ctx.moveTo(x - r, y)
  ctx.lineTo(x + r, y)
  ctx.moveTo(x, y - r)
  ctx.lineTo(x, y + r)
  ctx.stroke()
}

function drawSquare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fill: string,
  stroke: string,
  label: string,
) {
  const r = size / 2
  ctx.fillStyle = fill
  ctx.strokeStyle = stroke
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.rect(x - r, y - r, size, size)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = C.text
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y + 1)
}

/* ------------------------------------------------------------------ *
 * 各画布绘制
 * ------------------------------------------------------------------ */
function drawYup() {
  const canvas = yupCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.clientWidth
  const H = canvas.clientHeight
  if (W <= 0 || H <= 0) return
  const { cx, cy } = drawYGrid(ctx, W, H, true)
  drawPoint(ctx, cx + cocosPoint.x, cy - cocosPoint.y, 'node')
}

function drawYDown() {
  const canvas = yDownCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.clientWidth
  const H = canvas.clientHeight
  if (W <= 0 || H <= 0) return
  drawBrowserGrid(ctx, W, H)
  drawPoint(ctx, browserPoint.x, browserPoint.y, 'element')
}

function drawAnchor() {
  const canvas = anchorCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.clientWidth
  const H = canvas.clientHeight
  if (W <= 0 || H <= 0) return
  const { cx, cy } = drawYGrid(ctx, W, H, true)

  const rectW = 120
  const rectH = 80
  const rad = (rotation.value * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  // 本地空间（Y 朝上，锚点在本地原点）：把锚点比例转成角点偏移
  const lx0 = -anchor.x * rectW
  const ly0 = -anchor.y * rectH
  const lx1 = (1 - anchor.x) * rectW
  const ly1 = (1 - anchor.y) * rectH
  const corners = (
    [
      [lx0, ly0],
      [lx1, ly0],
      [lx1, ly1],
      [lx0, ly1],
    ] as const
  ).map(([lx, ly]) => {
    const rx = lx * cos - ly * sin
    const ry = lx * sin + ly * cos
    return { x: cx + anchorPos.x + rx, y: cy - anchorPos.y - ry }
  })

  // 旋转到锚点的辅助虚线（矩形中心）
  const ccx = (lx0 + lx1) / 2
  const ccy = (ly0 + ly1) / 2
  const rcx = ccx * cos - ccy * sin
  const rcy = ccx * sin + ccy * cos
  ctx.beginPath()
  ctx.moveTo(cx + anchorPos.x, cy - anchorPos.y)
  ctx.lineTo(cx + anchorPos.x + rcx, cy - anchorPos.y - rcy)
  ctx.strokeStyle = C.accent
  ctx.setLineDash([4, 3])
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.setLineDash([])

  // 矩形本体
  ctx.beginPath()
  ctx.moveTo(corners[0].x, corners[0].y)
  for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y)
  ctx.closePath()
  ctx.fillStyle = C.primarySoft
  ctx.fill()
  ctx.strokeStyle = C.primary
  ctx.lineWidth = 2
  ctx.stroke()

  // 锚点十字（即 node.position）
  drawCross(ctx, cx + anchorPos.x, cy - anchorPos.y, C.accent)
}

function drawParent() {
  const canvas = parentCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.clientWidth
  const H = canvas.clientHeight
  if (W <= 0 || H <= 0) return
  const { cx, cy } = drawYGrid(ctx, W, H, true)

  const wX = worldChildX()
  const wY = worldChildY()

  // 父子连线
  ctx.beginPath()
  ctx.moveTo(cx + parentPos.x, cy - parentPos.y)
  ctx.lineTo(cx + wX, cy - wY)
  ctx.strokeStyle = C.textMuted
  ctx.setLineDash([5, 4])
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.setLineDash([])

  // 子（世界坐标 = 父 + 本地）
  drawSquare(ctx, cx + wX, cy - wY, 30, C.primarySoft, C.primary, '子')
  // 父
  drawSquare(ctx, cx + parentPos.x, cy - parentPos.y, 46, C.successSoft, C.success, '父')

  // 原点小标记
  drawCross(ctx, cx, cy, C.textSoft)
}

/* ------------------------------------------------------------------ *
 * 画布尺寸适配（DPR） + 状态边界钳制
 * ------------------------------------------------------------------ */
function setupCanvas(canvas: HTMLCanvasElement | null, draw: () => void): () => void {
  if (!canvas) return () => {}
  const ro = new ResizeObserver(() => {
    if (!canvas.isConnected) return
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (w <= 0 || h <= 0) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw()
  })
  ro.observe(canvas)
  return () => ro.disconnect()
}

function clampVec(v: Vec2, canvas: HTMLCanvasElement | null, margin: number) {
  if (!canvas) return
  const W = canvas.clientWidth
  const H = canvas.clientHeight
  if (W <= 0 || H <= 0) return
  const cx = W / 2
  const cy = H / 2
  v.x = clamp(v.x, -cx + margin, cx - margin)
  v.y = clamp(v.y, -cy + margin, cy - margin)
}

function clampChildLocal(canvas: HTMLCanvasElement | null, margin: number) {
  if (!canvas) return
  const W = canvas.clientWidth
  const H = canvas.clientHeight
  if (W <= 0 || H <= 0) return
  const cx = W / 2
  const cy = H / 2
  childLocal.x = clamp(childLocal.x, -cx + margin - parentPos.x, cx - margin - parentPos.x)
  childLocal.y = clamp(childLocal.y, -cy + margin - parentPos.y, cy - margin - parentPos.y)
}

function clampState() {
  clampVec(cocosPoint, yupCanvas.value, 12)
  clampVec(browserPoint, yDownCanvas.value, 12)
  clampVec(anchorPos, anchorCanvas.value, 60)
  clampVec(parentPos, parentCanvas.value, 16)
  clampChildLocal(parentCanvas.value, 16)
}

function redrawAll() {
  clampState()
  drawYup()
  drawYDown()
  drawAnchor()
  drawParent()
}

/* ------------------------------------------------------------------ *
 * Pointer 拖拽（不用方向键，避免与全局 ←/→ 翻页冲突）
 * ------------------------------------------------------------------ */
interface DragHandlers {
  onDown?(x: number, y: number): void
  onMove(x: number, y: number): void
  onUp?(): void
}

function bindDrag(el: HTMLCanvasElement | null, handlers: DragHandlers): () => void {
  if (!el) return () => {}
  let pid: number | null = null
  const toLocal = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const down = (e: PointerEvent) => {
    e.preventDefault()
    pid = e.pointerId
    try {
      el.setPointerCapture(pid)
    } catch {
      /* ignore */
    }
    const p = toLocal(e)
    if (handlers.onDown) handlers.onDown(p.x, p.y)
    else handlers.onMove(p.x, p.y)
  }
  const move = (e: PointerEvent) => {
    if (pid === null || e.pointerId !== pid) return
    const p = toLocal(e)
    handlers.onMove(p.x, p.y)
  }
  const up = (e: PointerEvent) => {
    if (pid === null || e.pointerId !== pid) return
    pid = null
    if (handlers.onUp) handlers.onUp()
  }
  el.addEventListener('pointerdown', down)
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
  return () => {
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
  }
}

/* ------------------------------------------------------------------ *
 * 生命周期
 * ------------------------------------------------------------------ */
const disposers: Array<() => void> = []

onMounted(() => {
  disposers.push(setupCanvas(yupCanvas.value, drawYup))
  disposers.push(setupCanvas(yDownCanvas.value, drawYDown))
  disposers.push(setupCanvas(anchorCanvas.value, drawAnchor))
  disposers.push(setupCanvas(parentCanvas.value, drawParent))

  disposers.push(
    bindDrag(yupCanvas.value, {
      onMove: (px, py) => {
        const W = yupCanvas.value?.clientWidth ?? 0
        const H = yupCanvas.value?.clientHeight ?? 0
        if (W <= 0 || H <= 0) return
        cocosPoint.x = clamp(px - W / 2, -W / 2 + 12, W / 2 - 12)
        cocosPoint.y = clamp(-(py - H / 2), -H / 2 + 12, H / 2 - 12)
        redrawAll()
      },
    }),
  )
  disposers.push(
    bindDrag(yDownCanvas.value, {
      onMove: (px, py) => {
        const W = yDownCanvas.value?.clientWidth ?? 0
        const H = yDownCanvas.value?.clientHeight ?? 0
        if (W <= 0 || H <= 0) return
        browserPoint.x = clamp(px, 12, W - 12)
        browserPoint.y = clamp(py, 12, H - 12)
        redrawAll()
      },
    }),
  )
  disposers.push(
    bindDrag(anchorCanvas.value, {
      onMove: (px, py) => {
        const W = anchorCanvas.value?.clientWidth ?? 0
        const H = anchorCanvas.value?.clientHeight ?? 0
        if (W <= 0 || H <= 0) return
        anchorPos.x = clamp(px - W / 2, -W / 2 + 60, W / 2 - 60)
        anchorPos.y = clamp(H / 2 - py, -H / 2 + 60, H / 2 - 60)
        redrawAll()
      },
    }),
  )
  disposers.push(
    bindDrag(parentCanvas.value, {
      onDown: (px, py) => {
        const c = parentCanvas.value
        if (!c) return
        const W = c.clientWidth
        const H = c.clientHeight
        const cx = W / 2
        const cy = H / 2
        const parentPix = { x: cx + parentPos.x, y: cy - parentPos.y }
        const childPix = { x: cx + worldChildX(), y: cy - worldChildY() }
        const dist = Math.hypot
        const dP = dist(px - parentPix.x, py - parentPix.y)
        const dC = dist(px - childPix.x, py - childPix.y)
        grabMode = dP < 28 && dP <= dC ? 'parent' : dC < 22 ? 'child' : null
      },
      onMove: (px, py) => {
        const c = parentCanvas.value
        if (!c || !grabMode) return
        const W = c.clientWidth
        const H = c.clientHeight
        if (W <= 0 || H <= 0) return
        const cx = W / 2
        const cy = H / 2
        const wx = px - cx
        const wy = cy - py
        if (grabMode === 'parent') {
          parentPos.x = clamp(wx, -cx + 16, cx - 16)
          parentPos.y = clamp(wy, -cy + 16, cy - 16)
        } else {
          childLocal.x = clamp(wx - parentPos.x, -cx + 16 - parentPos.x, cx - 16 - parentPos.x)
          childLocal.y = clamp(wy - parentPos.y, -cy + 16 - parentPos.y, cy - 16 - parentPos.y)
        }
        redrawAll()
      },
      onUp: () => {
        grabMode = null
      },
    }),
  )

  redrawAll()
})

onUnmounted(() => {
  disposers.forEach((fn) => fn())
  disposers.length = 0
})

function setAnchor(x: number, y: number) {
  anchor.x = x
  anchor.y = y
  redrawAll()
}
</script>

<template>
  <div class="demo-shell anchor-demo">
    <h4 class="demo-title">锚点与坐标系演示</h4>

    <!-- ① Y 轴方向对比 -->
    <section class="demo-section">
      <div class="demo-grid-2">
        <div class="demo-panel">
          <div class="demo-panel-title">Cocos — Y 轴朝上（原点在中心）</div>
          <canvas ref="yupCanvas" class="demo-canvas" style="height: 230px"></canvas>
          <div class="demo-readout">
            <span class="dot dot-primary"></span> node.position ({{ fmt(cocosPoint.x) }},
            {{ fmt(cocosPoint.y) }})<br />
            <span class="dot dot-accent"></span> worldPosition = ({{ fmt(cocosPoint.x) }},
            {{ fmt(cocosPoint.y) }})<br />
            <em>根节点无父级：世界坐标 = 本地坐标</em>
          </div>
        </div>
        <div class="demo-panel">
          <div class="demo-panel-title">浏览器 — Y 轴朝下（原点在左上角）</div>
          <canvas ref="yDownCanvas" class="demo-canvas" style="height: 230px"></canvas>
          <div class="demo-readout">
            <span class="dot dot-primary"></span> node.position ({{ fmt(browserPoint.x) }},
            {{ fmt(browserPoint.y) }})<br />
            <span class="dot dot-accent"></span> worldPosition = ({{ fmt(browserPoint.x) }},
            {{ fmt(browserPoint.y) }})
          </div>
        </div>
      </div>
      <p class="demo-caption">
        拖动两个画布里的圆点。同一个"视觉位置"，Cocos 报告正的 Y（向上），浏览器报告负的 Y（向下）——所以从前端转 Cocos 时，把 Y 值取反是最常见的坑。
      </p>
    </section>

    <!-- ② 锚点与旋转 -->
    <section class="demo-section">
      <div class="demo-panel">
        <div class="demo-panel-title">锚点（Anchor）与旋转</div>
        <canvas ref="anchorCanvas" class="demo-canvas" style="height: 250px"></canvas>
        <div class="demo-controls">
          <label>锚点 X <input v-model.number="anchor.x" type="range" min="0" max="1" step="0.01" @input="redrawAll" /></label>
          <label>锚点 Y <input v-model.number="anchor.y" type="range" min="0" max="1" step="0.01" @input="redrawAll" /></label>
          <label>旋转 <input v-model.number="rotation" type="range" min="-180" max="180" step="1" @input="redrawAll" /> {{ fmt(rotation) }}°</label>
        </div>
        <div class="demo-btns">
          <button type="button" @click="setAnchor(0.5, 0.5)">锚点：中心</button>
          <button type="button" @click="setAnchor(0, 0)">锚点：左下角</button>
          <button type="button" @click="setAnchor(0.5, 0)">锚点：底部中心</button>
        </div>
        <div class="demo-readout">
          node.position（十字） = ({{ fmt(anchorPos.x) }}, {{ fmt(anchorPos.y) }}) · 锚点比例 = ({{
            anchor.x.toFixed(2)
          }}, {{ anchor.y.toFixed(2) }}) · 旋转 = {{ fmt(rotation) }}°
        </div>
      </div>
      <p class="demo-caption">
        十字标记就是锚点（即 node.position），可拖拽移动；旋转永远绕锚点进行。锚点在中心时矩形原地自转，锚点在左下角时整块矩形绕着角落甩动。
      </p>
    </section>

    <!-- ③ 父子链 -->
    <section class="demo-section">
      <div class="demo-panel">
        <div class="demo-panel-title">父子链：子世界坐标 = 父 position + 子本地坐标</div>
        <canvas ref="parentCanvas" class="demo-canvas" style="height: 250px"></canvas>
        <div class="demo-controls">
          <label>父 X <input v-model.number="parentPos.x" type="range" min="-160" max="160" step="1" @input="redrawAll" /></label>
          <label>父 Y <input v-model.number="parentPos.y" type="range" min="-160" max="160" step="1" @input="redrawAll" /></label>
          <label>子本地 X <input v-model.number="childLocal.x" type="range" min="-120" max="120" step="1" @input="redrawAll" /></label>
          <label>子本地 Y <input v-model.number="childLocal.y" type="range" min="-120" max="120" step="1" @input="redrawAll" /></label>
        </div>
        <div class="demo-readout">
          父 position = ({{ fmt(parentPos.x) }}, {{ fmt(parentPos.y) }})<br />
          子 本地 = ({{ fmt(childLocal.x) }}, {{ fmt(childLocal.y) }})<br />
          <span class="world">子 世界 = ({{ fmt(parentPos.x + childLocal.x) }}, {{ fmt(parentPos.y + childLocal.y) }})</span>
        </div>
      </div>
      <p class="demo-caption">
        拖动父/子方块或滑块：父移动时子跟着动，但子的本地坐标不变；子的世界坐标始终等于「父 position + 子本地」。这正是 Cocos 里节点级联变换的原理。
      </p>
    </section>
  </div>
</template>

<style scoped>
.demo-title {
  margin: 0 0 0.4rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.demo-section {
  margin-top: 1rem;
}

.demo-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.demo-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: 0.6rem;
}

.demo-panel-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.demo-canvas {
  width: 100%;
  display: block;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: grab;
  touch-action: none;
}

.demo-canvas:active {
  cursor: grabbing;
}

.demo-readout {
  font-size: 0.78rem;
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  color: var(--color-text);
  background: var(--color-bg-soft);
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  margin-top: 0.5rem;
  line-height: 1.7;
}

.demo-readout em {
  font-family: inherit;
  font-size: 0.92em;
}

.dot {
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  border-radius: 50%;
  margin-right: 0.3em;
  vertical-align: baseline;
}

.dot-primary {
  background: var(--color-primary);
}

.dot-accent {
  background: var(--color-accent);
}

.world {
  color: var(--color-accent);
  font-weight: 600;
}

.demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.1rem;
  margin-top: 0.6rem;
  font-size: 0.8rem;
  color: var(--color-text);
  align-items: center;
}

.demo-controls label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.demo-controls input[type='range'] {
  accent-color: var(--color-primary);
}

.demo-btns {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
  flex-wrap: wrap;
}

.demo-btns button {
  font-size: 0.78rem;
  padding: 0.25em 0.7em;
  border: 1px solid var(--color-border);
  background: var(--color-bg-soft);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.demo-btns button:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

@media (max-width: 640px) {
  .demo-grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
