---
phase: 25
title: 像素飞机大战实战
duration: 4-6 天
---

## 🧭 本节定位

你学完了 24 个阶段。你知道引擎怎么跑、碰撞怎么算、粒子怎么飞、Shader 怎么写。现在把这些零件装成一辆能开的车——**从零开始，一个完整可玩的像素飞机大战。**你会在这一节里发现：那些"学的时候觉得很懂"的东西，放在一起会撞出你没想过的问题。而且这些问题在单独学时不会出现——只会在"把系统拼起来"的时候出现。这就是这一节的价值：**不是学新知识，是把知识变成肌肉记忆。**

## 🏗️ 项目架构：为什么这么设计？

飞机大战看起来简单——玩家飞机在底部、敌机从上面飞下来、子弹往上打——但一旦开始写代码，你至少需要管理这些东西：玩家输入、子弹生成和回收、敌机生成和移动、碰撞检测和响应、波次推进、分数计算、UI 更新、音效播放、场景切换、暂停与恢复。

如果所有逻辑都写在 GameScene 的一个脚本里，你大概会拥有一个 2000 行的 update() 方法——然后每次加功能都像是在拆炸弹。这就是为什么我们需要**架构**——它不帮你写代码，但它帮你不把代码写成一团乱麻。

<pre>pixel-plane-battle/
├── assets/
│   ├── scenes/
│   │   ├── Boot.scene          —— 资源预加载 + 引擎初始化
│   │   ├── MainMenu.scene      —— 开始按钮 + 设置
│   │   ├── Game.scene           —— 核心游戏场景
│   │   └── GameOver.scene       —— 结算 + 重新开始
│   ├── scripts/
│   │   ├── manager/             —— 单例管理器（场景级别生命周期）
│   │   │   ├── GameManager.ts   —— 游戏状态机 + 分数 + 全局协调
│   │   │   ├── WaveManager.ts   —— 波次配置 + 敌机生成序列
│   │   │   ├── AudioManager.ts  —— SFX + BGM 播放控制
│   │   │   └── UIManager.ts     —— 血量/分数/波次公告/暂停面板
│   │   ├── player/
│   │   │   ├── PlayerController.ts  —— 键盘/触摸输入 → 飞机移动+射击
│   │   │   └── Bullet.ts            —— 子弹行为（碰撞回调）
│   │   ├── enemy/
│   │   │   ├── Enemy.ts             —— 敌机移动+受击
│   │   │   └── EnemySpawner.ts      —— 从 WaveManager 拿数据生成敌机
│   │   ├── ui/
│   │   │   ├── ScoreUI.ts       —— 显示分数（监听 score-changed 事件）
│   │   │   ├── HealthBar.ts     —— 显示血量（监听 health-changed 事件）
│   │   │   ├── WaveAnnouncer.ts —— "Wave 3!" 大字提示
│   │   │   └── PausePanel.ts    —— 暂停面板逻辑
│   │   ├── powerup/
│   │   │   ├── PowerUp.ts       —— 道具行为
│   │   │   └── PowerUpSpawner.ts—— 道具掉落逻辑
│   │   └── util/
│   │       ├── EventBus.ts      —— 全局事件总线（mitt 模式）
│   │       ├── ObjectPool.ts    —— 通用对象池（缓存子弹/敌机/粒子）
│   │       └── GameFSM.ts       —— 游戏状态机（Ready→Playing→Paused→GameOver）
│   ├── textures/                —— 精灵图集（Auto Atlas 合批）
│   └── audio/                   —— SFX + BGM
└── settings/</pre>

如果你熟悉 Vue 的架构模式，这份目录结构应该让你感到亲切：

