<script setup lang="ts">
import AudioPhaseLayout from '@/components/AudioPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <AudioPhaseLayout :phase="2" title="射击游戏音效制作" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>为飞机大战的所有动作设计并制作完整的<strong>射击音效</strong>、<strong>爆炸音效</strong>组</li>
        <li>理解<strong>包络</strong>（<strong>Attack/Decay/Sustain/Release</strong>）如何塑造音效质感</li>
        <li>为不同游戏事件匹配音色和<strong>频率</strong>范围</li>
        <li>建立一套音效命名规范，方便在 <strong>Cocos</strong> 代码中调用</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="音效设计原则">
      <p>游戏音效不是随机噪音——每种音效都有<strong>信息传递</strong>的功能：</p>

      <table>
        <thead>
          <tr>
            <th>原则</th>
            <th>说明</th>
            <th>正向例子</th>
            <th>反例</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>信号清晰</strong></td>
            <td>音效出现的瞬间玩家就知道发生了什么</td>
            <td>激光：尖锐短促"pew"</td>
            <td>模糊的长噪音——听不出是射击还是背景</td>
          </tr>
          <tr>
            <td><strong>频率分层</strong></td>
            <td>高频（提示/警告）、中频（反馈/确认）、低频（冲击/爆炸）</td>
            <td>激光 2-4kHz → 刺耳醒目；爆炸 100-400Hz → 震撼</td>
            <td>所有音效集中在同一频率——频谱打架</td>
          </tr>
          <tr>
            <td><strong>比例合理</strong></td>
            <td>频繁音效短、稀有音效长</td>
            <td>射击 0.1s、拾取 0.3s、Boss 爆炸 1.5s</td>
            <td>每发子弹 1 秒长——连续射击时声音堆叠成噪音</td>
          </tr>
          <tr>
            <td><strong>一致调性</strong></td>
            <td>同一游戏内所有音效风格统一</td>
            <td>8-bit 像素风从头到尾</td>
            <td>射击是电子音、爆炸是写实录音——违和</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🎛️" title="包络（Envelope）：塑形音效的关键">
      <p>每个合成器音效都由四个阶段定义——ADSR 包络：</p>

      <pre><code>音量
