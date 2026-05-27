<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="11" title="真机调试与性能适配" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>掌握<strong>真机调试</strong>的完整调试链路：Chrome DevTools → 微信开发者工具 → 实体手机</li>
        <li>用微信<strong>性能面板</strong>定位卡顿、内存泄漏、DrawCall 过高等问题</li>
        <li>制定<strong>设备分档策略</strong>——低/中/高端机自动匹配不同画质和负载</li>
        <li>解决 iOS/Android/鸿蒙 等不同平台的<strong>兼容性坑</strong></li>
        <li>建立<strong>性能监控上报</strong>机制——线上玩家的 FPS 和内存数据</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="真机调试工具链——从开发到真机的完整链路">
      <p>
        小游戏调试的最大痛点：Chrome DevTools 里跑得飞快的代码，到了真机上可能<strong>完全跑不动</strong>。你需要一条完整的调试链路来确保代码在每种环境下都正常运行：
      </p>

      <h3>三层调试体系</h3>
      <table>
        <thead>
          <tr>
            <th>层级</th>
            <th>工具</th>
            <th>能测什么</th>
            <th>不能测什么</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>L1 编辑器</strong></td>
            <td>Cocos 编辑器预览 / Chrome DevTools</td>
            <td>游戏逻辑、UI、碰撞、基本帧率</td>
            <td>微信 API、音频、真实性能、内存</td>
          </tr>
          <tr>
            <td><strong>L2 模拟器</strong></td>
            <td>微信开发者工具</td>
            <td>微信 API 调用、分享、登录、分包</td>
            <td>真机音频行为、GPU 渲染性能、滑动触控延迟</td>
          </tr>
          <tr>
            <td><strong>L3 真机</strong></td>
            <td>扫码真机调试 / vConsole</td>
            <td>全部——性能、音频、触控、内存</td>
            <td>无（这就是最终环境）</td>
          </tr>
        </tbody>
      </table>

      <h3>真机调试三种方式</h3>

      <table>
        <thead>
          <tr>
            <th>方式</th>
            <th>原理</th>
            <th>优点</th>
            <th>缺点</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>真机调试 1.0</strong></td>
            <td>手机扫码 → 微信开发者工具转发 JS</td>
            <td>可断点调试</td>
            <td>延迟大、常断连、iOS 经常连不上</td>
          </tr>
          <tr>
            <td><strong>真机调试 2.0</strong></td>
            <td>手机构建后独立运行 + vConsole</td>
            <td>真实性能、稳定</td>
            <td>不能断点调试，只能看 log</td>
          </tr>
          <tr>
            <td><strong>体验版</strong></td>
            <td>上传为体验版 → 扫码进入</td>
            <td>接近生产环境</td>
            <td>每次改代码需重新上传</td>
          </tr>
        </tbody>
      </table>

      <h3>vConsole 集成</h3>
      <p>
        vConsole 是<strong>真机上的 DevTools Console</strong>。它在手机屏幕上嵌入一个可展开的控制台面板——相当于前端移动端调试时常用的 <strong>vConsole</strong> 或 <strong>Eruda</strong>。在 Cocos 小游戏中，可以通过开启调试模式来激活。
      </p>
      <pre><code>// 在 game.js 入口或 GameManager.onLoad 中：
