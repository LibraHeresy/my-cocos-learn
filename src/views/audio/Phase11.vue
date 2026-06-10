<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="11" title="自适应音频系统" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>BGM 从头播到尾是基础。进阶是：让音乐<strong>随游戏状态实时变化</strong>——普通关轻松，敌人增多紧张，Boss 出现恢弘，Boss 死亡胜利。音乐不再是"背景"，而是游戏状态的一部分。这就是自适应音频（Adaptive Audio）。</p></ConceptBlock>

    <ConceptBlock icon="🏴‍☠️" title="故事：iMUSE —— 1991 年的自适应音频">
      <p>1991 年，LucasArts 发布了《猴岛小英雄 2：勒恰克的复仇》。这款游戏的音乐有一个玩家从未见过的特点：<strong>当 Guybrush 从码头走进酒馆时，音乐不切不跳——它平滑地过渡了。</strong>玩家从一个区域走到另一个区域，音乐无缝跟随。这在 1991 年是革命性的。</p>
      <p>实现这套系统的是一个叫 <strong>iMUSE</strong>（Interactive Music Streaming Engine）的内部引擎，由 Michael Land 和 Peter McConnell 开发。iMUSE 的核心思想超前了整整 30 年：</p>
      <ul>
        <li>音乐不是"一首歌"，而是<strong>一组可组合的音乐片段</strong>。</li>
        <li>引擎根据游戏状态（玩家位置、当前事件）动态决定"现在应该播放哪些片段、以什么方式过渡"。</li>
        <li>过渡不是硬切，而是<strong>在下一个合适的音乐节拍点进行</strong>——比如等当前的鼓 fill 完成后才切。</li>
      </ul>
      <p>你没有 LucasArts 的引擎团队。但在 Cocos 中，用 <strong>cc.tween + 事件监听 + 多层 AudioSource</strong>，你可以实现 iMUSE 的核心理念。它不是"高端技术"——它是<strong>设计思维</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="🏗️" title="原理：两种自适应架构">
      <p>自适应音频有两种主流实现方式。你的飞机大战可以分别使用或混合使用：</p>

      <p><strong>方式一：垂直分层（Vertical Layering）—— 音频的 v-show</strong></p>
      <p>把 BGM 拆成 <strong>3-4 个独立音轨</strong>，每一层是一个独立的 AudioSource，同时播放：</p>
      <table>
        <thead><tr><th>层</th><th>内容</th><th>低强度</th><th>中强度</th><th>高强度（Boss）</th></tr></thead>
        <tbody>
          <tr><td>Layer 1</td><td>基础节奏（鼓 + Bass）</td><td>100%</td><td>100%</td><td>100%</td></tr>
          <tr><td>Layer 2</td><td>主旋律</td><td>0%</td><td>100%</td><td>100%</td></tr>
          <tr><td>Layer 3</td><td>强化层（额外军鼓 + 高音旋律）</td><td>0%</td><td>0%</td><td>100%</td></tr>
        </tbody>
      </table>
      <p>低强度 = 只有 Layer 1（轻量鼓+Bass，适合关卡刚开始）。中强度 = Layer 1+2（旋律进入，敌人增多）。高强度 = 全部 3 层（Boss 战，音乐全开）。</p>
      <p>这个方案的优雅之处在于：<strong>所有层一直在同步播放</strong>，只是音量在变化。过渡是真正无缝的——因为节奏和和弦完全没有中断。这就是音频版的 <code>v-show</code>——元素一直在 DOM 里，只是 opacity 改变。</p>
      <p>但你需要在 Bosca Ceoil 中把 3 层分别导出为 3 个 WAV 文件，并确保它们<strong>完全同步</strong>（同样的 BPM、同样的小节数、同样的开始点）。</p>

      <p><strong>方式二：水平切换（Horizontal Switching）—— 音频的 v-if</strong></p>
      <p>准备多个完整的 BGM 片段，根据游戏状态<strong>切换</strong>：Normal → Boss → Victory → Normal。切换时做淡入淡出（Phase 10 的 switchBGM）。</p>
      <table>
        <thead><tr><th>游戏状态</th><th>BGM</th><th>特征</th></tr></thead>
        <tbody>
          <tr><td>普通波次</td><td>bgm_normal</td><td>120BPM，轻快循环</td></tr>
          <tr><td>第 5 波（Boss 预警）</td><td>bgm_tension</td><td>130BPM，加入警报音效</td></tr>
          <tr><td>Boss 登场</td><td>bgm_boss</td><td>150BPM，强烈打击乐</td></tr>
          <tr><td>Boss 击杀</td><td>bgm_victory</td><td>短 Outro（8 秒），不循环</td></tr>
        </tbody>
      </table>
      <p>水平切换 = 音频版的 <code>v-if</code>——组件完全替换。优点是每个 BGM 独立创作更自由，缺点是切换时需要过渡处理。</p>

      <p><strong>混合方案（推荐）：</strong>同一首 BGM 在不同波次用垂直分层（Layer 递增），Boss 出现时用水平切换（切换到 Boss BGM），Boss 击败后切回 Normal。垂直 + 水平 = 完整的自适应音频系统。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：实现垂直分层自适应音乐">
      <p>这是整个音频课程中最有挑战性的练习。如果你完成了它，你就理解了 3A 游戏音频架构的核心思想。</p>
      <ol>
        <li><strong>准备 3 层音频：</strong>在 Bosca Ceoil 中打开你的 BGM 项目。分成 3 次导出，每次静音不同的轨道：
          <ul>
            <li>Layer 1（基础）：只导出 Bass + 鼓轨 → <code>bgm_layer1.wav</code></li>
            <li>Layer 2（旋律）：只导出主旋律轨 → <code>bgm_layer2.wav</code></li>
            <li>Layer 3（强化）：导出加强鼓 + 高音旋律 → <code>bgm_layer3.wav</code></li>
          </ul>
          在 Audacity 中打开检查：这 3 个 WAV 的时长必须完全一致（比如都是 30 秒），且起始点必须对齐。
        </li>
        <li><strong>在 AudioManager 中同时加载 3 层：</strong>创建 3 个 AudioSource（或使用音频池），分别加载 layer1/layer2/layer3。初始时 layer2 和 layer3 的 volume = 0，layer1 = bgmVolume（0.6）。</li>
        <li><strong>监听游戏状态变化：</strong>
          <ul>
            <li>监听波次变化事件（如 <code>'wave-change'</code> 事件）：波次 1-2 → 只 Layer 1。波次 3-4 → Layer 1+2（用 tween 把 layer2 音量从 0 升到 0.6）。</li>
            <li>监听 Boss 出现事件：Layer 1+2+3 全开（tween layer3 从 0 到 0.6）。</li>
            <li>Boss 击杀：layer3 淡出到 0（tween 1 秒），回到 Layer 1+2。</li>
          </ul>
        </li>
        <li><strong>关键技巧——确保同步：</strong>3 个 AudioSource 必须<strong>完全同时</strong>调用 play()。如果有先后，听感上会有"回声"效果。做法：把 3 个 AudioSource 放在同一个数组中，在同一个 tick 内全部 play()。</li>
        <li><strong>测试全流程：</strong>菜单（无 BGM 或有单独的 menu BGM）→ 游戏开始（Layer 1 only）→ 第 3 波（Layer 1+2）→ Boss 登场（全部 3 层）→ Boss 击杀（Layer 3 淡出 → 胜利 Outro）。音乐随游戏状态流畅变化，没有一个硬切点。</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>FMOD 与 Wwise —— 3A 游戏音频的工业标准：</strong>FMOD 和 Wwise 是两款专业的游戏音频中间件（middleware）。它们提供可视化的自适应音频设计工具——你可以拖拽音频片段、设置过渡条件、定义"音乐状态机"，然后导出为 SoundBank 文件。游戏引擎通过 API 调用这些 SoundBank，中间件负责所有复杂的播放逻辑。<strong>但原理是一样的</strong>：垂直分层 + 水平切换 + 状态驱动。你手动实现的 AudioManager 就是中间件的微缩版。理解原理之后，学 FMOD/Wwise 只是学它们的具体 UI。</li>
        <li><strong>自适应音频不是"换 BGM"——是每个声音元素都在响应游戏状态：</strong>最成熟的实现中，不只是 BGM 在自适应——脚步声（草地 vs 石板 vs 金属）、环境音（室内混响 vs 室外）、甚至 UI 音效（正常 vs 低血量时的紧张版本）都可以根据游戏状态动态切换。你的 AudioManager 架构应该为这种扩展留出空间——比如 playSFX 可以接受一个可选的 context 参数，在内部根据 gameState 选择不同版本的 clip。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>垂直分层（Layering）和水平切换（Switching）两种自适应音频架构的核心区别是什么？各自适合什么游戏场景？</li>
        <li>iMUSE 系统 1991 年就实现了无缝音乐过渡——它是怎么做到的？这个 30 年前的设计对你当前的音频架构有什么启发？</li>
        <li>你的 AudioManager 支持垂直分层了吗？如果让你加入"低血量时 BGM 加入心跳鼓声"这个功能，你会怎么实现？（提示：增加 Layer 4 + 监听 HP 事件）</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
