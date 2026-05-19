<script setup lang="ts">
import { RouterLink } from 'vue-router'

const phases = [
  {
    id: 1,
    icon: '🔧',
    title: 'Aseprite 工具入门',
    duration: '1 天',
    summary:
      '安装 Aseprite，熟悉界面布局，掌握画笔、橡皮、图层、调色板等基本操作，画出你的第一个像素角色。',
    concepts: ['画布设置', '图层管理', '画笔工具', '调色板', '导出图片'],
  },
  {
    id: 2,
    icon: '✏️',
    title: '像素画基本技法',
    duration: '1-2 天',
    summary: '无锯齿线条、配色原理、明暗上色、抖动技法——让你的像素画从"能看"到"好看"。',
    concepts: ['抗锯齿线条', '调色技巧', '明暗关系', '抖动技法', '轮廓处理'],
  },
  {
    id: 3,
    icon: '✈️',
    title: '飞机大战素材绘制',
    duration: '2 天',
    summary: '手把手绘制玩家飞机、三种敌机、子弹、道具和背景星空——飞机大战需要的所有美术素材。',
    concepts: ['玩家飞机', '敌机设计', '子弹特效', '道具图标', '星空背景'],
  },
  {
    id: 4,
    icon: '🎬',
    title: '帧动画制作',
    duration: '1-2 天',
    summary:
      '用 Aseprite 的动画时间轴制作爆炸帧动画、引擎火焰动画，导出为 SpriteSheet 导入 Cocos。',
    concepts: ['时间轴', '洋葱皮', '帧动画', '导出设置', 'Cocos 导入'],
  },
]
</script>

<template>
  <div class="home">
    <header class="hero">
      <p class="hero-eyebrow">像素美术 · Aseprite 教学</p>
      <h1>画出你的<span class="highlight">飞机大战</span></h1>
      <p class="subtitle">
        零基础像素画入门。用 Aseprite
        从工具操作学起，最终独立画出飞机大战所需的全部像素素材和帧动画。
      </p>
    </header>

    <section class="phases-section">
      <h2 class="section-title">学习路径</h2>
      <div class="phases-grid">
        <RouterLink v-for="p in phases" :key="p.id" :to="`/art/phase/${p.id}`" class="phase-card">
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

    <footer class="home-footer">
      <div class="footer-card">
        <span class="footer-icon">🎨</span>
        <div>
          <p>总共约 <strong>5-7 天</strong>，每天投入 1-2 小时。</p>
          <p class="footer-path">
            核心路径：<em>Aseprite 工具 → 基本技法 → 飞机大战素材 → 帧动画导出</em>
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

.section-title {
  font-size: 1.2rem;
  margin-bottom: 1.15rem;
  padding-left: 0.9rem;
  border-left: 3px solid var(--color-primary);
}

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
