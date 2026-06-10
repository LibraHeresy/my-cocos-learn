<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="23" title="Web 平台构建与部署" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>游戏做完了，怎么让它变成一个可以分享的链接？这一节讲 Cocos Web 构建的完整流程——从构建面板的每个选项到 Vercel 部署。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：构建面板关键选项配置">
      <ul>
        <li><strong>设计分辨率 + 适配策略：</strong> 480×800 + Fit Height——保证竖屏体验一致</li>
        <li><strong>主包压缩类型：</strong> 选"合并所有 JSON"减少网络请求</li>
        <li><strong>内联所有 SpriteFrame：</strong> 关闭（让 Auto Atlas 做合批）</li>
        <li><strong>MD5 Cache：</strong> 开启——文件名带 hash，更新时浏览器不会用旧缓存</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🚀" title="部署：Vercel / GitHub Pages">
      <pre># Vercel（推荐）
cd build/web-mobile
npx vercel --prod
# → https://pixel-plane.vercel.app

# GitHub Pages
# 把 web-mobile 目录推到 gh-pages 分支
git subtree push --prefix build/web-mobile origin gh-pages</pre>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>WebGPU 的未来：</strong> WebGPU 是 WebGL 的继任者，能更直接地访问 GPU 硬件能力。Chrome 113+ 已支持。Cocos 目前使用 WebGL，但未来迁移到 WebGPU 后，浏览器游戏的性能上限将大幅提高。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>设计分辨率（Design Resolution）和适配策略（fitHeight/fitWidth）分别控制什么？</li>
        <li>用 Vercel 部署 Cocos Web 游戏的完整流程是什么？</li>
        <li>WebAssembly（Wasm）和 WebGPU 各自对浏览器游戏有什么意义？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
