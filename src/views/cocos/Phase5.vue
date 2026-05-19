<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="5" title="碰撞检测" duration="2-3 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>手写 AABB 和圆形碰撞检测算法</li>
        <li>封装 CollisionManager，集中管理游戏中所有碰撞检测</li>
        <li>实现碰撞可视化调试（开发阶段画出碰撞框）</li>
        <li>解决高速物体的"穿透"问题</li>
        <li>理解碰撞矩阵，正确管理不同阵营的碰撞关系</li>
      </ul>
    </ConceptBlock>

    <!-- ============ 两种碰撞方式 ============ -->
    <ConceptBlock icon="⚖️" title="内置物理 vs 手写碰撞">
      <p>
        Cocos
        提供了内置的物理碰撞系统（Collider2D），但对于像素飞机大战，<strong>手写碰撞更合适</strong>：
      </p>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>内置物理（Collider2D）</th>
            <th>手写碰撞</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>配置方式</td>
            <td>编辑器挂组件 + 配置参数</td>
            <td>纯代码，不依赖编辑器</td>
          </tr>
          <tr>
            <td>性能</td>
            <td>每个碰撞体有引擎开销</td>
            <td>极轻量，你控制一切</td>
          </tr>
          <tr>
            <td>子弹/敌人数量多时</td>
            <td>物理引擎开销大</td>
            <td>简单的数学运算，无额外开销</td>
          </tr>
          <tr>
            <td>调试</td>
            <td>物理引擎内置可视化</td>
            <td>需要自己画碰撞框</td>
          </tr>
          <tr>
            <td>适用场景</td>
            <td>复杂物理交互（碰撞反弹等）</td>
            <td>子弹碰撞、拾取道具、简单 hitbox</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>推荐：</strong
        >飞机大战中所有碰撞用手写。只有几十行代码，但性能和可控性远超物理引擎。你需要做的只是判断两个矩形是否重叠。
      </div>
    </ConceptBlock>

    <!-- ============ AABB ============ -->
    <ConceptBlock icon="📐" title="AABB 碰撞算法详解">
      <p>
        AABB（Axis-Aligned Bounding Box）=
        轴对齐包围盒。就是判断<strong>两个不旋转的矩形是否重叠</strong>。这是 2D
        游戏最常用的碰撞检测。
      </p>

      <h3>核心公式</h3>
      <pre><code>// 两个矩形碰撞的充分必要条件：
// 它们在 X 轴和 Y 轴上的投影都有重叠

interface Rect {
  x: number       // 中心 X
  y: number       // 中心 Y
  width: number   // 宽度
  height: number  // 高度
}

function rectCollide(a: Rect, b: Rect, tolerance: number = 0): boolean {
  const halfAW = a.width / 2 - tolerance
  const halfAH = a.height / 2 - tolerance
  const halfBW = b.width / 2 - tolerance
  const halfBH = b.height / 2 - tolerance

  return (
    Math.abs(a.x - b.x) < halfAW + halfBW &&
    Math.abs(a.y - b.y) < halfAH + halfBH
  )
}</code></pre>

      <h3>为碰撞体提供 BoundingBox</h3>
      <pre><code>// 每个需要碰撞检测的节点实现这个接口
interface ICollidable {
  getBBox(): Rect
}

// Enemy 组件实现
export class Enemy extends Component implements ICollidable {

  getBBox(): Rect {
    const uiTransform = this.node.getComponent(UITransform)
    return {
      x: this.node.position.x,
      y: this.node.position.y,
      width: uiTransform.width * this.node.scale.x,
      height: uiTransform.height * this.node.scale.y,
    }
  }
}</code></pre>

      <div class="warn-box">
        <strong>注意：</strong>上面的公式用的是节点中心坐标（Cocos
        默认锚点在中心）。如果节点的锚点不是 (0.5, 0.5)，需要用
        <code>getBoundingBox()</code> 或手动转换坐标。飞机大战建议所有碰撞体用中心锚点，计算最简单。
      </div>
    </ConceptBlock>

    <!-- ============ 圆形碰撞 ============ -->
    <ConceptBlock icon="⭕" title="圆形碰撞检测">
      <p>有些场景矩形碰撞不够好（比如圆形道具、爆炸范围），这时候用圆形碰撞：</p>

      <pre><code>interface Circle {
  x: number       // 圆心 X
  y: number       // 圆心 Y
  radius: number  // 半径
}

function circleCollide(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const distSq = dx * dx + dy * dy       // 距离的平方
  const radiusSum = a.radius + b.radius
  return distSq < radiusSum * radiusSum   // 比较平方值，避免开根号
}

