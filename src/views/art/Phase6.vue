<script setup lang="ts">
import ArtPhaseLayout from '@/components/ArtPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
import PixelCanvas from '@/components/PixelCanvas.vue'

function empty(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(''))
}

function fill(g: string[][], row: number, col: number, w: number, h: number, color: string) {
  for (let r = row; r < row + h && r < g.length; r++)
    for (let c = col; c < col + w && c < g[r].length; c++)
      g[r][c] = color
}

function makeSlice9Panel(cols: number): string[][] {
  const rows = 17
  const g = empty(rows, cols)

  const border = '#4a3728'
  const bevel = '#6b5240'
  const corner = '#e8b84b'
  const edgeH = '#7a9a5c'
  const edgeV = '#5c8a9a'
  const center = '#4a4a6a'
  const guide = '#4caf50'

  const hg1 = 4, hg2 = 12
  const vg1 = 5, vg2 = cols - 6

  // outer border
  for (let c = 0; c < cols; c++) { g[0][c] = border; g[rows - 1][c] = border }
  for (let r = 0; r < rows; r++) { g[r][0] = border; g[r][cols - 1] = border }

  // inner bevel
  for (let c = 1; c < cols - 1; c++) { g[1][c] = bevel; g[rows - 2][c] = bevel }
  for (let r = 2; r < rows - 2; r++) { g[r][1] = bevel; g[r][cols - 2] = bevel }

  // corner blocks (gold — identical in both panels)
  const cw = vg1 - 2
  const ch = hg1 - 2
  fill(g, 2, 2, cw, ch, corner)
  fill(g, 2, vg2 + 1, cols - vg2 - 3, ch, corner)
  fill(g, hg2 + 1, 2, cw, rows - hg2 - 3, corner)
  fill(g, hg2 + 1, vg2 + 1, cols - vg2 - 3, rows - hg2 - 3, corner)

  // horizontal edges (green — stretch horizontally in right panel)
  fill(g, 2, vg1 + 1, vg2 - vg1 - 1, ch, edgeH)
  fill(g, hg2 + 1, vg1 + 1, vg2 - vg1 - 1, rows - hg2 - 3, edgeH)

  // vertical edges (teal — same width in both panels)
  fill(g, hg1 + 1, 2, cw, hg2 - hg1 - 1, edgeV)
  fill(g, hg1 + 1, vg2 + 1, cols - vg2 - 3, hg2 - hg1 - 1, edgeV)

  // center (blue-gray — stretches both directions in right panel)
  fill(g, hg1 + 1, vg1 + 1, vg2 - vg1 - 1, hg2 - hg1 - 1, center)

  // dashed guide lines (interior only)
  for (let c = 2; c < cols - 2; c += 2) { g[hg1][c] = guide; g[hg2][c] = guide }
  for (let r = 2; r < rows - 2; r += 2) { g[r][vg1] = guide; g[r][vg2] = guide }

  return g
}

const slice9Original = makeSlice9Panel(17)
const slice9Stretched = makeSlice9Panel(25)
</script>

