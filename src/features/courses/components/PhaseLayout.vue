<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageTOC from '@/features/navigation/components/PageTOC.vue'
import { COURSES, detectCourseFromRoute, getPhaseCount } from '@/features/courses/data/courses'
import { recordVisit, markCompleted, isCompleted, toggleCompleted } from '@/stores/readingStore'

const props = defineProps<{
  phase: number
  title: string
  duration: string
}>()

const route = useRoute()

const course = computed(() => {
  const name = route.name
  if (!name || typeof name !== 'string') return 'cocos'
  return detectCourseFromRoute(name) ?? 'cocos'
})

const maxPhase = computed(() => getPhaseCount(course.value))

const courseHome = computed(() => COURSES[course.value].courseHome)

const courseLabel = computed(() => COURSES[course.value]?.backLabel ?? '返回课程首页')

const isDone = (i: number) => isCompleted(course.value, i)

function toggleComplete() {
  toggleCompleted(course.value, props.phase)
}

// 记录访问 + 滚动到底部自动判定完成（双通道：也可手动 toggle 撤销）
let completionObserver: IntersectionObserver | null = null

function recordVisitAndObserve() {
  recordVisit(course.value, props.phase)
  completionObserver?.disconnect()
  const blocks = document.querySelectorAll('.concept-block')
  const last = blocks[blocks.length - 1]
  if (!last) return
  completionObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting) && window.scrollY > 0) {
        markCompleted(course.value, props.phase)
      }
    },
    { rootMargin: '0px 0px -20% 0px' },
  )
  completionObserver.observe(last)
}

// 滚动渐入由每个 ConceptBlock 自行管理（useRevealOnScroll），这里不再重复观察
onMounted(() => {
  recordVisitAndObserve()
})
watch(() => route.path, recordVisitAndObserve)
onBeforeUnmount(() => completionObserver?.disconnect())
</script>

<template>
  <div class="phase-layout">
    <!-- 进度指示器 -->
    <div
      class="progress-bar"
      role="progressbar"
      aria-label="学习进度"
      :aria-valuemin="1"
      :aria-valuemax="maxPhase"
      :aria-valuenow="phase"
    >
      <div
        v-for="i in maxPhase"
        :key="i"
        class="progress-dot"
        :class="{ active: i <= phase, current: i === phase, done: isDone(i) }"
        aria-hidden="true"
      />
    </div>

    <header class="phase-header">
      <RouterLink :to="courseHome" class="back-link">
        <span class="back-arrow">&larr;</span> {{ courseLabel }}
      </RouterLink>
      <div class="header-meta">
        <span class="phase-badge">第 {{ phase }} 阶段</span>
        <span class="duration-badge">{{ duration }}</span>
        <button
          type="button"
          class="done-toggle"
          :class="{ done: isDone(phase) }"
          :aria-pressed="isDone(phase)"
          @click="toggleComplete"
        >
          {{ isDone(phase) ? '✓ 已完成' : '标记完成' }}
        </button>
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
