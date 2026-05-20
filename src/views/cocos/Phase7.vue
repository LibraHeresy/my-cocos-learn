<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="7" title="像素飞机大战实战" duration="5 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>一款完整可玩的像素飞机大战，包含：玩家操控、多种敌机、碰撞、道具、UI、音效</li>
        <li>一个可复用的游戏框架（对象池 + 事件总线 + 状态机），以后做其他 2D 游戏直接拿来用</li>
        <li>对 Cocos 开发流程的完整认知——从创建项目到最终打磨</li>
      </ul>
    </ConceptBlock>

    <!-- ============ 项目结构 ============ -->
    <ConceptBlock icon="🏗️" title="项目结构">
      <p>按之前学的目录规范，搭好如下结构：</p>
      <pre><code>assets/
├── scenes/
│   ├── Menu.scene         # 主菜单
│   ├── Game.scene          # 游戏场景
│   └── Result.scene        # 结算场景
├── scripts/
│   ├── player/
│   │   └── Player.ts
│   ├── enemy/
│   │   ├── Enemy.ts        # 敌机基类
│   │   ├── EnemySmall.ts   # 小型敌机（速度快，血少）
│   │   ├── EnemyMedium.ts  # 中型敌机（会射击）
│   │   └── EnemyBoss.ts    # Boss（多阶段）
│   ├── bullet/
│   │   └── Bullet.ts
│   ├── item/
│   │   └── GameItem.ts     # 道具
│   ├── manager/
│   │   ├── GameManager.ts
│   │   ├── InputManager.ts
│   │   ├── CollisionManager.ts
│   │   └── AudioManager.ts
│   └── utils/
│       ├── ObjectPool.ts
│       ├── EventBus.ts
│       └── MathUtils.ts
├── textures/
│   └── (你的像素素材)
├── audio/
│   └── (你的音效文件)
└── prefabs/
    ├── Player.prefab
    ├── Bullet.prefab
    ├── EnemySmall.prefab
    ├── EnemyMedium.prefab
    ├── EnemyBoss.prefab
    ├── Explosion.prefab
    └── items/
        ├── PowerUp.prefab
        ├── Bomb.prefab
        └── Heal.prefab</code></pre>
    </ConceptBlock>

    <!-- ============ 逐日开发计划 ============ -->
    <ConceptBlock icon="📅" title="Day 1：搭骨架 —— 游戏框架 + 玩家飞机">
      <h3>任务清单</h3>
      <ol>
        <li>创建 Game.scene，设置 Canvas 设计分辨率（建议 480×800 或 720×1280）</li>
        <li>创建 GameManager 单例，定义 GameState 枚举（WAITING / PLAYING / PAUSED / GAMEOVER）</li>
        <li>
          创建
          EventBus，定义核心事件：<code>game:start</code>、<code>game:over</code>、<code>enemy:killed</code>、<code>score:changed</code>、<code
            >lives:changed</code
          >
        </li>
        <li>创建 InputManager 单例，挂到 Canvas 上</li>
        <li>创建 Player 节点 + Sprite + Player 脚本</li>
      </ol>

      <h3>Player 脚本骨架</h3>
      <pre><code>import { Component, _decorator, view, Prefab } from 'cc'
import { InputManager, InputState } from '../manager/InputManager'
import { GameManager, GameState } from '../manager/GameManager'
import { ObjectPool } from '../utils/ObjectPool'
const { ccclass, property } = _decorator

@ccclass('Player')
export class Player extends Component {

  @property speed: number = 300
  @property fireRate: number = 0.15

  @property lives: number = 3
  @property power: number = 1   // 火力等级（1-5）

  private _fireTimer = 0
  private _invincible = false   // 无敌帧
  private _bulletPool: ObjectPool = null

  onLoad() {
    // ObjectPool 组件挂在 BulletPool 子节点上，预制体在编辑器里配置
    this._bulletPool = this.node.getChildByName('BulletPool').getComponent(ObjectPool)
  }

  update(dt: number) {
    if (GameManager.instance.state !== GameState.PLAYING) return

    const input = InputManager.instance.input
    this.move(input, dt)
    this.tryShoot(input, dt)
    this.clampToScreen()
  }

  private move(input: InputState, dt: number) {
    this.node.x += input.direction.x * this.speed * dt
    this.node.y += input.direction.y * this.speed * dt
  }

