<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="15" title="Shader 与后处理特效" duration="2-3 天" :total="17">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解 <strong>Cocos Effect</strong> 语法体系，能独立编写简单 Shader</li>
        <li>将前端 CSS 思维<strong>平滑迁移</strong>到 GPU Shader 编程</li>
        <li>实现<strong>溶解、描边、灰度、闪白</strong>等常见游戏特效</li>
        <li>搭建<strong>屏幕后处理</strong>管线：全屏变色、径向模糊、暗角效果</li>
        <li>掌握移动端 Shader <strong>性能优化</strong>和精度选择</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="Shader 是什么 —— 前端直觉入门">
      <p>
        如果你写过 CSS，你就已经理解了 Shader 的一半。Shader 是运行在 <strong>GPU</strong> 上的小程序，
        对屏幕上每一个像素执行相同的计算。这就是为什么它可以同时处理数百万像素而不会卡顿——
        它不是"循环 100 万次"，而是<strong>同时启动 100 万个微型计算单元</strong>。
      </p>

      <h3>前端类比对照表</h3>
      <table>
        <thead>
          <tr>
            <th>游戏 / Shader 概念</th>
            <th>前端等价物</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Shader</td>
            <td>CSS filter + SVG filter</td>
            <td>对渲染结果做像素级处理，但 Shader 能力远强于 CSS filter</td>
          </tr>
          <tr>
            <td>Material（材质）</td>
            <td>CSS class</td>
            <td>给精灵"套用"一个视觉效果，同一个 Shader 可以产出多个 Material</td>
          </tr>
          <tr>
            <td>Uniform（统一变量）</td>
            <td>CSS Custom Property（<code>--my-color</code>）</td>
            <td>从 CPU 传给 GPU 的参数，运行时动态改变特效强度</td>
          </tr>
          <tr>
            <td>Vertex Shader（顶点着色器）</td>
            <td><code>transform</code> / <code>position</code></td>
            <td>决定顶点画在屏幕的哪个位置</td>
          </tr>
          <tr>
            <td>Fragment Shader（片元着色器）</td>
            <td><code>background-color</code> / <code>opacity</code></td>
            <td>决定每个像素最终显示什么颜色</td>
          </tr>
          <tr>
            <td>Effect 文件</td>
            <td><code>.css</code> 文件</td>
            <td>Shader 源码 + 编译配置的载体</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>关键转变：</strong>前端是"描述式"——你说"这个 div 红色"，浏览器帮你画。
        Shader 是"指令式"——你要告诉 GPU <strong>怎么算出</strong>这个红色。
        这就像一个是用 Figma 拖拽，另一个是写 SVG path——前者快但能力有限，后者灵活但需要理解底层。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📝" title="Cocos Effect 语法入门">
      <p>
        Cocos Creator 使用自研的 <strong>Cocos Effect</strong> 格式，基于 GLSL 扩展。
        一个 Effect 文件由两大部分组成：<strong>YAML 头部</strong>（声明式配置）和
        <strong>GLSL 代码块</strong>（Shader 逻辑）。
      </p>

      <h3>最小 Effect 文件结构</h3>
      <pre><code>// my-first-shader.effect
CCEffect %{
  techniques:
  - name: opaque
    passes:
    - vert: sprite-vs:vert     // 使用内置 Sprite 顶点着色器
      frag: sprite-fs:frag     // 使用内置 Sprite 片元着色器
      properties:              // 声明 uniform 变量（类比 CSS 自定义属性）
        u_tintColor: { value: [1.0, 0.0, 0.0, 1.0], editor: { type: color } }
        u_intensity: { value: 0.5, editor: { type: slider, range: [0, 1] } }
}%

