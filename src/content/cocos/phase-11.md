---
phase: 11
title: 子弹系统与发射模式
duration: 1-2 天
---

## 🧭 本节定位

你玩过《雷电》吗？那满屏的子弹不光是要躲的——它们是一种**几何美学**。从单发到手枪到霰弹枪到追踪导弹，每一种发射模式背后都是一套数学，而每一套数学都在回答同一个问题：**如何在屏幕上创造"有美感的暴力"**。这一节教你设计一个与发射模式解耦的子弹系统。

## 🕹️ 一束光，一颗子弹——从《太空侵略者》的单发说起

1978 年，太东（Taito）的《太空侵略者》定义了射击游戏的原始形态：玩家只有一颗子弹在屏幕上。打出去，飞到屏幕顶部，消失了——你才能再发第二颗。这不是故意限制你，是当时的硬件只支持屏幕上同时存在**一颗玩家子弹**。

但就是这个"单发"限制，催生了射击游戏最核心的紧张感：**每一发都要命中，打偏了就要等它飞出屏幕才能打下一发**。当你面对一排越来越近的外星人、手中的唯一一发子弹正在慢悠悠往上飘——这就是游戏史上最早的"资源管理"体验。

40 多年过去了，今天的射击游戏屏幕上可以同时有上百发子弹。但每颗子弹要回答的问题还是一样的：从哪来？往哪去？飞多快？打到什么算命中？

## 🔄 子弹生命周期：和 DOM 元素惊人相似的命运

一颗子弹从"诞生"到"死亡"经历的七个阶段，和你熟悉的 DOM 元素生命周期几乎一一对应：

<table>
<thead><tr><th>子弹阶段</th><th>DOM 类比</th><th>发生了什么</th></tr></thead>
<tbody>
<tr><td>创建</td><td><code>document.createElement()</code></td><td>从对象池取出/实例化节点</td></tr>
<tr><td>初始化（Mount）</td><td><code>mounted()</code> 钩子</td><td>设置位置、方向、速度、伤害值</td></tr>
<tr><td>飞行（Update）</td><td>浏览器每帧重绘</td><td><code>position += direction * speed * dt</code></td></tr>
<tr><td>判定</td><td>事件监听 + 条件判断</td><td>碰撞检测 or 出屏检测</td></tr>
<tr><td>销毁（Unmount）</td><td><code>beforeUnmount()</code> 钩子</td><td>归还对象池 or destroy</td></tr>
</tbody>
</table>

理解这种"创建→挂载→更新→卸载"的循环至关重要。游戏引擎每秒要跑 60 次这个循环，每次循环可能有几十颗子弹同时处于不同阶段——这和 Vue 的组件生命周期在本质上共享同一套设计哲学。

<pre>// 一颗子弹的生命，用 Vue 生命周期来理解：
create()           // → beforeCreate / created
mount()            // → beforeMount / mounted
update(dt) 每帧    // → beforeUpdate / updated
destroy()          // → beforeUnmount / unmounted</pre>

## 🎯 发射模式：接口即契约

单发、双发、三发、扇形、追踪——如果每种发射模式都写在 PlayerController 里，你的 `shoot()` 方法很快会变成一大坨 if/else。解决之道和你写 Vue 组件时一样：**定义接口，注入实现**。

<pre>// 单发
bullets.push(new Bullet(pos, dir))

// 双发（并排两个子弹）
bullets.push(new Bullet(pos + offset, dir))
bullets.push(new Bullet(pos - offset, dir))

// 扇形（N 发，每发角度偏移）
for (let i = 0; i &lt; 5; i++) {
  const angle = -30 + i * 15  // -30° 到 +30° 均匀分布
  const dir = rotate(baseDir, angle)
  bullets.push(new Bullet(pos, dir))
}

// 追踪（方向每帧更新指向目标）
update(dt: number) {
  this.dir = this.target.position.subtract(this.node.position).normalize()
  this.node.position = this.node.position.add(this.dir.multiplyScalar(this.speed * dt))
}</pre>

