<script setup lang="ts">
import AudioPhaseLayout from '@/components/AudioPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <AudioPhaseLayout :phase="1" title="音频基础与免费工具" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解游戏音频的基础概念：采样率、位深度、单声道/立体声</li>
        <li>区分 WAV、MP3、OGG 格式，知道各自适合什么场景</li>
        <li>使用 BFXR 合成器从零生成像素风音效</li>
        <li>使用 Audacity 对音频做基础编辑（裁剪、标准化、导出）</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔊" title="游戏音频基本概念">
      <p>在动手制作之前，先理解几个会在每个工具里遇到的核心概念：</p>

      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>说明</th>
            <th>推荐值（飞机大战）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>采样率 (Sample Rate)</strong></td>
            <td>每秒采集的声音样本数。越高越清晰，但文件越大</td>
            <td><strong>44100 Hz</strong>（CD 品质，够用）</td>
          </tr>
          <tr>
            <td><strong>位深度 (Bit Depth)</strong></td>
            <td>每个样本的精度。16-bit 是游戏音效标准</td>
            <td><strong>16-bit</strong></td>
          </tr>
          <tr>
            <td><strong>单声道 vs 立体声</strong></td>
            <td>音效用单声道（位置定位），音乐用立体声</td>
            <td>SFX → <strong>Mono</strong>，BGM → <strong>Stereo</strong></td>
          </tr>
          <tr>
            <td><strong>WAV</strong></td>
            <td>无损、文件大、即用即播，适合短音效</td>
            <td>射击/爆炸/拾取等短 SFX</td>
          </tr>
          <tr>
            <td><strong>MP3</strong></td>
            <td>有损压缩、文件小，但循环可能有间隙</td>
            <td>不推荐用于游戏（循环问题）</td>
          </tr>
          <tr>
            <td><strong>OGG</strong></td>
            <td>有损但比 MP3 好，支持无缝循环，开源</td>
            <td><strong>首选</strong>——BGM 和长音效</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>像素游戏的特殊性：</strong>8-bit 风格音效不需要高保真——22kHz、8-bit
        的"低品质"反而更有味道。下面介绍的合成器工具正是生来为此的。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="工具一：BFXR — 音效合成器">
      <p>
        <strong>BFXR</strong
        >（<strong>bfxr.net</strong>）是像素游戏开发者的标配音效工具。它的界面看起来像一个飞船控制面板，但每个滑块都有实际意义：
      </p>

      <h3>界面速览</h3>
      <table>
        <thead>
          <tr>
            <th>区域</th>
            <th>作用</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>左侧预设按钮</strong></td>
            <td>
              Pickup/Coin、Laser/Shoot、Explosion、Powerup、Hit/Hurt、Jump、Blip/Select——一键生成对应类型的音效种子
            </td>
          </tr>
          <tr>
            <td><strong>中间合成器面板</strong></td>
            <td>波形选择（方波/正弦/三角/噪声）、滑音、颤音、包络等参数</td>
          </tr>
          <tr>
            <td><strong>右侧混合器</strong></td>
            <td>两个通道混合、音量、频率范围</td>
          </tr>
          <tr>
            <td><strong>底部操作栏</strong></td>
            <td>播放、随机变异（Mutate）、保存 WAV</td>
          </tr>
        </tbody>
      </table>

      <h3>快速上手流程</h3>
      <ol>
        <li>点击右侧预设按钮（如 Laser/Shoot）→ 生成一个基础激光音效</li>
        <li>点击 <strong>Mutate</strong>（变异）→ 在基础音效上随机变种，直到你觉得好听</li>
        <li>如果不够满意，手动拖拽中间的滑块微调</li>
        <li>点击 <strong>Save WAV</strong> → 保存为 <code>laser_shoot.wav</code></li>
      </ol>

      <div class="tip-box">
        <strong>Mutate 是 BFXR 的核心用法：</strong>不要从零开始调参数——点预设 → 疯狂 Mutate
        直到听到喜欢的 → 微调 → 保存。这个工作流是最高效的。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎛️" title="工具二：Chiptone — 浏览器版合成器">
      <p>
        <strong>Chiptone</strong>（<strong>sfbgames.itch.io/chiptone</strong>）是一个免费的浏览器端
        chiptune 音效合成器。如果 BFXR 下载不了或者用得不顺手，它是最佳替代：
      </p>
      <ul>
        <li>纯 Web 界面，无需安装</li>
        <li>波形可视化更直观——能看到每种波形的形状</li>
        <li>支持导出 WAV</li>
        <li>预设偏向 Game Boy / NES 风格</li>
      </ul>

      <div class="tip-box">
        <strong>工具选择：</strong>BFXR 适合科幻/射击类音效（尖锐、电子感强），Chiptone 适合更暖的
        8-bit 平台游戏音效。两者都试试，哪个顺手用哪个。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✂️" title="工具三：Audacity — 音频编辑器">
      <p>
        <strong>Audacity</strong>（<strong>audacityteam.org</strong>）是免费开源的音频编辑器。BFXR
        生成的是"原材料"，Audacity 用来做最后的<strong>裁剪、标准化和格式转换</strong>：
      </p>

      <h3>必备操作（5 分钟学会）</h3>
      <ol>
        <li><strong>裁剪：</strong>拖选多余的静音部分 → 按 Delete</li>
        <li><strong>标准化：</strong>菜单 Effect → Normalize → 设为 -0.5 dB（防止削波）</li>
        <li>
          <strong>淡入淡出：</strong>选中开头/结尾 50ms → Effect → Fade In / Fade
          Out（避免播放时的"啪"声）
        </li>
        <li><strong>导出：</strong>File → Export → 选择 WAV（SFX）或 OGG（BGM）</li>
        <li><strong>转换格式：</strong>File → Export → 选择 OGG Vorbis，Quality 调到 6-7</li>
      </ol>

      <div class="warn-box">
        <strong>重要：</strong>BFXR 生成的 WAV 开头常有几毫秒空白。导入 Cocos 之前，一定在 Audacity
        中<strong>放大波形开头</strong>（Ctrl+1），剪掉空白。这个小动作能消除所有音效的"延迟感"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔨" title="动手练习：生成你的第一个音效">
      <ol>
        <li>在 BFXR 中，点击 <strong>Laser/Shoot</strong> 预设</li>
        <li>点击 <strong>Mutate</strong> 5-10 次，挑选一个你喜欢的</li>
        <li>保存为 <code>laser_player.wav</code></li>
        <li>在 BFXR 中再生成一个 <strong>Explosion</strong> 预设音效</li>
        <li>保存为 <code>explosion.wav</code></li>
        <li>在 Audacity 中打开两个文件，裁剪掉开头的空白，标准化到 -0.5dB</li>
        <li>分别导出为 WAV（16-bit PCM）</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>你手上有两个自己生成的 WAV 文件——一个射击音效（清脆简短，0.1-0.3
        秒）和一个爆炸音效（低沉有冲击力，0.5-1 秒）。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>采样率和位深度分别是什么？为什么音效用 Mono、BGM 用 Stereo？</li>
        <li>为什么游戏音效不用 MP3？OGG 相比 WAV 有什么优势？</li>
        <li>BFXR 的 Mutate 按钮是做什么的？你从哪类预设开始做射击音效？</li>
        <li>BFXR 生成的 WAV 导入 Cocos 前，为什么要在 Audacity 中裁剪开头空白？</li>
        <li>Audacity 的 Normalize 功能有什么用？一般设多少 dB？</li>
        <li>淡入淡出为什么重要？一般设置多少毫秒？</li>
      </ul>
    </ConceptBlock>
  </AudioPhaseLayout>
</template>
