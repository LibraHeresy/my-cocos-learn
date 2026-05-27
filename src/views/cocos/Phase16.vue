<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="16" title="游戏测试体系" duration="1-2 天" :total="17">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>建立游戏项目的<strong>测试金字塔</strong>：单元 → 集成 → E2E</li>
        <li>用 <strong>Vitest</strong> 对纯函数逻辑（伤害计算、碰撞、分数）写单元测试</li>
        <li>实现<strong>录制回放</strong>测试——用种子随机数做确定性回归</li>
        <li>建立<strong>性能基准</strong>和内存泄漏检测的自动化断言</li>
        <li>制定<strong>兼容性测试矩阵</strong>覆盖主流微信小游戏设备</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="游戏测试为什么难——以及什么可以测">
      <p>
        游戏逻辑和传统 Web 应用测试有很大不同。游戏天然有帧依赖、随机性、用户实时输入
        三个"测试杀手"。但好消息是：<strong>很多东西仍然可以测</strong>，而且前端工程师的
        测试经验大部分可以平移。
      </p>

      <h3>游戏测试 vs 前端测试对比</h3>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>前端（Vue/React）</th>
            <th>游戏（Cocos）</th>
            <th>能否平移？</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>纯函数逻辑</td>
            <td>utils/formatDate、composables</td>
            <td>伤害计算、分数累加、碰撞公式</td>
            <td>完全能——直接用 Vitest</td>
          </tr>
          <tr>
            <td>状态机</td>
            <td>Vuex/Pinia store 状态转换</td>
            <td>GameState 枚举：Menu→Playing→Paused→Over</td>
            <td>完全能——和测 Vuex store 一模一样</td>
          </tr>
          <tr>
            <td>UI 渲染</td>
            <td>DOM snapshot / 组件渲染测试</td>
            <td>Sprite 位置 / 帧动画帧号 / UI 节点树</td>
            <td>部分能——需要 mock Cocos 节点 API</td>
          </tr>
          <tr>
            <td>实时输入</td>
            <td>fireEvent.click / 表单提交</td>
            <td>触摸移动、多点触控、长按蓄力</td>
            <td>只能靠录制回放——见下方</td>
          </tr>
          <tr>
            <td>帧级行为</td>
            <td>不存在</td>
            <td>update(dt) 每帧调用的顺序和时机</td>
            <td>几乎不能直接测——需要确定性回放</td>
          </tr>
        </tbody>
      </table>

      <h3>清晰的测试边界：什么该测，什么不该测</h3>
      <table>
        <thead>
          <tr>
            <th>可以测（投入产出比高）</th>
            <th>不该测（投入产出比低）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>碰撞检测的数学公式（AABB vs 圆 vs 多边形）</td>
            <td>"子弹飞过敌人头顶，Sprite 层级正确"——测帧渲染顺序</td>
          </tr>
          <tr>
            <td>伤害计算链：攻击力 × 暴击倍率 × 护甲减免</td>
            <td>"爆炸特效播放到第 5 帧时颜色对不对"——测美术资源</td>
          </tr>
          <tr>
            <td>波次生成算法：Wave N 应该出什么敌人</td>
            <td>"BGM 在 Boss 出场时切换时间点是否精确"——测音频时机</td>
          </tr>
          <tr>
            <td>对象池：get → use → put 循环后内存不增长</td>
            <td>"粒子系统在屏幕边缘的裁剪是否正确"——测 GPU 行为</td>
          </tr>
          <tr>
            <td>状态机：Menu→Playing→Pause→Playing→Over 全路径</td>
            <td>"触摸灵敏度在 iPhone 和 Android 上是否一致"——测硬件</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>核心原则：</strong>把游戏逻辑<strong>从 Cocos API 中剥离</strong>。
        如果你的 GameManager 里全是 <code>cc.find()</code>、<code>this.node.getComponent()</code>，
        测试就无从下手。但如果把"计算伤害"抽成一个纯函数，就可以像测 Vue 的 computed
        属性一样直接测它。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🧪" title="游戏逻辑单元测试 —— 用 Vitest">
      <p>
        Vitest 是 Vue 生态的标准测试框架，和 Vite 共享配置、开箱即用。
        对于游戏项目，我们只需要在项目根目录配置 Vitest，然后对<strong>纯函数模块</strong>写测试。
      </p>

      <h3>第一步：提取纯函数</h3>
      <p>先看一个反面案例——逻辑和 Cocos API 耦合在一起：</p>
      <pre><code>// ❌ 反面：逻辑和 Cocos API 耦合，无法测试
