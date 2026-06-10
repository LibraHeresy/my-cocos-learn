<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="3" title="音效合成原理" duration="1 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>1990 年代街机厅里那些爆炸声、激光声、拾取声——没有一个是录制的。它们全是<strong>用数学合成的</strong>。噪声 + 方波 + 包络调制 = 从零创造声音。这一节讲的就是这个"声音配方"。</p></ConceptBlock>

    <ConceptBlock icon="🕹️" title="故事：街机厅里的秘密">
      <p>1991 年，你去街机厅玩《街头霸王 II》。隆发出波动拳——"哈杜肯！"——那个声波呼啸的音效让你热血沸腾。你以为那是录制的，对吧？</p>
      <p>不是的。那个年代的街机基板内存是按<strong>KB</strong>算的——放一个录制好的 WAV 音效就要占几十 KB，整款游戏几十个音效根本放不下。所以音频程序员选择了另一条路：<strong>不存声音，存"做声音的指令"</strong>。</p>
      <p>就像你不会把整个 UI 截图放在代码里——你写 CSS 描述它应该长什么样，浏览器去渲染。音效合成也一样：你描述"用方波、频率 1.5kHz、Attack 1ms、Decay 50ms"，合成器根据你的描述<strong>实时计算出声音</strong>。</p>
      <p>这就是音效合成（Sound Synthesis）的核心理念：<strong>声音不是数据，声音是指令</strong>。你存储的不是波形文件，而是一组参数——就像 Vue 组件的 props 不是渲染结果，而是渲染指令。</p>
    </ConceptBlock>

    <ConceptBlock icon="🎛️" title="原理：ADSR 包络——声音的时间线">
      <p>一个音效从"不存在"到"存在"再到"消失"，它在时间轴上的变化可以用四个参数精确描述。这就是 <strong>ADSR 包络</strong>——音效合成中最核心的概念：</p>

      <table>
        <thead><tr><th>阶段</th><th>全称</th><th>含义</th><th>类比 CSS</th></tr></thead>
        <tbody>
          <tr><td>A — Attack</td><td>起音</td><td>音量从 0 升到峰值的时间</td><td>transition-duration（进入动画）</td></tr>
          <tr><td>D — Decay</td><td>衰减</td><td>从峰值降到持续水平的时间</td><td>ease-out 曲线</td></tr>
          <tr><td>S — Sustain</td><td>保持</td><td>按着不放时保持的音量水平</td><td>animation-fill-mode: forwards</td></tr>
          <tr><td>R — Release</td><td>释放</td><td>松手后音量降到 0 的时间</td><td>transition 离开动画</td></tr>
        </tbody>
      </table>

      <p><strong>ADSR 是声音的"transition + animation"系统。</strong>就像你在 CSS 里用 <code>@keyframes</code> 描述一个元素的动画时间线一样，ADSR 描述一个声音的音量时间线：</p>

      <pre>/* CSS 动画时间线 */
@keyframes shootSound {
  0%   { opacity: 1; }     /* Attack: 瞬间出现 */
  10%  { opacity: 0.3; }   /* Decay: 快速衰减 */
  90%  { opacity: 0.3; }   /* Sustain: 保持 */
  100% { opacity: 0; }     /* Release: 消失 */
}

