<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="23" title="Spine 骨骼动画" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解 <strong>Spine 骨骼动画</strong>和传统帧动画（Sprite Sheet）的本质区别——为什么业界都用 Spine</li>
        <li>完成 Spine 资源的<strong>导入流程</strong>：.json/.skel + .atlas + .png → Cocos 可用资源</li>
        <li>在运行时<strong>控制动画播放</strong>——播放、暂停、切换动画、混合过渡（Crossfade）</li>
        <li>实现<strong>换肤（Skin）</strong>和<strong>附件替换（Attachment）</strong>——同一角色换装备/武器</li>
        <li>封装一个 <strong>SpineAnimController</strong>——把游戏状态（Idle、Run、Attack）自动映射到对应的 Spine 动画</li>
        <li>做出正确的技术选型——什么时候用 Spine、什么时候用帧动画、什么时候用粒子特效</li>
        <li>理解 Spine 的前端类比——它就是游戏界的 <strong>Lottie 动画</strong>或 <strong>CSS @keyframes</strong></li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🦴" title='Spine 是什么——不只是"另一个动画格式"'>
      <p>
        <strong>Spine</strong> 是 2D 游戏动画的行业标准工具。它的核心思想：不存每一帧的完整图片，而是存储<strong>骨骼（Bones）的结构和运动数据</strong>。运行时由引擎根据骨骼数据实时"算"出每一帧的画面——而不是像 GIF 那样逐帧播放一张张图片。
      </p>

      <h3>Spine vs 帧动画（Sprite Sheet）核心对比</h3>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>Sprite Sheet（帧动画）</th>
            <th>Spine（骨骼动画）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>工作原理</td>
            <td>存 30 张完整图片，依次播放</td>
            <td>存 1 套骨骼 + 1 张部件图，实时计算</td>
          </tr>
          <tr>
            <td>文件大小</td>
            <td>非常大——每个动作 N 帧 x 每帧 M KB</td>
            <td><strong>极小</strong>——只存骨骼数据和部件图</td>
          </tr>
          <tr>
            <td>动画平滑度</td>
            <td>取决于帧数——30fps 动画需要 30 张图</td>
            <td><strong>任意帧率</strong>——骨骼在帧间插值，60fps 天然支持</td>
          </tr>
          <tr>
            <td>动画混合</td>
            <td>很难——两套动画不能同时播放</td>
            <td><strong>天然支持</strong>——上半身射击 + 下半身跑步同时进行</td>
          </tr>
          <tr>
            <td>换装/换武器</td>
            <td>需要重新画所有帧——工作量爆炸</td>
            <td><strong>替换部件图</strong>——同一骨骼换不同附件</td>
          </tr>
          <tr>
            <td>可视化编辑</td>
            <td>逐帧画——Photoshop/Aseprite</td>
            <td><strong>Spine 编辑器</strong>——拖动骨骼设置关键帧</td>
          </tr>
          <tr>
            <td>前端类比</td>
            <td><strong>GIF 动图</strong>——存每帧像素，文件大</td>
            <td><strong>Lottie / Rive</strong>——存矢量+动画数据，实时渲染</td>
          </tr>
        </tbody>
      </table>

      <h3>Spine 编辑器工作流程</h3>
      <ol>
        <li><strong>Setup 模式：</strong>导入角色各部件图（头、身体、手臂、腿...），创建骨骼，将图片绑定到骨骼上（蒙皮/Skinning）</li>
        <li><strong>Animate 模式：</strong>在时间轴上为骨骼设置关键帧（位置、旋转、缩放），Spine 自动生成中间帧</li>
        <li><strong>导出：</strong>生成 <code>.json</code>（或二进制 <code>.skel</code>）+ <code>.atlas</code> + <code>.png</code> 三个文件</li>
      </ol>

      <div class="tip-box">
        <strong>前端类比：</strong>Spine 之于游戏动画，就像 <strong>Lottie</strong> 之于 Web 动画。一个 Lottie JSON 文件只有几 KB，但可以在网页上渲染出流畅的矢量动画——它存的不是每一帧的像素，而是"第 0 秒这个圆在 (0,0)，第 1 秒移动到 (100,0)"这样的关键帧数据。Spine 做的事情完全一样，只不过把"圆"换成了"角色的骨骼"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📦" title="Spine 资源导入——三个文件一个都不能少">
      <p>
        Spine 导出时会生成三个文件，它们各自承担不同的职责：
      </p>

      <h3>导入文件清单</h3>
      <table>
        <thead>
          <tr>
            <th>文件</th>
            <th>格式</th>
            <th>内容</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>.json / .skel</strong></td>
            <td>JSON 或二进制</td>
            <td>骨骼结构、动画数据、皮肤定义、插槽信息</td>
            <td><strong>HTML 结构</strong>——定义元素层级和关系</td>
          </tr>
          <tr>
            <td><strong>.atlas</strong></td>
            <td>文本</td>
            <td>纹理图集描述——每张小图在大图上的位置和大小</td>
            <td><strong>CSS Sprite 坐标文件</strong>——background-position 映射</td>
          </tr>
          <tr>
            <td><strong>.png</strong></td>
            <td>图片</td>
            <td>所有部件的纹理图集——一张大图包含所有部件</td>
            <td><strong>Sprite Sheet 图片</strong>——所有小图标拼在一张大图上</td>
          </tr>
        </tbody>
      </table>

      <h3>导入步骤</h3>
      <ol>
        <li>将 .json、.atlas、.png 三个文件放入 Cocos 项目的 <code>assets/</code> 目录</li>
        <li>Cocos 自动识别 .json 文件，生成 <strong>SkeletonData</strong> 资源</li>
        <li>将 SkeletonData 拖入场景中的节点（需挂载 <strong>Spine.Skeleton</strong> 组件）</li>
        <li>在属性检查器中设置 Animation（默认动画）、Skin（默认皮肤）、Loop（是否循环）</li>
      </ol>

      <pre><code>// 确保你的节点上已挂载 sp.Skeleton 组件
