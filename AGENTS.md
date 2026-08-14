# my-cocos-learn

Vue 3 + TypeScript + Vite 游戏开发学习文档站，4 门课程共 67 个阶段页面（Cocos 25、美术 14、音效 12、工程化 16）+ 像素画工坊 34 关挑战，纯静态无后端。

## 命令

包管理器统一 Yarn classic（见 `package.json` 的 `packageManager` 字段），锁文件只有 `yarn.lock`。

```bash
yarn dev          # 开发服务器 (端口 7777)
yarn build        # 生产构建 (vue-tsc -b && vite build)
yarn test         # vitest run（47 个测试）
yarn test:watch   # vitest watch
yarn lint         # eslint src/
yarn format       # prettier --write src/
```

## 目录结构（按 feature 组织）

```
src/
├── features/
│   ├── courses/
│   │   ├── data/courses.ts        # 课程元数据单一起源（id/label/icon/path/phaseCount/backLabel/courseHome）
│   │   ├── data/course-home.ts    # 课程首页配置（hero/pathSteps/tools/footer/phaseGroups 的 icon·summary·concepts）
│   │   ├── components/            # CourseHome（4 课共用首页）、PhasePage、PhaseLayout、ConceptBlock、FlowChart、CourseProgressBar
│   │   ├── demos/                 # 6 个交互演示（palette/anchor-point/easing-curves/waveform/atlas-batching/shader-compare）+ useDemoVisibility
│   │   └── types/                 # phase.ts、phase-meta.ts
│   ├── workshop/                  # 像素画工坊：data/challenges.ts(34关)、data/skill-tree.ts、stores/(IDB+镜像)、views/、components/、composables/
│   ├── search/                    # 站内搜索：MiniSearch + 自定义中文分词（useSearch/SearchBox/tokenize）
│   └── navigation/                # NavBar、HomeSidebar、PageTOC、useScrollSpy/useScrollLock
├── content/{course}/phase-NN.md   # 67 个阶段内容（YAML frontmatter: phase/title/duration + Markdown）
├── router/                        # index.ts、routes.ts(makePhaseRoutes)、meta.ts(路由级 title)
├── stores/                        # readingStore（阅读进度 localStorage）、storage.ts（共享适配器）
├── composables/                   # useTheme（亮/暗主题）
└── utils/                         # slug
```

## 构建期数据流（vite.config.ts 四个插件）

- `phaseMdPlugin`：`content/**/phase-NN.md` → `PhaseMdData`（frontmatter + `## 标题` 内容块 + `:::demo <id>` 片段），支持 HMR；与 searchIndexPlugin 共享 md 解析缓存（只解析一次）
- `searchIndexPlugin`：生成 `public/search-index.json`（67 阶段 + 34 关挑战，运行时 MiniSearch 检索）与 `public/sitemap.xml`（`SITE_URL` 指定域名）
- `phaseMetaPlugin`：提供 **`virtual:phase-meta`** —— 合并 md frontmatter（title/duration）与 `course-home.ts`（icon/summary/concepts）为 `{course: {phase: {title,duration,icon,summary,concepts}}}`，供 `CourseHome.vue` 与 `router/meta.ts`（文档标题）使用
- `ghPagesSpaPlugin`：构建期生成 `dist/404.html`（带 base 的 GitHub Pages SPA 重定向）

## 路由（Web History 模式）

> Web History 提供独立 URL（SEO 可收录）。静态托管需 SPA fallback：GitHub Pages 用构建期生成的 `dist/404.html`（保存路径→跳回根→`index.html` 内联脚本 `history.replaceState` 恢复）；其他托管需 rewrite 到 `index.html`。sitemap.xml 与搜索索引同批构建期生成（`SITE_URL` 环境变量指定站点域名）。

| 路径 | 名称 | 组件 |
|------|------|------|
| `/` | home | `features/workshop/views/WorkshopHome.vue`（工坊首页） |
| `/cocos` `/art` `/audio` `/engineering` | 课程 id | `features/courses/components/CourseHome.vue`（配置驱动，按路由 name 取 COURSE_HOME_CONFIG） |
| `/{course}/phase/{n}` | {course}-phaseN | `features/courses/components/PhasePage.vue`（通用，内容来自 `content/{course}/phase-NN.md`） |
| `/workshop` | workshop | `WorkshopHome.vue` |
| `/workshop/gallery` | workshop-gallery | `features/workshop/views/GalleryView.vue` |
| `/workshop/phase/:phase` | workshop-phase | `features/workshop/views/WorkshopPhase.vue` |

