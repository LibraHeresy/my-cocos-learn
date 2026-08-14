<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HomeSidebar from '@/features/navigation/components/HomeSidebar.vue'
import FlowChart from '@/features/courses/components/FlowChart.vue'
import CourseProgressBar from '@/features/courses/components/CourseProgressBar.vue'
import type { PhaseGroup } from '@/features/courses/types/phase'
import { COURSE_HOME_CONFIG } from '@/features/courses/data/course-home'
import phaseMeta from 'virtual:phase-meta'

/** 4 门课程首页共用一个组件：内容全部来自 COURSE_HOME_CONFIG + 构建期生成的 virtual:phase-meta。 */
const route = useRoute()

const courseId = computed(() => {
  const name = route.name
  return typeof name === 'string' && name in COURSE_HOME_CONFIG ? name : 'cocos'
})

const config = computed(() => COURSE_HOME_CONFIG[courseId.value])

// title/duration 来自 md frontmatter（virtual:phase-meta），icon/summary/concepts 来自配置
const phaseGroups = computed<PhaseGroup[]>(() => {
  const metas = phaseMeta[courseId.value] ?? {}
  return config.value.phaseGroups.map((group) => ({
    label: group.label,
    tagline: group.tagline,
    phases: group.phases.map((p) => {
      const meta = metas[p.id]
      return {
        id: p.id,
        icon: p.icon,
        title: meta?.title ?? `第 ${p.id} 阶段`,
        duration: meta?.duration ?? '',
        summary: p.summary,
        concepts: p.concepts,
      }
    }),
  }))
})
</script>

<template>
  <div class="home">
    <header class="hero">
      <p class="hero-eyebrow">{{ config.hero.eyebrow }}</p>
      <h1>
        <span
          v-for="(seg, i) in config.hero.title"
          :key="i"
          :class="{ highlight: seg.highlight }"
        >{{ seg.text }}</span>
      </h1>
      <p class="subtitle">{{ config.hero.subtitle }}</p>
    </header>

    <CourseProgressBar :course="courseId" />

    <section class="phases-section">
      <h2 class="section-title">学习路径</h2>

      <div v-for="(group, i) in phaseGroups" :key="group.label" :data-group-index="i" class="phase-group" :style="{ '--s': i }">
        <div class="group-header">
          <h3 class="group-label">{{ group.label }}</h3>
          <p class="group-tagline">{{ group.tagline }}</p>
        </div>
        <div class="phases-grid">
          <RouterLink v-for="p in group.phases" :key="p.id" :to="`/${courseId}/phase/${p.id}`" :id="`phase-${p.id}`" class="phase-card">
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
        <span class="footer-icon">{{ config.footer.icon }}</span>
        <div>
          <p>总共约 <strong>{{ config.footer.total }}</strong>，每天投入 {{ config.footer.daily }}。</p>
          <p class="footer-path">核心路径：</p>
          <FlowChart :steps="config.pathSteps" />
        </div>
      </div>

      <div class="tools-card" id="tools-section">
        <h3>🛠️ {{ config.toolsTitle }}</h3>
        <div class="tool-grid">
          <div v-for="t in config.tools" :key="t.name" class="tool-item">
            <strong>{{ t.name }}</strong>
            <span>{{ t.desc }}</span>
            <span v-if="t.url">{{ t.url }}</span>
          </div>
        </div>
      </div>
    </footer>

    <HomeSidebar :groups="phaseGroups" />
  </div>
</template>

<style scoped src="@/styles/home-shared.css"></style>
