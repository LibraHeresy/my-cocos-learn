<script setup lang="ts">
import AudioPhaseLayout from '@/components/AudioPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <AudioPhaseLayout :phase="6" title="音频后期与混音" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解 <strong>LUFS</strong>（响度单位）标准，为不同平台设置正确的响度目标</li>
        <li>针对<strong>手机扬声器</strong>优化音频——知道哪些频率在手机上"听不到"</li>
        <li>使用 <strong>限制器（Limiter）</strong> 防止削波失真，保留安全的<strong>动态余量</strong></li>
        <li>了解各平台的<strong>响度规范</strong>（微信小游戏、iOS、Android、Web Audio）</li>
        <li>掌握<strong>音频导出检查清单</strong>，确保每条音频在发布前经过标准化</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="📊" title="LUFS：音频界的'音量标尺'">
      <p>
        <strong>LUFS</strong>（Loudness Units relative to Full Scale，全称响度单位）是衡量音频<strong>感知响度</strong>的国际标准。
        它和你音量条上的"50%"不一样——LUFS 模拟的是<strong>人耳实际感受到的响度</strong>，而不是电压振幅。
      </p>

      <h3>为什么不用单纯的 dB 来衡量响度？</h3>
      <p>
        两个音频文件的峰值可以完全相同（都是 -3dB），但因为频率分布不同，人耳听起来一个"震耳欲聋"一个"轻声细语"。
        LUFS 会<strong>对中频（人耳最敏感的 2-5kHz）加权</strong>，给出更接近真实听感的数值。
      </p>

      <table>
        <thead>
          <tr>
            <th>平台</th>
            <th>推荐 LUFS 值</th>
            <th>峰值上限</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>移动端游戏（手机扬声器）</strong></td>
            <td><strong>-16 LUFS</strong></td>
            <td>-1 dBTP</td>
            <td>手机扬声器功率小，响度不宜过高——太响反而引起失真</td>
          </tr>
          <tr>
            <td><strong>桌面/主机游戏</strong></td>
            <td><strong>-14 LUFS</strong></td>
            <td>-1 dBTP</td>
            <td>桌面扬声器/耳机频响更宽，可以稍微响一点</td>
          </tr>
          <tr>
            <td><strong>Web 游戏</strong></td>
            <td><strong>-16 ~ -14 LUFS</strong></td>
            <td>-1 dBTP</td>
            <td>和移动端保持一致即可——大部分 Web 用户也在笔记本上玩</td>
          </tr>
          <tr>
            <td><strong>微信小游戏</strong></td>
            <td><strong>-18 LUFS</strong></td>
            <td>-2 dBTP</td>
            <td>微信对音频有额外压缩，留更多余量防止二次压缩后失真</td>
          </tr>
          <tr>
            <td><strong>YouTube（参考）</strong></td>
            <td>-14 LUFS</td>
            <td>-1 dBTP</td>
            <td>用作对比基准——你的游戏不应该比 YouTube 视频更响</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>前端类比：响应式字体：</strong>LUFS 就像 CSS 的
        <code>clamp()</code>——你不会给移动端和桌面端设置同样的字号，同理也不该给手机和桌面设置同样的响度。移动端是
        "受限环境"（小扬声器、低功率），需要用更保守的响度值。
      </div>

      <div class="warn-box">
        <strong>BTTP vs dBFS：</strong>表中有两个峰值单位——<strong>dBTP</strong>（True Peak）和
        <strong>dBFS</strong>（Full Scale）。dBTP 更准确，因为它考虑了<strong>采样点之间可能出现的超幅</strong>（Inter-Sample
        Peaks）。一个音频文件在 dBFS 上显示 -0.1dB 没削波，但在 dBTP 上可能已经超过 0dB 了。导出时务必用
        <strong>True Peak 限制器</strong>。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📱" title="手机扬声器优化：你不知道的物理限制">
      <p>
        手机扬声器的物理尺寸决定了它<strong>无法有效回放低频</strong>。大部分手机扬声器的频率响应从
        <strong>200Hz 左右才开始</strong>，低于 200Hz 的声音要么完全听不见，要么变成了模糊的嗡嗡声。
      </p>

      <h3>手机扬声器的频率盲区</h3>
      <pre><code>频率响应曲线（典型手机扬声器）：
