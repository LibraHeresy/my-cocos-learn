# 像素飞机大战 — Cocos Creator 学习之路

Vue 3 + TypeScript + Vite 游戏开发学习文档站，4 门课程共 67 个阶段页面（Cocos 25 / 美术 14 / 音效 12 / 工程化 16）+ 像素画工坊 34 关挑战，纯静态无后端。

## 技术栈

Vue 3.5 / TypeScript 5.7 / Vue Router 4.5 / Vite 6 / Vitest 4 / MiniSearch

## 快速开始

包管理器统一使用 **Yarn（classic 1.x，见 `package.json` 的 `packageManager` 字段）**；仓库只有 `yarn.lock`，请勿用 npm 安装（会与锁文件脱节）。

```bash
yarn                # 安装依赖
yarn dev            # 开发服务器 → http://localhost:7777
yarn build          # 生产构建（vue-tsc 类型检查 + vite build）
yarn test           # 运行测试（vitest run，当前 47 个）
yarn lint           # ESLint 检查
yarn format         # Prettier 格式化
```

> 本机若装了 Yarn 4（Berry），建议通过 Corepack 固定到 classic：`corepack enable && corepack use yarn@1.22.22`，避免 v1 lockfile 被 Berry 迁移。

## 课程

| 课程 | 阶段数 | 路径 |
|------|--------|------|
| Cocos 引擎 | 25 | `/cocos` |
| 像素美术 | 14 | `/art` |
| 游戏音效 | 12 | `/audio` |
| 工程化与运营 | 16 | `/engineering` |
| 像素画工坊 | 34 关挑战 | `/workshop` |

## 项目结构

```
src/
  main.ts                    # 入口（主题初始化 + 路由 meta）
  App.vue                    # 根组件 + 键盘导航（← → 翻页）
  features/
    courses/                 # 课程：data/courses.ts（元数据单一来源）、data/course-home.ts（首页配置）、
    |                        #   components/（CourseHome 通用首页、PhasePage、PhaseLayout、ConceptBlock、FlowChart…）
    |                        #   demos/（6 个交互演示 + useDemoVisibility 视口门控）、views/（工坊等）
    workshop/                # 像素画工坊：challenges.ts（34 关）、skill-tree.ts（技能树）、
    |                        #   stores/（IndexedDB + localStorage 镜像）、composables/、views/
    search/                  # 站内搜索：MiniSearch + 自定义分词（useSearch / SearchBox）
    navigation/              # NavBar、HomeSidebar、PageTOC、useScrollSpy / useScrollLock
  content/{course}/phase-NN.md  # 67 个阶段内容（YAML frontmatter + Markdown）
  router/                    # Hash 路由 + 路由级 title（meta.ts 查 virtual:phase-meta）
  stores/                    # readingStore（阅读进度，localStorage 防抖）
  composables/               # useTheme（亮/暗主题）
  utils/                     # slug 等
  styles/                    # main.css / home-shared.css / phase-layout.css
```

## 数据流（构建期）

`vite.config.ts` 三个插件：

- `phaseMdPlugin` — 把 `content/**/phase-NN.md` 转换为 `PhaseMdData`（YAML frontmatter + `## 标题` 块 + `:::demo` 片段），支持 HMR
- `searchIndexPlugin` — 构建期生成 `public/search-index.json`（67 阶段 + 34 关挑战全文索引）
- `phaseMetaPlugin` — 提供 `virtual:phase-meta`：合并 md frontmatter（title/duration）与 `course-home.ts`（icon/summary/concepts），供课程首页与路由标题使用

**单一来源约定**：课程元数据只改 `features/courses/data/courses.ts`；课程首页展示数据只改 `data/course-home.ts`；阶段标题/时长只改对应 `phase-NN.md` 的 frontmatter；工坊挑战数据只改 `features/workshop/data/challenges.ts`；技能解锁关系只改 `skill-tree.ts`（`skillReward` 只标文案，等级由 `getSkillLevelForChallenge` 反查）。

## 部署

- 路由为 **Web History 模式**（独立 URL，可被搜索引擎收录，构建期自动生成 `sitemap.xml`）。
- 静态托管需 **SPA fallback**：GitHub Pages 由构建期生成的 `dist/404.html` 自动处理（深层路径刷新/直达会重定向回站内）；其他托管商需配置 rewrite 到 `index.html`（如 Netlify `_redirects`、Vercel 无需配置）。
- 自定义域名时在构建时传入 `SITE_URL`（生成 sitemap 用）；GitHub Actions 已自动注入。

## 更多文档

- [AGENTS.md](AGENTS.md) — AI 开发参考（架构、组件、设计系统、核心逻辑位置）
- [docs/plan.md](docs/plan.md) — 完整课程大纲
