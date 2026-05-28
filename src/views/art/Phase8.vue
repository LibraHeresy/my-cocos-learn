<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="8" title="UI 与 HUD 美术" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>设计像素风格的<strong>按钮四态</strong>（Normal/Hover/Pressed/Disabled）——用有限的像素表达交互状态变化</li>
        <li>制作<strong>9-Slice 友好</strong>的对话框和面板素材——边框均匀、中心区可平铺</li>
        <li>设计<strong>血条、能量条</strong>等 HUD 元素，包括颜色渐变（绿到黄到红）和分层结构</li>
        <li>在 8x8 到 16x16 的极小尺寸下设计<strong>可读的图标</strong>——高对比度、清晰剪影、精准去细节</li>
        <li>为 UI 系统建立<strong>独立的配色方案</strong>，区分于游戏世界——理解 UI 色板设计的可访问性原则</li>
      </ul>
    </ConceptBlock>

    <!-- ============ 按钮设计 ============ -->
    <ConceptBlock icon="🔘" title="按钮四态——像素交互的四种面孔">
      <p>
        <strong>像素 UI 的按钮</strong>每种状态变化只能用几个像素来表达，不能像矢量 UI 那样加投影、加圆角、改 border-width。前端同学可以这样理解：<strong>这就像 CSS 中一个按钮的 :hover、:active、:focus-visible、:disabled 伪类——但在像素画里，每个状态都是手工画的像素偏移和颜色替换。</strong>
      </p>

      <h3>四态设计规范</h3>
      <table>
        <thead>
          <tr>
            <th>状态</th>
            <th>视觉变化</th>
            <th>像素技法</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Normal（默认）</strong></td>
            <td>按钮"凸起"的立体感</td>
            <td>左上边缘亮色（高光），右下边缘暗色（阴影），模拟光源从左上方照射</td>
            <td><code>box-shadow: 2px 2px 0 #000</code> 的凸起效果</td>
          </tr>
          <tr>
            <td><strong>Hover（悬停）</strong></td>
            <td>按钮变亮或外发光</td>
            <td>整体颜色提升一个亮度级别，或在按钮外圈加 1px 的淡色轮廓</td>
            <td><code>:hover { filter: brightness(1.1); box-shadow: 0 0 4px }</code></td>
          </tr>
          <tr>
            <td><strong>Pressed（按下）</strong></td>
            <td>按钮"凹陷"</td>
            <td>整体向下向右移动 1px，同时把亮边和暗边<strong>互换位置</strong>——左上变暗、右下变亮</td>
            <td><code>:active { transform: translate(1px,1px); box-shadow: inset }</code></td>
          </tr>
          <tr>
            <td><strong>Disabled（禁用）</strong></td>
            <td>灰化、低对比度</td>
            <td>整体覆盖一层半透明灰色（50% 灰度混合），文字和边框对比度大幅降低</td>
            <td><code>:disabled { opacity: 0.4; filter: grayscale(1) }</code></td>
          </tr>
        </tbody>
      </table>

      <h3>亮边/暗边互换——Pressed 态的核心技法</h3>
      <p>
        这是像素按钮最重要的一条规则。Normal 态时左上边是亮的、右下边是暗的，让按钮看起来像"浮在屏幕上"。Pressed 态时把这个关系<strong>完全颠倒</strong>——左上边变暗、右下边变亮，按钮看起来就像"被按进屏幕里"。这个技巧只需要交换 4-6 个像素的颜色，但视觉效果非常直观。
      </p>

      <pre><code>// Normal 态的边框配色（光源在左上方）
        // 上边框：亮色（#e8d5a3）  →  左边框：亮色（#e8d5a3）
        // 下边框：暗色（#5c3d1e）  →  右边框：暗色（#5c3d1e）
        //
        // Pressed 态的边框配色（互换！）
        // 上边框：暗色（#5c3d1e）  →  左边框：暗色（#5c3d1e）
        // 下边框：亮色（#e8d5a3）  →  右边框：亮色（#e8d5a3）
        //
        // 同时整体向右下偏移 1px</code></pre>

      <h3>9-Slice 友好的按钮形状</h3>
      <p>
        按钮素材应该设计成<strong>可以被 9-Slice 拉伸</strong>的形状。具体要求：
      </p>
      <ol>
        <li><strong>四角</strong>：圆角或斜角装饰固定在 3-4px 范围内，这部分在拉伸时不变形</li>
        <li><strong>上下边</strong>：水平方向的边框区域，颜色和纹理均匀，可以水平拉伸</li>
        <li><strong>中心区</strong>：纯色或简单纹理，可以双向拉伸，文字就放在这个区域</li>
        <li><strong>左右边</strong>：垂直方向的边框区域，颜色均匀，可以垂直拉伸（用于不同高度的按钮）</li>
      </ol>

      <div class="tip-box">
        <strong>前端直觉：</strong>9-Slice 本质上就是 CSS <code>border-image</code> 的 <code>slice</code> 属性。四角 = 四个角的 border-image 不参与拉伸，四边 = <code>border-image-repeat: stretch</code> 的区域，中心 = <code>fill</code> 区域。在 Aseprite 中画完按钮后，用参考线标出 9-Slice 切割位置，导入手动挡进 Cocos 的 Sprite Editor。
      </div>

      <h3>按钮尺寸建议</h3>
      <table>
        <thead>
          <tr>
            <th>按钮类型</th>
            <th>推荐尺寸（像素）</th>
            <th>9-Slice 四角保护</th>
            <th>文字区域</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>大型主按钮（"开始游戏"）</td>
            <td>宽 96-128，高 24-32</td>
            <td>四角 4px</td>
            <td>宽约 88-120，高约 16-24</td>
          </tr>
          <tr>
            <td>中型功能按钮（"设置""商店"）</td>
            <td>宽 64-80，高 20-24</td>
            <td>四角 3px</td>
            <td>宽约 56-74，高约 14-18</td>
          </tr>
          <tr>
            <td>小型图标按钮（关闭 X、返回箭头）</td>
            <td>宽 16-24，高 16-24</td>
            <td>不用 9-Slice</td>
            <td>图标就是内容</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <!-- ============ 对话框/面板设计 ============ -->
    <ConceptBlock icon="🪟" title='对话框与面板——像素 UI 的"容器组件"'>
      <p>
        前端中一个弹窗 = <code>&lt;Modal&gt;</code> 或 <code>&lt;Dialog&gt;</code> 组件，有标题栏、内容区、操作按钮区。像素 UI 的画板设计就是给这些"容器"画上装饰边框、标题栏背景和半透明遮罩。
      </p>

      <h3>面板的层级结构</h3>
      <table>
        <thead>
          <tr>
            <th>层级</th>
            <th>内容</th>
            <th>像素设计要点</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>遮罩层（Overlay）</strong></td>
            <td>盖住游戏画面的半透明层</td>
            <td>不需要纹理——用代码画一个全屏的黑色/深蓝色半透明矩形（alpha 0.5-0.7）</td>
          </tr>
          <tr>
            <td><strong>面板主体</strong></td>
            <td>对话框的"纸"——带装饰边框的矩形</td>
            <td>9-Slice 拉伸，边框 3-5px 粗，四角有装饰（铆钉、宝石、花纹）</td>
          </tr>
          <tr>
            <td><strong>标题栏</strong></td>
            <td>面板顶部的一条横条</td>
            <td>左右两端有装饰图案，中间留空放标题文字，颜色要比面板主体更突出</td>
          </tr>
          <tr>
            <td><strong>内容区</strong></td>
            <td>文字、选项、图标等</td>
            <td>由 Cocos 的 Label 和 Sprite 组件填充，面板素材只需提供干净的底色</td>
          </tr>
        </tbody>
      </table>

      <h3>边框装饰风格参考</h3>
      <p>像素 UI 常见的边框装饰风格有几种，根据游戏整体美术风格选择：</p>

      <table>
        <thead>
          <tr>
            <th>风格</th>
            <th>边框特征</th>
            <th>四角装饰</th>
            <th>适合的游戏类型</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>金属铆钉风</strong></td>
            <td>银色/灰色金属边框，1-2px 高光线</td>
            <td>四角各一颗小铆钉（4x4 螺钉图案）</td>
            <td>科幻、机甲、飞机大战</td>
          </tr>
          <tr>
            <td><strong>木框古典风</strong></td>
            <td>棕色木纹边框，有纹理变化</td>
            <td>四角有金属包角装饰</td>
            <td>奇幻 RPG、中世纪</td>
          </tr>
          <tr>
            <td><strong>暗色简约风</strong></td>
            <td>深色边框 + 1px 亮色内边线</td>
            <td>四角不做额外装饰，保持干净</td>
            <td>现代简约、解谜、独立游戏</td>
          </tr>
          <tr>
            <td><strong>宝石镶嵌风</strong></td>
            <td>金色/铜色边框 + 四角镶嵌宝石</td>
            <td>四角各一颗 6x6 的彩色宝石</td>
            <td>魔幻、卡牌、冒险</td>
          </tr>
          <tr>
            <td><strong>像素复古风</strong></td>
            <td>粗边框（4-5px），纯色无渐变</td>
            <td>四角有向内的锯齿装饰</td>
            <td>复古街机风、像素平台</td>
          </tr>
        </tbody>
      </table>

      <h3>标题栏设计</h3>
      <p>
        标题栏是面板<strong>最引人注目的部分</strong>。好的标题栏设计让玩家一眼知道这是什么窗口。标题栏通常是面板顶部的 16-24px 高的横条，包含：
      </p>
      <ol>
        <li><strong>标题文字</strong>：居中或左对齐，颜色与面板底色形成高对比</li>
        <li><strong>装饰线</strong>：标题文字下方 1-2px 的分隔线，或者标题左右两侧的装饰花纹</li>
        <li><strong>关闭按钮</strong>：右上角一个 12x12 或 16x16 的 X 图标</li>
        <li><strong>背景色</strong>：可以是面板主色的更深或更亮变体，或者用对比色</li>
      </ol>

      <div class="tip-box">
        <strong>标题栏和前端组件类比：</strong>标题栏 = Ant Design 的 <code>Modal.title</code> + <code>Modal.extra</code>（右上角关闭按钮）。在像素画中，标题栏和面板主体可以画在同一张 9-Slice 材质中——标题栏位于面板上方的固定高度区域，拉伸时这个区域的高度不变。
      </div>

      <h3>半透明遮罩的像素处理</h3>
      <p>
        弹窗背后的遮罩有两种做法：
      </p>
      <ol>
        <li><strong>代码方案（推荐）：</strong>Cocos 中创建一个全屏 Node，用 Graphics 组件画一个纯色矩形，设置节点的 opacity。不需要纹理资源</li>
        <li><strong>纹理方案：</strong>画一张 8x8 的纯暗色 Tile，用 Repeat 模式铺满全屏，再在上面叠加一个半透明遮罩节点</li>
      </ol>
      <p>代码方案的优势：零纹理内存，可以动画（淡入淡出），可以加点击关闭逻辑。就像前端用 CSS <code>rgba(0,0,0,0.6)</code> 做 backdrop。</p>
    </ConceptBlock>

    <!-- ============ HUD 元素 ============ -->
    <ConceptBlock icon="❤️" title="HUD 元素——血量、分数与微缩图标">
      <p>
        <strong>HUD（Heads-Up Display）</strong>是游戏过程中始终显示在屏幕上的信息层：血条、能量、分数、技能冷却图标、小地图等。HUD 的核心要求：<strong>一眼看懂，不遮挡游戏视野，风格统一</strong>。
      </p>

      <h3>血条（Health Bar）设计</h3>
      <p>
        血条是 HUD 中最关键的元素。一个好的像素血条包含三层结构：
      </p>

      <table>
        <thead>
          <tr>
            <th>层级</th>
            <th>作用</th>
            <th>像素设计</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>背景框</strong></td>
            <td>血条的最大范围，始终显示</td>
            <td>深色金属边框（2px 粗），内部为暗色底色（接近黑色），9-Slice 拉伸</td>
          </tr>
          <tr>
            <td><strong>血量填充</strong></td>
            <td>当前血量，宽度随血量变化</td>
            <td>从左到右颜色渐变：<strong>绿（100-60%）→ 黄（60-30%）→ 红（30-0%）</strong></td>
          </tr>
          <tr>
            <td><strong>高光/装饰</strong></td>
            <td>让血条看起来有立体感</td>
            <td>血量填充区域的上边缘 1px 亮色线（模拟玻璃管反光），不动</td>
          </tr>
        </tbody>
      </table>

      <h3>血量渐变的实现方案</h3>
      <p>绿到黄到红的颜色过渡有三种实现方式，按复杂度递增：</p>

      <table>
        <thead>
          <tr>
            <th>方案</th>
            <th>实现</th>
            <th>精度</th>
            <th>飞机大战推荐</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>分段切图</strong></td>
            <td>准备 3-5 张不同颜色的血量填充图，根据血量百分比切换</td>
            <td>粗（5 段 = 每 20% 一档）</td>
            <td>✅ 最简单，推荐先用这个</td>
          </tr>
          <tr>
            <td><strong>代码颜色插值</strong></td>
            <td>在 update() 中用 <code>cc.Color.lerp()</code> 从绿色插值到黄色再到红色</td>
            <td>平滑（每帧都可不同）</td>
            <td>进阶优化</td>
          </tr>
          <tr>
            <td><strong>Shader 渐变</strong></td>
            <td>写一个简单的 Fragment Shader，用 UV 坐标做渐变</td>
            <td>完全平滑</td>
            <td>过度设计，一般不需要</td>
          </tr>
        </tbody>
      </table>

      <pre><code>// 代码插值方案——前端直觉：HSL 色相旋转 + 宽度百分比
        function getHealthColor(ratio: number): cc.Color {
          // ratio: 0.0 (死) ~ 1.0 (满血)
          if (ratio > 0.5) {
            // 50%-100%：红色→黄色
            const t = (ratio - 0.5) * 2; // 映射回 0-1
            return cc.Color.lerp(cc.Color.RED, cc.Color.YELLOW, t);
          } else {
            // 0%-50%：黄色→绿色
            const t = ratio * 2;
            return cc.Color.lerp(new cc.Color(255, 255, 0), new cc.Color(0, 255, 0), t);
          }
        }</code></pre>

      <h3>分数/数字显示</h3>
      <p>
        像素风格的分数显示有两种主流做法：
      </p>
      <ol>
        <li><strong>位图字体（推荐）：</strong>画一套 0-9 的数字（每个 8x8 或 8x12），在 Cocos 中用 BitmapFont 组件渲染。一套字体画一次，所有数字都复用</li>
        <li><strong>独立数字纹理：</strong>每个数字画一个 SpriteFrame，代码中根据分数动态切换。简单但浪费资源</li>
      </ol>

      <p>位图字体的设计要点：</p>
      <ul>
        <li>每个数字 8x8 到 10x12 像素，带 1-2px 外描边（增强可读性）</li>
        <li>字形简洁——像素字体不要用衬线（serif），用等宽（monospace）风格</li>
        <li>颜色：亮白/亮金色 + 深色描边 = 在任何背景上都可读</li>
      </ul>

      <h3>图标在极小尺寸下的设计</h3>
      <p>
        HUD 中的图标往往只有 8x8 到 16x16 像素。在这么小的空间里画一个可识别的图标需要遵循严格的<strong>去细节原则</strong>。
      </p>

      <table>
        <thead>
          <tr>
            <th>尺寸</th>
            <th>可用像素数</th>
            <th>能表达什么</th>
            <th>不能表达什么</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>8x8</strong></td>
            <td>64 个像素</td>
            <td>心形、星形、十字、箭头方向、简单的几何符号</td>
            <td>任何复杂形状、脸部特征、文字</td>
          </tr>
          <tr>
            <td><strong>10x10</strong></td>
            <td>100 个像素</td>
            <td>稍复杂的心形、盾牌、剑、药水、金币、钥匙</td>
            <td>多物体组合、透视感</td>
          </tr>
          <tr>
            <td><strong>12x12</strong></td>
            <td>144 个像素</td>
            <td>技能图标（火球、冰冻、闪电）、小武器图标</td>
            <td>人物脸部</td>
          </tr>
          <tr>
            <td><strong>16x16</strong></td>
            <td>256 个像素</td>
            <td>复杂图标（齿轮、宝箱、卷轴）、简单的脸部表情</td>
            <td>细节纹理、多层级场景</td>
          </tr>
        </tbody>
      </table>

      <h3>小图标设计四原则</h3>
      <ol>
        <li>
          <strong>高对比度：</strong>图标内部用亮色，背景用暗色或无背景。在小尺寸下，低对比度的渐变毫无意义——3 个相邻的近似色在 8x8 中看起来就是一个模糊的色块
        </li>
        <li>
          <strong>清晰剪影：</strong>图标的<strong>外轮廓</strong>是玩家识别它的主要线索。先用 1 种颜色画出轮廓，确保只看轮廓就能认出是什么，然后再填充内部颜色。这和 UI 设计中"icon 的 silhouette test"是同一个道理
        </li>
        <li>
          <strong>减少细节：</strong>在 16x16 中你可以尝试加 1px 的高光或阴影。在 8x8 中——<strong>一个像素就是一个 feature</strong>。不要试图在 8x8 里画眼睛+鼻子+嘴巴。一个简单的几何形（如菱形 = 宝石、十字 = 加血）已经足够
        </li>
        <li>
          <strong>保持像素对齐：</strong>小图标中任何偏离 1px 都会让形状歪斜。用 Aseprite 的网格和对称工具确保像素精确到位
        </li>
      </ol>

      <div class="warn-box">
        <strong>小图标的常见错误：</strong>在 8x8 的图标里用 4-5 种颜色做"渐变"——最终在屏幕上看起来就是杂色一团。8x8 图标用 2-3 种颜色（主体色 + 高光色 + 描边色）就足够了。多余的颜色只会增加视觉噪点。前端类比：在 16px 的 favicon 里你不会用 5 种渐变颜色，而是用简洁的几何图形。
      </div>
    </ConceptBlock>

    <!-- ============ 小尺寸可读性 ============ -->
    <ConceptBlock icon="🔬" title='小尺寸可读性——"一个像素就是一个设计决策"'>
      <p>
        在 32x32 以上的画布中，你可以有"无意义的像素"——过渡色、抗锯齿边、纹理噪点。但在 8x8 到 16x16 的 UI 元素中，<strong>每一个像素都必须有存在理由</strong>。这和前端设计系统中的"每个 spacing token 都要有意义"是同一个思维模式。
      </p>

      <h3>可读性的三个维度</h3>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>技法</th>
            <th>反面案例</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>色相对比</strong></td>
            <td>图标主体和背景用色相环上对立的颜色（如黄图标 + 深蓝背景）</td>
            <td>红色图标放在橙色按钮上——色相近，糊在一起</td>
          </tr>
          <tr>
            <td><strong>明度对比</strong></td>
            <td>保证图标和背景至少有 40-50% 的明度差距。用 Aseprite 的色彩面板检查 RGB 亮度值</td>
            <td>灰色系图标放在灰色面板上——高端，但完全看不到</td>
          </tr>
          <tr>
            <td><strong>形状对比</strong></td>
            <td>相邻图标用明显不同的轮廓形状（圆 vs 方 vs 三角），让玩家不依赖颜色也能区分</td>
            <td>所有图标都是圆形，仅靠颜色区分——对色盲玩家不友好</td>
          </tr>
        </tbody>
      </table>

      <h3>像素 UI 的"安全间距"</h3>
      <p>
        在 8x8 到 16x16 的极小空间内，图标之间、图标和文字之间需要留出<strong>至少 2px 间距</strong>。不留间距的 UI 元素会"粘连"在一起，玩家难以区分"这是一个图标还是两个"。这和前端 UI 中按钮之间的 <code>gap: 8px</code> 是同样的原则——在像素层面，2px 就相当于 web 中的 8px。
      </p>

      <div class="tip-box">
        <strong>前端类比：</strong>像素 UI 的设计过程就像在做一个 80x40 的"小屏幕布局"——每个元素都必须精简到极致。Material Design 的 8dp 栅格系统在像素 UI 中变成了 1-2px 栅格。在 Aseprite 中打开网格（View → Grid → 设置 2x2 或 4x4 的网格间距），强制自己在栅格内布局元素——就像前端开发中的 8px grid system。
      </div>
    </ConceptBlock>

    <!-- ============ UI 配色方案 ============ -->
    <ConceptBlock icon="🎨" title="UI 色板——独立于游戏世界的视觉系统">
      <p>
        UI 的配色方案<strong>不应该和游戏世界混在一起</strong>。如果游戏场景的主色调是深蓝太空风，UI 也用深蓝色系，玩家在激烈战斗中很难一眼区分"这是敌人还是我的血条"。
      </p>

      <h3>UI 色板的设计原则</h3>
      <table>
        <thead>
          <tr>
            <th>原则</th>
            <th>说明</th>
            <th>飞机大战示例</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>和游戏场景形成对比</strong></td>
            <td>UI 的色调应该是场景色板中<strong>不存在的颜色</strong>或<strong>互补色</strong></td>
            <td>场景是深蓝+黑色星空 → UI 用金色/暖橙色系</td>
          </tr>
          <tr>
            <td><strong>UI 内部自成体系</strong></td>
            <td>所有 UI 元素共享同一套主色+辅色+强调色</td>
            <td>UI 主色=深灰蓝底，辅色=金边，强调色=亮红（警告），功能色=亮绿（确认）</td>
          </tr>
          <tr>
            <td><strong>功能色语义化</strong></td>
            <td>红色=危险/警告/扣血，绿色=安全/回复/确认，金色=重要/稀有/高分</td>
            <td>血条用绿→黄→红，分数用金色，技能冷却用蓝色</td>
          </tr>
          <tr>
            <td><strong>可访问性</strong></td>
            <td>关键信息的对比度足够。不要仅靠颜色区分信息——加形状或图标辅助</td>
            <td>血条不仅是颜色变化，还有宽度变化（双通道信息）</td>
          </tr>
        </tbody>
      </table>

      <h3>飞机大战 UI 推荐色板</h3>
      <pre><code>// UI 主色系——暖金色（与冷蓝场景形成对比）
        UI 面板底色    #1a1a2e（深蓝灰——和场景暗色相近但不完全一样）
        UI 面板边框    #c9a84c（暗金色——和场景的蓝色产生温-冷对比）
        UI 装饰高光    #f0d78c（亮金色——边框的高光线）
        UI 文字主色    #ffffff（白色——最大对比度）
        UI 文字辅色    #c9a84c（金色——用于标题和重点）

        // 功能色——语义化
        血量高        #4caf50（绿）
        血量中        #ffc107（琥珀黄）
        血量低        #f44336（红）
        护盾/能量     #2196f3（蓝）
        得分/金币     #ffd700（金）
        系统警告      #ff5252（亮红）
        系统确认      #69f0ae（亮绿）</code></pre>

      <h3>对比度检查</h3>
      <p>
        虽然像素画没有 WCAG 自动化检查工具，但可以手动做简单检查：
      </p>
      <ol>
        <li>在 Aseprite 中将画布切换到<strong>灰度模式</strong>（View → Color Mode → Grayscale）——如果某个 UI 元素在灰度下看不清，说明明度对比不够</li>
        <li>将画布缩放至<strong>100%</strong>（1:1 像素映射）——这就是玩家在手机上看到的实际大小。在这个尺寸下还能读懂吗？</li>
        <li>让一个<strong>不玩这个游戏的朋友</strong>看一眼截图——3 秒内能说出血量还剩多少吗？能的话，HUD 设计成功了</li>
      </ol>

      <div class="warn-box">
        <strong>UI 色板的最大陷阱：</strong>过度使用"游戏场景色板"做 UI。你的星空是深蓝色的 → UI 也用深蓝色 → 血条、分数、技能图标统统糊在背景里。记住：<strong>UI 是"浮在游戏世界上方的另一层"，它不是游戏世界的一部分。</strong>就像前端中 Modal 的 backdrop 和 Modal 本身的配色应该是分开的。UI 可以致敬场景色板（用同一色调的明/暗变体），但必须保持足够的独立性。
      </div>
    </ConceptBlock>

    <!-- ============ 动手练习 ============ -->
    <ConceptBlock icon="🔨" title="动手练习">
      <ol>
        <li>在 Aseprite 中设计一个 9-Slice 友好的按钮素材（建议 96x24），包含 Normal/Hover/Pressed/Disabled 四种状态，验证亮边/暗边互换的 Pressed 效果</li>
        <li>设计一个对话框面板素材（包含边框、四角装饰、标题栏区域），导入 Cocos 后用 9-Slice 拉伸到不同尺寸验证四角不变形</li>
        <li>画一条血条的背景框 + 3 段填充纹理（绿/黄/红），在 Cocos 中实现血量变化时的宽度缩放和颜色切换</li>
        <li>在 8x8、12x12、16x16 三种尺寸下各画一个"心形"图标，对比可读性——理解"一个像素就是一个设计决策"</li>
        <li>为你的飞机大战 UI 建立一套完整的 8-12 色色板，确保和游戏场景色板形成清晰对比，并在灰度模式下检查对比度</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>按钮的四种状态（Normal/Hover/Pressed/Disabled）各有什么视觉特征？Pressed 态的"亮暗边互换"是什么意思？</li>
        <li>9-Slice 友好的按钮形状有什么要求？四个角、四个边、中心区各自承担什么角色？</li>
        <li>对话框面板通常包含哪四层结构？标题栏在像素画中如何设计？</li>
        <li>血条的三层结构是什么？血量颜色从绿色渐变到红色的三种实现方案各有什么优缺点？</li>
        <li>在 8x8 的画布中最多用几种颜色？为什么"一个像素就是一个设计决策"在小尺寸下尤为重要？</li>
        <li>小图标设计的四原则是什么？为什么高对比度和清晰剪影比细节更重要？</li>
        <li>UI 色板为什么要独立于游戏场景色板？功能色（红/绿/金/蓝）的语义化规则是什么？</li>
        <li>如何用 Aseprite 的灰度模式检查 UI 元素的可读性？3 秒测试是什么？</li>
      </ul>
    </ConceptBlock>
  </PhaseLayout>
</template>