## 单一来源约定（新增/修改数据的唯一入口）

| 数据 | 唯一来源 |
|------|----------|
| 课程 id/标签/图标/路径/阶段数 | `features/courses/data/courses.ts` |
| 首页 hero/pathSteps/tools/footer、阶段 icon/summary/concepts | `features/courses/data/course-home.ts` |
| 阶段 title/duration | 各 `content/{course}/phase-NN.md` frontmatter |
| 工坊 34 关挑战内容 | `features/workshop/data/challenges.ts`（`skillReward` 只标 skillId+文案，等级由 skill-tree 反查） |
| 技能解锁关系 | `features/workshop/data/skill-tree.ts`（`requiredChallenges` + `getSkillLevelForChallenge`） |
| 工坊资产映射 | `features/workshop/data/asset-map.ts` |

## 组件架构

```
App.vue → NavBar + RouterView（键盘导航 ←→、保存失败 toast、跳转链接）
  CourseHome.vue（通用课程首页，数据来自 COURSE_HOME_CONFIG + virtual:phase-meta）
    → HomeSidebar.vue（右侧导航，useScrollSpy 高亮）
    → FlowChart.vue / CourseProgressBar.vue
  PhasePage.vue（按路由懒加载对应 phase-NN.md）
    → PhaseLayout.vue（进度条 + 上下导航 + 页眉，记录阅读进度）
      → ConceptBlock.vue（内容块，滚动渐入 + 代码复制按钮）
      → PageTOC.vue（目录，桌面 fixed / 移动 details，useScrollSpy）
      → DemoHost.vue（:::demo 注册表按需加载）
  WorkshopHome / WorkshopPhase / GalleryView（工坊）
```

## 核心逻辑位置

| 功能 | 文件 |
|------|------|
| 键盘导航 (← →) | `App.vue` handleKeydown（仅阶段/课程首页路由生效，忽略表单/弹层） |
| 路由级标题 | `router/meta.ts`（查 virtual:phase-meta，同步设置 document.title/description） |
| 阶段进度 + 完成判定 | `PhaseLayout.vue`（recordVisit/markCompleted + IntersectionObserver） |
| 阅读进度持久化 | `stores/readingStore.ts`（localStorage 300ms 防抖 + pagehide 兜底） |
| 工坊持久化 | `features/workshop/stores/workshopStore.ts` + `workshopPersistence.ts`（IDB 权威 + localStorage 镜像，v1→v2 迁移） |
| 技能等级计算 | `features/workshop/data/skill-tree.ts` computeSkillLevels / getSkillLevelForChallenge |
| 滚动渐入 | `ConceptBlock.vue`（useRevealOnScroll，自管理） |
| 滚动高亮 | `features/navigation/composables/useScrollSpy.ts`（PageTOC/HomeSidebar 共用） |
| 主题 | `composables/useTheme.ts`（系统跟随 + localStorage，mount 前同步防闪烁） |

## 已知细节与注意

- `noUnusedLocals: true` — 未用变量会报 TS 错误
- **首页语义**：`/` 是工坊首页（WorkshopHome）；各课程首页独立于自己的 path（`/cocos` 等），cocos 的 `courseHome` 为 `/cocos`；工坊首页不启用键盘翻页
- 测试集中在 `src/**/__tests__/`：内容完整性（frontmatter/helpRefs/skillReward/首页配置覆盖）、路由一致性（md 文件数 == phaseCount）、持久化权威源判定（IDB/镜像/会话改动优先级）、迁移、分词等
- TOC/侧边栏 `position:fixed`，`right` 基于 `--max-width` 居中；`html { overflow-y: scroll }` 防滚动条闪现
- 深色模式 `data-theme` + `prefers-color-scheme` 跟随；打印样式与 `prefers-reduced-motion` 已内置
