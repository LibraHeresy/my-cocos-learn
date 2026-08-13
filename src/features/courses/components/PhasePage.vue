<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PhaseLayout from '@/features/courses/components/PhaseLayout.vue'
import ConceptBlock from '@/features/courses/components/ConceptBlock.vue'
import DemoHost from '@/features/courses/demos/DemoHost.vue'
import { detectCourseFromRoute, parsePhaseFromRoute } from '@/features/courses/data/courses'
import { loadPhase } from '@/content/loader'
import type { PhaseMdData } from '@/features/courses/types/phase'

const route = useRoute()
const data = ref<PhaseMdData | null>(null)
const loading = ref(false)
let loadSeq = 0

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

watch(
  [course, phase],
  async ([courseValue, phaseValue]) => {
    const seq = ++loadSeq
    if (!courseValue || !phaseValue) {
      data.value = null
      loading.value = false
      return
    }
    loading.value = true
    const loaded = await loadPhase(courseValue, phaseValue)
    if (seq === loadSeq) {
      data.value = loaded
      loading.value = false
    }
  },
  { immediate: true },
)
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
  <div v-else-if="loading" class="phase-loading" role="status">加载中…</div>
</template>

<style scoped>
.phase-loading {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
</style>
