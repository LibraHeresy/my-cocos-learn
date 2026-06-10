<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="2" title="场景、节点、组件" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>上一节我们理解了游戏引擎"为什么存在"。这一节我们深入 Cocos 最核心的三个概念——<strong>Scene、Node、Component</strong>。如果你是从 Vue 过来的，你会发现组件化架构的前端和游戏有惊人的相似之处，也有让你恍然大悟的不同。</p>
    </ConceptBlock>

    <ConceptBlock icon="🏚️" title="继承链的崩塌：一个真实的故事">
      <p>在组件化架构出现之前，游戏开发用的是<strong>深继承链</strong>。大概是这样的：</p>
      <pre>GameObject（基础：有位置、能渲染）
  └── Character（活的：有血量、能移动）
       └── Enemy（敌人：会攻击、会掉落）
            └── Orc（兽人：皮厚近战）
            └── Goblin（哥布林：高速偷袭）
            └── Dragon（龙：会飞会喷火）
       └── Player（玩家：接受输入）</pre>
      <p>看起来还行？但问题很快就来了。假设你想做一个"会飞的哥布林"——它要继承 Goblin 的属性和 Dragon 的飞行能力。在单继承体系下，你只能选一个父类。这就是著名的<strong>钻石继承问题</strong>。</p>
      <p>更糟糕的是：随着游戏开发推进，基类 GameObject 会变得<strong>越来越臃肿</strong>。因为所有子类都共享同一个基类，你不敢删基类的任何字段——谁知道哪个子类还在用？最终 GameObject 变成一个几千行的"上帝类"，维护它变成噩梦。</p>
      <p>这个问题在游戏行业被称为 <strong>"The Blob"（大泥球）</strong>。几乎所有使用继承体系的游戏引擎都在这上面栽过跟头。Unity 早期的 MonoBehaviour 体系也是在继承链的废墟上建立起来的。</p>
    </ConceptBlock>

    <ConceptBlock icon="🧩" title="组合优于继承：组件化架构的诞生">
      <p>组件化架构的核心思想非常简单：<strong>不要用"是什么"来定义对象，用"有什么能力"来定义。</strong></p>
      <p>兽人不是"继承自 Enemy 的类"，而是"一个 Node，挂了一个 Enemy 组件、一个 MeleeAttack 组件、一个 HeavyArmor 组件"。哥布林是"一个 Node，挂了一个 Enemy 组件、一个 Stealth 组件、一个 LightArmor 组件"。会飞的哥布林？再加一个 Flying 组件就好。</p>
      <pre>// 继承体系：
class FlyingGoblin extends ??? // 继承谁？？Goblin 还是 Dragon？？

// 组件化体系：
const goblin = new Node()
goblin.addComponent(Enemy)      // 是敌人
goblin.addComponent(Stealth)    // 会潜行
goblin.addComponent(Flying)     // 会飞行——就这么简单！
goblin.addComponent(LightArmor) // 轻甲</pre>
      <p>这种"组合优于继承"的思想，Vue 开发者应该非常熟悉。想想 Vue 3 的 Composition API——你把逻辑拆成独立的 composable 函数，然后在组件里按需组合：</p>
      <pre>// Vue 3 Composition API
const { x, y } = useMouse()
const { data } = useFetch('/api/user')
const { theme } = useTheme()

// Cocos Component 体系
node.addComponent(Sprite)       // 显示图片的能力
node.addComponent(Collider2D)   // 碰撞检测的能力
node.addComponent(PlayerInput)  // 接收输入的能力</pre>
      <p>同一个思路，不同的实现。</p>
      <div class="tip-box">
        <strong>ECS（Entity-Component-System）的由来：</strong> 组件化架构的激进版本叫 ECS——Entity 只是一个 ID，Component 是纯数据，System 处理逻辑。Unity 的 DOTS 和 ECS 就是这个思路。Cocos 没有走到 ECS 那一步，但也吸收了组件化的核心思想。"组合优于继承"不是 Cocos 的发明，但它是 Cocos 架构最值得理解的原则。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🌳" title="Node Tree vs DOM Tree：相似的表象，不同的内核">
      <p>如果你打开 Cocos 的层级管理器，你会看到一棵节点树。它长得和 Chrome DevTools 的 Elements 面板几乎一模一样——父节点、子节点、兄弟节点。这是刻意为之的设计：<strong>用你熟悉的概念降低学习成本</strong>。</p>
      <p>但外表相似，内核不同：</p>
      <table>
        <thead><tr><th>维度</th><th>DOM Tree</th><th>Cocos Node Tree</th></tr></thead>
        <tbody>
          <tr><td>每个节点是什么</td><td>HTML 元素（div/span/p）</td><td>Node（通用容器，本身没有外观）</td></tr>
          <tr><td>节点的能力从哪来</td><td>标签名决定（一个 button 天生可点击）</td><td>挂载的 Component 决定（挂 Sprite 才能显示，挂 Button 才能点击）</td></tr>
          <tr><td>节点的"样式"</td><td>CSS 控制（position/color/size）</td><td>节点的属性控制（position/scale/rotation）</td></tr>
          <tr><td>渲染方式</td><td>浏览器 Layout Engine</td><td>GPU 纹理采样（没有 Reflow！）</td></tr>
          <tr><td>父子关系的影响</td><td>CSS 级联（子元素继承样式）</td><td>Transform 级联（子节点继承父节点的位置/旋转/缩放）</td></tr>
        </tbody>
      </table>
      <p>最有意思的区别是：<strong>一个 Node 本身是"透明"的</strong>。如果你创建一个 Node 不给它挂任何 Component，它在场景里什么都看不到——没有大小、没有颜色、没有形状。它只是一个"位置点"。只有给它挂上 Sprite（就有图片了）或 Label（就有文字了），它才"出现"在场景中。</p>
      <p>这和 DOM 完全相反：DOM 的每个元素天生就有盒模型，即使空 div 也占位。Node 是"无中生有"的——你赋予它什么 Component，它就有什么能力。</p>
    </ConceptBlock>

    <ConceptBlock icon="⏱️" title="Component 生命周期：你的代码什么时候执行？">
      <p>Cocos 的 Component 有严格的生命周期顺序。理解这个顺序很重要——不然你的代码可能在错误的时间访问还不存在的东西。</p>
      <pre>1. constructor()     // JS 对象创建
