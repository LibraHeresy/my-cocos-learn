import { ref, watch, onBeforeUnmount, toValue, type MaybeRefOrGetter } from 'vue'
import { getBlob } from '@/stores/idb'

/**
 * 把 blobId 解析为可渲染的 objectURL。
 * 同一 blobId 复用共享 URL（模块级引用计数，归零才 revoke）——画廊卡片与图片查看器
 * 同时持有同一个 blob 时不会互相把 URL 干掉。
 */
const urlCache = new Map<string, { url: string; refs: number }>()

async function resolveBlobId(id: string): Promise<string> {
  const hit = urlCache.get(id)
  if (hit) {
    hit.refs++
    return hit.url
  }
  const blob = await getBlob(id)
  if (!blob) throw new Error(`blob not found: ${id}`)
  const url = URL.createObjectURL(blob)
  urlCache.set(id, { url, refs: 1 })
  return url
}

function releaseBlobId(id: string | undefined) {
  if (!id) return
  const hit = urlCache.get(id)
  if (!hit) return
  hit.refs--
  if (hit.refs <= 0) {
    URL.revokeObjectURL(hit.url)
    urlCache.delete(id)
  }
}

export function useBlobImage(source: MaybeRefOrGetter<string | undefined>) {
  const url = ref<string | null>(null)
  let currentId: string | undefined

  async function apply(id: string | undefined) {
    if (id === currentId) return
    releaseBlobId(currentId)
    currentId = id
    url.value = null
    if (!id) return
    try {
      const resolved = await resolveBlobId(id)
      if (currentId === id) url.value = resolved
    } catch {
      if (currentId === id) url.value = null
    }
  }

  watch(() => toValue(source), apply, { immediate: true })
  onBeforeUnmount(() => releaseBlobId(currentId))

  return { url }
}
