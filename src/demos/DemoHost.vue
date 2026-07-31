<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { demoRegistry } from '@/demos'
import type { DemoId } from '@/demos/ids'
import '@/demos/demo-shell.css'

const props = defineProps<{
  id: DemoId
  course?: string
  phase?: number
  demoProps?: Record<string, string>
}>()

// 挂载后再渲染，SSR/预渲染快照只含正文，demo 纯客户端加载
const ready = ref(false)
onMounted(() => { ready.value = true })
</script>

<template>
  <div class="demo-host">
    <template v-if="ready && demoRegistry[props.id]">
      <component
        :is="demoRegistry[props.id]"
        :course="props.course"
        :phase="props.phase"
        v-bind="props.demoProps"
      />
    </template>
    <div v-else-if="!demoRegistry[props.id]" class="demo-missing">
      未注册的演示组件：{{ props.id }}
    </div>
  </div>
</template>