<table>
<thead><tr><th>Cocos 模式</th><th>Vue 类比</th><th>为什么这么对应</th></tr></thead>
<tbody>
<tr><td>Manager 单例（GameManager / AudioManager）</td><td><strong>Pinia store</strong></td><td>全局状态和跨组件通信的中心——"谁需要分数就找 GameManager" = "谁需要用户信息就找 userStore"</td></tr>
<tr><td>EventBus（事件总线）</td><td><strong>mitt / provide-inject</strong></td><td>解耦的通信方式——发消息的不知道谁在听，听的人不知道谁发的</td></tr>
<tr><td>Scene 切换（director.loadScene）</td><td><strong>router.push()</strong></td><td>每个 Scene 是一个独立的运行时环境——和路由页面切换一样，"上一个场景"的状态不会自动带到下一个场景</td></tr>
<tr><td>ObjectPool（对象池）</td><td><strong>&lt;KeepAlive&gt;</strong></td><td>不销毁旧的，而是把它们"缓存"起来复用——避免频繁 new/destroy 的开销</td></tr>
<tr><td>Prefab（预制体）</td><td><strong>Vue 组件（.vue SFC）</strong></td><td>定义一次（模板+逻辑），在不同的地方实例化多次——子弹 Prefab = Bullet 组件</td></tr>
</tbody>
</table>

如果你抱着"这是另一个框架，只是语法不同"的心态去理解 Cocos，你会在几天内找到写 Vue 时的熟悉感。

## 🔗 事件总线——整个游戏系统的神经系统

这个架构最关键的设计决策是：**模块之间不直接调用，全部通过事件总线通信。**为什么？因为直接调用产生强耦合——改了 GameManager 就可能要改 Enemy 和 WaveManager。

来看一个具体例子：敌机被击杀时发生了什么？

<pre>Enemy.ts → onBulletHit()
  ↓ 发射事件
  EventBus.emit('enemy-killed', {
    enemyType: 'fighter',
    position: new Vec2(240, 700),
    scoreValue: 100
  })

  ↓ 同时，四个模块收到这个事件——各自做各自的事

  GameManager   → addScore(100)                       // 加分数
  WaveManager   → checkWaveComplete()                 // 检查这波敌人是否全灭
  UIManager     → showKillEffect(position)            // 在击杀位置显示 +100 特效
  AudioManager  → playSFX('explosion_' + enemyType)   // 播放对应类型的爆炸音效</pre>

关键点来了：**这四个模块没有一个知道其他模块的存在。** Enemy 不知道"击杀我的人还要加分"——它只管发射事件。GameManager 不知道"有人在放爆炸音效"——它只管记分。未来你要加一个成就系统（AchievementManager）——它只需要监听 'enemy-killed' 事件，对已有代码**零改动**。

这就是事件总线的威力——和 Vue 的 `$emit / mitt` 完全一样。你已经知道这个模式有多好用了。这就是"开放封闭原则"的工程实现——开放扩展（加新模块），封闭修改（不改旧模块）。

<div class="tip-box">
<strong>一个你会遇到的问题：</strong> 事件多了以后，你不知道"谁在听这个事件"——搜索也搜不到（因为接收方没有引用发送方）。解决方案：在 EventBus 的定义文件中，把所有事件名作为常量集中声明——<code>export const Events = { ENEMY_KILLED: 'enemy-killed', SCORE_CHANGED: 'score-changed' }</code>——然后全局搜索这个常量名就能找到所有发送方和接收方。这和 Vue 项目中维护一个 eventBus.ts 文件是一样的。
</div>

## 🎯 为什么需要三个 Canvas 层？

你的主场景 Game.scene 中，Canvas 下应该分出三个子节点——不是随便分的，每一个层对应不同的渲染和更新策略：

- **Background Layer（背景层）：** 静态的深蓝色渐变背景 + 慢速滚动的星星。这层的元素不需要碰撞检测、不需要每帧更新（除了滚动位置的 parallax 更新）。放在独立的层上，排序优先级最低。
- **Game Layer（游戏层）：** 玩家、敌机、子弹、道具、粒子特效。所有有碰撞检测的节点都在这一层。这一层是 update 的重灾区——每帧要更新位置、检测碰撞、检查边界。
- **UI Layer（UI 层）：** 分数/血量/波次公告/暂停按钮。这层不参与游戏逻辑，但需要始终在画面上方——所以它挂在最上面，并且不受游戏层的摄像机影响。

如果你把这三层混在一个 Canvas 下——背景也在碰撞检测的 update 里跑、UI 也跟着游戏层抖（如果你的摄像机有震动效果）、粒子飞到了 UI 按钮上。分层的目的是**隔离不同更新频率和不同渲染需求的节点**——就像 Vue 里你不会把全局导航栏放在 `<router-view>` 里面。

## 📋 动手：5 天从零到完整游戏——每一天的具体步骤