enemyTakeDamage(enemyNode: Node, damage: number) {
  const enemy = enemyNode.getComponent(Enemy)
  enemy.hp -= damage
  if (enemy.hp <= 0) {
    const pool = this.node.getComponent(ObjectPool)
    pool.put(enemyNode)
    this.score += enemy.score  // this.score 存在组件上
  }
}</code></pre>

      <p>重构后——把计算逻辑抽成纯函数：</p>
      <pre><code>// ✅ 正面：纯函数 + 纯数据，不依赖 Cocos API
// damage-calculator.ts
export interface DamageInput {
  baseDamage: number
  critRate: number      // 0 ~ 1
  critMultiplier: number // 默认 1.5
  armor: number          // 护甲减免
  defenseDebuff: number  // 破甲 debuff（0~1，0=正常，1=完全破甲）
}

export interface DamageResult {
  finalDamage: number
  isCrit: boolean
  effectiveArmor: number
}

export function calcDamage(input: DamageInput): DamageResult {
  const isCrit = Math.random() < input.critRate
  const effectiveArmor = input.armor * (1 - input.defenseDebuff)
  const rawDamage = isCrit
    ? input.baseDamage * input.critMultiplier
    : input.baseDamage
  const finalDamage = Math.max(0, Math.round(rawDamage - effectiveArmor))
  return { finalDamage, isCrit, effectiveArmor }
}

// 给调用方用的版本（带随机种子注入）
export function calcDamageSeeded(input: DamageInput, randomValue: number): DamageResult {
  const isCrit = randomValue < input.critRate
  const effectiveArmor = input.armor * (1 - input.defenseDebuff)
  const rawDamage = isCrit
    ? input.baseDamage * input.critMultiplier
    : input.baseDamage
  const finalDamage = Math.max(0, Math.round(rawDamage - effectiveArmor))
  return { finalDamage, isCrit, effectiveArmor }
}</code></pre>

      <h3>第二步：写单元测试</h3>
      <pre><code>// damage-calculator.test.ts
import { describe, it, expect } from 'vitest'
import { calcDamageSeeded, DamageInput } from './damage-calculator'

describe('calcDamageSeeded', () => {
  const baseInput: DamageInput = {
    baseDamage: 100,
    critRate: 0.3,
    critMultiplier: 2.0,
    armor: 20,
    defenseDebuff: 0,
  }

  it('普通攻击：伤害 = 基础伤害 - 护甲', () => {
    // randomValue = 0.5 > critRate 0.3 → 不暴击
    const result = calcDamageSeeded(baseInput, 0.5)
    expect(result.isCrit).toBe(false)
    expect(result.finalDamage).toBe(80) // 100 - 20
  })

  it('暴击攻击：伤害 = 基础伤害 × 暴击倍率 - 护甲', () => {
    // randomValue = 0.1 < critRate 0.3 → 暴击
    const result = calcDamageSeeded(baseInput, 0.1)
    expect(result.isCrit).toBe(true)
    expect(result.finalDamage).toBe(180) // 100 × 2 - 20
  })

  it('护甲高于伤害时，最终伤害为 0（不能为负数）', () => {
    const input = { ...baseInput, baseDamage: 10, armor: 50 }
    const result = calcDamageSeeded(input, 0.5)
    expect(result.finalDamage).toBe(0)
  })

  it('防御 debuff 100% 时，护甲完全失效', () => {
    const input = { ...baseInput, defenseDebuff: 1.0 }
    const result = calcDamageSeeded(input, 0.5)
    expect(result.effectiveArmor).toBe(0)
    expect(result.finalDamage).toBe(100)
  })

  it('防御 debuff 50% 时，护甲减半', () => {
    const input = { ...baseInput, defenseDebuff: 0.5 }
    const result = calcDamageSeeded(input, 0.5)
    expect(result.effectiveArmor).toBe(10) // 20 × 0.5
    expect(result.finalDamage).toBe(90)
  })
})</code></pre>

      <h3>第三步：Mock Cocos API（当不得不涉及节点时）</h3>
      <pre><code>// collider.test.ts