  private tryShoot(input: InputState, dt: number) {
    this._fireTimer += dt
    if (!input.fire || this._fireTimer < this.fireRate) return
    this._fireTimer = 0

    // 根据火力等级发射不同数量的子弹
    const bullet = this._bulletPool.get()
    bullet.setPosition(this.node.x, this.node.y + 30)
  }

  private clampToScreen() {
    const screenSize = view.getVisibleSize()
    const margin = 20
    this.node.x = Math.max(-screenSize.width / 2 + margin,
      Math.min(screenSize.width / 2 - margin, this.node.x))
    this.node.y = Math.max(-screenSize.height / 2 + margin,
      Math.min(screenSize.height / 2 - margin, this.node.y))
  }

  takeDamage() {
    if (this._invincible) return
    GameManager.instance.loseLife()
    if (GameManager.instance.state === GameState.GAMEOVER) return

    // 无敌闪烁（用 tween 做）
    this._invincible = true
    this.scheduleOnce(() => this._invincible = false, 1.5)
  }
}</code></pre>

      <div class="tip-box">
        <strong>Day 1 验收标准：</strong
        >玩家飞机能用键盘/触摸控制移动和射击（子弹向上飞），限制在屏幕内。GameManager
        能正确管理游戏状态。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📅" title="Day 2：子弹 + 敌机 + 碰撞">
      <h3>任务清单</h3>
      <ol>
        <li>完善 ObjectPool 类（支持动态扩容、回收重置）</li>
        <li>创建 Bullet.ts —— 每帧向上/向下移动，飞出屏幕自动回收</li>
        <li>创建 EnemySmall.ts —— 从上方出现，向下移动，飞出屏幕回收</li>
        <li>创建 CollisionManager —— 注册所有碰撞体，每帧检测</li>
        <li>实现碰撞回调：子弹碰到敌机 → 敌机死亡 + 加分</li>
      </ol>

      <h3>Bullet 脚本</h3>
      <pre><code>@ccclass('Bullet')
export class Bullet extends Component implements ICollidable {
  group!: string              // 由创建方在 instantiate 后设置
  speed: number = 0
  damage: number

  update(dt: number) {
    // 玩家子弹向上飞，敌机子弹向下飞
    this.node.y += (this.group === 'playerBullet' ? 1 : -1) * this.speed * dt

    // 飞出屏幕 → 回收
    const halfH = view.getVisibleSize().height / 2
    if (Math.abs(this.node.y) > halfH + 50) {
      this.node.parent.getComponent(ObjectPool)?.put(this.node)
    }
  }

  getBBox(): Rect { /* 见 Phase 5 */ }
}</code></pre>

      <h3>EnemySmall 脚本</h3>
      <pre><code>@ccclass('EnemySmall')
export class EnemySmall extends Component implements ICollidable {
  group = 'enemy'
  @property speed: number = 120
  @property hp: number = 1
  @property scoreValue: number = 100

  update(dt: number) {
    this.node.y -= this.speed * dt

    const halfH = view.getVisibleSize().height / 2
    if (this.node.y < -halfH - 50) this.recycle()
  }

  onCollision(other: ICollidable) {
    if (other.group === 'playerBullet') {
      this.hp -= 1
      if (this.hp <= 0) this.die()
    }
  }

  die() {
    eventBus.emit('enemy:killed', { position: this.node.position, points: this.scoreValue })
    this.recycle()
  }

  recycle() {
    this.node.parent.getComponent(ObjectPool)?.put(this.node)
  }
}</code></pre>

      <div class="tip-box">
        <strong>Day 2 验收标准：</strong
        >敌机从上方掉落，子弹能击毁敌机，击毁后分数增加。飞出屏幕的子弹和敌机都被正确回收。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📅" title="Day 3：波次系统 + 多种敌机">
      <h3>任务清单</h3>
      <ol>
        <li>创建 WaveManager —— 控制敌机波次（每波敌机数量、类型、间隔）</li>
        <li>创建 EnemyMedium —— 中型敌机，会左右移动 + 向下射击</li>
        <li>难度递增：波次越高，敌机速度越快、数量越多</li>
      </ol>

      <h3>WaveManager 脚本</h3>
      <pre><code>@ccclass('WaveManager')
export class WaveManager extends Component {

  @property waveInterval: number = 15  // 每波间隔（秒）
  @property({ type: [ObjectPool] })
  enemyPools: ObjectPool[] = []       // Small / Medium / Boss 三个池子

