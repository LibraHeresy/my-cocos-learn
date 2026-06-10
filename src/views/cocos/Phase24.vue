<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="24" title="原生平台构建" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>你做了一个 H5 游戏，自信满满地发给朋友。iPhone 朋友说："Safari 里打开有点卡，能不能做个 App？" Android 朋友说："我不用浏览器玩游戏。"<strong>原生平台的构建就是把 Cocos 项目变成 .apk 和 .ipa 文件——真实存在于手机桌面上，打开就能玩，不需要浏览器。</strong>这一节讲 JSBridge 原理、iOS/Android 构建流程、以及为什么"先做 Web 再做原生"是务实策略。</p>
    </ConceptBlock>

    <ConceptBlock icon="🌉" title="JSBridge：TypeScript 怎么调用手机的陀螺仪和摄像头？">
      <p>Cocos 的游戏逻辑是用 TypeScript 写的——跑在 JavaScriptCore（iOS）或 V8（Android）引擎上。这层 JS 引擎负责运行你的游戏代码，但它不认识手机的底层 API——陀螺仪、摄像头、推送通知、应用内购。</p>
      <p>JSBridge 就是连接 JS 引擎和原生平台 API 的桥：</p>
      <pre>你的 TypeScript 游戏代码
  ↓ 调用 JSB 接口（如 jsb.reflection.callStaticMethod）
C++ 中间层（Cocos 引擎的 native 绑定层）
  ↓ JNI 调用（Android）/ Objective-C 消息发送（iOS）
原生平台 API（陀螺仪、摄像头、微信 SDK、广告 SDK）

