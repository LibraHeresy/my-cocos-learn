<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="4" title="输入与交互" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>用键盘方向键/WASD 流畅控制角色移动（不依赖系统按键重复）</li>
        <li>处理<strong>触摸事件</strong>，让游戏在手机上也能操作</li>
        <li>封装一个统一的 <strong>InputManager</strong>，屏蔽键盘/触摸的差异</li>
        <li>让飞机大战的玩家飞机在屏幕内自由移动 + 发射子弹</li>
      </ul>
    </ConceptBlock>

    <!-- ============ 键盘事件 ============ -->
    <ConceptBlock icon="⌨️" title="键盘输入：从基础到正确">
      <p>
        键盘输入是桌面端游戏的核心。但只监听 <code>KEY_DOWN</code> + <code>KEY_UP</code>
        <strong>不够</strong>——处理持续移动时会有问题。
      </p>

      <div class="warn-box">
        <strong>小游戏注意：</strong>微信小游戏<strong>没有键盘事件</strong>。本节键盘方案仅用于
        Web/桌面预览。在小游戏中，移动必须靠触摸或虚拟摇杆。好在本章末尾的 InputManager
        封装已经屏蔽了键盘/触摸的差异——你只需要确保 InputManager 中小游戏路径走触摸逻辑即可，Player
        代码不用改。
      </div>

      <h3>错误做法：</h3>
      <pre><code>// ❌ 只在 keyDown 回调中移动
systemEvent.on(EventKeyboard.KEY_DOWN, (e) => {
  if (e.keyCode === KeyCode.ARROW_LEFT)
    this.node.x -= 10  // 只移动一次！不会持续移动
})

// ❌ 依赖系统按键重复延迟（约 30ms，且不可控）
// 移动会先顿一下，然后才连续——手感很差</code></pre>

      <h3>正确做法：按键状态表 + update 轮询</h3>
      <pre><code>import { Component, _decorator, systemEvent, EventKeyboard, KeyCode } from 'cc'
const { ccclass } = _decorator

@ccclass('PlayerController')
export class PlayerController extends Component {

  @property speed: number = 300

  // 按键状态表：记录哪些键正在被按住
  private keysDown = new Set&lt;number&gt;()

  onLoad() {
    systemEvent.on(EventKeyboard.KEY_DOWN,
      (e) => this.keysDown.add(e.keyCode))
    systemEvent.on(EventKeyboard.KEY_UP,
      (e) => this.keysDown.delete(e.keyCode))
  }

  update(dt: number) {
    // 每帧检查按键状态——持续按住 = 持续移动
    if (this.keysDown.has(KeyCode.ARROW_LEFT) ||
        this.keysDown.has(KeyCode.KEY_A))
      this.node.x -= this.speed * dt

    if (this.keysDown.has(KeyCode.ARROW_RIGHT) ||
        this.keysDown.has(KeyCode.KEY_D))
      this.node.x += this.speed * dt

    if (this.keysDown.has(KeyCode.ARROW_UP) ||
        this.keysDown.has(KeyCode.KEY_W))
      this.node.y += this.speed * dt

    if (this.keysDown.has(KeyCode.ARROW_DOWN) ||
        this.keysDown.has(KeyCode.KEY_S))
      this.node.y -= this.speed * dt
  }

  onDestroy() {
    // 必须解绑！否则切换场景后还会触发
    systemEvent.off(EventKeyboard.KEY_DOWN)
    systemEvent.off(EventKeyboard.KEY_UP)
  }
}</code></pre>

      <div class="tip-box">
        <strong>Set vs 对象：</strong>用 <code>Set&lt;number&gt;()</code> 管理按键状态比
        <code>{}</code> 更合适——add/delete/has 语义清晰，且 KeyCode 本身就是 number。
      </div>
    </ConceptBlock>

    <!-- ============ 触摸事件 ============ -->
    <ConceptBlock icon="👆" title="触摸输入：为移动端做准备">
      <p>如果你希望飞机大战在手机上也能玩（或者发布为微信小游戏），触摸事件是必须的：</p>

      <pre><code>import { Component, _decorator, Node, EventTouch, UITransform } from 'cc'
const { ccclass } = _decorator

@ccclass('TouchInput')
export class TouchInput extends Component {

  onLoad() {
    // 监听整个节点的触摸事件
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
  }

  private onTouchStart(e: EventTouch) {
    const pos = e.getUILocation()  // UI 坐标
    console.log(`触摸开始: (${pos.x}, ${pos.y})`)
  }

  private onTouchMove(e: EventTouch) {
    // getDelta(): 相对上一帧的位移（类比 mouse delta）
    const delta = e.getDelta()
    this.node.x += delta.x
    this.node.y += delta.y
  }

  private onTouchEnd(e: EventTouch) {
    console.log('触摸结束')
  }

