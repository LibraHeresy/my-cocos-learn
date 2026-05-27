<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="11" title="游戏手感设计" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>实现<strong>屏幕震动</strong>——相机随机偏移，衰减回位，不同力度等级</li>
        <li>实现<strong>卡帧（Hit Pause）</strong>——命中瞬间冻结时间，营造"打击感"</li>
        <li>在命中/拾取/死亡事件中触发<strong>粒子爆发</strong>，让关键操作有视觉反馈</li>
        <li>编写<strong>相机跟随逻辑</strong>——平滑 lerp、提前量预测、死区处理</li>
        <li>理解<strong>音效与视觉同步</strong>的关键作用——为什么"手感"其实是视听协同的产物</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title='什么是"游戏手感"——前端工程师的直觉理解'>
      <p>
        如果你做过 <strong>CSS transition</strong> 的贝塞尔曲线调优，或者用过
        <strong>Haptic Feedback API</strong>（<code>navigator.vibrate()</code>），
        你就已经在做"手感设计"了。游戏手感是用代码让玩家的操作
        <strong>"感觉对"</strong>——不是逻辑正确，而是心理满足。手感 = 视觉反馈 +
        听觉反馈 + 时间缩放 + 物理规则，四项精密协作。
      </p>

      <h3>前端交互 vs 游戏手感</h3>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>前端（Vue/React）</th>
            <th>游戏（Cocos）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>点击反馈</td>
            <td><code>:active</code> 伪类 + 按钮缩放 0.95</td>
            <td>受击闪白 + 屏幕震动 + 音效同步（多层反馈）</td>
          </tr>
          <tr>
            <td>加载状态</td>
            <td>Skeleton screen / 进度条</td>
            <td>Loading 场景 + 转场特效 + 渐进式加载</td>
          </tr>
          <tr>
            <td>错误提示</td>
            <td>Toast / Snackbar 弹出</td>
            <td>屏幕红闪 + 震动 + 错误音效</td>
          </tr>
          <tr>
            <td>过渡动画</td>
            <td><code>transition: all 0.3s ease</code></td>
            <td><code>cc.tween</code> + easing curves + 粒子特效</td>
          </tr>
          <tr>
            <td>拖拽反馈</td>
            <td><code>cursor: grabbing</code> + 阴影变化</td>
            <td>对象跟随手指 + 半透明预览 + 落点高亮</td>
          </tr>
        </tbody>
      </table>

      <h3>手感四要素</h3>
      <table>
        <thead>
          <tr>
            <th>要素</th>
            <th>给人的感觉</th>
            <th>实现方式</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>屏幕震动</strong></td>
            <td>重量感、冲击力、爆炸威力</td>
            <td>相机位置随机偏移 + 衰减归位</td>
          </tr>
          <tr>
            <td><strong>卡帧（Hit Pause）</strong></td>
            <td>打击感、命中扎实、力量传递</td>
            <td>短暂设置 <code>timeScale = 0</code></td>
          </tr>
          <tr>
            <td><strong>粒子爆发</strong></td>
            <td>事件的重要性、视觉效果华丽</td>
            <td>在事件回调中 spawn 粒子预制体</td>
          </tr>
          <tr>
            <td><strong>相机跟随</strong></td>
            <td>流畅的移动感、空间连续感</td>
            <td>lerp 平滑 + 预测 + 死区</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>关键认知：</strong>"手感"不是玄学，它是可以用参数量化的工程问题。
        震动强度、衰减速度、卡帧时长、跟随平滑度——每一个都可以调参，找到"对"的感觉。
        这和前端动画调 cubic-bezier 曲线完全是一个道理——你是在用参数"雕刻"体验。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📳" title="屏幕震动 —— 让每次爆炸都有重量">
      <p>
        屏幕震动是最直接的手感增强技巧。原理很简单：让相机（或场景根节点）在命中瞬间
        产生随机偏移，然后逐渐衰减回原位。震动强度、频率、衰减速度三个参数定义了"感觉"。
      </p>

      <h3>GameFeelManager 核心实现</h3>
      <pre><code>// GameFeelManager.ts
