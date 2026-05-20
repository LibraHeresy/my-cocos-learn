<script setup lang="ts">
import ArtPhaseLayout from '@/components/ArtPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
import PixelCanvas from '@/components/PixelCanvas.vue'
</script>

<template>
  <ArtPhaseLayout :phase="4" title="帧动画制作" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解逐帧动画的核心原理：挤压拉伸、预备动作、缓入缓出</li>
        <li>用 Aseprite 时间轴制作逐帧动画</li>
        <li>制作飞机爆炸动画（16 帧）</li>
        <li>制作引擎火焰循环动画（4 帧）</li>
        <li>制作玩家飞机待机浮动动画（4-6 帧）</li>
        <li>制作飞机受击闪烁效果和道具旋转动画</li>
        <li>使用洋葱皮功能观察前后帧，让动画流畅</li>
        <li>导出 SpriteSheet（雪碧图）导入 Cocos 使用</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="⏱️" title="Aseprite 时间轴入门">
      <p>Aseprite 不仅是像素画工具，还是<strong>像素动画编辑器</strong>。时间轴在底部面板：</p>

      <h3>核心概念</h3>
      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>说明</th>
            <th>类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>帧（Frame）</strong></td>
            <td>动画的一个静态画面</td>
            <td>定格动画的一张照片</td>
          </tr>
          <tr>
            <td><strong>图层（Layer）</strong></td>
            <td>每一帧内都有相同的图层结构</td>
            <td>PS/Figma 的图层</td>
          </tr>
          <tr>
            <td><strong>洋葱皮（Onion Skin）</strong></td>
            <td>同时看到前后几帧的虚影</td>
            <td>传统动画师的透写台</td>
          </tr>
          <tr>
            <td><strong>帧速率（Frame Rate）</strong></td>
            <td>每秒播放几帧</td>
            <td>FPS</td>
          </tr>
          <tr>
            <td><strong>标签（Tag）</strong></td>
            <td>给一段帧序列命名（如"爆炸""待机"）</td>
            <td>动画片段/剪辑</td>
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
        <li><strong>右键帧 → Frame Properties</strong>：设置该帧持续时间（毫秒）</li>
      </ul>

      <div class="tip-box">
        <strong>帧速率建议：</strong>像素动画通常用 <strong>12 FPS</strong>（每秒 12
        帧）。太快看不出细节（浪费绘制精力），太慢动作不流畅。爆炸可以稍快（15
        FPS），引擎火焰可以稍慢（8-10 FPS）。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🧅" title="洋葱皮——动画流畅的核心">
      <p>
        洋葱皮是像素动画师<strong>最重要的工具</strong>。它让你在画当前帧时看到前后帧的半透明虚影：
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

    <ConceptBlock icon="📐" title="像素动画的核心原理">
      <p>
        迪士尼动画十二条原则在像素动画中同样重要。挑选<strong>对飞机大战最关键的 4 条</strong>：
      </p>

      <h3>1. 挤压与拉伸（Squash & Stretch）</h3>
      <p>
        物体运动时形状会变形——压扁（碰到东西时）和拉长（加速时）。像素画中做不到柔和的变形，但可以通过<strong>像素移位</strong>模拟：
      </p>
      <div class="px-compare">
        <div>
          <p class="px-label">正常帧</p>
          <PixelCanvas
            :grid="[
              ['#554422', '#554422'],
              ['#554422', '#554422'],
              ['#554422', '#554422'],
              ['#554422', '#554422'],
            ]"
            :scale="18"
          />
        </div>
        <div>
          <p class="px-label">挤压帧</p>
          <PixelCanvas
            :grid="[
              ['#554422', '#554422', '#554422', '#554422'],
              ['#554422', '#554422', '#554422', '#554422'],
              ['#554422', '#554422', '#554422', '#554422'],
            ]"
            :scale="18"
          />
        </div>
        <div>
          <p class="px-label">拉伸帧</p>
          <PixelCanvas
            :grid="[
              ['#554422', '#554422'],
              ['#554422', '#554422'],
              ['#554422', '#554422'],
              ['#554422', '#554422'],
              ['#554422', '#554422'],
              ['#554422', '#554422'],
            ]"
            :scale="18"
          />
        </div>
      </div>
      <p>爆炸动画中：爆心先"挤压"1 帧 → 然后"拉伸"爆发 3-4 帧。</p>

      <h3>2. 预备动作（Anticipation）</h3>
      <p>
        大动作之前先做反方向的小动作。Boss 发射激光炮前，先向后缩 1-2 帧（蓄力感）→
        然后猛地前冲发射。
      </p>

      <h3>3. 缓入缓出（Ease In / Ease Out）</h3>
      <p>
        运动不是匀速的——起步慢、中间快、停下慢。在帧动画中通过<strong>调整每帧的位移量</strong>和<strong>帧持续时间</strong>来实现：
      </p>
      <ul>
        <li>缓出（加速）：前几帧位移小（间隔大），后几帧位移大（间隔小）</li>
        <li>缓入（减速）：前几帧位移大，后几帧位移小</li>
        <li>Aseprite 中：右键帧 → Frame Properties → 设置 Duration（毫秒）</li>
      </ul>

      <h3>4. 跟随与重叠动作（Follow Through）</h3>
      <p>物体主体停了，但附属部分还在动。飞机急停时，引擎火焰和天线还在惯性摆动 1-2 帧。</p>

      <table>
        <thead>
          <tr>
            <th>原则</th>
            <th>飞机大战应用场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>挤压拉伸</td>
            <td>爆炸（爆心挤压→膨胀）、Boss 登场</td>
          </tr>
          <tr>
            <td>预备动作</td>
            <td>Boss 大招前摇、道具掉落弹跳</td>
          </tr>
          <tr>
            <td>缓入缓出</td>
            <td>飞机移动、道具飘落、菜单过渡</td>
          </tr>
          <tr>
            <td>跟随重叠</td>
            <td>引擎火焰晃动、爆炸碎片飞散</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="💥" title="制作爆炸动画（16 帧）">
      <p>爆炸是飞机大战中<strong>最重要的动画</strong>——每次击杀敌机都要播放。</p>

      <h3>爆炸动画的规律</h3>
      <ol>
        <li><strong>爆发阶段（帧 1-4）：</strong>从中心向外快速扩张，亮黄/白色为主</li>
        <li><strong>燃烧阶段（帧 5-8）：</strong>火焰散开，橙/红色为主，碎片开始飞出</li>
        <li><strong>消散阶段（帧 9-12）：</strong>火焰变暗、变小，碎片消失</li>
        <li><strong>烟雾阶段（帧 13-16）：</strong>灰色烟雾升腾，逐渐透明消失</li>
      </ol>

      <h3>操作步骤</h3>
      <ol>
        <li>新建 <strong>32×32</strong> 画布，16 帧全部插入空白帧</li>
        <li>开启洋葱皮（前后各 2 帧）</li>
        <li>帧 1：在中心画一个 4×4 的亮黄色方块（爆炸起点）</li>
        <li>帧 2-4：逐渐扩大圆圈，颜色从黄过渡到橙</li>
        <li>帧 5-8：圆圈继续扩大但开始碎裂，加入红色和深色碎块</li>
        <li>帧 9-12：火焰缩小，碎块减少，颜色变暗</li>
        <li>帧 13-16：只剩几缕灰色烟雾，逐渐透明化</li>
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
        帧1-4：白 → 黄 → 橙 ｜ 帧5-8：橙 → 红 → 深红 ｜ 帧9-12：深红 → 灰 ｜ 帧13-16：灰 → 透明
      </p>
    </ConceptBlock>

    <ConceptBlock icon="🔥" title="制作引擎火焰动画（4 帧）">
      <p>引擎火焰是<strong>循环动画</strong>——4 帧无限循环播放，帧之间要有微妙的形状变化：</p>

      <ol>
        <li>新建 <strong>8×12</strong> 画布（只画火焰部分，之后合成到飞机上）</li>
        <li>4 帧的火焰形状依次变化：长→短→长→短（模拟火焰跳动）</li>
        <li>颜色：白（核心）→ 黄 → 橙 → 红（边缘）</li>
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
      <p>飞机停在原地时上下微微浮动——运动幅度很小（2-3 像素），但让画面有生命力：</p>
      <ol>
        <li>在 Aseprite 中新建 4-6 帧（从玩家飞机的静态图开始，Alt+N 逐帧复制）</li>
        <li>帧 1→2→3：飞机整体向上移动 0→1→2 像素</li>
        <li>帧 4→5→6：飞机整体向下移动 2→1→0 像素</li>
        <li>注意：引擎火焰的上下位移比机身大一点（跟随动作），火焰尖端可以有形态变化</li>
      </ol>

      <h3>移动倾斜动画（2-3 帧过渡）</h3>
      <p>飞机左右移动时，机身向移动方向微微倾斜——这给玩家提供了重要的<strong>视觉反馈</strong>：</p>
      <ul>
        <li>左移：机身向左倾斜 5-10 度（帧 1：正常 → 帧 2：左倾）</li>
        <li>右移：机身向右倾斜 5-10 度</li>
        <li>不动：回归正常角度</li>
        <li>简化方案：不真的旋转像素（会模糊），而是在倾斜方向多偏移 1-2 列像素</li>
      </ul>

      <div class="tip-box">
        <strong>Cocos 替代方案：</strong>如果不想手绘倾斜帧，可以在 Cocos 中通过
        <code>node.angle</code> 属性直接旋转飞机节点，配合 cc.tween
        做平滑过渡。像素画旋转可能会有锯齿，试试看效果。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✨" title="受击闪烁与道具动画">
      <h3>受击闪烁（Hit Flash）</h3>
      <p>飞机中弹时短暂全白，是最直接有效的受击反馈：</p>
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
          <strong>弹跳：</strong>道具图标上下弹跳（4 帧循环：正常→上升→最高点→下降），再加 1
          帧压缩（触地挤压）
        </li>
        <li><strong>闪光：</strong>道具周围画一圈星星/光点（2-4 像素），在 4 帧中轮流亮灭</li>
        <li><strong>旋转：</strong>菱形道具每 4 帧旋转 90°（刚好压平 4 个角），形成旋转视觉效果</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="📤" title="导出 SpriteSheet 到 Cocos">
      <p>
        画完动画后，需要导出为<strong>雪碧图（SpriteSheet）</strong>——一张包含所有帧的大图，每帧等距排列：
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
        <li>创建 Auto Atlas（参考 Phase 3）统一管理</li>
        <li>在代码中用 Phase 3 的 FrameAnimator 播放</li>
      </ol>

      <div class="warn-box">
        <strong>注意：</strong>如果动画帧数较多（16+ 帧），不要导出为单张巨大的长条图。用 Grid
        布局（比如 4×4 网格）更紧凑，也方便 Cocos 的 Atlas 处理。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔨" title="动手练习：完整的一个飞机爆炸">
      <p>综合本节所学，完成以下练习：</p>
      <ol>
        <li>画出 <strong>16 帧</strong>爆炸动画（32×32）</li>
        <li>画出 <strong>4 帧</strong>引擎火焰动画（8×12）</li>
        <li>两套动画分别导出为 SpriteSheet PNG</li>
        <li>把导出的 PNG 放入 Cocos 项目的 <code>assets/resources/textures/</code></li>
        <li>在 Cocos 中用 FrameAnimator 脚本（Phase 3 写的）播放爆炸动画</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>在 Cocos 游戏中：敌机被子弹击中时播放 16
        帧爆炸动画，动画结束后自动回收敌机节点。引擎火焰在玩家飞机尾部 4 帧循环播放。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>Aseprite 时间轴中，新帧（Alt+N）和空白新帧（Alt+B）的区别是什么？</li>
        <li>洋葱皮是干什么的？红色和蓝色虚影分别代表什么？</li>
        <li>像素动画中"挤压拉伸"是什么？在飞机大战中哪里用到？</li>
        <li>"预备动作"为什么重要？Boss 大招的预备动作怎么做？</li>
        <li>"缓入缓出"在 Aseprite 中怎么实现？（提示：Frame Duration）</li>
        <li>爆炸动画分为几个阶段？每个阶段多少帧、什么颜色？</li>
        <li>循环动画（如引擎火焰）的帧数一般比一次性动画（如爆炸）少，为什么？</li>
        <li>待机浮动动画的位移量应该多大？引擎火焰的位移和机身一样吗？</li>
        <li>受击闪烁有哪两种实现方式？各有什么优缺点？</li>
        <li>导出 SpriteSheet 时，Horizontal Strip 和 Grid 布局各自适合什么场景？</li>
        <li>导出的 PNG 放到 Cocos 项目的哪个目录？如何用代码播放？</li>
      </ul>
    </ConceptBlock>
  </ArtPhaseLayout>
</template>