<template>
  <ArtPhaseLayout :phase="6" title="Cocos 导入管线与性能优化" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>在 <strong>Cocos</strong> 中正确配置纹理导入参数，避免常见的"画面变糊"问题</li>
        <li>用 <strong>SpriteSheet</strong> 从一张 <strong>PNG</strong> 导入多套动画，减少文件数量和加载次数</li>
        <li>配置 <strong>Auto Atlas</strong> 自动合批，降低 <strong>DrawCall</strong></li>
        <li>控制纹理内存预算在合理范围内，尤其是小游戏平台</li>
        <li>使用 <strong>9-Slice</strong> 技术制作可任意拉伸的 UI 面板</li>
        <li>理解屏幕适配方案，在多分辨率下保持画面清晰</li>
      </ul>
    </ConceptBlock>

    <!-- ============ 纹理过滤 ============ -->
    <ConceptBlock icon="🔍" title="纹理过滤——Point vs Bilinear">
      <p>
        这是像素画导入 Cocos 后最常见的问题——<strong>画面变糊了</strong>。根源就是纹理过滤模式选错了。
      </p>

      <table>
        <thead>
          <tr>
            <th>过滤模式</th>
            <th>效果</th>
            <th>适用场景</th>
            <th>内存占用</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Point (邻近)</strong></td>
            <td>放大后边缘清晰锐利，颗粒感保持</td>
            <td>像素画的所有素材——角色、子弹、道具、UI 图标</td>
            <td>相同</td>
          </tr>
          <tr>
            <td><strong>Bilinear (双线性)</strong></td>
            <td>放大后平滑模糊，像素被插值混合</td>
            <td>写实风格贴图、半透明渐变遮罩</td>
            <td>相同</td>
          </tr>
          <tr>
            <td><strong>Trilinear</strong></td>
            <td>Bilinear + Mipmap 层级间插值</td>
            <td>一般游戏不需要</td>
            <td>+33%（多了 Mipmap 层级）</td>
          </tr>
        </tbody>
      </table>

      <h3>在 Cocos 中设置</h3>
      <ol>
        <li>选中资源管理器中的纹理（.png 文件）</li>
        <li>属性检查器 → <strong>Filter Mode</strong> → 选 <strong>Point</strong></li>
        <li>如果不小心在多个纹理上设错了，可以选中目录批量修改</li>
      </ol>

      <div class="warn-box">
        <strong>最容易犯的错误：</strong>像素画在桌面上放大看是清晰的，但打包到手机上变得模糊。99% 的情况是因为 Filter Mode 没改成 Point。Cocos 默认是 Bilinear，每张像素画纹理都必须手动切换。
      </div>
    </ConceptBlock>

    <!-- ============ PPU 配置 ============ -->
    <ConceptBlock icon="📏" title="PPU 配置——像素与世界的换算">
      <p>
        <strong>PPU（Pixels Per Unit）</strong>定义了"多少个纹理像素 = 1 个世界单位"。这个设置决定了场景中 Sprite 的默认大小，也影响物理和碰撞的尺度。
      </p>

      <h3>推荐配置</h3>
      <table>
        <thead>
          <tr>
            <th>项目类型</th>
            <th>推荐 PPU</th>
            <th>原因</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>像素风格游戏（16×16 角色）</td>
            <td><strong>16</strong></td>
            <td>1 世界单位 = 1 个 tile 大小，方便布局和物理计算</td>
          </tr>
          <tr>
            <td>像素风格游戏（32×32 角色）</td>
            <td><strong>32</strong></td>
            <td>同上，以角色大小为基准</td>
          </tr>
          <tr>
            <td>高清 2D 游戏</td>
            <td><strong>100</strong></td>
            <td>Cocos 默认值，适配高清素材</td>
          </tr>
        </tbody>
      </table>

      <h3>统一 PPU 的重要性</h3>
      <p>
        项目中所有同类型素材的 PPU 应该<strong>保持一致</strong>。如果玩家飞机 PPU=32、敌机 PPU=16，敌机在场景中会变成 2 倍大小——虽然你画的原图都是 32×32。
      </p>

      <h3>设置位置</h3>
      <p>选中纹理资源 → 属性检查器 → <strong>Pixels Per Unit</strong> 字段。修改后已添加到场景中的 Sprite 需要刷新（Ctrl+R 或重新拖入）。</p>

      <div class="tip-box">
        <strong>飞机大战建议：</strong>素材在 Aseprite 中都用标准尺寸（16×16 / 32×32 / 48×48 等），PPU 统一设为 32，场景设计分辨率设为 480×800 或 720×1280。
      </div>
    </ConceptBlock>

    <!-- ============ SpriteSheet ============ -->
    <ConceptBlock icon="🎬" title="SpriteSheet 多动画导入">
      <p>
        <strong>SpriteSheet</strong>（精灵表单）是一张大图上排列多个动画帧。导入 Cocos 后可以切割成多个 SpriteFrame，不同区域可以组成不同动画。
      </p>

      <h3>三步操作流程</h3>
      <ol>
        <li>
          <strong>在 Aseprite 中导出：</strong>File → Export Sprite Sheet → 设置 Sheet Type 为 <strong>By Rows</strong> 或 <strong>By Columns</strong>（按行或按列排列）
        </li>
        <li>
          <strong>导入 Cocos：</strong>将导出的 PNG 拖入资源管理器的 textures 目录
        </li>
        <li>
          <strong>切割（Sprite Editor）：</strong>选中纹理 → 属性检查器中点击 <strong>Sprite Editor</strong> 按钮 → 选择 Grid 模式 → 输入每格的宽高 → 应用
        </li>
      </ol>

      <h3>两种布局模式</h3>
      <table>
        <thead>
          <tr>
            <th>布局</th>
            <th>特点</th>
            <th>适用场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Grid（网格）</strong></td>
            <td>所有帧大小相同、整齐排列</td>
            <td>大多数动画——爆炸、飞行、待机循环</td>
          </tr>
          <tr>
            <td><strong>Irregular（不规则）</strong></td>
            <td>每帧大小不同，手工绘制切割框</td>
            <td>复杂场景中背景元素组合，或打包不同大小的 UI 图标</td>
          </tr>
        </tbody>
      </table>

      <h3>一张 SpriteSheet 放多套动画</h3>
      <p>
        在 Aseprite 中导出时，把不同动画的帧放在<strong>不同行</strong>：
      </p>
      <pre><code>第 1 行：玩家飞机悬停 4 帧          → Cocos 中创建 clip_planeHover
        第 2 行：引擎火焰 6 帧              → Cocos 中创建 clip_engineFlame
        第 3 行：爆炸 8 帧                  → Cocos 中创建 clip_explosion
        第 4 行：子弹命中 3 帧              → Cocos 中创建 clip_hitSpark</code></pre>
      <p>一行一张 SpriteSheet，省掉了零散小 PNG 的管理成本。</p>

      <div class="warn-box">
        <strong>注意帧序号：</strong>Cocos 切割网格时按从左到右、从上到下的顺序编号。确保 Aseprite 导出时帧的排列顺序和 Cocos 动画片段中引用的一致。建议在 PNG 文件名中标注格式，如 <code>player_spritesheet_4x6.png</code> 表示 4 列 6 行。
      </div>
    </ConceptBlock>

    <!-- ============ Auto Atlas ============ -->
    <ConceptBlock icon="📦" title="Auto Atlas 自动图集——合批利器">
      <p>
        Cocos 的 <strong>Auto Atlas</strong>（自动图集）功能会在构建时自动将多张小纹理合并成一张大纹理（Atlas）。这样，使用同一张 Atlas 的多个 Sprite 就可以<strong>合批渲染</strong>，大幅降低 DrawCall。
      </p>

      <h3>为什么要合批</h3>
      <p>简单说：GPU 每画一个"东西"就是一次 DrawCall。100 个敌机各用一张独立贴图 = 100 次 DrawCall。100 个敌机共用一张 Atlas = 可能只需要 1 次 DrawCall。在小游戏平台（微信小游戏、抖音小游戏），DrawCall 超过 50 就可能有性能问题。</p>

      <h3>配置步骤</h3>
      <ol>
        <li>在资源管理器中，将需要合批的纹理放在<strong>同一个目录</strong>下</li>
        <li>在该目录上右键 → 新建 → <strong>Auto Atlas</strong></li>
        <li>选中生成的 Auto Atlas 资源，在属性检查器中配置：
          <ul>
            <li><strong>Max Width/Height：</strong>图集的最大尺寸（建议 2048）</li>
            <li><strong>Padding：</strong>每张小图之间的间隔（建议 2px，防止像素"溢出"）</li>
            <li><strong>Filter Mode：</strong>选 Point（像素画必须！）</li>
          </ul>
        </li>
        <li>构建时 Cocos 自动合并纹理并更新引用</li>
      </ol>

      <h3>合理的 Atlas 分组策略</h3>
      <table>
        <thead>
          <tr>
            <th>Atlas 名称</th>
            <th>包含内容</th>
            <th>预估大小</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>atlas_player</strong></td>
            <td>玩家飞机所有动作帧：悬停、引擎火焰、子弹</td>
            <td>≤ 512×512</td>
          </tr>
          <tr>
            <td><strong>atlas_enemies</strong></td>
            <td>所有敌机类型及其动作帧</td>
            <td>≤ 1024×1024</td>
          </tr>
          <tr>
            <td><strong>atlas_fx</strong></td>
            <td>爆炸、命中火花、受击闪烁等特效</td>
            <td>≤ 512×512</td>
          </tr>
          <tr>
            <td><strong>atlas_items</strong></td>
            <td>道具图标及其闪烁帧</td>
            <td>≤ 512×512</td>
          </tr>
          <tr>
            <td><strong>atlas_ui</strong></td>
            <td>按钮、面板、图标等 UI 素材</td>
            <td>≤ 512×512</td>
          </tr>
          <tr>
            <td><strong>atlas_bg</strong></td>
            <td>星空、云层等背景元素</td>
            <td>≤ 1024×1024</td>
          </tr>
        </tbody>
      </table>

      <p>
        分组的核心原则：<strong>按使用场景分组，而不是按类型</strong>。一局游戏中玩家飞机和引擎火焰总是同时出现 → 放同一 Atlas。Start 界面和结算界面各用各的素材 → 分不同 Atlas。
      </p>

      <div class="warn-box">
        <strong>不要把所有纹理都放一个 Atlas：</strong>一个 4096×4096 的 Atlas 在小游戏平台上可能直接超内存。而且加载一张超大 Atlas 比加载几张中等的慢。Atlas 大到装不下当前目录的纹理时，Cocos 会生成多张——但最好人工控制分组策略。
      </div>
    </ConceptBlock>

    <!-- ============ 内存与纹理预算 ============ -->
    <ConceptBlock icon="💾" title="内存与纹理预算——知道你的'钱包'有多大">
      <p>
        纹理是 2D 游戏最大的内存消耗来源。一张 1024×1024 的 RGBA8888 纹理占 4MB。<strong>小游戏平台通常只有 50-100MB 的总运行内存</strong>，留给纹理的预算并不多。
      </p>

      <h3>纹理内存快速估算公式</h3>
      <pre><code>纹理内存(MB) = 宽 × 高 × 4 ÷ (1024 × 1024)

        16×16    = 1 KB
        32×32    = 4 KB
        128×128  = 64 KB
        256×256  = 256 KB（0.25 MB）
        512×512  = 1 MB
        1024×1024 = 4 MB
        2048×2048 = 16 MB</code></pre>

      <h3>平台预算参考</h3>
      <table>
        <thead>
          <tr>
            <th>平台</th>
            <th>总内存限制</th>
            <th>纹理预算</th>
            <th>建议单张最大</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Web 桌面</strong></td>
            <td>~2GB</td>
            <td>~200MB</td>
            <td>2048×2048</td>
          </tr>
          <tr>
            <td><strong>Web 移动</strong></td>
            <td>~200-500MB</td>
            <td>~50MB</td>
            <td>1024×1024</td>
          </tr>
          <tr>
            <td><strong>微信小游戏</strong></td>
            <td>~50-100MB</td>
            <td>~20MB</td>
            <td>1024×1024</td>
          </tr>
          <tr>
            <td><strong>抖音小游戏</strong></td>
            <td>~50-100MB</td>
            <td>~15MB</td>
            <td>1024×512</td>
          </tr>
        </tbody>
      </table>

      <h3>六条省内存策略</h3>
      <ol>
        <li>
          <strong>降低色深（推荐）：</strong>选中纹理 → 属性检查器 → <strong>Type</strong> 设为
          <strong>RGB565</strong>（无透明需要）或 <strong>RGBA4444</strong>（有透明、色少）——内存直接减半。像素画颜色少，肉眼几乎看不出差别
        </li>
        <li>
          <strong>用索引色（最优）：</strong>像素画通常只有 16-32 种颜色。用索引色（Palette-based）格式可节省 75%
          内存。Aseprite 导出时选择 PNG-8（256 色）
        </li>
        <li>
          <strong>减少 Atlas 空白：</strong>Auto Atlas 如果有大量空白区域就是在浪费内存，调整子图排列或减小 Atlas 尺寸
        </li>
        <li>
          <strong>用代码代替纹理（部分场景）：</strong>纯色填充的单色子弹可以用代码画（Graphics
          组件），省掉一张纹理
        </li>
        <li>
          <strong>使用 Spritesheet 代替散图：</strong>避免大量 16×16、32×32 的零散 PNG——每张独立纹理都有对齐开销
        </li>
        <li>
          <strong>延迟加载、场景销毁时释放：</strong>结算界面只在过关后显示，平常不要占用内存。Cocos 场景切换时默认释放旧场景资源，但要注意
          <code>cc.assetManager</code> 的手动管理
        </li>
      </ol>

      <div class="tip-box">
        <strong>飞机大战的推荐配置：</strong>所有像素素材用 RGBA4444 或 RGB565（根据是否有透明通道），Atlas 控制在 1024×1024 以内，总纹理不超过 20MB。这个配置在小游戏平台跑得动，在桌面端更毫无压力。
      </div>
    </ConceptBlock>

    <!-- ============ 屏幕适配 ============ -->
    <ConceptBlock icon="🖥️" title="屏幕适配——多分辨率下不变形">
      <p>
        像素画在不同屏幕比例下很容易被拉伸变形。Cocos 的 Canvas 组件提供了适配策略。
      </p>

      <h3>设计分辨率的选择</h3>
      <table>
        <thead>
          <tr>
            <th>适配策略</th>
            <th>Fit Height</th>
            <th>Fit Width</th>
            <th>SHOW_ALL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>行为</strong></td>
            <td>高度填满，宽度可能有黑边或裁剪</td>
            <td>宽度填满，高度可能有黑边或裁剪</td>
            <td>完整显示设计分辨率，可能有黑边</td>
          </tr>
          <tr>
            <td><strong>适合</strong></td>
            <td>竖屏射击游戏（上下固定，左右不关键）</td>
            <td>横屏跑酷（左右固定，上下可裁剪）</td>
            <td>UI 层（保证完整显示）</td>
          </tr>
          <tr>
            <td><strong>飞机大战推荐</strong></td>
            <td>✅ <strong>游戏场景用这个</strong></td>
            <td>—</td>
            <td>✅ <strong>UI 层用这个</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>配置步骤</h3>
      <ol>
        <li>选中场景中的 Canvas 节点</li>
        <li>属性检查器 → Canvas 组件 → <strong>Design Resolution</strong> 设为 480×800 或 720×1280</li>
        <li>
          <strong>Fit Height</strong> 打勾（竖屏射击游戏的关键：高度固定，宽度自适应）
        </li>
        <li><strong>Fit Width</strong> 不打勾（飞机大战竖屏射击不需要宽度固定）</li>
      </ol>

      <h3>像素画 + 屏幕适配的注意事项</h3>
      <p>
        像素画素材在非整数倍缩放时会失真。如果设计分辨率是 480×800，素材基准是 32×32，而屏幕实际是 750×1334——缩放比是 750/480≈1.56，不是整数倍。对策：
      </p>
      <ol>
        <li>选设计分辨率时考虑常见屏幕的最大公约数</li>
        <li>Canvas 的 <strong>Fit Height</strong> 模式下，宽度自适应——像素在水平方向可能有半像素偏移，但纵向保持整数映射</li>
        <li>
          如果对像素完美度有极高要求，在 Cocos 中开启 <strong>Pixel Perfect</strong> 模式（Camera 组件中）
        </li>
      </ol>

      <div class="tip-box">
        <strong>飞机大战建议：</strong>设计分辨率 480×800，Fit Height，素材 PPU=32。这个组合在大部分手机上显示效果良好。iPhone 全面屏（比例~19.5:9）左右会多出一些区域，但游戏核心在中间 16:9 区域内，多出的区域就多渲染一些星空背景和边距敌机。
      </div>
    </ConceptBlock>

    <!-- ============ 9-Slice ============ -->
    <ConceptBlock icon="🔲" title="9-Slice 面板缩放——UI 的任意拉伸">
      <p>
        像素 UI 面板有一个尴尬之处：面板需要适配不同大小的文字或内容，但直接拉伸整个图会导致圆角和边框变形。9-Slice 就是解决这个问题的——把一张图分成 9 个区域，<strong>四角不变形，四边单向拉伸，中心填充</strong>。
      </p>

      <h3>9-Slice 的区域图解</h3>
      <p>
        下面两个面板中，右侧面板比左侧<strong>更宽</strong>。注意四个<strong>金色圆角块完全一致</strong>——它们没有被拉伸。
        绿色参考线之间的区域（上下边框、左右边框、中心区）才发生了拉伸。
      </p>

      <div class="slice9-compare">
        <div class="slice9-col">
          <p class="slice9-label">原始面板（17×17）</p>
          <PixelCanvas :grid="slice9Original" :scale="12" />
        </div>
        <div class="slice9-arrow">→</div>
        <div class="slice9-col">
          <p class="slice9-label">拉伸后（25×17）</p>
          <PixelCanvas :grid="slice9Stretched" :scale="12" />
        </div>
      </div>

      <div class="slice9-legend">
        <div class="slice9-legend-item">
          <span class="swatch" style="background:#e8b84b"></span>
          <span><strong>四角</strong> — 固定不变，保留圆角</span>
        </div>
        <div class="slice9-legend-item">
          <span class="swatch" style="background:#7a9a5c"></span>
          <span><strong>上下边</strong> — 水平拉伸（高度不变，宽度随面板变化）</span>
        </div>
        <div class="slice9-legend-item">
          <span class="swatch" style="background:#5c8a9a"></span>
          <span><strong>左右边</strong> — 垂直拉伸（宽度不变，高度随面板变化）</span>
        </div>
        <div class="slice9-legend-item">
          <span class="swatch" style="background:#4a4a6a"></span>
          <span><strong>中心</strong> — 双向拉伸，填充内容区域</span>
        </div>
      </div>

      <p class="slice9-verify">
        对比两个面板的四角 → 像素完全一致。这就是 9-Slice 的核心价值：
        <strong>无论面板拉伸到多大，圆角和边框装饰永不失真</strong>。
      </p>

      <h3>在 Cocos 中设置</h3>
      <ol>
        <li>选中 Sprite 节点，将 Sprite 组件的 <strong>Type</strong> 从 Simple 改为 <strong>Sliced</strong></li>
        <li>选中纹理资源 → 属性检查器 → <strong>Sprite Editor</strong></li>
        <li>拖动四条绿色参考线定义"四角保护区"——框内的部分就是固定不拉伸的圆角区域</li>
        <li>回到场景，随意调整 Sprite 节点的大小，四角保持清晰</li>
      </ol>

      <h3>适用场景</h3>
      <table>
        <thead>
          <tr>
            <th>UI 元素</th>
            <th>9-Slice 方案</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>对话框／提示框</td>
            <td>圆角四角保护，中间透明区填充文字</td>
          </tr>
          <tr>
            <td>按钮（多尺寸）</td>
            <td>同一个按钮素材适配"快速开始"和"确"两个宽度</td>
          </tr>
          <tr>
            <td>血条／进度条背景</td>
            <td>圆角两端保护，中间水平拉伸随血量变化</td>
          </tr>
          <tr>
            <td>道具列表项背景</td>
            <td>列表宽度变化时边距不变</td>
          </tr>
          <tr>
            <td>弹窗面板</td>
            <td>任意尺寸的弹窗都用同一张面板材质</td>
          </tr>
        </tbody>
      </table>

      <h3>限制</h3>
      <p>
        9-Slice 只能用于<strong>有明确边框和中心的纹理</strong>。如果纹理没有可拉伸的均匀区域（比如一张人脸照片），9-Slice 会看起来很奇怪。像素 UI 恰好非常适合——因为有清晰的边框和均匀填充区。
      </p>

      <div class="tip-box">
        <strong>画 9-Slice 材质时：</strong>Aseprite 中画 UI 面板时，确保边框宽度一致（如 4px 边框），中心区用纯色或规则纹理。这样水平/垂直拉伸时才不会出现奇怪的花纹错位。Aseprite 中的参考线工具可以帮你标记 9-Slice 的切割位置。
      </div>

      <div class="warn-box">
        <strong>9-Slice 的常见坑：</strong>Sprite Type 设为 Sliced 后，如果图片没有被正确切分（绿色参考线没拖），拉伸效果和 Simple 一样——四角会变形。每个用 Sliced 的纹理都要进 Sprite Editor 确认四根线在正确位置。
      </div>
    </ConceptBlock>

    <!-- ============ 动手练习 ============ -->
    <ConceptBlock icon="🔨" title="动手练习：搭建你的导入管线">
      <ol>
        <li>将 Phase 3-5 制作的所有 Aseprite 素材整理成 SpriteSheet，按动画类型分行排列，导出为 PNG</li>
        <li>在 Cocos 中导入所有 SpriteSheet，用 Sprite Editor 切割，批量设置 Filter Mode 为 Point</li>
        <li>按 Atlas 分组策略创建 Auto Atlas 资源（atlas_player, atlas_enemies, atlas_fx, atlas_items, atlas_ui, atlas_bg），将对应纹理放入对应目录</li>
        <li>检查所有纹理的内存占用——是否有单张超过 1024×1024 的？有的话考虑拆小</li>
        <li>用 Canvas 配置游戏场景的设计分辨率和适配模式：480×800，Fit Height</li>
        <li>画一个带圆角的 UI 对话框材质，导入 Cocos 并配置 9-Slice，验证在不同尺寸下的显示效果</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>从 Aseprite 导出到 Cocos 运行的完整管线打通了。以后加新素材知道在哪个环节做什么配置，不会出现"图导进去了但模糊/太大/位置不对"的情况。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>Point 过滤和 Bilinear 过滤的视觉效果有什么区别？像素画应该用哪个？在哪里设置？</li>
        <li>什么叫 PPU？飞机大战的素材推荐 PPU 是多少？如果素材 PPU 不一致会出现什么问题？</li>
        <li>SpriteSheet 的 Grid 切割和 Irregular 切割分别用在什么场景？如何在一张 SpriteSheet 中放多套动画？</li>
        <li>什么叫 DrawCall？Auto Atlas 是怎么降低 DrawCall 的？Atlas 分组的策略原则是什么？</li>
        <li>一张 512×512 的 RGBA8888 纹理占多少 MB？如何用 RGB565 或 RGBA4444 降低内存？</li>
        <li>微信小游戏的纹理内存预算大约是多少？为什么要控制单张 Atlas 的大小？</li>
        <li>竖屏射击游戏应该用 Fit Height 还是 Fit Width？为什么？设计分辨率推荐多少？</li>
        <li>9-Slice 中哪四个区域是固定不变的？哪四个区域是单向拉伸的？中心区域怎么变化？</li>
        <li>Sprite 的 Sliced 模式生效的前提是什么（提示：需要先在纹理上做什么）？</li>
      </ul>
    </ConceptBlock>
  </ArtPhaseLayout>
</template>

<style scoped>
.slice9-compare {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1.25rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.slice9-col {
  text-align: center;
}

.slice9-label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  color: var(--c-text-light, #999);
}

.slice9-arrow {
  font-size: 2rem;
  color: var(--c-brand, #4caf50);
  padding-top: 1.8rem;
  font-weight: 700;
}

.slice9-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.5rem;
  margin-top: 0.8rem;
  justify-content: center;
}

.slice9-legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.slice9-verify {
  margin-top: 0.8rem;
  text-align: center;
  color: var(--c-brand, #4caf50);
  font-size: 0.9rem;
}

.swatch {
  display: inline-block;
  width: 13px;
  height: 13px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