/* 对应的 ADSR 参数 */
/* Attack=1ms, Decay=50ms, Sustain=0.3, Release=50ms */</pre>

      <p>不同的音效需要不同的 ADSR 曲线：</p>
      <ul>
        <li><strong>射击声：</strong>Attack=1ms（瞬间炸响），Decay=50ms（快速衰减），Sustain=0（不保持），Release=30ms（短尾消散）。总时长不到 100ms——干净利落，像 CSS 的 <code>transition: all 0.05s ease-out</code>。</li>
        <li><strong>爆炸声：</strong>Attack=10ms（轰然炸开），Decay=300ms（悠长衰减），Sustain=0.3（隆隆余韵），Release=500ms（长尾消散）。总时长 800ms——充满分量。</li>
        <li><strong>风声/引擎声：</strong>Attack=300ms（缓缓升起），Decay=0（不衰减），Sustain=1（一直保持），Release=200ms（渐隐）。这种声音是"持续的存在感"，像 CSS 的 <code>animation: pulse 2s infinite</code>。</li>
      </ul>

      <p><strong>波形选择 —— 声音的"颜料"</strong></p>
      <p>ADSR 控制的是"声音的轮廓"，但轮廓里面填充什么颜色？靠波形。四种基本波形在 Phase 2 里你已经在 Audacity 里听过了，这里把它们放到游戏音效的语境中：</p>
      <ul>
        <li><strong>方波（Square）：</strong>NES 时代的声音。哔哔声、电子音、8-bit 风格。游戏主旋律首选。</li>
        <li><strong>锯齿波（Sawtooth）：</strong>最"锋利"的声音。激光、警报、金属碰撞。因为它包含了所有整数倍的谐波——信息量最大。</li>
        <li><strong>三角波（Triangle）：</strong>最"柔和"的声音。引擎低吟、柔和 BGM 和弦、温暖铺垫。</li>
        <li><strong>噪声（Noise）：</strong>不是"音"，是随机信号。爆炸、海浪、风吹树叶、Hi-hat 打击。</li>
      </ul>

      <p><strong>合成 vs 录音 —— 为什么选择合成？</strong></p>
      <p>这有点像在 Web 开发中选择 SVG vs 位图。录音是位图——预设的分辨率，放大就糊，改颜色要重新拍。合成是 SVG——参数化的，在任何采样率下都"清晰"，改一个参数就能生成变体。</p>
      <table>
        <thead><tr><th>维度</th><th>合成音效</th><th>录制音效</th></tr></thead>
        <tbody>
          <tr><td>体积</td><td>KB 级（存参数）</td><td>MB 级（存波形）</td></tr>
          <tr><td>可控性</td><td>极高（运行时改参数）</td><td>低（改了就重新录）</td></tr>
          <tr><td>风格统一</td><td>天然统一（同一套参数世界观）</td><td>需要后期处理</td></tr>
          <tr><td>真实感</td><td>有限（电子味）</td><td>高（真实物理声）</td></tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：用 BFXR 感受参数">
      <p>打开 <a href="https://www.bfxr.net" target="_blank">bfxr.net</a>，它是一个在线的音效合成器，界面就是一排参数滑块。我们现在不做"完整音效"，只做参数实验：</p>
      <ol>
        <li><strong>波形实验：</strong>找到 Waveform 下拉框。分别选 Square、Sawtooth、Sine、Noise，每次选完点 Play。你听到的是四种完全不同的"基础音色"。这就是合成器的"颜料盒"。</li>
        <li><strong>Attack Time 实验：</strong>把 Attack Time 拖到 0，点 Play——声音瞬间炸响。拖到 0.5 秒，再点 Play——声音"爬"上来。体会：0 = 枪声，0.5 = 风声。Attack Time 控制的是声音的"性格"——果断还是犹豫。</li>
        <li><strong>Sustain Time 实验：</strong>Sustain Time 决定"按着不放时声音持续多久"。拖到 0.1——短促。拖到 1.0——像激光一直在嗡嗡响。注意：Ping Pong 模式下 Sustain 影响循环音效的节奏。</li>
        <li><strong>频率滑动实验：</strong>找到 Frequency Slide 参数。拖到正值（比如 0.5）——声音从低到高（"biu↑"拾取感）。拖到负值（-0.5）——声音从高到低（"womp↓"失落感）。这就是频率调制——同样的 ADSR，不同的频率变化方向，完全不同的语义。</li>
      </ol>
      <p>如果这 4 个实验你每个都点过 Play，你已经理解了音效合成 80% 的变量。剩下的 20% 是这些参数的排列组合——Phase 4 和 5 你来做。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>《无人深空》与程序化音频的极限：</strong>2016 年 Hello Games 的《无人深空》用程序化生成技术创造了 18 万亿颗星球——每颗星球的植物、动物、地形都是算法生成的。但你可能不知道的是——每颗星球的环境音也是<strong>程序化生成的</strong>。音频总监 Paul Weir 设计了一套规则系统：根据星球的大气密度、植被类型、是否有水、昼夜时间，实时合成独特的环境音。没有一个声音是预录的——全部由参数驱动。这就是音效合成的终极形态：不是"做一个声音"，是"定义声音生成的规则"。</li>
        <li><strong>《地狱之刃》与精神模拟音频：</strong>Ninja Theory 的《地狱之刃：塞娜的献祭》主角是一名精神分裂症患者。游戏的音频设计最独特之处在于——玩家耳边会不断听到"声音"，有时是鼓励，有时是嘲讽。这些声音不是预录的对话，而是通过<strong>程序化声像处理</strong>实时生成的，模拟了精神分裂患者脑中的幻听体验。程序化音频在这里不是"省内存的技巧"，而是<strong>叙事工具</strong>。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>ADSR 包络中，Attack、Decay、Sustain、Release 分别控制什么？用一个具体的游戏音效例子（比如射击声）描述它的 ADSR 曲线。</li>
        <li>方波、锯齿波、三角波、噪声的音色差异是什么？在游戏音效中各适合什么场景？</li>
        <li>程序化音频和预录音频各有什么优劣势？如果你做一个有 100 种武器音效的游戏，你会选哪种方案？为什么？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
