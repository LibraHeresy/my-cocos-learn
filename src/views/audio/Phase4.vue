<script setup lang="ts">
import AudioPhaseLayout from '@/components/AudioPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <AudioPhaseLayout :phase="4" title="Cocos 音频集成" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解 Cocos 的 AudioSource 组件和 AudioClip 资源</li>
        <li>编写 AudioManager 单例脚本，统一管理所有游戏音效</li>
        <li>用 resources.load 动态加载和播放音频</li>
        <li>实现场景切换时的 BGM 过渡（淡入淡出 + 跨场景播放）</li>
        <li>添加音量控制和静音开关</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔌" title="Cocos 音频架构速览">
      <p>Cocos Creator 的音频系统由两个核心类组成：</p>

      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>类型</th>
            <th>作用</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>AudioClip</strong></td>
            <td>资源（Asset）</td>
            <td>音频文件本身——WAV / OGG 导入 Cocos 后变成 AudioClip</td>
          </tr>
          <tr>
            <td><strong>AudioSource</strong></td>
            <td>组件（Component）</td>
            <td>挂载在节点上的播放器——控制播放/停止、音量、循环</td>
          </tr>
        </tbody>
      </table>

      <p>类比（Vue 开发者的视角）：</p>
      <pre><code>AudioClip   =  static asset（类似 import 一张图片）
AudioSource = &lt;audio&gt; 标签（控制播放、暂停、音量）
AudioManager = 你封装的 audioService.ts（统一管理所有音频播放）</code></pre>

      <h3>导入音频到 Cocos</h3>
      <ol>
        <li>
          把 WAV / OGG 文件拖入 <code>assets/resources/sfx/</code> 和
          <code>assets/resources/bgm/</code>
        </li>
        <li>Cocos 资源管理器会自动识别——右键文件 → 检查导入设置</li>
        <li>
          AudioClip 导入设置：<strong>Audio Load Mode</strong> 选 Deferred（延迟加载）或 Web
          Audio（即时加载）
        </li>
        <li>小 SFX（&lt;100KB）选 Web Audio 减少延迟；大 BGM 选 Deferred</li>
      </ol>

      <div class="warn-box">
        <strong>路径限制：</strong>使用 <code>resources.load</code> 动态加载时，音频必须放在
        <code>assets/resources/</code> 目录下（或子目录）。否则运行时找不到文件。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="AudioManager 单例脚本">
      <p>这是一个最小可用的 AudioManager——你可以在所有游戏脚本中通过它播放任何音效：</p>

      <pre><code>// AudioManager.ts —— 挂载在场景根节点（不销毁）上
import { AudioClip, AudioSource, Node, director, resources } from 'cc'

class AudioManager {
  private static _instance: AudioManager

  static get instance(): AudioManager {
    if (!this._instance) {
      this._instance = new AudioManager()
    }
    return this._instance
  }

  private _audioSource!: AudioSource
  private _bgmSource!: AudioSource
  private _clipCache = new Map&lt;string, AudioClip&gt;()

  /** 初始化：建两个 AudioSource——一个放 SFX，一个放 BGM */
  init(node: Node) {
    this._audioSource = node.addComponent(AudioSource)
    this._bgmSource = node.addComponent(AudioSource)
  }

  /** 播放一次短音效 */
  playOneShot(path: string) {
    const clip = this._clipCache.get(path)
    if (clip) {
      this._audioSource.playOneShot(clip, 1)
      return
    }
    resources.load(path, AudioClip, (err, clip) => {
      if (!err) {
        this._clipCache.set(path, clip)
        this._audioSource.playOneShot(clip, 1)
      }
    })
  }

  /** 播放/切换 BGM（带淡入） */
  playBGM(path: string) {
    resources.load(path, AudioClip, (err, clip) => {
      if (!err) {
        this._bgmSource.clip = clip
        this._bgmSource.loop = true
        this._bgmSource.volume = 0
        this._bgmSource.play()
        // 淡入 BGM（Cocos 的 cc.tween 可以 tween AudioSource.volume）
      }
    })
  }

  /** 停止 BGM */
  stopBGM() {
    this._bgmSource.stop()
  }

  /** 设置 SFX 全局音量（0-1） */
  setSFXVolume(vol: number) {
    this._audioSource.volume = vol
  }

  /** 设置 BGM 全局音量（0-1） */
  setBGMVolume(vol: number) {
    this._bgmSource.volume = vol
  }
}

export const audioManager = AudioManager.instance</code></pre>

      <h3>使用方式</h3>
      <pre><code>// 在任何脚本中
import { audioManager } from './AudioManager'

// 播放射击音效
audioManager.playOneShot('sfx/player_shoot')

// 播放爆炸音效
audioManager.playOneShot('sfx/explosion_small')

// 切换 BGM
audioManager.playBGM('bgm/bgm_battle')</code></pre>

      <div class="tip-box">
        <strong>为什么用 Map 缓存：</strong><code>AudioClip</code>
        加载一次后缓存起来，下次播放同路径音效直接复用——避免每次射击触发都重新加载（会卡顿）。缓存策略对频繁播放的音效尤其重要。
      </div>

      <div class="warn-box">
        <strong>Autoplay Policy（自动播放限制）：</strong>和 Web 端的 <code>&lt;audio&gt;</code> 一样，Cocos 在浏览器中运行时受自动播放策略限制——用户必须有过交互（点击/触摸）后音频才能播放。解决方案：在主菜单的"开始游戏"按钮点击中调用 <code>audioManager.init()</code> + 播放一个静音 BGM 来"解锁" AudioContext。小游戏没有此限制。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎚️" title="BGM 淡入淡出与场景切换">
      <p>BGM 切换生硬地从一首歌直接切成另一首非常刺耳——应该做平滑的过渡：</p>

      <pre><code>import { tween } from 'cc'