CCProgram sprite-fs %{
  precision highp float;
  #include &lt;builtin/uniforms/cc-global&gt;

  in vec2 v_uv0;
  uniform sampler2D cc_spriteTexture;

  // 自定义 uniform —— 和 properties 中声明的一一对应
  uniform Properties {
    vec4 u_tintColor;
    float u_intensity;
  };

  vec4 frag() {
    vec4 texColor = texture(cc_spriteTexture, v_uv0);
    // 混合原色和染色：intensity=0 原图，intensity=1 完全染色
    vec3 tinted = mix(texColor.rgb, u_tintColor.rgb, u_intensity);
    return vec4(tinted, texColor.a);
  }
}%</code></pre>

      <h3>YAML 头部字段说明</h3>
      <table>
        <thead>
          <tr>
            <th>字段</th>
            <th>前端类比</th>
            <th>作用</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>name</code></td>
            <td>CSS 选择器名称</td>
            <td>技术（technique）的名字，Cocos 用此选择渲染路径</td>
          </tr>
          <tr>
            <td><code>passes</code></td>
            <td>CSS 层叠顺序</td>
            <td>一个材质可以有多个 Pass（多遍渲染），每遍叠加效果</td>
          </tr>
          <tr>
            <td><code>vert</code> / <code>frag</code></td>
            <td>HTML 标签 + CSS 规则的组合</td>
            <td>指定使用哪个顶点/片元着色器函数</td>
          </tr>
          <tr>
            <td><code>properties</code></td>
            <td>CSS 自定义属性声明</td>
            <td>在编辑器面板暴露的调节参数</td>
          </tr>
        </tbody>
      </table>

      <h3>内置 Uniform 速查</h3>
      <table>
        <thead>
          <tr>
            <th>Uniform</th>
            <th>含义</th>
            <th>典型用途</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>cc_time</code></td>
            <td>引擎运行总时间（秒）</td>
            <td>动画 Shader：扫描线、波浪、呼吸效果</td>
          </tr>
          <tr>
            <td><code>cc_matView</code></td>
            <td>视图矩阵（Camera 变换）</td>
            <td>世界坐标 → 相机坐标转换</td>
          </tr>
          <tr>
            <td><code>cc_matProj</code></td>
            <td>投影矩阵</td>
            <td>相机坐标 → 屏幕坐标转换</td>
          </tr>
          <tr>
            <td><code>cc_spriteTexture</code></td>
            <td>当前 Sprite 的纹理</td>
            <td>采样精灵图片（最常用）</td>
          </tr>
          <tr>
            <td><code>cc_mainTexture</code></td>
            <td>主纹理（通用）</td>
            <td>非 Sprite 渲染时的纹理</td>
          </tr>
        </tbody>
      </table>

      <h3>Shader 创建到使用的完整流程</h3>
      <ol>
        <li>在 <code>assets/effects/</code> 下创建 <code>my-shader.effect</code> 文件</li>
        <li>Cocos 编辑器自动编译，<strong>编译失败会在控制台提示具体行号</strong></li>
        <li>在资源管理器中右键 Effect → <strong>创建 Material</strong>（类比：CSS 文件 → 新建实例）</li>
        <li>选中 Sprite 节点 → 属性面板 → <code>CustomMaterial</code> → 拖入刚才的 Material</li>
        <li>调节 Material 面板中的参数，<strong>实时预览</strong>效果</li>
      </ol>

      <div class="warn-box">
        <strong>常见坑：</strong>Effect 文件名必须和文件内的 CCEffect 名称一致吗？不需要。但
        <strong>CCProgram 块的名字</strong>（如 <code>sprite-fs</code>）必须和 <code>frag:</code>
        引用一致。拼错了不会报语法错——只会默默渲染黑屏。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✨" title="常用内置 Shader 技巧">
      <p>
        以下是飞机大战项目中可以直接使用的 4 个经典 Shader 特效。每个都提供了完整的
        Effect 代码，复制到项目中即可使用。
      </p>

      <h3>① 溶解效果（Dissolve）—— 敌人死亡消融</h3>
      <p>
        敌人被击杀后不是直接消失，而是像被火焰烧掉一样从边缘开始消融。核心原理：
        用一张<strong>噪声纹理</strong>作为阈值，当 <code>noise < threshold</code> 时丢弃该像素。
        threshold 从 0 逐渐到 1，画面逐步消失。
      </p>
      <pre><code>// dissolve.effect —— 片元着色器核心
