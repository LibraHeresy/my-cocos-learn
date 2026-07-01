---
phase: 4
title: 资源管理
duration: 1-2 天
---

## 🧭 本节定位

前端开发里，你 import 一个模块、require 一张图片，webpack 帮你打包好。但在 Cocos 里，资源的加载、引用、释放都有自己的一套机制。理解这套机制，能帮你避免"资源加载失败""内存泄漏"这些让人头疼的问题。

## 🆔 .meta 文件：每个资源都有一个身份证

把一张 PNG 拖入 Cocos 的 assets 目录后，你会发现在同一目录下多了一个同名的 `.meta` 文件。这个文件不要删，也不要在 Git 里 ignore 它。

**.meta 文件是资源的"身份证"**。它记录了：

- 一个全局唯一的 **UUID**——Cocos 用 UUID 来引用资源，而不是文件路径。你把 PNG 移动到另一个文件夹，UUID 不变，所有引用自动更新。
- **导入设置**——比如纹理的过滤模式（Point vs Bilinear）、PPU、是否生成 Mipmap。
- **子资源列表**——如果一个 PSD 文件里有多层，或一个 SpriteSheet 被切成了多个 SpriteFrame，子资源的 UUID 也记录在这里。

类比前端：.meta 文件就像 Webpack 的 module ID——资源本身是一个文件，但系统通过一个稳定的 ID 来引用它。

<div class="warn-box">
<strong>重要：</strong> .meta 文件必须提交到 Git。没有 .meta，其他开发者拉取项目后，所有引用（SpriteFrame、Animation 等）都会丢失。这不像 npm install 可以重新生成——UUID 是唯一的，丢了就丢了。
</div>

## 📦 资源类型全景：你都有哪些素材

<table>
<thead><tr><th>Cocos 类型</th><th>对应前端概念</th><th>用途</th></tr></thead>
<tbody>
<tr><td>Texture2D</td><td>原始图片文件</td><td>GPU 中的纹理数据</td></tr>
<tr><td>SpriteFrame</td><td>background-image + background-position</td><td>从纹理中裁出一个矩形区域来显示</td></tr>
<tr><td>AudioClip</td><td>音频文件</td><td>音效和 BGM</td></tr>
<tr><td>Prefab</td><td>.vue 单文件组件</td><td>可复用的节点模板</td></tr>
<tr><td>AnimationClip</td><td>CSS @keyframes</td><td>关键帧动画数据</td></tr>
<tr><td>Material</td><td>CSS class</td><td>定义渲染效果（颜色/Shader/参数）</td></tr>
</tbody>
</table>

## 📥 动态加载：resources.load vs assetManager

有两种加载资源的方式：

**1. 拖拽绑定（静态引用）：** 在编辑器中把 SpriteFrame 拖到组件的 @property 属性上。构建时 Cocos 会自动分析引用关系，把用到的资源打包。如果某个资源没有被任何属性引用，它不会被打包。这相当于 Webpack 的 Tree Shaking。

**2. 代码动态加载：** 放在 resources 目录下的资源可以运行时加载。这适合"不确定会不会用到"的资源——比如下一关的地图、可选皮肤。

<pre>// 动态加载一个 SpriteFrame
resources.load('textures/hero/spriteFrame', SpriteFrame, (err, spriteFrame) => {
  if (err) { console.error(err); return }
  this.getComponent(Sprite).spriteFrame = spriteFrame
})</pre>

<div class="tip-box">
<strong>速通提示：</strong> 别把所有资源都放在 resources 里。Cocos 构建时会把 resources 目录<strong>全部打包</strong>（不管用没用），这会让包体积膨胀。核心资源用拖拽绑定，可选资源放 resources。
</div>

## 🔧 动手：resources.load 与 loadBundle 实战

理解资源加载最好的方式就是亲手写一遍。打开你的 Cocos 项目，按以下步骤来：

1. **创建 resources 目录：** 在 assets 下新建一个文件夹叫 `resources`，把几张测试用的 PNG 丢进去。
2. **用 resources.load 动态加载纹理：**

<pre>import { resources, SpriteFrame, Sprite } from 'cc'

// 动态加载 resources/textures/hero 下的 SpriteFrame
resources.load('textures/hero/spriteFrame', SpriteFrame, (err, spriteFrame) => {
  if (err) { console.error('加载失败：', err); return }
  // 把加载到的 SpriteFrame 挂到当前节点的 Sprite 组件上
  this.getComponent(Sprite).spriteFrame = spriteFrame
  console.log('resources.load 成功！')
})</pre>

3. **用 assetManager.loadBundle 加载整个包：** 在 assets 下新建一个文件夹叫 `bundle_test`，右键把它设为 Bundle。放进几张图，然后写：

<pre>import { assetManager, SpriteFrame, Sprite } from 'cc'

assetManager.loadBundle('bundle_test', (err, bundle) => {
  if (err) { console.error('Bundle 加载失败：', err); return }
  // 从 Bundle 里加载资源
  bundle.load('some-image/spriteFrame', SpriteFrame, (err2, sf) => {
    if (err2) { console.error(err2); return }
    this.getComponent(Sprite).spriteFrame = sf
  })
})</pre>

**对比一下两者的区别：** resources.load 直接从主包加载，适合少量可选资源；loadBundle 把一整组资源打包成独立的 Bundle，可以按需加载和卸载——想象一下你的游戏有 10 个关卡，每个关卡一个 Bundle，玩家打到第 3 关时才加载第 3 关的资源，前两关的可以卸载掉。这才是正经游戏的资源管理方式。

<div class="tip-box">
<strong>动手小挑战：</strong> 试试在加载完成后，用 <code>assetManager.getBundle('bundle_test')?.releaseAll()</code> 释放 Bundle，再回到编辑器检查资源是否被卸载了（在调试面板的 Assets 页可以看到引用计数）。
</div>

## 🔗 课外延伸

- **Unreal 的软引用：** Unreal 有一个概念叫"软引用"（Soft Reference）——指向一个资源但不阻止它被卸载。Cocos 没有这个机制，但理解它有助于理解为什么资源管理是一个复杂问题。
- **Web 的 ES Module 和 Cocos Bundle：** Cocos 的 Asset Bundle 和 Webpack 的 Code Splitting + dynamic import() 是同一个思路——把资源按需分块加载，减少首屏时间。

## ✅ 自测清单

1. 如果项目中删除了一个 PNG 的 .meta 文件但 PNG 还在，会发生什么？为什么 .meta 文件必须提交到 Git 而不能像 node_modules 一样 ignore？
2. resources.load 和 assetManager.loadBundle 都能动态加载资源。请用你自己的话描述一个场景：什么情况下用 resources.load 就够了，什么情况下必须上 loadBundle？提示：想想一个 10 关的游戏的包体积。
3. JavaScript 有垃圾回收（GC），用完的对象会自动回收。那为什么游戏引擎还需要手动的 addRef/decRef 引用计数？提示：想想 GPU 纹理——GC 看得到显存里的东西吗？
