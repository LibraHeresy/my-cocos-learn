<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useSkillTree } from '@/features/workshop/composables/useSkillTree'
import { getAllCompletedChallenges } from '@/features/workshop/stores/workshopStore'
import { SKILL_LINES } from '@/features/workshop/data/skill-tree'
import { CHALLENGES } from '@/features/workshop/data/challenges'
import type { SkillTreeNode } from '@/features/workshop/types/workshop'

const { nodes, skillLines } = useSkillTree()
const completedSet = ref(new Set(getAllCompletedChallenges()))

// track which node is expanded: "lineId-level"
const expandedKey = ref<string | null>(null)

function getLineNodes(lineId: string): SkillTreeNode[] {
  return nodes.value.filter((n) => n.lineId === lineId)
}

function toggleExpand(lineId: string, level: number) {
  const key = `${lineId}-${level}`
  expandedKey.value = expandedKey.value === key ? null : key
}

function getChallengesForNode(node: SkillTreeNode) {
  const line = SKILL_LINES.find((l) => l.id === node.lineId)
  if (!line) return []
  const levelDef = line.levels.find((lv) => lv.level === node.level)
  if (!levelDef) return []
  return levelDef.requiredChallenges
    .map((id) => CHALLENGES.find((c) => c.id === id))
    .filter(Boolean) as (typeof CHALLENGES)[number][]
}

function isChallengeDone(id: number): boolean {
  return completedSet.value.has(id)
}
</script>

<template>
  <div class="skill-tree">
    <h2 class="section-title">🌲 技能树</h2>
    <div v-for="line in skillLines" :key="line.id" class="skill-line">
      <div class="skill-line-header">
        <span class="skill-line-icon">{{ line.icon }}</span>
        <span class="skill-line-name">{{ line.name }}</span>
        <span class="skill-line-desc">{{ line.description }}</span>
      </div>
      <div class="skill-levels">
        <div
          v-for="node in getLineNodes(line.id)"
          :key="`${line.id}-${node.level}`"
          class="skill-node"
          :class="{
            completed: node.completed,
            current: node.isCurrent,
            locked: !node.unlocked,
            expanded: expandedKey === `${line.id}-${node.level}`,
          }"
          @click="toggleExpand(line.id, node.level)"
        >
          <div class="node-indicator">
            <span v-if="node.completed" class="node-icon">✓</span>
            <span v-else-if="node.isCurrent" class="node-icon current-dot" />
            <span v-else class="node-icon locked-icon">🔒</span>
          </div>
          <div class="node-info">
            <span class="node-level">Lv.{{ node.level }}</span>
            <span class="node-name">{{ node.levelName }}</span>
            <span class="node-desc">{{ node.description }}</span>
          </div>
          <div v-if="node.completed" class="node-badge completed-badge">已掌握</div>
          <div v-else-if="node.isCurrent" class="node-badge current-badge">攻关中</div>
          <div class="node-expand-hint">▾</div>
        </div>
      </div>

      <!-- Expanded panel -->
      <div
        v-for="node in getLineNodes(line.id)"
        :key="`panel-${line.id}-${node.level}`"
        v-show="expandedKey === `${line.id}-${node.level}`"
        class="expand-panel"
      >
        <div class="panel-header">
          <span>{{ line.icon }} {{ line.name }} Lv.{{ node.level }}</span>
          <span v-if="node.completed" class="panel-status done">✓ 已掌握</span>
          <span v-else-if="node.isCurrent" class="panel-status active">⚡ 攻关中</span>
          <span v-else class="panel-status locked">🔒 未解锁</span>
        </div>
        <p class="panel-desc">{{ node.description }}</p>
        <div v-if="!node.completed" class="panel-challenges">
          <p class="panel-subtitle">攻关顺序：</p>
          <div
            v-for="(ch, idx) in getChallengesForNode(node)"
            :key="ch.id"
            class="challenge-step"
            :class="{ done: isChallengeDone(ch.id) }"
          >
            <span class="step-num">{{ idx + 1 }}</span>
            <span class="step-icon">{{ ch.icon }}</span>
            <span class="step-title">{{ ch.title }}</span>
            <span v-if="isChallengeDone(ch.id)" class="step-check">✓</span>
            <RouterLink
              v-else
              :to="`/workshop/phase/${ch.id}`"
              class="step-link"
            >
              去挑战 →
            </RouterLink>
          </div>
        </div>
        <div v-else class="panel-done-msg">
          ✅ 本等级所有挑战已完成
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-tree {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.skill-line {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-light);
}
.skill-line:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.skill-line-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.skill-line-icon { font-size: 1.1rem; }
.skill-line-name { font-weight: 700; color: var(--color-text); font-size: 0.92rem; }
.skill-line-desc { font-size: 0.78rem; color: var(--color-text-muted); margin-left: auto; }

