<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="20" title="粒子系统" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>没有粒子特效的爆炸就是一组图片切换。加上粒子——碎片飞溅、火焰残留、烟雾消散——爆炸才有了"力量感"。粒子系统是游戏视觉中<strong>投入产出比最高</strong>的技术。</p>
    </ConceptBlock>

    <ConceptBlock icon="🎆" title="一个粒子的生命">
      <pre>出生：发射器在某个位置/方向生成一个粒子
  ↓  设置初始属性（速度/颜色/大小/旋转）
运动：每帧根据速度和重力更新位置
  ↓  颜色/大小/透明度随时间插值变化
死亡：生命时间到 → 粒子消失
  ↓
发射器继续生成新粒子……</pre>
    </ConceptBlock>

    <ConceptBlock icon="🎨" title="粒子系统核心参数">
      <ul>
        <li><strong>Duration：</strong> 发射器持续发射的时间（-1 = 无限）</li>
        <li><strong>Life：</strong> 每个粒子的生命时长</li>
        <li><strong>Speed：</strong> 粒子初始速度</li>
        <li><strong>Angle：</strong> 发射角度范围（0-360 = 全方向爆炸）</li>
        <li><strong>Start Color → End Color：</strong> 粒子生命期的颜色渐变（爆炸：白→橙→红→透明）</li>
        <li><strong>Start Size → End Size：</strong> 粒子从小到大或从大到小的变化</li>
        <li><strong>Gravity：</strong> 粒子受重力影响的程度（爆炸碎片 = 正重力，火焰 = 负重力）</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：从零搭建三种粒子特效">
      <p>在 Cocos Creator 中创建 ParticleSystem2D 组件，依次实现三种经典效果：</p>
      <ol>
        <li><strong>爆炸效果：</strong> 新建 2D 粒子节点 → 将 <code>Duration</code> 设为 0.1（短暂爆发），<code>Life</code> 设为 0.3~0.8 随机，<code>Angle</code> 设为 0~360（全方向发射），<code>Start Speed</code> 设为 300~600，<code>Gravity</code> Y 设为 -200（碎片往下落），<code>Start Color</code> 白→黄→橙→红渐变，<code>Start Size</code> 从 20 到 0。运行——你得到了一个爆炸。</li>
        <li><strong>烟雾拖尾：</strong> 修改参数：<code>Duration</code> -1（持续发射），<code>Life</code> 设为 0.5~1.0，<code>Angle</code> 集中在 150~210 度（向后喷），<code>Start Speed</code> 调低到 50~100，<code>Start Color</code> 灰→浅灰→透明，<code>Gravity</code> Y 设为 30（烟往上飘）。把这个节点挂到移动的敌人下方，你就得到了一个燃烧残骸的拖尾。</li>
        <li><strong>下雨效果：</strong> 新建粒子节点放在屏幕上方：<code>Duration</code> -1，<code>Angle</code> 集中在 70~110 度（向下），<code>Start Speed</code> 800~1200（雨滴快），<code>Life</code> 1.0，<code>Start Size</code> 2~4（细长雨滴），<code>Gravity</code> Y 设为 0（雨滴不受重力——因为初始速度已经模拟了重力加速）。</li>
        <li><strong>保存为 Prefab：</strong> 把这三个节点分别拖到 assets 面板，生成爆炸.prefab、烟雾拖尾.prefab、下雨.prefab。以后在任何项目中拖进去就能用。</li>
      </ol>
      <p>粒子系统的参数看着多，但核心就四点：<strong>生命周期控时长、速度控方向、颜色控视觉、大小控质感</strong>。把这四种效果做出来，你就掌握了粒子调参的手感。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>《几何战争》（Geometry Wars）的粒子美学：</strong> 2003 年，Bizarre Creations 在 Xbox Live Arcade 上发布《几何战争》。它用数万粒子创造了令人目眩的视觉效果，推动了"粒子特效=游戏美学"的行业认知。去 YouTube 搜一段它的实机视频，你会理解粒子能做什么。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>你做了一个爆炸粒子效果，但爆炸时所有碎片都往右边飞。你改了三个参数才让它变成全方向爆炸。是哪三个参数？每个参数控制的是什么？</li>
        <li>你的游戏里有 500 个敌人同时被击杀，每个敌人都生成一个爆炸粒子（100 个粒子/个）。一帧之内你要处理 50000 个粒子。为什么这会让游戏卡顿？说出两个优化方向（不删粒子效果的前提下）。</li>
        <li>GPU 粒子（Cocos 3.x 支持）和传统的 CPU 粒子有什么区别？什么时候 CPU 粒子就够了，什么时候必须换成 GPU 粒子？给一个具体的游戏例子说明。</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
