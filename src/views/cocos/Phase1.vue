<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="1" title="游戏引擎世界观" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>这是整个 Cocos 学习路径的起点。我们不急着写代码，先搞清楚一件事：<strong>游戏引擎到底是什么？它为什么要这么设计？</strong> 如果你是从前端转过来的，这一节会帮你完成最关键的思维切换。</p>
    </ConceptBlock>

    <ConceptBlock icon="🕹️" title="没有引擎的年代，游戏是怎么做的？">
      <p>想象一下现在是 1982 年。你想做一个游戏。没有 Unity，没有 Cocos，没有"引擎"这个概念。你手里只有一台雅达利 2600，一块 6502 处理器，128 字节的 RAM——对，<strong>字节</strong>，连 KB 都不是。</p>
      <p>你要自己写汇编代码，手动控制 CRT 电视的电子束扫描，在每帧的消隐期间（VBLANK）更新寄存器，让画面动起来。每一行代码都在和硬件底层的寄存器打交道——没有"节点"、没有"组件"、没有"动画曲线编辑器"。你写的代码长这样：</p>
      <pre>; 雅达利 2600 的汇编代码片段
; 检测两个精灵是否碰撞
LDA $D000    ; 读取精灵 0 的 X 坐标
CMP $D004    ; 和精灵 1 的 X 坐标比较
BNE no_collision
LDA $D001    ; 读取精灵 0 的 Y 坐标
CMP $D005    ; 和精灵 1 的 Y 坐标比较
BNE no_collision
JMP collision ; 碰撞了！
no_collision:</pre>
      <p>是不是看着就头皮发麻？那时候做一个游戏，周期常以<strong>年</strong>为单位。一个人身兼程序员、美术、音乐、关卡设计，而且每个游戏都要从零开始写底层代码。</p>
      <p>然后，90 年代初，id Software 的 John Carmack 做了一件改变游戏史的事：他把《德军总部 3D》的底层渲染代码和游戏逻辑<strong>分离开来</strong>，这样《毁灭战士》（Doom）可以复用同一套渲染核心，只重写游戏逻辑。这套渲染核心，就是"引擎"的雏形。</p>
      <p>到了 1998 年，Epic 把《虚幻》（Unreal）的引擎单独拿出来卖——<strong>游戏引擎从此成为了一个独立的产品</strong>。开发者不再需要从零造轮子，授权一个引擎，专注做游戏内容就行了。</p>
      <div class="tip-box">
        <strong>一句话总结：</strong> 游戏引擎就是把"所有游戏都要用的底层能力"（渲染、物理、音频、输入、资源管理）打包成一个可复用的框架，让你专注于"你的游戏独特的部分"（玩法、关卡、美术风格）。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="从事件驱动到帧驱动：前端工程师最关键的思维切换">
      <p>你打开一个网页，什么都不做，页面就安安静静地待着。你滚动鼠标、点击按钮，浏览器收到事件，触发回调函数，更新 DOM。这就是<strong>事件驱动</strong>模型——你是做前端的人，这已经刻在肌肉记忆里了。</p>
      <p>但游戏不行。就算你不动键盘、不摸屏幕，敌机照样飞，子弹照样跑，粒子照样飘，背景照样滚动。<strong>游戏世界是"活"的</strong>，它不等人。它需要一个永不停歇的心脏来驱动这一切。</p>
      <p>这个心脏，就是<strong>帧循环</strong>（Game Loop）：</p>
      <pre>// 每一帧（约 16 毫秒），引擎做三件事：
function gameLoop() {
  processInput()   // 1. 读输入：键盘/触摸/手柄状态
  update(dt)       // 2. 更新逻辑：位置、碰撞、AI、分数
  render()         // 3. 画画面：所有精灵渲染到屏幕上
  requestAnimationFrame(gameLoop) // 4. 下一帧再来一遍
}</pre>
      <p>如果你写过 <code>requestAnimationFrame</code> 做 Canvas 动画，你应该对这个模式不陌生。但 Cocos 把这一切都封装好了——你只需要在 <code>update(dt)</code> 里写逻辑，引擎自动调用你每秒 60 次。</p>
      <div class="tip-box">
        <strong>dt 是什么？</strong> <code>dt</code>（delta time）是上一帧到当前帧的时间差，单位是秒。任何与时间相关的计算都要乘以 dt——比如 <code>position += speed * dt</code>——这样无论帧率是 30fps 还是 60fps，物体移动的速度都一样。这个习惯和前端完全不同，但一旦养成，你会感激它。
      </div>
      <p>这里有一个微妙的点值得深思：<strong>事件驱动和帧驱动的本质区别不在于"有没有循环"</strong>——浏览器的 Event Loop 其实也是一个循环。真正的区别在于"谁在主动产生变化"：</p>
      <table>
        <thead><tr><th>维度</th><th>事件驱动（Web 前端）</th><th>帧驱动（游戏引擎）</th></tr></thead>
        <tbody>
          <tr><td>变化的来源</td><td>用户操作或异步回调触发</td><td>每一帧自动推进世界状态</td></tr>
          <tr><td>你不操作时的行为</td><td>页面静止</td><td>世界继续运转</td></tr>
          <tr><td>更新时机</td><td>不可预测（用户何时点击？）</td><td>固定节拍（60fps）</td></tr>
          <tr><td>主要性能目标</td><td>首屏加载、交互响应</td><td>帧率稳定（不掉帧）</td></tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🎨" title="渲染管线极简模型：从数据到像素的旅程">
      <p>你在 Cocos 编辑器里拖一个 Sprite 到场景中，点击预览，它就出现在浏览器里。好像很简单。但这一瞬间，<strong>GPU 在背后做了很多事</strong>。</p>
      <p>不需要成为图形学专家，但理解这个简化模型会对后面学 Shader、性能优化有很大帮助：</p>
      <pre>顶点数据（三角形的三个点在哪？）
  ↓  顶点着色器（计算每个顶点在屏幕上的位置）
  ↓
