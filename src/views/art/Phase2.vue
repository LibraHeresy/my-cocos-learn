<script setup lang="ts">
import ArtPhaseLayout from '@/components/ArtPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <ArtPhaseLayout :phase="2" title="像素画基本技法" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>画出无锯齿的平滑像素线条</li>
        <li>掌握像素抗锯齿（AA）技术，手动消除边缘锯齿</li>
        <li>理解经典像素色盘的设计哲学，在 Aseprite 中自建色盘 Ramp</li>
        <li>用明暗上色给像素画增加立体感</li>
        <li>识别并避免枕形阴影、条纹伪影、孤立像素三大常见错误</li>
        <li>掌握抖动技法（Dithering）做渐变过渡</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="📏" title="线条：消灭锯齿">
      <p>
        像素画中画直线容易，画<strong>斜线和曲线</strong>才会暴露水平。锯齿（Jaggies）是像素画的大敌：
      </p>

      <h3>锯齿 vs 平滑线条</h3>
      <pre><code>❌ 锯齿线：像素堆叠不均匀
██
  ██
    ██
      ██

✅ 平滑线：每段像素数量渐变（2→2→1→1 原则）
██
  ██
   █
    ██</code></pre>

      <h3>像素线条的核心规则</h3>
      <ul>
        <li>
          <strong>同斜率同步长：</strong>一条线的斜率不变，每段像素数量保持一致（比如 2-1-1-2-1-1）
        </li>
        <li><strong>避免直角拐点：</strong>两条线相交处不要出现块状的直角堆积</li>
        <li>
          <strong>画完缩小看：</strong>在 100%
          缩放（实际大小）下检查线条是否平滑。画的时候是放大的，实际显示是缩小的——这是两个世界
        </li>
      </ul>

      <div class="tip-box">
        <strong>诀窍：</strong>画斜线的口诀——"多画一个、少画一个"。比如 2 像素 → 1 像素 → 2 像素 → 1
        像素，形成均匀的阶梯感。这需要练习，但一旦掌握就不会忘。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔬" title="像素抗锯齿（Anti-Aliasing）">
      <p>
        像素抗锯齿（AA）和前面讲的"画平滑线条"不同——AA 是在<strong>已经画好形状的边缘</strong>，
        用中间色像素来手动消除锯齿感。它本质上是用颜色来"欺骗"眼睛，让边缘看起来更柔滑。
      </p>

      <h3>AA 的核心操作</h3>
      <p>在锯齿拐角处，用一个<strong>介于轮廓色和背景色之间的中间色</strong>填充：</p>

      <pre><code>❌ 无 AA：         ✅ 有 AA：
  ██  ██             ██  ██
  ██    ██           ██ ▓▓ ██
  ██      ██         ██      ██
  ██    ██           ██ ▒▒ ██
  ██  ██             ██  ██

  ▓▓ = 中间色（轮廓色和背景色的混合）</code></pre>

      <h3>AA 的使用原则</h3>
      <ul>
        <li><strong>只在外轮廓使用：</strong>内部色块之间一般不需要 AA</li>
        <li><strong>1 像素足够：</strong>AA 只用 1 个像素宽，超过就变成模糊了</li>
        <li>
          <strong>只在需要的地方：</strong
          >对角线、曲线拐角才需要；直线边缘本身就已经非常平滑了，不需要加 AA
        </li>
        <li>
          <strong>外部 AA vs 内部 AA：</strong>外部 AA（轮廓色→背景色）让物体融入背景；内部
          AA（亮部→暗部）柔和内部色块过渡
        </li>
      </ul>

      <div class="warn-box">
        <strong>AA vs 模糊：</strong>新手最容易犯的是过度 AA——把整条边都铺上中间色。AA
        只加在<strong>锯齿最刺眼</strong>的那一两个像素上。好的 AA 是看不见的，坏的 AA
        让画面变得模糊。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎨" title="配色：选对调色板">
      <p>
        像素画<strong>颜色少</strong>反而是优势。飞机大战这类复古风格，一个角色通常只用
        <strong>4-6 种颜色</strong>：
      </p>

      <table>
        <thead>
          <tr>
            <th>色阶</th>
            <th>用途</th>
            <th>示例（红色飞机）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>高光色</strong></td>
            <td>最亮，点在顶面和边缘</td>
            <td>#ff8888 粉红</td>
          </tr>
          <tr>
            <td><strong>基础色</strong></td>
            <td>主体的正常颜色</td>
            <td>#cc3333 正红</td>
          </tr>
          <tr>
            <td><strong>暗部色</strong></td>
            <td>阴影面，增加立体感</td>
            <td>#881111 暗红</td>
          </tr>
          <tr>
            <td><strong>轮廓色</strong></td>
            <td>最深，用于外轮廓和内部区分</td>
            <td>#440000 深棕</td>
          </tr>
        </tbody>
      </table>

      <h3>快速选色技巧</h3>
      <ul>
        <li>
          <strong>色相偏移：</strong>暗部不仅变暗，还要略微偏移色相——暖色暗部偏红/紫，冷色暗部偏蓝
        </li>
        <li>
          <strong>不要用纯黑：</strong
          >纯黑（#000000）在像素画中太突兀，用非常暗的颜色代替（深蓝/深紫/深棕）
        </li>
        <li><strong>调色板复用：</strong>飞机大战所有素材共用一套调色板，保持视觉统一</li>
      </ul>

      <div class="warn-box">
        <strong>前端直觉陷阱：</strong>CSS 中你习惯用 <code>#333</code>、<code>#666</code>
        这种中性灰。像素画中不要用纯灰！带一点色相的灰色（暖灰/冷灰）会让画面更有"温度"。
      </div>

      <h3>经典像素色盘赏析</h3>
      <p>
        像素画历史上沉淀了几套"教科书级"的色盘。初学者最好的学习方式就是<strong>先用经典色盘，再自己定制</strong>：
      </p>

      <table>
        <thead>
          <tr>
            <th>色盘</th>
            <th>颜色数</th>
            <th>风格</th>
            <th>适用场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>DB32</strong></td>
            <td>32</td>
            <td>通用、均衡</td>
            <td>万能色盘，覆盖冷暖灰棕——飞机大战首选</td>
          </tr>
          <tr>
            <td><strong>PICO-8</strong></td>
            <td>16</td>
            <td>复古、鲜艳</td>
            <td>80 年代 8-bit 风格，对比度极高</td>
          </tr>
          <tr>
            <td><strong>Sweetie 16</strong></td>
            <td>16</td>
            <td>柔和、糖果</td>
            <td>Q 版或轻快画风，像素平台游戏最爱</td>
          </tr>
          <tr>
            <td><strong>ENDESGA 36</strong></td>
            <td>36</td>
            <td>深沉、大气</td>
            <td>科幻/太空/严肃主题，色相丰富</td>
          </tr>
        </tbody>
      </table>

      <h3>在 Aseprite 中建立 Ramp（渐变色条）</h3>
      <p>
        Ramp 是<strong>同一色相的一组颜色，从暗到亮排列</strong>。学会建 Ramp
        是独立创作像素画的核心能力：
      </p>
      <ol>
        <li>打开色盘编辑器（View → Palette → Palette Editor）</li>
        <li>在色盘空白区域选 4-5 个连续位置，逐一编辑颜色</li>
        <li>从暗到亮排列：暗部 → 基础 → 亮部 → 高光</li>
        <li>每级亮度增加 ~25-30%（不是均匀线性增加——亮部跨度比暗部大）</li>
        <li>同时偏移色相：暗部偏冷（+蓝/紫），亮部偏暖（+黄/白）</li>
        <li>保存为 <code>my_game_palette.gpl</code></li>
      </ol>

      <pre><code>红色 Ramp 示例（适合飞机/敌机主体）：