// 开发阶段强制开启调试面板
if (typeof wx !== 'undefined') {
  // 方式 1：开启微信内置调试（会显示 vConsole 绿色按钮）
  wx.setEnableDebug({
    enableDebug: true,
  })

  // 方式 2：覆盖 console，在游戏 UI 上显示 log（自定义方案）
  const originalLog = console.log
  const logQueue: string[] = []
  const MAX_LOGS = 100

  console.log = (...args: any[]) => {
    originalLog.apply(console, args)
    logQueue.push(args.map(String).join(' '))
    if (logQueue.length > MAX_LOGS) logQueue.shift()
  }

  // 在游戏里渲染这些 log——比如挂在一个 DebugPanel 组件上
  window.__getLogs = () => [...logQueue]
}</code></pre>

      <h3>Chrome DevTools 远程调试（Web 预览阶段）</h3>
      <p>
        在构建微信小游戏之前，先用 Cocos 的 <strong>Web Mobile</strong> 预览模式在 Chrome 中调试，这个阶段可以：
      </p>
      <ul>
        <li>用 Chrome Performance 面板分析帧率和长任务（Long Task）</li>
        <li>用 Chrome Memory 面板检测内存泄漏（Heap Snapshot + Allocation Timeline）</li>
        <li>用 Chrome Rendering 面板查看 Paint Flashing、Layer Borders、FPS Meter</li>
      </ul>
      <p>Web 端跑顺了，再构建微信小游戏——这是最有效的调试工作流。</p>

      <div class="tip-box">
        <strong>调试原则：</strong>Chrome 能发现 80% 的问题（逻辑错误、算法复杂度、内存泄漏），微信开发者工具能发现 15% 的问题（API 兼容性），<strong>真机必需</strong>发现最后 5%（音频延迟、触控精度、GPU 兼容性）。顺序不能错——先在 Chrome 修完 80%，再用真机验证。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📊" title="设备分档策略——像做响应式布局一样做性能适配">
      <p>
        微信小游戏的设备跨度是前端 <strong>响应式设计</strong> 的升级版——不仅要适配屏幕尺寸，还要适配<strong>性能能力</strong>。一台 2018 年的红米 6A 和一台 iPhone 16 Pro Max，渲染能力差距可能超过 <strong>10 倍</strong>。
      </p>

      <h3>分档标准</h3>
      <table>
        <thead>
          <tr>
            <th>档位</th>
            <th>典型芯片</th>
            <th>RAM</th>
            <th>benchmarkLevel</th>
            <th>代表机型</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>低端 low</strong></td>
            <td>骁龙 4xx/6xx、联发科 G25</td>
            <td>&lt; 2GB</td>
            <td>&lt; 10</td>
            <td>红米 6A、OPPO A5、vivo Y11</td>
          </tr>
          <tr>
            <td><strong>中端 mid</strong></td>
            <td>骁龙 7xx、麒麟 810</td>
            <td>3-4GB</td>
            <td>10-30</td>
            <td>红米 K40、荣耀 X10、OPPO Reno6</td>
          </tr>
          <tr>
            <td><strong>高端 high</strong></td>
            <td>骁龙 8xx、A16+、天玑 9200</td>
            <td>&gt;= 6GB</td>
            <td>&gt; 30</td>
            <td>iPhone 13+、小米 14、三星 S24</td>
          </tr>
        </tbody>
      </table>

      <h3>自适应配置矩阵</h3>
      <table>
        <thead>
          <tr>
            <th>参数</th>
            <th>低端 (low)</th>
            <th>中端 (mid)</th>
            <th>高端 (high)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>粒子数量上限</td>
            <td>30</td>
            <td>100</td>
            <td>200</td>
          </tr>
          <tr>
            <td>同屏敌机上限</td>
            <td>5</td>
            <td>10</td>
            <td>15</td>
          </tr>
          <tr>
            <td>DrawCall 目标</td>
            <td>&le; 10</td>
            <td>&le; 20</td>
            <td>&le; 30</td>
          </tr>
          <tr>
            <td>帧动画帧率</td>
            <td>15 fps（跳过一半帧）</td>
            <td>30 fps</td>
            <td>60 fps</td>
          </tr>
          <tr>
            <td>阴影</td>
            <td>关闭</td>
            <td>关闭</td>
            <td>开启</td>
          </tr>
          <tr>
            <td>背景滚动层数</td>
            <td>1 层</td>
            <td>2 层</td>
            <td>3 层（视差滚动）</td>
          </tr>
          <tr>
            <td>爆炸动画帧数</td>
            <td>8 帧</td>
            <td>16 帧</td>
            <td>32 帧（完整动画）</td>
          </tr>
          <tr>
            <td>渲染分辨率缩放</td>
            <td>0.6x（低于原生分辨率）</td>
            <td>0.8x</td>
            <td>1.0x（原生分辨率）</td>
          </tr>
        </tbody>
      </table>

      <h3>实现代码</h3>
      <pre><code>// PerformanceTier.ts —— 设备分档 + 自适应配置
