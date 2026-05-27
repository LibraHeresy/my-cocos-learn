<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="21" title="多点触控与手势" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>处理<strong>多点触控</strong>——同时追踪多个手指的位置和状态</li>
        <li>实现<strong>双指缩放（Pinch-Zoom）</strong>——像地图 App 一样缩放游戏场景</li>
        <li>检测<strong>滑动手势（Swipe）</strong>——计算方向和速度，用于切水果、滑动选择等玩法</li>
        <li>搭建<strong>虚拟摇杆（Virtual Joystick）</strong>——固定式和浮动式，含死区处理</li>
        <li>封装一个<strong>手势管理器（GestureManager）</strong>——统一识别 Tap、Swipe、Pinch</li>
        <li>理解游戏中的触摸处理与前端的 <strong>Pointer Events / Hammer.js</strong> 的对应关系</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="👆" title="单点触摸基础——从点击到滑动">
      <p>
        Cocos 的触摸事件系统基于<strong>事件冒泡模型</strong>——和前端 DOM 事件模型几乎一致。一个触摸从屏幕开始，经过<strong>捕获 → 目标 → 冒泡</strong>三个阶段。你可以选择在哪个阶段处理事件。
      </p>

      <h3>触摸事件类型</h3>
      <table>
        <thead>
          <tr>
            <th>Cocos 事件</th>
            <th>触发时机</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>TOUCH_START</code></td>
            <td>手指刚接触屏幕</td>
            <td><code>pointerdown</code> / <code>touchstart</code></td>
          </tr>
          <tr>
            <td><code>TOUCH_MOVE</code></td>
            <td>手指在屏幕上滑动</td>
            <td><code>pointermove</code> / <code>touchmove</code></td>
          </tr>
          <tr>
            <td><code>TOUCH_END</code></td>
            <td>手指离开屏幕</td>
            <td><code>pointerup</code> / <code>touchend</code></td>
          </tr>
          <tr>
            <td><code>TOUCH_CANCEL</code></td>
            <td>触摸中断（来电、通知等系统事件）</td>
            <td><code>pointercancel</code> / <code>touchcancel</code></td>
          </tr>
        </tbody>
      </table>

      <pre><code>// 基础触摸处理
import { _decorator, Component, Node, input, Input, EventTouch } from 'cc'

export class TouchDemo extends Component {
  private _touchStartPos: Vec2 = new Vec2()
  private _touchStartTime: number = 0

  onLoad() {
    // 注册全局触摸事件
    input.on(Input.EventType.TOUCH_START, this._onTouchStart, this)
    input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this)
    input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this)
  }

  onDestroy() {
    // 别忘了取消监听——防止内存泄漏
    input.off(Input.EventType.TOUCH_START, this._onTouchStart, this)
    input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this)
    input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this)
  }

  private _onTouchStart(event: EventTouch) {
    const touchLoc = event.getUILocation()  // UI 坐标系
    this._touchStartPos.set(touchLoc.x, touchLoc.y)
    this._touchStartTime = Date.now()
  }

  private _onTouchMove(event: EventTouch) {
    const touchLoc = event.getUILocation()
    const delta = event.getUIDelta()  // 相对于上一帧的位移
    console.log(`手指移动: delta=(${delta.x}, ${delta.y})`)
  }

  private _onTouchEnd(event: EventTouch) {
    const touchLoc = event.getUILocation()
    const dx = touchLoc.x - this._touchStartPos.x
    const dy = touchLoc.y - this._touchStartPos.y
    const dt = Date.now() - this._touchStartTime

    // 判断是 Tap 还是 Swipe
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < 20 && dt < 300) {
      console.log('Tap 检测到!')
    } else if (distance > 50) {
      const velocity = distance / dt  // px/ms
      console.log(`Swipe 检测到! 方向: (${dx}, ${dy}), 速度: ${velocity.toFixed(2)}`)
    }
  }
}</code></pre>

      <div class="tip-box">
        <strong>坐标系注意：</strong><code>getUILocation()</code> 返回 UI 坐标系（原点在左下角），<code>getLocation()</code> 返回屏幕坐标系（原点在左上角）。在游戏 UI 开发中，大多数情况下你应该用 <code>getUILocation()</code>——它和 Cocos 节点的世界坐标系是一致的。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🤌" title="多点触控——追踪多个手指">
      <p>
        多点触控的核心在于<strong>区分不同的手指</strong>。每个触摸点有一个唯一的 <code>touchID</code>，你需要维护一个映射表来追踪每个手指的状态。这就像前端中通过 <code>pointerId</code> 来区分多个 <code>PointerEvent</code>。
      </p>

      <h3>Touch ID 追踪</h3>
      <pre><code>import { EventTouch } from 'cc'

