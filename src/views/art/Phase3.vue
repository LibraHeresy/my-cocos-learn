<script setup lang="ts">
import ArtPhaseLayout from '@/components/ArtPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <ArtPhaseLayout :phase="3" title="飞机大战素材绘制" duration="2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>用 Aseprite 对称工具高效绘制完全对称的飞机</li>
        <li>独立绘制玩家飞机（俯视视角）</li>
        <li>设计三种敌机：小型侦察机、中型战斗机、大型 Boss</li>
        <li>绘制子弹、道具图标、像素数字和 HUD 元素</li>
        <li>画滚动星空背景</li>
        <li>将所有素材组合成一张游戏画面 Mockup，验证视觉一致性</li>
        <li>为每个素材规划好动画图层，衔接 Phase 4</li>
        <li>得到一整套风格统一的飞机大战像素素材</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✈️" title="玩家飞机设计">
      <p>玩家飞机是整个游戏视觉的<strong>锚点</strong>——所有其他素材的风格都围绕它展开。</p>

      <h3>设计要点</h3>
      <ul>
        <li><strong>尺寸：</strong>建议 32×32 或 48×48。太小看不清细节，太大占屏幕空间</li>
        <li><strong>形状：</strong>经典战斗机轮廓——尖头（机头）、宽体（机身）、后掠翼</li>
        <li>
          <strong>配色：</strong>选一个主色调贯穿——蓝白科技风、红黑恶魔风、绿橙异形风，选一个方向
        </li>
        <li>
          <strong>不对称但要平衡：</strong
          >完全对称的飞机看起来很呆板——可以在一侧机翼加标记/条纹打破对称
        </li>
        <li><strong>引擎火焰：</strong>画在单独图层，之后做帧动画</li>
      </ul>

      <h3>绘制步骤（32×32 示例）</h3>
      <ol>
        <li>
          <strong>线稿层：</strong
          >用轮廓色画出飞机外轮廓——机头（尖）、机身（椭圆）、机翼（左右展开）、尾翼
        </li>
        <li><strong>基础色层：</strong>填充机身主体颜色</li>
        <li><strong>暗部层：</strong>在机身下边缘和右边缘加深</li>
        <li><strong>高光层：</strong>在机头顶端和机翼上边缘提亮</li>
        <li><strong>细节层：</strong>驾驶舱（小块深色玻璃）、机翼条纹、引擎喷口</li>
        <li>
          <strong>引擎火焰层：</strong>2-3 个像素大小的橙/黄/白色火焰（独立图层，Phase 4 做动画）
        </li>
        <li>隐藏线稿层，在 100% 缩放检查</li>
      </ol>

      <div class="tip-box">
        <strong>诀窍：</strong
        >飞机大战是俯视视角——你看到的是飞机的<strong>顶部</strong>。不要把飞机画成正视图/侧视图。想象你从正上方往下看一架飞机。
      </div>

      <div class="tip-box">
        <strong>对称工具加速：</strong>飞机机身是天然左右对称的。Aseprite 菜单 Edit →
        <strong>Symmetry</strong>
        可以开启水平/垂直对称轴——在左边点一个像素，右边自动镜像出现。画完机身后记得关闭对称再画引擎火焰等不对称元素。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="👾" title="三种敌机设计">
      <p>敌机需要<strong>等级递进感</strong>——玩家一眼就能判断威胁程度：</p>

      <h3>小型敌机（16×16）</h3>
      <ul>
        <li>小巧、速度快、血量低、分数少</li>
        <li>配色：简单两色,外形简洁——菱形或三角形</li>
        <li>不需要复杂细节，量大管饱的类型</li>
      </ul>

      <h3>中型敌机（24×24）</h3>
      <ul>
        <li>比玩家飞机稍小，会左右移动 + 向下射击</li>
        <li>配色：和玩家飞机形成对比色（互补色或对比色）</li>
        <li>有明显的前端（机头对准玩家方向）</li>
      </ul>

      <h3>Boss 敌机（48×48 或更大）</h3>
      <ul>
        <li>大型、血量高、多阶段形态</li>
        <li>配色：深色为主，带红色/紫色威胁感</li>
        <li>细节丰富：多个引擎、装甲板、武器阵列</li>
        <li>留出"受损"的空间——Boss 血量低时外观变化</li>
      </ul>

      <div class="warn-box">
        <strong>重要：</strong
        >敌机的机头方向应该<strong>朝下</strong>（朝向屏幕底部/玩家方向）。这和玩家飞机朝上相反。方向一致性能让玩家瞬间判断敌我。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔫" title="子弹与特效">
      <h3>玩家子弹（8×8 或更小）</h3>
      <ul>
        <li>亮色——黄/白/蓝，和深色背景形成强对比</li>
        <li>细长形（竖条）——暗示飞行方向是向上</li>
        <li>火力升级后：子弹变大或变为双发/三发</li>
      </ul>

      <h3>敌机子弹（8×8）</h3>
      <ul>
        <li>红色/橙色——危险的信号色</li>
        <li>圆形或菱形——区分玩家子弹的形状</li>
        <li>也可以比玩家子弹稍大，增加压迫感</li>
      </ul>

      <h3>道具图标（12×12 或 16×16）</h3>
      <ul>
        <li>火力升级：红色菱形或火焰图标</li>
        <li>全屏炸弹：黄色圆形或爆炸图标</li>
        <li>加血：绿色十字或心形</li>
        <li>所有道具加一个<strong>发光背景</strong>（半透明亮色圆），让它们在混乱中容易被看见</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🌌" title="背景绘制">
      <h3>星空背景（可平铺）</h3>
      <p>飞机大战的背景是一个<strong>向下滚动的星空</strong>。需要画一张可无缝平铺的背景图：</p>

      <ol>
        <li>画布大小：比如 480×800（和设计分辨率一致）</li>
        <li>底色：深蓝到深紫的垂直渐变（在 Cocos 中也可以通过两张纯色背景叠加实现）</li>
        <li>星星：不同大小（1-3 像素）和亮度（白色到浅蓝）的随机分布</li>
        <li>
          <strong>无缝平铺技巧：</strong>画布顶边的星星和底边的星星要能接上——最简单的做法是画一张
          480×1600 的长图，然后截取 480×800 循环滚动
        </li>
      </ol>

      <div class="tip-box">
        <strong>偷懒方案：</strong>Cocos 中可以用代码随机生成星星（Graphics
        组件画小圆点），完全不需要手动画星空。但如果要像素风，手动画的星星比引擎生成的有味道。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🖥️" title="HUD 与 UI 元素">
      <p>
        飞行射击游戏的 HUD（抬头显示）需要一套像素风的 UI
        组件。这部分容易被忽略，但直接影响游戏体验：
      </p>

      <h3>像素数字（得分/生命/关卡显示）</h3>
      <ul>
        <li>画 10 个数字（0-9），每个 <strong>8×12</strong> 或 <strong>12×16</strong></li>
        <li>统一使用 2-3 种颜色：主体色 + 轮廓色 + 高光</li>
        <li>所有数字等宽（等宽数字），方便分数对齐</li>
        <li>Aseprite 中可以用图层面板分别画每个数字的参考，导出时按帧分别导出</li>
      </ul>

      <h3>血条/能量条</h3>
      <ul>
        <li>背景框：深色矩形边框（1 像素粗）</li>
        <li>填充条：绿→黄→红的渐变 Ramp（满血绿、半血黄、残血红）</li>
        <li>备用方案：用心形图标表示生命数（16×16 像素心形，画 3-4 个并排显示）</li>
      </ul>

      <h3>边框与面板</h3>
      <ul>
        <li>UI 面板的像素边框——四角不要平的，可以用 1 像素凸起做出"按钮"感</li>
        <li>
          半透明背景面板：用棋盘格抖动在边缘做半透明过渡（也可以用 Cocos 的 opacity
          属性在代码中处理）
        </li>
      </ul>

      <h3>按钮图标</h3>
      <ul>
        <li>暂停按钮：两条竖线 "⏸"（4×8）</li>
        <li>重新开始按钮：环形箭头（8×8）</li>
        <li>所有按钮加 1px 深色投影（右下偏移），增加立体感</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🖼️" title="整体构图检查（Mockup）">
      <p>
        把所有素材各自画完是不够的——你需要把它们<strong>放在同一张画面里</strong>验证对比度、辨识度和风格统一性。
      </p>

      <h3>制作 Mockup 的步骤</h3>
      <ol>
        <li>在 Aseprite 中新建 <strong>480×800</strong>（你的游戏设计分辨率）画布</li>
        <li>把星空背景贴进去（作为背景图层，锁定）</li>
        <li>把玩家飞机放画面底部中央，所有敌机分布在画面中上部分</li>
        <li>放入 2-3 颗子弹（玩家 + 敌机），确认它们在背景上足够显眼</li>
        <li>放入 HUD 元素——得分、血条——在画面上方</li>
        <li>3-4 个道具图标放在画面中</li>
        <li>缩放到 100%，问自己：能瞬间分清敌我吗？子弹明显吗？HUD 可读吗？</li>
      </ol>

      <div class="tip-box">
        <strong>Mockup 的黄金问题：</strong>"闭上一只眼，画面缩小到 50%，你还能在 1
        秒内判断出谁是玩家、谁是敌人、哪里有子弹吗？"——这就是玩家在实际游戏中面临的识别压力。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🧩" title="为动画做图层规划">
      <p>
        画静态素材的时候就要<strong>提前规划好哪些部分会动</strong>。Phase 4
        做动画时，有规划好的图层结构会让你事半功倍：
      </p>

      <h3>玩家飞机推荐的图层结构</h3>
      <pre><code>┌─────────────────────┐
