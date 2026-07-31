<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
import DemoHost from '@/demos/DemoHost.vue'
import { detectCourseFromRoute, parsePhaseFromRoute } from '@/data/courses'
import type { PhaseMdData } from '@/types/phase'

const dataModules = import.meta.glob<{ default: PhaseMdData }>(
  '../content/**/*.md',
  { eager: true },
)

const route = useRoute()

const course = computed(() => {
  const name = route.name
  if (!name || typeof name !== 'string') return null
  return detectCourseFromRoute(name)
})

const phase = computed(() => {
  const name = route.name
  if (!name || typeof name !== 'string') return 0
  return parsePhaseFromRoute(name) ?? 0
})

const data = computed(() => {
  if (!course.value) return null
  const key = `../content/${course.value}/phase-${String(phase.value).padStart(2, '0')}.md`
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
      <template v-for="(seg, i) in b.segments" :key="i">
        <div v-if="seg.type === 'html'" v-html="seg.html" />
        <DemoHost
          v-else
          :id="seg.id"
          :demo-props="seg.props"
          :course="course ?? undefined"
          :phase="phase || undefined"
        />
      </template>
    </ConceptBlock>
  </PhaseLayout>
</template>
