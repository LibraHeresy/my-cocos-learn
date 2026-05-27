<script setup lang="ts">
import ArtPhaseLayout from '@/components/ArtPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <ArtPhaseLayout :phase="7" title="进阶像素技巧" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>用<strong>视差滚动</strong>制作有纵深感的星空背景——不用逐帧画，而是分层平移</li>
        <li>用 <strong>Tileset</strong> 思路设计可重复拼接的地面或星空底纹</li>
        <li>用简单<strong>像素粒子</strong>增强击中和爆炸的视觉冲击力</li>
        <li>通过<strong>调色板换色</strong>从一套素材变出多种敌机颜色</li>
        <li>用<strong>色彩循环</strong>让传送带、能量槽、魔法阵"低成本动起来"</li>
      </ul>
    </ConceptBlock>

    <!-- ============ 视差滚动 ============ -->
    <ConceptBlock icon="🌌" title="视差滚动——深度的幻觉">
      <p>
        <strong>视差滚动（Parallax Scrolling）</strong>是 2D 游戏创造深度感的核心技法：远中近三层背景以不同速度平移——远的慢、近的快。前端工程师可以这样理解：<strong>这就是 CSS 的 <code>perspective</code> + 多层 <code>translateZ</code>，不过在 2D 引擎里是通过手动控制每层的移动速度实现的。</strong>
      </p>

      <h3>三层视差架构</h3>
      <table>
        <thead>
          <tr>
            <th>层级</th>
            <th>内容</th>
            <th>移动速度（相对相机）</th>
            <th>素材要求</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>远景层（Far）</strong></td>
            <td>深色星空底色 + 稀疏小星点</td>
            <td>10-20% 速度</td>
            <td>暗色为主，整体偏暗，不抢眼</td>
          </tr>
          <tr>
            <td><strong>中景层（Mid）</strong></td>
            <td>较大星云、星团、光晕</td>
            <td>40-60% 速度</td>
            <td>比远景亮一些，有形状感</td>
          </tr>
          <tr>
            <td><strong>近景层（Near）</strong></td>
            <td>大颗流星、碎星、漂浮物</td>
            <td>80-100% 速度</td>
            <td>最大最亮，但不要遮挡游戏区域</td>
          </tr>
        </tbody>
      </table>

      <h3>前端类比：从 CSS 到 Cocos</h3>
      <pre><code>/* CSS 视差（你熟悉的写法） */
        .parallax-far  { transform: translateZ(-10px) scale(2); }
        .parallax-mid  { transform: translateZ(-5px) scale(1.5); }
        .parallax-near { transform: translateZ(0) scale(1); }

        // Cocos 视差（等价逻辑）
        // 在 update(dt) 中：
        farLayer.x  -= cameraSpeed * 0.15 * dt;   // 15% 速度 → 等效 "远"
        midLayer.x  -= cameraSpeed * 0.50 * dt;   // 50% 速度 → 等效 "中"
        nearLayer.x -= cameraSpeed * 0.90 * dt;   // 90% 速度 → 等效 "近"</code></pre>

      <h3>无限滚动的实现</h3>
      <p>
        <strong>两图接力法（最常用）：</strong>每层准备两张相同的背景图，A 图在前、B 图紧挨在 A 图后面。当 A 图完全移出屏幕左侧时，将 A 图移到 B 图右侧。这和前端轮播图的无限循环逻辑完全一致——只是方向变成了垂直（飞机大战是竖屏滚动）。
      </p>

      <pre><code>// 竖屏无限滚动——两张图接力
        // 当 bgA 的顶部移出屏幕下方时，把 bgA 放到 bgB 的上方
        if (bgA.y &lt; -bgA.height) {
          bgA.y = bgB.y + bgB.height;
        }
        if (bgB.y &lt; -bgB.height) {
          bgB.y = bgA.y + bgA.height;
        }</code></pre>

      <h3>飞机大战的视差方案</h3>
      <table>
        <thead>
          <tr>
            <th>层级</th>
            <th>素材</th>
            <th>速度</th>
            <th>方向</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>远景</td>
            <td>深色背景 + 随机稀疏白点（星）</td>
            <td>30 px/s 向下</td>
            <td>竖屏向下滚动</td>
          </tr>
          <tr>
            <td>中景</td>
            <td>稍大星点 + 淡色星云团</td>
            <td>60 px/s 向下</td>
            <td>竖屏向下滚动</td>
          </tr>
          <tr>
            <td>近景</td>
            <td>偶尔飞过的大光点／流星</td>
            <td>120 px/s 向下</td>
            <td>竖屏向下滚动</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>不要三层都是素材：</strong>远景可以直接用 Canvas 的纯色背景（<code>cc.color('#0a0a1a')</code>），中景用一张带 α 通道的 PNG 循环滚动就够了。三层全部用纹理滚动 → 浪费内存和 DrawCall。前端同理——不是所有层都需要 background-image。
      </div>
    </ConceptBlock>

    <!-- ============ Tileset ============ -->
    <ConceptBlock icon="🧱" title="Tileset 无缝拼接——从 CSS background-repeat 到游戏地图">
      <p>
        前端中的 <code>background: url(tile.png) repeat;</code> 在游戏里叫 <strong>Tileset（图块集）</strong>。一张小图重复铺满一个区域——但像素画的难点在于<strong>拼接处不能看出接缝</strong>。
      </p>

      <h3>无缝拼接的核心规则</h3>
      <p>一张能无缝平铺的 Tile 必须满足：<strong>上边缘 = 下边缘，左边缘 = 右边缘</strong>。也就是说，Tile 的右边缘像素要和左边缘像素连续衔接，上边缘和下边缘也要连续衔接。</p>

      <h3>Aseprite 中的操作方法</h3>
      <ol>
        <li>新建画布（如 16×16）</li>
        <li>画中间的内容</li>
        <li>菜单 → Edit → <strong>FX</strong> → <strong>Convolution Matrix</strong> → 选择 <strong>Wrap</strong> 模式</li>
        <li>Aseprite 会把画布外的像素"卷"到对面——你可以直接在平铺视图下检查接缝</li>
        <li>或者：View → <strong>Tiled Mode</strong> → 选择平铺方向，实时预览拼接效果</li>
      </ol>

      <h3>适合 Tileset 的元素</h3>
      <table>
        <thead>
          <tr>
            <th>元素</th>
            <th>Tile 尺寸</th>
            <th>飞机大战应用</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>星空底纹</td>
            <td>32×32 或 64×64</td>
            <td>滚动背景的平铺基底</td>
          </tr>
          <tr>
            <td>地面／草地</td>
            <td>16×16 或 32×32</td>
            <td>不太适合飞机大战，但可用于横版关卡</td>
          </tr>
          <tr>
            <td>网格／科技感底纹</td>
            <td>8×8 或 16×16</td>
            <td>UI 背景、能量条底纹、雷达界面</td>
          </tr>
        </tbody>
      </table>

      <h3>Tileset 在 Cocos 中的应用</h3>
      <p>Cocos Creator 3.x 对 Tiled Map 的支持不如 2.x。对于飞机大战这种不需要复杂地图的场景，推荐的做法是：</p>
      <ol>
        <li>在 Aseprite 中画好可平铺的 Tile（如星空纹理）</li>
        <li>设置 Sprite 的 <strong>Wrap Mode</strong> 为 <strong>Repeat</strong>（重复模式）</li>
        <li>在材质中调整 Tiling 参数或通过代码动态偏移 UV</li>
        <li>或者最简单的方式：用两张图无缝接力（同上面的无限滚动方案），不依赖 Tiled 系统</li>
      </ol>

      <div class="tip-box">
        <strong>前端直觉：</strong>一个好 Tile 就像一个好的 CSS 渐变——在 <code>background-repeat: repeat</code> 下看不出边界。Aseprite 的 Tiled Mode 就是 CSS 里的 <code>background-repeat</code> 预览。
      </div>
    </ConceptBlock>

    <!-- ============ 像素粒子 ============ -->
    <ConceptBlock icon="✨" title="像素粒子——用代码生成'人工爆炸'">
      <p>
        粒子系统是游戏里产生大量小物体（火花、碎片、烟雾）的标准方式。但粒子发射出来的纹理需要自己画。像素粒子就是要设计 1-3 帧非常小的纹理（2×2 到 8×8），让粒子系统去生成成千上万个。
      </p>

      <h3>粒子纹理设计规则</h3>
      <table>
        <thead>
          <tr>
            <th>粒子用途</th>
            <th>纹理尺寸</th>
            <th>纹理内容</th>
            <th>数量</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>爆炸火花</td>
            <td>4×4 或 6×6</td>
            <td>白→橙→暗 渐变圆点，中心亮</td>
            <td>10-20</td>
          </tr>
          <tr>
            <td>命中碎片</td>
            <td>2×2 或 3×3</td>
            <td>纯白色方块</td>
            <td>5-10</td>
          </tr>
          <tr>
            <td>引擎尾焰粒子</td>
            <td>4×4</td>
            <td>橙色→透明渐变圆点</td>
            <td>3-8</td>
          </tr>
          <tr>
            <td>拾取星星</td>
            <td>6×6</td>
            <td>四角星形，浅金色</td>
            <td>5-8</td>
          </tr>
          <tr>
            <td>烟尘</td>
            <td>8×8</td>
            <td>灰棕色半透明雾团</td>
            <td>3-5</td>
          </tr>
        </tbody>
      </table>

      <h3>纹理最小化原则</h3>
      <p>
        粒子纹理<strong>越小越好</strong>——4×4 就够了。粒子系统会帮你缩放、旋转、变色、改变透明度。纹理只是"一粒种子的形状"，不是最终效果。这和前端 CSS 中一个 4×4 的 PNG 通过 transform 和 opacity 做出丰富效果是一个道理。
      </p>

      <h3>Cocos 粒子系统快速配置（2D）</h3>
      <p>Cocos Creator 3.x 的 2D 粒子系统需要通过 ParticleSystem2D 组件。如果没有内置模板，一个简单的"土法粒子"替代方案：</p>
      <ol>
        <li>写一个简易脚本，在爆炸位置生成 N 个小 Sprite 节点</li>
        <li>每个节点随机方向、随机速度、随机初始旋转</li>
        <li>用 <code>cc.tween</code> 让每个节点飞出去并逐渐缩小+透明</li>
        <li>tween 结束后销毁节点（<code>node.destroy()</code>）</li>
      </ol>

      <pre><code>// 土法粒子——前端朋友最亲切的写法
        function spawnParticles(parent: cc.Node, count: number, texture: cc.SpriteFrame) {
          for (let i = 0; i &lt; count; i++) {
            const p = new cc.Node('particle');
            const sprite = p.addComponent(cc.Sprite);
            sprite.spriteFrame = texture;
            p.setParent(parent);
            p.setPosition(0, 0);

            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 120;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;

            cc.tween(p)
              .by(0.4, { x: dx, y: dy })
              .by(0.2, { scale: -0.6 })
              .call(() =&gt; p.destroy())
              .start();
          }
        }</code></pre>

      <div class="warn-box">
        <strong>管理节点数量：</strong>"土法粒子"每次调用创建 N 个新节点——如果同时有 5 个爆炸每个 20 个粒子 = 100 个节点。记得在 tween 结束时 <code>destroy()</code>。更好的做法是用<strong>对象池</strong>（Node Pool）预创建一批粒子节点，用完回收。这和前端虚拟列表的 DOM 复用思想完全一致。
      </div>
    </ConceptBlock>

    <!-- ============ 调色板换色 ============ -->
    <ConceptBlock icon="🎨" title="调色板换色——一套素材，N 种外观">
      <p>
        前端中的"CSS 变量换肤"在像素画里的等价技术就是<strong>调色板换色（Palette Swapping）</strong>。把素材中的颜色映射到新颜色——同一套敌机素材，换一套颜色就变成另一种敌机。
      </p>

      <h3>两种实现方案</h3>
      <table>
        <thead>
          <tr>
            <th>方案</th>
            <th>做法</th>
            <th>代价</th>
            <th>适用场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Aseprite 换色导出</strong></td>
            <td>在 Aseprite 中修改调色板 → 导出多套 PNG</td>
            <td>多了文件，多了加载次数</td>
            <td>敌机种类少（3-5 种），对加载次数不敏感</td>
          </tr>
          <tr>
            <td><strong>Shader 换色（运行时）</strong></td>
            <td>写一个简单的颜色替换 Shader，在 GPU 中实时替换颜色</td>
            <td>Shader 编写成本，对 GPU 有微弱开销</td>
            <td>敌机种类多，或需要运行时变色（如 Boss 血量分阶段变色）</td>
          </tr>
          <tr>
            <td><strong>Sprite.color（最简单）</strong></td>
            <td>直接修改 <code>sprite.color</code> 属性做乘法着色</td>
            <td>不能精确替换特定颜色，只能整体偏色</td>
            <td>简单变种：敌机偏红（强化版）、道具偏金（稀有版）</td>
          </tr>
        </tbody>
      </table>

      <h3>Aseprite 换色工作流</h3>
      <ol>
        <li>打开原始素材（如敌机 A——红色系）</li>
        <li>菜单 → Sprite → <strong>Color Mode</strong> → 确保在 <strong>Indexed</strong>（索引色）模式</li>
        <li>打开调色板面板（Palette）</li>
        <li>选中要替换的颜色行 → 修改 RGB 值——所有该颜色的像素同时改变</li>
        <li>另存为新文件（敌机 B——蓝色系，敌机 C——绿色系）</li>
      </ol>

      <div class="tip-box">
        <strong>调色板设计技巧：</strong>像素素材只用 8-16 种颜色，并且把"主色"（如机身色）、"亮色"（高光）、"暗色"（阴影）放在调色板的连续位置。换色时只需修改 3 个颜色槽，整张图就变成另一种配色。这就是前端中"一套 CSS 变量控制整个主题"的像素版。
      </div>
    </ConceptBlock>

    <!-- ============ 色彩循环 ============ -->
    <ConceptBlock icon="🌈" title="色彩循环动画——让颜色自己动起来">
      <p>
        <strong>色彩循环（Color Cycling）</strong>是一种低成本动画技术：物体本身不移动、不变形、不换帧，只是<strong>像素的颜色按规律变化</strong>。一张静止图 + 色彩循环 = "看起来在动"。这有点像前端的 CSS <code>@keyframes</code> 修改 <code>background-color</code>——但作用在像素级别。
      </p>

      <h3>飞机大战中的应用</h3>
      <table>
        <thead>
          <tr>
            <th>效果</th>
            <th>实现方式</th>
            <th>帧数</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>引擎火焰呼吸</strong></td>
            <td>火焰像素的颜色循环：白→黄→橙→红→暗红→橙→黄→白</td>
            <td>相当于 1 张图的颜色在 5-8 种颜色间循环</td>
          </tr>
          <tr>
            <td><strong>道具光晕呼吸</strong></td>
            <td>道具周围一圈光晕像素的颜色在亮金↔暗金间交替</td>
            <td>2-3 种颜色循环</td>
          </tr>
          <tr>
            <td><strong>传送带/能量条流动</strong></td>
            <td>在一条像素带上，颜色循环制造"向前流动"的错觉</td>
            <td>3-4 种颜色沿像素带依次推进</td>
          </tr>
          <tr>
            <td><strong>Boss 弱点闪烁</strong></td>
            <td>Boss 某个弱点区域的颜色在红↔亮红↔白之间快速循环</td>
            <td>3 种颜色 150ms 循环</td>
          </tr>
        </tbody>
      </table>

      <h3>Aseprite 中实现色彩循环</h3>
      <ol>
        <li>确保画布在 <strong>Indexed</strong>（索引色）模式</li>
        <li>在调色板中选中要循环的一组颜色（如火焰的 5 档色阶）</li>
        <li>菜单 → Sprite → <strong>Color Curve</strong>（色彩曲线）→ 创建一个循环曲线</li>
        <li>或者更直接的方式——逐帧手动改色：
          <ul>
            <li>帧 1：火焰像素用颜色 #1</li>
            <li>帧 2：火焰像素用颜色 #2</li>
            <li>以此类推，N 帧后回到颜色 #1</li>
          </ul>
        </li>
      </ol>

      <h3>在 Cocos 中用代码做色彩循环</h3>
      <p>
        如果不想在 Aseprite 中逐帧导出，可以在 Cocos 中用代码控制颜色替换。写一个脚本周期性地修改 Sprite 的材质颜色参数，或者直接切换 SpriteFrame（预先生成几帧不同颜色的版本）。最佳实践：<strong>2-3 帧颜色变化用材质参数，超过 4 帧还是导出 SpriteSheet 划算。</strong>
      </p>

      <div class="tip-box">
        <strong>成本优势：</strong>5 帧色彩循环的视觉信息量和 5 帧完整逐帧动画差不多——但色彩循环不需要重画形状。在 Aseprite 中只需要 1 帧画好形状，剩下 4 帧只改颜色不改像素位置。对于重复性强的元素（火焰、光晕、传送带），色彩循环的性价比极高。
      </div>

      <div class="warn-box">
        <strong>色彩循环的局限：</strong>它不能产生"形状变化"。一架飞机的翅膀不可能通过色彩循环扇动。色彩循环最适合的是<strong>纹理型运动</strong>——火焰、水流、光晕、能量流动——这些"看起来流动"的东西本质上是颜色在移动而非形状在变化。
      </div>
    </ConceptBlock>

    <!-- ============ 动手练习 ============ -->
    <ConceptBlock icon="🔨" title="动手练习">
      <ol>
        <li>在 Aseprite 中开启 Tiled Mode，画一张 32×32 的无缝星空 Tile，导出后在 Cocos 中平铺验证无缝效果</li>
        <li>将背景星空拆成远、中、近三层，在 Cocos 中分别设置不同的滚动速度（30/60/120 px/s）</li>
        <li>画 2-3 个 4×4 的粒子纹理（火花、碎片、烟雾点），在 Cocos 中用"土法粒子"脚本生成爆炸效果</li>
        <li>用 Aseprite 的调色板换色功能，从一套敌机素材变出红、蓝、绿三种配色，导出三套 PNG</li>
        <li>给引擎火焰做一个 5 帧的色彩循环动画（不改变像素位置，只改变火焰像素的颜色），对比原版帧动画的效果差异</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>视差滚动中远、中、近三层的速度比例一般是多少？这和 CSS perspective 有什么对应关系？</li>
        <li>实现无限滚动的"两图接力法"的核心逻辑是什么？和前端轮播图的无缝循环有什么异同？</li>
        <li>Tileset 无缝拼接的核心规则是什么？在 Aseprite 中如何预览平铺效果？</li>
        <li>"土法粒子"是什么原理？和对象池的关系是什么？为什么用对象池更好？</li>
        <li>调色板换色有哪三种实现方案？各自适合什么场景？</li>
        <li>色彩循环和逐帧动画的本质区别是什么？什么类型的运动适合色彩循环？</li>
        <li>在 Aseprite 中修改调色板的某个颜色的 RGB 值后，画布上哪些像素会变色？</li>
        <li>画一张新的 32×32 无缝星空 Tile，能解释为什么上下左右边缘能对上吗？</li>
      </ul>
    </ConceptBlock>
  </ArtPhaseLayout>
</template>