│ 🔆 高光/细节层       │  ← 驾驶舱光泽、机翼条纹
│ ✈️ 机身主体层        │  ← 固定不动的主体
│ 🔥 左引擎火焰层     │  ← 动画（Phase 4）
│ 🔥 右引擎火焰层     │  ← 动画（Phase 4）
│ 📐 线稿层           │  ← 画完可隐藏
└─────────────────────┘</code></pre>

      <h3>分层原则</h3>
      <ul>
        <li><strong>动画部件独立分层：</strong>引擎火焰、螺旋桨、摆动的天线——这些放在独立图层</li>
        <li>
          <strong>受击变色用叠加层：</strong
          >在最上层放一个纯白色填充的飞机轮廓图层（默认隐藏），受击时显示 1-2 帧实现"白闪"
        </li>
        <li>
          <strong>图层命名用英文：</strong>Aseprite 导出到 Cocos 时，图层名可能影响资源管理。用
          <code>body</code>、<code>flame_left</code>、<code>highlight</code>
        </li>
      </ul>

      <div class="warn-box">
        <strong>问题：</strong
        >现在就把火焰和机身画在同一图层，后面做动画时就得重新画机身。一个图层规划失误 = Phase 4
        多花半天重画。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📦" title="素材清单与命名规范">
      <p>最终你需要产出以下文件，建议统一命名：</p>

      <pre><code>素材清单：
