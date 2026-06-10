<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="22" title="Spine 骨骼动画" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>帧动画画每一帧都要手绘——6 帧爆炸动画 = 6 张图。Spine 用<strong>骨骼驱动</strong>——一套骨骼可以摆出无限种姿势。这一节讲帧动画和骨骼动画的选型决策。</p>
    </ConceptBlock>

    <ConceptBlock icon="⚖️" title="帧动画 vs Spine：选型对比">
      <table>
        <thead><tr><th>维度</th><th>帧动画</th><th>Spine 骨骼</th></tr></thead>
        <tbody>
          <tr><td>包体</td><td>每帧一张图（6 帧爆炸 = 6 张）</td><td>一张纹理 + 骨骼数据（小得多）</td></tr>
          <tr><td>流畅度</td><td>帧率固定，中间帧要手画</td><td>骨骼插值，任意帧率都平滑</td></tr>
          <tr><td>复用性</td><td>每个动画独立，不能换皮</td><td>同一骨骼可换不同皮肤</td></tr>
          <tr><td>工作流</td><td>美术画完就用，简单粗暴</td><td>需要建骨骼+蒙皮+调动画，学习成本高</td></tr>
          <tr><td>表现力</td><td>逐帧手绘，每一帧都是艺术品</td><td>骨骼驱动，有"木偶感"</td></tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🦴" title="Spine 核心概念">
      <ul>
        <li><strong>骨骼（Bone）：</strong> 骨架的关节。父骨骼动，子骨骼跟着动（和 Node Tree 一样）</li>
        <li><strong>插槽（Slot）：</strong> 骨骼上的"挂载点"，用来放附件</li>
        <li><strong>附件（Attachment）：</strong> 挂在插槽上的图片——Sprite 的片段</li>
        <li><strong>皮肤（Skin）：</strong> 同一套骨骼换不同的附件——换皮功能</li>
        <li><strong>动画混合：</strong> 两个动画之间的平滑过渡——走→跑→冲刺无缝切换</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🎮" title="飞机大战该用哪个？">
      <p>正确答案是<strong>帧动画</strong>。你的需求很简单——爆炸动画、引擎火焰、待机浮动。这些用帧动画 6-10 帧就够，不需要引入 Spine 的复杂度。但了解 Spine 是必要的——当你做下一个游戏（平台动作、RPG），角色需要"跑/跳/攻击/受伤/死亡"五套动画+多套皮肤时，Spine 的优势就显现了。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：导入并控制 Spine 动画">
      <p>导入一个 Spine 动画资源（.json + .atlas + .png）。在场景中创建 SkeletonAnimation 节点，拖入 SkeletonData。在属性检查器中设置 Animation 为 idle。写一段 TypeScript 代码：单击播放 attack 动画，松开回到 idle，用 setAnimation(0, 'idle', true) 和 setAnimation(0, 'attack', false)。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>《空洞骑士》的混合方案：</strong> Team Cherry 用传统手绘帧动画做角色动作，但用骨骼动画辅助特效层和背景视差。这种"核心动作逐帧+辅助层骨骼"的混合方案是独立游戏中的常见做法。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>Spine 骨骼动画相比序列帧动画，在包体大小、流畅度、复用性上各有什么优势？</li>
        <li>骨骼（Bone）、插槽（Slot）、附件（Attachment）、皮肤（Skin）在 Spine 中分别扮演什么角色？</li>
        <li>动画混合（Blend）的技术原理是什么？从走到跑的过渡是怎么实现的？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
