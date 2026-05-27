<script setup lang="ts">
import ArtPhaseLayout from '@/components/ArtPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
import PixelCanvas from '@/components/PixelCanvas.vue'
</script>

<template>
  <ArtPhaseLayout :phase="5" title="帧动画制作" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>用 <strong>Aseprite</strong> 时间轴和<strong>洋葱皮</strong>工具制作<strong>逐帧动画</strong></li>
        <li>将 Phase 4 学的运动规律落地——在 <strong>Aseprite</strong> 中实现缓动、<strong>挤压拉伸</strong>、<strong>次级运动</strong></li>
        <li>制作飞机<strong>爆炸动画</strong>（6-12 帧，参考 Phase 4 的帧数速查表）</li>
        <li>制作<strong>引擎火焰</strong><strong>循环动画</strong>（4-6 帧）和玩家飞机<strong>待机浮动</strong>动画</li>
        <li>制作飞机<strong>受击闪烁</strong>效果和道具旋转动画</li>
        <li>导出 <strong>SpriteSheet</strong>（<strong>雪碧图</strong>）导入 <strong>Cocos</strong> 使用</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="⏱️" title="Aseprite 时间轴入门">
      <p>Aseprite 不仅是像素画工具，还是<strong>像素动画编辑器</strong>。时间轴在底部面板。前端同学可以把时间轴理解为<strong>CSS @keyframes 的视觉版</strong>——每个帧就是一个 keyframe stop，帧之间的过渡就是你手动控制的 animation-timing-function。</p>

      <h3>核心概念</h3>
      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>说明</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>帧（Frame）</strong></td>
            <td>动画的一个静态画面</td>
            <td>CSS @keyframes 中的一个百分比 stop</td>
          </tr>
          <tr>
            <td><strong>图层（Layer）</strong></td>
            <td>每一帧内都有相同的图层结构</td>
            <td>Figma/PS 的图层面板</td>
          </tr>
          <tr>
            <td><strong>洋葱皮（Onion Skin）</strong></td>
            <td>同时看到前后几帧的虚影</td>
            <td>Git diff 的可视化——看到"前后帧的差异"</td>
          </tr>
          <tr>
            <td><strong>帧速率（Frame Rate）</strong></td>
            <td>每秒播放几帧</td>
            <td>FPS</td>
          </tr>
          <tr>
            <td><strong>标签（Tag）</strong></td>
            <td>给一段帧序列命名（如"爆炸""待机"）</td>
            <td>animation-name: "explosion"</td>
          </tr>
        </tbody>
      </table>

      <h3>基础操作</h3>
      <ul>
        <li><strong>Alt+N</strong>：插入新帧（复制当前帧内容）</li>
        <li><strong>Alt+B</strong>：插入空白新帧</li>
        <li><strong>F</strong> 键：跳转到下一帧 / 上一帧</li>
        <li><strong>Enter</strong>：播放/停止动画预览</li>
        <li><strong>拖动帧</strong>：调整帧顺序</li>
        <li><strong>右键帧 → Frame Properties</strong>：设置该帧持续时间（毫秒）——相当于 CSS 的 animation-duration 针对单个 keyframe stop</li>
      </ul>

      <div class="tip-box">
        <strong>帧速率建议：</strong>像素动画通常用 <strong>12 FPS</strong>（每秒 12
        帧）。太快看不出细节（浪费绘制精力），太慢动作不流畅。爆炸可以稍快（15
        FPS），引擎火焰可以稍慢（8-10 FPS）。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🧅" title="洋葱皮——动画流畅的核心">
      <p>
        洋葱皮是像素动画师<strong>最重要的工具</strong>。它让你在画当前帧时看到前后帧的半透明虚影。前端直觉：这就像在 Git 里看 diff——你知道上一帧和下一帧长什么样，才能决定当前帧应该画在什么位置。
      </p>

      <pre><code>当前帧：    ●   ← 你正在画这一帧
前一帧虚影： ○   ← 红色半透明显示
后一帧虚影： ◌   ← 蓝色半透明显示

