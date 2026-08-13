export interface GameAsset {
  id: string
  name: string
  description: string
  phase: number
  size: string
  category: 'player' | 'enemy' | 'projectile' | 'effect' | 'ui' | 'background' | 'title'
}

export const GAME_ASSETS: GameAsset[] = [
  {
    id: 'first-pixel',
    name: '第一幅像素画',
    description: '32×32 的苹果或心形，只用 4 种颜色',
    phase: 1,
    size: '32×32',
    category: 'ui',
  },
  {
    id: 'player-plane-proto',
    name: '玩家飞机原型',
    description: '用 Aseprite 画的第一个飞机造型',
    phase: 2,
    size: '32×32',
    category: 'player',
  },
  {
    id: 'game-palette',
    name: '游戏调色板',
    description: '为飞机大战定义的主色调方案（4-6 色）',
    phase: 3,
    size: '色板',
    category: 'ui',
  },
  {
    id: 'bullet-icons',
    name: '子弹与道具图标',
    description: '玩家子弹、敌机子弹、道具图标',
    phase: 4,
    size: '8×8 / 16×16',
    category: 'projectile',
  },
  {
    id: 'player-plane-shaded',
    name: '玩家飞机（立体版）',
    description: '加入明暗层次的飞机，开始有立体感',
    phase: 5,
    size: '32×32',
    category: 'player',
  },
  {
    id: 'explosion-frames',
    name: '爆炸特效帧',
    description: '用抖动技法画的爆炸烟雾/火光帧',
    phase: 6,
    size: '32×32 × 4帧',
    category: 'effect',
  },
  {
    id: 'enemy-trio',
    name: '三种敌机设计',
    description: '小型侦察机 + 中型战斗机 + Boss 剪影',
    phase: 7,
    size: '16×16 / 24×24 / 48×48',
    category: 'enemy',
  },
  {
    id: 'player-idle-anim',
    name: '玩家飞机待机动画',
    description: '引擎微动/悬浮动画，2-4 帧',
    phase: 8,
    size: '32×32 × 4帧',
    category: 'player',
  },
  {
    id: 'enemy-move-anim',
    name: '敌机移动动画',
    description: '敌机飞行 + 子弹发射动画',
    phase: 9,
    size: '32×32 × 4帧',
    category: 'enemy',
  },
  {
    id: 'boss-explosion-anim',
    name: 'Boss 爆炸动画',
    description: '大型爆炸序列，8-12 帧',
    phase: 10,
    size: '64×64 × 12帧',
    category: 'effect',
  },
  {
    id: 'stage-background',
    name: '关卡背景',
    description: '星空 + 云层 + 地面城市剪影',
    phase: 11,
    size: '480×320',
    category: 'background',
  },
  {
    id: 'hud-kit',
    name: 'HUD 组件套',
    description: '心形生命值 + 8×8 数字字体 + Boss 血条',
    phase: 12,
    size: '各 8-32px',
    category: 'ui',
  },
  {
    id: 'boss-design',
    name: 'Boss 完整设计',
    description: '大型 Boss 彩色完整版，含多种攻击姿态',
    phase: 13,
    size: '64×64',
    category: 'enemy',
  },
  {
    id: 'title-screen',
    name: '标题画面',
    description: '游戏标题 + 开始按钮 + 背景',
    phase: 14,
    size: '480×320',
    category: 'title',
  },
]

export const ASSET_CATEGORIES = [
  { key: 'player', label: '玩家', icon: '✈️' },
  { key: 'enemy', label: '敌机', icon: '👾' },
  { key: 'projectile', label: '子弹/道具', icon: '💥' },
  { key: 'effect', label: '特效', icon: '✨' },
  { key: 'background', label: '背景', icon: '🌌' },
  { key: 'ui', label: '界面', icon: '📊' },
  { key: 'title', label: '标题', icon: '🏆' },
] as const

export function getAssetByPhase(phase: number): GameAsset | undefined {
  return GAME_ASSETS.find((a) => a.phase === phase)
}
