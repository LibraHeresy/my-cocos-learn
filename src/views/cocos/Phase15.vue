<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="15" title="游戏架构模式" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>想象一下：你的第一个游戏脚本。一个 Player 组件，200 行代码，管移动、射击、碰撞、分数、音效——能跑。老板说不错，加个 Boss。你说好。加个道具系统。你说好。加个 UI 分数条、暂停按钮、复活倒计时——现在这个 Player 脚本已经 800 行了，改一个地方崩三个地方，你不知道哪行代码在改分数，不知道哪个函数在控制音效。<strong>这就是架构的诞生。</strong> 当你只有一个脚本、100 行代码时，怎么组织都行。但当你有 20 个脚本、互相依赖、运行时出 Bug 不知道是谁改的状态——你就需要架构了。</p>
    </ConceptBlock>

    <ConceptBlock icon="🏗️" title="为什么一个 200 行的脚本会变成 800 行的噩梦？">
      <p>这不是一个假设问题。每一个做游戏的人——无论是独立开发者还是 3A 团队——都经历过"单文件膨胀→重构→变干净→再次膨胀"的循环。问题出在一个根本性的矛盾上：<strong>游戏逻辑天然是跨边界的</strong>。敌机被击杀 → 需要更新分数（UI）→ 需要通知波次管理器（逻辑）→ 需要播放击杀特效（视觉）→ 可能需要掉落道具（数据）。如果这些事情全部写在 Enemy.ts 的 takeDamage 方法里，Enemy.ts 就会"知道"游戏里的一切。</p>
      <p>这和前端项目里"一个 Vue 组件 2000 行 template + script + style"是同一个问题。解决之道也是一样的：<strong>分模块、定接口、用事件解耦</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="🎛️" title="Manager 单例模式——你的 Pinia Store">
      <p>GameManager、AudioManager、ScoreManager——为什么游戏里到处都是 Manager？因为有些东西<strong>全局只需要一份</strong>：游戏分数、当前关卡、音量设置。单例 Manager 把这些全局状态集中到一个地方，避免了"20 个脚本各自维护一份 currentScore"的混乱。</p>
      <pre>@ccclass('GameManager')
export class GameManager extends Component {
  private static _instance: GameManager | null = null
  static get instance(): GameManager { return this._instance! }

  onLoad() {
    if (GameManager._instance) { this.node.destroy(); return }
    GameManager._instance = this
    director.addPersistRootNode(this.node)  // 跨场景不销毁
  }

  score: number = 0
  addScore(p: number) { this.score += p; eventBus.emit('score-changed', this.score) }
}</pre>
      <p>和 Vuex/Pinia store 的相似性：集中管理全局状态，其他模块通过接口访问，不直接改数据。</p>
      <div class="tip-box">
        <strong>单例的陷阱：</strong> 就像 Pinia store 太多会导致"全局状态地狱"，Manager 太多也会让你的游戏变成一锅意大利面——每个 Manager 依赖其他三个 Manager，形成循环依赖。一个有用的检查标准：如果你需要给 Manager 编号（Manager1, Manager2, …, Manager15），你就已经走远了。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="♻️" title="对象池（Object Pool）——你的 Vue KeepAlive">
      <p>前面 Phase 11 提到过子弹需要频繁创建销毁。但问题是：<strong>创建和销毁在 JS 里产生 GC 压力</strong>。GC 触发时会暂停所有 JS 执行——游戏画面"顿"一下。</p>
      <p>对象池预创建一批对象，用完回收而不是销毁：</p>
      <pre>class BulletPool {
  private pool: Node[] = []
  get(): Node { return this.pool.pop() || instantiate(this.prefab) }
  put(node: Node) { node.removeFromParent(); this.pool.push(node) }
}</pre>
      <p>Vue 类比：<code>&lt;KeepAlive&gt;</code> 组件——不销毁，只是缓存起来下次复用。想象如果 Vue Router 每次路由切换都 destroy 旧组件再 new 新组件：每个页面切换都会触发一次完整的组件生命周期销毁+重建。KeepAlive 就是 Vue 的对象池。</p>
    </ConceptBlock>

    <ConceptBlock icon="📡" title="事件总线（Event Bus）——你的 mitt / Vue $emit">
      <p>敌机被击杀时，需要通知：ScoreManager（加分）、WaveManager（检查是否该下一波）、UIManager（更新击杀特效）。如果每个 Manager 都直接调用其他 Manager 的方法，它们就<strong>互相耦合</strong>了。</p>
      <p>事件总线解耦：</p>
      <pre>// Enemy.ts
eventBus.emit('enemy-killed', { type: this.type, pos: this.node.position })

