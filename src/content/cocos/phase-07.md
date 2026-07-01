---
phase: 7
title: 帧动画
duration: 1-2 天
---

## 🧭 本节定位

让精灵"动起来"的最简单方式——按时间间隔轮流显示一组图片，就像翻手翻书。这一节讲清帧动画的原理、帧率选择和 SpriteSheet 的切割。

## 📖 从手翻书到 SpriteSheet

帧动画的原理简单到让你觉得"就这？"——把一系列稍有差别的图片按固定时间间隔快速切换，利用人眼的**视觉暂留**效应，产生连续的动态感。

在游戏开发中，这些"稍有差别的图片"被拼在一张大图上，叫 **SpriteSheet（精灵表）**。每一帧就是 SpriteSheet 的一个矩形区域。引擎按顺序切换显示这些矩形区域，就形成了动画。

为什么拼成一张大图而不是分开的文件？因为在 Phase 6 里我们讲了：一张大图 = 一次 DrawCall。6 帧动画如果是 6 个小文件 = 6 个 DrawCall。

<div class="tip-box">
<strong>前端视角：</strong> SpriteSheet 帧切换的原理和 CSS Sprite 动画一模一样——background-image 指向一整张大图，用 background-position 决定显示哪个区域。在没有 CSS @keyframes 的年代，前端就是用 JS 定时器逐帧修改 background-position 来做动画的。Cocos 的 SpriteFrame 切换本质上就是在做同样的事，只是换成引擎帮你管理帧索引和定时器。
</div>

## ⏱️ 帧率：12fps vs 24fps vs 60fps

帧动画不需要跑满 60fps。不同的帧率给玩家完全不同的感觉：

- **8-12 fps：** 经典的像素游戏风格（《超级马里奥》的动画就是这个帧率）。有"手绘感"。
- **24 fps：** 流畅的最低门槛。传统电影就是 24fps。适合大多数 2D 游戏动画。
- **60 fps：** 极流畅。现代 3D 游戏的标准。但对 2D 像素画来说，60fps 的帧动画可能会让画面显得"太光滑"，失去手绘质感。

建议：**飞机大战的动画用 12-15fps**。这个帧率下爆炸和火焰看起来有"打击感"而不是"滑溜溜"。

前端开发者对这个概念应该不陌生——**Web 动画性能预算**里讨论的就是同样的问题。你是用 60fps 的 CSS transform 动画还是降到 30fps 来省电？低端手机上 requestAnimationFrame 跑不满 60fps 时你会主动降到 30fps 吗？游戏帧率的选择和 Web 动画性能优化用的是完全相同的决策逻辑：**够用就好，不是越高越好**。

## ✂️ SpriteFrame 数组动画：最简单的实现

<pre>// 在 Component 中
@property({ type: [SpriteFrame] })
frames: SpriteFrame[] = []

private frameIndex = 0
private timer = 0
@property frameInterval: number = 0.08  // 12.5 fps

update(dt: number) {
  this.timer += dt
  if (this.timer >= this.frameInterval) {
    this.timer = 0
    this.frameIndex = (this.frameIndex + 1) % this.frames.length
    this.getComponent(Sprite).spriteFrame = this.frames[this.frameIndex]
  }
}</pre>

## 🔧 动手：从 SpriteSheet 切割到帧动画运行

找一个现成的 SpriteSheet（或者自己画一个简单的——比如一个 6 帧的小人走路图，排列成一行），跟着下面的步骤做一遍：

1. **导入并切割：** 把 SpriteSheet PNG 拖入 Cocos。选中图片，在属性面板的"类型"下拉中选择 **Sprite 帧**（或者右键图片 → 编辑精灵）。在 Sprite 编辑器里，设置切割模式为"自动网格"或手动指定列数——如果是 6 帧排成一行，就设 6 列 1 行。点击"切割"，你会看到 6 个高亮矩形框出现在图片上。关闭编辑器后，在资源管理器中这 6 个 SpriteFrame 会出现在图片的子资源列表里。
2. **创建 Animation Clip：** 在场景中创建一个 Node，挂上 Sprite 组件。在底部面板打开 Animation 编辑器，点击"新建 Animation Clip"。把它命名为 `walk`。
3. **添加关键帧：** 在 Animation 编辑器的时间轴上，把第 1 个 SpriteFrame 拖到第 0:00 的位置，生成一个关键帧。然后在 0:08（大约 12.5fps）、0:16、0:24、0:32、0:40 分别拖入第 2-6 帧。关闭录制。
4. **运行观察：** 点击预览，你会看到小人在走路。因为每一帧间隔约 0.08 秒，所以动画大约 12.5fps——这是我们之前讨论的"像素游戏经典帧率"。
5. **调帧率感受差异：** 回到 Animation 编辑器，把所有关键帧的间隔缩小到 0.04 秒（约 25fps），再次预览。对比 12.5fps 和 25fps——哪个更像你想要的美术风格？

<div class="tip-box">
<strong>前端视角：Animation Clip 就是游戏版的 @keyframes。</strong> CSS 里你写 <code>@keyframes walk { 0% { background-position: 0 0; } 100% { background-position: -600px 0; } }</code> 来定义动画。Cocos 的 Animation Clip 做的事完全一样——在时间轴上定义"在哪个时间点，显示哪个 SpriteFrame"。两者的核心概念一一对应：关键帧 = keyframe selectors，时间轴 = animation-duration，循环播放 = animation-iteration-count: infinite。
</div>

<div class="tip-box">
<strong>动手小挑战：</strong> 如果你有第二套 SpriteSheet（比如小人的"跑"动画），再创建一个 Animation Clip 叫 <code>run</code>。学习怎么在代码里用 <code>this.getComponent(Animation).play('walk')</code> 和 <code>.play('run')</code> 来切换动画。
</div>

## 🔗 课外延伸

- **迪士尼 12 原则中的"挤压与拉伸"：** 一帧动画不只是"位置变了"。角色的身体在运动时会变形——跳跃时身体被拉长，落地时被压扁。这种变形让动画"有重量感"。在美术课程里会详细讲。
- **DragonBones vs Spine vs 帧动画：** 帧动画逐帧手绘，表现力最强但工作量最大。DragonBones/Spine 用骨骼驱动，一个骨骼动画可以变出无限种姿势，适合需要大量动画变体的项目。飞机大战这种"你只需要几个爆炸和火焰"的场景，帧动画完全够了。

## ✅ 自测清单

1. SpriteSheet 相比把每一帧存成单独的图片文件，各自的优劣是什么？什么时候该用 SpriteSheet，什么时候单独存更合理？提示：回想 Phase 6 的 DrawCall 知识，也想想美术工作流——让画师维护 6 个单独文件 vs 一张大图，哪个更容易修改？
2. 12fps、24fps、60fps 的视觉差异到底是什么？为什么老动画片（比如迪士尼手绘时代）12fps 也能觉得很流畅，但 3D 游戏 30fps 就会觉得卡？核心原因在哪儿？
3. 帧动画和 Tween 动画的本质区别是什么？如果一个角色的"走路"用帧动画做，"从 A 点走到 B 点的位移"用 Tween 做——这两个东西怎么配合？它们分别负责动画的哪个层面？