光栅化（把三角形"涂"成像素点）
  ↓  片元着色器（计算每个像素的颜色——这里就是 Shader 跑的地方）
  ↓
屏幕上的像素</pre>
      <p>对比一下 Web 前端的渲染管线：</p>
      <pre>HTML → DOM Tree + CSS → Render Tree → Layout（计算位置）
  → Paint（画像素）→ Composite（合成图层）→ 屏幕</pre>
      <p>你会发现，<strong>底层都是"算位置→画像素"</strong>。但前端的 Layout/Paint 是浏览器自动做的，而游戏引擎把这部分控制权交给了你——你可以写 Shader 直接控制每个像素的颜色，这是前端 CSS 做不到的。</p>
      <div class="tip-box">
        <strong>速通提示：</strong> 如果你暂时理解不了光栅化和片元着色器，没关系。Phase 21 讲 Shader 的时候会回来深入。现在只需要知道"GPU 做了一件很厉害的事"就够了。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🗺️" title="Cocos 在游戏引擎世界中的位置">
      <p>市面上的游戏引擎很多，为什么选择 Cocos Creator？先看看整个生态：</p>
      <table>
        <thead><tr><th>引擎</th><th>语言</th><th>擅长领域</th><th>典型作品</th></tr></thead>
        <tbody>
          <tr><td><strong>Unity</strong></td><td>C#</td><td>3D/2D 全面、手游、独立游戏</td><td>《原神》《空洞骑士》《Among Us》</td></tr>
          <tr><td><strong>Unreal</strong></td><td>C++/Blueprint</td><td>3A 级 3D、照片级画质</td><td>《黑神话：悟空》《堡垒之夜》</td></tr>
          <tr><td><strong>Godot</strong></td><td>GDScript/C#</td><td>2D 游戏、开源社区</td><td>《Cassette Beasts》</td></tr>
          <tr><td><strong>Cocos Creator</strong></td><td>TypeScript</td><td><strong>2D 手游、微信小游戏、H5</strong></td><td>《羊了个羊》《剑与远征》《叫我大掌柜》</td></tr>
        </tbody>
      </table>
      <p>Cocos Creator 的核心优势就两个：<strong>TypeScript 原生支持</strong>（前端工程师零语言切换成本）和<strong>微信小游戏一等公民</strong>（国内小游戏市场的主要引擎）。对于你——一个 Vue 前端工程师想做微信小游戏——Cocos 几乎是唯一合理的选择。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：安装 Cocos 并跑通第一个项目">
      <p>好了，理论聊够了。来实际动动手：</p>
      <ol>
        <li>去 <a href="https://www.cocos.com/creator">cocos.com/creator</a> 下载 Cocos Dashboard（先装 Dashboard，再通过 Dashboard 安装 Creator 3.8.x）</li>
        <li>打开 Dashboard，点击"新建项目"，选择"空白项目"模板，命名为 <code>pixel-plane-battle</code></li>
        <li>项目打开后，你会看到编辑器界面——先别慌，认识一下六大面板：<strong>场景编辑器</strong>（中间大画布）、<strong>层级管理器</strong>（左上节点树）、<strong>资源管理器</strong>（左下文件树）、<strong>属性检查器</strong>（右边属性面板）、<strong>控制台</strong>（底部日志）、<strong>动画编辑器</strong>（底部标签页）</li>
        <li>点击编辑器顶部的"预览"按钮（播放图标），浏览器会打开，你应该看到一个<strong>灰色背景</strong>——这就是你的第一个 Cocos 项目跑起来了</li>
      </ol>
      <p>灰色背景看起来不怎么样？别急。下一节我们就在这个画布上放东西。现在重要的是：<strong>你已经迈出了第一步</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <p>不要求掌握，但如果你感兴趣，这些都是值得了解的故事：</p>
      <ul>
        <li><strong>John Carmack 的 Quake 引擎开源：</strong> 2005 年，id Software 将《雷神之锤》的引擎代码以 GPL 协议开源。这是游戏史上最有影响力的开源事件之一。今天几乎所有 3D 引擎的光照和阴影算法，都能追溯到 Quake 引擎。去读 Carmack 的 <code>.plan</code> 文件（他的开发日志），你会看到一个天才如何用数学解决渲染问题。</li>
        <li><strong>游戏引擎的"中间件"模式：</strong> 除了 Unity/Unreal 这样的通用引擎，还有大量专精某一领域的中间件——Havok（物理）、Wwise（音频）、SpeedTree（植被）。3A 游戏往往不是用一个引擎，而是把十几个中间件拼起来。这和前端选 npm 包是一个思路。</li>
        <li><strong>"引擎"这个词的来源：</strong> 1993 年 id Software 的 John Romero 在一次采访中说《毁灭战士》的代码架构"like a car engine——you drop the body on top"。这个名字就此流传。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <p>学完这一节，你应该能回答这些问题：</p>
      <ol>
        <li>在没有游戏引擎的年代，开发者怎么写游戏的？为什么"复用"成为必然需求？</li>
        <li>帧驱动和事件驱动的核心区别是什么？用自己的话说清楚。</li>
        <li>dt（delta time）是什么？为什么所有和时间有关的计算都要乘 dt？</li>
        <li>GPU 渲染管线的简化模型是什么？（顶点→光栅化→片元→屏幕）</li>
        <li>Cocos Creator 在游戏引擎市场中适合什么场景？为什么 TypeScript 前端工程师应该选它？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
