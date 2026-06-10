<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="10" title="Cocos 音频集成（下）" duration="2 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>Phase 9 实现了"能出声"。这一节让声音"好听起来"——BGM 淡入淡出、音量分层控制、暂停恢复联动、音频池。这些是让音频从 Demo 级变成产品级的细节。</p></ConceptBlock>

    <ConceptBlock icon="🎚️" title="故事：切换 BGM 那一秒的尴尬">
      <p>玩过那种"场景一切 BGM 就硬切"的游戏吗？你在主菜单听着舒缓旋律，点击"开始游戏"——"啪"一声，BGM 突然换成了战斗音乐。没有过渡，没有任何预警。</p>
      <p>这种体验就像在 Vue 里用 <code>v-if</code> 切换两个完全没有 transition 包裹的组件——DOM 突然消失又突然出现。你一定会加一个 <code>&lt;Transition&gt;</code>，对吗？</p>
      <p>BGM 切换也需要"过渡动画"——音频层的 <code>&lt;Transition&gt;</code> 就是<strong>淡入淡出（Crossfade）</strong>：旧 BGM 在 1 秒内 volume 降到 0，新 BGM 在同样的 1 秒内 volume 从 0 升到目标值。两段"交叉"的瞬间，玩家听到的是一个平滑的声音过渡，而不是一刀切的跳变。</p>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="原理：三级音量模型 + 音频池 + 暂停恢复">
      <p><strong>1. 三级音量控制 —— 音频的 CSS 变量</strong></p>
      <p>不要把音量做成一个"全局大滑块"。游戏音量应该有三层控制：</p>
      <pre>实际音量 = masterVolume × categoryVolume × sourceVolume

masterVolume:  0.0 ~ 1.0 (玩家在设置里调的"总音量")
categoryVolume:
  - sfxVolume: 1.0 (SFX 通常 100%，反馈必须清晰)
  - bgmVolume: 0.6 (BGM 通常 60%，不能盖过 SFX)
sourceVolume:  单个 AudioSource 自身的音量调整</pre>
      <p>这就像 CSS 的 <strong>层叠（cascade）</strong>：<code>html { font-size: 16px }</code>（master）→ <code>.sidebar { font-size: 0.875em }</code>（category）→ <code>.sidebar__item { font-size: 0.9em }</code>（source）。最终的音量是这三个值的乘积。</p>

      <p><strong>2. BGM 淡入淡出 —— cc.tween 驱动 volume</strong></p>
      <p>Cocos 的 <code>cc.tween</code> 可以驱动任何对象的数字属性，包括 AudioSource 的 <code>volume</code>。实现一个 <code>switchBGM(newClip, duration)</code> 方法：</p>
      <pre>async switchBGM(newClip: AudioClip, duration: number = 1.0) {
  // 1) 淡出旧 BGM
  await new Promise((resolve: any) => {
    tween(this.bgmSource)
      .to(duration, { volume: 0 })
      .call(resolve)
      .start()
  })
  // 2) 切换 Clip
  this.bgmSource.clip = newClip
  this.bgmSource.play()
  // 3) 淡入新 BGM
  tween(this.bgmSource)
    .to(duration, { volume: this.categoryVolume.bgm })
    .start()
}</pre>
      <p>这和 Vue 的 <code>&lt;Transition&gt;</code> 组件逻辑完全一致：leave（旧 BGM 淡出）→ 替换内容 → enter（新 BGM 淡入）。</p>

      <p><strong>3. 音频池（Audio Pool）—— 把 GC 抖动降到零</strong></p>
      <p>Phase 9 的 <code>playSFX</code> 每次创建新 Node → 挂 AudioSource → 播完销毁。这个流程的问题是：创建和销毁 Node 会触发 <strong>GC（垃圾回收）</strong>。在游戏中，射击频率可能是每秒 3-5 次，GC 频繁触发会导致<strong>帧率抖动（frame spike）</strong>——音频卡顿。</p>
      <p>解决方案是<strong>音频池</strong>——和 Phase 15 的对象池完全相同的设计模式：</p>
      <ul>
        <li>预创建 N 个 AudioSource（比如 10 个）放在一个池（pool）里。</li>
        <li>需要播放音效时 → 从池里取一个空闲的 → 设置 clip → 播放。</li>
        <li>播完后 → 不销毁，回到池里等待下次使用。</li>
        <li>如果池里的全部忙 → 创建一个新的（扩容）或忽略（降级）。</li>
      </ul>
      <p>前端类比：这就是 Vue 的 <code>&lt;KeepAlive&gt;</code> 组件缓存——不销毁，只暂停，下次需要时直接复用。</p>

      <p><strong>4. 暂停/恢复 —— 联动 GameFSM</strong></p>
      <p>游戏暂停时（玩家按 Esc / 切到后台），所有声音必须暂停。恢复时从暂停点继续。这需要在 AudioManager 中维护一个<strong>活跃 AudioSource 列表</strong>，监听 GameFSM 的状态变化：</p>
      <pre>// PAUSE 状态