import { describe, it, expect, vi } from 'vitest'

// 最简单的 Cocos API Stub——只实现测试需要的方法
vi.mock('cc', () => ({
  Vec2: class {
    x: number; y: number
    constructor(x: number, y: number) { this.x = x; this.y = y }
    subtract(other: any) { return { x: this.x - other.x, y: this.y - other.y } }
  },
  Rect: class {
    x: number; y: number; width: number; height: number
    constructor(x: number, y: number, w: number, h: number) {
      this.x = x; this.y = y; this.width = w; this.height = h
    }
  },
}))

import { checkAABBCollision } from './collider'

describe('AABB 碰撞检测', () => {
  it('两个重叠的矩形 → 碰撞', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 }
    const b = { x: 5, y: 5, width: 10, height: 10 }
    expect(checkAABBCollision(a, b)).toBe(true)
  })

  it('两个完全分离的矩形 → 不碰撞', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 }
    const b = { x: 100, y: 100, width: 10, height: 10 }
    expect(checkAABBCollision(a, b)).toBe(false)
  })

  it('边缘刚好接触 → 不碰撞（边界情况）', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 }
    const b = { x: 10, y: 0, width: 10, height: 10 } // 刚好挨着
    expect(checkAABBCollision(a, b)).toBe(false)
  })
})</code></pre>

      <div class="tip-box">
        <strong>Mock 策略：</strong>只在万不得已时 mock Cocos API。最理想的状态是你的游戏逻辑模块
        不 import 任何 Cocos 模块。就像 Vue 项目中的 Pinia store——你可以不 mount 组件就测试它，
        因为 store 本身就是纯 JS/TS 逻辑。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⏺️" title="自动化回归测试 —— 录制与回放">
      <p>
        单元测试覆盖了纯函数，但"玩家打了一整局游戏，分数是否计算正确"这种端到端场景怎么办？
        <strong>录制回放测试</strong>给出了答案：录制真实玩家的操作序列，然后以<strong>确定性的方式</strong>
        回放这些操作，验证最终状态（分数、存活敌人数量等）是否一致。
      </p>

      <h3>核心原理：种子随机数</h3>
      <p>
        游戏的不确定性主要来自 <code>Math.random()</code>。解决方案：用一个
        <strong>可种子化的伪随机数生成器</strong>替换它。同一颗种子 → 同样的随机序列
        → 同样的游戏进程 → 同样的最终状态。这和前端测试中的 <strong>Snapshot Testing</strong>
        是一个思路——对比两次运行的"快照"是否一致。
      </p>

      <pre><code>// SeededRandom.ts —— 可复现的随机数生成器
// 算法：Mulberry32（简单、快速、分布均匀）
export class SeededRandom {
  private _state: number

  constructor(seed: number) {
    this._state = seed | 0
  }

  /** 返回 0~1 之间的伪随机数 */
  next(): number {
    this._state |= 0
    this._state = (this._state + 0x6D2B79F5) | 0
    let t = Math.imul(this._state ^ (this._state >>> 15), 1 | this._state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** 返回 min~max 之间的随机整数 */
  rangeInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }
}</code></pre>

