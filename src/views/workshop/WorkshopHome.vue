<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { getStats, getAllCompletedChallenges } from '@/stores/workshopStore'
import { CHALLENGES, STAGES } from '@/data/challenges'
import SkillTree from '@/components/workshop/SkillTree.vue'
import AssetMap from '@/components/workshop/AssetMap.vue'
import { usePracticeLog } from '@/composables/usePracticeLog'
import { computed } from 'vue'

const stats = computed(() => getStats())
const { recentEntries } = usePracticeLog()
const completedSet = computed(() => new Set(getAllCompletedChallenges()))

const currentStage = computed(() => {
  const done = completedSet.value
  // find the first incomplete challenge's stage
  let firstIncomplete = 1
  for (let i = 1; i <= CHALLENGES.length; i++) {
    if (!done.has(i)) { firstIncomplete = i; break }
  }
  const ch = CHALLENGES.find((c) => c.id === firstIncomplete)
  if (!ch) return null
  const stage = STAGES.find((s) => s.id === ch.stage)
  if (!stage) return null
  const stageChallenges = CHALLENGES.filter((c) => c.stage === stage.id)
  const stageDone = stageChallenges.filter((c) => done.has(c.id)).length
  const stageTotal = stageChallenges.length
  const nextChallenge = CHALLENGES.find((c) => c.id === firstIncomplete)
  return { stage, stageDone, stageTotal, nextChallenge }
})

function challengeStatus(id: number): 'completed' | 'available' {
  if (completedSet.value.has(id)) return 'completed'
  return 'available'
}
</script>

<template>
  <div class="workshop-home">
    <header class="workshop-hero">
      <h1>🛠️ 像素画工坊</h1>
      <p class="hero-sub">每次练习，都是你游戏的一块拼图</p>
    </header>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">{{ stats.streak }}</div>
        <div class="stat-label">连续练习（天）</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🌟</div>
        <div class="stat-value">{{ stats.totalSkillLevels }}<span class="stat-unit">/{{ stats.maxSkillLevels }}</span></div>
        <div class="stat-label">技能等级</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-value">{{ stats.unlockedChallenges }}<span class="stat-unit">/{{ stats.totalChallenges }}</span></div>
        <div class="stat-label">完成挑战</div>
      </div>
    </div>

    <div v-if="currentStage" class="current-stage">
      <div class="stage-indicator">
        <span class="stage-label">当前阶段</span>
        <span class="stage-name">阶段 {{ currentStage.stage.id }} · {{ currentStage.stage.name }}</span>
      </div>
      <div class="stage-progress-bar">
        <div class="stage-fill" :style="{ width: (currentStage.stageDone / currentStage.stageTotal * 100) + '%' }" />
      </div>
      <div class="stage-meta">
        <span>{{ currentStage.stageDone }}/{{ currentStage.stageTotal }} 关完成</span>
        <RouterLink v-if="currentStage.nextChallenge" :to="`/workshop/phase/${currentStage.nextChallenge.id}`" class="stage-next">
          下一关：{{ currentStage.nextChallenge.icon }} {{ currentStage.nextChallenge.title }} →
        </RouterLink>
      </div>
    </div>

    <div class="recent-section">
      <div class="recent-header">
        <h2 class="section-title">📝 最近练习</h2>
        <RouterLink to="/workshop/gallery" class="view-all">查看全部 →</RouterLink>
      </div>
      <div v-if="recentEntries.length === 0" class="empty-hint">
        还没有练习记录。去 <RouterLink to="/workshop/phase/1">Phase 1</RouterLink> 开始你的第一幅像素画吧。
      </div>
      <div v-for="entry in recentEntries" :key="entry.id" class="recent-item">
        <div class="recent-date">{{ entry.date.slice(0, 10) }}</div>
        <div class="recent-info">
          <span class="recent-title">Phase {{ entry.phase }} · {{ entry.title }}</span>
          <span v-if="entry.selfRating" class="recent-rating">{{ '⭐'.repeat(entry.selfRating) }}</span>
        </div>
        <RouterLink :to="`/workshop/phase/${entry.phase}`" class="recent-link">查看</RouterLink>
      </div>
    </div>

    <SkillTree />
    <AssetMap />

    <!-- Challenge Browser -->
    <div v-for="stage in STAGES" :key="stage.id" class="stage-section">
      <div class="stage-header">
        <h2 class="stage-title">阶段 {{ stage.id }} · {{ stage.name }}</h2>
        <span class="stage-range">关 {{ stage.range[0] }}—{{ stage.range[1] }}</span>
      </div>
      <div class="challenge-grid">
        <RouterLink
          v-for="c in CHALLENGES.filter(ch => ch.stage === stage.id)"
          :key="c.id"
          :to="`/workshop/phase/${c.id}`"
          class="challenge-chip"
          :class="challengeStatus(c.id)"
        >
          <span class="chip-icon">{{ c.icon }}</span>
          <span class="chip-num">{{ c.id }}</span>
          <span class="chip-title">{{ c.title }}</span>
          <span v-if="challengeStatus(c.id) === 'completed'" class="chip-check">✓</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workshop-home {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 1.75rem 1.5rem 4rem;
}

