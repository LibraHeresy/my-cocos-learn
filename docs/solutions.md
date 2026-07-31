# 站点完整解决方案

> 生成日期：2026-07-31
> 配套文档：[docs/optimization-plan.md](optimization-plan.md)（问题清单，本文是对应的逐项解决方案）
> 生成方式：两份多代理工作流（9 个审计代理 + 5 个对抗性评审代理）交叉验证，全部决策从长期和可拓展性出发。
> 约定：本文只给方案，不含代码修改。所有文件路径以 `docs/` 为基准写相对路径（`../src/...`）。

---

## 0. 总览

### 0.1 与问题清单的映射

| 解决方案章节 | 对应 optimization-plan.md 问题 |
|--------------|--------------------------------|
| §1 存储层重构（IndexedDB） | §1.1、§1.7（版本迁移在此一并解决） |
| §2 彻底删除 30 天速通 | §1.2 |
| §3 一致性 / 单一来源修正 | §1.3、§1.4、§1.5、§1.6、§3.4 |
| §4 CI 与测试体系 | §3.1、§3.2、§3.3 |
| §5 内容勘误 | §2（全部 4 门课程） |
| §6 无障碍 / 打印 / 深色模式 | §4（全部） |
| §7 SEO 与内容分发 | §5（全部） |
| §8 教学增强 | §6（视觉化演示、学练闭环、学习进度、全文搜索） |

### 0.2 总体设计原则（所有决策的共同约束）

1. **版本化数据模型**：所有持久化结构带 `version` + 迁移函数，禁止「版本不符即整体重置」。
2. **单一起源**：课程/阶段/挑战数量只维护一份，其余全部派生。
3. **一次性做对**：无障碍/深色/打印做系统化基线而非零敲碎打（评审明确：三个主题共享同一套 CSS 变量，必须同一批改动）。
4. **可测试**：纯函数/工厂化，存储后端可注入、迁移可单测。
5. **失败必须可见**：任何持久化失败都要有用户可感知的通道，禁止静默 `catch {}`。

### 0.3 实施节奏

- **阶段 A（约半天）**：§1 存储重构 + §4 CI + §3 一致性修正（先处理数据安全与「删了 md 仍发布成功」这类隐患）。
- **阶段 B（1-2 天）**：§5 内容勘误（按 4 门课程分 4 个 diff）。
- **阶段 C（2-4 天）**：§2 速通删除、§6 无障碍/打印/深色、§7 SEO、§8 教学增强。

---

## 1. 存储层重构（IndexedDB）— 对应 1.1

### 1.1 目标与边界

- **目标**：解决单一 localStorage blob 超配额（17MB vs 5MB）、`saveState` 静默吞错、base64 膨胀静默丢图（375-500KB 合法上传被裁剪）三个真实隐患；同时为未来音频/视频/导出素材留出存储通道。
- **边界**：对外 store API **签名保持不变**（所有公开 mutator/read 仍同步），消费组件在**逻辑层零改动**；但图片消费组件因字段从 base64 改为 blob 引用，需要按 §1.5 清单迁移。
- **存储访问点全景**（审计确认，只有这些文件 import 工坊状态）：
  - `src/stores/workshopStore.ts`（单例 + `state = reactive(loadState())`，line 42）
  - `src/composables/usePracticeLog.ts`、`useSkillTree.ts`、`useAssetGallery.ts`
  - `src/views/workshop/WorkshopHome.vue`、`WorkshopPhase.vue`、`GalleryView.vue`
  - `src/components/workshop/SkillTree.vue`、`AssetMap.vue`
  - **必须保持同步**的读函数：`getAllCompletedChallenges` / `getPracticeForPhase` / `getRecentPractices` / `getGroupedPractices` / `getStats` / `getSkillProgress` / `useWorkshopState`。
  - **仅内部调用**、可异步化的函数：`recomputeSkillProgress` / `updateStreak`（外部零引用）。
  - 现有 localStorage 键仅两个：`__workshop_state__`、`__workshop_phase_form__`。

### 1.2 目标架构（评审修正版）

```
src/stores/idb.ts              —— 薄 Promise 封装（纯异步层，不碰 Vue）
   ├─ DB 'pixel-workshop-db', schema v2
   ├─ store 'state'  (单条记录 key='workshop', {…state, version})
   ├─ store 'blobs'  (key=blobId, value=Blob —— 媒体无关，供将来音频/视频/素材复用)
   └─ store 'drafts' (key=challengeId, value={…draft, imageBlobId})
src/stores/workshopStore.ts    —— 内存 reactive 镜像 + 同步 API + 防抖 persist + 迁移
src/composables/useBlobImage.ts —— blobId → 共享 objectURL（带引用计数）
src/utils/idb.migration.ts     —— 纯函数迁移（可单测）
```

**核心机制**：模块级 `reactive` 镜像从 localStorage 缓存**同步**初始化（首帧即渲染、不闪白屏）→ 后台 `hydrateFromIdb()` 读权威状态并跑迁移 → 写回镜像。所有 mutator 同步改镜像，随后防抖持久化。

### 1.3 关键设计决策（含评审修正——必须照此实现）

评审发现 4 个会导致**真实数据丢失**的高危缺口，以下每一条都是评审确认的修正：

| # | 风险 | 修正方案 |
|---|------|----------|
| 1 | **版本守卫重置**：`loadState`（workshopStore.ts:27）只认 `version===1`，把 v2 写回缓存后下次加载被整体重置 | `loadState` 接受已知版本集合 `{1,2}`，仅对**未知/更高版本**重置；保留 last-known-good 回退（hydrate 失败用缓存继续，不打默认值） |
| 2 | **hydrate 竞态**：hydrate（异步，IDB 更旧）`Object.assign` 覆盖镜像，会吞掉 hydrate 完成前用户已做的保存 | 引入 `dirty` 标志/单调 `writeSeq`：hydrate 仅在「模块加载后无任何写入」时应用；否则在 hydrate 读到的状态上重放本地变更；或 mutator 在 hydrate 完成前排队 |
| 3 | **防抖 + 异步丢失最后写入**：关标签页瞬间丢最后一次写入，localStorage 缓存只在 persist 内刷新，两次 in-flight 写可能乱序 | ① 图片 blob **选图时立即写**（eager），state 只引用已持久化的 id；② mutator 内**同步**刷新 localStorage 缓存（现无图片字节，极便宜）→ localStorage 永远是 last-known-good；③ `pagehide` + `visibilitychange:hidden` 触发 flush（尽力而为）；④ hydrate 用 `lastSavedAt` 时间戳裁决 localStorage/IDB 谁新；⑤ persist 用 **in-flight promise 链串行化**，防止后写先落盘 |
| 4 | **迁移原子性/幂等性未定义** + **漏掉草稿迁移** | 迁移放**单个跨 store 的 readwrite 事务**（scope 同时含 'state' 与 'blobs'）；blobId **确定性生成**（如 `img-${entry.id}-${hash}`）保证幂等；逐条 try/catch，损坏图片丢弃并继续；`migrationApplied` 标记与迁移同一事务；**迁移成功后才删旧 localStorage base64**，失败保留可重试。**DRAFT_KEY 草稿一并迁移**（含草稿内图片） |