.skill-levels {
  display: flex;
  gap: 0.75rem;
}

.skill-node {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border-left: 3px solid var(--color-border);
  background: var(--color-bg);
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  min-width: 0;
  cursor: pointer;
}

.skill-node:hover {
  transform: translateY(-1px);
}

.skill-node.expanded {
  border-left-color: var(--color-primary);
}

.skill-node.completed {
  border-left-color: var(--color-success);
  background: var(--color-success-soft);
}

.skill-node.current {
  border-left-color: var(--color-primary);
  background: var(--color-primary-soft);
  animation: skill-pulse 2s ease-in-out infinite;
}

.skill-node.locked {
  opacity: 0.5;
}

.node-indicator {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-icon { font-size: 0.75rem; }
.completed .node-icon { color: var(--color-success); font-weight: 700; }

.current-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
}

.locked-icon { font-size: 0.65rem; }

.node-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.node-level {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.node-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-desc {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  line-height: 1.35;
}

.node-badge {
  flex-shrink: 0;
  font-size: 0.62rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
}

.completed-badge { background: var(--color-success); color: var(--color-on-primary); }
.current-badge { background: var(--color-primary); color: var(--color-on-primary); }

.node-expand-hint {
  flex-shrink: 0;
  font-size: 0.6rem;
  color: var(--color-text-soft);
  margin-top: 1px;
}

/* Expand Panel */
.expand-panel {
  margin-top: 0.6rem;
  padding: 0.75rem 1rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.panel-status { font-size: 0.72rem; font-weight: 600; }
.panel-status.done { color: var(--color-success); }
.panel-status.active { color: var(--color-primary); }
.panel-status.locked { color: var(--color-text-soft); }

.panel-desc {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin: 0 0 0.5rem;
}

.panel-subtitle {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.4rem;
}

.challenge-step {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  margin-bottom: 0.25rem;
  background: var(--color-surface);
}

.challenge-step.done {
  opacity: 0.6;
  background: var(--color-success-soft);
}

.step-num {
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: 0.62rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.challenge-step.done .step-num { background: var(--color-success); }

.step-icon { font-size: 0.85rem; flex-shrink: 0; }
.step-title { font-size: 0.8rem; color: var(--color-text); flex: 1; }
.step-check { font-size: 0.75rem; color: var(--color-success); font-weight: 700; }

.step-link {
  font-size: 0.72rem;
  color: var(--color-primary);
  font-weight: 600;
  flex-shrink: 0;
}

.panel-done-msg {
  font-size: 0.82rem;
  color: var(--color-success);
  font-weight: 600;
}

@keyframes skill-pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--shadow-pulse); }
  50% { box-shadow: 0 0 0 6px rgba(224, 123, 60, 0); }
}

@media (max-width: 700px) {
  .skill-levels {
    flex-direction: column;
    gap: 0.4rem;
  }
  .skill-line-desc { display: none; }
}
</style>