/* Hero */
.workshop-hero {
  text-align: center;
  margin-bottom: 1.25rem;
}

.workshop-hero h1 {
  font-size: 1.5rem;
  color: var(--color-text);
  margin: 0 0 0.25rem;
}

.hero-sub {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* Stats */
.stats-row {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 0.85rem 0.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  transition: border-color 0.2s;
}

.stat-card:hover { border-color: var(--color-primary); }

.stat-icon { font-size: 1.2rem; margin-bottom: 0.2rem; }
.stat-value { font-size: 1.35rem; font-weight: 800; color: var(--color-primary); line-height: 1.2; }
.stat-unit { font-size: 0.48em; font-weight: 600; color: var(--color-text-muted); }
.stat-label { font-size: 0.68rem; color: var(--color-text-muted); margin-top: 0.1rem; }

/* Current Stage */
.current-stage {
  background: var(--color-surface);
  border: 1px solid var(--color-primary);
  border-radius: 10px;
  padding: 0.85rem 1.1rem;
  margin-bottom: 1rem;
}

.stage-indicator {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.4rem;
}

.stage-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff;
  background: var(--color-primary);
  padding: 0.12rem 0.45rem;
  border-radius: 4px;
  letter-spacing: 0.03em;
}

.stage-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text);
}

.stage-progress-bar {
  height: 3px;
  background: var(--color-border-light);
  border-radius: 2px;
  margin-bottom: 0.4rem;
  overflow: hidden;
}

.stage-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.stage-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.stage-next {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.8rem;
}

/* Recent */
.recent-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-title { font-size: 0.95rem; color: var(--color-text); margin: 0; }

.view-all {
  font-size: 0.78rem;
  color: var(--color-primary);
  font-weight: 600;
}

.empty-hint {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  padding: 0.75rem 0;
  text-align: center;
}

.empty-hint a { color: var(--color-primary); font-weight: 600; }

.recent-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0;
  border-bottom: 1px solid var(--color-border-light);
}
.recent-item:last-child { border-bottom: none; }

.recent-date {
  font-size: 0.7rem;
  color: var(--color-text-soft);
  white-space: nowrap;
  min-width: 65px;
}

.recent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.recent-title { font-size: 0.82rem; color: var(--color-text); font-weight: 600; }
.recent-rating { font-size: 0.7rem; }

.recent-link {
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: 600;
  flex-shrink: 0;
}

/* Challenge Browser */
.stage-section { margin-bottom: 1.75rem; }
.stage-section:last-child { margin-bottom: 0; }

.stage-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border-light);
}

.stage-title { font-size: 0.9rem; color: var(--color-text); margin: 0; font-weight: 700; }
.stage-range { font-size: 0.7rem; color: var(--color-text-soft); }

.challenge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.35rem;
}

.challenge-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.6rem;
  border-radius: 7px;
  border: 1px solid var(--color-border-light);
  background: var(--color-surface);
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s, transform 0.12s;
}

.challenge-chip:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  transform: translateY(-1px);
}

.challenge-chip.completed {
  border-color: var(--color-success);
  background: var(--color-success-soft);
  opacity: 0.75;
}

.chip-icon { font-size: 0.85rem; flex-shrink: 0; }
.chip-num {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--color-text-muted);
  min-width: 1.1rem;
}

.chip-title {
  font-size: 0.78rem;
  color: var(--color-text);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-check {
  margin-left: auto;
  font-size: 0.68rem;
  color: var(--color-success);
  font-weight: 700;
  flex-shrink: 0;
}
</style>
