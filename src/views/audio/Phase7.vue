<script setup lang="ts">
import AudioPhaseLayout from '@/components/AudioPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <AudioPhaseLayout :phase="7" title="空间音频" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解<strong>空间音频</strong>的核心原理：基于位置的声像定位和距离衰减</li>
        <li>将游戏坐标映射到<strong>立体声平衡</strong>（X 轴 → 左右声道比例）</li>
        <li>用<strong>距离衰减公式</strong>实现"远处爆炸听起来比近处轻"</li>
        <li>在 Cocos 中配置 <strong>AudioSource 3D 模式</strong>：空间混合（Spatial Blend）、参考距离</li>
        <li>理解<strong>耳机 vs 扬声器</strong>在空间音频上的差异和各自的局限性</li>
        <li>实现一个 <strong>SpatialAudioManager</strong>，每帧自动更新音效的声像和音量</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧭" title="空间音频的双维度：方位 + 距离">
      <p>
        现实世界中，我们靠<strong>双耳</strong>判断声音的位置：左边来的声音先到左耳、更响；右边的则相反。
        这就是<strong>双耳时间差（ITD）</strong>和<strong>双耳音量差（ILD）</strong>。
      </p>

      <p>在游戏音频中，我们模拟两个维度来伪造空间感：</p>

      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>玩家感知</th>
            <th>实现方式</th>
            <th>参数范围</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>方位（Pan）</strong></td>
            <td>"左边有敌人开火了！" vs "右边有爆炸！"</td>
            <td>游戏 X 坐标 → 立体声平衡器（左右声道比例）</td>
            <td>-1（极左）→ 0（中间）→ +1（极右）</td>
          </tr>
          <tr>
            <td><strong>距离（Distance）</strong></td>
            <td>"远处的爆炸" vs "贴脸的爆炸"</td>
            <td>距离 → 音量衰减 + 低通滤波（远处的声音闷）</td>
            <td>0%（无声）→ 100%（最大声）</td>
          </tr>
        </tbody>
      </table>

      <h3>为什么空间音频只适合短音效？</h3>
      <p>
        BGM 通常不应该有空间位置——背景音乐是"上帝视角"的，包围玩家的，不是从某个点发出的。
        空间音频（声像定位 + 距离衰减）只应用在<strong>短 SFX</strong>上：射击、爆炸、敌机受击、道具拾取、引擎声等。
      </p>

      <div class="warn-box">
        <strong>严格限定：</strong>只对 <strong>SFX（音效）</strong>应用空间音频，BGM 保持在
        <strong>立体声居中</strong>（pan = 0、无衰减）。如果你给 BGM 加了空间位置，玩家会听到"音乐从左边过来"——这非常出戏，也是游戏音频中最常见的初学者错误。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="↔️" title="位置到声像的映射">
      <p>
        核心公式很简单——把游戏对象的 X 坐标线性映射到声像值：
      </p>

      <pre><code>// 声像映射公式（简化版）
function calculatePan(
  soundX: number,      // 发声对象的 X 坐标
  listenerX: number,   // 监听者（玩家）的 X 坐标
  maxDistance: number  // 最远可听到的距离（超出此距离不播放）
): number {
  // 计算相对 X 偏移
  const deltaX = soundX - listenerX

  // 映射到 [-1, 1]
  // deltaX 为正 → 对象在右侧 → pan 接近 +1
  // deltaX 为负 → 对象在左侧 → pan 接近 -1
  const pan = Math.max(-1, Math.min(1, deltaX / maxDistance))

  return pan
}

// 示例：
// 玩家在 x=100，敌机在 x=300，最远距离 500
calculatePan(300, 100, 500)  // → 0.4（偏右）
// 玩家在 x=100，敌机在 x=-50，最远距离 500
calculatePan(-50, 100, 500)  // → -0.3（偏左）</code></pre>

      <h3>非线性映射——更有"感觉"的声像曲线</h3>
      <p>
        线性映射的问题是：中间区域太敏感，边缘反而迟钝。实际使用中更推荐<strong>平方根映射</strong>，让中间区域"变宽"，两端变陡：
      </p>

      <pre><code>// 非线性声像——放大中央区域的定位精度