      <h3>InputRecorder 实现</h3>
      <pre><code>// InputRecorder.ts
export interface InputFrame {
  frame: number
  type: 'touchStart' | 'touchMove' | 'touchEnd'
  x: number
  y: number
}

export class InputRecorder {
  private _records: InputFrame[] = []
  private _isRecording = false
  private _isPlaying = false
  private _playIndex = 0
  private _currentFrame = 0

  // --- 录制模式 ---
  startRecording() {
    this._records = []
    this._isRecording = true
    this._currentFrame = 0
  }

  recordInput(type: InputFrame['type'], x: number, y: number) {
    if (!this._isRecording) return
    this._records.push({ frame: this._currentFrame, type, x, y })
  }

  /** 每帧调用一次，由 update(dt) 触发 */
  tick() {
    if (this._isRecording) this._currentFrame++
    if (this._isPlaying) this._currentFrame++
  }

  stopRecording() {
    this._isRecording = false
  }

  // --- 回放模式 ---
  startPlayback() {
    if (this._records.length === 0) return
    this._playIndex = 0
    this._isPlaying = true
    this._currentFrame = 0
  }

  /** 获取当前帧应该重放的操作列表 */
  getFrameInputs(): InputFrame[] {
    if (!this._isPlaying) return []
    const inputs: InputFrame[] = []
    while (
      this._playIndex < this._records.length &&
      this._records[this._playIndex].frame === this._currentFrame
    ) {
      inputs.push(this._records[this._playIndex])
      this._playIndex++
    }
    return inputs
  }

  isPlayingDone(): boolean {
    return this._isPlaying && this._playIndex >= this._records.length
  }

  // --- 导出/导入（用于 CI 测试） ---
  exportData(): InputFrame[] {
    return JSON.parse(JSON.stringify(this._records))
  }

  importData(data: InputFrame[]) {
    this._records = data
  }
}</code></pre>

      <h3>回放测试示例</h3>
      <pre><code>// replay.test.ts —— 在 CI 中运行
import { describe, it, expect } from 'vitest'

describe('一局完整游戏回放测试', () => {
  it('seed=42 的完整对局，最终分数应为 1250', () => {
    // 1. 用 seed=42 初始化 SeededRandom
    // 2. 导入录制好的操作序列
    // 3. 用 headless 方式从头跑到游戏结束
    // 4. 断言：最终分数 === 1250

    const finalScore = runGameReplay({
      seed: 42,
      replayFile: 'test/fixtures/replay-session-001.json',
      maxFrames: 6000, // 最多跑 100 秒（60fps）
    })

    expect(finalScore).toBe(1250)
  })
})</code></pre>

      <div class="warn-box">
        <strong>关键约束：</strong>录制回放依赖<strong>完全确定性的游戏逻辑</strong>。
        如果游戏中途有任何非种子随机源（如 <code>Date.now()</code>、网络延迟、
        <code>Math.random()</code>），回放就会"跑偏"。录制模式启动时，必须全局替换所有随机源。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📊" title="性能基准测试">
      <p>
        游戏性能不能只靠"感觉流畅"来判断。你需要<strong>可量化的指标</strong>和自动化断言，
        让性能回归像类型错误一样在 CI 中被拦截。
      </p>

      <h3>性能监控指标</h3>
      <table>
        <thead>
          <tr>
            <th>指标</th>
            <th>含义</th>
            <th>微信小游戏及格线</th>
            <th>如何测量</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>FPS</td>
            <td>每秒渲染帧数</td>
            <td>中端机 &ge; 45fps</td>
            <td><code>director.getTotalFrames()</code> 差值 / 时间差</td>
          </tr>
          <tr>
            <td>DrawCall</td>
            <td>每帧 CPU → GPU 提交次数</td>
            <td>&le; 50（小游戏硬限制 100）</td>
            <td><code>profiler.showStats()</code> 或 <code>renderer.drawCalls</code></td>
          </tr>
          <tr>
            <td>内存峰值</td>
            <td>JS Heap + 纹理 + 音频的总和</td>
            <td>&le; 200MB（微信限制 512MB）</td>
            <td><code>performance.memory</code>（仅 Chrome）/ 微信 Performance 面板</td>
          </tr>
          <tr>
            <td>主包大小</td>
            <td>构建产物 main 包体积</td>
            <td>&le; 4MB（硬性限制）</td>
            <td>构建日志 / <code>fs.statSync</code> 检查构建产物</td>
          </tr>
          <tr>
            <td>首帧时间</td>
            <td>游戏启动到第一帧渲染的时间</td>
            <td>&le; 3 秒</td>
            <td>启动时打点 <code>+ new Date()</code></td>
          </tr>
        </tbody>
      </table>

