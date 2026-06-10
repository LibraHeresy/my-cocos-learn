<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="15" title="游戏架构模式" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>当你只有一个脚本、100 行代码时，怎么组织都行。但当你有 20 个脚本、互相依赖、运行时出 Bug 不知道是谁改的状态——你就需要<strong>架构</strong>了。这一节讲四种游戏开发中最常用的架构模式，它们能让你在代码规模增长时仍然保持清醒。</p>
    </ConceptBlock>

    <ConceptBlock icon="🎛️" title="Manager 单例模式">
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
    </ConceptBlock>

    <ConceptBlock icon="♻️" title="对象池（Object Pool）">
      <p>前面 Phase 11 提到过子弹需要频繁创建销毁。但问题是：<strong>创建和销毁在 JS 里产生 GC 压力</strong>。GC 触发时会暂停所有 JS 执行——游戏画面"顿"一下。</p>
      <p>对象池预创建一批对象，用完回收而不是销毁：</p>
      <pre>class BulletPool {
  private pool: Node[] = []
  get(): Node { return this.pool.pop() || instantiate(this.prefab) }
  put(node: Node) { node.removeFromParent(); this.pool.push(node) }
}</pre>
      <p>Vue 类比：<code>&lt;KeepAlive&gt;</code> 组件——不销毁，只是缓存起来下次复用。</p>
    </ConceptBlock>

    <ConceptBlock icon="📡" title="事件总线（Event Bus）">
      <p>敌机被击杀时，需要通知：ScoreManager（加分）、WaveManager（检查是否该下一波）、UIManager（更新击杀特效）。如果每个 Manager 都直接调用其他 Manager 的方法，它们就<strong>互相耦合</strong>了。</p>
      <p>事件总线解耦：</p>
      <pre>// Enemy.ts
eventBus.emit('enemy-killed', { type: this.type, pos: this.node.position })

// ScoreManager.ts
eventBus.on('enemy-killed', (data) => this.addScore(SCORE_TABLE[data.type]))

// UIManager.ts
eventBus.on('enemy-killed', (data) => this.showKillEffect(data.pos))</pre>
      <p>Enemy 不需要知道谁在听它被杀的消息，它只管发。这和 Vue 的 <code>$emit</code> / mitt / EventBus 完全一致。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔄" title="有限状态机（FSM）">
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
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>Unity ECS/DOTS：</strong> Unity 近年力推的 Data-Oriented Technology Stack（面向数据编程）。它把 Entity-Component-System 推向极致——Component 是纯数据（无逻辑），System 遍历所有 Entity 处理数据。这能极致利用 CPU 缓存（因为数据在内存中连续排列）。对 2D 手游来说这过于重型，但理解它的设计哲学有助于理解"架构的选择由性能需求驱动"。</li>
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
    if (this.lives <= 0) {
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
  if (this.hp <= 0) {
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
      <ol>
        <li>单例模式什么时候是救星，什么时候是陷阱？如果项目里有 50 个 Manager 单例，所有模块都互相引用——这说明了什么设计问题？</li>
        <li>对象池为什么能减少 GC 压力？JS 的垃圾回收机制在什么情况下会暂停整个游戏逻辑？结合 bullet 频繁创建/销毁的场景来解释。</li>
        <li>EventBus 使用不当会变成"全局事件地狱"——什么是全局事件地狱？举一个因 EventBus 滥用导致难以调试的具体场景。怎么避免？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
