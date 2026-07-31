---
phase: 9
title: Cocos 音频集成（上）
duration: 2 天
---

## 🧭 本节定位

Phase 1-8 做好了音效和 BGM。现在把它们"接"进游戏。这一节在 Cocos 中创建 AudioManager —— 游戏所有音频的"总控中心"。实现基础播放：加载、播放 SFX、循环 BGM。

## 🌐 故事：从 <audio> 标签到 Web Audio API

2011 年之前，网页上的音频只有一个方式：`<audio>` 标签。它的问题是延迟——从调用 `.play()` 到听到声音，延迟约 **50-100ms**。对于听歌来说这不算什么，但对于游戏来说——你按了射击键，100ms 后才听到枪声——这个延迟已经让操作感"松软"了。

2011 年，Google Chrome 团队提出了 **Web Audio API**。它的延迟是 **~3ms**。怎么做到的？因为 Web Audio API 不只是一个"播放器"——它是一个完整的**音频处理管线（audio graph）**。所有的音频数据都预先解码、缓冲在内存中，播放只需要**触发**，不需要等待。而且它支持多音源同时播放、实时音频处理、滤波器和效果器——这些都是游戏音频的刚需。

Cocos Creator 的音频系统底层就是 Web Audio API（Web 平台）和 OpenAL/AAudio（原生平台）。但 Cocos 在 Web Audio API 上封装了一层——AudioSource 组件 + AudioClip 资源 + AudioManager 管理器。你只需要理解这一层的 API，底层细节由引擎处理。

## 🎛️ 原理：Cocos 音频系统的三层架构

Cocos 的音频系统有三层抽象，每一层对应不同的使用场景：

**1. AudioClip（数据层）—— 音频的"原材料"**

AudioClip 是音频文件的包装。你把 OGG/WAV 拖进 `assets/` 目录，Cocos 自动创建 AudioClip。它本身不做任何事——就像 Vue 组件的 data 属性定义了数据结构但不渲染。

**2. AudioSource（播放层）—— 音频的"播放器"**

AudioSource 是一个 Component，挂到任意节点上就能播放指定 AudioClip。类似一个 `<audio>` 标签——有 `.play()`、`.pause()`、`.stop()`、`.volume`、`.loop` 属性。

关键理解：**一个 AudioSource 同时只能播放一个 AudioClip**。但你可以创建多个 AudioSource（每个有自己的 Clip），它们共享同一个 **AudioContext**（Web Audio API 的全局音频管线）。

**3. AudioManager（管理层）—— 你的自定义总控**

Cocos 没有内置的 AudioManager 类。这是**你需要自己写的**——一个单例 Component，负责：

- 统一管理所有 AudioSource 的创建和回收
- 提供高层 API：`playSFX(name)`、`playBGM(name)`
- 处理音量控制、暂停恢复、场景切换存活

这个 AudioManager 就是你的音频系统在游戏中的"唯一入口"。所有需要播放声音的模块（PlayerController、EnemyManager、UIManager）都通过它来操作——而不是各自创建 AudioSource。这就是**单一入口原则**，和 Vuex/Pinia 的 store 管理模式完全一致。

**AudioContext —— 所有声音的"调度中心"**

在 Web Audio API 底层，每个声音通过一个叫做 **AudioNode 图**的结构连接：

<pre>AudioSource → GainNode（音量） → AudioContext.destination（扬声器）
                 ↑
            FilterNode（滤波）
                 ↑
           AnalyserNode（频谱可视化）</pre>

所有的 AudioSource 都输出到一个全局的 AudioContext，这个 Context 是**浏览器级别的单例**。这就是为什么你可以在游戏里同时听到射击声 + BGM + 爆炸声——它们在不同的 AudioSource 中播放，但在 AudioContext 中混合成最终信号。这和 DOM 的 event propagation（所有事件冒泡到 document）是同样的树状拓扑。

## 🔧 动手：创建 AudioManager 并播放第一声音效

在你的 Cocos 项目中（确保已有 `assets/audio/sfx/` 和 `assets/audio/bgm/` 目录，Phase 6 的 OGG 文件已经拖入），创建音频总控：

1. **创建 AudioManager 组件：** 新建 `scripts/AudioManager.ts`。实现单例模式：`private static _instance: AudioManager` + `static get instance()`。在 `onLoad()` 中设置 `_instance = this` 并调用 `director.addPersistRootNode(this.node)` 保证场景切换时 AudioManager 不被销毁。
2. **实现 playSFX(name: string)：**
   - 用 `resources.load('audio/sfx/' + name, AudioClip, callback)` 加载音效。
   - 在回调中动态创建一个节点，挂上 AudioSource 组件，设置 clip 为加载的 AudioClip。
   - 调用 `audioSource.play()`。
   - 监听 AudioSource 的 `EventType.ENDED` 事件，播放完毕后销毁节点（回收资源）。
3. **实现 playBGM(name: string)：**
   - 在 AudioManager 的节点上直接挂一个专用的 AudioSource（BGM 只要一个就够了）。
   - 设置 `audioSource.loop = true`（BGM 循环播放）。
   - 在 onLoad 中自动播放默认 BGM。
4. **在 PlayerController 中接入：** 找到射击方法 `shoot()`，在创建子弹后插入一行：`AudioManager.instance.playSFX('shoot')`。运行项目，按空格键射击——听到"biu"声了吗？
5. **调试清单：** 如果没有声音，依次排查：1) AudioClip 的 import 设置是否正确（检查资源面板中音频文件的格式设置） 2) 回调中是否真的调用了 audioSource.play() 3) 浏览器控制台是否有资源加载错误 4) AudioManager 节点的 volume 是否为 0。

## 🔗 课外延伸

- **Web Audio API AudioNode 图 —— 音频的"Component Tree"：** Web Audio API 的设计哲学和 Vue 的组件树惊人地相似。AudioContext = 根组件，AudioNode = 子组件，connect() = props 传递。你可以把一个 OscillatorNode（振荡器）连接到 GainNode（增益），再连接到 DelayNode（延迟），最后到 destination。每一步都像在组件树中插入一个中间件——处理完传给下一个。这个模型的美在于：**任何 AudioNode 都可以连接到任何其他 AudioNode**，就像 Vue 的 slot 可以在任意层级插入内容。
- **Cocos 的 AudioSource.playOneShot() vs play()：** `audioSource.playOneShot(clip, volumeScale)` 是 AudioSource 的**实例方法**：通过当前已挂的 AudioSource 的内部播放器一次性播放指定 clip，不会打断正在循环播放的 BGM，也不会自动创建/销毁 AudioSource。它适合短促、一次性触发类音效（射击、拾取）；`play()` 则正式播放/循环当前 clip，适合 BGM 这类需要持续循环并控制暂停、音量的场景。若并发 SFX 很多、需要精细控制，用 Phase 10 的音频池。

## ✅ 自测清单

1. Web Audio API 相比 `<audio>` 标签的核心优势是什么？为什么 ~3ms 的低延迟对游戏至关重要？
2. Cocos 音频系统的三层抽象（AudioClip / AudioSource / AudioManager）各自的职责是什么？为什么需要 AudioManager 这个自定义单例？
3. AudioContext 的 AudioNode 图结构和前端组件树有什么相似之处？这种树状拓扑为什么适合音频处理？