// ScoreManager.ts
eventBus.on('enemy-killed', (data) => this.addScore(SCORE_TABLE[data.type]))

// UIManager.ts
eventBus.on('enemy-killed', (data) => this.showKillEffect(data.pos))</pre>
      <p>Enemy 不需要知道谁在听它被杀的消息，它只管发。这和 Vue 的 <code>$emit</code> / mitt / EventBus 完全一致。</p>
      <div class="tip-box">
        <strong>EventBus 的暗面：</strong> 用过全局 EventBus 的前端工程师都知道——当你的项目里有 50 个事件在飞，而且每个事件有 5 个监听器，bug 就变得难以追踪："谁在监听 'enemy-killed'？为什么积分加了两次？"这就是"全局事件地狱"。解决方案和 Vue 一样：给事件命名空间（<code>'enemy:killed'</code> vs <code>'wave:complete'</code>），在组件卸载时 <code>off()</code> 清理监听，必要时用 typed event（给每个事件的 payload 加类型约束）。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔄" title="有限状态机（FSM）——你的 Vue Router 导航守卫">
      <p>游戏在任何时刻都处于<strong>一个确定的状态</strong>——菜单、游戏中、暂停、结算。不同状态下，同样的输入应该产生不同的响应（游戏中按 Space = 射击，菜单中按 Space = 开始游戏）。</p>
      <pre>enum GameState { MENU, PLAYING, PAUSED, GAMEOVER }

class GameFSM {
  private state = GameState.MENU
  transition(newState: GameState) {
    this.exit(this.state)
    this.state = newState
    this.enter(newState)
  }
  update(dt: number) {
    switch (this.state) {
      case GameState.PLAYING: /* 游戏逻辑 */ break
      case GameState.PAUSED: return  // 什么都不做
    }
  }
}</pre>
      <p>FSM 和前端的关系比你以为的更紧密。Vue Router 的 <code>beforeEach</code> / <code>beforeResolve</code> 就是在路由级别上实现的状态机守卫——"当前状态允许离开吗？目标状态允许进入吗？"网页表单的多步骤流程（wizard）本质上就是一个状态机——"Step 1→2→3→确认"。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>Unity ECS/DOTS——当面向对象不够用的时候：</strong> 2018 年，Unity 推出了 Data-Oriented Technology Stack（DOTS），核心是 Entity-Component-System 架构。传统的 GameObject-Component 模式中，每个对象是一个独立实体（有位置、渲染、碰撞组件），内存中它们是<strong>离散的</strong>——CPU 缓存命中率极低。ECS 把一万个 Enemy 的 position 数据<strong>连续排列</strong>在一块内存里，CPU 可以一口气读完——缓存命中率从 10% 飙升到 90%+。对 2D 手游来说这过于重型（Cocos 也不需要它），但理解"架构的选择由性能需求驱动"比记住 ECS 的具体语法重要得多。正如你不会为了 3 个组件的页面去配 SSR + 微前端——架构选型永远是需求驱动的。</li>
        <li><strong>John Carmack 的"函数式游戏编程"实验：</strong> 2013 年，id Software 的传奇程序员 John Carmack 在开发《毁灭战士 4》时做了一个激进的实验：用纯函数式风格来写部分渲染代码。输入不变→输出不变，没有可变量，没有副作用——这让调试变得极其简单：只需要看输入是什么，输出就一定是确定的。虽然这个实验没有在 DOOM 4 中全面推广（C# 不是函数式语言，硬写成本太高），但它启发了整个游戏行业对"纯逻辑与副作用分离"的思考。这和 React/Vue 推崇的"props in, vdom out"纯渲染函数是完全相同的哲学：<strong>把不确定的（状态变化、网络请求、用户输入）和确定的（给定状态能计算出什么画面）分开</strong>。</li>
        <li><strong>《Stardew Valley》的单人开发与架构演化：</strong> Eric Barone 一个人花了四年半开发《星露谷物语》，期间他经历过一个深刻的架构教训。最初他在 FarmScene 类里直接写了所有逻辑——种植、施肥、浇水、收获、动物养殖、NPC 行为……到第三年时，FarmScene 超过了 15,000 行。他后来在一篇采访中说："我花了一个月只做一件事——把 FarmScene 拆成 30 个独立的子系统，用 EventBus 彼此通信。那一个月一行新功能都没写，但之后加新功能的速度翻了一倍。"这不是特例——是每一个从"一个人写代码"走向"一个人维护代码"的开发者都会经历的阶段。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：搭建 GameManager + EventBus + 完整通信链路">
      <p>在你的 Cocos 项目中创建三个核心文件，然后验证它们能协同工作：</p>
      <p><strong>1. GameManager 单例——跨场景持久化</strong></p>
      <pre>// GameManager.ts