其余评审确认的决策：

- **回退路径显式定义**：IDB 可用性不是一次性布尔（iOS 无痕模式 open 成功但事务级抛错）。在**写入时**也捕获事务错误 → `saveError` + 动态降级；回退模式把图片重新编码为 base64 `imageDataUrl`（localStorage 只能存字符串），接受旧图丢失为可预期的退化。
- **saveError 必须有 UI 消费者**：App.vue 加全局 toast，`watch state.saveError`（区分瞬时 QuotaExceeded 与持久失败）；「✓ 已保存」toast 只在**与 localStorage 同步写入成功**后显示（否则现在是撒谎）。
- **blob 生命周期**：`removePractice` / 图片替换 / 清空图片后保存 → state 提交后显式 `deleteBlob`；`useBlobImage` 用**模块级带引用计数的共享 URL 缓存**（同一 blobId 复用一个 objectURL，refcount 归零才 revoke）——画廊 Teleport 弹窗持有期间不得回收（卡片可能先卸载）。不做跨标签页盲扫 GC；objectURL 持有内存中的 Blob，IDB 删除不影响已生成的 URL，删除对正在渲染的视图安全。
- **迁移日一次性图片闪烁**：首帧镜像含旧 base64（同步显示）→ hydrate 后换成 blobId → 异步读回。接受这次性闪烁并在提交说明记录；不为此增加复杂度。
- **砍掉 BroadcastChannel**（跨标签页一致性延后，先做失败路径）。
- **删除 base64 长度裁剪**（workshopStore.ts:98-100）——它是静默丢图 bug 的源头；图片体积校验只保留上传时的 `file.size <= MAX_IMAGE_SIZE`，常量收敛到一处。
- **可测试性**：`idb.ts` 纯异步不碰 Vue；`workshopStore` 改工厂 `createStore(backend)`（默认注入 idb 后端，单测 mock）；迁移抽纯函数；加 `await flushPersist()` 测试钩子；模块初始化加非浏览器守卫（`typeof indexedDB === 'undefined'` 走回退，vitest node 环境安全）。

### 1.4 数据模型与迁移

**类型变更**（`src/types/workshop.ts`）：
- `PracticeEntry.imageDataUrl?: string` → `PracticeEntry.imageBlobId?: string`。
- `WorkshopState.version` 1 → 2。

**v1 → v2 迁移**（`src/utils/idb.migration.ts`，纯函数）：
1. 读取旧 `__workshop_state__` blob；
2. 对每条含 `imageDataUrl` 的 entry：base64 → Blob → 写入 blobs store（确定性 id）；entry 换成 `imageBlobId`；
3. DRAFT_KEY 草稿同样处理；
4. 以上全部放在**单事务**内，成功后才清旧 localStorage base64；
5. 幂等可重入，失败保留旧数据下次重试。

### 1.5 图片表示变更：消费点迁移清单（审计确认，共 7+ 处）

> 评审澄清：store 函数签名层「零改动」成立，但图片消费组件必须迁移。以下为完整清单。

