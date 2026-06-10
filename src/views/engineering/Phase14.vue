<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="14" title="内存与性能排查" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>游戏越玩越卡？10 分钟后 crash？<strong>内存泄漏——游戏开发最常见也最难排查的性能杀手。</strong>好消息是：排查工具和方法论和前端完全一致。</p></ConceptBlock>

    <ConceptBlock icon="📖" title="为什么玩了 10 分钟突然卡了 3 秒？——GC 的 Stop-The-World">
      <p>你在 Cocos 里写了一段代码：每帧 create 一个新子弹 Sprite，当子弹飞出去之后 node.destroy() 销毁。代码看起来没问题——create → use → destroy，逻辑闭环。但你玩 5 分钟后 FPS 开始波动，10 分钟后每 2 分钟卡一下。</p>
      <p>你用 Chrome DevTools 的 Performance 面板录了一段——发现每隔一段时间就有一个 80ms 的"尖刺"，尖刺的标题是 "Minor GC" 或 "Major GC"。</p>
      <p><strong>GC（Garbage Collection，垃圾回收）就是那个"尖刺"的来源。</strong>JavaScript 的内存管理是自动的——你 destroy 了一个节点对象，JS 引擎不会立刻释放它的内存。它会等——等到"内存有点紧张"了，才触发 GC。GC 是 <strong>Stop-The-World</strong> 的——回收期间暂停所有 JS 执行。单次 GC 如果超过 16ms——你掉了一帧。如果 Major GC 花了 80ms——你连续掉了 5 帧。</p>
      <p>这个问题不是 JS 的 bug——是 JS 的设计 tradeoff。<strong>自动内存管理的代价是"你不知道它什么时候回收"——而 60fps 游戏不能容忍任何超过 16ms 的暂停。</strong></p>
      <p>这和前端开发中"页面突然卡了一下然后恢复"的现象是一回事——背后很可能就是 GC。只不过在网页中 100ms 卡顿用户不在意（他们以为网络慢），在游戏中 16ms 的停滞就足够让人感觉"不跟手"。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔍" title="Shallow Size vs Retained Size——内存分析的核心概念">
      <p>Chrome DevTools Memory 面板的 Heap Snapshot 有两个看似相似但本质不同的指标：</p>
      <ul>
        <li><strong>Shallow Size（浅层大小）——这个对象自己占多少内存。</strong>不包含它引用的其他对象。一个 <code>{ x: 1, y: 2 }</code> 对象的 Shallow Size 大约 32 字节（对象头 + 两个 number 属性）。</li>
        <li><strong>Retained Size（保留大小）——这个对象 + 它引用的所有对象 + 那些对象引用的所有对象……整个引用树的总大小。</strong>如果 A 引用了 B，B 引用了 C、D、E——A 的 Retained Size = A 自己 + B + C + D + E 的总和。</li>
      </ul>
      <p>一个对象的 Shallow Size 很小，但 Retained Size 可能巨大。比如你的 GameManager 对象本身只有 100 字节（几个属性引用），但它引用了整个场景的节点树——Retained Size 可能是几十 MB。<strong>排查内存泄漏的核心逻辑：对比两张快照，看哪些对象的 Retained Size 在增长且不被释放。</strong></p>
      <p>打个比方：Shallow Size 是"这个盒子的重量"——盒子本身很轻。Retained Size 是"这个盒子 + 里面装的所有东西 + 里面每个盒子里再装的所有东西的总重量"——可能非常重。如果 GC 不能释放这个盒子（因为它还被某个全局变量引用着），那它"里面装的所有东西"也全部不能释放——这就是内存泄漏的根源。</p>
    </ConceptBlock>

    <ConceptBlock icon="🩺" title="三大泄漏模式——记住这三个就够了">
      <p><strong>1. 事件监听未移除——最常见的泄漏源。</strong>每个 addEventListener / systemEvent.on / this.node.on 必须有一个对应的 removeEventListener / off。如果组件被销毁了但监听还在——监听回调持有的 this 引用不会被 GC 回收。<strong>铁律：onLoad 里不要 on，start 里再 on；onDestroy 里必须 off。</strong></p>

      <p><strong>2. 定时器未清理——"我以为它会自己停"。</strong>scheduleOnce / setInterval / setTimeout 创建的定时器，如果在回调执行之前节点被销毁——回调里使用的 this 引用形成泄漏链。<strong>铁律：onDestroy 中调用 this.unscheduleAllCallbacks() 和 clearInterval()。</strong></p>

      <p><strong>3. 闭包持有过期引用——最难排查的泄漏。在匿名函数中引用了外部变量，这个匿名函数被存到了某个长生命周期的对象上（比如 EventBus 的回调列表），外部变量就一直"可达"——GC 不回收。这和前端 React 的 stale closure（useEffect 捕获了旧的 state）是同一个问题——只不过前端是"UI 不更新"，游戏是"内存泄漏"。</strong></p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：给你的飞机大战做一次内存体检">
      <ol>
        <li><strong>拍三张快照：</strong>Chrome DevTools → Memory 面板 → 选择 Heap Snapshot。① 游戏启动后、进入主菜单时拍第一张（基线）。② 正常游玩 3-5 分钟（不要故意做极端操作——就正常玩）后拍第二张（使用中）。③ 退出到主菜单，等 5 秒让 GC 触发一次后拍第三张（清理后）。</li>
        <li><strong>对比三张快照：</strong>在第三张快照上选择 "Comparison" 视图，对比第一张（基线）。如果某些对象的 Count 和 Size 明显增加——说明这些对象在"游戏中"被创建了但"返回菜单后"没被释放。<strong>搜索你在游戏中创建的脚本类名</strong>（EnemyController、Bullet、Explosion 等）——它们返回菜单后不应该还存在。如果存在——泄漏。</li>
        <li><strong>检查 Retained Size：</strong>在快照中按 Retained Size 降序排列。排在最前面的几个对象——它们的 Retained Size 是否合理？如果 GameManager 的 Retained Size 在第三张快照 = 第一张快照——正常。如果第三张 > 第一张的 2 倍——有东西被 GameManager 持有了没释放。</li>
        <li><strong>修复最明显的一个泄漏：</strong>你大概率会在第一次分析中发现至少一个泄漏——最常见的是"敌机 Node 销毁了但它的 controller 脚本实例还在某个数组里"。找到它 → 在 onDestroy 中清理引用 → 重新拍快照验证 → Retained Size 下降了。</li>
        <li><strong>养成习惯：</strong>把"每次发布前做一次内存快照对比"写入你的发布 checklist。这和前端性能优化中"每次上线前跑一次 Lighthouse"是一样的——<strong>不要让内存泄漏慢慢积累到 crash。</strong></li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>GC 只看"可达性"不管"意图"——这是内存泄漏的根本原因：</strong>V8 的垃圾回收器采用 Mark-and-Sweep 算法——从"根对象"（window / global / 闭包链）出发，沿途标记所有能走到的对象。标记结束后，所有<strong>没有标记的对象</strong>被回收。关键点：GC 不知道你"以后还用不用"这个对象，它只知道<strong>"现在有没有路径能走到"</strong>。你创建了一个敌机节点，destroy() 从场景树移除了它——但如果你的代码里还有一个全局数组 enemyArray.push(enemy) 没有 enemyArray.splice() 移除引用——敌机节点虽然不在场景里，但仍然"可达"（从 global → enemyArray → enemy 有一条路径）——所以 GC 不回收它。这就是为什么忘记 removeEventListener 的对象不会被回收——监听回调持有 this → this 持有整个组件 → 整个组件包括其所有子节点全部"可达" → 全部泄漏。</li>
        <li><strong>对象池（Object Pool）的必要性不是"复用对象省 create 时间"——是"避免 GC 尖刺"：</strong>如果你每帧 create 3 个子弹 Sprite + destroy 3 个飞出屏幕的子弹，JS 引擎每秒创建/销毁 180 个对象。GC 每隔几秒就要回收一堆"短命对象"——这就是你 FPS 曲线的 GC 尖刺的来源。对象池的解决方案：预创建 30 个子弹对象，用的时候从池里拿（get），用完了放回去（put）——<strong>不创建新对象，不触发 GC 回收</strong>。这和前端虚拟列表复用 DOM 节点是同一逻辑——不是为了"创建 DOM 太慢"，而是为了"不创建/销毁 DOM 避免 GC 和 reflow"。</li>
        <li><strong>Chrome DevTools 的 Memory 面板和 Performance 面板是两个互补的工具：</strong>Memory 面板（Heap Snapshot）回答"谁占着内存不放"——用来排查泄漏。Performance 面板（录制 FPS + 内存曲线）回答"什么时候卡了"——用来定位卡顿的精确帧。两个面板一起用：Performance 面板的 FPS 曲线出现周期性尖刺 → 切换到 Memory 面板 → 拍快照 → 找到 Retained Size 异常增长的对象 → 定位泄漏代码。这是标准的两步排查法。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>JavaScript 的 GC（垃圾回收）为什么是游戏性能的"隐形杀手"？和你了解的"Stop-The-World"有什么关系？</li>
        <li>Shallow Size 和 Retained Size 的区别是什么？为什么排查内存泄漏要重点看 Retained Size？</li>
        <li>事件监听、定时器、闭包引用——三种泄漏模式的根源分别是什么？在你的飞机大战代码中，最可能出现哪种泄漏？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