音量
 ┤                              ╭────╮
 │                             ╱      ╲___
 │                            ╱            ╲___
 │              ╭──╮         ╱                  ╲___
 │   ╭────╮    ╱    ╲      ╱
 │  ╱      ╲  ╱      ╲   ╱
 │ ╱        ╲╱        ╲ ╱
 └┴─────────────────────────────────────────→ 频率
  20Hz  100Hz  200Hz  500Hz  1kHz   5kHz  10kHz
  ├─────────────────┤├─────────────────────────┤
  几乎听不到             手机扬声器的"甜区"</code></pre>

      <h3>针对手机扬声器的混音策略</h3>
      <table>
        <thead>
          <tr>
            <th>策略</th>
            <th>具体做法</th>
            <th>效果</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>切除超低频</strong></td>
            <td>在 Audacity 中使用 Effect → High-Pass Filter → 设 100-150Hz</td>
            <td>清掉无效低频能量——既省电又避免嗡嗡声</td>
          </tr>
          <tr>
            <td><strong>抬升中频</strong></td>
            <td>在 EQ 中给 1-4kHz 范围加 2-4dB 的宽幅增益</td>
            <td>让旋律和音效在手机扬声器的"甜区"更突出</td>
          </tr>
          <tr>
            <td><strong>多层合成</strong></td>
            <td>给低频层加一个高八度的中频"影子层"</td>
            <td>在手机扬声器上"低频"虽然没声，但中频的影子层传达了相同的节奏信息</td>
          </tr>
          <tr>
            <td><strong>避免极端声像</strong></td>
            <td>不要做极左/极右的硬声像——手机扬声器通常是单声道合并</td>
            <td>立体声信息在手机上丢失后不会出现"某声部消失"</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>前端类比：移动端适配：</strong>手机扬声器优化就像是 CSS 的
        <code>@media (max-width: 768px)</code>——你知道移动端的"视口"比桌面小很多，所以要对内容做针对性调整。
        音频也一样：移动端"频响视口"从 200Hz 才开始，低于这个频率的内容等于在 320px 屏幕上放一个 1200px
        宽的元素——看不见也听不着。
      </div>

      <div class="warn-box">
        <strong>不要过度补偿：</strong>虽然要给手机优化，但你的玩家可能戴着耳机玩——如果过度抬升中频，耳机玩家会觉得"刺耳"。
        理想方案是<strong>做两套混音</strong>（耳机版 + 扬声器版），在游戏中检测音频输出设备后切换。
        但对于独立游戏开发来说，<strong>以扬声器为主做混音、保证耳机也能听</strong>是更实际的折中方案。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🛡️" title="削波防护：硬限制器与动态余量">
      <p>
        <strong>削波（Clipping）</strong>是指音频信号超出数字系统的最大值（0 dBFS），波形被"削平"，产生刺耳的失真。
        在游戏中，多个音效同时播放时最容易出现削波——每个单独的音效都"合规"，但一叠加就爆了。
      </p>

      <h3>三道防线防止削波</h3>

      <table>
        <thead>
          <tr>
            <th>防线</th>
            <th>工具</th>
            <th>做法</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>第一道：文件级</strong></td>
            <td>Audacity 限制器（Effect → Limiter）</td>
            <td>
              导出前给每条音频单独跑一次限制器——设 Limit to -3dB<br />
              Type 选 <strong>Hard Limit</strong>，Release 设 0.1s
            </td>
          </tr>
          <tr>
            <td><strong>第二道：引擎级</strong></td>
            <td>Cocos AudioSource volume</td>
            <td>
              游戏代码中所有 AudioSource 的 volume 不超过 0.8<br />
              预留 20% 的"叠加余量"——即使两个音效同时满音量播放，合并后也不削波
            </td>
          </tr>
          <tr>
            <td><strong>第三道：策略级</strong></td>
            <td>优先级队列 + 帧内去重（见 Phase 4）</td>
            <td>
              控制同时播放的音效数量——不是每个射击都需要一个独立通道<br />
              限制同一帧内最多 4 个 SFX 同时发声
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Audacity 限制器操作步骤</h3>
      <ol>
        <li>打开音频文件 → Ctrl+A 全选</li>
        <li>菜单 Effect → Limiter</li>
        <li>Type 选择 <strong>Hard Limit</strong></li>
        <li>Limit to (dB) 设为 <strong>-3</strong></li>
        <li>Release time 设为 <strong>0.1</strong> 秒（短音效用更短的释放时间）</li>
        <li>点击 Apply</li>
      </ol>

      <div class="tip-box">
        <strong>为什么是 -3dB 而不是 -0.1dB？</strong
        >单个音效限制在 -3dB 为多音效叠加留了<strong>动态余量（Headroom）</strong>。如果两个 -3dB 的音效同时播放，总电平约为 0dB——刚好不削波。
        如果你把所有音效都限到 -0.1dB，两个叠加就炸了。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🏷️" title="平台响度标准速查">
      <p>不同平台对音频的处理方式不同，导出前需要了解各自的"脾气"：</p>

      <table>
        <thead>
          <tr>
            <th>平台</th>
            <th>音频自动处理</th>
            <th>建议导出规格</th>
            <th>特别注意</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>微信小游戏</strong></td>
            <td>会对音频做二次压缩（降低码率），可能引入额外延迟</td>
            <td>OGG / 48kbps / Mono（SFX），64-96kbps / Stereo（BGM）</td>
            <td>-18 LUFS 更保守；InnerAudioContext 同时最多 10 个</td>
          </tr>
          <tr>
            <td><strong>iOS 原生</strong></td>
            <td>系统自带音频处理，音质保留较好</td>
            <td>OGG 或 M4A / 128kbps</td>
            <td>iOS 的音频延迟比 Android 低，但 AudioContext 限制同样存在</td>
          </tr>
          <tr>
            <td><strong>Android 原生</strong></td>
            <td>碎片化严重——不同厂商的音频延迟差异大（50-500ms）</td>
            <td>OGG / 96kbps</td>
            <td>低端机型音频延迟可能很严重——射击音效延迟感明显</td>
          </tr>
          <tr>
            <td><strong>Web Audio（浏览器）</strong></td>
            <td>受 Autoplay Policy 限制，需用户交互后才能播放</td>
            <td>OGG / 96kbps</td>
            <td>首次播放前必须有一次用户点击；Web Audio API 通道数约 6-8</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>Android 音频延迟陷阱：</strong>部分低端 Android 设备的音频延迟可达 200-500ms。
        这意味着你代码中<code>playOneShot('sfx/player_shoot')</code>调用后，玩家要等
        0.2-0.5 秒才能听到声音——在快节奏射击游戏中这是致命的。解决方案：<strong
        >使用 Web Audio API 的 AudioBuffer（预解码）</strong
        >而非流式加载，可以将延迟降到 10-30ms。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="💻" title="代码层面：简易压缩器 / 限制器概念">
      <p>
        虽然真正的动态处理应该在导出前完成（Audacity 限制器），但了解"压缩器和限制器在做什么"有助于理解音量控制：
      </p>

      <pre><code>// 简化版压缩器概念（伪代码——说明原理, 不代替 Audacity）
