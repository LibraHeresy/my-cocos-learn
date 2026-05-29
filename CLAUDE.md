# my-cocos-learn

Vue 3 + TypeScript + Vite 游戏开发学习文档站，4 门课程，59 个阶段页面，纯静态无后端。

## 命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建 (vue-tsc -b && vite build)
npm test             # vitest run (12 tests)
npm run test:watch   # vitest watch
```

## 路由

Hash 模式。`src/router/index.ts` + `src/router/routes.ts`（`makePhaseRoutes(course, count)` 批量生成）。

| 路径 | 名称 | 组件 |
|------|------|------|
| `/` | home | `views/cocos/Home.vue` |
| `/cocos/phase/1~29` | cocos-phaseN | `views/cocos/PhaseN.vue` |
| `/art` + `/art/phase/1~9` | art / art-phaseN | `views/art/` |
| `/audio` + `/audio/phase/1~7` | audio / audio-phaseN | `views/audio/` |
| `/engineering` + `/engineering/phase/1~14` | engineering / engineering-phaseN | `views/engineering/` |

## 组件架构

```
App.vue → NavBar + RouterView
  PhaseLayout.vue (所有阶段页共用)
    → PageTOC.vue (右侧目录，position:fixed)
  HomeSidebar.vue (首页右侧导航，position:fixed)
  FlowChart.vue (首页核心路径，竖向步骤图)
  ConceptBlock.vue (阶段页内容块，有滚动渐入动画)
  PixelCanvas.vue (像素画 canvas 展示)
```

## Composables

- `useScrollLock()` → `{ scrollSeq, lockScroll }` — 点击导航时禁止滚轮
- `usePhaseCounts()` → `Record<course, maxPhase>` — 缓存的路由阶段数

## 共享工具

- `src/utils/slug.ts` — 中英文 slug 化
- `src/types/phase.ts` — `Phase`, `PhaseGroup` 接口

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
- 所有阶段页内容在 `.vue` 模板中，无外部数据源