## 🔧 解耦设计：别管发射什么，只管怎么发射

如果你写过 Vue，你一定用过 `<slot>`——父组件只管"这里有个槽位"，至于槽位里放什么内容，由使用者决定。FirePattern 接口就是子弹系统的"槽位"：

<div class="tip-box">
<strong>前端类比：</strong> <code>FirePattern</code> 接口 ≈ Vue 的 <code>&lt;slot&gt;</code>。子弹系统（父组件）只说"我需要一串子弹配置"，具体那串配置是单发还是扇形还是追踪，由实现了 FirePattern 的类（子组件内容）决定。当你想要第四种发射模式时，只需要新建一个实现类——不用改子弹系统的一行代码。这就是开放封闭原则（OCP），就是依赖倒置（DIP），就是 Vue 组件设计的第一原则。
</div>

<pre>interface FirePattern {
  getBullets(origin: Vec3, baseDir: Vec3): BulletConfig[]
}

class SingleShot implements FirePattern { /* 返回 1 发 */ }
class DoubleShot implements FirePattern { /* 返回 2 发 */ }
class SpreadShot implements FirePattern { /* 返回 N 发扇形 */ }

// 使用时：
this.currentPattern = this.powerUpActive ? new SpreadShot(5, 30) : new DoubleShot()</pre>

## 🔧 动手：实现三种发射模式

现在轮到你动手了。在你的 Cocos 项目中，新建一个 `FirePattern.ts` 文件，把下面三种发射模式实现出来，然后在玩家飞机的 update 里切换测试：

**1. 单发直射（SingleShot）**

<pre>// 最基础的发射模式——朝正前方射出一颗子弹
class SingleShot implements FirePattern {
  getBullets(origin: Vec3, baseDir: Vec3): BulletConfig[] {
    return [{ position: origin.clone(), direction: baseDir.clone(), speed: 500 }]
  }
}</pre>

**2. 扇形散射（SpreadShot）——传入子弹数量和总角度**

<pre>// 比如 new SpreadShot(5, 45) 会在前方 45° 范围内均匀射出 5 发
class SpreadShot implements FirePattern {
  constructor(private bulletCount: number, private totalAngle: number) {}

  getBullets(origin: Vec3, baseDir: Vec3): BulletConfig[] {
    const bullets: BulletConfig[] = []
    const startAngle = -this.totalAngle / 2
    const step = this.totalAngle / (this.bulletCount - 1)

    for (let i = 0; i &lt; this.bulletCount; i++) {
      const rad = (startAngle + i * step) * (Math.PI / 180)
      const dir = new Vec3(
        baseDir.x * Math.cos(rad) - baseDir.y * Math.sin(rad),
        baseDir.x * Math.sin(rad) + baseDir.y * Math.cos(rad),
        0
      )
      bullets.push({ position: origin.clone(), direction: dir.normalize(), speed: 400 })
    }
    return bullets
  }
}</pre>

**3. 追踪弹（HomingMissile）——每帧重新计算方向指向目标**

<pre>// 追踪弹的 getBullets 本身返回的是普通的单发，区别在 Bullet 的 update 里
class HomingMissile implements FirePattern {
  constructor(private target: Node) {}

  getBullets(origin: Vec3, baseDir: Vec3): BulletConfig[] {
    return [{
      position: origin.clone(),
      direction: baseDir.clone(), // 初始方向不重要，每帧会重新算
      speed: 200,
      // 标记为追踪弹，Bullet 脚本根据自己的 type 来决定 update 行为
      extra: { type: 'homing', target: this.target }
    }]
  }
}

// 在 Bullet 组件的 update 中：
if (this.config.extra?.type === 'homing') {
  const target = this.config.extra.target
  if (target.isValid) {
    this.dir = target.position.clone().subtract(this.node.position).normalize()
  }
}
this.node.position = this.node.position.add(this.dir.multiplyScalar(this.speed * dt))</pre>

