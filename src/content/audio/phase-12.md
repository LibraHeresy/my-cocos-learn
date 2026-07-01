---
phase: 12
title: 音频发布与平台适配
duration: 1-2 天
---

## 🧭 本节定位

Web 能播 OGG，微信小游戏只认 MP3，iOS Safari 要求用户点一下屏幕才能解锁声音。跨平台音频兼容是游戏发布的"最后一公里"——写好了 AudioManager 的所有功能，但如果不处理平台差异，在某些平台上它就是静音的。

## 📱 故事：iOS Safari 的"静音墙"

2017 年，一个独立游戏开发者在 Twitter 上发了一条求助："为什么我的 Web 游戏在 iOS Safari 上完全没有声音？代码没错，Android Chrome 正常，桌面也正常。"

答案是 iOS Safari 的 **自动播放策略（Autoplay Policy）**：在用户**与页面发生一次交互**（点击/触摸）之前，AudioContext 处于"suspended"状态。任何 `.play()` 调用都会被静默忽略。这是 Apple 为了防止网页自动播放广告音频而设计的保护措施——但它对游戏音频是致命的。

这不是浏览器 bug。这是**平台限制**。作为一个游戏开发者，你的工作不是抱怨平台限制——是**写代码适配它**。就像你写 CSS 要考虑 Safari 的 -webkit- 前缀一样，写音频系统要考虑各平台的解码器差异、格式支持、自动播放策略。

## 🗺️ 原理：跨平台音频的"兼容三角形"

游戏音频发布涉及三个相互制约的维度。你需要在其中做权衡：

**1. 音频格式 —— 你的"编译目标"**

<table>
<thead><tr><th>格式</th><th>体积</th><th>质量</th><th>循环支持</th><th>浏览器兼容</th><th>微信小游戏</th></tr></thead>
<tbody>
  <tr><td>WAV</td><td>大（10MB/分钟）</td><td>无损</td><td>完美</td><td>所有浏览器</td><td>不支持</td></tr>
  <tr><td>MP3</td><td>小（1MB/分钟）</td><td>有损</td><td>差（编码段边界有爆音）</td><td>所有浏览器</td><td>支持</td></tr>
  <tr><td>OGG</td><td>中（1.5MB/分钟）</td><td>有损（优于 MP3）</td><td>完美（为无缝循环设计）</td><td>Chrome/FF/Edge</td><td>不支持</td></tr>
</tbody>
</table>

**为什么 MP3 循环有缝？** MP3 编码会在音频首尾插入几百毫秒的静音填充（编码器为了凑满一个 frame 的最小长度）。当你用 loop=true 播放时，首尾的静音会产生一个明显的"咔嗒"停顿。OGG Vorbis 在设计时就考虑了无缝循环——它的编码架构允许精确指定循环点，没有填充静音。

这是音频格式设计中的"蛋鸡问题"：格式诞生时的定位决定了 20 年后它适不适合游戏。MP3 为"播放一首歌"设计，OGG 为"所有场景"设计。

**2. 平台差异 —— 你的"环境变量"**

<table>
<thead><tr><th>平台</th><th>推荐格式</th><th>底层 API</th><th>关键限制</th></tr></thead>
<tbody>
  <tr><td>Web (Chrome/FF/Edge)</td><td>OGG</td><td>Web Audio API</td><td>无特殊限制（最佳体验）</td></tr>
  <tr><td>Web (Safari)</td><td>OGG</td><td>Web Audio API</td><td>首次需用户手势解锁 AudioContext</td></tr>
  <tr><td>微信小游戏</td><td>MP3</td><td>wx.InnerAudioContext</td><td>格式限制严格，并发数有限</td></tr>
  <tr><td>原生 (iOS/Android)</td><td>OGG/WAV</td><td>OpenAL / AAudio</td><td>由 Cocos 引擎自动处理</td></tr>
</tbody>
</table>

**3. 微信小游戏的特殊限制**

微信小游戏的音频环境和非微信 Web 完全不同：

- **格式：** 只认 MP3 和 AAC。OGG 不支持。你的所有音效和 BGM 需要额外导出 MP3 版本。
- **并发：** 微信的 `InnerAudioContext` 默认最多同时播放 **10 个**音频实例。超出的创建请求会失败（不是排队，是直接失败）。
- **文件大小：** 小游戏代码包总大小有限制（通常 4MB 或 8MB）。音频文件不能太大——如果 6 个 BGM 各 3MB = 18MB，包都上传不了。
- **BGM 无缝循环：** MP3 的循环问题在小游戏上尤为突出。对策：准备 WAV 版的无缝循环部分 → 用工具精确裁掉 MP3 的编码静音 → 或使用双 Context 交替播放的方案。

