<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { SPEEDRUN_DAYS } from '@/data/speedrun-days'
import ConceptBlock from '@/components/ConceptBlock.vue'

const day = SPEEDRUN_DAYS[18 - 1]
const STORAGE_KEY = '__speedrun_progress__'

const checklist = ref<Record<number, boolean>>({})
const completed = ref(false)

onMounted(() => {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const p = JSON.parse(raw); checklist.value = p[18]?.items || {}; completed.value = p[18]?.done || false } } catch {}
})

function toggle(i: number) { checklist.value[i] = !checklist.value[i]; save() }
function markDone() { completed.value = !completed.value; save() }

function save() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[18] = { items: checklist.value, done: completed.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {}
}
</script>

<template>
  <div class="day-page">
    <div class="day-header-badge">Day 18</div>
    <h1>{{ day.title }}</h1>
    <p class="day-summary">{{ day.summary }}</p>

    <ConceptBlock icon="📋" title="今日清单">
      <div class="checklist">
        <div v-for="(item, i) in day.checklist" :key="i" class="check-item" :class="{ done: checklist[i] }" @click="toggle(i)">
          <span class="check-box">{{ checklist[i] ? '✓' : '' }}</span>
          <span class="check-text">{{ item }}</span>
        </div>
      </div>
      <button class="done-btn" :class="{ active: completed }" @click="markDone">{{ completed ? '✅ 已完成' : '标记完成' }}</button>
    </ConceptBlock>

    <ConceptBlock icon="📖" title="深入学习">
      <p>以下参考课程阶段覆盖了今天所需的所有知识点：</p>
      <ul>
        <li v-for="r in day.refs" :key="r.label">
          <RouterLink :to="`/${r.course}/phase/${r.phase}`">{{ r.label }}</RouterLink>
        </li>
      </ul>
    </ConceptBlock>

    <nav class="day-nav">
      <RouterLink v-if="18 > 1" to="/speedrun/day/17" class="nav-btn">← Day 17</RouterLink>
      <span v-else class="nav-btn disabled">← 没有更早的了</span>
      <RouterLink v-if="18 < 30" to="/speedrun/day/19" class="nav-btn">Day 19 →</RouterLink>
      <span v-else class="nav-btn disabled">全部通关 →</span>
    </nav>
  </div>
</template>

<style scoped>
.day-page { max-width: var(--max-width); margin: 0 auto; padding: 2rem 1.5rem 4rem; }
.day-header-badge { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; background: var(--color-primary); color: #fff; font-size: 1.2rem; font-weight: 800; margin-bottom: 0.75rem; }
.day-page h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
.day-summary { color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.5rem; }
.checklist { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.check-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0; cursor: pointer; }
.check-item.done { opacity: 0.55; }
.check-item.done .check-text { text-decoration: line-through; }
.check-box { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: 2px solid var(--color-border); border-radius: 4px; flex-shrink: 0; font-size: 0.7rem; color: #fff; }
.check-item.done .check-box { background: var(--color-success); border-color: var(--color-success); }
.check-text { font-size: 0.88rem; }
.done-btn { padding: 0.5rem 1.5rem; border: none; border-radius: var(--radius-sm); background: var(--color-success); color: #fff; font-size: 0.85rem; font-weight: 700; cursor: pointer; }
.done-btn.active { background: var(--color-text-muted); }
.day-nav { display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border-light); }
.nav-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); color: var(--color-text); font-size: 0.85rem; text-decoration: none; }
.nav-btn:hover { background: var(--color-primary-soft); border-color: var(--color-primary); color: var(--color-primary); }
.nav-btn.disabled { opacity: 0.35; pointer-events: none; }
</style>
