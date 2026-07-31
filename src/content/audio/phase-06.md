---
phase: 6
title: Audacity 编辑精要
duration: 1 天
---

## 🧭 本节定位

BFXR 输出的 WAV 是"生"的——爆音、空白头尾、音量不一致。就像 TypeScript 输出的 JS 还需要 terser 压缩一样，BFXR 的输出需要 Audacity 打磨。这一节学会修剪、淡入淡出、标准化、降噪——音效后期 80% 的操作。

## 🔊 故事：为什么"生的"音效不能直接用

把 Phase 5 做的 6 个 WAV 全部拖到同一个文件夹里，双击播放。你可能会注意到：

- 有的音效开头有一段**空白**（50ms 的静音）——玩家按键后等 50ms 才听到声音，这在游戏中是致命的。
- 有的音效结尾**"啪"的一声**——波形被突然截断产生 click/pop（直流跳变）——这是波形不连续，不是 clipping；clipping 特指振幅超过 0dBFS 的削波失真。
- 有的音效**特别响**，有的**特别轻**——它们的峰值音量差了 6dB 以上。
- 有的音效背景有**滋滋的底噪**——BFXR 的参数偏极端时会产生不需要的噪声。

这些问题和代码里的 lint 错误一样——不影响功能运行，但影响"产品质量"。Audacity 就是你的"音频 ESLint + Prettier"：把生的音效格式化成干净的、标准的、可发布的成品。

## ✂️ 原理：四个核心操作——音频的 lint + format

Audacity 有上百个功能，但对于游戏音效后期，你只需要掌握以下四个操作。每个操作对应一个具体的"产品质量目标"：

**1. 修剪（Trim）—— 去除空白，消除延迟**

目标：音效的第一帧就必须有声音。

操作：放大波形（Ctrl+滚轮），找到声音开始的位置。用鼠标选中开头的空白区域（纯直线 = 静音），按 Delete 删除。结尾同理——选中最后的空白尾音，Delete。现在音效的播放时长 = 声音的实际时长，不多一毫秒。

前端类比：就像移除代码里 100ms 的 setTimeout 延迟——用户操作的反馈必须即时。

**2. 淡入淡出（Fade In / Fade Out）—— 防止爆音**

目标：声音的开始和结束必须"平滑"。

问题：数字音频中，如果波形从 0 瞬间跳到 0.5，扬声器振膜会突然位移——产生"啪"的爆音。Fade In 让波形从 0 平滑过渡到实际音量，通常只需要 3-5ms。

操作：选中开头 5ms 的区域 → Effect → Fade In。选中结尾 10ms → Effect → Fade Out。

前端类比：就像给一个显示/隐藏的元素加 `transition: opacity 0.05s`——极短但不突兀。

**3. 标准化（Normalize）—— 统一音量**

目标：所有音效的峰值音量一致。

问题：6 个 BFXR 音效的峰值可能差 10dB。如果按照 Phase 5 的混音表设置相对音量，前提是它们的基准峰值要一致——否则 70% 的射击声可能比 40% 的引擎声还轻。

操作：Ctrl+A（全选）→ Effect → Volume and Compression → Normalize → 勾选"Normalize peak amplitude to"并设为 **-3dB**。不要设为 0dB —— 留 3dB 的 headroom 给后续混音和多个音效叠加。

前端类比：就像 CSS 的 `normalize.css`——让所有浏览器的默认样式一致，才能在此基础上做差异化设计。

**4. 降噪（Noise Reduction）—— 清除底噪**

目标：音效的背景应该绝对干净。

原理：选取一段**只有噪声、没有信号**的区域 → Audacity 分析这段"噪声指纹" → 然后在整个文件中去掉这些频率。它的核心算法是**频谱减法（Spectral Subtraction）**：在全文件的频谱中减去噪声的频谱。

操作：选中一小段纯噪声（即使是 50ms 也行）→ Effect → Noise Reduction → Get Noise Profile。然后选中全文件（Ctrl+A）→ 再次 Noise Reduction → OK。

注意：降噪是一个"不可逆"操作。过度降噪会让音效听起来"空洞"——因为你把声音的一部分高频细节也削掉了。设置 Noise Reduction 的参数时，dB 值不要超过 12。

前端类比：就像 Webpack 的 tree-shaking——只去掉确定无用的代码，不要过度压缩导致功能异常。

## 🔧 动手：打磨 6 个音效 + 导出 OGG

下载并安装 **Audacity**（[audacityteam.org](https://www.audacityteam.org)，完全免费开源）。然后逐一处理 Phase 5 的 6 个音效文件：

1. **导入：** File → Open → 选择 `shoot.wav`。你会看到波形图——横轴是时间，纵轴是振幅。
2. **修剪：** 放大波形，选中开头的空白 → Delete。选中结尾的空白 → Delete。现在整个文件的长度就是声音的实际长度。
3. **Fade In/Out：** 选中开头 5ms → Effect → Fade In。选中结尾 10ms → Effect → Fade Out。
4. **标准化：** Ctrl+A 全选 → Effect → Volume and Compression → Normalize → 勾选 Peak amplitude → 输入 -3dB → OK。
5. **降噪（如果需要）：** 如果有明显底噪，找一段纯噪声 → Effect → Noise Reduction → Get Noise Profile → Ctrl+A → 再次 Noise Reduction → OK。
6. **导出 OGG：** File → Export Audio…，在 Format 下拉框选 Ogg Vorbis（Audacity 3.4+ 已合并导出菜单） → Quality 设为 5（0-10，5 是音质和体积的最佳平衡点）。保存为 `shoot.ogg`。
7. **重复以上步骤**对 `explosion.wav`、`pickup.wav`、`hit.wav`、`engine.wav`、`boss_alarm.wav` 做同样的处理。

处理完之后，把 6 个 OGG 文件放在一个文件夹里，逐个播放。你应该能听到明显的品质提升：开头没有延迟、结尾没有爆音、音量统一、背景干净。这就是"产品级音效"的状态。

## 🔗 课外延伸

- **Audacity —— 一个持续了 25 年的开源奇迹：** 1999 年，卡内基梅隆大学的研究生 Dominic Mazzoni 需要一个音频编辑器来做研究。他找不到合适的开源工具，于是他决定自己写一个。25 年后，Audacity 仍然是**全球最流行的开源音频编辑器**——数亿次下载、全平台支持、超过 40 种语言。2021 年 Audacity 被 Muse Group（MuseScore 的母公司）收购，继续作为免费软件运营。这个故事揭示了一个开源工程的核心真相：**解决自己问题的工具，往往也是别人需要的工具。**
- **OGG Vorbis —— 为游戏而生的格式：** OGG 是 Xiph.Org 基金会在 2000 年发布的开源音频压缩格式。它的设计目标之一就是**无缝循环**——编码时不会像 MP3 那样在首尾插入静音帧。所以游戏引擎几乎一致推荐 OGG 作为音频格式：WAV 太大（10MB/分钟），MP3 循环有缝（编码段边界产生噼啪声），OGG 在两者之间取得了最佳平衡。

## ✅ 自测清单

1. 在 Audacity 中，为什么音效的开头和结尾要加 Fade In/Out？这和 CSS transition 的 ease-in/ease-out 在防止"视觉跳变"上有什么相似之处？
2. 降噪（Noise Reduction）的原理是"频谱减法"。如果过度降噪会有什么副作用？这和图片过度压缩导致失真有什么类比关系？
3. OGG vs WAV vs MP3 — 为什么游戏引擎优先推荐 OGG？分别从体积、循环支持、浏览器兼容性三个维度解释。