  private _wave = 0
  private _timer = 0
  private _spawnTimer = 0
  private _spawnQueue: Array&lt;{ type: number; delay: number }&gt; = []

  update(dt: number) {
    if (GameManager.instance.state !== GameState.PLAYING) return

    this._timer += dt
    if (this._timer >= this.waveInterval) {
      this._timer = 0
      this.startNewWave()
    }

    // 按队列延迟生成
    this._spawnTimer += dt
    while (this._spawnQueue.length > 0 && this._spawnQueue[0].delay <= this._spawnTimer) {
      const cmd = this._spawnQueue.shift()!
      this.spawnEnemy(cmd.type)
    }
  }

  startNewWave() {
    this._wave++
    const count = 3 + this._wave * 2     // 敌机数量随波次递增
    const speed = 100 + this._wave * 15   // 速度递增

    // 生成队列：小型敌机为主，偶尔混入中型
    for (let i = 0; i < count; i++) {
      const type = Math.random() < 0.2 && this._wave >= 3 ? 1 : 0  // 20%机率中型
      this._spawnQueue.push({ type, delay: i * 0.8 })
    }

    eventBus.emit('wave:start', this._wave)
  }

  spawnEnemy(type: number) {
    const pool = this.enemyPools[type]
    const enemy = pool.get()
    enemy.x = Math.random() * 350 - 175   // 屏幕上方随机 X
    enemy.y = 450
  }
}</code></pre>

      <div class="tip-box">
        <strong>Day 3 验收标准：</strong
        >敌机按波次生成，波次之间有空档。能看到小/中两种敌机，中型敌机会射击。难度逐波递增。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📅" title="Day 4：道具 + UI">
      <h3>任务清单</h3>
      <ol>
        <li>创建道具系统：火力升级（红色）、全屏炸弹（黄色）、加血（绿色）</li>
        <li>道具从被击杀的敌机位置掉落，向下飞出屏幕后回收</li>
        <li>创建 HUD：顶部分数、左上角生命值、右上角炸弹数</li>
        <li>炸弹效果：屏幕震动 + 清除所有敌机子弹</li>
      </ol>

      <h3>道具拾取逻辑</h3>
      <pre><code>// GameItem.ts
@ccclass('GameItem')
export class GameItem extends Component implements ICollidable {
  group = 'item'

  @property({ type: Enum(['POWER', 'BOMB', 'HEAL']) })
  itemType: string = 'POWER'

  @property fallSpeed: number = 80

  update(dt: number) {
    this.node.y -= this.fallSpeed * dt
    if (this.node.y < -450) this.recycle()
  }

  onCollision(other: ICollidable) {
    if (other.group !== 'player') return

    switch (this.itemType) {
      case 'POWER':
        // 火力升级（最多到 5）
        if (player.power < 5) player.power++
        break
      case 'BOMB':
        // 全屏炸弹
        eventBus.emit('bomb:activate')
        break
      case 'HEAL':
        // 恢复一条命（最多 3 条）
        GameManager.instance.lives = Math.min(3, GameManager.instance.lives + 1)
        break
    }
    eventBus.emit('item:picked', this.itemType)
    this.recycle()
  }
}</code></pre>

      <div class="tip-box">
        <strong>Day 4 验收标准：</strong>击杀敌机有概率掉落道具，玩家拾取后效果生效。HUD
        实时更新分数、生命、炸弹数、火力等级。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📅" title="Day 5：场景切换 + 音效 + 打磨">
      <h3>任务清单</h3>
      <ol>
        <li>创建 Menu.scene：标题 + "开始游戏" 按钮</li>
        <li>创建 Result.scene：显示最终分数 + "重新开始" 按钮</li>
        <li>创建 AudioManager：管理音效和背景音乐</li>
        <li>音调随机化：爆炸/射击音效每次播放时微调 pitch，避免重复感（见下方）</li>
        <li>添加爆炸帧动画（Animation 组件）</li>
        <li>添加受击闪烁（tween 控制 Sprite 的 color）</li>
        <li>添加屏幕震动（tween 控制 Camera 的 position）</li>
      </ol>

      <h3>受击闪烁</h3>
      <pre><code>// Player.ts
