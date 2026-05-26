<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Phase {
  id: number
  icon: string
  title: string
  duration: string
  summary: string
  concepts: string[]
}

interface PhaseGroup {
  label: string
  tagline: string
  phases: Phase[]
}

const phaseGroups: PhaseGroup[] = [
  {
    label: '入门篇',
    tagline: '理解游戏引擎的心智模型 —— 从事件驱动到帧驱动，从 DOM 树到节点树',
    phases: [
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
    ],
  },
  {
    label: '核心篇',
    tagline: '游戏世界的"DOM 操作" —— 渲染、输入、碰撞，让画面动起来并产生规则',
    phases: [
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
        summary: '手写 AABB 碰撞检测、碰撞矩阵、射击游戏精确碰撞，让游戏产生"规则"。',
        concepts: ['AABB', '碰撞矩阵', '手写物理'],
      },
    ],
  },
  {
    label: '架构篇',
    tagline: '像设计 Vue 状态管理一样设计游戏架构 —— 可维护、不卡顿',
    phases: [
      {
        id: 6,
        icon: '🏗️',
        title: '游戏架构模式',
        duration: '2-3 天',
        summary: '对象池（Node Pool）、事件总线（Event Bus）、状态机——前端熟悉的设计模式在游戏中的落地。',
        concepts: ['Object Pool', 'Event Bus', '状态机', 'GameManager'],
      },
    ],
  },
  {
    label: '实战篇',
    tagline: '综合实战 —— 从零到完整可玩的像素飞机大战',
    phases: [
      {
        id: 7,
        icon: '✈️',
        title: '像素飞机大战实战',
        duration: '5-7 天',
        summary: '从零开始，独立完成一款完整可玩的像素飞机大战游戏。',
        concepts: ['玩家飞机', '子弹系统', '敌机AI', '道具', 'UI', '音效'],
      },
    ],
  },
  {
    label: '发布篇',
    tagline: '部署上线 —— 像部署 Web 应用一样发布小游戏',
    phases: [
      {
        id: 8,
        icon: '📱',
        title: '微信小游戏适配与发布',
        duration: '2-3 天',
        summary: '适配音频、分包加载、接入分享/排行榜/广告，完成审核上线全流程。',
        concepts: ['Bundle 分包', 'InnerAudioContext', '激励视频', 'onShow/onHide'],
      },
    ],
  },
]
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <header class="hero">
      <p class="hero-eyebrow">Vue 前端工程师 · Cocos Creator 学习路线</p>
      <h1>从零到<span class="highlight">像素飞机大战</span></h1>
      <p class="subtitle">
        一份为前端工程师量身定制的 Cocos 学习指南。每个阶段包含概念讲解、Vue ↔ Cocos
        对照和代码示例。
      </p>
    </header>

    <!-- 阶段卡片 -->
    <section class="phases-section">
      <h2 class="section-title">学习路径</h2>

      <div v-for="group in phaseGroups" :key="group.label" class="phase-group">
        <div class="group-header">
          <h3 class="group-label">{{ group.label }}</h3>
          <p class="group-tagline">{{ group.tagline }}</p>
        </div>
        <div class="phases-grid">
          <RouterLink v-for="p in group.phases" :key="p.id" :to="`/cocos/phase/${p.id}`" class="phase-card">
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
            <tr>
              <td>Vue 组件 <code>.vue</code></td>
              <td>Component 脚本（挂在 Node 上）</td>
            </tr>
            <tr>
              <td>DOM 树</td>
              <td>场景节点树 (Node Tree)</td>
            </tr>
            <tr>
              <td><code>v-if</code> / <code>v-show</code></td>
              <td><code>node.active</code></td>
            </tr>
            <tr>
              <td><code>ref</code> / <code>reactive</code></td>
              <td><code>@property</code> 装饰器</td>
            </tr>
            <tr>
              <td><code>@click</code> / <code>v-on</code></td>
              <td><code>node.on()</code> 事件系统</td>
            </tr>
            <tr>
              <td><code>watch</code> / <code>computed</code></td>
              <td><code>update(dt)</code> 每帧检查</td>
            </tr>
            <tr>
              <td>CSS transition</td>
              <td><code>cc.tween</code></td>
            </tr>
            <tr>
              <td>Vue Router</td>
              <td><code>director.loadScene()</code></td>
            </tr>
            <tr>
              <td>组件 props</td>
              <td><code>@property</code> 属性面板绑定</td>
            </tr>
            <tr>
              <td><code>mounted</code> / <code>unmounted</code></td>
              <td><code>onLoad</code> / <code>onDestroy</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Footer -->
    <footer class="home-footer">
      <div class="footer-card">
        <span class="footer-icon">⏱️</span>
        <div>
          <p>总共约 <strong>4-5 周</strong>，每天投入 2-4 小时。</p>
          <p class="footer-path">
            核心路径：<em
              >入门：帧驱动+节点体系 → 核心：渲染+输入+碰撞 → 架构：对象池+状态机 → 实战：飞机大战 → 发布：微信小游戏</em
            >
          </p>
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

.phase-group {
  margin-bottom: 2rem;
}

.phase-group:last-child {
  margin-bottom: 0;
}

.group-header {
  margin-bottom: 0.85rem;
}

.group-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.2rem;
  display: inline-block;
  background: var(--color-primary-soft);
  padding: 0.15em 0.7em;
  border-radius: 4px;
}

.group-tagline {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin-top: 0.4rem;
  margin-bottom: 0;
  padding-left: 0.15rem;
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
  transition:
    border-color 0.25s,
    box-shadow 0.25s,
    transform 0.2s;
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

@media (max-width: 640px) {
  .home {
    padding: 1.5rem 1rem 2rem;
  }

  .hero {
    margin-bottom: 2rem;
  }

  .hero h1 {
    font-size: 1.6rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .phases-grid {
    grid-template-columns: 1fr;
  }

  .footer-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
