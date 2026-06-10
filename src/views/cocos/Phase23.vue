<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="23" title="Web 平台构建与部署" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>你的游戏在编辑器里跑得好好的——灰色背景变成了飞机大战，FPS 稳定 60。现在你要把它变成一个 URL——一个任何人都能在浏览器里打开的链接。<strong>Web 平台的构建就是这座桥——Cocos 编辑器在这头，玩家的浏览器在那头。</strong>这一节讲构建面板的每一个配置项、它们为什么存在、以及如何让你的游戏 3 秒内完成加载。</p>
    </ConceptBlock>

    <ConceptBlock icon="📦" title="构建的本质：编辑器项目 → 浏览器可运行的文件">
      <p>你在 Cocos 编辑器里看到的项目（.scene 文件、.prefab 文件、TypeScript 源码）浏览器是看不懂的。构建过程做的就是把这一切翻译成浏览器能理解的东西：</p>
      <pre>Cocos 编辑器项目                      浏览器可运行的文件
  .scene / .prefab (JSON)       →    序列化/合并后的 JSON bundle
  .ts 文件                       →    编译后的 .js 文件（webpack/rollup）
  纹理 .png / .jpg              →    压缩/裁剪后的纹理（或保持原样）
  音频 .mp3 / .ogg              →    压缩后的音频文件
  Cocos 引擎核心代码             →    打包后的 engine.js
  ───────────────────────────────────────────────────
  所有这些放进 build/web-mobile/ 目录
  → 用任何一个静态文件服务器就能跑
  → 或者丢到 CDN 上，全球可访问</pre>
      <p>这个过程和前端工程的构建完全同构——<strong>Cocos 构建 ≈ Webpack/Vite 打包</strong>。你的 Vue 项目用 <code>npm run build</code> 把 .vue 文件变成 dist/ 里的 HTML+JS+CSS，Cocos 的构建按钮做的是一样的事：把 .scene/.ts/.png 变成 build/web-mobile/ 里的 HTML+JS+JSON+纹理。</p>
      <div class="tip-box">
        <strong>前端工程师的优势：</strong> 你对构建/打包/部署这一套流程已经非常熟悉了。Cocos 的 Web 构建只是换了一套"源码文件类型"——但思路完全一样：<strong>编译 → 打包 → 优化 → 输出静态文件 → 部署到 CDN</strong>。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚙️" title="构建面板关键配置：每一个选项在做什么">
      <p>打开 Cocos Creator → 菜单栏"项目"→"构建发布"→ 选择 Web Mobile 平台。你会看到一堆选项——这里逐一解释每个重要的：</p>
      <table>
        <thead><tr><th>配置项</th><th>作用</th><th>推荐值</th><th>为什么</th></tr></thead>
        <tbody>
          <tr><td><strong>设计分辨率</strong></td><td>游戏内容以什么分辨率为基准设计</td><td>480×800</td><td>竖屏手机主流——你的像素飞机大战是竖屏的</td></tr>
          <tr><td><strong>适配屏幕宽度/高度</strong></td><td>不同屏幕比例下如何适配</td><td>Fit Height</td><td>保证竖屏体验一致——Fit Height 就是 CSS 的 <code>height: 100vh</code>，宽度自适应裁剪或留黑边</td></tr>
          <tr><td><strong>主包压缩类型</strong></td><td>多个 JSON 资源文件如何处理</td><td>合并所有 JSON</td><td>减少 HTTP 请求数——和前端打包把多个 CSS 合并成一个一样</td></tr>
          <tr><td><strong>内联所有 SpriteFrame</strong></td><td>小纹理是否内联到 JSON 中</td><td>关闭</td><td>让 Auto Atlas 做合批——内联会破坏合批，DrawCall 暴涨</td></tr>
          <tr><td><strong>MD5 Cache</strong></td><td>文件名是否带 hash</td><td>开启</td><td>更新版本时浏览器不会用旧缓存——等同 Webpack 的 <code>[contenthash]</code></td></tr>
          <tr><td><strong>Source Maps</strong></td><td>是否生成调试用的映射文件</td><td>开发时开，发布时关</td><td>开了能定位到 TS 源码行，但增加包体积</td></tr>
        </tbody>
      </table>
      <div class="tip-box">
        <strong>Fit Height vs Fit Width——前置端工程师一看就懂：</strong> 这就是 CSS 的 <code>object-fit: contain</code>。设计分辨率是那个"容器框"，实际屏幕是那个"窗口"。Fit Height = 高度拉满、宽度裁切或留黑边——和 <code>height: 100vh; width: auto; overflow: hidden</code> 一个意思。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="设计分辨率和适配策略——移动端适配的物理课">
      <p>你的游戏设计分辨率是 480×800。但用户的手机可能是 375×812（iPhone X）、414×896（iPhone 11）、360×800（Android 全面屏）。比例各不相同。</p>
      <p>适配策略解决的就是这个 mismatch：</p>
      <ul>
        <li><strong>Fit Height：</strong> 把游戏画面按高度适配——在 iPhone X（812 高）上放大到 812，宽度 480 → 812/800 × 480 = 487，比屏幕 375 宽，所以左右会被裁切。竖屏游戏的<strong>标准选择</strong>。</li>
        <li><strong>Fit Width：</strong> 按宽度适配——在 iPhone X 上宽度拉满到 375，高度 800 → 375/480 × 800 = 625，上下会有大黑边。横屏游戏的标准选择。</li>
      </ul>
      <p>这不是 Cocos 独家的概念——Cocos 的 <code>view.setDesignResolutionSize()</code> 和 CSS 的 <code>vw/vh</code> 单位、<code>object-fit</code> 属性是同一个底层思路。<strong>设计一个"标准画布"，然后映射到各种实际屏幕上。</strong></p>
    </ConceptBlock>

    <ConceptBlock icon="🚀" title="部署：从本地到线上——两分钟让游戏上线">
      <p>构建完成后，<code>build/web-mobile/</code> 目录里的所有文件就是你的游戏。现在把它变成 URL：</p>
      <h4>方案一：Vercel（推荐，最像前端工作流）</h4>
      <pre>cd build/web-mobile