function calculatePanNonLinear(deltaX: number, maxDistance: number): number {
  const linear = deltaX / maxDistance  // 线性比例 [-1, 1]

  // 保留符号，对绝对值取平方根（拉伸中间区域）
  const sign = Math.sign(linear)
  const curved = Math.sqrt(Math.abs(linear))

  return sign * curved  // 仍然在 [-1, 1] 范围内
}

// 对比：
// 线性：offset=5%  → pan=0.05（几乎听不出偏移）
// 非线：offset=5%  → pan=0.22（明显偏右）</code></pre>

      <div class="tip-box">
        <strong>前端类比：CSS transform: translateX：</strong>空间声像就像用
        <code>transform: translateX()</code> 在视觉上把元素向左/向右移动。
        一个敌机在玩家左侧 → 它的爆炸声"从左侧传来" → 玩家本能地向左看。
        这是音频和视觉配合营造沉浸感的最佳例子——你看到敌机在左边，听到它的射击声也在左边，大脑完全没有"违和感"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📉" title="距离衰减：让'远近'听得出来">
      <p>
        如果所有爆炸音量都一样，玩家就分不清"远处有人被炸了"还是"自己被贴脸炸了"。
        距离衰减让声音有了<strong>立体深度</strong>——而且它不仅影响音量，还影响<strong>音色</strong>：
      </p>

      <h3>距离衰减的三重效果</h3>
      <table>
        <thead>
          <tr>
            <th>效果</th>
            <th>近距离</th>
            <th>中距离</th>
            <th>远距离</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>音量</strong></td>
            <td>100%（震耳）</td>
            <td>40-70%</td>
            <td>10-30%（勉强听见）</td>
          </tr>
          <tr>
            <td><strong>低通滤波</strong></td>
            <td>全频通过（明亮、清晰）</td>
            <td>轻微衰减（高频开始变闷）</td>
            <td>明显闷声（像隔了一堵墙）</td>
          </tr>
          <tr>
            <td><strong>混响感</strong></td>
            <td>干声为主（直达声占主导）</td>
            <td>干湿混合</td>
            <td>混响为主（间接反射音占主导）</td>
          </tr>
        </tbody>
      </table>

      <h3>距离衰减公式</h3>
      <pre><code>// 倒数衰减模型（自然且平滑）
function calculateVolume(
  distance: number,      // 声源和听者的距离
  refDistance: number,   // 参考距离（小声源取短，爆炸取长）
  maxDistance: number,   // 最大可听距离
  rolloffFactor = 1      // 衰减系数（1 = 自然，2 = 更快衰减）
): number {
  if (distance <= 0) return 1                        // 重合时满音量
  if (distance >= maxDistance) return 0              // 超出范围静音

  // 核心公式：volume = 1 / (1 + rolloffFactor * (distance/refDistance))
  const normalizedDist = (distance - refDistance) / (maxDistance - refDistance)
  const clampedDist = Math.max(0, normalizedDist)

  return 1 / (1 + rolloffFactor * clampedDist * 10)
}

