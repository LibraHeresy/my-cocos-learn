<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="29" title="TypeScript 游戏模式" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>用<strong>可辨识联合类型（Discriminated Unions）</strong>建模游戏状态机——类型安全的状态切换</li>
        <li>用<strong>品牌类型（Branded Types）</strong>区分不同类型 ID——防止 ScoreID 误传给 PlayerID</li>
        <li>用 <strong>Zod</strong> 在游戏启动时<strong>验证 JSON 配置文件</strong>——不合法的配置绝不进入运行时</li>
        <li>理解<strong>服务定位器模式</strong>（Service Locator）——Cocos 环境中的依赖注入替代方案</li>
        <li>用 <code>as const</code> 和 <code>readonly</code> 让游戏常量真正"不可变"</li>
        <li>将你在 React/Vue 项目中已经熟悉的 TypeScript 模式<strong>迁移到游戏开发中</strong></li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="为什么游戏需要更严格的类型——前端工程师的直觉理解">
      <p>
        前端 TypeScript 中，你可能已经习惯了用 <code>interface</code> 定义 Props、用
        <code>enum</code> 定义状态、用 <code>as const</code> 定义常量。游戏项目中
        这些模式同样有效——而且因为游戏状态更复杂、异步操作更多、对象生命周期更短，
        类型安全的价值比前端更大。
      </p>

      <h3>前端 TS 模式 vs 游戏 TS 模式</h3>
      <table>
        <thead>
          <tr>
            <th>TypeScript 模式</th>
            <th>前端（React/Vue）中的用法</th>
            <th>游戏（Cocos）中的用法</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Discriminated Union</td>
            <td>Redux action types / Vuex mutation types</td>
            <td><strong>游戏状态机</strong>——杜绝非法状态组合</td>
          </tr>
          <tr>
            <td>Branded Types</td>
            <td>UserId vs PostId 避免混淆</td>
            <td>PlayerId vs EnemyId vs BulletId——避免"玩家打自己"</td>
          </tr>
          <tr>
            <td>Zod / 运行时校验</td>
            <td>API 响应校验</td>
            <td><strong>游戏配置 JSON 校验</strong>——启动时拦截非法配置</td>
          </tr>
          <tr>
            <td>Service Locator</td>
            <td><code>inject('Store')</code>（依赖注入）</td>
            <td>单例管理器获取——<code>ServiceLocator.get(AudioManager)</code></td>
          </tr>
          <tr>
            <td>Const Assertions</td>
            <td><code>COLORS = ['red','blue'] as const</code></td>
            <td>武器/敌人/关卡常量表——不可被意外修改</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>关键认知：</strong>游戏开发中 TypeScript 的价值不在"让代码更好看"，
        而在<strong>让运行时错误变成编译时错误</strong>。"玩家已经死了但游戏状态还是
        Playing"、"Boss 配置中 damage 字段拼错"——这些 Bug 在运行时才暴露非常难调试。
        用对 TS 模式，编译器就能帮你拦下来。这和你用 TypeScript 取代 JavaScript
        提升代码质量的动机完全一致。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔀" title="可辨识联合类型——游戏状态机的正确姿势">
      <p>
        游戏状态机是游戏架构的核心。常见的 <code>enum + switch</code> 的问题是：状态和
        状态专属数据的<strong>关系丢失了</strong>。你无法知道"Playing 状态时 level 字段
        一定存在"，编译器帮不了你。Discriminated Union 完美解决这个问题。
      </p>

      <h3>enum 方案的痛点</h3>
      <pre><code>// ❌ 传统 enum + switch —— 状态和数据分离，类型不安全
enum GameState {
  Menu = 'menu',
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'gameOver',
}

class GameStateManager {
  state: GameState = GameState.Menu
  level: number = 1      // 只在 Playing 时有效——但类型系统不知道！
  score: number = 0      // 只在 Playing 时有效
  deathReason: string = '' // 只在 GameOver 时有效

  get currentLevelName(): string {
    // 类型系统不会告诉你这里在 Menu 状态下访问 level 是否有意义
    return `关卡 ${this.level}`
    // 当 state=Menu 时 level 可能是 undefined/0——但编译通过了
  }
}</code></pre>

      <h3>Discriminated Union 方案</h3>
      <pre><code>// ✅ Discriminated Union —— 状态和数据绑定，编译器全覆盖