// 淡出当前 BGM → 切换 → 淡入新 BGM
async switchBGM(newPath: string) {
  // 先淡出
  tween(this._bgmSource)
    .to(1, { volume: 0 })   // 1 秒淡出
    .call(() => {
      this._bgmSource.stop()  // 停止旧 BGM
      this.playBGM(newPath)   // 播放新 BGM
    })
    .start()
}

// 暂停/恢复 BGM（切到设置页面时）
pauseBGM() {
  this._bgmSource.pause()
}

resumeBGM() {
  this._bgmSource.play()
}</code></pre>

      <h3>跨场景 BGM 持久化</h3>
      <p>AudioManager 所在节点需要设为<strong>不销毁节点</strong>——切换场景时 BGM 不中断：</p>
      <pre><code>// 在初始化场景的 onLoad 中
director.addPersistRootNode(this.node)  // 该节点（和它的 AudioSource）跨越场景不销毁</code></pre>

      <div class="warn-box">
        <strong>场景过渡监听：</strong>在 Cocos 的场景切换回调中调用
        <code>switchBGM</code>——不要依赖场景的 <code>onLoad</code> 自动触发 BGM
        切换，容易被多次加载打乱。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔊" title="Audio Ducking（音频闪避）">
      <p>
        Audio Ducking 是指<strong>在播放重要音效时短暂降低 BGM 音量</strong>，让玩家能听清关键反馈——就像电台 DJ 说话时背景音乐自动变小：
      </p>

      <pre><code>// AudioManager.ts —— 播放重要 SFX 时闪避 BGM
playOneShotDuck(path: string, duckVolume = 0.3, duckDuration = 0.5) {
  const originalVol = this._bgmSource.volume

  // 降低 BGM 音量
  tween(this._bgmSource)
    .to(0.1, { volume: originalVol * duckVolume })
    .delay(duckDuration)
    .to(0.2, { volume: originalVol })
    .start()

  // 同时播放音效
  this.playOneShot(path)
}</code></pre>

      <h3>哪些音效值得用 Ducking？</h3>
      <ul>
        <li>Boss 登场音效 / 警告音效——需要玩家立即注意</li>
        <li>全屏炸弹爆炸——视觉和听觉都需要冲击力</li>
        <li>游戏结束 / 过关——叙事性时刻</li>
        <li>普通射击和拾取道具不需要——太频繁的 Ducking 反而让 BGM 听起来像在抽搐</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔨" title="动手练习：集成全部音频到游戏">
      <ol>
        <li>将 Phase 2 制作的所有 12 个 SFX 放入 <code>assets/resources/sfx/</code></li>
        <li>将 Phase 3 制作的 BGM 放入 <code>assets/resources/bgm/</code></li>
        <li>创建 <code>AudioManager.ts</code> 脚本并挂载到场景根节点</li>
        <li>在玩家射击逻辑中调用 <code>audioManager.playOneShot('sfx/player_shoot')</code></li>
        <li>在敌机死亡逻辑中调用 <code>audioManager.playOneShot('sfx/explosion_small')</code></li>
        <li>在道具拾取、受击、UI 点击等所有事件点接入对应音效</li>
        <li>主菜单 → 起 <code>bgm_menu</code>；战斗开始 → 切换到 <code>bgm_battle</code></li>
        <li>添加音量滑块（UI 控件 + <code>setSFXVolume</code> / <code>setBGMVolume</code>）</li>
        <li>添加静音开关</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>游戏中每一个游戏事件都有对应的音效反馈。BGM
        在菜单和战斗之间平滑切换、无缝循环。音量滑块可以独立调节 SFX 和 BGM。
      </div>

      <div class="warn-box">
        <strong>SFX 并发数限制：</strong>Cocos Web 端 <code>AudioSource</code> 同时播放数量有限（浏览器通常 6-8 个音频通道）。如果同一帧有太多音效（爆炸 + 射击 + 拾取 + 敌机死亡同时发生），后面的音效可能被静默丢弃。解决方案：<br/><br/>
        1. <strong>优先级队列：</strong>重要音效（爆炸、受击）优先播放，次要音效（拾取道具）可被挤掉<br/>
        2. <strong>合并同类：</strong>同一帧内多次射击只播一次<br/>
        3. <strong>小游戏更严：</strong>微信小游戏 <code>InnerAudioContext</code> 最多同时 10 个——超出后创建失败。需要用对象池管理 AudioContext 实例（Phase 8 有完整代码）
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>AudioClip 和 AudioSource 的关系是什么？</li>
        <li>为什么 SFX 必须放在 <code>resources/</code> 目录下？</li>
        <li><code>playOneShot</code> 和直接 <code>play()</code> 有什么区别？</li>
        <li>AudioManager 为什么用 Map 缓存 AudioClip？频繁加载会有什么问题？</li>
        <li>跨场景切换 BGM 时，如何保证音频不中断？</li>
        <li>淡入淡出的 tween 怎么实现？为什么不能直接 <code>clip=新BGM</code>？</li>
        <li>SFX 音量和 BGM 音量为什么要分开控制？</li>
      </ul>
    </ConceptBlock>
  </AudioPhaseLayout>
</template>