vec4 frag() {
  vec4 texColor = texture(cc_spriteTexture, v_uv0);
  float noise = texture(u_noiseTex, v_uv0).r;  // 噪声值 0~1
  float threshold = u_progress;                  // 当前溶解进度 0~1
  float edgeWidth = u_edgeWidth;                 // 边缘宽度 0~0.3

  // 低于阈值 → 丢弃该像素
  if (noise &lt; threshold) {
    discard;
  }

  // 边缘发光：接近阈值的像素变成发光色
  float edge = smoothstep(threshold, threshold + edgeWidth, noise);
  vec3 glowColor = mix(u_edgeColor.rgb, texColor.rgb, edge);

  return vec4(glowColor, texColor.a);
}</code></pre>

      <h3>② 描边效果（Outline）—— 选中 / Boss 警告提示</h3>
      <p>
        对精灵周围像素采样，如果邻居像素的 alpha 差异大，说明这里是边缘——涂上描边色。
      </p>
      <pre><code>vec4 frag() {
  vec4 texColor = texture(cc_spriteTexture, v_uv0);
  vec2 texelSize = 1.0 / vec2(textureSize(cc_spriteTexture, 0));

  // 采样 4 个方向的邻居 alpha
  float a_top    = texture(cc_spriteTexture, v_uv0 + vec2(0, texelSize.y)).a;
  float a_bottom = texture(cc_spriteTexture, v_uv0 - vec2(0, texelSize.y)).a;
  float a_left   = texture(cc_spriteTexture, v_uv0 - vec2(texelSize.x, 0)).a;
  float a_right  = texture(cc_spriteTexture, v_uv0 + vec2(texelSize.x, 0)).a;

  float outline = max(max(a_top, a_bottom), max(a_left, a_right)) - texColor.a;
  outline = clamp(outline, 0.0, 1.0);

  vec3 result = mix(texColor.rgb, u_outlineColor.rgb, outline);
  return vec4(result, texColor.a + outline * u_outlineColor.a);
}</code></pre>

      <h3>③ 灰度化（Grayscale）—— 未解锁角色 / 死亡灰屏</h3>
      <p>
        灰度转换公式 = RGB 三个通道按人眼敏感度加权求和。比 CSS 的
        <code>filter: grayscale(1)</code> 更灵活——你可以控制灰度化进度。
      </p>
      <pre><code>vec4 frag() {
  vec4 texColor = texture(cc_spriteTexture, v_uv0);
  // 人眼对绿色最敏感，红色次之，蓝色最低
  float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
  vec3 result = mix(texColor.rgb, vec3(gray), u_grayscaleAmount);
  return vec4(result, texColor.a);
}</code></pre>

      <h3>④ 闪白效果（Flash / White Hit）—— 受伤反馈</h3>
      <p>
        玩家或敌人受伤时瞬间闪白，0.1 秒后恢复。利用 <code>sin()</code> 生成脉冲：
      </p>
      <pre><code>vec4 frag() {
  vec4 texColor = texture(cc_spriteTexture, v_uv0);
  // sin 产生 0→1→0 的脉冲，u_speed 控制闪烁频率
  float flash = sin(cc_time.x * u_speed) * 0.5 + 0.5;
  vec3 result = mix(texColor.rgb, vec3(1.0), flash * u_intensity);
  return vec4(result, texColor.a);
}

