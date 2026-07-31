---
phase: 13
title: 波次系统
duration: 1-2 天
---

## 🧭 本节定位

1978 年，《太空侵略者》（Space Invaders）上市。玩家打完一波外星人，一波又来了——**而且更快**。没有过场动画，没有"新敌人登场"的提示，只有一个冷酷的事实：你还活着，那就再来一波，比你刚经历的那波更难。这个简单的"打波"设计，47 年后仍然是射击游戏的核心骨架。这一节我们要做的，就是把这种"一波接一波"的节奏感，用**数据驱动**的方式做成一个系统。

## 👾 Space Invaders 发明了什么？不只是波次

《太空侵略者》经常被作为"第一款卷轴射击游戏"载入史册，但它对游戏设计最大的贡献是一个更微妙的东西：**难度递增不是靠数据，是靠游戏机制本身**。

在 Space Invaders 里，没有"敌人变快了""敌人血量增加了"这些数值调整——所有敌人永远一枪死。那难度是怎么递增的？**每一波剩下的敌人越少，它们移动得越快**。前 90% 的敌人慢吞吞，最后一只外星光是在屏幕底部疯狂横移——你越接近胜利，越容易失败。

这种"用机制本身制造紧张，而不是靠数值膨胀"的设计，是波次系统的最高智慧。你的波次系统也应该追求这个：**每一波给玩家一种新的问题，而不是同样的问题乘以更大的数字**。

## 📊 数据驱动：把波次配成 JSON——和 webpack config 一样的哲学

假设你是策划。你写好了 5 波敌人的逻辑，交给程序员。程序员把它硬编码在 TypeScript 里。过两天你想微调：第 3 波少 3 只小兵，第 5 波间隔从 1.5 秒改成 1.8 秒——每次都要找程序员改代码、重新编译、重新发版。这不是开发效率问题，是**迭代效率问题**。

就像 webpack.config.js 或 vite.config.ts 一样——把配置从代码中分离出来，让非程序员也能调参：

<div class="tip-box">
<strong>前端类比一：</strong> 波次 JSON ≈ <strong>webpack.config / vite.config</strong>。Webpack 的核心逻辑在 node_modules 里，你的配置只描述了"入口在哪、用什么 loader、输出到哪"——同样的分离在波次系统里：<strong>生成逻辑在 WaveManager 里，波次参数在 JSON 里</strong>。策划改 JSON = 改游戏，就像你改 vite.config = 改构建行为——不需要重新编译核心逻辑，不需要程序员介入。
</div>

<pre>const WAVES = [
  { wave: 1, enemies: [
    { type: 'small', count: 5, interval: 1.5 }
  ], restTime: 3 },
  { wave: 2, enemies: [
    { type: 'small', count: 8, interval: 1.2 },
    { type: 'medium', count: 2, interval: 2.0 }
  ], restTime: 4 },
  { wave: 3, enemies: [  // Boss 关
    { type: 'boss', count: 1, interval: 0 }
  ], restTime: 8 }
]  // 说明：wave 字段当前用于展示/标识；实际调度以数组下标为准</pre>

数据驱动的最大好处：**调难度不需要改代码**。策划改一个 JSON 文件就能调整波次参数，程序员不需要参与。

## 🎵 波次节奏：高潮与呼吸——和 Vue Router 导航守卫一样的设计

好的波次设计像音乐——有前奏、有高潮、有间奏。不要每波都是匀速变难。一个常见的节奏模型：

<pre>Wave 1-2：热身（敌机少而慢）
Wave 3：第一次增压（加入中型敌机）
Wave 4：喘息（稍微降低密度）
Wave 5：Boss 关（完全不同的节奏）
Wave 6-7：恢复后再次增压
...</pre>

这种"在波次之间做决策"的逻辑，天然需要一个守卫机制：

<div class="tip-box">
<strong>前端类比二：</strong> 波次过渡 ≈ <strong>Vue Router 的 Navigation Guards</strong>。就像 <code>beforeEach</code> 守卫在路由切换前可以做检测和拦截（"当前任务没完成，不能跳到下一波"），波次系统的 <code>isResting</code> 状态就是一个守卫——它确保上一波所有敌机被清完了、休息时间够长了，才能进入下一波。如果玩家在休息时间结束前就击杀了所有敌人？守卫拦截，继续休息。
</div>

## 📈 难度曲线：心流理论的数学表达

波次系统的灵魂是难度曲线。四种经典的曲线，每种代表一种设计哲学：

