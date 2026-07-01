import { onBeforeUnmount } from 'vue'

/**
 * 管理滚动渐入动画的 IntersectionObserver 生命周期。
 * 被观察的元素进入视口时自动添加 .revealed 类名，每个元素仅触发一次。
 */
export function useRevealOnScroll(options?: IntersectionObserverInit) {
  let observer: IntersectionObserver | null = null

  function observe(targets: string | Element) {
    const els = typeof targets === 'string'
      ? document.querySelectorAll(targets)
      : [targets]

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer?.unobserve(entry.target)
          }
        })
      },
      options ?? { rootMargin: '0px 0px -60px 0px' },
    )

    els.forEach((el) => observer!.observe(el))
  }

  onBeforeUnmount(() => observer?.disconnect())

  return { observe }
}
