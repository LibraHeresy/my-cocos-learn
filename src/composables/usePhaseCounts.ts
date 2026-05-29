import { useRouter } from 'vue-router'

let cached: Record<string, number> | null = null

export function usePhaseCounts(): Record<string, number> {
  if (cached) return cached

  const router = useRouter()
  cached = {}
  for (const r of router.getRoutes()) {
    const m = (r.name as string)?.match(/^(cocos|art|audio|engineering)-phase(\d+)$/)
    if (m) {
      const n = parseInt(m[2])
      if (n > (cached[m[1]] ?? 0)) cached[m[1]] = n
    }
  }
  return cached
}