<table>
<thead><tr><th>曲线类型</th><th>形状</th><th>玩家体验</th><th>适合场景</th></tr></thead>
<tbody>
<tr><td><strong>线性</strong></td><td>每波 +10% 难度</td><td>稳定变难，可预测</td><td>无限模式、街机游戏</td></tr>
<tr><td><strong>指数</strong></td><td>后期急剧变难</td><td>前期轻松→后期爆炸</td><td>Roguelike、生存模式</td></tr>
<tr><td><strong>S 曲线</strong></td><td>平→陡→平</td><td>入门→加速→天花板</td><td>有限关卡（10-20 关）</td></tr>
<tr><td><strong>阶梯</strong></td><td>Boss 关突增，普通关回落</td><td>紧张→放松→更紧张</td><td>Boss Rush、章节制</td></tr>
</tbody>
</table>

1975 年，心理学家 Mihaly Csikszentmihalyi（奇克森米哈伊）提出了**心流（Flow）理论**：当挑战难度和你的能力刚好匹配时，人会进入一种忘记时间、完全沉浸在所做的事情中的状态。挑战太低→无聊。挑战太高→焦虑。刚好在你的能力边界上→心流。好的波次系统本质上就是在做这件事：**让每一波都刚好在玩家的能力边界上，维持"差一点就死了但就是没死"的紧张感**。这就是为什么你玩《只狼》时明明死了一百次，却觉得"不是游戏难，是我还不够好"——因为它每次都在心流区间里。

## 🔧 动手：把波次数据提取到 JSON 并实现加载器

把波次数据从代码里抽出来放到一个 JSON 文件，然后写一个 WaveManager 来读它。整个过程分三步：

**第 1 步：创建 `assets/resources/waves.json`**

<pre>[
  {
    "wave": 1,
    "description": "热身——5 只小兵，间隔宽裕",
    "enemies": [
      { "type": "small", "count": 5, "interval": 1.5 }
    ],
    "restTime": 4
  },
  {
    "wave": 2,
    "description": "加强——8 小兵 + 2 中兵",
    "enemies": [
      { "type": "small", "count": 8, "interval": 1.2 },
      { "type": "medium", "count": 2, "interval": 2.0 }
    ],
    "restTime": 5
  },
  {
    "wave": 3,
    "description": "首次压力——10 小兵 + 3 中兵 + 1 大兵",
    "enemies": [
      { "type": "small", "count": 10, "interval": 1.0 },
      { "type": "medium", "count": 3, "interval": 1.8 },
      { "type": "large", "count": 1, "interval": 0 }
    ],
    "restTime": 6
  },
  {
    "wave": 4,
    "description": "喘息——稍微回调难度",
    "enemies": [
      { "type": "small", "count": 6, "interval": 1.3 },
      { "type": "medium", "count": 4, "interval": 1.5 }
    ],
    "restTime": 4
  },
  {
    "wave": 5,
    "description": "BOSS 关——一决胜负",
    "enemies": [
      { "type": "boss", "count": 1, "interval": 0 }
    ],
    "restTime": 10
  }
]</pre>

**第 2 步：创建 `WaveManager.ts` 加载 JSON 并逐波生成**

<pre>// WaveManager.ts
@ccclass('WaveManager')
export class WaveManager extends Component {
  private waves: WaveData[] = []
  private currentWave: number = 0
  private waveTimer: number = 0
  private spawnTimer: number = 0
  private enemiesInWave: { type: string; count: number; interval: number }[] = []
  private isResting: boolean = false

  onLoad() {
    // 从 resources 加载 JSON
    resources.load('waves', (err, asset) => {
      if (err) { console.error('加载波次数据失败:', err); return }
      this.waves = asset.json as WaveData[]
      this.startWave(0)  // 开始第一波
    })
  }

  startWave(index: number) {
    if (index >= this.waves.length) {
      console.log('所有波次完成！')
      return
    }
    this.currentWave = index
    this.enemiesInWave = [...this.waves[index].enemies]
    console.log(`开始第 ${index + 1} 波：${this.waves[index].description}`)
  }

  update(dt: number) {
    if (this.isResting) {
      this.waveTimer += dt
      if (this.waveTimer >= this.waves[this.currentWave].restTime) {
        this.isResting = false
        this.waveTimer = 0
        this.startWave(this.currentWave + 1)
      }
      return
    }

    if (this.enemiesInWave.length === 0) return

    this.spawnTimer += dt
    const current = this.enemiesInWave[0]

    if (this.spawnTimer >= current.interval && current.count > 0) {
      this.spawnTimer = 0
      this.spawnEnemy(current.type)
      current.count--
      if (current.count <= 0) {
        this.enemiesInWave.shift()  // 这个类型生成了，移除
        if (this.enemiesInWave.length === 0) {
          this.isResting = true  // 进入休息时间
        }
      }
    }
  }

