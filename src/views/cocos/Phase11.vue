<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="11" title="子弹系统与发射模式" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>子弹是射击游戏中最频繁创建和销毁的对象。单发还好，双发、霰弹、追踪弹——发射模式一变，代码就得跟着重构。这一节教你设计一个<strong>与发射模式解耦的子弹系统</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔄" title="子弹生命周期">
      <pre>创建（instantiate / 对象池取出）
  → 初始化（设置位置、方向、速度、伤害值）
  → 飞行（每帧 update：position += direction * speed * dt）
  → 判定（碰撞检测 or 出屏检测）
  → 回收（destroy / 归还对象池）</pre>
    </ConceptBlock>

    <ConceptBlock icon="🎯" title="发射模式">
      <pre>// 单发
bullets.push(new Bullet(pos, dir))

// 双发（并排两个子弹）
bullets.push(new Bullet(pos + offset, dir))
bullets.push(new Bullet(pos - offset, dir))

// 扇形（N 发，每发角度偏移）
for (let i = 0; i < 5; i++) {
  const angle = -30 + i * 15  // -30° 到 +30° 均匀分布
  const dir = rotate(baseDir, angle)
  bullets.push(new Bullet(pos, dir))
}

// 追踪（方向每帧更新指向目标）
update(dt: number) {
  this.dir = this.target.position.subtract(this.node.position).normalize()
  this.node.position = this.node.position.add(this.dir.multiplyScalar(this.speed * dt))
}</pre>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="解耦设计：别管发射什么，只管怎么发射">
      <p>把发射模式抽象成接口，子弹系统就不需要知道具体怎么发射：</p>
      <pre>interface FirePattern {
  getBullets(origin: Vec3, baseDir: Vec3): BulletConfig[]
}

class SingleShot implements FirePattern { /* 返回 1 发 */ }
class DoubleShot implements FirePattern { /* 返回 2 发 */ }
class SpreadShot implements FirePattern { /* 返回 N 发扇形 */ }

// 使用时：
this.currentPattern = this.powerUpActive ? new SpreadShot(5, 30) : new DoubleShot()</pre>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：实现三种发射模式">
      <p>现在轮到你动手了。在你的 Cocos 项目中，新建一个 <code>FirePattern.ts</code> 文件，把下面三种发射模式实现出来，然后在玩家飞机的 update 里切换测试：</p>
      <p><strong>1. 单发直射（SingleShot）</strong></p>
      <pre>// 最基础的发射模式——朝正前方射出一颗子弹
class SingleShot implements FirePattern {
  getBullets(origin: Vec3, baseDir: Vec3): BulletConfig[] {
    return [{ position: origin.clone(), direction: baseDir.clone(), speed: 500 }]
  }
}</pre>
      <p><strong>2. 扇形散射（SpreadShot）——传入子弹数量和总角度</strong></p>
      <pre>// 比如 new SpreadShot(5, 45) 会在前方 45° 范围内均匀射出 5 发
class SpreadShot implements FirePattern {
  constructor(private bulletCount: number, private totalAngle: number) {}

  getBullets(origin: Vec3, baseDir: Vec3): BulletConfig[] {
    const bullets: BulletConfig[] = []
    const startAngle = -this.totalAngle / 2
    const step = this.totalAngle / (this.bulletCount - 1)

    for (let i = 0; i &lt; this.bulletCount; i++) {
      const rad = (startAngle + i * step) * (Math.PI / 180)
      const dir = new Vec3(
        baseDir.x * Math.cos(rad) - baseDir.y * Math.sin(rad),
        baseDir.x * Math.sin(rad) + baseDir.y * Math.cos(rad),
        0
      )
      bullets.push({ position: origin.clone(), direction: dir.normalize(), speed: 400 })
    }
    return bullets
  }
}</pre>
      <p><strong>3. 追踪弹（HomingMissile）——每帧重新计算方向指向目标</strong></p>
      <pre>// 追踪弹的 getBullets 本身返回的是普通的单发，区别在 Bullet 的 update 里
class HomingMissile implements FirePattern {
  constructor(private target: Node) {}

  getBullets(origin: Vec3, baseDir: Vec3): BulletConfig[] {
    return [{
      position: origin.clone(),
      direction: baseDir.clone(), // 初始方向不重要，每帧会重新算
      speed: 200,
      // 标记为追踪弹，Bullet 脚本根据自己的 type 来决定 update 行为
      extra: { type: 'homing', target: this.target }
    }]
  }
}

// 在 Bullet 组件的 update 中：
if (this.config.extra?.type === 'homing') {
  const target = this.config.extra.target
  if (target.isValid) {
    this.dir = target.position.clone().subtract(this.node.position).normalize()
  }
}
this.node.position = this.node.position.add(this.dir.multiplyScalar(this.speed * dt))</pre>
      <p><strong>测试方法：</strong> 在玩家飞机的脚本里加一个 <code>cyclePattern()</code> 方法，按 E 键在三种模式之间切换。进游戏后你能直观感受到：单发适合精确瞄准，扇形适合清小怪群，追踪弹适合打移动目标。</p>
      <pre>// PlayerController.ts 里加上
private patterns: FirePattern[] = [
  new SingleShot(),
  new SpreadShot(5, 45),
  new HomingMissile(this.findNearestEnemy())
]
private patternIndex = 0

onKeyDown(key: KeyCode) {
  if (key === KeyCode.KEY_E) {
    this.patternIndex = (this.patternIndex + 1) % this.patterns.length
    console.log('切换到发射模式:', this.patternIndex)
  }
  if (key === KeyCode.SPACE) {
    const configs = this.patterns[this.patternIndex].getBullets(this.node.position, Vec3.UP)
    for (const config of configs) {
      this.bulletPool.spawn(config)
    }
  }
}</pre>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>从《太空侵略者》到东方 Project——弹幕游戏简史：</strong> 1978 年《太空侵略者》问世时，屏幕上只有一颗敌机子弹在飞。到 1997 年，ZUN 一个人开发出《东方 Project》，同一个屏幕上有成百上千颗子弹在跳舞——这就是"弹幕地狱"（Bullet Hell）的诞生。东方系列的子弹排列不只是为了难，更是一种几何美学：扇形弹、螺旋弹、交叉线阵、激光切割……每一张符卡（Spell Card）都是一幅动态的图案。下回你玩射击游戏时，别光顾着躲，抬头看看子弹的排列有没有规律——好游戏的弹幕里一定藏着美。</li>
        <li><strong>对象池为什么对子弹系统至关重要：</strong> 你的游戏一秒钟可能射出 30 发子弹，一发子弹存活 2 秒，峰值时屏幕上就有 60 个子弹节点。如果每发子弹都是 <code>instantiate()</code> 创建、<code>destroy()</code> 销毁，JS 引擎会在几秒内产生上千次 GC（垃圾回收）。每次 GC 触发都会暂停所有 JS 执行 10-50ms——画面就这么"卡"一下。Phase 15 会详细讲对象池怎么一劳永逸地解决这个问题，现在你只需要记住：子弹绝不直接 new 或 instantiate，必须从池里取。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>为什么子弹发射逻辑要和子弹本身解耦？如果三种发射模式的逻辑都写在 PlayerController 里，当你想加第四种发射模式（比如旋转弹）时，需要改哪些代码？</li>
        <li>圆形发射模式（一圈子弹同时向 360° 射出）要怎么实现？试着在脑子里写出 <code>getBullets</code> 的循环逻辑。</li>
        <li>一颗子弹从出生到死亡走过了哪些阶段？在哪个阶段最容易产生性能问题？为什么？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
