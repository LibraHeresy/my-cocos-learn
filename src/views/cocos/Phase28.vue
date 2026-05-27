<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="28" title="Web / 原生平台发布" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>将 Cocos 游戏发布到 <strong>Web Mobile</strong> 平台，理解 HTML5 模板定制和 CDN 部署</li>
        <li>理解 <strong>JSBridge 基础</strong>——Cocos 如何与 iOS/Android 原生代码通信</li>
        <li>掌握不同平台的<strong>差异处理</strong>：屏幕尺寸、输入方式、音频格式、存储 API</li>
        <li>配置<strong>构建选项</strong>：分辨率策略、屏幕方向、polyfills、模块裁剪</li>
        <li>编写<strong>平台检测</strong>代码，让同一套代码在不同平台上表现正确</li>
        <li>理解 Cocos 游戏的三种宿主环境——WeChat / Web / Native——各自的优势和限制</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="发布平台全景——前端工程师的直觉理解">
      <p>
        如果你做过 PWA、React Native 或 Cordova 项目，你就已经理解了"一套代码多端发布"。
        Cocos 的定位非常类似——同一份游戏代码（TypeScript + 资源），通过不同的构建配置，
        输出到不同的宿主环境。每个环境都有各自的 API、性能特征和限制。
      </p>

      <h3>Cocos 三端 vs 前端三端</h3>
      <table>
        <thead>
          <tr>
            <th>Cocos 平台</th>
            <th>前端等价物</th>
            <th>渲染方式</th>
            <th>JS 引擎</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Web Mobile</strong></td>
            <td>PWA / SPA（部署到 nginx/CDN）</td>
            <td>WebGL / WebGPU（浏览器 Canvas）</td>
            <td>浏览器 V8 / JavaScriptCore</td>
          </tr>
          <tr>
            <td><strong>WeChat Mini Game</strong></td>
            <td>微信小程序（非浏览器环境）</td>
            <td>WebGL（微信 JS SDK 提供）</td>
            <td>微信内置 JS 引擎（V8 变体）</td>
          </tr>
          <tr>
            <td><strong>iOS / Android Native</strong></td>
            <td>React Native / Cordova（原生壳 + JS 逻辑）</td>
            <td>Metal（iOS）/ Vulkan（Android）</td>
            <td>JavaScriptCore（iOS）/ V8（Android）</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>关键认知：</strong>Web 前端发布就是 PWA——一个 HTML + JS 部署到服务器上，
        用户用浏览器打开。微信小游戏你已经熟悉了。原生发布则是一个"原生 App 壳"包裹 JS 引擎 +
        Cocos 引擎——类似于 React Native 的架构：原生提供底层能力，JS 提供业务逻辑。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🌐" title="Web Mobile 发布——最接近前端的体验">
      <p>
        Web Mobile 发布是 Cocos 最"前端化"的发布方式。构建产物就是 HTML + JS + 资源文件，
        部署到任何静态文件服务器即可使用。这也是开发和调试最方便的发布方式——
        可以在浏览器中直接用 DevTools 调试。
      </p>

      <h3>构建产物结构</h3>
      <pre><code>build/web-mobile/
├── index.html              ← 入口 HTML（就是 <!DOCTYPE html>）
├── application.XXXX.js     ← Cocos 引擎启动脚本
├── cocos-js/
│   └── cc.XXXX.js          ← Cocos 引擎 JS（可裁剪）
├── assets/
│   ├── main/
│   │   └── index.XXXX.js   ← 主包脚本（你的 TS 编译产物）
│   ├── internal/           ← 引擎内置资源
│   └── resources/          ← 你的资源（纹理/音频/图集）
├── src/
│   ├── settings.XXXX.js    ← 项目设置
│   └── import-map.XXXX.js  ← 资源 import 映射表
└── style.css</code></pre>

      <h3>HTML5 模板定制</h3>
      <pre><code>&lt;!-- build-templates/web-mobile/index.html —— 自定义 HTML 模板 --&gt;
