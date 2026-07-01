---
phase: 12
title: 敌机系统与行为设计
duration: 2-3 天
---

## 🧭 本节定位

Pac-Man 的四个幽灵——**Blinky 追你、Pinky 堵你、Inky 随机跑、Clyde 装傻**。1980 年的游戏，4 个敌人，4 种 AI 行为，只有不到 1KB 的代码。它不需要讲一个宏大的背景故事；你只需要看 30 秒，就能从幽灵的颜色辨别谁在追你。这就是敌机设计的最高境界：**用简单的规则创造出丰富的战术变化**。这一节我们来实现这种"简单规则，复杂行为"的敌机系统。

## 👻 Pac-Man 的遗产：四个幽灵，四种性格

Pac-Man（吃豆人）之所以 45 年来仍然被奉为游戏设计教科书，很大程度上是因为它的幽灵 AI。每一个幽灵有自己的行为模式，而且这些模式不靠随机数——靠**确定性规则**，这给了玩家可预测、可学习的对手：

<table>
<thead><tr><th>幽灵</th><th>颜色</th><th>行为规则</th><th>给玩家带来的战术挑战</th></tr></thead>
<tbody>
<tr><td><strong>Blinky</strong></td><td>红色</td><td>直接追 Pac-Man 当前位置</td><td>直线追击——你跑得快就安全</td></tr>
<tr><td><strong>Pinky</strong></td><td>粉色</td><td>追 Pac-Man 前方 4 格（堵截）</td><td>预判你的路线——向前跑会被堵</td></tr>
<tr><td><strong>Inky</strong></td><td>青色</td><td>以 Blinky 位置为对称中心</td><td>不可预测——行为取决于另一个幽灵</td></tr>
<tr><td><strong>Clyde</strong></td><td>橙色</td><td>离远时追你，离近时逃跑</td><td>时近时远——打破你的节奏</td></tr>
</tbody>
</table>

注意到了吗？**没有一个幽灵是"随机"的**。每个幽灵的行为都有确定的数学规则，但四个规则叠加在一起，产生了看似混沌的追逐体验——这就是"涌现复杂度"（Emergent Complexity）。Pac-Man 的幽灵 AI 只用了不到 100 行汇编代码，但它创造的战术深度至今没有多少游戏能超越。

## 👾 敌机类型设计：从数据出发

扩展到射击游戏，敌机设计的第一原则同样是：**让玩家能"学会"每一种敌机**。敌机的视觉特征要和它的行为绑定——看到大的就知道它难打，看到正弦波飞行的就知道它下一步会摆到左边：

<table>
<thead><tr><th>类型</th><th>大小</th><th>血量</th><th>速度</th><th>分值</th><th>行为特征</th></tr></thead>
<tbody>
<tr><td>小型</td><td>16×16</td><td>1</td><td>快</td><td>100</td><td>直线下降，数量多——考验瞄准</td></tr>
<tr><td>中型</td><td>24×24</td><td>3</td><td>中</td><td>300</td><td>正弦波摆动，偶尔射击——考验走位</td></tr>
<tr><td>大型</td><td>32×32</td><td>8</td><td>慢</td><td>800</td><td>追踪玩家，间歇射击——考验拉扯</td></tr>
<tr><td>Boss</td><td>48×48</td><td>50+</td><td>慢</td><td>5000</td><td>多阶段攻击模式——考验综合实力</td></tr>
</tbody>
</table>

## 〰️ 移动轨迹：游戏世界的 CSS Keyframes

如果你写过 CSS 动画，你对 `@keyframes` 一定不陌生——定义一组关键帧，浏览器帮你自动插值。敌机移动本质上就是定义一条**路径**，然后让引擎每帧沿路径推进：

<div class="tip-box">
<strong>前端类比：</strong> <code>movePattern = 'sine'</code> ≈ <code>animation: sine-move 3s infinite</code>。就像你在 CSS 里定义 <code>@keyframes</code> 预设动画路径一样，敌机的 <code>moveType</code> 参数就是在预设移动轨迹。改变 <code>moveType</code> 就像切换 CSS animation-name——行为完全变，但代码框架不动。
</div>

<pre>// 直线下降 → CSS: transform: translateY(speed * duration)
pos.y -= speed * dt

// 正弦波摆动 → CSS: @keyframes { 0% { left: 0 } 50% { left: amplitude } 100% { left: 0 } }
pos.y -= speed * dt
pos.x = startX + Math.sin(elapsed * frequency) * amplitude

// 追踪玩家 → 没有纯 CSS 等价物，需要 JS 每帧动态计算
const dir = playerPos.subtract(pos).normalize()
pos.add(dir.multiplyScalar(speed * dt))

// 贝塞尔曲线运动 → CSS: transition: transform cubic-bezier(.17,.67,.83,.67)
const t = elapsed / totalDuration
pos = bezier(t, startPoint, control1, control2, endPoint)</pre>