**测试方法：** 在玩家飞机的脚本里加一个 `cyclePattern()` 方法，按 E 键在三种模式之间切换。进游戏后你能直观感受到：单发适合精确瞄准，扇形适合清小怪群，追踪弹适合打移动目标。

<pre>// PlayerController.ts 里加上
private patterns: FirePattern[] = [
  new SingleShot(),
  new SpreadShot(5, 45),
  new HomingMissile(this.findNearestEnemy())
]
private patternIndex = 0

onKeyDown(key: KeyCode) {
  if (key === KeyCode.KEY_E) {
    this.patternIndex = (this.patternIndex + 1) % this.patterns.length
    console.log('切换到发射模式:', this.patternIndex)
  }
  if (key === KeyCode.SPACE) {
    const configs = this.patterns[this.patternIndex].getBullets(this.node.position, Vec3.UP)
    for (const config of configs) {
      this.bulletPool.spawn(config)
    }
  }
}</pre>

## 🔗 课外延伸

不要求掌握，但如果你对"子弹"这个话题意犹未尽：

- **ZUN 和《东方 Project》——一个人创造的弹幕帝国：** 1997 年，一个叫太田顺也（ZUN）的日本大学生，用 C 语言独自开发了一款弹幕射击游戏《东方灵异传》。此后 25 年，他一个人包揽了编程、美术、音乐、关卡设计——推出了超过 25 款东方系列作品。东方的子弹排列不只是为了难，更是 ZUN 个人的一种**几何美学表达**：扇形弹、螺旋弹、交叉线阵、激光切割……每一张符卡都是一幅动态的图案。ZUN 在 2010 年的一次演讲中说："弹幕不是为了让玩家死，是为了让玩家在子弹的间隙里跳舞。"这句话定义了弹幕游戏的设计哲学。
- **CAVE 与弹幕游戏的黄金时代：** 1995 年到 2012 年间，日本公司 CAVE（《怒首领蜂》《虫姬》《死亡微笑》）将弹幕射击推向了极致。CAVE 的子弹设计师被称为"弹幕职人"——他们不写代码，而是用专属的弹幕编辑器调教每一发子弹的轨迹、速度、颜色和排列。CAVE 的游戏里，子弹的排列在美学上堪比烟花表演，而在数学上则是从贝塞尔曲线延伸到极坐标方程。2012 年 CAVE 退出街机市场时，整个游戏界都在惋惜"一个艺术形式的终结"。
- **对象池为什么对子弹系统至关重要：** 你的游戏一秒钟可能射出 30 发子弹，一发子弹存活 2 秒，峰值时屏幕上就有 60 个子弹节点。如果每发子弹都是 `instantiate()` 创建、`destroy()` 销毁，JS 引擎会在几秒内产生上千次 GC（垃圾回收）。每次 GC 触发都会暂停所有 JS 执行 10-50ms——画面就这么"卡"一下。Phase 15 会详细讲对象池怎么一劳永逸地解决这个问题。这就像你在 Vue 里用 `<KeepAlive>` 缓存组件而不是每次都重新 mount——同样的思想，不同的战场。

## ✅ 自测清单

学完这一节，你应该能回答：

1. 为什么子弹发射逻辑要和子弹本身解耦？以 Vue 组件设计（slot/props/动态组件）为参照，解释 FirePattern 接口的设计意图。当你想加第四种发射模式时，需要改动哪些现有代码？
2. 子弹生命周期和 DOM 元素（或 Vue 组件）生命周期的对应关系是什么？为什么游戏引擎需要特别关注"创建/销毁"环节的性能，而 Web 前端对此相对不那么敏感？
3. 圆形发射模式（一圈子弹同时向 360° 射出）要怎么实现？试着在脑子里写出 `getBullets` 的循环逻辑——别写代码，描述算法就行。
4. 为什么追踪弹的"追踪"逻辑要放在 Bullet 的 update 里，而不是放在 FirePattern.getBullets 里？如果把追踪逻辑也放进 getBullets，会出现什么问题？
