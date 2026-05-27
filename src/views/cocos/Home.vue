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
  {
    label: '微信生态篇',
    tagline: '接入微信开放能力 —— 登录、云开发、排行榜，让小游戏拥有完整生态',
    phases: [
      {
        id: 9,
        icon: '🔐',
        title: '微信开放能力接入',
        duration: '1-2 天',
        summary: 'wx.login 静默登录、用户信息获取、开放数据域排行榜、设备信息与自适应。',
        concepts: ['wx.login', '开放数据域', 'wx.getSystemInfoSync', 'CloudStorage'],
      },
      {
        id: 10,
        icon: '☁️',
        title: '数据持久化与云开发',
        duration: '1-2 天',
        summary: '微信云开发（云数据库/云函数/云存储）、玩家进度云端同步、离线数据队列。',
        concepts: ['云数据库', '云函数', '云存储', '进度同步', '离线队列'],
      },
      {
        id: 11,
        icon: '📲',
        title: '真机调试与性能适配',
        duration: '1-2 天',
        summary: '远程调试工具链、设备分档策略、WeChat 性能面板、常见机型兼容坑。',
        concepts: ['真机调试', '设备分档', '性能面板', '机型兼容', '自适应'],
      },
    ],
  },
  {
    label: '运营篇',
    tagline: '让玩家留下来 —— 数值、留存、数据，像做产品一样做游戏',
    phases: [
      {
        id: 12,
        icon: '📊',
        title: '游戏数值设计',
        duration: '2-3 天',
        summary: '难度曲线设计、经济系统平衡、DPS 与血量计算、关卡节奏编排、数值调优流程。',
        concepts: ['难度曲线', '经济平衡', 'DPS计算', '关卡节奏', '数值调优'],
      },
      {
        id: 13,
        icon: '📅',
        title: '留存系统设计',
        duration: '2-3 天',
        summary: '每日签到/任务系统、成就系统、新手引导流程、七日留存活动设计。',
        concepts: ['每日签到', '每日任务', '成就系统', '新手引导', '七日留存'],
      },
      {
        id: 14,
        icon: '📈',
        title: '数据运营分析',
        duration: '1-2 天',
        summary: '微信后台数据指标、自定义打点埋点、广告收益优化、数据驱动迭代方法。',
        concepts: ['DAU/留存', 'wx.reportMonitor', '广告优化', '漏斗分析', '隐私合规'],
      },
    ],
  },
  {
    label: '工程化篇',
    tagline: '专业级交付 —— Shader、测试、CI/CD，让游戏开发像前端工程一样可靠',
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
        id: 16,
        icon: '🧪',
        title: '游戏测试体系',
        duration: '1-2 天',
        summary: '游戏逻辑单元测试、录制回放回归测试、性能基准测试、兼容性测试矩阵。',
        concepts: ['单元测试', '回归测试', '性能基准', '兼容性矩阵', 'Vitest'],
      },
      {
        id: 17,
        icon: '🚀',
        title: 'CI/CD 构建流水线',
        duration: '1-2 天',
        summary: 'Cocos CLI 构建、GitHub Actions 自动化、多平台构建矩阵、Bundle 热更新。',
        concepts: ['Cocos CLI', 'GitHub Actions', '热更新', '多平台构建', '发布流水线'],
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
          <RouterLink
            v-for="p in group.phases"
            :key="p.id"
            :to="`/cocos/phase/${p.id}`"
            class="phase-card"
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
      <div class="footer-card">
        <span class="footer-icon">⏱️</span>
        <div>
          <p>总共约 <strong>8-12 周</strong>，每天投入 2-4 小时。</p>
          <p class="footer-path">
            核心路径：<em
              >入门：帧驱动+节点体系 → 核心：渲染+输入+碰撞 → 架构：对象池+状态机 → 实战：飞机大战 →
              发布：微信小游戏 → 微信生态：登录+云开发+真机调试 → 运营：数值+留存+数据分析 → 工程化：Shader+测试+CI/CD</em
            >
          </p>
        </div>
      </div>

      <div class="tools-card">
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