// 使用示例：
calculateVolume(50, 20, 300)   // distance=50, ref=20, max=300 → 约 0.33
calculateVolume(10, 20, 300)   // distance=10, ref=20, max=300 → 约 0.83（近）
calculateVolume(290, 20, 300)   // distance=290, ref=20, max=300 → 约 0.04（极远）</code></pre>

      <div class="tip-box">
        <strong>参考距离的实际意义：</strong>短小清脆的音效（UI 点击、子弹壳落地）用小的
        <code>refDistance</code>（10-20 单位），因为它们本身就不该传很远。爆炸、引擎轰鸣用大的
        <code>refDistance</code>（80-150 单位），让远距离也能感知到。这就像 CSS 的
        <code>box-shadow</code>——小元素的阴影扩散半径小，大元素的阴影扩散半径大。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎛️" title="在 Cocos 中启用 AudioSource 3D 模式">
      <p>Cocos Creator 的 <strong>AudioSource</strong> 组件内置了 3D 音频支持，配置方式如下：</p>

      <h3>AudioSource 3D 关键属性</h3>
      <table>
        <thead>
          <tr>
            <th>属性</th>
            <th>含义</th>
            <th>推荐值（2D 飞机大战）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Spatial Blend</strong></td>
            <td>0 = 纯 2D（无空间效果），1 = 纯 3D（完全空间化）</td>
            <td>SFX 设 <strong>1</strong>，BGM 设 <strong>0</strong></td>
          </tr>
          <tr>
            <td><strong>Reference Distance</strong></td>
            <td>在这个距离内，音量保持 100%</td>
            <td>20-50（飞机大战的"贴脸"范围）</td>
          </tr>
          <tr>
            <td><strong>Max Distance</strong></td>
            <td>超出此距离后音量为 0</td>
            <td>300-500（屏幕宽度约 600-800 单位）</td>
          </tr>
          <tr>
            <td><strong>Rolloff Mode</strong></td>
            <td>衰减曲线：Logarithmic（对数）/ Linear（线性）/ Custom（自定义）</td>
            <td><strong>Logarithmic</strong>——听感最自然</td>
          </tr>
          <tr>
            <td><strong>Play On Awake</strong></td>
            <td>节点激活时自动播放</td>
            <td><strong>false</strong>——音效应该由代码控制播放时机</td>
          </tr>
          <tr>
            <td><strong>Loop</strong></td>
            <td>是否循环</td>
            <td>SFX 设 <strong>false</strong>，BGM 设 <strong>true</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>配置节点的音频监听器</h3>
      <p>
        要让 3D 音频生效，场景中必须有一个<strong>音频监听器（Audio Listener）</strong>——它代表"玩家的耳朵"。
        通常挂载在玩家角色节点或摄像机节点上：
      </p>

      <pre><code>// 在 Camera 或 Player 节点的 onLoad 中
import { AudioListener, director } from 'cc'

// 只需一个 AudioListener——它就是"玩家的耳朵"
// 通常挂在 Camera 节点上（跟随玩家移动）
const listener = this.node.addComponent(AudioListener)

// Cocos 中每个场景只能有一个 active 的 AudioListener
// 场景加载时会自动激活摄像机上的 AudioListener</code></pre>

      <div class="warn-box">
        <strong>2D 游戏的注意事项：</strong>即使你的游戏是 2D 俯视图（如飞机大战），Cocos 的 3D
        音频仍基于节点的<strong>世界坐标</strong>。如果你的游戏坐标 X/Y 轴和 3D 空间不同（如
        X→水平、Y→垂直），需要确保<strong>AudioListener 和发声节点在同一坐标空间中</strong>。
        最简单的做法是把游戏对象的 X 坐标直接当作"音频水平轴"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="💻" title="代码实现：SpatialAudioManager">
      <p>
        虽然有 Cocos 内置的 3D AudioSource，但自己写一个 <strong>SpatialAudioManager</strong>
        可以更精细地控制声像和衰减逻辑（尤其是在 2D 游戏中你只需要 X 轴的声像）：
      </p>

      <pre><code>// SpatialAudioManager.ts —— 基于游戏坐标的 2D 空间音频管理
import { AudioClip, AudioSource, Node, Vec3, resources } from 'cc'

interface SpatialSFX {
  source: AudioSource       // 绑定的 AudioSource
  worldNode: Node           // 发声对象的节点（每帧读取位置）
  refDistance: number       // 参考距离
  maxDistance: number       // 最大可听距离
}

class SpatialAudioManager {
  private static _instance: SpatialAudioManager
  static get instance() {
    if (!this._instance) this._instance = new SpatialAudioManager()
    return this._instance
  }

  private _listenerNode!: Node           // 监听者节点（玩家 / 摄像机）
  private _activeSounds: SpatialSFX[] = []  // 当前在播放的空间音效列表

  /** 设置监听者（玩家的"耳朵"） */
  setListener(node: Node) {
    this._listenerNode = node
  }

  /** 播放一个空间音效——将其加入每帧更新列表 */
  playSpatial(
    clipPath: string,
    worldNode: Node,        // 发声对象的节点引用
    refDistance = 30,
    maxDistance = 400
  ) {
    resources.load(clipPath, AudioClip, (err, clip) => {
      if (err) return

      const source = worldNode.addComponent(AudioSource)
      source.clip = clip
      source.loop = false
      source.playOnAwake = false
      source.playOneShot(clip, 1)

      this._activeSounds.push({ source, worldNode, refDistance, maxDistance })
    })
  }

