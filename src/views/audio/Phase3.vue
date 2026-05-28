<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="3" title="背景音乐基础" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解<strong>游戏背景音乐</strong>的两大模式：线性播放 vs <strong>无缝循环</strong></li>
        <li>使用 <strong>Bosca Ceoil</strong> 从零创作一段 <strong>chiptune</strong> 风格旋律</li>
        <li>构建 "<strong>Intro</strong> → <strong>Loop</strong> → Outro" 的音乐结构</li>
        <li>导出<strong>无缝循环</strong>的 <strong>OGG</strong> 文件，保证循环时没有"咔嗒"声</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🎵" title="游戏 BGM 基础概念">
      <p>
        游戏背景音乐和普通音乐的核心区别：<strong>它必须能无限循环，且不能抢游戏音效的位置</strong>。
      </p>

      <h3>BGM 的两大模式</h3>
      <table>
        <thead>
          <tr>
            <th>模式</th>
            <th>说明</th>
            <th>适用场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Intro + Loop</strong></td>
            <td>一个前奏（8-16 小节）→ 进入循环主体（无限重复）</td>
            <td>飞机大战主菜单 → 战斗场景（前奏只播一次，战斗段循环）</td>
          </tr>
          <tr>
            <td><strong>纯循环</strong></td>
            <td>没有前奏，从头到尾一个可无限衔接的段落</td>
            <td>Boss 战音乐——紧张感不需要铺垫，直接进</td>
          </tr>
        </tbody>
      </table>

      <h3>"频率避让"原则</h3>
      <p>BGM 不能和音效抢频率空间。记住这个优先级：</p>
      <pre><code>频率分配（从高到低）：
┌─────────────────────┐
│ 5 kHz+   UI 提示音   │  ← 清脆短促，不常触发
│ 2-4 kHz  射击/子弹   │  ← 高频区留给最频繁的音效
│ 500-2k   受击/拾取    │  ← 中高频也留给功能性音效
│ 200-800  BGM 旋律    │  ← BGM 主旋律在此区域
│ 80-300   BGM 低音    │  ← BGM 贝斯/节奏
│ &lt;80     爆炸         │  ← 低音区留给效果音
└─────────────────────┘</code></pre>

      <div class="warn-box">
        <strong>最常犯的错：</strong>BGM 旋律太亮太响，和射击音效在 2-4kHz
        区域"打架"。结果就是玩家听见的要么是碎掉的音乐，要么是被音乐盖住的射击声。BGM
        在混音时应该比音效低 6-12dB。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎹" title="工具：Bosca Ceoil — 零门槛作曲">
      <p>
        <strong>Bosca Ceoil</strong
        >（<strong>boscaceoil.net</strong>）是一款极简的免费音乐编辑器，基于类似
        Tracker（追踪器）的网格界面。它专门为<strong>非音乐专业的游戏开发者</strong>设计：
      </p>

      <h3>界面概念</h3>
      <table>
        <thead>
          <tr>
            <th>元素</th>
            <th>说明</th>
            <th>类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>网格（Grid）</strong></td>
            <td>每个格子是一个音符位置，每行一个音高</td>
            <td>垂直的钢琴卷帘</td>
          </tr>
          <tr>
            <td><strong>音轨（Track）</strong></td>
            <td>一个独立的声音线（如旋律、贝斯、鼓）</td>
            <td>乐队的单个乐器</td>
          </tr>
          <tr>
            <td><strong>Pattern（模式）</strong></td>
            <td>一段可复用的音符序列（通常 4-16 小节）</td>
            <td>一段乐句</td>
          </tr>
          <tr>
            <td><strong>Arrangement（编排）</strong></td>
            <td>Pattern 的排列顺序——整首歌的结构</td>
            <td>歌曲的"A-B-A-C-B"结构</td>
          </tr>
          <tr>
            <td><strong>乐器（Instrument）</strong></td>
            <td>内置 MIDI 音色（方波、三角波、锯齿波等）</td>
            <td>电子合成器音色</td>
          </tr>
        </tbody>
      </table>

      <h3>快速上手</h3>
      <ol>
        <li>创建 3-4 条音轨：旋律（Melody）、和声（Harmony）、贝斯（Bass）、鼓（Drums）</li>
        <li>每条音轨选一个乐器（方波做主旋律，三角波做贝斯，噪声做鼓）</li>
        <li>在网格中点格子——点击即放置音符，右键删除</li>
        <li>按空格播放试听</li>
        <li>排好几组 Pattern 后，在编排区域拖拽排列</li>
      </ol>

      <div class="tip-box">
        <strong>非音乐人也能做：</strong>Bosca Ceoil 只用白键音阶（C 大调/A
        小调），你<strong>不可能点出错音</strong>——随便点一串音都是和谐的。这是它最大的设计智慧。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔁" title="无缝循环的技术要点">
      <p>一段 BGM 的价值在于<strong>循环时不露破绽</strong>：</p>

      <h3>作曲层面的循环</h3>
      <ul>
        <li>最后一小节的最后一个音符，要和第一小节的第一个音符"接得住"</li>
        <li>鼓轨道上，最后一拍的镲声（过渡感）要轻——让回到第一拍时的重鼓听起来是自然的"重启"</li>
        <li>旋律上，结束音最好落在调式的主音（C 调的 C 音），有"回到家"的感觉</li>
      </ul>

      <h3>导出层面的循环</h3>
      <ul>
        <li>导出时确保音频终点正好在一个完整小节的末尾——多一帧音频就会造成停顿</li>
        <li>OGG 格式在循环时比 WAV/MP3 更友好——OGG 的编码器会处理帧边界</li>
        <li>在 Audacity 中开循环模式（Shift+空格），反复听最后一个周期到第一个周期的过渡</li>
      </ul>

      <pre><code>Bad Loop（不流畅）：
