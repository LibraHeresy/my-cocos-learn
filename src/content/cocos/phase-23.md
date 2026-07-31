---
phase: 23
title: Web 平台构建与部署
duration: 1-2 天
---

## 🧭 本节定位

你的游戏在编辑器里跑得好好的——灰色背景变成了飞机大战，FPS 稳定 60。现在你要把它变成一个 URL——一个任何人都能在浏览器里打开的链接。**Web 平台的构建就是这座桥——Cocos 编辑器在这头，玩家的浏览器在那头。**这一节讲构建面板的每一个配置项、它们为什么存在、以及如何让你的游戏 3 秒内完成加载。

## 📦 构建的本质：编辑器项目 → 浏览器可运行的文件

你在 Cocos 编辑器里看到的项目（.scene 文件、.prefab 文件、TypeScript 源码）浏览器是看不懂的。构建过程做的就是把这一切翻译成浏览器能理解的东西：

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

这个过程和前端工程的构建完全同构——**Cocos 构建 ≈ Webpack/Vite 打包**。你的 Vue 项目用 `npm run build` 把 .vue 文件变成 dist/ 里的 HTML+JS+CSS，Cocos 的构建按钮做的是一样的事：把 .scene/.ts/.png 变成 build/web-mobile/ 里的 HTML+JS+JSON+纹理。

<div class="tip-box">
<strong>前端工程师的优势：</strong> 你对构建/打包/部署这一套流程已经非常熟悉了。Cocos 的 Web 构建只是换了一套"源码文件类型"——但思路完全一样：<strong>编译 → 打包 → 优化 → 输出静态文件 → 部署到 CDN</strong>。
</div>

## ⚙️ 构建面板关键配置：每一个选项在做什么

打开 Cocos Creator → 菜单栏"项目"→"构建发布"→ 选择 Web Mobile 平台。你会看到一堆选项——这里逐一解释每个重要的：

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

## 📐 设计分辨率和适配策略——移动端适配的物理课

你的游戏设计分辨率是 480×800。但用户的手机可能是 375×812（iPhone X）、414×896（iPhone 11）、360×800（Android 全面屏）。比例各不相同。

适配策略解决的就是这个 mismatch：

- **Fit Height：** 把游戏画面按高度适配——在 iPhone X（812 高）上放大到 812，宽度 480 → 812/800 × 480 = 487，比屏幕 375 宽，所以左右会被裁切。竖屏游戏的**标准选择**。
- **Fit Width：** 按宽度适配——在 iPhone X 上宽度拉满到 375，高度 800 → 375/480 × 800 = 625，上下会有大黑边。横屏游戏的标准选择。

这不是 Cocos 独家的概念——Cocos 的 `view.setDesignResolutionSize()` 和 CSS 的 `vw/vh` 单位、`object-fit` 属性是同一个底层思路。**设计一个"标准画布"，然后映射到各种实际屏幕上。**

## 🚀 部署：从本地到线上——两分钟让游戏上线

构建完成后，`build/web-mobile/` 目录里的所有文件就是你的游戏。现在把它变成 URL：

#### 方案一：Vercel（推荐，最像前端工作流）

<pre>cd build/web-mobile
npx vercel --prod
# → https://pixel-plane.vercel.app
# 以后每次构建，再跑一次就行。支持自定义域名。
# 这个流程和你的 Vue 项目部署到 Vercel 完全一样——
# 都是"静态文件丢到 CDN"模式。</pre>

#### 方案二：GitHub Pages

<pre># 把 web-mobile 目录推到 gh-pages 分支
git subtree push --prefix build/web-mobile origin gh-pages
# → https://你的用户名.github.io/仓库名
# 免费，但国内访问速度不如 Vercel</pre>

#### 方案三：腾讯云 COS + CDN（国内首选）

<pre># 如果目标用户在国内（微信小游戏引导到 Web），
# Vercel 的速度不行。腾讯云 COS + CDN 是国产方案。
# 上传 web-mobile 目录到 COS bucket，
# 绑 CDN 加速域名，配 HTTPS 证书——标准前端部署流程。</pre>

部署完成后，用 Chrome 的 Lighthouse 工具跑一下评测——Performance、Accessibility、Best Practices、SEO。你的游戏应该是一个"可以发给朋友的链接"，而不是一个"还在编辑器里跑的项目"。

## ⚡ 加载性能——3 秒原则

Web 游戏和原生游戏最大的不同：**玩家打开链接就开始等。3 秒内没画面，他就走了。**优化加载时间的核心策略：

