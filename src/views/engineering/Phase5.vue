<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="5" title="真机调试与性能" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>浏览器 60fps 不等于真机 60fps。移动 GPU 的渲染架构和桌面 GPU 完全不同。你不学会真机调试，上线后玩家帮你"debug"。</p></ConceptBlock>

    <ConceptBlock icon="📖" title="这台手机为什么只有 25fps？——一个真实的调试故事">
      <p>2015 年，一家美国独立游戏工作室把一个用 Unity 做的 2D 游戏发到了 iOS。他们在 Mac 上开发，模拟器里稳 60fps。发布第一天，iPhone 4s 用户涌入评论区："幻灯片游戏""卡得像 PPT"。开发者傻眼了——他们从来没有在一台真实的旧手机上跑过游戏。</p>
      <p>他们把一台 iPhone 4s 接上 Xcode，打开 GPU Report。原因触目惊心：</p>
      <ul>
        <li>每个角色都是一个独立的 DrawCall——屏幕上同时有 40 个角色 = 40 个 DrawCall。iPhone 4s 的 GPU 在 25 个 DrawCall 之后就掉帧了。</li>
        <li>背景是一张 4096×4096 的纹理——远超 iPhone 4s 的最大纹理限制（2048×2048），GPU 自动降级采样导致额外开销。</li>
        <li>每帧都在 createObject() 然后 destroy() 粒子，GC 每隔 3 秒触发一次，每次暂停 JS 80ms——连续掉 5 帧。</li>
      </ul>
      <p>这些问题在模拟器上一个都不暴露——因为 Mac 的 GPU 显存足够大，CPU 足够快，GC 暂停被高性能掩盖了。但真机不会骗你。<strong>真机是你的"最诚实 QA"——永远在最合适（最残酷）的时候告诉你真相。</strong></p>
    </ConceptBlock>

    <ConceptBlock icon="🔍" title="为什么移动端性能这么“脆”？——GPU 架构的秘密">
      <p>你写前端的时候不需要理解 GPU 架构——浏览器帮你把 CSS transform 翻译成了 GPU 指令。但做游戏——尤其是移动端游戏——你必须理解移动 GPU 和桌面 GPU 的一个根本性差异：<strong>Tile-Based Rendering（TBR，分块渲染）</strong>。</p>

      <p>桌面 GPU（NVIDIA RTX 系列、AMD RX 系列）使用 <strong>Immediate Mode Rendering（IMR，立即模式）</strong>：你发一个绘制指令，GPU 立刻画到帧缓冲上。一个角色一个 DrawCall，100 个角色 100 个 DrawCall，按顺序画上去——简单直接。但代价是：每次绘制都要读写整个帧缓冲（1920×1080×4 字节 = 约 8MB），100 次就是 800MB 的显存带宽消耗。</p>

      <p>移动 GPU（ARM Mali、Qualcomm Adreno、Apple GPU）是 <strong>Tile-Based</strong>：它把屏幕切成一个个小方块（比如 16×16 像素的 tile），一个 tile 一个 tile 地渲染。一个 tile 的大小只有几 KB，可以放在 GPU 的超高速片上缓存（On-Chip Memory）里——读取和写入都快到飞起，且不需要频繁访问主显存。对所有几何体做一轮"分拣"（Binning），决定每个 tile 里有哪些三角形，然后逐 tile 渲染。</p>

      <p>听起来 TBR 更好？是的——对于大多数场景。但 TBR 有一个致命弱点：<strong>全屏后处理效果</strong>。Bloom（发光）、Blur（模糊）、Color Grading（调色）这些效果需要对整个帧缓冲做额外 pass——它们迫使 GPU 把 tile 数据从片上缓存写回主显存，处理完再读回来。这一来一回吃掉了 TBR 省下的所有带宽优势。这就是为什么移动端游戏的后期效果要极度克制——不是 GPU 算不动，是<strong>架构不友好</strong>。</p>

      <p>这和你写 CSS 时避免在移动端大量使用 box-shadow 和 filter:blur() 是同一逻辑——看起来只是一个属性，但对移动端的渲染管线而言是重操作。</p>
    </ConceptBlock>

    <ConceptBlock icon="🎯" title="性能木桶原理——找到最矮的那块板">
      <p>一个木桶能装多少水，取决于最短的那块木板。游戏性能同理——你的游戏帧率取决于<strong>最慢的环节</strong>。</p>
      <ul>
        <li><strong>CPU 瓶颈：</strong>update() 里计算太多——每帧跑 200 个敌机的 AI 逻辑、碰撞检测、分数计算。表现：DrawCall 不高但 FPS 低。</li>
        <li><strong>GPU 瓶颈：</strong>DrawCall 太多（每个精灵单独一次绘制）、纹理太大、Shader 太复杂。表现：FPS 低但 CPU 使用率不高。</li>
        <li><strong>带宽瓶颈：</strong>纹理总大小超出显存带宽——比如 10 张 2048 的纹理同时可见，每帧都在显存和 GPU 缓存之间搬运数据。表现：FPS 在特定场景骤降（大量纹理同时出现时），换个场景恢复。</li>
        <li><strong>GC 瓶颈：</strong>JavaScript GC（垃圾回收）是 Stop-The-World 的——暂停所有 JS 执行来回收内存。如果单次 GC 超过 16ms，你就掉一帧。表现：FPS 曲线出现规律的尖刺（周期性掉帧）。</li>
      </ul>
      <p>真机调试不是"让游戏变快"——是<strong>先找出谁最慢，然后只优化那个。</strong>别一上来就"我觉得 DrawCall 太多"，把时间花在优化一个不是瓶颈的环节上。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：建立你的飞机大战性能基线">
      <ol>
        <li><strong>准备测试设备：</strong>找至少两部手机——一部高端（iPhone 12+ 或骁龙 865+ 的安卓机），一部低端（3 年以上的中低端安卓或 iPhone 8 级别）。连接微信开发者工具的"真机调试"（选择"真机调试"→扫码连接）。</li>
        <li><strong>跑三轮测试，每轮 5 分钟：</strong>
          <ul>
            <li>第一轮：正常游玩，从第 1 波打到第 5 波（或到你能打到的最高波次）</li>
            <li>第二轮：站着不动不射击，让大量敌机出现在屏幕上——测试"最多同时对象"场景</li>
            <li>第三轮：连续快速点开始→死→重开 10 次——测试"频繁场景切换"场景</li>
          </ul>
        </li>
        <li><strong>记录三项关键数据：</strong>
          <ul>
            <li><strong>FPS 最低点：</strong>三轮中 FPS 掉到过的最低值。如果在高端机低于 55、在低端机低于 25——你有性能问题。</li>
            <li><strong>内存峰值：</strong>微信开发者工具的性能面板中看 Memory 曲线。如果内存持续上升不回落——你有内存泄漏。iOS 内存上限约 300-500MB（不同机型），安卓差异更大（低端机可能只有 200MB 可用）。</li>
            <li><strong>DrawCall 峰值：</strong>Cocos 编辑器或微信开发者工具中看 DrawCall 计数。单帧 DrawCall 超过 50——移动端可能有压力。超过 100——低端机必掉帧。</li>
          </ul>
        </li>
        <li><strong>找瓶颈：</strong>把三个数据放在一起看。如果 FPS 低 + DrawCall 高 → GPU 瓶颈。如果 FPS 低 + DrawCall 正常 → CPU 瓶颈。如果内存持续上升 → GC/泄漏。如果特定波次 FPS 骤降 → 那波有特殊资源或逻辑需要排查。</li>
        <li><strong>写下基线：</strong>把这些数据记在一个文档里——这就是你的性能基线。以后每次大改动后重新跑一次，对比数据——如果 FPS 降了 10%，你立刻知道是这次改动引入了问题。这和前端性能监控中的 Lighthouse score 是同样的基线管理思路。</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>移动 GPU 的 TBR 架构不只影响渲染——影响你的设计决策：</strong>粒子特效是 TBR 的克星。每个透明粒子都需要 GPU 读写对应 tile 的帧缓冲（alpha blending 需要知道"我现在覆盖的像素之前是什么颜色"）。100 个粒子可能分布在屏幕的每个 tile 上——每个 tile 都要做额外的读写。因此移动端游戏中大规模粒子系统（比如全屏雪花、爆炸碎片铺满屏幕）很快成为瓶颈。设计时就要考虑：用精灵动画替代粒子、限制同时存在的粒子数量到 50 以下。</li>
        <li><strong>真机测试不是一次性的——是持续的过程：</strong>Supercell（《部落冲突》《皇室战争》开发商）在每台支持的设备上都有自动化测试——每次代码提交会在几百台真实手机上运行并记录性能数据。你不需要做到这个规模，但"每次大改动都在真机上跑一次"是游戏开发者的基本素养。GitHub Actions 可以在真机云（如 BrowserStack、WeTest）自动化这个流程——Phase 13 的 CI/CD 可以集成真机测试。</li>
        <li><strong>帧率目标不是"越高越好"——是"稳定就好"：</strong>60fps 突然掉到 30fps，比稳定的 30fps 体验更差。人眼对"变化"比"绝对值"敏感。所以如果低端机只能跑 30fps，不如用 frameRate 锁定在 30——让渲染节奏保持均匀。这和前端动画中使用 requestAnimationFrame 但要控制帧率预算（比如每 2 帧更新一次）是同一思路。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>移动 GPU 的 Tile-Based Rendering 和桌面 GPU 的 Immediate Mode Rendering 有什么本质区别？为什么全屏后处理在移动端是"奢侈品"？</li>
        <li>你的飞机大战可能存在四种瓶颈（CPU/GPU/带宽/GC），分别在什么表现中暴露？如何在真机上区分它们？</li>
        <li>为什么建立性能基线比"感觉变慢了"更重要？基线的三个核心指标是哪三个？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
