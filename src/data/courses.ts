export interface CourseMeta {
  readonly id: string
  readonly label: string
  readonly icon: string
  readonly path: string
  readonly phaseCount: number
  readonly backLabel: string
  /** 返回课程首页的路径，cocos 首页即根路径所以是 '/' */
  readonly courseHome: string
}

export const COURSES: Record<string, CourseMeta> = {
  cocos: {
    id: 'cocos',
    label: 'Cocos 引擎',
    icon: '🎮',
    path: '/cocos',
    phaseCount: 25,
    backLabel: '返回 cocos 课程',
    courseHome: '/',
  },
  art: {
    id: 'art',
    label: '像素美术',
    icon: '🎨',
    path: '/art',
    phaseCount: 14,
    backLabel: '返回美术课程',
    courseHome: '/art',
  },
  audio: {
    id: 'audio',
    label: '游戏音效',
    icon: '🔊',
    path: '/audio',
    phaseCount: 12,
    backLabel: '返回音效课程',
    courseHome: '/audio',
  },
  engineering: {
    id: 'engineering',
    label: '工程化与运营',
    icon: '⚙️',
    path: '/engineering',
    phaseCount: 16,
    backLabel: '返回工程课程',
    courseHome: '/engineering',
  },
}

export const COURSE_LIST: CourseMeta[] = Object.values(COURSES)

let _phasePattern: RegExp | null = null

/** 匹配路由名称的正则，由 COURSES 的 key 动态生成 */
export function getPhasePattern(): RegExp {
  if (!_phasePattern) {
    const keys = Object.keys(COURSES).join('|')
    _phasePattern = new RegExp(`^(${keys})-phase(\\d+)$`)
  }
  return _phasePattern
}

/** 从路由名称中检测课程 id，非阶段路由返回 null */
export function detectCourseFromRoute(name: string): string | null {
  const m = name.match(getPhasePattern())
  return m ? m[1] : null
}

/** 从阶段路由名称中解析阶段号，非阶段路由返回 null */
export function parsePhaseFromRoute(name: string): number | null {
  const m = name.match(/-phase(\d+)$/)
  return m ? parseInt(m[1], 10) : null
}

/** 获取课程阶段数，课程不存在时返回 fallback */
export function getPhaseCount(course: string, fallback = 0): number {
  return COURSES[course]?.phaseCount ?? fallback
}
