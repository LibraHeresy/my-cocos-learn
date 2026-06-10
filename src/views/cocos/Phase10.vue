<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="10" title="碰撞检测" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>游戏世界需要"规则"——子弹打中敌机、玩家碰到道具、敌机撞到玩家。这些都靠<strong>碰撞检测</strong>来实现。它是游戏中最基础的物理法则。</p>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="从手写 AABB 开始">
      <p>在 Cocos 内置碰撞系统之下，最基础的是 AABB（Axis-Aligned Bounding Box，轴对齐包围盒）。它的原理简单到你可以 30 秒手写出来：</p>
      <pre>function checkAABB(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y
}
// 四个条件全是"小于"——任何一个不满足就不重叠</pre>
      <p>理解手写 AABB 的价值在于：当你需要做精确到像素的碰撞、或者需要在 update 中批量检测 100 个对象时，你知道底层的原理是什么，知道什么时候内置系统够用，什么时候需要自己优化。</p>
    </ConceptBlock>

    <ConceptBlock icon="🎯" title="Cocos 内置碰撞系统">
      <p>手写 AABB 只适合简单场景。当你有子弹/敌机/道具/玩家四类对象互相碰撞时，手写会变成嵌套循环的地狱。Cocos 内置系统帮你做这些：</p>
      <pre>// 1. 给节点加 Collider2D（Box/Circle/Polygon）
// 2. 配置碰撞分组（Group）
// 3. 配置碰撞矩阵（哪些 Group 之间要检测碰撞）

// Group 必须用 2 的幂次（位掩码）
const BULLET = 1   // 0001
const ENEMY  = 2   // 0010
const PLAYER = 4   // 0100
const POWERUP = 8  // 1000

// 碰撞矩阵：BULLET & ENEMY = true, PLAYER & ENEMY = true
// BULLET & PLAYER = false（自己的子弹不该打自己）</pre>
    </ConceptBlock>

    <ConceptBlock icon="🔄" title="触发 vs 碰撞：穿透检测 vs 物理阻挡">
      <ul>
        <li><strong>碰撞（Collision）：</strong> 两个物体碰到会互相弹开，有物理反馈。适合"子弹打中敌机后子弹消失"这种场景。</li>
        <li><strong>触发（Trigger）：</strong> 勾选 "Is Sensor" 后，物体可以穿透但会触发回调。适合"玩家走过一道门，触发剧情"或"道具碰到玩家被拾取"。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：手写 AABB 与内置碰撞系统对比">
      <p>理解碰撞检测最好的方式，就是先自己写一遍，再用引擎的——你会立刻明白引擎帮你省了多少事：</p>
      <ol>
        <li><strong>手写 AABB 碰撞函数：</strong> 新建一个脚本，写一个纯函数 <code>checkAABB(a, b)</code>，输入两个矩形（各有 x, y, width, height），返回布尔值。测试几个边界情况——刚好相切算不算碰撞？一个完全在另一个里面呢？</li>
      </ol>
      <pre>// 先别急着往下看，自己写试试——就 4 个条件
function checkAABB(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y
}</pre>
      <ol start="2">
        <li><strong>搭建内置碰撞场景：</strong> 在场景中创建 3 个 Sprite 节点，分别命名为"玩家""子弹""道具"。给每个节点添加 <code>BoxCollider2D</code> 组件，在属性检查器中设置它们的碰撞分组（Group）：</li>
      </ol>
      <pre>// 在项目设置 → 物理 → 碰撞矩阵中配置分组
PLAYER  = 1  (二进制 0001)
BULLET  = 2  (二进制 0010)
POWERUP = 4  (二进制 0100)

// 在碰撞矩阵中勾选：
// BULLET × PLAYER  = true（子弹打中玩家）
// PLAYER × POWERUP = true（玩家捡到道具）
// BULLET × POWERUP = false（子弹不该打道具）</pre>
      <ol start="3">
        <li><strong>写碰撞回调：</strong> 给其中一个节点挂脚本，实现 <code>onCollisionEnter</code> 回调。在代码中加一句 <code>console.log</code> 打印碰撞双方的名字。运行项目，在场景中手动拖动一个节点去撞另一个——看控制台有没有打印。</li>
      </ol>
      <pre>import { Collider2D, Contact2DType, IPhysics2DContact } from 'cc'

onLoad() {
  const collider = this.getComponent(Collider2D)
  if (collider) {
    collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this)
  }
}

onCollisionEnter(self: Collider2D, other: Collider2D, contact: IPhysics2DContact) {
  console.log(`${self.node.name} 撞到了 ${other.node.name}`)
}</pre>
      <p><strong>对比一下：</strong> 手写 AABB 只判断"两个矩形是否重叠"，但你还需要自己写循环去检测所有对象对、自己管理分组过滤、自己处理碰撞后的逻辑。内置系统把这些全封装好了——分组用位掩码在引擎底层就过滤掉了不需要检测的对，你只需要写回调逻辑。这才是真实项目里该用的方式。</p>
      <div class="tip-box">
        <strong>动手小挑战：</strong> 在第 1 步的手写 AABB 函数中，故意把其中一个 <code>&lt;</code> 写成 <code>&lt;=</code>，看看边界行为会怎么变。然后在第 3 步的内置系统中，把一个 Collider 的 <code>IsSensor</code> 勾上，观察回调行为的变化——从"撞到弹开"变成了"穿透但触发回调"。这就是 Trigger。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>四叉树（Quadtree）：</strong> 当场景中有 1000+ 个需要碰撞检测的对象时，每个都和其他所有对象检一次（O(n²)）会直接卡死。四叉树把空间递归分成四个象限，只检测同一象限内的对象，大幅减少检测次数。</li>
        <li><strong>Box2D 的作者 Erin Catto：</strong> 他是游戏物理引擎界的传奇人物。Box2D 被用于《愤怒的小鸟》《Limbo》等无数游戏。他把整个物理引擎开源，并在 GDC 上做了多年演讲。想深入理解 2D 物理，去读他的演讲幻灯片。</li>
      </ul>
    </ConceptBlock>
    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>AABB 碰撞检测的核心逻辑就 4 个条件。请你用一句话总结这 4 个条件的本质——它们在判断什么？（提示：不是让你背代码，是让你说清楚"两个矩形不重叠的条件是什么"然后反过来。）</li>
        <li>Trigger（IsSensor 勾选）和 Collision（不勾选）的行为区别是什么？分别用于什么游戏场景？举两个具体例子——比如"玩家走进传送门"和"子弹打中敌机"，哪个用 Trigger 哪个用 Collision？为什么？</li>
        <li>碰撞分组用位掩码（1, 2, 4, 8, 16...），为什么不用更直观的方案——比如给每个对象一个 <code>groups: string[]</code>？位掩码的核心优势是什么？提示：想想引擎在每一帧要判断"这 100 个对象和那 50 个对象要不要检测"时，用位运算 <code>&</code> 比遍历字符串数组快多少。</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