  onDestroy() {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this)
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this)
  }
}</code></pre>

      <div class="warn-box">
        <strong>注意：</strong>要让触摸生效，节点必须有 <code>UITransform</code> 组件（大部分 UI
        节点默认就有）。如果触摸不响应，先检查节点尺寸是否 > 0。
        <br /><br />
        本节只涉及<strong>单点触摸</strong>的基础操作。多点触控、双指缩放、手势识别、虚拟摇杆等进阶话题见 <strong>Phase 21（多点触控与手势）</strong>。
      </div>
    </ConceptBlock>

    <!-- ============ InputManager ============ -->
    <ConceptBlock icon="🎮" title="封装 InputManager：统一键盘和触摸">
      <p>游戏逻辑不应该关心"玩家用的是键盘还是手指"。一个好的 InputManager 对上层提供统一接口：</p>

      <pre><code>// ---- InputManager.ts ----
import { Component, _decorator, systemEvent, EventKeyboard, KeyCode,
         Node, EventTouch, view, Vec2, Vec3 } from 'cc'
const { ccclass } = _decorator

export interface InputState {
  direction: Vec2     // { x: -1|0|1, y: -1|0|1 }
  fire: boolean       // 射击键是否按下
}

@ccclass('InputManager')
export class InputManager extends Component {

  static instance: InputManager  // 单例

  private _keysDown = new Set&lt;number&gt;()
  private _touchActive = false
  private _touchDir = new Vec2()
  private _fireDown = false

  onLoad() {
    InputManager.instance = this  // 单例模式

    // 键盘监听
    systemEvent.on(EventKeyboard.KEY_DOWN, this.onKeyDown, this)
    systemEvent.on(EventKeyboard.KEY_UP, this.onKeyUp, this)

    // 触摸监听（挂在 Canvas 上接收全屏触摸）
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
  }

  get input(): InputState {
    const dir = new Vec2()

    // 键盘方向
    if (this._keysDown.has(KeyCode.ARROW_LEFT)  ||
        this._keysDown.has(KeyCode.KEY_A))        dir.x -= 1
    if (this._keysDown.has(KeyCode.ARROW_RIGHT) ||
        this._keysDown.has(KeyCode.KEY_D))        dir.x += 1
    if (this._keysDown.has(KeyCode.ARROW_UP)    ||
        this._keysDown.has(KeyCode.KEY_W))        dir.y += 1
    if (this._keysDown.has(KeyCode.ARROW_DOWN)  ||
        this._keysDown.has(KeyCode.KEY_S))        dir.y -= 1

    // 触摸方向覆盖（如果有触摸）
    if (this._touchActive) {
      dir.set(this._touchDir)
    }

    return {
      direction: dir,
      fire: this._fireDown ||
            this._keysDown.has(KeyCode.SPACE) ||
            this._keysDown.has(KeyCode.KEY_J)
    }
  }

  // ---- 键盘回调 ----
  private onKeyDown(e: EventKeyboard) {
    this._keysDown.add(e.keyCode)
  }
  private onKeyUp(e: EventKeyboard) {
    this._keysDown.delete(e.keyCode)
  }

  // ---- 触摸回调 ----
  private onTouchStart(e: EventTouch) {
    const x = e.getUILocation().x
    // 左半屏 = 移动，右半屏 = 射击（移动端常用布局）
    if (x < view.getVisibleSize().width / 2) {
      this._touchActive = true
    } else {
      this._fireDown = true
    }
  }

  private onTouchMove(e: EventTouch) {
    if (!this._touchActive) return
    const delta = e.getDelta()
    this._touchDir.x = delta.x > 10 ? 1 : delta.x < -10 ? -1 : 0
    this._touchDir.y = delta.y > 10 ? 1 : delta.y < -10 ? -1 : 0
  }

  private onTouchEnd(e: EventTouch) {
    this._touchActive = false
    this._fireDown = false
    this._touchDir.set(0, 0)
  }

  onDestroy() {
    systemEvent.off(EventKeyboard.KEY_DOWN)
    systemEvent.off(EventKeyboard.KEY_UP)
    this.node.off(Node.EventType.TOUCH_START)
    this.node.off(Node.EventType.TOUCH_MOVE)
    this.node.off(Node.EventType.TOUCH_END)
  }
}</code></pre>

      <h3>使用 InputManager</h3>
      <pre><code>// ---- Player.ts ----
update(dt: number) {
  const input = InputManager.instance.input

  // 移动
  this.node.x += input.direction.x * this.speed * dt
  this.node.y += input.direction.y * this.speed * dt

  // 射击
  if (input.fire) {
    this.tryShoot()
  }

  // 限制在屏幕内
  this.clampToScreen()
}</code></pre>

      <div class="tip-box">
        <strong>设计原则：</strong>游戏逻辑只依赖
        <code>InputState</code> 接口，不关心底层是键盘还是触摸。以后加手柄支持，只需要在
        InputManager 中增加处理，Player 代码不动。
      </div>
    </ConceptBlock>

    <!-- ============ 高级输入模式 ============ -->
    <ConceptBlock icon="⚡" title="高级输入模式：组合键 / 长按 / 双击">
      <p>飞机大战的操控远不止上下左右。下面是三种常见的进阶输入需求：</p>

      <h3>1. 组合键：斜向移动</h3>
      <p>
        玩家同时按住 ↑ 和 → 时，飞机应该向右上移动——速度<strong>不能翻倍</strong>。InputManager 中
        <code>dir.x</code> 和 <code>dir.y</code> 各自独立，Player 中对方向向量做归一化：
      </p>
      <pre><code>// Player.ts —— 斜向移动归一化
