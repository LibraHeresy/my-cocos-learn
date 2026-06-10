<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="8" title="cc.tween 补间动画" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>帧动画让精灵"动起来"，但如果你想让一个 UI 弹窗从 0 放大到 1、让分数从 0 滚动到 12500、让道具从敌机位置飞到屏幕角落——你需要<strong>补间动画</strong>。在 Cocos 里，这个工具叫 cc.tween。</p>
    </ConceptBlock>

    <ConceptBlock icon="📜" title="一条小历史：从 Flash 到 Cocos">
      <p>如果你在 2000 年代做过 Flash 开发，你可能用过 ActionScript 的 Tween 类——<code>Tween.to(mc, { x: 100, alpha: 0.5 }, 1)</code>。后来 JS 世界有了 GSAP（GreenSock Animation Platform），API 更优雅：<code>gsap.to(el, { x: 100, duration: 1 })</code>。</p>
      <p>Cocos 的 cc.tween 在设计上明显借鉴了 GSAP 的链式调用风格。如果你用过 GSAP，cc.tween 几乎是零学习成本的迁移。</p>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="缓动函数：让动画有感觉的秘密">
      <p>如果一辆车从静止加速到 100km/h，它不是瞬间达到的，而是有一个加速过程。动画也一样——<strong>线性运动（匀速）看起来很机械，非线性运动（加速/减速）才有"物理感"</strong>。</p>
      <p>缓动函数（Easing）就是对时间的非线性映射。在数学上，输入是时间进度 t（0→1），输出是实际进度 v（0→1），但 v 可以不等于 t：</p>
      <pre>// 线性：v = t          —— 匀速运动
// easeIn：v = t²        —— 慢→快（加速）
// easeOut：v = 1-(1-t)² —— 快→慢（减速）
// backOut：v = 1+(v-1)²*(2.7v-1.7) —— 超调后回弹（弹窗效果）</pre>
      <p>Robert Penner 在 2001 年发表了一篇名为《Robert Penner's Easing Functions》的文章，系统总结了这些缓动函数。<strong>这篇文章可能是游戏和 Web 动画史上被引用最多的独立贡献之一。</strong> GSAP、CSS animation、Cocos tween——它们全部基于 Penner 的缓动公式。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：UI 弹窗、分数滚动与道具飞行">
      <pre>// 弹窗效果：0→超调→1
tween(popupNode)
  .set({ scale: new Vec3(0, 0, 1) })     // 起始：缩放为 0
  .to(0.4, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }) // 弹到 1
  .start()

// 分数滚动：从当前值动画到目标值
tween({ val: currentScore })
  .to(0.5, { val: targetScore }, {
    onUpdate: (target) => { scoreLabel.string = Math.round(target.val).toString() }
  })
  .start()

// 道具飞行 + 淡出：移动到目标位置同时缩小消失
tween(itemNode)
  .to(0.6, { position: targetPos }, { easing: 'sineIn' })
  .parallel(  // parallel = 同时执行
    tween().to(0.3, { scale: new Vec3(1.5, 1.5, 1) })  // 先变大
      .to(0.3, { scale: new Vec3(0, 0, 1) })            // 再缩小消失
  )
  .start()</pre>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>Robert Penner 的缓动函数：</strong> 去 easings.net 看所有缓动函数的可视化演示。你会惊讶地发现 CSS 的 ease/ease-in/ease-out 和 Cocos 的是一回事。</li>
        <li><strong>CSS animation-timing-function 用的是贝塞尔曲线：</strong> 和 Cocos 的缓动函数本质一致，只是用三次贝塞尔曲线参数化的而已。</li>
      </ul>
    </ConceptBlock>
    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>easing 缓动函数的数学本质是什么？输入是时间进度 t（0→1），输出是实际进度 v（0→1）。linear 就是 v=t，easeOut 是 v=1-(1-t)²。请你用一个生活里的例子解释 linear 和 easeOut 的区别——比如"倒水""刹车"这种日常动作，它们分别对应哪种缓动？</li>
        <li>Cocos tween 的 <code>to()</code> 和 <code>by()</code> 有什么区别？如果我当前分数是 100，<code>to(1, { val: 500 })</code> 和 <code>by(1, { val: 500 })</code> 的结果分别是什么？什么时候该用 to()，什么时候该用 by()？</li>
        <li>如果要实现一个"分数从 0 滚到 1000"的效果——数字不是瞬间跳变，而是一帧一帧增加直到 1000——用 Cocos tween 怎么写？请用伪代码描述，关键是要说明你 tween 的对象是什么、onUpdate 回调里做了什么。</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
