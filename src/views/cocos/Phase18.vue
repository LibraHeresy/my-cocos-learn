<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="18" title="2D 物理引擎入门" duration="2-3 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解<strong>RigidBody2D 三种类型</strong>的区别，知道何时用 Static、Dynamic、Kinematic</li>
        <li>为你的节点添加<strong>碰撞体（Collider2D）</strong>——Box、Circle、Polygon、Edge 各自的使用场景</li>
        <li>用<strong>物理材质</strong>控制摩擦、弹性、密度——让球"弹"起来，让冰面"滑"起来</li>
        <li>监听<strong>碰撞回调</strong>（onBeginContact / onEndContact），在子弹命中或角色落地时执行逻辑</li>
        <li>用内置物理引擎<strong>替代手写 AABB 碰撞</strong>，让代码量从 200 行降到 50 行</li>
        <li>理解物理引擎的<strong>适用边界</strong>——什么时候用它，什么时候不该用</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="⚙️" title="RigidBody2D——物体会不会动，由谁决定">
      <p>
        RigidBody2D 决定了物体的"物理身份"——它在物理世界中的角色。理解这三种类型，就像理解 CSS 中的 <code>position</code> 属性一样重要。
      </p>

      <h3>三种类型对比</h3>
      <table>
        <thead>
          <tr>
            <th>类型</th>
            <th>受力？</th>
            <th>可移动？</th>
            <th>典型场景</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Static</strong></td>
            <td>不受力</td>
            <td>不能移动</td>
            <td>地面、墙壁、平台</td>
            <td><code>position: static</code>——固定不动的基础布局</td>
          </tr>
          <tr>
            <td><strong>Dynamic</strong></td>
            <td>受重力、推力</td>
            <td>物理驱动</td>
            <td>玩家角色、掉落物品、弹球</td>
            <td><code>position: absolute</code>——由坐标系统/规则决定位置</td>
          </tr>
          <tr>
            <td><strong>Kinematic</strong></td>
            <td>不受力</td>
            <td>代码手动控制</td>
            <td>移动平台、升降梯、巡逻敌人</td>
            <td><code>position: fixed</code>——手动指定位置，不受流式布局影响</td>
          </tr>
        </tbody>
      </table>

      <h3>Static——物理世界的"地基"</h3>
      <p>
        Static 物体永远不会移动。物理引擎在内部会把所有 Static 物体放在一棵<strong>静态碰撞树</strong>上，查询效率远高于动态物体。地面、墙壁、不可破坏的障碍物都应该设为 Static。
      </p>

      <h3>Dynamic——物理世界的主角</h3>
      <p>
        Dynamic 物体受重力影响，会下落、会碰撞反弹、会被推力推动。它是物理引擎存在的主要理由。玩家的角色、敌人、掉落的金币都是 Dynamic。你可以通过 <code>applyForce</code>、<code>applyLinearImpulse</code> 来控制它们。
      </p>

      <h3>Kinematic——半自动的"传送带"</h3>
      <p>
        Kinematic 物体不受重力，也不会被碰撞推走——它们的位置完全由你的代码控制（设置 <code>linearVelocity</code> 或直接修改位置）。典型用例：移动平台（左右来回）、升降梯（上下移动）。和 Dynamic 的关键区别：Kinematic 撞到其他物体会把对方"推开"，但自己不会被对方推动——就像传送带推箱子。
      </p>

      <pre><code>// RigidBody2D 创建与类型设置
import { _decorator, Component, RigidBody2D, ERigidBody2DType } from 'cc'