// TouchTracker.ts —— 多点触控追踪器
export class TouchTracker {
  // 用 Map 存储每个 touch ID 对应的手指状态
  private _touches: Map&lt;number, TouchState&gt; = new Map()

  onTouchStart(event: EventTouch) {
    const touches = event.getTouches()
    touches.forEach(touch => {
      const touchID = touch.getID()
      const loc = touch.getUILocation()

      this._touches.set(touchID, {
        id: touchID,
        startX: loc.x,
        startY: loc.y,
        currentX: loc.x,
        currentY: loc.y,
        startTime: Date.now(),
      })

      console.log(`手指 ${touchID} 按下, 位置: (${loc.x.toFixed(0)}, ${loc.y.toFixed(0)})`)
    })
  }

  onTouchMove(event: EventTouch) {
    const touches = event.getTouches()
    touches.forEach(touch => {
      const state = this._touches.get(touch.getID())
      if (state) {
        const loc = touch.getUILocation()
        state.currentX = loc.x
        state.currentY = loc.y
      }
    })
  }

  onTouchEnd(event: EventTouch) {
    // 注意：event.getTouches() 在 TOUCH_END 时是空数组
    // 需要用 event.touch 获取离开的那个手指
    const touch = event.touch  // 离开的手指
    if (touch) {
      const touchID = touch.getID()
      this._touches.delete(touchID)
      console.log(`手指 ${touchID} 离开`)
    }
  }

  /** 获取当前屏幕上的手指数量 */
  get touchCount(): number {
    return this._touches.size
  }

  /** 获取所有触摸点的状态 */
  getAllTouches(): TouchState[] {
    return Array.from(this._touches.values())
  }
}

interface TouchState {
  id: number
  startX: number
  startY: number
  currentX: number
  currentY: number
  startTime: number
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🔍" title="双指缩放（Pinch-Zoom）">
      <p>
        双指缩放是移动端最常见的交互之一——地图 App、相册、策略游戏都依赖它。实现原理很简单：计算两根手指之间的<strong>距离变化</strong>，距离增大 = 放大，距离减小 = 缩小。
      </p>

      <pre><code>import { Camera, Vec2 } from 'cc'

export class PinchZoom extends Component {
  @property(Camera)
  camera: Camera = null  // 需要缩放的相机

  private _minZoom: number = 0.5
  private _maxZoom: number = 3.0
  private _tracker: TouchTracker = new TouchTracker()

  onLoad() {
    input.on(Input.EventType.TOUCH_START, this._tracker.onTouchStart, this._tracker)
    input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this)
    input.on(Input.EventType.TOUCH_END, this._tracker.onTouchEnd, this._tracker)
  }

  private _onTouchMove(event: EventTouch) {
    this._tracker.onTouchMove(event)

    // 至少需要两根手指
    if (this._tracker.touchCount < 2) return

    const touches = this._tracker.getAllTouches()
    const t1 = touches[0]
    const t2 = touches[1]

    // 当前两指距离
    const currentDist = this._distanceBetween(t1.currentX, t1.currentY, t2.currentX, t2.currentY)

    // 上一帧两指距离（用 event.getUIDelta 反推）
    // 简化做法：用 getDelta 估算
    const prevDist = this._distanceBetween(
      t1.currentX - event.getDeltaX(), t1.currentY - event.getDeltaY(),
      t2.currentX - event.getDeltaX(), t2.currentY - event.getDeltaY()
    )

    // 缩放倍率 = 当前距离 / 上一帧距离
    if (prevDist > 0) {
      const scale = currentDist / prevDist
      const newOrthoHeight = this.camera.orthoHeight / scale

      // 限制缩放范围
      this.camera.orthoHeight = Math.max(this._minZoom, Math.min(this._maxZoom, newOrthoHeight))
    }
  }

  private _distanceBetween(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  }
}</code></pre>

      <div class="tip-box">
        <strong>缩放体验优化：</strong>(1) 缩放<strong>中心点</strong>最好是两指的中点，而不是相机原点——这样用户放大的是"他们正在看的区域"；(2) 缩放过程加上<strong>缓动（Easing）</strong>——让缩放更平滑；(3) 给缩放加上<strong>边界弹性</strong>——超过 min 或 max 时轻轻弹回，而不是硬截断。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="👋" title="滑动手势检测——方向和速度">
      <p>
        滑动手势（Swipe）是移动端最常用的手势之一——切水果、Tinder 划卡片、滑动选择技能都靠它。检测滑动需要两个关键信息：<strong>方向</strong>和<strong>速度</strong>。
      </p>

      <h3>Swipe 检测算法</h3>
      <pre><code>// SwipeDetector.ts —— 滑动手势检测器