// 编辑器操作：选中节点 → 添加组件 → Spine → Skeleton
// 然后将 SkeletonData 资源拖入组件的 Skeleton Data 属性栏</code></pre>

      <div class="tip-box">
        <strong>文件格式选择：</strong>导出时可以选择 <code>.json</code>（文本，可读性好，方便调试）或 <code>.skel</code>（二进制，文件更小，加载更快）。开发阶段用 .json 方便排查问题；上线时切换为 .skel 优化首包大小。这和前端中<strong>开发时用未压缩的 JS，生产环境用 minified JS</strong> 是一样的策略。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎬" title="运行时动画控制——播放、混合、切换">
      <p>
        Spine 动画的运行时控制非常像<strong>视频播放器 API</strong>——有 play、pause、loop 等熟悉的操作。而且 Spine 支持<strong>多动画同时混合</strong>，这是帧动画做不到的。
      </p>

      <h3>基础操作</h3>
      <pre><code>import { _decorator, Component, sp } from 'cc'

export class SpinePlayer extends Component {
  private _skeleton: sp.Skeleton = null

  onLoad() {
    this._skeleton = this.node.getComponent(sp.Skeleton)
  }

  /** 播放指定动画 */
  playAnim(name: string, loop: boolean = true) {
    this._skeleton.setAnimation(0, name, loop)
    // 参数: (trackIndex, animName, loop)
    // trackIndex: 动画轨道——0 是主轨道，1/2/... 是额外轨道
  }

  /** 添加动画到队列——当前动画播完后自动播下一个 */
  queueAnim(name: string, loop: boolean = true) {
    this._skeleton.addAnimation(0, name, loop, 0)
    // 参数: (trackIndex, animName, loop, delay)
  }

  /** 在两个动画之间平滑过渡（Crossfade） */
  crossFadeTo(name: string, duration: number = 0.3) {
    this._skeleton.setAnimation(0, name, true)
    // Spine 内部自动处理淡入淡出
    // 或者使用 clearTrack + 新动画实现切换
  }

