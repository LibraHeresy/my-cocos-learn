---
phase: 16
title: TypeScript 游戏模式
duration: 1-2 天
---

## 🧭 本节定位

TypeScript 在游戏开发中不仅帮你避免运行时错误——它本身就是**设计文档**。好的类型定义比任何注释都清楚。作为前端工程师，TS 是你的主场——但游戏开发中 TS 有独特的姿势。

## 📖 你的代码里写了 42 次 'small'——哪一次拼错了？

你打开飞机大战的代码库——搜索 `'small'`。42 个结果。有写 `enemy.type === 'small'` 的，有写 `if (enemyType === 'small')` 的，还有写了 `case 'samll':` 的（手滑了）。最后那个是一个真实的 Bug——拼写错误 'samll'，TypeScript 替它推导了 string 类型，没有报错。运行时——敌机类型判断永远不匹配，这个敌机不会被正确的计分函数处理。

你花了 1 小时才找到这个 Bug——因为在 42 个 `'small'` 字符串里发现一个 `'samll'` 就像在 42 张白纸上找一张写了错字的纸。人的眼睛不擅长发现"几乎一样但不完全一样"的东西——而 TypeScript 编译器擅长。

如果你在 types.ts 里定义了 `type EnemyType = 'small' | 'medium' | 'large' | 'boss'`——然后你写了 `if (type === 'samll')`——TypeScript 会立刻报错：`This comparison appears to be unintentional because the types 'EnemyType' and '"samll"' have no overlap.` Bug 在编译阶段就被消灭了。

**类型不是"约束你的代码"——是"替你的眼睛做检查"。** 就像你用了 ESLint 之后不再需要手动数缩进空格——TS 让你不再需要手动检查"这个值是不是有效值"。

## 🔢 模式一 & 二：枚举类型与字面量联合

**1. 枚举（enum）或字面量联合类型——不要用 string 做状态标识。**

<pre>// 不推荐
const state = 'playing' // string 类型——任何 string 都能赋值,"palying" 不报错

// 推荐
type GamePhase = 'menu' | 'playing' | 'paused' | 'gameOver'
let phase: GamePhase = 'menu' // 写 'palying' 会编译报错

// 也可以
enum GamePhase { Menu, Playing, Paused, GameOver }</pre>

字面量联合类型更轻量（不产生 JS 代码），enum 在运行时能反向查找（GamePhase[0] → 'Menu'）。选哪个看场景——需要"数字和字符串互相转换"就用 enum，否则用联合类型。

**2. Discriminated Union——EventBus 的类型安全终极方案。** 这是游戏开发中 TS 最强大的模式。你的 EventBus 可能有 20 种事件类型——每一种有不同的 payload。

<pre>type GameEvent =
  | { type: 'enemy-killed'; enemyType: EnemyType; score: number }
  | { type: 'powerup-collected'; powerupType: PowerUpType; duration: number }
  | { type: 'phase-changed'; newPhase: GamePhase; oldPhase: GamePhase }
  | { type: 'player-died'; finalScore: number; wave: number }

// EventBus.on 的类型安全版本
function on&lt;K extends GameEvent['type']&gt;(
  type: K,
  cb: (event: Extract&lt;GameEvent, { type: K }&gt;) =&gt; void
)

// 使用时——完美推导各个事件类型的 payload
eventBus.on('enemy-killed', (event) =&gt; {
  // event.enemyType 类型是 EnemyType，event.score 类型是 number
  // 编译器保证你不会读到不存在的字段
})</pre>

这和 Redux / Vuex 中 action type + payload 的 discriminated union 是完全相同的模式——TypeScript 帮你确保你 emit 的每个事件都有正确的 payload 类型，on 的每个回调都能安全地访问对应事件的字段。

## 🧩 模式三 & 四：泛型 Manager 与只读配置

**3. 泛型 Manager——复用不是复制粘贴。** ObjectPool&lt;T&gt;、Singleton&lt;T&gt;、EventBus&lt;T&gt;——这些类本身不关心 T 是什么，但加了 T 后实例化时 TS 知道具体的类型。

<pre>class ObjectPool&lt;T extends Poolable&gt; {
  get(): T { /* 从池中取或新建 */ }
  put(obj: T): void { /* 放回池中 */ }
}
const bulletPool = new ObjectPool&lt;Bullet&gt;()
// bulletPool.get() 返回类型是 Bullet——不是 any</pre>

这和前端中的 `const store = defineStore<MyState>()` 是同一个 TS 模式——泛型让代码"写一次就能复用各种类型"。你不会想为 Bullet、Enemy、Particle 各写一个 Pool 类——写一个泛型 ObjectPool，然后用的时候指定 T。

**4. 只读配置表（as const）——让你的数值表"不可变"。**

<pre>const ENEMY_CONFIG = {
  small:  { hp: 50,  speed: 200, score: 10,  color: '#ff4444' },
  medium: { hp: 150, speed: 150, score: 25,  color: '#ff8844' },
  large:  { hp: 400, speed: 100, score: 50,  color: '#cc44cc' },
  boss:   { hp: 1000, speed: 60, score: 500, color: '#ff0000' }
} as const // ← 整个对象树变为 readonly