// 前端类比：
// TypeScript 代码     → postMessage('callNative', {api: 'gyro'})
// C++ 中间层          → 相当于 iframe 的 contentWindow 或 Web Worker
// 原生 API            → 另一个 JS context 里的处理函数</pre>
      <p>这个模型和跨平台 UI 框架的桥接原理非常像——但有本质区别：</p>
      <table>
        <thead><tr><th>框架</th><th>桥接目标</th><th>桥接什么</th><th>类比</th></tr></thead>
        <tbody>
          <tr><td><strong>React Native</strong></td><td>JS → 原生 UI 组件</td><td>桥接 Component → View/Text/Image</td><td>如果你在 RN 里写 <code>&lt;View&gt;</code>，它变成 Android 的 <code>ViewGroup</code></td></tr>
          <tr><td><strong>Capacitor</strong></td><td>WebView → 原生 API</td><td>桥接 DOM → Camera/Geolocation</td><td>Web 应用通过插件调用原生能力</td></tr>
          <tr><td><strong>Cocos Creator</strong></td><td>JS → C++ 渲染引擎</td><td>桥接 TypeScript 逻辑 → C++ 渲染核心</td><td>JS 管游戏逻辑（update、碰撞），C++ 管画画（GPU 渲染）</td></tr>
        </tbody>
      </table>
      <p>React Native 桥接的是"UI 组件"（Div 变 View），Cocos 桥接的是"渲染能力"（JS 计算变换矩阵，C++ 去画）。同一个技术——通信桥——用在完全不同的目的上。理解这一点能帮你区分"跨平台 UI 框架"和"跨平台游戏引擎"的本质差异。</p>
    </ConceptBlock>

    <ConceptBlock icon="📱" title="iOS 构建的痛点——证书、签名和审核">
      <p>Android 的 APK 可以随便装——你需要签名，但可以用自签名证书。iOS 不行。Apple 对 App 分发的控制严格得多：</p>
      <ul>
        <li><strong>需要 Mac + Xcode：</strong> iOS 构建只能在 macOS 上完成。如果你用 Windows 开发，你需要有一台 Mac（或者用云上的 Mac 构建服务）。Cocos 编辑器可以在 Windows 上导出 Xcode 项目——但不能编译它。</li>
        <li><strong>需要 Apple Developer Program：</strong> $99/年。比 GitHub Copilot 的年费还贵——但这是上架 App Store 的必须成本。</li>
        <li><strong>需要配置证书：</strong> 开发证书（跑在真机上调试）+ 分发证书（打包上架 App Store）。证书需要 CSR（Certificate Signing Request）→ Apple 签发 → 下载安装到 Keychain。这个过程对不熟悉 Apple 生态的开发者来说非常痛苦。</li>
        <li><strong>需要 Provisioning Profile：</strong> 把"证书 + App ID + 设备列表"打包成一个描述文件。Xcode 自动管理的话简单很多——但不理解原理，出问题会无从排查。</li>
        <li><strong>App Store 审核：</strong> Apple 的人工审核比微信小游戏审核严格得多——他们会实际打开你的游戏、检查崩溃、检查隐私政策、检查是否符合设计规范。审核周期通常在 1-3 天。被拒的理由可能很奇怪（"你的游戏没有足够的原生 iOS 交互"），你可能需要多次提交才能过。</li>
      </ul>
      <p><strong>前端类比：iOS 的证书/签名/描述文件 = HTTPS/SSL 证书链。</strong>你需要从 CA（Apple）签发证书 → 用证书签名 App → 设备信任证书链才能安装。和你的网站配 Let's Encrypt 证书后浏览器才显示绿锁是一个道理——都是"信任链"的验证问题。</p>
      <div class="tip-box">
        <strong>务实建议：</strong> 对于一个月上架的目标，<strong>先做微信小游戏和 Web 版</strong>，iOS/Android 原生是下一个里程碑。原生构建的成本（学 Xcode/Android Studio、配证书、审审核）至少需要额外 1-2 周——而且大部分工作不是"写代码"，而是"配环境、填表单、等审核"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🤖" title="Android 构建：比 iOS 友好得多">
      <p>Android 构建的流程相对简单：</p>
      <ol>
        <li><strong>安装 Android Studio：</strong> 这是必须的——Cocos 需要 Android SDK 和 NDK（Native Development Kit，用来编译 C++ 渲染引擎为 ARM 指令）。</li>
        <li><strong>配置 SDK/NDK 路径：</strong> 在 Cocos Dashboard → 偏好设置 → Native Develop 中设置 Android SDK 和 NDK 路径。</li>
        <li><strong>构建 APK：</strong> Cocos 菜单栏 → 项目 → 构建发布 → 选择 Android 平台 → 构建。第一次构建会下载 Gradle 依赖——耐心等，这是正常的。</li>
        <li><strong>安装到真机：</strong> 手机开启 USB 调试 → 连接电脑 → 用 <code>adb install build/android/pixel-plane-battle.apk</code> 安装。如果你没有 Android 手机，用 Android Studio 的 AVD Manager（Android Virtual Device）创建模拟器。</li>
      </ol>
      <p>Android 的签名密钥你可以用 Java 的 <code>keytool</code> 命令自签——不需要任何外部机构审批。这也是为什么 Android 生态的独立游戏和小团队作品远比 iOS 多的原因：发布门槛低很多。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔄" title="渲染引擎的三种运行时：Web / Native / 小游戏">
      <p>Cocos 的渲染引擎在三种平台上用了三种不同的底层实现——但对你的 TypeScript 代码来说，接口是一样的：</p>
      <table>
        <thead><tr><th>运行时</th><th>渲染底层</th><th>JS 引擎</th><th>包体</th><th>性能</th></tr></thead>
        <tbody>
          <tr><td><strong>Web（WebGL）</strong></td><td>WebGL 2.0（→ GPU）</td><td>V8 / JavaScriptCore / SpiderMonkey（浏览器内置）</td><td>最小（HTML+JS+WASM+纹理）</td><td>中等（受浏览器沙箱限制）</td></tr>
          <tr><td><strong>Native（OpenGL ES）</strong></td><td>OpenGL ES 3.0 / Metal（直接调 GPU）</td><td>V8（Android）/ JavaScriptCore（iOS）</td><td>较大（打包了完整的 C++ 引擎 + JS 引擎 + 资源）</td><td>最高（无浏览器开销）</td></tr>
          <tr><td><strong>微信小游戏</strong></td><td>微信自研渲染引擎（底层仍是 OpenGL ES）</td><td>微信定制的 V8（Android）/ JavaScriptCore（iOS）</td><td>有严格限制（主包 4MB + 分包）</td><td>中等（微信运行环境有额外开销）</td></tr>
        </tbody>
      </table>
      <p>关键点：<strong>你的 TypeScript 游戏逻辑代码在三种运行时上是完全一样的</strong>——你不需要写"Web 版本的 update"和"原生版本的 update"。这就是 Cocos 作为游戏引擎的价值——它抽象了平台差异，给你统一的 API。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <p>不要求掌握，但如果你感兴趣，这些都是值得了解的故事：</p>
      <ul>
        <li><strong>React Native 的 JSBridge vs Cocos 的 JSBridge——同一个原理，不同的终点：</strong> React Native 的 JSBridge 把所有 JS 对原生组件的调用序列化为 JSON 消息，通过一个异步队列传给 Native 端——Native 端解析 JSON、创建/更新原生 View、把结果回传。这个架构的瓶颈在于"桥"本身——大量 UI 交互时 JSON 序列化和线程切换成为瓶颈（这也就是为什么 RN 后来推出了新架构 JSI——直接在 JS 线程调用 C++ 方法，跳过 JSON 序列化）。Cocos 的 JSBridge 不需要序列化那么多数据——大部分渲染工作在 C++ 端自主完成，JS 只需要发"角色位置变了"这样的轻量指令。所以 Cocos 的桥接瓶颈比 RN 小得多。</li>
        <li><strong>Flutter 拒绝了 JSBridge——在 Skia 上画一切：</strong> Flutter 从第一天起就没有用 JSBridge——它在每个平台上内嵌了一个 Skia 渲染引擎（Google 的 2D 图形库），所有 UI 都由 Skia 直接画到 GPU 上。这和 Cocos Native 版的做法完全一致——Cocos 内嵌自己的 C++ 渲染引擎，不经过原生 UI 组件系统。Flutter 画的是 Widget，Cocos 画的是 Sprite——同一个技术路线，不同的应用领域。</li>
        <li><strong>微信小游戏的 JSBridge——JS ↔ WeChat Native SDK 的通信层：</strong> 微信小游戏运行在微信的定制 JS 引擎中。当你调用 <code>wx.login()</code> 或 <code>wx.shareAppMessage()</code> 时，背后是通过微信自己的 JSBridge 把 JS 调用传给微信 App 的原生层。这个桥是微信团队维护的——你不需要关心底层，只需要调 <code>wx.*</code> API。但这个桥也有限制——不是所有原生能力都开放给你。微信小游戏给游戏开发者的 API 集合是精心筛选过的，这就是为什么小游戏生态比原生 App 生态更"安全"——但也更受限。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <p>学完这一节，你应该能回答这些问题：</p>
      <ol>
        <li>JSBridge 是什么？为什么原生平台构建需要它，而 Web 平台不需要？Cocos 的 JSBridge 和 React Native 的 JSBridge 在"桥接的目标"上有什么本质区别？</li>
        <li>iOS 的签名/证书/描述文件体系为什么比 Android 的 APK 打包麻烦得多？如果你用 Windows 开发，要构建和测试 iOS 版本，最少需要什么硬件和账号？</li>
        <li>Cocos 游戏在 Web（WebGL）、Native（OpenGL ES）、微信小游戏三种运行时上，TypeScript 代码是否通用？渲染底层有什么区别？性能排序是怎样的？</li>
        <li>你的飞机大战要做微信小游戏版本——主包限制 4MB，但你的纹理和音频加起来已经 5MB 了。你会用什么策略把资源塞进限制里？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
