<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { SPEEDRUN_DAYS } from '@/data/speedrun-days'

const STORAGE_KEY = '__speedrun_progress__'

function loadProgress(): Record<number, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

const progress = computed(() => loadProgress())
const completedCount = computed(() => Object.values(progress.value).filter(Boolean).length)
const overallPercent = computed(() => Math.round((completedCount.value / 30) * 100))

const weekLabels = ['第一周：从零到 Demo', '第二周：完整可玩游戏', '第三周：音频 + 双端发布', '第四周：打磨 + 上架']
const weekRanges: [number, number][] = [[1, 7], [8, 14], [15, 21], [22, 30]]

function dayStatus(day: number): string {
  if (progress.value[day]) return 'completed'
  return ''
}

function handleReset() {
  if (confirm('确定要重置全部速通进度吗？')) {
    localStorage.removeItem(STORAGE_KEY)
    location.reload()
  }
}
</script>

<template>
  <div class="speedrun-landing">
    <header class="speedrun-hero">
      <p class="hero-eyebrow">30 天游戏发布挑战</p>
      <h1>从零到<span class="highlight">微信小游戏上架</span></h1>
      <p class="subtitle">专为 Vue 前端工程师设计。每天一个目标，从参考课程中提取精华知识，30 天发布你的第一款像素飞机大战。</p>
      <div class="speedrun-stats">
        <div class="stat-item"><div class="stat-value">{{ completedCount }}<span class="stat-unit">/30</span></div><div class="stat-label">已完成天数</div></div>
        <div class="stat-item"><div class="stat-value">{{ overallPercent }}<span class="stat-unit">%</span></div><div class="stat-label">总体进度</div></div>
      </div>
      <div style="margin-top: 1.5rem;">
        <RouterLink to="/speedrun/day/1" class="start-btn">{{ completedCount > 0 ? '继续挑战' : '开始 30 天挑战' }}</RouterLink>
        <button v-if="completedCount > 0" @click="handleReset" class="reset-btn">重置进度</button>
      </div>
    </header>

    <section v-for="(label, wi) in weekLabels" :key="label" style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.1rem; border-bottom: 2px solid var(--color-primary); display: inline-block; padding-bottom: 0.3rem;">{{ label }}</h2>
      <div class="day-grid">
        <RouterLink v-for="d in Array.from({length: weekRanges[wi][1] - weekRanges[wi][0] + 1}, (_, i) => weekRanges[wi][0] + i)" :key="d" :to="`/speedrun/day/${d}`" class="day-card" :class="dayStatus(d)">
          <span class="day-card-num">{{ dayStatus(d) === 'completed' ? '✓' : 'D' + d }}</span>
          <span class="day-card-title">{{ SPEEDRUN_DAYS[d - 1].title }}</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.speedrun-landing { max-width: var(--max-width); margin: 0 auto; padding: 2rem 1.5rem 4rem; }
.speedrun-hero { text-align: center; margin-bottom: 3rem; }
.speedrun-hero .hero-eyebrow { font-size: 0.85rem; color: var(--color-primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
.speedrun-hero h1 { font-size: 2.2rem; margin: 0 0 0.75rem; color: var(--color-text); }
.speedrun-hero .subtitle { font-size: 0.95rem; color: var(--color-text-muted); max-width: 520px; margin: 0 auto 1.5rem; line-height: 1.7; }
.speedrun-stats { display: flex; justify-content: center; gap: 2rem; }
.stat-item { text-align: center; }
.stat-value { font-size: 1.8rem; font-weight: 800; color: var(--color-primary); }
.stat-unit { font-size: 0.55em; font-weight: 600; color: var(--color-text-muted); }
.stat-label { font-size: 0.78rem; color: var(--color-text-muted); }
.highlight { color: var(--color-accent); text-decoration: underline; text-underline-offset: 4px; }
.start-btn { display: inline-block; padding: 0.7rem 2rem; border-radius: var(--radius-sm); background: var(--color-success); color: #fff; font-size: 1rem; font-weight: 700; }
.reset-btn { margin-left: 1rem; padding: 0.7rem 1.25rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text-muted); cursor: pointer; font-size: 0.85rem; }
.day-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; margin-top: 10px; }
.day-card { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.6rem 0.3rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface); text-align: center; text-decoration: none; transition: background 0.2s, border-color 0.2s, transform 0.2s; }
.day-card:hover { background: var(--color-primary-soft); border-color: var(--color-primary); transform: translateY(-2px); }
.day-card.completed { background: #eaf7ea; border-color: var(--color-success); }
.day-card-num { font-size: 0.7rem; font-weight: 800; color: var(--color-text-muted); }
.day-card.completed .day-card-num { color: var(--color-success); }
.day-card-title { font-size: 0.72rem; font-weight: 600; color: var(--color-text); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
@media (max-width: 640px) { .day-grid { grid-template-columns: repeat(3, 1fr); } }
</style>
