import { onBeforeUnmount, onMounted, ref, toValue, type MaybeRefOrGetter } from 'vue'

/**
 * demo 动画可见性门控：根元素进入视口 且 页面未被隐藏时 `visible = true`。
 *
 * 各 demo 的 rAF 循环用它做门控：元素滚出视口或切到后台时停掉循环，
 * 回到视口/恢复前台时自动恢复，避免不可见的动画空耗 CPU/GPU
 * （尤其 ShaderDemo 的 WebGL 每帧上传纹理）。
 *
 * 环境退化：不支持 IntersectionObserver 或元素尚未挂载时视为始终可见。
 */
export function useDemoVisibility(target: MaybeRefOrGetter<HTMLElement | null>) {
  const visible = ref(false)
  let observer: IntersectionObserver | null = null
  let inView = false

  function update() {
    visible.value = inView && !document.hidden
  }

  function onVisibilityChange() {
    update()
  }

  onMounted(() => {
    const el = toValue(target)
    // 无 observer 能力或元素缺失：退化为可见（不做门控）
    inView = typeof IntersectionObserver === 'undefined' || !el
    update()
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          inView = entries.some((e) => e.isIntersecting)
          update()
        },
        // 提前 100px 预加载动画，避免进入视口边缘时才冷启动
        { rootMargin: '100px 0px' },
      )
      observer.observe(el)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  return { visible }
}