...♩♩♩♩│♩♩♩♩│♪♪--（尾音衰减）→ [停顿] → ♩♩♩♩（重启）
     ↑最后不完整的小节导致间隙

Good Loop（无缝）：
...♩♩♩♩│♩♪♩♪│♩♩♩♩│♩♪♩♪│...（回到第一小节相同节奏点）
     ↑完整的节奏周期，尾旋律上刚好停在主音</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🎮" title="飞机大战 BGM 设计">
      <p>推荐为飞机大战准备三段 BGM，用不同音乐状态匹配游戏状态：</p>

      <table>
        <thead>
          <tr>
            <th>BGM</th>
            <th>场景</th>
            <th>BPM</th>
            <th>音乐感觉</th>
            <th>乐器搭配</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>bgm_menu.ogg</code></td>
            <td>主菜单/标题画面</td>
            <td>100-120</td>
            <td>轻快、期待感、循环播放</td>
            <td>方波旋律 + 三角波贝斯 + 轻鼓点</td>
          </tr>
          <tr>
            <td><code>bgm_battle.ogg</code></td>
            <td>普通战斗场景</td>
            <td>130-150</td>
            <td>紧凑但不压迫，持续向前的推进感</td>
            <td>双旋律 + 贝斯 + 鼓 + 琶音伴奏</td>
          </tr>
          <tr>
            <td><code>bgm_boss.ogg</code></td>
            <td>Boss 战</td>
            <td>150-170</td>
            <td>紧张、压迫，低音区占主导</td>
            <td>锯齿波主旋律 + 重型贝斯 + 双倍鼓点</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>渐进 BGM：</strong>如果想让战斗音乐更有层次，可以做成"渐进式"——主菜单只播旋律+鼓 →
        进入战斗再加入贝斯 → Boss 战全乐器齐上。这需要分层导出（Phase 4 讲如何在 Cocos 中切换）。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔨" title="动手练习：创作战斗 BGM">
      <ol>
        <li>
          打开 Bosca Ceoil，创建 4 条音轨：旋律（方波）、和声（方波）、贝斯（三角波）、鼓（噪声）
        </li>
        <li>先做鼓轨道——4/4 拍，每拍一个底鼓（kick），每 2、4 拍加军鼓（snare）</li>
        <li>再做贝斯轨道——跟着鼓的节奏走，多用根音和五度音</li>
        <li>旋律轨道——写 8 小节的旋律，多重复相同的节奏型但有音高变化</li>
        <li>编排：前奏 8 小节（仅旋律+鼓）→ 16 小节全乐器循环段</li>
        <li>导出 WAV → Audacity 打开 → 检查首尾衔接 → 导出 OGG</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>一段 30-60 秒可无缝循环的战斗 BGM（OGG
        格式）。在播放器中开启单曲循环——至少播放 5 遍，不出现任何"咔嗒"或"中断"的感觉。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>游戏 BGM 和普通音乐的核心区别是什么？</li>
        <li>"Intro + Loop"模式和"纯循环"模式各自适合什么场景？</li>
        <li>BGM 和音效在频率分配上应该怎么安排？BGM 应该比音效低多少 dB？</li>
        <li>Bosca Ceoil 中"不可能点出错音"的原理是什么？</li>
        <li>无缝循环在作曲层面和导出层面分别要注意什么？</li>
        <li>三段 BGM（菜单、战斗、Boss）的 BPM 分别建议多少？</li>
      </ul>
    </ConceptBlock>
  </PhaseLayout>
</template>
