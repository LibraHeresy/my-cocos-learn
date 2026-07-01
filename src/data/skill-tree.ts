export interface SkillLevel {
  level: number
  name: string
  description: string
  requiredChallenges: number[]
  unlockCondition: string
}

export interface SkillLine {
  id: string
  name: string
  icon: string
  description: string
  levels: SkillLevel[]
}

export const SKILL_LINES: SkillLine[] = [
  {
    id: 'form',
    name: '造型能力',
    icon: '🎯',
    description: '从基本几何形到角色剪影，构建可辨认的视觉形象',
    levels: [
      {
        level: 1,
        name: '基本形状',
        description: '能用方形、圆形、三角形组合构建可辨认的简单物体',
        requiredChallenges: [4, 14],
        unlockCondition: '完成挑战 4 和 14',
      },
      {
        level: 2,
        name: '角色剪影',
        description: '能在 32×32 限制下做出辨识度高的角色剪影',
        requiredChallenges: [15, 16, 17, 18],
        unlockCondition: '完成挑战 15-18（三种敌机剪影 + 审查）',
      },
      {
        level: 3,
        name: '完整角色',
        description: '能设计完整的上色角色',
        requiredChallenges: [23],
        unlockCondition: '完成挑战 23（阵营识别测试）',
      },
    ],
  },
  {
    id: 'color',
    name: '色彩控制',
    icon: '🎨',
    description: '用极少的颜色表达丰富的信息',
    levels: [
      {
        level: 1,
        name: '限制调色',
        description: '能在 4 色限制下完成有效配色',
        requiredChallenges: [3, 5],
        unlockCondition: '完成挑战 3 和 5',
      },
      {
        level: 2,
        name: '明暗体积',
        description: '能用 3 层明暗表达立体感',
        requiredChallenges: [6, 7, 8, 9],
        unlockCondition: '完成挑战 6-9（暗面→高光→完整→应用）',
      },
      {
        level: 3,
        name: '阵营配色',
        description: '能通过配色传达阵营和情绪',
        requiredChallenges: [19, 20, 21, 22],
        unlockCondition: '完成挑战 19-22（蓝白友方 + 红黑敌方 + Boss 上色）',
      },
    ],
  },
  {
    id: 'texture',
    name: '纹理技法',
    icon: '🔲',
    description: '用抖动和图案模拟材质质感',
    levels: [
      {
        level: 1,
        name: '抖动基础',
        description: '能用基础抖动模式表现中间色调和烟雾',
        requiredChallenges: [10, 11, 12],
        unlockCondition: '完成挑战 10-12',
      },
      {
        level: 2,
        name: '材质模拟',
        description: '能区分表现金属、布料等不同材质',
        requiredChallenges: [13],
        unlockCondition: '完成挑战 13（金属 vs 布料）',
      },
    ],
  },
  {
    id: 'animation',
    name: '动画能力',
    icon: '🎬',
    description: '让像素角色动起来，赋予生命力',
    levels: [
      {
        level: 1,
        name: '动画入门',
        description: '理解挤压拉伸、缓入缓出，能制作简单循环动画',
        requiredChallenges: [24, 25],
        unlockCondition: '完成挑战 24-25',
      },
      {
        level: 2,
        name: '帧动画',
        description: '能制作多帧动画序列',
        requiredChallenges: [26, 27, 28],
        unlockCondition: '完成挑战 26-28（子弹+击毁+爆炸）',
      },
    ],
  },
  {
    id: 'ui',
    name: '界面设计',
    icon: '🖥️',
    description: '设计游戏中可用的 HUD、图标和界面元素',
    levels: [
      {
        level: 1,
        name: '场景基础',
        description: '能设计星空背景和云层',
        requiredChallenges: [29, 30],
        unlockCondition: '完成挑战 29-30',
      },
      {
        level: 2,
        name: 'HUD 设计',
        description: '能设计心形生命值、数字字体、血条等 HUD 组件',
        requiredChallenges: [31, 32, 33],
        unlockCondition: '完成挑战 31-33',
      },
      {
        level: 3,
        name: '完整界面',
        description: '能设计游戏标题画面',
        requiredChallenges: [34],
        unlockCondition: '完成挑战 34（标题画面）',
      },
    ],
  },
]

export function computeSkillLevels(completedChallenges: number[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const line of SKILL_LINES) {
    let level = 0
    for (const lv of line.levels) {
      if (lv.requiredChallenges.every((c) => completedChallenges.includes(c))) {
        level = lv.level
      }
    }
    result[line.id] = level
  }
  return result
}

export function getTotalSkillLevels(): number {
  return SKILL_LINES.reduce((sum, line) => sum + line.levels.length, 0)
}

export function getCompletedSkillLevels(progress: Record<string, number>): number {
  return Object.values(progress).reduce((sum, lv) => sum + lv, 0)
}
