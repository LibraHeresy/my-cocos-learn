<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="6" title="游戏架构模式" duration="2-3 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>实现一个对象池，子弹/敌机/特效不再频繁 new/destroy</li>
        <li>用事件总线解耦分数系统、音效系统、UI 系统</li>
        <li>用状态机管理游戏流程（菜单→游戏中→暂停→结算）</li>
        <li>理解这四种模式<strong>如何配合</strong>——它们不是孤立的</li>
      </ul>
    </ConceptBlock>

    <!-- ============ Object Pool ============ -->
    <ConceptBlock icon="🏊" title="对象池（Object Pool）—— 最重要的性能优化">
      <p>这是游戏开发<strong>最高频使用的优化模式</strong>。问题很简单：</p>

      <pre><code>// ❌ 每发一颗子弹
const bullet = instantiate(this.bulletPrefab)  // 分配内存
bullet.setPosition(...)
// ... 子弹飞出屏幕后
bullet.destroy()  // 释放内存（等待 GC 回收）

// 问题：一秒 10 颗子弹 = 每秒 10 次 malloc + 10 次 free
// GC 频繁触发 → 帧率波动 → 游戏卡顿</code></pre>

      <h3>对象池方案</h3>
      <pre><code>// ✅ 对象池：提前创建一批对象，用完回收，不销毁
// 类比：共享单车——不是每次出门买一辆新车

import { Component, _decorator, Node, Prefab, instantiate } from 'cc'
const { ccclass, property } = _decorator

@ccclass('ObjectPool')
export class ObjectPool extends Component {

  @property({ type: Prefab })
  prefab: Prefab = null         // 池中对象的预制体

  @property initialSize: number = 20  // 预创建数量

  private _pool: Node[] = []    // 池子
  private _container: Node      // 池中对象的父节点

  onLoad() {
    this._container = new Node('PoolContainer')
    this.node.addChild(this._container)

    // 预创建
    for (let i = 0; i < this.initialSize; i++) {
      this._createOne()
    }
  }

  // 从池中获取一个对象
  get(): Node {
    // 找一个不活跃的复用
    let obj = this._pool.find(n => !n.active)
    if (!obj) {
      obj = this._createOne()   // 池子干了，扩容
    }
    obj.active = true
    return obj
  }

  // 回收对象（不销毁！）
  put(obj: Node) {
    obj.active = false
    obj.setPosition(0, 0)       // 重置位置
    // 清空其他状态...
  }

  // 获取所有活跃对象（用于碰撞遍历等）
  get activeNodes(): Node[] {
    return this._pool.filter(n => n.active)
  }

  private _createOne(): Node {
    const obj = instantiate(this.prefab)
    obj.active = false
    obj.setParent(this._container)
    this._pool.push(obj)
    return obj
  }
}</code></pre>

      <h3>使用对象池</h3>
      <pre><code>// BulletSpawner.ts
export class BulletSpawner extends Component {
  @property({ type: ObjectPool })
  bulletPool: ObjectPool = null

  @property fireRate: number = 0.15  // 射击间隔
  private _timer = 0

  update(dt: number) {
    this._timer += dt
    if (this._timer >= this.fireRate) {
      this._timer = 0
      this.fire()
    }
  }

  fire() {
    const bullet = this.bulletPool.get()
    bullet.setPosition(this.node.position)
    // 子弹飞出屏幕后，不要 destroy()！
    // 而是 this.bulletPool.put(bullet)
  }
}</code></pre>

      <div class="tip-box">
        <strong>和 Vue 的类比：</strong>对象池 = Vue 的 <code>v-for</code> 中使用
        <code>:key</code> 来复用 DOM 节点。DOM 节点的创建和销毁也很昂贵，Vue
        内部就在做类似的复用。你在 Cocos 中手动管理这个复用。
      </div>
    </ConceptBlock>

    <!-- ============ Event Bus ============ -->
    <ConceptBlock icon="📡" title="事件总线（Event Bus）—— 解耦游戏模块">
      <p>
        游戏中的模块经常需要通信。比如"敌机死了" → UI 加分 + 播放音效 +
        可能掉道具。如果写成直接调用，模块之间就耦合了：
      </p>

      <pre><code>// ❌ 直接调用：Enemy 需要知道 UI、Audio、ItemManager 的存在
