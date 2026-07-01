# my-cocos-learn

Vue 3 + TypeScript + Vite 游戏开发学习文档站，4 门课程共 67 个阶段页面（Cocos 25、美术 14、音效 12、工程化 16）+ 30 天速通计划，纯静态无后端。

## 命令

```bash
npm run dev          # 开发服务器 (端口 7777)
npm run build        # 生产构建 (vue-tsc -b && vite build)
npm test             # vitest run
npm run test:watch   # vitest watch
```

## 课程元数据（单一起源）

`src/data/courses.ts` 定义了所有课程的 id、标签、图标、路径、阶段数。新增/修改课程只需改这一个文件，其余所有位置（路由、导航栏、键盘导航等）均从此处引用。

## 路由

Hash 模式。`src/router/index.ts` + `src/router/routes.ts`（`makePhaseRoutes(course, count)` 批量生成）。

| 路径 | 名称 | 组件 |
|------|------|------|
| `/` | home | `views/speedrun/Landing.vue` |
| `/cocos` | cocos | `views/cocos/Home.vue` |
| `/cocos/phase/1~25` | cocos-phaseN | `components/PhasePage.vue`（通用，内容来自 `content/cocos/phase-NN.md`） |
| `/art` + `/art/phase/1~14` | art / art-phaseN | 同上，内容来自 `content/art/` |
| `/audio` + `/audio/phase/1~12` | audio / audio-phaseN | 同上，内容来自 `content/audio/` |
| `/engineering` + `/engineering/phase/1~16` | engineering / engineering-phaseN | 同上，内容来自 `content/engineering/` |
| `/speedrun` | speedrun | `views/speedrun/Landing.vue` |
| `/speedrun/day/1~30` | speedrun-dayN | `views/speedrun/DayN.vue` |

## 组件架构

```
App.vue → NavBar + RouterView
  PhasePage.vue (通用阶段页，根据路由读取对应 content/*.md)
    → PhaseLayout.vue (进度条 + 上下导航 + 页眉)
      → ConceptBlock.vue (内容块，有滚动渐入动画)
      → PageTOC.vue (右侧目录，position:fixed)
  HomeSidebar.vue (首页右侧导航，position:fixed)
  FlowChart.vue (首页核心路径，竖向步骤图)
  PixelCanvas.vue (像素画 canvas 展示)
```

## 内容系统

阶段教学内容存放在 `src/content/{course}/phase-NN.md`（共 67 个文件），YAML frontmatter + Markdown 格式：

- `## 🧭 标题` → 一个 ConceptBlock（首个 emoji 自动提取为 icon）
- 标准 Markdown + 内嵌 HTML（`<pre>`、`<table>`、`<div class="tip-box">`）
- 构建时由 `vite.config.ts` 中的 `phaseMdPlugin`（markdown-it + gray-matter）转换为 PhaseMdData 对象
- 支持 HMR：编辑 `.md` 文件即时热更新

## Composables

- `useScrollLock()` → `{ scrollSeq, lockScroll }` — 点击导航时禁止滚轮
- `useRevealOnScroll(options?)` → `{ observe }` — IntersectionObserver 滚动渐入动画，PhaseLayout 和 ConceptBlock 共用

## 共享工具

- `src/utils/slug.ts` — 中英文 slug 化
- `src/types/phase.ts` — `Phase`, `PhaseGroup`, `PhaseMdData`, `BlockMdData` 接口
- `src/data/courses.ts` — 课程元数据单一起源（id/标签/图标/阶段数）

## 设计系统 (CSS 变量)

```
--color-bg: #fdf6ee          --color-primary: #e07b3c
--color-surface: #fffbf5     --color-accent: #d44a4a
--color-text: #4a3728        --max-width: 810px
--color-text-muted: #8c7a6b  --toc-width: 200px
```

3 个共享 CSS：`main.css`（全局）、`home-shared.css`（首页）、`phase-layout.css`（阶段页）。

## 核心逻辑位置

| 功能 | 文件 |
|------|------|
| 键盘导航 (← →) | `App.vue` handleKeydown |
| 阶段进度条 + 上下导航 | `PhaseLayout.vue` |
| 首页篇章入场动画 | `home-shared.css` @keyframes group-reveal |
| 滚动渐入 | `PhaseLayout.vue` IntersectionObserver + `ConceptBlock.vue` .revealed |
| 点击反馈 (scale) | `home-shared.css` .phase-card:active, `phase-layout.css` .nav-btn:active |
| TOC 点击锁定 | `PageTOC.vue` scrollTo + useScrollLock |
| 侧边栏滚动高亮 | `HomeSidebar.vue` IntersectionObserver + useScrollLock |

## 已知细节

- `noUnusedLocals: true` — 未用变量会报 TS 错误
- 侧边栏/TOC 使用 `position:fixed`，`right` 计算公式基于 `--max-width` 居中
- `html { overflow-y: scroll }` 防止滚动条闪现
- 阶段内容存放在 `src/content/**/*.md`，构建时由 Vite 插件（markdown-it + gray-matter）转换
