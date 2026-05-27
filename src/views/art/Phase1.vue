<script setup lang="ts">
import ArtPhaseLayout from '@/components/ArtPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <ArtPhaseLayout :phase="1" title="Aseprite 工具入门" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>独立安装 <strong>Aseprite</strong> 并完成基础配置</li>
        <li>熟悉 <strong>Aseprite</strong> 的界面布局和核心面板</li>
        <li>掌握画笔、橡皮擦、油漆桶、选区等基本工具</li>
        <li>使用图层管理像素画的各部分</li>
        <li>创建并导出你的第一张像素画</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="安装与配置">
      <h3>1. 获取 Aseprite</h3>
      <p>
        <strong>官方渠道：</strong>在 <strong>aseprite.org</strong> 购买并下载（约
        $20，一次买断，终身更新）。
      </p>
      <p>
        <strong>免费替代：</strong>如果你暂时不想付费，可以用 <strong>LibreSprite</strong>（Aseprite
        的开源分支，功能基本一致），或者用在线工具 <strong>Piskel</strong>（免费，浏览器直接使用）。
      </p>
      <p>本课程以 Aseprite 为标准教学，但所有操作在 LibreSprite 中几乎完全一样。</p>

      <h3>2. 新建画布</h3>
      <ol>
        <li>打开 Aseprite → File → New（或 Ctrl+N）</li>
        <li>设置尺寸：飞机大战的素材建议 <strong>32×32</strong> 或 <strong>16×16</strong> 像素</li>
        <li>Color Mode：选择 <strong>RGBA</strong>（带透明通道）</li>
        <li>Background：选择 <strong>Transparent</strong>（透明背景——这点很重要！）</li>
        <li>点击 OK</li>
      </ol>

      <div class="tip-box">
        <strong>为什么选透明背景：</strong>Cocos 中的 Sprite
        需要透明背景，否则飞机周围会有一个白色方块。所有游戏素材都应该画在透明画布上。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🖥️" title="界面布局速览">
      <p>Aseprite 界面分为几个核心区域，<strong>花 10 分钟逐个熟悉</strong>：</p>

      <table>
        <thead>
          <tr>
            <th>面板</th>
            <th>位置</th>
            <th>作用</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>画布</strong></td>
            <td>中央</td>
            <td>你画画的地方，可以用滚轮缩放</td>
          </tr>
          <tr>
            <td><strong>工具栏</strong></td>
            <td>左侧</td>
            <td>画笔、橡皮、油漆桶、选区、取色器等</td>
          </tr>
          <tr>
            <td><strong>调色板</strong></td>
            <td>上方/右侧</td>
            <td>选色和配色。左右键分别选前景色和背景色</td>
          </tr>
          <tr>
            <td><strong>图层面板</strong></td>
            <td>右侧</td>
            <td>管理图层：新建、重命名、上下排序、透明度</td>
          </tr>
          <tr>
            <td><strong>帧面板 / 时间轴</strong></td>
            <td>底部</td>
            <td>帧动画的时间轴（Phase 4 详讲）</td>
          </tr>
          <tr>
            <td><strong>预览窗口</strong></td>
            <td>右上角（可开启）</td>
            <td>实时预览像素画的缩小效果</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="✏️" title="核心工具速成">
      <h3>画笔工具（B）—— 你的主力工具</h3>
      <ul>
        <li>快捷键 <strong>B</strong></li>
        <li>左键用前景色画，右键用背景色画</li>
        <li>按住 Ctrl+滚轮 缩放画布</li>
        <li>画布缩放建议保持在 400%-800%（像素画需要在放大状态下画）</li>
      </ul>

      <h3>橡皮擦（E）</h3>
      <ul>
        <li>快捷键 <strong>E</strong></li>
        <li>擦除像素 = 变透明（不是变白！）</li>
        <li>右键自动切换橡皮擦（按住右键涂抹）</li>
      </ul>

      <h3>油漆桶（G）</h3>
      <ul>
        <li>快捷键 <strong>G</strong></li>
        <li>填充连续的同色区域</li>
        <li>注意 Tolerance（容差）设置——0 表示只填充完全相同的颜色</li>
      </ul>

      <h3>取色器（I / Alt+左键）</h3>
      <ul>
        <li>快捷键 <strong>I</strong>，或<strong>按住 Alt</strong>临时切换</li>
        <li>从画布上取色到前景色——这是最常用的操作之一</li>
      </ul>

      <div class="tip-box">
        <strong>前端习惯平移：</strong>Aseprite 的快捷键和设计工具（Figma / Sketch / PS）非常像——B
        画笔、E 橡皮、G 油漆桶、I 取色器、Ctrl+Z 撤销、Ctrl+Shift+Z 重做。你不需要从零记忆。
      </div>

      <div class="warn-box">
        <strong>关键设置——像素完美模式：</strong>菜单 Edit → Preferences → Cursor，勾选
        <strong>Pixel-perfect</strong>。这个选项保证画笔在任何缩放倍率下画的都是完美的 1
        像素点。如果不开启，画笔边缘可能出现半透明/模糊像素——这对像素画是致命的。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔲" title="选择与变换工具">
      <h3>矩形选框（M）</h3>
      <ul>
        <li>快捷键 <strong>M</strong></li>
        <li>选中后可以移动选区内容（V 切换到移动工具后拖拽）</li>
        <li>按住 Shift 拖拽可创建正方形选区</li>
        <li>选区内的像素可以 Ctrl+C / Ctrl+V 复制粘贴</li>
      </ul>

      <h3>套索（Q）</h3>
      <ul>
        <li>快捷键 <strong>Q</strong></li>
        <li>自由手绘选区轮廓，适合选取不规则区域</li>
        <li>双击闭合选区</li>
      </ul>

      <h3>魔棒（W）</h3>
      <ul>
        <li>快捷键 <strong>W</strong></li>
        <li>点击某个颜色区域，自动选中所有相连的同色像素</li>
        <li>Tolerance（容差）控制相似颜色的匹配范围——0 只匹配完全相同的颜色</li>
        <li>勾选 Contiguous 只选连续区域；取消勾选则选中画布上所有同色像素</li>
      </ul>

      <h3>常用变换</h3>
      <ul>
        <li><strong>Shift+H</strong>：水平翻转选区</li>
        <li><strong>Shift+V</strong>：垂直翻转选区</li>
        <li><strong>Edit → Rotate</strong>（Ctrl+R）：旋转选区（90°、180°或任意角度）</li>
        <li><strong>Edit → Transform</strong>（Ctrl+T）：自由变换——缩放、旋转同时操作</li>
      </ul>

      <div class="warn-box">
        <strong>注意：</strong>旋转和缩放非 90° 倍数的选区会产生模糊/半透明像素。像素画中尽量只用
        90°/180° 旋转和整数倍缩放。需要斜线效果时手工重新点像素，不要依赖插值旋转。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎨" title="色盘面板详解">
      <p>
        色盘（Palette）是像素画的<strong>色彩管理中心</strong>。它定义了这幅画可用的所有颜色——对于像素飞机大战，你需要一套统一的色盘来保证所有素材的视觉一致性。
      </p>

      <h3>加载预设色盘</h3>
      <p>Aseprite 内置了像素圈最经典的几套色盘，直接拿来用或借鉴：</p>
      <ol>
        <li>菜单 → <strong>View → Palette → Open Palette</strong></li>
        <li>选择预设色盘文件（<code>.gpl</code> / <code>.pal</code> / <code>.png</code>）</li>
        <li>
          推荐起步色盘：<strong>DB32</strong>（DawnBringer 32 色）、<strong>Sweetie 16</strong>（16
          色糖果风）、<strong>PICO-8</strong>（16 色复古风）
        </li>
      </ol>

      <h3>编辑自定义色盘</h3>
      <ul>
        <li>菜单 → <strong>View → Palette → Palette Editor</strong> 打开色盘编辑器</li>
        <li>
          <strong>前景色/背景色井</strong>（工具栏底部两个叠放方块）：左键点击选前景色，右键选背景色
        </li>
        <li>双击色盘中的某个颜色 → 弹出颜色选择器 → 用 HSB 或 RGB 滑块调色</li>
        <li>
          <strong>HSB 调整色相偏移</strong
          >：暗部不仅比亮部暗，色相也应微微偏移（暖色偏红/橙，冷色偏蓝/紫）
        </li>
        <li>右键色盘空白处 → <strong>Add Color</strong> 添加自定义颜色</li>
        <li>
          菜单 → <strong>View → Palette → Save Palette</strong> 保存为
          <code>.gpl</code> 文件（项目内可复用）
        </li>
      </ul>

      <h3>从参考图取色</h3>
      <ul>
        <li>
          直接把参考图拖进 Aseprite（作为临时图层），然后按 <strong>Alt+左键</strong> 取色到色盘
        </li>
        <li>取完后隐藏/删除参考图层，保留色盘</li>
      </ul>

      <div class="tip-box">
        <strong>规则：</strong>像素画的色盘不一定要多——16-32
        种颜色足够做完整款飞机大战。限制色盘不仅统一风格，也强迫你用好每个色阶，而不是靠堆颜色来"糊弄"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🧅" title="图层的概念">
      <p>图层是像素画最重要的组织方式。把不同的元素画在不同的图层上，互不干扰：</p>

      <pre><code>图层结构示例（一架飞机）：