update(dt: number) {
  const input = InputManager.instance.input
  const dir = input.direction.clone()

  // 如果同时按下水平和垂直键，归一化防止斜向速度翻倍
  if (dir.length() > 1) {
    dir.normalize()
  }

  this.node.x += dir.x * this.speed * dt
  this.node.y += dir.y * this.speed * dt
}</code></pre>

      <h3>2. 长按：蓄力攻击 / 连射</h3>
      <p>记录按键按下的时刻，在 update 中比较持续时间：</p>
      <pre><code>// InputManager 中增加长按检测
private _firePressTime = 0
private _fireHeld = false

private onKeyDown(e: EventKeyboard) {
  this._keysDown.add(e.keyCode)
  if (e.keyCode === KeyCode.SPACE) {
    this._firePressTime = Date.now()
    this._fireHeld = true
  }
}

private onKeyUp(e: EventKeyboard) {
  this._keysDown.delete(e.keyCode)
  if (e.keyCode === KeyCode.SPACE) {
    this._fireHeld = false
  }
}

// 对外暴露：是否长按超过 0.3 秒（用于蓄力判定）
get isHoldingFire(): boolean {
  return this._fireHeld &&
    (Date.now() - this._firePressTime) > 300
}</code></pre>

      <h3>3. 双击：冲刺 / 闪避</h3>
      <p>双击检测的核心：两次同方向按键间隔 < 300ms：</p>
      <pre><code>// Player.ts —— 双击方向键触发冲刺
private _lastTapTime = 0
private _lastTapKey = -1
private _dashCooldown = 0

update(dt: number) {
  // 检测双击（同一键 300ms 内按两次）
  for (const key of [
    KeyCode.ARROW_LEFT, KeyCode.ARROW_RIGHT,
    KeyCode.ARROW_UP, KeyCode.ARROW_DOWN
  ]) {
    if (this.keysDown.has(key) && key !== this._lastTapKey) {
      const now = Date.now()
      if (now - this._lastTapTime < 300 && key === this._lastTapKey) {
        this.doDash(key)  // 触发冲刺
        this._lastTapTime = 0
      } else {
        this._lastTapTime = now
        this._lastTapKey = key
      }
    }
  }
}

private doDash(key: KeyCode) {
  if (this._dashCooldown > 0) return
  // ... 冲刺逻辑 ...
}</code></pre>

      <div class="tip-box">
        <strong>取舍建议：</strong
        >双击冲刺需要记录额外状态，复杂度不低。对于飞机大战，如果已有武器升级/道具系统，冲刺可以作为<strong>拾取"加速道具"后的能力</strong>，而不是基础操作。评估你的游戏是否需要。
      </div>
    </ConceptBlock>

    <!-- ============ 动手练习 ============ -->
    <ConceptBlock icon="🔨" title="动手练习：可操控的玩家飞机">
      <p>把本节的知识串起来，实现一个完整的玩家飞机操控：</p>

      <ol>
        <li>创建 Canvas 节点，挂 InputManager 脚本（设为单例）</li>
        <li>创建 Player 节点 + Sprite（用方块代替飞机也行）</li>
        <li>Player 脚本中通过 <code>InputManager.instance.input</code> 读取输入</li>
        <li>方向键/WASD 控制移动，空格键发射子弹</li>
        <li>限制飞机不能飞出屏幕</li>
      </ol>

      <h3>屏幕限制参考</h3>
      <pre><code>private clampToScreen() {
  const screenSize = view.getVisibleSize()
  const halfW = screenSize.width / 2
  const halfH = screenSize.height / 2

  // 限制在屏幕内（留一点边距）
  const margin = 30
  this.node.x = Math.max(-halfW + margin,
    Math.min(halfW - margin, this.node.x))
  this.node.y = Math.max(-halfH + margin,
    Math.min(halfH - margin, this.node.y))
}</code></pre>

      <div class="tip-box">
        <strong>完成标准：</strong
        >玩家飞机能用键盘流畅移动（不会先顿一下才动），空格键能发射子弹。触摸屏上左半屏滑动控制方向，右半屏按住射击。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>为什么处理持续移动不能只靠 <code>KEY_DOWN</code> 回调？</li>
        <li>按键状态表用什么数据结构管理？为什么？</li>
        <li><code>getDelta()</code> 和 <code>getLocation()</code> 的区别是什么？</li>
        <li>InputManager 的设计中，为什么要把键盘和触摸的差异屏蔽掉？</li>
        <li>
          Cocos 的 <code>systemEvent</code> 和 <code>node.on</code> 有什么不同？分别用于什么场景？
        </li>
      </ul>
    </ConceptBlock>
  </PhaseLayout>
</template>