type GameState =
  | { state: 'menu' }
  | { state: 'playing'; level: number; score: number; wave: number }
  | { state: 'paused'; previousState: GameState }
  | { state: 'gameOver'; score: number; reason: 'death' | 'timeout' | 'quit'; level: number }
  | { state: 'loading'; progress: number; target: string }

// ===== 使用 —— 编译器强制你处理每种状态 =====
function getUIInfo(gs: GameState): { title: string; showScore: boolean } {
  switch (gs.state) {
    case 'menu':
      return { title: '主菜单', showScore: false }
    case 'playing':
      // 这里 gs.level, gs.score, gs.wave 都有类型！
      return { title: `第 ${gs.level} 关`, showScore: true }
    case 'paused':
      return { title: '已暂停', showScore: true }
    case 'gameOver':
      return { title: gs.reason === 'death' ? '你挂了' : '时间到', showScore: true }
    case 'loading':
      return { title: `加载中 ${gs.progress}%`, showScore: false }
    // 如果你的 switch 漏掉了一种状态，TypeScript 会报错！
    // 开启 strictNullChecks + noImplicitReturns 后编译器帮你检查
  }
}

// ===== 状态转换 =====
function startGame(level: number): GameState {
  return { state: 'playing', level, score: 0, wave: 1 }
}

function pauseGame(current: GameState): GameState {
  if (current.state !== 'playing') throw new Error('只能在 playing 状态下暂停')
  return { state: 'paused', previousState: current }
}

function resumeGame(paused: GameState): GameState {
  if (paused.state !== 'paused') throw new Error('当前不是暂停状态')
  return paused.previousState  // 恢复之前的状态（含原来的 score 和 level）
}

// ===== 用完状态后的穷举检查 =====
function assertNever(x: never): never {
  throw new Error(`未处理的状态: ${String(x)}`)
}

function handleState(gs: GameState): void {
  switch (gs.state) {
    case 'menu': break
    case 'playing': break
    case 'paused': break
    case 'gameOver': break
    case 'loading': break
    default:
      assertNever(gs)  // 如果未来有人加了新状态，这里编译报错！
  }
}</code></pre>

      <h3>状态机 Hook</h3>
      <pre><code>// GameStateMachine.ts —— 封装状态变更逻辑
export class GameStateMachine {
  private _state: GameState = { state: 'menu' }
  private _listeners: Array&lt;(newState: GameState, oldState: GameState) =&gt; void&gt; = []

  get state(): GameState { return this._state }

  /** 安全的状态转换 */
  transition(next: GameState): void {
    const prev = this._state

    // 可选：验证状态转换是否合法
    if (!this.isValidTransition(prev, next)) {
      console.error(`非法状态转换: ${prev.state} → ${next.state}`)
      return
    }

    this._state = next
    this.notify(next, prev)
  }

  private isValidTransition(from: GameState, to: GameState): boolean {
    // 定义合法的状态转换图
    const validTransitions: Record&lt;string, string[]&gt; = {
      'menu':     ['playing', 'loading'],
      'playing':  ['paused', 'gameOver'],
      'paused':   ['playing', 'menu'],
      'gameOver': ['menu'],
      'loading':  ['playing', 'menu'],
    }
    return validTransitions[from.state]?.includes(to.state) ?? false
  }

  onChange(fn: (newState: GameState, oldState: GameState) => void): void {
    this._listeners.push(fn)
  }

  private notify(newState: GameState, oldState: GameState): void {
    for (const fn of this._listeners) fn(newState, oldState)
  }
}</code></pre>

      <div class="tip-box">
        <strong>前端类比：</strong>Discriminated Union 游戏状态机 = Redux Toolkit 的
        <code>createSlice</code> + TypeScript。Vue 中用 Pinia store 时你也经常定义
        <code>type State = { status: 'idle' | 'loading' | 'success' | 'error' }</code>。
        这本质上就是 Discriminated Union——游戏只是把 status 换成了 state，多了一些子状态数据。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🏷️" title="品牌类型——防止 ID 混淆">
      <p>
        游戏中有大量的 ID：PlayerID、EnemyID、BulletID、ItemID、LevelID。
        它们本质上都是 <code>string</code> 或 <code>number</code>，但语义完全不同。
        品牌类型（Branded Types）用类型系统标记它们，防止"不小心把敌人 ID 当成玩家 ID 用"。
      </p>

      <h3>品牌类型定义</h3>
      <pre><code>// BrandedTypes.ts —— 用 TS 品牌类型给 ID 打标签
