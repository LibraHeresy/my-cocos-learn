<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="2" title="场景、节点、组件" duration="2-3 天">
    <ConceptBlock icon="🧱" title="三件套：Scene / Node / Component">
      <p>这三个概念是 Cocos 的骨架，理解它们的关系是后续所有学习的基础。</p>

      <h3>Scene（场景）</h3>
      <p>一个 Scene 就是一个独立的游戏界面，类比 Vue Router 的一个页面。游戏通常有多个场景：启动场景、主菜单场景、游戏场景、结算场景。</p>
      <pre><code>// 场景切换（类比 Vue 的 router.push）
import { director } from 'cc'
director.loadScene('GameScene')</code></pre>

      <h3>Node（节点）</h3>
      <p>节点是场景树的组成单元。每个节点有 transform（位置、旋转、缩放），但没有视觉外观。类比：一个空的 <code>&lt;div&gt;</code>。子节点的 transform 相对于父节点。</p>

      <h3>Component（组件）</h3>
      <p>组件挂在节点上，赋予节点具体能力。<strong>一个节点可以挂多个组件</strong>，这与 Vue 单组件模型完全不同。</p>
      <pre><code>// Vue:  一个 .vue 文件 = template + script + style
// Cocos: 一个 Node = Sprite + BoxCollider2D + 自定义脚本 + ...</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🪢" title="组件生命周期">
      <p>Cocos Component 的生命周期与 Vue 非常相似，但有两个关键区别——多了 <code>update</code> 和 <code>lateUpdate</code>：</p>

      <table>
        <thead>
          <tr><th>Cocos</th><th>Vue 对应</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><code>onLoad()</code></td><td><code>setup()</code></td><td>组件初始化，只执行一次</td></tr>
          <tr><td><code>start()</code></td><td><code>onMounted()</code></td><td>首次 update 之前执行</td></tr>
          <tr><td><code>update(dt)</code></td><td>— 无直接对应 —</td><td><strong>每帧执行</strong>，dt = 帧间隔（秒）</td></tr>
          <tr><td><code>lateUpdate()</code></td><td>— 无直接对应 —</td><td>所有 update 后执行，常用于摄像机跟随</td></tr>
          <tr><td><code>onDestroy()</code></td><td><code>onUnmounted()</code></td><td>组件销毁时执行</td></tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>dt 是什么？</strong>dt（deltaTime）是上一帧到当前帧的秒数。60fps 下 dt ≈ 0.016 秒。所有位移运算都要乘 dt，否则不同帧率下速度不一致。
      </div>

      <pre><code>import { Component, _decorator } from 'cc'
const { ccclass, property } = _decorator

@ccclass('Player')
export class Player extends Component {
  @property
  speed: number = 300  // 属性面板可编辑

  onLoad() {
    console.log('Player 加载完成')
  }

  update(dt: number) {
    // 每帧运行！速度 × dt = 本帧位移
    const move = this.speed * dt
    this.node.setPosition(
      this.node.position.x + move,
      this.node.position.y
    )
  }
}</code></pre>
    </ConceptBlock>
  </PhaseLayout>
</template>