import { _decorator, Component, Node, Camera, Vec3, tween } from 'cc'
const { ccclass, property } = _decorator

/** 震动等级配置 */
export enum ShakeIntensity {
  Light   = 'light',    // 轻：子弹命中
  Medium  = 'medium',   // 中：受击
  Heavy   = 'heavy',    // 重：爆炸
  Epic    = 'epic',     // 史诗：Boss 死亡
}

interface ShakeConfig {
  amplitude: Vec3        // 各轴最大偏移
  frequency: number      // 每秒震动次数
  duration: number       // 持续时间（秒）
  decayRatio: number     // 衰减比例（越高衰减越快）
}

/** 各等级预设参数 */
const SHAKE_PRESETS: Record&lt;ShakeIntensity, ShakeConfig&gt; = {
  [ShakeIntensity.Light]: {
    amplitude: new Vec3(2, 2, 0),
    frequency: 30,
    duration: 0.1,
    decayRatio: 0.85,
  },
  [ShakeIntensity.Medium]: {
    amplitude: new Vec3(5, 4, 0),
    frequency: 40,
    duration: 0.2,
    decayRatio: 0.88,
  },
  [ShakeIntensity.Heavy]: {
    amplitude: new Vec3(10, 8, 0),
    frequency: 50,
    duration: 0.35,
    decayRatio: 0.9,
  },
  [ShakeIntensity.Epic]: {
    amplitude: new Vec3(20, 15, 0),
    frequency: 60,
    duration: 0.6,
    decayRatio: 0.92,
  },
}

@ccclass('GameFeelManager')
export class GameFeelManager extends Component {
  private _isShaking = false
  private _camera: Camera | null = null
  private _originalPos: Vec3 = new Vec3(0, 0, 0)

  onLoad() {
    this._camera = this.node.getComponent(Camera)
    if (!this._camera) {
      this._camera = this.node.getChildByName('Camera')?.getComponent(Camera) ?? null
    }
  }

  /** 触发屏幕震动 */
  shake(intensity: ShakeIntensity = ShakeIntensity.Medium): void {
    if (this._isShaking) return  // 正在震动时不叠加（避免感官混乱）
    this._isShaking = true

    const config = SHAKE_PRESETS[intensity]
    const cameraNode = this._camera?.node ?? this.node

    if (!this._originalPos) {
      this._originalPos = cameraNode.position.clone()
    }

    let elapsed = 0
    const targetPos = this._originalPos.clone()

    // 用 schedule 实现每帧随机偏移
    const tickId = setInterval(() => {
      elapsed += 1 / config.frequency
      const decay = Math.pow(config.decayRatio, elapsed * config.frequency)
      const amp = config.amplitude.clone().multiplyScalar(decay)

      // 随机偏移——给每帧添加不可预测性
      const offsetX = (Math.random() * 2 - 1) * amp.x
      const offsetY = (Math.random() * 2 - 1) * amp.y
      const offsetZ = (Math.random() * 2 - 1) * amp.z

      cameraNode.setPosition(
        targetPos.x + offsetX,
        targetPos.y + offsetY,
        targetPos.z + offsetZ,
      )

      if (elapsed >= config.duration) {
        clearInterval(tickId)
        cameraNode.setPosition(targetPos)
        this._isShaking = false
      }
    }, 1000 / config.frequency)
  }

