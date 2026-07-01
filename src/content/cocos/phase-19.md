---
phase: 19
title: 2D 物理引擎
duration: 2-3 天
---

## 🧭 本节定位

你写 AABB 碰撞写了一周——矩形对矩形，没问题。现在你想让敌机爆炸时碎片飞出去、撞到墙上反弹、然后掉到地上。这时候你发现：**手写碰撞不够了。你需要物理——重力、弹性、摩擦力。** Cocos 内置了 Box2D 物理引擎，这一节讲怎么用，以及什么时候该用、什么时候手写就够了。

## 📦 为什么你需要物理引擎？

手写一个碰撞检测并不难——两个矩形有没有重叠？几行代码的事。但物理引擎给你的是碰撞后的**响应**：撞上去以后，物体应该反弹还是停止？反弹多少？转不转？摩擦力让它减速多少？这些计算如果手写，每一帧要做几十到几百次——而且很容易写出 bug（物体卡进墙里、越弹越快、堆叠抖动）。

Box2D 的作者 Erin Catto 花了近 20 年解决这些问题。他在 2006 年把 Box2D 以 MIT 协议开源——今天你看到的几乎每一个 2D 物理游戏，背后都有这行代码的影子。Unity、Cocos、Godot 的 2D 物理全部基于 Box2D。

<div class="tip-box">
<strong>核心直觉：</strong> 物理引擎解决的不是"碰没碰到"（那是碰撞检测），而是<strong>"碰到以后怎么办"</strong>（那是碰撞响应）。前者简单，后者才是物理引擎存在的理由。
</div>

## ⚖️ 手写碰撞 vs 物理引擎：选型决策

每当你考虑引入一个重量级系统时，先问自己一个问题：**我真的需要它吗？**

<table>
<thead><tr><th>场景</th><th>推荐方案</th><th>理由</th></tr></thead>
<tbody>
<tr><td>子弹碰到敌机 → 双方销毁</td><td>手写 AABB</td><td>没有物理反馈，只是"碰撞→移除"</td></tr>
<tr><td>道具掉到地上 → 弹一下停住</td><td>手写 AABB + 简单速度衰减</td><td>一个 tween 就能模拟的"假物理"</td></tr>
<tr><td>角色跳跃/落地/推箱子/堆叠物体</td><td><strong>Box2D 物理引擎</strong></td><td>重力+弹力+摩擦+堆叠——手写会疯</td></tr>
<tr><td>破碎的碎片飞出去、撞墙反弹、渐渐停止</td><td><strong>Box2D 物理引擎</strong></td><td>碎片数量多、每个都需要独立的碰撞响应</td></tr>
</tbody>
</table>

飞机大战应该用手写碰撞还是物理引擎？答案是**手写碰撞**。因为你的子弹不需要重力，敌机不需要弹性碰撞，所有交互都是"碰到→销毁"。没必要引入 Box2D 的复杂度。但你接下来做的下一个游戏——平台跳跃、弹球、愤怒小鸟类型——物理引擎就是必需品。

## ⚙️ RigidBody2D 三种类型：静态、动态、运动学

Box2D 把世界里的物体分成三种角色。理解这三种类型是使用物理引擎的第一步——选错了类型，你的物体会出现各种诡异行为（穿墙、抖动、飘走）。

<table>
<thead><tr><th>类型</th><th>受力？</th><th>能动？</th><th>典型场景</th><th>前端类比</th></tr></thead>
<tbody>
<tr><td><strong>Static</strong></td><td>否</td><td>否（永不移动）</td><td>地面、墙壁、天花板</td><td><code>position: static</code>——固定在文档流里，不受其他元素影响</td></tr>
<tr><td><strong>Dynamic</strong></td><td>是</td><td>是（物理驱动）</td><td>角色、道具、碎片</td><td>没有直接类比——它是"物理系统自动计算位置"的元素</td></tr>
<tr><td><strong>Kinematic</strong></td><td>否</td><td>是（代码驱动）</td><td>移动平台、电梯、传送带</td><td><code>position: absolute</code>——你手动控制它的位置，但它参与碰撞检测</td></tr>
</tbody>
</table>

