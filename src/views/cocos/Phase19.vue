<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="19" title="2D 物理引擎" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>你手写了 AABB 碰撞。它好用，但当你需要重力、弹性、摩擦力时，手写就开始吃力了。Cocos 内置了 Box2D 物理引擎——这一节讲怎么用，以及<strong>什么时候应该用，什么时候手写就够了</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="⚖️" title="手写碰撞 vs 物理引擎：选型决策">
      <ul>
        <li><strong>用手写碰撞：</strong> 碰撞逻辑简单（AABB 够用）、对象数量少（&lt; 50）、不需要物理模拟（重力/弹力/摩擦）</li>
        <li><strong>用物理引擎：</strong> 需要真实物理反馈（弹跳、滚动、堆叠）、对象数量多（碰撞系统帮你优化）、需要关节/约束</li>
      </ul>
      <p>飞机大战应该用手写碰撞还是物理引擎？答案是<strong>手写碰撞</strong>。因为你的子弹不需要重力，敌机不需要弹性碰撞，所有交互都是"碰到→销毁"。没必要引入 Box2D 的复杂度。</p>
    </ConceptBlock>

    <ConceptBlock icon="⚙️" title="RigidBody2D 三种类型">
      <ul>
        <li><strong>Static：</strong> 不动的物体——地面、墙壁。质量为 0，不受力影响。</li>
        <li><strong>Dynamic：</strong> 受物理影响的物体——可以推、可以弹、受重力。</li>
        <li><strong>Kinematic：</strong> 代码控制移动，但参与碰撞检测——角色、移动平台。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：给精灵添加物理属性">
      <p>打开 Cocos Creator，找一个带 Sprite 的节点，跟着做：</p>
      <ol>
        <li><strong>添加物理组件：</strong> 选中节点 → 属性检查器 → 添加组件 → 2D Physics → RigidBody2D + BoxCollider2D。把 RigidBody2D 的 Type 设为 <code>Dynamic</code>。</li>
        <li><strong>配置重力：</strong> 项目设置 → 物理 → Gravity，Y 设置为 <code>-1000</code>。点击运行，你的精灵会开始往下掉。</li>
        <li><strong>调整物理属性：</strong> 把 RigidBody2D 的 <code>Mass</code> 设为 2，<code>Restitution</code>（弹性系数）设为 0.6。再创建一个带 BoxCollider2D 的静态矩形放在下方当作地面（Type 设为 <code>Static</code>）。运行看看——精灵落在地面上弹了几下才停住。这就是弹力的效果。</li>
        <li><strong>调参数感受差异：</strong> 试试把 Restitution 改成 0.1（像铅球落地）、0.9（像乒乓球）、1.0（完全弹性，不损失能量）。再把 <code>Friction</code>（摩擦系数）从 0.2 调到 1.0，看看精灵滑动的阻力变化。</li>
        <li><strong>用代码控制：</strong> 在脚本里 <code>rigidBody.applyForceToCenter(new Vec2(500, 0), true)</code> 给精灵一个向右的瞬时推力，像愤怒的小鸟一样弹射出去。</li>
      </ol>
      <p>这个小 demo 花 30 分钟做完，你就会对 RigidBody2D 的参数有直观感受——比读文档有效得多。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>Erin Catto 的 Box2D：</strong> Box2D 的作者 Erin Catto 从 2004 年开始在 GDC 上做物理引擎演讲，坚持了近 20 年。他把整个引擎开源（MIT 协议），不收费。去读他的 GDC 演讲 PDF——你会看到一个工程师如何用 20 年做一件热爱的事。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>一个 2D 横板跳跃游戏，角色需要在平台上跳来跳去，敌人碰到角色就扣血。这里哪些部分适合用物理引擎，哪些适合手写碰撞？为什么？</li>
        <li>你把一个 RigidBody2D 设为 Static 和 Kinematic，它都能挡住其他物体。那它们的本质区别是什么？举个例子说明什么场景下必须用 Kinematic 而不是 Static。</li>
        <li>你做了一个弹球游戏，但玩家反馈"球弹起来不够爽"。从 Restitution 和 Friction 两个参数的角度分析，你应该怎么调才能让球"弹得更有弹性、更干脆"？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
