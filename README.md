# 像素飞机大战 — Cocos Creator 学习之路

Vue 3 + TypeScript + Vite 游戏开发学习文档站，4 门课程共 67 个阶段页面，纯静态无后端。

## 技术栈

Vue 3.5 / TypeScript 5.7 / Vue Router 4.5 / Vite 6 / Vitest 4

## 快速开始

```bash
npm install
npm run dev      # 开发服务器 → http://localhost:7777
npm run build    # 生产构建（vue-tsc 类型检查 + vite build）
npm test         # 运行 19 个测试
npm run lint     # ESLint 检查
npm run format   # Prettier 格式化
```

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
  main.ts                  # 入口
  App.vue                  # 根组件 + 键盘导航
  router/                  # Hash 路由（makePhaseRoutes 批量生成）
  data/courses.ts          # 课程元数据单一起源
  components/              # NavBar, PhaseLayout, ConceptBlock, PageTOC 等
  views/                   # cocos/ art/ audio/ engineering/ workshop/
  composables/             # useScrollLock, useRevealOnScroll
  styles/                  # main.css, home-shared.css, phase-layout.css
  utils/                   # slug 工具
  types/                   # Phase, PhaseGroup 接口
```

## 更多文档

- [CLAUDE.md](CLAUDE.md) — AI 开发参考（路由表、组件架构、设计系统、核心逻辑位置）
- [docs/plan.md](docs/plan.md) — 完整课程大纲
