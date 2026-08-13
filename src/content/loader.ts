import type { PhaseMdData } from '../features/courses/types/phase'

/**
 * 阶段内容的单一懒加载入口。
 * 页面渲染与路由 meta 标题共用这份 glob，避免重复打包同一批 .md。
 */
export const phaseModules = import.meta.glob<{ default: PhaseMdData }>('./**/*.md')

export function phaseKey(course: string, phase: number): string {
  return `./${course}/phase-${String(phase).padStart(2, '0')}.md`
}

export async function loadPhase(course: string, phase: number): Promise<PhaseMdData | null> {
  const loader = phaseModules[phaseKey(course, phase)]
  if (!loader) return null
  const mod = await loader()
  return mod.default ?? null
}
