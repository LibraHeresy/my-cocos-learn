# 站点优化方案（多代理验证版）

> 生成日期：2026-07-31
> 生成方式：全站代码通读 + 21 个独立子代理交叉验证。6 组 P0 发现全部对抗性验证（CONFIRMED），67 篇阶段内容逐篇审阅，另做 3 组专项扫描（魔数/重复、前端体验与无障碍、CI 与测试）。
> 结论可信度：所有条目均带「文件:行号」证据；标 ⚠️ 的为「事实性断言需二次核实」项。
> 本文只给方案，不包含代码修改。

---

## 0. 执行摘要

| 模块 | 结果 |
|------|------|
| 验证阶段（6 组发现） | **6/6 CONFIRMED**，其中 2 条附带额外新发现 |
| 内容审阅（67 篇全部通读） | 0 个 high 级技术错误；~54 个 medium/low/info 问题 |
| 专项扫描（3 组） | 8 个 high、约 20 个 medium、若干 low/info |

**内容质量结论**：67 篇阶段内容的 Cocos 3.8 API 用法、叙事结构（定位→原理→动手→延伸→自测）整体非常扎实，没有系统性硬伤。问题集中在**个别示例代码与文字叙述自相矛盾、少数史实/公式不准确、跨课程阶段引用未标注来源**——修复成本低、收益高（都是读者照着做会卡住的地方）。

**建议最先做的 5 件事**（按「成本/风险」排序）：