&lt;!DOCTYPE html&gt;
&lt;html lang="zh-CN"&gt;
&lt;head&gt;
  &lt;meta charset="utf-8" /&gt;
  &lt;meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover" /&gt;
  &lt;title&gt;像素飞机大战&lt;/title&gt;
  &lt;meta name="description" content="一款像素风格飞机大战游戏" /&gt;
  &lt;meta name="theme-color" content="#1a1a2e" /&gt;

  &lt;!-- Open Graph（社交分享时显示） --&gt;
  &lt;meta property="og:title" content="像素飞机大战" /&gt;
  &lt;meta property="og:description" content="挑战最高分！" /&gt;
  &lt;meta property="og:image" content="https://cdn.example.com/og-image.png" /&gt;

  &lt;style&gt;
    /* 启动画面前景——防止白屏 */
    body { margin: 0; background: #1a1a2e; overflow: hidden; }
    #splash {
      position: fixed; inset: 0;
      display: flex; align-items: center; justify-content: center;
      background: #1a1a2e; color: #fff; font-family: sans-serif;
    }
    #splash h2 { font-size: 24px; }
    #GameDiv { width: 100%; height: 100%; }
  &lt;/style&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;div id="splash"&gt;&lt;h2&gt;加载中...&lt;/h2&gt;&lt;/div&gt;
  &lt;div id="GameDiv"&gt;&lt;/div&gt;

  &lt;!-- Cocos 引擎脚本 --&gt;
  &lt;script src="src/settings.js"&gt;&lt;/script&gt;
  &lt;script src="cocos-js/cc.js"&gt;&lt;/script&gt;
  &lt;script src="main.js"&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>

      <h3>CDN 部署配置</h3>
      <pre><code>Web Mobile 部署最佳实践：

1. 静态资源 → OSS / S3 + CDN
   build/web-mobile/ → 上传到阿里云 OSS / AWS S3
   开启 CDN 加速、Gzip/Brotli 压缩

2. Cache-Control 策略
   *.html           → Cache-Control: no-cache（入口文件不缓存）
   cocos-js/cc.*.js → Cache-Control: public, max-age=31536000（引擎代码不变）
   assets/*.js      → Cache-Control: public, max-age=31536000（内容 hash 文件名）
   注意：如果你的资源没有 hash 文件名，需要调整缓存策略！</code></pre>

      <h3>Web 平台的构建配置</h3>
      <table>
        <thead>
          <tr>
            <th>配置项</th>
            <th>推荐值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Web Orientation</td>
            <td>Portrait（竖屏）/ Landscape（横屏）</td>
            <td>根据游戏类型选择</td>
          </tr>
          <tr>
            <td>Polyfills</td>
            <td>勾选（如果需要兼容旧浏览器）</td>
            <td>引入 babel polyfills——增加包体积约 50KB</td>
          </tr>
          <tr>
            <td>WebGL 版本</td>
            <td>WebGL 2.0（默认）</td>
            <td>WebGL 1.0 仅用于极旧设备兼容</td>
          </tr>
          <tr>
            <td>Worker</td>
            <td>不勾选（移动端 Web）</td>
            <td>Web Worker 在移动端加载慢，收益有限</td>
          </tr>
          <tr>
            <td>MD5 Cache</td>
            <td>勾选</td>
            <td>为资源文件名加 hash，利于 CDN 缓存</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>前端类比：</strong>Web Mobile 构建产物 = Vite build 的 <code>dist/</code> 目录。
        部署到 OSS + CDN 的流程和部署一个 Vue SPA 完全一样。
        甚至你可以用 <code>Vercel</code>、<code>Netlify</code> 等前端部署平台来托管
        Cocos Web 游戏——因为它们本质就是静态文件。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📱" title="iOS / Android 原生——JSBridge 基础">
      <p>
        Cocos 原生发布会在 iOS / Android 上创建一个原生 App，内部嵌入 JS 引擎运行
        Cocos 代码。当你需要调用原生能力（如相机、GPS、推送通知、内购）时，
        就需要 JSBridge——JS 和原生代码之间的"翻译层"。
      </p>

      <h3>JSBridge 调用流程</h3>
      <pre><code>┌─────────────────────────────────────────┐
│              你的 TS 代码                  │
│  native.bridge.call('pay', { money: 6 })  │
└──────────────┬──────────────────────────┘
               │ JSBridge
               ▼
┌─────────────────────────────────────────┐
│           原生层 (Java / Swift)            │
│  接收参数 → 调起支付 SDK → 返回结果         │
└─────────────────────────────────────────┘</code></pre>

      <h3>Cocos 中调用原生方法</h3>
      <pre><code>// PlatformBridge.ts —— 统一的平台桥接层
import { native } from 'cc'

export class PlatformBridge {
  /** 调用原生方法 */
  static call(method: string, ...args: any[]): Promise&lt;any&gt; {
    return new Promise((resolve, reject) => {
      if (native && native.bridge) {
        native.bridge.callStaticMethod(
          'GameBridge',    // 原生类名（Android 完整路径 + iOS 类名）
          method,          // 方法名
          args.length > 0 ? JSON.stringify(args) : '',
          (err: string | null, result: string) => {
            if (err) reject(new Error(err))
            else resolve(JSON.parse(result || 'null'))
          }
        )
      } else {
        reject(new Error('原生桥接不可用——非原生环境'))
      }
    })
  }

  /** 检查是否在原生环境中 */
  static isNative(): boolean {
    return typeof native !== 'undefined' && !!native.bridge
  }
}