## 🏭 敌机生成器：Vue 动态组件的游戏版本

在一个关卡中，不同波次需要生成不同的敌机组合——有时是 10 只小型机直线冲锋，有时是 3 只中型机正弦波扫射，有时是 Boss 登场。这就像你在 Vue 里用 `<component :is="currentEnemyType">` 动态切换组件一样，敌机生成器（Spawner）就是游戏的"动态组件加载器"：

<div class="tip-box">
<strong>前端类比：</strong> <code>EnemySpawner</code> ≈ Vue 的 <code>&lt;component :is="..."&gt;</code> 动态组件。Spawner 不关心具体生成什么类型的敌机——它只是根据配置（相当于 props）从对象池中取出节点，设置对应的 moveType 和行为参数，然后放到场景中。这和 Vue Router 根据路由动态加载不同的页面组件是同一个模式。
</div>

## 🔧 动手：实现三种敌机行为

新建一个 `Enemy.ts` 脚本，实现三种敌机类型。每种类型用同一个组件，靠配置参数区分行为：

**1. 小型敌机——直线下降，数量取胜**

<pre>// Enemy.ts
@ccclass('Enemy')
export class Enemy extends Component {
  @property hp: number = 1
  @property speed: number = 200
  @property moveType: string = 'straight'  // 'straight' | 'sine' | 'chase'
  @property scoreValue: number = 100

  private startX: number = 0
  private elapsed: number = 0
  private player: Node | null = null

  onLoad() {
    this.startX = this.node.position.x
    this.player = find('Player')
  }

  update(dt: number) {
    this.elapsed += dt
    const pos = this.node.position.clone()

    switch (this.moveType) {
      case 'straight':
        pos.y -= this.speed * dt
        break

      case 'sine': {
        // 正弦波摆动——左右摇摆着往下飞
        pos.y -= this.speed * dt
        const frequency = 3        // 摆动频率（越大越快）
        const amplitude = 100      // 摆动幅度（像素）
        pos.x = this.startX + Math.sin(this.elapsed * frequency) * amplitude
        break
      }

      case 'chase':
        if (this.player?.isValid) {
          // 追踪玩家——飞向玩家所在位置
          const dir = this.player.position.clone().subtract(pos).normalize()
          pos.x += dir.x * this.speed * dt
          pos.y += dir.y * this.speed * dt  // 注意追踪可能会往上飞！
        }
        break
    }

    this.node.setPosition(pos)

    // 出屏检测（下方或上下左右出屏就回收）
    if (pos.y &lt; -600 || pos.y > 800) {
      this.recycle()
    }
  }

  takeDamage(dmg: number) {
    this.hp -= dmg
    if (this.hp &lt;= 0) {
      eventBus.emit('enemy-killed', { type: this.moveType, score: this.scoreValue })
      this.recycle()
    }
  }

  private recycle() {
    // 归还对象池（Phase 15 会细讲）
    EnemyPool.instance.put(this.node)
  }
}</pre>

**2. Boss 敌机——多阶段行为**

<pre>// 给 Boss 加一个简单的阶段切换
@ccclass('BossEnemy')
export class BossEnemy extends Enemy {
  @property maxHp: number = 50
  private phase: number = 1

  takeDamage(dmg: number) {
    super.takeDamage(dmg)
    const ratio = this.hp / this.maxHp

    // 血量低于 50% 进入二阶段：变快 + 开始扇形射击
    if (ratio &lt; 0.5 && this.phase === 1) {
      this.phase = 2
      this.speed *= 1.5
      this.startShooting('spread')  // 开始用扇形弹攻击玩家
    }
    // 血量低于 20% 进入三阶段：更快 + 追踪弹
    if (ratio &lt; 0.2 && this.phase === 2) {
      this.phase = 3
      this.speed *= 1.3
      this.startShooting('homing')
    }
  }
}</pre>

**3. 敌机生成器（Spawn Timer）**

<pre>// EnemySpawner.ts —— 挂在一个空节点上
@ccclass('EnemySpawner')
export class EnemySpawner extends Component {
  @property spawnInterval: number = 1.5   // 每隔 1.5 秒生成一波

  private timer: number = 0

  update(dt: number) {
    this.timer += dt
    if (this.timer >= this.spawnInterval) {
      this.timer = 0
      this.spawnWave()
    }
  }

  private spawnWave() {
    // 随机选一种敌机类型生成
    const types = ['straight', 'sine', 'chase']
    const type = types[Math.floor(Math.random() * types.length)]
    const enemy = EnemyPool.instance.get()
    const comp = enemy.getComponent(Enemy)
    comp.moveType = type
    comp.hp = type === 'straight' ? 1 : type === 'sine' ? 3 : 5
    comp.speed = type === 'straight' ? 250 : type === 'sine' ? 180 : 120
    // 随机水平位置生成
    enemy.setPosition(Math.random() * 500 - 250, 600, 0)
  }
}</pre>

