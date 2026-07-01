---
phase: 14
title: 完整资源管线
duration: 2 天
---

## 🧭 本节定位

一个人做游戏，最可怕的不是不会画——是画到一半突然停住，**"我好像忘了什么……但不知道忘了什么"**。资源管线（Asset Pipeline）就是你的地图——告诉你从哪里开始，到哪里结束，每一站在哪，还差多少。本节走一遍完整的"设计→制作→导出→导入→测试"流程。

## 🗺️ 没有管线，你就是闭着眼睛画画

试想这个场景：你花了 3 天画了一堆像素画——玩家飞机、敌机、背景、UI 元素——散落在十几个 .aseprite 文件里。你打开 Cocos，开始导入。然后你发现：

- 玩家飞机的 idle 动画做了，但 attack 动画只画了 2 帧——不完整。
- 中型敌机的受击闪烁做了，小型敌机忘记了——不一致。
- 背景画了远景和中景，近景层忘画了——不完整。
- 导出的 PNG 尺寸混乱——有的是 32×32，有的被你不小心缩成了 64×64——导入 Cocos 后大小全乱。
- 所有文件都用中文命名——Cocos Bundle 加载路径报编码错误。

这些不是"你不够努力"——是你**缺少一个系统来追踪"做了什么、还差什么、什么标准"**。这就是管线。管线的核心不是"多了不起的工具"，而是**可复用的工作流**。如果你关了电脑三天后再打开——管线让你知道"上次做到哪了、接下来做什么"。

这和你做前端项目的 `README.md` + `package.json scripts` + Git 分支管理是一个道理——不是为了"专业"，是为了**你未来的自己能接手你现在的代码**。一个人开发也需要协作——和你 3 天前的自己协作。

### 管线的六个环节

一个完整的游戏美术资源管线由六个环节组成——每个环节都有明确的产出物：

1. **设计（Design）：** 产出 = 资源清单。列清楚"我需要什么"——玩家飞机 × 4 套动画、敌机 × 3 种 × 2 套、背景 × 3 层……每个项目标注优先级（必须/可选）和预估工时。
2. **制作（Production）：** 产出 = .aseprite 源文件。在 Aseprite 中按清单逐项制作。关键原则：**每完成一项就标记完成**——不要"全画完再统一标记"。进度可视化本身就是动力。
3. **导出（Export）：** 产出 = PNG / SpriteSheet。每个资源的导出规格必须一致（Filter Mode = Point、保持原始像素尺寸、合理切片）。
4. **导入（Import）：** 产出 = Cocos 中的可用资源。把 PNG 放入 `assets/textures/`，在 Inspector 中做切片和配置。
5. **测试（Test）：** 产出 = "能跑"的动画。在 Cocos 场景中挂载 Animation Clip 播放——确认帧序正确、帧率合适、循环/非循环逻辑对。
6. **迭代（Iterate）：** 产出 = 更好的资产。根据测试结果回改设计或制作——比如"攻击动画的帧率太快了"改回 Aseprite 调。

这六个环节不是"做完一个再下一个"的瀑布——它们是循环的。你在测试阶段发现爆炸动画太慢了——回到 Aseprite 调帧率 → 重新导出 → 重新导入 → 重新测试。循环一次比一次快，因为你建立了工作流的肌肉记忆。

## 📋 资源清单：你的游戏美术"待办事项"

你不需要 Trello 或 Notion（当然用它们也可以），一张基本的资源清单表格就够了。下面是飞机大战的完整参考清单——你可以直接用它：