// ===== 使用示例 =====
// 支付
async payForDiamonds(amount: number) {
  if (PlatformBridge.isNative()) {
    const result = await PlatformBridge.call('startPayment', amount)
    console.log('支付结果:', result)
  } else {
    // Web/WeChat 环境——用各自平台内购
    console.log('非原生环境，不处理')
  }
}

// 读取本地相册
async pickImage() {
  const result = await PlatformBridge.call('pickImageFromGallery')
  return result as { path: string; width: number; height: number }
}</code></pre>

      <h3>平台差异总览</h3>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>WeChat Mini Game</th>
            <th>Web Mobile</th>
            <th>iOS / Android Native</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>屏幕尺寸</td>
            <td>手机屏幕（无浏览器边框）</td>
            <td>浏览器窗口（有浏览器 UI）</td>
            <td>手机屏幕（全屏）</td>
          </tr>
          <tr>
            <td>输入方式</td>
            <td>触摸（wx.onTouchStart）</td>
            <td>触摸 + 鼠标 + 键盘</td>
            <td>触摸（可能 + 手柄/键盘）</td>
          </tr>
          <tr>
            <td>音频格式</td>
            <td>InnerAudioContext（mp3/aac）</td>
            <td>Web Audio API（mp3/ogg/wav）</td>
            <td>原生 Audio（所有格式）</td>
          </tr>
          <tr>
            <td>本地存储</td>
            <td>wx.setStorageSync（10MB 限制）</td>
            <td>localStorage（5-10MB）/ IndexedDB</td>
            <td>原生文件系统（无限制）</td>
          </tr>
          <tr>
            <td>网络请求</td>
            <td>wx.request + wx.downloadFile</td>
            <td>fetch / XMLHttpRequest</td>
            <td>原生 HTTP 库 + WebSocket</td>
          </tr>
          <tr>
            <td>登录/支付</td>
            <td>微信登录 / 微信支付</td>
            <td>自建登录 / 第三方支付</td>
            <td>Apple IAP / Google Play Billing</td>
          </tr>
          <tr>
            <td>更新机制</td>
            <td>wx.getUpdateManager + 热更新 Bundle</td>
            <td>刷新页面即更新</td>
            <td>App Store / Google Play 审核更新</td>
          </tr>
          <tr>
            <td>包体限制</td>
            <td>主包 4MB + 分包 20MB</td>
            <td>无硬性限制（但影响加载速度）</td>
            <td>商店限制（iOS 200MB cellular）</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="平台检测与条件行为">
      <p>
        同一份代码跑在三个平台上，需要根据当前平台做出不同行为。
        前端工程师对 <code>navigator.userAgent</code> 或条件编译再熟悉不过——
        游戏中的做法完全一样。
      </p>

      <h3>平台检测枚举</h3>
      <pre><code>// PlatformDetector.ts
