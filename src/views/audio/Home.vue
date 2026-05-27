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
    label: '创作篇',
    tagline: '像用 Figma 出设计稿一样，用免费工具从零制作游戏音效和背景音乐 —— 无需录音设备',
    phases: [
      {
        id: 1,
        icon: '🔊',
        title: '音频基础与免费工具',
        duration: '1 天',
        summary: '采样率、位深度、音频格式（WAV/OGG）、BFXR 合成器上手、Audacity 基础编辑。',
        concepts: ['采样率与位深度', 'BFXR', 'Audacity', 'WAV vs OGG'],
      },
      {
        id: 2,
        icon: '🔫',
        title: '射击游戏音效制作',
        duration: '1-2 天',
        summary: 'ADSR 包络塑形、12 种射击游戏核心音效逐一制作、频率分层避免音频"打架"。',
        concepts: ['ADSR 包络', '频率分层', 'BFXR 参数调校', '音效命名规范'],
      },
      {
        id: 3,
        icon: '🎵',
        title: '背景音乐基础',
        duration: '1 天',
        summary: 'Bosca Ceoil 零门槛作曲、Intro+Loop 音乐结构、无缝循环技巧、导出 OGG。',
        concepts: ['Bosca Ceoil', 'Pattern 编排', '无缝循环', 'BGM 频率避让'],
      },
    ],
  },
  {
    label: '集成篇',
    tagline: '将音频资源接入 Cocos —— 像 import 一个 npm 包一样，挂载、播放、控制',
    phases: [
      {
        id: 4,
        icon: '🎮',
        title: 'Cocos 音频集成',
        duration: '1-2 天',
        summary: 'AudioSource 组件、AudioClip 资源加载、AudioManager 单例、BGM 淡入淡出、音量控制。',
        concepts: ['AudioSource', 'AudioClip', 'AudioManager', 'cc.tween 淡入淡出'],
      },
    ],
  },
]
</script>

<template>
  <div class="home">
    <header class="hero">
      <p class="hero-eyebrow">游戏音效</p>
      <h1>从<span class="highlight">零基础</span>到完整游戏音频</h1>
      <p class="subtitle">
        使用免费工具（BFXR、Audacity、Bosca
        Ceoil），纯合成方式生成全部游戏音效和背景音乐，无需任何录音设备或音乐基础。
      </p>
    </header>

    <section class="phases-section">
      <h2 class="section-title">学习路径</h2>

      <div v-for="group in phaseGroups" :key="group.label" class="phase-group">
        <div class="group-header">
          <h3 class="group-label">{{ group.label }}</h3>
          <p class="group-tagline">{{ group.tagline }}</p>
        </div>
        <div class="phases-grid">
          <RouterLink v-for="p in group.phases" :key="p.id" :to="`/audio/phase/${p.id}`" class="phase-card">
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

    <footer class="home-footer">
      <div class="footer-card">
        <span class="footer-icon">🎧</span>
        <div>
          <p>总共约 <strong>4-7 天</strong>，每天投入 1-2 小时。</p>
          <p class="footer-path">
            核心路径：<em>音频基础 → 射击音效制作 → 背景音乐 → Cocos 音频集成</em>
          </p>
        </div>
      </div>

      <div class="tools-card">
        <h3>🛠️ 本课程使用的工具</h3>
        <div class="tool-grid">
          <div class="tool-item">
            <strong>BFXR</strong>
            <span>音效合成器（Web / 桌面版）</span>
            <span>bfxr.net</span>
          </div>
          <div class="tool-item">
            <strong>Audacity</strong>
            <span>音频编辑器</span>
            <span>audacityteam.org</span>
          </div>
          <div class="tool-item">
            <strong>Chiptone</strong>
            <span>浏览器端 chiptune 合成器</span>
            <span>sfbgames.itch.io/chiptone</span>
          </div>
          <div class="tool-item">
            <strong>Bosca Ceoil</strong>
            <span>极简 MIDI 音乐编辑器</span>
            <span>boscaceoil.net</span>
          </div>
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

/* ---- Footer ---- */
.home-footer {
  text-align: center;
}

.footer-card {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 1.15rem 1.4rem;
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.footer-card p {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.footer-card p:last-child {
  margin-bottom: 0;
}

.footer-icon {
  font-size: 1.4rem;
  line-height: 1;
  margin-top: 0.1rem;
}

.footer-path {
  font-size: 0.82rem;
}

.footer-path em {
  font-style: normal;
  color: var(--color-primary);
}

.tools-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-top: 1.5rem;
  text-align: left;
}

.tools-card h3 {
  margin-bottom: 1rem;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.tool-item {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-soft);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
}

.tool-item strong {
  font-size: 0.9rem;
  margin-bottom: 0.15rem;
}

.tool-item span {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.tool-item span:last-child {
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--color-primary);
  margin-top: 0.15rem;
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

  .tool-grid {
    grid-template-columns: 1fr;
  }
}
</style>