declare const BrandSymbol: unique symbol

export type Brand&lt;T, TBrand&gt; = T &amp; { [BrandSymbol]: TBrand }

// 各种实体 ID
export type PlayerId = Brand&lt;string, 'PlayerId'&gt;
export type EnemyId  = Brand&lt;string, 'EnemyId'&gt;
export type BulletId = Brand&lt;number, 'BulletId'&gt;
export type ItemId   = Brand&lt;string, 'ItemId'&gt;
export type LevelId  = Brand&lt;number, 'LevelId'&gt;

// 创建带品牌的 ID 的工厂函数
export function PlayerId(value: string): PlayerId {
  return value as PlayerId
}

export function EnemyId(value: string): EnemyId {
  return value as EnemyId
}

export function BulletId(value: number): BulletId {
  return value as BulletId
}</code></pre>

      <h3>使用效果</h3>
      <pre><code>// ===== 有了品牌类型后 =====
interface EntityManager {
  getPlayer(id: PlayerId): Player | null
  getEnemy(id: EnemyId): Enemy | null
  getBullet(id: BulletId): Bullet | null
}

const manager: EntityManager = new GameEntityManager()

const playerId = PlayerId('p001')
const enemyId = EnemyId('e042')

// ✅ 正确——类型匹配
const player = manager.getPlayer(playerId)
const enemy = manager.getEnemy(enemyId)

// ❌ 编译错误——string 不能赋值给 PlayerId（没有品牌标记）
// const p2 = manager.getPlayer('p002')   // ❌ Type 'string' is not assignable

// ❌ 编译错误——EnemyId 不能赋值给 PlayerId 的参数
// const p3 = manager.getPlayer(enemyId)  // ❌ Brand 'EnemyId' !== Brand 'PlayerId'

// ✅ 想偷懒用裸 string？必须先手动转换：
const p4 = manager.getPlayer('p003' as PlayerId)  // 显式转换，责任在你</code></pre>

      <h3>扩展到非 ID 场景</h3>
      <pre><code>// 品牌类型不仅限于 ID——任何需要区分"同类型但不同语义"的值都可以用
export type Seconds = Brand&lt;number, 'Seconds'&gt;
export type Milliseconds = Brand&lt;number, 'Milliseconds'&gt;
export type Pixels = Brand&lt;number, 'Pixels'&gt;
export type Meters = Brand&lt;number, 'Meters'&gt;

function delay(ms: Milliseconds): void { /* ... */ }
function wait(seconds: Seconds): void { /* ... */ }

// ❌ 编译错误——number 不能直接赋值给 Milliseconds
// delay(1000)  // 这是 1000 秒还是 1000 毫秒？类型系统帮你分

const sec = 1 as Seconds
const ms = 1000 as Milliseconds
delay(ms)   // ✅
wait(sec)   // ✅
// delay(sec)  // ❌ Seconds 不能赋值给 Milliseconds 参数</code></pre>

      <div class="warn-box">
        <strong>品牌类型的限制：</strong>品牌类型是<strong>编译时</strong>的——运行时它们
        就是普通的 string/number。JSON 序列化后品牌信息丢失。<code>JSON.parse(data).id</code>
        返回的是普通 string，需要你手动 <code>as PlayerId</code> 重新加上品牌标记。
        这和前端用 <strong>zod</strong> 校验 API 响应是一个道理——类型在运行时需要重新"证明"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title='Zod——游戏配置的"运行时类型守卫"'>
      <p>
        游戏中有大量 JSON 配置：关卡数据、武器数值、敌人属性、商城商品。
        这些配置文件可能在编辑时被手动改错。Zod 可以在游戏启动时校验所有配置，
        不合法的不让进运行时——比"游戏跑到第 3 关才报个 undefined is not a function"
        好 100 倍。
      </p>

      <h3>用 Zod 定义配置 Schema</h3>
      <pre><code>// 安装：npm install zod
