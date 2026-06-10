<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="9" title="输入系统" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>玩家的手怎么和游戏世界互动？键盘、触摸屏、手柄——它们是完全不同的物理设备，但在好的游戏架构里，它们应该被抽象成同一件事：<strong>"玩家在向某个方向输入"</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="⌨️" title="键盘事件：最简单的输入">
      <pre>systemEvent.on(SystemEvent.EventType.KEY_DOWN, (e: EventKeyboard) => {
  switch (e.keyCode) {
    case KeyCode.ARROW_LEFT:  this.moveDir.x = -1; break
    case KeyCode.ARROW_RIGHT: this.moveDir.x = 1; break
    case KeyCode.ARROW_UP:    this.moveDir.y = 1; break
    case KeyCode.ARROW_DOWN:  this.moveDir.y = -1; break
    case KeyCode.SPACE:       this.fire(); break
  }
})</pre>
      <div class="warn-box"><strong>别忘了清理：</strong> 和 Vue 不同，Cocos 的事件监听必须手动 off。在 onDestroy 中调用 systemEvent.off()，不然会内存泄漏。</div>
    </ConceptBlock>

    <ConceptBlock icon="👆" title="触摸事件：移动端的核心交互">
      <pre>this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
this.node.on(Input.EventType.TOUCH_MOVE, (e: EventTouch) => {
  const delta = e.getUIDelta()  // 手指移动的增量
  const pos = this.node.position
  this.node.setPosition(pos.x + delta.x, pos.y + delta.y)
}, this)
this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)</pre>
      <p>多点触控的关键是追踪 Touch ID——每个手指有一个唯一 ID，通过 <code>event.getID()</code> 区分。如果两个手指同时按，Touch ID 分别是 0 和 1。</p>
      <div class="tip-box">
        <strong>前端视角：事件传播模型完全一致。</strong> Cocos 的触摸事件和 DOM 事件用的是同一套传播模型——捕获阶段（capture）、目标阶段（target）、冒泡阶段（bubble）。如果你在前端用过 <code>addEventListener(el, handler, { capture: true })</code>，Cocos 里事件的传播方向和拦截逻辑你基本可以无缝迁移。连 <code>event.stopPropagation()</code> 这种 API 都存在。
      </div>
      <div class="tip-box">
        <strong>前端视角：Pointer Events API。</strong> 如果你用过 W3C Pointer Events（<code>pointerdown</code> / <code>pointermove</code> / <code>pointerup</code>），Cocos 的多点触控模型几乎一模一样：每个 touch 有一个唯一 ID（<code>e.getID()</code> 等价于 <code>e.pointerId</code>），位移增量（<code>getUIDelta()</code> 等价于 <code>e.movementX/Y</code>）。区别只是 Pointer Events 把鼠标和触摸统一成一个接口，Cocos 则把键盘和触摸分开处理。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🕹️" title="虚拟摇杆：触屏上的 D-Pad">
      <p>射击游戏在手机上最自然的操控方式不是"手指跟着飞机走"（手指会挡住你看子弹），而是<strong>虚拟摇杆</strong>——一个固定的摇杆区域，手指在其中移动来控制方向。飞机在摇杆上方飞行，不被手指遮挡。</p>
      <p>做法：创建一个固定的摇杆底座节点，在 TOUCH_MOVE 中计算手指相对底座中心的角度和距离，映射为飞机的移动方向和速度。</p>
    </ConceptBlock>

    <ConceptBlock icon="🥊" title="输入缓冲：格斗游戏的小秘密">
      <p>在格斗游戏里，你按下"重拳"的那一刻，如果角色还在上一个动画的收招帧中，这个输入会被丢弃。玩家会觉得"我按了怎么没反应？"</p>
      <p>输入缓冲就是<strong>把输入保存几帧</strong>，等角色能响应时再处理。Cocos 中可以简单实现：</p>
      <pre>private inputBuffer: string[] = []
private BUFFER_WINDOW = 5  // 保存 5 帧内的输入

