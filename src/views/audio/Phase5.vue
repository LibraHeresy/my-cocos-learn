<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="5" title="BFXR 音效实战（下）" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>Phase 4 做出了射击、爆炸、拾取 3 个音效。这一节补齐剩下的 3 个——受击、引擎、Boss 警报——然后做一次完整的音效混音。当 6 个音效同时存在于游戏里时，它们不能互相"打架"。</p></ConceptBlock>

    <ConceptBlock icon="🎯" title="故事：当两个声音同时响起">
      <p>你玩过那种"音效叠成一团"的游戏吗？打死一个敌人——"biu"（射击声）和"轰"（爆炸声）同时响起，但"biu"完全被"轰"淹没了。你脑中的反馈回路断了："我开枪了，但怎么没听到枪声？"</p>
      <p>这不是你耳朵的问题。这是<strong>频率冲突</strong>——两个声音的频谱重叠时，响的那个会"吃掉"弱的那个。在物理学上这叫<strong>掩蔽效应</strong>（Phase 2 提过），在音频工程中这叫<strong>频率避让（Frequency Slotting）</strong>。</p>
      <p>你的 6 个飞机大战音效必须各自占据不同的频率区间，就像 CSS Grid 中每个 cell 不能重叠。如果射击声和拾取声都在 2kHz 附近，它们一起播放时就会糊成一片。在写代码的时候你不会让两个元素 display: absolute 在同一位置——做音效混音也是一样的道理。</p>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="原理：频率避让——声谱上的 Grid 布局">
      <p>把所有音效想象成声谱（20Hz ~ 20kHz）上的一个个"块"。好的混音就是让每个块各就各位：</p>

      <table>
        <thead><tr><th>音效</th><th>主频率区间</th><th>感知属性</th><th>避让策略</th></tr></thead>
        <tbody>
          <tr><td>引擎声</td><td>50-150Hz</td><td>嗡嗡低吟，持续</td><td>极低频，不和其他音效冲突</td></tr>
          <tr><td>爆炸声</td><td>100-300Hz + 噪声</td><td>轰隆沉闷，冲击</td><td>低频主体 + 高频噪声碎片</td></tr>
          <tr><td>受击声</td><td>300-800Hz</td><td>闷响，肉体/金属碰撞</td><td>中频，填补引擎和射击之间的空白</td></tr>
          <tr><td>射击声</td><td>1-2kHz</td><td>清脆，瞬间</td><td>中高频，和爆炸的高频噪声共存</td></tr>
          <tr><td>拾取声</td><td>2-4kHz</td><td>叮咚，清脆，愉悦</td><td>高频，利用人耳对 2-4kHz 最敏感</td></tr>
          <tr><td>Boss 警报</td><td>1-4kHz 扫频</td><td>不安，压迫，警告</td><td>扫频穿越多个频段，需要时降低其他音效音量</td></tr>
        </tbody>
      </table>

      <p>这个频段分配表就是你的<strong>音频 Grid 模板</strong>。每个音效在一个主频段活动，偶尔跨越边界——但主频段不能重叠。当你做混音（调整相对音量）时，把最大音量给"最重要且最不频繁"的音效（Boss 警报、爆炸），中等音量给"频繁但需要存在感"的音效（射击），低音量给"持续但不抢戏"的音效（引擎）。</p>

      <p>如果你做过前端响应式布局，这个思路应该很熟悉：</p>
      <ul>
        <li>引擎声 = <code>grid-column: 1 / 2;</code>（低频区独占）</li>
        <li>爆炸声 = <code>grid-column: 1 / 3;</code>（低频 + 中低频，权重最大）</li>
        <li>射击声 = <code>grid-column: 3 / 4;</code>（中高频，快速闪现）</li>
        <li>拾取声 = <code>grid-column: 4 / 5;</code>（高频，短促清脆）</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：制作后 3 个音效 + 混音">
      <p>打开 BFXR，在 Phase 4 的 3 个音效基础上，继续制作：</p>

      <p><strong>音效 4：受击声（Hit/Hurt）</strong></p>
      <ol>
        <li>点击 <strong>Hit/Hurt</strong> 预设。</li>
        <li>Waveform → <strong>Square + Noise</strong> 混合（同时有"啪"的冲击和"沙"的破碎感）。</li>
        <li>Attack → <strong>0</strong>（被打是瞬间事件，反馈必须即时）。</li>
        <li>频段 → <strong>300-600Hz</strong>（中频沉闷，有"吃痛"感）。Frequency Slide → <strong>-0.3</strong>（向下沉——"咚"而不是"叮"）。</li>
        <li>整体时长 → <strong>100-200ms</strong>（短促，不拖沓）。</li>
        <li>保存为 <code>hit.wav</code>。</li>
      </ol>

      <p><strong>音效 5：引擎持续声（Engine Loop）</strong></p>
      <ol>
        <li>引擎声是<strong>循环播放</strong>的，所以需要特殊处理。在 BFXR 中，切换模式为 <strong>Loop</strong>。</li>
        <li>Waveform → <strong>Triangle</strong>（三角波 = 柔和嗡嗡声，不生硬）。</li>
        <li>Attack → <strong>0.3s</strong>（引擎渐起，不是突然轰鸣）。Release → <strong>0.2s</strong>（关机时慢慢消失）。</li>
        <li>Frequency → <strong>80-120Hz</strong>（极低频，身体能感觉到振动）。</li>
        <li>Sustain Time → <strong>1.0</strong>（一直响）。加入少量的 Vibrato（频率微颤，模拟引擎转速波动，让它听起来像"活的"）。</li>
        <li>保存为 <code>engine.wav</code>。</li>
      </ol>

      <p><strong>音效 6：Boss 警报（Alarm）</strong></p>
      <ol>
        <li>点击 <strong>Laser/Shoot</strong> 预设 → 改 Waveform 为 <strong>Sawtooth</strong>（锯齿波 = 锋利有攻击性）。</li>
        <li>最关键参数：<strong>Frequency Slide</strong> → 大范围正负值（比如 -0.8 到 +0.8），制造"扫频"效果——声音从左到右来回扫描。这就是警报的"不安感"来源。</li>
        <li>加入 <strong>Repeat Speed</strong>（循环速度）→ 调整到 0.1s 左右，让扫频快速重复——快速重复 = 紧迫感。</li>
        <li>整体时长 → <strong>200-400ms</strong>一个周期。Boss 战中这个音效会循环播放。</li>
        <li>保存为 <code>boss_alarm.wav</code>。</li>
      </ol>

      <p><strong>混音：调整 6 个音效的相对音量</strong></p>
      <p>现在用 BFXR 的 Mixer 面板（或在 Audacity 中逐个打开），设置每个音效的相对音量：</p>
      <table>
        <thead><tr><th>音效</th><th>相对音量</th><th>dB 值</th><th>理由</th></tr></thead>
        <tbody>
          <tr><td>引擎声</td><td>40%</td><td>-8dB</td><td>持续背景音，不能抢戏</td></tr>
          <tr><td>射击声</td><td>70%</td><td>-3dB</td><td>高频频繁播放，降一点防疲劳</td></tr>
          <tr><td>受击声</td><td>80%</td><td>-2dB</td><td>负反馈需要强感知</td></tr>
          <tr><td>拾取声</td><td>80%</td><td>-2dB</td><td>正反馈需要突出</td></tr>
          <tr><td>爆炸声</td><td>100%</td><td>0dB</td><td>最有冲击力的瞬间，满格</td></tr>
          <tr><td>Boss 警报</td><td>90%</td><td>-1dB</td><td>需要突显但不刺耳</td></tr>
        </tbody>
      </table>
      <p>导出全部 6 个 WAV 文件。你刚刚完成了游戏音效设计的全套流程——从参数设计到混音平衡。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>游戏混音 vs 音乐混音——动态 vs 静态：</strong>音乐制作中的混音是"一次性"的——调好之后就固定了，输出一个立体声文件。游戏混音是<strong>动态的</strong>——音量比例随着游戏状态实时变化。暂停时 BGM 降低但不能完全消失（维持沉浸感），Boss 战时警报声升高射击声不变，结算时所有 SFX 淡出让胜利 BGM 突显。这种"实时调整音量比例"的设计就是<strong>自适应音频</strong>的基础（Phase 11 会完整展开）。一个类比：音乐混音就像做一张 PNG 图片——做完就固定了。游戏混音像写一个响应式 CSS——根据视口/设备/状态，元素的尺寸和位置动态调整。</li>
        <li><strong>频率分配是音频设计的"信息架构"：</strong>就像前端的信息架构决定了页面上各区域的内容层级一样，音频的频率分配决定了玩家"听到什么、先听什么、后听什么"。这不是玄学——这是可以用频谱分析仪精确测量的工程问题。好的音频设计师打开游戏音频时，能看到频谱上的每一个"山峰"对应一个音效，山峰之间有空隙——就像设计系统里的 spacing scale。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>频率避让的核心思想是什么？为什么不同音效需要各自占据不同的主频率区间？用一个你玩过的游戏举例说明。</li>
        <li>引擎声用极低频（80Hz）、拾取声用高频（2-4kHz）、射击声用中高频（1-2kHz）——这个频率分配的逻辑是什么？如果引擎声和射击声都放在同一个频率区间会有什么问题？</li>
        <li>游戏混音和音乐混音的根本区别是什么？为什么游戏混音必须是"动态的"？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