export class PhysicsSetup extends Component {
  onLoad() {
    // 获取或添加 RigidBody2D 组件
    let rb = this.node.getComponent(RigidBody2D)
    if (!rb) {
      rb = this.node.addComponent(RigidBody2D)
    }

    // 设置为 Dynamic 类型（受重力影响）
    rb.type = ERigidBody2DType.Dynamic
    rb.gravityScale = 1.0        // 使用世界重力（默认值）
    rb.linearDamping = 0.5       // 线性阻尼——模拟空气阻力
    rb.angularDamping = 0.3      // 角阻尼——减慢旋转
    rb.fixedRotation = false     // 是否锁定旋转（角色通常设为 true）

    // 对于地面，设置为 Static
    // rb.type = ERigidBody2DType.Static

    // 对于移动平台，设置为 Kinematic
    // rb.type = ERigidBody2DType.Kinematic
  }
}</code></pre>

      <div class="tip-box">
        <strong>选择建议：</strong>如果你不确定用 Dynamic 还是 Kinematic，问自己一个问题——"这个物体需要自然下落吗？"需要下落（角色、道具）→ Dynamic；不需要下落但需要碰撞（移动平台）→ Kinematic；完全不动（地面、墙壁）→ Static。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📦" title='Collider2D——物体的"形状"由碰撞体定义'>
      <p>
        碰撞体是物理引擎判断"两个物体是否接触"的依据。一个节点可以挂多个 Collider2D（双手剑角色：身体是 Box，剑身是 Polygon）。这和 CSS 的 <code>border</code> 不同——边框只是视觉效果，碰撞体是真实的物理边界。
      </p>

      <h3>四种碰撞体类型</h3>
      <table>
        <thead>
          <tr>
            <th>类型</th>
            <th>形状</th>
            <th>性能</th>
            <th>适用场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>BoxCollider2D</strong></td>
            <td>矩形</td>
            <td>最快</td>
            <td>地面、墙壁、方形角色（如像素游戏主角）</td>
          </tr>
          <tr>
            <td><strong>CircleCollider2D</strong></td>
            <td>圆形</td>
            <td>很快</td>
            <td>弹球、金币、圆形角色（如割绳子的小怪物）</td>
          </tr>
          <tr>
            <td><strong>PolygonCollider2D</strong></td>
            <td>自定义多边形</td>
            <td>较慢</td>
            <td>地形、不规则障碍物、复杂角色轮廓</td>
          </tr>
          <tr>
            <td><strong>EdgeCollider2D</strong></td>
            <td>线段/折线</td>
            <td>较快</td>
            <td>斜坡、曲线地面、地形边界</td>
          </tr>
        </tbody>
      </table>

      <h3>碰撞体选择实战</h3>
      <pre><code>// 为角色设置"胶囊体"碰撞（两圆一方组合的效果）
// 实际做法：用两个碰撞体模拟——一个 BoxCollider2D + 一个 CircleCollider2D

// 地面：多个 BoxCollider2D 拼成台阶
// 斜坡：EdgeCollider2D 画出一个斜面

// 金币：CircleCollider2D，设置 radius
import { CircleCollider2D } from 'cc'
const coinCollider = coinNode.addComponent(CircleCollider2D)
coinCollider.radius = 20
coinCollider.sensor = true  // 设为传感器——穿过时触发回调但不产生物理碰撞
</code></pre>

      <div class="warn-box">
        <strong>性能提示：</strong>PolygonCollider2D 的顶点数不要超过 <strong>8 个</strong>。越复杂的多边形，物理计算开销越大。对于复杂的碰撞形状，用多个简单的 Box/Circle 拼凑代替一个复杂的 Polygon——物理引擎做多个简单碰撞测试比做一个复杂多边形测试更快。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎈" title="物理材质——摩擦、弹性、密度">
      <p>
        物理材质（PhysicsMaterial2D）定义了物体表面的物理属性。它就像 CSS 中的 <code>transition-timing-function</code> 或动画曲线——控制物体在碰撞时的行为特征。
      </p>

      <h3>三个核心属性</h3>
      <table>
        <thead>
          <tr>
            <th>属性</th>
            <th>范围</th>
            <th>含义</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>friction</strong>（摩擦）</td>
            <td>0 - 1</td>
            <td>0 = 冰面（完全光滑），1 = 砂纸（高摩擦）</td>
            <td><code>scroll-behavior: smooth</code> vs <code>auto</code></td>
          </tr>
          <tr>
            <td><strong>restitution</strong>（弹性）</td>
            <td>0 - 1</td>
            <td>0 = 完全不弹（铅球落地），1 = 完全弹性（超级弹球）</td>
            <td><code>animation: bounce</code> 的弹性程度</td>
          </tr>
          <tr>
            <td><strong>density</strong>（密度）</td>
            <td>0+</td>
            <td>影响质量计算——密度越大质量越大</td>
            <td>没有直接类比，但类似 <code>font-weight</code> 对文字渲染"重量"的影响</td>
          </tr>
        </tbody>
      </table>

      <pre><code>// 创建不同物理材质
