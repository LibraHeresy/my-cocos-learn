<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()

const courses = [
  { id: 'art', label: '像素美术', icon: '🎨', path: '/art' },
  { id: 'cocos', label: 'Cocos 引擎', icon: '🎮', path: '/cocos' },
  { id: 'audio', label: '游戏音效', icon: '🔊', path: '/audio' },
  { id: 'engineering', label: '工程化与运营', icon: '⚙️', path: '/engineering' },
]

const activeCourse = computed(() => {
  const name = route.name
  if (!name) return 'cocos'
  const nameStr = name as string
  if (nameStr === 'home') return 'cocos'
  if (nameStr.startsWith('engineering')) return 'engineering'
  if (nameStr.startsWith('cocos')) return 'cocos'
  if (nameStr.startsWith('art')) return 'art'
  if (nameStr.startsWith('audio')) return 'audio'
  return 'cocos'
})
</script>

<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <RouterLink to="/" class="nav-brand">✈️ 像素飞机大战</RouterLink>
      <div class="nav-tabs">
        <RouterLink
          v-for="c in courses"
          :key="c.id"
          :to="c.path"
          class="nav-tab"
          :class="{ active: activeCourse === c.id }"
        >
          <span class="tab-icon">{{ c.icon }}</span>
          <span class="tab-label">{{ c.label }}</span>
        </RouterLink>
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
    color 0.2s;
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