<table>
<thead><tr><th>分类</th><th>资源名称</th><th>规格</th><th>帧数</th><th>预估时间</th><th>状态</th></tr></thead>
<tbody>
  <tr><td>玩家</td><td>player_idle</td><td>32×32</td><td>4 帧循环</td><td>30min</td><td>⬜ 待做</td></tr>
  <tr><td>玩家</td><td>player_attack</td><td>32×32</td><td>4 帧一次性</td><td>30min</td><td>⬜ 待做</td></tr>
  <tr><td>玩家</td><td>player_hurt</td><td>32×32</td><td>2 帧闪烁</td><td>10min</td><td>⬜ 待做</td></tr>
  <tr><td>玩家</td><td>player_death</td><td>32×32</td><td>4-6 帧爆炸</td><td>40min</td><td>⬜ 待做</td></tr>
  <tr><td>敌机 A</td><td>enemy_small_idle</td><td>16×16</td><td>2 帧循环</td><td>15min</td><td>⬜ 待做</td></tr>
  <tr><td>敌机 A</td><td>enemy_small_death</td><td>16×16</td><td>3 帧爆炸</td><td>20min</td><td>⬜ 待做</td></tr>
  <tr><td>敌机 B</td><td>enemy_medium_idle</td><td>24×24</td><td>2 帧循环</td><td>20min</td><td>⬜ 待做</td></tr>
  <tr><td>敌机 B</td><td>enemy_medium_death</td><td>24×24</td><td>4 帧爆炸</td><td>25min</td><td>⬜ 待做</td></tr>
  <tr><td>Boss</td><td>boss_idle</td><td>48×48</td><td>4 帧循环</td><td>60min</td><td>⬜ 待做</td></tr>
  <tr><td>Boss</td><td>boss_death</td><td>48×48</td><td>6 帧多阶段</td><td>90min</td><td>⬜ 待做</td></tr>
  <tr><td>UI</td><td>hud_heart_full/empty</td><td>16×16</td><td>单帧</td><td>15min</td><td>⬜ 待做</td></tr>
  <tr><td>UI</td><td>hud_numbers_0-9</td><td>80×8</td><td>10 帧 SpriteSheet</td><td>20min</td><td>⬜ 待做</td></tr>
  <tr><td>UI</td><td>hud_boss_bar</td><td>32×8</td><td>单帧×2(BG+Fill)</td><td>15min</td><td>⬜ 待做</td></tr>
  <tr><td>背景</td><td>bg_far</td><td>256×256</td><td>平铺</td><td>30min</td><td>⬜ 待做</td></tr>
  <tr><td>背景</td><td>bg_mid</td><td>256×256</td><td>平铺</td><td>30min</td><td>⬜ 待做</td></tr>
  <tr><td>背景</td><td>bg_near</td><td>256×256</td><td>平铺</td><td>30min</td><td>⬜ 待做</td></tr>
  <tr><td>特效</td><td>explosion_generic</td><td>32×32</td><td>6 帧一次性</td><td>30min</td><td>⬜ 待做</td></tr>
  <tr><td>特效</td><td>engine_flame</td><td>16×8</td><td>4 帧循环</td><td>15min</td><td>⬜ 待做</td></tr>
  <tr><td>道具</td><td>powerup_shield/boost/weapon</td><td>16×16 各</td><td>单帧×3</td><td>20min</td><td>⬜ 待做</td></tr>
  <tr><td>粒子</td><td>particle_ref</td><td>32×32</td><td>参考图</td><td>10min</td><td>⬜ 待做</td></tr>
</tbody>
</table>

**总计预估约 6-8 小时（一个人全职一天的工作量）**。你会发现在实际制作中——有些项目比你预估的快（idle 动画 15 分钟就画好了），有些比你预估的慢（Boss 死亡动画花了 2 小时）。这是正常的——管线存在的意义就是**帮你记录"实际 vs 预估"的偏差，让你下一次规划时更准确**。

### 命名规范——一个人的团队也需要

不要用中文命名文件（Cocos 的 Bundle 加载可能出编码问题）。用英文小写+下划线：

<pre>player_idle.aseprite      → player_idle.png      (源文件 + 导出)
enemy_small_01.aseprite    → enemy_small_01.png
boss_01.aseprite           → boss_01.png
ui_heart_full.png          (UI 元素，不需要 .aseprite 如果不需要动画)
bg_far.png                 (背景层)
explosion.aseprite         → explosion.png          (特效)</pre>

**.aseprite 源文件和 .png 导出文件都要纳入 Git 管理**。.aseprite 是你的"源代码"——未来需要修改时你改的是它而不是重画。.png 是"编译产物"——Cocos 加载的是它。这和 `.vue` 源文件 + `dist/` 构建产物的关系完全一样。

## 🔧 动手：走完一遍完整管线并记录时间

选一个完整的资源——建议选"玩家飞机 idle 动画"——从头到尾走完六个环节。这不是练习这是**建立你的个人美术效率基线**。

