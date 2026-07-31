---
phase: 21
title: Shader 与后处理
duration: 2-3 天
---

## 🧭 本节定位

1999 年，NVIDIA 发布 GeForce 256——世界上第一块被称为 GPU 的芯片。它有一个革命性的功能：**可编程渲染管线**。以前 GPU 像"固定菜单的餐厅"——你只能点菜单上有的菜（固定的光照模型、固定的颜色计算）。现在它变成了"开放式厨房"——你可以自己写菜谱，告诉 GPU 每个顶点放在哪、每个像素是什么颜色。**这个"菜谱"，就是 Shader。**这一节不讲 GLSL 完整语法，只讲你能直接用的常用效果和它们底层的直觉。

## 🍳 GPU 从固定菜单到开放式厨房：Shader 的诞生

1990 年代的 GPU 是"固定渲染管线"（Fixed Pipeline）。你告诉它"这里有一个带纹理的三角形"，它用一种固定的方式画出来——颜色是纹理色、光照是 Gouraud shading、透明是 alpha test。整个过程你改不了。

2001 年，GPU 支持了"可编程渲染管线"（Programmable Pipeline），给了开发者两个可编程的入口：

<table>
<thead><tr><th>着色器</th><th>做什么</th><th>输入</th><th>输出</th><th>前端类比</th></tr></thead>
<tbody>
<tr><td><strong>顶点着色器</strong>（Vertex Shader）</td><td>算每个顶点在屏幕上的位置</td><td>顶点坐标 + UV + 法线</td><td>屏幕坐标</td><td><strong>HTML 结构</strong>——决定元素"在哪"</td></tr>
<tr><td><strong>片元着色器</strong>（Fragment Shader）</td><td>算每个像素的颜色</td><td>纹理采样 + 插值后的 UV</td><td>颜色值（RGBA）</td><td><strong>CSS 样式</strong>——决定元素"长什么样"</td></tr>
</tbody>
</table>

片元着色器跑在光栅化之后——光栅化把三角形"涂"成上百万个像素点，然后片元着色器对**每一个像素点**执行一次你的代码。你的 Shader 代码会被 GPU 的几千个核心同时并行执行——这就是为什么 Shader 快，也是为什么它和普通 TypeScript 代码的思维模式完全不同。

<div class="tip-box">
<strong>前端类比：</strong> 浏览器渲染管线是 <code>HTML → DOM → CSS → Layout → Paint → Composite</code>。GPU 渲染管线是 <code>顶点数据 → 顶点着色器 → 光栅化 → 片元着色器 → 像素</code>。两者的共同点是"算位置→算颜色"。但关键不同在于：前端的 Paint 阶段你控制不了（浏览器自己画），而 Shader 的片元着色器让你<strong>直接控制每个像素的颜色</strong>——这是前端 CSS 做不到的。
</div>

## 🧩 Cocos Effect 文件：YAML + GLSL 的混合体

Cocos Creator 把 Shader 包装成了 Effect 资源文件。它分两部分——上面是 YAML 定义（暴露到编辑器的参数），下面是 GLSL 代码（跑在 GPU 上）：

<pre>// Cocos Effect 文件结构
CCEffect %{
  techniques:
  - passes:
    - vert: default-vs:builtin     // 顶点着色器（通常用内置的）
      frag: unlit-fs:builtin       // 片元着色器声明
      properties:                   // 暴露到编辑器的 Uniform 参数
        dissolveStrength: { value: 0.5 }  // ← 就像 CSS 的 --my-var
        noiseTex: { value: white }        // ← 一个纹理变量
        edgeColor: { value: [1, 0.5, 0, 1] }
}%
CCProgram unlit-fs %{
  // Uniform 变量：从 CPU（TypeScript）传给 GPU 的数据
  // 就像 CSS 自定义属性：:root { --dissolve: 0.5 }
  uniform sampler2D noiseTex;
  uniform Constant {
    float dissolveStrength;
    vec4 edgeColor;
  };

  vec4 frag() {
    vec4 color = mainTexture * v_color;
    float noise = texture(noiseTex, v_uv).r;
    if (noise &lt; dissolveStrength) discard;  // 溶解！
    return color;
  }
}%</pre>

