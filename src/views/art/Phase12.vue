<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="12" title="UI/HUD 设计" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>作为前端工程师，你每天都在做 UI。但游戏 UI 和 App UI <strong>不是一回事</strong>——游戏 UI 要在玩家注意力高度集中的情况下，用最小的视觉占用传递最重要的信息。本节讲像素游戏 HUD 设计，并手画出心形生命值、数字字体和进度条。</p>
    </ConceptBlock>

    <ConceptBlock icon="🖥️" title="当《Dead Space》把 UI 放在盔甲上——游戏 UI 的边界在哪？">
      <p>2008 年，EA 发行了恐怖游戏《Dead Space》。它做了一件让整个游戏 UI 领域震惊的事：<strong>完全放弃了传统 HUD</strong>。没有屏幕角落的血条——主角的生命值显示在他的盔甲脊柱上的一条发光管里。没有弹出弹药数量——枪上的小屏幕直接显示剩余弹量。所有 UI 信息都"长"在角色和武器上。这种设计被称为 <strong>diegetic UI</strong>（叙事内 UI）。</p>
      <p>你的飞机大战不需要这么极端，但《Dead Space》抛出了一个根本性的问题：<strong>游戏 UI 的本质是什么？</strong></p>
      <p>App UI（比如你写的后台管理面板）的核心目标是——信息密度高、操作效率高、用户可以"慢读"。用户在淘宝上可以花 30 秒看商品详情，可以扫一眼侧边栏找到"设置"。</p>
      <p>游戏 UI 的核心目标完全不同——<strong>极低的信息密度、极快的辨识速度、绝对不能打断沉浸感</strong>。玩家在弹幕里不会花 1 秒读"当前生命值"——他们需要 50ms 内用余光判断"我还剩几格血"。游戏 HUD 不是让人"读"的——是让人"感知"的。</p>
      <p>这个区别决定了你设计游戏 UI 时的所有决策：图标要大而简（心形，不是心电图），信息用图形而不是文字（3 颗心=3 条命，不是"Life: 3"），颜色用最高对比度（白字在深色背景上，不要灰字在白底上）。</p>
    </ConceptBlock>

    <ConceptBlock icon="📊" title="HUD 三大组件：生命 / 分数 / 血条的设计逻辑">
      <h3>心形生命值（HP Heart）—— 最古老的游戏图标</h3>
      <p>心形代表生命——这个符号的起源可以追溯到古代（可能是常春藤叶或者女性的臀部轮廓——历史学家争论不休）。但它在游戏中的"标准化"始于 1980 年代的街机和 FC 游戏——《塞尔达传说》的心形容器（Heart Container）是最有名的早期用例。</p>
      <p>在设计像素心形时，16×16 的心形有几个要点：</p>
      <ul>
        <li>上方两瓣（行 3-5 左右分叉），下方收窄成尖底。</li>
        <li>红色为主体填充色。左上角 1-2px 粉色/白色高光（光源惯例——左上打光）。</li>
        <li>右下方 1-2px 暗红色边缘（阴影）。</li>
        <li>空的心（失去的生命）用深灰或半透明红色表示——和满心形成清晰对比。</li>
      </ul>
      <p>心形的形状在 16×16 限制下非常紧凑——你会惊讶于"竟然能用这么少的像素表达一个可辨认的心"。这就是像素画的极限表达能力。</p>

      <h3>数字字体（8×8 per digit）—— 你自己的像素数字</h3>
      <p>为什么不能用系统字体？因为系统字体（即使是等宽字体）在像素画放大后会变得模糊——TTF 字体依赖 Anti-aliasing，而像素画需要 Point 过滤。解决方案：<strong>手绘一套 8×8 的像素数字 0-9</strong>。</p>
      <p>8×8 每个数字的设计约束：</p>
      <ul>
        <li>竖线用 1px 宽，横线用 1px 高。</li>
        <li>数字"8"刚好填满整个 8×8 格子——它是最"满"的数字。</li>
        <li>数字"1"只占中间 2 列——是最"窄"的数字。所有数字宽度在 1-8px 之间不等。</li>
        <li>10 个数字放在一张 80×8 的 SpriteSheet 上（每个数字 8px 宽 × 10 个 = 80px）。在 Cocos 中用 Sprite Editor 切成 10 个 SpriteFrame。</li>
      </ul>
      <p>这套手绘数字字体将成为你整个游戏的"品牌字体"——所有数字显示（分数、倒计时、关卡号）都用它。这和你在 Web 项目中定义一个 <code>@font-face</code> 一样——定义一次，全局使用。</p>

      <h3>Boss 血条（32×8）—— 用 Scale 而不是换图</h3>
      <p>血条的设计原则：<strong>不要为每个血量百分比画一张图</strong>。正确的做法是——画一张"满血"状态的完整血条图（32×8 的绿色条+暗色底），在 Cocos 中通过修改绿色填充层的 <strong>Scale X</strong> 来动态表示血量比例。</p>
      <p>血条的细节层次：</p>
      <ul>
        <li>底层：深灰色填充全部 32×8。</li>
        <li>填充层：绿色填充。顶部 1px = 亮绿色（高光线），底部 1px = 暗绿色（阴影线），中间 = 主绿色。用 3 层颜色表达"这是一个立体的小条"。</li>
        <li>边框层：1px 暗色边框包围整个血条。</li>
      </ul>
      <p>在 Cocos 中，把填充层的父节点锚点（Anchor）设为 (0, 0.5)——这样 Scale X 从 0 到 1 时，条从左向右缩而不是从中心向两侧缩。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：HUD 三件套全画出来">
      <p>在 Aseprite 中依次完成三个 HUD 元素的绘制——每个都是独立的文件。</p>
      <ol>
        <li><strong>16×16 心形：</strong> 新建 16×16 画布。调色板预选 3 个颜色：红色（主色）、粉色（高光）、暗红（阴影）。按照上面"心形生命值"的要点逐像素放置。画完后导出 <code>hud_heart_full.png</code>。再复制一份，把红色换成深灰色，导出 <code>hud_heart_empty.png</code>。在游戏中用两张图切换表示"有心"和"没心"。</li>

        <li><strong>80×8 数字字体 SpriteSheet：</strong> 新建 80×8 画布。从左到右画 0-9，每个数字占 8×8。建议用白色或亮黄色画数字，透明背景（在 Cocos 中显示时叠加在深色 HUD 背景上）。导出 <code>hud_numbers.png</code>。在 Cocos 中：选中 PNG → Inspector → Type = Sprite Frame（而不是 Texture 2D）→ 点击 Edit → Sprite Editor → 自动网格切分（Grid by Count: 10 Columns × 1 Row）→ Apply。你现在有了 10 个独立的 SpriteFrame：<code>hud_numbers_0</code> 到 <code>hud_numbers_9</code>。</li>

        <li><strong>32×8 Boss 血条：</strong> 新建 32×8 画布。底层：深灰色填充全部。填充层：绿色填充左 80%。高光线：在绿色区的顶部 1px 画亮绿色。阴影线：在绿色区的底部 1px 画暗绿色。边框层：1px 暗色外框。导出 <code>hud_boss_bar_bg.png</code>（只含底层+边框）和 <code>hud_boss_bar_fill.png</code>（只含绿色填充部分，不含外框和底层——这样你可以独立 Scale 填充层）。</li>

        <li><strong>在 Cocos 中拼装 HUD（可选但推荐做）：</strong> 在场景 Canvas 下创建 HUD 根节点（置于 UI 层级顶部）。左上角：3 个心形 Sprite 水平排列，间距 2px。右上角：数字 Sprite 拼接显示分数（暂用手动拼接或后续写脚本动态更新）。底部居中：Boss 血条的背景 + 填充层（填充层的 Scale X 初始为 1.0——满血状态）。</li>
      </ol>
      <p>做完这三件套，你的游戏就有了一个完整的信息层——玩家不需要读任何文字，就能在 0.1 秒内感知到生命、分数和 Boss 状态。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>像素字体设计——从 Atari 到今天的传承：</strong> 最早的像素字体可以追溯到 1970 年代的 Atari 2600——它的硬件只能显示 8×8 的字符网格。在这 64 个像素里，设计师要想办法塞进 A-Z、0-9 和少量符号。8×8 就是原子约束——不可逾越，只能在里面做文章。今天你仍然能看到 8×8 字体被广泛使用——不是因为"没法用更大的"，而是因为<strong>8×8 有一种独特的紧凑美感</strong>。好的限制产生好的设计——这个道理在字体设计上体现得淋漓尽致。</li>
        <li><strong>《蔚蓝》（Celeste）的 UI 融入哲学：</strong> Matt Makes Games 的《蔚蓝》是一个关于攀登和个人成长的像素平台游戏。它的 UI 设计有一个鲜明的特点——HUD 元素极少出现在屏幕中央，大多数信息（死亡计数、草莓收集数）只在关卡转换时才出现。在攀爬过程中，屏幕上几乎只有角色和山。这种"最小 UI"哲学让玩家的注意力 100% 集中在核心体验上。对于你的飞机大战——思考一下：哪些信息可以只在"波次结束"时显示，而不是一直挂在屏幕上？</li>
        <li><strong>游戏 UI 和 Web 响应式设计的交叉点：</strong> 游戏 HUD 的"屏幕角落的生命值"和 Web 的"固定在右下角的聊天气泡"——在布局技术上是一回事：用父容器的百分比位置 + 固定像素距离来确保 UI 元素在所有屏幕尺寸下都在正确位置。Cocos 的 Widget 系统（锚点+边距）和 CSS 的 <code>position: fixed; right: 20px; bottom: 20px;</code> 是同一个概念。你作为前端工程师——这个布局直觉你已经有了。只需要适应一个差异：游戏 UI 用世界坐标系（像素偏移），Web UI 用视口坐标系（百分比+固定边距）。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>游戏 UI 和 App UI 的核心区别是什么？让一个每天用淘宝的用户和每天玩游戏的玩家分别描述他们对"界面"的期望——有什么区别？</li>
        <li>为什么游戏 HUD 中的生命值用心形图标而不是文字"HP: 3"？从"视觉辨识速度"的角度来回答——不要只回答"好看"。</li>
        <li>Boss 血条为什么用 Scale X 动态缩放而不是准备 100 张不同百分比的图？还有更好的实现方案吗？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
