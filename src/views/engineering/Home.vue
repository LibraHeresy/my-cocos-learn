<script setup lang="ts">
import { RouterLink } from 'vue-router'
import HomeSidebar from '@/components/HomeSidebar.vue'
import FlowChart from '@/components/FlowChart.vue'
import CourseProgressBar from '@/components/CourseProgressBar.vue'
import { slug } from '@/utils/slug'
import type { PhaseGroup } from '@/types/phase'

const pathSteps = ['平台：微信小游戏适配+开放能力', '运营：数值+留存+数据+变现', '工程：测试+手感+CI/CD+性能', '多端：国际化+TS 模式']

const phaseGroups: PhaseGroup[] = [
  {
    label: '微信小游戏篇',
    tagline: '打通微信小游戏完整链路——从适配到发布',
    phases: [
      { id: 1, icon: '🎯', title: '从 Demo 到产品', duration: '1 天', summary: '游戏开发和游戏工程化有什么区别？什么才是"产品级"的游戏？', concepts: ['产品思维', 'MVP', '工程化'] },
      { id: 2, icon: '📱', title: '微信小游戏平台全景', duration: '1-2 天', summary: '运行环境、包体限制、API 差异——理解微信小游戏和 Web 的本质区别。', concepts: ['运行环境', '包体限制', '平台差异'] },
      { id: 3, icon: '🔧', title: '微信小游戏适配', duration: '2-3 天', summary: '音频格式转换、Bundle 分包、onShow/onHide——把 Cocos 项目改造成微信小游戏。', concepts: ['音频适配', 'Bundle 分包', '生命周期'] },
      { id: 4, icon: '🔐', title: '微信开放能力', duration: '1-2 天', summary: '分享/排行榜/激励视频广告/云开发——用微信生态能力让游戏更好玩。', concepts: ['分享', '排行榜', '激励视频', '云开发'] },
      { id: 5, icon: '📲', title: '真机调试与性能', duration: '1-2 天', summary: '远程调试工具链、设备分档策略、微信性能面板——让游戏在真机上流畅运行。', concepts: ['真机调试', '设备分档', '性能面板'] },
    ],
  },
  {
    label: '运营篇',
    tagline: '让玩家留下来——数值、留存、数据、变现',
    phases: [
      { id: 6, icon: '📊', title: '数值设计（上）——伤害公式', duration: '2-3 天', summary: 'DPS/EHP/TTK 核心公式推导、难度曲线设计——让游戏的"数字感"恰到好处。', concepts: ['DPS', 'EHP', 'TTK', '难度曲线'] },
      { id: 7, icon: '💰', title: '数值设计（下）——经济系统', duration: '2-3 天', summary: '金币产出与消耗的平衡、付费与免费的边界——经济系统的设计与调优。', concepts: ['金币平衡', '付费设计', '数值调优'] },
      { id: 8, icon: '📅', title: '留存系统设计', duration: '2-3 天', summary: '每日签到、任务系统、成就系统、新手引导——让玩家明天还想来。', concepts: ['签到/任务', '成就', '新手引导', '7日留存'] },
      { id: 9, icon: '📈', title: '数据驱动运营', duration: '1-2 天', summary: 'DAU/留存/广告 eCPM——定义关键指标、设计埋点方案、用数据指导迭代。', concepts: ['DAU/留存', '埋点', '数据分析', 'AB测试'] },
      { id: 10, icon: '💵', title: '变现设计', duration: '1-2 天', summary: '激励视频/插屏/Banner/内购——四种变现方式的优劣与组合策略。', concepts: ['激励视频', '插屏', '内购', '混合变现'] },
    ],
  },
  {
    label: '工程质量篇',
    tagline: '测试、手感、CI/CD、性能——让游戏开发像前端工程一样可靠',
    phases: [
      { id: 11, icon: '🧪', title: '游戏测试体系', duration: '1-2 天', summary: '单元测试游戏逻辑、录制回放回归测试、性能基准——让 Bug 在发布前被找到。', concepts: ['单元测试', '回归测试', '性能基准'] },
      { id: 12, icon: '💫', title: '手感设计', duration: '1 天', summary: '屏幕震动、冻结帧、镜头跟随、粒子爆发——"手感"的量化方法与实现。', concepts: ['屏幕震动', '冻结帧', '镜头跟随'] },
      { id: 13, icon: '🚀', title: 'CI/CD 构建流水线', duration: '1-2 天', summary: 'Cocos CLI + GitHub Actions——自动化多平台构建和发布。', concepts: ['Cocos CLI', 'GitHub Actions', '自动化'] },
      { id: 14, icon: '🔍', title: '内存与性能排查', duration: '1 天', summary: '常见泄漏场景、Chrome Memory 面板、事件清理检查清单——别让游戏越玩越卡。', concepts: ['内存泄漏', 'Heap Snapshot', '事件清理'] },
    ],
  },
  {
    label: '多端适配篇',
    tagline: '国际化与 TypeScript 设计模式——生产级项目的最后拼图',
    phases: [
      { id: 15, icon: '🌍', title: '国际化', duration: '1 天', summary: '字符串表方案、运行时语言切换、CJK 字体裁剪——让游戏出海。', concepts: ['字符串表', '语言切换', '字体子集'] },
      { id: 16, icon: '💎', title: 'TypeScript 游戏模式', duration: '1 天', summary: 'Discriminated Union 状态建模、Zod 校验、Branded Types——前端 TS 技巧在游戏中的落地。', concepts: ['Discriminated Union', 'Zod', 'Branded Types'] },
    ],
  },
]
</script>

