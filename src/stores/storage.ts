/**
 * 共享的版本化持久化适配器（localStorage）。
 * readingStore 与 workshopPersistence 共用：读写都 try/catch，失败通过返回值/上层 saveError 暴露。
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

/** 返回是否写入成功（localStorage 满/不可用时为 false，由调用方决定是否提示）。 */
export function saveJSON<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
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