import { PhysicsMaterial2D } from 'cc'

// 冰面材质
const iceMaterial = new PhysicsMaterial2D()
iceMaterial.friction = 0.05
iceMaterial.restitution = 0.1
iceMaterial.density = 1.0

// 弹球材质
const bouncyMaterial = new PhysicsMaterial2D()
bouncyMaterial.friction = 0.3
bouncyMaterial.restitution = 0.9  // 高弹性——弹很高
bouncyMaterial.density = 0.5

// 铅球材质
const heavyMaterial = new PhysicsMaterial2D()
heavyMaterial.friction = 0.8
heavyMaterial.restitution = 0.01 // 几乎不弹
heavyMaterial.density = 10.0     // 高密度——很重

// 将材质应用到碰撞体
import { BoxCollider2D } from 'cc'
const collider = this.node.getComponent(BoxCollider2D)
collider.material = bouncyMaterial</code></pre>

      <div class="tip-box">
        <strong>常识经验：</strong>restitution 不要设超过 1.0——现实中不存在"越弹越高"的物体（违反能量守恒）。但游戏中设 1.05 可以得到夸张的弹跳效果（如街机弹球），这是一种<strong>游戏感知</strong>上的优化——玩家觉得"爽"比物理正确更重要。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="💥" title='碰撞回调——当两个物体"相遇"时'>
      <p>
        碰撞回调是物理引擎最实用的功能之一。它就像前端的<strong>事件监听</strong>——你不需要每帧检查两个物体是否碰到，物理引擎在碰撞发生的<strong>那一刻</strong>会主动通知你。
      </p>

      <h3>两个关键回调</h3>
      <table>
        <thead>
          <tr>
            <th>回调</th>
            <th>触发时机</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>onBeginContact</strong></td>
            <td>两个碰撞体<strong>刚接触</strong>的第一帧</td>
            <td><code>mouseenter</code> 事件——鼠标刚进入元素</td>
          </tr>
          <tr>
            <td><strong>onEndContact</strong></td>
            <td>两个碰撞体<strong>分离</strong>的第一帧</td>
            <td><code>mouseleave</code> 事件——鼠标离开元素</td>
          </tr>
        </tbody>
      </table>

      <h3>实战：平台游戏角色落地检测</h3>
      <pre><code>import { _decorator, Component, Collider2D, Contact2DType, IPhysics2DContact,
  RigidBody2D, Vec2, input, Input, KeyCode } from 'cc'

export class PlatformerPlayer extends Component {
  private _rb: RigidBody2D = null
  private _onGround: boolean = false
  private _jumpForce: number = 600

  onLoad() {
    this._rb = this.node.getComponent(RigidBody2D)

    // 注册碰撞回调
    const collider = this.node.getComponent(Collider2D)
    if (collider) {
      collider.on(Contact2DType.BEGIN_CONTACT, this._onBeginContact, this)
      collider.on(Contact2DType.END_CONTACT, this._onEndContact, this)
    }

    // 键盘输入：跳跃
    input.on(Input.EventType.KEY_DOWN, (event) => {
      if (event.keyCode === KeyCode.SPACE && this._onGround) {
        this._jump()
      }
    })
  }