这里有一个关键概念：**Uniform 变量 = CSS 自定义属性**。你从 TypeScript 这头设置一个值（`material.setProperty('dissolveStrength', 0.7)`），GPU 那头所有并行的片元着色器实例同时读到这个值——就像 `:root { --dissolve: 0.7 }` 会影响所有用到 `var(--dissolve)` 的元素。

## ✨ 四个拿来就用的 Shader 效果：原理和直觉

不需要你现场写 GLSL，但理解这四种效果的原理，会让你知道"这个效果在 GPU 上是怎么做到的"：

<table>
<thead><tr><th>效果</th><th>核心原理</th><th>场景</th><th>前端类比</th></tr></thead>
<tbody>
<tr><td><strong>溶解（Dissolve）</strong></td><td>采样噪声纹理的 R 通道，如果噪声值 &lt; dissolveStrength，就用 <code>discard</code> 丢弃这个像素不画。溶解进度从 0→1，像素从部分丢弃到全部丢弃——像灰烬一样碎掉。</td><td>敌人受击后消散、角色传送</td><td><code>opacity</code> 淡出 + <code>mask-image</code> 遮罩，但是逐像素的、非矩形的</td></tr>
<tr><td><strong>描边（Outline）</strong></td><td>检查当前像素周围 N 个像素的 alpha 值——如果自己的 alpha 高但周围某个像素 alpha 低（说明自己是边缘），就把颜色替换为描边颜色。本质是<strong>邻域检测</strong>。</td><td>Boss 出场、选中高亮</td><td><code>text-shadow</code> 或 <code>-webkit-text-stroke</code>，但对任何形状都有效</td></tr>
<tr><td><strong>灰度（Grayscale）</strong></td><td><code>gray = R×0.299 + G×0.587 + B×0.114</code>，把三个通道加权平均（人眼对绿色最敏感，所以绿色权重大）。</td><td>暂停界面、回忆闪回</td><td><code>filter: grayscale(100%)</code>——完全等价，但 Shader 可以更精细控制</td></tr>
<tr><td><strong>闪白（Flash White）</strong></td><td>在片元着色器中 <code>color.rgb += flashAmount</code>，把所有颜色通道推向白色。受击瞬间 <code>flashAmount</code> 跳到 1.0 然后快速衰减回 0。</td><td>受击反馈、收集道具</td><td><code>filter: brightness(200%)</code> 瞬间闪亮</td></tr>
</tbody>
</table>

:::demo shader-compare

## 📺 全屏后处理：给整个画面加滤镜

上面说的四种效果是**材质 Shader**——挂在单个 Sprite 上，只影响这一个元素。还有一种更强大的用法——**全屏后处理**（Post-processing）。整个场景渲染完成后，在输出到屏幕之前，对整个画面加一层 Shader。

<pre>渲染流程（带后处理）：
场景渲染（所有 Sprite、粒子、UI）
  ↓
RenderTexture（把画面"拍"成一张纹理）
  ↓
全屏后处理 Shader（对这张纹理做效果）
  ↓  Bloom（亮的地方溢出光芒）
  ↓  Vignette（边角暗角——聚焦中央）
  ↓  Color Grading（整体色调调整）
  ↓
屏幕上的最终像素</pre>

前端类比：全屏后处理就是 **CSS 的 `filter` 或 `backdrop-filter`**——它不改变底下的元素，只是在合成阶段对整个画面做一层处理。区别是 Cocos 的后处理可以做 CSS 做不到的事情：Bloom（泛光）、Motion Blur（运动模糊）、Radial Blur（径向模糊）、Chromatic Aberration（色差）——这些都是 `filter` 没有的。

## 🔧 动手：写一个灰度 Shader 并跑在场景里

在 Cocos Creator 中：