// TS 推导 ENEMY_CONFIG.small.hp 类型为 50（字面量类型），不是 number
// 这会严格约束——你的伤害计算如果用到了 hp，TS 知道它一定是 50</pre>

`as const` 让你的配置表变成一个"不可变的类型常量"——你不能不小心修改它，TS 知道每个值的精确字面量类型。这和前端的"constants 文件 + readonly"是同一做法——但 as const 走得更远（类型级别的不可变）。

## 🔧 动手：重构飞机大战的类型系统

1. **定义核心类型文件 `src/types.ts`：** 把所有散落在各组件中的字符串字面量集中到一个文件：
   <pre>export type EnemyType = 'small' | 'medium' | 'large' | 'boss'
export type PowerUpType = 'bomb' | 'shield' | 'extraLife' | 'doubleScore'
export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameOver'
export type BulletOwner = 'player' | 'enemy'</pre>
   然后用 VS Code 的"找到所有引用"功能（右键→Go to References），逐个替换项目中所有裸 string 为这些类型。
2. **创建 discriminanted union 的 GameEvent：** 定义完整的 GameEvent 类型（见上文）。然后修改 EventBus 的 emit 和 on 方法签名——使用 `Extract` 做类型收窄。编译——如果 EventBus.on('enemy-killed', cb) 的 cb 里写了 `event.playerDied`（不存在的字段），TS 编译报错。修复所有报错——这些报错每一个都代表一个"如果运行时才发现会很痛的 Bug"。
3. **替换 string 为类型：** 搜索项目中所有的 `=== 'small'`、`=== 'boss'` 等字符串判断——全部替换为对 EnemyType 的判断。你会发现在一些地方你写了拼写错误的字符串（比如 'samll'）——TS 编译立刻报错。把错误修掉。完成后——你的代码中没有未定义的字面量状态了。
4. **享福：** 编译通过后的代码库——如果有人把配置里表示波次的字段 `wave` 拼成 `wav`、把 `'large'` 拼成 `'lagre'`、在 EventBus.on 回调里访问了不存在的事件字段——**TS 编译器全部拦截。你的项目从现在开始"如果编译通过，不会有低级错误"。**

## 🔗 课外延伸

- **Rust 的 Bevy ECS——TypeScript 类型体操在游戏领域的极致投射：** Bevy 是一个用 Rust 写的 ECS（Entity Component System）游戏引擎。它的核心是**类型驱动**——Component 是纯数据类型，Query 是用类型表达式筛选 Entity。例如：`Query<(&mut Transform, &Health, &Enemy)>` 意思是"查找所有同时有 Transform（可写）、Health 和 Enemy 组件的实体"。TS 的泛型约束和 discriminated union 在游戏开发中的深层思想源头就是 ECS 的类型系统——"用类型描述数据关系，编译器保证你不会操作不该操作的数据"。虽然你的飞机大战不需要 ECS（Cocos 的节点-组件架构更简单直观），但理解 ECS 的类型哲学能让你更深层地理解"为什么游戏开发中类型比注释重要"。
- **Discriminated union 在 Redux / Vuex 中的对应——设计模式是跨语言的：** Redux action 的 type 字段（{ type: 'ADD_TODO', payload: { text: string } }）和 Vuex mutation 的 type 字段（{ type: 'increment', amount: number }）都是 discriminated union 模式的应用。区别是：Redux/Vuex 用 string + any payload（类型检查靠开发者自觉和单元测试），而 TS 的 discriminated union 把检查从"运行时"移到了"编译时"。这是 TypeScript 在游戏开发中最大的优势——游戏比 Web 应用更复杂（状态更多、事件更多、模块更多），但"编译时检查"的能力不变。
- **Zod / io-ts —— 当编译时类型不够，用运行时校验补充：** 如果你的游戏从服务器加载关卡配置 JSON——TS 的类型在编译时知道 JSON 的结构，但运行时加载的 JSON 可能是坏数据。Zod 做的是：`WaveConfig.parse(jsonData)`——如果 JSON 结构不符合你定义的类型，立刻抛出带详细错误信息的异常。这是"编译时类型 + 运行时校验"的双重保护。这和前端通过 Zod/io-ts 验证 API response 是一个目的——**信任但验证（Trust but Verify）。**

## ✅ 自测清单

1. TypeScript 在游戏开发中最核心的四种模式（enum/联合类型、discriminated union、泛型 Manager、as const）各解决什么问题？在你的飞机大战中各对应什么？
2. 为什么 discriminated union 是 EventBus 类型安全的最佳方案？如果不使用它，EventBus 会有什么类型风险？
3. 写一个你飞机大战中可能用到但还没写的泛型类——比如 ObjectPool&lt;T&gt;——并思考 T 需要满足什么约束条件？