**Producer（产生图片的地方）**
| 位置 | 现行为 | 改为 |
|------|--------|------|
| [WorkshopPhase.vue:105-110](../src/views/workshop/WorkshopPhase.vue#L105-L110) `readFile` | `FileReader.readAsDataURL` 存 base64 | 直接用 `file`（Blob）**立即写 IDB**（eager），预览用 `URL.createObjectURL(file)`，`removeImage`(:112)/替换/`onBeforeUnmount` 时 revoke；**不再序列化 base64** |
| [WorkshopPhase.vue:126-133](../src/views/workshop/WorkshopPhase.vue#L126-L133) `handleSave` | entry 带 `imageDataUrl` | entry 带 `imageBlobId`；保存前确认 blob 已落盘；**update 路径对比新旧 blobId，删除旧 blob**（替换语义） |
| [WorkshopPhase.vue:54-65](../src/views/workshop/WorkshopPhase.vue#L54-L65) `saveDraft` | 草稿存 base64 | 草稿存 `imageBlobId`（选图时 blob 已在 IDB）→ 草稿 JSON 极小；`clearDraft` 必须删对应 blob |
| [workshopStore.ts:98-100](../src/stores/workshopStore.ts#L98-L100) `addPractice` | base64 长度裁剪（静默丢图源头） | **整段删除**，由 eager blob 写入自然取代 |
| [workshopStore.ts:34-40](../src/stores/workshopStore.ts#L34-L40) `saveState` | `catch {}` 静默 | 改为上报 `saveError`（有 UI 消费者） |

**Consumer（展示图片的地方）**
| 位置 | 现行为 | 改为 |
|------|--------|------|
| [GalleryView.vue:103-107](../src/views/workshop/GalleryView.vue#L103-L107) 卡片 | `v-if="entry.imageDataUrl"` + `<img :src>` | `v-if="entry.imageBlobId"` + `useBlobImage(entry.imageBlobId)`；卡片在 v-for 内 → **抽 `GalleryCard.vue`**，每实例拥有自己的 objectURL 生命周期，卸载时 revoke |
| [GalleryView.vue:60-62,105,146](../src/views/workshop/GalleryView.vue#L60-L62) 图片查看器 | 存 `imageDataUrl` 字符串在 `imageViewer` ref | `imageViewer` 存 **blobId（或 entry）**；弹窗打开时取 Blob→objectURL，关闭时 revoke；**不得复用卡片的 objectURL**（Teleport 弹窗开着时卡片可能卸载） |
| [AssetMap.vue:26-28](../src/components/workshop/AssetMap.vue#L26-L28) 缩略图 | `asset.practice?.imageDataUrl` | `asset.practice?.imageBlobId` + `useBlobImage`；单组件实例一个 composable 即可，`onBeforeUnmount` revoke |
| [WorkshopPhase.vue:249-256](../src/views/workshop/WorkshopPhase.vue#L249-L256) 表单预览 | `imageDataUrl` ref | 选图时 objectURL；生命周期见 Producer 第一行 |

**关联清理**：
- `useAssetGallery.ts` 逻辑无需改（practice 从 `state.practiceLog` 透传），只随类型变。
- `removePractice`（[workshopStore.ts:124](../src/stores/workshopStore.ts#L124)）：目前无 UI 调用，但接线未来删除按钮前**必须先在 state 提交后删 blob**——现在就加上。
- **草稿死数据治理**：审计发现「已保存的挑战草稿写了但不读」（[WorkshopPhase.vue:29](../src/views/workshop/WorkshopPhase.vue#L29)），且同一图片在草稿 + 已保存状态存双份。迁移到 drafts store 时顺带清理「挑战已有 practice 的孤儿草稿」，避免孤儿 blob 累积。

### 1.6 文件级改动清单

| 文件 | 改动 |
|------|------|
| 新建 `src/stores/idb.ts` | 薄封装：open/getState/putState/getBlob/putBlob/deleteBlob/getDraft/putDraft/clearDraft，isAvailable + 写入时错误捕获 |
| 新建 `src/utils/idb.migration.ts` | 纯函数 v1→v2（含草稿），单事务、幂等 |
| 新建 `src/composables/useBlobImage.ts` | 模块级 refcount 共享 objectURL 缓存 |
| 改 `src/types/workshop.ts` | `imageDataUrl` → `imageBlobId`，version 2 |
| 改 `src/stores/workshopStore.ts` | 工厂化 + hydrate 竞态守卫 + lastSavedAt 裁决 + 防抖串行 persist + saveError 通道 + 删除 base64 裁剪 + 版本守卫接受 {1,2} |
| 改 `src/views/workshop/WorkshopPhase.vue` | 选图即写 blob + objectURL 预览 + saveDraft/handleSave/clearDraft 走 blobId + restore 异步带「未编辑才应用」守卫 |
| 改 `src/views/workshop/GalleryView.vue` | 抽 GalleryCard.vue + 查看器存 blobId |
| 改 `src/components/workshop/AssetMap.vue` | useBlobImage |
| 改 `src/App.vue` | saveError 全局 toast（与 §6 的无障碍 toast 复用同一组件） |
| 改 `src/components/ConceptBlock.vue` 或全局 | 复制按钮等的 saveError 无关，跳过 |

### 1.7 测试策略

- `idb.ts`：纯异步 + `fake-indexeddb` 集成测试。
- `workshopStore`：工厂 + mock 后端单测；`await flushPersist()` 钩子验证防抖/串行。
- `idb.migration.ts`：纯函数直接测——v1 带 base64 → v2 带 blobId；损坏 base64 丢弃继续；幂等重入；草稿迁移。
- 模块初始化非浏览器守卫：node 环境（vitest）import 不崩。

### 1.8 验收标准

1. 现有 34 关全部进度/图片可迁移到 IDB 且不丢；旧 localStorage base64 只在迁移成功后清理。
2. 首次加载无「进度清零闪屏」；图片消费点（画廊/资产地图/预览）全部走 objectURL。
3. `saveError` 出现时用户可见提示，「✓ 已保存」不再撒谎。
4. 上传任意尺寸 ≤500KB 的文件不再被静默丢弃（原 375-500KB 区间 bug 消失）。
5. 关标签页/切走后最后一次保存不丢（pagehide flush + localStorage last-known-good）。
6. `npm run build && npm test` 通过；新增测试全绿。

---

## 2. 彻底删除 30 天速通 — 对应 1.2

> 评审确认：代码侧早已清理（commit `07ab421` 已删 `Day1-30.vue`/`Landing.vue`/`speedrun-days.ts`），本次是**纯文档清理**。范围限定 4 个文档。

### 2.1 逐文件清理清单（含行号，审计逐行核对）

**README.md**
| 位置 | 操作 |
|------|------|
| :3 「…67 个阶段页面 + 30 天速通计划，纯静态无后端。」 | 删「+ 30 天速通计划」→「4 门课程共 67 个阶段页面，纯静态无后端。」 |
| :28 课程表 `| 30 天速通 | 30 天 | /speedrun |` | 整行删除（注意该行「阶段数」栏写的是「30 天」，本就不合列语义） |
| :39 目录树 `views/ ... speedrun/` | 改为实际结构 `views/ ... workshop/` |

**CLAUDE.md**
| 位置 | 操作 |
|------|------|
| :3 「…（Cocos 25、美术 14、音效 12、工程化 16）+ 30 天速通计划」 | 删「+ 30 天速通计划」 |
| :24 `| / | home | views/speedrun/Landing.vue |` | **双重过期，必须改写**为 `views/workshop/WorkshopHome.vue`（否则只删速通行后，文档仍把根路由指向不存在的组件） |
| :30-31 两条 `/speedrun`、`/speedrun/day/1~30` 路由 | 整行删除 |
| 路由表（既有缺口，建议顺手补） | 补 `/workshop`、`/workshop/gallery`、`/workshop/phase/:phase` 三行，与 [router/index.ts:19-33](../src/router/index.ts#L19-L33) 对齐 |

**docs/plan.md**
| 位置 | 操作 |
|------|------|
| :532 `## 五、30天速通映射` + :534-565 整表 | **先归档再删除**（见 2.4） |
| :571 步骤 1「删除现有内容（…+ Day1-30 + 旧组件）」 | 删「+ Day1-30」（这是优化方案清单里**漏掉的**一处，评审已补全） |
| :578 步骤 8「提取 30 天速通」 | 整句删除并重排其后编号（8→7） |
| :585 验证清单第 3 条「30 天速通→参考课程链接正确跳转」 | 删除并重排（1/2/4→1/2/3） |
| 章节编号 | 删「五」后「七、实施顺序」「八、验证」变孤儿编号 → **七→五、八→六**（「六」本就不存在） |
| :472/:478 的 D1/D3/D7/D30、Day1 | **保留**（游戏留存/签到教学内容，非功能） |

**docs/optimization-plan.md（审计文档自身）**
- 1.2 节（:44-54）：追加解决记录「2026-07-31 采纳方案 B，速通已彻底删除」。
- 6.5 节（:311-313）与实施顺序第 6 条（:325）：标记「不再推进」或移除——否则读者/AI 会按方案 A（复活速通）行动，与本次删除决定矛盾。

### 2.2 必须保留的误报（grep 命中但语义无关，禁止删除）

- `src/content/cocos/phase-01.md:99`、`phase-04.md:56` 的「**速通提示**」——是通用学习提示框标签，非 30 天速通功能。
- `src/content/engineering/phase-07.md:33/62`、`phase-08.md`、`phase-09.md` 的 **D1/D3/D7/D30 留存指标**——游戏运营教学内容。
- `src/content/cocos/phase-25.md` 的「Day 1..5」五天开发计划——课程正文。

清理边界铁律：**只改 README.md、CLAUDE.md、docs/plan.md、docs/optimization-plan.md 四个文档。**

### 2.3 归档决策（长期考量）

D1-D30 映射表是 30 天课程唯一人类可读的「课程逻辑」载体，git 历史虽有（`07ab421^`），但考古成本高。删除前将其**另存为 `docs/archive/30-day-speedrun-mapping.md`**（顶部加「已停用 / 仅留档」横幅），再在 plan.md 中删除。恢复成本从「git 考古」降为「读一份留档 + git 里的 DayN.vue/speedrun-days.ts」。

### 2.4 复核步骤

1. `grep -ri 'speedrun|速通|DayN|Day1-30|/speedrun' README.md CLAUDE.md docs/`——应仅命中 `docs/archive/30-day-speedrun-mapping.md` 留档文件。
2. `npm test`——`consistency.test.ts` 校验 courses 与 md 文件一致性，确保清理未误删内容文件。
3. 目视确认 CLAUDE.md 路由表 `/` 行指向 WorkshopHome.vue。

---

## 3. 一致性 / 单一来源修正 — 对应 1.3、1.4、1.5、1.6、3.4

### 3.1 工坊挑战总数派生（原 1.4）

`CHALLENGES.length` 单一来源（[challenges.ts:24](../src/data/challenges.ts#L24)，当前 34 且 id 连续）。替换三处硬编码：
- [workshopStore.ts:164](../src/stores/workshopStore.ts#L164) `totalChallenges: 34`
- [WorkshopHome.vue:18](../src/views/workshop/WorkshopHome.vue#L18) `for (let i = 1; i <= 34; i++)`（改为 `<= CHALLENGES.length` 或派生 `maxId`）
- [WorkshopPhase.vue:159](../src/views/workshop/WorkshopPhase.vue#L159) `关 {{ challengeId }}/34`

注意：`skill-tree.ts` 的 `requiredChallenges: [34]` 是**语义引用**（指向具体关卡），不改。

### 3.2 工坊画廊 course 字段（原 1.3）

审计补充结论：即使补写 course，34 关挑战的 helpRefs 全指向 art，`uniqueCourses` 仍只有一个值，筛选栏依旧不显示——整条链路在「工坊=美术练习」定位下是死的。方案：
- **短期**：删 `filterCourse`/`uniqueCourses`/筛选栏；画廊课程图标改为按 `phase` 或固定「🎨」。可选顺手补 `PracticeEntry.course`（写 'art'）供未来多课程挑战使用。
- **长期**：若工坊扩展到 Cocos 代码/音频挑战，再让挑战数据携带 course 并恢复筛选。

### 3.3 `courseHome` 单一来源（原 1.5）

- [courses.ts:9](../src/data/courses.ts#L9) 的 `courseHome` 字段（`.courseHome` 全项目 0 处读取）开始使用。
- [PhaseLayout.vue:25](../src/components/PhaseLayout.vue#L25) 三元表达式 → `COURSES[course.value].courseHome`。
- [App.vue:36/46](../src/App.vue#L36) 键盘导航内联特例 → 用同一来源（可给 cocos 增加 `courseHomeName` 表达「返回 home 路由」）。
- [App.vue:12](../src/App.vue#L12) `name === 'home'` 硬编码为 cocos → 数据化。

### 3.4 阶段内容按需加载（原 1.6）

[PhasePage.vue:9-12](../src/components/PhasePage.vue#L9-L12) `eager: true` 全量打包 → 非 eager + `load()` 缓存（或交由 §7 的预渲染 SSG 一并消解——若做了 §7，本项可跳过）。

### 3.5 魔数 / 重复清理（原 3.4）

| 位置 | 改动 |
|------|------|
| [NavBar.vue:19-22](../src/components/NavBar.vue#L19-L22) `startsWith` 手写课程清单 | 用 `detectCourseFromRoute()`（已基于 COURSES 动态生成正则）替换；`activeCourse` 也数据驱动 |
| [PageTOC.vue:31-47](../src/components/PageTOC.vue#L31-L47) 与 [HomeSidebar.vue:30-50](../src/components/HomeSidebar.vue#L30-L50) 重复的 IntersectionObserver | 抽 `useScrollSpy(selector)` composable（与 useScrollLock 同层） |
| [App.vue:16](../src/App.vue#L16)、[PhasePage.vue:19](../src/components/PhasePage.vue#L19) 各自内联 `/-phase(\d+)$/` | 在 courses.ts 加 `parsePhaseFromRoute()` 集中 |
| [routes.test.ts:13-14](../src/router/__tests__/routes.test.ts#L13-L14) 字面量 67 | 仅动态计算（`expect(total).toBe(Object.values(COURSES).reduce(...))`） |
| 四个 Home.vue 末尾 phase id（cocos:25/art:14/audio:12/engineering:16） | 加一条测试：每课程 `phaseGroups` 最大 id == `COURSES.phaseCount`（[consistency.test.ts](../src/router/__tests__/consistency.test.ts) 已有 md 数量守卫，扩展它） |
| [HomeSidebar.vue:7-9](../src/components/HomeSidebar.vue#L7-L9) 未使用的 `course` prop | 删除声明与各处 `:course="..."` 传参（或真正实现） |

---

## 4. CI 与测试体系 — 对应 3.1、3.2、3.3

### 4.1 CI 接上测试（原 3.1，high）

[deploy.yml:30-32](../.github/workflows/deploy.yml#L30-L32) 现只 `npm install` + `npm run build`，**从不跑 `npm test`**——唯一能防「删了 md 仍发布成功」的 [consistency.test.ts](../src/router/__tests__/consistency.test.ts) 从未执行。

**改动**：deploy 前加 `npm test`（失败即停止，不部署）；同时加 `npm run lint`（可选，先 test）。

### 4.2 PR 触发（原 3.2，medium）

[deploy.yml:3-5](../.github/workflows/deploy.yml#L3-L5) 仅 `push: main`。加 `pull_request` 触发（只跑 test/lint，不部署），让质量问题在合并前暴露。

### 4.3 测试覆盖缺口（原 3.3，medium）

新增两条一致性测试（防未来回归）：
1. **frontmatter 完整性**：读全部 67 个 `src/content/**/*.md`，断言 `phase/title/duration` 非空且 `phase` 与文件名一致——当前 [vite.config.ts:30-33](../vite.config.ts#L30-L33) 对缺失字段有 `?? 0 / ?? ''` 静默兜底，坏 frontmatter 也能过 build。
2. **helpRefs 有效性**：`challenges.ts` 每个 `helpRefs` 的 `course ∈ COURSES` 且 `phase ∈ 1..phaseCount`（当前恰好全合法但无自动化保障）。
3. **§3.5 的 phaseGroups/phaseCount 测试**并入此批次。

---

## 5. 内容勘误 — 对应 §2（全部）

> 执行方式：按课程分 4 个 diff，逐条改。MEDIUM = 照抄会失败/学到错误知识，优先。所有「⚠️ 需核实」项在改前先查证或改为不绑定具体史实/数字的表述。

### 5.1 Cocos 课程（MEDIUM 优先）

| 文件 | 修改 |
|------|------|
| [cocos/phase-03.md:20](../src/content/cocos/phase-03.md#L20) | 坐标原点改为「Cocos 2D 场景原点 (0,0) 对应 **Canvas/可视区域中心**」 |
| [cocos/phase-08.md:76](../src/content/cocos/phase-08.md#L76) | `backOut` 公式换标准式 `c3*(v-1)³ + c1*(v-1)² + 1`（c1=1.70158, c3=2.70158），删错误的 `1+(v-1)²*(2.7v-1.7)` |
| [cocos/phase-12.md:80](../src/content/cocos/phase-12.md#L80) | `BossEnemy` 覆盖 `hp`（或文中说明依赖检查器把 hp 调到 50），使 `ratio = hp/maxHp` 逻辑成立 |
| [cocos/phase-14.md:78](../src/content/cocos/phase-14.md#L78) | `rollDrop` 的 boss modifier 改为作用于全部条目（或 DROP_TABLE 加 rare 条目），使注释与验证步骤成立 |
| [cocos/phase-17.md:66](../src/content/cocos/phase-17.md#L66) | `TransitionManager` 补静态 `instance`/单例初始化 + `director.addPersistRootNode`（或改示例避免引用 instance） |
| [cocos/phase-18.md:43](../src/content/cocos/phase-18.md#L43) | 纹理格式改为「Android 常选 ETC2/ASTC，iOS 传统 PVRTC、新机型 ASTC」；同步修自测题 3 前提 |
| [cocos/phase-19.md:39](../src/content/cocos/phase-19.md#L39) | Restitution/Friction 归到 Collider2D/PhysicsMaterial2D（RigidBody2D 只有 Damping/Gravity Scale 等） |
| [cocos/phase-19.md:49](../src/content/cocos/phase-19.md#L49) | Box2D 积分器改「semi-implicit Euler（半隐式欧拉）」，删 Verlet 与「位置守恒」因果 |
| [cocos/phase-19.md:55](../src/content/cocos/phase-19.md#L55) | 宽相改「动态 AABB 树（b2DynamicTree / BVH）」 |
| [cocos/phase-19.md:61](../src/content/cocos/phase-19.md#L61) | 「Godot 2D 基于 Box2D」改「Godot 用自己的 GodotPhysics2D」；Box2D 协议改 zlib |
| [cocos/phase-23.md:12](../src/content/cocos/phase-23.md#L12) | 删除「C++/Emscripten/wasm」说法，改「Creator 3.x 引擎是 TypeScript，Web 构建输出 JS」 |
| [cocos/phase-23.md](../src/content/cocos/phase-23.md) | 补「## 🔧 动手」板块（把部署步骤组织成可执行任务块） |
| [cocos/phase-24.md](../src/content/cocos/phase-24.md) | 补「## 🔧 动手」板块 |

**LOW/INFO**：phase-01 汇编示例地址换 2600 真实地址或标注「示意」；phase-02 删「钻石继承」术语；phase-09 `Input.getKeyDown()` 统一为 `input.isKeyDown/isKeyPressed`；phase-10 两组碰撞位值统一；phase-12 句子笔误「Boss 的搜索」；phase-13 波次编号连续化并说明 `wave` 字段未被读取；phase-14 EXTRA_LIFE 注释与代码对齐、`@property(PowerUpType)`；phase-16 删「LOL 血条移到底部降 30%」⚠️ 史实；phase-20 烟雾 Gravity 符号、几何战争年份、下雨 Angle 方向统一；phase-22 Spine 组件名统一为 `sp.Skeleton`；phase-07 自测题 Tween 前置引用标注「预告题」。

### 5.2 美术课程（MEDIUM 优先）

| 文件 | 修改 |
|------|------|
| [art/phase-12.md:37](../src/content/art/phase-12.md#L37) | 血条锚点改「**填充层自身**锚点 (0,0.5)」（Scale 围绕节点自身锚点） |
| [art/phase-09.md:44](../src/content/art/phase-09.md#L44) | idle 动画说明重写为自洽的 4 帧循环（帧1中/2上/3中/4下，循环 1-2-3-4-1），删矛盾注释 |

**LOW/INFO**：art/phase-01 马里奥尺寸改「整个 sprite 16×16」、措辞「学完这 14 个阶段后」；phase-03 ⚠️ 暖色生理解释弱化；phase-04 换非 45° 斜线演示锯齿、Retina AA 表述修正；phase-06 `pixelated` 是「阻止插值平滑」非「阻止抖动」；phase-10 受击帧数改 4 帧、跨课程引用标注「Cocos 课程 Phase 20」；phase-13 同上标注「Cocos 课程 Phase 21」；phase-14 时长表统一（555min→写 9-10 小时）、中文命名表述弱化。

### 5.3 音频课程（MEDIUM 优先）

| 文件 | 修改 |
|------|------|
| [audio/phase-07.md:26](../src/content/audio/phase-07.md#L26) | 《VVVVVV》作曲者改 **Magnus Pålsson（SoulEye）**；改「用 Bosca Ceoil 写的」，不绑定 Terry 作曲 |
| [audio/phase-09.md:52](../src/content/audio/phase-09.md#L52) | `playOneShot` 改**实例方法**描述（通过已挂 AudioSource 一次性播放，不自动创建/销毁） |

**LOW/INFO**：phase-01 ⚠️ 马里奥 BGM 加速说法删改；phase-02「-6dB = 振幅减半，感知响度减半约 -10dB」；phase-05 BFXR 波形没有混合选项，改分两层说明或换用「Pink Noise 模拟沙感」；phase-06 Audacity 导出菜单改 3.x 路径（File → Export Audio → Format 选 Ogg Vorbis）、Normalize 菜单位置统一、硬截断改 click/pop 术语；phase-10「Phase 15 对象池」标注跨课程来源；phase-12 ⚠️ MP3 静音填充量级改「几十毫秒」。

### 5.4 工程课程（MEDIUM 优先）

| 文件 | 修改 |
|------|------|
| [engineering/phase-06.md:47](../src/content/engineering/phase-06.md#L47) | 攻击 +50% → TTK 缩 33%（约 1.0s），删「1.5s→0.75s」矛盾算例 |
| [engineering/phase-07.md:54](../src/content/engineering/phase-07.md#L54) | 经济数字统一为一张自洽表（Lv1→Lv2 价格、升级序列、10 局预算三者一致） |
| [engineering/phase-12.md:36](../src/content/engineering/phase-12.md#L36) | `Time.timeScale` 改 `director.getScheduler().setTimeScale(0.1)`，删「影响所有节点」说法，修正帧/实时间混用 |
| [engineering/phase-13.md:25](../src/content/engineering/phase-13.md#L25) | GitHub Actions：公开仓库免费无限分钟，2000 分钟是私有仓库 free 额度；统一两处口径 |
| [engineering/phase-15.md:36](../src/content/engineering/phase-15.md#L36) | `wx.getSystemInfoSync().system` 改 `.language`（返回 OS 名+版本），统一两处自相矛盾 |

**LOW/INFO**：phase-02 `createInnerAudioContext` 非小游戏专属 + ⚠️ 收入分成政策核实；phase-08 ⚠️ 无来源精确数字标注经验估计、D1 留存基准与 phase-09 统一、`*200+100` 改 `*201` 或文案 100-299；phase-09 ARPU 公式改「月收入 ≈ ARPU(月)×MAU」；phase-11 Boss 计分 500 vs 200 统一并注明口径；phase-12「第 6 节 cubic-bezier」改指向 cocos phase-08；phase-13 npm ci 缓存改 `~/.npm`、删重复「③」；phase-14 删「onLoad 不要 on」铁律（3.x 节点事件随销毁自动释放）；phase-16 删 `Phase2.vue` 引用，换成游戏项目语境。

---

## 6. 无障碍 / 打印 / 深色模式 — 对应 §4

> 评审结论：三个主题共享同一套 CSS 变量，**必须同一批改动**，避免二次返工。顺序：变量收敛 → 无障碍 → 打印收尾。

### 6.1 无障碍三层基线（系统化）

**① 全局基线（main.css + App.vue）**
1. 统一 `:focus-visible` 品牌焦点样式（`outline: 2px solid var(--color-primary); outline-offset: 2px`）。
2. `@media (prefers-reduced-motion: reduce)`：动画归零，且强制 `.concept-block, .phase-group { opacity:1 !important; transform:none !important }`（否则未 reveal 的块在 reduced-motion/打印下永不显示——这是打印修复的前提）。
3. [App.vue handleKeydown](../src/App.vue#L20-L50)：加 `ctrl/meta/alt/shift` 修饰键守卫；tag 判断改 `closest('input, textarea, select, [contenteditable="true"], [role="dialog"], dialog, [data-no-arrow-nav]')`——解决焦点在任意自定义控件上按 ←/→ 误触翻页。
4. 加 skip-link（「跳到正文」），RouterView 包 `<div id="app-main" tabindex="-1">`。

**② 组件级**
| 位置 | 改动 |
|------|------|
| [NavBar.vue:28](../src/components/NavBar.vue#L28) | `aria-label="主导航"`；补 `-webkit-backdrop-filter`；tab 加 `aria-current` |
| [PhaseLayout.vue:37-44](../src/components/PhaseLayout.vue#L37-L44) | 进度条加 `role="progressbar"` + `aria-valuemin/max/now`；dots 容器 `aria-hidden` |
| [PageTOC.vue](../src/components/PageTOC.vue) | active 加 `aria-current`；新增 `<details class="toc-mobile">` 目录（原生 disclosure，零 JS、键盘友好）替代窄屏隐藏的 fixed TOC |
| [HomeSidebar.vue](../src/components/HomeSidebar.vue) | 同上（active aria-current + `<details>` 移动端版） |
| [ConceptBlock.vue](../src/components/ConceptBlock.vue) | 复制按钮注入时 `setAttribute('type','button')` + aria-label；main.css 加 `.copy-btn:focus-visible, pre:focus-within .copy-btn { opacity:1 }` |
| [WorkshopPhase.vue 上传区:247-267](../src/views/workshop/WorkshopPhase.vue#L247-L267) | div 改 `<label for="workshop-upload-input">` + input 改 `.visually-hidden`（保留可聚焦）；label 原生接管键盘路径；**不用 role=button**（要手写 Enter/Space/焦点管理四样重复劳动） |
| [WorkshopPhase.vue 自检:213-217](../src/views/workshop/WorkshopPhase.vue#L213-L217) | `type="button"` + `aria-pressed` 三态（true/false/mixed）+ `aria-label` 问题文本 |
| [WorkshopPhase.vue 星级:274-280](../src/views/workshop/WorkshopPhase.vue#L274-L280) | `type="button"` + `aria-label="评 N 星"` + `aria-pressed`；符号 span `aria-hidden`；容器 `data-no-arrow-nav` |
| [WorkshopPhase.vue alert×3](../src/views/workshop/WorkshopPhase.vue#L93) | 改 `role="alert"` 区域（常驻直到下次操作，不自动清空；`uploadError` ref） |
| [GalleryView.vue 卡片:102-107](../src/views/workshop/GalleryView.vue#L102-L107) | div 改真实 `<button type="button">` 包 img |
| [GalleryView.vue 查看器:143-151](../src/views/workshop/GalleryView.vue#L143-L151) | 保持 div + `role="dialog" aria-modal tabindex="-1"` + Esc 关闭 + 打开记录/关闭还原焦点 + Tab 焦点圈；**焦点圈抽 `useFocusTrap.ts` 共享 composable**（未来所有弹层复用） |

**③ 长期约束（写入 CLAUDE.md）**：新交互组件最小检查清单——鼠标动作必须有键盘路径（原生 button/input/label/details 优先）；可访问名禁止裸 emoji；永不隐藏焦点，弹层要焦点圈+Esc+还原；颜色一律走 CSS 变量；滚动渐入必须带 reduced-motion/打印强制可见覆盖；禁 `alert()` 用 `role=alert`；自定义容器消费方向键须标 `data-no-arrow-nav`。

### 6.2 打印（main.css 单一 `@media print` 块）

- 强制可见 `.concept-block,.phase-group`（否则未 reveal 的块打印为空白）。
- `pre` 反色（浅底深字、去阴影、`white-space: pre-wrap`）——当前深底浅字**印到白纸几乎不可读**。
- 隐藏 `.navbar/.page-toc/.home-sidebar/.nav-btn/.copy-btn/.back-link/.home-footer/.progress-dot::before`；`position:fixed/sticky` 改 `static`；表格重置 `display:table`。
- `@page { margin: 14mm }`。不需要专用打印页眉（现有 phase-header 够用）。

### 6.3 深色模式（变量收敛 + 双源覆盖 + 手动切换）

**变量收敛清单**（把散落 hex 全部收进 `:root`，组件零散值替换后深色自动生效）：
`--color-gradient-top/mid/bottom`（body 渐变）、`--color-code-bg/text`、`--color-codeblock-bg/border/text/strong/shadow`、`--color-copy-btn-*`、`--color-star`（两处 #f0b428 收敛）、`--color-on-accent/on-primary`（收敛各处 #fff）、`--color-primary-dark`（#c96a30）、`--color-viewer-bg`（GalleryView/AssetMap 白底）、`--overlay-bg`、`--shadow-pulse`。替换点含 [WorkshopPhase.vue](../src/views/workshop/WorkshopPhase.vue)、[GalleryView.vue](../src/views/workshop/GalleryView.vue)、[FlowChart.vue](../src/components/FlowChart.vue)、[SkillTree.vue](../src/components/workshop/SkillTree.vue)、[AssetMap.vue](../src/components/workshop/AssetMap.vue)、main.css、[phase-layout.css](../src/styles/phase-layout.css)。

**组织方式（双源）**：`:root { 浅色 }` → `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { 深色 } }` → `:root[data-theme="dark"] { 深色 }`（两条深色选择器写同一份值，紧邻注释标「两处同步」）；`:root` 与深色块设 `color-scheme: light/dark`。优先级：手动 > 系统 > 默认。初版深色色板已由评审给出（bg #1e1a16 / text #e8dcc8 / primary #e8975f 等，上线后抽查 text-muted 对比度过 WCAG AA）。

**手动切换**：`src/composables/useTheme.ts`（读 `localStorage['my-cocos-theme']` + `matchMedia`，设置 `documentElement.dataset.theme`；无存储值跟随系统，手动选择后停止跟随）+ main.ts 挂载前同步初始化（防 FOUC）+ NavBar 切换按钮（`aria-pressed` + `aria-label`）。index.html 补 `<meta name="color-scheme" content="light dark">`。

---

## 7. SEO 与内容分发 — 对应 §5

> 评审结论（APPROVED_WITH_CHANGES）：采用 **history 路由 + 构建期浏览器快照预渲染 + 404.html 回退 + sitemap**。关键依据：内容是纯构建期数据，预渲染 67+ 阶段页成本极低；且本仓库有**已证实的 SSR 不兼容点**（`workshopStore` 模块顶层读 localStorage、`/` 首页就 import 它），因此不能用 `renderToString`/完整 SSG，必须用真浏览器（puppeteer）快照。

### 7.1 改动清单

| 文件 | 改动 |
|------|------|
| [router/index.ts:8](../src/router/index.ts#L8) | `createWebHashHistory()` → `createWebHistory(import.meta.env.BASE_URL)`（BASE_URL 由 CI `--base` 注入） |
| [main.ts](../src/main.ts) | 挂载前读 `location.hash`，`#/` 开头则 `router.replace(hash.slice(1))`（老书签无损迁移）；`router.afterEach((to) => applyRouteMeta(to))` |
| 新建 `src/router/meta.ts` | `applyRouteMeta(to)`：集中定义 路由→title/description 规则（课程首页「{label} — 站点名」、阶段页「第 N 阶段 {title} · {courseLabel} — 站点名」），更新 `document.title`、`meta description`、og 标签、canonical |
| 新建 `src/router/seo-routes.ts` | `SEO_ROUTES: string[]` 由 COURSES + phaseCount + workshop 派生（sitemap 与预渲染共用，单一起源） |
| [types/phase.ts](../src/types/phase.ts) | `PhaseMdData` 加可选 `description?: string`；[vite.config.ts](../vite.config.ts) 的 phaseMdPlugin 透传（67 个旧文件无需改，新阶段可带） |
| [index.html](../index.html) | 补默认 meta（description、robots、og、twitter:card、canonical）+ WebSite JSON-LD |
| 新建 `public/robots.txt` | Allow: / + Sitemap 指向 |
| 新建 `scripts/prerender.mjs` | vite preview 起服务 → puppeteer 逐个 goto `base+route` → 等 #app 有子元素 → 强制 `.concept-block` 加 `.revealed`（绕开 opacity:0）→ 写 `dist/<route>/index.html` → `dist/404.html` = index.html → 生成 sitemap.xml |
| [deploy.yml](../.github/workflows/deploy.yml) | build 后加 `node scripts/prerender.mjs`，照旧 upload dist |

### 7.2 关键风险与对策

- **reveal-on-scroll 与快照**：`.concept-block` 默认 opacity:0，预渲染脚本必须在抓取前统一加 `.revealed`；并建议 main.ts 挂载前给 html 加 `js` 类、把隐藏规则改成 `.js .concept-block { opacity:0 }`（无 JS 抓取器也能看到正文）。
- **深链 404**：history 深层 URL 必须存在 `dist/404.html`（=SPA 壳）作回退。
- **base/SITE_URL 收敛成配置常量**：未来自定义域名（base 变 /）时重建 404 与 sitemap 绝对 URL。
- puppeteer 仅 devDependency、只在 CI 跑（本地 Windows 可用 puppeteer-core + 系统浏览器缓解安装体积）。

### 7.3 PixelCanvas 归宿

由 §8.1 决定——**复用为第一个交互演示**，不删除（其网格渲染核心正确且类型化）。同时删除 main.css:306-339 的 `.px-*` 死样式（palette 需要的几条以 scoped 移入 demo）。

---

## 8. 教学增强 — 对应 §6

### 8.1 交互演示管线（评审结论：路径 (b) 类型化 segments，APPROVED）

**为什么不能简单在 md 里放 Vue 组件**：md 经 markdown-it 转 HTML 用 v-html 渲染，无法挂载 Vue 组件——这正是 PixelCanvas 死代码的根因。方案：**构建期切分 + 运行时真实组件**。

- **作者语法**：md 里独立一行 `:::demo <id>`（可选 `k=v` props）。
- **构建期切分**：纯函数 `splitSegments(body, md)` 放 [src/utils/markdownSegments.ts](../src/utils/markdownSegments.ts)（fence-aware 状态机防代码块内字面量误切；未知 id 构建时 warn），vite.config.ts 的 phaseMdPlugin 调用，demo 段**不进** md.render。
- **数据模型**：`src/types/phase.ts` 新增 `ContentSegment = { type:'html'; html } | { type:'demo'; id: DemoId; props? }`，`BlockMdData.html` → `segments`（全仓仅 [PhasePage.vue:33](../src/components/PhasePage.vue#L33) 一处消费 `b.html`，改动收敛）；[vite-env.d.ts](../src/vite-env.d.ts) 的 `*.md` 声明改 re-export `@/types/phase`（消除双份来源）。
- **注册表**：`src/demos/ids.ts`（`demoIds` as const + `DemoId` 类型）+ `src/demos/index.ts`（`Record<DemoId, Component>`，值用 `defineAsyncComponent` 懒加载，独立 chunk）。
- **挂载器**：`src/demos/DemoHost.vue`——`onMounted` 置 `ready=true` 再渲染 `<component :is>`；ready 前渲染空（SSR/预渲染快照只含正文，demo 纯客户端）；未知 id 渲染空 + dev warn 不白屏。ConceptBlock.vue 零改动。
- **样式**：`src/demos/demo-shell.css`（`.demo-shell/.demo-caption` 用设计系统变量）；canvas 统一 `image-rendering: pixelated` + `crisp-edges` 兜底（Safari<16）。
- **测试**：`src/utils/__tests__/markdownSegments.test.ts`（切分、props 解析、fence 内字面量、空块、保序）。

**首批 6 个演示（成本从低到高）**：

| # | id | 位置 | 交互 | 成本 |
|---|----|------|------|------|
| 1 | `palette` | art/phase-03 | HSL 滑块实时派生 4 色调色板 + 16×16 画布上色 + 2色/4色 开关；**复用 PixelCanvas 核心（改 `PixelView.vue`）** | 半天 |
| 2 | `anchor-point` | cocos/phase-03 | 双 canvas：Y 轴朝上/朝下对比 + x/y 滑块；锚点可拖 + 旋转；父子链世界坐标 | 半天~1 天 |
| 3 | `easing-curves` | cocos/phase-08 | canvas 叠画 linear/easeOut/backOut/elastic 曲线 + 可拖进度小球（rAF，`onUnmounted` cancel） | 1 天 |
| 4 | `waveform` | audio/phase-02 | WebAudio 播放 440Hz 方波/锯齿波 + AnalyserNode 实时画波形 + 频率/振幅滑块（AudioContext 只在用户手势 create/resume） | 1 天 |
| 5 | `atlas-batching` | cocos/phase-06 | 独立贴图 vs 图集切片 + draw call 计数器对比 | 1~1.5 天 |
| 6 | `shader-compare` | cocos/phase-21 | 双画布原图 vs fragment shader（灰度/量化/RGB 交换）+ GLSL 源码展示；WebGL 不可用降级 Canvas2D filter | 1.5~2 天 |

**风险约束**：demo 一律**不用方向键**交互（App.vue 全局 ←/→ 导航会拦截）；WebAudio 必须用户手势启动；所有动画/音频循环 `onUnmounted` 清理（这正是选路径 (b) 的收益——Vue 自动触发生命周期）。

### 8.2 学习进度（评审：readingStore 与工坊 store 分离 + 共享持久层）

- **存储**：新建 `src/stores/readingStore.ts`（同层复制 workshopStore 模式：reactive 单例 + version + try/catch，key `__reading_state__`）。结构 `ReadingState = { courses: Record<courseId, CourseReading>, version: 1 }`，`CourseReading = { completed: number[], lastPhase, lastReadAt }`。API：`recordVisit/markCompleted/markIncomplete/toggleCompleted/isCompleted/getProgress/getNextPhase/getLastPosition/useReadingState`。
- **分还是合**：**分离**。阅读进度在路由/滚动时高频小写，practiceLog 单条 base64 图可达 500KB——合并会导致每次滚动都整体重序列化工坊状态。但抽共享 `src/stores/storage.ts` adapter（`loadState<T>/saveState` + backend 开关 + 迁移钩子），readingStore 立即接入，workshopStore 在 §1 重构时也切同一 adapter——IndexedDB 迁移变成一次 key 级替换。
- **完成判定（双通道）**：① 滚动到最后一个 `.concept-block` 的 IntersectionObserver 自动判定（rootMargin 底部留白 + `window.scrollY>0` 防短页误判）；② 页眉「标记完成」toggle 按钮（可撤销误判、可提前标记）。53 个阅读型阶段页高摩擦场景不适合纯手动。
- **UI**：阶段页进度条 dots 扩展 `.done` 态（实心 + ✓）；首页新增 `CourseProgressBar.vue`（读 readingStore，显示「已读 N/25」+「继续学习 第 X 阶段 →」）接入 4 个 Home.vue；NavBar 加「继续学习」按钮（读 `getLastPosition()`，无记录则隐藏）。
- **长期**：与 §1 的 version 迁移机制对齐，readingStore 预留 IndexedDB 迁移字段（`source`/`migratedAt`）。

### 8.3 全文搜索（评审：构建期索引 + bigram 倒排，不用 Fuse.js）

- **索引**：vite.config.ts 加 `searchIndexPlugin()`，buildStart 用 fs 扫 67 个 md + esbuild 加载 challenges.ts → 生成 `public/search-index.json`（gitignore，CI 重建）。dev 与 build 同一路径；fetch 用 `import.meta.env.BASE_URL` 拼接（适配 GH Pages 子路径）。
- **中文检索**：`src/utils/tokenize.ts`——ASCII 小写化 + 按非字母数字切分拉丁词（Cocos/AABB 精确命中）+ CJK 逐相邻字符 bigram（免分词器，不引 jieba）。查询同函数 tokenize 后查倒排表，score=Σidf + 标题/块标题子串加成，单字符回退子串扫描。**不用 Fuse.js**（对汉字召回/精度差且需全文入内存）。
- **覆盖**：67 阶段 + 34 挑战（title/prompt/constraints/selfCheck/skillReward/helpRefs 拼入 text，url=/workshop/phase/{id}）。目录扫描方案使将来新增课程/内容自动纳入。
- **UI**：`SearchBox.vue` + NavBar 入口；input debounce 150ms；结果按课程分组 + `<mark>` 高亮；Esc/↑↓/Enter；Ctrl+K 与 `/` 快捷键（守卫 input/textarea/select 焦点）；打开时 useScrollLock。
- **测试**：`tokenize` 补 vitest 单测。

### 8.4 学练闭环（课程 → 工坊反向链接）

在每个 art 阶段页末尾加「→ 去做工坊挑战 N」；数据放 frontmatter 或 courses 侧，与工坊 helpRefs 形成双向。优先级低于 8.1-8.3。

---

## 9. 实施顺序与工作量汇总

| 阶段 | 任务 | 涉及文件 | 工作量 |
|------|------|----------|--------|
| **A** | §1 存储重构（含迁移） | idb.ts + workshopStore + 3 个消费组件 + 类型 + 测试 | 1-1.5 天 |
| A | §4 CI 接测试 + PR 触发 + 新增 3 条一致性测试 | deploy.yml + tests | 0.5 天 |
| A | §3 一致性修正（34/courseHome/course 字段/魔数） | 6 个文件 | 0.5 天 |
| **B** | §5.1 Cocos 课程勘误（13 medium + LOW） | 13+ md | 0.5 天 |
| B | §5.4 工程课程勘误（5 medium + LOW） | 8+ md | 0.5 天 |
| B | §5.2/§5.3 美术/音频勘误 | 8+ md | 0.5 天 |
| **C** | §2 速通删除 + 归档 | 4 文档 + archive | 0.5 天 |
| C | §6 无障碍 + 打印 + 深色（**同一批**） | 12 文件 | 1 天 |
| C | §7 SEO（history + meta + 预渲染脚本 + CI） | router/meta/prerender/deploy | 1 天 |
| C | §8.1 演示管线 + palette demo（第一个） | 管线 5 文件 + 1 demo | 1 天 |
| C | §8.2 学习进度 + §8.3 搜索 | readingStore + 2 组件 + 索引 | 1-1.5 天 |
| C | §8.1 其余 5 个演示 | 5 demos | 4-6 天（按序落地） |

**提交策略**：每阶段独立 commit；A/B 无相互依赖可并行分支；C 按「速通删除 → 无障碍 → SEO → 演示/进度/搜索」顺序串行合入（各可独立验证）。

**回归保障**：每阶段完成跑 `npm run build && npm test && npm run lint`；§1 迁移单测、§5 勘误后跑 consistency.test（防误删内容文件）、§2 删除后 grep 复核。