type Tier = 'low' | 'mid' | 'high'

interface TierConfig {
  maxParticles: number
  maxEnemies: number
  maxDrawCalls: number
  animationFps: number
  shadowEnabled: boolean
  bgLayers: number
  explosionFrames: number
  resolutionScale: number
}

const TIER_CONFIGS: Record&lt;Tier, TierConfig&gt; = {
  low: {
    maxParticles: 30, maxEnemies: 5, maxDrawCalls: 10,
    animationFps: 15, shadowEnabled: false, bgLayers: 1,
    explosionFrames: 8, resolutionScale: 0.6,
  },
  mid: {
    maxParticles: 100, maxEnemies: 10, maxDrawCalls: 20,
    animationFps: 30, shadowEnabled: false, bgLayers: 2,
    explosionFrames: 16, resolutionScale: 0.8,
  },
  high: {
    maxParticles: 200, maxEnemies: 15, maxDrawCalls: 30,
    animationFps: 60, shadowEnabled: true, bgLayers: 3,
    explosionFrames: 32, resolutionScale: 1.0,
  },
}

class PerformanceTier {
  private static _config: TierConfig

  static init() {
    const benchmark = wx.getSystemInfoSync().benchmarkLevel ?? -1
    let tier: Tier = 'high'
    if (benchmark &lt; 10) tier = 'low'
    else if (benchmark &lt; 30) tier = 'mid'

    this._config = TIER_CONFIGS[tier]
    console.log(`[Performance] 设备分档: ${tier} (benchmark: ${benchmark})`)
  }

  static get config() { return this._config }

  /** 根据分档决定敌机生成数量 */
  static getEnemySpawnCount(): number {
    return this._config.maxEnemies
  }

  /** 根据分档决定粒子发射数量 */
  static getParticleCount(base: number): number {
    return Math.min(base, this._config.maxParticles)
  }
}

// GameManager.onLoad 中调用
PerformanceTier.init()</code></pre>

      <div class="tip-box">
        <strong>前端类比：</strong>设备分档相当于前端的 <code>@media (prefers-reduced-motion)</code> 或基于 <code>navigator.hardwareConcurrency</code> 的条件加载——检测到低端设备就降级体验，检测到高端设备就增强效果。关键是<strong>不要让低端机用户感觉到被歧视</strong>——降帧不动摇核心玩法，削粒子但不影响视觉反馈。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📈" title="微信性能面板——实时监控帧率与内存">
      <p>
        微信开发者工具提供了<strong>性能面板</strong>，可以实时看到小游戏的各项性能指标。这相当于 Chrome DevTools 的 Performance Monitor 面板，但数据是真机通过 USB/局域网回传的。
      </p>

      <h3>关键性能面板指标</h3>
      <table>
        <thead>
          <tr>
            <th>指标</th>
            <th>含义</th>
            <th>健康阈值</th>
            <th>超标时的典型症状</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>FPS</strong></td>
            <td>每秒渲染帧数</td>
            <td>&ge; 30（低端）/ &ge; 45（中端）/ &ge; 60（高端）</td>
            <td>画面卡顿、操作延迟明显</td>
          </tr>
          <tr>
            <td><strong>Frame Time</strong></td>
            <td>单帧渲染耗时（ms）</td>
            <td>&le; 16.7ms（60fps）/ &le; 33ms（30fps）</td>
            <td>掉帧、周期性卡顿</td>
          </tr>
          <tr>
            <td><strong>DrawCall</strong></td>
            <td>每帧 GPU 绘制调用次数</td>
            <td>&le; 30（通用标准）</td>
            <td>GPU 瓶颈、帧率暴跌</td>
          </tr>
          <tr>
            <td><strong>Memory 总量</strong></td>
            <td>JS + GPU + Native 内存总和</td>
            <td>&le; 200MB</td>
            <td>微信杀掉进程（crash）、闪退</td>
          </tr>
          <tr>
            <td><strong>Texture Memory</strong></td>
            <td>GPU 纹理占用</td>
            <td>&le; 100MB</td>
            <td>纹理加载失败、花屏</td>
          </tr>
          <tr>
            <td><strong>JS Memory</strong></td>
            <td>JS 堆内存</td>
            <td>&le; 50MB</td>
            <td>GC 频繁（stuttering）、OOM</td>
          </tr>
        </tbody>
      </table>

      <h3>性能监控上报</h3>
      <p>线上游戏需要收集真实玩家的性能数据。实现一个轻量级性能监控器：</p>
      <pre><code>// PerformanceMonitor.ts —— 线上性能采集