import { z } from 'zod'

// 定义关卡配置 Schema
const LevelConfigSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  waves: z.array(z.object({
    waveNumber: z.number().int().positive(),
    enemies: z.array(z.object({
      type: z.enum(['scout', 'fighter', 'bomber', 'boss']),
      count: z.number().int().min(1).max(50),
      hp: z.number().min(1),
      speed: z.number().min(0.1).max(10),
      score: z.number().int().min(0),
    })),
    spawnInterval: z.number().min(0.1).max(10),
  })),
  background: z.string(),
  bgm: z.string(),
  timeLimit: z.number().min(10).max(600).optional(),  // 可选——没有则不限时
})

// 从 Schema 推导 TypeScript 类型
type LevelConfig = z.infer&lt;typeof LevelConfigSchema&gt;

// 武器配置 Schema
const WeaponConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  damage: z.number().min(0),
  fireRate: z.number().min(0.05),  // 最短射击间隔（秒）
  bulletSpeed: z.number().min(1),
  bulletCount: z.number().int().min(1).max(20),
  spreadAngle: z.number().min(0).max(180),
  ammo: z.number().int().min(-1),  // -1 表示无限弹药
  cost: z.number().int().min(0),
})

type WeaponConfig = z.infer&lt;typeof WeaponConfigSchema&gt;

// 游戏全局配置 Schema
const GameConfigSchema = z.object({
  version: z.string(),
  levels: z.array(LevelConfigSchema),
  weapons: z.array(WeaponConfigSchema),
  difficultyScaling: z.object({
    hpMultiplierPerWave: z.number().min(1).max(5),
    speedMultiplierPerWave: z.number().min(1).max(3),
    scoreMultiplierPerWave: z.number().min(1).max(10),
  }),
})

type GameConfig = z.infer&lt;typeof GameConfigSchema&gt;</code></pre>

      <h3>加载时校验</h3>
      <pre><code>// ConfigLoader.ts —— 在游戏启动时加载并校验配置
import { resources, JsonAsset } from 'cc'

export class ConfigLoader {
  /** 加载并校验游戏配置 */
  static async loadConfig(): Promise&lt;GameConfig&gt; {
    try {
      const raw = await ConfigLoader.loadJson('config/game-config')

      // 🔑 Zod 校验——不合法的配置直接抛出明确错误
      const result = GameConfigSchema.safeParse(raw)

      if (!result.success) {
        console.error('❌ 游戏配置校验失败：')
        for (const issue of result.error.issues) {
          console.error(`  └─ 路径: ${issue.path.join('.')}`)
          console.error(`     问题: ${issue.message}`)
        }
        throw new Error('游戏配置非法——请检查 config/game-config.json')
      }

      console.log('✅ 游戏配置校验通过')
      return result.data  // 类型安全的 GameConfig！
    } catch (e) {
      console.error('游戏配置加载失败:', e)
      throw e
    }
  }

  private static loadJson(path: string): Promise&lt;any&gt; {
    return new Promise((resolve, reject) => {
      resources.load(path, JsonAsset, (err, asset) => {
        if (err) reject(err)
        else resolve(asset.json)
      })
    })
  }
}

