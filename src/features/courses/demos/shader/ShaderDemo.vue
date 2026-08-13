<script setup lang="ts">
/**
 * Shader 对比演示（cocos 课程 · 阶段 21 Shader 与后处理）
 *
 * 左右双 canvas 显示同一张「像素飞船 + 星野 + 粒子」图：
 *   - 左边：Canvas2D 原图
 *   - 右边：WebGL fragment shader 逐像素处理（最简 quad = 2 个三角形 + position/uv + 1 纹理）
 *
 * 三个效果切换按钮：灰度 / 量化调色板 / RGB 通道交换。
 * 切换时右侧画布与下方 GLSL 源码同步更换，源码可一键复制。
 *
 * 健壮性：
 *   - 监听 webglcontextlost（preventDefault）与 webglcontextrestored（自动重建管线），
 *     可用「模拟 context lost」按钮主动演示
 *   - WebGL 不可用时自动降级为 Canvas2D 逐像素处理（ctx.filter / getImageData）
 *
 * 颜色全部取自设计系统 CSS 变量（画布内容在 onMounted 里读取）。
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'

defineProps<{
  course?: string
  phase?: number
}>()

const SPRITE_SIZE = 160

/* ---------------- 效果定义 ---------------- */
type EffectId = 'none' | 'grayscale' | 'quantize' | 'rgb-swap'

interface EffectDef {
  id: EffectId
  label: string
  hint: string
}

const EFFECTS: EffectDef[] = [
  { id: 'none', label: '原图', hint: '直接采样纹理，不加任何处理' },
  { id: 'grayscale', label: '灰度', hint: '三通道加权平均，人眼对绿最敏感所以绿权重最高' },
  { id: 'quantize', label: '量化调色板', hint: '把连续颜色压成 4 级台阶，赛璐珞 / 复古贴图的直觉' },
  { id: 'rgb-swap', label: 'RGB 通道交换', hint: '把 R/G/B 三个通道重新排列' },
]

const effect = ref<EffectId>('grayscale')
const copied = ref(false)

const currentFx = computed(() => EFFECTS.find((e) => e.id === effect.value)!)
const currentLabel = computed(() => currentFx.value.label)
const currentHint = computed(() => currentFx.value.hint)
const currentFragSrc = computed(() => FRAG_SRCS[effect.value])

/* ---------------- GLSL 源码（字符串常量，与真实编译版本一致） ---------------- */
const VERT_SRC = `// 顶点着色器：把覆盖全屏的 quad（2 个三角形）顶点直接输出
// 只有 position + uv 两组属性，是最简的渲染管线
attribute vec2 a_pos;   // 顶点在裁剪空间的位置（-1..1）
attribute vec2 a_uv;    // 纹理坐标（0..1），会被插值到每个片元
varying vec2 v_uv;

void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG_SRCS: Record<EffectId, string> = {
  none: `// 原图：直接采样纹理颜色
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;   // ← 一张纹理，被上千个片元并行采样

void main() {
  gl_FragColor = texture2D(u_tex, v_uv);
}
`,
  grayscale: `// 灰度：三通道加权平均（人眼对绿最敏感 → 权重最高）
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;

void main() {
  vec4 c = texture2D(u_tex, v_uv);
  float gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  gl_FragColor = vec4(vec3(gray), c.a);
}
`,
  quantize: `// 量化调色板：把连续颜色压成有限的几个台阶（赛璐珞 / 复古风）
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;

const float LEVELS = 4.0;   // 4 级台阶

void main() {
  vec4 c = texture2D(u_tex, v_uv);
  c.rgb = floor(c.rgb * LEVELS + 0.5) / LEVELS;
  gl_FragColor = c;
}
`,
  'rgb-swap': `// RGB 通道交换：把三个通道重新排列（R←G, G←B, B←R）
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;

