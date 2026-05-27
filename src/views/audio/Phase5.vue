<script setup lang="ts">
import AudioPhaseLayout from '@/components/AudioPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <AudioPhaseLayout :phase="5" title="自适应音乐系统" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解<strong>垂直分层</strong>概念：把 BGM 拆成多层独立音轨，按需开关</li>
        <li>根据<strong>游戏状态</strong>动态切换音乐层次（菜单 / 战斗 / Boss / 残血）</li>
        <li>设计<strong>过渡音效</strong>（Stingers），让状态切换时的音乐不突兀</li>
        <li>实现<strong>无缝循环</strong>：裁剪、BPM 对齐、交叉淡入淡出</li>
        <li>在 Cocos 中用 <strong>多个 AudioSource</strong> 实现分层音乐系统</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🍰" title="垂直分层：把 BGM 当千层蛋糕">
      <p>
        传统做法是每种游戏状态对应一段独立的 BGM 文件（菜单 = <code>bgm_menu.ogg</code>，战斗 = <code>bgm_battle.ogg</code>）。
        但自适应音乐系统的思路不同——<strong>把一段 BGM 垂直拆分成多层，通过静音/取消静音来控制每层的开关</strong>，在不同游戏状态下露出不同层。
      </p>

      <table>
        <thead>
          <tr>
            <th>层级</th>
            <th>内容</th>
            <th>菜单</th>
            <th>普通战斗</th>
            <th>Boss 战</th>
            <th>残血（HP &lt; 30%）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Layer 1：打击乐</strong></td>
            <td>底鼓 + 军鼓 + 踩镲（稳定节奏骨架）</td>
            <td>ON</td>
            <td>ON</td>
            <td>ON</td>
            <td>ON</td>
          </tr>
          <tr>
            <td><strong>Layer 2：贝斯</strong></td>
            <td>低音线——提供"推进感"</td>
            <td>OFF</td>
            <td>ON</td>
            <td>ON</td>
            <td>ON</td>
          </tr>
          <tr>
            <td><strong>Layer 3：旋律</strong></td>
            <td>主旋律（方波/锯齿波）——音乐的记忆点</td>
            <td>OFF</td>
            <td>ON</td>
            <td>ON</td>
            <td>OFF（旋律让位给警告）</td>
          </tr>
          <tr>
            <td><strong>Layer 4：琶音/装饰</strong></td>
            <td>高频十六分音符琶音——紧张感的来源</td>
            <td>OFF</td>
            <td>OFF</td>
            <td>ON</td>
            <td>OFF</td>
          </tr>
          <tr>
            <td><strong>Layer 5：紧急层</strong></td>
            <td>心跳声/警报脉冲——"你快要死了"</td>
            <td>OFF</td>
            <td>OFF</td>
            <td>OFF</td>
            <td>ON</td>
          </tr>
        </tbody>
      </table>

      <p>所有的 Layer <strong>共享相同的 BPM 和总时长</strong>，导出时确保它们完全对齐。任何时候，至少 Layer 1（节奏骨架）保持播放，避免音乐"空掉"。</p>

      <div class="tip-box">
        <strong>前端类比：CSS Animation Layers：</strong>这就像用 CSS 写一组共享相同
        <code>animation-duration</code> 但不同 <code>opacity</code> 的叠加层——每一层独立淡入淡出，但始终同步运行。又类似 React 的 Suspense
        boundaries：每个组件独立控制自己的显示状态，但整体布局不受影响。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎮" title="游戏状态驱动音乐切换">
      <p>不同的游戏状态触发不同的层级组合。核心思路：<strong>音乐强度应该和游戏紧张度成正比</strong>。</p>

      <h3>状态映射表</h3>
      <table>
        <thead>
          <tr>
            <th>游戏状态</th>
            <th>激活的 Layer</th>
            <th>音乐感觉</th>
            <th>触发条件</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>菜单</strong></td>
            <td>Layer 1 仅鼓点</td>
            <td>轻快、期待感、不压迫</td>
            <td>游戏启动 / 返回主菜单</td>
          </tr>
          <tr>
            <td><strong>普通战斗</strong></td>
            <td>Layer 1 + 2 + 3</td>
            <td>节奏明确、有推进感但不过度紧张</td>
            <td>进入战斗场景</td>
          </tr>
          <tr>
            <td><strong>Boss 战</strong></td>
            <td>Layer 1 + 2 + 3 + 4</td>
            <td>全乐器齐上，琶音层增加压迫感</td>
            <td>Boss 登场事件</td>
          </tr>
          <tr>
            <td><strong>残血</strong></td>
            <td>Layer 1 + 2 + 5</td>
            <td>旋律消失、警报层切入——"危险！"</td>
            <td>玩家 HP &lt; 30%</td>
          </tr>
          <tr>
            <td><strong>全屏炸弹</strong></td>
            <td>Layer 1 + 2（暂时降级）</td>
            <td>给爆炸音效腾出频率空间</td>
            <td>玩家释放全屏炸弹</td>
          </tr>
          <tr>
            <td><strong>关卡胜利</strong></td>
            <td>Layer 1 + 2 + 3（加 Stinger）</td>
            <td>欢快的收尾音——"你赢了！"</td>
            <td>Boss HP = 0</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>设计原则：</strong>状态切换不代表所有层瞬间变化。用<strong>渐进的音量过渡</strong>（0.5-1 秒淡入淡出）代替硬切。Layer
        5（紧急层）可以用一个短促的心跳音效（<code>heartbeat.wav</code>）叠加在 BGM 上，而非让整个 Layer 循环。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔔" title="过渡音效（Stingers）：桥梁而非断崖">
      <p>
        当游戏状态变化时（如"进入 Boss 战"），如果 BGM 直接切换层叠组合，玩家可能会觉得"音乐怎么突然变了"。过渡音效（Stinger）就是这段<strong>3-8 秒的短过渡乐句</strong>，在状态切换的瞬间播放，把新旧音乐状态"缝合"在一起：
      </p>

      <h3>Stinger 的使用场景</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>Stinger 类型</th>
            <th>时长</th>
            <th>描述</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>进入 Boss 战</td>
            <td><strong>上升型（Riser）</strong></td>
            <td>2-4s</td>
            <td>音高持续上升的合成器音色——"紧张感正在积累"</td>
          </tr>
          <tr>
            <td>Boss 被击败</td>
            <td><strong>胜利号角（Victory Sting）</strong></td>
            <td>3-5s</td>
            <td>三连上升音阶 + 和弦结尾——"你做到了！"</td>
          </tr>
          <tr>
            <td>玩家死亡</td>
            <td><strong>下降型（Descender）</strong></td>
            <td>2-3s</td>
            <td>音高持续下降——"一切都结束了..."</td>
          </tr>
          <tr>
            <td>获得强力道具</td>
            <td><strong>提示型（Stab）</strong></td>
            <td>1-2s</td>
            <td>一个响亮的和弦/音效——"注意！好东西！"</td>
          </tr>
        </tbody>
      </table>

      <p>Stinger 在播放时，BGM 的旋律层应短暂降低音量（Ducking），让过渡音效清晰可辨。</p>

      <div class="tip-box">
        <strong>前端类比：路由过渡动画：</strong>Stinger 相当于 Vue Router 的
        <code>&lt;Transition&gt;</code> 组件——不是直接替换页面内容，而是在新旧页面之间插入一段动画（fade/slide），让用户的注意力平滑地从一个状态滑动到另一个状态，而非"闪切"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="💻" title="代码实现：分层 AudioManager">
      <p>
        在 Cocos 中实现分层音乐系统：为每一层创建独立的 <strong>AudioSource</strong>，通过控制每个 AudioSource 的
        <code>volume</code> 来开关层级：
      </p>

      <pre><code>// LayeredAudioManager.ts —— 分层音乐管理器