**iOS Safari 的 AudioContext 解锁策略**

iOS Safari 要求 AudioContext 在用户手势事件内才能 `.resume()`。标准解法：

<pre>// 在游戏首次触摸/点击事件中
canvas.addEventListener('touchstart', () => {
  const ctx = AudioContext 实例
  if (ctx.state === 'suspended') {
    ctx.resume()  // 解锁
  }
}, { once: true })  // once: true —— 只执行一次</pre>

这个解锁必须发生在**用户主动操作**触发的同步事件回调中。不能在 setTimeout、Promise.then、或代码主动触发的点击中解锁——浏览器会检测并拒绝。

## 🔧 动手：实现跨平台双栈 AudioManager

在 AudioManager 中实现平台自适应：

1. **平台检测：** 使用 `sys.platform` 判断当前运行环境：`sys.Platform.WECHAT_GAME`、`sys.Platform.MOBILE_BROWSER`、`sys.Platform.DESKTOP_BROWSER`。根据平台选择不同的加载策略。
2. **双栈实现：**
   - **Web 栈：** 使用 Cocos 标准的 AudioSource + resources.load + OGG 文件。这是 Phase 9-10 的代码。
   - **微信栈：** 使用 `wx.createInnerAudioContext()` 创建播放实例。封装为和 Web 栈相同的接口：`playSFX(name)`、`playBGM(name)`。
3. **iOS 解锁：** 在 AudioManager.onLoad() 中注册文档级别的首次触摸监听。检测到 AudioContext 状态为 suspended → 调用 `resume()`。解锁成功后移除监听。
4. **资源准备：**
   - 在 `assets/audio/sfx/` 中同时放 OGG 和 MP3 版本（`shoot.ogg` + `shoot.mp3`）。
   - 在代码中封装一个 `getAudioPath(name)` 方法：如果是微信平台返回 `.mp3` 路径，否则返回 `.ogg` 路径。
   - 如果构建大小超限，考虑**降低 MP3 码率**（64kbps 单声道），或**缩短 BGM**（从 30 秒降到 16 秒循环）。
5. **测试：** 在 Chrome DevTools 中模拟移动设备 + 检查 AudioContext 状态。在微信开发者工具中测试小游戏模式。在真机 iOS Safari 中测试首次交互解锁。

## 🔗 课外延伸

- **音频格式选型三角——兼容性 vs 体积 vs 质量：** 选音频格式就像选前端构建工具——没有"最好"的，只有"最适合你项目约束"的。WAV = 源码（最大最完整），MP3 = 生产构建（压缩但有折中），OGG = 理想构建（压缩且质量好但兼容性有缺口）。实际项目的策略通常是这样：**源文件存 WAV（无损，方便后续修改），构建脚本同时生成 OGG 和 MP3 双格式，运行时根据平台选择。** 这和前端的多格式图片（WebP + fallback JPEG）是完全一样的策略。
- **为什么 OGG 没有一统天下：** OGG 在技术上优于 MP3——更高的压缩效率、更好的音质、原生支持无缝循环。但 MP3 有先发优势和专利壁垒（尽管专利已过期，但硬件解码器生态已经建立在 MP3 上）。微信小游戏不支持 OGG 不是因为技术原因——是因为微信的音频解码链路继承自移动操作系统的原生解码器（iOS/Android 内置了 MP3 解码器），而 OGG 需要软件解码。这就是"平台决策影响技术选型"的典型案例。

## ✅ 自测清单

1. WAV、MP3、OGG 三种格式中，为什么 OGG 是 Web 游戏的最佳选择？从体积、循环支持、音质三个维度解释。为什么微信小游戏必须用 MP3？
2. iOS Safari 的自动播放策略为什么阻止了游戏音频？AudioContext.resume() 必须满足什么条件才能成功？这和 Web 通知 API 需要用户手势授权的设计有什么相似之处？
3. 如果你要发布一款同时支持 Web 和微信小游戏的 Cocos 游戏，你的音频资源策略是什么？请列出源文件格式、构建产物、运行时选择逻辑。