1. **创建 Effect 资源：** assets 面板右键 → 创建 → Effect。命名为 `grayscale.effect`。把顶点着色器设为内置的 `default-vs:builtin`，片元着色器设为 `unlit-fs:builtin`。
2. **写灰度逻辑：** 在片段着色器中，取纹理颜色 `vec4 texColor = texture(mainTexture, v_uv)`，计算灰度值 `float gray = texColor.r * 0.299 + texColor.g * 0.587 + texColor.b * 0.114`，输出 `vec4(gray, gray, gray, texColor.a)`。
3. **挂载到 Sprite：** 在场景中创建一个 Sprite 节点，属性检查器中把默认材质替换为刚写的 Effect 对应的材质。
4. **预览：** 点击预览按钮，观察彩色图片是否变成灰色。
5. **进阶——加一个 Uniform 控制：** 在 Effect 的 properties 中声明 `intensity: { value: 1.0 }`，在 Shader 中用 `mix(texColor.rgb, vec3(gray), intensity)`——现在你可以在编辑器中拖滑条，从 0（原色）到 1（全灰）平滑过渡。
6. **再进阶——尝试溶解效果：** 添加一个噪声纹理 Uniform，用 `if (noise < dissolveStrength) discard` 丢弃像素。用代码在 update 中逐渐增加 dissolveStrength，你就得到了一个"灰飞烟灭"的效果。

如果你觉得 GLSL 的语法很陌生——正常。它和 TypeScript 完全不同：没有对象、不能 new、没有字符串、没有数组动态扩容。但它的核心思想和 CSS 自定义属性 + 逐像素操作是一样的。坚持写完一个灰度 Shader，你就跨过了从"害怕 Shader"到"敢改 Shader"的坎。

## 🔗 课外延伸

不要求掌握，但如果你感兴趣，这些都是值得了解的故事：

- **Shadertoy——用数学画出世界：** shadertoy.com 是一个只用 Shader 代码画图的社区。没有模型、没有纹理——所有的画面都是 GLSL 代码实时计算出来的。你会看到几百行代码画出逼真的海洋波浪、森林树木、甚至完整的 3D 场景（用的是光线追踪技术——在 Shader 里模拟光线反射）。这个社区证明了"像素 + 数学"的表达力没有上限。推荐搜索 "Shadertoy seascape"——一段 200 行的 Shader 画出了海平面、日落和波浪，所有细节都是数学。
- **《塞尔达传说：荒野之息》的 Cel Shading——赛璐珞风格的秘密：** 任天堂在 BotW 中使用了赛璐珞着色（Cel Shading / Toon Shading）：光照计算不用平滑的 Lambert 模型（从亮到暗渐变过渡），而是把亮度分成 2-3 个离散台阶（亮面 / 中间面 / 暗面）。结果就是"像在动画片里探索"的独特视觉风格。这不是一个"技术选项"，而是整个游戏美学定位的基石。你的 Shader 选择也在决定你游戏的美术方向。
- **CRT 电视扫描线——从过时技术到现代复古美学：** 老式 CRT 电视因为电子束逐行扫描会留下轻微的横线间隙——这是当时的技术限制。但现在大量复古风格游戏**故意用 Shader 模拟 CRT 扫描线**，营造一种"在老电视上玩"的怀旧感。这就是 Shader 的魔幻之处：它可以模拟任何一种显示介质——CRT、VHS 录像带、老电影胶片、甚至坏点屏。技术限制变成了审美选择。

## ✅ 自测清单

学完这一节，你应该能回答这些问题：

1. 顶点着色器和片元着色器各自负责什么？用一句话分别描述。如果你只需要做一个"所有物体变红"的效果，你应该改顶点着色器还是片元着色器？为什么？
2. Uniform 变量是什么？为什么它被类比为"CSS 自定义属性"？如果你需要在 TypeScript 代码里动态控制一个 Shader 的溶解进度，完整的数据流向是怎样的（TypeScript → ??? → GPU）？
3. 全屏后处理（如 Bloom 泛光）和材质 Shader（如 Sprite 上的灰度 Shader）在渲染管线中的执行时机有什么区别？为什么全屏后处理更"重"（对性能的影响更大）？
4. 你写了一个 Shader，但运行后发现 Sprite 完全消失了——纯透明。列出三个可能的 bug 原因（不一定是语法错误），以及你如何排查每一步。
