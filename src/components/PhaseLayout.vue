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
        v-for="i in 8"
        :key="i"
        class="progress-dot"
        :class="{ active: i <= phase, current: i === phase }"
      />
    </div>

    <header class="phase-header">
      <RouterLink to="/" class="back-link">
        <span class="back-arrow">&larr;</span> 返回课程总览
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
      <RouterLink v-if="phase > 1" :to="`/cocos/phase/${phase - 1}`" class="nav-btn prev">
        <span class="nav-arrow">&larr;</span>
        <span class="nav-label">
          <small>上一阶段</small>
          <strong>第 {{ phase - 1 }} 阶段</strong>
        </span>
      </RouterLink>
      <span v-else class="nav-btn placeholder" />

      <RouterLink v-if="phase < 8" :to="`/cocos/phase/${phase + 1}`" class="nav-btn next">
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

<style scoped>
.phase-layout {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

/* ---- 进度条 ---- */
.progress-bar {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.progress-dot {
  width: 22px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border);
  transition:
    background 0.3s,
    transform 0.3s;
}

.progress-dot.active {
  background: var(--color-primary);
}

.progress-dot.current {
  transform: scaleX(1.3);
}

/* ---- Header ---- */
.phase-header {
  margin-bottom: 2.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
  font-size: 0.88rem;
  color: var(--color-text-muted);
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--color-primary);
}

.back-arrow {
  font-size: 1rem;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.6rem;
}

.phase-badge {
  display: inline-block;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  padding: 0.2em 0.85em;
  border-radius: 20px;
  font-size: 0.78rem;
  letter-spacing: 0.03em;
}

.duration-badge {
  display: inline-block;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 500;
  padding: 0.2em 0.75em;
  border-radius: 20px;
  font-size: 0.75rem;
}

.phase-header h1 {
  font-size: 2rem;
  margin: 0;
}

/* ---- Body ---- */
.phase-body {
  margin-bottom: 3rem;
}

/* ---- 底部导航 ---- */
.phase-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--color-border-light);
  padding-top: 1.5rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.15s;
  color: var(--color-text);
  cursor: pointer;
}

.nav-btn:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
  color: var(--color-text);
}

.nav-label {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.nav-label small {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-label strong {
  font-size: 0.88rem;
}

.nav-arrow {
  font-size: 1.1rem;
  color: var(--color-primary);
}

.nav-btn.placeholder {
  visibility: hidden;
}

@media (max-width: 640px) {
  .phase-layout {
    padding: 1.25rem 1rem 2rem;
  }

  .phase-header h1 {
    font-size: 1.4rem;
  }

  .phase-header {
    margin-bottom: 1.5rem;
  }

  .phase-nav {
    flex-direction: column;
  }

  .nav-btn {
    justify-content: center;
  }

  .progress-bar {
    margin-bottom: 1.25rem;
  }
}
</style>
