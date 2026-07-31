import { ref } from 'vue'

const STORAGE_KEY = 'my-cocos-theme'

export type ThemePreference = 'dark' | 'light' | null

/** 全局主题状态（模块级单例，组件间共享） */
export const isDark = ref(false)

const mql: MediaQueryList | null =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function readStored(): ThemePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'dark' || raw === 'light') return raw
  } catch {
    /* localStorage 不可用时静默降级为跟随系统 */
  }
  return null
}

function apply(dark: boolean) {
  isDark.value = dark
  const root = document.documentElement
  root.dataset.theme = dark ? 'dark' : 'light'
  root.style.colorScheme = dark ? 'dark' : 'light'
}

function onSystemChange(e: MediaQueryListEvent) {
  apply(e.matches)
}

/**
 * 应用主题并同步到 <html>（dataset.theme + style.colorScheme）。
 * 有存储值时使用存储值且不跟随系统；无存储值时跟随系统 prefers-color-scheme
 * 并监听系统变化。供 main.ts 在 mount 前同步调用，避免首帧闪烁。
 */
export function initTheme(): boolean {
  const stored = readStored()
  const dark = stored !== null ? stored === 'dark' : mql ? mql.matches : false
  apply(dark)
  if (stored === null && mql) {
    mql.addEventListener('change', onSystemChange)
  }
  return dark
}

/** 手动切换主题：写入 localStorage 并停止跟随系统 */
export function toggle() {
  const next = !isDark.value
  apply(next)
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
  } catch {
    /* 忽略写入失败 */
  }
  mql?.removeEventListener('change', onSystemChange)
}

export function useTheme() {
  return { isDark, toggle }
}