class PerformanceMonitor {
  private _fpsSamples: number[] = []
  private _lastFrameTime = 0
  private _reportTimer: any = null

  onLoad() {
    // 每 5 分钟上报一次（不要高频上报，浪费用户流量）
    this._reportTimer = setInterval(() => {
      this._reportPerformance()
    }, 5 * 60 * 1000)
  }

  update(dt: number) {
    // 计算瞬时 FPS
    const fps = dt > 0 ? Math.round(1 / dt) : 60
    this._fpsSamples.push(fps)
    if (this._fpsSamples.length > 600) {
      this._fpsSamples.shift()  // 保留最近 10 秒的样本（60fps × 10s）
    }
  }

  private _reportPerformance() {
    if (this._fpsSamples.length === 0) return

    // 计算统计数据
    const avgFps = this._fpsSamples.reduce((a, b) => a + b, 0) / this._fpsSamples.length
    const minFps = Math.min(...this._fpsSamples)
    const fpsBelow30 = this._fpsSamples.filter(f => f &lt; 30).length
    const stutterRatio = fpsBelow30 / this._fpsSamples.length  // 卡顿率

    // 获取内存
    const perfInfo = wx.getPerformance()
    const memoryInfo = perfInfo?.memory || {}

    const report = {
      avgFps: Math.round(avgFps),
      minFps,
      stutterRatio: (stutterRatio * 100).toFixed(1) + '%',
      memoryMB: Math.round((memoryInfo.usedJSHeapSize || 0) / 1024 / 1024),
      deviceModel: wx.getSystemInfoSync().model,
      benchmarkLevel: wx.getSystemInfoSync().benchmarkLevel,
      scene: director.getScene()?.name || 'unknown',
      timestamp: Date.now(),
    }

    console.log('[PerfReport]', report)

    // 可选：上传到云数据库供分析
    // wx.cloud.callFunction({ name: 'reportPerformance', data: report })
  }
}</code></pre>

      <h3>DrawCall 优化速查</h3>
      <table>
        <thead>
          <tr>
            <th>问题</th>
            <th>现象</th>
            <th>解法</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>纹理散列</td>
            <td>每张 Sprite 用独立纹理</td>
            <td>打 <strong>SpriteSheet（图集）</strong>——一张大图容纳所有小图</td>
          </tr>
          <tr>
            <td>字体过多</td>
            <td>多个 Label 用不同字体</td>
            <td>统一字体，或使用 <strong>Bitmap Font</strong></td>
          </tr>
          <tr>
            <td>粒子系统过多</td>
            <td>每帧 20+ 粒子节点</td>
            <td>合并粒子系统，低端机减少到 5 个以内</td>
          </tr>
          <tr>
            <td>UI 层级过深</td>
            <td>Canvas → Panel → Panel → Button 嵌套 10 层</td>
            <td>扁平化 UI 层级，避免空节点分组</td>
          </tr>
          <tr>
            <td>动态材质</td>
            <td>通过代码修改材质的颜色/透明度</td>
            <td>会产生额外 DrawCall——尽量用 SpriteFrame 切换代替</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见机型兼容坑——每一坑都有人踩过">
      <p>
        以下是经过大量真机验证后总结的<strong>兼容性坑位</strong>，每个都是真实翻车过的。这些问题的根源都是不同设备在 JS 引擎实现、GPU 驱动和操作系统行为上的差异——类似于前端里的浏览器兼容性问题，但此处是<strong>微信 + 手机厂商 + 芯片驱动</strong>的三重组合。
      </p>

      <h3>坑 1：iOS 音频自动播放限制</h3>
      <p>
        iOS 设备（所有 iPhone/iPad）上音频的 <code>play()</code> 必须在<strong>用户触摸事件回调</strong>中首次调用，否则<strong>永远无声</strong>。这和 Safari 浏览器的自动播放策略完全一致。解决方案：
      </p>
      <pre><code>// 在"开始游戏"按钮的触摸回调中：