  private _onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D,
                          contact: IPhysics2DContact) {
    // 判断碰撞法线方向——如果是"脚底"方向的碰撞，说明踩到了地面
    const normal = contact.getWorldManifold().normal
    if (normal.y > 0.5) {  // 法线朝上 → 脚底接触了地面
      this._onGround = true
    }

    // 判断碰到了什么
    if (otherCollider.node.name === 'Spike') {
      this._die()
    } else if (otherCollider.node.name.startsWith('Coin')) {
      this._collectCoin(otherCollider.node)
    }
  }

  private _onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    // 离开地面
    this._onGround = false
  }

  private _jump() {
    this._rb.applyLinearImpulseToCenter(new Vec2(0, this._jumpForce), true)
  }

  private _die() {
    console.log('玩家踩到陷阱，死亡！')
  }

  private _collectCoin(coinNode: Node) {
    console.log('收集到金币！')
    coinNode.destroy()
  }
}</code></pre>

      <h3>传感器（Sensor）——只通知，不碰撞</h3>
      <p>
        将 Collider2D 的 <code>sensor</code> 设为 <code>true</code>，它就变成一个"探测器"——碰撞回调仍然触发，但不会产生物理排斥力。这就像前端的 <code>IntersectionObserver</code>——观察元素是否"穿过"某个区域，但不影响页面布局。典型用例：检查点（Checkpoint）、金币收集区、敌人视野范围。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="🌍" title="重力与物理世界设置">
      <p>
        整个物理世界有一个全局重力配置。在 Cocos Creator 中，进入项目设置 → 物理 → 2D 物理 → 重力（Gravity），默认值是 <code>(0, -10)</code>（向下 10 m/s^2，接近真实重力 9.8）。修改这个值可以瞬间改变整个游戏的物理体验。
      </p>

      <pre><code>// 运行时修改重力
import { PhysicsSystem2D, Vec2 } from 'cc'

// 月球重力（约为地球的 1/6）
PhysicsSystem2D.instance.gravity = new Vec2(0, -1.6)

// 横向卷轴——重力方向改为向下
// PhysicsSystem2D.instance.gravity = new Vec2(0, -10)

// 需要"反向重力"的关卡？
// PhysicsSystem2D.instance.gravity = new Vec2(0, 10)