下面不是"目标描述"，而是**每天你应该打开 Cocos 编辑器做哪些具体的事情**。照着做，5 天后的你会有自己的飞机大战：

#### Day 1：项目骨架 + 玩家飞机能动

- 打开 Cocos Dashboard → 新建项目 → 选择"空白项目"模板 → 命名为 `pixel-plane-battle`
- 在 assets 下创建目录结构：scenes/、scripts/（含子目录 manager/ player/ enemy/ ui/ powerup/ util/）、textures/、audio/
- 创建 Boot.scene：加一个带 Sprite 的 loading 节点 → 写 Boot.ts 脚本，在 start() 中用 `director.preloadScene('MainMenu')` 预加载主菜单场景 → 加载完成后 `director.loadScene('MainMenu')`
- 创建 MainMenu.scene：一个 Canvas → 背景色设为深蓝（模拟太空）→ 一个"开始游戏"按钮节点（Label + Button 组件）→ 点击后 `director.loadScene('Game')`
- 创建 Game.scene → Canvas 下分三个子节点：BackgroundLayer、GameLayer、UILayer
- 在 GameLayer 下创建一个飞机 Sprite 节点（先用一个 32×32 的白色矩形代替——像素飞机后面再画）→ 写 PlayerController.ts：监听键盘方向键，在 update(dt) 中用 `node.setPosition(node.position.x + speed * dt, node.position.y + speed * dt)` 移动
- **测试：** 点击预览 → 你应该能看到启动加载 → 点击"开始游戏" → 进入 Game 场景 → 用方向键控制白色方块移动。这是最简可玩原型。

#### Day 2：子弹系统 + 敌机基础 + 碰撞检测

- 创建 Bullet.prefab：一个 8×16 的白色矩形 Sprite → BoxCollider2D（勾选 isSensor——子弹不需要物理响应，只需要碰撞检测）→ Bullet.ts 脚本：在 update 中往上飞（`this.node.y += speed * dt`），超出屏幕顶部时自动销毁（`if (this.node.y > 850) this.node.destroy()`）
- 实现 ObjectPool.ts：一个通用的对象池——预创建 N 个 Bullet 节点（设为 inactive），`get()` 时激活一个并返回，`put(node)` 时设为 inactive 而不是 destroy。在 PlayerController 中按空格键时从池中取子弹而不是 new。这可以避免 GC 卡顿——和前端用对象池缓存 DOM 元素是一样的。
- 创建 Enemy.prefab：一个 32×32 的红色矩形 Sprite → BoxCollider2D（也勾选 isSensor）→ Enemy.ts 脚本：在 update 中往下飞，超出屏幕底部自动回收
- 创建 EnemySpawner.ts：用 `setInterval` 或帧计数每隔 1 秒在随机 X 位置生成一个敌机（从 EnemyPool 取）
- 碰撞检测：在 Bullet.ts 和 Enemy.ts 的 `onLoad()` 中注册碰撞回调（`collider.on(Contact2DType.BEGIN_CONTACT, callback, this)`）→ 子弹碰到敌机 → 发射 'enemy-killed' 事件 → 两个节点都回收（放回对象池）
- **测试：** 飞机来回移动 → 按空格发射子弹（子弹应该不断往上飞、出屏消失）→ 敌机从上方出现往下飞 → 子弹碰到敌机时两者消失

#### Day 3：波次系统 + 分数系统 + UI 面板

- 创建 WaveManager.ts：定义一个 WaveData 接口（{ waveNumber, enemyTypes, count, spawnInterval, speedMultiplier }），准备 5 个波次的 JSON 配置。WaveManager 在每一波开始时按配置的频率和数量生成敌机。每一波的最后 3 个敌机有一个小 Boss（速度更快、血量更多——用 collision 计数来判断需要打多少下）。
- 创建 GameManager.ts：维护 score / wave / lives 状态。监听 EventBus 的 'enemy-killed' 事件来加分，监听 'player-hit' 来扣血。当 lives ≤ 0 时切换到 GameOver 场景。当所有波次完成且没有敌机存活时显示"你赢了"。
- 创建 UI 组件：ScoreUI.ts（监听 'score-changed' 事件更新 Label）、HealthBar.ts（用 Sprite 的 fillRange 或 scaleX 做血量条）、WaveAnnouncer.ts（在每次新波开始时显示 2 秒的 "Wave N" 大字然后淡出）
- 创建 PausePanel.prefab：一个半透明黑色背景 + "暂停"文字 + "继续"按钮 + "退出"按钮。按下 ESC 键时暂停（`director.pause()`），显示该面板，点击"继续"后 `director.resume()`。
- 创建 GameOver.scene：显示最终分数 + "重新开始"按钮 → 点击后 `director.loadScene('Game')`
- **测试：** 击杀敌机 → 分数数字变化 → 清完一波后出现"Wave 2!"公告 → 被撞多次后血量归零 → 跳转 GameOver 场景显示分数 → 点击重新开始回到 Game