  private spawnEnemy(type: string) {
    const enemy = EnemyPool.instance.get()
    const comp = enemy.getComponent(Enemy)
    // 根据 JSON 里的 type 字符串来配置敌机属性
    switch (type) {
      case 'small': comp.init({ hp: 1, speed: 250, moveType: 'straight' }); break
      case 'medium': comp.init({ hp: 3, speed: 180, moveType: 'sine' }); break
      case 'large': comp.init({ hp: 8, speed: 120, moveType: 'chase' }); break
      case 'boss': comp.init({ hp: 50, speed: 80, moveType: 'sine' }); break
    }
    enemy.setPosition(Math.random() * 400 - 200, 600, 0)
  }
}</pre>

**第 3 步：验证数据驱动**

改动 `waves.json` 文件，比如把第 3 波的 enemy count 从 10 改成 20，保存后直接运行游戏——不需要重新编译 TypeScript 代码，难度就翻倍了。这就是数据驱动的核心优势：**策划改 JSON = 改游戏，程序员不用介入。**

## 🔗 课外延伸

- **Mihaly Csikszentmihalyi 的心流理论与游戏难度设计：** 1975 年，芝加哥大学的心理学家 Csikszentmihalyi 在研究艺术家和运动员时发现，当一个人在做他"刚好能胜任但又需要全力以赴"的事情时，会进入一种极度专注、忘记时间流逝的状态——他称之为"心流"（Flow）。游戏设计师在 21 世纪初开始有意识地将心流理论应用到难度曲线设计中：让波次难度始终在玩家能力的 90%-110% 之间波动，既不让玩家无聊（太低），也不让玩家挫败（太高）。《半条命 2》的开篇关卡、《Celeste》的每一面、《哈迪斯》的房间难度——都是在"心流通道"上精心雕刻的。你的波次 JSON 本质上是一个心流通道的数学表达。
- **《黑暗之魂》的"平坦难度曲线"反例：** 大多数 RPG 使用很陡的难度曲线——第一只史莱姆两刀秒，最终 Boss 要打 20 分钟。但 FromSoftware 的魂系列用的是一条**几乎平坦的难度曲线**。第一个 Boss（不死院恶魔）和第一只精英怪差不多难，甚至比中期某些区域更难——不是因为数值，是因为那时候的你还不会玩。魂系列的"变简单"不是靠数值膨胀，是靠**你变强了**。这是一种逆天的设计哲学：不是让游戏越来越难，是让你对自己能力的感觉越来越好。相比之下，放置类游戏（Cookie Clicker、Adventure Capitalist）用的是纯粹的指数曲线——前期秒秒钟十倍增长，后期等一天只涨 1%。两种极端，没有对错，只有适合不同玩家。
- **三消游戏的"随机难度"——老虎机心理学在关卡设计中的应用：** King 公司（2012 年被 Activision 收购）的《Candy Crush Saga》有一个著名的设计：简单关和困难关交替出现，但困难关总是让你"差一两个步就过了"。这不是疏忽——是精确设计的。King 的数据团队发现，如果玩家连续失败 5 次，第 6 次在"只差一步就过"的时刻给一个付费道具的推送，转化率最高。这不是游戏设计，是行为心理学和 A/B 测试的结合。作为游戏开发者，你可以不同意这种做法，但你必须知道它的存在——因为你的波次系统同样可以操作"差一点就过"的体验。

## ✅ 自测清单

学完这一节，你应该能回答：

1. 为什么数据驱动（JSON 配置）比硬编码波次数据更好？从迭代效率（策划→程序员→编译→发版 vs 策划→改 JSON→运行）、团队分工、A/B 测试三个角度分析。
2. 心流理论如何指导你的难度曲线设计？假设你发现玩家在第 3 波大量流失（关闭游戏），从心流理论的角度，可能出了什么问题？你应该调整哪个参数？
3. 什么是一个"好"的难度曲线？如果你玩一个游戏，前 10 分钟都在秒杀一切，第 11 分钟突然死活过不去——问题出在哪里？应该怎么改？
4. 波次之间的"休息时间"为什么要单独配置？如果休息时间是固定的（比如永远是 3 秒），在 Boss 关之后和热身关之后，玩家的体验会有什么不同？