@ccclass('GameManager')
export class GameManager extends Component {
  private static _instance: GameManager | null = null
  static get instance(): GameManager {
    if (!this._instance) {
      console.error('GameManager 尚未初始化！请确保 Boot 场景中有 GameManager 节点')
    }
    return this._instance!
  }

  // 全局状态
  score: number = 0
  lives: number = 3
  currentWave: number = 1
  isPaused: boolean = false

  onLoad() {
    if (GameManager._instance) {
      this.node.destroy()
      return
    }
    GameManager._instance = this
    director.addPersistRootNode(this.node)  // 跨场景不销毁
    console.log('[GameManager] 初始化完成，已注册为持久节点')
  }

  addScore(points: number) {
    this.score += points
    eventBus.emit('score-changed', this.score)
  }

  loseLife() {
    this.lives--
    eventBus.emit('life-changed', this.lives)
    if (this.lives &lt;= 0) {
      eventBus.emit('game-over')
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused
    eventBus.emit('pause-changed', this.isPaused)
  }
}</pre>
      <p><strong>2. EventBus——轻量发布/订阅</strong></p>
      <pre>// EventBus.ts
// 如果你项目中已有 mitt，直接用 mitt。没有的话，手写一个也不复杂：
type Callback = (...args: any[]) => void

class EventBus {
  private listeners: Map&lt;string, Callback[]&gt; = new Map()

  on(event: string, callback: Callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Callback) {
    const list = this.listeners.get(event)
    if (list) {
      this.listeners.set(event, list.filter(cb => cb !== callback))
    }
  }

  emit(event: string, ...args: any[]) {
    const list = this.listeners.get(event)
    if (list) {
      for (const cb of list) {
        cb(...args)
      }
    }
  }
}

// 全局单例
export const eventBus = new EventBus()</pre>
      <p><strong>3. 串联：击杀敌机 → 分数更新 → 波次检查 → UI 特效</strong></p>
      <pre>// Enemy.ts 里——只管发事件，不管谁在听
takeDamage(dmg: number) {
  this.hp -= dmg
  if (this.hp &lt;= 0) {
    eventBus.emit('enemy-killed', {
      type: this.type,
      score: this.scoreValue,
      position: this.node.position.clone()
    })
    this.recycle()
  }
}

// ScoreManager.ts 里——监听击杀事件，更新分数
eventBus.on('enemy-killed', (data) => {
  GameManager.instance.addScore(data.score)
})

// WaveManager.ts 里——监听击杀事件，检查波次是否结束
eventBus.on('enemy-killed', (data) => {
  if (data.type === 'boss') {
    console.log('Boss 被击败！准备进入下一波')
    this.startNextWave()
  }
})

// UIManager.ts——监听事件，播放击杀特效
eventBus.on('enemy-killed', (data) => {
  this.showKillEffect(data.position)  // 在击杀位置播放爆炸粒子
})

// 加分事件 → HUD 更新
eventBus.on('score-changed', (score) => {
  this.scoreLabel.string = `分数: ${score}`
})

// 生命变化 → HUD 更新
eventBus.on('life-changed', (lives) => {
  this.livesLabel.string = `生命: ${'♥'.repeat(lives)}`
})</pre>
      <p><strong>验证方法：</strong> 运行游戏，调出控制台。击杀一只敌机后，你应该同时看到：1) 分数增加了，2) HUD 上的分数文字更新了，3) 如果杀了 Boss，波次管理器打印了日志。关键是 Enemy.ts 里没有 import ScoreManager 也没有 import WaveManager——它完全不知道谁在听它的事，这就是解耦。</p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <p>学完这一节，你应该能回答：</p>
      <ol>
        <li>Manager 单例模式什么时候是救星，什么时候是陷阱？以 Vuex/Pinia 的"全局状态泛滥"为参照，举例说明游戏项目中单例过多会导致什么问题。如何判断"这东西该不该做成单例"？</li>
        <li>Object Pool 和 Vue 的 <code>&lt;KeepAlive&gt;</code> 在设计哲学上有什么共同点？为什么"复用比创建销毁更好"在游戏引擎里比在 Web 前端里更加致命？——从 GC 频率和帧率要求解释。</li>
        <li>EventBus 使用不当会变成"全局事件地狱"——什么是全局事件地狱？举一个因 EventBus 滥用导致"某个事件被触发了两次但怎么都找不到原因"的调试场景。从前端 mitt/EventBus 的最佳实践中，你能总结出哪些防滥用的规则？</li>
        <li>FSM（有限状态机）和 Vue Router 的导航守卫在概念上如何对应？为什么说多步骤表单的"Step 1→2→3→确认"就是一个状态机？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