// ===== 启动流程中 =====
async function bootstrap() {
  const config = await ConfigLoader.loadConfig()
  // config 的类型是 GameConfig——所有字段都有完整类型推断
  // 如果 JSON 中有拼错字段、缺失字段、值类型错误，loadConfig 已经拦截了

  // 可以安全使用
  for (const level of config.levels) {
    console.log(`关卡 ${level.id}: ${level.name}, ${level.waves.length} 波敌人`)
  }
}</code></pre>

      <h3>Zod 校验 vs 无校验</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>无 Zod 校验</th>
            <th>有 Zod 校验</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>damage: "一百"</code>（JSON 中是字符串）</td>
            <td>运行到第 N 关 → <code>NaN</code> → 各种诡异 bug</td>
            <td>启动时就报错："damage expected number, got string"</td>
          </tr>
          <tr>
            <td>漏写某个敌人类型</td>
            <td><code>undefined is not a function</code>（不知道在哪出的）</td>
            <td>启动时就报错："type: Invalid enum value: expected 'scout' | ..."</td>
          </tr>
          <tr>
            <td><code>spawnInterval: -1</code>（负数无意义）</td>
            <td>敌人生成逻辑紊乱——帧/秒计算异常</td>
            <td>启动时就报错："spawnInterval must be >= 0.1"</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>前端类比：</strong>Zod 校验游戏配置 = 你用 <strong>zod</strong> 校验 API 响应。
        在前端项目中你肯定不想信任后端返回的 JSON——在游戏项目中你也绝不应该信任手写的 JSON 配置。
        "只要是手写的 JSON，就一定有错误"——这是软件工程的法则。配一个 Zod Schema 让你在启动时
        就拦截这些错误，而不是在玩家打到一半的时候才发现。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔌" title="服务定位器——Cocos 中的依赖注入替代方案">
      <p>
        在 Angular/NestJS 中你习惯了 Constructor Injection。在 Cocos 中，Component
        是由引擎实例化的——你无法在构造函数中注入依赖。服务定位器（Service Locator）
        是最轻量的替代方案：一个全局注册表，按类型获取服务实例。
      </p>

      <h3>ServiceLocator 实现</h3>
      <pre><code>// ServiceLocator.ts —— 最简服务定位器
type Constructor&lt;T = unknown&gt; = new (...args: any[]) => T

export class ServiceLocator {
  private static _services = new Map&lt;Constructor, any&gt;()

  /** 注册服务 */
  static register&lt;T&gt;(ctor: Constructor&lt;T&gt;, instance: T): void {
    if (this._services.has(ctor)) {
      console.warn(`[ServiceLocator] ${ctor.name} 已注册，将被覆盖`)
    }
    this._services.set(ctor, instance)
    console.log(`[ServiceLocator] ✅ 注册: ${ctor.name}`)
  }

  /** 获取服务 */
  static get&lt;T&gt;(ctor: Constructor&lt;T&gt;): T {
    const instance = this._services.get(ctor)
    if (!instance) {
      throw new Error(
        `[ServiceLocator] ${ctor.name} 未注册！` +
        `请确保在启动时调用了 ServiceLocator.register(${ctor.name}, instance)`
      )
    }
    return instance as T
  }

  /** 尝试获取——不存在返回 null 而非抛错 */
  static tryGet&lt;T&gt;(ctor: Constructor&lt;T&gt;): T | null {
    return (this._services.get(ctor) as T) ?? null
  }

  /** 移除服务 */
  static unregister&lt;T&gt;(ctor: Constructor&lt;T&gt;): void {
    this._services.delete(ctor)
  }

  /** 清除所有（场景切换时） */
  static clear(): void {
    this._services.clear()
  }
}</code></pre>

      <h3>在游戏中使用</h3>
      <pre><code>// ===== 游戏启动时注册所有服务 =====
import { ServiceLocator } from './ServiceLocator'
import { GameFeelManager } from './GameFeelManager'
import { AudioManager } from './AudioManager'
import { I18nManager } from './I18nManager'
import { ConfigLoader } from './ConfigLoader'

async function initServices() {
  // 1. 先加载配置（其他服务可能依赖它）
  const config = await ConfigLoader.loadConfig()
  ServiceLocator.register(ConfigLoader, config)  // 把配置也注册进去

  // 2. 初始化各个管理器（它们在各自 node 的 onLoad 中注册）
  // 实际上每个 Manager Component 在 onLoad 中调用：
  //   ServiceLocator.register(GameFeelManager, this)
  //   ServiceLocator.register(AudioManager, this)
  //   ServiceLocator.register(I18nManager, this)

  console.log('✅ 所有服务已注册')
}

// ===== 在任何脚本中使用 =====
export class EnemyController {
  die() {
    // 获取服务——无需通过 getComponent / cc.find / 全局变量
    const feel = ServiceLocator.get(GameFeelManager)
    feel.impact('enemy-die', this.node.worldPosition)

    const audio = ServiceLocator.get(AudioManager)
    audio.play('sfx_explosion')
  }
}

