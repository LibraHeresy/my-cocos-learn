<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="6" title="游戏架构模式" duration="2-3 天">
    <ConceptBlock icon="🏊" title="对象池（Object Pool）">
      <p>这是游戏开发<strong>最重要的性能优化模式</strong>。飞机大战中有大量频繁创建和销毁的对象：子弹、敌机、爆炸特效。如果每发子弹都 <code>new</code> / <code>destroy</code>，GC 频繁触发导致卡顿。</p>

      <pre><code>class ObjectPool&lt;T extends Node&gt; {
  private pool: T[] = []

  // 获取一个"激活"的对象
  get(): T {
    let obj = this.pool.find(o => !o.active)
    if (!obj) {
      obj = instantiate(this.prefab)  // 池空了才创建
      this.pool.push(obj)
    }
    obj.active = true
    return obj
  }

  // "回收"到池子（不销毁，只隐藏）
  put(obj: T) {
    obj.active = false
  }
}</code></pre>

      <div class="tip-box">
        <strong>类比：</strong>就像 Vue 中 <code>v-for</code> 使用 <code>:key</code> 来复用 DOM 元素，避免频繁创建/销毁的开销。对象池 = 游戏版的 DOM 复用。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📡" title="事件总线（Event Bus）">
      <p>游戏各个模块需要通信但不应直接耦合。事件总线是经典解耦方案：</p>

      <pre><code>class EventBus {
  private events = new Map&lt;string, Function[]&gt;()
  on(event: string, fn: Function) { /* ... */ }
  off(event: string, fn: Function) { /* ... */ }
  emit(event: string, ...args: any[]) { /* ... */ }
}

// 敌机死亡 → 发射事件
eventBus.emit('enemy:killed', enemy.points)

// UI 系统监听分数变化
eventBus.on('enemy:killed', (points) => {
  this.score += points
})

// 音效系统监听爆炸
eventBus.on('enemy:killed', () => {
  this.playExplosionSound()
})</code></pre>

      <div class="warn-box">
        <strong>注意：</strong>游戏中的事件比前端频繁得多，不要在 <code>update</code> 中每帧 emit 大量事件。用事件通知"发生了某件事"，而不是通知"每帧的状态"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎛️" title="GameManager 单例">
      <p>游戏需要一个中枢来管理全局状态：</p>

      <pre><code>enum GameState {
  WAITING,   // 等待开始
  PLAYING,   // 游戏中
  PAUSED,    // 暂停
  GAMEOVER,  // 结束
}

class GameManager {
  private static _instance: GameManager
  static get instance() { /* 单例获取 */ }

  state: GameState = GameState.WAITING
  score: number = 0
  lives: number = 3

  startGame()  { this.state = GameState.PLAYING }
  pauseGame()  { this.state = GameState.PAUSED }
  gameOver()   { this.state = GameState.GAMEOVER }
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🤖" title="状态机（AI 行为）">
      <p>敌机不是随机乱动的——它们有行为模式。用状态机来描述：</p>

      <pre><code>// 敌机 AI 状态机
enum EnemyState {
  ENTER,    // 从屏幕外飞入
  IDLE,     // 在屏幕中移动/射击
  CHASE,    // 追踪玩家
  ESCAPE,   // 逃跑（BOSS 血量低时）
}

// ENTER → 飞到指定位置 → IDLE
// IDLE → 检测到玩家靠近 → CHASE
// CHASE → 血量低于阈值 → ESCAPE</code></pre>
    </ConceptBlock>
  </PhaseLayout>
</template>