  /** 也可用 Tween 实现（适合固定偏移量） */
  shakeTween(intensity: ShakeIntensity): void {
    const config = SHAKE_PRESETS[intensity]
    const node = this._camera?.node ?? this.node
    const startPos = node.position.clone()

    // 构建震动序列：随机偏移 → 回原位 → 衰减偏移 → 回原位 ...
    // 这里用简单版本演示
    let shakeTween = tween(node)
    const steps = Math.floor(config.duration * config.frequency)

    for (let i = 0; i &lt; steps; i++) {
      const decay = Math.pow(config.decayRatio, i)
      const offset = new Vec3(
        (Math.random() * 2 - 1) * config.amplitude.x * decay,
        (Math.random() * 2 - 1) * config.amplitude.y * decay,
        0,
      )
      shakeTween = shakeTween
        .to(1 / config.frequency, { position: startPos.clone().add(offset) })
    }

    // 最后回到原位
    shakeTween.to(0, { position: startPos }).start()
  }

  get isShaking(): boolean {
    return this._isShaking
  }
}</code></pre>

      <div class="tip-box">
        <strong>生产建议：</strong>在实际项目中，不要在每一帧都 new Vec3——用对象池。
        上面的实现中 shake() 方法每秒创建 30-60 个对象。对于跑几百个的震动来说可以接受，
        但如果你同时有很多震动，把 Vec3 放进对象池复用。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⏸️" title="卡帧（Hit Pause）——冻结一瞬间">
      <p>
        卡帧是格斗游戏和动作游戏的"秘密武器"。命中瞬间将游戏时间冻结 50-100 毫秒，
        给玩家的大脑一个"刚才发生了重要的事"的信号。技术上就是暂时把
        <code>director.getScheduler().setTimeScale(0)</code>（Cocos 3.x 中通过实现），
        或者更简单——暂停 update 逻辑几帧。
      </p>

      <h3>freezeFrame 实现</h3>
      <pre><code>// 继续在 GameFeelManager.ts 中

/** 卡帧——冻结游戏指定帧数 */
freezeFrame(frameCount: number = 4): void {
  // 方案一：修改 timeScale（如果引擎支持）
  // director.getScheduler().setTimeScale(0)
  // setTimeout(() => director.getScheduler().setTimeScale(1), framesToMs(frameCount))

  // 方案二：通过标志位暂停所有游戏逻辑（更安全）
  this._isFrozen = true
  this._freezeRemaining = frameCount

  this.scheduleOnce(() => {
    this._isFrozen = false
  }, frameCount / 60)  // 假设 60fps
}

// 在 game controller 的 update(dt) 中：
update(dt: number) {
  if (GameFeelManager.instance.isFrozen) return  // 冻结期间跳过逻辑
  // ... 正常游戏逻辑 ...
}</code></pre>

      <h3>卡帧的使用时机</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>冻结帧数</th>
            <th>手感效果</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>轻攻击命中</td>
            <td>2-3 帧 (33-50ms)</td>
            <td>轻微的"打到东西了"感觉</td>
          </tr>
          <tr>
            <td>重攻击/暴击</td>
            <td>4-6 帧 (66-100ms)</td>
            <td>明显的重量感和打击感</td>
          </tr>
          <tr>
            <td>必杀技命中</td>
            <td>8-12 帧 (133-200ms)</td>
            <td>"大招"的震撼力，玩家感受到威力</td>
          </tr>
          <tr>
            <td>玩家死亡</td>
            <td>60-90 帧 (1-1.5s)</td>
            <td>仿佛世界都停顿了——戏剧性极强</td>
          </tr>
          <tr>
            <td>Boss 死亡</td>
            <td>15-30 帧 (250-500ms)</td>
            <td>庆祝时刻——给玩家时间消化胜利</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>注意：</strong>卡帧期间，玩家的输入也应该被忽略。否则玩家会在"冻结"
        期间疯狂按攻击键，解冻后瞬间释放一堆技能——这在某些游戏中是 Bug，
        在另一些游戏中是"特性"（输入缓冲）。根据你的设计意图选择。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✨" title="粒子爆发 —— 让事件可视化">
      <p>
        粒子效果是"手感"最直观的载体。任何重要事件——命中、拾取道具、升级、死亡——
        都值得用粒子爆发来"庆祝"。就像前端中的 <strong>微交互</strong>
        （点击按钮后的小动画），告诉用户"系统已经接收到你的操作"。
      </p>

      <h3>事件驱动的粒子发射</h3>
      <pre><code>// ParticleFeedback.ts