export class GameUI {
  updateScore(score: number) {
    const i18n = ServiceLocator.get(I18nManager)
    this.scoreLabel.string = i18n.t('game.score', score)
  }
}</code></pre>

      <h3>Service Locator vs DI Container vs Singleton</h3>
      <table>
        <thead>
          <tr>
            <th>方案</th>
            <th>优点</th>
            <th>缺点</th>
            <th>适用场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Singleton</strong>（static instance）</td>
            <td>最简单、零依赖、IDE 友好</td>
            <td>测试困难——无法 mock；隐含全局耦合</td>
            <td>项目 &lt; 10 个服务</td>
          </tr>
          <tr>
            <td><strong>Service Locator</strong></td>
            <td>注册/替换灵活、支持 mock、按类型查找</td>
            <td>仍然是全局状态——只是换了个马甲</td>
            <td>项目 10-30 个服务</td>
          </tr>
          <tr>
            <td><strong>DI Container</strong>（如 InversifyJS）</td>
            <td>完全解耦、可测试、装饰器注入</td>
            <td>需要额外库、概念成本、与 Cocos 组件生命周期有摩擦</td>
            <td>大型项目（30+ 服务）、团队 &gt; 5 人</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>实战建议：</strong>对于大多数独立/小团队 Cocos 项目，Singleton + Service Locator
        组合是最佳选择——简单、够用、不需要引入额外依赖。如果你的团队有 5+ 人且服务超过 30 个，
        再考虑引入 InversifyJS 或其他 DI 容器。这和前端项目的状态管理选型一样——
        Pinia 够用的项目不需要上 Redux。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔒" title="const assertions 和 readonly——不可变的游戏常量">
      <p>
        游戏中有大量的常量数据——武器表、敌人表、关卡配置、掉落概率。
        这些数据在运行时绝不应该被修改。TypeScript 的 <code>as const</code> 和
        <code>readonly</code> 可以帮你锁定它们。
      </p>

      <h3>as const——锁定数组和对象的字面量类型</h3>
      <pre><code>// ❌ 没有 as const——类型太宽，且可被修改
const ENEMY_TYPES = ['scout', 'fighter', 'bomber', 'boss']
// 类型：string[]  ← 太宽了！你想限制为这 4 个值

// ✅ as const——类型收窄为字面量联合，且 readonly
const ENEMY_TYPES_CONST = ['scout', 'fighter', 'bomber', 'boss'] as const
// 类型：readonly ['scout', 'fighter', 'bomber', 'boss']
// 推导出的类型：'scout' | 'fighter' | 'bomber' | 'boss'
type EnemyType = typeof ENEMY_TYPES_CONST[number]  // ← 完美！

// ❌ 编译错误——as const 的数组不可修改
// ENEMY_TYPES_CONST.push('tank')  // Property 'push' does not exist

// ===== 复杂常量对象的 as const =====
const WEAPON_TABLE = {
  'pistol': {
    name: '手枪',
    damage: 10,
    fireRate: 0.5,
    bulletSpeed: 400,
    bulletCount: 1,
  },
  'shotgun': {
    name: '霰弹枪',
    damage: 8,
    fireRate: 1.2,
    bulletSpeed: 350,
    bulletCount: 5,
    spreadAngle: 30,
  },
  'laser': {
    name: '激光炮',
    damage: 25,
    fireRate: 0.1,
    bulletSpeed: 800,
    bulletCount: 1,
  },
} as const

// 类型：{
//   readonly pistol: { readonly name: "手枪"; readonly damage: 10; ... };
//   readonly shotgun: { ... };
//   readonly laser: { ... };
// }

type WeaponId = keyof typeof WEAPON_TABLE  // 'pistol' | 'shotgun' | 'laser'
type WeaponStats = typeof WEAPON_TABLE[WeaponId]  // 具体的武器属性类型</code></pre>

      <h3>readonly 修饰符——接口和类层面的不可变</h3>
      <pre><code>// 游戏配置——加载后不应修改