wx.onTouchStart(() => {
  // 用静音预热 Audio Context
  const warmup = wx.createInnerAudioContext()
  warmup.src = 'audio/silence.mp3'  // 一个 0.1 秒的静音 MP3
  warmup.volume = 0
  warmup.play()
  warmup.onEnded(() => warmup.destroy())
})</code></pre>

      <h3>坑 2：Android 片段着色器（Fragment Shader）精度问题</h3>
      <p>
        部分 Android GPU 只支持 <code>mediump</code>（中等精度），不支持 <code>highp</code>（高精度）。如果你的自定义 Shader 中声明了 <code>precision highp float;</code>，在低端 Android 设备上可能产生渲染异常或<strong>直接不渲染</strong>。
      </p>
      <table>
        <thead>
          <tr>
            <th>精度</th>
            <th>float 范围</th>
            <th>int 范围</th>
            <th>适用</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>lowp</code></td>
            <td>-2 ~ 2</td>
            <td>-128 ~ 128</td>
            <td>颜色（8-bit）</td>
          </tr>
          <tr>
            <td><code>mediump</code></td>
            <td>-16384 ~ 16384</td>
            <td>-1024 ~ 1024</td>
            <td>UV 坐标、顶点计算</td>
          </tr>
          <tr>
            <td><code>highp</code></td>
            <td>全范围</td>
            <td>全范围</td>
            <td>顶点位置（iOS 必须用 highp）</td>
          </tr>
        </tbody>
      </table>
      <pre><code>// 兼容写法：顶点着色器用 highp，片段着色器用 mediump