// TypeScript 侧控制：受伤时设置 u_intensity = 1，0.1 秒后恢复 0
// 使用 tween 平滑过渡：
tween(this.material).to(0.1, { 'u_intensity': 0 }).start();</code></pre>

      <div class="tip-box">
        <strong>组合使用：</strong>这 4 个 Shader 可以组合——例如 Boss 死亡时同时做
        <strong>溶解 + 闪白 + 描边</strong>。在 fragment shader 中按顺序叠加即可。
        但在移动端注意性能——3 个 Shader 叠在一起，如果屏幕上同时有 20 个敌人，
        就是 60 次 Shader 执行。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🖥️" title="屏幕后处理（Post-Processing）">
      <p>
        前面的 Shader 都作用于单个精灵。但有时你需要对<strong>整个画面</strong>做效果——
        比如 Boss 出场时画面变暗、玩家残血时边缘变红。这就是<strong>屏幕后处理</strong>：
        先把场景渲染到一张纹理上，再对这张纹理执行 Shader。
      </p>

      <h3>后处理管线搭建（4 步）</h3>
      <ol>
        <li><strong>创建 RenderTexture</strong>：在资源管理器中创建，尺寸设为屏幕分辨率（如 480×800）</li>
        <li><strong>Camera 输出到 RenderTexture</strong>：选中 Main Camera → <code>TargetTexture</code> → 拖入 RenderTexture</li>
        <li><strong>创建 Blit Sprite</strong>：新建一个铺满屏幕的 Sprite 节点，放在 Camera 下方，纹理设为 RenderTexture</li>
        <li><strong>给 Blit Sprite 挂后处理 Material</strong>：和普通 Sprite 一样，设置 <code>CustomMaterial</code></li>
      </ol>

      <h3>全屏后处理 Shader 模板</h3>
      <pre><code>// post-process.effect —— 全屏后处理通用模板
CCEffect %{
  techniques:
  - name: opaque
    passes:
    - vert: sprite-vs:vert
      frag: sprite-fs:frag
      properties:
        u_vignetteStrength: { value: 0.5, editor: { type: slider, range: [0, 1] } }
        u_vignetteColor: { value: [0.0, 0.0, 0.0, 1.0], editor: { type: color } }
        u_colorTint: { value: [1.0, 1.0, 1.0, 1.0], editor: { type: color } }
}%