  /** 每帧调用——更新所有空间音效的 Pan 和 Volume */
  update() {
    if (!this._listenerNode) return

    const listenerPos = this._listenerNode.worldPosition

    for (let i = this._activeSounds.length - 1; i >= 0; i--) {
      const sfx = this._activeSounds[i]
      const { source, worldNode, refDistance, maxDistance } = sfx

      // 如果 AudioSource 已经播完了（clip 变为 null），从列表中移除
      if (!source.playing) {
        this._activeSounds.splice(i, 1)
        continue
      }

      const soundPos = worldNode.worldPosition

      // ---- 1. 声像计算（仅 X 轴） ----
      const deltaX = soundPos.x - listenerPos.x
      const pan = Math.max(-1, Math.min(1, deltaX / maxDistance))
      // 立体声平衡：pan = -1 时左声道 100%、右声道 0%
      // Cocos AudioSource 上没有直接的 pan 属性（Web Audio API 的 pan 节点）
      // 这里用 volume 的左右分配来模拟——实际项目中可能需要操作 AudioContext

      // ---- 2. 距离衰减 ----
      const dx = soundPos.x - listenerPos.x
      const dy = soundPos.y - listenerPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > maxDistance) {
        source.volume = 0
        continue
      }

      // 倒数衰减
      const normalizedDist = (distance - refDistance) / (maxDistance - refDistance)
      const clampedDist = Math.max(0, normalizedDist)
      const volume = 1 / (1 + clampedDist * 8)

      source.volume = volume

      // ---- 3. 低通滤波模拟（远距离变闷） ----
      // Cocos 没有内置的低通滤波参数，但可以用 AudioContext 的
      // BiquadFilterNode 实现。这里保留接口注释：
      // filterNode.frequency.value = 22000 - (distance / maxDistance) * 20000
    }
  }

  /** 立即停止所有空间音效（切换场景时调用） */
  stopAll() {
    for (const sfx of this._activeSounds) {
      sfx.source.stop()
    }
    this._activeSounds.length = 0
  }
}

export const spatialAudio = SpatialAudioManager.instance</code></pre>

      <h3>在游戏逻辑中使用</h3>
      <pre><code>// BattleScene.ts —— 每帧更新空间音频
import { spatialAudio } from './SpatialAudioManager'

onLoad() {
  // 设置监听者——玩家飞机节点
  spatialAudio.setListener(this.playerNode)
}

// 敌机死亡时——在敌机位置播放爆炸音效
onEnemyDeath(enemyNode: Node) {
  spatialAudio.playSpatial('sfx/explosion_small', enemyNode, 30, 400)
}

// 每帧都要调用
update(dt: number) {
  spatialAudio.update()
}</code></pre>

      <div class="tip-box">
        <strong>Cocos 的 StereoPannerNode：</strong>Cocos 的 AudioSource 组件基于 Web Audio
        API。如果你想在 Cocos 中精确控制立体声平衡（Pan），可以通过 AudioEngine 获取底层的
        <code>AudioContext</code> 并创建一个 <code>StereoPannerNode</code> 连接到
        AudioSource。但大部分 2D 游戏使用 Cocos 内置的 3D AudioSource 配置
        <code>spatialBlend = 1</code> 即可，不需要手动操作 Web Audio API。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎧" title="耳机 vs 扬声器：空间音频的'双面性'">
      <p>空间音频在不同播放设备上的体验差异巨大。理解这些差异才能避免"开发时感觉超棒，玩家玩起来没区别"：</p>

      <table>
        <thead>
          <tr>
            <th>方面</th>
            <th>耳机</th>
            <th>手机/平板扬声器</th>
            <th>桌面扬声器</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>声像区分度</strong></td>
            <td>非常高——左右完全隔离</td>
            <td>极低——扬声器靠得很近，左右串扰严重</td>
            <td>中等——取决于扬声器间距</td>
          </tr>
          <tr>
            <td><strong>"左边爆炸"的听感</strong></td>
            <td>清晰地在左耳响起</td>
            <td>听起来还是"从手机里出来的"，但有轻微方向感</td>
            <td>可分辨左右，但不像耳机那样精确</td>
          </tr>
          <tr>
            <td><strong>空间音频的必要性</strong></td>
            <td><strong>强烈推荐</strong>——耳机用户占游戏玩家的大多数</td>
            <td>效果打折——但距离衰减仍然有效（远处=小声）</td>
            <td>有效但精度不如耳机</td>
          </tr>
          <tr>
            <td><strong>立体声合并问题</strong></td>
            <td>不存在</td>
            <td>双声道被物理合并为单声道——极端的声像值（±1）会导致一个声道几乎听不到</td>
            <td>通常保留立体声分离</td>
          </tr>
        </tbody>
      </table>

      <h3>扬声器安全的声像策略</h3>
      <p>
        为了同时保障耳机和扬声器玩家的体验，推荐<strong>限制声像范围</strong>：不要把声像推到极值
        ±1，而是限制在 <strong>[-0.7, 0.7]</strong> 之间。这样即使扬声器合并了左右声道，也不会出现"一侧完全无声"：
      </p>

      <pre><code>// 扬声器安全声像——限制在 [-0.7, 0.7]