  /** 暂停/恢复 */
  pause() {
    this._skeleton.paused = true
  }

  resume() {
    this._skeleton.paused = false
  }

  /** 设置播放速度 */
  setTimeScale(scale: number) {
    this._skeleton.timeScale = scale
    // 2.0 = 两倍速, 0.5 = 慢动作, 1.0 = 正常
  }

  /** 获取当前动画状态 */
  getCurrentAnimation(): string | null {
    return this._skeleton.animation
  }

  /** 监听动画完成 */
  onAnimComplete(callback: () => void) {
    this._skeleton.setCompleteListener((trackEntry) => {
      console.log(`动画结束: ${trackEntry.animation.name}`)
      callback()
    })
  }
}</code></pre>

      <h3>Track 轨道——多动画同时播放的秘诀</h3>
      <table>
        <thead>
          <tr>
            <th>Track</th>
            <th>典型用途</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Track 0（主轨道）</td>
            <td>全身动画——Idle、Run、Jump</td>
            <td>主 CSS animation</td>
          </tr>
          <tr>
            <td>Track 1</td>
            <td>上半身动画——攻击、射击、挥手（不影响下半身跑步）</td>
            <td>叠加的 CSS animation——子元素的独立动画</td>
          </tr>
          <tr>
            <td>Track 2</td>
            <td>面部表情——眨眼、张嘴</td>
            <td>更细粒度的叠加</td>
          </tr>
        </tbody>
      </table>

      <pre><code>// Track 实战：角色边走边射击
// 下半身在 Track 0 做跑步动画，上半身在 Track 1 做射击动画
this._skeleton.setAnimation(0, 'run', true)      // Track 0: 下半身跑步
this._skeleton.setAnimation(1, 'shoot', false)   // Track 1: 上半身射击（一次性）

// 如果你设置 Track 1 为空，则下半身不受影响
this._skeleton.clearTrack(1)  // 清除射击通道——角色回到纯跑步状态</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="👗" title="换肤与附件替换——改变角色的外观">
      <p>
        换肤（Skin）和附件替换（Attachment）是 Spine 最强大的功能之一。它们让你可以用<strong>一套骨骼 + 多套外观</strong>实现角色的装备系统、服装系统、武器系统。
      </p>

      <h3>Skin（皮肤）——整套外观切换</h3>
      <p>
        一个 Skin 是一组<strong>附件的集合</strong>——同一角色可以有"战士皮肤"（重甲头部+重甲身体+巨剑）和"法师皮肤"（兜帽头部+长袍身体+法杖）。切换 Skin 就是一次性切换所有部件的显示。
      </p>

      <h3>Attachment（附件）——单个部件替换</h3>
      <p>
        附件是更细粒度的控制——你可以在运行时把角色手中的"铁剑"替换成"火焰剑"，而不改变身体和头部。这就像前端中通过 JS 修改 <code>&lt;img&gt;</code> 的 <code>src</code> 属性，只替换图片内容，不改变元素的布局和层级。
      </p>

      <pre><code>// SpineEquipment.ts —— 换肤与换装
export class SpineEquipment extends Component {
  private _skeleton: sp.Skeleton = null

  onLoad() {
    this._skeleton = this.node.getComponent(sp.Skeleton)
  }

  /** 切换整套皮肤 */
  setSkin(skinName: string) {
    this._skeleton.setSkin(skinName)
    // 例如: setSkin('warrior') → 战士外观
    //       setSkin('mage')    → 法师外观
  }

  /** 替换单个附件——换武器 */
  setAttachment(slotName: string, attachmentName: string) {
    const skeletonData = this._skeleton.skeletonData!
    this._skeleton.setAttachment(slotName, attachmentName)

    // 例如: setAttachment('weapon_hand', 'sword_fire')    → 装备火焰剑
    //       setAttachment('weapon_hand', 'sword_ice')     → 装备寒冰剑
    //       setAttachment('weapon_hand', null)            → 卸下武器
  }