takeDamage() {
  if (this._invincible) return
  // ...
  this._invincible = true

  // 闪烁效果：Sprite 颜色在白色和正常色间快速切换
  const sprite = this.node.getComponent(Sprite)
  const origColor = sprite.color.clone()
  tween(sprite)
    .to(0.1, { color: Color.WHITE })
    .to(0.1, { color: origColor })
    .union()
    .repeat(5)
    .call(() => this._invincible = false)
    .start()
}</code></pre>

      <h3>屏幕震动</h3>
      <pre><code>// CameraShake.ts
static play(intensity: number = 10, duration: number = 0.3) {
  const camera = Camera.main.node
  const originalPos = camera.position.clone()

  tween(camera)
    .to(duration / 3, { position: new Vec3(originalPos.x + intensity, originalPos.y, 0) })
    .to(duration / 3, { position: new Vec3(originalPos.x - intensity, originalPos.y, 0) })
    .to(duration / 3, { position: originalPos })
    .start()
}</code></pre>

      <h3>音调随机化（Pitch Randomization）</h3>
      <p>同一个音效反复播放会有"机械感"——人耳对重复声音非常敏感。解决方法是每次播放时微调音调：</p>
      <pre><code>// AudioManager.ts 中
playOneShotWithPitch(path: string) {
  const clip = this._clipCache.get(path)
  if (!clip) return

  // 随机偏移 ±0.1（Cocos AudioSource 不支持直接设 pitch，需创建临时 source）
  const tempSource = this.node.addComponent(AudioSource)
  tempSource.clip = clip
  tempSource.volume = this._audioSource.volume

  // 小游戏用 InnerAudioContext 可以直接设 playbackRate
  // web 端 AudioSource 暂不支持 pitch——替代方案是准备 3-4 个微调版本
  tempSource.play()

  this.scheduleOnce(() => tempSource.destroy(), clip.duration + 0.1)
}</code></pre>

      <div class="tip-box">
        <strong>降低重复感的三个方法：</strong><br />
        1. 准备 3-4 个同类型音效的微变版本（shoot_01 ~ shoot_04），随机选一个播放（最优）<br />
        2. 每次播放随机微调音量（±5%）——效果有限<br />
        3. 小游戏用 <code>InnerAudioContext.playbackRate</code> 直接改 pitch（0.9~1.1），Web
        端需多版本素材
      </div>

      <div class="tip-box">
        <strong>Day 5 验收标准：</strong>完整的游戏流程：菜单 → 游戏 → 结算 →
        重新开始。有音效、有爆炸动画、有受击闪烁和屏幕震动。
      </div>
    </ConceptBlock>

    <!-- ============ 完整游戏循环 ============ -->
    <ConceptBlock icon="🔄" title="完整游戏循环">
      <p>把所有模块串起来，这是一个完整的游戏流程：</p>

      <pre><code>1. 玩家打开游戏 → Menu.scene（"像素飞机大战" + 开始按钮）
2. 点击开始 → director.loadScene('GameScene')
3. GameManager.startGame() → 状态变为 PLAYING
4. WaveManager 开始生成敌机波次
5. 玩家操控飞机移动 + 射击
6. 子弹击中敌机 → CollisionManager 检测到
   → Enemy.die() → emit 'enemy:killed'
   → UIManager 加分 + AudioManager 播放爆炸音效
   → 概率掉落道具
7. 敌机撞到玩家 → Player.takeDamage()
   → GameManager.loseLife() → emit 'lives:changed'
   → 生命为 0 → GameManager.gameOver()
8. GameManager.gameOver() → emit 'game:over'
   → 2 秒后 director.loadScene('ResultScene')
