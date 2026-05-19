<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="3" title="资源与渲染" duration="2-3 天">
    <ConceptBlock icon="📦" title="资源管理基础">
      <p>Cocos 中所有外部资源（图片、音频、字体、预制体）都放在 <code>assets/</code> 目录下，由编辑器统一管理，运行时动态加载。</p>

      <pre><code>import { resources, SpriteFrame } from 'cc'

resources.load('textures/plane/spriteFrame', SpriteFrame, (err, sf) => {
  if (err) { console.error(err); return }
  this.getComponent(Sprite).spriteFrame = sf
})</code></pre>

      <div class="warn-box">
        <strong>注意：</strong>动态加载是异步的，和 Vue 中 <code>import()</code> 一样需要处理异步逻辑。生产项目通常会先进入预加载场景（Loading 界面）。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🖼️" title="Sprite（精灵）—— 游戏世界的 &lt;img&gt;">
      <p>Sprite 是 2D 游戏最基础的渲染组件，负责在屏幕上绘制图片。</p>

      <h3>SpriteFrame vs Atlas</h3>
      <ul>
        <li><strong>SpriteFrame：</strong>单张图片切出的某一帧。一张大图可以切出多个 SpriteFrame。</li>
        <li><strong>Atlas（图集）：</strong>多张小图合并成一张大图。减少 GPU 纹理切换次数，显著提升性能。</li>
      </ul>

      <div class="tip-box">
        <strong>最佳实践：</strong>像素飞机大战建议使用 Atlas 图集——把所有飞机、子弹、特效的帧打包到一个 Atlas 中，一次加载，随处使用。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎬" title="Animation（动画）">
      <p>Cocos 提供两种动画方式，像素风游戏都会用到：</p>

      <h3>帧动画（SpriteFrame 序列播放）</h3>
      <pre><code>// 像素爆炸效果：快速切换一系列 SpriteFrame
// 爆炸帧1 → 爆炸帧2 → 爆炸帧3 → ...
// 通过 Animation 组件或代码控制 spriteFrame 切换</code></pre>

      <h3>Tween 补间动画</h3>
      <pre><code>import { tween } from 'cc'

// 类比 CSS transition / Vue Transition 组件
tween(this.node)
  .to(1, { scale: { x: 1, y: 1 } })
  .to(0.2, { scale: { x: 1.2, y: 1.2 } })
  .to(0.2, { scale: { x: 1, y: 1 } })
  .start()</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🔤" title="Label（文字）">
      <p>游戏中的文字用 Label 组件渲染，支持系统字体和 BMFont 位图字体。像素风游戏推荐使用 BMFont，与像素美术风格完美统一。</p>
    </ConceptBlock>
  </PhaseLayout>
</template>