onKeyDown(e: EventKeyboard) {
  this.inputBuffer.push(e.keyCode)
  if (this.inputBuffer.length > this.BUFFER_WINDOW) {
    this.inputBuffer.shift()
  }
}</pre>
      <div class="tip-box">
        <strong>前端视角：防抖与节流。</strong> 前端处理 scroll/resize/input 事件时用 debounce 和 throttle 来控制执行频率——别每个像素都处理，缓冲一下再批量执行。格斗游戏的输入缓冲也是这个思路：别每一帧都立刻响应原始输入，存起来看时机再释放。同一个抽象——"不要对原始事件流一对一反应，用策略缓冲处理"——在游戏和 Web 前端中各自换了个名字而已。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：同时支持键盘和触摸双输入">
      <p>一个好的游戏控制器应该让玩家不管用什么设备都能玩。我们来写一个同时响应键盘和触摸的 PlayerController：</p>
      <ol>
        <li><strong>创建脚本：</strong> 在 assets 下新建一个 TypeScript 脚本，命名为 <code>PlayerController</code>。挂到一个节点上（比如你的飞机节点）。</li>
        <li><strong>加入键盘检测：</strong> 在 <code>update(dt)</code> 中用 <code>Input.getKeyDown()</code> 或监听 <code>systemEvent</code> 来检测方向键（上下左右），控制节点位置变化。注意 <code>update</code> 是每帧触发，所以适合处理持续按住的情况；<code>KEY_DOWN</code> 事件只触发一次，你可以用它来做"按下空格开火"这种离散操作。</li>
      </ol>
      <pre>import { _decorator, Component, Node, input, Input, KeyCode, EventTouch } from 'cc'
const { ccclass, property } = _decorator

@ccclass('PlayerController')
export class PlayerController extends Component {
  private speed = 200

  update(dt: number) {
    // 持续检测：每帧检查按键是否被按住
    if (input.isKeyPressed(KeyCode.ARROW_LEFT)) {
      this.node.setPosition(this.node.position.x - this.speed * dt, this.node.position.y)
    }
    if (input.isKeyPressed(KeyCode.ARROW_RIGHT)) {
      this.node.setPosition(this.node.position.x + this.speed * dt, this.node.position.y)
    }
    if (input.isKeyPressed(KeyCode.ARROW_UP)) {
      this.node.setPosition(this.node.position.x, this.node.position.y + this.speed * dt)
    }
    if (input.isKeyPressed(KeyCode.ARROW_DOWN)) {
      this.node.setPosition(this.node.position.x, this.node.position.y - this.speed * dt)
    }
  }
}</pre>
      <ol start="3">
        <li><strong>加入触摸事件：</strong> 在 <code>onLoad</code> 中给同一个节点注册触摸事件——<code>TOUCH_START</code>、<code>TOUCH_MOVE</code>、<code>TOUCH_END</code>。在 <code>TOUCH_MOVE</code> 中获取手指的 delta 位移，直接加到节点位置上。别忘了在 <code>onDestroy</code> 中 <code>off</code> 掉。</li>
      </ol>
      <pre>onLoad() {
  this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
  this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
  this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
}

onTouchMove(e: EventTouch) {
  const delta = e.getUIDelta()
  const pos = this.node.position
  this.node.setPosition(pos.x + delta.x, pos.y + delta.y)
}

onDestroy() {
  this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this)
  this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
  this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this)
}</pre>
      <p><strong>运行测试：</strong> 在浏览器中按方向键控制飞机移动。然后打开 Chrome DevTools（F12），切换到移动端模拟模式（Toggle Device Toolbar），用鼠标模拟手指拖拽飞机——两种输入方式应该都能驱动同一个节点的位置。如果你有真机，扫码预览一下触摸手感，感受键盘和触屏在操作体验上的本质差异。</p>
      <div class="tip-box">
        <strong>动手小挑战：</strong> 试试同时按住右箭头和下箭头——飞机走对角线了吗？再试试在触摸移动的同时按住键盘方向键——两种输入源能同时工作吗？引擎层面它们互不冲突，但在你的逻辑层需要考虑"两个输入源同时发指令时听谁的"这个设计问题。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>DirectInput 到 XInput：</strong> Windows 上游戏手柄 API 的演化。DirectInput 时代每个手柄的按键映射都不同（噩梦），XInput 统一了标准（Xbox 360 手柄成为事实标准）。这个故事告诉我们：好的抽象层能省下无数适配时间。</li>
      </ul>
    </ConceptBlock>
    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>全局键盘事件（<code>systemEvent.on(KEY_DOWN)</code>）和节点触摸事件（<code>node.on(TOUCH_MOVE)</code>）最大的区别是什么？提示：想想事件的作用范围——键盘事件不管你的手指摸在屏幕哪个位置都能触发，但触摸事件跟节点绑定。这对游戏设计意味着什么？</li>
        <li>多点触控时，两个手指同时按在屏幕上，引擎怎么知道哪个手指动了？核心机制是什么？如果要做双摇杆（左边控制移动，右边控制射击），你需要怎么区分两个手指？</li>
        <li>格斗游戏里为什么要做"输入缓冲"？假设你按"重拳"的那一刻角色还在上一个动作的收招帧中（还不能响应新输入），如果不缓冲，这个输入就被丢了——玩家会觉得"我按了啊！"。缓冲几帧后，等角色可以行动时再执行，手感就"跟手"了。除了格斗游戏，你能想到其他需要输入缓冲的游戏类型吗？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