export enum RuntimePlatform {
  WeChatMiniGame = 'wechat-mini-game',
  WebMobile      = 'web-mobile',
  WebDesktop     = 'web-desktop',
  Android        = 'android',
  iOS            = 'ios',
  Unknown        = 'unknown',
}

export class PlatformDetector {
  private static _platform: RuntimePlatform | null = null

  /** 检测当前运行平台 */
  static detect(): RuntimePlatform {
    if (this._platform) return this._platform

    // 1. 微信小游戏
    if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
      const info = wx.getSystemInfoSync()
      if (info.platform === 'devtools') {
        // 开发者工具中也可能是小游戏环境
      }
      this._platform = RuntimePlatform.WeChatMiniGame
      return this._platform
    }

    // 2. Cocos 原生平台 (sys.isNative)
    if (typeof sys !== 'undefined' && sys.isNative) {
      this._platform = sys.os === sys.OS.IOS
        ? RuntimePlatform.iOS
        : RuntimePlatform.Android
      return this._platform
    }

    // 3. Web 平台
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase()
      if (/mobile|android|iphone|ipad/.test(ua)) {
        this._platform = RuntimePlatform.WebMobile
      } else {
        this._platform = RuntimePlatform.WebDesktop
      }
      return this._platform
    }

    this._platform = RuntimePlatform.Unknown
    return this._platform
  }

  static get platform(): RuntimePlatform {
    return this._platform ?? this.detect()
  }

  // 便捷判断方法
  static get isWeChat(): boolean {
    return this.platform === RuntimePlatform.WeChatMiniGame
  }

  static get isNative(): boolean {
    return this.platform === RuntimePlatform.iOS
        || this.platform === RuntimePlatform.Android
  }

  static get isWeb(): boolean {
    return this.platform === RuntimePlatform.WebMobile
        || this.platform === RuntimePlatform.WebDesktop
  }

  static get isMobile(): boolean {
    return this.platform === RuntimePlatform.WebMobile
        || this.platform === RuntimePlatform.WeChatMiniGame
        || this.platform === RuntimePlatform.iOS
        || this.platform === RuntimePlatform.Android
  }
}</code></pre>

      <h3>条件行为实战示例</h3>
      <pre><code>// 根据平台做出不同行为
import { PlatformDetector } from './PlatformDetector'

export class PlatformAwareManager {
  /** 播放音频——不同平台不同 API */
  static playAudio(audioName: string): void {
    if (PlatformDetector.isWeChat) {
      // 微信：使用 wx.createInnerAudioContext
      const audio = wx.createInnerAudioContext()
      audio.src = `audio/${audioName}.mp3`
      audio.play()
    } else if (PlatformDetector.isNative) {
      // 原生：使用 Cocos 的 AudioSource
      // AudioManager.play(audioName)
    } else {
      // Web：使用 Web Audio API 或 Cocos 默认播放
      // AudioManager.play(audioName)
    }
  }

  /** 保存数据——不同平台不同存储方式 */
  static saveData(key: string, value: string): void {
    if (PlatformDetector.isWeChat) {
      wx.setStorageSync(key, value)
    } else if (PlatformDetector.isNative) {
      native.fileUtils?.writeStringToFile(`data/${key}.json`, value)
    } else {
      localStorage.setItem(key, value)
    }
  }