9. ResultScene 显示最终分数 → 点击"重新开始"
   → loadScene('GameScene') → 回到步骤 3</code></pre>
    </ConceptBlock>

    <!-- ============ 坑点 ============ -->
    <ConceptBlock icon="⚠️" title="实战中你一定会遇到的坑">
      <table>
        <thead>
          <tr>
            <th>现象</th>
            <th>可能原因</th>
            <th>排查方法</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>敌机不出现</td>
            <td>Prebab 没拖到属性槽 / 对象池未创建 / active=false</td>
            <td>在 spawnEnemy 中加 log，检查 pool.get() 返回值</td>
          </tr>
          <tr>
            <td>子弹打不中敌机</td>
            <td>碰撞体尺寸为 0 / CollisionManager 没注册 / 碰撞矩阵配置错误</td>
            <td>打开碰撞可视化调试（Phase 5）</td>
          </tr>
          <tr>
            <td>游戏越来越卡</td>
            <td>对象没有正确回收，池子无限增长 / update 中有资源加载</td>
            <td>console.log 池子大小，看是否在增长</td>
          </tr>
          <tr>
            <td>场景切换后报错</td>
            <td>切换场景时节点被销毁，但事件监听/定时器没清除</td>
            <td>检查所有 onDestroy 中是否正确清理</td>
          </tr>
          <tr>
            <td>道具拾取无效</td>
            <td>道具 group 不是 'item' / 玩家碰撞回调没处理 item</td>
            <td>在 onCollision 中加 log</td>
          </tr>
          <tr>
            <td>帧率不稳</td>
            <td>update 中有大量循环 / 每帧 new 对象 / GC 频繁</td>
            <td>用 Chrome Performance 面板 profile</td>
          </tr>
        </tbody>
      </table>

      <h3>Chrome DevTools 性能分析实战</h3>
      <p>当游戏出现卡顿，靠猜是猜不出来的——需要用 Chrome Performance 面板精确定位瓶颈：</p>

      <h4>1. 录制性能数据</h4>
      <ol>
        <li>Chrome → F12 → <strong>Performance</strong> 标签</li>
        <li>点击录制按钮（●）或 Ctrl+E → 在游戏窗口操作 5-10 秒 → 停止</li>
        <li>
          重点看 <strong>Main</strong> 线程的火焰图——每一段彩色横条代表一次函数调用，宽度 = 耗时
        </li>
      </ol>

      <h4>2. 关键指标速查</h4>
      <table>
        <thead>
          <tr>
            <th>指标</th>
            <th>含义</th>
            <th>警戒线</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>FPS</strong></td>
            <td>每秒渲染帧数</td>
            <td>&lt; 30 肉眼可感知卡顿</td>
          </tr>
          <tr>
            <td><strong>Frame Time</strong></td>
            <td>单帧耗时（含脚本 + 渲染 + 绘制）</td>
            <td>&gt; 16.6ms 即掉帧（60fps 基准）</td>
          </tr>
          <tr>
            <td><strong>Scripting</strong></td>
            <td>JS 执行耗时（黄色）</td>
            <td>&gt; 10ms/帧 → 优化 update 逻辑</td>
          </tr>
          <tr>
            <td><strong>Rendering</strong></td>
            <td>CSS/Canvas 渲染耗时（紫色）</td>
            <td>&gt; 5ms/帧 → 减少 Draw Call / 降低分辨率</td>
          </tr>
          <tr>
            <td><strong>Painting</strong></td>
            <td>像素绘制耗时（绿色）</td>
            <td>&gt; 3ms/帧 → 检查是否有大面积重绘</td>
          </tr>
          <tr>
            <td><strong>Minor GC</strong></td>
            <td>新生代垃圾回收（黄色虚线标记）</td>
            <td>每帧都出现 → 在 update 中 new 了对象</td>
          </tr>
        </tbody>
      </table>

      <h4>3. Cocos 专属排查标记</h4>
      <ul>
        <li>
          <strong>update 耗时：</strong>火焰图中搜 "update"——单帧累计超过 10ms
          就要拆分逻辑（比如把碰撞检测移到固定时间步长）
        </li>
        <li>
          <strong>GC 抖动：</strong>看到黄色虚线 "Minor GC" 高频出现 → 检查 update 中是否有
          <code>new Vec2()</code> / <code>new Vec3()</code> /
          字符串拼接——这些应该用对象池或临时变量复用
        </li>
        <li>
          <strong>渲染瓶颈：</strong>GPU 行很长但 Main 线程空闲 → Draw Call 过多。Cocos 编辑器底部有
          Draw Call 计数器，超过 100 要检查合批
        </li>
        <li>
          <strong>资源加载卡顿：</strong>Main 线程出现 <code>resources.load</code> 长任务（> 50ms）→
          改为场景加载时预加载，不要等要用的时候才加载
        </li>
        <li>
          <strong>节点数量爆炸：</strong>在 Console 中执行
          <code>cc.director.getScene()!.children.length</code>——如果运行时持续增长说明对象没有回收
        </li>
      </ul>

      <h4>4. 内存泄漏排查</h4>
      <ol>
        <li>切换到 <strong>Memory</strong> 标签 → 选 "Heap snapshot"</li>
        <li>游戏开始前拍一张快照（Snapshot 1）</li>
        <li>玩完一整局后拍第二张（Snapshot 2）</li>
        <li>回到菜单后再拍第三张（Snapshot 3）</li>
        <li>
          对比 Snapshot 1 和 Snapshot 3：JS heap 应该基本一致。如果 Snapshot 3 明显更大 → 有泄漏
        </li>
        <li>
          在 Comparison 视图中按 "Delta"
          排序——找增长最多的对象类型（通常是闭包、Node、EventCallback）
        </li>
      </ol>

      <h4>5. 典型性能问题修复对照</h4>
      <table>
        <thead>
          <tr>
            <th>火焰图特征</th>
            <th>根因</th>
            <th>修复</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>每帧有一个 5ms+ 的黄色块，标记为 Anonymous</td>
            <td>update 中遍历了过长数组</td>
            <td>用空间换时间：维护活跃对象列表，而非每帧遍历全场景</td>
          </tr>
          <tr>
            <td>每 2-3 秒出现一个 20ms+ 的黄色虚线块</td>
            <td>GC 回收大量临时对象</td>
            <td>update 中复用 Vec2/Vec3 实例，子弹/敌机用对象池</td>
          </tr>
          <tr>
            <td>GPU 行 > Main 行，且绿色 Painting 很宽</td>
            <td>大量半透明 Sprite 重叠</td>
            <td>减少透明像素面积、避免多层 Sprite 叠在一起</td>
          </tr>
          <tr>
            <td>首帧加载时一个 500ms+ 的大块</td>
            <td>resources.load 同步阻塞</td>
            <td>场景 onLoad 中并行预加载，显示 Loading 界面</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>一个实用的调试开关：</strong>在 GameManager 中加一行
        <code>cc.profiler.showStats()</code>——游戏运行时会显示 FPS / Draw Call / 节点数 /
        帧时间的小面板（类似 Vue DevTools 的性能面板）。开发时开着它，发现异常数值再开 Chrome
        Performance 深入分析。
      </div>
    </ConceptBlock>

    <!-- ============ Menu/Result 场景 ============ -->
    <ConceptBlock icon="🖥️" title="Menu.scene 和 Result.scene 最小实现">
      <p>Day 5 提到要创建菜单和结算场景，这里给出骨架代码——不要从头摸索：</p>

      <h3>Menu.scene 结构</h3>
      <pre><code>Canvas（设计分辨率 480×800）
