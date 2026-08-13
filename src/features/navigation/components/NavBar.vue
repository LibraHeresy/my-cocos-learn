<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { COURSE_LIST, COURSES, detectCourseFromRoute } from '@/features/courses/data/courses'
import { useTheme } from '@/composables/useTheme'
import { getLastPosition } from '@/stores/readingStore'
import SearchBox from '@/features/search/SearchBox.vue'

const route = useRoute()
const { isDark, toggle } = useTheme()
const lastPos = computed(() => getLastPosition())

const courses = [
  { id: 'workshop', label: '工坊', icon: '🛠️', path: '/workshop' },
  ...COURSE_LIST.map((c) => ({ id: c.id, label: c.label, icon: c.icon, path: c.path })),
]

const activeCourse = computed(() => {
  const name = route.name
  if (!name || typeof name !== 'string') return 'workshop'
  if (name === 'home' || name.startsWith('workshop')) return 'workshop'
  // 阶段路由：由 COURSES key 动态推导
  const phaseCourse = detectCourseFromRoute(name)
  if (phaseCourse) return phaseCourse
  // 课程首页路由名即课程 id
  return name in COURSES ? name : 'workshop'
})
</script>

<template>
  <nav class="navbar" aria-label="主导航">
    <div class="navbar-inner">
      <RouterLink to="/" class="nav-brand">✈️ 像素飞机大战</RouterLink>
      <div class="nav-tabs">
        <RouterLink
          v-for="c in courses"
          :key="c.id"
          :to="c.path"
          class="nav-tab"
          :class="{ active: activeCourse === c.id }"
          :aria-current="activeCourse === c.id ? 'page' : undefined"
        >
          <span class="tab-icon">{{ c.icon }}</span>
          <span class="tab-label">{{ c.label }}</span>
        </RouterLink>
        <RouterLink
          v-if="lastPos"
          :to="`/${lastPos.course}/phase/${lastPos.phase}`"
          class="nav-continue"
          :aria-label="`继续学习：${lastPos.course} 第 ${lastPos.phase} 阶段`"
        >
          ▶ 继续
        </RouterLink>
        <SearchBox />
        <button
          type="button"
          class="nav-theme-toggle"
          :aria-label="isDark ? '切换浅色模式' : '切换深色模式'"
          :aria-pressed="isDark"
          @click="toggle"
        >
          <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.navbar-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 48px;
}

.nav-brand {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text);
  transition: opacity 0.2s;
}

.nav-brand:hover {
  opacity: 0.7;
  color: var(--color-text);
}

.nav-tabs {
  display: flex;
  gap: 0.25rem;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  transition:
    background 0.2s,
    color 0.2s,
    transform 0.3s;
  transform-origin: center;
  cursor: pointer;
}

.nav-tab:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}


.nav-tab.active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 600;
}

.tab-icon {
  font-size: 0.9rem;
  line-height: 1;
}

.tab-label {
  white-space: nowrap;
}

.nav-theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: 0.3rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s,
    transform 0.15s;
}

.nav-theme-toggle:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.nav-theme-toggle:active {
  transform: scale(0.95);
}

.theme-icon {
  font-size: 0.95rem;
  line-height: 1;
}

.nav-continue {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  margin-left: 0.35rem;
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  white-space: nowrap;
}

.nav-continue:hover {
  color: var(--color-primary);
  background: var(--color-primary-soft);
  opacity: 0.85;
}

@media (max-width: 640px) {
  .navbar-inner {
    padding: 0 0.75rem;
  }

  .nav-brand {
    font-size: 0.85rem;
  }

  .nav-tab {
    padding: 0.35rem 0.5rem;
    gap: 0;
  }

  .tab-label {
    display: none;
  }

  .tab-icon {
    font-size: 1.05rem;
  }
}
</style>
