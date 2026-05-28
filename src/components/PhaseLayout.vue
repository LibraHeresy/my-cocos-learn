<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageTOC from '@/components/PageTOC.vue'

const props = withDefaults(defineProps<{
  phase: number
  title: string
  duration: string
  total?: number
}>(), {
  total: 0,
})

const route = useRoute()
const router = useRouter()

const course = computed(() => {
  const m = (route.name as string)?.match(/^(cocos|art|audio|engineering)-phase\d+$/)
  return m ? m[1] : 'cocos'
})

const maxPhase = computed(() => {
  if (props.total > 0) return props.total
  let max = 0
  for (const r of router.getRoutes()) {
    const m = (r.name as string)?.match(new RegExp(`^${course.value}-phase(\\d+)$`))
    if (m) {
      const n = parseInt(m[1])
      if (n > max) max = n
    }
  }
  return max
})

const courseHome = computed(() => course.value === 'cocos' ? '/' : `/${course.value}`)

const courseLabel = computed(() => {
  const labels: Record<string, string> = {
    cocos: '返回 cocos 课程',
    art: '返回美术课程',
    audio: '返回音效课程',
    engineering: '返回工程课程',
  }
  return labels[course.value] ?? '返回课程首页'
})
</script>

<template>
  <div class="phase-layout">
    <!-- 进度指示器 -->
    <div class="progress-bar" aria-label="学习进度">
      <div
        v-for="i in maxPhase"
        :key="i"
        class="progress-dot"
        :class="{ active: i <= phase, current: i === phase }"
      />
    </div>

    <header class="phase-header">
      <RouterLink :to="courseHome" class="back-link">
        <span class="back-arrow">&larr;</span> {{ courseLabel }}
      </RouterLink>
      <div class="header-meta">
        <span class="phase-badge">第 {{ phase }} 阶段</span>
        <span class="duration-badge">{{ duration }}</span>
      </div>
      <h1>{{ title }}</h1>
    </header>

    <main class="phase-body">
      <slot />
    </main>
    <PageTOC />

    <nav class="phase-nav">
      <RouterLink v-if="phase > 1" :to="`/${course}/phase/${phase - 1}`" class="nav-btn prev">
        <span class="nav-arrow">&larr;</span>
        <span class="nav-label">
          <small>上一阶段</small>
          <strong>第 {{ phase - 1 }} 阶段</strong>
        </span>
      </RouterLink>
      <span v-else class="nav-btn placeholder" />

      <RouterLink v-if="phase < maxPhase" :to="`/${course}/phase/${phase + 1}`" class="nav-btn next">
        <span class="nav-label">
          <small>下一阶段</small>
          <strong>第 {{ phase + 1 }} 阶段</strong>
        </span>
        <span class="nav-arrow">&rarr;</span>
      </RouterLink>
      <span v-else class="nav-btn placeholder" />
    </nav>
  </div>
</template>

<style scoped src="@/styles/phase-layout.css"></style>
