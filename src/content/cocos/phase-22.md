---
phase: 22
title: Spine 骨骼动画
duration: 1-2 天
---

## 🧭 本节定位

你做了帧动画：idle 4 帧，attack 6 帧，run 8 帧。一个角色的三个动画，18 帧。现在你想给角色换一套皮肤——你需要重新画 18 帧。再加一个新动画 jump？再画 6 帧。**骨骼动画不一样：画一套骨骼、挂一套皮肤。换皮肤就是换一张图，同一套骨骼的动画可以给所有皮肤用。**这一节讲帧动画和骨骼动画的选型决策和 Spine 的核心概念。

## ⚖️ 帧动画 vs Spine 骨骼动画：不只是「谁更好」

帧动画和骨骼动画不是"谁更好"的问题——而是**"你的游戏需要什么"**的问题：

<table>
<thead><tr><th>维度</th><th>帧动画</th><th>Spine 骨骼动画</th><th>前端类比</th></tr></thead>
<tbody>
<tr><td>包体大小</td><td>每帧一张图（6 帧爆炸 = 6 张）</td><td>一张纹理 + 骨骼数据（小几十倍）</td><td><strong>雪碧图（sprite sheet）vs SVG</strong>——前者每帧像素固定，后者数学定义无限缩放</td></tr>
<tr><td>流畅度</td><td>帧率固定，中间帧靠手画</td><td>骨骼插值，任意帧率都平滑</td><td><strong>GIF vs CSS animation</strong>——GIF 帧率固定 15-30fps，CSS 可以 60fps 流畅</td></tr>
<tr><td>复用性</td><td>每个动画独立，换皮=重画所有帧</td><td>骨骼+动画复用于所有皮肤</td><td><strong>内联样式 vs CSS 主题</strong>——主题换一个 class 全局生效，内联样式每个元素逐一改</td></tr>
<tr><td>工作流门槛</td><td>画完就能用，简单粗暴</td><td>建骨骼→蒙皮→调动画→导出，学习曲线陡</td><td><strong>手写 HTML/CSS vs 用设计师工具(如 Figma)</strong>——前者直接编码，后者有设计-开发协作流程</td></tr>
<tr><td>表现力</td><td>每帧都是手绘艺术品，有温度</td><td>骨骼驱动，存在"木偶感"（关节旋转不自然）</td><td><strong>手绘插图 vs 矢量图形</strong>——手绘有笔触温度，矢量规整但"冷"</td></tr>
</tbody>
</table>

核心矛盾：**帧动画表现力强但不可复用，骨骼动画复用性强但容易有"木偶感"。**最优秀的 2D 游戏往往不是二选一——而是两者混合。

## 🦴 Spine 核心概念：骨架 = HTML 模板

Spine 的世界观可以用一个前端比喻来理解：

<pre>Spine 概念           前端类比

骨骼（Bone）         HTML 结构 &lt;body&gt; &lt;header&gt; &lt;main&gt; &lt;footer&gt;
  ├── 父骨骼动，      ├── 父元素移动/缩放，子元素跟着
  │   子骨骼跟着动    │
  └── 层次关系        └── DOM 树层次关系

插槽（Slot）         &lt;slot&gt; 插槽 —— 在 HTML 结构中预留的位置
  └── 挂载点          └── 在这个位置"放"内容

附件（Attachment）    组件/内容 —— 实际塞进插槽的东西
  └── 挂在插槽上的     └── &lt;slot name="body"&gt; 里放的 &lt;Sprite /&gt;

皮肤（Skin）          CSS 主题 —— 换一套图但结构不变
  └── 同一套骨骼       └── [data-theme="dark"] 换一套 CSS 变量
      换不同的附件         但 HTML 结构保持不变

动画（Animation）     CSS transition + @keyframes
  └── 记录骨骼在       └── 定义 start → end 的中间状态
      时间轴上的变换</pre>