2. onLoad()          // 组件被挂载到节点，此时可以安全访问 this.node
3. start()           // 第一帧 update 之前执行一次。此时所有组件的 onLoad 都已执行完
4. update(dt)        // 每帧执行。dt = delta time
5. lateUpdate(dt)    // 所有 update 执行完后执行
6. onDestroy()       // 组件被销毁前执行</pre>
      <p>这里有三个容易踩的坑：</p>
      <ul>
        <li><strong>不要在 constructor 里访问 this.node。</strong> 这时组件还没挂到节点上，<code>this.node</code> 是 undefined。</li>
        <li><strong>onLoad 里可以访问 this.node，但不能保证其他组件的 onLoad 已经执行。</strong> 如果你想在组件 A 里用组件 B 的属性，放在 start 里更安全。</li>
        <li><strong>update 里不要写耗时操作。</strong> 它每帧都执行。如果一帧花了超过 16ms，帧率就掉到 60fps 以下。高频计算要么缓存、要么放到定时器里低频执行。</li>
      </ul>
      <p>对比 Vue 的生命周期：<code>onLoad</code> ≈ <code>mounted</code>，<code>onDestroy</code> ≈ <code>unmounted</code>，但 <code>update(dt)</code> 没有直接的 Vue 对应——它是游戏引擎独有的"每帧循环"概念。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：搭建三层场景结构">
      <p>在你的 Game 场景中，Canvas 节点下创建三个子节点：</p>
      <pre>Canvas（根节点，自动创建）
├── Background —— 挂 Sprite，放背景图
├── GameLayer —— 空节点，作为所有游戏对象的容器
└── UILayer —— 空节点，放分数/血条/按钮等 UI</pre>
      <p>这种<strong>按层分组</strong>的做法是游戏开发的基础习惯。原因：</p>
      <ul>
        <li><strong>Z 轴顺序：</strong> 同级节点按在层级管理器中的顺序渲染——下面的节点画在上面。Background 在最上面（最先画），UILayer 在最下面（最后画，覆盖在一切之上）。</li>
        <li><strong>逻辑隔离：</strong> 清空 GameLayer 不会影响 UI。暂停游戏时可以只停 GameLayer 里的 update，UI 继续响应。</li>
        <li><strong>调试方便：</strong> 只想看 UI 布局？点一下 Background 和 GameLayer 旁边的小眼睛（visible 开关）就隐藏了。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>Unity 的 GameObject vs Cocos 的 Node：</strong> Unity 的 GameObject 自带 Transform 和名称，Cocos 的 Node 也自带这些。但 Unity 的 GameObject 默认有一个"空壳"概念（即使没有组件也有 Transform），而 Cocos 的 Node 在没有组件时几乎什么都不做。这种差异反映了两者对"轻量"的不同理解。</li>
        <li><strong>Unreal 的 Actor 体系：</strong> Unreal 的 Actor 比 Cocos 的 Node 重得多——它自带网络复制、输入响应、物理代理。这就是为什么 Unreal 适合 3A 而不适合轻量手游。</li>
        <li><strong>Web Components：</strong> 如果你用过 Custom Elements + Shadow DOM，它的设计思想和 Cocos Component 很相似——一个自定义标签（Node）内部可以组合多个行为（Component），而且每个行为有独立的生命周期回调（connectedCallback ≈ onLoad, disconnectedCallback ≈ onDestroy）。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>为什么深继承链会导致"大泥球"？组合优于继承怎么解决这个问题？</li>
        <li>Cocos 的 Node 和 DOM 元素的核心区别是什么？（提示：Node 没有"默认外观"）</li>
        <li>onLoad 和 start 有什么区别？什么时候该用哪个？</li>
        <li>为什么要在场景中创建 Background/GameLayer/UILayer 三层结构？每一层的作用是什么？</li>
        <li>为什么 update(dt) 里不能写耗时操作？如果一定要做耗时计算，应该怎么处理？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