  /** 获取屏幕安全区域——适配刘海屏 */
  static getSafeArea(): { top: number; bottom: number; left: number; right: number } {
    if (PlatformDetector.isWeChat) {
      const info = wx.getSystemInfoSync()
      return info.safeArea ?? { top: 0, bottom: info.screenHeight, left: 0, right: info.screenWidth }
    }
    if (PlatformDetector.isNative) {
      // 原生端通过 env(safe-area-inset-top) CSS 或原生 SafeArea API 获取
      return { top: 44, bottom: 34, left: 0, right: 0 }  // iPhone X+ 典型值
    }
    // Web 端
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0'),
      bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      left: parseInt(style.getPropertyValue('--sal') || '0'),
      right: parseInt(style.getPropertyValue('--sar') || '0'),
    }
  }
}</code></pre>

      <div class="tip-box">
        <strong>前端类比：</strong>这和 <code>navigator.userAgent</code> 检测 + 条件 polyfill
        的思路完全一致。在 Vue 项目中你也经常写 <code>if (isIOS) { /* iOS 特殊处理 */ }</code>。
        游戏平台检测的差别只是检测对象从浏览器 UA 变成了 <code>wx</code> / <code>native</code>。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🖥️" title="构建配置——分辨率策略与屏幕适配">
      <p>
        不同平台、不同设备的屏幕尺寸差异巨大。Cocos 提供了灵活的分辨率策略配置，
        确保你的游戏在各种屏幕上都能正确显示。
      </p>

      <h3>分辨率策略</h3>
      <table>
        <thead>
          <tr>
            <th>策略</th>
            <th>行为</th>
            <th>适用场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>EXACT_FIT</code></td>
            <td>拉伸画面填满屏幕（可能变形）</td>
            <td>几乎不用——画面会扭曲</td>
          </tr>
          <tr>
            <td><code>NO_BORDER</code></td>
            <td>等比缩放填满屏幕（可能裁切边缘）</td>
            <td>画面边缘不重要、保证全屏无黑边</td>
          </tr>
          <tr>
            <td><code>SHOW_ALL</code></td>
            <td>等比缩放显示全部（可能有黑边）</td>
            <td>所有内容必须在可见范围内</td>
          </tr>
          <tr>
            <td><code>FIXED_WIDTH</code></td>
            <td>宽度撑满，高度按比例（可能有黑边）</td>
            <td>横版游戏——水平优先</td>
          </tr>
          <tr>
            <td><code>FIXED_HEIGHT</code></td>
            <td>高度撑满，宽度按比例（可能有黑边）</td>
            <td><strong>竖版射击游戏——推荐！</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>设计分辨率设置</h3>
      <pre><code>竖版飞机大战推荐设置：
  Design Resolution: 750 x 1334（iPhone 6/7/8 基准）
  Fit Mode: FIXED_HEIGHT（高度撑满，宽度适配）
  这样在 iPhone 15（1170 x 2532）和 iPad 上都能正确比例显示

横版游戏推荐：
  Design Resolution: 1334 x 750
  Fit Mode: FIXED_WIDTH

通用建议：
  设计分辨率 = 你美术出图的分辨率
  Fit Mode = 你游戏的主要轴向（竖版 = FIXED_HEIGHT，横版 = FIXED_WIDTH）</code></pre>

      <h3>构建环境的模块裁剪</h3>
      <pre><code>Cocos Creator → 项目设置 → 模块设置（Feature Cropping）

取消勾选不需要的模块可以显著减小包体积：
  □ 3D（2D 游戏不需要）
  □ Physics-3D
  □ UI（如果自己用自定义 UI 系统）
  □ TiledMap（不需要的话）
  □ DragonBones（不需要的话）
  □ Spine（不需要的话）
  □ Video（不需要的话）