CCProgram sprite-fs %{
  precision highp float;
  #include &lt;builtin/uniforms/cc-global&gt;

  in vec2 v_uv0;
  uniform sampler2D cc_spriteTexture;

  uniform Properties {
    float u_vignetteStrength;
    vec4 u_vignetteColor;
    vec4 u_colorTint;
  };

  vec4 frag() {
    vec4 col = texture(cc_spriteTexture, v_uv0);

    // ① 暗角效果：距离屏幕中心越远越暗
    vec2 center = v_uv0 - 0.5;
    float dist = length(center) * 1.4;  // 1.4 = 对角线长度，覆盖四个角
    float vignette = 1.0 - dist * u_vignetteStrength;
    vignette = clamp(vignette, 0.0, 1.0);

    // ② 颜色叠加：受伤闪红 / 冻结偏蓝
    col.rgb = mix(col.rgb, u_colorTint.rgb, u_colorTint.a);

    // ③ 组合暗角
    col.rgb = mix(u_vignetteColor.rgb, col.rgb, vignette);

    return col;
  }
}%</code></pre>

      <h3>经典全屏效果配方</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>u_vignetteStrength</th>
            <th>u_colorTint</th>
            <th>u_vignetteColor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>玩家残血 (&lt; 30%)</td>
            <td>0.6</td>
            <td>rgba(1, 0.2, 0.2, 0.3)</td>
            <td>黑色</td>
          </tr>
          <tr>
            <td>Boss 出场警告</td>
            <td>0.8</td>
            <td>rgba(1, 1, 1, 0)</td>
            <td>黑色</td>
          </tr>
          <tr>
            <td>冻结 / 时停技能</td>
            <td>0.3</td>
            <td>rgba(0.4, 0.7, 1, 0.4)</td>
            <td>深蓝</td>
          </tr>
          <tr>
            <td>胜利画面</td>
            <td>0.2</td>
            <td>rgba(1, 0.9, 0.5, 0.15)</td>
            <td>暖黄</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>性能警告：</strong>RenderTexture + 后处理 Shader 会让整个场景多渲染一遍。
        在低端 Android 上（如 2018 年前的机型），后处理可能导致帧率从 60 降到 30。
        建议只在<strong>特定时刻</strong>（Boss 出场、残血）短暂开启，平时关闭。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚡" title="性能考量 —— Shader 不是免费的">
      <p>
        Shader 很强大，但每多一条指令，GPU 就要为<strong>屏幕上每一个像素</strong>多执行一次。
        480×800 = 384,000 像素。如果你的 Fragment Shader 多了 20 条指令，就是
        768 万次额外运算——<strong>每帧</strong>。
      </p>

      <h3>Shader 复杂度 vs 填充率</h3>
      <table>
        <thead>
          <tr>
            <th>因素</th>
            <th>影响</th>
            <th>优化方向</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>纹理采样次数</td>
            <td>每次 <code>texture()</code> 调用都是显存读取——慢</td>
            <td>合并纹理到一张 Atlas，减少采样次数</td>
          </tr>
          <tr>
            <td>分支语句（if/discard）</td>
            <td>GPU 不擅长分支——会同时执行两个分支再选结果</td>
            <td>用 <code>step</code> / <code>smoothstep</code> 代替 if</td>
          </tr>
          <tr>
            <td>填充率（Fill Rate）</td>
            <td>大尺寸精灵 + 复杂 Shader = GPU 超负荷</td>
            <td>小精灵用简单 Shader，大精灵才用复杂特效</td>
          </tr>
          <tr>
            <td>Overdraw（重复绘制）</td>
            <td>多层半透明叠加，每个像素被画多次</td>
            <td>减少透明层数，关闭不可见节点的 Shader</td>
          </tr>
        </tbody>
      </table>

      <h3>移动端 GPU 差异</h3>
      <table>
        <thead>
          <tr>
            <th>GPU 系列</th>
            <th>常见机型</th>
            <th>注意事项</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Apple GPU</td>
            <td>iPhone 全系列</td>
            <td>性能稳定，但对 <code>discard</code> 性能不佳——溶解 Shader 在 iPhone 上更慢</td>
          </tr>
          <tr>
            <td>Mali</td>
            <td>华为 / 三星中端</td>
            <td><code>mediump</code> 实际精度比 Adreno 低——渐变可能出现色带</td>
          </tr>
          <tr>
            <td>Adreno</td>
            <td>小米 / OPPO / vivo</td>
            <td>市场份额最大，整体表现中等，纹理采样速度较快</td>
          </tr>
        </tbody>
      </table>

      <h3>精度选择：mediump vs highp</h3>
      <pre><code>// 默认使用 mediump（性能好，但 UV 坐标在大纹理中可能偏移）
precision mediump float;  // 适用于：颜色值、简单混合

// 以下场景必须用 highp：
precision highp float;    // UV 坐标计算、世界坐标、cc_time 大数值、噪声函数

// 微信小游戏最佳实践：按需声明
vec4 frag() {
  highp vec2 uv = v_uv0;       // UV 用 highp
  mediump vec4 color = texture(cc_spriteTexture, uv);  // 颜色用 mediump
  return color;
}</code></pre>

      <h3>条件编译 —— 一个 Shader 适配多平台</h3>
      <pre><code>// 用 #ifdef 在编译期为不同平台选择不同逻辑