class Enemy {
  die() {
    UIManager.instance.addScore(100)       // 耦合 UI
    AudioManager.instance.play('explode')  // 耦合音频
    ItemManager.instance.drop(this.node.position)  // 耦合道具
    this.node.destroy()
  }
}</code></pre>

      <h3>事件总线方案</h3>
      <pre><code>// EventBus.ts —— 轻量实现
type Handler = (...args: any[]) => void

class EventBus {
  private _events = new Map&lt;string, Handler[]&gt;()

  on(event: string, handler: Handler) {
    if (!this._events.has(event)) this._events.set(event, [])
    this._events.get(event)!.push(handler)
  }

  off(event: string, handler: Handler) {
    const handlers = this._events.get(event)
    if (!handlers) return
    const idx = handlers.indexOf(handler)
    if (idx !== -1) handlers.splice(idx, 1)
  }

  emit(event: string, ...args: any[]) {
    const handlers = this._events.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      handler(...args)
    }
  }
}

// 全局单例
export const eventBus = new EventBus()</code></pre>

      <h3>使用</h3>
      <pre><code>// Enemy.ts —— 只发射事件，不知道谁会处理
die() {
  eventBus.emit('enemy:killed', { position: this.node.position, points: 100 })
  this.node.destroy()
}

// UIManager.ts —— 订阅感兴趣的事件
onLoad() {
  eventBus.on('enemy:killed', this.onEnemyKilled.bind(this))
}
onEnemyKilled(data: { position: Vec3; points: number }) {
  this.score += data.points
  this.updateScoreLabel()
}

// AudioManager.ts —— 独立订阅，互不影响
onLoad() {
  eventBus.on('enemy:killed', () => this.play('explosion'))
}

// ItemManager.ts —— 概率掉落道具
onLoad() {
  eventBus.on('enemy:killed', (data) => {
    if (Math.random() < 0.15) this.spawnItem(data.position)
  })
}</code></pre>

      <div class="warn-box">
        <strong>性能注意：</strong>不要在 <code>update</code> 中频繁 emit 事件（比如每帧 emit
        玩家的位置）。事件适合通知"发生了某件事"（敌机死了、游戏结束），而不是"持续变化的状态"（位置、血量）。
      </div>
    </ConceptBlock>

    <!-- ============ GameManager ============ -->
    <ConceptBlock icon="🎛️" title="GameManager —— 游戏全局中枢">
      <p>每个游戏都需要一个"大脑"来管理全局状态。GameManager 是单例，负责：</p>

      <pre><code>import { Component, _decorator, director } from 'cc'
import { eventBus } from './EventBus'
const { ccclass } = _decorator

export enum GameState {
  WAITING,    // 等待开始（菜单场景或"点击开始"）
  PLAYING,    // 游戏进行中
  PAUSED,     // 暂停
  GAMEOVER,   // 游戏结束
}

@ccclass('GameManager')
export class GameManager extends Component {

  static instance: GameManager
  private _state: GameState = GameState.WAITING
  private _score = 0
  private _lives = 3

  get state() { return this._state }
  get score() { return this._score }
  get lives() { return this._lives }

  onLoad() {
    GameManager.instance = this
  }

  // ---- 游戏流程控制 ----
  startGame() {
    this._state = GameState.PLAYING
    this._score = 0
    this._lives = 3
    eventBus.emit('game:start')
  }

  pauseGame() {
    if (this._state !== GameState.PLAYING) return
    this._state = GameState.PAUSED
    director.pause()  // 暂停整个引擎的 update
    eventBus.emit('game:pause')
  }

  resumeGame() {
    if (this._state !== GameState.PAUSED) return
    this._state = GameState.PLAYING
    director.resume()
    eventBus.emit('game:resume')
  }

  gameOver() {
    this._state = GameState.GAMEOVER
    eventBus.emit('game:over', { score: this._score })
    // 延迟跳转到结算场景
    setTimeout(() => director.loadScene('ResultScene'), 2000)
  }

