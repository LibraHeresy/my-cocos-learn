export interface SpeedrunDay {
  day: number; title: string; summary: string
  refs: { label: string; course: string; phase: number }[]
  checklist: string[]
}

export const SPEEDRUN_DAYS: SpeedrunDay[] = [
  { day: 1, title: '游戏引擎世界观', summary: '理解游戏引擎为什么存在，帧驱动和事件驱动的本质区别，安装 Cocos Creator', refs: [{ label: 'Cocos：游戏引擎世界观', course: 'cocos', phase: 1 }], checklist: ['安装 Cocos Dashboard 和 Creator 3.8.x', '创建空白项目并跑通浏览器预览', '理解帧驱动 vs 事件驱动', '认识六大编辑器面板'] },
  { day: 2, title: '场景、节点、组件', summary: '组件化架构的哲学，Node Tree 与 DOM Tree 的异同，搭建三层场景结构', refs: [{ label: 'Cocos：场景、节点、组件', course: 'cocos', phase: 2 }], checklist: ['理解 Scene/Node/Component 关系', '创建 Sprite 并挂载自定义 Component', '搭建 Background/GameLayer/UILayer 三层结构'] },
  { day: 3, title: '坐标系与变换', summary: 'Y 轴为什么朝上，锚点是什么，设计分辨率与适配，变换矩阵的直觉', refs: [{ label: 'Cocos：坐标系与变换', course: 'cocos', phase: 3 }], checklist: ['在场景中移动、旋转、缩放节点', '改变锚点观察旋转行为变化', '理解设计分辨率 + Fit Height 的适配策略'] },
  { day: 4, title: '资源管理', summary: '.meta 文件的本质，资源类型全景，动态加载 vs 静态引用', refs: [{ label: 'Cocos：资源管理', course: 'cocos', phase: 4 }], checklist: ['导入 PNG 资源并理解 .meta 文件', '用拖拽绑定和 resources.load 两种方式加载资源', '了解 Texture2D/SpriteFrame/Prefab 的区别'] },
  { day: 5, title: '精灵渲染与图集', summary: '三层抽象（Texture2D→SpriteFrame→Sprite），Point过滤，Auto Atlas 合批', refs: [{ label: 'Cocos：精灵渲染', course: 'cocos', phase: 5 }, { label: 'Cocos：图集与自动合批', course: 'cocos', phase: 6 }], checklist: ['设置纹理为 Point 过滤', '配置 Auto Atlas 自动合批', '理解 DrawCall 的概念和优化目标'] },
  { day: 6, title: '帧动画与 Tween', summary: '从手翻书到 SpriteSheet，cc.tween 链式调用，缓动函数的数学直觉', refs: [{ label: 'Cocos：帧动画', course: 'cocos', phase: 7 }, { label: 'Cocos：cc.tween 补间动画', course: 'cocos', phase: 8 }], checklist: ['用 SpriteFrame 数组做一个简单帧动画', '用 cc.tween 做一个弹窗动画', '理解帧率选择（8/12/24/60fps）'] },
  { day: 7, title: '输入系统', summary: '键盘事件、触摸事件、虚拟摇杆、输入缓冲原理', refs: [{ label: 'Cocos：输入系统', course: 'cocos', phase: 9 }], checklist: ['实现键盘控制飞机移动', '实现触摸控制飞机移动', '注意 onDestroy 中清理事件监听'] },
  { day: 8, title: '碰撞检测', summary: '手写 AABB → Cocos 内置碰撞系统，碰撞分组与位掩码，触发 vs 碰撞', refs: [{ label: 'Cocos：碰撞检测', course: 'cocos', phase: 10 }], checklist: ['手写 AABB 碰撞检测函数', '配置 Collider2D + 碰撞分组', '实现子弹击中敌机后双方销毁'] },
  { day: 9, title: '子弹系统', summary: '子弹生命周期，发射模式（单发/双发/扇形/追踪），与发射器解耦设计', refs: [{ label: 'Cocos：子弹系统与发射模式', course: 'cocos', phase: 11 }], checklist: ['创建子弹预制体', '实现定时发射子弹', '实现至少 2 种发射模式'] },
  { day: 10, title: '敌机系统', summary: '敌机类型设计，移动轨迹（直线/正弦波/追踪），生成策略', refs: [{ label: 'Cocos：敌机系统与行为设计', course: 'cocos', phase: 12 }], checklist: ['创建 2 种敌机预制体', '实现不同移动轨迹', '实现敌机定时生成器'] },
  { day: 11, title: '波次与道具系统', summary: '数据驱动的波次编排，难度曲线设计，道具效果类型与掉落表', refs: [{ label: 'Cocos：波次系统', course: 'cocos', phase: 13 }, { label: 'Cocos：道具系统', course: 'cocos', phase: 14 }], checklist: ['设计 3 波基础波次数据', '实现道具掉落表', '实现 3 种道具效果'] },
  { day: 12, title: '游戏架构模式', summary: 'Manager 单例，对象池，事件总线，有限状态机——让代码可维护', refs: [{ label: 'Cocos：游戏架构模式', course: 'cocos', phase: 15 }], checklist: ['实现 GameManager 单例', '用 NodePool 实现子弹对象池', '用 EventTarget 搭建事件总线', '用状态机管理游戏流程'] },
  { day: 13, title: 'UI 系统', summary: 'Widget 自适应，Layout 弹性布局，ScrollView，分数和血条 UI', refs: [{ label: 'Cocos：UI 系统深入', course: 'cocos', phase: 16 }], checklist: ['实现分数实时显示', '实现血条 UI', '实现波次提示动画', '实现暂停/继续'] },
  { day: 14, title: '场景管理与转场', summary: '多场景架构（Boot→Menu→Game→GameOver），转场动画，数据传递', refs: [{ label: 'Cocos：场景管理与转场', course: 'cocos', phase: 17 }], checklist: ['创建 4 个场景', '实现场景切换 + 淡入淡出转场', '实现场景间数据传递'] },
  { day: 15, title: '像素画基础', summary: 'Aseprite 工具、色彩理论、线条与形状、明暗与体积', refs: [{ label: 'Art：历史与美学', course: 'art', phase: 1 }, { label: 'Art：工具精通', course: 'art', phase: 2 }, { label: 'Art：色彩理论', course: 'art', phase: 3 }], checklist: ['安装 Aseprite 并熟悉界面', '设计 8-16 色调色板', '画一个立体像素球'] },
  { day: 16, title: '飞机大战素材绘制', summary: '玩家飞机、3 种敌机、子弹、道具——画出全部游戏素材', refs: [{ label: 'Art：角色设计', course: 'art', phase: 7 }, { label: 'Art：帧动画实战', course: 'art', phase: 9 }], checklist: ['画出 32×32 玩家飞机', '画出 3 种不同敌机', '画出子弹和道具图标', '制作爆炸帧动画'] },
  { day: 17, title: '音效制作', summary: 'BFXR 合成器，ADSR 包络，6 种核心音效制作，Audacity 编辑', refs: [{ label: 'Audio：音效合成原理', course: 'audio', phase: 3 }, { label: 'Audio：BFXR 实战', course: 'audio', phase: 4 }, { label: 'Audio：Audacity 编辑', course: 'audio', phase: 6 }], checklist: ['用 BFXR 制作射击/爆炸/拾取 3 种音效', '用 Audacity 标准化和裁剪音频', '导出 WAV 文件'] },
  { day: 18, title: 'BGM 制作与 Cocos 集成', summary: 'Bosca Ceoil 作曲，无缝循环，AudioManager 实现，音效池', refs: [{ label: 'Audio：作曲基础', course: 'audio', phase: 7 }, { label: 'Audio：音乐结构', course: 'audio', phase: 8 }, { label: 'Audio：Cocos 集成上', course: 'audio', phase: 9 }], checklist: ['创作一段 30 秒可循环 BGM', '实现 AudioManager 单例', 'BGM + SFX 全部接入游戏'] },
  { day: 19, title: '素材导入与整合', summary: 'Aseprite→Cocos 导入管线，Point 过滤，SpriteSheet，Auto Atlas', refs: [{ label: 'Art：完整资源管线', course: 'art', phase: 14 }], checklist: ['正确导入所有像素素材', '切割 SpriteSheet', '配置 Auto Atlas', '替换临时素材为正式像素素材'] },
  { day: 20, title: 'Web 平台发布', summary: 'Cocos Web Mobile 构建，Vercel 部署，移动端适配', refs: [{ label: 'Cocos：Web 平台构建与部署', course: 'cocos', phase: 23 }], checklist: ['构建 Web Mobile 版本', '部署到 Vercel/GitHub Pages', '手机浏览器测试', 'Chrome DevTools 性能检查'] },
  { day: 21, title: '微信小游戏适配', summary: '运行环境差异，音频适配，Bundle 分包，onShow/onHide', refs: [{ label: 'Engineering：微信小游戏平台', course: 'engineering', phase: 2 }, { label: 'Engineering：微信小游戏适配', course: 'engineering', phase: 3 }], checklist: ['构建微信小游戏版本', '音频转 MP3 + InnerAudioContext', 'Bundle 分包（主包 < 4MB）', '微信开发者工具预览'] },
  { day: 22, title: '微信开放能力', summary: '分享、排行榜、激励视频广告', refs: [{ label: 'Engineering：微信开放能力', course: 'engineering', phase: 4 }], checklist: ['接入分享接口', '接入激励视频广告', '处理 onShow/onHide'] },
  { day: 23, title: '性能优化', summary: 'DrawCall 优化，纹理压缩，脚本性能，真机测试', refs: [{ label: 'Cocos：性能优化实战', course: 'cocos', phase: 18 }, { label: 'Engineering：真机调试', course: 'engineering', phase: 5 }], checklist: ['检查 DrawCall 数 < 50', '配置纹理压缩（ETC2/ASTC）', '在至少 2 种设备真机测试'] },
  { day: 24, title: '粒子与 Shader 特效', summary: '粒子系统参数，爆炸/尾迹特效，溶解/闪白 Shader', refs: [{ label: 'Cocos：粒子系统', course: 'cocos', phase: 20 }, { label: 'Cocos：Shader 与后处理', course: 'cocos', phase: 21 }], checklist: ['添加爆炸粒子特效', '添加受击闪白效果', '添加引擎尾焰粒子'] },
  { day: 25, title: '手感打磨', summary: '屏幕震动，冻结帧，镜头跟随——量化"手感"', refs: [{ label: 'Engineering：手感设计', course: 'engineering', phase: 12 }], checklist: ['实现屏幕震动', '实现 Boss 击杀冻结帧', '找朋友试玩收集反馈'] },
  { day: 26, title: '游戏测试', summary: '纯逻辑单元测试，功能测试清单，Bug 修复', refs: [{ label: 'Engineering：游戏测试体系', course: 'engineering', phase: 11 }], checklist: ['写 3 个核心逻辑的单元测试', '走通功能测试清单', '修复所有已知 Bug'] },
  { day: 27, title: '数值调优', summary: 'DPS/EHP/TTK 计算，难度曲线调整，经济系统平衡', refs: [{ label: 'Engineering：数值设计', course: 'engineering', phase: 6 }, { label: 'Engineering：经济系统', course: 'engineering', phase: 7 }], checklist: ['计算核心 DPS/TTK 数值', '调整难度曲线', '找 3 个人试玩收集难度反馈'] },
  { day: 28, title: '上架素材与提审', summary: '应用图标、截图、描述文案、隐私政策、提审流程', refs: [{ label: 'Engineering：从 Demo 到产品', course: 'engineering', phase: 1 }], checklist: ['准备应用图标（144×144）', '截取 5 张游戏截图', '撰写游戏描述和隐私政策', '提交微信审核'] },
  { day: 29, title: '运营与变现', summary: '每日签到，留存系统，广告优化，数据埋点', refs: [{ label: 'Engineering：留存系统', course: 'engineering', phase: 8 }, { label: 'Engineering：数据运营', course: 'engineering', phase: 9 }, { label: 'Engineering：变现设计', course: 'engineering', phase: 10 }], checklist: ['实现每日签到', '优化广告展示时机', '接入数据埋点'] },
  { day: 30, title: '正式上线', summary: '发布审核通过版本，社群推广，后续迭代规划', refs: [{ label: 'Cocos：像素飞机大战实战', course: 'cocos', phase: 25 }], checklist: ['确认审核通过并发布', '在微信群/朋友圈分享', '记录首发数据', '写下经验总结'] },
]