这里有一个容易混淆的点：**Static 和 Kinematic 都能挡住 Dynamic 物体**，但它们的关键区别在于"谁能移动"：Static 永远不动（代码也不能移动它），Kinematic 你用代码控制它动（比如在 update 里平移）。如果你需要一个会移动的平台来运送箱子，你必须用 Kinematic——Static 移不动。

<div class="tip-box">
<strong>前端类比：</strong> Static / Dynamic / Kinematic 三种物理体类型，和前端的 <code>position: static / relative / absolute</code> 在概念上异曲同工——都是在说"这个元素在定位系统中处于什么角色"。但物理引擎的角色还决定了"谁可以碰谁、谁会推动谁"。
</div>

## 🎯 碰撞检测 vs 碰撞响应：物理引擎的流水线

物理引擎每一帧做两件事，顺序很重要：

<pre>1. 碰撞检测（Collision Detection）
   → 遍历所有碰撞体，找出哪些物体对正在接触
   → 对每一对接触：刚刚接触？持续接触？结束接触？

2. 碰撞响应（Collision Resolution）
   → 基于物体的速度、质量、弹性系数
   → 计算碰撞后各自的速度、角速度和位置修正
   → 保证物体不穿模（penetration resolution）</pre>

碰撞回调就对应这三个阶段——**和 DOM 事件冒泡非常像**：

<table>
<thead><tr><th>物理回调</th><th>含义</th><th>DOM 类比</th></tr></thead>
<tbody>
<tr><td><code>onBeginContact</code></td><td>两个物体刚碰到</td><td><code>mousedown</code>——交互开始</td></tr>
<tr><td><code>onPreSolve</code></td><td>碰到之后、响应之前（可以修改物理参数）</td><td><code>event.preventDefault()</code>——在默认行为之前拦截</td></tr>
<tr><td><code>onPostSolve</code></td><td>碰撞响应已完成</td><td><code>mouseup</code>——交互结束，结果已定</td></tr>
<tr><td><code>onEndContact</code></td><td>两个物体分开了</td><td><code>mouseleave</code>——离开交互区域</td></tr>
</tbody>
</table>

这四阶段回调就是物理引擎的"事件监听系统"。你需要知道在哪个阶段做对应的事——比如在 `onBeginContact` 里扣血，在 `onPostSolve` 里根据碰撞力度播放不同的音效。这和做前端时知道 `mousedown` 和 `click` 的区别是一个道理。

## 🔧 动手：给精灵添加物理属性

打开 Cocos Creator，找一个带 Sprite 的节点，跟着做：

1. **添加物理组件：** 选中节点 → 属性检查器 → 添加组件 → 2D Physics → RigidBody2D + BoxCollider2D。把 RigidBody2D 的 Type 设为 `Dynamic`。
2. **配置重力：** 项目设置 → 物理 → Gravity，Y 设置为 `-1000`。点击运行，你的精灵会开始往下掉。
3. **调整物理属性：** 把 RigidBody2D 的 `Linear Damping` 设为 0.3（模拟空气阻力——精灵不会无限加速），`Angular Damping` 设为 0.5（旋转也会慢下来）。
4. **测试弹性系数：** 把 `Restitution` 分别试 0.1（铅球落地——几乎不弹）、0.6（弹几下停住）、0.9（乒乓球——弹很久）、1.0（完全弹性——永动机，物理上不真实但在游戏里有用）。`Friction` 从 0.2 到 1.0，感受滑动的阻力变化。
5. **用代码施加力：** 在脚本里 `rigidBody.applyForceToCenter(new Vec2(500, 0), true)` 给精灵一个瞬时推力，像愤怒的小鸟一样弹射出去。再试试 `applyLinearImpulse`——力和冲量的区别是什么？力是持续的（如火箭推力），冲量是瞬时的（如撞击）。
6. **监听碰撞事件：** 在脚本的 `onLoad` 中，用 `collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)` 注册回调。当两个物体碰撞时，你可以把接触点信息（接触法向、碰撞力度）打印到控制台。

这个小 demo 花 30 分钟做完，你就会对 RigidBody2D 的参数有直观感受——比读文档有效得多。记住：**物理参数的调整靠"手感"，不是靠"读懂"。**

## 🧮 物理引擎的数学基础（了解即可）

不需要你实现，但知道 Box2D 内部在做什么，对调参数和 Debug 很有帮助：