import { AudioClip, AudioSource, Node, resources, tween } from 'cc'

/** 层级配置 */
interface LayerConfig {
  name: string
  clipPath: string
}

/** 游戏状态 → 各层目标音量（0 = 静音, 1 = 满音量） */
type StateVolumeMap = Record&lt;string, Record&lt;string, number&gt;&gt;

class LayeredAudioManager {
  private static _instance: LayeredAudioManager
  static get instance() {
    if (!this._instance) this._instance = new LayeredAudioManager()
    return this._instance
  }

  private _layers = new Map&lt;string, AudioSource&gt;()  // layerName → AudioSource
  private _currentState = 'menu'

  /** 层定义 */
  private _layerConfigs: LayerConfig[] = [
    { name: 'drums',    clipPath: 'bgm/drums_layer' },
    { name: 'bass',     clipPath: 'bgm/bass_layer' },
    { name: 'melody',   clipPath: 'bgm/melody_layer' },
    { name: 'arpeggio', clipPath: 'bgm/arpeggio_layer' },
    { name: 'urgency',  clipPath: 'bgm/urgency_layer' },
  ]

  /** 各状态下的层音量配置 */
  private _stateVolumes: StateVolumeMap = {
    menu:      { drums: 1, bass: 0, melody: 0, arpeggio: 0, urgency: 0 },
    battle:    { drums: 1, bass: 1, melody: 1, arpeggio: 0, urgency: 0 },
    boss:      { drums: 1, bass: 1, melody: 1, arpeggio: 1, urgency: 0 },
    lowHP:     { drums: 1, bass: 1, melody: 0, arpeggio: 0, urgency: 1 },
  }

