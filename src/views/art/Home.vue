<script setup lang="ts">
import { RouterLink } from 'vue-router'
import HomeSidebar from '@/components/HomeSidebar.vue'
import FlowChart from '@/components/FlowChart.vue'
import { slug } from '@/utils/slug'
import type { PhaseGroup } from '@/types/phase'

const pathSteps = [
  '基础：历史+工具+色彩+线条+光影',
  '技法：抖动+纹理+角色设计',
  '动画：12原则+帧动画+特效',
  '场景：背景+UI/HUD+高级技法',
  '管线：导出+导入+合批+规范',
]

const phaseGroups: PhaseGroup[] = [
  {
    label: '基础篇',
    tagline: '像素画的审美基础与工具掌握',
    phases: [
      { id: 1, icon: '🎨', title: '像素画的历史与美学', duration: '1 天', summary: '像素画从何而来？为什么在独立游戏中长盛不衰？理解"限制中表达"的美学原则。', concepts: ['像素画历史', '独立游戏美学', '限制表达'] },
      { id: 2, icon: '🔧', title: 'Aseprite 工具精通', duration: '1-2 天', summary: '从界面布局到工作流——掌握画笔、图层、调色板、时间轴，建立高效创作环境。', concepts: ['界面布局', '核心工具', '图层管理', '快捷键'] },
      { id: 3, icon: '🎯', title: '色彩理论', duration: '1-2 天', summary: '色相/饱和度/明度、调色板设计、色彩心理学——为什么限制调色板反而更有力量？', concepts: ['色相/明度/饱和度', '调色板', '色彩心理'] },
      { id: 4, icon: '✏️', title: '线条与形状', duration: '1-2 天', summary: '像素线条的独特挑战——抗锯齿原理、轮廓处理、剪影识别性。', concepts: ['抗锯齿线条', '轮廓处理', '剪影'] },
      { id: 5, icon: '💡', title: '明暗与体积', duration: '1-2 天', summary: '用 2-3 种颜色表达立体感——光源方向、高光反射、材质表现的像素技巧。', concepts: ['光源方向', '高光反射', '材质表现'] },
    ],
  },
  {
    label: '技法篇',
    tagline: '从基础到进阶——抖动、纹理与角色设计',
    phases: [
      { id: 6, icon: '🔮', title: '抖动与纹理', duration: '1-2 天', summary: '抖动技法的原理与类型——有序抖动、随机抖动、在限制中创造更多颜色。', concepts: ['有序抖动', '随机抖动', '纹理表现'] },
      { id: 7, icon: '👤', title: '角色设计原理', duration: '2 天', summary: '从剪影到细节的完整设计流程——角色比例、辨识度、对称工具与多图层分离。', concepts: ['剪影设计', '角色比例', '多图层'] },
    ],
  },
  {
    label: '动画篇',
    tagline: '让像素角色动起来——从原理到实战',
    phases: [
      { id: 8, icon: '🏃', title: '动画基础——12 原则', duration: '1-2 天', summary: '迪士尼 12 条动画基本原则在像素画中的应用——挤压拉伸、预备动作、跟随运动。', concepts: ['12 原则', '挤压拉伸', '预备动作', '跟随运动'] },
      { id: 9, icon: '💥', title: '帧动画实战（上）', duration: '1-2 天', summary: '爆炸动画的完整制作——爆发→扩展→消散三个阶段的帧设计和节奏控制。', concepts: ['爆炸动画', '帧节奏', '洋葱皮'] },
      { id: 10, icon: '🔥', title: '帧动画实战（下）', duration: '1-2 天', summary: '引擎火焰循环、待机浮动、受击闪烁——游戏中最常用的几种循环动画。', concepts: ['火焰循环', '待机动画', '受击闪烁'] },
    ],
  },
  {
    label: '场景篇',
    tagline: '从单体素材到完整游戏世界',
    phases: [
      { id: 11, icon: '🏞️', title: '背景与环境设计', duration: '1-2 天', summary: '星空背景、无缝平铺、视差滚动、环境色与氛围——从单层背景到完整的游戏世界。', concepts: ['无缝平铺', '视差滚动', '环境色'] },
      { id: 12, icon: '🎛️', title: 'UI/HUD 设计', duration: '1-2 天', summary: '按钮多态、像素字体、血条能量条、面板弹窗——游戏界面的像素画设计。', concepts: ['按钮多态', '像素字体', 'HUD 元素'] },
      { id: 13, icon: '🌟', title: '高级技法', duration: '1-2 天', summary: '视差粒子、Tileset 无缝拼接、调色板换色、色彩循环——让像素画面更丰富。', concepts: ['视差粒子', 'Tileset', '调色板换色'] },
    ],
  },
  {
    label: '管线篇',
    tagline: '从 Aseprite 到 Cocos——资源的工业化流程',
    phases: [
      { id: 14, icon: '📦', title: '完整资源管线', duration: '1-2 天', summary: '导出设置、Cocos 导入配置、Auto Atlas 合批、文件命名规范——让美术和代码无缝衔接。', concepts: ['导出配置', 'Point 过滤', 'PPU', '命名规范'] },
    ],
  },
]
</script>

