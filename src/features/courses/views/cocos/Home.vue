<script setup lang="ts">
import { RouterLink } from 'vue-router'
import HomeSidebar from '@/features/navigation/components/HomeSidebar.vue'
import FlowChart from '@/features/courses/components/FlowChart.vue'
import CourseProgressBar from '@/features/courses/components/CourseProgressBar.vue'
import { slug } from '@/utils/slug'
import type { PhaseGroup } from '@/features/courses/types/phase'

const pathSteps = [
  '心智转变：帧驱动+组件化+坐标系',
  '画面与资源：Sprite+图集+动画',
  '交互系统：输入+碰撞+玩法',
  '架构与性能：Manager+UI+场景+优化',
  '视觉效果：物理+粒子+Shader+Spine',
  '构建发布：Web+原生+微信',
]

const phaseGroups: PhaseGroup[] = [
  {
    label: '第一单元：心智模型转变',
    tagline: '从 Vue 开发者的视角重新认识游戏引擎——帧驱动、组件化、坐标系',
    phases: [
      { id: 1, icon: '🧭', title: '游戏引擎世界观', duration: '2-3 天', summary: '为什么会有游戏引擎？帧驱动和事件驱动到底有什么不同？从雅达利到 Cocos，理解你即将进入的世界。', concepts: ['帧驱动', '渲染管线', 'Cocos 生态'] },
      { id: 2, icon: '🧱', title: '场景、节点、组件', duration: '2-3 天', summary: '组件化架构的哲学起源——从继承链的崩塌到组合优于继承。理解 Node Tree 和 DOM Tree 的本质差异。', concepts: ['Scene', 'Node', 'Component', '生命周期'] },
      { id: 3, icon: '📐', title: '坐标系与变换', duration: '2-3 天', summary: 'Y 轴为什么朝上？锚点到底是什么？二维变换矩阵在做什么？从 CSS transform 到游戏引擎的坐标系。', concepts: ['坐标系', '锚点', '变换矩阵', '设计分辨率'] },
    ],
  },
  {
    label: '第二单元：画面与资源',
    tagline: '游戏世界怎么画出来——纹理、精灵、图集、动画',
    phases: [
      { id: 4, icon: '📦', title: '资源管理', duration: '1-2 天', summary: '.meta 文件的本质——资源的"身份证"。理解 UUID 引用系统、动态加载和引用计数。', concepts: ['.meta 文件', 'UUID', '动态加载', '引用计数'] },
      { id: 5, icon: '🖼️', title: '精灵渲染', duration: '2-3 天', summary: '从 PNG 到屏幕像素的完整旅程。纹理过滤、九宫格、混合模式——GPU 在背后做了什么？', concepts: ['Texture2D', 'SpriteFrame', 'Point 过滤', '9-Slice'] },
      { id: 6, icon: '🗂️', title: '图集与自动合批', duration: '1-2 天', summary: '为什么多张小图会让游戏变卡？DrawCall 是什么？图集如何用一张大图解决性能问题？', concepts: ['DrawCall', '图集', 'Auto Atlas', '合批'] },
    ],
  },
  {
    label: '第三单元：交互动起来',
    tagline: '动画、输入、碰撞——让游戏"活"起来',
    phases: [
      { id: 7, icon: '🎬', title: '帧动画', duration: '1-2 天', summary: '从手翻书到 SpriteSheet——帧动画的原理、帧率选择和 SpriteSheet 切割。', concepts: ['SpriteFrame 切换', '帧率', 'SpriteSheet'] },
      { id: 8, icon: '✨', title: 'cc.tween 补间动画', duration: '1-2 天', summary: '声明式动画 API——从 Flash 时代到 GSAP 到 Cocos Tween。缓动函数的数学直觉。', concepts: ['cc.tween', '缓动函数', '链式调用'] },
      { id: 9, icon: '🎮', title: '输入系统', duration: '1-2 天', summary: '从键盘到多点触控到虚拟摇杆——输入设备演化如何倒逼抽象层的设计。', concepts: ['键盘事件', '多点触控', '虚拟摇杆', '输入缓冲'] },
    ],
  },
  {
    label: '第四单元：核心玩法系统',
    tagline: '碰撞、子弹、敌机、波次、道具——射击游戏五大核心系统',
    phases: [
      { id: 10, icon: '💥', title: '碰撞检测', duration: '2-3 天', summary: '游戏世界的"物理法则"——从手写 AABB 到内置碰撞系统，理解碰撞分组和位掩码。', concepts: ['AABB', 'Collider2D', '碰撞分组', '位掩码'] },
      { id: 11, icon: '🔫', title: '子弹系统与发射模式', duration: '1-2 天', summary: '从单发到霰弹到弹幕——子弹的生命周期管理和多种发射模式的实现。', concepts: ['子弹生命周期', '发射模式', '解耦设计'] },
      { id: 12, icon: '👾', title: '敌机系统与行为设计', duration: '2-3 天', summary: '从 Pac-Man 的固定路线到现代游戏 AI——敌机类型、移动轨迹和生成策略。', concepts: ['敌机类型', '移动轨迹', '生成策略'] },
      { id: 13, icon: '🌊', title: '波次系统', duration: '1-2 天', summary: 'Space Invaders 的遗产——数据驱动的波次编排、难度曲线和节奏设计。', concepts: ['波次数据', '节奏编排', '难度曲线'] },
      { id: 14, icon: '🎁', title: '道具系统', duration: '1-2 天', summary: '从马力欧的蘑菇到暗黑的装备——道具效果类型、掉落表和组合策略。', concepts: ['效果类型', '掉落表', '权重随机'] },
    ],
  },
  {
    label: '第五单元：架构与性能',
    tagline: '当代码超过 1000 行——对象池、事件总线、UI 框架、场景管理、性能优化',
    phases: [
      { id: 15, icon: '🏗️', title: '游戏架构模式', duration: '2-3 天', summary: 'Manager 单例、对象池、事件总线、状态机——让代码在规模增长时仍可维护。', concepts: ['Manager 模式', '对象池', '事件总线', '状态机'] },
      { id: 16, icon: '🖥️', title: 'UI 系统深入', duration: '2-3 天', summary: 'Widget/Layout/ScrollView——游戏 UI 和前端 UI 的相似与不同。', concepts: ['Widget', 'Layout', 'ScrollView', '层级管理'] },
      { id: 17, icon: '🔀', title: '场景管理与转场', duration: '1-2 天', summary: '多场景架构、异步加载、数据传递和转场动画——像 Vue Router 一样的场景路由。', concepts: ['场景结构', 'loadScene', '转场动画'] },
      { id: 18, icon: '⚡', title: '性能优化实战', duration: '2-3 天', summary: 'DrawCall 优化、纹理压缩、GC 规避——让游戏在低端机上也能跑 60fps。', concepts: ['DrawCall', '纹理压缩', 'GC 优化', 'Profiler'] },
    ],
  },
  {
    label: '第六单元：视觉效果',
    tagline: '物理、粒子、Shader、骨骼动画——让游戏好看',
    phases: [
      { id: 19, icon: '⚙️', title: '2D 物理引擎', duration: '2-3 天', summary: '什么时候手写碰撞够了，什么时候该上物理引擎？RigidBody2D 和物理材质详解。', concepts: ['RigidBody2D', '物理材质', 'Contact'] },
      { id: 20, icon: '🎆', title: '粒子系统', duration: '1-2 天', summary: '从《几何战争》到现代特效——发射器+生命周期的粒子系统原理。', concepts: ['ParticleSystem2D', '发射器', '生命周期'] },
      { id: 21, icon: '🪄', title: 'Shader 与后处理', duration: '2-3 天', summary: 'GPU 从"固定菜单"到"开放式厨房"——Cocos Effect 语法和常用 Shader 效果。', concepts: ['Cocos Effect', 'GLSL', '后处理'] },
      { id: 22, icon: '🦴', title: 'Spine 骨骼动画', duration: '1-2 天', summary: '序列帧的极限在哪？Spine 如何用骨骼+插槽+皮肤彻底改变 2D 动画。', concepts: ['Spine', '骨骼', '动画混合', '换皮'] },
    ],
  },
  {
    label: '第七单元：构建与发布',
    tagline: 'Web、原生、微信小游戏——让玩家真正玩到你的游戏',
    phases: [
      { id: 23, icon: '🌐', title: 'Web 平台构建与部署', duration: '1-2 天', summary: '从构建面板到 Vercel 部署——把游戏变成一个可以分享的链接。', concepts: ['Web Mobile', '设计分辨率', '部署'] },
      { id: 24, icon: '📱', title: '原生平台构建', duration: '1-2 天', summary: 'JSBridge 是什么？iOS 签名为什么这么烦？原生构建的全流程。', concepts: ['JSBridge', '原生构建', '签名'] },
      { id: 25, icon: '✈️', title: '像素飞机大战实战', duration: '4-6 天', summary: '从零搭建完整飞机大战——架构设计、系统协作、开发调试、构建发布全流程。', concepts: ['项目搭建', '系统协作', '完整流程'] },
    ],
  },
]
</script>

