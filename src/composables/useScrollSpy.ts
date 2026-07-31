import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useScrollLock } from '@/composables/useScrollLock'

/**
 * 页面内滚动高亮：观察匹配 selector 的元素，把「视口内最靠上」的已相交元素 id 写入 activeId。
 * 内容变化（路由切换 / DOM 重建）后调用 refresh() 重建观察。
 * PageTOC 与 HomeSidebar 共用，消除两份几乎相同的 IntersectionObserver 代码。
 */
export function useScrollSpy(selector: string) {
  const activeId = ref('')
  const { scrollSeq, lockScroll } = useScrollLock()
  let observer: IntersectionObserver | null = null

  function setup() {
    observer = new IntersectionObserver(
      (entries) => {
        if (scrollSeq.value > 0) return
        let best: string | null = null
        let bestY = Infinity
        for (const entry of entries) {
          if (entry.isIntersecting && entry.boundingClientRect.top < bestY) {
            bestY = entry.boundingClientRect.top
            best = entry.target.id
          }
        }
        if (best !== null) activeId.value = best
      },
      { rootMargin: '-80px 0px -60% 0px' },
    )
    document.querySelectorAll(selector).forEach((el) => observer!.observe(el))
  }

  function refresh() {
    observer?.disconnect()
    setup()
  }

  onMounted(setup)
  onBeforeUnmount(() => observer?.disconnect())

  return { activeId, lockScroll, refresh }
}