function safePan(rawPan: number): number {
  return Math.max(-0.7, Math.min(0.7, rawPan))
}

// 耳机下的 -1 到 +1 可以完全利用，但为了兼容性，所有设备统一限到 0.7</code></pre>

      <div class="tip-box">
        <strong>前端类比：渐进增强：</strong>空间音频的"耳机版"和"扬声器版"就像 CSS
        的<strong>渐进增强</strong>——先保证基础体验在所有设备上可用（距离衰减 = 听着不违和），然后为支持立体声的设备提供更强的体验（精确声像定位）。
        不要依赖"玩家肯定戴耳机"这个假设——很多人在通勤时开扬声器玩。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔨" title="动手练习：为飞机大战添加空间音频">
      <ol>
        <li>在场景中确定一个节点作为监听者（通常是玩家飞机或摄像机节点）</li>
        <li>创建 <code>SpatialAudioManager.ts</code> 并挂载到场景根节点</li>
        <li>在玩家射击逻辑中，调用 <code>spatialAudio.playSpatial('sfx/player_shoot', this.node)</code></li>
        <li>在敌机死亡时，在敌机节点上播放空间爆炸音效——左右不同位置的敌机爆炸应该听起来方向不同</li>
        <li>测试：让一架敌机从屏幕左侧飞到右侧——它的引擎声应该从左声道"横移"到右声道</li>
        <li>测试：同一位置爆炸 vs 远处爆炸——远处应该小声、发闷</li>
        <li>分别用耳机和手机扬声器测试——确保两种设备上空间效果都可用（不要有"一个声道完全没声"的情况）</li>
        <li>确认 BGM 没有受到空间音频影响（BGM 应该是纯立体声、居中、无衰减）</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>闭上眼玩一局——你能仅靠声音判断敌机是从左边还是右边出现的吗？你能听出"远处那个爆炸不是我附近的"吗？如果这两个问题的答案都是"是"，你的空间音频就成功了。
      </div>

      <div class="warn-box">
        <strong>性能提示：</strong>每帧遍历所有在播的空间音效并更新位置——如果同时有 20+ 个音效，每帧的
        <code>update()</code> 开销会变高。对于短音效（0.1-0.3 秒的射击声），播完就自动从列表移除，影响不大。
        但如果有<strong>长时间循环的空间音效</strong>（如引擎声），建议限制同时存在的数量（如最多 8 个），超出后按距离排序、丢弃最远的。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>空间音频的两个核心维度是什么？各自用什么参数控制？</li>
        <li>为什么空间音频只适用于 SFX 而不适用于 BGM？</li>
        <li>线性声像映射和平方根映射有什么区别？什么时候用非线性？</li>
        <li>距离衰减的三重效果是什么？（音量、低通滤波、混响）</li>
        <li>Cocos AudioSource 的 Spatial Blend 属性是什么意思？SFX 和 BGM 分别设多少？</li>
        <li>AudioListener 的作用是什么？一个场景最多有几个激活的 AudioListener？</li>
        <li>为什么在扬声器上要限制声像范围（如 [-0.7, 0.7]）？</li>
        <li>长时间循环的空间音效（如引擎声）在性能上有什么隐患？怎么限制？</li>
        <li>你的 SpatialAudioManager 的 update() 每帧做什么？如何避免遍历已停止的音效？</li>
      </ul>
    </ConceptBlock>
  </AudioPhaseLayout>
</template>