1. **工坊图片存储迁移**（[localStorage 配额 + base64 静默丢弃 bug](#11-工坊图片存储隐患--localstorage-配额与-silent-数据丢失)）——真实存在会「悄悄丢用户练习记录」的隐患，且含一个可复现的独立 bug。
2. **CI 接上测试**（[deploy.yml 从不运行 npm test](#31-最严重的工程隐患-ci-从不运行测试)）——唯一能防「删了阶段 md 仍发布成功」的防线从未执行过。
3. **文档漂移清理**（[speedrun 已被删但三份文档仍在宣传](#12-文档漂移-30-天速通被删三份文档仍宣称存在)）——README/CLAUDE.md/docs 与代码对不上，误导协作者与 AI。
4. **内容勘误 25 处「照抄会失败」级别的问题**（见 [第 2 章](#2-p1-内容勘误--照抄会卡住与自相矛盾的表述)）——phase-19 物理、phase-17 转场单例、audio/phase-09 `playOneShot` 等。
5. **SEO 基建**（[hash 路由塌缩 + 无 meta](#5-p4-seo-与内容分发)）——这个站的流量本该来自搜索引擎，目前 67 页全塌缩成一个 URL。

---

## 1. P0 · 一致性与数据安全

### 1.1 工坊图片存储隐患：localStorage 配额 + silent 数据丢失

- **证据**：[workshopStore.ts:6](src/stores/workshopStore.ts#L6) `MAX_IMAGE_SIZE = 500 * 1024`；[workshopStore.ts:34-40](src/stores/workshopStore.ts#L34-L40) `saveState` 的 `catch {}` 静默吞错；[workshopStore.ts:98-100](src/stores/workshopStore.ts#L98-L100) 超限时把 `imageDataUrl` 置为 `undefined`。
- **影响**：所有练习记录 + 连击 + 技能进度存成**单个** localStorage blob。34 关 × 最多 500KB 的 base64 ≈ 17MB，远超 5MB 配额（约 3.5 倍）。配额满时保存失败被静默吞掉，UI 仍显示「✓ 已保存」，**重载后全部进度回退到上次成功保存点**——用户感知为练习记录悄悄丢失。
- **额外独立 bug（验证代理发现）**：base64 膨胀约 33%。文件原始大小在 375–500KB 区间的图能通过上传校验并预览，但 `addPractice` 里 `dataURL.length > 512000` 会被静默裁剪——**单次合法上传就会丢图**，与配额无关。
- **建议**：
  1. 上传时用 canvas 缩放到合理尺寸并重编码（WebP/PNG），从源头压缩体积；
  2. 跟踪当前 blob 总大小，接近配额时主动提示用户；
  3. `saveState` 失败时给用户可见的错误提示，而不是空 `catch`；
  4. 长期可考虑把图片载荷与状态 blob 分离（IndexedDB）。
- **工作量**：中（约 1 个 session）。

### 1.2 文档漂移：30 天速通被删，三份文档仍宣称存在

- **证据**：代码侧已完全清理——[router/index.ts:10-33](src/router/index.ts#L10-L33) 无任何 `/speedrun` 路由，`src/views/` 下无 `speedrun/` 目录，`courses.ts` 无 speedrun 条目。但文档侧仍残留：
  - [README.md:3](README.md#L3)「+ 30 天速通计划」、[README.md:28](README.md#L28) 路由表 `/speedrun`、[README.md:39](README.md#L39) 目录树 `views/.../speedrun/`；
  - [CLAUDE.md:24](CLAUDE.md#L24) 声称 `/` 渲染 `views/speedrun/Landing.vue`（**双重过期**：实际 `/` 已指向 `views/workshop/WorkshopHome.vue`）、[CLAUDE.md:30-31](CLAUDE.md#L30-L31) `/speedrun/day/1~30`；
  - [docs/plan.md:532](plan.md#L532)「30 天速通映射」全表 + [plan.md:578](plan.md#L578)、[plan.md:585](plan.md#L585)。
- **影响**：协作者与 AI 按文档找路由会得到 404；「30 天速通」若已放弃，应删干净。
- **建议**：二选一。
  - **方案 A（推荐）**：把 30 天速通做回来——`docs/plan.md` 已有完整的 D1–D30 映射表（[plan.md:534-565](plan.md#L534-L565)），一个 `DayN.vue` + 一张映射数据即可，成本约 1 个 session，且对「30 天通关」场景价值很高。
  - **方案 B**：同步清理 README / CLAUDE.md / plan.md 中的 speedrun 相关内容，并把 CLAUDE.md 的 `/` 路由描述改正为 WorkshopHome。
- **工作量**：A 中 / B 小。
- **✅ 解决记录（2026-07-31）**：采纳方案 B，30 天速通已彻底删除。代码侧本已清理；本次清理了 README / CLAUDE.md / docs/plan.md 的全部引用，并把 D1–D30 映射表归档到 [docs/archive/30-day-speedrun-mapping.md](archive/30-day-speedrun-mapping.md)（已停用留档）。

### 1.3 `PracticeEntry.course` 从未写入，画廊课程筛选是死代码

- **证据**：[WorkshopPhase.vue:126-133](src/views/workshop/WorkshopPhase.vue#L126-L133) `handleSave` 构造 entry 无 `course` 字段；[GalleryView.vue:13-21](src/views/workshop/GalleryView.vue#L13-L21) 用 `entry.course` 算 `uniqueCourses`（恒为空）；[GalleryView.vue:80](src/views/workshop/GalleryView.vue#L80) `v-if="uniqueCourses.length > 1"` 恒假 → **筛选栏永不显示**；[GalleryView.vue:112](src/views/workshop/GalleryView.vue#L112) 课程图标永远落到默认「⚙️」。
- **额外发现（验证代理）**：即使补上 course，34 关挑战的 helpRefs 全部指向 art 课程，`uniqueCourses` 也只有一个值，筛选栏仍不显示。**当前设计下整条「课程筛选」链路都是死的**。
- **建议**：
  - 短期：删掉 `filterCourse`/`uniqueCourses`/筛选栏，画廊课程图标改为按 `phase` 或固定「🎨」（工坊本身就是美术练习）；
  - 长期：若想让工坊承接多课程练习（Cocos 代码挑战、音频混音挑战），再把 `course` 写入并让挑战数据分散到多课程。
- **工作量**：小。

### 1.4 挑战总数 34 硬编码三处

- **证据**：[workshopStore.ts:164](src/stores/workshopStore.ts#L164) `totalChallenges: 34`；[WorkshopHome.vue:18](src/views/workshop/WorkshopHome.vue#L18) `for (let i = 1; i <= 34; i++)`；[WorkshopPhase.vue:159](src/views/workshop/WorkshopPhase.vue#L159) `关 {{ challengeId }}/34`。单一数据源是 [challenges.ts:24](src/data/challenges.ts#L24) `CHALLENGES`（当前长度恰为 34，且 id 连续 1..34）。
- **建议**：导出 `CHALLENGES.length`（或 `Math.max(...ids)`）统一引用。注意 `skill-tree.ts` 里 `requiredChallenges: [34]` 是**语义引用**（指向具体关卡），不需要改。
- **工作量**：极小。

### 1.5 `courseHome` 单一来源字段是死字段，「cocos 首页即根路径」被复制 3 份

- **证据**：[courses.ts:9](src/data/courses.ts#L9)、[courses.ts:20/29/38/47](src/data/courses.ts#L20) 定义了 `courseHome`，全项目 0 处读取（`grep .courseHome` 无命中）；[PhaseLayout.vue:25](src/components/PhaseLayout.vue#L25) 用三元重算；[App.vue:36/46](src/App.vue#L36) 键盘导航内联同一特例；[App.vue:12](src/App.vue#L12) 还把 `name === 'home'` 硬编码为 cocos。两个文件都已 import COURSES，改用时零成本。
- **建议**：`PhaseLayout` 与 `App.vue` 改读 `COURSES[course].courseHome`；`App.vue` 里「home 路由 = cocos」的判断也数据化（可给 cocos 加 `courseHomeName` 或在检测函数里表达）。
- **工作量**：极小。

### 1.6 67 篇内容全部静态打进路由 chunk

- **证据**：[PhasePage.vue:9-12](src/components/PhasePage.vue#L9-L12) `import.meta.glob('../content/**/*.md', { eager: true })`。验证代理的精确判断：路由本身是懒加载，但所有 phase 路由**共用** PhasePage 这一个 chunk，所以首次进入任意 `/xx/phase/N` 就会拉下全部 67 篇 md。
- **影响**：首屏/首次进阶段页下载量偏大；对纯静态学习站可接受，但按需加载是更优解。
- **建议**：改成非 eager + `load()` 缓存，或至少测量一次构建产物确认体量。若站点走 SSG（见 [5.1](#51-最严重-seo-问题-hash-路由让全部页面塌缩成一个-url)），此问题自然消解。
- **工作量**：中。

### 1.7 工坊状态无数据迁移路径

- **证据**：[workshopStore.ts:22-32](src/stores/workshopStore.ts#L22-L32)：`parsed.version !== 1` 或 version 缺失时整体重置。验证代理指出：**没有 version 字段的旧数据也会被重置**，进一步证明无迁移路径。
- **建议**：按 version 号写迁移函数（`1 → 2`），为将来扩展字段（如 1.3 的 course）预留通道。
- **工作量**：小。

---

## 2. P1 · 内容勘误（照抄会卡住 / 自相矛盾的表述）

> 分类口径：**MEDIUM = 读者照抄/照做会失败或学到错误知识**；LOW = 史实/术语/数字瑕疵；INFO = 可优化措辞。全部来自逐篇通读，仅收录审阅者有把握的条目。

### 2.1 Cocos 课程（13 个 medium 级）

| 文件 | 问题 | 建议 |
|------|------|------|
| [phase-03.md:20](src/content/cocos/phase-03.md#L20) | 坐标原点描述错误：「原点…在设定的设计分辨率的中点偏下」。Cocos 2D 场景原点 (0,0) 是 **Canvas 可视区域中心**（(0,0) 节点在屏幕正中）。 | 改为「可视区域中心」 |
| [phase-08.md:76](src/content/cocos/phase-08.md#L76) | `backOut` 公式写错：`1+(v-1)²*(2.7v-1.7)` 在 v=0 得 -0.7（标准 easeOutBack 应输出 0）。标准式是 `c3*(v-1)³ + c1*(v-1)² + 1`（c1=1.70158, c3=2.70158）。 | 替换公式 |
| [phase-12.md:80](src/content/cocos/phase-12.md#L80) | `BossEnemy` 继承 `Enemy`（基类 `hp=1`），只声明 `maxHp=50`，`ratio = hp/maxHp = 0.02`——第一次受伤就跳过二阶段直接进三阶段判定；`super.takeDamage` 在 hp≤0 时直接回收 Boss。照抄代码阶段切换逻辑不成立。 | 子类覆盖 `hp`，或文中说明依赖检查器设置 |
| [phase-14.md:78](src/content/cocos/phase-14.md#L78) | `rollDrop` 的 boss 加权只作用于 `rarity === 'rare'` 条目，但 `DROP_TABLE` 里没有 rare 条目 → 注释与验证步骤「击杀 Boss 稀有度提高」永远不生效。 | 让 modifier 作用到全部条目，或表里加 rare 项 |
| [phase-17.md:66](src/content/cocos/phase-17.md#L66) | 动手代码 `TransitionManager.instance.fadeOut(...)` 引用 `instance`，但上文类定义没有静态 `instance`/单例初始化，也没 `director.addPersistRootNode`。照抄直接 TS 报错，转场节点也会被 loadScene 销毁。 | 补单例初始化 + `addPersistRootNode` |
| [phase-18.md:43](src/content/cocos/phase-18.md#L43) | 「ETC2 只能在 Android 用、ASTC 只能在较新 iOS 用」不准确：ETC2 是 GLES 3.0 强制格式（iOS A7+ 也支持），ASTC 自 2016 年大量 Android GPU（Mali/Adreno）也原生支持。自测题 3 前提错误。 | 改为「Android 常选 ETC2/ASTC，iOS 传统 PVRTC、新机型 ASTC」 |
| [phase-19.md:39](src/content/cocos/phase-19.md#L39) | 把 Restitution/Friction 归到 RigidBody2D 下。3.8 中弹性/摩擦在 **Collider2D / PhysicsMaterial2D**，RigidBody2D 上没有。按步骤做会找不到属性。 | 改属性归属 |
| [phase-19.md:49](src/content/cocos/phase-19.md#L49) | Box2D 积分器是 **semi-implicit Euler**（半隐式欧拉），不是 Verlet；「Verlet 位置守恒所以堆叠好」的因果是编造的。 | 改表述 |
| [phase-19.md:55](src/content/cocos/phase-19.md#L55) | Box2D 宽相（broadphase）是**动态 AABB 树（b2DynamicTree / BVH）**，不是按 X 轴排序的 SAP。 | 改算法名 |
| [phase-19.md:61](src/content/cocos/phase-19.md#L61) | 「Godot 的 2D 物理全部基于 Box2D」不准确（Godot 用自己的 GodotPhysics2D）；Box2D 开源协议是 **zlib** 不是 MIT。 | 两处修正 |
| [phase-23.md:12](src/content/cocos/phase-23.md#L12) | 「Cocos Web 渲染核心是 C++ 经 Emscripten 编译成 wasm」不准确：Creator 3.x 引擎是 TypeScript 写的，Web 构建输出是 JS，没有 wasm 渲染核心。 | 改写为事实描述 |
| [phase-23.md](src/content/cocos/phase-23.md) | **缺「动手」板块**（全篇 25 篇中仅 23/24 缺）。 | 补一个可执行部署任务 |
| [phase-24.md](src/content/cocos/phase-24.md) | **缺「动手」板块**。 | 补一个可执行任务 |

### 2.2 Cocos 课程（LOW/INFO，节选）

- [phase-01.md:20](src/content/cocos/phase-01.md#L20)：标「雅达利 2600 汇编」的示例用了 `$D000` 地址（这是 C64 VIC-II 的寄存器段；2600 的 6507 地址上限 `$1FFF`）。→ 换 2600 真实地址或改标签为「示意代码」。
- [phase-02.md:36](src/content/cocos/phase-02.md#L36)：「钻石继承问题」术语误用（描述的是单继承只能选一个父类的局限）。
- [phase-09.md:35](src/content/cocos/phase-09.md#L35)：`Input.getKeyDown()` 不存在；正确 API 是 `input.isKeyDown()` / `input.isKeyPressed()`（同文件动手部分已用对）。
- [phase-10.md:37](src/content/cocos/phase-10.md#L37)：同节两组碰撞分组位值自相矛盾（BULLET=1/ENEMY=2/PLAYER=4 vs PLAYER=1/BULLET=2/POWERUP=4）。
- [phase-12.md:92](src/content/cocos/phase-12.md#L92)：「Boss 的搜索你先把血量调成 10」句子不通（疑为「调试」笔误）。
- [phase-13.md:51](src/content/cocos/phase-13.md#L51)：示例 WAVES 编号 1→2→5 缺 3/4，且 `wave` 字段从未被读取。
- [phase-14.md:62](src/content/cocos/phase-14.md#L62)：EXTRA_LIFE 注释「不立即生效」与代码立即 `lives += 1` 矛盾（展示的其实是即时生效）。
- [phase-14.md:73](src/content/cocos/phase-14.md#L73)：裸 `@property type: PowerUpType` 在检查器显示为数字输入而非枚举下拉，建议 `@property(PowerUpType)`。
- [phase-16.md:33](src/content/cocos/phase-16.md#L33)：⚠️「LOL 血条移到屏幕底部使新手死亡降 30%」疑似虚构史实（LOL 血条一直在角色头顶）——整节结论成立，但建议去掉该「测试数据」引述或改为虚构示例标注。
- [phase-20.md:48](src/content/cocos/phase-20.md#L48)：烟雾「Gravity Y 设为 30」括号里写「负重力让它上升」，正负矛盾。
- [phase-20.md:52](src/content/cocos/phase-20.md#L52)：《几何战争》年份矛盾（2007 vs 2003）；实际 Retro Evolved 2005 年发售。
- [phase-20.md:60](src/content/cocos/phase-20.md#L60)：下雨 Angle 70~110「向下」与自己定义的「90=上」矛盾。
- [phase-22.md:48](src/content/cocos/phase-22.md#L48)：Spine 组件名混用旧名 SkeletonAnimation（2.x）与 3.x 的 `sp.Skeleton`，应统一为后者。
- [phase-07.md:66](src/content/cocos/phase-07.md#L66)（INFO）：自测第 3 题引用 Tween（Phase 8 才讲）——前置引用，标注「预告题」。

### 2.3 美术课程（medium 级）

| 文件 | 问题 | 建议 |
|------|------|------|
| [art/phase-12.md:37](src/content/art/phase-12.md#L37) | 血条「把**填充层的父节点**锚点设为 (0,0.5)」错误：Scale 围绕**节点自身**锚点，应把填充层自身锚点设 (0,0.5) 才会从左向右缩。 | 改锚点归属 |
| [art/phase-09.md:44](src/content/art/phase-09.md#L44) | idle 动画说明前后矛盾：帧定义（中/上/中/下）+ 循环「1→2→3→4→1」不会「往上跳」，却先说要 7 帧来回摆、又只新建 4 帧，最后才说 1-2-3-4-1 也行。 | 重写为自洽的 4 帧循环说明 |

**LOW/INFO 节选**：
- [art/phase-01.md:33](src/content/art/phase-01.md#L33)：⚠️「马里奥头部 16×16、眼睛 8×8」——初代马里奥整个 sprite 才是 16×16。
- [art/phase-01.md:53](src/content/art/phase-01.md#L53)（INFO）：「14 个阶段后回来看」字面指向第 15 阶段，建议改「学完这 14 个阶段后」。
- [art/phase-03.md:38](src/content/art/phase-03.md#L38)：⚠️ 用「长波长折射率不同→红色更近」解释暖色前冲，是流传广但科学性存疑的伪科学解释。
- [art/phase-04.md:25](src/content/art/phase-04.md#L25)：用 (0,0)→(10,10) 45° 斜线演示「锯齿」不成立——45° 恰是像素网格上唯一无锯齿的对角线。
- [art/phase-04.md:44](src/content/art/phase-04.md#L44)：⚠️「Retina 像素密度够高，直接不做抗锯齿」不准确（Retina 仍做灰度 AA，只是不用 LCD 亚像素渲染）。
- [art/phase-06.md:28](src/content/art/phase-06.md#L28)：把 `image-rendering: pixelated` 说成「阻止自动抖动」——它阻止的是放大插值平滑，与抖动是两种算法。
- [art/phase-10.md:34](src/content/art/phase-10.md#L34)：受击「用 3 帧」却列出 4 个状态（白/正常/白/正常）。
- [art/phase-10.md:60](src/content/art/phase-10.md#L60) 与 [art/phase-13.md:26](src/content/art/phase-13.md#L26)：「Phase 20/21」实指 Cocos 课程，美术课只有 14 阶段——应标注「Cocos 课程 Phase N」。
- [art/phase-14.md:29](src/content/art/phase-14.md#L29)：清单各表行相加约 9.25h，正文却写「总计约 6-8 小时」。
- [art/phase-14.md:44](src/content/art/phase-14.md#L44)（INFO）：⚠️「中文命名 → Cocos Bundle 路径报编码错误」过于绝对（3.x 整体支持中文名）。

### 2.4 音频课程（medium 级）

| 文件 | 问题 | 建议 |
|------|------|------|
| [audio/phase-07.md:26](src/content/audio/phase-07.md#L26) | 《VVVVVV》原声带作曲者是 **Magnus Pålsson（SoulEye）**，不是 Terry Cavanagh。文中的「Terry 自己写的编辑器做的原声带」失实。 | 改为「用 Bosca Ceoil 写的」，不绑定 Terry 作曲 |
| [audio/phase-09.md:52](src/content/audio/phase-09.md#L52) | `AudioSource.playOneShot(clip, volumeScale)` 是**实例方法**，不是静态方法，也不会「自动创建临时 AudioSource、播放、销毁」——写成静态会让读者写出编译不过的代码。 | 改 API 描述 |

**LOW/INFO 节选**：
- [audio/phase-01.md:61](src/content/audio/phase-01.md#L61)：⚠️「马里奥 BGM 节奏随关卡推进加速」——SMB 地上主题是恒定 BPM 循环，不成立。
- [audio/phase-02.md:40](src/content/audio/phase-02.md#L40)（INFO）：「-6dB = 一半响度」不精确（-6dB 是振幅减半，感知响度减半约 -10dB）。
- [audio/phase-05.md:44](src/content/audio/phase-05.md#L44)：BFXR 波形下拉没有「Square + Noise 混合」选项（SFXR/BFXR 均为单选波形）。
- [audio/phase-06.md:48](src/content/audio/phase-06.md#L48)：「Export as OGG」是 Audacity 2.x 旧菜单（3.4+ 为 File → Export Audio → Format 选 Ogg Vorbis）；内部 Normalize 菜单位置两处不一致。
- [audio/phase-06.md:58](src/content/audio/phase-06.md#L58)：硬截断产生的「啪」声是 **click/pop（直流跳变）**，不是 clipping。
- [audio/phase-10.md:52](src/content/audio/phase-10.md#L52)：「Phase 15 的对象池」在 audio 课内不存在（只有 12 阶段）——应显式指向目标课程。
- [audio/phase-12.md:52](src/content/audio/phase-12.md#L52)：⚠️「MP3 首尾插入几百毫秒静音」量级偏大（实际通常几十毫秒，LAME 可 gapless）。

### 2.5 工程课程（medium 级）

| 文件 | 问题 | 建议 |
|------|------|------|
| [engineering/phase-06.md:47](src/content/engineering/phase-06.md#L47) | 数学矛盾：文字说攻击 +50% → TTK 缩 33%（对），举例却「小型敌机 1.5s → 0.75s」（这是 -50%，对应 +100% 伤害）。正确示例值约 1.0s。 | 改示例数字 |
| [engineering/phase-07.md:54](src/content/engineering/phase-07.md#L54) | 经济数字三处矛盾：Lv1→Lv2 价格 3000 vs 反推 1000 vs 消耗端 100；「10 局升满约 10000」但前四级已 12000。 | 统一为一张自洽的数字表 |
| [engineering/phase-12.md:36](src/content/engineering/phase-12.md#L36) | 概念段写 Unity API `Time.timeScale = 0.1`——Cocos 没有 Time 模块，正确是 `director.getScheduler().setTimeScale(0.1)`（且只影响 Scheduler 定时器，不影响组件 update/粒子/tween）。 | 改 API + 修正「影响所有节点」的说法 |
| [engineering/phase-13.md:25](src/content/engineering/phase-13.md#L25) | GitHub Actions 额度前后矛盾且事实有误：公开仓库免费**无限分钟**；2000 分钟/月是私有仓库 free 额度。文内两处口径不一。 | 统一修正 |
| [engineering/phase-15.md:36](src/content/engineering/phase-15.md#L36) | `wx.getSystemInfoSync().system` 返回 OS 名称+版本，不是系统语言；语言字段是 `.language`。且同文件两处自相矛盾。 | 改字段 |

**LOW/INFO 节选**：
- [engineering/phase-02.md:30](src/content/engineering/phase-02.md#L30)：`wx.createInnerAudioContext` 不是小游戏专属（小程序也可用）；`wx.createCanvas` 才是。
- [engineering/phase-02.md:52](src/content/engineering/phase-02.md#L52)（INFO）：⚠️「广告（流量主）抽 30%」与「内购（虚拟支付）抽 30%」疑似混谈两条政策，需核实。
- [engineering/phase-08.md:47](src/content/engineering/phase-08.md#L47)：⚠️ 精确无来源数字「难度门槛每降 1 步，转化率提升 20%」「Bug 暴露率降 80%」——建议标注为经验估计。
- [engineering/phase-08.md:57](src/content/engineering/phase-08.md#L57)：D1 留存基准跨文件矛盾（phase-08 说 30%=优秀/及格线 25%，phase-09 说 30%=及格）。
- [engineering/phase-08.md:71](src/content/engineering/phase-08.md#L71)：`Math.random()*200+100` 生成 100-299，正文写「100-300」（差 1）。
- [engineering/phase-09.md:34](src/content/engineering/phase-09.md#L34)：「ARPU × DAU × 30 = 月收入」口径混乘（ARPU 是总量口径、DAU 是日活跃），会系统性高估；严谨为 月收入 ≈ ARPU(月) × MAU。
- [engineering/phase-11.md:24](src/content/engineering/phase-11.md#L24)：Boss 计分 500 vs phase-07 经济系统 Boss 200（小/中/大两处一致，仅 Boss 不同）。
- [engineering/phase-12.md:53](src/content/engineering/phase-12.md#L53)：「和第 6 节的 CSS cubic-bezier 手感调试一样」悬空引用（工程第 6 节无 easing 内容；easing 在 cocos phase-08）。
- [engineering/phase-13.md:61](src/content/engineering/phase-13.md#L61)：「缓存 node_modules」配 `npm ci` 基本不命中（npm ci 先删后装）；应缓存 `~/.npm`。
- [engineering/phase-13.md:69](src/content/engineering/phase-13.md#L69)：Jobs 列举出现两个「③」。
- [engineering/phase-14.md:26](src/content/engineering/phase-14.md#L26)：「onLoad 不要 on、start 再 on」作为铁律无依据——3.x 节点自身事件会随节点销毁自动释放，官方惯例是 onLoad 注册 + onDestroy 移除。对 Vue 迁移读者有误导。
- [engineering/phase-16.md:30](src/content/engineering/phase-16.md#L30)：上下文是重构「飞机大战」Cocos 项目，却引用本站 Vue 组件 `Phase2.vue`，叙事不一致。

---

## 3. P2 · 工程与 CI

### 3.1 最严重的工程隐患：CI 从不运行测试

- **证据**：[deploy.yml:30-32](.github/workflows/deploy.yml#L30-L32) 只做 `npm install` + `npm run build` + deploy，**没有任何 `npm test` / `npm run lint` 步骤**。仓库里唯一能防「删了阶段 md 但仍发布成功」的检查是 [consistency.test.ts:7-14](src/router/__tests__/consistency.test.ts#L7-L14)，它从未在 CI 执行。
- **影响**：删除任意 `phase-NN.md` 或把 `phaseCount` 改大时，build 照样成功、站点照常发布，用户访问得到空白页（[PhasePage.vue:16-26](src/components/PhasePage.vue#L16-L26) 对缺失数据静默渲染空）。
- **建议**：deploy 前加 `npm test`（失败即停止）；并新增 PR 触发（见 3.2）。
- **工作量**：极小。

### 3.2 工作流无 pull_request 触发器

- **证据**：[deploy.yml:3-5](.github/workflows/deploy.yml#L3-L5) 仅 `on: push: branches: [main]`。
- **影响**：PR 不跑任何检查，质量问题全部推迟到 main 发布后才暴露。
- **建议**：加 `pull_request` 触发（只跑 test/lint，不部署）。
- **工作量**：极小。

### 3.3 测试覆盖缺口：frontmatter 与 helpRefs 无自动化

- **证据**：现有测试（consistency / routes / slug）不校验：① 每篇 md 的 frontmatter 必填字段——[vite.config.ts:30-33](vite.config.ts#L30-L33) 对缺失字段有 `?? 0 / ?? ''` 静默兜底，坏 frontmatter 也能通过 build；② [challenges.ts:9](src/data/challenges.ts#L9) 的 helpRefs 合法性（目前全部指向 art 1-14，恰好合法，但无自动保障）。
- **建议**：加两条测试：frontmatter 完整性（读 67 个 md 断言 phase/title/duration 非空且 phase 与文件名一致）；helpRefs 的 course∈COURSES 且 phase ∈ 1..phaseCount。
- **工作量**：小。

### 3.4 重复/魔数清理（sweep0 汇总）

| 位置 | 问题 | 建议 |
|------|------|------|
| [NavBar.vue:19-22](src/components/NavBar.vue#L19-L22) | `startsWith('engineering'/'cocos'/...)` 手写第二份课程 id 清单（`courses` 数组本身已来自 COURSE_LIST，两处不一致）。已有 `detectCourseFromRoute()` 可复用。 | 用数据驱动 |
| [PageTOC.vue:31-47](src/components/PageTOC.vue#L31-L47) 与 [HomeSidebar.vue:30-50](src/components/HomeSidebar.vue#L30-L50) | 几乎相同的 IntersectionObserver 滚动高亮逻辑（相同 rootMargin、相同 scrollSeq 守卫）。 | 抽 `useScrollSpy(selector)` |
| [App.vue:16](src/App.vue#L16) 与 [PhasePage.vue:19](src/components/PhasePage.vue#L19) | 各自内联 `/-phase(\d+)$/` 解析阶段号，与 courses.ts 的集中正则易漂移。 | 在 courses.ts 加 `parsePhaseFromRoute()` |
| [routes.test.ts:13-14](src/router/__tests__/routes.test.ts#L13-L14) | 字面量断言 67（已由 COURSES 推导，属冗余副本）。 | 仅动态计算 |
| 四个 Home.vue 末尾 phase id | cocos:25 / art:14 / audio:12 / engineering:16 与 phaseCount 隐性耦合，无测试守护。 | 加一条「phaseGroups 最大 id == COURSES.phaseCount」测试 |
| [HomeSidebar.vue:7-9](src/components/HomeSidebar.vue#L7-L9) | `course` prop 声明但从未使用（死配置）。 | 删除或实现 |

---

## 4. P3 · 体验与无障碍

> 本站在 `max-width: 1200px` 下隐藏 TOC/侧边栏后，移动端没有目录导航；以下按严重度列出。

### 4.1 无障碍（high 级 2 项，medium 级 6 项）

- **上传区完全不可操作（HIGH）**：[WorkshopPhase.vue:247-267](src/views/workshop/WorkshopPhase.vue#L247-L267) 上传区是 `div`（`@click` 触发隐藏 `input`），input `display:none`，无 `role`/`tabindex`/键盘事件 → 键盘用户与读屏用户无法上传。建议改用 `<label for>` 包裹或 `role="button" + tabindex + Enter/Space`。
- **图片查看器无 dialog 语义（HIGH）**：[GalleryView.vue:143-151](src/views/workshop/GalleryView.vue#L143-L151) Teleport 覆盖层无 `role="dialog"`/`aria-modal`/焦点陷阱/Escape 关闭/body 滚动锁；触发元素是 `div`，键盘无法打开；关闭按钮「✕」无 aria-label。
- **复制按钮聚焦不可见（MEDIUM）**：[main.css:169-191](src/styles/main.css#L169-L191) `.copy-btn` 默认 `opacity:0`，仅 `pre:hover` 显示，无 `:focus-within`。补 `pre:focus-within .copy-btn { opacity:1 }` + aria-label。
- **星级评分无 aria（MEDIUM）**：[WorkshopPhase.vue:274-280](src/views/workshop/WorkshopPhase.vue#L274-L280) 纯 ★/☆ 字形，无 `role="radiogroup"`/`aria-checked`。画廊展示同样问题（[GalleryView.vue:117-119](src/views/workshop/GalleryView.vue#L117-L119)）。
- **自检按钮三态不可感知（MEDIUM）**：[WorkshopPhase.vue:213-217](src/views/workshop/WorkshopPhase.vue#L213-L217) ✓/✗/— 文本无 `aria-pressed`。
- **进度条无 progressbar 语义（MEDIUM）**：[PhaseLayout.vue:37-44](src/components/PhaseLayout.vue#L37-L44) 只有 `aria-label="学习进度"`，无 `role="progressbar"`/`aria-valuenow/max`。
- **全局方向键会误触跳页（MEDIUM）**：[App.vue:20-50](src/App.vue#L20-L50) 只排除了 INPUT/TEXTAREA/SELECT；焦点在任意 button（复制/评分/筛选/自检）上按 ←/→ 也会翻页。应同时忽略 BUTTON/A/contenteditable 与带修饰键的按键。
- **NavBar 地标未命名（LOW）**：[NavBar.vue:28](src/components/NavBar.vue#L28) 多 nav 地标中 navbar 无 aria-label → 加「主导航」。

### 4.2 打印与主题

- **无打印样式（HIGH）**：三个共享 CSS + 全部 scoped 样式均无 `@media print`。代码块 `pre` 是深底浅字（[main.css:139-161](src/styles/main.css#L139-L161)），浏览器默认不打印背景 → **浅色代码印到白纸上几乎不可见**。教学站打印需求高，建议加 print 规则（pre 转浅底深字、隐藏装饰）。
- **fixed 侧栏打印会覆盖正文（MEDIUM）**：[PageTOC.vue:100-118](src/components/PageTOC.vue#L100-L118)、[HomeSidebar.vue:92-112](src/components/HomeSidebar.vue#L92-L112) 仅靠 `max-width:1200px` 隐藏是巧合（A4 打印宽度约 794px），宽纸/横版会叠加。加显式 `@media print { display:none }`。
- **不支持深色模式（MEDIUM）**：`prefers-color-scheme` 无任何处理；且多处硬编码颜色绕过变量（body 渐变 [main.css:49-59](src/styles/main.css#L49-L59)、code 底色、星级金色 #f0b428 等）。加深色需先收敛硬编码。
- **无 prefers-reduced-motion（LOW）**：平滑滚动与渐入动画均不考虑用户偏好（[main.css:44-47](src/styles/main.css#L44-L47)）。

### 4.3 浏览器兼容

- [NavBar.vue:55](src/components/NavBar.vue#L55) `backdrop-filter` 缺 `-webkit-` 前缀（旧 Safari 失效，仅外观退化）。
- 多处 `image-rendering: pixelated` 缺 `crisp-edges` 前缀兜底（Safari<16 会看到模糊的抗锯齿图）——对像素画主题站尤其值得补（[PixelCanvas.vue:58](src/components/PixelCanvas.vue#L58)、[GalleryView.vue:272](src/views/workshop/GalleryView.vue#L272)、[AssetMap.vue:121](src/components/workshop/AssetMap.vue#L121)）。
- `scrollend` 事件兼容性一般，但 [useScrollLock.ts:13-15](src/composables/useScrollLock.ts#L13-L15) 有 1s 超时兜底，风险低。
- `scrollBehavior: 'instant'` 属新规范值，老浏览器回退 auto，行为一致，风险低。

---

## 5. P4 · SEO 与内容分发

### 5.1 最严重 SEO 问题：hash 路由让全部页面塌缩成一个 URL

- **证据**：[router/index.ts:8](src/router/index.ts#L8) `createWebHashHistory()`——搜索引擎通常把 `#` 后视为同一文档，67 个阶段页塌缩成一个 URL；且 [index.html:7](index.html#L7) 全站共用单一 `<title>`，无路由级标题更新；初始 HTML 只有 `<div id="app">`，无 JS 的爬虫看到空白页，无预渲染/sitemap。
- **影响**：这站点的目标读者就是搜「Cocos 坐标系」「像素画抖动」等长尾词的人群，目前内容对搜索完全不可见。
- **建议**（按投入递增）：
  1. 最低成本：`router.afterEach` 设置 `document.title`（阶段名 + 课程名），让浏览器标签页可区分；
  2. 中成本：`createWebHistory` + 静态托管 rewrite，或加 sitemap + 关键页 meta description；
  3. 推荐：**预渲染/SSG**。内容全静态，是 `vite-plugin-prerender` / 静态生成的理想对象；做了 SSG 后 1.6（eager glob 打包）也一并消解。
- **工作量**：中（SSG）~ 小（meta）。

### 5.2 index.html 缺 SEO meta

- **证据**：[index.html:1-13](index.html#L1-L13) 只有 charset/viewport/favicon/title，无 `meta description`、OG/Twitter card、canonical、theme-color、JSON-LD。
- **建议**：补 description + OG 基础标签；SSG 时按路由注入。

### 5.3 PixelCanvas 是死代码

- **证据**：[PixelCanvas.vue](src/components/PixelCanvas.vue) 全仓库无任何 `.vue/.ts` 引用（md 由 markdown-it 转换，无法挂载 Vue 组件）；配套样式 [main.css:306-339](src/styles/main.css#L306-L339)（.px-desc/.px-hex/.px-compare 等）同样无元素使用。
- **建议**：与 [6.1](#61-视觉化演示-pixelcanvas-的归宿) 合并决策——要么在美术阶段页真正接上它（把 md 内容里的像素示例变成可渲染的 canvas），要么删除组件与死样式。
- **工作量**：接回 = 中；删除 = 小。

---

## 6. 教学价值增强（功能级建议）

> 第 2 章修的是「错的」，本章是「缺的」。以下不涉及 bug，纯增量价值。

### 6.1 视觉化演示（PixelCanvas 的归宿）

67 篇内容几乎全靠 `<pre>`/`<table>` 承载，很多概念天然视觉化却无图。按投入性价比排序：

1. **Cocos 3 坐标系/锚点**：canvas 画 Y 轴朝上与浏览器 Y 轴朝下对比、锚点移动时变换原点变化——这是整站最容易踩坑、也最适合可视化的概念（与 2.1 的坐标勘误配套）。
2. **Cocos 8 缓动函数**：`linear/easeOut/backOut/elastic` 曲线 + 可拖时间轴的小球（与 2.1 的 backOut 公式勘误配套）。
3. **Audio 2 波形**：内嵌 WebAudio 按钮，播放 440Hz 方波 vs 锯齿波——听感教学远胜文字。
4. **Art 3 色彩**：用 PixelCanvas 展示 4 色调色板。
5. **Cocos 6 图集/合批、Cocos 21 Shader**：before/after 对比图。

### 6.2 学练闭环（课程 → 工坊的反向链接）

- 现状：工坊 → 课程有 helpRefs；课程 → 工坊没有。67 个阶段与 34 关挑战是两张平行的网。
- 建议：在每个 art 阶段页末尾加「→ 去做工坊挑战 N」（数据可放在 frontmatter 或 courses 侧），把「课程=参考手册、工坊=练习场」的定位真正闭环。

### 6.3 学习进度（除美术工坊外均无记录）

- 现状：进度系统（连击/技能树/画廊）只服务美术；Cocos/音频/工程 53 个阶段没有任何「学到哪」记忆。
- 建议：localStorage 记录已读阶段；阶段页进度条把「当前」dots 扩展为「已完成」dots；首页显示「继续学习：第 N 阶段」。与工坊共用一套存储心智。

### 6.4 站内全文搜索

- 67 阶段 + 34 关挑战已具备搜索价值。建议加基于 frontmatter/正文的轻量全文搜索（Fuse.js 或静态倒排索引）。

### 6.5 30 天速通（与 1.2 关联）

- 若采纳 1.2 方案 A，`docs/plan.md` 已有完整 D1–D30 映射表可直接落地。速通页是这类学习站的差异化功能。
- **✅ 已决定（2026-07-31）**：不再推进。速通功能彻底删除，映射表已归档到 [docs/archive/30-day-speedrun-mapping.md](archive/30-day-speedrun-mapping.md)。若未来恢复，以该归档 + git 历史为准。

---

## 7. 建议实施顺序

### 阶段 A：安全与一致性（半天）
1. 1.1 工坊图片存储迁移（含 base64 静默丢弃修复）
2. 3.1 CI 接上 `npm test` + 3.2 PR 触发
3. 1.4 硬编码 34 → `CHALLENGES.length`
4. 1.5 `courseHome` 单一来源
5. 3.3 补 frontmatter / helpRefs 一致性测试（跑一遍立刻能验证 67 篇完整性）
6. 1.2 文档漂移：先做清理（方案 B），速通功能（方案 A）排后

### 阶段 B：内容勘误（1-2 天，按课程分 4 个 diff）
1. Cocos 课程 13 个 medium（第 2.1 表）——尤其 phase-19 物理三连、phase-17 转场单例、phase-12 BossEnemy
2. 工程课程 5 个 medium（第 2.5 表）——尤其 phase-07 经济数字、phase-12 Unity API
3. 美术 / 音频课程 medium（第 2.3 / 2.4 表）
4. LOW/INFO 批量修订（照第 2 章清单逐条过）

### 阶段 C：体验与 SEO（1-2 天）
1. 4.1 无障碍 8 项（按 high→medium）
2. 4.2 打印样式 + 4.3 兼容前缀
3. 5.1/5.2 SEO（先 `afterEach` 标题 + meta，再评估 SSG）
4. 6.x 教学增强（按 6.1 的性价比顺序）

---

## 附录 A · 验证结论明细（6/6 CONFIRMED）

| findingId | 结论 | 关键证据 |
|-----------|------|----------|
| speedrun-doc-code-drift | CONFIRMED | 代码侧无 /speedrun 路由、无 views/speedrun；README:3/28/39、CLAUDE.md:24/30/31、plan.md:532/534-565 仍宣传 |
| courseHome-single-source | CONFIRMED | `.courseHome` 0 处读取；PhaseLayout.vue:25 与 App.vue:36/46 各手写一次特例 |
| practice-entry-course-never-written | CONFIRMED | WorkshopPhase 不写 course；GalleryView uniqueCourses 恒空、筛选栏恒隐藏；且即使补上也只有一个课程值 |
| hardcode-34-eager-glob-version-reset | CONFIRMED | 34×3 硬编码；eager glob 全量打包（首次进阶段页即拉全部 67 篇）；version≠1 整体重置无迁移 |
| localStorage-quota | CONFIRMED（MEDIUM-HIGH） | 单 blob 17MB 超 5MB 配额 3.5×；saveState 静默吞错；另有 base64 膨胀导致的 375-500KB 区间静默丢图独立 bug |
| scroll/toc-hide/alert/seo | CONFIRMED | scrollend+1s 滚轮锁真实存在；TOC/侧边栏 1200px 下隐藏且无移动端替代；3 处原生 alert；index.html 无 meta/OG + hash SPA |

## 附录 B · 内容审阅统计

- 12 个内容审阅代理覆盖全部 67 篇（cocos 25 / art 14 / audio 12 / engineering 16）+ 1 个 helpRefs 数据校验代理。
- **0 个 high 级技术错误**；medium 25 个（约），low/info 约 30 个。
- helpRefs 数据校验：**无不一致**——34 条挑战的 helpRefs 全部落在合法课程+阶段范围内；SKILL_LINES 的 skillId 与 requiredChallenges 全部合法；asset-map 的 phase 全部在 1..14；courses.ts phaseCount 与实际 md 文件数一致。
- 结构一致性：仅 cocos phase-23 / phase-24 缺「动手」板块；其余 65 篇板块齐全。

## 附录 C · 扫描统计（3 组，8 high）

- **sweep0（魔数/重复）**：HIGH×3（34 硬编码、courseHome 死字段、NavBar startsWith 重复清单）；MEDIUM×1（observer 重复）；LOW×3；INFO×1。
- **sweep1（前端/无障碍/SEO）**：HIGH×3（上传区键盘不可操作、图片查看器无 dialog、无打印样式）；MEDIUM×8（复制按钮聚焦、评分/自检/进度条 aria、方向键误触、fixed 栏打印、深色模式、SEO meta、hash 塌缩、PixelCanvas 死代码）；LOW×5；INFO×2。
- **sweep2（CI/测试）**：HIGH×1（CI 不跑测试）；MEDIUM×2（无 PR 触发、测试覆盖缺口）；INFO×4。