// 实际项目中应该在 DAW/Audacity 中处理，这里只是帮助理解

interface CompressorConfig {
  threshold: number   // 阈值 (dB)，超过此值的信号被压缩
  ratio: number       // 压缩比 (如 4:1 = 超过阈值 4dB 只增加 1dB)
  makeupGain: number  // 补偿增益——压缩后整体提响度
}

class SimpleCompressor {
  private _threshold = -12   // -12dB 阈值
  private _ratio = 4         // 4:1 压缩比
  private _makeupGain = 3    // 3dB 补偿增益

  /** 对音频缓冲区应用压缩（仅概念演示） */
  process(buffer: Float32Array): Float32Array {
    for (let i = 0; i < buffer.length; i++) {
      const inputDB = this.amplitudeToDB(Math.abs(buffer[i]))

      if (inputDB > this._threshold) {
        // 超过阈值：按压缩比降低
        const overDB = inputDB - this._threshold            // 超出多少
        const compressedDB = this._threshold + overDB / this._ratio  // 压缩后的值
        const gainReduction = inputDB - compressedDB        // 需要减少多少
        const scale = this.dbToAmplitude(gainReduction)
        buffer[i] *= scale
      }
      // 低于阈值：不处理（通过）

      // 压缩后整体提响度（Makeup Gain）
      buffer[i] *= this.dbToAmplitude(this._makeupGain)
    }
    return buffer
  }