#### Day 4：场景切换 + 道具系统 + 音效

- 检查场景流：Boot → MainMenu → Game → GameOver → Game（完整循环）。确保 `director.loadScene` 时旧场景资源被正确释放（在场景脚本的 `onDestroy` 中取消事件监听、停止所有定时器——否则切场景后旧脚本还在运行，造成内存泄漏和诡异 bug）。
- 添加场景淡入淡出：在场景切换前用 Cocos 的 Tween 系统在 Canvas 上叠加一个黑色全屏遮罩 → 从透明到不透明（0.5 秒）→ 切换到新场景 → 从黑色到透明（0.5 秒）。这个简单效果能大幅提升"游戏完成度"的体感。
- 创建 PowerUp.prefab：三种道具——三连发（FireRateUp，蓝色）、护盾（Shield，绿色）、分数加倍（Score2x，金色）。PowerUpSpawner.ts 每隔 15-25 秒随机位置掉落一个道具缓慢往下飘。如果玩家飞机碰到——加对应效果（FireRateUp = 10 秒内子弹发射间隔 / 3；Shield = 免疫下一次伤害；Score2x = 15 秒内分数翻倍）。
- 创建 AudioManager.ts：在 Boot 场景中初始化。提供 `playBGM(clipName)` 和 `playSFX(clipName)` 方法。BGM 循环播放，SFX 支持同时播放多个。监听相应事件——'enemy-killed' → 爆炸音、'wave-start' → 警报音、'player-hit' → 受击音、'powerup-collected' → 道具音。
- **测试：** 完整玩一局——从主菜单开始 → 打游戏 → 吃道具 → 被击杀 → 看分数 → 重新开始。过程中注意：切换场景时有没有闪烁？音效有没有重叠或丢失？道具效果结束后有没有恢复正常？

#### Day 5：粒子特效 + 手感打磨 + 性能分析

- **添加粒子特效：** 创建三个 ParticleSystem2D Prefab——爆炸特效（敌机死亡）、引擎火焰（挂在玩家飞机后下方，持续发射）、道具收集特效（金色粒子从道具位置向屏幕上方升天）。参考 Phase 20 的参数来调。核心原则：粒子不要太多——每个爆炸 30-50 个粒子够用，多了会影响性能。
- **实现屏幕震动：** 玩家受击时，对 Camera 节点做一个极快的 Tween 震动——`tween(camera).by(0.05, { position: new Vec3(5, 0, 0) }).by(0.05, { position: new Vec3(-10, 0, 0) }).by(0.05, { position: new Vec3(5, 0, 0) })`——0.15 秒的快速左右抖动。这种小细节对"手感"的提升是巨大的。
- **性能分析——打开 Chrome DevTools：** 在 Web 预览模式下，按 F12 → Performance 标签 → 录制 10 秒游戏过程 → 查看 FPS 曲线是否稳定在 55+ → 查看每帧的脚本执行时间（Scripting）是否在 10ms 以内 → 查看渲染时间（Rendering）是否在 5ms 以内。如果 FPS 掉到 30 以下：看哪些函数占了最多时间 → 通常是碰撞检测（对象池没用好频繁 new/destroy）或粒子系统（一次爆炸太多粒子）。
- **检查 DrawCall：** 在 Cocos 编辑器中开启"调试模式"（左下角齿轮图标）→ 勾选"显示性能统计数据" → 查看 DrawCall 数量。目标是 ≤ 30。如果超过：检查 Auto Atlas 是否正确合批（同一 atlas 的 Sprite 才能合批→减少 DrawCall）、关闭 SpriteFrame 内联（内联会破坏合批）、粒子系统不要用太多不同的纹理。
- **最终测试：** 完整玩三局。检查：有没有崩溃？FPS 有没有大幅波动？音效是否同步？道具是否生效？暂停/恢复是否正常？如果一切正常——你已经有了一个可以展示给别人的游戏。