<template>
  <div class="home">
    <header class="hero">
      <p class="hero-eyebrow">像素美术 · Aseprite 教学</p>
      <h1>画出你的<span class="highlight">飞机大战</span></h1>
      <p class="subtitle">零基础像素画入门到独立创作。从历史和美学讲起，理解每一笔背后的原理，最终独立完成游戏所需的全部像素素材和动画。</p>
    </header>

    <div class="speedrun-cta">
      <span class="cta-icon">⏱️</span>
      <span>想要<strong>30 天发布游戏</strong>？试试 <RouterLink to="/speedrun">速通挑战</RouterLink>——从本课程中提取的最精简路径。</span>
    </div>

    <section class="phases-section">
      <h2 class="section-title">学习路径</h2>
      <div v-for="(group, i) in phaseGroups" :key="group.label" :id="slug(group.label)" :data-group-index="i" class="phase-group" :style="{ '--s': i }">
        <div class="group-header">
          <h3 class="group-label">{{ group.label }}</h3>
          <p class="group-tagline">{{ group.tagline }}</p>
        </div>
        <div class="phases-grid">
          <RouterLink v-for="p in group.phases" :key="p.id" :to="`/art/phase/${p.id}`" :id="`phase-${p.id}`" class="phase-card">
            <div class="card-top"><span class="card-icon">{{ p.icon }}</span><span class="card-duration">{{ p.duration }}</span></div>
            <span class="card-phase">第 {{ p.id }} 阶段</span>
            <h3>{{ p.title }}</h3>
            <p class="card-summary">{{ p.summary }}</p>
            <div class="card-tags"><span v-for="c in p.concepts" :key="c" class="tag">{{ c }}</span></div>
          </RouterLink>
        </div>
      </div>
    </section>

    <footer class="home-footer">
      <div class="footer-card" id="path-section">
        <span class="footer-icon">🎨</span>
        <div>
          <p>总共约 <strong>14-18 天</strong>，每天投入 1-2 小时。</p>
          <p class="footer-path">核心路径：</p>
          <FlowChart :steps="pathSteps" />
        </div>
      </div>
      <div class="tools-card" id="tools-section">
        <h3>🛠️ 本课程使用的工具</h3>
        <div class="tool-grid">
          <div class="tool-item"><strong>Aseprite</strong><span>像素画绘制与动画</span><span>aseprite.org</span></div>
          <div class="tool-item"><strong>LibreSprite</strong><span>Aseprite 开源替代</span><span>libresprite.github.io</span></div>
          <div class="tool-item"><strong>Lospec Palette List</strong><span>经典调色板参考</span><span>lospec.com/palette-list</span></div>
        </div>
      </div>
    </footer>

    <HomeSidebar :groups="phaseGroups" course="art" />
  </div>
</template>

<style scoped src="@/styles/home-shared.css"></style>