npx vercel --prod
# → https://pixel-plane.vercel.app
# 以后每次构建，再跑一次就行。支持自定义域名。
# 这个流程和你的 Vue 项目部署到 Vercel 完全一样——
# 都是"静态文件丢到 CDN"模式。</pre>
      <h4>方案二：GitHub Pages</h4>
      <pre># 把 web-mobile 目录推到 gh-pages 分支
git subtree push --prefix build/web-mobile origin gh-pages
# → https://你的用户名.github.io/仓库名
# 免费，但国内访问速度不如 Vercel</pre>
      <h4>方案三：腾讯云 COS + CDN（国内首选）</h4>
      <pre># 如果目标用户在国内（微信小游戏引导到 Web），
# Vercel 的速度不行。腾讯云 COS + CDN 是国产方案。
# 上传 web-mobile 目录到 COS bucket，
# 绑 CDN 加速域名，配 HTTPS 证书——标准前端部署流程。</pre>
      <p>部署完成后，用 Chrome 的 Lighthouse 工具跑一下评测——Performance、Accessibility、Best Practices、SEO。你的游戏应该是一个"可以发给朋友的链接"，而不是一个"还在编辑器里跑的项目"。</p>
    </ConceptBlock>

    <ConceptBlock icon="⚡" title="加载性能——3 秒原则">
      <p>Web 游戏和原生游戏最大的不同：<strong>玩家打开链接就开始等。3 秒内没画面，他就走了。</strong>优化加载时间的核心策略：</p>
      <ul>
        <li><strong>纹理尽量用 Auto Atlas 合图：</strong> 10 张小图 = 10 个网络请求。一张 atlas 合图 = 1 个网络请求。这和前端用雪碧图（sprite sheet）减少 HTTP 请求是一样的——不过 Cocos 的 Auto Atlas 是自动生成合图的。</li>
        <li><strong>音频用低码率：</strong> BGM 用 128kbps MP3（不要求 320kbps——手机扬声器听不出区别），SFX 用 64kbps 甚至更低。能用单声道就不用立体声——包体直接减半。</li>
        <li><strong>首包瘦身：</strong> Cocos 支持"分包加载"（Asset Bundle）——把非首场景需要的资源（比如 GameOver 场景的结算界面纹理）放到子包中，首次只加载主包。和前端路由懒加载（<code>import()</code>）完全一样。</li>
        <li><strong>Bundle 加载策略：</strong> 首场景（Boot + MainMenu）只需要少量资源 → 放进主包。Game 场景需要的纹理/音频 → 放进 game-bundle。GameOver 场景 → 放进 gameover-bundle。玩家只有在需要时才下载对应包。</li>
      </ul>
      <div class="tip-box">
        <strong>前端类比：</strong> Cocos 的 Asset Bundle = Vue Router 的 <code>component: () => import('./Game.vue')</code>。都是"首屏只加载必需资源，其他按需异步加载"——只是你自己要手动管理加载时机。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <p>不要求掌握，但如果你感兴趣，这些都是值得了解的故事：</p>
      <ul>
        <li><strong>WebAssembly——C++ 游戏引擎怎么能在浏览器里跑？</strong> Cocos Creator 在 Web 平台上渲染的核心引擎是用 C++ 写的（为了性能——TypeScript 做游戏逻辑，C++ 做底层渲染），然后通过 Emscripten 编译成 WebAssembly（.wasm），在浏览器里以接近原生的速度运行。这就是为什么 Cocos H5 游戏能做到 60fps——渲染核心不是跑在 JS 上的。Figma 也是用这套方案——它的 Canvas 引擎用 C++ 写成，编译成 wasm 跑在浏览器里，所以才那么流畅。</li>
        <li><strong>WebGPU——浏览器游戏的下一代底层 API：</strong> WebGL 2.0 是当前 Cocos 使用的浏览器图形 API，它是 OpenGL ES 3.0 的浏览器版。WebGPU 是下一代——直接映射到 Vulkan / DirectX 12 / Metal，真正释放 GPU 的现代特性（计算着色器、间接绘制、绑定组）。Chrome 113+ 已支持。Cocos 目前使用 WebGL，但一旦迁移到 WebGPU，浏览器游戏的性能上限将大幅提高。可能 2 年内，浏览器里的 3D 游戏能跑到主机平台 70% 的性能。</li>
        <li><strong>微信小游戏 vs 浏览器游戏的 URL 生态差异：</strong> 如果一个链接发到微信聊天里，点击后走的是微信内置浏览器（X5 内核），不是 Chrome。X5 内核对 WebGL 的支持比 Chrome 差很多——可能出现渲染 bug、性能掉一半。这就是为什么国内做 H5 游戏的人经常"一怒之下"直接做微信小游戏——绕过浏览器兼容问题。你的 Web 版可以在朋友圈传播，但真正的用户入口在微信小游戏。Web 版是一个"方便测试和展示"的中间步骤。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <p>学完这一节，你应该能回答这些问题：</p>
      <ol>
        <li>设计分辨率（Design Resolution）和适配策略（fitHeight / fitWidth）分别控制什么？如果你把适配策略从 Fit Height 改成 Fit Width，在 iPhone X（375×812）上会发生什么？游戏画面上会多出什么？</li>
        <li>Cocos 的 Web 构建流程和你熟悉的 Vue/Vite 前端构建流程，在每一步上有什么对应关系？（源码 → 编译 → 打包 → 优化 → 输出静态文件 → 部署到 CDN）</li>
        <li>你用 Vercel 部署后，朋友在微信里打开链接说"很卡"。列出三个可能的原因——从浏览器引擎、网络加载、渲染性能三个维度分析。</li>
        <li>什么是 Asset Bundle？为什么它被称为"Cocos 的路由懒加载"？如果你不做分包，所有资源都在主包中——用户的首次加载时间和流量消耗会发生什么变化？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