import { _decorator, Component, Prefab, ParticleSystem, instantiate, Node } from 'cc'
const { ccclass, property } = _decorator

@ccclass('ParticleFeedback')
export class ParticleFeedback extends Component {
  @property(Prefab) hitParticles!: Prefab
  @property(Prefab) collectParticles!: Prefab
  @property(Prefab) deathParticles!: Prefab
  @property(Prefab) levelUpParticles!: Prefab

  /** 在指定位置生成粒子并自动回收 */
  private spawn(particlePrefab: Prefab, worldPos: Vec3): void {
    const particleNode = instantiate(particlePrefab)
    particleNode.setWorldPosition(worldPos)

    // 挂到场景根节点下（不受父节点移动影响）
    this.node.parent?.parent?.addChild(particleNode)

    // 粒子播放完毕后自动销毁
    const ps = particleNode.getComponent(ParticleSystem)
    if (ps) {
      const duration = ps.duration
      this.scheduleOnce(() => {
        particleNode.destroy()
      }, duration + 0.1)
    } else {
      // 没有 ParticleSystem 组件，延迟 1 秒销毁
      this.scheduleOnce(() => particleNode.destroy(), 1)
    }
  }

  /** 命中反馈 */
  onHit(worldPos: Vec3) {
    this.spawn(this.hitParticles, worldPos)
    GameFeelManager.instance?.shake(ShakeIntensity.Light)
    GameFeelManager.instance?.freezeFrame(3)
  }

  /** 拾取道具反馈 */
  onCollect(worldPos: Vec3) {
    this.spawn(this.collectParticles, worldPos)
    // 拾取一般不需要震动和卡帧，但要播个"叮"音效
  }

  /** 敌人死亡反馈 */
  onDeath(worldPos: Vec3) {
    this.spawn(this.deathParticles, worldPos)
    GameFeelManager.instance?.shake(ShakeIntensity.Medium)
    GameFeelManager.instance?.freezeFrame(6)
  }

  /** 升级反馈 */
  onLevelUp(worldPos: Vec3) {
    this.spawn(this.levelUpParticles, worldPos)
    GameFeelManager.instance?.shake(ShakeIntensity.Heavy)
  }
}</code></pre>

      <h3>视+听同步：手感的关键</h3>
      <pre><code>// 完整的"反馈包"——视觉、听觉、震动一次配齐
export interface FeedbackPack {
  shakeLevel: ShakeIntensity
  freezeFrames: number
  particlePrefab: Prefab
  soundName: string           // 对应的音效资源名
  soundVolume: number          // 0~1
}

const FEEDBACKS: Record&lt;string, FeedbackPack&gt; = {
  'bullet-hit': {
    shakeLevel: ShakeIntensity.Light,
    freezeFrames: 2,
    particlePrefab: /* hitParticles prefab */,
    soundName: 'sfx_hit',
    soundVolume: 0.4,
  },
  'enemy-die': {
    shakeLevel: ShakeIntensity.Medium,
    freezeFrames: 6,
    particlePrefab: /* deathParticles prefab */,
    soundName: 'sfx_explosion',
    soundVolume: 0.8,
  },
  'boss-die': {
    shakeLevel: ShakeIntensity.Epic,
    freezeFrames: 20,
    particlePrefab: /* bossDeathParticles prefab */,
    soundName: 'sfx_boss_die',
    soundVolume: 1.0,
  },
}