export enum SwipeDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export interface SwipeEvent {
  direction: SwipeDirection  // 滑动方向
  velocity: number           // 速度（px/ms）
  distance: number           // 总距离
}

export class SwipeDetector {
  private _minDistance: number = 50     // 最小滑动距离（小于此值不算滑动）
  private _minVelocity: number = 0.3    // 最小速度（px/ms）

  /** 分析触摸数据，判断是否是有效滑动 */
  detect(startX: number, startY: number, endX: number, endY: number,
         durationMs: number): SwipeEvent | null {

    const dx = endX - startX
    const dy = endY - startY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 距离不够——不算滑动
    if (distance < this._minDistance) return null

    const velocity = distance / durationMs

    // 速度不够——不算滑动（可能是按住不动后的微小偏移）
    if (velocity < this._minVelocity) return null

    // 判断方向——取绝对值更大的轴作为主方向
    let direction: SwipeDirection
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT
    } else {
      direction = dy > 0 ? SwipeDirection.UP : SwipeDirection.DOWN
    }

    return { direction, velocity, distance }
  }
}</code></pre>

      <h3>前端类比对照表</h3>
      <table>
        <thead>
          <tr>
            <th>手势</th>
            <th>检测逻辑</th>
            <th>前端对应</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tap（点击）</td>
            <td>距离 &lt; 20px，时间 &lt; 300ms</td>
            <td><code>onclick</code></td>
          </tr>
          <tr>
            <td>Long Press（长按）</td>
            <td>距离 &lt; 20px，时间 &gt; 500ms</td>
            <td><code>contextmenu</code> 事件</td>
          </tr>
          <tr>
            <td>Swipe（滑动）</td>
            <td>距离 &gt; 50px，速度 &gt; 0.3 px/ms</td>
            <td>Hammer.js <code>swipe</code></td>
          </tr>
          <tr>
            <td>Pinch（双指缩放）</td>
            <td>两指距离变化</td>
            <td><code>gesturechange</code> / <code>pinch</code></td>
          </tr>
          <tr>
            <td>Pan（拖拽）</td>
            <td>单指移动（无速度要求）</td>
            <td><code>pointermove</code> 长距离</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🕹️" title="虚拟摇杆——移动端的十字键">
      <p>
        虚拟摇杆是手机游戏中替代物理手柄的方案。根据交互模式，分为<strong>固定式</strong>（摇杆位置固定在屏幕左下角）和<strong>浮动式</strong>（手指按下的位置就是摇杆中心）。
      </p>

      <h3>虚拟摇杆关键概念</h3>
      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>说明</th>
            <th>值</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>摇杆中心</strong></td>
            <td>摇杆基准点（固定式：固定位置；浮动式：手指按下位置）</td>
            <td>世界坐标</td>
          </tr>
          <tr>
            <td><strong>摇杆半径</strong></td>
            <td>摇杆拖动的最大范围（超出后锁定在边界）</td>
            <td>如 80px</td>
          </tr>
          <tr>
            <td><strong>死区（Dead Zone）</strong></td>
            <td>中心附近的小区域，小于此范围的拖拽<strong>忽略不计</strong></td>
            <td>如 5px——防止手指微颤导致角色抖动</td>
          </tr>
          <tr>
            <td><strong>输入向量</strong></td>
            <td>从中心到当前手指位置的<strong>归一化向量</strong> [-1, 1]</td>
            <td>控制移动方向和速度比例</td>
          </tr>
        </tbody>
      </table>

      <pre><code>// VirtualJoystick.ts —— 固定式虚拟摇杆
import { _decorator, Component, Node, Vec2, Vec3, UITransform, input, Input, EventTouch } from 'cc'

export class VirtualJoystick extends Component {
  @property(Node)
  stick: Node = null        // 摇杆滑块（随手指移动）

  @property(Node)
  background: Node = null   // 摇杆底盘（固定不动）

  @property({ tooltip: '摇杆最大拖动半径' })
  maxRadius: number = 80

  @property({ tooltip: '死区半径——小于此值输出 0' })
  deadZone: number = 5

  /** 当前输入方向，归一化向量 [-1, 1] */
  private _input: Vec2 = new Vec2(0, 0)
  get input(): Vec2 { return this._input }