├── Background（Sprite — 纯色或星空背景）
├── Title（Label — "像素飞机大战"，字号 48，居中上方）
├── HighScoreLabel（Label — "最高分：9999"，字号 20）
├── StartBtn（Button — "开始游戏"）
│   └── Label（文字 "开始游戏"）
└── MenuUI（脚本 — 处理按钮点击）

// MenuUI.ts
import { Component, _decorator, Button, Label, director, sys } from 'cc'
const { ccclass, property } = _decorator

@ccclass('MenuUI')
export class MenuUI extends Component {

  @property({ type: Button })
  startBtn: Button = null

  @property({ type: Label })
  highScoreLabel: Label = null

  onLoad() {
    const highScore = sys.localStorage.getItem('highScore') || '0'
    this.highScoreLabel.string = `最高分：${highScore}`

    this.startBtn.node.on(Button.EventType.CLICK, this.onStart, this)
  }

  onStart() {
    director.loadScene('GameScene')
  }

  onDestroy() {
    this.startBtn.node.off(Button.EventType.CLICK, this.onStart, this)
  }
}</code></pre>

      <h3>Result.scene 结构</h3>
      <pre><code>Canvas（480×800）
├── Background
├── Title（Label — "游戏结束"，字号 40）
├── ScoreLabel（Label — "本次得分：9999"）
├── NewRecordLabel（Label — "新纪录！"，默认隐藏，当分数>最高分时显示）
├── RestartBtn（Button — "再来一局"）
├── BackBtn（Button — "返回主菜单"）
└── ResultUI（脚本）

// ResultUI.ts
import { Component, _decorator, Button, Label, director, sys } from 'cc'
import { eventBus } from './EventBus'
const { ccclass, property } = _decorator

@ccclass('ResultUI')
export class ResultUI extends Component {

  @property({ type: Label })
  scoreLabel: Label = null

  @property({ type: Label })
  newRecordLabel: Label = null

  @property({ type: Button })
  restartBtn: Button = null

  @property({ type: Button })
  backBtn: Button = null

