<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="3" title="微信小游戏适配" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>你的 Cocos Web 项目在浏览器跑得好好的——但扔进微信小游戏，一切都不一样了。这一节讲清楚"改了啥"和"为什么改"。</p></ConceptBlock>

    <ConceptBlock icon="📖" title="当你的游戏第一次“踩进”微信小游戏">
      <p>你可能经历过这种感觉：你在本地开发了一个 Vue 应用，npm run dev 一切正常。然后 npm run build，把 dist/ 扔到 Nginx 上——白屏。你打开 Console，看到一堆 404 和报错。你花了一下午发现是路由用的 history 模式而 Nginx 没配 fallback。</p>
      <p>Cocos Web 版到微信小游戏版的迁移，就是这个感觉——但放大 10 倍。你的游戏逻辑代码没变，但它的"生存环境"换了：</p>
      <ul>
        <li>浏览器里你用 fetch() 从 CDN 下载图片——微信小游戏没有 HTTP 下载的概念，资源在本地包里</li>
        <li>浏览器里 Canvas 渲染走 GPU 加速的浏览器引擎——微信小游戏里渲染走的是微信自研的渲染层</li>
        <li>浏览器里触摸事件是 addEventListener('touchstart')——微信小游戏里 wx.onTouchStart() 有自己的事件坐标系</li>
        <li>浏览器里背景音乐用 Web Audio API context.createBufferSource()——微信小游戏用 wx.createInnerAudioContext()</li>
      </ul>
      <p>好消息是：Cocos 引擎团队已经帮你处理了<strong>大部分</strong>适配工作。你不需要知道 wx.* API 的每一个细节——Cocos 的"构建微信小游戏"功能在底层做了 JSB→wx.* 的映射。但"大部分"不是"全部"——有一些坑你必须亲自踩过才真正理解。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔍" title="适配层在做什么？——三条主线">
      <p>当你点击 Cocos Creator 菜单栏的"项目→构建发布"并选择"微信小游戏"，引擎在背后做了三件事：</p>

      <p><strong>1. 渲染适配：Canvas 2D/WebGL → 微信双线程渲染。</strong>在浏览器里，Cocos 直接操作 Canvas 的 WebGL 上下文——创建纹理、绑定帧缓冲、执行绘制调用。但在微信小游戏里，逻辑线程不能直接操作渲染。Cocos 的适配层会拦截所有 WebGL 调用，把它们转换成微信渲染指令，通过 JS Bridge 发送到渲染线程执行。这个转换过程叫"命令缓冲"（Command Buffer）——类似 Vue 的虚拟 DOM diff 之后生成 patch 指令再应用到真实 DOM。</p>

      <p><strong>2. 资源加载适配：HTTP 下载 → 本地包管理。</strong>在浏览器里，一张图片的加载路径是 https://cdn.example.com/sprites/player.png。但在微信小游戏里，资源在你的包文件里——<code>wx.env.USER_DATA_PATH</code> 指向的本地目录。Cocos 把 assetManager 的加载流程适配到了微信的文件系统 API。关键限制：<strong>主包不能超过 4MB</strong>。这意味着你不能像写 Web 项目那样"所有图片都放 assets/ 里"。</p>

      <p><strong>3. 输入适配：DOM 触摸事件 → wx 触摸事件。</strong>浏览器的 touchstart/touchmove/touchend 事件给你的是 clientX/clientY，坐标系是视口。微信小游戏的 wx.onTouchStart 给你的是 x/y，坐标系是 Canvas 的画布坐标系（需要考虑 devicePixelRatio 缩放）。Cocos 的适配层把这些差异统一成了引擎内部的 InputManager，你写的飞机移动代码不需要改——但如果你之前手动用 addEventListener 处理了触摸事件，就需要换成 Cocos 的输入系统。</p>

      <p>这和前端领域"一套前端代码跑在 Web/iOS/Android 三端"的跨平台框架（React Native、Flutter）面临的问题本质相同：<strong>平台差异总是在"你以为没问题"的地方咬你一口</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="📦" title="4MB 的紧箍咒——分包策略">
      <p>微信小游戏的主包（代码 + 启动资源）不能超过 4MB。这个数字从 2017 年上线到现在没变过。为什么？因为微信希望你的游戏<strong>秒开</strong>——用户点分享卡片到进入游戏，主包下载时间要控制在 3 秒以内。</p>
      <p>你可以用<strong>分包（Subpackage）</strong>来突破限制。分包总大小不超过 20MB（2023 年后提升到了 30MB）。分包的加载策略如下：</p>
      <div style="background:var(--color-surface);padding:16px;border-radius:8px;margin:12px 0;font-family:monospace;font-size:0.9em;">