  // ---- 游戏数据变更 ----
  addScore(points: number) {
    this._score += points
    eventBus.emit('score:changed', this._score)
  }

  loseLife() {
    this._lives -= 1
    eventBus.emit('lives:changed', this._lives)
    if (this._lives <= 0) {
      this.gameOver()
    }
  }
}</code></pre>

      <h3>在 update 中使用</h3>
      <pre><code>// 任何地方都可以用 GameManager 控制流程
update(dt: number) {
  if (GameManager.instance.state !== GameState.PLAYING) return
  // ... 只在 PLAYING 状态下执行游戏逻辑
}</code></pre>
    </ConceptBlock>

    <div class="warn-box">
      <strong>小游戏生命周期提示：</strong>微信小游戏有 <code>wx.onShow</code> / <code>wx.onHide</code>
      生命周期——用户切到聊天界面时游戏挂起。你应该在 GameManager 中监听这两个事件：
      <code>onHide</code> 时暂停游戏 + 暂停 BGM + 保存临时进度；
      <code>onShow</code> 时恢复。这和 Web 端的 <code>Page Visibility API</code>（<code>document.hidden</code>）完全一样。Phase 8 有完整代码。
    </div>

    <!-- ============ State Machine ============ -->
    <ConceptBlock icon="🤖" title="状态机 —— 管理敌机 AI 行为">
      <p>敌机不是随机乱动的，它们有明确的行为模式。状态机让这些行为切换清晰可控：</p>

      <pre><code>// 敌机 AI 的四种状态
enum EnemyState {
  ENTER,    // 从屏幕外飞入战斗区域
  IDLE,     // 在屏幕内左右移动 + 间歇射击
  CHASE,    // 追踪玩家位置
  ESCAPE,   // 残血逃跑
}

@ccclass('EnemyAI')
export class EnemyAI extends Component {

  private _state: EnemyState = EnemyState.ENTER
  private _hp = 100

  update(dt: number) {
    switch (this._state) {
      case EnemyState.ENTER:
        this.enterUpdate(dt)
        break
      case EnemyState.IDLE:
        this.idleUpdate(dt)
        break
      case EnemyState.CHASE:
        this.chaseUpdate(dt)
        break
      case EnemyState.ESCAPE:
        this.escapeUpdate(dt)
        break
    }
  }

  private switchState(newState: EnemyState) {
    this.onExitState(this._state)
    this._state = newState
    this.onEnterState(newState)
  }

  private onEnterState(state: EnemyState) {
    // 进入状态时的初始化：播放动画、设置速度等
  }
  private onExitState(state: EnemyState) {
    // 退出状态时的清理
  }

  // ---- 每帧行为 ----
  private enterUpdate(dt: number) {
    // 飞入：向下移动到目标 Y 位置
    this.node.y -= 120 * dt
    if (this.node.y < 250) {
      this.switchState(EnemyState.IDLE)
    }
  }

  private idleUpdate(dt: number) {
    // 巡逻：左右移动 + 定时射击
    // 如果检测到玩家在附近 → CHASE
    if (this.isPlayerNearby()) {
      this.switchState(EnemyState.CHASE)
    }
  }

  private chaseUpdate(dt: number) {
    // 追踪：向玩家位置移动
    // 如果血量低于 30% → ESCAPE
    if (this._hp < 30) {
      this.switchState(EnemyState.ESCAPE)
    }
  }

  private escapeUpdate(dt: number) {
    // 逃跑到屏幕外 → 消失
    this.node.y += 200 * dt
  }
}</code></pre>
    </ConceptBlock>

    <!-- ============ 四种模式联动 ============ -->
    <ConceptBlock icon="🔗" title="四种模式如何配合——以一个游戏循环为例">
      <p>
        单独看每种模式都好理解，但<strong>真正的能力体现在它们如何一起工作</strong>。下面是一个完整的游戏帧：
      </p>

      <pre><code>// 一帧（约 16ms）中发生的事情：

