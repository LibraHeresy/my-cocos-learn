<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="9" title="帧动画实战（上）" duration="2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>理论够了。这一节动手——<strong>给你的玩家飞机做两套帧动画：idle（待机浮动）和 attack（攻击）</strong>。从打开文件到导出 SpriteSheet，每一步都是你在真实项目中会做的事。</p>
    </ConceptBlock>

    <ConceptBlock icon="📜" title="从手翻书到 SpriteSheet：帧动画的前世今生">
      <p>你在小学课本边缘画过"火柴人小人翻书动画"吗？在每一页的角落画一个稍微不同的火柴人，然后用拇指快速翻页——小人"动"起来了。这就是逐帧动画的最原始形态。</p>
      <p>19 世纪末，动画师把角色画在透明的赛璐珞片上（Cel Animation），叠加在背景上逐帧拍摄——迪士尼的《白雪公主》（1937）就是这么拍出来的：每秒 24 帧，一部电影画了 25 万张手稿。</p>
      <p>到了电子游戏时代——1980 年代的街机用 ROM 芯片存精灵图（Sprite Sheet），硬件在每一帧从 ROM 里取出当前帧的像素数据直接送到屏幕。这就是为什么那些老游戏的 SpriteSheet 是"平铺在地板上"的一张大图——因为硬件只能按固定地址读数据，没有"裁剪矩形"的概念。</p>
      <p>今天你用 Cocos 做帧动画——底层做的事情和管理方式已经完全不同了，但概念没变：<strong>把一组连续的画面按时间顺序播放出来，利用人眼的视觉暂留效应制造运动错觉</strong>。这个原理 150 年没变过。变化的是"效率"——从手画每一帧，到 Aseprite 的洋葱皮+图层管理，再到 Cocos 的 AnimationClip 自动切换 SpriteFrame。</p>
    </ConceptBlock>

    <ConceptBlock icon="⚙️" title="关键帧 vs 中间帧 vs 帧率：三个你每次做动画都要回答的问题">
      <p>在做动画之前，你先做三个决策——它们决定你的动画是"感觉对"还是"看着怪"。</p>

      <h3>关键帧（Keyframe）—— "故事节点"</h3>
      <p>关键帧是动画里最重要的几个"定义性"画面。比如角色出拳：关键帧只有两个——蓄力（手在身后）和打中（手在前方）。这两个帧定义了动作的起和止。在 Aseprite 里，你应该<strong>先画关键帧</strong>，按 Enter 预览，确认动作的幅度和节奏是对的——然后再补中间帧。</p>
      <p>这和你在 Cocos Animation Editor 里先设置关键帧位置、再调整曲线是一模一样的思路。先定"骨架"（关键帧），再填"肉"（中间帧）。</p>

      <h3>中间帧（Inbetween）—— "过渡画面"</h3>
      <p>在两个关键帧之间插入的过渡帧。中间帧的数量决定了动作的"流畅度"——插入越多，过渡越平滑。但中间帧不是越多越好——有时候 2 帧的"跳帧"比 8 帧的平滑过渡更有打击感。中间帧的艺术不在于"能画多少"，而在于<strong>知道该少画多少</strong>。</p>

      <h3>帧率（FPS）—— "时间密度"</h3>
      <p>像素画动画的帧率不是一个"固定值"——是你要根据游戏风格选的：</p>
      <ul>
        <li><strong>8 fps：</strong> 复古跳跃感。每一帧停留约 125ms。适合致敬 NES 风格的独立游戏。</li>
        <li><strong>12 fps：</strong> 经典像素帧率。每一帧约 83ms。是绝大多数像素游戏的标准——流畅度刚好，保留了一点点"逐帧感"。</li>
        <li><strong>24 fps：</strong> 接近手绘动画的帧率。每一帧约 42ms。非常流畅，但制作量翻倍——同样的动作要画 2-3 倍帧数。</li>
        <li><strong>60 fps（不要用逐帧做 60fps）：</strong> 如果你需要 60fps 的流畅动画——用 Cocos 的 Tween，不要用逐帧。画 60 帧每秒 = 1 秒的动作要画 60 张图，一个人干不来的。</li>
      </ul>
      <p>对于飞机大战，我建议 12 fps 作为角色动画帧率——每一帧持续约 0.08s（80-100ms）。这个帧率下 4 帧的 idle 循环约 0.3-0.4 秒，节奏刚好。</p>

      <h3>循环动画 vs 一次性动画</h3>
      <p><strong>循环动画</strong>（idle/跑步/引擎火焰）：首帧和尾帧要能无缝衔接。尾帧的下一个状态 = 首帧的状态。在 Aseprite 里设置 Loop 模式后反复播放，检查"接缝"处有没有跳帧。</p>
      <p><strong>一次性动画</strong>（攻击/爆炸/受击）：不需要首尾衔接——播完就停在尾帧。尾帧通常是消散态（比如爆炸后的烟雾残留）或回归常态（攻击后回到 idle 姿势）。</p>
      <p>这两种动画的帧设计策略完全不一样。循环动画的<strong>每一帧和首尾帧的关系</strong>要精心设计；一次性动画的<strong>节奏弧线</strong>（起→爆发→消散）是设计重点。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：玩家飞机 idle + attack 两套动画">
      <p>打开 Aseprite，打开你之前在 Phase 7 设计的玩家飞机 .aseprite 文件（或者新建一个 32×32 角色）。</p>

      <h3>Idle 动画（4 帧循环）：上下浮动</h3>
      <ol>
        <li><strong>在时间轴面板新建 4 帧：</strong> 右键帧区域 → New Frame，重复 4 次。你现在有 4 个相同的飞机画面。</li>
        <li><strong>帧 1：</strong> 默认位置。飞机在画布中央。这是基准帧。</li>
        <li><strong>帧 2：</strong> 用移动工具（V）把飞机整体向上移动 1px。引擎火焰微微缩短（向上移动了所以火焰被"压"了一下）。</li>
        <li><strong>帧 3：</strong> 回到原始位置（同帧 1）。如果你不想复制帧 1——可以直接把帧 2 再向下移 1px（回到原位）。</li>
        <li><strong>帧 4：</strong> 飞机整体向下移动 1px。引擎火焰微微拉长。这是"下降"帧。（注意：传统 idle 浮动是帧 1→2→3→4→3→2→1 来回摆——但简单的帧 1→2→3→4 循环也能用，只是会有"往上跳"的感觉。建议用 4 帧来回摆：帧 1=中, 帧 2=上, 帧 3=中, 帧 4=下。循环：1→2→3→4→3→2→1。不过 Aseprite 最简单的循环就是 1-2-3-4-1，也是可以的。）</li>
        <li><strong>设置帧时长：</strong> 每帧 100ms。右键帧 → Frame Properties → Duration = 100。</li>
        <li><strong>测试循环：</strong> 设置 Loop 模式，按 Enter 播放。飞机应该看起来在微微上下浮动——像悬停在空中，充满生命力。</li>
      </ol>

      <h3>Attack 动画（4 帧，一次性或循环）：枪口闪光</h3>
      <ol>
        <li><strong>新建图层 "attack_vfx"：</strong> 在攻击图层上画特效，不影响飞机本体。这样你可以单独导出。</li>
        <li><strong>帧 1（蓄力 / 预备）：</strong> 飞机本体向后缩 1px（向后移动）。引擎火焰变亮（颜色变白/黄）。这是 Anticipation。</li>
        <li><strong>帧 2（射击爆发）：</strong> 飞机向前猛冲 2px（前冲感）。在枪口位置画 2×2 或 3×3 的亮黄色菱形闪光（枪口焰）。</li>
        <li><strong>帧 3（后坐回落）：</strong> 飞机回弹 1px（回到比原位稍前一点的位置）。枪口闪光变小（1×1 残留，颜色从黄变橙）。</li>
        <li><strong>帧 4（归位）：</strong> 飞机回到原位。闪光消失。引擎火焰恢复正常颜色。</li>
        <li><strong>设置帧时长：</strong> 帧 1=50ms（快速蓄力）、帧 2=80ms（闪光多留一瞬）、帧 3=50ms、帧 4=100ms（稍长的归位停顿）。一次性动画。</li>
        <li><strong>测试：</strong> 按 Enter 播放。你应该看到飞机"蓄力→爆发→后坐→归位"——虽然只有 4 帧，但节奏出来了。</li>
      </ol>

      <h3>导出 SpriteSheet：</h3>
      <p>File → Export Sprite Sheet。设置：Sheet Type = By Rows（或 By Columns），Layers = 勾选所有图层，Frames = All frames。格式 PNG。分别导出 idle 和 attack 为独立的 SpriteSheet PNG——你将在 Cocos 中用 Animation Clip 播放它们。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>手绘逐帧 vs Spine 骨骼 vs AI 插帧——三大方案的战场：</strong> 手绘逐帧：每一帧都是你画的，完全的控制权，但费时。适合 32-64px 的像素角色——因为角色太小，骨骼系统反而"杀鸡用牛刀"。Spine 骨骼动画：用骨架驱动图片变形，省去中间帧的重复绘制，但需要额外的工具学习和运行时开销。适合大型 2D 角色（128px+）、换装系统和复杂的混合动画。AI 插帧（Cascadeur、EbSynth、Runway 等）：AI 根据你的关键帧生成中间帧——快但不可控，生成的东西"像"但不精确。适合做原型或做背景动效，不适合做手感的角色核心动画。对于你的飞机大战——角色 32-48px——手绘逐帧仍然是性价比最高的方案。</li>
        <li><strong>视觉暂留（Persistence of Vision）：</strong> 帧动画的物理基础是人眼的视觉暂留效应——光信号消失后视网膜上的化学反应还会持续约 1/10 到 1/20 秒。这就是为什么 12fps（每帧约 83ms）的动画你看着是"连续运动"而不是"快速切换的图片"。这个生理现象第一次被系统研究是在 1824 年——Peter Mark Roget（是的，就是那个 Roget's Thesaurus 词典的作者）发表了相关论文。一个词典学家的"副业研究"成了 200 年后所有动画和电影的基础。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>循环动画的首帧和尾帧需要满足什么条件才能"无缝衔接"？如果尾帧和首帧之间有一帧的跳跃——玩家会看到什么？</li>
        <li>为什么 12fps 是像素游戏动画的"甜点"——不像 8fps 那么跳，也不像 24fps 那么费工？试着用自己的话解释这个取舍。</li>
        <li>"关键帧→中间帧→帧率设定"这个工作流和你在前端开发中的什么流程相似？画出这个类比。</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
