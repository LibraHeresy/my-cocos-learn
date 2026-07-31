---
phase: 18
title: 性能优化实战
duration: 2-3 天
---

## 🧭 本节定位

**60fps。16 毫秒。**这是游戏的硬标准——不是"建议"，玩家对掉帧的容忍度为零。在 PC 上，你的 JS 独享一个 3.5GHz 的 CPU 核心；但在手机上，你的 JS 和 GPU 共享一块发热的芯片，还要和微信的渲染线程抢资源、和系统的后台进程抢带宽。编辑器里跑 60fps 不等于真机上跑 60fps。这一节教你怎么找到瓶颈、然后精准地粉碎它——用数据说话，不靠猜。

## ⏱️ 16 毫秒的生命：一帧里发生了什么？

在 60fps 下，每一帧只能占用 16.67 毫秒。在这 16ms 里——包括你所有的 update 回调、碰撞检测、物理计算、渲染提交——必须全部完成。如果某一帧超出了 16ms，用户就会看到一个"掉帧"。

和前端性能优化相比：前端有一个 `requestIdleCallback`，浏览器可以在空闲时做一些低优先级的活。但游戏没有——**游戏的每一帧都是硬实时约束**。这就是为什么你在游戏里不能用"反正前端也慢"来安慰自己——前端的"慢"是用户觉得页面反应迟钝；游戏的"慢"是用户肉眼可见的卡顿和拖影。

<table>
<thead><tr><th>维度</th><th>Web 前端性能</th><th>游戏性能</th></tr></thead>
<tbody>
<tr><td><strong>核心指标</strong></td><td>FCP、LCP、TTI、CLS</td><td>FPS（帧率）、Frame Time（帧时间）</td></tr>
<tr><td><strong>硬实时要求</strong></td><td>无（加载完就好了）</td><td>每 16ms 必须完成一帧</td></tr>
<tr><td><strong>主要瓶颈</strong></td><td>网络、JS Bundle 体积、渲染阻塞</td><td>DrawCall、GC、纹理带宽</td></tr>
<tr><td><strong>优化后效果</strong></td><td>页面更快加载、交互更灵敏</td><td>画面不卡、手感流畅</td></tr>
<tr><td><strong>失败后果</strong></td><td>用户跳失</td><td>玩家操作滞后 1 帧→飞机撞墙→怒删游戏</td></tr>
</tbody>
</table>

## 📊 三大优化方向——和 Web 性能的对应关系

<table>
<thead><tr><th>方向</th><th>问题</th><th>Web 前端类比</th><th>工具</th><th>目标</th></tr></thead>
<tbody>
<tr><td><strong>DrawCall</strong></td><td>每帧 CPU→GPU 通信次数</td><td>HTTP 请求数量——每次通信有开销</td><td>Cocos Profiler / Chrome DevTools</td><td>&lt; 50（移动端）</td></tr>
<tr><td><strong>纹理内存</strong></td><td>GPU 显存占用</td><td>图片体积（WebP/AVIF 优化）</td><td>Cocos 构建面板</td><td>&lt; 200MB（移动端）</td></tr>
<tr><td><strong>脚本 CPU</strong></td><td>update 中的 JS 耗时</td><td>Long Task / JS Blocking Time</td><td>Chrome Performance 面板</td><td>单帧 JS &lt; 5ms</td></tr>
</tbody>
</table>

<div class="tip-box">
<strong>前端类比一：</strong> DrawCall ≈ <strong>HTTP 请求</strong>。每一次 DrawCall 是 CPU 告诉 GPU 画一次东西。100 次 DrawCall = 100 次"画这个→画那个→画下一个"，就像浏览器打开一个页面时发出了 100 个 HTTP 请求——每次都有握手开销（CPU→GPU 通信延迟），哪怕请求内容很小。Web 通过 HTTP/2 Multiplexing（多路复用）来减少请求数开销；Cocos 通过 <strong>Auto Batching</strong>（自动合批）来减少 DrawCall——同一个纹理的 Sprite 放在相邻位置，引擎会自动把它们合并成一次 DrawCall。原理完全相同：减少通信频率。
</div>

## 🗜️ 纹理压缩——游戏世界的图片优化

前端有 WebP/AVIF——在同样视觉质量下减少文件体积 30-50%。游戏有 ETC2/ASTC——在同样视觉质量下减少显存占用 75-87.5%：

<pre>// 未压缩：1024×1024 RGBA = 4MB
// ETC2：≈ 1MB（Android 常选；ETC2 是 OpenGL ES 3.0 强制格式，iOS A7+ 同样支持）
// ASTC 6×6：≈ 0.5MB（iOS 较新机型；ASTC 自 2016 年起大量 Android GPU 也原生支持）
// iOS 传统上常用 PVRTC，较新机型用 ASTC
// 建议：Cocos 构建时同时勾选 ETC2 和 ASTC，运行时自动选择</pre>

