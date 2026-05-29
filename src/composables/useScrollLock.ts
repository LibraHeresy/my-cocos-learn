import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useScrollLock() {
  const scrollSeq = ref(0)

  function blockWheel(e: WheelEvent) {
    if (scrollSeq.value > 0) e.preventDefault()
  }

  function lockScroll() {
    scrollSeq.value++
    const seq = scrollSeq.value
    document.addEventListener('scrollend', () => { if (scrollSeq.value === seq) scrollSeq.value = 0 }, { once: true })
    setTimeout(() => { if (scrollSeq.value === seq) scrollSeq.value = 0 }, 1000)
  }

  onMounted(() => {
    document.addEventListener('wheel', blockWheel, { capture: true, passive: false })
  })

  onBeforeUnmount(() => {
    document.removeEventListener('wheel', blockWheel, { capture: true } as any)
  })

  return { scrollSeq, lockScroll }
}
