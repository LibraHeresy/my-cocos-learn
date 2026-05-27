<script setup lang="ts">
import PageTOC from '@/components/PageTOC.vue'

defineProps<{
  phase: number
  title: string
  duration: string
}>()
</script>

<template>
  <div class="phase-layout">
    <!-- 进度指示器 -->
    <div class="progress-bar" aria-label="学习进度">
      <div
        v-for="i in 7"
        :key="i"
        class="progress-dot"
        :class="{ active: i <= phase, current: i === phase }"
      />
    </div>

    <header class="phase-header">
      <RouterLink to="/art" class="back-link">
        <span class="back-arrow">&larr;</span> 返回美术课程
      </RouterLink>
      <div class="header-meta">
        <span class="phase-badge">第 {{ phase }} 阶段</span>
        <span class="duration-badge">{{ duration }}</span>
      </div>
      <h1>{{ title }}</h1>
    </header>

    <div class="phase-content-row">
      <main class="phase-body">
        <slot />
      </main>
      <PageTOC />
    </div>

    <nav class="phase-nav">
      <RouterLink v-if="phase > 1" :to="`/art/phase/${phase - 1}`" class="nav-btn prev">
        <span class="nav-arrow">&larr;</span>
        <span class="nav-label">
          <small>上一阶段</small>
          <strong>第 {{ phase - 1 }} 阶段</strong>
        </span>
      </RouterLink>
      <span v-else class="nav-btn placeholder" />

      <RouterLink v-if="phase < 7" :to="`/art/phase/${phase + 1}`" class="nav-btn next">
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