      <h3>内存泄漏检测</h3>
      <pre><code>// memory-leak.test.ts
import { describe, it, expect } from 'vitest'

describe('内存泄漏检测', () => {
  it('连续 20 波敌人后，对象池内存增长不超过 5%', () => {
    const snapshots: number[] = []

    for (let wave = 1; wave <= 20; wave++) {
      runWave(wave)  // headless 跑一波
      const mem = getCurrentMemory()  // 获取当前 JS Heap 大小
      snapshots.push(mem)
    }

    // 第 1 波 vs 第 20 波的内存对比
    const growth = (snapshots[19] - snapshots[0]) / snapshots[0]
    expect(growth).toBeLessThan(0.05)  // 增长 < 5%
  })

  it('对象池 put/get 循环 1000 次不泄漏', () => {
    const initialSize = getCurrentMemory()
    for (let i = 0; i < 1000; i++) {
      const obj = GameManager.instance.pool.get()
      GameManager.instance.pool.put(obj)
    }
    const finalSize = getCurrentMemory()
    expect(finalSize - initialSize).toBeLessThan(1024 * 1024) // < 1MB 波动
  })
})</code></pre>

      <h3>CI 性能门禁</h3>
      <pre><code>// vitest.config.ts 中配置性能阈值断言
// 如果构建产物主包超过 4MB → CI 直接红灯
import { expect } from 'vitest'

// 在 CI 构建步骤后执行
it('主包体积不超过 4MB', () => {
  const stat = fs.statSync('build/wechatgame/main.pkg')
  const sizeInMB = stat.size / 1024 / 1024
  expect(sizeInMB).toBeLessThan(4.0)
})

it('首帧启动时间不超过 3 秒', () => {
  const bootTime = measureBootTime()  // 自定义测量函数
  expect(bootTime).toBeLessThan(3000)
})</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="📱" title="兼容性测试矩阵">
      <p>
        微信小游戏的兼容性问题集中在<strong>GPU 渲染差异</strong>和<strong>系统版本 API 差异</strong>上。
        建立一个系统化的测试矩阵，而不是随机找几个手机测一测。
      </p>

      <h3>设备分级</h3>
      <table>
        <thead>
          <tr>
            <th>级别</th>
            <th>代表机型</th>
            <th>测试优先级</th>
            <th>关注重点</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>高端 iPhone</td>
            <td>iPhone 13 ~ 15（A15~A17）</td>
            <td>P1 —— 必须测</td>
            <td>基准性能参照、UI 布局准确度</td>
          </tr>
          <tr>
            <td>低端 iPhone</td>
            <td>iPhone SE 2016（A9）、iPhone 8（A11）</td>
            <td>P1 —— 必须测</td>
            <td>性能下限——如果 SE 能 30fps，其他都能</td>
          </tr>
          <tr>
            <td>中端 Android</td>
            <td>小米 Redmi Note 12、OPPO A 系列</td>
            <td>P1 —— 必须测</td>
            <td>市场份额最大——Mali/Adreno GPU 差异</td>
          </tr>
          <tr>
            <td>低端 Android</td>
            <td>Redmi 数字系列、入门 2GB RAM</td>
            <td>P2 —— 尽量测</td>
            <td>内存限制、Shader 精度、音频兼容</td>
          </tr>
          <tr>
            <td>鸿蒙（HarmonyOS）</td>
            <td>华为 Mate 60 / P 系列</td>
            <td>P2 —— 尽量测</td>
            <td>微信 API 兼容性、WebView 差异</td>
          </tr>
        </tbody>
      </table>