vec4 frag() {
  vec4 col = texture(cc_spriteTexture, v_uv0);

#ifdef USE_HIGH_QUALITY
  // 高端机：5 次纹理采样的高斯模糊
  col = gaussianBlur5(col);
#else
  // 低端机：3 次采样的简化模糊
  col = gaussianBlur3(col);
#endif

  return col;
}</code></pre>

      <div class="tip-box">
        <strong>经验法则：什么时候不用 Shader？</strong>如果只是换颜色（如敌人从红色变蓝色），
        <strong>不要上 Shader</strong>——换一张 SpriteFrame 成本远低于 Shader。
        Shader 适用场景：需要<strong>动态、渐变、基于像素位置</strong>的效果。
        类比前端：CSS <code>background-color: red</code> 能解决的，不要上 Canvas 逐像素画。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: Effect 文件编译报错 "unexpected token"，但语法看起来没错？</h3>
      <p>
        Cocos Effect 是 <strong>GLSL 300 ES</strong> 语法，不是桌面 GLSL。常见差异：必须用
        <code>in</code> / <code>out</code> 而不是 <code>varying</code> / <code>attribute</code>；
        <code>texture()</code> 而不是 <code>texture2D()</code>；
        <code>precision</code> 声明必须放在使用 float 之前。
      </p>

      <h3>Q2: Shader 在编辑器预览正常，到了微信小游戏真机上黑屏？</h3>
      <p>
        最常见的原因：使用了 <code>highp</code> 精度但设备不支持，或者 Fragment Shader 中有
        <code>discard</code> 语句导致渲染管线异常。先在 Shader 最前面加
        <code>#ifdef GL_FRAGMENT_PRECISION_HIGH</code> 判断。也可以先用最简单的
        <code>return vec4(1.0, 0.0, 0.0, 1.0);</code>（纯红色）验证 Shader 是否被加载。
      </p>

      <h3>Q3: 后处理效果覆盖了 UI 层怎么办？</h3>
      <p>
        这是 Camera 的渲染层级问题。UI Camera 应该使用更高的 <strong>Depth</strong> 值，
        让 UI 渲染在 RenderTexture 之后。或者使用多个 Camera：
        Game Camera（depth=0）→ RenderTexture → Blit Camera（depth=0）→ UI Camera（depth=1）。
        这和前端 z-index 叠层是一个思路——把 UI 放在"更高层"。
      </p>

      <h3>Q4: 为什么我的 dissolve Shader 在低端安卓上卡成 PPT？</h3>
      <p>
        <code>discard</code> + <code>texture()</code>（噪声纹理采样）是低端 GPU 两大杀手。
        优化方案：
        ① 噪声纹理缩小到 64×64（溶解不需要高精度噪声）；
        ② 用 <code>step</code> 替代 if 判断；
        ③ 远离屏幕的小敌人<strong>跳过溶解动画</strong>，直接 setActive(false)。
      </p>

      <h3>Q5: Cocos 自带的 Material 和我自己创建的有什么区别？</h3>
      <p>
        Cocos 内置的 <code>builtin-sprite</code> Material 使用的是引擎默认 Effect，不支持自定义
        uniform 变量。当你需要在编辑器中调节 Shader 参数时，必须创建自己的 Effect + Material。
        <strong>类比：</strong>内置 Material = 浏览器默认样式，自定义 Material = 你自己写的 CSS class。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>Cocos Effect 文件的 YAML 头部和 GLSL 代码块分别负责什么？</li>
        <li>Vertex Shader 和 Fragment Shader 的职责分别是什么？前端有哪些概念与之对应？</li>
        <li>内置 uniform <code>cc_time</code> 和 <code>cc_spriteTexture</code> 各有什么用途？</li>
        <li>从创建 .effect 文件到 Sprite 显示效果，完整链路是哪几步？</li>
        <li>溶解 Shader 的核心原理是什么？<code>discard</code> 关键字的作用？</li>
        <li>描边 Shader 中如何判断一个像素是否在边缘？</li>
        <li>灰度化公式中的三个权重（0.299, 0.587, 0.114）为什么不是相等的？</li>
        <li>后处理管线的 4 个搭建步骤是什么？Camera 的 TargetTexture 起什么作用？</li>
        <li><code>mediump</code> 和 <code>highp</code> 在微信小游戏中应该怎么选择？</li>
        <li>Shader 的 <code>discard</code> 操作为什么在 Apple GPU 上性能较差？</li>
        <li>什么时候应该用 Shader，什么时候换 SpriteFrame 就够了？举例说明。</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