function triggerFeedback(eventId: string, worldPos: Vec3): void {
  const pack = FEEDBACKS[eventId]
  if (!pack) return

  // 视觉
  ParticleFeedback.instance?.spawn(pack.particlePrefab, worldPos)
  // 触感
  GameFeelManager.instance?.shake(pack.shakeLevel)
  GameFeelManager.instance?.freezeFrame(pack.freezeFrames)
  // 听觉
  AudioManager.instance?.play(pack.soundName, pack.soundVolume)
}</code></pre>

      <div class="tip-box">
        <strong>核心原则：</strong>视觉和听觉必须<strong>同步触发</strong>。如果你先震屏
        再播粒子再放音效（错开哪怕 100ms），玩家的大脑会把它识别为三个独立事件，
        而不是"一发子弹命中"这一个事件。这就是为什么 triggerFeedback 中的所有操作
        在同一个函数里立即执行——它们必须原子化。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📷" title="相机跟随 —— 流畅的视角体验">
      <p>
        相机跟随是 2D 横版/俯视角游戏的基石。最简单的实现是"相机始终在玩家正中间"，
        但那会让人感到生硬。好的相机跟随有三个关键技巧：<strong>平滑 lerp</strong>、
        <strong>预测提前量</strong>、<strong>死区</strong>。
      </p>

      <h3>基础 lerp 跟随</h3>
      <pre><code>// SmoothFollow.ts
import { _decorator, Component, Node, Vec3, CCFloat } from 'cc'
const { ccclass, property } = _decorator

@ccclass('SmoothFollow')
export class SmoothFollow extends Component {
  @property(Node) target!: Node       // 要跟随的对象
  @property(CCFloat) smoothSpeed = 5  // 平滑速度（越高越紧）
  @property(CCFloat) zOffset = 10    // 相机 z 轴偏移（3D 场景）

  private _targetPos: Vec3 = new Vec3(0, 0, 0)
  private _currentVelocity: Vec3 = new Vec3(0, 0, 0)

  lateUpdate(dt: number) {
    if (!this.target) return

    this.target.getWorldPosition(this._targetPos)

    // 使用 lerp 平滑过渡（指数衰减）
    const current = this.node.worldPosition
    const t = 1 - Math.exp(-this.smoothSpeed * dt)  // 帧率无关的 lerp 因子

    this.node.setWorldPosition(
      current.x + (this._targetPos.x - current.x) * t,
      current.y + (this._targetPos.y - current.y) * t,
      this.zOffset,
    )
  }
}</code></pre>

      <h3>进阶：预测提前量（Look-Ahead）</h3>
      <pre><code>// SmoothFollowAdvanced.ts —— 带预测和死区的相机跟随
@ccclass('SmoothFollowAdvanced')
export class SmoothFollowAdvanced extends Component {
  @property(Node) target!: Node
  @property(CCFloat) smoothSpeed = 5
  @property(CCFloat) lookAheadFactor = 0.3   // 预测系数
  @property(CCFloat) lookAheadMax = 80       // 最大预测偏移
  @property(CCFloat) deadZoneRadius = 20     // 死区半径（在此范围内不跟随）

  private _prevTargetPos: Vec3 = new Vec3(0, 0, 0)
  private _velocity: Vec3 = new Vec3(0, 0, 0)