interface GameSettings {
  readonly maxPlayers: number
  readonly fps: 30 | 60
  readonly debug: boolean
  readonly initialLives: number
}

function initSettings(cfg: GameSettings): void {
  // cfg.maxPlayers = 10  // ❌ 编译错误——readonly
  // 但可以用 Readonly&lt;&gt; 泛型来保证函数内不修改
}

// Deep Readonly——防止修改嵌套属性
type DeepReadonly&lt;T&gt; = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly&lt;T[P]&gt; : T[P]
}

type ImmutableGameConfig = DeepReadonly&lt;GameConfig&gt;
// ImmutableGameConfig 的所有层级都是 readonly

// ===== readonly 数组——防止意外 push/pop =====
class ObjectPool&lt;T&gt; {
  private _pool: T[] = []

  /** 获取池中所有对象的只读视图 */
  get all(): readonly T[] {
    return this._pool  // 返回 readonly 数组
  }
}

const pool = new ObjectPool&lt;Bullet&gt;()
// pool.all.push(newBullet)  // ❌ 编译错误——readonly 数组不能 push
// pool.all[0].x = 10        // ✅ 元素本身的属性可以改（除非也加了 readonly）</code></pre>

      <div class="tip-box">
        <strong>前端类比：</strong><code>as const</code> 和 <code>readonly</code> 在
        Vue 和 React 项目中也大量使用。Vue 的 <code>defineProps</code> 参数和 React 的
        <code>Props</code> 接口几乎全是 <code>readonly</code>。游戏中的武器表、敌人表、
        掉落表就是游戏版的"组件 Props"——加载后就不该变。<code>as const</code>
        让你用类型系统而不是注释来强制执行这一规则。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🧩" title="综合实战——把所有模式串起来">
      <p>
        下面是一个完整的游戏场景代码，同时使用了本节介绍的所有 TypeScript 模式。
        你会看到它们如何协同工作。
      </p>

      <h3>综合示例：Boss 战</h3>
      <pre><code>// boss-fight.ts —— 综合运用所有模式
import { ServiceLocator } from './ServiceLocator'
import { GameFeelManager, ShakeIntensity } from './GameFeelManager'

// 1. Discriminated Union——Boss 战状态
type BossFightState =
  | { phase: 'intro' }                          // Boss 出场动画
  | { phase: 'fighting'; bossHp: number; minionCount: number }  // 战斗中
  | { phase: 'rage'; bossHp: number }           // Boss 狂暴
  | { phase: 'defeated'; loot: ItemId[] }       // Boss 被击败
  | { phase: 'escaped' }                        // Boss 逃跑（限时未完成）

// 2. Branded Types——各种 ID
type BossId = Brand&lt;string, 'BossId'&gt;

// 3. const assertions——Boss 数据
const BOSS_DATA = {
  'dragon': {
    name: '火焰巨龙',
    maxHp: 1000,
    minionTypes: ['scout', 'fighter'] as const,
    rageHpThreshold: 200,  // HP 低于此值进入狂暴
    timeLimit: 120,        // 秒
    loot: ['dragon_scale', 'flame_sword', 'gold_x100'] as const,
  },
  'mecha': {
    name: '机甲战将',
    maxHp: 1500,
    minionTypes: ['fighter', 'bomber'] as const,
    rageHpThreshold: 300,
    timeLimit: 180,
    loot: ['energy_core', 'laser_cannon', 'gold_x200'] as const,
  },
} as const

type BossIdFromData = keyof typeof BOSS_DATA
type BossData = typeof BOSS_DATA[BossIdFromData]

// 4. 游戏逻辑
class BossFightManager {
  private state: BossFightState = { phase: 'intro' }

  startBossFight(bossId: BossIdFromData) {
    const bossData = BOSS_DATA[bossId]  // 类型安全的数据访问
    this.state = {
      phase: 'fighting',
      bossHp: bossData.maxHp,
      minionCount: 0,
    }
  }

