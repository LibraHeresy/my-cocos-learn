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
    label: '微信小游戏篇',
    tagline: '从发布审核到云开发、真机调试 —— 打通微信小游戏完整链路',
    phases: [
      {
        id: 1,
        icon: '📱',
        title: '微信小游戏适配与发布',
        duration: '2-3 天',
        summary: '适配音频、分包加载、接入分享/排行榜/广告，完成审核上线全流程。',
        concepts: ['Bundle 分包', 'InnerAudioContext', '激励视频', 'onShow/onHide'],
      },
      {
        id: 2,
        icon: '🔐',
        title: '微信开放能力接入',
        duration: '1-2 天',
        summary: 'wx.login 静默登录、用户信息获取、开放数据域排行榜、设备信息与自适应。',
        concepts: ['wx.login', '开放数据域', 'wx.getSystemInfoSync', 'CloudStorage'],
      },
      {
        id: 3,
        icon: '☁️',
        title: '数据持久化与云开发',
        duration: '1-2 天',
        summary: '微信云开发（云数据库/云函数/云存储）、玩家进度云端同步、离线数据队列。',
        concepts: ['云数据库', '云函数', '云存储', '进度同步', '离线队列'],
      },
      {
        id: 4,
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
    tagline: '让玩家留下来 —— 数值、留存、数据分析，像做产品一样做游戏',
    phases: [
      {
        id: 5,
        icon: '📊',
        title: '游戏数值设计',
        duration: '2-3 天',
        summary: '难度曲线设计、经济系统平衡、DPS 与血量计算、关卡节奏编排、数值调优流程。',
        concepts: ['难度曲线', '经济平衡', 'DPS计算', '关卡节奏', '数值调优'],
      },
      {
        id: 6,
        icon: '📅',
        title: '留存系统设计',
        duration: '2-3 天',
        summary: '每日签到/任务系统、成就系统、新手引导流程、七日留存活动设计。',
        concepts: ['每日签到', '每日任务', '成就系统', '新手引导', '七日留存'],
      },
      {
        id: 7,
        icon: '📈',
        title: '数据运营分析',
        duration: '1-2 天',
        summary: '微信后台数据指标、自定义打点埋点、广告收益优化、数据驱动迭代方法。',
        concepts: ['DAU/留存', 'wx.reportMonitor', '广告优化', '漏斗分析', '隐私合规'],
      },
    ],
  },
  {
    label: '工程质量篇',
    tagline: '测试、CI/CD、WebSocket、手感打磨、内存排查 —— 让游戏开发像前端工程一样可靠',
    phases: [
      {
        id: 8,
        icon: '🧪',
        title: '游戏测试体系',
        duration: '1-2 天',
        summary: '游戏逻辑单元测试、录制回放回归测试、性能基准测试、兼容性测试矩阵。',
        concepts: ['单元测试', '回归测试', '性能基准', '兼容性矩阵', 'Vitest'],
      },
      {
        id: 9,
        icon: '🚀',
        title: 'CI/CD 构建流水线',
        duration: '1-2 天',
        summary: 'Cocos CLI 构建、GitHub Actions 自动化、多平台构建矩阵、Bundle 热更新。',
        concepts: ['Cocos CLI', 'GitHub Actions', '热更新', '多平台构建', '发布流水线'],
      },
      {
        id: 10,
        icon: '🌐',
        title: 'WebSocket 实时通信',
        duration: '1-2 天',
        summary: '连接管理、心跳保活、消息协议设计、简单对战同步——让游戏拥有网络能力。',
        concepts: ['WebSocket', '心跳', '消息协议', '断线重连'],
      },
      {
        id: 11,
        icon: '💫',
        title: '游戏手感设计',
        duration: '1 天',
        summary: '屏幕震动、击打停顿、镜头跟随延迟、粒子爆发——游戏"手感"的量化方法。',
        concepts: ['屏幕震动', '冻结帧', '镜头跟随', '视听同步'],
      },
      {
        id: 12,
        icon: '🔍',
        title: '内存泄漏排查实战',
        duration: '1 天',
        summary: '常见泄漏场景、Chrome Memory 面板、node.destroy 陷阱、事件清理检查清单。',
        concepts: ['内存泄漏', 'Heap Snapshot', '事件清理', 'SafeDestroy'],
      },
    ],
  },
  {
    label: '多端适配篇',
    tagline: '国际化、TypeScript 设计模式 —— 生产级项目最后的拼图',
    phases: [
      {
        id: 13,
        icon: '🌍',
        title: '国际化 i18n',
        duration: '1 天',
        summary: '字符串表方案、运行时语言切换、CJK 字体裁剪——像 vue-i18n 一样做多语言。',
        concepts: ['字符串表', '语言切换', '字体子集', 'RTL 适配'],
      },
      {
        id: 14,
        icon: '💎',
        title: 'TypeScript 游戏模式',
        duration: '1 天',
        summary: 'Discriminated Union 做状态、Zod 校验配置、Branded Types——前端 TS 技巧在游戏中的落地。',
        concepts: ['Discriminated Union', 'Zod', 'Branded Types', 'DI'],
      },
    ],
  },
]
</script>

<template>
  <div class="home">
    <header class="hero">
      <p class="hero-eyebrow">游戏工程化与运营</p>
      <h1>从<span class="highlight">Demo</span>到<span class="highlight">产品</span></h1>
      <p class="subtitle">
        覆盖微信小游戏发布、云开发、游戏运营（数值/留存/变现）、工程化（测试/CI/CD）、
        网络通信、手感打磨、内存优化、国际化与 TypeScript 设计模式。
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
          <RouterLink v-for="p in group.phases" :key="p.id" :to="`/engineering/phase/${p.id}`" :id="`phase-${p.id}`" class="phase-card">
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
        <span class="footer-icon">⚙️</span>
        <div>
          <p>总共约 <strong>6-10 周</strong>，每天投入 2-4 小时。</p>
          <p class="footer-path">
            核心路径：<em
              >微信小游戏：发布+开放能力+云开发+真机调试 → 运营：数值+留存+数据分析 →
              工程质量：测试+CI/CD+WebSocket+手感+内存 → 多端适配：i18n+TS模式</em
            >
          </p>
        </div>
      </div>

      <div class="tools-card">
        <h3>🛠️ 本课程涉及的工具与平台</h3>
        <div class="tool-grid">
          <div class="tool-item">
            <strong>微信开发者工具</strong>
            <span>小游戏调试与预览</span>
            <span>developers.weixin.qq.com</span>
          </div>
          <div class="tool-item">
            <strong>微信云开发</strong>
            <span>云数据库/云函数/云存储</span>
            <span>developers.weixin.qq.com</span>
          </div>
          <div class="tool-item">
            <strong>GitHub Actions</strong>
            <span>CI/CD 自动化流水线</span>
            <span>github.com/features/actions</span>
          </div>
          <div class="tool-item">
            <strong>Chrome DevTools</strong>
            <span>性能分析与内存排查</span>
          </div>
        </div>
      </div>
    </footer>

    <HomeSidebar :groups="phaseGroups" course="engineering" />
  </div>
</template>

<style scoped src="@/styles/home-shared.css"></style>