<div class="tip-box">
<strong>前端类比二：</strong> ETC2/ASTC 纹理压缩 ≈ <strong>WebP/AVIF 图片格式</strong>。就像 <code>&lt;picture&gt;</code> 标签根据浏览器支持自动选择 WebP 或 JPEG 格式，Cocos 构建面板勾选多种纹理格式后，运行时自动根据设备 GPU 选择最优格式。不同的是：纹理压缩发生在 GPU 内存中（不仅仅是文件体积），所以压缩效果直接影响显存占用和发热量——这在手机上尤其关键。
</div>

## ⚡ 脚本性能 Tips——和前端 Long Task 优化的对照

前端的"长任务优化"（把超过 50ms 的任务拆成小块）在游戏里对应"单帧 JS 不超过 5ms"——因为游戏只有 16ms 的总预算，JS 只能用其中的 5-8ms（剩下的给渲染和输入）：

- 减少 update 中的 `getComponent()` 调用——在 start 中缓存引用
- 避免在 update 中创建新对象（new Vec3、字符串拼接）——触发 GC
- 用对象池替代 instantiate/destroy
- 不需要每帧更新的逻辑用 `schedule(callback, interval)` 替代

<div class="tip-box">
<strong>前端类比三：</strong> 对象池 ≈ <strong>数据库连接池 / HTTP Keep-Alive</strong>。就像后端不会每收到一个请求就新建一个数据库连接（而是从连接池里取），游戏不该每发射一颗子弹就新建一个 Node（而是从对象池里取）。连接池节省的是 TCP 握手开销；对象池节省的是 JS 内存分配 + GC 回收开销。原理相同，规模不同——一个 web 请求的生命是几十毫秒到几秒，一颗子弹的生命是 1-5 秒，但创建和销毁的频率可能是每秒 30 次。
</div>

## 🔗 课外延伸

- **为什么手机 GPU 用 Tile-Based Rendering？——物理学决定的架构差异：** 手机 GPU（Mali、Adreno、Apple GPU）和桌面 GPU（NVIDIA、AMD）的架构完全不同。桌面 GPU 用的是 Immediate Mode Rendering——收到一个三角形，立刻画到帧缓冲里。手机 GPU 用的是**Tile-Based Rendering（TBR）**——把屏幕切成 16×16 像素的小方块（Tile），一块一块地渲染。这就意味着：一个粒子特效如果在屏幕上跨越了 100 个 Tile，GPU 需要把它的数据写入 100 次（每个 Tile 一次）——而桌面上只需要写一次。这就是为什么粒子特效在手机上比桌面上昂贵得多。理解这一点对性能优化至关重要：在手机上，不要用"桌面端跑明明没问题"的粒子密度。
- **Naughty Dog 如何在 PS1 上做出《古惑狼》——性能优化界的"黑魔法"：** 1996 年，Naughty Dog 的 Andy Gavin 和 Jason Rubin 面临一个不可能的任务：在 PlayStation 1（2MB 主内存 + 1MB 显存）上做一个 3D 平台跳跃游戏。PS1 的硬件根本不足以加载一整关的纹理和模型。他们的解决方案——用今天的眼光看简直疯狂：他们**重写了索尼官方的整个 3D 图形库**，用汇编语言实现了一个自定义的纹理流式加载系统（Texture Streaming），让游戏可以在角色向前走的瞬间**只加载屏幕可见范围内的纹理**——而不可见部分全部卸载，甚至不保留在内存中。这套自研系统让《古惑狼》在 PS1 上实现了流畅的 30fps 3D 画面——而同期其他 PS1 游戏普遍只有 20fps 且画面模糊。Naughty Dog 后来将这套技术授权给索尼，成为 PS1 第三方开发者的标准 SDK 组件。今天你在 Cocos 里看到的"纹理压缩""自动合批""LOD"，都是 1996 年 Andy Gavin 在 2MB 内存限制下的挣扎的遗产。
- **Web Vitals（LCP/FID/CLS）和游戏性能标准的对比——为什么游戏需要自己的"Core Web Vitals"：** Google 的 Web Vitals 定义了前端的三个核心性能指标：LCP（最大内容绘制——2.5 秒内）、FID（首次输入延迟——100ms 内）、CLS（累积布局偏移——0.1 以下）。游戏需要类似的"Core Game Vitals"：FPS 稳定性（90% 帧在 16ms 内）、帧时间标准差（< 2ms——表示帧率平稳，不存在"时快时慢"）、GC 频率（< 1次/10s——减少 GC 导致的帧丢失）。前端的"卡顿"用户会忍（"网络不好吧"），游戏的"卡顿"用户不会忍——因为玩家的大脑会把"我按了射击但没射出来"归因为"游戏破"而不是"网络差"。记住这个区别。