<template>
  <div class="home">
    <header class="hero">
      <p class="hero-eyebrow">游戏引擎 · 从 Vue 到 Cocos</p>
      <h1>从零理解<span class="highlight">Cocos Creator</span></h1>
      <p class="subtitle">
        一份为前端工程师深度定制的游戏引擎学习指南。不讲 API 列表，讲清楚每个概念从哪来、为什么存在、解决了什么问题。
      </p>
    </header>

    <CourseProgressBar course="cocos" />

    <section class="phases-section">
      <h2 class="section-title">学习路径</h2>

      <div v-for="(group, i) in phaseGroups" :key="group.label" :id="slug(group.label)" :data-group-index="i" class="phase-group" :style="{ '--s': i }">
        <div class="group-header">
          <h3 class="group-label">{{ group.label }}</h3>
          <p class="group-tagline">{{ group.tagline }}</p>
        </div>
        <div class="phases-grid">
          <RouterLink v-for="p in group.phases" :key="p.id" :to="`/cocos/phase/${p.id}`" :id="`phase-${p.id}`" class="phase-card">
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
      <div class="footer-card" id="path-section">
        <span class="footer-icon">⏱️</span>
        <div>
          <p>总共约 <strong>6-9 周</strong>，每天投入 2-4 小时。</p>
          <p class="footer-path">核心路径：</p>
          <FlowChart :steps="pathSteps" />
        </div>
      </div>

      <div class="tools-card" id="tools-section">
        <h3>🛠️ 本课程使用的工具</h3>
        <div class="tool-grid">
          <div class="tool-item"><strong>Cocos Creator</strong><span>游戏引擎（3.8.x）</span><span>cocos.com/creator</span></div>
          <div class="tool-item"><strong>VS Code</strong><span>代码编辑器</span><span>code.visualstudio.com</span></div>
          <div class="tool-item"><strong>Chrome DevTools</strong><span>性能分析与调试</span></div>
          <div class="tool-item"><strong>微信开发者工具</strong><span>小游戏调试与预览</span></div>
        </div>
      </div>
    </footer>

    <HomeSidebar :groups="phaseGroups" />
  </div>
</template>

<style scoped src="@/styles/home-shared.css"></style>
