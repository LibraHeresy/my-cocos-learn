<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="1" title="Cocos 世界观" duration="1-2 天">
    <ConceptBlock icon="🔄" title="前端 vs 游戏：核心驱动模型差异">
      <p>这是学习 Cocos <strong>最重要的认知转变</strong>。作为前端工程师，你习惯了"事件驱动"的编程模型——用户点击按钮，触发事件，执行回调，更新 DOM。但在游戏引擎中，世界是<strong>"帧驱动"</strong>的。</p>

      <h3>事件驱动（你熟悉的 Vue）</h3>
      <pre><code>// Vue: 等待用户交互
&lt;button @click="handleClick"&gt;发射&lt;/button&gt;

const handleClick = () => {
  // 只有点击时才执行
  bullets.push(createBullet())
}</code></pre>

      <h3>帧驱动（Cocos 的游戏世界）</h3>
      <pre><code>// Cocos: 每一帧都在运行
update(dt: number) {
  // 每秒执行 60 次（60fps）
  this.bullets.forEach(bullet => {
    bullet.y += this.speed * dt  // 持续移动
  })
  this.checkCollisions()
  this.spawnEnemies()
}</code></pre>

      <div class="tip-box">
        <strong>关键心态转变：</strong>在 Vue 中你"等待交互"，在 Cocos 中你要意识到"每一帧代码都在跑"。游戏世界是持续的、不间断的模拟循环。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="坐标系差异">
      <table>
        <thead>
          <tr><th>特性</th><th>Web / DOM</th><th>Cocos Creator</th></tr>
        </thead>
        <tbody>
          <tr><td>原点</td><td>左上角</td><td>默认画布中心（可配置）</td></tr>
          <tr><td>Y 轴方向</td><td>向下为正 ↑↓</td><td>向上为正 ↓↑</td></tr>
          <tr><td>单位</td><td>px（物理像素）</td><td>设计分辨率 + 自动适配</td></tr>
          <tr><td>旋转</td><td><code>transform: rotate()</code></td><td><code>Node.angle</code>（逆时针为正）</td></tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="⚙️" title="渲染管线">
      <p>Cocos 的渲染完全不同于浏览器的 DOM 渲染。它使用 Canvas / WebGL 直接向 GPU 提交绘制指令：</p>

      <pre><code>浏览器：DOM 树 → CSS 计算 → Layout → Paint → Composite
Cocos：  节点树 → RenderComponent → 渲染管线 → GPU 绘制</code></pre>

      <p>Cocos 中你看不到 HTML 元素，所有视觉输出都通过 <code>Sprite</code>、<code>Label</code>、<code>Graphics</code> 等渲染组件完成。</p>
    </ConceptBlock>
  </PhaseLayout>
</template>