  onLoad() {
    this.restartBtn.node.on(Button.EventType.CLICK, () => {
      director.loadScene('GameScene')
    })

    this.backBtn.node.on(Button.EventType.CLICK, () => {
      director.loadScene('MenuScene')
    })

    // 接收游戏结束事件
    eventBus.on('game:over', this.onGameOver, this)
  }

  onGameOver(data: { score: number }) {
    this.scoreLabel.string = `本次得分：${data.score}`

    const prev = parseInt(sys.localStorage.getItem('highScore') || '0')
    if (data.score > prev) {
      this.newRecordLabel.active = true
    }
  }

  onDestroy() {
    eventBus.off('game:over', this.onGameOver, this)
  }
}</code></pre>

      <div class="tip-box">
        <strong>场景加载顺序：</strong>需要在 Project Settings → Project Data 中将 Menu.scene
        设为<strong>第一个启动场景</strong>（或通过 Cocos Dashboard
        设置默认场景）。否则项目运行后不知道先加载哪个场景。
      </div>
    </ConceptBlock>

    <!-- ============ 构建部署 ============ -->
    <ConceptBlock icon="🚀" title="构建与部署——让游戏上线">
      <p>游戏做完后最后一步：把它变成可发布的产品。前端工程师对部署最熟悉了：</p>

      <h3>Web 构建（最简单）</h3>
      <ol>
        <li>顶部菜单 → <strong>Project → Build</strong></li>
        <li>Platform 选择 <strong>Web Mobile</strong></li>
        <li>Output Path 选择输出目录</li>
        <li>点击 <strong>Build</strong></li>
        <li>输出目录中会生成 <code>index.html</code> + <code>assets/</code> + <code>src/</code></li>
        <li>把这个目录部署到任意静态服务器——Nginx / Vercel / Netlify / GitHub Pages 都可以</li>
      </ol>

      <h3>移动端构建</h3>
      <ul>
        <li>
          <strong>微信小游戏：</strong>Platform 选 WeChat Mini Game → Build →
          用微信开发者工具打开输出目录
        </li>
        <li><strong>Android：</strong>Platform 选 Android → 需要 Android Studio + NDK 环境</li>
        <li><strong>iOS：</strong>Platform 选 iOS → 需要 Mac + Xcode</li>
      </ul>

      <h3>Web 部署到 Vercel（免费 + 自动 HTTPS）</h3>
      <ol>
        <li>构建输出目录中的文件用 <code>git init</code> 新建仓库 + push 到 GitHub</li>
        <li>打开 vercel.com → Import Git Repository → 选中你的仓库</li>
        <li>Framework Preset 选 <strong>Other</strong></li>
        <li>Output Directory 留空（output 根目录就是 index.html）</li>
        <li>Deploy → 得到一个 URL → 手机上打开就能玩</li>
      </ol>

      <h3>微信小游戏构建配置详解</h3>
      <p>选 WeChat Mini Game 平台后，构建面板有几个关键配置：</p>

      <table>
        <thead>
          <tr>
            <th>配置项</th>
            <th>说明</th>
            <th>建议值</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>AppID</strong></td>
            <td>微信小游戏 ID（测试用 <code>wx6ac3fda0e142f4d2</code> 即微信小游戏示例 ID）</td>
            <td>正式发布前换成自己的</td>
          </tr>
          <tr>
            <td><strong>Orientation</strong></td>
            <td>屏幕方向</td>
            <td>竖屏射击 → portrait；横屏 → landscape</td>
          </tr>
          <tr>
            <td><strong>Subpackage</strong></td>
            <td>分包配置（主包 ≤ 4MB）</td>
            <td>见下方 Bundle 策略</td>
          </tr>
          <tr>
            <td><strong>ES6 → ES5</strong></td>
            <td>是否转译 JS。某些低端安卓只支持 ES5</td>
            <td>勾上——兼容性优先</td>
          </tr>
          <tr>
            <td><strong>MD5 Cache</strong></td>
            <td>文件名加 hash，解决缓存更新问题</td>
            <td>勾上——等同 Webpack contenthash</td>
          </tr>
        </tbody>
      </table>

      <h3>小游戏构建输出目录</h3>
      <pre><code>build/wechatgame/
