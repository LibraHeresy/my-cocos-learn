<script setup lang="ts">
import { RouterLink } from 'vue-router'

const phases = [
  {
    id: 1,
    icon: '🧭',
    title: 'Cocos 世界观',
    duration: '1-2 天',
    summary: '理解游戏引擎与前端框架的本质区别：帧驱动 vs 事件驱动，坐标系，渲染管线。',
    concepts: ['帧驱动模型', '坐标系', '渲染管线'],
  },
  {
    id: 2,
    icon: '🧱',
    title: '场景、节点、组件',
    duration: '2-3 天',
    summary: '掌握 Cocos 核心架构：Scene / Node / Component，理解组件化与 Vue 的异同。',
    concepts: ['Scene', 'Node', 'Component', '生命周期'],
  },
  {
    id: 3,
    icon: '🎨',
    title: '资源与渲染',
    duration: '2-3 天',
    summary: '学会导入和管理资源，用 Sprite / Animation / Label 渲染游戏画面。',
    concepts: ['Sprite', 'Animation', 'Label', '资源加载'],
  },
  {
    id: 4,
    icon: '🎮',
    title: '输入与交互',
    duration: '1-2 天',
    summary: '处理键盘和触摸事件，让玩家能够操控游戏角色。',
    concepts: ['键盘事件', '触摸事件', '输入抽象'],
  },
  {
    id: 5,
    icon: '💥',
    title: '碰撞检测',
    duration: '2-3 天',
    summary: '碰撞系统入门：内置 Collider2D 与手写 AABB 碰撞，让游戏产生"规则"。',
    concepts: ['Collider2D', 'AABB', '碰撞矩阵'],
  },
  {
    id: 6,
    icon: '🏗️',
    title: '游戏架构模式',
    duration: '2-3 天',
    summary: '对象池、事件总线、状态机——写出不卡顿、可维护的游戏代码。',
    concepts: ['Object Pool', 'Event Bus', '状态机', 'GameManager'],
  },
  {
    id: 7,
    icon: '✈️',
    title: '像素飞机大战实战',
    duration: '5-7 天',
    summary: '从零开始，独立完成一款完整可玩的像素飞机大战游戏。',
    concepts: ['玩家飞机', '子弹系统', '敌机AI', '道具', 'UI', '音效'],
  },
]
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <header class="hero">
      <p class="hero-eyebrow">Vue 前端工程师 · Cocos Creator 学习路线</p>
      <h1>从零到<span class="highlight">像素飞机大战</span></h1>
      <p class="subtitle">一份为前端工程师量身定制的 Cocos 学习指南。每个阶段包含概念讲解、Vue ↔ Cocos 对照和代码示例。</p>
    </header>

    <!-- 阶段卡片 -->
    <section class="phases-section">
      <h2 class="section-title">学习路径</h2>
      <div class="phases-grid">
        <RouterLink
          v-for="p in phases"
          :key="p.id"
          :to="`/phase/${p.id}`"
          class="phase-card"
        >
          <div class="card-top">
            <span class="card-icon">{{ p.icon }}</span>
            <span class="card-duration">{{ p.duration }}</span>
          </div>
          <span class="card-phase">第 {{ p.id }} 阶段</span>
          <h3>{{ p.title }}</h3>
          <p class="card-summary">{{ p.summary }}</p>
          <div class="card-tags">
            <span v-for="c in p.concepts" :key="c" class="tag">{{ c }}</span>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- 速查表 -->
    <section class="mapping-section">
      <h2 class="section-title">Vue → Cocos 概念速查</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Vue / 前端</th>
              <th>Cocos Creator</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Vue 组件 <code>.vue</code></td><td>Component 脚本（挂在 Node 上）</td></tr>
            <tr><td>DOM 树</td><td>场景节点树 (Node Tree)</td></tr>
            <tr><td><code>v-if</code> / <code>v-show</code></td><td><code>node.active</code></td></tr>
            <tr><td><code>ref</code> / <code>reactive</code></td><td><code>@property</code> 装饰器</td></tr>
            <tr><td><code>@click</code> / <code>v-on</code></td><td><code>node.on()</code> 事件系统</td></tr>
            <tr><td><code>watch</code> / <code>computed</code></td><td><code>update(dt)</code> 每帧检查</td></tr>
            <tr><td>CSS transition</td><td><code>cc.tween</code></td></tr>
            <tr><td>Vue Router</td><td><code>director.loadScene()</code></td></tr>
            <tr><td>组件 props</td><td><code>@property</code> 属性面板绑定</td></tr>
            <tr><td><code>mounted</code> / <code>unmounted</code></td><td><code>onLoad</code> / <code>onDestroy</code></td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Footer -->
    <footer class="home-footer">
      <div class="footer-card">
        <span class="footer-icon">⏱️</span>
        <div>
          <p>总共约 <strong>3-4 周</strong>，每天投入 2-4 小时。</p>
          <p class="footer-path">核心路径：<em>帧驱动 → 节点体系 → 资源渲染 → 输入控制 → 碰撞检测 → 架构模式 → 实战</em></p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 3rem 1.5rem 2rem;
}

/* ---- Hero ---- */
.hero {
  text-align: center;
  margin-bottom: 3.5rem;
}

.hero-eyebrow {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.65rem;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.85rem;
  line-height: 1.3;
}

.highlight {
  color: var(--color-accent);
  position: relative;
}

.highlight::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 2px;
  width: 100%;
  height: 3px;
  background: var(--color-accent-soft);
  border-radius: 2px;
  opacity: 0.6;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1.05rem;
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ---- Section title ---- */
.section-title {
  font-size: 1.2rem;
  margin-bottom: 1.15rem;
  padding-left: 0.9rem;
  border-left: 3px solid var(--color-primary);
}

/* ---- 阶段卡片 ---- */
.phases-section {
  margin-bottom: 3.5rem;
}

.phases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
  gap: 1.15rem;
}

.phase-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 1.3rem;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
  color: var(--color-text);
  cursor: pointer;
}

.phase-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.card-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.card-duration {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  background: var(--color-bg-soft);
  padding: 0.2em 0.6em;
  border-radius: 10px;
}

.card-phase {
  font-size: 0.7rem;
  color: var(--color-primary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.3rem;
}

.phase-card h3 {
  font-size: 1.08rem;
  margin-bottom: 0.45rem;
}

.card-summary {
  font-size: 0.83rem;
  color: var(--color-text-muted);
  line-height: 1.65;
  flex: 1;
  margin-bottom: 0.85rem;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tag {
  font-size: 0.68rem;
  background: var(--color-bg-soft);
  padding: 0.2em 0.6em;
  border-radius: 10px;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-light);
}

/* ---- 速查表 ---- */
.mapping-section {
  margin-bottom: 3rem;
}

.table-wrapper {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* ---- Footer ---- */
.home-footer {
  text-align: center;
}

.footer-card {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.8rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 1.15rem 1.4rem;
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.footer-icon {
  font-size: 1.4rem;
  line-height: 1;
  margin-top: 0.1rem;
}

.footer-card p {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.footer-card p:last-child {
  margin-bottom: 0;
}

.footer-path {
  font-size: 0.82rem;
}
</style>