update(dt) {
  // 1. GameManager 检查状态
  if (GameManager.instance.state !== GameState.PLAYING) return

  // 2. InputManager 读取输入
  const input = InputManager.instance.input

  // 3. 玩家移动
  player.move(input.direction, dt)
  if (input.fire) player.tryShoot(bulletPool)  // 从对象池取子弹

  // 4. 子弹和敌机移动（都是对象池中的对象）
  for (const bullet of bulletPool.activeNodes) bullet.update(dt)
  for (const enemy of enemyPool.activeNodes) {
    enemy.ai.update(dt)     // 状态机控制行为
    enemy.move(dt)
  }

  // 5. CollisionManager 统一处理碰撞
  //    碰撞回调中通过 EventBus 通知其他系统
  CollisionManager.instance.update(dt)

  // 6. 回收飞出屏幕的物体
  for (const bullet of bulletPool.activeNodes) {
    if (isOutOfScreen(bullet)) bulletPool.put(bullet)
  }
}</code></pre>

      <p>
        事件总线在这里扮演"神经系统"：CollisionManager 检测到碰撞 → emit 事件 → UI
        加分的代码完全不知道是谁触发的，它只是订阅了这个事件。
      </p>
    </ConceptBlock>

    <!-- ============ 单例模式 ============ -->
    <ConceptBlock icon="🏠" title="单例模式 —— 全局访问点的代价与收益">
      <p>
        本课程中大量使用
        <code>static instance</code>
        来全局访问管理器，这种模式叫<strong>单例（Singleton）</strong>。理解它的优劣：
      </p>

      <h3>为什么用单例</h3>
      <ul>
        <li>游戏中有很多"只应该有一个"的东西：GameManager、InputManager、CollisionManager</li>
        <li>任何组件随时可以访问 <code>GameManager.instance.score</code>——不需要层层传递引用</li>
        <li>配合 <code>director.addPersistRootNode</code>，单例节点可以在跨场景时保持存活</li>
      </ul>

      <h3>单例的代价</h3>
      <ul>
        <li>
          <strong>全局可变状态：</strong>任何地方都能改
          <code>GameManager.instance.score</code>——改错了很难追溯
        </li>
        <li><strong>测试困难：</strong>单例在单元测试中难以 mock——每个测试会互相污染状态</li>
        <li>
          <strong>初始化顺序：</strong>如果 Scene A 中的代码在 Scene B 的 onLoad
          之前访问了单例，可能拿到 null
        </li>
      </ul>

      <h3>使用建议</h3>
      <ul>
        <li>
          <strong>读多写少：</strong>大量读取（读取分数/状态）没问题——修改则应集中到少数方法中
        </li>
        <li>
          <strong>通过方法修改：</strong>不要直接 <code>GameManager.instance._score = 99</code>，用
          <code>GameManager.instance.addScore(10)</code>——方法内部可以做校验和 emit 事件
        </li>
        <li>
          <strong>项目规模：</strong
          >飞机大战这种中小型游戏，单例完全够用。大型项目才需要考虑依赖注入
        </li>
      </ul>

      <div class="tip-box">
        <strong>跨场景存活：</strong>如果 AudioManager 是单例且需要在切换场景时不断音乐，在它的
        <code>onLoad</code> 中调用
        <code>director.addPersistRootNode(this.node)</code>——这个节点就会从场景中"提升"为常驻节点。
      </div>
    </ConceptBlock>

    <!-- ============ 定时器 ============ -->
    <ConceptBlock icon="⏲️" title="Component 定时器 —— scheduleOnce / schedule">
      <p>
        除了 <code>update(dt)</code> 这种每帧调用的方法，Component
        还提供了<strong>一次性和周期性定时器</strong>：
      </p>

      <h3>scheduleOnce —— 延迟执行一次</h3>
      <pre><code>// 1.5 秒后执行一次（类比 setTimeout）
this.scheduleOnce(() => {
  console.log('1.5 秒后执行')
  this._invincible = false
}, 1.5)

