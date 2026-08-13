<script setup lang="ts">
import { RouterLink } from 'vue-router'
import HomeSidebar from '@/features/navigation/components/HomeSidebar.vue'
import FlowChart from '@/features/courses/components/FlowChart.vue'
import CourseProgressBar from '@/features/courses/components/CourseProgressBar.vue'
import { slug } from '@/utils/slug'
import type { PhaseGroup } from '@/features/courses/types/phase'

const pathSteps = ['声音基础：物理+心理声学', '音效合成：BFXR 原理+实战', '音频编辑：Audacity 工作流', '音乐创作：作曲+结构+循环', 'Cocos 集成+自适应+发布']

const phaseGroups: PhaseGroup[] = [
  {
    label: '基础篇',
    tagline: '从声音的物理本质到游戏音频的设计思维',
    phases: [
      { id: 1, icon: '🔊', title: '游戏音频导论', duration: '1 天', summary: '音效、音乐、语音——音频在游戏中的三大角色。从 8-bit 时代的哔哔声到现代自适应配乐。', concepts: ['音频三大角色', '游戏音频简史'] },
      { id: 2, icon: '🔬', title: '声音的物理学与心理声学', duration: '1-2 天', summary: '频率/振幅/波形/音色是什么？人耳如何感知声音？采样率与位深度的真正含义。', concepts: ['频率/振幅', '人耳感知', '采样率', '位深度'] },
    ],
  },
  {
    label: '创作篇',
    tagline: '用免费工具从零制作游戏音效和背景音乐',
    phases: [
      { id: 3, icon: '🎛️', title: '音效合成原理', duration: '1-2 天', summary: '减法合成的本质——从噪声到音效只需要一个滤波器和四个参数（ADSR）。', concepts: ['减法合成', 'ADSR 包络', '频率分层'] },
      { id: 4, icon: '🔫', title: 'BFXR 音效实战（上）', duration: '1-2 天', summary: '从预设到 Mutate——射击、爆炸、引擎声的制作方法论。', concepts: ['BFXR 参数', 'Mutate 迭代', '音效命名'] },
      { id: 5, icon: '💥', title: 'BFXR 音效实战（下）', duration: '1-2 天', summary: '拾取、UI、受击——12 种射击游戏核心音效逐一制作。', concepts: ['拾取音效', 'UI 音效', '频率避让'] },
      { id: 6, icon: '✂️', title: 'Audacity 编辑精要', duration: '1 天', summary: '裁剪、标准化、淡入淡出、降噪——把原始合成结果打磨成可用的游戏音频。', concepts: ['标准化', '淡入淡出', '降噪', '格式选型'] },
      { id: 7, icon: '🎵', title: '作曲基础与 Bosca Ceoil', duration: '1-2 天', summary: '音高/音阶/和弦/节奏的最小必要知识。Bosca Ceoil 的 Piano Roll 工作流。', concepts: ['音高/音阶', '和弦', 'Piano Roll'] },
      { id: 8, icon: '🔁', title: '音乐结构设计', duration: '1-2 天', summary: 'Intro+Loop 结构、无缝循环技巧、BPM 与游戏节奏的匹配。', concepts: ['Intro+Loop', '无缝循环', 'BPM 匹配'] },
    ],
  },
  {
    label: '集成篇',
    tagline: '把音频接入 Cocos，让它活起来',
    phases: [
      { id: 9, icon: '🎮', title: 'Cocos 音频集成（上）', duration: '1-2 天', summary: 'AudioSource 组件、AudioManager 单例设计、音效池实现——Web Audio + 微信双栈。', concepts: ['AudioSource', 'AudioManager', '音效池'] },
      { id: 10, icon: '🎚️', title: 'Cocos 音频集成（下）', duration: '1-2 天', summary: 'BGM 跨场景持久化、淡入淡出、同帧去重——细节决定音频体验。', concepts: ['BGM 持久化', '淡入淡出', '同帧去重'] },
    ],
  },
  {
    label: '进阶篇',
    tagline: '自适应配乐与跨平台音频发布',
    phases: [
      { id: 11, icon: '🎼', title: '自适应音频系统', duration: '1-2 天', summary: 'Vertical Layering、游戏状态驱动切歌、过渡 Stinger——让音乐随玩法变化。', concepts: ['Vertical Layering', '状态驱动', 'Stinger'] },
      { id: 12, icon: '📦', title: '音频发布与平台适配', duration: '1 天', summary: 'WAV/MP3/OGG 选型、压缩策略、Web Audio vs InnerAudioContext——让音频在所有平台正常工作。', concepts: ['格式选型', '压缩策略', '平台适配'] },
    ],
  },
]
</script>

<template>
  <div class="home">
    <header class="hero">
      <p class="hero-eyebrow">游戏音效</p>
      <h1>从<span class="highlight">零基础</span>到完整游戏音频</h1>
      <p class="subtitle">使用免费工具纯合成方式生成全部游戏音效和背景音乐，无需录音设备或音乐基础。</p>
    </header>
    <CourseProgressBar course="audio" />
    <section class="phases-section">
      <h2 class="section-title">学习路径</h2>
      <div v-for="(group, i) in phaseGroups" :key="group.label" :id="slug(group.label)" :data-group-index="i" class="phase-group" :style="{ '--s': i }">
        <div class="group-header"><h3 class="group-label">{{ group.label }}</h3><p class="group-tagline">{{ group.tagline }}</p></div>
        <div class="phases-grid">
          <RouterLink v-for="p in group.phases" :key="p.id" :to="`/audio/phase/${p.id}`" :id="`phase-${p.id}`" class="phase-card">
            <div class="card-top"><span class="card-icon">{{ p.icon }}</span><span class="card-duration">{{ p.duration }}</span></div>
            <span class="card-phase">第 {{ p.id }} 阶段</span><h3>{{ p.title }}</h3><p class="card-summary">{{ p.summary }}</p>
            <div class="card-tags"><span v-for="c in p.concepts" :key="c" class="tag">{{ c }}</span></div>
          </RouterLink>
        </div>
      </div>
    </section>
    <footer class="home-footer">
      <div class="footer-card" id="path-section"><span class="footer-icon">🎧</span><div><p>总共约 <strong>12-16 天</strong>，每天投入 1-2 小时。</p><p class="footer-path">核心路径：</p><FlowChart :steps="pathSteps" /></div></div>
      <div class="tools-card" id="tools-section"><h3>🛠️ 本课程使用的工具</h3><div class="tool-grid"><div class="tool-item"><strong>BFXR</strong><span>音效合成器</span><span>bfxr.net</span></div><div class="tool-item"><strong>Audacity</strong><span>音频编辑器</span><span>audacityteam.org</span></div><div class="tool-item"><strong>Bosca Ceoil</strong><span>极简 MIDI 音乐编辑器</span><span>boscaceoil.net</span></div></div></div>
    </footer>
    <HomeSidebar :groups="phaseGroups" />
  </div>
</template>
<style scoped src="@/styles/home-shared.css"></style>
