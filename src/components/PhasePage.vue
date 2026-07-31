<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
import { detectCourseFromRoute, parsePhaseFromRoute } from '@/data/courses'
import type { PhaseMdData } from '@/types/phase'

const dataModules = import.meta.glob<{ default: PhaseMdData }>(
  '../content/**/*.md',
  { eager: true },
)

const route = useRoute()

const data = computed(() => {
  const name = route.name
  if (!name || typeof name !== 'string') return null
  const course = detectCourseFromRoute(name)
  if (!course) return null
  const n = parsePhaseFromRoute(name) ?? 1
  const key = `../content/${course}/phase-${String(n).padStart(2, '0')}.md`
  return dataModules[key]?.default ?? null
})
</script>

<template>
  <PhaseLayout v-if="data" :phase="data.phase" :title="data.title" :duration="data.duration">
    <ConceptBlock
      v-for="b in data.blocks"
      :key="b.title"
      :icon="b.icon"
      :title="b.title"
    >
      <div v-html="b.html" />
    </ConceptBlock>
  </PhaseLayout>
</template>
