<script setup lang="ts">
defineProps<{
  steps: string[]
}>()

function splitStep(text: string): { title: string; sub: string } {
  const i = text.indexOf('：')
  if (i === -1) return { title: text, sub: '' }
  return { title: text.slice(0, i), sub: text.slice(i + 1) }
}
</script>

<template>
  <div class="stepper" v-if="steps.length">
    <template v-for="(step, i) in steps" :key="i">
      <div class="step-node">
        <span class="step-num">{{ i + 1 }}</span>
        <div class="step-text">
          <span class="step-title">{{ splitStep(step).title }}</span>
          <span v-if="splitStep(step).sub" class="step-sub">{{ splitStep(step).sub }}</span>
        </div>
      </div>
      <div v-if="i < steps.length - 1" class="step-arrow">👇</div>
    </template>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.75rem;
  transform: translateX(-1.25rem);
}

@keyframes arrow-bounce {
  0%, 100% { transform: translateY(-3px); }
  50% { transform: translateY(1px); }
}

.step-node {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-light);
  border-radius: 12px;
  padding: 0.6rem 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-width: 260px;
}

.step-node:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.step-node:hover .step-num {
  transform: scale(1.15);
}

.step-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.step-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
}

.step-sub {
  font-size: 0.74rem;
  color: var(--color-text-muted);
}

.step-arrow {
  color: var(--color-primary);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: arrow-bounce 1.2s ease-in-out infinite;
  height: 36px;
}
</style>
