<script setup lang="ts">
import { RouterLink } from 'vue-router'
import HomeSidebar from '@/components/HomeSidebar.vue'

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-+|-+$/g, '')
}

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
  {
    label: '进阶篇',
    tagline: '自适应配乐、最终混音、空间定位 —— 从"有声音"到"声音是游戏玩法的一部分"',
    phases: [
      {
        id: 5,
        icon: '🎼',
        title: '自适应音乐系统',
        duration: '1-2 天',
        summary: '强度分层（vertical layering）、游戏状态驱动切歌、过渡 Stinger、无缝循环进阶。',
        concepts: ['Vertical Layering', '状态驱动', 'Stinger', 'BPM 匹配'],
      },
      {
        id: 6,
        icon: '🎚️',
        title: '音频后期与混音',
        duration: '1 天',
        summary: 'LUFS 响度归一化、移动端扬声器适配、削波防护、多平台响度标准。',
        concepts: ['LUFS', 'Limiter', '响度标准', '移动端适配'],
      },
      {
        id: 7,
        icon: '🔉',
        title: '空间音频',
        duration: '1-2 天',
        summary: '基于坐标的声像定位、距离衰减曲线、AudioSource 3D 模式、耳机空间感。',
        concepts: ['Panning', '距离衰减', '3D Audio', '声像定位'],
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

      <div v-for="(group, i) in phaseGroups" :key="group.label" :id="slug(group.label)" :data-group-index="i" class="phase-group">
        <div class="group-header">
          <h3 class="group-label">{{ group.label }}</h3>
          <p class="group-tagline">{{ group.tagline }}</p>
        </div>
        <div class="phases-grid">
          <RouterLink v-for="p in group.phases" :key="p.id" :to="`/audio/phase/${p.id}`" :id="`phase-${p.id}`" class="phase-card">
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
          <p>总共约 <strong>7-11 天</strong>，每天投入 1-2 小时。</p>
          <p class="footer-path">
            核心路径：<em>音频基础 → 射击音效制作 → 背景音乐 → Cocos 音频集成 → 自适应音乐 → 后期混音 → 空间音频</em>
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

    <HomeSidebar :groups="phaseGroups" course="audio" />
  </div>
</template>

<style scoped src="@/styles/home-shared.css"></style>