├── player_plane.png          (32×32)  玩家飞机
├── enemy_small.png           (16×16)  小型敌机
├── enemy_medium.png          (24×24)  中型敌机
├── enemy_boss.png            (48×48)  Boss敌机
├── bullet_player.png         (8×8)    玩家子弹
├── bullet_enemy.png          (8×8)    敌机子弹
├── item_power.png            (16×16)  火力道具
├── item_bomb.png             (16×16)  炸弹道具
├── item_heal.png             (16×16)  回血道具
├── bg_stars.png              (480×800) 星空背景
├── explosion_frames/                  爆炸帧动画
│   ├── frame_01.png ~ frame_16.png
└── engine_flame/                      引擎火焰帧动画
    ├── frame_01.png ~ frame_04.png</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>玩家飞机的视角是什么？俯视还是侧视？</li>
        <li>Aseprite 的对称工具怎么开启？什么时候该用、什么时候该关？</li>
        <li>如何通过颜色和形状区分玩家飞机和敌机？</li>
        <li>三种敌机的尺寸、配色、细节程度如何形成递进感？</li>
        <li>为什么敌机子弹用红色/橙色？玩家子弹用什么颜色？</li>
        <li>道具图标为什么要加发光背景？</li>
        <li>像素数字需要几个？什么尺寸？为什么所有数字要等宽？</li>
        <li>Mockup 是什么？你在 Mockup 上应该重点检查什么问题？</li>
        <li>玩家飞机的推荐图层结构是怎样的？为什么引擎火焰要独立分层？</li>
        <li>无缝平铺背景图的关键是什么？</li>
      </ul>
    </ConceptBlock>
  </ArtPhaseLayout>
</template>