  lateUpdate(dt: number) {
    if (!this.target) return

    const targetPos = this.target.getWorldPosition(new Vec3())
    const cameraPos = this.node.worldPosition

    // 1. 计算死区：目标是否离开了死区范围
    const dx = targetPos.x - cameraPos.x
    const dy = targetPos.y - cameraPos.y
    const distSq = dx * dx + dy * dy

    if (distSq <= this.deadZoneRadius * this.deadZoneRadius) {
      // 目标在死区内——不移动相机（避免微小抖动）
      this._prevTargetPos.set(targetPos)
      return
    }

    // 2. 计算目标速度（用于预测）
    const targetVelocity = new Vec3(
      targetPos.x - this._prevTargetPos.x,
      targetPos.y - this._prevTargetPos.y,
      0,
    )

    // 3. 计算预测位置
    const lookAheadAmount = Math.min(
      targetVelocity.length() * this.lookAheadFactor,
      this.lookAheadMax,
    )
    const velNormalized = targetVelocity.clone().normalize()
    const predictedX = targetPos.x + velNormalized.x * lookAheadAmount
    const predictedY = targetPos.y + velNormalized.y * lookAheadAmount

    // 4. 平滑跟随预测位置
    const t = 1 - Math.exp(-this.smoothSpeed * dt)
    this.node.setWorldPosition(
      cameraPos.x + (predictedX - cameraPos.x) * t,
      cameraPos.y + (predictedY - cameraPos.y) * t,
      this.node.worldPosition.z,
    )

    this._prevTargetPos.set(targetPos)
  }
}</code></pre>

      <h3>相机跟随参数调优</h3>
      <table>
        <thead>
          <tr>
            <th>参数</th>
            <th>太小</th>
            <th>刚好</th>
            <th>太大</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>smoothSpeed</code></td>
            <td>相机跟不上玩家移动——感觉"迟钝"</td>
            <td>跟得紧但不生硬——像是专业摄影师</td>
            <td>相机瞬间锁死玩家——感觉"生硬"</td>
          </tr>
          <tr>
            <td><code>lookAheadFactor</code></td>
            <td>没有预测——玩家移动时总在画面边缘</td>
            <td>玩家前方留有足够视野空间</td>
            <td>预测过多——相机跑得比玩家远，画面诡异</td>
          </tr>
          <tr>
            <td><code>deadZoneRadius</code></td>
            <td>任何微小抖动都会牵动相机——画面"神经质"</td>
            <td>小范围移动不会引起相机反应</td>
            <td>死区太大——玩家都快走出屏幕了相机还不动</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>CSS 类比：</strong>死区（Dead Zone）就是 CSS <code>scroll-behavior: smooth</code>
        加上 <code>scroll-snap-type</code> 的结合体。"别急着动，除非用户偏移超过一定阈值"。
        预测提前量（Look-Ahead）就像 <code>will-change: transform</code>——
        浏览器提前知道元素要动，预先分配 GPU 层，相机提前知道玩家要去哪，预先移动到那里。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎛️" title="GameFeelManager 完整整合">
      <p>
        将以上所有功能整合为一个 <strong>GameFeelManager</strong> 单例，
        作为整个游戏手感的"中央控制器"。任何一个系统需要"让玩家有感觉"时，
        只需调用 GameFeelManager 的一个方法，而不用关心内部有多复杂。
      </p>

      <h3>完整 API 一览</h3>
      <pre><code>// GameFeelManager 完整 API
export class GameFeelManager extends Component {
  // === 屏幕震动 ===
  shake(intensity: ShakeIntensity): void        // 触发一次震动
  shakeConfig(config: ShakeConfig): void        // 自定义震动参数
  get isShaking(): boolean                       // 是否正在震动

  // === 卡帧 ===
  freezeFrame(frameCount: number): void          // 冻结指定帧数
  get isFrozen(): boolean                        // 当前是否冻结

  // === 时间缩放（慢动作 / 快进） ===
  setTimeScale(scale: number, duration?: number): void  // 设置全局时间缩放

  // === 相机跟随 ===
  setFollowTarget(target: Node): void            // 设置相机跟随目标
  setFollowParams(params: FollowParams): void    // 动态调整跟随参数
  shakeCameraOnce(offset: Vec3): void            // 手动震一次相机

  // === 便捷组合 ===
  impact(eventId: string, worldPos: Vec3): void  // 根据事件 ID 触发完整反馈包
}</code></pre>

      <h3>实战用法示例</h3>
      <pre><code>// 在游戏各处调用——简单、统一
// 玩家子弹命中
onBulletHit(enemyPos: Vec3) {
  GameFeelManager.instance.impact('bullet-hit', enemyPos)
}