这个类比不是修辞——它在架构层面是准确的。Spine 骨架的 JSON 格式里，骨骼是一棵有父子关系的树，Skin 是一个 name→Attachment 的映射表，Animation 是 Bone 变换的时间序列。这和 HTML 模板 + CSS 主题 + CSS 动画的架构几乎同构。

<div class="tip-box">
<strong>一个帮你记住的概念映射：</strong> Skeleton = Template，Skin = Theme，Animation = Transition。如果你能在这三个概念上建立直觉，Spine 的工作流你就理解了一大半。
</div>

## 🎮 动画混合：从走到跑的平滑过渡

动画混合（Blending）是 Spine 最重要的运行时功能之一。不用它，角色从走到跑的切换是"啪"的一下——瞬间从走路姿势变成跑步姿势。用了混合，骨骼在两个动画之间平滑过渡。

原理很简单：**对每一个骨骼的每个属性（位置 X/Y、旋转、缩放），取 A 动画和 B 动画在该时间点的值，按混合权重做线性插值。**

<pre>// 混合 weight 从 0→1，持续 0.3 秒
walk_anim:  骨骼旋转 = 5°   骨骼位置 Y = 0
run_anim:   骨骼旋转 = 20°  骨骼位置 Y = -5  // 跑的时候身体前倾
                        ↓ blend weight = 0.5
混合结果:   骨骼旋转 = 12.5°  骨骼位置 Y = -2.5

// 前端类比：CSS transition
// .character { transition: transform 0.3s ease-out; }
// .character.walk { transform: rotate(5deg) translateY(0); }
// .character.run { transform: rotate(20deg) translateY(-5px); }</pre>

你可以在同一个角色的不同"动画轨道"上播放不同权重的动画——比如下半身播 run 动画（权重 1.0），上半身播 attack 动画（权重 0.8），这样角色就可以**一边跑一边攻击**，两者叠加。这和 CSS 动画中的 `animation-composition: accumulate` 是同一个概念——多个动画同时作用于同一个元素，效果叠加。

## 🎮 飞机大战该用哪个？正确的答案和正确的理由

飞机大战的动画需求很简单：爆炸动画（爆炸过程）、引擎火焰（持续的帧动画）、角色待机浮动。这些用帧动画 6-10 帧就够了，不需要引入 Spine 的复杂度（额外 SDK、额外的 runtime、额外的学习成本）。

但了解 Spine 是必要的——当你做下一个游戏（平台动作、RPG、格斗），角色需要"待机 / 走路 / 跑 / 跳跃 / 攻击 / 受伤 / 死亡" 七套动画，再加上 3 套皮肤（默认 / 暗黑 / 火焰），帧动画的维护成本会指数爆炸（7 动画 × 3 皮肤 × 平均 8 帧 = 168 帧要画）。Spine 的方案是：7 套骨骼动画 + 3 张皮肤纹理 = 极小的维护量。

<div class="tip-box">
<strong>选型口诀：</strong> 3 个动画以内→帧动画。超过 3 个动画 + 需要换皮肤→Spine。不确定→先用帧动画快速出原型，确认需求后再决定是否切 Spine。
</div>

## 🔧 动手：导入并控制 Spine 动画