看到三者叠加 → 你就知道当前帧应该画在什么位置才能让动画流畅</code></pre>

      <h3>洋葱皮设置</h3>
      <ul>
        <li>时间轴面板顶部 → 洋葱皮图标（像两层叠起来的纸）→ 点击开启</li>
        <li>调节显示前后几帧（默认前后各 2 帧）</li>
        <li>红色 tint = 前帧，蓝色 tint = 后帧</li>
        <li>快捷键 <strong>Alt+O</strong> 快速开关洋葱皮</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="💥" title="制作爆炸动画">
      <p>爆炸是飞机大战中<strong>最重要的动画</strong>——每次击杀敌机都要播放。根据 Phase 4 的帧数标准，小型爆炸 4-6 帧及格、8-10 帧流畅。下面以 6 帧为例演示完整工作流：</p>

      <h3>爆炸动画的阶段</h3>
      <ol>
        <li><strong>爆发阶段（帧 1-2）：</strong>从中心向外快速扩张，亮黄/白色为主，每帧 50ms（快）</li>
        <li><strong>燃烧阶段（帧 3-4）：</strong>火焰散开，橙/红色为主，碎片开始飞出，每帧 80ms</li>
        <li><strong>消散阶段（帧 5-6）：</strong>火焰变暗、缩小，灰色烟尘升腾，每帧 120ms（慢）</li>
      </ol>

      <h3>操作步骤</h3>
      <ol>
        <li>新建 <strong>32×32</strong> 画布，Alt+B 插入 6 帧空白帧</li>
        <li>开启洋葱皮（前后各 2 帧）</li>
        <li>帧 1：在中心画一个 4×4 的亮黄色方块（爆炸起点），Duration 设 50ms</li>
        <li>帧 2：黄块扩大并加入橙色边缘，Duration 设 50ms</li>
        <li>帧 3-4：圆圈扩大碎裂，加入红色和深色碎块，Duration 设 80ms/帧</li>
        <li>帧 5-6：火焰缩小，碎块减少，颜色变暗转灰，Duration 设 120ms/帧</li>
        <li>按 Enter 预览动画，调整不满意的帧</li>
      </ol>

      <p>爆炸动画色彩时间线：</p>
      <PixelCanvas
        :grid="[
          ['#ffffff', '#ffffff', '#ffee44', '#ffee44', '#ff8800', '#ff8800'],
          ['#ff8800', '#ff8800', '#ff8800', '#ff8800', '#ee2200', '#ee2200', '#881100', '#881100'],
          ['#881100', '#881100', '#664444', '#664444', '#888888', '#888888'],
          ['#888888', '#888888', '#bbbbbb', '#bbbbbb'],
        ]"
        :scale="22"
      />
      <p class="px-desc">
        帧1-2：白 → 黄 → 橙（50ms/帧） ｜ 帧3-4：橙 → 红 → 深红（80ms/帧） ｜ 帧5-6：深红 → 灰 → 透明（120ms/帧）
      </p>

      <div class="warn-box">
        <strong>回忆 Phase 4 的关键原则：</strong>爆炸帧不要平均分配时长！前 1/3 帧占 70% 视觉冲击力，Duration 要短；后 2/3 帧是消散过程，Duration 要长。新手最容易搞反。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔥" title="制作引擎火焰动画（4 帧循环）">
      <p>引擎火焰是<strong>循环动画</strong>——4 帧无限循环播放，帧之间要有微妙的形状变化。Phase 4 讲过：火焰只需 3-4 帧就及格，因为火焰是湍流、天然不规则，肉眼接受"跳跃感"。</p>

      <ol>
        <li>新建 <strong>8×12</strong> 画布（只画火焰部分，之后合成到飞机上）</li>
        <li>4 帧的火焰形状依次变化：长→短→中→短（模拟火焰跳动）</li>
        <li>颜色：白（核心）→ 黄 → 橙 → 红（边缘），明暗差要大</li>
        <li>每帧底部（引擎喷口端）保持一致，顶部（火焰尖端）上下摆动</li>
      </ol>

      <div class="px-compare px-compare-end">
        <div>
          <p class="px-label">帧1（长）</p>
          <PixelCanvas
            :grid="[
              ['', '', '', '#ffffff', '#ffffff', '', '', ''],
              ['', '', '#ffffff', '#ffee44', '#ffee44', '#ffffff', '', ''],
              ['', '#ffffff', '#ffee44', '#ffee44', '#ffee44', '#ffee44', '#ffffff', ''],
              ['', '#ffffff', '#ffee44', '#ff8800', '#ff8800', '#ffee44', '#ffffff', ''],
              [
                '#ffffff',
                '#ffee44',
                '#ff8800',
                '#ff8800',
                '#ff8800',
                '#ff8800',
                '#ffee44',
                '#ffffff',
              ],
              [
                '#ffffff',
                '#ffee44',
                '#ff8800',
                '#dd2200',
                '#dd2200',
                '#ff8800',
                '#ffee44',
                '#ffffff',
              ],
              [
                '#ffee44',
                '#ff8800',
                '#dd2200',
                '#dd2200',
                '#dd2200',
                '#dd2200',
                '#ff8800',
                '#ffee44',
              ],
              [
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
              ],
            ]"
            :scale="13"
          />
        </div>
        <div>
          <p class="px-label">帧2（短）</p>
          <PixelCanvas
            :grid="[
              ['', '', '', '#ffffff', '#ffffff', '', '', ''],
              ['', '', '#ffffff', '#ffee44', '#ffee44', '#ffffff', '', ''],
              ['', '#ffffff', '#ffee44', '#ff8800', '#ff8800', '#ffee44', '#ffffff', ''],
              [
                '#ffffff',
                '#ffee44',
                '#ff8800',
                '#dd2200',
                '#dd2200',
                '#ff8800',
                '#ffee44',
                '#ffffff',
              ],
              [
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
              ],
            ]"
            :scale="13"
          />
        </div>
        <div>
          <p class="px-label">帧3（中）</p>
          <PixelCanvas
            :grid="[
              ['', '', '#ffffff', '#ffffff', '', '', '', ''],
              ['', '#ffffff', '#ffee44', '#ffee44', '#ffffff', '', '', ''],
              ['', '#ffffff', '#ffee44', '#ff8800', '#ff8800', '#ffee44', '#ffffff', ''],
              [
                '#ffffff',
                '#ffee44',
                '#ff8800',
                '#ff8800',
                '#ff8800',
                '#ff8800',
                '#ffee44',
                '#ffffff',
              ],
              [
                '#ffffff',
                '#ffee44',
                '#ff8800',
                '#dd2200',
                '#dd2200',
                '#ff8800',
                '#ffee44',
                '#ffffff',
              ],
              [
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
              ],
            ]"
            :scale="13"
          />
        </div>
        <div>
          <p class="px-label">帧4（短）</p>
          <PixelCanvas
            :grid="[
              ['', '', '#ffffff', '#ffffff', '', '', '', ''],
              ['', '#ffffff', '#ffee44', '#ffee44', '#ffffff', '', '', ''],
              ['#ffffff', '#ffee44', '#ff8800', '#ff8800', '#ffee44', '#ffffff', '', ''],
              [
                '#ffffff',
                '#ffee44',
                '#ff8800',
                '#dd2200',
                '#dd2200',
                '#ff8800',
                '#ffee44',
                '#ffffff',
              ],
              [
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
                '#666666',
              ],
            ]"
            :scale="13"
          />
        </div>
      </div>
      <p class="px-desc">
        白（核心）→ 黄 → 橙 → 红（边缘） ｜ 底部深灰为引擎喷口 ｜ 帧1-4 长→短→中→短循环
      </p>
    </ConceptBlock>

    <ConceptBlock icon="🛩️" title="玩家飞机动画集">
      <h3>待机浮动动画（4-6 帧，循环）</h3>
      <p>飞机停在原地时上下微微浮动——运用 Phase 4 的<strong>缓入缓出</strong>原理，运动幅度很小（2-3 像素），但让画面有生命力：</p>
      <ol>
        <li>在 Aseprite 中新建 4-6 帧（从玩家飞机的静态图开始，Alt+N 逐帧复制）</li>
        <li>帧 1→2→3：飞机整体向上移动 0→1→2 像素（缓出——加速向上）</li>
        <li>帧 4→5→6：飞机整体向下移动 2→1→0 像素（缓入——减速回落）</li>
        <li>注意：引擎火焰的上下位移比机身大一点（次级运动——Phase 4 的火焰滞后原则）</li>
      </ol>

      <h3>移动倾斜动画（2-3 帧过渡）</h3>
      <p>飞机左右移动时，机身向移动方向微微倾斜——给玩家提供<strong>视觉反馈</strong>：</p>
      <ul>
        <li>左移：机身向左倾斜 5-10 度（帧 1：正常 → 帧 2：左倾）</li>
        <li>右移：机身向右倾斜 5-10 度</li>
        <li>不动：回归正常角度</li>
        <li>简化方案：不真的旋转像素（会模糊），而是在倾斜方向多偏移 1-2 列像素</li>
      </ul>

      <div class="tip-box">
        <strong>Cocos 替代方案：</strong>如果不想手绘倾斜帧，可以在 Cocos 中通过
        <code>node.angle</code> 属性直接旋转飞机节点，配合 cc.tween
        做平滑过渡。像素画旋转可能会有锯齿，试试看效果。这也是 Phase 4 "逐帧 vs 代码"决策矩阵的实际应用。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✨" title="受击闪烁与道具动画">
      <h3>受击闪烁（Hit Flash）</h3>
      <p>飞机中弹时短暂全白——Phase 4 帧数表推荐的 2 帧重复 3 次方案：</p>
      <ol>
        <li>在飞机图层的<strong>最上面</strong>新增一个"受击白膜"图层</li>
        <li>用白色填充飞机的轮廓（和飞机大小相同，全白）</li>
        <li>默认隐藏该图层；需要闪烁时显示 1-2 帧</li>
        <li>导出时作为独立帧：帧序列中 1 帧白膜 → 1 帧正常 → 1 帧白膜 → 1 帧正常</li>
      </ol>

      <div class="tip-box">
        <strong>Cocos 替代方案：</strong>在代码中设置
        <code>sprite.color = Color.WHITE</code>（变白），2
        帧后再设置回去。比手绘白膜更省事，适合快速原型。
      </div>

      <h3>道具旋转/浮动动画（4-8 帧，循环）</h3>
      <p>掉落中的道具不能静止——旋转或弹跳让玩家注意到它们：</p>
      <ul>
        <li>
          <strong>弹跳：</strong>道具图标上下弹跳（4 帧循环：正常→上升→最高点→下降），运用 Phase 4 的挤压拉伸——触地时加 1 帧压缩
        </li>
        <li><strong>闪光：</strong>道具周围画一圈星星/光点（2-4 像素），在 4 帧中轮流亮灭</li>
        <li><strong>旋转：</strong>菱形道具每 4 帧旋转 90°（刚好压平 4 个角），形成旋转视觉效果</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="📤" title="导出 SpriteSheet 到 Cocos">
      <p>
        画完动画后，需要导出为<strong>雪碧图（SpriteSheet）</strong>——一张包含所有帧的大图，每帧等距排列。这就像前端 Webpack 把多张小图拼成雪碧图减少 HTTP 请求——原理完全一致。
      </p>

      <h3>Aseprite 导出步骤</h3>
      <ol>
        <li>File → Export Sprite Sheet</li>
        <li>
          Layout：选择 <strong>Horizontal Strip</strong>（水平排列）或
          <strong>Grid</strong>（网格排列，帧多时用）
        </li>
        <li>勾选 <strong>Trim</strong>（裁剪空白边缘，减小文件体积）</li>
        <li>Output File：选择导出路径</li>
        <li>点击 Export</li>
      </ol>

      <h3>放入 Cocos 项目</h3>
      <ol>
        <li>把导出的 PNG 放到 <code>assets/textures/</code> 目录下</li>
        <li>Cocos 会自动识别为 SpriteFrame 序列</li>
        <li>Phase 6 会详细讲 Auto Atlas 合批和纹理配置——现在先手动导入，后续统一优化</li>
        <li>在代码中用 FrameAnimator 脚本播放</li>
      </ol>

      <div class="warn-box">
        <strong>注意：</strong>如果动画帧数较多（8+ 帧），不要导出为单张巨大的长条图。用 Grid
        布局（比如 4×4 网格）更紧凑，也方便 Cocos 的 Atlas 处理。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔨" title="动手练习：完整的一个飞机爆炸">
      <p>综合本节所学，完成以下练习：</p>
      <ol>
        <li>运用 Phase 4 的帧数速查表和帧时长分配原则，画一个 <strong>6 帧</strong>爆炸动画（32×32），每帧 Duration 按阶段正确设置</li>
        <li>画一个 <strong>4 帧</strong>引擎火焰动画（8×12），确保明暗差大、循环流畅</li>
        <li>运用 Phase 4 的次级运动原理，给引擎火焰加上滞后效果（火焰图层独立于机身图层）</li>
        <li>两套动画分别导出为 SpriteSheet PNG</li>
        <li>把导出的 PNG 放入 Cocos 项目，用脚本播放</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>在 Cocos 游戏中：敌机被子弹击中时播放爆炸动画（帧时长不均分、有节奏感），动画结束后自动回收敌机节点。引擎火焰 4 帧循环播放，火焰有独立于机身的次级运动。Phase 4 的运动规律在本节得到了具体落地。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>Aseprite 时间轴中，新帧（Alt+N）和空白新帧（Alt+B）的区别是什么？</li>
        <li>洋葱皮是干什么的？红色和蓝色虚影分别代表什么？为什么说它像 Git diff？</li>
        <li>"缓入缓出"在 Aseprite 中怎么实现？每帧的 Duration 怎么设置才符合 Phase 4 的原则？</li>
        <li>爆炸动画分为几个阶段？每个阶段多少帧、什么颜色、什么 Duration？为什么不能平均分配？</li>
        <li>循环动画（如引擎火焰）的帧数为什么可以很少？Phase 4 的"3 帧不卡"原理是什么？</li>
        <li>待机浮动动画中，引擎火焰的位移为什么和机身不一样？这体现了 Phase 4 的什么原理？</li>
        <li>受击闪烁有哪两种实现方式？各有什么优缺点？这和 Phase 4 "逐帧 vs 代码"的哪个判断标准对应？</li>
        <li>导出 SpriteSheet 时，Horizontal Strip 和 Grid 布局各自适合什么场景？</li>
      </ul>
    </ConceptBlock>
  </ArtPhaseLayout>
</template>
