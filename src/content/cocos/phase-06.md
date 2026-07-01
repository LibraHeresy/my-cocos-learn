---
phase: 6
title: 图集与自动合批
duration: 1-2 天
---

## 🧭 本节定位

这一节解决一个具体的问题：**为什么你的游戏在编辑器里跑得好好的，一到真机上就卡？** 答案通常藏在两个字里——DrawCall。

## 🐌 DrawCall 是什么？为什么多了就卡？

简单说：一次 DrawCall 就是 CPU 对 GPU 说"嘿，帮我画这堆三角形"，GPU 说"收到，画好了"，然后 CPU 说"好，再画下一堆"。每一来一回都是一次 DrawCall。

CPU 和 GPU 之间的通信有**固定开销**——切换渲染状态（纹理、Shader、混合模式）需要时间。当你有 100 个小精灵，每个用不同的纹理，CPU 就要发 100 次 DrawCall。开销累加起来，一帧可能超过 16ms——掉帧了。

如果把 100 张小图拼成 1 张大图，用一个 DrawCall 就能画完。这就是**图集（Atlas）**的核心价值。

<div class="tip-box">
<strong>类比：</strong> 去超市买东西。每次买一样结一次账（100 次结账）vs 全部装进购物车一次结账（1 次）。图集就是把所有东西装进一个购物车。
</div>

## 🗂️ Auto Atlas：Cocos 帮你自动合图

你不需要手拼图集。Cocos 有 Auto Atlas 功能：

1. 在 assets 目录右键 → 创建 → Auto Atlas
2. 把需要合并的 SpriteFrame 拖入配置（或指定一个文件夹自动包含）
3. 构建时 Cocos 自动把所有小图拼成一张大纹理，更新所有 SpriteFrame 的 UV 坐标

限制：单张图集最大 2048×2048（移动端建议不超过 1024×1024）。所有 SpriteFrame 必须使用同样的过滤模式和压缩格式。

<div class="tip-box">
<strong>前端视角：</strong> Auto Atlas 做的事和 CSS Sprite 完全一样。你做 Web 开发时把 20 个小图标拼成一张 <code>sprite.png</code>，用 <code>background-position</code> 来裁剪显示——这就是图集。区别只在于，CSS Sprite 省的是 HTTP 请求数，游戏图集省的是 DrawCall 数。本质都是：<strong>一次通信，干完所有事</strong>。
</div>

## 🔬 合批条件：为什么有时候合不了？

即使用了图集，也不是所有 Sprite 都能合并为一个 DrawCall。打断合批的条件：

- **不同纹理：** 两个 Sprite 引用不同 Texture——这是最直接的打断。
- **不同材质/Shader：** 比如一个用默认 Shader，另一个用自定义灰化 Shader。
- **不同混合模式：** 一个 Normal，一个 Additive。
- **节点层级不连续：** 同一个图集的两个 Sprite 之间插了一个别的东西。

做前端的同学可以把合批条件理解为 **webpack 的模块打包规则**——不是所有 import 都能打进同一个 chunk 里。异步 import() 会拆出独立 chunk，不同类型的资源有各自独立的处理管线。DrawCall 合批也一样：不同纹理、不同 Shader、不同混合模式——它们就像不同类型的模块，必须分开处理。

在 Chrome DevTools 的 Cocos 调试面板中可以看到 DrawCall 数量。目标是控制在 **50 以内**（移动端）。

<div class="tip-box">
<strong>前端类比：渲染阻塞资源。</strong> 打断合批就像页面里夹了一个 render-blocking 的 CSS——它自己要多走一趟网络，还卡住了后面所有东西的渲染。DrawCall 也是这样：一个"不合群"的 Sprite 不仅自己多占一次 DrawCall，还会把本来可以合批的一组对象硬生生拆成两拨。
</div>

## 🔧 动手：Auto Atlas 前后 DrawCall 对比

这个动手实验会让你亲眼看到 DrawCall 是怎么被图集优化的——比任何文字解释都有说服力：

1. **准备素材：** 找至少 8-10 张不同的小图（可以是不同颜色的方块 Sprite、各种图标、或者你的游戏素材）。把它们分别放到场景里，每个 sprite 引用不同的纹理文件。
2. **查看当前 DrawCall：** 运行游戏，打开 Chrome DevTools（F12）。Cocos 在 DevTools 里会注入一个调试面板（通常在 Cocos Creator 标签页或 Console 旁边）。找到"DrawCall"或"Render"统计——你大概会看到 10 个左右的 DrawCall，每个小图各占一个。
3. **创建 Auto Atlas：** 在 assets 目录右键 → 创建 → Auto Atlas。打开它的配置，在"包含资源"中指定包含你的这些图的文件夹。保存后等待 Cocos 重新构建——你可以在预览窗口中看到这些图已经被拼成了一整张大纹理。
4. **再次查看 DrawCall：** 重新运行游戏，打开调试面板。你会发现 DrawCall 从 10 降到了 **1**（或接近 1）。这就是合批的威力——CPU 只和 GPU 沟通了一次就画完了所有东西。

<div class="warn-box">
<strong>注意：</strong> 如果你在场景中加了文字（Label）或粒子效果，它们会额外产生 DrawCall。做这个实验时尽量只用 Sprite，这样对比才明显。另外，Cocos 使用 <code>debug</code> 构建时才有完整的调试面板。
</div>

进阶实验：在第 4 步之后，故意插入一个用了不同纹理的 Sprite 放在图集 Sprite 之间。观察 DevTools——你会发现这个"外来者"把合批打断了，DrawCall 又涨了。这就是 Phase 6 里讲到的"合批条件破坏"在实际中的表现。

## 🔗 课外延伸

- **CSS Sprite 和游戏图集是一个思路：** 你还记得前端优化里的 CSS Sprite 吗？把图标拼在一张图上用 background-position 显示。这和 Auto Atlas 完全是一个道理。Web 优化技巧在游戏引擎里继续适用。
- **Unity 的 Static Batching：** Unity 对静态物体自动合并网格数据，和 Cocos 的 Auto Atlas 是同一个优化思路的不同实现。

## ✅ 自测清单

1. 用一个你自己的比喻来解释 DrawCall 是什么。如果一张图集的 100 个 Sprite 一次性画完只要 1 个 DrawCall，那为什么引擎不干脆把所有东西自动合成一个 DrawCall？是什么条件阻止了它？
2. 你在动手实验中把 10 张分散的图放进 Auto Atlas 后 DrawCall 降到了 1。请解释图集具体是怎么做到这一点的——CPU 和 GPU 之间到底少做了什么事？
3. 假设你用 Auto Atlas 合了一批图，但其中 3 张图的 Filter Mode 是 Point，其余是 Bilinear。合批会成功吗？如果一个节点的颜色透明度设置成了 50%（改变了混合模式），它会影响和其他节点合批吗？请说说你的判断和理由。