      <h3>测试检查单</h3>
      <pre><code>兼容性测试检查单（每台设备/每次发版）
□ 启动：从点击图标到 Menu 场景 &le; 3 秒
□ 菜单：所有按钮可点击、无重叠
□ 游戏：正常打 3 波敌人、无崩溃
□ 暂停：暂停后恢复，游戏状态正确
□ 结算：分数正确、UI 不重叠
□ 广告：激励视频加载/播放/奖励发放正常
□ onShow/onHide：切后台回来游戏正常恢复
□ 音频：BGM 和 SFX 正常播放、无杂音
□ 内存：3 局连续游戏后内存不持续增长
□ 退出：wx.exitMiniProgram() 正常</code></pre>

      <h3>测试工具链</h3>
      <table>
        <thead>
          <tr>
            <th>工具</th>
            <th>用途</th>
            <th>成本</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>微信开发者工具</td>
            <td>多设备模拟预览、基础功能调试</td>
            <td>免费</td>
          </tr>
          <tr>
            <td>真机调试（扫码）</td>
            <td>性能测试、音频验证（模拟器不准）</td>
            <td>免费——需要实体设备</td>
          </tr>
          <tr>
            <td>WeTest 云测</td>
            <td>数十种主流机型的云真机自动化测试</td>
            <td>腾讯官方，有免费额度</td>
          </tr>
          <tr>
            <td>TestBird</td>
            <td>兼容性测试平台，支持小游戏专项测试</td>
            <td>第三方付费</td>
          </tr>
          <tr>
            <td>PerfDog</td>
            <td>手机性能测试工具，FPS/CPU/内存/网络实时监控</td>
            <td>有免费版</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>最低测试策略：</strong>如果没有测试团队也没有多台设备，至少保证<strong>一台 iPhone +
        一台中端 Android</strong> 真机测试。模拟器 ≠ 真机——音频、触摸、GPU 三块只在真机上准确。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔺" title="测试金字塔与 CI 集成">
      <p>
        测试金字塔是软件工程的经典模型，对游戏项目同样适用。前端熟悉的
        <strong>单元 → 组件 → E2E</strong> 映射到游戏就是：
      </p>

      <h3>游戏测试金字塔</h3>
      <table>
        <thead>
          <tr>
            <th>层级</th>
            <th>测试内容</th>
            <th>数量</th>
            <th>速度</th>
            <th>示例</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>单元测试</strong>（底层）</td>
            <td>纯函数：伤害计算、AABB 碰撞、分数逻辑、对象池</td>
            <td>很多（100+）</td>
            <td>毫秒级</td>
            <td><code>calcDamage({ damage: 100, armor: 20 }) === 80</code></td>
          </tr>
          <tr>
            <td><strong>集成测试</strong>（中层）</td>
            <td>模块联动：波次生成→击杀→分数累加、对象池满→扩容</td>
            <td>中等（20~50）</td>
            <td>秒级</td>
            <td>"第 3 波应该出 2 个大敌 + 5 个小敌"</td>
          </tr>
          <tr>
            <td><strong>E2E 测试</strong>（顶层）</td>
            <td>完整游戏循环：菜单→战斗→死亡→广告→结算→再来一局</td>
            <td>很少（5~10）</td>
            <td>分钟级</td>
            <td>录制回放完整对局</td>
          </tr>
        </tbody>
      </table>

      <h3>CI 集成（GitHub Actions）</h3>
      <pre><code># .github/workflows/test.yml
name: Game Tests

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run test:unit       # Vitest 单元测试
      - run: npm run test:perf       # 性能基准测试
      - run: npm run check:bundle    # 主包体积检查

  replay-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run test:replay     # 回放测试（headless 模式）</code></pre>

