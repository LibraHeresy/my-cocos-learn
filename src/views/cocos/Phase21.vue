<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="21" title="Shader 与后处理" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>Shader 听起来很吓人——它涉及 GPU 编程、数学、图形管线。但 2D 游戏的 Shader 其实可以很简单。这一节不讲 GLSL 完整语法，只讲<strong>你能直接用的常用效果</strong>和它们的底层直觉。</p>
    </ConceptBlock>

    <ConceptBlock icon="🍳" title="GPU从固定菜单到开放式厨房">
      <p>1990 年代的 GPU 是"固定渲染管线"——你告诉它画什么，它用一种固定的方式画。颜色怎么算、光照怎么打，都是硬件定死的，你改不了。</p>
      <p>2001 年，GPU 开始支持"可编程渲染管线"——你可以写一小段程序，告诉 GPU 每个顶点放在哪（顶点着色器），每个像素是什么颜色（片元着色器）。这就是 Shader 的本质：<strong>一小段运行在 GPU 上的程序</strong>。</p>
      <p>Cocos Effect 文件 = YAML 头（定义 Uniform 参数，类似 CSS 变量）+ GLSL 体（片元着色器代码）：</p>
      <pre>// Cocos Effect 文件结构
CCEffect %{
  techniques:
  - passes:
    - vert: default-vs:builtin
      frag: unlit-fs:builtin
      properties:
        dissolveStrength: { value: 0.5 }  // 暴露到编辑器的参数
}%
CCProgram unlit-fs %{
  // GLSL 片元着色器代码
  vec4 frag() {
    vec4 color = mainTexture * v_color;
    // ... Shader 逻辑
    return color;
  }
}%</pre>
    </ConceptBlock>

    <ConceptBlock icon="✨" title="四个拿来就用的 Shader 效果">
      <ul>
        <li><strong>溶解（Dissolve）：</strong> 用噪声纹理控制像素丢弃——受击后敌人像灰烬一样碎掉。核心：<code>if (noise < dissolveStrength) discard;</code></li>
        <li><strong>描边（Outline）：</strong> 检测周围像素的透明度差，在边缘画线。Boss 出场时的金色描边。</li>
        <li><strong>灰度（Grayscale）：</strong> 把 RGB 转为灰度值——暂停时画面变灰。</li>
        <li><strong>闪白（Flash White）：</strong> 临时把所有像素颜色推向白色——受击瞬间的闪白反馈。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：写一个灰度 Shader">
      <p>在 Cocos 中创建一个 Effect 资源。写一个简单的灰度 Shader（在 fragment shader 中将 RGB 三通道取平均）。在场景中创建一个 Sprite，把默认材质换成刚写的 Effect。预览，看彩色图片是否变成灰色。如果你有勇气，再尝试写一个"溶解"效果——在 fragment shader 中用 discard 丢弃部分像素。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>Shadertoy 社区：</strong> shadertoy.com 是一个只用数学画图的社区。没有模型、没有纹理——所有的画面都是 Shader 代码实时计算出来的。你会看到只用几百行 GLSL 画出逼真的海洋、森林、甚至完整的 3D 场景。这是理解 Shader 能力最好的方式。</li>
        <li><strong>《荒野之息》的 Cel Shading：</strong> 任天堂用 Shader 实现了赛璐珞风格（卡通渲染），配合手绘纹理，创造了一种"像在动画片里探索"的视觉体验。这个是 Shader 在 3A 游戏中最著名的应用之一。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>顶点着色器和片元着色器各自负责什么？用一句话分别描述。</li>
        <li>Uniform 变量是什么？为什么它被类比为"CSS 自定义属性"？</li>
        <li>全屏后处理（如 Bloom 模糊）和材质 Shader 有什么区别？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
