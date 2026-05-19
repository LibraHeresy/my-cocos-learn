<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="4" title="输入与交互" duration="1-2 天">
    <ConceptBlock icon="⌨️" title="键盘事件">
      <p>桌面端游戏的核心输入方式。Cocos 通过 <code>systemEvent</code> 监听键盘事件：</p>

      <pre><code>import { systemEvent, EventKeyboard, KeyCode } from 'cc'

onLoad() {
  systemEvent.on(EventKeyboard.KEY_DOWN, this.onKeyDown, this)
  systemEvent.on(EventKeyboard.KEY_UP, this.onKeyUp, this)
}

onDestroy() {
  systemEvent.off(EventKeyboard.KEY_DOWN, this.onKeyDown, this)
  systemEvent.off(EventKeyboard.KEY_UP, this.onKeyUp, this)
}</code></pre>

      <div class="warn-box">
        <strong>坑点：</strong>只监听 KEY_DOWN/KEY_UP 处理持续移动会很生硬——依赖操作系统的按键重复延迟。更好的做法是在 <code>update</code> 中持续检查按键状态。
      </div>

      <h3>持续移动的正确做法</h3>
      <pre><code>private keysDown = new Set&lt;KeyCode&gt;()

onLoad() {
  systemEvent.on(EventKeyboard.KEY_DOWN,
    (e) => this.keysDown.add(e.keyCode))
  systemEvent.on(EventKeyboard.KEY_UP,
    (e) => this.keysDown.delete(e.keyCode))
}

update(dt: number) {
  if (this.keysDown.has(KeyCode.ARROW_LEFT))
    this.node.x -= this.speed * dt
  if (this.keysDown.has(KeyCode.ARROW_RIGHT))
    this.node.x += this.speed * dt
  if (this.keysDown.has(KeyCode.ARROW_UP))
    this.node.y += this.speed * dt
  if (this.keysDown.has(KeyCode.ARROW_DOWN))
    this.node.y -= this.speed * dt
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="👆" title="触摸事件（移动端）">
      <p>如果你的飞机大战要跑在手机浏览器上，触摸事件是必须的：</p>

      <pre><code>this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)

onTouchMove(e: EventTouch) {
  const delta = e.getDelta()  // 相对上一帧的偏移
  this.node.x += delta.x
  this.node.y += delta.y
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🔌" title="统一的输入抽象">
      <p>实际项目建议封装一层输入管理器，对上层逻辑屏蔽键盘/触摸的差异：</p>

      <pre><code>// InputManager 提供统一接口
// → direction: { x: -1|0|1, y: -1|0|1 }
// → fire: boolean

// 键盘：方向键/WASD → direction，空格 → fire
// 触摸：左半屏滑动 → direction，按住右半屏 → fire</code></pre>
    </ConceptBlock>
  </PhaseLayout>
</template>