  /** 初始化：为每层创建一个 AudioSource */
  init(containerNode: Node) {
    this._layerConfigs.forEach(config => {
      const audioSource = containerNode.addComponent(AudioSource)
      audioSource.loop = true
      audioSource.volume = 0  // 初始全静音
      this._layers.set(config.name, audioSource)

      // 加载 AudioClip
      resources.load(config.clipPath, AudioClip, (err, clip) => {
        if (!err) {
          audioSource.clip = clip
          audioSource.play()
        }
      })
    })
  }

  /** 切换到目标状态：平滑过渡各层音量 */
  switchState(state: string, fadeDuration = 1.0) {
    const targetVolumes = this._stateVolumes[state]
    if (!targetVolumes) return

    this._currentState = state

    for (const [layerName, source] of this._layers) {
      const targetVol = targetVolumes[layerName] ?? 0

      // 用 tween 平滑过渡音量
      tween(source)
        .to(fadeDuration, { volume: targetVol })
        .start()
    }
  }

  /** 紧急切入残血状态（短过渡时间，制造紧迫感） */
  enterLowHP() {
    this.switchState('lowHP', 0.3)  // 0.3 秒快速切入
  }
}

export const layeredAudio = LayeredAudioManager.instance</code></pre>

      <h3>游戏逻辑中的调用</h3>
      <pre><code>// BattleScene.ts —— 战斗场景中触发音乐切换
import { layeredAudio } from './LayeredAudioManager'

// 玩家进入战斗
onBattleStart() {
  layeredAudio.switchState('battle', 1.5)  // 1.5 秒渐进
}

// Boss 登场
onBossAppear() {
  // 先播 Stinger 过渡音效
  audioManager.playOneShot('sfx/boss_riser')
  // 延迟 1 秒后再切状态（等 Stinger 播完）
  this.scheduleOnce(() => {
    layeredAudio.switchState('boss', 1.0)
  }, 1)
}