- **纹理尽量用 Auto Atlas 合图：** 10 张小图 = 10 个网络请求。一张 atlas 合图 = 1 个网络请求。这和前端用雪碧图（sprite sheet）减少 HTTP 请求是一样的——不过 Cocos 的 Auto Atlas 是自动生成合图的。
- **音频用低码率：** BGM 用 128kbps MP3（不要求 320kbps——手机扬声器听不出区别），SFX 用 64kbps 甚至更低。能用单声道就不用立体声——包体直接减半。
- **首包瘦身：** Cocos 支持"分包加载"（Asset Bundle）——把非首场景需要的资源（比如 GameOver 场景的结算界面纹理）放到子包中，首次只加载主包。和前端路由懒加载（`import()`）完全一样。
- **Bundle 加载策略：** 首场景（Boot + MainMenu）只需要少量资源 → 放进主包。Game 场景需要的纹理/音频 → 放进 game-bundle。GameOver 场景 → 放进 gameover-bundle。玩家只有在需要时才下载对应包。

<div class="tip-box">
<strong>前端类比：</strong> Cocos 的 Asset Bundle = Vue Router 的 <code>component: () => import('./Game.vue')</code>。都是"首屏只加载必需资源，其他按需异步加载"——只是你自己要手动管理加载时机。
</div>

## 🔗 课外延伸

不要求掌握，但如果你感兴趣，这些都是值得了解的故事：

- **WebAssembly——C++ 游戏引擎怎么能在浏览器里跑？** 先说一个常见误解：Cocos Creator 3.x 引擎本身是用 TypeScript 编写的，Web 构建输出的是 JavaScript——它没有独立的 wasm 渲染核心，不存在"C++ 渲染核心 + Emscripten 编译成 wasm"这一层。Cocos H5 游戏能做到 60fps 靠的是引擎在 JS 层面的优化，而不是"渲染核心跑在 wasm 上"。不过 wasm 这条技术路线确实存在：Figma 就是例子——它的 Canvas 引擎用 C++ 写成，编译成 wasm 跑在浏览器里，所以才那么流畅。
- **WebGPU——浏览器游戏的下一代底层 API：** WebGL 2.0 是当前 Cocos 使用的浏览器图形 API，它是 OpenGL ES 3.0 的浏览器版。WebGPU 是下一代——直接映射到 Vulkan / DirectX 12 / Metal，真正释放 GPU 的现代特性（计算着色器、间接绘制、绑定组）。Chrome 113+ 已支持。Cocos 目前使用 WebGL，但一旦迁移到 WebGPU，浏览器游戏的性能上限将大幅提高。可能 2 年内，浏览器里的 3D 游戏能跑到主机平台 70% 的性能。
- **微信小游戏 vs 浏览器游戏的 URL 生态差异：** 如果一个链接发到微信聊天里，点击后走的是微信内置浏览器（X5 内核），不是 Chrome。X5 内核对 WebGL 的支持比 Chrome 差很多——可能出现渲染 bug、性能掉一半。这就是为什么国内做 H5 游戏的人经常"一怒之下"直接做微信小游戏——绕过浏览器兼容问题。你的 Web 版可以在朋友圈传播，但真正的用户入口在微信小游戏。Web 版是一个"方便测试和展示"的中间步骤。

## 🔧 动手：把游戏部署上线

构建面板你已经熟了，现在把 `build/web-mobile/` 变成一条可以发到群里的链接：

1. **本地预览构建产物：** 在 Cocos 编辑器里完成 Web Mobile 构建。然后本地起一个静态服务器预览 `build/web-mobile/` 目录——直接双击 index.html 用 file:// 打开往往无法正常运行（跨域和资源路径问题），用 `npx serve build/web-mobile` 或 VSCode 的 Live Server 更稳。确认产物和编辑器里表现一致。
2. **部署到 Vercel（推荐）：** 用上文"方案一"的命令 `cd build/web-mobile && npx vercel --prod`，拿到形如 `https://xxx.vercel.app` 的链接，先自己在手机浏览器里打开验证。
3. **部署到 GitHub Pages（可选）：** 按"方案二"用 `git subtree push --prefix build/web-mobile origin gh-pages`，得到 `https://你的用户名.github.io/仓库名`，作为一个免费的长驻地址。
4. **验收并分享：** 用 Lighthouse 跑一下加载性能，用手机实测加载时间（3 秒原则）和触控手感。然后把这个链接发给朋友——这就是"可以发给朋友的链接"，你的游戏正式上线了。

## ✅ 自测清单

学完这一节，你应该能回答这些问题：

1. 设计分辨率（Design Resolution）和适配策略（fitHeight / fitWidth）分别控制什么？如果你把适配策略从 Fit Height 改成 Fit Width，在 iPhone X（375×812）上会发生什么？游戏画面上会多出什么？
2. Cocos 的 Web 构建流程和你熟悉的 Vue/Vite 前端构建流程，在每一步上有什么对应关系？（源码 → 编译 → 打包 → 优化 → 输出静态文件 → 部署到 CDN）
3. 你用 Vercel 部署后，朋友在微信里打开链接说"很卡"。列出三个可能的原因——从浏览器引擎、网络加载、渲染性能三个维度分析。
4. 什么是 Asset Bundle？为什么它被称为"Cocos 的路由懒加载"？如果你不做分包，所有资源都在主包中——用户的首次加载时间和流量消耗会发生什么变化？