      <div class="tip-box">
        <strong>渐进式策略：</strong>不要一开始就追求 100% 覆盖率。先给伤害计算和碰撞检测写单元测试
        （这两个是最容易出 Bug 的），再逐步扩展到波次生成和状态机。类比前端项目：
        你先给 Pinia store 写测试，再逐步到组件交互测试。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 我的游戏逻辑全在 update() 里，怎么写测试？</h3>
      <p>
        这正是需要重构的信号。把 <code>update()</code> 里的纯计算逻辑抽成独立函数，
        <code>update()</code> 只负责调用这些函数并传递参数。提取后你就能直接测试这些函数，
        而不需要运行整个 Cocos 引擎。就像 Vue 的 <code>setup()</code> 里调用 composable——
        composable 可以独立测试，<code>setup()</code> 本身不需要测。
      </p>

      <h3>Q2: 小游戏没有 DOM，怎么模拟用户操作？</h3>
      <p>
        微信小游戏的触摸事件通过 <code>wx.onTouchStart</code> 等 API 触发，而不是 DOM 事件。
        在测试中用 <strong>InputRecorder</strong> 录制真实触摸→回放输入序列即可，
        不需要模拟底层系统事件。这和前端 E2E 测试用 <code>page.click('.button')</code> 而不是
        <code>document.dispatchEvent(new MouseEvent('click'))</code> 是一个道理。
      </p>

      <h3>Q3: 每次改完代码都要真机跑一遍，效率太低怎么办？</h3>
      <p>
        建立<strong>分层测试策略</strong>：开发中在微信开发者工具模拟器上快速验证，
        每天结束前在真机上跑一次完整测试清单。发布前才需要在设备矩阵上全覆盖。
        如果 CI 中有录制回放测试，它就能帮你拦截 80% 的回归问题，
        真机只需要验证渲染和音频等模拟器无法覆盖的部分。
      </p>

      <h3>Q4: 录制回放的测试数据在 CI 中跑不出来（结果不一致）？</h3>
      <p>
        原因很可能是<strong>某个随机源没有被种子替换</strong>。排查步骤：
        ① 检查所有 <code>Math.random()</code> 调用点是否已被 SeededRandom 替换；
        ② 检查是否有 <code>Date.now()</code>、<code>performance.now()</code> 依赖；
        ③ 检查对象遍历顺序是否依赖 <code>for...in</code>（无序的）——换成数组或 Map；
        ④ 最后一招：用同一个 seed 在两台相同机器上跑两次，确认结果一致。如果同一台机器
        两次不一致，说明有未覆盖的随机源或顺序不确定性。
      </p>

      <h3>Q5: 游戏测试和前端测试最大的区别是什么？</h3>
      <p>
        <strong>帧依赖</strong>。前端测试里你调用 <code>button.click()</code> 然后
        <code>await waitFor(() => expect(...))</code>，状态变化是同步/异步的，但不需要关心
        "第几帧"。而游戏里 <code>update(dt)</code> 每帧都在改变状态，帧的顺序和 dt 值
        都会影响结果。录制回放测试就是解决这个问题的方案——它把帧维度也纳入了测试。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>游戏测试中，哪些逻辑适合单元测试？哪些不适合？（各举 3 例）</li>
        <li>如何把 Cocos 耦合的游戏逻辑重构成可测试的纯函数？</li>
        <li>为什么要提供带 <code>randomValue</code> 参数的伤害计算函数？</li>
        <li>录制回放测试如何保证两次运行结果一致？核心依赖哪个组件？</li>
        <li>SeededRandom 的种子值相同意味着什么？</li>
        <li>性能基准测试需要监控哪 5 个核心指标？各自的及格线是什么？</li>
        <li>对象池内存泄漏怎么用自动化测试检测？</li>
        <li>兼容性测试矩阵中，高端机和低端机的测试侧重点有什么不同？</li>
        <li>测试金字塔的三层在游戏项目中分别对应什么测试内容？</li>
        <li>InputRecorder 的 <code>tick()</code> 方法为什么要每帧调用？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
