/**
 * 共享的版本化持久化适配器（localStorage）。
 * 长期：workshopStore 后续可切换同一 adapter；readingStore 现在就用它。
 * 读写都 try/catch，localStorage 不可用时静默降级（失败可见性由上层 saveError 负责）。
 */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* localStorage 满/不可用：忽略（阅读进度丢失可接受） */
  }
}

/** 校验版本号，不匹配时返回 fallback（防未来 schema 误解） */
export function loadVersioned<T extends { version: number }>(
  key: string,
  currentVersion: number,
  fallback: T,
): T {
  const raw = loadJSON<T | null>(key, null)
  return raw && raw.version === currentVersion ? raw : fallback
}