// 矩形 vs 圆形碰撞
function rectCircleCollide(rect: Rect, circle: Circle): boolean {
  // 找到矩形上离圆心最近的点
  const closestX = Math.max(rect.x - rect.width / 2,
    Math.min(circle.x, rect.x + rect.width / 2))
  const closestY = Math.max(rect.y - rect.height / 2,
    Math.min(circle.y, rect.y + rect.height / 2))

  const dx = circle.x - closestX
  const dy = circle.y - closestY
  return dx * dx + dy * dy < circle.radius * circle.radius
}</code></pre>

      <div class="tip-box">
        <strong>性能提示：</strong>比较距离时用平方值（<code>distSq &lt; r²</code>），避免
        <code>Math.sqrt()</code>。开根号运算很慢，在每帧大量碰撞检测中会累积成性能问题。
      </div>
    </ConceptBlock>

    <!-- ============ CollisionManager ============ -->
    <ConceptBlock icon="🎛️" title="封装 CollisionManager">
      <p>不要把碰撞检测逻辑散落在各个组件中。集中管理碰撞检测，让代码清晰且易于调试：</p>

      <pre><code>import { Component, _decorator } from 'cc'
const { ccclass } = _decorator

interface Rect { x: number; y: number; width: number; height: number }

export interface ICollidable {
  getBBox(): Rect
  onCollision?(other: ICollidable): void
  group: string  // 'player' | 'enemy' | 'playerBullet' | 'enemyBullet' | 'item'
}

@ccclass('CollisionManager')
export class CollisionManager extends Component {

  static instance: CollisionManager

  private _collidables: ICollidable[] = []

  // 碰撞矩阵：定义哪些 group 之间需要检测
  private static MATRIX: Record&lt;string, string[]&gt; = {
    playerBullet: ['enemy'],
    enemyBullet:  ['player'],
    enemy:        ['player'],
    item:         ['player'],
  }

  onLoad() {
    CollisionManager.instance = this
  }

  register(target: ICollidable) {
    this._collidables.push(target)
  }

  unregister(target: ICollidable) {
    const idx = this._collidables.indexOf(target)
    if (idx !== -1) this._collidables.splice(idx, 1)
  }

  update(dt: number) {
    const list = this._collidables
    for (let i = 0; i < list.length; i++) {
      const a = list[i]
      if (!a.onCollision) continue

      const targets = CollisionManager.MATRIX[a.group]
      if (!targets) continue

      for (let j = i + 1; j < list.length; j++) {
        const b = list[j]
        if (!targets.includes(b.group)) continue

        if (rectCollide(a.getBBox(), b.getBBox())) {
          a.onCollision(b)
          b.onCollision?.(a)
        }
      }
    }
  }
}

function rectCollide(a: Rect, b: Rect): boolean {
  return (
    Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
    Math.abs(a.y - b.y) < (a.height + b.height) / 2
  )
}</code></pre>

      <h3>使用示例</h3>
      <pre><code>// Enemy.ts
export class Enemy extends Component implements ICollidable {
  group = 'enemy'

  onCollision(other: ICollidable) {
    if (other.group === 'playerBullet') {
      this.takeDamage()       // 被子弹击中
    } else if (other.group === 'player') {
      this.crash()            // 撞到玩家
    }
  }
}</code></pre>
    </ConceptBlock>

    <!-- ============ 穿透问题 ============ -->
    <ConceptBlock icon="🚀" title="高速物体的穿透问题">
      <p>当子弹速度足够快，一帧的位移超过碰撞体尺寸时，会直接从目标"穿过去"：</p>

      <pre><code>// 帧 N:  子弹 ●     |墙|     ← 还没碰到
// 帧 N+1:            |墙|  ● 子弹  ← 已经穿过

// 原因：每帧只检测当前帧的位置，两帧之间发生了什么不知道</code></pre>

      <h3>解决方案一：限制速度（最简单）</h3>
      <pre><code>// 确保每帧位移 < 碰撞体最小尺寸
// 子弹宽 8px，每帧最多移动 4px
// 这样永远不可能"跳过"一个宽 8px 的敌人
@property bulletSpeed: number = 240  // 240px/s ÷ 60fps = 4px/帧 < 8px ✓</code></pre>

      <h3>解决方案二：连续碰撞检测（CCD）</h3>
      <pre><code>// 从上一帧位置到当前帧位置做射线检测