// 玩家 HP 降低
onPlayerDamaged(currentHP: number, maxHP: number) {
  if (currentHP / maxHP < 0.3 && layeredAudio.currentState !== 'lowHP') {
    layeredAudio.enterLowHP()
  }
}</code></pre>

      <div class="warn-box">
        <strong>同步问题：</strong>所有层的 AudioSource 必须在<strong>完全相同的时刻</strong>开始播放。
        如果各层加载速度不同（网络延迟导致有的 OGG 先加载完、有的后加载完），会出现节奏错位。
        解决方案：<strong>等所有层的 AudioClip 全部加载完成后，再统一调用所有 AudioSource 的 play()</strong>。
        可以用 <code>Promise.all</code> 包装 <code>resources.load</code> 来实现。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔁" title="无缝循环的全流程">
      <p>分层音乐对循环的要求更高——所有层必须精确对齐，否则节奏骨架会散架：</p>

      <h3>导出前的准备工作（Bosca Ceoil / Audacity）</h3>
      <ol>
        <li><strong>统一定长：</strong>所有层的导出版本必须是完全相同的时长（如 32 小节 = 64 秒 @ 120 BPM）</li>
        <li><strong>裁剪静音：</strong>在 Audacity 中放大首尾波形，删掉任何多余的静音帧——即使是 1ms 的偏移，在叠加播放时都会产生"相位错位"的听感</li>
        <li><strong>BPM 对齐：</strong>所有层使用相同的 BPM（如 130 BPM），避免节奏漂移</li>
        <li><strong>交叉淡入淡出：</strong>在循环点（文件结尾/开头）加约 5ms 的微小淡入淡出，消除可能出现的"咔嗒"声</li>
      </ol>

      <h3>几种常见问题及对策</h3>
      <table>
        <thead>
          <tr>
            <th>问题</th>
            <th>原因</th>
            <th>解决方案</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>叠加播放时"回声感"</td>
            <td>各层启动时间稍有偏差，同一音符被重复两次</td>
            <td>所有层在 init 时同步调用 <code>play()</code>，不要各自独立启动</td>
          </tr>
          <tr>
            <td>循环点时"咔嗒"</td>
            <td>波形在循环点不连续（电平突变）</td>
            <td>在 Audacity 中选择循环点 → Effect → Crossfade Clips（约 10ms）</td>
          </tr>
          <tr>
            <td>OGG 循环点偏移</td>
            <td>OGG 编码会在开头插入几毫秒静音（编码器延迟）</td>
            <td>导出 OGG 后重新导入 Audacity 检查首部，手工裁剪掉编码器插入的空白</td>
          </tr>
          <tr>
            <td>某层明显比别的层"慢"</td>
            <td>该层的 BPM 和其他层不一致</td>
            <td>回到 Bosca Ceoil 统一各层 BPM，确保导出时没有变速</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🔨" title="动手练习：构建分层 BGM">
      <ol>
        <li>在 Bosca Ceoil 中创建 5 条独立音轨：鼓、贝斯、旋律、琶音、紧急（心跳/警报）</li>
        <li>所有音轨设置相同的 BPM（如 135 BPM），统一导出长度（32 小节）</li>
        <li>分 5 次分别导出——每次只打开一条音轨，其余静音 → 分别导出 5 个 OGG 文件</li>
        <li>在 Audacity 中检查每个文件的首尾是否精确对齐，裁剪多余的静音帧</li>
        <li>将所有 5 个 OGG 文件导入 Cocos 的 <code>assets/resources/bgm/</code></li>
        <li>将上面的 <code>LayeredAudioManager.ts</code> 脚本挂载到场景根节点</li>
        <li>测试：在运行时切换不同状态，听各层是否平滑过渡</li>
        <li>创建至少一个过渡 Stinger（如 Boss 登场的上升音效）并集成到切换逻辑中</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>在游戏中从菜单 → 战斗 → Boss → 残血 → 胜利
        各状态之间切换时，BGM 动态改变层次而不会中断。所有层始终同步循环，没有回声感或咔嗒声。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>垂直分层和传统的"一段 BGM 一个状态"相比，优势是什么？</li>
        <li>至少需要哪几层来覆盖菜单/战斗/Boss/残血这四种游戏状态？</li>
        <li>为什么所有层必须共享相同的 BPM 和导出时长？</li>
        <li>过渡音效（Stinger）的作用是什么？在哪些场景中使用？</li>
        <li>分层 AudioManager 如何确保所有层的 AudioSource 同步启动？</li>
        <li>循环点"咔嗒"声的原因是什么？如何在 Audacity 中修复？</li>
        <li>OGG 编码器在文件头部插入的延迟对分层音乐有什么影响？怎么解决？</li>
        <li>游戏状态切换时，为什么用 tween 渐变音量而不是直接 set volume？</li>
      </ul>
    </ConceptBlock>
  </AudioPhaseLayout>
</template>
