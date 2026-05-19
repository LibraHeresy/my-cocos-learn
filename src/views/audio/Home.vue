<script setup lang="ts">
import { RouterLink } from 'vue-router'

const phases = [
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
  {
    id: 4,
    icon: '🎮',
    title: 'Cocos 音频集成',
    duration: '1-2 天',
    summary: 'AudioSource 组件、AudioClip 资源加载、AudioManager 单例、BGM 淡入淡出、音量控制。',
    concepts: ['AudioSource', 'AudioClip', 'AudioManager', 'cc.tween 淡入淡出'],
  },
]
</script>

<template>
  <div class="home">
    <section class="hero">
      <p class="hero-eyebrow">游戏音效</p>
      <h1>从<span class="highlight">零基础</span>到完整游戏音频</h1>
      <p class="subtitle">
        使用免费工具（BFXR、Audacity、Bosca
        Ceoil），纯合成方式生成全部游戏音效和背景音乐，无需任何录音设备或音乐基础。
      </p>
    </section>

    <section class="phases-section">
      <h2 class="section-title">课程阶段</h2>
      <div class="phases-grid">
        <RouterLink v-for="p in phases" :key="p.id" :to="`/audio/phase/${p.id}`" class="phase-card">
          <div class="card-top">
            <span class="card-icon">{{ p.icon }}</span>
            <span class="card-duration">{{ p.duration }}</span>
          </div>
          <span class="card-phase">阶段 {{ p.id }}</span>
          <strong class="card-title">{{ p.title }}</strong>
          <p class="card-summary">{{ p.summary }}</p>
          <div class="card-concepts">
            <span v-for="c in p.concepts" :key="c" class="concept-tag">{{ c }}</span>
          </div>
        </RouterLink>
      </div>
    </section>

    <footer class="course-footer">
      <div class="footer-card">
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

.card-title {
  font-size: 1.02rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.card-summary {
  font-size: 0.83rem;
  color: var(--color-text-muted);
  line-height: 1.55;
  flex: 1;
  margin-bottom: 0.8rem;
}

.card-concepts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.concept-tag {
  font-size: 0.7rem;
  background: var(--color-bg-soft);
  color: var(--color-text-muted);
  padding: 0.2em 0.6em;
  border-radius: 6px;
}

.course-footer {
  margin-top: 1rem;
}

.footer-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.footer-card h3 {
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