onGamePause() {
  this.activeSources.forEach(src => src.pause())
}
// PLAYING 状态
onGameResume() {
  this.activeSources.forEach(src => src.play())
}</pre>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：实现 BGM 淡入淡出 + 音量控制 + 音频池">
      <p>在 Phase 9 的 AudioManager 基础上扩展：</p>
      <ol>
        <li><strong>实现 switchBGM：</strong>写一个异步方法，用 cc.tween 驱动当前 bgmSource 的 volume 从当前值淡出到 0（1 秒），然后切换 bgmSource.clip 并重新 play()，再淡入到目标音量。测试：在主菜单和游戏中来回切换，BGM 过渡应该平滑。</li>
        <li><strong>实现三级音量：</strong>添加 <code>masterVolume</code>、<code>sfxVolume</code>、<code>bgmVolume</code> 三个属性。在 AudioManager 中维护它们的值（默认 master=1.0, sfx=1.0, bgm=0.6）。所有 AudioSource 的实际音量 = master × category × source。添加 <code>setMasterVolume(v)</code> 方法，调用时遍历所有活跃 AudioSource 立即更新音量。</li>
        <li><strong>实现音频池：</strong>创建一个固定大小的 AudioSource 数组（初始 8 个）。<code>playSFX</code> 时从池中取空闲的 → 如果全部忙就创建一个新的或忽略。播完后通过 EventType.ENDED 回调将 AudioSource 标记为空闲。测试：连射 10 发子弹 → 声音应该流畅，没有延迟。</li>
        <li><strong>暂停恢复联动：</strong>在 AudioManager 中维护活跃 AudioSource 列表（播放时加入，播完移除）。监听游戏 FSM 的 PAUSE/RESUME 事件（通过 EventBus 或直接检查 GameFSM 状态），在 pause 时全部 pause()，在 resume 时全部 play()。测试：游戏中按暂停 → 所有声音停止 → 恢复 → 声音继续。</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>音频池和对象池是同一个设计模式：</strong>在 game-dev 中，"池"（Pool）是最常见的性能优化模式。子弹、敌人、粒子——它们都是"频繁创建和销毁"的对象。每一次 <code>new</code> 都是一个 GC 事件。池的本质是：<strong>预分配 + 复用 = 零 GC</strong>。音频池的容量计算：你需要同时播放的最大音效数 × 1.5（冗余系数）。飞机大战同时最多可能有 3 发子弹音效 + 1 个爆炸 + 1 个受击 + 1 个拾取 = 6 个，所以池容量 = 8-10 是一个安全值。</li>
        <li><strong>tween 驱动音频的哲学：</strong>Cocos 的 <code>cc.tween</code> 本质上是一个<strong>属性插值引擎</strong>。它不关心你插值的是什么属性——AudioSource.volume、Node.position、Sprite.color——只要它是数字，就能被 tween。这种通用性意味着：<strong>任何需要"平滑变化"的地方都可以用同一个工具</strong>。学习成本从 N 种工具降低到 1 个模式。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>BGM 切换为什么需要淡入淡出？直接用 <code>clip = newClip</code> 硬切会产生什么体验问题？这和前端 Transition 组件的设计哲学有什么相同之处？</li>
        <li>三级音量控制（master × category × source）的设计解决了什么问题？如果只用一个全局音量滑块，玩家会遇到什么限制？</li>
        <li>音频池和对象池（Phase 15）是同一个设计模式。它们的核心目标是什么？为什么"预分配 + 复用"比"动态创建 + 销毁"在游戏中更重要？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
