/**
 * 课程首页的单一配置源（对应原 4 个同构的 Home.vue）。
 *
 * 分工：
 * - title / duration：不在本文件维护，构建期由 virtual:phase-meta 从 content/{course}/phase-NN.md
 *   的 frontmatter 合并注入（唯一来源，改课程标题只改 md）。
 * - icon / summary / concepts：本文件维护（md frontmatter 没有这些字段）。
 * - hero / pathSteps / tools / footer：本文件维护。
 */
export interface HomePhaseMeta {
  id: number
  icon: string
  summary: string
  concepts: string[]
}

export interface HomePhaseGroup {
  label: string
  tagline: string
  phases: HomePhaseMeta[]
}

export interface HomeTool {
  name: string
  desc: string
  url?: string
}

export interface CourseHomeConfig {
  hero: {
    eyebrow: string
    /** 支持 highlight 高亮片段（对应原模板里的 <span class="highlight">） */
    title: { text: string; highlight?: boolean }[]
    subtitle: string
  }
  pathSteps: string[]
  footer: {
    icon: string
    total: string
    daily: string
  }
  toolsTitle: string
  tools: HomeTool[]
  phaseGroups: HomePhaseGroup[]
}

export const COURSE_HOME_CONFIG: Record<string, CourseHomeConfig> = {
  cocos: {
    hero: {
      eyebrow: '游戏引擎 · 从 Vue 到 Cocos',
      title: [{ text: '从零理解' }, { text: 'Cocos Creator', highlight: true }],
      subtitle:
        '一份为前端工程师深度定制的游戏引擎学习指南。不讲 API 列表，讲清楚每个概念从哪来、为什么存在、解决了什么问题。',
    },
    pathSteps: [
      '心智转变：帧驱动+组件化+坐标系',
      '画面与资源：Sprite+图集+动画',
      '交互系统：输入+碰撞+玩法',
      '架构与性能：Manager+UI+场景+优化',
      '视觉效果：物理+粒子+Shader+Spine',
      '构建发布：Web+原生+微信',
    ],
    footer: { icon: '⏱️', total: '6-9 周', daily: '2-4 小时' },
    toolsTitle: '本课程使用的工具',
    tools: [
      { name: 'Cocos Creator', desc: '游戏引擎（3.8.x）', url: 'cocos.com/creator' },
      { name: 'VS Code', desc: '代码编辑器', url: 'code.visualstudio.com' },
      { name: 'Chrome DevTools', desc: '性能分析与调试' },
      { name: '微信开发者工具', desc: '小游戏调试与预览' },
    ],
    phaseGroups: [
      {
        label: '第一单元：心智模型转变',
        tagline: '从 Vue 开发者的视角重新认识游戏引擎——帧驱动、组件化、坐标系',
        phases: [
          { id: 1, icon: '🧭', summary: '为什么会有游戏引擎？帧驱动和事件驱动到底有什么不同？从雅达利到 Cocos，理解你即将进入的世界。', concepts: ['帧驱动', '渲染管线', 'Cocos 生态'] },
          { id: 2, icon: '🧱', summary: '组件化架构的哲学起源——从继承链的崩塌到组合优于继承。理解 Node Tree 和 DOM Tree 的本质差异。', concepts: ['Scene', 'Node', 'Component', '生命周期'] },
          { id: 3, icon: '📐', summary: 'Y 轴为什么朝上？锚点到底是什么？二维变换矩阵在做什么？从 CSS transform 到游戏引擎的坐标系。', concepts: ['坐标系', '锚点', '变换矩阵', '设计分辨率'] },
        ],
      },
      {
        label: '第二单元：画面与资源',
        tagline: '游戏世界怎么画出来——纹理、精灵、图集、动画',
        phases: [
          { id: 4, icon: '📦', summary: '.meta 文件的本质——资源的"身份证"。理解 UUID 引用系统、动态加载和引用计数。', concepts: ['.meta 文件', 'UUID', '动态加载', '引用计数'] },
          { id: 5, icon: '🖼️', summary: '从 PNG 到屏幕像素的完整旅程。纹理过滤、九宫格、混合模式——GPU 在背后做了什么？', concepts: ['Texture2D', 'SpriteFrame', 'Point 过滤', '9-Slice'] },
          { id: 6, icon: '🗂️', summary: '为什么多张小图会让游戏变卡？DrawCall 是什么？图集如何用一张大图解决性能问题？', concepts: ['DrawCall', '图集', 'Auto Atlas', '合批'] },
        ],
      },
      {
        label: '第三单元：交互动起来',
        tagline: '动画、输入、碰撞——让游戏"活"起来',
        phases: [
          { id: 7, icon: '🎬', summary: '从手翻书到 SpriteSheet——帧动画的原理、帧率选择和 SpriteSheet 切割。', concepts: ['SpriteFrame 切换', '帧率', 'SpriteSheet'] },
          { id: 8, icon: '✨', summary: '声明式动画 API——从 Flash 时代到 GSAP 到 Cocos Tween。缓动函数的数学直觉。', concepts: ['cc.tween', '缓动函数', '链式调用'] },
          { id: 9, icon: '🎮', summary: '从键盘到多点触控到虚拟摇杆——输入设备演化如何倒逼抽象层的设计。', concepts: ['键盘事件', '多点触控', '虚拟摇杆', '输入缓冲'] },
        ],
      },
      {
        label: '第四单元：核心玩法系统',
        tagline: '碰撞、子弹、敌机、波次、道具——射击游戏五大核心系统',
        phases: [
          { id: 10, icon: '💥', summary: '游戏世界的"物理法则"——从手写 AABB 到内置碰撞系统，理解碰撞分组和位掩码。', concepts: ['AABB', 'Collider2D', '碰撞分组', '位掩码'] },
          { id: 11, icon: '🔫', summary: '从单发到霰弹到弹幕——子弹的生命周期管理和多种发射模式的实现。', concepts: ['子弹生命周期', '发射模式', '解耦设计'] },
          { id: 12, icon: '👾', summary: '从 Pac-Man 的固定路线到现代游戏 AI——敌机类型、移动轨迹和生成策略。', concepts: ['敌机类型', '移动轨迹', '生成策略'] },
          { id: 13, icon: '🌊', summary: 'Space Invaders 的遗产——数据驱动的波次编排、难度曲线和节奏设计。', concepts: ['波次数据', '节奏编排', '难度曲线'] },
          { id: 14, icon: '🎁', summary: '从马力欧的蘑菇到暗黑的装备——道具效果类型、掉落表和组合策略。', concepts: ['效果类型', '掉落表', '权重随机'] },
        ],
      },
      {
        label: '第五单元：架构与性能',
        tagline: '当代码超过 1000 行——对象池、事件总线、UI 框架、场景管理、性能优化',
        phases: [
          { id: 15, icon: '🏗️', summary: 'Manager 单例、对象池、事件总线、状态机——让代码在规模增长时仍可维护。', concepts: ['Manager 模式', '对象池', '事件总线', '状态机'] },
          { id: 16, icon: '🖥️', summary: 'Widget/Layout/ScrollView——游戏 UI 和前端 UI 的相似与不同。', concepts: ['Widget', 'Layout', 'ScrollView', '层级管理'] },
          { id: 17, icon: '🔀', summary: '多场景架构、异步加载、数据传递和转场动画——像 Vue Router 一样的场景路由。', concepts: ['场景结构', 'loadScene', '转场动画'] },
          { id: 18, icon: '⚡', summary: 'DrawCall 优化、纹理压缩、GC 规避——让游戏在低端机上也能跑 60fps。', concepts: ['DrawCall', '纹理压缩', 'GC 优化', 'Profiler'] },
        ],
      },
      {
        label: '第六单元：视觉效果',
        tagline: '物理、粒子、Shader、骨骼动画——让游戏好看',
        phases: [
          { id: 19, icon: '⚙️', summary: '什么时候手写碰撞够了，什么时候该上物理引擎？RigidBody2D 和物理材质详解。', concepts: ['RigidBody2D', '物理材质', 'Contact'] },
          { id: 20, icon: '🎆', summary: '从《几何战争》到现代特效——发射器+生命周期的粒子系统原理。', concepts: ['ParticleSystem2D', '发射器', '生命周期'] },
          { id: 21, icon: '🪄', summary: 'GPU 从"固定菜单"到"开放式厨房"——Cocos Effect 语法和常用 Shader 效果。', concepts: ['Cocos Effect', 'GLSL', '后处理'] },
          { id: 22, icon: '🦴', summary: '序列帧的极限在哪？Spine 如何用骨骼+插槽+皮肤彻底改变 2D 动画。', concepts: ['Spine', '骨骼', '动画混合', '换皮'] },
        ],
      },
      {
        label: '第七单元：构建与发布',
        tagline: 'Web、原生、微信小游戏——让玩家真正玩到你的游戏',
        phases: [
          { id: 23, icon: '🌐', summary: '从构建面板到 Vercel 部署——把游戏变成一个可以分享的链接。', concepts: ['Web Mobile', '设计分辨率', '部署'] },
          { id: 24, icon: '📱', summary: 'JSBridge 是什么？iOS 签名为什么这么烦？原生构建的全流程。', concepts: ['JSBridge', '原生构建', '签名'] },
          { id: 25, icon: '✈️', summary: '从零搭建完整飞机大战——架构设计、系统协作、开发调试、构建发布全流程。', concepts: ['项目搭建', '系统协作', '完整流程'] },
        ],
      },
    ],
  },

  art: {
    hero: {
      eyebrow: '像素美术 · Aseprite 教学',
      title: [{ text: '画出你的' }, { text: '飞机大战', highlight: true }],
      subtitle:
        '零基础像素画入门到独立创作。从历史和美学讲起，理解每一笔背后的原理，最终独立完成游戏所需的全部像素素材和动画。',
    },
    pathSteps: [
      '基础：历史+工具+色彩+线条+光影',
      '技法：抖动+纹理+角色设计',
      '动画：12原则+帧动画+特效',
      '场景：背景+UI/HUD+高级技法',
      '管线：导出+导入+合批+规范',
    ],
    footer: { icon: '🎨', total: '14-18 天', daily: '1-2 小时' },
    toolsTitle: '本课程使用的工具',
    tools: [
      { name: 'Aseprite', desc: '像素画绘制与动画', url: 'aseprite.org' },
      { name: 'LibreSprite', desc: 'Aseprite 开源替代', url: 'libresprite.github.io' },
      { name: 'Lospec Palette List', desc: '经典调色板参考', url: 'lospec.com/palette-list' },
    ],
    phaseGroups: [
      {
        label: '基础篇',
        tagline: '像素画的审美基础与工具掌握',
        phases: [
          { id: 1, icon: '🎨', summary: '像素画从何而来？为什么在独立游戏中长盛不衰？理解"限制中表达"的美学原则。', concepts: ['像素画历史', '独立游戏美学', '限制表达'] },
          { id: 2, icon: '🔧', summary: '从界面布局到工作流——掌握画笔、图层、调色板、时间轴，建立高效创作环境。', concepts: ['界面布局', '核心工具', '图层管理', '快捷键'] },
          { id: 3, icon: '🎯', summary: '色相/饱和度/明度、调色板设计、色彩心理学——为什么限制调色板反而更有力量？', concepts: ['色相/明度/饱和度', '调色板', '色彩心理'] },
          { id: 4, icon: '✏️', summary: '像素线条的独特挑战——抗锯齿原理、轮廓处理、剪影识别性。', concepts: ['抗锯齿线条', '轮廓处理', '剪影'] },
          { id: 5, icon: '💡', summary: '用 2-3 种颜色表达立体感——光源方向、高光反射、材质表现的像素技巧。', concepts: ['光源方向', '高光反射', '材质表现'] },
        ],
      },
      {
        label: '技法篇',
        tagline: '从基础到进阶——抖动、纹理与角色设计',
        phases: [
          { id: 6, icon: '🔮', summary: '抖动技法的原理与类型——有序抖动、随机抖动、在限制中创造更多颜色。', concepts: ['有序抖动', '随机抖动', '纹理表现'] },
          { id: 7, icon: '👤', summary: '从剪影到细节的完整设计流程——角色比例、辨识度、对称工具与多图层分离。', concepts: ['剪影设计', '角色比例', '多图层'] },
        ],
      },
      {
        label: '动画篇',
        tagline: '让像素角色动起来——从原理到实战',
        phases: [
          { id: 8, icon: '🏃', summary: '迪士尼 12 条动画基本原则在像素画中的应用——挤压拉伸、预备动作、跟随运动。', concepts: ['12 原则', '挤压拉伸', '预备动作', '跟随运动'] },
          { id: 9, icon: '💥', summary: '爆炸动画的完整制作——爆发→扩展→消散三个阶段的帧设计和节奏控制。', concepts: ['爆炸动画', '帧节奏', '洋葱皮'] },
          { id: 10, icon: '🔥', summary: '引擎火焰循环、待机浮动、受击闪烁——游戏中最常用的几种循环动画。', concepts: ['火焰循环', '待机动画', '受击闪烁'] },
        ],
      },
      {
        label: '场景篇',
        tagline: '从单体素材到完整游戏世界',
        phases: [
          { id: 11, icon: '🏞️', summary: '星空背景、无缝平铺、视差滚动、环境色与氛围——从单层背景到完整的游戏世界。', concepts: ['无缝平铺', '视差滚动', '环境色'] },
          { id: 12, icon: '🎛️', summary: '按钮多态、像素字体、血条能量条、面板弹窗——游戏界面的像素画设计。', concepts: ['按钮多态', '像素字体', 'HUD 元素'] },
          { id: 13, icon: '🌟', summary: '视差粒子、Tileset 无缝拼接、调色板换色、色彩循环——让像素画面更丰富。', concepts: ['视差粒子', 'Tileset', '调色板换色'] },
        ],
      },
      {
        label: '管线篇',
        tagline: '从 Aseprite 到 Cocos——资源的工业化流程',
        phases: [
          { id: 14, icon: '📦', summary: '导出设置、Cocos 导入配置、Auto Atlas 合批、文件命名规范——让美术和代码无缝衔接。', concepts: ['导出配置', 'Point 过滤', 'PPU', '命名规范'] },
        ],
      },
    ],
  },

  audio: {
    hero: {
      eyebrow: '游戏音效',
      title: [{ text: '从' }, { text: '零基础', highlight: true }, { text: '到完整游戏音频' }],
      subtitle: '使用免费工具纯合成方式生成全部游戏音效和背景音乐，无需录音设备或音乐基础。',
    },
    pathSteps: [
      '声音基础：物理+心理声学',
      '音效合成：BFXR 原理+实战',
      '音频编辑：Audacity 工作流',
      '音乐创作：作曲+结构+循环',
      'Cocos 集成+自适应+发布',
    ],
    footer: { icon: '🎧', total: '12-16 天', daily: '1-2 小时' },
    toolsTitle: '本课程使用的工具',
    tools: [
      { name: 'BFXR', desc: '音效合成器', url: 'bfxr.net' },
      { name: 'Audacity', desc: '音频编辑器', url: 'audacityteam.org' },
      { name: 'Bosca Ceoil', desc: '极简 MIDI 音乐编辑器', url: 'boscaceoil.net' },
    ],
    phaseGroups: [
      {
        label: '基础篇',
        tagline: '从声音的物理本质到游戏音频的设计思维',
        phases: [
          { id: 1, icon: '🔊', summary: '音效、音乐、语音——音频在游戏中的三大角色。从 8-bit 时代的哔哔声到现代自适应配乐。', concepts: ['音频三大角色', '游戏音频简史'] },
          { id: 2, icon: '🔬', summary: '频率/振幅/波形/音色是什么？人耳如何感知声音？采样率与位深度的真正含义。', concepts: ['频率/振幅', '人耳感知', '采样率', '位深度'] },
        ],
      },
      {
        label: '创作篇',
        tagline: '用免费工具从零制作游戏音效和背景音乐',
        phases: [
          { id: 3, icon: '🎛️', summary: '减法合成的本质——从噪声到音效只需要一个滤波器和四个参数（ADSR）。', concepts: ['减法合成', 'ADSR 包络', '频率分层'] },
          { id: 4, icon: '🔫', summary: '从预设到 Mutate——射击、爆炸、引擎声的制作方法论。', concepts: ['BFXR 参数', 'Mutate 迭代', '音效命名'] },
          { id: 5, icon: '💥', summary: '拾取、UI、受击——12 种射击游戏核心音效逐一制作。', concepts: ['拾取音效', 'UI 音效', '频率避让'] },
          { id: 6, icon: '✂️', summary: '裁剪、标准化、淡入淡出、降噪——把原始合成结果打磨成可用的游戏音频。', concepts: ['标准化', '淡入淡出', '降噪', '格式选型'] },
          { id: 7, icon: '🎵', summary: '音高/音阶/和弦/节奏的最小必要知识。Bosca Ceoil 的 Piano Roll 工作流。', concepts: ['音高/音阶', '和弦', 'Piano Roll'] },
          { id: 8, icon: '🔁', summary: 'Intro+Loop 结构、无缝循环技巧、BPM 与游戏节奏的匹配。', concepts: ['Intro+Loop', '无缝循环', 'BPM 匹配'] },
        ],
      },
      {
        label: '集成篇',
        tagline: '把音频接入 Cocos，让它活起来',
        phases: [
          { id: 9, icon: '🎮', summary: 'AudioSource 组件、AudioManager 单例设计、音效池实现——Web Audio + 微信双栈。', concepts: ['AudioSource', 'AudioManager', '音效池'] },
          { id: 10, icon: '🎚️', summary: 'BGM 跨场景持久化、淡入淡出、同帧去重——细节决定音频体验。', concepts: ['BGM 持久化', '淡入淡出', '同帧去重'] },
        ],
      },
      {
        label: '进阶篇',
        tagline: '自适应配乐与跨平台音频发布',
        phases: [
          { id: 11, icon: '🎼', summary: 'Vertical Layering、游戏状态驱动切歌、过渡 Stinger——让音乐随玩法变化。', concepts: ['Vertical Layering', '状态驱动', 'Stinger'] },
          { id: 12, icon: '📦', summary: 'WAV/MP3/OGG 选型、压缩策略、Web Audio vs InnerAudioContext——让音频在所有平台正常工作。', concepts: ['格式选型', '压缩策略', '平台适配'] },
        ],
      },
    ],
  },

  engineering: {
    hero: {
      eyebrow: '游戏工程化与运营',
      title: [
        { text: '从' },
        { text: 'Demo', highlight: true },
        { text: '到' },
        { text: '产品', highlight: true },
      ],
      subtitle:
        '覆盖微信小游戏发布、数值设计、用户留存、商业化变现、测试体系、CI/CD、手感打磨与性能优化。',
    },
    pathSteps: [
      '平台：微信小游戏适配+开放能力',
      '运营：数值+留存+数据+变现',
      '工程：测试+手感+CI/CD+性能',
      '多端：国际化+TS 模式',
    ],
    footer: { icon: '⚙️', total: '6-10 周', daily: '2-4 小时' },
    toolsTitle: '本课程涉及的工具与平台',
    tools: [
      { name: '微信开发者工具', desc: '小游戏调试与预览' },
      { name: 'GitHub Actions', desc: 'CI/CD 自动化' },
      { name: 'Chrome DevTools', desc: '性能与内存分析' },
    ],
    phaseGroups: [
      {
        label: '微信小游戏篇',
        tagline: '打通微信小游戏完整链路——从适配到发布',
        phases: [
          { id: 1, icon: '🎯', summary: '游戏开发和游戏工程化有什么区别？什么才是"产品级"的游戏？', concepts: ['产品思维', 'MVP', '工程化'] },
          { id: 2, icon: '📱', summary: '运行环境、包体限制、API 差异——理解微信小游戏和 Web 的本质区别。', concepts: ['运行环境', '包体限制', '平台差异'] },
          { id: 3, icon: '🔧', summary: '音频格式转换、Bundle 分包、onShow/onHide——把 Cocos 项目改造成微信小游戏。', concepts: ['音频适配', 'Bundle 分包', '生命周期'] },
          { id: 4, icon: '🔐', summary: '分享/排行榜/激励视频广告/云开发——用微信生态能力让游戏更好玩。', concepts: ['分享', '排行榜', '激励视频', '云开发'] },
          { id: 5, icon: '📲', summary: '远程调试工具链、设备分档策略、微信性能面板——让游戏在真机上流畅运行。', concepts: ['真机调试', '设备分档', '性能面板'] },
        ],
      },
      {
        label: '运营篇',
        tagline: '让玩家留下来——数值、留存、数据、变现',
        phases: [
          { id: 6, icon: '📊', summary: 'DPS/EHP/TTK 核心公式推导、难度曲线设计——让游戏的"数字感"恰到好处。', concepts: ['DPS', 'EHP', 'TTK', '难度曲线'] },
          { id: 7, icon: '💰', summary: '金币产出与消耗的平衡、付费与免费的边界——经济系统的设计与调优。', concepts: ['金币平衡', '付费设计', '数值调优'] },
          { id: 8, icon: '📅', summary: '每日签到、任务系统、成就系统、新手引导——让玩家明天还想来。', concepts: ['签到/任务', '成就', '新手引导', '7日留存'] },
          { id: 9, icon: '📈', summary: 'DAU/留存/广告 eCPM——定义关键指标、设计埋点方案、用数据指导迭代。', concepts: ['DAU/留存', '埋点', '数据分析', 'AB测试'] },
          { id: 10, icon: '💵', summary: '激励视频/插屏/Banner/内购——四种变现方式的优劣与组合策略。', concepts: ['激励视频', '插屏', '内购', '混合变现'] },
        ],
      },
      {
        label: '工程质量篇',
        tagline: '测试、手感、CI/CD、性能——让游戏开发像前端工程一样可靠',
        phases: [
          { id: 11, icon: '🧪', summary: '单元测试游戏逻辑、录制回放回归测试、性能基准——让 Bug 在发布前被找到。', concepts: ['单元测试', '回归测试', '性能基准'] },
          { id: 12, icon: '💫', summary: '屏幕震动、冻结帧、镜头跟随、粒子爆发——"手感"的量化方法与实现。', concepts: ['屏幕震动', '冻结帧', '镜头跟随'] },
          { id: 13, icon: '🚀', summary: 'Cocos CLI + GitHub Actions——自动化多平台构建和发布。', concepts: ['Cocos CLI', 'GitHub Actions', '自动化'] },
          { id: 14, icon: '🔍', summary: '常见泄漏场景、Chrome Memory 面板、事件清理检查清单——别让游戏越玩越卡。', concepts: ['内存泄漏', 'Heap Snapshot', '事件清理'] },
        ],
      },
      {
        label: '多端适配篇',
        tagline: '国际化与 TypeScript 设计模式——生产级项目的最后拼图',
        phases: [
          { id: 15, icon: '🌍', summary: '字符串表方案、运行时语言切换、CJK 字体裁剪——让游戏出海。', concepts: ['字符串表', '语言切换', '字体子集'] },
          { id: 16, icon: '💎', summary: 'Discriminated Union 状态建模、Zod 校验、Branded Types——前端 TS 技巧在游戏中的落地。', concepts: ['Discriminated Union', 'Zod', 'Branded Types'] },
        ],
      },
    ],
  },
}
