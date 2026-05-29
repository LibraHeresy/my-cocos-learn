<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import PageTOC from '@/components/PageTOC.vue'
import { usePhaseCounts } from '@/composables/usePhaseCounts'

const props = withDefaults(defineProps<{
  phase: number
  title: string
  duration: string
  total?: number
}>(), {
  total: 0,
})

const route = useRoute()
const phaseCounts = usePhaseCounts()

const course = computed(() => {
  const m = (route.name as string)?.match(/^(cocos|art|audio|engineering)-phase\d+$/)
  return m ? m[1] : 'cocos'
})

const maxPhase = computed(() =>
  props.total > 0 ? props.total : phaseCounts[course.value] ?? 0,
)

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

let revealObserver: IntersectionObserver | null = null

onMounted(() => {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          revealObserver?.unobserve(e.target)
        }
      })
    },
    { rootMargin: '0px 0px -60px 0px' },
  )
  document.querySelectorAll('.concept-block').forEach((el) => revealObserver!.observe(el))
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
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