  onBossHit(damage: number) {
    if (this.state.phase !== 'fighting') return

    const newHp = this.state.bossHp - damage
    const feel = ServiceLocator.get(GameFeelManager)

    if (newHp <= 0) {
      // Boss 被击败
      this.state = {
        phase: 'defeated',
        loot: ['dragon_scale', 'flame_sword', 'gold_x100'] as ItemId[],
      }
      feel.impact('boss-die', Vec3.ZERO)
      return
    }

    if (newHp <= BOSS_DATA.dragon.rageHpThreshold) {
      this.state = { phase: 'rage', bossHp: newHp }
      feel.shake(ShakeIntensity.Epic)
      return
    }

    this.state = { ...this.state, bossHp: newHp }
    feel.shake(ShakeIntensity.Medium)
  }
}</code></pre>

      <div class="tip-box">
        <strong>核心理念：</strong>这些 TypeScript 模式不是让你写"更高级"的代码，
        而是让你的代码在 <strong>编译时就暴露逻辑错误</strong>。一个"Boss 击倒后
        还在扣 HP"的 Bug，用 Discriminated Union 直接在 IDE 里标红——根本跑不起来。
        这比你在游戏中打了 10 分钟才发现 Boss 血量为负数要高效得多。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 品牌类型在运行时没有任何保护，有意义吗？</h3>
      <p>
        有意义。大部分 Bug 是程序员自己写出来的，不是外部输入导致的。
        品牌类型让你不能在 <code>getPlayer()</code> 的参数位置误传一个 <code>string</code>——
        这已经在编译期拦截了 80% 的"传错参数"问题。对于外部输入（API/JSON），
        在数据进入系统边界时用 Zod 校验并重新打上品牌标记即可。
      </p>

      <h3>Q2: Zod 会不会增加包体积？</h3>
      <p>
        Zod 核心库压缩后约 12KB（minified + gzipped）。对于小游戏 4MB 主包来说可以忽略。
        如果你连这 12KB 都想省，可以在构建时将 Zod Schema 编译为纯 TypeScript——
        但通常不值得，12KB 和一个"第 3 关才发现的配置错误"相比，12KB 花得值。
      </p>

      <h3>Q3: Service Locator 被很多人说是"反模式"，为什么你还推荐？</h3>
      <p>
        Service Locator 在大型企业级应用中确实有缺点（隐藏依赖、全局耦合），但对游戏项目
        来说是工程现实的折中方案——Cocos Component 由引擎实例化，你控制不了构造函数。
        而且游戏运行时通常只有一个"场景"（不像 SPA 多路由），全局状态是天然存在的。
        关键是要<strong>有纪律</strong>地使用——只在服务层用，不做"万能依赖桶"。
      </p>

      <h3>Q4: Discriminated Union 的状态种类多了之后，写 switch 很烦怎么办？</h3>
      <p>
        ① 用 <code>assertNever</code> 保证穷举，放心加新状态；
        ② 每种状态的处理提取为独立函数（类似 Redux Reducer 的子 reducer）；
        ③ 如果状态超过 10 种，考虑分层——子状态机独立管理。
        这和你用 Pinia store 时的模块拆分策略一样——一个大 store 不好维护时拆成多个小 store。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>Discriminated Union 相比 enum + switch 方案有什么优势？为什么说它能"让运行时错误变编译时错误"？</li>
        <li>品牌类型是如何防止 ID 混淆的？它的"品牌标记"在编译时和运行时分别有什么效果？</li>
        <li>Zod 在游戏项目中主要用来校验什么？给出 3 种"无 Zod vs 有 Zod"的具体场景对比。</li>
        <li>Service Locator 和传统的 DI Container 有什么区别？为什么在 Cocos 中推荐 Service Locator？</li>
        <li><code>as const</code> 和 <code>readonly</code> 分别解决什么问题？什么时候该用哪个？</li>
        <li>如何从 <code>as const</code> 数组推导出联合类型？</li>
        <li><code>assertNever()</code> 函数的作用是什么？它如何帮助你维护 Discriminated Union 的状态覆盖？</li>
        <li>品牌类型在 JSON 序列化后如何恢复？</li>
        <li>如何用 Zod 同时享受"运行时校验"和"编译时类型推断"的双重好处？</li>
        <li>你目前在前端项目中已经使用了哪些 TypeScript 模式？哪些可以直接平移到游戏开发中？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