████  ████  ████  ████
暗部   基础   亮部   高光
#551111 #aa2222 #dd5555 #ff9999
　　　　　　　　　　　　　(偏橙)</code></pre>

      <div class="tip-box">
        <strong>16 色哲学：</strong>PICO-8 只有 16 种颜色，却诞生了无数经典游戏。16
        色的限制不是束缚，而是让你把精力放在"形"和"构图"上。等掌握了限色画法再拓展到 32/64
        色也不迟。飞机大战建议从 24-32 色起步。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="💡" title="明暗上色：画出立体感">
      <p>像素画没有 3D 渲染，立体感完全靠<strong>颜色分层</strong>来模拟：</p>

      <h3>基本光照模型（假设光从左上角来）</h3>
      <pre><code>     ☀️ 光源（左上）

  ┌──────────┐
  │ 高光色    │  ← 顶面和左面：最亮
  │  ▓▓▓▓▓▓  │
  │  ▓▓▓▓▓▓  │  ← 前面：基础色
  │    ▓▓▓▓▓▓│
  │    ▓▓▓▓▓▓│  ← 右面和底面：暗部色
  └──────────┘</code></pre>

      <h3>上色步骤</h3>
      <ol>
        <li>用<strong>基础色</strong>填满整个形状</li>
        <li>用<strong>暗部色</strong>画在右边缘和下边缘（远离光源的面）</li>
        <li>用<strong>高光色</strong>画在左边缘和上边缘（面向光源的面）</li>
        <li>用<strong>轮廓色</strong>描外轮廓</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="三大常见错误与如何避免">
      <h3>1. 枕形阴影（Pillow Shading）—— 最常见的上色错误</h3>
      <p>
        枕形阴影是指<strong>从轮廓边缘向内逐层加深</strong>的上色方式。不管你画的是圆形、方形还是飞机，最终都会得到一个"枕头"般的不自然膨胀感：
      </p>
      <pre><code>❌ 枕形阴影：从轮廓向内逐层加深
  ▓▓▓▓▓▓▓▓
  ▓▓████▓▓
  ▓▓████▓▓
  ▓▓▓▓▓▓▓▓