  /** 根据装备数据批量换装 */
  equipItems(items: Array&lt;{ slot: string; attachment: string }&gt;) {
    items.forEach(item => {
      this._skeleton.setAttachment(item.slot, item.attachment)
    })
  }

  /** 获取所有可用皮肤列表 */
  getAvailableSkins(): string[] {
    const skins = this._skeleton.skeletonData.skins
    return skins.map(skin => skin.name)
  }

  /** 获取指定插槽的所有可用附件 */
  getAttachmentsForSlot(slotName: string): string[] {
    const slotIndex = this._skeleton.findSlotIndex(slotName)
    if (slotIndex === -1) return []

    const skin = this._skeleton.skeletonData.defaultSkin
    if (!skin) return []

    return skin.getAttachmentsForSlot(slotIndex, [])
      .map(att => att.name)
  }
}</code></pre>

      <div class="tip-box">
        <strong>设计建议：</strong>在 Spine 编辑器中，把"可能被替换"的部件放在<strong>独立的 Slot（插槽）</strong>中。例如：武器一个 Slot、头盔一个 Slot、披风一个 Slot。这样运行时替换附件时不会影响其他 Slot 的显示。不要把武器和身体放在同一个 Slot 里——换武器会清掉身体，那就灾难了。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎮" title="SpineAnimController——状态机驱动动画">
      <p>
        在实际项目中，角色的动画由<strong>游戏状态</strong>（Idle、Run、Attack、Hit、Die）决定。你需要一个中间层来把状态映射到动画名称上——这就是 <strong>SpineAnimController</strong>。
      </p>

      <pre><code>// SpineAnimController.ts —— 状态→动画映射控制器
export enum CharacterState {
  IDLE = 'idle',
  RUN = 'run',
  JUMP = 'jump',
  ATTACK = 'attack',
  HIT = 'hit',
  DIE = 'die',
}

export class SpineAnimController extends Component {
  @property(sp.Skeleton)
  skeleton: sp.Skeleton = null

  private _currentState: CharacterState = CharacterState.IDLE
  private _stateMap: Record&lt;CharacterState, string&gt; = {
    [CharacterState.IDLE]:   'idle',
    [CharacterState.RUN]:    'run',
    [CharacterState.JUMP]:   'jump',
    [CharacterState.ATTACK]: 'attack',
    [CharacterState.HIT]:    'hit',
    [CharacterState.DIE]:    'die',
  }

  /** 设置动画状态机映射——如果你的动画文件命名不一致 */
  setStateMap(map: Partial&lt;Record&lt;CharacterState, string&gt;&gt;) {
    Object.assign(this._stateMap, map)
  }

  /** 切换到指定状态 */
  setState(state: CharacterState, crossFadeDuration: number = 0.15) {
    if (state === this._currentState) return  // 同一状态不重复播放

    const animName = this._stateMap[state]
    if (!animName) {
      console.warn(`[SpineAnimController] 未映射的状态: ${state}`)
      return
    }

    this._currentState = state

    // 特殊处理：Attack 可选不循环
    const loop = state !== CharacterState.ATTACK && state !== CharacterState.DIE
    this.skeleton.setAnimation(0, animName, loop)

    // 如果是一次性动画（Attack/Hit），播完后回到 Idle
    if (!loop) {
      this.skeleton.setCompleteListener((trackEntry) => {
        if (trackEntry.animation.name === animName) {
          // 回到 Idle（除非已经是 Die——死了不能复活）
          if (state !== CharacterState.DIE) {
            this.setState(CharacterState.IDLE)
          }
        }
      })
    }
  }

  /** 播放一次性动画（不改变状态机——如表情变化） */
  playOneShot(animName: string, track: number = 1) {
    this.skeleton.setAnimation(track, animName, false)
    this.skeleton.setCompleteListener((trackEntry) => {
      if (trackEntry.animation.name === animName) {
        this.skeleton.clearTrack(track)
      }
    })
  }