**验证：** 把三个配置不同的 Enemy 预制体拖进场景，观察它们的移动轨迹是否和预期一致。Boss 的搜索你先把血量调成 10 测试阶段切换。

## 🧠 有限状态机：为什么敌机 AI 需要一个「大脑」

上面 Boss 的阶段切换是最简单的 FSM（Finite State Machine）。但如果你用 if/else 在 update 里实现——

<pre>// ❌ 一坨 if/else 的 Boss AI——读得懂，改不了
update(dt) {
  if (this.hp > maxHp * 0.5) {
    if (this.shotTimer > 2) { this.shoot('single'); this.shotTimer = 0 }
    this.moveStraight(dt)
  } else if (this.hp > maxHp * 0.2) {
    if (this.shotTimer > 1.2) { this.shoot('spread'); this.shotTimer = 0 }
    this.moveSine(dt)
  } else {
    if (this.shotTimer > 0.8) { this.shoot('homing'); this.shotTimer = 0 }
    this.moveChase(dt)
  }
}</pre>

看起来还行？等到 Boss 有 8 个状态、每个状态有多种子行为、状态之间还有过渡动画——那团 if/else 会让你痛不欲生。FSM 的本质是把"在什么状态下做什么事"和"状态之间怎么切换"分开。

<div class="tip-box">
<strong>前端类比：</strong> FSM ≈ Pinia 状态管理。就像你在 Pinia 里定义 <code>state</code>（当前状态）、<code>actions</code>（状态切换）、<code>getters</code>（基于状态的计算属性），FSM 定义了 <code>currentState</code>（敌机当前在干什么）、<code>transition()</code>（什么条件触发切换）、<code>enter/exit</code>（进/出状态时的操作）。你在 Vue 里不会在模板里写 800 行 if/else 来判断"当前页面应该显示什么"——你会用 Router。FSM 就是敌机的 Router。
</div>

## 🔗 课外延伸

- **Pac-Man 幽灵 AI 的"涌现复杂度"哲学：** 游戏设计师岩谷彻（Toru Iwatani）在设计 Pac-Man 时面临一个限制——1980 年的 Namco 街机版只有 16KB ROM。他不能写复杂的 AI，于是他想了一个办法：给四个幽灵每人一个"简单的追逐规则"，让玩家的大脑去"建构"这些幽灵的性格。结果出乎所有人意料——玩家真的给幽灵起了名字（最初没有名字，是玩家叫出来的），真的相信每个幽灵有自己的性格。这就是游戏 AI 设计的最高智慧：不是写出聪明的 AI，而是创造出**让玩家觉得 AI 聪明**的简单规则。
- **《黑暗之魂》的敌怪放置：不是随机的，是"雕刻的"：** FromSoftware 的关卡设计师宫崎英高有一个著名的工作方法：他亲自走到游戏引擎中，在一个拐角处放一个敌人，然后测试——死了。调整位置，再测试——还是死了，但这次差一点就躲开了。再调——"对，就是这个位置"。黑魂的敌人位置不是随机分布的，是一个一个"雕刻"出来的。每一个敌人的出现位置、朝向、警觉距离，都是为了让玩家"刚好在极限上"。这和射击游戏的敌机生成是同一个道理：敌人在哪出现、什么时机出现、以什么轨迹出现，决定了玩家的情绪曲线。
- **音乐游戏的"音符谱面"：敌机生成的另一个维度：** 在 Beatmania、Guitar Hero、太鼓达人等音乐游戏中，音符不是随机落下的——每一首歌的谱面是设计师**手工编排**的。好的谱面让按键和音乐融为一体；坏的谱面让人按对了也觉得别扭。这和你的敌机生成系统本质相同：敌机的出现时机、类型组合、轨迹变化，应该像一首歌的编曲——有前奏、有高潮、有留白。当你设计波次时（Phase 13 会展开），试着闭上眼睛听一遍波次的"节奏"——如果它听起来像一首没有副歌的歌，那就需要重写。

## ✅ 自测清单

学完这一节，你应该能回答：

1. Pac-Man 的四个幽灵用了什么设计技巧，让玩家觉得它们"有性格"，而实际上它们的行为都是确定性规则？这和你的敌机系统设计有什么共通之处？
2. CSS `@keyframes` 动画和敌机移动轨迹在概念上有什么相似之处？为什么游戏里不能用纯 CSS 来做敌机移动（哪怕游戏跑在浏览器里）？——提示：从"确定性路径"和"动态响应"的角度思考。
3. 什么时候用简单的直线/正弦运动就够了，什么时候需要贝塞尔曲线或追踪逻辑？从游戏节奏和小怪 vs Boss 的区分来分析。
4. 有限状态机（FSM）对敌机 AI 有什么帮助？以 Vue Router 或 Pinia 为参照，解释为什么 FSM 是管理"状态+行为"组合的最佳方式。