┌─────────────────┐
│ 🔆 高光层       │  ← 最上层：机翼反光
│ ✈️ 主体层       │  ← 飞机机身
│ 🔥 引擎火焰层   │  ← 引擎喷口
│ 📐 线稿层       │  ← 轮廓线（画完可隐藏）
│ 🟦 背景层       │  ← 底层：透明
└─────────────────┘</code></pre>

      <h3>图层操作（快捷键）</h3>
      <ul>
        <li><strong>Shift+N</strong>：新建图层</li>
        <li><strong>点击眼睛图标</strong>：显示/隐藏图层</li>
        <li><strong>拖拽图层</strong>：调整上下顺序</li>
        <li><strong>滑动 Opacity</strong>：调整图层透明度</li>
        <li><strong>锁定图层</strong>（挂锁图标）：防止误操作</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔨" title="动手练习：画一个简单的角色">
      <p>
        目标是画一个 <strong>16×16</strong> 像素的简单角色（不需要是飞机，一个笑脸或小人都行）：
      </p>

      <ol>
        <li>新建画布：16×16，RGBA，透明背景</li>
        <li>用<strong>3-4 种颜色</strong>（轮廓色 + 主色 + 亮色 + 暗色）</li>
        <li>先画轮廓（用深色描边），再填充内部，最后点高光</li>
        <li>保存：File → Save As → 选择 <code>.aseprite</code>（源文件）</li>
        <li>导出 PNG：File → Export → 选择 <code>.png</code></li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>你能在 Aseprite 中独立完成：新建画布 → 选色 → 用画笔点像素 → 分层
        → 导出 PNG。这个流程后续每个阶段都会用到。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📚" title="延伸阅读与参考资源">
      <table>
        <thead>
          <tr>
            <th>资源</th>
            <th>说明</th>
            <th>链接</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Lospec</strong></td>
            <td>最全的像素画色盘库 + 教程索引，找色盘首选</td>
            <td>lospec.com/palette-list</td>
          </tr>
          <tr>
            <td><strong>Pixel Joint</strong></td>
            <td>像素画作品社区，大量高质量参考</td>
            <td>pixeljoint.com</td>
          </tr>
          <tr>
            <td><strong>Aseprite 官方文档</strong></td>
            <td>完整的功能参考和教程</td>
            <td>aseprite.org/docs</td>
          </tr>
          <tr>
            <td><strong>Piskel</strong></td>
            <td>免费的在线像素画工具（可替代 Aseprite）</td>
            <td>piskelapp.com</td>
          </tr>
          <tr>
            <td><strong>LibreSprite</strong></td>
            <td>Aseprite 的开源分支，完全免费</td>
            <td>libresprite.github.io</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>Aseprite 怎么新建一个 32×32 的透明画布？</li>
        <li>画笔（B）、橡皮（E）、油漆桶（G）、取色器（I）的快捷键分别是什么？</li>
        <li>怎么用 Alt 键临时切换到取色器？</li>
        <li>矩形选框（M）、套索（Q）、魔棒（W）分别适合什么场景？</li>
        <li>怎么加载预设色盘？如何从参考图中取色建立自定义色盘？</li>
        <li>为什么暗部色不仅要变暗还要偏移色相？</li>
        <li>图层的眼睛图标和挂锁图标各自干什么？</li>
        <li>为什么旋转/缩放选区时要尽量用 90° 倍数？</li>
        <li>如何导出 PNG？源文件（.aseprite）和 PNG 的区别是什么？</li>
        <li>为什么游戏素材必须用透明背景？</li>
        <li>"像素完美模式"是干什么的？在哪里开启？</li>
      </ul>
    </ConceptBlock>
  </ArtPhaseLayout>
</template>