## 🔧 动手：三步骤性能优化实战

打开你的游戏，按照下面三个步骤逐一排查和优化。每一步都记录优化前后的数据，感受"数字说话"的力量。

**第 1 步：消除 update() 中的不必要分配**

<pre>// 【优化前】update 中每帧创建新对象 —— 每帧 = 一次 GC 压力
update(dt: number) {
  const pos = new Vec3()                    // ❌ 每帧 new
  this.node.getPosition(pos)
  const dir = new Vec3(0, -1, 0)            // ❌ 每帧 new
  Vec3.scaleAndAdd(pos, pos, dir, this.speed * dt)
  this.node.setPosition(pos)
}

// 【优化后】复用对象，只在初始化时分配一次
private _tempPos = new Vec3()
private _dir = new Vec3(0, -1, 0)

update(dt: number) {
  this.node.getPosition(this._tempPos)
  Vec3.scaleAndAdd(this._tempPos, this._tempPos, this._dir, this.speed * dt)
  this.node.setPosition(this._tempPos)
}</pre>

**记录：** 打开 Chrome DevTools → Performance 标签 → 录制 10 秒游戏运行 → 对比优化前后的 JS Heap 曲线。优化后曲线应该更平滑，没有频繁的锯齿状波动（锯齿 = GC 触发）。

**第 2 步：减少 DrawCall——使用 Cocos 内置 Profiler**

<pre>// 打开 Cocos Creator → 运行游戏 → 左下角点击 Profiler 按钮
// 观察 DrawCall 数量。目标：移动端 &lt; 50

// 常见优化手段：
// 1. 把同一纹理的 Sprite 放在同一个父节点下 → 自动合批（Auto Batching）
// 2. 使用 Sprite Atlas（图集）—— 多张图打包到一张纹理，大幅减少纹理切换
// 3. 减少 Label 数量——每个不同字号的 Label 都是一个 DrawCall
// 4. 关闭不可见物体的渲染：sprite.enabled = false 而不是 node.active = false</pre>

**第 3 步：纹理优化**

<pre>// 检查纹理大小 —— Cocos 编辑器里选中纹理资源 → 属性面板看尺寸
// 问题：某张背景图 2048×2048 RGBA8888 = 16MB！
// 优化：
//   1. 缩小到实际显示尺寸（如果屏幕只有 750×1334，1024×1024 就够了）
//   2. 关闭不需要的 Alpha 通道（RGB888 比 RGBA8888 小 25%）
//   3. 构建发布时勾选纹理压缩：
//      - Android: ETC2 (≈ 1/4 大小)
//      - iOS: ASTC 6×6 (≈ 1/2 大小)
//  总结：2048² 未压缩 16MB → 1024² ETC2 ≈ 1MB，缩小了 16 倍！

// 在构建面板设置：
// 项目设置 → 功能裁剪 → 纹理压缩 → 勾选 ETC2 和 ASTC
// 构建时 Cocos 自动为不同平台生成对应的压缩纹理</pre>

**优化结果记录模板（填你自己的数据）：**

<table>
<thead><tr><th>指标</th><th>优化前</th><th>优化后</th><th>改善</th></tr></thead>
<tbody>
<tr><td>FPS（稳定时）</td><td>___</td><td>___</td><td>___</td></tr>
<tr><td>DrawCall</td><td>___</td><td>___</td><td>___</td></tr>
<tr><td>纹理总内存</td><td>___</td><td>___</td><td>___</td></tr>
<tr><td>单帧 JS 耗时</td><td>___</td><td>___</td><td>___</td></tr>
<tr><td>GC 频率（次/10s）</td><td>___</td><td>___</td><td>___</td></tr>
</tbody>
</table>

## ✅ 自测清单

学完这一节，你应该能回答：

1. 为什么同样是 JS 代码，游戏里的 GC（垃圾回收）比 Web 前端致命得多？从帧时间预算（16ms vs 无硬约束）和人类对视觉流畅度的敏感性两个角度解释。
2. DrawCall 为什么被类比为 HTTP 请求？它们有什么共同的性能特征？为什么"合并请求"（Batching / HTTP/2 Multiplexing）在两种场景下都是优化策略？
3. 为什么移动端和桌面端使用不同的纹理压缩格式？Android 和 iOS 通常会选择哪些格式（如 ETC2/ASTC/PVRTC）？为什么"某格式只能在某个平台用"这类排他性说法在今天已经站不住脚？这个格式兼容性问题和前端的什么场景类似？
4. Naughty Dog 在 1996 年 PS1 上做《古惑狼》时用了什么"黑魔法"来突破硬件限制？这套技术在今天的 Cocos/Cocos Bundle 系统中以什么形式存在？性能优化的"永恒难题"是什么？