// vertex shader:
//   precision highp float;    ← 顶点位置必须高精度
// fragment shader:
//   precision mediump float;  ← 颜色计算中精度足够，且兼容性更好</code></pre>

      <h3>坑 3：OPPO / Vivo 自定义 ROM 的坑</h3>
      <p>
        OPPO 的 ColorOS 和 Vivo 的 Funtouch OS 对后台进程的管理<strong>极为激进</strong>——APP 切到后台几秒后可能被<strong>直接杀死</strong>，而不是挂起。这导致：
      </p>
      <ul>
        <li><code>wx.onHide</code> 触发后，你的存档代码可能还没执行完就被杀</li>
        <li>解决方案：<strong>frequent 保存</strong>。不要只在 <code>onHide</code> 时保存——每过一关就保存，每次金币变动就保存</li>
        <li>另一个方案：引导用户将小游戏加入<strong>后台白名单</strong>（在游戏设置中提示"为了您的游戏数据，请在系统设置中允许本游戏后台运行"）</li>
      </ul>

      <h3>坑 4：鸿蒙 OS（HarmonyOS）兼容性</h3>
      <p>
        华为的鸿蒙系统在 2024 年后出货量已占国内市场显著比例。虽然鸿蒙目前兼容 Android APK，但微信小游戏的运行环境和纯 Android 有差异：
      </p>
      <table>
        <thead>
          <tr>
            <th>兼容项</th>
            <th>Android 行为</th>
            <th>鸿蒙行为</th>
            <th>处理建议</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Canvas 尺寸</td>
            <td>和屏幕物理像素一致</td>
            <td>偶有 1-2px 偏差</td>
            <td>用 <code>wx.getSystemInfoSync()</code> 获取而非硬编码</td>
          </tr>
          <tr>
            <td>音频播放</td>
            <td>InnerAudioContext 正常工作</td>
            <td>部分鸿蒙机型下多音频并发时可能异常</td>
            <td>SFX 池大小降低到 4 个</td>
          </tr>
          <tr>
            <td>文件系统</td>
            <td>标准路径</td>
            <td><code>wx.env.USER_DATA_PATH</code> 返回路径可能有变化</td>
            <td>所有文件操作使用 wx API 而非硬编码路径</td>
          </tr>
          <tr>
            <td>字体渲染</td>
            <td>系统字体正常</td>
            <td>系统缺省字体可能导致 Label 显示为方块</td>
            <td>游戏中使用内嵌 Bitmap Font 替代系统字体</td>
          </tr>
        </tbody>
      </table>

      <h3>坑 5：微信开发者工具和真机的不一致</h3>
      <p>
        微信开发者工具的模拟器<strong>不准确</strong>。以下行为在工具中正常但真机上可能出问题：
      </p>
      <ul>
        <li><strong>Canvas 坐标：</strong>真机的 Canvas 坐标系统和模拟器可能有 1-2px 的差异——UI 的 click 命中区域放宽到至少 <strong>44x44px</strong> 的触摸热区</li>
        <li><strong>音频播放：</strong>模拟器使用 Web Audio 实现——和真机 JavaScriptCore <code>InnerAudioContext</code> 的行为可能完全不同。音频必须在<strong>真机上专门测试</strong></li>
        <li><strong>分包加载速度：</strong>模拟器读文件几乎无延迟，真机可能慢 <strong>5-10 倍</strong></li>
        <li><strong>内存表现：</strong>模拟器的 JS Heap 大小几乎无限制，真机限制在 <strong>~200MB</strong> 以内，超过即被微信 Kill</li>
      </ul>

      <div class="warn-box">
        <strong>铁律：</strong>任何一个功能改完后，都要在真机上跑一遍。微信开发者工具只是开发辅助，<strong>不是兼容性验证工具</strong>。测试机阵至少需要：一台 iPhone（iOS 最新版）、一台主流 Android（骁龙 8 系）、一台低端 Android（骁龙 6 系）、一台华为鸿蒙设备。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: Web 预览帧率 60fps，真机只有 10fps，怎么排查？</h3>
      <p>
        按这个顺序排查：
      </p>
      <ol>
        <li><strong>打开性能面板：</strong>看 DrawCall 是否过大——如果是，打图集（SpriteSheet）</li>
        <li><strong>检查粒子数量：</strong>真机上每个粒子都会产生渲染开销，降低到 30 个内再测</li>
        <li><strong>逐段注释掉 update() 逻辑：</strong>排除哪个组件的 update 是瓶颈</li>
        <li><strong>断开真机调试模式重试：</strong>真机调试模式本身会<strong>消耗大量性能</strong>（微信转发 JS 执行的 overhead），关闭调试后帧率可能翻倍</li>
        <li><strong>排除 Web 专有 API：</strong><code>globalThis</code>、<code>performance.now()</code>、<code>requestAnimationFrame()</code> 等可能不触发或性能差异大</li>
      </ol>

      <h3>Q2: 为什么低端机上我的游戏会闪退？</h3>
      <p>
        大概率是<strong>内存超出限制</strong>。微信小游戏在内存超过<strong>约 200MB</strong> 后会被系统直接 Kill。常见内存泄漏点：
      </p>
      <ul>
        <li>对象池未启用——每帧 <code>new</code> 大量 Node/Sprite，GC 跟不上</li>
        <li>纹理未释放——场景切换后旧场景的纹理还驻留在 GPU 内存中</li>
        <li>音频 Context 未销毁——每个 InnerAudioContext 都占用内存</li>
        <li>定时器未清理——<code>setInterval</code> 没有对应的 <code>clearInterval</code></li>
      </ul>

      <h3>Q3: <code>wx.setEnableDebug</code> 有副作用吗？</h3>
      <p>
        有。开启后会降低性能、增加功耗、输出额外日志。<strong>正式上线前务必关闭</strong>。可以在项目中设置一个编译常量来控制：
      </p>
      <pre><code>// 只在开发版本开启调试
