---
phase: 4
title: BFXR 音效实战（上）
duration: 1-2 天
---

## 🧭 本节定位

打开 bfxr.net，从预设出发，调参数，Mutate 几次，导出 WAV。不需要音乐背景，不需要数学——你只需要耳朵和鼠标。这一节做出飞机大战的前 3 个核心音效：射击、爆炸、拾取。

## 💡 故事：48 小时创造的工具，影响了一个时代

2007 年，独立游戏开发者 Tomas Pettersson（网名 DrPetter）参加了一场 Ludum Dare——48 小时游戏创作大赛。他的游戏需要一个复古音效，但他不会做。于是他花了几个小时，用 C 语言写了一个极小的音效生成器，只有 200 行代码。

他叫它 **SFXR**。提交游戏的同时，他把这个工具也放到了网上。

今天，SFXR 和它的 Web 版衍生品 BFXR 成了**独立游戏开发中最常用的音效工具**。成千上万的游戏——从 Ludum Dare 作品到 Steam 上的商业独立游戏——用这个 200 行 C 代码的工具做音效。DrPetter 的故事是一个工程师能听到的最好的故事：**解决一个自己的真实问题，然后把它分享出去。好工具不必复杂——够用就行。**

这就像你 npm install 一个 50 行的库，结果发现全世界的项目都在用它。质量不是用代码行数衡量的。

## 🎛️ 原理：BFXR 工作流——从预设到成品

BFXR 的界面看起来像一个仪表盘——十几个滑块、几个下拉框、一个播放按钮。不要被吓到。你只需要理解它的工作流：

**第一步：选预设（Generator Panel）**

BFXR 左侧的 Generator 面板有 9 个预设按钮：Pickup/Coin、Laser/Shoot、Explosion、Powerup、Hit/Hurt、Jump、Blip/Select、Random、Mutate。这些预设是 DrPetter 根据经验调好的"参数配方"。**永远从预设出发，不要从空白开始。** 预设 = 脚手架，你在上面改参数。就像你不会从零写 Webpack 配置——你一定从 create-vue 的模板出发。

**第二步：调参数（右侧面板）**

四个最常用的滑块，按优先级排列：

1. **Waveform（波形）：** 方波 = 电子感，锯齿波 = 锋利，正弦波 = 纯净，噪声 = 爆炸/粗糙。这是"声音的颜色"。
2. **Attack Time / Sustain Time / Decay Time / Release Time：** 这就是 Phase 3 讲的 ADSR。Attack=0 是枪声，Attack=0.5s 是风声。
3. **Frequency / Frequency Slide：** 频率决定音高。Frequency Slide > 0 = 声音从低到高（"拾取"感），< 0 = 声音从高到低（"失落"感）。
4. **Master Volume：** 默认 0.5（-6dB），不要提高到超过 0.7——留出 headroom 给后续混音。

**第三步：Mutate（变异）**

选好预设后，点击 Mutate 按钮。BFXR 会**微调所有参数**，产生一个和当前音效类似但又不同的版本。点一下 → 听听 → 不满意再点 → 直到满意。这不是玄学——Mutate 的本质是对所有参数做小幅随机扰动，相当于"在当前音效的邻域搜索"。你大部分时候 3-5 次 Mutate 就能找到满意的效果。这比从头调参数快 10 倍。

**第四步：导出**

点 Save WAV 按钮，下载为 16-bit 44100Hz WAV 文件。保存到你的项目 `assets/audio/sfx/` 目录下。WAV 是源文件格式——后面在 Audacity 中编辑后，再导出为 OGG 给 Cocos 使用。

## 🔧 动手：制作飞机大战前 3 个音效