## 🔗 课外延伸

不要求掌握，但如果你感兴趣，这些都是值得了解的故事：

- **独立游戏开发的时间尺度——不要被"一个人 3 天做出来"的神话骗了：** Flappy Bird 确实 3 天做出来的——但 Dong Nguyen 在那 3 天之前做了好几年的游戏开发。Stardew Valley 是 Eric Barone 一个人做了 4 年（每天工作 10 小时，同时打零工维持生活费）——一个人写代码、画像素、写音乐，做完了整个《星露谷物语》。Hollow Knight 是 Team Cherry 3 个人做了 3 年。这些数字不是让你沮丧的——它们告诉你"游戏开发的时间尺度不是周，而是月或年"。你的飞机大战 5 天就够了——因为它是一个学习项目，不是一个商业产品。但如果你以后想做商业游戏，请在计划中预留足够的打磨时间。
- **上线之后才是开始——数据驱动迭代：** 把游戏发布到微信小游戏后，接入 GameAnalytics 或腾讯的 MTA 平台。你会看到这些数据：哪个关卡（波次）死亡人数最多？什么道具使用率几乎为零？玩家平均游戏时长是多少？这些数据比你自己的感觉可靠得多。"我觉得 Wave 3 太难了"和"73% 的玩家在 Wave 3 死亡"——前者是猜测，后者是事实。这就是前端 A/B 测试和数据埋点的思路——只是工具从 Firebase/GA 换成了 GameAnalytics。
- **从 0 到 100 个玩家——微信小游戏的增长密码：** 当你把飞机大战做成微信小游戏后，怎么让前 100 个玩家看到它？第一，分享功能——在 GameOver 时加一个"炫耀分数"按钮（调用 `wx.shareAppMessage()`），分享的文案是"我打了 XX 分，你能超过我吗？"。第二，排行榜——让玩家能看到好友的分数排名（微信的 `wx.setUserCloudStorage()` 接口）。第三，群排行——如果游戏支持群排行榜（`wx.getGroupCloudStorage()`），群里的竞争会把自然传播量推上去。微信小游戏的增长本质是"社交钩子"——你的游戏玩法再好玩，没人知道也没用。但一把"朋友比我分高"的钩子可以帮你获取前 100 个自然量用户。

## ✅ 自测清单

学完这一节，你应该能回答这些问题——不是"做到了没"，而是"理解为什么"：

1. **为什么用 EventBus 而不是直接调用 Manager 的方法？** 假设你的游戏现在有 5 个 Manager（Game / Wave / Audio / UI / PowerUp），明天要加第 6 个（AchievementManager——"连续击杀 10 个敌机"成就）。如果使用 EventBus 架构，你需要改几行已有代码？如果用直接调用（Enemy.ts 里写 `GameManager.instance.addScore()`），你需要改几行？这个对比说明了事件总线的什么价值？
2. **为什么分离 Boot / MainMenu / Game / GameOver 四个场景，而不是一个场景？** 如果你把所有内容塞进一个场景，用 active/inactive 切换——请列出至少三个会出问题的地方。（提示：从内存占用、update 循环效率、碰撞检测误触发、摄像机管理、资源释放五个维度分析）
3. **你的游戏需要设计一个"Boss 子弹"——Boss 发射的子弹会穿过普通敌机（不造成伤害），但碰到玩家时造成 2 点伤害。而普通敌机和普通子弹的碰撞逻辑不变。在 Cocos 的 2D 物理碰撞系统中，你需要怎么配置碰撞分组（Group）和碰撞矩阵（Mask）来实现这个需求？请画出分组方案。**
4. **构建 Web 版后，你用 Chrome DevTools 发现：** 当 5 个以上的敌机同时爆炸（每个爆炸有 50 个粒子）时，FPS 从稳定的 60 掉到 30。你用 Performance 面板看到 Scripting 时间从 4ms 暴涨到 28ms。首先，你会怀疑哪部分代码在大量消耗 CPU？其次，给出两个具体的优化方案（不减少粒子数量的前提下）。
