<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="12" title="敌机系统与行为设计" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>敌机不只是"一个会往下飞的 Sprite"。好的敌机设计让每波战斗都有新鲜感——不同类型的敌机用不同的移动轨迹、不同的攻击方式、不同的视觉反馈。这一节讲怎么设计一个<strong>可扩展的敌机系统</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="👾" title="敌机类型设计">
      <table>
        <thead><tr><th>类型</th><th>大小</th><th>血量</th><th>速度</th><th>分值</th><th>行为特征</th></tr></thead>
        <tbody>
          <tr><td>小型</td><td>16×16</td><td>1</td><td>快</td><td>100</td><td>直线下降，数量多</td></tr>
          <tr><td>中型</td><td>24×24</td><td>3</td><td>中</td><td>300</td><td>正弦波摆动，偶尔射击</td></tr>
          <tr><td>大型</td><td>32×32</td><td>8</td><td>慢</td><td>800</td><td>追踪玩家，间歇射击</td></tr>
          <tr><td>Boss</td><td>48×48</td><td>50+</td><td>慢</td><td>5000</td><td>多阶段攻击模式，血量条显示</td></tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="〰️" title="移动轨迹">
      <pre>// 直线下降
pos.y -= speed * dt

// 正弦波摆动
pos.y -= speed * dt
pos.x = startX + Math.sin(elapsed * frequency) * amplitude

// 追踪玩家
const dir = playerPos.subtract(pos).normalize()
pos.add(dir.multiplyScalar(speed * dt))

// 贝塞尔曲线运动（平滑的弧线路径）
const t = elapsed / totalDuration
pos = bezier(t, startPoint, control1, control2, endPoint)</pre>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：实现三种敌机行为">
      <p>新建一个 <code>Enemy.ts</code> 脚本，实现三种敌机类型。每种类型用同一个组件，靠配置参数区分行为：</p>
      <p><strong>1. 小型敌机——直线下降，数量取胜</strong></p>
      <pre>// Enemy.ts
@ccclass('Enemy')
export class Enemy extends Component {
  @property hp: number = 1
  @property speed: number = 200
  @property moveType: string = 'straight'  // 'straight' | 'sine' | 'chase'
  @property scoreValue: number = 100

  private startX: number = 0
  private elapsed: number = 0
  private player: Node | null = null

  onLoad() {
    this.startX = this.node.position.x
    this.player = find('Player')
  }

  update(dt: number) {
    this.elapsed += dt
    const pos = this.node.position.clone()

    switch (this.moveType) {
      case 'straight':
        pos.y -= this.speed * dt
        break

      case 'sine': {
        // 正弦波摆动——左右摇摆着往下飞
        pos.y -= this.speed * dt
        const frequency = 3        // 摆动频率（越大越快）
        const amplitude = 100      // 摆动幅度（像素）
        pos.x = this.startX + Math.sin(this.elapsed * frequency) * amplitude
        break
      }

      case 'chase':
        if (this.player?.isValid) {
          // 追踪玩家——飞向玩家所在位置
          const dir = this.player.position.clone().subtract(pos).normalize()
          pos.x += dir.x * this.speed * dt
          pos.y += dir.y * this.speed * dt  // 注意追踪可能会往上飞！
        }
        break
    }

    this.node.setPosition(pos)

    // 出屏检测（下方或上下左右出屏就回收）
    if (pos.y &lt; -600 || pos.y > 800) {
      this.recycle()
    }
  }

  takeDamage(dmg: number) {
    this.hp -= dmg
    if (this.hp &lt;= 0) {
      eventBus.emit('enemy-killed', { type: this.moveType, score: this.scoreValue })
      this.recycle()
    }
  }

  private recycle() {
    // 归还对象池（Phase 15 会细讲）
    EnemyPool.instance.put(this.node)
  }
}</pre>
      <p><strong>2. Boss 敌机——多阶段行为</strong></p>
      <pre>// 给 Boss 加一个简单的阶段切换
@ccclass('BossEnemy')
export class BossEnemy extends Enemy {
  @property maxHp: number = 50
  private phase: number = 1

  takeDamage(dmg: number) {
    super.takeDamage(dmg)
    const ratio = this.hp / this.maxHp

    // 血量低于 50% 进入二阶段：变快 + 开始扇形射击
    if (ratio &lt; 0.5 && this.phase === 1) {
      this.phase = 2
      this.speed *= 1.5
      this.startShooting('spread')  // 开始用扇形弹攻击玩家
    }
    // 血量低于 20% 进入三阶段：更快 + 追踪弹
    if (ratio &lt; 0.2 && this.phase === 2) {
      this.phase = 3
      this.speed *= 1.3
      this.startShooting('homing')
    }
  }
}</pre>
      <p><strong>3. 敌机生成器（Spawn Timer）</strong></p>
      <pre>// EnemySpawner.ts —— 挂在一个空节点上
@ccclass('EnemySpawner')
export class EnemySpawner extends Component {
  @property spawnInterval: number = 1.5   // 每隔 1.5 秒生成一波

  private timer: number = 0

  update(dt: number) {
    this.timer += dt
    if (this.timer >= this.spawnInterval) {
      this.timer = 0
      this.spawnWave()
    }
  }

  private spawnWave() {
    // 随机选一种敌机类型生成
    const types = ['straight', 'sine', 'chase']
    const type = types[Math.floor(Math.random() * types.length)]
    const enemy = EnemyPool.instance.get()
    const comp = enemy.getComponent(Enemy)
    comp.moveType = type
    comp.hp = type === 'straight' ? 1 : type === 'sine' ? 3 : 5
    comp.speed = type === 'straight' ? 250 : type === 'sine' ? 180 : 120
    // 随机水平位置生成
    enemy.setPosition(Math.random() * 500 - 250, 600, 0)
  }
}</pre>
      <p><strong>验证：</strong> 把三个配置不同的 Enemy 预制体拖进场景，观察它们的移动轨迹是否和预期一致。Boss 的搜索你先把血量调成 10 测试阶段切换。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>弹幕游戏（Bullet Hell）的设计哲学：</strong> 《东方 Project》系列是弹幕游戏的代表。它的设计哲学不是"让玩家躲不开"，而是"让子弹看起来密密麻麻但总有路可走"。子弹的排列有自己的几何美学——扇形、螺旋、交叉线阵。好的弹幕设计是一种视觉艺术。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>什么时候用简单的直线/正弦运动就够了，什么时候需要贝塞尔曲线？提示：想想游戏节奏和小怪 vs Boss 的区别。</li>
        <li>定时器生成（timer-based）和波次生成（wave-based）各有什么优缺点？假设你要做一个"连续三波小型敌机→一波中型→Boss"的关卡，两种方式分别要怎么写？</li>
        <li>有限状态机（FSM）对敌机 AI 有什么帮助？如果不用 FSM，直接在 update 里用一堆 if/else 判断 Boss 的当前阶段，代码会变成什么样？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