✅ 正确做法：确定光源方向，一面亮一面暗
  ☀️→  ████▓▓▓▓
       ████▓▓▓▓
       ████▓▓▓▓
       ████▓▓▓▓</code></pre>
      <p>
        <strong>纠正方法：</strong
        >画任何物体之前，先问自己"光从哪边来？"然后坚决地让受光面亮、背光面暗。不要怕对比度大——像素画不怕高对比。
      </p>

      <h3>2. 条纹伪影（Banding）—— 不自然的等高线</h3>
      <p>Banding 是指多个色阶沿轮廓<strong>平行排列</strong>时产生的"等高线地图"般的伪 3D 效果：</p>
      <pre><code>❌ Banding：色阶沿轮廓平行，像等高线
   ██
  ████
  ██▓▓██
 ██▓▓▒▒▓▓

✅ 打破排列：让色阶之间的过渡错开
   ██
  ██▓▓
 ██▓▓▒▒
  ▓▓▒▒</code></pre>
      <p>
        <strong>纠正方法：</strong
        >让相邻色阶的边界<strong>不对齐</strong>——暗部色块可以"侵入"亮部区域，让边缘错落而不是整齐排列。
      </p>

      <h3>3. 孤立像素（Orphan Pixels）—— 画面中的"噪点"</h3>
      <p>
        好的像素画用<strong>连续的色块集群</strong>来表现形状。散落的孤立像素（比如亮色区中飘着一个暗色单像素）在
        100% 缩放下会变成噪点，让画面看起来脏乱。
      </p>
      <pre><code>❌ 孤立像素：        ✅ 干净集群：
  ████  ██            ████████
  ██    ██            ████████
  ██  ██              ████████</code></pre>
      <p>
        <strong>有个例外：</strong
        >纹理效果（金属表面的反光点、石头纹理、星空）中，孤立像素是有意为之且有效的。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="🌫️" title="抖动技法（Dithering）">
      <p>
        当两种颜色需要平滑过渡，但你又不想引入新颜色时，用<strong>抖动</strong>——交替排列两种颜色的像素：
      </p>

      <pre><code>纯基础色         50% 抖动        纯暗部色
████████        ████▓▓▓▓        ▓▓▓▓▓▓▓▓
████████        ██▓▓▓▓██        ▓▓▓▓▓▓▓▓
████████   →    ████▓▓▓▓   →    ▓▓▓▓▓▓▓▓
████████        ██▓▓▓▓██        ▓▓▓▓▓▓▓▓

常见抖动图案：
棋盘格：  斜条纹：   随机点：
█ █ █ █   █ █ █ █   █   █
 █ █ █ █   █ █ █   █   █ █
█ █ █ █     █ █ █     █ █
 █ █ █ █     █ █ █   █</code></pre>

      <p>
        抖动在<strong>背景过渡</strong>（天空从深蓝到浅蓝）和<strong>大块平面</strong>（金属表面纹理）中最常用。小型角色通常不需要抖动——4
        个色阶就够。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="🔨" title="动手练习：画一架简单飞机">
      <p>把本节学到的技法综合运用，画一架 <strong>32×32</strong> 的简单飞机：</p>

      <ol>
        <li>新建 32×32 画布，透明背景</li>
        <li>选 4 个颜色（轮廓 + 基础 + 亮色 + 暗色）</li>
        <li>先画飞机轮廓：机身（水滴形/三角形）+ 机翼（左右展开）</li>
        <li>上基础色，加暗部和亮面</li>
        <li>缩放到 100% 检查效果——这是游戏中实际看到的大小</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>一架有明暗关系的像素飞机，线条平滑无锯齿。在 100%
        缩放下（游戏中实际大小）轮廓清晰、能一眼看出是飞机。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>像素画中锯齿是怎么产生的？如何避免？</li>
        <li>像素抗锯齿（AA）和画平滑线条的区别是什么？AA 应该加几个像素宽？</li>
        <li>外部 AA 和内部 AA 各自适用什么场景？</li>
        <li>DB32 色盘有多少颜色？为什么限制色盘数量反而是好事？</li>
        <li>如何在 Aseprite 中为一款游戏构建统一的色盘 Ramp？</li>
        <li>为什么暗部色不仅要变暗还要偏移色相？亮部偏暖还是偏冷？</li>
        <li>为什么不要用纯黑和纯灰？</li>
        <li>一个像素角色通常需要几个色阶？各自干什么？</li>
        <li>光从左上角来时，哪个面应该画高光？哪个面画暗部？</li>
        <li>什么是枕形阴影？怎么避免？</li>
        <li>什么是 Banding？它和正常的光影过渡有什么区别？</li>
        <li>孤立像素什么时候是错误，什么时候是有意为之的纹理？</li>
        <li>抖动技法适合什么场景？小型角色要不要用抖动？</li>
        <li>为什么画完之后要在 100% 缩放检查？</li>
      </ul>
    </ConceptBlock>
  </ArtPhaseLayout>
</template>