  /** 获取当前状态 */
  get currentState(): CharacterState {
    return this._currentState
  }
}

// ===== 使用示例 =====
// const animCtrl = characterNode.getComponent(SpineAnimController)
//
// // 角色移动时
// if (isMoving) {
//   animCtrl.setState(CharacterState.RUN)
// } else {
//   animCtrl.setState(CharacterState.IDLE)
// }
//
// // 攻击时
// animCtrl.setState(CharacterState.ATTACK)
//
// // 受伤时（Track 2 叠加红色闪烁特效）
// animCtrl.playOneShot('hit_flash', 2)</code></pre>

      <div class="tip-box">
        <strong>前端类比：</strong>SpineAnimController 就是游戏中的 <strong>React State Machine / Vuex Store</strong>——状态（State）是单一数据源，视图（动画）自动根据状态切换。当 <code>character.state = 'run'</code> 时，动画自动切换为跑步——这和 <code>v-if="state === 'run'"</code> 切换不同组件是同一个思路。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚖️" title="技术选型——什么时候用 Spine？">
      <p>
        不是所有动画都需要 Spine。选择合适的动画技术，就像前端中选择合适的渲染方式（Canvas vs SVG vs DOM）一样重要。
      </p>

      <h3>动画技术对比</h3>
      <table>
        <thead>
          <tr>
            <th>技术</th>
            <th>适合场景</th>
            <th>不适合场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Spine 骨骼动画</strong></td>
            <td>角色动画（移动、攻击）、换装系统、需要动画混合的场景</td>
            <td>粒子爆炸、简单 UI 过渡、小尺寸像素角色（2-3 帧够用）</td>
          </tr>
          <tr>
            <td><strong>帧动画（Sprite Sheet）</strong></td>
            <td>2D 特效（火焰、雷电）、像素游戏角色、UI 微动效（按钮呼吸）</td>
            <td>大型角色（换装需求）、需要平滑混合的多状态角色</td>
          </tr>
          <tr>
            <td><strong>粒子系统</strong></td>
            <td>爆炸、烟雾、魔法特效、天气（雨雪）、环境氛围</td>
            <td>角色动画（粒子组合不出角色形态）、精确控制的关键帧动画</td>
          </tr>
          <tr>
            <td><strong>Cocos Tween / 动画系统</strong></td>
            <td>UI 动画（按钮弹入弹出、面板滑入）、简单的节点移动/缩放/淡入淡出</td>
            <td>复杂的角色形变动画、需要骨骼的动画</td>
          </tr>
        </tbody>
      </table>

      <h3>决策流程图</h3>
      <ol>
        <li><strong>这个动画的主角是"角色"</strong>（需要换装、多状态混合、流畅变形）→ <strong>Spine</strong></li>
        <li><strong>需要大量粒子效果</strong>（爆炸、火光、烟雾）→ <strong>粒子系统</strong></li>
        <li><strong>简单的 UI 移动/缩放/淡入淡出</strong> → <strong>Cocos Tween</strong></li>
        <li><strong>像素风小角色</strong>（16x16，只有 2-4 帧）→ <strong>帧动画</strong>（Spine 是杀鸡用牛刀）</li>
        <li><strong>2D 技能特效</strong>（挥剑光弧、魔法阵展开）→ <strong>帧动画</strong>（美术在 AE 中做好导出序列帧即可）</li>
      </ol>

      <div class="warn-box">
        <strong>过度使用 Spine 的问题：</strong>Spine 骨骼动画计算需要 CPU 时间。如果你的场景中有 <strong>100 个 Spine 角色</strong>同时播放动画，即使每个角色只有 10 根骨骼，CPU 也需要每帧计算 1000 根骨骼的变换矩阵。对于同屏大量单位的场景（如塔防、弹幕射击），考虑：(1) 远处的单位用帧动画降级；(2) 不可见的单位暂停动画；(3) 使用 <code>skeleton.paused = true</code> 暂停视野外角色的动画计算。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: Spine 动画播放后角色"消失了"？</h3>
      <p>
        最常见原因是：(1) .atlas 文件中引用的图片路径不匹配——检查 .atlas 中 png 文件名是否和实际一致；(2) Spine 版本不兼容——Cocos 的 Spine 插件支持的 Spine 版本有限（通常支持 3.x 版本），如果你用 Spine 4.x 导出可能需要降级或升级 Cocos 插件；(3) Premultiplied Alpha（预乘 Alpha）设置不匹配——在 Spine 导出时和 Cocos 导入时都要检查这个选项。
      </p>

      <h3>Q2: 动画混合（Crossfade）看起来不自然？</h3>
      <p>
        在 Spine 编辑器中，两个动画的<strong>过渡时间曲线</strong>可以在"动画图的过渡线"上设置。如果两个动画中骨骼的位置差异太大，短时间的线性过渡会产生"滑步"效果。解决方法：(1) 加长过渡时间；(2) 在 Spine 编辑器中设置过渡曲线为缓入缓出（Ease In-Out）；(3) 确保两个动画的<strong>起始姿态和结束姿态尽可能接近</strong>。
      </p>

      <h3>Q3: 换 Skin 后之前设置的 Attachment 不见了？</h3>
      <p>
        是的——<code>setSkin()</code> 会覆盖之前通过 <code>setAttachment()</code> 设置的所有槽位。正确的顺序是：<strong>先 setSkin，再 setAttachment</strong>。这就像 CSS 中 <code>class</code> 和 <code>style</code> 属性的层级关系——class 是基础样式（Skin），style 是覆盖样式（Attachment）。先设 class 再设 style，style 才能在 class 的基础上做个性化调整。
      </p>

      <h3>Q4: 同一个 Spine 角色可以同时展示多套装备吗？</h3>
      <p>
        可以——通过 Skin 组合。可以在 Spine 编辑器中创建<strong>组合 Skin</strong>（Composite Skin），将多个 Skin 合并为一个。或者在运行时通过多次 <code>setAttachment</code> 调用实现——为头盔 Slot、武器 Slot、披风 Slot 分别设置不同的附件。后者更灵活，适合运行时动态生成的装备组合。
      </p>

      <h3>Q5: Spine 动画播放时如何获取某个骨骼的世界坐标？</h3>
      <p>
        这是实现"手上发射子弹"、"头上冒伤害数字"等效果的关键。使用 <code>skeleton.findBone('bone_name')</code> 获取骨骼，再读取其 <code>worldX</code> / <code>worldY</code>——这就是该骨骼在场景中的实际位置。然后将子弹/文字节点放到这个坐标上。这类似于前端中通过 <code>getBoundingClientRect()</code> 获取元素在页面中的绝对位置。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>Spine 骨骼动画和帧动画（Sprite Sheet）的核心区别是什么？为什么 Spine 文件更小？</li>
        <li>Spine 的三个导出文件（.json、.atlas、.png）分别存放什么数据？</li>
        <li><code>.json</code> 和 <code>.skel</code> 格式有什么区别？什么时候用哪个？</li>
        <li>Cocos 中控制 Spine 动画播放的组件是什么？<code>setAnimation</code> 的三个参数分别是什么？</li>
        <li>Track（轨道）的作用是什么？如何实现"跑步的同时挥手"？</li>
        <li>Skin（皮肤）和 Attachment（附件）的区别是什么？各自的适用场景？</li>
        <li>为什么 <code>setSkin()</code> 会覆盖之前的 <code>setAttachment()</code>？正确的设置顺序是什么？</li>
        <li>SpineAnimController 的设计思路是什么？如何把游戏状态（Idle/Run/Attack）映射到动画名称？</li>
        <li>什么时候应该用 Spine？什么时候应该用帧动画？什么时候应该用粒子系统？</li>
        <li>如何获取 Spine 某个骨骼的世界坐标？这个功能用于什么场景？</li>
        <li>100 个 Spine 角色同屏时的性能瓶颈在哪里？如何优化？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