  onLoad() {
    // 监听触摸事件
    this.background.on(Input.EventType.TOUCH_START, this._onTouchStart, this)
    this.background.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this)
    this.background.on(Input.EventType.TOUCH_END, this._onTouchEnd, this)
    this.background.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this)
  }

  private _onTouchStart(event: EventTouch) {
    this.stick.active = true
    this._updateStickPosition(event)
    event.propagationStopped = true  // 阻止冒泡——不让其他控件响应
  }

  private _onTouchMove(event: EventTouch) {
    this._updateStickPosition(event)
  }

  private _onTouchEnd(_event: EventTouch) {
    // 手指离开——摇杆归位
    this.stick.setPosition(0, 0, 0)
    this._input.set(0, 0)
    this.stick.active = false
  }

  private _updateStickPosition(event: EventTouch) {
    // 获取触摸在底盘坐标系中的位置
    const uiPos = event.getUILocation()
    const bgTransform = this.background.getComponent(UITransform)

    // 将世界坐标转为底盘本地坐标
    const localPos = bgTransform.convertToNodeSpaceAR(new Vec3(uiPos.x, uiPos.y, 0))

    // 计算距离
    const distance = Math.sqrt(localPos.x ** 2 + localPos.y ** 2)

    // 死区判断
    if (distance < this.deadZone) {
      this._input.set(0, 0)
      return
    }

    // 限制在最大半径内
    let clampedX = localPos.x
    let clampedY = localPos.y
    if (distance > this.maxRadius) {
      const ratio = this.maxRadius / distance
      clampedX *= ratio
      clampedY *= ratio
    }

    // 设置滑块位置
    this.stick.setPosition(clampedX, clampedY, 0)

    // 归一化输入向量
    this._input.set(
      clampedX / this.maxRadius,
      clampedY / this.maxRadius,
    )
  }
}</code></pre>

      <div class="tip-box">
        <strong>浮动式摇杆：</strong>实现很简单——把固定式中的 <code>background</code> 的初始位置从固定的改为<strong>手指按下的位置</strong>。当手指按下时，把 background 移到手指位置，然后 stick 跟随移动。手指离开后隐藏整个摇杆。浮动式的优势是玩家不需要"找"摇杆位置——只要屏幕左下区域任意位置按下都能操作。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🧩" title="手势管理器——统一识别入口">
      <p>
        实际项目中，你需要一个<strong>统一的手势管理层</strong>——不同的游戏场景对手势的响应不同（战斗中 Swipe = 闪避，菜单中 Swipe = 翻页）。手势管理器就类似于前端的 <strong>Hammer.js</strong> 或自定义的 <strong>Pointer Events 抽象层</strong>。
      </p>

      <pre><code>// GestureManager.ts —— 统一手势管理
import { EventTouch } from 'cc'

export enum GestureType {
  TAP = 'tap',
  SWIPE = 'swipe',
  PINCH = 'pinch',
  LONG_PRESS = 'long_press',
}

export class GestureManager {
  private static _instance: GestureManager
  static get instance() {
    if (!this._instance) this._instance = new GestureManager()
    return this._instance
  }

  private _listeners: Map&lt;GestureType, Array&lt;Function&gt;&gt; = new Map()
  private _tracker: TouchTracker = new TouchTracker()
  private _swipeDetector: SwipeDetector = new SwipeDetector()

  /** 注册手势监听 */
  on(gesture: GestureType, callback: Function) {
    if (!this._listeners.has(gesture)) {
      this._listeners.set(gesture, [])
    }
    this._listeners.get(gesture)!.push(callback)
  }

  /** 移除手势监听 */
  off(gesture: GestureType, callback: Function) {
    const listeners = this._listeners.get(gesture)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index !== -1) listeners.splice(index, 1)
    }
  }

  /** 在 input 事件中调用——GestureManager 分析并分发手势 */
  handleTouchStart(event: EventTouch) {
    this._tracker.onTouchStart(event)
  }

  handleTouchEnd(event: EventTouch) {
    const touch = event.touch  // 离开的那根手指
    if (!touch) return

    const state = this._tracker.getTouchState(touch.getID())
    if (!state) return

    const result = this._swipeDetector.detect(
      state.startX, state.startY,
      state.currentX, state.currentY,
      Date.now() - state.startTime,
    )

    this._tracker.onTouchEnd(event)

    if (!result) {
      // 不是 Swipe → 分发为 Tap
      this._dispatch(GestureType.TAP, { x: state.startX, y: state.startY })
    } else {
      // 是 Swipe → 分发 Swipe 事件
      this._dispatch(GestureType.SWIPE, result)
    }
  }

  private _dispatch(gesture: GestureType, data: any) {
    const listeners = this._listeners.get(gesture)
    if (listeners) {
      listeners.forEach(cb => cb(data))
    }
  }
}

