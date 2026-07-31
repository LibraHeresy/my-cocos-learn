---
phase: 8
title: cc.tween 补间动画
duration: 1-2 天
---

## 🧭 本节定位

帧动画让精灵"动起来"，但如果你想让一个 UI 弹窗从 0 放大到 1、让分数从 0 滚动到 12500、让道具从敌机位置飞到屏幕角落——你需要**补间动画**。在 Cocos 里，这个工具叫 cc.tween。

## 📜 一条小历史：从 Flash 到 Cocos

如果你在 2000 年代做过 Flash 开发，你可能用过 ActionScript 的 Tween 类——`Tween.to(mc, { x: 100, alpha: 0.5 }, 1)`。后来 JS 世界有了 GSAP（GreenSock Animation Platform），API 更优雅：`gsap.to(el, { x: 100, duration: 1 })`。

Cocos 的 cc.tween 在设计上明显借鉴了 GSAP 的链式调用风格。如果你用过 GSAP，cc.tween 几乎是零学习成本的迁移。

## 📐 缓动函数：让动画有感觉的秘密

如果一辆车从静止加速到 100km/h，它不是瞬间达到的，而是有一个加速过程。动画也一样——**线性运动（匀速）看起来很机械，非线性运动（加速/减速）才有"物理感"**。

缓动函数（Easing）就是对时间的非线性映射。在数学上，输入是时间进度 t（0→1），输出是实际进度 v（0→1），但 v 可以不等于 t：

<pre>// 线性：v = t          —— 匀速运动
// easeIn：v = t²        —— 慢→快（加速）
// easeOut：v = 1-(1-t)² —— 快→慢（减速）
// backOut：v = c3*(v-1)³ + c1*(v-1)² + 1（c1 = 1.70158, c3 = 2.70158）—— 超调后回弹（弹窗效果）</pre>

Robert Penner 在 2001 年发表了一篇名为《Robert Penner's Easing Functions》的文章，系统总结了这些缓动函数。**这篇文章可能是游戏和 Web 动画史上被引用最多的独立贡献之一。** GSAP、CSS animation、Cocos tween——它们全部基于 Penner 的缓动公式。

<div class="tip-box">
<strong>前端视角：</strong> CSS 的 <code>animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1)</code> 和 Cocos 的 <code>easing: 'easeOut'</code> 做的是同一件事——用数学函数把线性时间映射为非线性进度。CSS 用三次贝塞尔曲线参数化，Cocos 用 Penner 缓动函数，换汤不换药。如果你在 Chrome DevTools 里调过 cubic-bezier 曲线，你就已经理解了 Cocos easing 的全部数学本质。
</div>

## 🔧 动手：UI 弹窗、分数滚动与道具飞行

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

<div class="tip-box">
<strong>前端视角：链式调用 ≈ Promise.then()。</strong> cc.tween 用 <code>.to().call().start()</code> 的链式写法定义一串连续动作，这和 Promise 的 <code>.then().then().catch()</code> 思路如出一辙——每一环结束后自动触发下一环。而 <code>.parallel()</code> 就是 <code>Promise.all()</code>——多个动画同时跑，都完成后才继续下一步。如果你写过异步流程控制，tween 的 API 对你来说只是换了个名字的 Promise 链。
</div>

## 🔗 课外延伸

- **Robert Penner 的缓动函数：** 去 easings.net 看所有缓动函数的可视化演示。你会惊讶地发现 CSS 的 ease/ease-in/ease-out 和 Cocos 的是一回事。
- **CSS animation-timing-function 用的是贝塞尔曲线：** 和 Cocos 的缓动函数本质一致，只是用三次贝塞尔曲线参数化的而已。

## ✅ 自测清单

1. easing 缓动函数的数学本质是什么？输入是时间进度 t（0→1），输出是实际进度 v（0→1）。linear 就是 v=t，easeOut 是 v=1-(1-t)²。请你用一个生活里的例子解释 linear 和 easeOut 的区别——比如"倒水""刹车"这种日常动作，它们分别对应哪种缓动？
2. Cocos tween 的 `to()` 和 `by()` 有什么区别？如果我当前分数是 100，`to(1, { val: 500 })` 和 `by(1, { val: 500 })` 的结果分别是什么？什么时候该用 to()，什么时候该用 by()？
3. 如果要实现一个"分数从 0 滚到 1000"的效果——数字不是瞬间跳变，而是一帧一帧增加直到 1000——用 Cocos tween 怎么写？请用伪代码描述，关键是要说明你 tween 的对象是什么、onUpdate 回调里做了什么。
