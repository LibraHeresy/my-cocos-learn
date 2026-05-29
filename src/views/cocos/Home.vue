<script setup lang="ts">
import { RouterLink } from 'vue-router'
import HomeSidebar from '@/components/HomeSidebar.vue'
import FlowChart from '@/components/FlowChart.vue'
import { slug } from '@/utils/slug'
import type { PhaseGroup } from '@/types/phase'

const pathSteps = [
  '入门：帧驱动+节点体系',
  '核心：渲染+输入+碰撞',
  '架构：对象池+状态机',
  '实战：飞机大战',
  '物理与关卡：2D物理+Tilemap',
  '交互：UI+触控',
  '画面与性能：Shader+Spine+纹理压缩',
  '跨平台发布：多端构建',
]

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
        summary:
          '对象池（Node Pool）、事件总线（Event Bus）、状态机——前端熟悉的设计模式在游戏中的落地。',
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
    label: '物理与关卡篇',
    tagline: '告别手写碰撞 —— 用引擎物理和 Tilemap 搭建真正的关卡',
    phases: [
      {
        id: 18,
        icon: '⚙️',
        title: '2D 物理引擎入门',
        duration: '2-3 天',
        summary: 'RigidBody2D、Collider2D 类型选择、物理材质、Contact 回调——让引擎替你处理碰撞。',
        concepts: ['RigidBody2D', 'Collider2D', '物理材质', 'Contact 回调'],
      },
      {
        id: 19,
        icon: '🗺️',
        title: 'Tilemap 关卡编辑',
        duration: '1-2 天',
        summary: 'Tiled 编辑器导入 Cocos、瓦片碰撞、动态换砖——像 CSS Grid 一样编排游戏关卡。',
        concepts: ['Tiled', 'TiledMap', '瓦片碰撞', '动态换砖'],
      },
    ],
  },
  {
    label: '交互篇',
    tagline: '复杂 UI 布局、多点触控与手势 —— 像写 Flexbox 一样搭界面',
    phases: [
      {
        id: 20,
        icon: '🖥️',
        title: '复杂 UI 与 ScrollView',
        duration: '1-2 天',
        summary: 'Grid/Horizontal Layout、ScrollView、背包格、商店页——像写 Flexbox 一样搭 UI。',
        concepts: ['Layout 组件', 'ScrollView', '背包网格', 'Item 复用'],
      },
      {
        id: 21,
        icon: '👆',
        title: '多点触控与手势',
        duration: '1 天',
        summary: '双指缩放、滑动方向识别、虚拟摇杆——像 Hammer.js 一样处理复杂触摸。',
        concepts: ['多点触摸', '手势识别', '虚拟摇杆', 'Touch ID 追踪'],
      },
    ],
  },
  {
    label: '画面与性能篇',
    tagline: 'Shader 特效、Spine 骨骼动画、纹理压缩 —— 让游戏"好看又能跑"',
    phases: [
      {
        id: 15,
        icon: '✨',
        title: 'Shader 与后处理特效',
        duration: '2-3 天',
        summary: 'Cocos Effect 语法入门、溶解/描边/受击闪白 Shader 实战、全屏后处理管线。',
        concepts: ['Cocos Effect', 'Fragment Shader', '后处理', '溶解效果', '描边'],
      },
      {
        id: 23,
        icon: '🦴',
        title: 'Spine 骨骼动画',
        duration: '1-2 天',
        summary: 'Spine vs 序列帧选型、导入管线、运行时换皮、动画混合——像 Lottie 一样丝滑。',
        concepts: ['Spine', '骨骼动画', '换皮', '动画混合'],
      },
      {
        id: 25,
        icon: '🗜️',
        title: '纹理压缩与内存优化',
        duration: '1 天',
        summary: 'ETC2/ASTC/PVRTC 选型、Mipmap、SpriteAtlas 进阶、移动端纹理预算实战。',
        concepts: ['纹理压缩', 'Mipmap', 'SpriteAtlas', '内存预算'],
      },
    ],
  },
  {
    label: '跨平台发布篇',
    tagline: '多端部署 —— Web Mobile、iOS/Android 原生构建',
    phases: [
      {
        id: 28,
        icon: '📦',
        title: 'Web / 原生平台发布',
        duration: '1 天',
        summary: 'Web Mobile 部署、iOS/Android 原生构建、JSBridge、平台差异处理。',
        concepts: ['Web Mobile', '原生构建', 'JSBridge', '平台差异'],
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

      <div v-for="(group, i) in phaseGroups" :key="group.label" :id="slug(group.label)" :data-group-index="i" class="phase-group" :style="{ '--s': i }">
        <div class="group-header">
          <h3 class="group-label">{{ group.label }}</h3>
          <p class="group-tagline">{{ group.tagline }}</p>
        </div>
        <div class="phases-grid">
          <RouterLink
            v-for="p in group.phases"
            :key="p.id"
            :to="`/cocos/phase/${p.id}`"
            :id="`phase-${p.id}`" class="phase-card"
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
      </div>
    </section>

    <!-- 速查表 -->
    <section class="mapping-section">
      <h2 class="section-title">Vue → Cocos 概念速查</h2>
      <div class="table-wrapper">
        <table class="mapping-table">
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
          <div class="tool-item">
            <strong>Cocos Creator</strong>
            <span>游戏引擎（3.x）</span>
            <span>cocos.com/creator</span>
          </div>
          <div class="tool-item">
            <strong>VS Code</strong>
            <span>代码编辑器</span>
            <span>code.visualstudio.com</span>
          </div>
          <div class="tool-item">
            <strong>Chrome DevTools</strong>
            <span>性能分析与调试</span>
          </div>
          <div class="tool-item">
            <strong>微信开发者工具</strong>
            <span>小游戏调试与预览</span>
            <span>developers.weixin.qq.com/minigame/dev/devtools</span>
          </div>
        </div>
      </div>
    </footer>

    <HomeSidebar :groups="phaseGroups" course="cocos" />
  </div>
</template>

<style scoped src="@/styles/home-shared.css"></style>

<style scoped>
/* ---- 速查表 ---- */
.mapping-section {
  margin-bottom: 3rem;
}

.table-wrapper {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.mapping-table {
  margin-bottom: 0;
}

@media (max-width: 640px) {
  .table-wrapper {
    width: 100%;
  }

  table {
    width: 100%;
  }

  table th,
  table td {
    padding: 0.5rem 0.75rem;
  }
}
</style>
