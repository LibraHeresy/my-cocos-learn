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
    label: '基础篇',
    tagline: '环境搭建与核心技法 —— 像搭建前端项目一样从零开始',
    phases: [
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
    ],
  },
  {
    label: '实战篇',
    tagline: '素材绘制 → 运动规律 → 帧动画落地 —— 像写组件一样构建游戏素材',
    phases: [
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
        icon: '🏃',
        title: '运动规律与帧数设计',
        duration: '1-2 天',
        summary:
          '帧间距、缓动曲线、运动弧线、挤压拉伸、次级运动——先学原理再动手，让动画不再僵硬。',
        concepts: ['帧间距', '缓动曲线', '挤压拉伸', '逐帧vs代码', '帧数标准'],
      },
      {
        id: 5,
        icon: '🎬',
        title: '帧动画制作',
        duration: '1-2 天',
        summary:
          '将运动规律落地到 Aseprite 时间轴——爆炸动画、引擎火焰、待机浮动，导出 SpriteSheet。',
        concepts: ['时间轴', '洋葱皮', '爆炸动画', '引擎火焰', 'SpriteSheet'],
      },
    ],
  },
  {
    label: '工程篇',
    tagline: '导入管线与性能优化 —— 像配置 Webpack/Vite 一样配置 Cocos',
    phases: [
      {
        id: 6,
        icon: '📦',
        title: 'Cocos 导入管线与性能优化',
        duration: '1 天',
        summary:
          '纹理过滤 Point vs Bilinear、PPU 配置、SpriteSheet 切割、Auto Atlas 合批、内存预算、9-Slice UI。',
        concepts: ['Point过滤', 'PPU', 'SpriteSheet', 'Auto Atlas', '9-Slice', '内存预算'],
      },
    ],
  },
  {
    label: '进阶篇',
    tagline: '高级技巧与完整设计 —— 从单体素材到完整游戏界面',
    phases: [
      {
        id: 7,
        icon: '🌟',
        title: '进阶像素技巧',
        duration: '1-2 天',
        summary:
          '视差滚动背景、Tileset 无缝拼接、像素粒子、调色板换色、色彩循环动画——像素画的生产力技巧。',
        concepts: ['视差滚动', 'Tileset', '像素粒子', '调色板换色', '色彩循环'],
      },
      {
        id: 8,
        icon: '🎛️',
        title: 'UI 与 HUD 美术',
        duration: '1-2 天',
        summary:
          '按钮多态设计、弹窗面板、血条/比分/图标——像设计组件库变体一样设计游戏 UI。',
        concepts: ['按钮状态', '面板设计', 'HUD 元素', '小尺寸可读性'],
      },
      {
        id: 9,
        icon: '🏞️',
        title: '背景设计进阶',
        duration: '1-2 天',
        summary:
          '视差层级规划、大气透视、环境色统一、关卡主题区分——从单层背景到完整的游戏世界。',
        concepts: ['视差层级', '大气透视', '环境色', '主题调色板'],
      },
    ],
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

      <div v-for="(group, i) in phaseGroups" :key="group.label" :id="slug(group.label)" :data-group-index="i" class="phase-group">
        <div class="group-header">
          <h3 class="group-label">{{ group.label }}</h3>
          <p class="group-tagline">{{ group.tagline }}</p>
        </div>
        <div class="phases-grid">
          <RouterLink v-for="p in group.phases" :key="p.id" :to="`/art/phase/${p.id}`" class="phase-card">
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
        <span class="footer-icon">🎨</span>
        <div>
          <p>总共约 <strong>10-14 天</strong>，每天投入 1-2 小时。</p>
          <p class="footer-path">
            核心路径：<em>Aseprite 工具 → 基本技法 → 飞机大战素材 → 运动规律 → 帧动画制作 → 导入管线 → 进阶技巧 → UI/HUD 设计 → 背景设计进阶</em>
          </p>
        </div>
      </div>

      <div class="tools-card">
        <h3>🛠️ 本课程使用的工具</h3>
        <div class="tool-grid">
          <div class="tool-item">
            <strong>Aseprite</strong>
            <span>像素画绘制与动画（主力工具）</span>
            <span>aseprite.org</span>
          </div>
          <div class="tool-item">
            <strong>LibreSprite</strong>
            <span>Aseprite 的开源替代</span>
            <span>libresprite.github.io</span>
          </div>
          <div class="tool-item">
            <strong>Lospec Palette List</strong>
            <span>经典调色板参考</span>
            <span>lospec.com/palette-list</span>
          </div>
          <div class="tool-item">
            <strong>Piskel</strong>
            <span>浏览器端像素画编辑器（免费）</span>
            <span>piskelapp.com</span>
          </div>
        </div>
      </div>
    </footer>

    <HomeSidebar :groups="phaseGroups" course="art" />
  </div>
</template>

<style scoped src="@/styles/home-shared.css"></style>