1. **设计（2 分钟）：** 在清单中把"player_idle"标记为 "🔄 进行中"。写下预估：30 分钟。
2. **制作（按需投入）：** 打开 Aseprite → 打开你的玩家飞机 .aseprite（或用 Phase 7 剪影继续）→ 新建 4 帧 → 做 idle 上下浮动动画（参考 Phase 9 动手环节）→ 保存为 `project/source_art/player/player_idle.aseprite`。记录实际用时——比如你花了 22 分钟。
3. **导出（2 分钟）：** File → Export Sprite Sheet → 设置 Sheet Type = By Columns, Columns = 4, Rows = 1 → 导出为 `assets/textures/player/player_idle.png`。确认：PNG 尺寸 = 128×32（4 帧 × 32px 宽 = 128px）。如果导出后发现尺寸是 128×33——说明某帧比其他的高 1px，回 Aseprite 修。
4. **导入 Cocos（3 分钟）：** 在 Cocos 资源管理器中找到 `player_idle.png`。Inspector 中：Filter Mode = **Point（必须）**，Type = Sprite Frame → 点击 Edit → Sprite Editor → Grid by Count (4 columns × 1 row) → Apply。你现在有了 4 个 SpriteFrame：`player_idle_0` 到 `player_idle_3`。
5. **测试（5 分钟）：** 创建 Animation Clip（右键 assets → Create → Animation Clip）。打开 Animation Editor，把 4 个 SpriteFrame 拖入时间轴。设置每帧采样率：12fps 约等于每帧 0.083s——建议设 Sample = 12。WrapMode = Loop。把 Animation 挂到场景中的玩家 Sprite 节点。运行场景——飞机应该在待机浮动。如果节奏不对（太快/太慢）——调 Animation Clip 的 Speed 参数。
6. **记录基线（2 分钟）：** 在清单中把"player_idle"标记为 "✅ 已完成"。记录实际用时（比如 32 分钟 vs 预估 30 分钟——偏差 2 分钟，很准）。把 .aseprite 源文件 git add + commit。

**走完这一次，你手中就有了一条可复用的管线。**接下来画每一个新资源时——你在清单中找到它 → 标记进行中 → 制作 → 导出 → 导入 → 测试 → 标记完成 → Git commit。你不再需要"思考下一步该干什么"——管线替你想好了。你的大脑被解放出来专注于"画好这一帧"，而不是"我接下来要干嘛"。

## 🔗 课外延伸

- **专业游戏美术团队的工具链：** 在大团队中，美术管线比你一个人的复杂得多——但核心结构是一样的。典型的 AAA 团队工具链：**Figma**（UI 布局设计 → 导出像素规格文档）→ **Aseprite/Photoshop**（美术资产制作）→ **Perforce**（版本管理，因为 Git 对大二进制文件不如 Perforce 高效）→ **引擎导入工具**（自动检测新资源并触发导入流程）→ **CI/CD**（自动构建并生成测试包）。你一个人不需要 Perforce 和 CI，但你需要理解这个链条的结构——因为**你培养的是"可协作的工作习惯"**。将来加入团队时，你不会问"版本管理怎么弄？命名规范是啥？"——你已经有一套自己的基线。
- **一个人也要有"可协作的工作习惯"——写给独立开发者：** 很多人觉得"我一个人开发，不需要规范"。错了——你需要，而且更需要。因为没有队友帮你记住"上次那个文件放在哪"。一个月前的你和一个小时前的你是两个不同的人——一份好的命名规范、一个清晰的目录结构、一个及时更新的资源清单——就是你和"一个月前的自己"之间的协作协议。这就是为什么 .aseprite 要进 Git、命名要用英文、导出要放在固定目录——**你给你的"未来自己"留的每一条线索，将来都会在你不记得的时候救你**。
- **从估算到真实——花时间记录花时间的价值：** 很多独立游戏失败的原因不是"做得不好"——是"时间估错了"。你预估美术需要 2 周——实际花了 2 个月。管线的"记录实际用时"功能——看似多余——实际上是你最重要的项目管理工具。每一次你记录"预估 30 分钟 / 实际 45 分钟"，你就在积累对自己工作速度的精确认知。积累 10 个资源的时间数据后，你对"我的飞机大战全部美术资源需要多久"的判断——就从"拍脑袋"变成了"有数据支撑的估算"。这不是美术技能——这是**生产者的管理技能**。

## ✅ 自测清单

1. 游戏美术资源管线包含哪六个环节？每个环节的产出是什么？如果缺少"测试"环节直接跳到下一个资源——可能会埋下什么隐患？
2. 为什么美术资产的源文件（.aseprite）也应该纳入 Git 管理——即使你是一个人开发？这和前端项目的 `src/` 目录要进 Git 而 `dist/` 不进有什么关系？
3. 命名规范（英文+下划线+序号）看起来是小事情——但"不规范的命名"在什么情况下会导致严重问题？（提示：想想 Cocos Bundle 加载路径、多平台文件名兼容性、以及"三个月后你忘记了文件含义"的场景）
4. 【实操题】打开你的飞机大战项目文件夹，如果 3 个月后的你第一次看到这个文件夹——他能找到源文件吗？能知道哪些资源已经完成、哪些还在做吗？如果不能——你需要改变什么？
