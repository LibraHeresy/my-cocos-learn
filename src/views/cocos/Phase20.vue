<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="20" title="粒子系统" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>2007 年，《几何战争》（Geometry Wars）在 Xbox Live Arcade 上爆火。它没有复杂角色、没有 3D 场景——只有几何形状的粒子在黑色背景上爆炸、旋转、消散。玩家数千万。<strong>粒子不是"补充效果"——它可以是游戏的全部。</strong>这一节讲粒子系统的参数、生命周期和调参手感。</p>
    </ConceptBlock>

    <ConceptBlock icon="🎆" title="一个粒子的生命：出生 → 运动 → 死亡">
      <p>每个粒子都是一个小对象，有自己的生命周期。和你在前端操作 DOM 元素很像——<strong>创建 → 动画 → 移除</strong>：</p>
      <pre>出生：发射器在某个位置/方向生成一个粒子
  ↓  设置初始属性（速度/颜色/大小/旋转）
运动：每帧根据速度和重力更新位置
  ↓  颜色/大小/透明度随时间插值变化
死亡：生命时间到 → 粒子消失
  ↓
发射器继续生成新粒子……

// 这个模式前端工程师最熟悉不过了：
// particle cycle = DOM element lifecycle
// emitter.spawn()   → document.createElement()
// particle.update()  → element.animate()
// particle.die()     → element.remove()</pre>
      <p>前端有一个经典的例子：你在做通知系统时，每条通知也是一个"粒子"——弹出（出生）、停留几秒（生命）、淡出移除（死亡）。粒子的参数系统和 CSS 动画属性几乎一一对应：</p>
      <table>
        <thead><tr><th>粒子参数</th><th>含义</th><th>CSS 动画类比</th></tr></thead>
        <tbody>
          <tr><td><code>Life</code></td><td>粒子存活时间</td><td><code>animation-duration</code></td></tr>
          <tr><td><code>Start Color → End Color</code></td><td>生命期颜色渐变</td><td><code>@keyframes { from {color:...} to {color:...} }</code></td></tr>
          <tr><td><code>Start Size → End Size</code></td><td>大小变化</td><td><code>@keyframes { transform: scale() }</code></td></tr>
          <tr><td><code>Speed + Angle</code></td><td>初始速度和方向</td><td><code>animation-timing-function</code> + <code>translate()</code></td></tr>
          <tr><td><code>Gravity</code></td><td>重力影响程度</td><td>CSS 没有原生重力，但 <code>cubic-bezier()</code> 可以模拟弹跳</td></tr>
          <tr><td><code>Duration</code>（发射器）</td><td>发射器存活时间</td><td><code>animation-iteration-count</code></td></tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🎨" title="粒子系统核心参数：每一个都控制一种感觉">
      <p>粒子参数看着多，但按它们控制的"感觉类型"来分组，其实就四类：</p>
      <ul>
        <li><strong>生命周期控时长：</strong> <code>Duration</code>（发射器持续多久，-1 = 无限）、<code>Life</code>（每个粒子活多久）、<code>Emission Rate</code>（每秒发射多少个）——这三个参数决定粒子的"密度"和"持续时间"。</li>
        <li><strong>速度控方向：</strong> <code>Speed</code>（粒子飞多快）、<code>Angle</code>（往哪个方向飞，0=右，90=上）、<code>Angle Variation</code>（方向随机变化范围）——控制粒子散开的"形状"。爆炸=全方向（0~360），喷泉=一个方向集中喷。</li>
        <li><strong>颜色控视觉：</strong> <code>Start Color → End Color</code> + <code>Color Over Lifetime</code> 中间可以加多个关键帧颜色——爆炸粒子从白→黄→橙→红→透明（四阶段渐变），模拟火球冷却的过程。</li>
        <li><strong>大小控质感：</strong> <code>Start Size → End Size</code> + <code>Size Over Lifetime</code>——碎片从大到小消失，烟雾从小到大扩散。大小变化的速度和曲线的不同，产生的"质感"完全不同。</li>
      </ul>
      <div class="tip-box">
        <strong>调参心法：</strong> 粒子的参数不是"读懂的"——是<strong>大量尝试后累积的手感</strong>。就像前端调 CSS animation 一样，你先猜一个值，预览，看效果，再微调。没有人能看一眼参数表就知道爆炸好不好看。关键在于快速迭代——改一个参数马上看到变化。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：从零搭建三种粒子特效">
      <p>在 Cocos Creator 中创建 ParticleSystem2D 组件，依次实现三种经典效果——每一种对应不同的参数组合逻辑：</p>
      <ol>
        <li><strong>爆炸效果（瞬时爆发型）：</strong> 新建 2D 粒子节点 → 将 <code>Duration</code> 设为 0.1（短暂爆发，0.1 秒内把粒子全部喷出去），<code>Life</code> 设为 0.3~0.8 随机（碎片有的快消失、有的飞得久），<code>Angle</code> 设为 0~360（全方向发射），<code>Start Speed</code> 设为 300~600（碎片飞不同速度），<code>Gravity</code> Y 设为 -200（碎片往下落，模拟重力），<code>Start Color</code> 白→黄→橙→红渐变（冷却过程），<code>Start Size</code> 从 20 到 0。运行——你得到了一个爆炸。</li>
        <li><strong>烟雾拖尾（持续跟随型）：</strong> 修改参数：<code>Duration</code> -1（持续发射，只要敌机还在就喷烟），<code>Life</code> 设为 0.5~1.0（烟消散慢），<code>Angle</code> 集中在 150~210 度（向后喷，因为敌机往前飞，烟自然向后），<code>Start Speed</code> 调低到 50~100（烟飘得慢），<code>Start Color</code> 深灰→浅灰→透明（烟雾从浓变淡），<code>Gravity</code> Y 设为 30（烟往上飘——负重力让它上升）。把这个节点挂到移动的敌人下方，你就得到了一个燃烧残骸的拖尾。</li>
        <li><strong>下雨效果（全屏环境型）：</strong> 新建粒子节点放在屏幕上方：<code>Duration</code> -1，<code>Angle</code> 集中在 70~110 度（向下），<code>Start Speed</code> 800~1200（雨滴快），<code>Life</code> 1.0，<code>Start Size</code> 2~4（细长雨滴），<code>Gravity</code> Y 设为 0（雨滴不受额外重力——初始速度已经模拟了加速过程）。</li>
        <li><strong>保存为 Prefab：</strong> 把这三个节点分别拖到 assets 面板，生成 爆炸.prefab、烟雾拖尾.prefab、下雨.prefab。以后在任何项目中拖进去就能用。这就是游戏的"组件库"——和你的 Vue 组件库一个思路。</li>
      </ol>
      <p>粒子系统的参数看着多，但核心就四点：<strong>生命周期控时长、速度控方向、颜色控视觉、大小控质感</strong>。把这四种效果做出来，你就掌握了粒子调参的手感。之后遇到任何"这个效果要怎么调"的问题，你心里会有这个直觉框架。</p>
    </ConceptBlock>

    <ConceptBlock icon="⚡" title="性能考量：CPU 粒子 vs GPU 粒子">
      <p>当你做爆炸时，一个爆炸 100 个粒子，同时有 5 个敌机爆炸 = 500 个粒子。还可以接受。但如果你做一个科幻游戏，一帧之内画面同时出现 50000 个粒子（比如星云背景），CPU 计算每个粒子的位置、颜色、大小——撑不住了。每一帧更新 50000 个独立对象的 JavaScript 调用，会直接把帧率拉到个位数。</p>
      <p>这时候需要 <strong>GPU 粒子</strong>（Cocos 3.x 的 GPUParticleSystem）：</p>
      <table>
        <thead><tr><th>维度</th><th>CPU 粒子（ParticleSystem2D）</th><th>GPU 粒子（GPUParticleSystem）</th></tr></thead>
        <tbody>
          <tr><td>粒子数上限</td><td>~1000（受 JS 单线程限制）</td><td>~100,000+（GPU 并行计算）</td></tr>
          <tr><td>控制精度</td><td>可以在脚本中动态修改每个粒子的属性</td><td>参数预设后 GPU 自动运行，代码无法干预单个粒子</td></tr>
          <tr><td>适用场景</td><td>爆炸、拖尾、雨雪——粒子数可控</td><td>星云、沙尘暴、海底鱼群——粒子海量</td></tr>
          <tr><td>基础复杂度</td><td>低——拖个组件上去就能用</td><td>高——需要理解 GPU 粒子着色器</td></tr>
        </tbody>
      </table>
      <p>前端类比：CPU 粒子就像用 JS 的 <code>setInterval</code> 手动操作 1000 个 DOM 元素的位置和样式——每个元素都是一个独立对象。GPU 粒子就像用 WebGL 直接在 GPU 上画 100000 个点——不是操作对象，是操作一个数据缓冲区。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <p>不要求掌握，但如果你感兴趣，这些都是值得了解的故事：</p>
      <ul>
        <li><strong>《几何战争》——粒子的表现主义：</strong> 2003 年，Bizarre Creations 在 Xbox Live Arcade 上发布《几何战争：复古进化》。它的画面除了黑色背景和发光的几何粒子以外什么都没有——但正是数万粒子创造了令人目眩的视觉冲击。游戏设计师 Stephen Cakebread 说过一句很经典的话："粒子不是装饰，粒子是游戏世界的'原子'——一切可见物都是粒子。"去 YouTube 搜一段 Geometry Wars 的实机视频，你会理解"粒子=游戏美学"这句话的分量。</li>
        <li><strong>Houdini 在 AAA 游戏 VFX 管线中的位置：</strong> 在 3A 游戏开发中，视觉效果（VFX）不是手调参数的——美术师在 SideFX Houdini 中写节点式程序生成特效（爆炸、烟雾、魔法），然后导出纹理序列（flipbook），再导入游戏引擎作为粒子系统的纹理使用。一张 8×8 格的 flipbook 纹理，配合粒子随机起始帧，可以产生视觉上丰富百倍的爆炸效果。这和前端用 sprite sheet 做动画是同一个思路。</li>
        <li><strong>粒子系统的工业起源：</strong> 第一个在电影中大量使用粒子系统的是 1982 年的《星际迷航 2：可汗之怒》——Industrial Light & Magic（卢卡斯影业的特效部门）的 William Reeves 用粒子系统生成了"创世效果"（Genesis Effect），一个星球从荒芜变绿洲的 60 秒镜头。当时渲染这 60 秒花了数周时间。今天你用 Cocos 做一个爆炸，实时渲染，不到 16 毫秒。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <p>学完这一节，你应该能回答这些问题：</p>
      <ol>
        <li>你做了一个爆炸粒子效果，但爆炸时所有碎片都往右边飞。你改了三个参数才让它变成全方向爆炸。是哪三个参数？每个参数分别控制什么？</li>
        <li>你的游戏里有 500 个敌人同时被击杀，每个敌人都生成一个爆炸效果（100 个粒子/个）。一帧之内你要处理 50000 个粒子。为什么这会让游戏卡顿？说出两个具体的优化方向——在不删除粒子效果的前提下。</li>
        <li>GPU 粒子（Cocos 3.x 支持）和传统的 CPU 粒子有什么区别？什么时候 CPU 粒子就够了，什么时候必须换成 GPU 粒子？给你一个具体的游戏例子说明（如：背景是沙尘暴的沙漠动作游戏）。</li>
        <li>你要做一个"火焰喷射器"效果——从枪口持续喷出火焰，火焰往上升，颜色从白→黄→红→黑。和爆炸效果（短暂全方向爆发）相比，哪些参数需要设置为完全不同的值？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