<strong>主包</strong>（&lt; 4MB）：Core 脚本 + 启动场景 + 核心 UI 素材<br/>
├── <strong>bundle-art</strong>（美术资源——精灵帧、动画、像素画图集）<br/>
├── <strong>bundle-audio</strong>（音频资源——SFX 音效 + BGM 背景音乐）<br/>
└── <strong>bundle-levels</strong>（关卡数据——波次配置、敌机参数）
      </div>
      <p>在 Cocos 资源管理器中，右键点击文件夹 → "配置为 Bundle"即可。主包只放游戏启动必须的资源（Logo 场景、加载动画、主菜单 UI），其他资源放到分包。<strong>用户不一定会玩到你所有的内容，所以不要一开始就把所有资源都下载</strong>——这和 Webpack 的 code splitting 通过 import() 懒加载组件是同一逻辑。</p>
      <p>一个实际数字参考：一张 2048×2048 的 RGBA 纹理占用约 16MB 显存，但 PNG 压缩后只有几百 KB。你的分包体积压力通常不在代码上——<strong>在纹理和音频上</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：做一次完整的微信小游戏构建">
      <ol>
        <li><strong>构建：</strong>在 Cocos Creator 菜单栏选择"项目 → 构建发布"。发布平台选"微信小游戏"。填写你的 AppID（Phase 2 注册时拿到的那个）。其他设置保持默认，点击"构建"。等待 1-3 分钟，Cocos 会在 build/ 目录下生成一个 wechatgame 文件夹。</li>
        <li><strong>打开：</strong>用微信开发者工具打开 build/wechatgame 目录。你会看到一个项目列表——点击"导入"，选择这个目录。点击"预览"，微信开发者工具会在内置模拟器中运行你的游戏。</li>
        <li><strong>逐项对比 Web 版差异：</strong>打开两个窗口——一个是你 Cocos 编辑器里的浏览器预览，一个是微信开发者工具的模拟器。对比以下项目，记下每个差异：
          <ul>
            <li>资源加载方式变了（Network 面板看不到 HTTP 请求了——资源从本地包直接读取）</li>
            <li>Canvas 渲染方式变了（Performance 面板的 FPS 曲线可能不一样）</li>
            <li>触摸事件映射变了（触摸灵敏度和 Web 版不同——注意滑动是否跟手）</li>
            <li>音频播放方式变了（如果之前用了 Web Audio API 的自定义效果，可能不生效）</li>
            <li>包体大小——在开发者工具里看主包大小，如果在 4MB 附近就要考虑分包</li>
          </ul>
        </li>
        <li><strong>记录解决方案：</strong>每发现一个差异，在笔记里写下来：差异是什么？原因是什么？怎么解决？比如"音频播放延迟比 Web 版高 200ms——因为 InnerAudioContext 初始化解码需要时间——解决方案：在 onLoad 时预创建 Audio 实例但暂不播放"。</li>
        <li><strong>分包验证：</strong>如果你已经在 Cocos 里设置了 Bundle，在微信开发者工具的"代码质量"面板中能看到主包和各分包的大小。确认主包 &lt; 4MB。</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>Cocos 是微信小游戏的"一等公民"——但一等公民也有代价：</strong>Unity 至今没有官方的微信小游戏导出方案（有第三方方案但不够稳定）。Unreal 在移动端小游戏上完全不适用。Cocos 从 2016 年起就和微信小游戏团队深度合作——你在 Cocos 构建面板选"微信小游戏"那一刻，引擎帮你做了上百个适配点的自动转换。这是效率上的明智选择。但同时，你的游戏性能上限受限于 Cocos 适配层的实现质量——部分高开销操作（大量粒子、全屏后期特效）可能需要你绕过引擎直接调 wx API 来优化。就像你用 Vue 开发时，大部分场景用 template + v-bind 就够了，但极致性能场景（虚拟滚动列表）需要你手动操作真实 DOM。</li>
        <li><strong>4MB 不是微信独有的限制：</strong>Google Play Instant（安卓免安装应用）的 APK 上限是 15MB。Apple 的 App Clips 上限是 15MB。所有平台都在追求"点击即玩"——下载体积越小，转化率越高。微信的 4MB 是最激进的——它对应的不是"快速"，是"瞬间"。这也解释了为什么微信小游戏大多数是"轻量休闲"类型——《羊了个羊》的整个游戏包不到 2MB。</li>
        <li><strong>音频适配的坑比渲染更深：</strong>Web Audio API 的 AudioContext 支持 createBufferSource() 精确控制播放时间（你可以把两个 buffer 无缝拼接）。但微信的 InnerAudioContext 是"黑盒"——你只能 play()、pause()、stop()，没有 buffer 级别的控制。这意味着在 Web 版上做了复杂音频逻辑（BGM 无缝循环、音效叠加）的游戏在微信小游戏上可能需要重写音频系统。这和前端开发中"Chrome 支持的 API Safari 不支持"是一个性质——提前知道差异比上线后 debug 高效得多。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>Cocos Web 版到微信小游戏版，哪三个方面的变化最大？每个变化背后的原因是什么？</li>
        <li>微信小游戏的 4MB 主包限制为了什么设计目标？分包策略和 Webpack 的 code splitting 有什么相似之处？</li>
        <li>为什么 Cocos 引擎会帮你做"JSB → wx.* API"的映射？如果没有这个映射层，你需要自己处理什么？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
