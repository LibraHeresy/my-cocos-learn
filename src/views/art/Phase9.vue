<script setup lang="ts">
import ArtPhaseLayout from '@/components/ArtPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <ArtPhaseLayout :phase="9" title="背景设计进阶" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>掌握<strong>视差层规划方法论</strong>——不是简单地分"远中近"三层，而是根据场景需求决定层数、内容和速度比</li>
        <li>理解<strong>大气透视</strong>（Atmospheric Perspective）在像素画中的表现——远端物体降低对比度、向天空色偏移</li>
        <li>为一组背景层建立<strong>环境色彩和谐</strong>——所有层的颜色来自同一个"色调家族"</li>
        <li>通过<strong>纯色板换色</strong>将同一套背景素材变身森林/沙漠/太空/天空四种主题</li>
        <li>设计<strong>不会露出拼接痕迹</strong>的 Tileset 背景——不止是无缝 Tile，更是"看不出在平铺"的 Tile</li>
        <li>用<strong>CSS 的 z-index 思维模型</strong>理解和规划游戏背景的层叠与滚动关系</li>
      </ul>
    </ConceptBlock>

    <!-- ============ Phase7 回顾与本节定位 ============ -->
    <ConceptBlock icon="🔗" title='本节与 Phase 7 的关系——从"知道"到"精通"'>
      <p>
        <strong>Phase 7（进阶像素技巧）</strong>中首次介绍了视差滚动的基本概念——远中近三层、不同的移动速度和两图接力法。当时的目标是"<strong>能跑起来</strong>"：让三层背景各自动起来就行。
      </p>
      <p>
        <strong>本节（Phase 9）的目标是"<strong>能设计出来</strong>"。</strong>你不再满足于"有三层就行"，而是开始思考：
      </p>

      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>Phase 7 讲了什么</th>
            <th>Phase 9 要深入什么</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>层数</strong></td>
            <td>固定三层（远/中/近）</td>
            <td><strong>怎么决定用几层</strong>——什么时候 3 层够了，什么时候要 5 层甚至更多</td>
          </tr>
          <tr>
            <td><strong>速度</strong></td>
            <td>每层一个固定速度比例（15%/50%/90%）</td>
            <td><strong>速度比怎么算</strong>——如何让视差效果"自然"而不是"机械"，速度比的数学直觉</td>
          </tr>
          <tr>
            <td><strong>颜色</strong></td>
            <td>暗色远景 + 亮色近景</td>
            <td><strong>大气透视的完整色变链</strong>——从最远到最近的颜色是怎么一步步变化的</td>
          </tr>
          <tr>
            <td><strong>Tile</strong></td>
            <td>Tileset 无缝拼接的基本概念</td>
            <td><strong>怎么让 Tile 看不出在平铺</strong>——打破 grid 感的技巧、多层交叠隐藏接缝</td>
          </tr>
          <tr>
            <td><strong>主题</strong></td>
            <td>只讲了飞机大战的星空背景</td>
            <td><strong>多主题快速切换</strong>——一套素材，四种场景（森林/沙漠/太空/天空）</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>阅读建议：</strong>如果你还没看完 Phase 7 的视差滚动部分，建议先回去看一遍。Phase 7 讲的是"怎么做"，本节讲的是"为什么要这样做"以及"能不能做得更好"。这是从"<strong>实现者</strong>"到"<strong>设计者</strong>"的思维转变。
      </div>
    </ConceptBlock>

    <!-- ============ 视差层规划方法论 ============ -->
    <ConceptBlock icon="📐" title='视差层规划——"到底用几层"的科学'>
      <p>
        Phase 7 给了一个三层方案（远/中/近），但这只是一个<strong>起点</strong>，不是黄金法则。实际项目中的层数取决于三个因素：<strong>场景复杂度、性能预算、美术资源量</strong>。
      </p>

      <h3>决定层数的三个因素</h3>
      <table>
        <thead>
          <tr>
            <th>因素</th>
            <th>少层（2-3 层）</th>
            <th>中层（4-5 层）</th>
            <th>多层（6+ 层）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>场景复杂度</strong></td>
            <td>简单场景——星空、纯色渐变天空</td>
            <td>中等场景——森林（树冠+树干+灌木+地面）、城市场景</td>
            <td>复杂场景——多层山脉、城市天际线、地牢多层结构</td>
          </tr>
          <tr>
            <td><strong>性能预算</strong></td>
            <td>移动端/小游戏——每层都要占用 DrawCall 和内存</td>
            <td>桌面端/一般移动端——5 层以内通常没问题</td>
            <td>PC 独佔或主机——预算充足</td>
          </tr>
          <tr>
            <td><strong>美术资源量</strong></td>
            <td>小团队/独立开发——画不了太多层</td>
            <td>中型项目——每层有独立素材</td>
            <td>大团队——专人负责背景</td>
          </tr>
        </tbody>
      </table>

      <h3>层数规划决策树</h3>
      <pre><code>你的场景有"天空"吗？
        ├── 是 → 第 1 层：天空底色（不需要纹理，Canvas 纯色即可，速度=0%）
        │         └── 天空中有"静态远物"吗（远山、远建筑、星空）？
        │             ├── 是 → 第 2 层：远物层（速度 5-15%）
        │             └── 否 → 跳过
        └── 否（室内/地牢场景）→ 从墙壁/天花板背景开始

        场景中有"中距离物体"吗（树、建筑、云、山）？
        ├── 是 → 可以拆分吗？
        │         ├── 是 → 第 3 层：中远景（速度 20-40%）
        │         │        第 4 层：中近景（速度 50-70%）
        │         └── 否 → 第 3 层：中景（速度 30-50%）
        └── 否 → 跳过

        需要"前景遮挡"吗（给玩家"身临其境"的感觉）？
        ├── 是 → 第 N 层：前景装饰（速度 80-120%，可以比相机快）
        └── 否 → 结束</code></pre>

      <h3>速度比的数学直觉</h3>
      <p>
        Phase 7 给的速度（15%/50%/90%）是<strong>经验值</strong>。实际上，视差速度比背后有一个物理直觉——<strong>越近的物体，在相机移动时视觉位移越大</strong>。
      </p>
      <p>
        一个有用的公式：<strong>第 N 层的速度 = 基础速度 x (N / 总层数)</strong>。例如 5 层背景，基础速度 120 px/s：
      </p>

      <table>
        <thead>
          <tr>
            <th>层级</th>
            <th>N / 总层数</th>
            <th>速度比例</th>
            <th>实际速度</th>
            <th>内容示例</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>第 1 层（最远）</td>
            <td>1/5 = 0.20</td>
            <td>20%</td>
            <td>24 px/s</td>
            <td>天空底色/远山轮廓</td>
          </tr>
          <tr>
            <td>第 2 层</td>
            <td>2/5 = 0.40</td>
            <td>40%</td>
            <td>48 px/s</td>
            <td>云层/远星团</td>
          </tr>
          <tr>
            <td>第 3 层</td>
            <td>3/5 = 0.60</td>
            <td>60%</td>
            <td>72 px/s</td>
            <td>中型星云/中距离山体</td>
          </tr>
          <tr>
            <td>第 4 层</td>
            <td>4/5 = 0.80</td>
            <td>80%</td>
            <td>96 px/s</td>
            <td>近处星团/树木</td>
          </tr>
          <tr>
            <td>第 5 层（最近）</td>
            <td>5/5 = 1.00</td>
            <td>100%</td>
            <td>120 px/s</td>
            <td>前景漂浮物/大流星</td>
          </tr>
        </tbody>
      </table>

      <p>
        这个公式不是绝对的，但提供了一个<strong>均匀分布</strong>的起点。在实际情况中，你可以微调——让近景更快（120%）、远景更慢（10%）来<strong>增强深度感</strong>。速度差越大 → 深度感越强，但太大会不自然。
      </p>

      <div class="tip-box">
        <strong>前端类比：</strong>这就像 CSS 中 <code>perspective</code> 属性设置景深距离。<code>perspective: 200px</code> 的景深效果非常强烈（速度差大），<code>perspective: 1000px</code> 的效果柔和（速度差小）。在像素游戏中，速度差就是你的 perspective 值——用速度比例模拟不同的"景深距离"。
      </div>

      <h3>每层"放什么"的原则</h3>
      <p>不是有了层就往里面随便塞图。每层的内容应该满足：</p>
      <ol>
        <li><strong>同层物体在现实中有相似的"距离感"</strong>——不要把远山和近处树叶放在同一层</li>
        <li><strong>同层物体的视觉密度一致</strong>——如果第 2 层全是稀疏小星点，就不要突然塞一个巨大的星云进去（破坏该层的"深度统一感"）</li>
        <li><strong>层与层之间有"呼吸空间"</strong>——不要让相邻两层的物体重叠太多。如果第 3 层的内容和第 4 层大面积重叠，玩家看到的不是深度，而是混乱</li>
        <li><strong>每层的透明度/亮度可以微调</strong>——越远的层越暗、越透明（或越接近天空色），这和大气透视有关（下一节）</li>
      </ol>
    </ConceptBlock>

    <!-- ============ 大气透视 ============ -->
    <ConceptBlock icon="🌫️" title="大气透视——为什么远处的山是蓝色的">
      <p>
        <strong>大气透视（Atmospheric Perspective）</strong>是现实世界中远处的物体看起来更模糊、对比度更低、颜色偏蓝（或偏天空色）的现象。在像素画中，我们<strong>人为地模拟这种效果</strong>来增强深度感。
      </p>

      <h3>大气透视的四条规则</h3>
      <table>
        <thead>
          <tr>
            <th>规则</th>
            <th>像素画实现</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. 对比度递减</strong></td>
            <td>远层的亮部和暗部差距变小。最远层的亮/暗可能只差 10-15% 明度</td>
            <td>CSS <code>filter: contrast(0.3)</code> 应用在最远层</td>
          </tr>
          <tr>
            <td><strong>2. 饱和度递减</strong></td>
            <td>远层的颜色饱和度降低。鲜艳的红变成灰红，亮黄变成淡黄</td>
            <td>CSS <code>filter: saturate(0.2)</code> 应用在最远层</td>
          </tr>
          <tr>
            <td><strong>3. 色相向天空色偏移</strong></td>
            <td>远层的所有颜色混入一定比例的天空色。蓝天场景 → 远层偏蓝。黄昏场景 → 远层偏橙</td>
            <td>CSS 中叠加一个半透明蓝色遮罩层，或用 <code>mix-blend-mode</code></td>
          </tr>
          <tr>
            <td><strong>4. 细节递减</strong></td>
            <td>远层不要画小细节。16x16 的远山用 4-6 个像素的大色块即可，不需要纹理</td>
            <td>远层素材的分辨率可以更低——相当于"远景 LOD"</td>
          </tr>
        </tbody>
      </table>

      <h3>飞机大战星空场景中的大气透视</h3>
      <p>
        在太空场景中，虽然没有"空气"，但可以用<strong>亮度透视</strong>来替代——远处的星体更暗、更接近背景色（深黑），近处的星体更亮、颜色更鲜明。
      </p>

      <pre><code>// 飞机大战的五层大气透视色板
        // 天空底色（最远）：#0a0a1a —— 极深的蓝黑色
        //
        // 第 1 层（远星点）：
        //   星点颜色 → 混入 60% 底色 → 实际颜色是深蓝灰
        //   对比度：极低（星点 vs 底色 仅差 15-20 明度）
        //
        // 第 2 层（远星云）：
        //   星云颜色 → 混入 40% 底色 → 暗紫/暗蓝
        //   对比度：低
        //
        // 第 3 层（中距星团）：
        //   星团颜色 → 混入 20% 底色 → 较鲜明的蓝/紫
        //   对比度：中
        //
        // 第 4 层（近距星云）：
        //   星云颜色 → 不混入底色 → 饱和的蓝/紫/粉
        //   对比度：高
        //
        // 第 5 层（前景流星/碎星）：
        //   纯白/亮金/亮蓝 → 完全不混底色的鲜艳颜色
        //   对比度：极高</code></pre>

      <h3>在 Aseprite 中实现大气透视的层渐变</h3>
      <ol>
        <li>在 Aseprite 中建立<strong>5 个图层</strong>（或 5 个 Frame），每个代表视差的一个深度级别</li>
        <li>最远层画完后，<strong>手动降低对比度</strong>：选中该层所有颜色 → 在调色板中将暗色和亮色向中间灰靠拢</li>
        <li>叠加一层<strong>半透明蓝色</strong>（Opacity 10-30%）在最远层上——模拟大气散射</li>
        <li>逐层减少蓝色叠加的透明度和对比度降低的程度——最近层完全不叠加</li>
        <li>导出时每条视差层单独导出为一张 PNG</li>
      </ol>

      <div class="warn-box">
        <strong>不要用全局滤镜：</strong>对整张已经画完的远景图应用"降低对比度+加蓝色罩"可能会让原本精心画的像素变成模糊一团。正确做法是在<strong>画的过程中</strong>就使用低对比度的色板——调色板本身就已经是"被大气处理过"的颜色了。后期叠加半透明层是辅助手段，不是主要手段。
      </div>
    </ConceptBlock>

    <!-- ============ 环境色彩和谐 ============ -->
    <ConceptBlock icon="🌈" title="环境色彩和谐——所有层唱同一首歌">
      <p>
        一个好的游戏背景，所有视差层的颜色应该来自<strong>同一个"色调家族"</strong>（Color Family）。这就像前端设计系统中的 Color Token——不是每层各自随便选色，而是从一个统一的色板中派生。
      </p>

      <h3>建立环境色板的步骤</h3>
      <ol>
        <li>
          <strong>确定"天空色"（Sky Color）：</strong>这是所有远景层最终会趋近的颜色。它是你的色板锚点。
          <ul>
            <li>白天天空 → 浅蓝 #87ceeb</li>
            <li>太空/夜晚 → 深蓝黑 #0a0a1a</li>
            <li>黄昏 → 橙粉 #ff9f7c</li>
            <li>阴天/地下 → 灰色 #4a4a4a</li>
          </ul>
        </li>
        <li>
          <strong>确定"地面色"（Ground Color）：</strong>最近层的基色——这是近景物体的主色调。
          <ul>
            <li>森林 → 深绿 #1a4a1a</li>
            <li>沙漠 → 沙黄 #c4a45a</li>
            <li>太空 → 深黑蓝 #0a0a2a</li>
            <li>雪地 → 浅蓝白 #d0e0f0</li>
          </ul>
        </li>
        <li>
          <strong>在天空色和地面色之间插值：</strong>中间各层的颜色是天空色和地面色的<strong>线性混合</strong>。第 1 层（最远）≈ 90% 天空色 + 10% 地面色，第 2 层 ≈ 70% 天空色 + 30% 地面色...以此类推。
        </li>
        <li>
          <strong>添加点缀色（Accent）：</strong>在和谐色板中加入 1-2 个点缀色——用于特殊元素（如发光的宝石、魔法阵、远处的火光）。点缀色不必遵循天空→地面的渐变规则，它们的作用是"打破单调"。
        </li>
      </ol>

      <h3>环境色板的四层结构</h3>
      <table>
        <thead>
          <tr>
            <th>色彩角色</th>
            <th>颜色数</th>
            <th>作用</th>
            <th>示例（森林场景）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>天空锚点色</strong></td>
            <td>1-2</td>
            <td>远景最终趋近的颜色</td>
            <td>浅蓝 #87aec8</td>
          </tr>
          <tr>
            <td><strong>渐变中间色</strong></td>
            <td>3-5</td>
            <td>各视差层的主要颜色，在天空锚点和地面锚点之间过渡</td>
            <td>蓝绿 #5a8a6a → 灰绿 #3a6a3a → 深绿 #2a5a2a</td>
          </tr>
          <tr>
            <td><strong>地面锚点色</strong></td>
            <td>1-2</td>
            <td>近景/地面的基色</td>
            <td>深绿 #1a4a1a</td>
          </tr>
          <tr>
            <td><strong>点缀色</strong></td>
            <td>1-2</td>
            <td>打破单调的强调色</td>
            <td>暖金 #d4a44a（阳光透过树叶）</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>前端类比：</strong>环境色板的构建过程就像在 CSS 中从 HSL 颜色空间定义一个 scale——从 <code>hsl(220, 80%, 10%)</code> 到 <code>hsl(220, 80%, 80%)</code>。L（亮度）逐步增加，但 H（色相）保持不变。像素画中，H 也可以随深度微微旋转（天蓝色 → 蓝绿色 → 绿色），这相当于在 scale 中加入了<strong>色相偏移</strong>，让过渡更丰富。
      </div>
    </ConceptBlock>

    <!-- ============ 关卡主题差异化 ============ -->
    <ConceptBlock icon="🌍" title="关卡主题差异化——一套素材，四种世界">
      <p>
        这是像素画<strong>性价比最高</strong>的技能之一：画好一套背景素材（如森林主题），然后通过<strong>纯色板换色</strong>把它变成沙漠、雪地、太空、地狱等完全不同的主题。不需要重画——改颜色就够了。
      </p>

      <h3>四种主题的色板对照表</h3>
      <table>
        <thead>
          <tr>
            <th>主题</th>
            <th>天空锚点色</th>
            <th>中间色（远→近）</th>
            <th>地面锚点色</th>
            <th>点缀色</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>森林 🌲</strong></td>
            <td>#87aec8（浅蓝）</td>
            <td>蓝绿 → 灰绿 → 深绿</td>
            <td>#1a3a1a（深绿）</td>
            <td>#d4a44a（暖金/阳光）</td>
          </tr>
          <tr>
            <td><strong>沙漠 🏜️</strong></td>
            <td>#e8c078（浅沙黄）</td>
            <td>淡沙 → 中沙 → 深沙</td>
            <td>#8a5a2a（棕褐）</td>
            <td>#e87830（橙红/落日）</td>
          </tr>
          <tr>
            <td><strong>太空 🌌</strong></td>
            <td>#0a0a1a（深蓝黑）</td>
            <td>深蓝灰 → 蓝紫 → 暗紫</td>
            <td>#1a0a2a（深紫黑）</td>
            <td>#00ffff（青/霓虹）</td>
          </tr>
          <tr>
            <td><strong>雪地 ❄️</strong></td>
            <td>#c8d8e8（浅蓝灰）</td>
            <td>浅蓝灰 → 中蓝灰 → 深蓝灰</td>
            <td>#e8f0f8（近白）</td>
            <td>#ff6b6b（暖红/小屋灯光）</td>
          </tr>
        </tbody>
      </table>

      <h3>换色工作流（以森林变沙漠为例）</h3>
      <ol>
        <li>打开森林主题的 Aseprite 源文件（确保是 <strong>Indexed 颜色模式</strong>）</li>
        <li>在调色板面板中，找到<strong>绿色系的颜色行</strong>（这是你要替换的目标）</li>
        <li>逐一修改这些颜色的 RGB 值为沙漠色板的对应颜色：
          <ul>
            <li>浅绿 #5a8a5a → 浅沙 #c4b078</li>
            <li>中绿 #3a6a3a → 中沙 #a08050</li>
            <li>深绿 #1a4a1a → 深沙 #6a5030</li>
          </ul>
        </li>
        <li>天空锚点色也同时修改：浅蓝 → 浅沙黄</li>
        <li>另存为新文件（desert_bg.aseprite），不要覆盖原始森林文件</li>
      </ol>

      <p>
        <strong>关键技巧：</strong>在画第一套素材时就要有"预留换色"的意识——把"会被替换的颜色"放在调色板的连续位置。比如调色板第 3-7 行 = 天空到地面的渐变色，第 8-10 行 = 点缀色。换色时只需修改这几行。
      </p>

      <h3>不是所有素材都能纯换色</h3>
      <p>
        有些元素<strong>必须重画</strong>——如果它们的<strong>形状</strong>在不同主题中有本质不同：
      </p>
      <ul>
        <li>森林的树冠 → 换色变成沙漠的仙人掌？<strong>不行</strong>——形状完全不同（圆润 vs 柱状），必须重画</li>
        <li>星空的星点 → 换色变成沙漠的沙粒？<strong>可行</strong>——形状都是小点，只改颜色</li>
        <li>森林的远山轮廓 → 换色变成沙漠的远山？<strong>可行</strong>——山的形状在两种场景中差不多，改颜色就行</li>
        <li>森林的灌木丛 → 换色变成雪地的雪堆？<strong>可行</strong>——灌木的圆形轮廓和雪堆的圆形轮廓相似，改颜色 + 微调高光位置</li>
      </ul>

      <div class="tip-box">
        <strong>前端类比：</strong>这就是 CSS 的"主题换肤"（Theme Switching）——CSS 变量一变，整个网站的颜色都变了。在像素画中，调色板就是你的 <code>--color-primary</code>、<code>--color-background</code> 等变量。Aseprite 的 Indexed 颜色模式让你可以"改一个颜色槽，所有用这个颜色的像素同时变色"——就像改一个 CSS 变量，所有引用它的元素都变。
      </div>
    </ConceptBlock>

    <!-- ============ 背景 Tileset 设计 ============ -->
    <ConceptBlock icon="🧩" title='Tileset 进阶——让平铺"隐形"'>
      <p>
        Phase 7 讲了 Tileset 无缝拼接的基本规则（上=下、左=右）。但那只能保证<strong>没有硬接缝</strong>——玩家看到的仍然是一格一格重复的图案（grid 感）。进阶目标是：<strong>看不出这块背景是拼接出来的</strong>。
      </p>

      <h3>为什么会看出 grid 感？</h3>
      <p>
        即使边缘无缝，人类的眼睛会识别<strong>重复出现的特征点</strong>。如果 Tile 中有一块特别亮的区域、一个独特的形状、或者一个颜色突变点，这个特征点就会在平铺后形成一个<strong>规则的网格</strong>——玩家的大脑会立刻捕捉到"这是重复的"。
      </p>

      <h3>打破 Grid 感的五种技巧</h3>

      <table>
        <thead>
          <tr>
            <th>技巧</th>
            <th>做法</th>
            <th>效果</th>
            <th>适用场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. 大尺寸 Tile</strong></td>
            <td>增大 Tile 尺寸（64x64 或 128x128 而不是 16x16）</td>
            <td>重复周期变长，grid 感降低</td>
            <td>所有场景——最简单的方案</td>
          </tr>
          <tr>
            <td><strong>2. 非均匀密度</strong></td>
            <td>Tile 内的元素分布不均匀——有些区域密集、有些区域稀疏</td>
            <td>重复周期中夹杂"变化"，眼睛失去网格参照点</td>
            <td>星空（星点不均匀分布）、草地（草丛聚散）</td>
          </tr>
          <tr>
            <td><strong>3. 多层交叠</strong></td>
            <td>用 2-3 个不同尺寸的 Tile 叠加（如 32x32 底层 + 48x48 中层 + 64x64 顶层）</td>
            <td>不同 Tile 的重复周期不同，叠加后产生"伪随机"效果</td>
            <td>复杂地面、墙壁纹理、星空+星云</td>
          </tr>
          <tr>
            <td><strong>4. 装饰物覆盖</strong></td>
            <td>在拼接的 Tile 背景上，随机放置独立的"装饰物"Sprite（石头、花、星团）</td>
            <td>装饰物打破重复节奏，吸引眼球，让人忽略底下的 Tile</td>
            <td>任何场景——这是最实用的技巧</td>
          </tr>
          <tr>
            <td><strong>5. 颜色噪点</strong></td>
            <td>在 Tile 中加入 2-3 个"随机"颜色像素——手动放置在不同位置</td>
            <td>微小的颜色变化打破"精确重复"的感觉</td>
            <td>草地、泥地、岩石——有自然纹理的场景</td>
          </tr>
        </tbody>
      </table>

      <h3>多层交叠的实战方案</h3>
      <p>以飞机大战的星空背景为例，一个"看不出平铺"的方案：</p>

      <pre><code>// 底层：64x64 深色基底 Tile（几乎没有特征点）
        //   - 纯色 #0a0a1a + 随机的 2-3 个极暗星点（几乎看不出）
        //   - 这张 Tile 即便平铺 10x10 也看不出 grid 感
        //
        // 中层：80x56 稀疏星点 Tile（星点密度不均匀）
        //   - 在 80x56 内画 8-12 个不同大小的星点
        //   - 星点集中在 Tile 的左上和右下区域，中间留空
        //   - 平铺时，密集区和稀疏区交替出现 → 没有明显网格
        //
        // 顶层装饰物（不是 Tile！）：独立的星团/星云 Sprite
        //   - 3-5 个不同大小/形状的星云 Sprite
        //   - 在代码中随机放置在背景层上方
        //   - 它们有自己的移动速度（略快于中层），进一步打破重复</code></pre>

      <div class="warn-box">
        <strong>大 Tile 的代价：</strong>128x128 的 Tile 文件大小是 64x64 的 4 倍。在移动端做背景平铺时，需要在"Tile 够大不露馅"和"纹理内存不超"之间做权衡。通常 64x64 是一个不错的平衡点，配合装饰物覆盖就能有很好的效果。
      </div>

      <h3>在 Cocos 中实现多层交叠</h3>
      <ol>
        <li>底层 Tile 的 Sprite：Wrap Mode = Repeat，Size 设为全屏大小（大于设计分辨率以确保覆盖）</li>
        <li>中层 Tile 的 Sprite：同上，但使用不同的 Tile 纹理，略微偏移初始位置（不要在同一个位置开始平铺）</li>
        <li>装饰物 Sprite：不参与平铺，用代码在屏幕范围内随机放置（或预制位置），作为独立节点挂在背景层下</li>
        <li>滚动时，底层和中层以不同速度移动（中层略快），装饰物和它们的父层保持相对静止</li>
      </ol>

      <div class="tip-box">
        <strong>前端直觉：</strong>多层交叠 = CSS 中的多个 <code>background-image</code> 叠加，每层有自己的 <code>background-repeat</code> 和 <code>background-size</code>。底层 <code>background-size: 64px</code>，中层 <code>background-size: 80px</code>，装饰物 = <code>position: absolute</code> 的子元素。在 Cocos 中，每个"background-image"就是一个 Sprite 节点，各节点的滚动脚本独立运行。
      </div>
    </ConceptBlock>

    <!-- ============ 动手练习 ============ -->
    <ConceptBlock icon="🔨" title="动手练习">
      <ol>
        <li>以飞机大战星空场景为例，规划一个 5 层视差方案——写出每层的速度比例、内容描述、颜色方案（天空锚点→地面锚点的渐变）</li>
        <li>在 Aseprite 中画出这 5 层的远中近三级对比：最远层的低对比度星点、中间层的正常星云、最近层的高亮流星</li>
        <li>用 Phase 7 中学的 Tileset 技法画一张 64x64 的星空 Tile，然后用本节的技巧评估"grid 感"——如果重复明显，用非均匀密度或颜色噪点技巧改善</li>
        <li>选一个场景主题（森林/沙漠/太空/雪地），建立完整的 6-10 色环境色板（天空锚点+中间渐变+地面锚点+点缀色）</li>
        <li>将森林主题的色板换成沙漠主题的色板——只改 Aseprite 调色板中的颜色值，不改任何像素——导出对比截图</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>决定背景视差层数的三个因素是什么？每一层的内容应该满足哪四个原则？</li>
        <li>速度比的"N/总层数"公式是什么意思？什么时候需要让近景速度超过 100%（比相机更快）？</li>
        <li>大气透视的四条规则（对比度、饱和度、色相偏移、细节递减）在像素画中分别如何实现？</li>
        <li>环境色板中的"天空锚点色"和"地面锚点色"是什么？中间层的颜色如何从这两个锚点派生？</li>
        <li>四套关卡主题（森林/沙漠/太空/雪地）的色板有什么核心差异？哪些元素可以纯换色，哪些必须重画？</li>
        <li>Tileset 的"grid 感"是什么原因造成的？打破 grid 感的五种技巧分别是什么？</li>
        <li>多层交叠的背景方案是什么原理？为什么不同尺寸的 Tile 叠加能产生"伪随机"效果？</li>
        <li>你的 Phase 7 星空背景在加入了大气透视和 grid 感优化后会有什么具体变化？</li>
      </ul>
    </ConceptBlock>
  </ArtPhaseLayout>
</template>