100% ┤     ╭────╮
     │    ╱      ╲
 75% ┤   ╱        ╲___
     │  ╱              ╲
 50% ┤ ╱                ╲___
     │╱                      ╲
  0% ┼────────────────────────────→ 时间
     A   D      S        R</code></pre>

      <table>
        <thead>
          <tr>
            <th>阶段</th>
            <th>含义</th>
            <th>射击音效</th>
            <th>爆炸音效</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>A (Attack)</strong></td>
            <td>从 0 升到最大音量的时间</td>
            <td>0.001s（瞬间爆发）</td>
            <td>0.05-0.1s（轰鸣渐起）</td>
          </tr>
          <tr>
            <td><strong>D (Decay)</strong></td>
            <td>从最大降到 Sustain 的时间</td>
            <td>0.02s</td>
            <td>0.1-0.2s</td>
          </tr>
          <tr>
            <td><strong>S (Sustain)</strong></td>
            <td>保持阶段的音量</td>
            <td>10%（很低）</td>
            <td>40%（持续轰鸣）</td>
          </tr>
          <tr>
            <td><strong>R (Release)</strong></td>
            <td>释放后降到 0 的时间</td>
            <td>0.02s</td>
            <td>0.3-0.5s（拖尾）</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>记忆口诀：</strong>射击音效的 A 越短越"脆"，爆炸音效的 R 越长越"震"。调整 BFXR
        中对应的 Attack/Decay/Sustain/Release 滑块就能塑形。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔫" title="音效清单与制作指南">
      <p>飞机大战需要的完整音效列表。每个音效都有推荐的 BFXR 预设起点和参数方向：</p>

      <h3>玩家射击</h3>
      <table>
        <thead>
          <tr>
            <th>文件</th>
            <th>预设</th>
            <th>时长</th>
            <th>频率</th>
            <th>感觉</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>player_shoot.wav</code></td>
            <td>Laser/Shoot</td>
            <td>0.1-0.2s</td>
            <td>2-4 kHz</td>
            <td>清脆、"pew"感、不刺耳</td>
          </tr>
          <tr>
            <td><code>player_power_shoot.wav</code></td>
            <td>Laser/Shoot → Mutate 降低音高</td>
            <td>0.2-0.3s</td>
            <td>1.5-3 kHz</td>
            <td>比普通射击更沉、更有力</td>
          </tr>
        </tbody>
      </table>

      <h3>敌机音效</h3>
      <table>
        <thead>
          <tr>
            <th>文件</th>
            <th>预设</th>
            <th>时长</th>
            <th>频率</th>
            <th>感觉</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>enemy_shoot.wav</code></td>
            <td>Laser/Shoot → Mutate 提高音高</td>
            <td>0.08-0.15s</td>
            <td>3-5 kHz</td>
            <td>比玩家子弹更高更尖——区分敌我</td>
          </tr>
          <tr>
            <td><code>enemy_hit.wav</code></td>
            <td>Hit/Hurt</td>
            <td>0.1-0.2s</td>
            <td>500-2kHz</td>
            <td>短闷撞击感</td>
          </tr>
        </tbody>
      </table>

      <h3>爆炸与伤害</h3>
      <table>
        <thead>
          <tr>
            <th>文件</th>
            <th>预设</th>
            <th>时长</th>
            <th>频率</th>
            <th>感觉</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>explosion_small.wav</code></td>
            <td>Explosion</td>
            <td>0.5-0.8s</td>
            <td>200-1kHz</td>
            <td>小块爆炸，轻闷</td>
          </tr>
          <tr>
            <td><code>explosion_big.wav</code></td>
            <td>Explosion → Mutate 降调+加噪声</td>
            <td>1-1.5s</td>
            <td>80-500Hz</td>
            <td>Boss/大爆炸，低音冲击</td>
          </tr>
          <tr>
            <td><code>player_hit.wav</code></td>
            <td>Hit/Hurt</td>
            <td>0.2-0.3s</td>
            <td>300-1kHz</td>
            <td>报警感——"你受伤了"</td>
          </tr>
        </tbody>
      </table>

      <h3>道具与 UI</h3>
      <table>
        <thead>
          <tr>
            <th>文件</th>
            <th>预设</th>
            <th>时长</th>
            <th>频率</th>
            <th>感觉</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>pickup_power.wav</code></td>
            <td>Powerup</td>
            <td>0.3-0.5s</td>
            <td>1-3 kHz</td>
            <td>上升音阶——"变强了"</td>
          </tr>
          <tr>
            <td><code>pickup_heal.wav</code></td>
            <td>Pickup/Coin → Mutate 升调</td>
            <td>0.2-0.3s</td>
            <td>800-2kHz</td>
            <td>明亮愉悦、两连音</td>
          </tr>
          <tr>
            <td><code>pickup_bomb.wav</code></td>
            <td>Powerup → Mutate 降调</td>
            <td>0.3-0.4s</td>
            <td>500-1.5kHz</td>
            <td>重型武器感</td>
          </tr>
          <tr>
            <td><code>ui_click.wav</code></td>
            <td>Blip/Select</td>
            <td>0.03-0.05s</td>
            <td>1-2 kHz</td>
            <td>清脆点击——菜单/按钮</td>
          </tr>
          <tr>
            <td><code>ui_start.wav</code></td>
            <td>Powerup</td>
            <td>0.5-0.8s</td>
            <td>800-2kHz</td>
            <td>游戏开始——三连上升音</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🔨" title="动手练习：制作全部音效">
      <ol>
        <li>在 BFXR 中逐一生成上面列出的所有 12 个音效</li>
        <li>每个音效 Mutate 至少 5 次再微调（不要满足于第一个随机结果）</li>
        <li>在 Audacity 中对每个文件：裁剪开头空白 → Normalize -0.5dB → 加淡入/淡出</li>
        <li>统一保存到项目文件夹 <code>assets/resources/sfx/</code></li>
        <li>全部播放一遍——相邻音效之间有没有频率打架？（射击和拾取能分清吗？）</li>
        <li>如有频率冲突，回到 BFXR 调整音高避开</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong
        >闭上眼按顺序播放所有音效——你能仅靠声音就区分出"这是射击""这是敌机被击""这是道具拾取"吗？这就是你的玩家在混乱的弹幕中依赖的听觉信息。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>ADSR 四个字母分别代表什么？射击音效和爆炸音效的 ADSR 有什么区别？</li>
        <li>为什么频繁音效（如射击）必须做得短？</li>
        <li>玩家子弹和敌机子弹的音效如何区分？（音高差异）</li>
        <li>小爆炸和大爆炸在频率上怎么区分？</li>
        <li>道具拾取音效用什么感觉来传达"变强了"？</li>
        <li>你做的所有音效之间有没有频率冲突？怎么检查？</li>
        <li>为什么同一款游戏所有音效的风格要统一？</li>
      </ul>
    </ConceptBlock>
  </AudioPhaseLayout>
</template>