const IS_DEV = false  // 发布时改为 false
if (IS_DEV &amp;&amp; typeof wx !== 'undefined') {
  wx.setEnableDebug({ enableDebug: true })
}</code></pre>

      <h3>Q4: 游戏中如何检测是不是 OPPO/Vivo 这种杀后台的系统？</h3>
      <p>
        无法直接检测。但可以通过行为判断：如果 <code>wx.onHide</code> 触发后 <strong>5 秒内进程被杀</strong>（下次打开时发现 onHide 中保存的数据未落盘），那就说明被系统回收了。这种情况下唯一的应对方案是<strong>频繁保存</strong>——关键数据变更即落盘（每次通关、每次获得道具、每次金币变动 +50 以上）。
      </p>

      <h3>Q5: 如何让游戏在低端机上也能流畅跑？</h3>
      <p>
        四个最有效的优化手段，按收益排序：
      </p>
      <ol>
        <li><strong>打图集（SpriteSheet）：</strong>这是收益最大的优化——把所有小图拼成一张大图，DrawCall 从 50+ 降到 5 以内</li>
        <li><strong>降低渲染分辨率：</strong><code>resolutionScale = 0.6</code>——画面稍模糊但帧率直接翻倍（GPU 的纹理采样负担减半）</li>
        <li><strong>减少粒子数：</strong>粒子是低端机 GPU 的最大杀手——限制爆炸、子弹轨迹、背景光点的数量</li>
        <li><strong>对象池：</strong>避免每帧 new 新对象——复用子弹、敌机、粒子节点——GC 压力降为零</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>真机调试的三种方式分别是什么？各自适用的场景是什么？</li>
        <li>Chrome DevTools → 微信开发者工具 → 真机，三层调试链路各自的侧重点是什么？</li>
        <li>真机调试模式下的性能和独立运行有多大差距？为什么？</li>
        <li>微信性能面板有哪些关键指标？Frame Time、DrawCall、Memory 的健康阈值是多少？</li>
        <li>低/中/高端机的分档标准是什么？你的游戏针对各档分别做了哪些差异处理？</li>
        <li>DrawCall 过高有哪些常见原因？如何优化？</li>
        <li>iOS 音频为什么必须在触摸事件中首次播放？如何预热？</li>
        <li>Android 片段着色器的 <code>mediump</code> 和 <code>highp</code> 有什么区别？分别适用于什么场景？</li>
        <li>OPPO/Vivo 的杀后台问题如何规避？</li>
        <li>鸿蒙系统的兼容性有哪些需要特别关注的点？</li>
        <li>如何收集和分析线上玩家的性能数据？（FPS、卡顿率、内存）</li>
        <li>你的测试机阵应该至少覆盖哪些设备？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
