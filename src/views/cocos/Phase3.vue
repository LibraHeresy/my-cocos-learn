<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="3" title="坐标系与变换" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>坐标系听起来很数学、很无聊。但相信我——<strong>坐标系是你和游戏引擎之间最基本的对话语言</strong>。你把一个东西放在 (100, 200)，它为什么出现在那里而不是别处？它的 Y 轴为什么朝上而不是朝下？锚点是什么鬼？这节讲清楚。</p>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="Y 轴为什么朝上？——图形学传统 vs 文档流传统">
      <p>如果你用 CSS 写过 <code>position: absolute; top: 100px</code>，你知道元素会出现在离<strong>顶部</strong> 100px 的位置。因为浏览器的 Y 轴<strong>朝下</strong>——原点在左上角。</p>
      <p>但 Cocos 的 Y 轴<strong>朝上</strong>。原点不在左上角，而在你设定的<strong>设计分辨率的中点偏下</strong>。</p>
      <p>这不是 Cocos 故意和前端过不去。Y 轴朝上是<strong>整个数学和图形学界的标准</strong>——在笛卡尔坐标系里，纵轴的正方向就是朝上的。高中数学课上画的 XY 轴，Y 就是朝上的。OpenGL 的坐标系 Y 朝上。Unity 的 Y 朝上。Unreal 的 Z 朝上但那是 3D 的事。</p>
      <p>浏览器 Y 轴朝下才是"例外"——因为 HTML 最早是设计来排文档的。文档流是从上往下写的（就像你现在读这篇文章），所以 Y 轴朝下在文档排版场景中更自然。</p>
      <p>对我们前端转 Cocos 的人来说，这个差异只需要适应一段时间。我自己刚开始的时候经常把 Y 坐标搞反：想让飞机往上飞，写了个正的 Y，结果飞机往下跑了。习惯就好了。</p>
    </ConceptBlock>

    <ConceptBlock icon="🎯" title="锚点：你的变换原点在哪里？">
      <p>在 CSS 中，如果你写 <code>transform-origin: center</code>，元素的旋转和缩放以<strong>元素中心</strong>为原点。Cocos 也有这个概念，叫<strong>锚点（Anchor）</strong>。</p>
      <p>锚点是一个 0 到 1 的二维坐标，表示"从纹理的哪个点作为原点"：</p>
      <ul>
        <li><code>(0.5, 0.5)</code> —— 中心点（默认）。缩放时从中心放大，旋转时绕中心转。</li>
        <li><code>(0, 0)</code> —— 左下角。缩放时从左下角向外长。</li>
        <li><code>(0.5, 0)</code> —— 底部中心。平台游戏中角色站在地面上，锚点放在脚底很实用。</li>
      </ul>
      <p>用 CSS 来类比：</p>
      <pre>/* CSS */
.element {
  transform-origin: center;          /* = Cocos 锚点 (0.5, 0.5) */
  transform-origin: left bottom;     /* = Cocos 锚点 (0, 0) */
  transform-origin: 50% 0%;          /* = Cocos 锚点 (0.5, 0) */
}</pre>
      <div class="tip-box">
        <strong>为什么飞机大战中玩家的锚点应该放在中心？</strong> 因为飞机原地旋转时，你希望它以机身中心为轴转，而不是绕着机翼尖转。放在中心最自然。但地面敌人的锚点可以放在底部中心——这样"站在地面上"的感觉更对。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📏" title="设计分辨率：逻辑坐标 → 物理像素的魔法">
      <p>这是 Cocos 最容易被误解的概念之一。我先打个比方：</p>
      <p>假如你是画家，你要画一幅画。你可以选择在多大尺寸的画布上工作——比如 480×800 的画布。画完之后，你要把这幅画印到不同尺寸的相纸上——手机屏幕可能是 1080×1920，平板可能是 1536×2048。</p>
      <p><strong>画布尺寸就是"设计分辨率"，你把所有的坐标、大小都按这个尺度来思考。</strong> 至于怎么适配到不同设备，Cocos 自动帮你缩放。</p>
      <p>在 Cocos 项目设置中，你配置 Design Resolution（如 480×800），然后选择适配策略：</p>
      <ul>
        <li><strong>Fit Height：</strong> 保证高度撑满屏幕。宽度超出就裁掉，不足就留黑边。</li>
        <li><strong>Fit Width：</strong> 保证宽度撑满屏幕。高度超出就裁掉，不足就留黑边。</li>
      </ul>
      <p>对于竖屏射击游戏，通常选 Fit Height——因为游戏内容在垂直方向上更需要完整的可视范围（敌机从上方来，你在下方）。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔢" title="变换矩阵：setPosition 背后到底发生了什么？">
      <p>当你写 <code>this.node.setPosition(100, 200)</code>，Cocos 在内部做了这样一件事：构造一个 4×4 的变换矩阵，其中平移部分填入了 (100, 200)。然后这个矩阵乘上节点的父矩阵，再乘上祖父矩阵……一直乘到根节点。</p>
      <p>这个"一路乘上去"的过程，就是<strong>本地坐标→世界坐标</strong>的转换。</p>
      <p>你不用手算矩阵——但理解这个"子承父业"的级联关系很重要：</p>
      <pre>// 子节点在父节点坐标系中的位置
child.setPosition(50, 0)

// 父节点移动了 → 子节点跟着动！
parent.setPosition(100, 200)
// 子节点现在在世界坐标系中位于 (150, 200)</pre>
      <p>这和 CSS 中 <code>position: relative</code> 的容器内 <code>position: absolute</code> 的子元素行为一样——子元素的绝对位置由父元素的偏移决定。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：验证你的理解">
      <p>在 Game 场景中做一个实验：</p>
      <ol>
        <li>创建一个红色方块 Sprite，放在 GameLayer 下</li>
        <li>改变它的 position，观察它在屏幕上的位置变化</li>
        <li>改变它的 anchor，观察旋转时绕哪个点转</li>
        <li>改变 GameLayer 的 position，观察所有子节点是否一起移动</li>
        <li>用两个不同分辨率的浏览器窗口预览，看 Fit Height/Fit Width 的效果</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>四元数：</strong> 如果你做 3D 游戏，旋转就不能用欧拉角了——欧拉角有万向节锁死问题。解法是用四元数（Quaternion）。好消息是 2D 游戏不需要关心这个。</li>
        <li><strong>CSS transform: matrix()：</strong> 打开任意一个网站的 DevTools，找一个用了 transform 的元素，你会看到 Computed 面板里有一个 matrix 或 matrix3d 值。那就是浏览器对 2D/3D 变换的矩阵表示。Cocos 的 Mat4 和它是同一套数学。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>为什么 Cocos 的 Y 轴朝上而浏览器的 Y 轴朝下？</li>
        <li>锚点 (0.5, 0) 意味着什么？什么场景下会用到它？</li>
        <li>设计分辨率 480×800 + Fit Height 模式，在 1080×1920 的屏幕上画面怎么适配？</li>
        <li>父节点移动到 (100, 50)，子节点在本地坐标 (20, 30)，子节点在世界坐标的哪里？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