// ===== 使用示例 =====
// GestureManager.instance.on(GestureType.SWIPE, (swipe) => {
//   if (swipe.direction === SwipeDirection.LEFT) {
//     player.attack()
//   } else if (swipe.direction === SwipeDirection.RIGHT) {
//     player.dodge()
//   }
// })
//
// GestureManager.instance.on(GestureType.TAP, (pos) => {
//   console.log('点击位置:', pos.x, pos.y)
// })</code></pre>

      <div class="warn-box">
        <strong>性能警告：</strong>手势识别在 <code>TOUCH_MOVE</code> 中高频触发（每帧可能多次）。不要在回调中做复杂计算（如寻路、场景加载）。手势管理器只负责"识别"，具体的游戏逻辑应该<strong>通过事件解耦</strong>——GestureManager 发出事件 → 游戏逻辑监听并响应。避免在 TOUCH_MOVE 中调用 <code>console.log</code>（在真机上大量日志也会拖慢性能）。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 多指触摸时 event.getTouches() 在 TOUCH_END 中返回空数组？</h3>
      <p>
        这是设计行为——TOUCH_END 时该手指已经离开屏幕，所以 <code>getTouches()</code>（当前屏幕上的所有手指）不包含它。正确的做法：TOUCH_END 时使用 <code>event.touch</code>（单数，无 s）获取离开的那根手指。记住：<code>getTouches()</code> = 屏幕上<strong>还在</strong>的所有手指；<code>touch</code> = <strong>刚离开/刚按下</strong>的那根手指。
      </p>

      <h3>Q2: 虚拟摇杆和 ScrollView 同时存在——滑动时摇杆也动了？</h3>
      <p>
        这是<strong>触摸事件穿透</strong>问题——一个触摸被多个节点响应。解决方案：(1) 给摇杆的触摸回调中设置 <code>event.propagationStopped = true</code> 阻止冒泡；(2) 通过<strong>节点层级</strong>控制——摇杆的 zIndex 高于 ScrollView，让摇杆先捕获触摸；(3) 在 ScrollView 的触摸回调中判断触摸位置是否在摇杆区域——如果是则忽略。
      </p>

      <h3>Q3: 双指缩放时场景"飘走"——如何让缩放以两指中心为基准？</h3>
      <p>
        默认的 <code>camera.orthoHeight</code> 缩放是以相机原点为中心。要让缩放以两指中心为基准，需要在缩放的同时<strong>平移相机</strong>，使两指中点始终保持在屏幕上的同一位置。数学上：新相机位置 = 两指中点 - 缩放后的偏移量。这类似于 CSS 中 <code>transform-origin</code> 控制缩放原点的概念。
      </p>

      <h3>Q4: 死区（Dead Zone）设多大合适？</h3>
      <p>
        对于虚拟摇杆：<strong>5-10 像素</strong>足够过滤手指微颤。对于双指缩放：<strong>2-3 像素</strong>的距离变化阈值可以避免"放着不动也在抖动缩放"。死区设得太大，玩家会觉得操作不跟手；设得太小，轻微抖动就会被识别为操作——需要在体验和稳定性之间找到平衡。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>Cocos 触摸事件有哪四种类型？各在什么时候触发？</li>
        <li><code>getUILocation()</code> 和 <code>getLocation()</code> 的区别是什么？游戏 UI 开发应该用哪个？</li>
        <li>多点触控中如何追踪不同的手指？<code>touchID</code> 的作用是什么？</li>
        <li>TOUCH_END 时 <code>getTouches()</code> 为什么返回空数组？如何获取离开的手指信息？</li>
        <li>双指缩放的计算公式是什么？如何将缩放中心设为两指中点？</li>
        <li>如何区分 Tap 和 Swipe？需要用到哪些数据（距离、时间、速度）？</li>
        <li>虚拟摇杆的<strong>死区（Dead Zone）</strong>是什么？为什么需要它？</li>
        <li>固定式摇杆和浮动式摇杆分别适用于什么类型的游戏？</li>
        <li>手势管理器（GestureManager）的架构如何设计？为什么要把"识别"和"响应"解耦？</li>
        <li>虚拟摇杆和 ScrollView 同时存在时，如何防止触摸事件冲突？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