// 也可以通过 PhysicsSystem2D 获取其他设置
console.log('当前重力:', PhysicsSystem2D.instance.gravity)
PhysicsSystem2D.instance.enable = true  // 是否启用物理</code></pre>

      <div class="tip-box">
        <strong>单独控制重力：</strong>如果你想让某个特定的物体不受重力影响（如飘浮的云朵），不要去改全局重力。设置那个物体的 <code>gravityScale = 0</code> 即可。这和 CSS 中给单个元素设置 <code>transform</code> 而不影响整个页面布局是同样的思路。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔄" title="手写 AABB vs 内置物理——何时用哪个">
      <p>
        在 Phase 5 中你手写了 AABB 碰撞检测——只用了 30 行代码就实现了矩形碰撞判断。那么什么时候该切换到内置物理引擎呢？
      </p>

      <h3>对比分析</h3>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>手写 AABB（Phase 5）</th>
            <th>内置物理引擎（Phase 18）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>代码量</td>
            <td>30-50 行</td>
            <td>几乎零代码（编辑器配置 + 少量回调）</td>
          </tr>
          <tr>
            <td>碰撞形状</td>
            <td>仅矩形（AABB）</td>
            <td>矩形、圆形、多边形、线段</td>
          </tr>
          <tr>
            <td>碰撞响应</td>
            <td>需要自己写分离/推进逻辑</td>
            <td>自动处理——你不会穿模</td>
          </tr>
          <tr>
            <td>重力/摩擦力</td>
            <td>全部自己算</td>
            <td>引擎托管，零代码</td>
          </tr>
          <tr>
            <td>性能</td>
            <td>极少对象时更快（无引擎开销）</td>
            <td>大量对象时更快（有空间索引加速）</td>
          </tr>
          <tr>
            <td>确定性问题</td>
            <td>完全可预测（你自己算的）</td>
            <td>可能每次结果略有不同</td>
          </tr>
        </tbody>
      </table>

      <h3>选择决策树</h3>
      <ul>
        <li><strong>用内置物理引擎——</strong>你的游戏需要重力、碰撞反弹、堆叠物体、斜坡地形——这些都是物理引擎的拿手好戏。例如：愤怒的小鸟、割绳子、平台跳跃游戏。</li>
        <li><strong>用手写碰撞检测——</strong>你的游戏只需要简单的"碰到了没有"判断，不需要物理响应。例如：弹幕射击游戏（子弹碰到玩家 = 伤害，但不需要弹开）、吃豆人（碰到豆子 = 得分）、俄罗斯方块。</li>
        <li><strong>混合使用——</strong>角色的平台跳跃用内置物理，子弹碰撞用手写 AABB。Cocos 支持物理和非物理节点共存。</li>
      </ul>

      <div class="warn-box">
        <strong>确定性警告：</strong>Box2D（Cocos 内置的 2D 物理引擎）不是确定性的。这意味着同样的输入，在不同帧率、不同设备上可能导致<strong>微小差异</strong>的物理结果（碰撞位置差几个像素）。如果你的游戏逻辑<strong>严格依赖</strong>物理结果（如帧同步格斗游戏的回滚机制），或者需要<strong>录制/回放</strong>（如竞速幽灵车），内置物理引擎<strong>不适合</strong>——你需要自己实现确定性的碰撞系统。但对于绝大多数休闲游戏，这些微小差异肉眼完全不可见——放心用就好。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 为什么我的 Dynamic 物体穿过地面掉下去了？</h3>
      <p>
        检查三点：(1) 地面节点上是否挂了 Collider2D（没有碰撞体 = 不存在于物理世界）；(2) 地面的 RigidBody2D 类型是否为 Static（Dynamic 地面会被推走）；(3) 碰撞体的 size 是否设对了——如果不小心设成了 0x0，那就等于没有碰撞体。
      </p>

      <h3>Q2: 两个 Dynamic 物体碰撞后疯狂抖动怎么办？</h3>
      <p>
        这是因为物理引擎在"挤出"重叠的物体。常见原因是：(1) 物体的移动速度太快——一帧就穿过另一个物体（子弹穿过薄墙），解决方法：勾选 <strong>Bullet</strong> 属性（开启 CCD 连续碰撞检测）；(2) 缩放比例问题——碰撞体大小和实际视觉不匹配。
      </p>

      <h3>Q3: Sensor 和普通 Collider 的区别到底是什么？</h3>
      <p>
        普通 Collider：碰撞时产生物理响应（弹开、阻挡）。Sensor（传感器）：碰撞时只触发回调，不产生物理响应。类比：普通 Collider 是"墙"——撞到会停住；Sensor 是"红外探测器"——通过时会触发警报，但你可以直接走过去。
      </p>

      <h3>Q4: 如何实现"按住越久跳越高"的蓄力跳跃？</h3>
      <p>
        用 Dynamic RigidBody，在按键按下时记录时间，在按键松开时根据按压时长计算力的大小，然后调用 <code>applyForce</code> 或 <code>applyLinearImpulse</code>。不要在 <code>update()</code> 里每帧加力——那是手动物理，应该用 Kinematic。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>RigidBody2D 的三种类型（Static、Dynamic、Kinematic）各有什么区别？分别对应什么游戏对象？</li>
        <li>四种 Collider2D（Box、Circle、Polygon、Edge）的性能排序是什么？圆形和矩形哪个更快？</li>
        <li>物理材质的三个核心属性（friction、restitution、density）分别控制什么？restitution 设为 2.0 会发生什么？</li>
        <li><code>onBeginContact</code> 和 <code>onEndContact</code> 分别在什么时候触发？如何判断碰撞方向？</li>
        <li>Sensor（传感器）的作用是什么？和普通碰撞体的区别在哪里？</li>
        <li>Cocos 2D 物理引擎的默认重力值是多少？如何修改？如何让单个物体不受重力？</li>
        <li>什么情况下应该用内置物理引擎？什么情况下应该手写碰撞检测？说出至少两个判断依据。</li>
        <li>为什么物理引擎不适合帧同步格斗游戏？"非确定性"是什么意思？</li>
        <li>物体速度太快导致穿模（Bullet through paper）怎么解决？</li>
        <li>两个物体碰撞后频繁进入/退出碰撞状态（抖动）的原因是什么？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