// 玩家死亡
onPlayerDeath() {
  GameFeelManager.instance.freezeFrame(90)         // 1.5 秒的"死亡卡帧"
  GameFeelManager.instance.shake(ShakeIntensity.Heavy)
  // 死亡特效和音效...
  // 1.5 秒后弹出 Game Over UI
}

// Boss 出场
onBossAppear(bossPos: Vec3) {
  GameFeelManager.instance.freezeFrame(15)
  GameFeelManager.instance.shake(ShakeIntensity.Epic)
  // 慢慢转向 Boss...
  GameFeelManager.instance.setFollowTarget(this.bossNode)
}</code></pre>

      <div class="warn-box">
        <strong>不要滥用：</strong>手感提升的"药方"用多了会产生抗药性。如果你每帧都在震屏，
        那真正的爆炸就"不震撼"了。震动、卡帧、粒子爆发都是"信号"——信号密度越高，
        每个信号的价值越低。这和前端中的"不要所有文字都加粗"是一个道理——
        全是重点等于没有重点。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 屏幕震动和粒子同时触发时，性能扛得住吗？</h3>
      <p>
        震动本身的计算开销几乎为零（只是几个 Vec3 运算加 setInterval），但粒子系统的开销
        取决于粒子数量和纹理大小。建议：粒子总数不超过 200 个同时活跃，纹理不超过 512x512。
        在低端设备上，可以把震动频率减半，粒子数量减半。这和前端响应式图片
        （<code>srcset</code>）的思路一样——不同设备给不同质量的资源。
      </p>

      <h3>Q2: 卡帧期间，update 停止了，但动画和粒子还在播吗？</h3>
      <p>
        取决于你的实现。如果只暂停游戏逻辑的 update（通过标志位跳过），那么引擎层的动画、
        粒子、Tween 仍然在运行。如果你想"全停"（包括引擎动画），需要设置引擎级的 timeScale。
        我个人推荐前者——卡帧时粒子仍然播放，让画面不显得"完全卡死"。
      </p>

      <h3>Q3: 相机预测速度太大导致画面"晕车"怎么办？</h3>
      <p>
        这是预测过量（overshoot）的典型症状。两个解决方案：
        ① 降低 <code>lookAheadFactor</code>——从 0.3 降到 0.1；
        ② 把预测偏移限制在画面宽高的 20% 以内。预期效果：玩家移动时，
        画面平稳滑动，玩家永远在画面的"黄金分割点"附近，既不偏左也不偏右。
      </p>

      <h3>Q4: 死区应该设多大？</h3>
      <p>
        没有万能值。横版动作游戏中，水平方向的死区通常设为屏幕宽度的 10-15%，
        垂直方向设为屏幕高度的 5-10%。竖版射击游戏则相反——垂直死区大，水平死区小。
        建议在游戏内做一个 debug 模式，用不同颜色的矩形可视化死区范围，
        实际跑一跑再定。类比前端响应式设计中的 breakpoints——没有"最佳值"，
        只有"适合你的场景的值"。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>屏幕震动的四个关键参数是什么？各参数对"手感"有什么影响？</li>
        <li>为什么要根据事件类型划分震动等级（Light/Medium/Heavy/Epic）？</li>
        <li>卡帧（Hit Pause）的时间长短和什么因素相关？不同场景下分别用多少帧？</li>
        <li>为什么视觉和听觉反馈必须同步触发？不同步会怎样？</li>
        <li>相机跟随中，"预测提前量"解决什么问题？"死区"解决什么问题？</li>
        <li><code>1 - Math.exp(-smoothSpeed * dt)</code> 这个 lerp 公式为什么是帧率无关的？</li>
        <li>如何避免"滥用手感"导致的正反馈衰减？</li>
        <li>粒子反馈的自动回收机制是怎么实现的？为什么要在 duration + 0.1 秒后才 destroy？</li>
        <li>前端的 Haptic Feedback API 和游戏的屏幕震动在用户体验上有什么对应关系？</li>
        <li>如果相机跟随没有死区，会发生什么？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