├── game.js           # 入口
├── game.json         # 游戏配置（屏幕方向、分包等）
├── project.config.json  # 微信开发者工具配置
├── assets/           # 主包资源（≤ 4MB）
└── subpackages/      # 分包资源（Phase 8 详解）</code></pre>

      <div class="warn-box">
        <strong>主包 4MB 红线：</strong>微信小游戏主包（含引擎 + 入口场景 + 代码）不能超过
        4MB。超出后真机预览直接白屏。解决办法：资源放分包，用 <code>assetManager.loadBundle</code>
        按需加载。Phase 8 有完整分包策略。
      </div>

      <div class="tip-box">
        <strong>前端工程师的最大优势：</strong>你比其他 Cocos 学习者更懂 Web
        部署——静态服务器、CDN、域名、HTTPS。构建出来的就是一个纯静态的 HTML 应用，部署和你的 Vue
        项目完全一样。
      </div>
    </ConceptBlock>

    <!-- ============ 难度调校 ============ -->
    <ConceptBlock icon="🎚️" title="难度曲线调校——让它好玩">
      <p>
        游戏能跑起来 ≠ 好玩。难度调校是最后也是最容易被跳过的步骤——<strong
          >花 1-2 小时专门调参数</strong
        >：
      </p>

      <h3>核心调节参数</h3>
      <table>
        <thead>
          <tr>
            <th>参数</th>
            <th>位置</th>
            <th>过小</th>
            <th>过大</th>
            <th>合理区间</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>敌机生成频率</td>
            <td>WaveManager.spawnInterval</td>
            <td>等太久，无聊</td>
            <td>满屏敌机，无法操作</td>
            <td>开始 2-3 秒/个，逐波减到 0.8 秒</td>
          </tr>
          <tr>
            <td>敌机速度</td>
            <td>Enemy.speed</td>
            <td>太慢，没挑战</td>
            <td>来不及反应就撞上</td>
            <td>开始 100-120，逐波 +10</td>
          </tr>
          <tr>
            <td>玩家移速</td>
            <td>Player.speed</td>
            <td>笨重，躲不开子弹</td>
            <td>太灵活，游戏没乐趣</td>
            <td>250-350——能躲但不轻松</td>
          </tr>
          <tr>
            <td>射击间隔</td>
            <td>Player.fireRate</td>
            <td>按不出子弹，挫败</td>
            <td>满屏子弹成割草</td>
            <td>0.12-0.18 秒</td>
          </tr>
          <tr>
            <td>道具掉落率</td>
            <td>ItemManager.dropRate</td>
            <td>吃不到道具，没有惊喜</td>
            <td>满地道具没辨识度</td>
            <td>10%-20%，Boss 100%</td>
          </tr>
        </tbody>
      </table>

      <h3>调校方法</h3>
      <ol>
        <li><strong>开发者自己玩 10 局：</strong>记录哪里死得太多次、哪里太容易</li>
        <li><strong>找一个非开发者试玩 5 局：</strong>听他们的反馈——"太难了"或"无聊了"</li>
        <li>
          <strong>调整一个参数后重新试玩：</strong>一次只改一个变量——改了敌机速度就别改生成频率
        </li>
        <li>
          <strong>提供难度选择：</strong>简单的做 "简单 / 普通 / 困难"
          三个预设即可——本质是同一套参数的不同初始值
        </li>
      </ol>

      <div class="tip-box">
        <strong>黄金法则：</strong>前 30 秒让玩家觉得"我能行"（轻松），30-60
        秒慢慢感受到压力（投入），60
        秒后进入"必须全神贯注"的状态（心流）。难度递增要平滑——不要第一波 3 个敌机、第二波突然 15
        个。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <p>当你完成飞机大战后，应该能自信地回答：</p>
      <ul>
        <li>从零创建一个 Cocos 项目需要哪些步骤？编辑器六大面板各自干什么？</li>
        <li>Scene、Node、Component 的关系是什么？Prefab 怎么创建和使用？</li>
        <li><code>update(dt)</code> 中的 dt 是什么？为什么所有位移都要乘它？</li>
        <li>键盘持续移动的正确做法是什么？（提示：不是 KEY_DOWN 回调）</li>
        <li>AABB 碰撞检测的公式能默写出来吗？</li>
        <li>对象池解决了什么问题？事件总线解决了什么问题？</li>
        <li>为什么 CollisionManager 要集中管理而不是分散在各组件中？</li>
        <li>游戏的完整流程：菜单→游戏→结算→重开，每一环怎么切换？</li>
      </ul>
      <p>
        如果你能不看代码回答上述问题——恭喜，<strong>你已经是一名合格的 Cocos 开发者了。</strong>
      </p>
    </ConceptBlock>
  </PhaseLayout>
</template>