void main() {
  vec4 c = texture2D(u_tex, v_uv);
  gl_FragColor = vec4(c.g, c.b, c.r, c.a);
}
`,
}

async function copySource() {
  const text = currentFragSrc.value
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    /* 复制失败时静默忽略 */
  }
}

/* ---------------- 画布与渲染状态 ---------------- */
const leftCanvas = ref<HTMLCanvasElement | null>(null)
const rightCanvas = ref<HTMLCanvasElement | null>(null)

const useWebgl = ref(false) // 是否成功拿到 WebGL 上下文
const webglLost = ref(false) // context lost 是否正在发生

const rightTag = computed(() => (useWebgl.value ? 'WebGL' : 'Canvas2D 降级'))
const backendLabel = computed(() => {
  if (!useWebgl.value) return 'Canvas2D ctx（WebGL 不可用，自动降级）'
  if (webglLost.value) return 'WebGL · context lost（已 preventDefault，等待恢复）'
  return 'WebGL'
})

let gl: WebGLRenderingContext | null = null
let programsMap = new Map<EffectId, WebGLProgram>()
let vbo: WebGLBuffer | null = null
let ebo: WebGLBuffer | null = null
let texture: WebGLTexture | null = null
let spriteCanvas: HTMLCanvasElement | null = null
let rafId = 0

/* ---------------- 设计系统颜色（画布内容用） ---------------- */
const colors: Record<string, string> = {
  surface: '',
  primary: '',
  primaryDark: '',
  primarySoft: '',
  accent: '',
  star: '',
  onAccent: '',
  codeblockBg: '',
  codeblockText: '',
  textSoft: '',
  success: '',
}

function readPalette() {
  const cs = getComputedStyle(document.documentElement)
  const read = (name: string, fallback = '') => cs.getPropertyValue(name).trim() || fallback
  colors.surface = read('--color-surface')
  colors.primary = read('--color-primary')
  colors.primaryDark = read('--color-primary-dark', colors.primary)
  colors.primarySoft = read('--color-primary-soft')
  colors.accent = read('--color-accent')
  colors.star = read('--color-star', '#f0b428')
  colors.onAccent = read('--color-on-accent', '#fff')
  colors.codeblockBg = read('--color-codeblock-bg')
  colors.codeblockText = read('--color-codeblock-text')
  colors.textSoft = read('--color-text-soft')
  colors.success = read('--color-success')
}

/* ---------------- 像素画：飞船 + 星野 + 粒子 ---------------- */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Star {
  x: number
  y: number
  size: number
  bright: boolean
  phase: number
}
interface Particle {
  base: number
  r: number
  dir: 1 | -1
  phase: number
  colorKey: string
}

/** 星野：种子随机生成，位置固定，亮度随时间闪烁 */
const STARS: Star[] = (() => {
  const rnd = mulberry32(0xc0c05)
  const out: Star[] = []
  for (let i = 0; i < 44; i++) {
    out.push({
      x: Math.floor(rnd() * SPRITE_SIZE),
      y: Math.floor(rnd() * SPRITE_SIZE),
      size: rnd() < 0.2 ? 2 : 1,
      bright: rnd() < 0.3,
      phase: rnd() * Math.PI * 2,
    })
  }
  return out
})()

/** 环绕飞船的粒子：沿椭圆轨道缓慢漂移 + 闪烁 */
const PARTICLES: Particle[] = (() => {
  const rnd = mulberry32(0x5eed)
  const keys = ['primary', 'star', 'success', 'accent', 'onAccent', 'textSoft']
  const out: Particle[] = []
  for (let i = 0; i < 16; i++) {
    out.push({
      base: rnd() * Math.PI * 2,
      r: 26 + rnd() * 38,
      dir: rnd() < 0.5 ? 1 : -1,
      phase: rnd() * Math.PI * 2,
      colorKey: keys[i % keys.length],
    })
  }
  return out
})()

function drawShip(c: CanvasRenderingContext2D, t: number) {
  const P = colors

  // 引擎火焰（动画，先画被船体喷口遮住下缘）
  const flame = 16 + Math.round(5 * Math.sin(t / 85))
  c.fillStyle = P.accent
  c.fillRect(76, 138, 8, flame)
  c.fillStyle = P.star
  c.fillRect(78, 138, 4, Math.max(2, flame - 6))
  c.fillStyle = P.onAccent
  c.fillRect(79, 138, 2, Math.max(2, flame - 12))

  // 侧喷口
  c.fillStyle = P.accent
  c.fillRect(60, 120, 6, 6)
  c.fillRect(94, 120, 6, 6)
  c.fillStyle = P.star
  c.fillRect(61, 123, 4, 3)
  c.fillRect(95, 123, 4, 3)

  // 尾翼
  c.fillStyle = P.primaryDark
  c.fillRect(56, 100, 14, 6)
  c.fillRect(52, 106, 18, 12)
  c.fillRect(90, 100, 14, 6)
  c.fillRect(90, 106, 18, 12)
  c.fillStyle = P.primary
  c.fillRect(56, 107, 6, 8)
  c.fillRect(98, 107, 6, 8)

  // 喷口
  c.fillStyle = P.primaryDark
  c.fillRect(73, 133, 14, 3)
  c.fillRect(75, 136, 10, 2)

  // 机身
  c.fillStyle = P.primary
  c.fillRect(70, 67, 20, 66)
  // 锥形头部
  c.fillRect(72, 64, 16, 3)
  c.fillRect(74, 61, 12, 3)
  c.fillRect(76, 58, 8, 3)
  c.fillRect(78, 56, 4, 2)
  // 左高光 / 右阴影
  c.fillStyle = P.primarySoft
  c.fillRect(70, 67, 3, 66)
  c.fillStyle = P.primaryDark
  c.fillRect(87, 67, 3, 66)
  // 机身分隔线
  c.fillRect(70, 92, 20, 2)
  c.fillRect(70, 108, 20, 2)
  c.fillRect(70, 124, 20, 2)
  // 侧喷口盖
  c.fillRect(66, 117, 4, 6)
  c.fillRect(90, 117, 4, 6)
  // 座舱窗
  c.fillStyle = P.primaryDark
  c.fillRect(73, 72, 14, 14)
  c.fillStyle = P.onAccent
  c.fillRect(76, 75, 8, 8)
  c.fillStyle = P.star
  c.fillRect(77, 76, 2, 3)
  c.fillRect(81, 79, 2, 2)
}

function makeSprite(t: number) {
  if (!spriteCanvas) return
  const c = spriteCanvas.getContext('2d')
  if (!c) return
  const S = SPRITE_SIZE
  c.clearRect(0, 0, S, S)
  c.fillStyle = colors.codeblockBg || '#2d2a26'
  c.fillRect(0, 0, S, S)

  // 星野（先画，作为背景）
  for (const s of STARS) {
    c.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.0008 + s.phase))
    c.fillStyle = s.bright ? colors.star : colors.codeblockText
    c.fillRect(s.x, s.y, s.size, s.size)
  }
  // 环绕粒子（画在飞船后面）
  for (const p of PARTICLES) {
    const a = p.base + t * 0.0004 * p.dir
    const x = Math.round(80 + Math.cos(a) * p.r)
    const y = Math.round(92 + Math.sin(a) * p.r * 0.72)
    c.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(t * 0.0012 + p.phase))
    c.fillStyle = colors[p.colorKey]
    c.fillRect(x, y, 3, 3)
  }
  c.globalAlpha = 1
  drawShip(c, t)
}

/* ---------------- WebGL：最简 quad ---------------- */
function createShader(g: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = g.createShader(type)
  if (!sh) return null
  g.shaderSource(sh, src)
  g.compileShader(sh)
  if (!g.getShaderParameter(sh, g.COMPILE_STATUS)) {
    console.error(g.getShaderInfoLog(sh))
    g.deleteShader(sh)
    return null
  }
  return sh
}

function createProgram(g: WebGLRenderingContext, vsSrc: string, fsSrc: string): WebGLProgram | null {
  const vs = createShader(g, g.VERTEX_SHADER, vsSrc)
  const fs = createShader(g, g.FRAGMENT_SHADER, fsSrc)
  if (!vs || !fs) return null
  const prog = g.createProgram()
  if (!prog) return null
  g.attachShader(prog, vs)
  g.attachShader(prog, fs)
  g.linkProgram(prog)
  g.deleteShader(vs)
  g.deleteShader(fs)
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
    console.error(g.getProgramInfoLog(prog))
    g.deleteProgram(prog)
    return null
  }
  return prog
}

function initGL(): boolean {
  const canvas = rightCanvas.value
  if (!canvas) return false
  const g = (canvas.getContext('webgl', { premultipliedAlpha: false, preserveDrawingBuffer: true }) ||
    canvas.getContext('experimental-webgl', { premultipliedAlpha: false, preserveDrawingBuffer: true })) as
    | WebGLRenderingContext
    | null
  if (!g) return false
  gl = g

  // 为每个效果编译一个 program（只切换 useProgram，避免每次重编译）
  const programs = new Map<EffectId, WebGLProgram>()
  for (const fx of EFFECTS) {
    const p = createProgram(g, VERT_SRC, FRAG_SRCS[fx.id])
    if (p) programs.set(fx.id, p)
  }
  if (programs.size === 0) return false
  programsMap = programs

  // 最简 quad：4 个顶点（x, y, u, v）+ 2 个三角形
  vbo = g.createBuffer()
  g.bindBuffer(g.ARRAY_BUFFER, vbo)
  g.bufferData(
    g.ARRAY_BUFFER,
    new Float32Array([
      -1, 1, 0, 1, // 左上
      1, 1, 1, 1, // 右上
      -1, -1, 0, 0, // 左下
      1, -1, 1, 0, // 右下
    ]),
    g.STATIC_DRAW,
  )
  ebo = g.createBuffer()
  g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, ebo)
  g.bufferData(g.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 1, 3, 2]), g.STATIC_DRAW)

  // 纹理：NEAREST 保持像素画质感
  texture = g.createTexture()
  g.bindTexture(g.TEXTURE_2D, texture)
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST)
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST)
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
  g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, 1)
  return true
}

function drawGL() {
  if (!gl || webglLost.value) return
  const prog = programsMap.get(effect.value)
  if (!prog || !vbo || !ebo || !texture || !spriteCanvas) return
  gl.useProgram(prog)

  // 每帧把最新的像素画重新上传为纹理
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spriteCanvas)
  gl.uniform1i(gl.getUniformLocation(prog, 'u_tex'), 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  const stride = 16
  const aPos = gl.getAttribLocation(prog, 'a_pos')
  const aUv = gl.getAttribLocation(prog, 'a_uv')
  if (aPos >= 0) {
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0)
  }
  if (aUv >= 0) {
    gl.enableVertexAttribArray(aUv)
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, stride, 8)
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo)
  gl.viewport(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
}

/* ---------------- Canvas2D 降级路径 ---------------- */
function draw2DRight() {
  const cv = rightCanvas.value
  if (!cv || !spriteCanvas) return
  const c = cv.getContext('2d')
  if (!c) return
  const id = effect.value
  if (id === 'none') {
    c.drawImage(spriteCanvas, 0, 0)
    return
  }
  if (id === 'grayscale') {
    // ctx.filter 是 CSS filter 的画布版本，直接映射灰度
    c.filter = 'grayscale(100%)'
    c.drawImage(spriteCanvas, 0, 0)
    c.filter = 'none'
    return
  }
  // 量化 / RGB 交换：ctx.filter 表达不了，用逐像素处理
  c.drawImage(spriteCanvas, 0, 0)
  const img = c.getImageData(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  const d = img.data
  if (id === 'quantize') {
    const LEVELS = 4
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.round((d[i] * LEVELS) / 255) * (255 / LEVELS)
      d[i + 1] = Math.round((d[i + 1] * LEVELS) / 255) * (255 / LEVELS)
      d[i + 2] = Math.round((d[i + 2] * LEVELS) / 255) * (255 / LEVELS)
    }
  } else if (id === 'rgb-swap') {
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i]
      const g = d[i + 1]
      const b = d[i + 2]
      d[i] = g
      d[i + 1] = b
      d[i + 2] = r
    }
  }
  c.putImageData(img, 0, 0)
}

/* ---------------- 渲染循环与生命周期 ---------------- */
function drawLeft() {
  const cv = leftCanvas.value
  if (!cv || !spriteCanvas) return
  const c = cv.getContext('2d')
  if (!c) return
  c.drawImage(spriteCanvas, 0, 0)
}

function drawFrame(ts: number) {
  makeSprite(ts)
  drawLeft()
  if (useWebgl.value && gl) {
    if (!webglLost.value) drawGL()
    // context lost 时右侧画布冻结，由 DOM 遮罩提示
  } else {
    draw2DRight()
  }
}

function startLoop() {
  if (rafId) return
  const tick = (ts: number) => {
    drawFrame(ts)
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}

function stopLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

function onLost(e: Event) {
  e.preventDefault() // 不 preventDefault 会永久丢失上下文
  webglLost.value = true
}

function onRestored() {
  webglLost.value = false
  initGL() // 上下文已重置，整个管线需要重建
}

function simulateLost() {
  if (!gl || webglLost.value) return
  const ext = gl.getExtension('WEBGL_lose_context')
  ext?.loseContext()
}

onMounted(() => {
  readPalette()
  spriteCanvas = document.createElement('canvas')
  spriteCanvas.width = SPRITE_SIZE
  spriteCanvas.height = SPRITE_SIZE

  const ok = initGL()
  useWebgl.value = ok
  if (ok) {
    rightCanvas.value?.addEventListener('webglcontextlost', onLost, false)
    rightCanvas.value?.addEventListener('webglcontextrestored', onRestored, false)
  }
  startLoop()
})

onUnmounted(() => {
  stopLoop()
  const cv = rightCanvas.value
  if (cv) {
    cv.removeEventListener('webglcontextlost', onLost, false)
    cv.removeEventListener('webglcontextrestored', onRestored, false)
  }
  gl = null
  programsMap.clear()
  vbo = null
  ebo = null
  texture = null
  spriteCanvas = null
})
</script>

<template>
  <div class="demo-shell shader-demo">
    <p class="demo-lead">
      同一张像素飞船图：左边原图、右边交给 <strong>fragment shader</strong> 逐像素处理。Shader 里的
      <code>uniform sampler2D u_tex</code> 就像 CSS 自定义属性——同一份纹理被 GPU 上千个并行的片元着色器同时采样。
    </p>

    <div class="canvas-row">
      <figure class="canvas-fig">
        <div class="canvas-box">
          <canvas
            ref="leftCanvas"
            :width="SPRITE_SIZE"
            :height="SPRITE_SIZE"
            class="shader-canvas"
            aria-label="原图"
          ></canvas>
          <span class="tag">原图</span>
        </div>
        <figcaption class="fig-label">Canvas2D 绘制：飞船 + 星野 + 粒子</figcaption>
      </figure>

      <figure class="canvas-fig right">
        <div class="canvas-box">
          <canvas
            ref="rightCanvas"
            :width="SPRITE_SIZE"
            :height="SPRITE_SIZE"
            class="shader-canvas"
            aria-label="Shader 处理后"
          ></canvas>
          <span v-if="webglLost" class="lost-badge">
            context lost<br />已 preventDefault，等待自动重建…
          </span>
          <span v-else class="tag">{{ rightTag }}</span>
        </div>
        <figcaption class="fig-label">Fragment Shader：{{ currentLabel }}</figcaption>
      </figure>
    </div>

    <div class="effect-bar" role="group" aria-label="切换 Shader 效果">
      <button
        v-for="fx in EFFECTS"
        :key="fx.id"
        type="button"
        class="effect-btn"
        :class="{ on: effect === fx.id }"
        @click="effect = fx.id"
      >
        {{ fx.label }}
      </button>
    </div>
    <p class="effect-hint">{{ currentHint }}。粒子仍在旋转，说明效果作用在整张纹理的每个像素上。</p>

    <div class="status-line">
      <span>渲染后端：{{ backendLabel }}</span>
      <button
        type="button"
        class="mini-btn"
        :disabled="!useWebgl || webglLost"
        @click="simulateLost"
      >
        模拟 context lost
      </button>
    </div>

    <div class="code-panel">
      <div class="code-head">
        <span class="code-name">fragment shader · {{ currentLabel }}</span>
        <button
          type="button"
          class="code-copy"
          :class="{ done: copied }"
          @click="copySource"
        >
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>
      <pre class="glsl-block"><code>{{ currentFragSrc }}</code></pre>
      <details class="vs-block">
        <summary>查看顶点着色器（最简 quad：2 个三角形）</summary>
        <pre class="glsl-block"><code>{{ VERT_SRC }}</code></pre>
      </details>
    </div>

    <p class="demo-caption">
      灰度 = R×0.299 + G×0.587 + B×0.114 加权平均（人眼对绿最敏感）；量化调色板 = 把连续颜色压成 4
      级台阶，是赛璐珞 / 复古贴图的直觉；RGB 交换 = 重排三个通道。Shader 只负责输出像素颜色，和前端 CSS 的
      <code>filter</code> 是同一类「逐元素处理」，但精细到逐像素。WebGL 不可用时右侧自动降级为 Canvas2D 逐像素处理。
    </p>
  </div>
</template>

<style scoped>
.shader-demo {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.demo-lead {
  font-size: 0.9rem;
  color: var(--color-text);
  margin: 0;
}

/* ---- 双画布 ---- */
.canvas-row {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
}

.canvas-fig {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  flex: 1 1 200px;
  max-width: 260px;
}

.canvas-box {
  position: relative;
  width: 100%;
  max-width: 220px;
}

.shader-canvas {
  display: block;
  width: 100%;
  height: auto;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-codeblock-bg);
}

.canvas-fig.right .shader-canvas {
  border-color: var(--color-primary);
}

.fig-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.tag {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--color-on-accent);
  background: rgba(0, 0, 0, 0.55);
  padding: 2px 8px;
  border-radius: 4px;
}

.lost-badge {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--color-accent-soft);
  background: var(--overlay-bg);
  border-radius: var(--radius-sm);
  padding: 0.5rem;
}

/* ---- 效果切换按钮 ---- */
.effect-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.effect-btn {
  appearance: none;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition:
    transform 0.08s ease,
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.effect-btn:hover {
  background: var(--color-bg-soft);
}

.effect-btn:active {
  transform: scale(0.95);
}

.effect-btn.on {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

.effect-hint {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* ---- 状态行 ---- */
.status-line {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.mini-btn {
  appearance: none;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.25rem 0.7rem;
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.08s ease, background 0.2s ease;
}

.mini-btn:hover {
  background: var(--color-bg-soft);
}

.mini-btn:active {
  transform: scale(0.95);
}

.mini-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ---- GLSL 源码面板 ---- */
.code-panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-codeblock-bg);
}

.code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--color-codeblock-border);
}

.code-name {
  font-size: 0.78rem;
  color: var(--color-text-soft);
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
}

.code-copy {
  appearance: none;
  background: transparent;
  color: var(--color-copy-btn-fg, #9b8c7c);
  border: 1px solid currentColor;
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
  font-size: 0.75rem;
  font-family: inherit;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.code-copy:hover {
  color: var(--color-copy-btn-fg-hover, #e8dcc8);
}

.code-copy.done {
  color: var(--color-copy-btn-success, #7ecb8a);
  border-color: var(--color-copy-btn-success, #7ecb8a);
}

.glsl-block {
  margin: 0;
  padding: 0.9rem 1rem;
  overflow-x: auto;
  font-size: 0.78rem;
  line-height: 1.7;
  color: var(--color-codeblock-text);
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  background: transparent;
  border: none;
  box-shadow: none;
}

.glsl-block code {
  background: none;
  color: inherit;
  padding: 0;
  font-size: inherit;
  font-family: inherit;
  white-space: pre;
}

.vs-block {
  border-top: 1px solid var(--color-codeblock-border);
}

.vs-block summary {
  cursor: pointer;
  padding: 0.45rem 0.9rem;
  font-size: 0.78rem;
  color: var(--color-primary);
  background: rgba(255, 255, 255, 0.03);
  user-select: none;
}

.vs-block summary:hover {
  color: var(--color-accent);
}

.vs-block[open] summary {
  border-bottom: 1px solid var(--color-codeblock-border);
}

@media (max-width: 640px) {
  .canvas-row {
    gap: 0.9rem;
  }

  .canvas-fig {
    flex-basis: 160px;
  }

  .canvas-box {
    max-width: 180px;
  }
}
</style>