现在打开 [bfxr.net](https://www.bfxr.net)，我们为飞机大战制作三枚核心音效。请戴耳机——笔记本电脑的外放会漏掉低频，影响判断。

**音效 1：射击声（Shoot）**

1. 点击 **Laser/Shoot** 预设。
2. Waveform 选 **Square**（方波 = 经典 8-bit 射击感）。
3. Attack Time → **0**（按键瞬间就要响，不能有延迟感）。
4. Sustain Time → **0**（不需要持续，一枪一声）。
5. Decay Time → **0.05s**（快速衰减，干净利落）。
6. Frequency → **1500Hz** 左右（高频 = 清脆射击感）。Frequency Slide → **-0.3**（声音稍微向下滑，"biu↘"而不是平平的"beep"）。
7. 点 Mutate 3-5 次，每次点 Play 试听。找一个"不过分刺耳、但有存在感"的版本。
8. 点 Save WAV 保存为 `shoot.wav`。

**音效 2：爆炸声（Explosion）**

1. 点击 **Explosion** 预设。
2. Waveform 保持 **Noise**（爆炸的"轰"靠的就是噪声 + 低频共振）。
3. Attack Time → **0**（爆炸是瞬间事件）。
4. Sustain Time → **0.1s**（留一点余响）。
5. Decay Time → **0.3s**（衰减慢一些，让"轰"的尾音有存在感）。
6. Frequency → **200Hz**（低频 = 沉重感）。Frequency Slide → **-0.5**（向下沉的轰声，像真正的爆炸冲击波余波散去）。
7. Mutate 3-5 次，找到"有分量但不拖沓"的版本。太快了像放屁，太慢了像雷声。
8. 保存为 `explosion.wav`。

**音效 3：拾取声（Pickup）**

1. 点击 **Pickup/Coin** 预设。这个预设已经包含了一个经典的上行频率滑动。
2. Waveform 选 **Square**（或 Sine——更纯净的"叮"声）。
3. Frequency Slide → **+0.6 ~ +0.8**（强烈的向上滑动，"biu↑"让人愉悦）。
4. Attack Time → **0**，Sustain Time → **0**，整体 **100-200ms**（短促清脆，不拖沓）。
5. Frequency 区间 → **800-2000Hz**（清脆不刺耳）。
6. Master Volume → **0.6**（拾取声可以比射击声稍微大一点——积极的反馈值得突出）。
7. Mutate 3-5 次，找那个让你"听了想再捡一个"的版本。
8. 保存为 `pickup.wav`。

做完这 3 个音效后，把它们放在一个文件夹里。打开文件夹，双击每个 WAV 文件听一遍——你刚刚从零创造了三个游戏音效。这和写了一个跑通的 Vue 组件的感觉一样。

## 🔗 课外延伸

- **SFXR/BFXR 为什么能"永生"：** DrPetter 的 SFXR 写于 2007 年，用 C 语言 + SDL 库。后来有人把它移植到了 Flash（BFXR 的第一版），又移植到了 Web Audio API（现在的 bfxr.net）。一个 200 行 C 代码的工具，穿越了 3 个技术时代依然在使用。这不是因为代码写得多好——是因为它**解决了正确的需求，并且给出了正确的抽象**：9 种预设 + 参数直观 = 0 学习成本。你不需要懂音效合成也能用——但懂了之后能用到极致。
- **Ludum Dare 与独立游戏文化：** Ludum Dare 是全球最大的游戏创作大赛，每届都有上千人参加，规则是**48 小时内从零做出一款游戏**。SFXR、BFXR、Bosca Ceoil（Phase 7）——这些独立游戏开发者最常用的工具都诞生于 Ludum Dare。这不是巧合：48 小时的时间压力迫使你只做"够用"的工具，不做"完美"的工具。够用比完美重要。

## ✅ 自测清单

1. 在 BFXR 中，射击声的 Attack Time 为什么必须接近 0？如果 Attack Time 设为 0.5 秒会有什么听感问题？
2. 爆炸声使用 Noise 波形而非 Square 波形——为什么？Noise 波形的物理特性（全频率随机分布）如何对应爆炸的物理特性（空气分子剧烈无序振动）？
3. BFXR 的 Mutate 功能的本质是什么？它和机器学习中的"随机梯度下降"在思路上有什么相似之处？
