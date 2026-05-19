<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="5" title="碰撞检测" duration="2-3 天">
    <ConceptBlock icon="⚖️" title="两种碰撞检测方式">
      <p>Cocos 提供内置的物理碰撞系统，但对于像素飞机大战来说，<strong>手动碰撞检测通常更合适</strong>。</p>

      <h3>方式一：内置 Collider2D + RigidBody2D</h3>
      <p>功能完整，支持碰撞矩阵、触发器。但每个节点挂物理组件开销较大，大量子弹/敌人场景下性能不理想。</p>

      <h3>方式二：手动 AABB / 圆形碰撞（推荐）</h3>
      <p>轻量、可控、不需要物理引擎。子弹和敌人的碰撞完全可以用简单的矩形/圆形距离判断搞定。</p>

      <div class="tip-box">
        <strong>推荐：</strong>像素飞机大战用方案二。代码量少，性能好，可控性强。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="AABB 碰撞检测">
      <p>AABB（Axis-Aligned Bounding Box）即轴对齐包围盒——最简单的矩形碰撞检测：</p>

      <pre><code>// AABB 碰撞检测
function rectCollide(a: Rect, b: Rect): boolean {
  return (
    a.xMin < b.xMax &&
    a.xMax > b.xMin &&
    a.yMin < b.yMax &&
    a.yMax > b.yMin
  )
}

// 每帧遍历所有子弹和敌人
update(dt: number) {
  for (const bullet of this.bullets) {
    for (const enemy of this.enemies) {
      if (rectCollide(bullet.getBBox(), enemy.getBBox())) {
        this.onBulletHit(bullet, enemy)
      }
    }
  }
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🚀" title="高速物体的穿透问题">
      <p>如果子弹速度很快（每帧移动距离 > 碰撞体尺寸），可能出现<strong>"穿透"</strong>现象——子弹在两帧之间穿过了敌人，碰撞检测失败。</p>

      <p><strong>解决方案：</strong></p>
      <ul>
        <li>限制子弹速度，确保每帧位移 &lt; 碰撞体尺寸</li>
        <li>或者做"连续碰撞检测"：从上一帧位置到当前帧位置做射线检测</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="📊" title="碰撞矩阵">
      <p>不同阵营之间的碰撞关系一览：</p>

      <table>
        <thead>
          <tr><th></th><th>玩家飞机</th><th>玩家子弹</th><th>敌机</th><th>敌机子弹</th><th>道具</th></tr>
        </thead>
        <tbody>
          <tr><td>玩家飞机</td><td>—</td><td>—</td><td class="hit">💥 碰撞</td><td class="hit">💥 碰撞</td><td class="pick">⭐ 拾取</td></tr>
          <tr><td>玩家子弹</td><td>—</td><td>—</td><td class="hit">💥 碰撞</td><td>—</td><td>—</td></tr>
          <tr><td>敌机</td><td class="hit">💥 碰撞</td><td class="hit">💥 碰撞</td><td>—</td><td>—</td><td>—</td></tr>
          <tr><td>敌机子弹</td><td class="hit">💥 碰撞</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
        </tbody>
      </table>
    </ConceptBlock>
  </PhaseLayout>
</template>

<style scoped>
.hit {
  color: var(--color-accent);
  font-weight: 600;
}

.pick {
  color: var(--color-success);
  font-weight: 600;
}
</style>
