import { onBeforeUnmount } from 'vue'

/** 管理滚动渐入动画的 IntersectionObserver 生命周期，并在多次 observe 时复用同一实例。 */
export function useRevealOnScroll(options?: IntersectionObserverInit) {
  let observer: IntersectionObserver | null = null

  function ensureObserver(): IntersectionObserver {
    if (observer) return observer
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
    return observer
  }

  function observe(targets: string | Element) {
    const els = typeof targets === 'string'
      ? document.querySelectorAll(targets)
      : [targets]
    const obs = ensureObserver()
    els.forEach((el) => obs.observe(el))
  }

  onBeforeUnmount(() => observer?.disconnect())

  return { observe }
}