- **Verlet 积分：** 物理引擎每帧计算物体的新位置，用的是 Verlet 积分法（而不是欧拉法）。简单来说，欧拉法用当前速度推算下一帧位置（容易漂移），Verlet 法用上一帧和当前帧的位置差来推算（更稳定）。这就是为什么 Box2D 对堆叠物体的处理特别好——Verlet 积分天然有"位置守恒"的特性。
- **SAP 宽相算法（Sweep and Prune）：** 当场景里有 500 个碰撞体时，引擎不会让每一个和另外 499 个做碰撞检测（O(n²) 太慢）。它先用 SAP 算法按 X 轴排序，只对 X 轴有重叠的物体对做精细检测——先把"可能碰撞"的候选对筛出来。
- **GJK + EPA 窄相算法：** 对每个候选对，GJK（Gilbert-Johnson-Keerthi）算法判断两个形状是否真的相交，EPA（Expanding Polytope Algorithm）计算穿透深度和分离方向。这些算法不需要你懂细节，但你要知道引擎并没有"看"到你画的形状——它看到的是抽象的几何关系。

## 🔗 课外延伸

不要求掌握，但如果你感兴趣，这些都是值得了解的故事：

- **Erin Catto 的三件套：** Box2D 的作者 Erin Catto 有"三件套"——Box2D（开源 2D 物理引擎）、他的 GDC 物理演讲（2004 年至今，每年一场，所有 PDF 都在 box2d.org 免费下载）、以及他的 Blizzard 工作经历。去读他 2006 年的 GDC 演讲《Box2D: A 2D Physics Engine for Games》——你会看到一个工程师用怎样的匠心打磨一个库。他甚至在演讲里公开了 Box2D 的已知 bug 和后续修复计划，这种透明度在游戏行业非常罕见。
- **PhysX vs Box2D: 两种世界观：** NVIDIA 的 PhysX 是 3D 物理引擎的代表，它和 Box2D 代表了物理引擎领域的两个方向——PhysX 追求"好莱坞级别"的视觉效果（衣料、流体、粒子物理），Box2D 追求"精准可预测"的 2D 游戏物理。如果你做 3A 大作，选 PhysX；如果你做 2D 独立游戏，选 Box2D。Cocos Creator 3.x 同时内置了两者（2D 用 Box2D，3D 用 PhysX）。
- **《愤怒的小鸟》——物理引擎驱动的现象级游戏：** 2009 年，Rovio 的《愤怒的小鸟》用 Box2D 驱动了所有核心玩法——抛物线弹射、积木倒塌、连锁反应。这个游戏证明了"基于物理引擎的玩法"本身就可以成为一种类型。你玩怒鸟时感受到的"差一点就过了"，正是物理引擎提供的微妙随机性——完全相同的搭建，每局的结果可能不同，因为物理计算涉及浮点精度和碰撞顺序。

## ✅ 自测清单

学完这一节，你应该能回答这些问题：

1. 一个 2D 横板跳跃游戏，角色需要在平台上跳来跳去，敌人碰到角色就扣血，地图上有可以推开的箱子和需要反弹跳上去的弹力板。这里哪些部分适合用物理引擎（给出具体 RigidBody 类型），哪些只需要手写碰撞？为什么？
2. 你把一个 RigidBody2D 设为 Static 和 Kinematic，它都能挡住 Dynamic 物体。但什么场景下必须用 Kinematic 而不是 Static？在 Cocos 里，如果你强行在代码中修改 Static 物体的位置，会发生什么？
3. 你做了一个弹球游戏，但玩家反馈"球弹起来不够爽，感觉像在面团上弹"。从 Restitution（弹性系数）和 Linear Damping（线性阻尼）两个参数的角度分析，你应该怎么调才能让球"弹得干脆、反馈清晰"？如果弹得太久不停下来，你又该加什么参数？
4. 物理引擎的四个碰撞回调（BeginContact → PreSolve → PostSolve → EndContact）对应不同的阶段。假设你要做一个"子弹穿墙"功能——子弹碰到墙时不反弹、不停留，直接穿透，但穿透的那一帧要播放火花特效。你应该在哪个回调里判断"这是墙，放火花特效，然后让子弹穿过去"？
