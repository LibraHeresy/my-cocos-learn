<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="24" title="原生平台构建" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>Web 版本不错，但你想把它放到 App Store 和各大应用市场——你就需要<strong>原生构建</strong>。这一节讲 JSBridge 原理和 iOS/Android 构建流程。</p>
    </ConceptBlock>

    <ConceptBlock icon="🌉" title="JSBridge：JS 怎么调用原生 API？">
      <p>Cocos 的游戏逻辑是用 TypeScript 写的（运行在 JS 引擎上），但摄像头、陀螺仪、推送通知这些能力需要调用原生平台 API。JSBridge 就是连接 JS 和 Native 的桥：</p>
      <pre>TypeScript 代码
  ↓ 调用 JSB 接口
C++ 中间层（Cocos 引擎的 native 部分）
  ↓ 调用平台 API
iOS (Objective-C/Swift) / Android (Java/Kotlin)</pre>
    </ConceptBlock>

    <ConceptBlock icon="📱" title="iOS 构建的痛点">
      <ul>
        <li>需要 Mac + Xcode</li>
        <li>需要 Apple Developer 账号（$99/年）</li>
        <li>需要配置证书（Development + Distribution）和 Provisioning Profile</li>
        <li>需要 App Store 审核（比微信小游戏审核严格得多）</li>
      </ul>
      <p>对于一个月上架的目标，<strong>先做微信小游戏和 Web，iOS/Android 原生是下一个里程碑</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：构建 Android APK">
      <p>按 Cocos 官方文档步骤：安装 Android Studio → 在 Cocos Dashboard 中配置 SDK/NDK 路径 → 在构建面板中选择 Android 平台 → 构建 APK。如果手边有 Android 手机，连接 USB 调试，用 adb install 安装到真机。如果没有，用 Android Studio 的 Virtual Device Manager 创建模拟器运行。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li>React Native 和 Cocos 都用了 JSBridge，但目标完全不同——RN 桥接 JS 到原生 UI 组件（View、Text），Cocos 桥接 JS 到 C++ 渲染引擎。同一种技术，两个方向。理解这一点能帮你区分"跨平台 UI 框架"和"跨平台游戏引擎"的本质差异。</li>
        <li>Flutter 走了第三条路：不用 JSBridge，直接在 Skia 画布上画一切。这和 Cocos 用自己的渲染引擎画一切是同一个思路。但 Flutter 画的是 Widget，Cocos 画的是 Sprite。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>JSBridge 是什么？为什么原生平台构建需要它？</li>
        <li>iOS 的签名/证书/描述文件为什么比 Android 的 APK 打包麻烦得多？</li>
        <li>Cocos Web 版和 Cocos Native 版的渲染底层有什么关系？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
