<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="6" title="Audacity 编辑精要" duration="1 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>BFXR 输出的 WAV 是"生"的——爆音、空白头尾、音量不一致。就像 TypeScript 输出的 JS 还需要 terser 压缩一样，BFXR 的输出需要 Audacity 打磨。这一节学会修剪、淡入淡出、标准化、降噪——音效后期 80% 的操作。</p></ConceptBlock>

    <ConceptBlock icon="🔊" title="故事：为什么“生的”音效不能直接用">
      <p>把 Phase 5 做的 6 个 WAV 全部拖到同一个文件夹里，双击播放。你可能会注意到：</p>
      <ul>
        <li>有的音效开头有一段<strong>空白</strong>（50ms 的静音）——玩家按键后等 50ms 才听到声音，这在游戏中是致命的。</li>
        <li>有的音效结尾<strong>"啪"的一声</strong>——波形被突然截断导致爆音（clipping）。</li>
        <li>有的音效<strong>特别响</strong>，有的<strong>特别轻</strong>——它们的峰值音量差了 6dB 以上。</li>
        <li>有的音效背景有<strong>滋滋的底噪</strong>——BFXR 的参数偏极端时会产生不需要的噪声。</li>
      </ul>
      <p>这些问题和代码里的 lint 错误一样——不影响功能运行，但影响"产品质量"。Audacity 就是你的"音频 ESLint + Prettier"：把生的音效格式化成干净的、标准的、可发布的成品。</p>
    </ConceptBlock>

    <ConceptBlock icon="✂️" title="原理：四个核心操作——音频的 lint + format">
      <p>Audacity 有上百个功能，但对于游戏音效后期，你只需要掌握以下四个操作。每个操作对应一个具体的"产品质量目标"：</p>

      <p><strong>1. 修剪（Trim）—— 去除空白，消除延迟</strong></p>
      <p>目标：音效的第一帧就必须有声音。</p>
      <p>操作：放大波形（Ctrl+滚轮），找到声音开始的位置。用鼠标选中开头的空白区域（纯直线 = 静音），按 Delete 删除。结尾同理——选中最后的空白尾音，Delete。现在音效的播放时长 = 声音的实际时长，不多一毫秒。</p>
      <p>前端类比：就像移除代码里 100ms 的 setTimeout 延迟——用户操作的反馈必须即时。</p>

      <p><strong>2. 淡入淡出（Fade In / Fade Out）—— 防止爆音</strong></p>
      <p>目标：声音的开始和结束必须"平滑"。</p>
      <p>问题：数字音频中，如果波形从 0 瞬间跳到 0.5，扬声器振膜会突然位移——产生"啪"的爆音。Fade In 让波形从 0 平滑过渡到实际音量，通常只需要 3-5ms。</p>
      <p>操作：选中开头 5ms 的区域 → Effect → Fade In。选中结尾 10ms → Effect → Fade Out。</p>
      <p>前端类比：就像给一个显示/隐藏的元素加 <code>transition: opacity 0.05s</code>——极短但不突兀。</p>

      <p><strong>3. 标准化（Normalize）—— 统一音量</strong></p>
      <p>目标：所有音效的峰值音量一致。</p>
      <p>问题：6 个 BFXR 音效的峰值可能差 10dB。如果按照 Phase 5 的混音表设置相对音量，前提是它们的基准峰值要一致——否则 70% 的射击声可能比 40% 的引擎声还轻。</p>
      <p>操作：Ctrl+A（全选）→ Effect → Normalize → 勾选"Normalize peak amplitude to"并设为 <strong>-3dB</strong>。不要设为 0dB —— 留 3dB 的 headroom 给后续混音和多个音效叠加。</p>
      <p>前端类比：就像 CSS 的 <code>normalize.css</code>——让所有浏览器的默认样式一致，才能在此基础上做差异化设计。</p>

      <p><strong>4. 降噪（Noise Reduction）—— 清除底噪</strong></p>
      <p>目标：音效的背景应该绝对干净。</p>
      <p>原理：选取一段<strong>只有噪声、没有信号</strong>的区域 → Audacity 分析这段"噪声指纹" → 然后在整个文件中去掉这些频率。它的核心算法是<strong>频谱减法（Spectral Subtraction）</strong>：在全文件的频谱中减去噪声的频谱。</p>
      <p>操作：选中一小段纯噪声（即使是 50ms 也行）→ Effect → Noise Reduction → Get Noise Profile。然后选中全文件（Ctrl+A）→ 再次 Noise Reduction → OK。</p>
      <p>注意：降噪是一个"不可逆"操作。过度降噪会让音效听起来"空洞"——因为你把声音的一部分高频细节也削掉了。设置 Noise Reduction 的参数时，dB 值不要超过 12。</p>
      <p>前端类比：就像 Webpack 的 tree-shaking——只去掉确定无用的代码，不要过度压缩导致功能异常。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：打磨 6 个音效 + 导出 OGG">
      <p>下载并安装 <strong>Audacity</strong>（<a href="https://www.audacityteam.org" target="_blank">audacityteam.org</a>，完全免费开源）。然后逐一处理 Phase 5 的 6 个音效文件：</p>
      <ol>
        <li><strong>导入：</strong>File → Open → 选择 <code>shoot.wav</code>。你会看到波形图——横轴是时间，纵轴是振幅。</li>
        <li><strong>修剪：</strong>放大波形，选中开头的空白 → Delete。选中结尾的空白 → Delete。现在整个文件的长度就是声音的实际长度。</li>
        <li><strong>Fade In/Out：</strong>选中开头 5ms → Effect → Fade In。选中结尾 10ms → Effect → Fade Out。</li>
        <li><strong>标准化：</strong>Ctrl+A 全选 → Effect → Volume and Compression → Normalize → 勾选 Peak amplitude → 输入 -3dB → OK。</li>
        <li><strong>降噪（如果需要）：</strong>如果有明显底噪，找一段纯噪声 → Effect → Noise Reduction → Get Noise Profile → Ctrl+A → 再次 Noise Reduction → OK。</li>
        <li><strong>导出 OGG：</strong>File → Export → Export as OGG → Quality 设为 5（0-10，5 是音质和体积的最佳平衡点）。保存为 <code>shoot.ogg</code>。</li>
        <li><strong>重复以上步骤</strong>对 <code>explosion.wav</code>、<code>pickup.wav</code>、<code>hit.wav</code>、<code>engine.wav</code>、<code>boss_alarm.wav</code> 做同样的处理。</li>
      </ol>
      <p>处理完之后，把 6 个 OGG 文件放在一个文件夹里，逐个播放。你应该能听到明显的品质提升：开头没有延迟、结尾没有爆音、音量统一、背景干净。这就是"产品级音效"的状态。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>Audacity —— 一个持续了 25 年的开源奇迹：</strong>1999 年，卡内基梅隆大学的研究生 Dominic Mazzoni 需要一个音频编辑器来做研究。他找不到合适的开源工具，于是他决定自己写一个。25 年后，Audacity 仍然是<strong>全球最流行的开源音频编辑器</strong>——数亿次下载、全平台支持、超过 40 种语言。2021 年 Audacity 被 Muse Group（MuseScore 的母公司）收购，继续作为免费软件运营。这个故事揭示了一个开源工程的核心真相：<strong>解决自己问题的工具，往往也是别人需要的工具。</strong></li>
        <li><strong>OGG Vorbis —— 为游戏而生的格式：</strong>OGG 是 Xiph.Org 基金会在 2000 年发布的开源音频压缩格式。它的设计目标之一就是<strong>无缝循环</strong>——编码时不会像 MP3 那样在首尾插入静音帧。所以游戏引擎几乎一致推荐 OGG 作为音频格式：WAV 太大（10MB/分钟），MP3 循环有缝（编码段边界产生噼啪声），OGG 在两者之间取得了最佳平衡。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>在 Audacity 中，为什么音效的开头和结尾要加 Fade In/Out？这和 CSS transition 的 ease-in/ease-out 在防止"视觉跳变"上有什么相似之处？</li>
        <li>降噪（Noise Reduction）的原理是"频谱减法"。如果过度降噪会有什么副作用？这和图片过度压缩导致失真有什么类比关系？</li>
        <li>OGG vs WAV vs MP3 — 为什么游戏引擎优先推荐 OGG？分别从体积、循环支持、浏览器兼容性三个维度解释。</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