// 还可以用参数指定帧数
this.scheduleOnce(() => {
  // 60 帧后执行（约 1 秒 @ 60fps）
}, 60, 'frames')</code></pre>

      <h3>schedule —— 按间隔循环执行</h3>
      <pre><code>// 每 2 秒执行一次（类比 setInterval）
this.schedule(() => {
  console.log('每 2 秒触发一次')
  this.spawnEnemy()
}, 2)

// 停止循环
this.unschedule(this.spawnEnemy)  // 停止某个特定回调
this.unscheduleAllCallbacks()     // 停止所有回调</code></pre>

      <h3>schedule vs update 的选择</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>用什么</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>每帧都要更新的逻辑（移动、碰撞检测）</td>
            <td><code>update(dt)</code></td>
          </tr>
          <tr>
            <td>每隔 N 秒触发的逻辑（敌机生成、Boss 阶段切换）</td>
            <td><code>schedule(fn, interval)</code></td>
          </tr>
          <tr>
            <td>延迟 N 秒后执行一次（无敌冷却结束）</td>
            <td><code>scheduleOnce(fn, delay)</code></td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>注意：</strong>节点被销毁时，所有 schedule 和 scheduleOnce 会自动停止。但如果是在
        onDestroy 中手动清理，务必调用 <code>unscheduleAllCallbacks()</code>。
      </div>
    </ConceptBlock>

    <!-- ============ 数据持久化 ============ -->
    <ConceptBlock icon="💾" title="数据持久化 —— 存最高分到 localStorage">
      <p>
        飞机大战需要记住最高分——下次启动时还能看到。Cocos 提供了和浏览器 localStorage 一样的 API：
      </p>

      <pre><code>import { sys } from 'cc'

// 存储（key-value —— 只能是字符串）
sys.localStorage.setItem('highScore', '99999')

// 读取
const highScore = parseInt(sys.localStorage.getItem('highScore') || '0')

// 删除
sys.localStorage.removeItem('highScore')

// 清空所有
sys.localStorage.clear()</code></pre>

      <h3>实际使用：游戏结束时更新最高分</h3>
      <pre><code>// GameManager.ts
gameOver() {
  this._state = GameState.GAMEOVER

  // 检查并更新最高分
  const prev = parseInt(sys.localStorage.getItem('highScore') || '0')
  if (this._score > prev) {
    sys.localStorage.setItem('highScore', String(this._score))
  }

  eventBus.emit('game:over', { score: this._score })
}</code></pre>

      <div class="tip-box">
        <strong>注意：</strong>在 Web 平台 <code>sys.localStorage</code> 底层就是
        <code>window.localStorage</code>。在原生平台（iOS/Android）它是 Cocos
        引擎实现的文件存储。API 一致，不需要关心平台差异。
      </div>

      <div class="warn-box">
        <strong>小游戏注意：</strong>微信小游戏中 <code>sys.localStorage</code> 底层是
        <code>wx.setStorageSync</code>，上限 <strong>10MB</strong>（比浏览器的 5MB 宽松）。如果你要存大量数据（如排行榜缓存），建议用
        <code>wx.getFileSystemManager()</code> 写本地文件，或直接用微信云开发数据库。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>对象池解决了什么问题？为什么不用简单的 new/destroy？</li>
        <li>对象池中"回收"一个对象时，除了 <code>active=false</code> 还需要做什么？</li>
        <li>事件总线和直接函数调用的本质区别是什么？什么场景用哪一种？</li>
        <li>
          GameManager 中为什么要用 <code>director.pause()</code> 来暂停？只检查 state 不行吗？
        </li>
        <li>
          状态机的 <code>switchState</code> 方法为什么要有 onEnter / onExit？直接在 case
          里写不行吗？
        </li>
        <li>单例模式的优缺点是什么？如何让单例节点跨场景存活？</li>
        <li><code>scheduleOnce</code> 和 <code>setTimeout</code> 的用法有什么异同？</li>
        <li>如何用 <code>sys.localStorage</code> 存储和读取最高分？</li>
        <li>四种模式在一帧中的协作流程是怎样的？用自己的话描述一遍。</li>
      </ul>
    </ConceptBlock>
  </PhaseLayout>
</template>