裁剪后引擎体积可以从 ~1.5MB 降到 ~600KB —— 对 4MB 主包限制来说是极大的节省</code></pre>

      <div class="warn-box">
        <strong>踩坑提醒：</strong>裁剪模块时如果不小心去掉了你依赖的模块，构建后运行时会报
        "xxx is not defined"。建议裁剪前先在 <code>cc.js</code> 源码中确认你使用的 API
        属于哪个模块。保守策略：不确定的模块先保留，等构建通过后再减。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: Web Mobile 和 WeChat Mini Game 看起来都是用 WebGL，为什么还要分平台？</h3>
      <p>
        虽然底层都是 WebGL，但宿主环境完全不同：
        WeChat 的 <code>wx</code> API 和 DOM 隔离（没有 document/window 对象），
        音频只能通过 wx.createInnerAudioContext，网络请求只能通过 wx.request，
        存储只能用 wx.setStorageSync。而 Web Mobile 有完整的浏览器 API。
        你无法在两种环境中用同一套底层代码——必须在平台检测后分叉。
      </p>

      <h3>Q2: 原生平台的性能一定比 Web 好吗？</h3>
      <p>
        不一定。原生平台的优势是<strong>没有浏览器限制</strong>——可以使用 Metal（iOS）
        或 Vulkan（Android）渲染，性能上限更高。但如果你的渲染复杂度不高（如 2D 飞机大战），
        WebGL 完全够用。原生平台真正的优势是：① 内购（IAP）体验好 ② 没有 URL 地址栏
        ③ 应用商店分发。对于轻度 2D 游戏来说，微信小游戏的分发效率往往比原生 App Store 高得多。
      </p>

      <h3>Q3: 如何决定先发布哪个平台？</h3>
      <p>
        推荐优先级：① 微信小游戏（国内用户最多，分发效率最高）→ ② Web Mobile
        （海外用户、PC 浏览器，部署成本最低）→ ③ iOS/Android 原生（内购收入高，
        但开发和审核成本高）。这和前端 MVP 策略一样——先上成本最低的渠道验证产品，
        再扩展到成本更高的渠道。
      </p>

      <h3>Q4: 为什么 Cocos Web 构建产物体积比前端 SPA 大很多？</h3>
      <p>
        因为你打包了一整个游戏引擎 + 纹理资源。一个最小化的 2D 游戏（裁剪后）：
        引擎 JS ~600KB + 业务逻辑 ~200KB + 资源（纹理/音频）~1-3MB = 总计 2-4MB。
        而一个典型的 Vue SPA 首页 JS ~200KB。这是本质差异——不是优化问题，是功能量级不同。
        游戏引擎就像你打包了一个完整的 Unity 而不是一个 UI 框架。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>Cocos 的三种宿主环境（Web / WeChat / Native）在渲染方式、JS 引擎和 API 上有哪些区别？</li>
        <li>Web Mobile 构建产物的目录结构是怎样的？每个文件/目录的作用是什么？</li>
        <li>CDN 部署时，HTML 文件和 JS/CSS 文件的 Cache-Control 策略有什么不同？为什么？</li>
        <li>JSBridge 的调用流程是怎样的？Cocos TS 代码如何调用原生方法？</li>
        <li>不同平台在屏幕尺寸、输入方式、音频格式、存储 API 上各有什么差异？</li>
        <li>如何编写平台检测代码并做出条件行为？</li>
        <li>Cocos 提供的 5 种分辨率策略分别是什么？竖版飞机大战应该选哪种？</li>
        <li>引擎模块裁剪有什么作用？能节省多少体积？需要注意什么风险？</li>
        <li>不同的发布平台各有什么优势和限制？推荐的发布优先级是什么？</li>
        <li>Web 平台和微信小游戏平台虽然都用 WebGL，为什么不能写同一套底层代码？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