  private amplitudeToDB(amp: number): number {
    return 20 * Math.log10(Math.max(amp, 1e-10))
  }
  private dbToAmplitude(db: number): number {
    return Math.pow(10, db / 20)
  }
}</code></pre>

      <p>关键理解：</p>
      <ul>
        <li><strong>压缩器（Compressor）：</strong>减小动态范围——把"太响"的压下来、把"太轻"的提上去，整体音量更均匀</li>
        <li><strong>限制器（Limiter）：</strong>压缩比为无穷大的压缩器——任何超过阈值的信号被直接"削"到阈值</li>
        <li><strong>为什么在代码层不做压缩：</strong>实时压缩消耗 CPU、引入延迟——应该在<strong>导出前用 Audacity 处理好</strong></li>
      </ul>

      <div class="tip-box">
        <strong>前端类比：Lodash / Ramda 的 throttle：</strong>压缩器就像
        <code>throttle()</code>——把"突发的尖峰"平滑掉，让整体信号更稳定。限制器是
        <code>clamp()</code>——设定一个硬上限，超过就裁掉。但和 JS 不同，音频压缩的"抹平"有
        Attack/Release 时间参数，决定了压缩起效/恢复的速度。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📋" title="音频导出检查清单">
      <p>每条音频在导入 Cocos 之前，请逐项检查：</p>

      <h3>SFX（短音效）检查清单</h3>
      <ol>
        <li>裁剪了开头的空白和结尾的多余静音</li>
        <li>开头加了 5ms 的淡入（防止"啪"声）</li>
        <li>结尾加了 10-20ms 的淡出（自然收尾）</li>
        <li>标准化（Normalize）到 -0.5 dB</li>
        <li>跑了限制器（Hard Limit）-3dB</li>
        <li>格式：WAV (16-bit PCM) 或 OGG (48-64kbps)</li>
        <li>声道：Mono（单声道——位置定位用）</li>
        <li>文件命名：小写英文 + 下划线（如 <code>player_shoot.wav</code>）</li>
      </ol>

      <h3>BGM（背景音乐）检查清单</h3>
      <ol>
        <li>循环点检查——在 Audacity 中 Shift+空格 循环播放至少 10 遍</li>
        <li>循环点处加了 5-10ms 的交叉淡入淡出（消除咔嗒声）</li>
        <li>响度标准化到 -16 LUFS（移动端）/ -14 LUFS（桌面端）</li>
        <li>混音时 BGM 音量比 SFX 低 6-12dB（为音效留空间）</li>
        <li>高通滤波切除 100Hz 以下（BGM 不需要超低频——那是爆炸的领地）</li>
        <li>格式：OGG (64-128kbps)</li>
        <li>声道：Stereo（立体声——增强沉浸感）</li>
        <li>时长不超过 2 分钟（OGG 压缩后约 1-2MB）</li>
      </ol>

      <div class="warn-box">
        <strong>最后一步——拉通试听：</strong>导出检查清单是"单个文件"的检查。最终还需要<strong>所有音效 + BGM 同时播放</strong>的混合试听——在 Audacity
        中把所有文件放到不同轨道上同时播放，检查有无削波、遮蔽或频率冲突。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔨" title="动手练习：标准化你的全部音频">
      <ol>
        <li>用 Audacity 打开 Phase 2 中制作的所有 SFX（12 个音效）</li>
        <li>逐一对每个 SFX 执行：裁剪空白 → 首尾淡入淡出 → Normalize -0.5dB → Limiter -3dB</li>
        <li>打开 Phase 3 中制作的 BGM 文件</li>
        <li>对 BGM 执行：高通滤波 100Hz → 检查循环点 → Normalize 到约 -16 LUFS（用 Effect → Loudness Normalization）</li>
        <li>在 Audacity 中把所有 SFX 和 BGM 放到多轨道中同时播放——听听有没有削波或频率冲突</li>
        <li>导出所有最终版本，替换掉 <code>assets/resources/</code> 中的旧文件</li>
        <li>在 Cocos 中重新运行游戏，对比标准化前后的音质差异</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>所有音效和 BGM 通过了上述检查清单的每一项。在游戏中同时触发多个音效+BGM
        时，没有削波失真的"呲呲"声，整体响度均匀（不会有某个音效突然"炸耳"）。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>LUFS 和普通 dB 有什么区别？为什么不用峰值 dB 来衡量响度？</li>
        <li>移动端游戏推荐的 LUFS 值是多少？微信小游戏为什么需要更保守（-18 LUFS）？</li>
        <li>手机扬声器的频率盲区在哪个范围？如何为手机扬声器优化混音？</li>
        <li>高通滤波器的作用是什么？BGM 为什么要切掉 100Hz 以下的频率？</li>
        <li>dBTP 和 dBFS 的差异是什么？为什么导出要用 True Peak 限制器？</li>
        <li>设置 -3dB 硬件限制（而非 -0.1dB）的主要原因是什么？（提示：叠加）</li>
        <li>压缩器和限制器的本质区别是什么？</li>
        <li>SFX 和 BGM 的导出检查清单分别有哪些关键步骤？</li>
      </ul>
    </ConceptBlock>
  </AudioPhaseLayout>
</template>
