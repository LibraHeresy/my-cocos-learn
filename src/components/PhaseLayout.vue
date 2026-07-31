<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageTOC from '@/components/PageTOC.vue'
import { COURSES, detectCourseFromRoute, getPhaseCount } from '@/data/courses'
import { useRevealOnScroll } from '@/composables/useRevealOnScroll'

const props = withDefaults(defineProps<{
  phase: number
  title: string
  duration: string
  total?: number
}>(), {
  total: 0,
})

const route = useRoute()

const course = computed(() => {
  const name = route.name
  if (!name || typeof name !== 'string') return 'cocos'
  return detectCourseFromRoute(name) ?? 'cocos'
})

const maxPhase = computed(() =>
  props.total > 0 ? props.total : getPhaseCount(course.value),
)

const courseHome = computed(() => COURSES[course.value].courseHome)

const courseLabel = computed(() => COURSES[course.value]?.backLabel ?? '返回课程首页')

const { observe } = useRevealOnScroll()

onMounted(() => observe('.concept-block'))
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