<template>
  <div class="home">
    <header class="hero">
      <p class="hero-eyebrow">游戏工程化与运营</p>
      <h1>从<span class="highlight">Demo</span>到<span class="highlight">产品</span></h1>
      <p class="subtitle">覆盖微信小游戏发布、数值设计、用户留存、商业化变现、测试体系、CI/CD、手感打磨与性能优化。</p>
    </header>
    <CourseProgressBar course="engineering" />
    <section class="phases-section">
      <h2 class="section-title">学习路径</h2>
      <div v-for="(group, i) in phaseGroups" :key="group.label" :id="slug(group.label)" :data-group-index="i" class="phase-group" :style="{ '--s': i }">
        <div class="group-header"><h3 class="group-label">{{ group.label }}</h3><p class="group-tagline">{{ group.tagline }}</p></div>
        <div class="phases-grid">
          <RouterLink v-for="p in group.phases" :key="p.id" :to="`/engineering/phase/${p.id}`" :id="`phase-${p.id}`" class="phase-card">
            <div class="card-top"><span class="card-icon">{{ p.icon }}</span><span class="card-duration">{{ p.duration }}</span></div>
            <span class="card-phase">第 {{ p.id }} 阶段</span><h3>{{ p.title }}</h3><p class="card-summary">{{ p.summary }}</p>
            <div class="card-tags"><span v-for="c in p.concepts" :key="c" class="tag">{{ c }}</span></div>
          </RouterLink>
        </div>
      </div>
    </section>
    <footer class="home-footer">
      <div class="footer-card" id="path-section"><span class="footer-icon">⚙️</span><div><p>总共约 <strong>6-10 周</strong>，每天投入 2-4 小时。</p><p class="footer-path">核心路径：</p><FlowChart :steps="pathSteps" /></div></div>
      <div class="tools-card" id="tools-section"><h3>🛠️ 本课程涉及的工具与平台</h3><div class="tool-grid"><div class="tool-item"><strong>微信开发者工具</strong><span>小游戏调试与预览</span></div><div class="tool-item"><strong>GitHub Actions</strong><span>CI/CD 自动化</span></div><div class="tool-item"><strong>Chrome DevTools</strong><span>性能与内存分析</span></div></div></div>
    </footer>
    <HomeSidebar :groups="phaseGroups" />
  </div>
</template>
<style scoped src="@/styles/home-shared.css"></style>