function sweptAABB(prev: Rect, curr: Rect, target: Rect): boolean {
  // 简化版：在路径上多采样几个点
  const steps = Math.ceil(
    Math.abs(curr.x - prev.x) / target.width  // 需要几步采样
  )
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const sampled: Rect = {
      x: prev.x + (curr.x - prev.x) * t,
      y: prev.y + (curr.y - prev.y) * t,
      width: curr.width,
      height: curr.height,
    }
    if (rectCollide(sampled, target)) return true
  }
  return false
}</code></pre>

      <div class="tip-box">
        <strong>实战建议：</strong
        >飞机大战中先限制子弹速度（方案一），足够安全。如果后期引入了激光类高速武器（比如一帧横穿屏幕的射线），再考虑方案二。
      </div>
    </ConceptBlock>

    <!-- ============ 延迟销毁 ============ -->
    <ConceptBlock icon="⏳" title="延迟销毁——碰撞回调中的陷阱">
      <p>
        碰撞检测有一个<strong>非常容易踩的坑</strong>：在碰撞回调中直接
        <code>destroy()</code> 节点，但同一帧内其他对象可能还在引用它：
      </p>

      <pre><code>// ❌ 危险的写法：
onCollision(other: ICollidable) {
  if (other.group === 'playerBullet') {
    this.node.destroy()  // 立刻销毁！
    // 问题：如果同一帧内还有一颗子弹也碰到了这个敌机
    //       它的 onCollision 会收到一个已销毁节点的引用 → 报错
  }
}</code></pre>

      <h3>标准解法：标记-延迟清理</h3>
      <pre><code>// ✅ 安全的写法：只标记，不销毁
private _pendingKill = false

onCollision(other: ICollidable) {
  if (other.group === 'playerBullet' && !this._pendingKill) {
    this._pendingKill = true
    eventBus.emit('enemy:killed', { /* ... */ })
    // 不在这里 destroy！等 lateUpdate 处理
  }
}

lateUpdate() {
  if (this._pendingKill) {
    this.node.active = false
    this._pendingKill = false
    // 或者放入对象池：this.pool.put(this.node)
  }
}

// 在 CollisionManager 中也跳过高亮标记的对象
update(dt: number) {
  for (...) {
    if (a._pendingKill) continue  // 被标记销毁的跳过碰撞检测
    // ...
  }
}</code></pre>

      <div class="warn-box">
        <strong>规则：</strong>碰撞回调中<strong>只读数据、emit 事件、标记状态</strong
        >——永远不要在碰撞回调中 destroy 节点或修改碰撞体列表。销毁和回收统一放在
        <code>lateUpdate</code> 中处理。
      </div>
    </ConceptBlock>

    <!-- ============ 碰撞可视化调试 ============ -->
    <ConceptBlock icon="🔍" title="碰撞可视化调试">
      <p>开发阶段能看到碰撞框，效率提升 10 倍。写一个简单的调试绘制工具：</p>

      <pre><code>import { Graphics, Color } from 'cc'

// 在 Canvas 下建一个空节点，挂 Graphics 组件，作为调试绘制层
export class DebugDrawer extends Component {
  static instance: DebugDrawer
  private _graphics: Graphics

  onLoad() {
    DebugDrawer.instance = this
    this._graphics = this.node.getComponent(Graphics)
  }

  drawRect(rect: Rect, color: Color = Color.RED) {
    this._graphics.strokeColor = color
    this._graphics.lineWidth = 1
    this._graphics.rect(
      rect.x - rect.width / 2,
      rect.y - rect.height / 2,
      rect.width, rect.height
    )
    this._graphics.stroke()
  }

  lateUpdate() {
    // 每帧清空重画
    this._graphics.clear()

    // 画出所有注册的碰撞体（开发阶段）
    for (const c of CollisionManager.instance.collidables) {
      const color = getColorForGroup(c.group)
      DebugDrawer.instance.drawRect(c.getBBox(), color)
    }
  }
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>AABB 碰撞检测的数学原理是什么？能自己在纸上推导一遍吗？</li>
        <li>圆形碰撞检测中为什么用距离的平方而不是开根号？</li>
        <li>碰撞检测为什么应该集中管理（CollisionManager）而不是分散在各个组件中？</li>
        <li>什么是碰撞矩阵？它解决了什么问题？</li>
        <li>子弹"穿透"的原因是什么？有哪两种解决方案？</li>
        <li>为什么碰撞回调中不能直接 <code>destroy()</code> 对象？"延迟销毁"怎么做？</li>
        <li>碰撞可视化调试的价值是什么？你会怎么做？</li>
      </ul>
    </ConceptBlock>
  </PhaseLayout>
</template>