1. **获取材质：** 去 spine-esoteric-software 的 GitHub 官方示例仓库下载一个免费的 Spine 角色，得到三个文件：`.json`（骨骼+动画数据）、`.atlas`（纹理区域映射，类似 CSS sprite 的坐标表）、`.png`（纹理图）。这三个文件的关系是：atlas 告诉引擎"纹理上的哪个矩形区域是哪个部件"，json 告诉引擎"骨骼怎么连、动画怎么动"。
2. **导入 Cocos：** 在 assets 面板中创建一个 Spine 目录，将三个文件拖入。
3. **创建骨骼节点：** 在场景中创建空节点 → 添加组件 → Spine → Skeleton（代码里叫 sp.Skeleton）→ 拖入 SkeletonData 资源。
4. **切换动画：** 在属性检查器的 Animation 下拉中选择 `idle`。运行——角色应该开始待机动画。
5. **代码控制动画：** 写一段 TypeScript：获取 `sp.Skeleton` 组件引用，调用 `skeleton.setAnimation(0, 'attack', false)`（轨道 0，播放 attack 动画，不循环）。在键盘事件中切换动画——按空格播 attack，按方向键播 run，松手切回 idle。注意：`setAnimation` 是"直接切"，`addAnimation` 是"排队切"（当前动画播完再播下一个）。
6. **尝试动画混合：** 用 `skeleton.setAnimation(0, 'run', true)` + `skeleton.setAnimation(1, 'aim', true)` 在不同的轨道上同时播放两个动画，实现"边跑边瞄准"的效果。

## 🔗 课外延伸

不要求掌握，但如果你感兴趣，这些都是值得了解的故事：

- **《空洞骑士》的混合方案——逐帧 + 骨骼的完美结合：** Team Cherry 的核心角色全部使用传统手绘帧动画（这也是为什么空洞骑士的动作看起来那么有"重量感"——逐帧手绘的每个动作都是美术精心设计的，不受骨骼旋转的限制）。但背景视差层、粒子层、环境特效层大量使用了骨骼动画辅助。这种"核心逐帧 + 辅助骨骼"的混合方案是独立游戏中最务实的选择。他们 3 个人做了 3 年——帧动画虽然工作量大，但最终效果无可替代。
- **从迪士尼赛璐珞到 Spine 数字工作流：** 1930 年代，迪士尼发明了"赛璐珞动画"（Cel Animation）——把角色画在透明赛璐珞片上，背景单独画，叠加拍摄。这个工作流的核心思想是**"把角色拆成可独立运动的部件"**——和 Spine 的骨骼拆解一模一样。80 年后，Spine 把这个思想数字化了：不再是物理的透明片，而是数字的骨骼节点。动漫行业中，制作委员会仍然大量使用手绘帧动画——但外包到东南亚和中国的制作公司越来越多地用 Spine 提高效率。这不是技术替代艺术，而是工具让艺术家更快地做出想做的效果。
- **3D 骨骼动画——同一套原理升维：** 3D 角色动画的核心也是骨骼——只不过骨骼在三维空间（X/Y/Z 坐标 + 四元数旋转），而且多了"蒙皮"（Skinning）：每个顶点被多个骨骼的权重共同影响（比如膝盖顶点的位置 = 大腿骨权重 × 大腿骨变换 + 小腿骨权重 × 小腿骨变换）。Unity 的 Animator、Unreal 的 Animation Blueprint、Blender 的骨架——全部基于同一套骨骼驱动原理。你如果以后从 2D 转向 3D，Spine 的骨骼思维会直接迁移。

## ✅ 自测清单

学完这一节，你应该能回答这些问题：

1. Spine 骨骼动画相比序列帧动画，在包体大小、流畅度、复用性上各有什么优势？但"表现力"上的劣势是什么？为什么《空洞骑士》选择了混合方案？
2. 骨骼（Bone）、插槽（Slot）、附件（Attachment）、皮肤（Skin）这四个概念之间的关系是什么？用自己的话说清楚——并用前端概念（模板、插槽、组件、主题）做类比。
3. 动画混合（Blend）的技术原理是什么？如果你要做一个"角色在走路时上半身可以被玩家控制方向"的功能，你会怎么利用多轨道混合来实现？
4. 你的下一个项目是一个横板动作 RPG，主角有 6 个可解锁皮肤（默认、火焰、冰霜、暗黑、黄金、像素复古），每种皮肤下都有 idle/walk/run/jump/attack1/attack2/hurt/die 共 8 个动画。用帧动画和 Spine 分别估算工作量。你会怎么说服团队中的美术用 Spine？
