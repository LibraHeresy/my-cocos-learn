import { onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'

const FOCUSABLE_SELECTOR =
  'a[href], button, input, [tabindex]:not([tabindex="-1"])'

/**
 * 弹层焦点圈：Tab / Shift+Tab 在 container 内的可聚焦元素之间循环，阻止焦点逃逸到背景。
 * container 可能为 v-if 渲染（弹层挂载后才出现），因此在每次 Tab 时实时收集可聚焦元素，
 * 而不在 onMounted 时一次性收集。当弹层未渲染（container 为 null）时，监听器直接放行。
 */
export function useFocusTrap(containerRef: Ref<HTMLElement | null>) {
  function onKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return
    const container = containerRef.value
    if (!container) return

    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)

    if (focusables.length === 0) return

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null
    const isInside = active !== null && container.contains(active)

    if (e.shiftKey && (!isInside || active === first)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (!isInside || active === last)) {
      e.preventDefault()
      first.focus()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

  return { onKeydown }
}
