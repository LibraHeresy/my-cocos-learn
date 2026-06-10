<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="16" title="UI 系统深入" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>2011 年，《英雄联盟》的 HUD 设计师做了一个决定：<strong>把血量条放在屏幕底部而不是角色头上</strong>。测试数据显示，新手玩家的死亡次数降低了 30%。UI 的位置不是审美问题——是生死问题。如果你是从前端转过来的，Cocos 的 UI 系统会让你感觉很熟悉，但也有几处"当心——这里和浏览器不一样"的陷阱。这一节把相似和不同都讲清楚。</p>
    </ConceptBlock>

    <ConceptBlock icon="❤️" title="血量条的故事：为什么 UI 位置是游戏设计问题">
      <p>2009 年，Riot Games 的 UI 团队在《英雄联盟》的早期测试中发现了一个致命的可用性问题：新玩家频繁"不知道自己快死了"。因为血量条在角色头上，而角色可能被草丛、技能特效、其他角色遮挡——玩家的注意力在战场中心，不在自己角色的头顶。</p>
      <p>设计师做了一个反直觉的改动：把血量条从角色头上移到<strong>屏幕底部中央</strong>——一个玩家不需要移动目光就能看到的位置。改动的结果是：新玩家死亡率下降 30%，但老玩家暴怒——"我看不到我的角色了！" Riot 被迫保留两种模式（头顶血条 + 底部 HUD）作为可选项。</p>
      <p>这个故事告诉你的是：<strong>UI 的位置不是"放到觉得好看的地方"——是人因工程问题</strong>。人眼的中央凹视觉区域（可以在不移动眼球的情况下看清的区域）只有屏幕上约 2° 的范围。重要的信息（血量、冷却时间、敌人方向指示器）必须放在这个区域内；不重要的（聊天框、商城入口）可以放在边缘。</p>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="Widget：游戏世界的 position: absolute + transform: translate">
      <p>Widget 组件让节点可以<strong>相对父节点或屏幕边缘</strong>定位。选中一个节点，添加 Widget 组件，你会看到 Top/Bottom/Left/Right 四个边距属性：</p>
      <ul>
        <li>设置 Top = 50, Center X = 0 → 节点固定在屏幕顶部居中，距顶部 50px</li>
        <li>设置 Left = 20, Bottom = 20 → 节点固定在屏幕左下角</li>
        <li>设置所有四条边对齐 → 节点随父节点缩放（类似 CSS width: 100%）</li>
      </ul>
      <p>这和 CSS 的 <code>position: absolute; top: 50px; left: 50%; transform: translateX(-50%)</code> 是同样的设计思路。</p>
      <div class="tip-box">
        <strong>前端类比一：</strong> Widget ≈ <strong>CSS position: absolute + transform</strong>。Top/Left/Right/Bottom 四条边距就是 CSS 的 top/left/right/bottom 属性。勾选 Center X 就是 <code>left: 50%; transform: translateX(-50%)</code>。如果你理解 CSS 的盒模型和定位，Widget 的学习曲线是零。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📏" title="Layout：游戏世界的 Flexbox / Grid">
      <p>Layout 组件放在父节点上，自动排列子节点：</p>
      <ul>
        <li><strong>水平布局：</strong> 子节点从左到右排</li>
        <li><strong>垂直布局：</strong> 子节点从上到下排</li>
        <li><strong>网格布局：</strong> 子节点按 N 列网格排</li>
      </ul>
      <pre>// 像 Flexbox 一样：direction + spacing + padding
layout.type = Layout.Type.HORIZONTAL
layout.spacingX = 10       // = gap: 10px
layout.paddingLeft = 20    // = padding-left: 20px</pre>
      <div class="tip-box">
        <strong>前端类比二：</strong> Layout ≈ <strong>CSS Flexbox / Grid</strong>。<code>Layout.Type.HORIZONTAL</code> = <code>display: flex; flex-direction: row</code>；<code>spacingX</code> = <code>gap</code>；<code>paddingLeft</code> = <code>padding-left</code>。但有一个关键区别：Cocos Layout 的子节点位置由引擎在 update 后自动计算，不是在 Layout/Paint 阶段算的。这意味着频繁修改子节点位置时，Layout 可能成为性能瓶颈——在大量动态 UI 元素的场景（比如活动背包图标、BUFF 计时器列表）中要谨慎使用。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📜" title="ScrollView + Item 复用：游戏世界的虚拟滚动">
      <p>如果你做一个排行榜列表，有 1000 条记录，你会创建 1000 个 Node 吗？不会——和前端虚拟滚动的原理一样，只创建可见区域的少量节点，滚动时复用：</p>
      <pre>// ScrollView + 对象池 = 无限列表
scrollView.node.on('scrolling', () => {
  // 检测哪些 Item 滚出视野 → 回收
  // 检测哪些区域需要新 Item → 从池中取出并设置数据
})</pre>
      <div class="tip-box">
        <strong>前端类比三：</strong> ScrollView + Item 复用 ≈ <strong>vue-virtual-scroller / react-window</strong>。核心思路完全相同：只渲染视口内 + 上下缓冲区的元素。区别在于 Web 的虚拟滚动用 DOM 回收，Cocos 用对象池回收——但数据结构（startIndex, visibleCount）和计算逻辑完全一致。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📑" title="Z-Order：游戏世界的 z-index 层叠上下文">
      <p>在浏览器里，元素的视觉层级由 <code>z-index</code> 和 DOM 的层叠上下文决定。在 Cocos 里，你通过节点的 <code>siblingIndex</code>（兄弟序位）和父节点层级来管理渲染顺序：</p>
      <table>
        <thead><tr><th>需求</th><th>CSS 方案</th><th>Cocos 方案</th></tr></thead>
        <tbody>
          <tr><td>HUD 永远在最上层</td><td><code>z-index: 9999</code></td><td>把 HUD 节点放在渲染树的最后</td></tr>
          <tr><td>弹窗覆盖背景遮罩</td><td>两个兄弟 div，弹窗 z-index 更高</td><td>遮罩在前，弹窗在后（siblingIndex 更大）</td></tr>
          <tr><td>关卡地图在角色下方</td><td><code>z-index: -1</code></td><td>地图节点在角色节点之前</td></tr>
          <tr><td>独立的层级管理</td><td>创建层叠上下文（<code>isolation: isolate</code>）</td><td>用父节点分组（UI Layer / Game Layer）</td></tr>
        </tbody>
      </table>
      <div class="tip-box">
        <strong>前端类比四：</strong> Cocos 的渲染顺序 ≈ <strong>CSS z-index + Stacking Context</strong>。同层级：后面的覆盖前面的；跨层级：子节点的 z-index 被父节点的 stacking context 隔离。区别在于 Cocos 不存在全局 z-index——层级由节点树的 DFS 遍历顺序决定。如果你有几个必须"永远在最上面"的 UI 元素，把它们统一放在一个 UI 层父节点下，让这个父节点成为渲染树的最后一个分支。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>《死亡空间》的"故事内 UI"（Diegetic UI）——当世界本身就是菜单：</strong> 2008 年 Visceral Games 的《死亡空间》做了一个革命性的 UI 设计：它几乎完全消灭了传统 HUD。角色的血量显示在<strong>太空服背部的脊柱灯管</strong>上（绿色满血→黄色→红色危险），弹药数量显示在<strong>枪械本身的屏幕</strong>上，背包菜单是<strong>角色面前的一个全息投影</strong>。这被称为"故事内 UI"（Diegetic UI）——UI 元素存在于游戏世界的物理空间中，角色"看得见它"。这种设计让玩家始终沉浸在恐怖氛围中，不会因为弹出"装备菜单"而跳戏。虽然你的飞机大战不需要做到这种程度，但理解"UI 总是打断沉浸感"这个事实，会让你在做 HUD 时更克制——少即是多。</li>
        <li><strong>《暗黑破坏神》的"血球"——为什么一个红色球影响了整个行业：</strong> 1996 年《暗黑》的 UI 设计师做了一个今天看起来普通、当时极其创新的决定：用两个巨大的球体（红色血球、蓝色魔球）放在屏幕底部中央来替代传统的"HP/MP 数值条"。巨大的好处是<strong>余光可见</strong>——玩家在屏幕中央杀怪时，余光就能感知到"红色球还剩多少"。2000 年的《暗黑破坏神 2》进一步优化，让球体在血液/魔法不足时闪烁红光/蓝光——不需要看数字，余光感知闪烁就够。2012 年《暗黑 3》大幅缩小了血球尺寸，结果——老玩家又一次暴怒。"余光可读"是游戏 UI 设计中最重要的概念之一。</li>
        <li><strong>拇指区（Thumb Zone）——为什么手机游戏按钮总是很大：</strong> 2013 年，移动端 UX 研究员 Steven Hoober 发表了一项里程碑式的研究：他观察了 1333 个人如何拿手机，发现 75% 的人用单拇指操作，而拇指能自然触碰到的区域只有屏幕下半部分的一个"拇指区"。这就是为什么所有手机游戏的按钮都集中在下半部——不是风格问题，是人体工学。Cocos 主要用于移动端，你在设计 UI 时请记住：<strong>重要按钮放底部，视觉信息可以放顶部</strong>。Widget 的 Bottom 对齐就是为拇指区设计的。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：搭建游戏 HUD + 虚拟滚动列表">
      <p>在你的 Cocos 场景中搭建一个完整的游戏 HUD，包含血条、分数、暂停按钮，再加一个支持大量数据的排行榜列表。</p>
      <p><strong>1. 血条（Health Bar）——Widget 锚定左上角</strong></p>
      <pre>// HealthBar.ts
@ccclass('HealthBar')
export class HealthBar extends Component {
  @property(ProgressBar) bar: ProgressBar = null!
  @property(Label) label: Label = null!

  onLoad() {
    // Widget 锚定：选中 HealthBar 节点 → 添加 Widget 组件
    // 勾选 Top → Top = 30, 勾选 Left → Left = 30
    // 效果：始终固定在屏幕左上角，距边缘 30px
  }

  updateDisplay(currentHp: number, maxHp: number) {
    this.bar.progress = currentHp / maxHp
    this.label.string = `${currentHp}/${maxHp}`
  }
}

// 在 PlayerController 中调用
eventBus.on('player-damaged', (hp: number) => {
  this.healthBar.updateDisplay(hp, this.maxHp)
})</pre>
      <p><strong>2. 分数计数器 + 暂停按钮——Widget 锚定右上角</strong></p>
      <pre>// ScoreHUD.ts — Widget: Top = 30, Right = 30
@ccclass('ScoreHUD')
export class ScoreHUD extends Component {
  @property(Label) scoreLabel: Label = null!

  onLoad() {
    eventBus.on('score-changed', (score: number) => {
      this.scoreLabel.string = `分数: ${score.toLocaleString()}`
    })
  }
}

// 暂停按钮 — 放在 ScoreHUD 下面
// 在 Button 的 ClickEvents 里绑定 GameManager.instance.togglePause()
// 按下后所有 Enemy 的 update 检查 GameManager.instance.isPaused</pre>
      <p><strong>3. 排行榜——ScrollView + 虚拟 Item 复用</strong></p>
      <pre>// Leaderboard.ts
@ccclass('Leaderboard')
export class Leaderboard extends Component {
  @property(ScrollView) scrollView: ScrollView = null!
  @property(Prefab) itemPrefab: Prefab = null!
  @property itemHeight: number = 50

  private data: { name: string; score: number }[] = []   // 假设有 1000 条
  private pool: Node[] = []        // 复用池
  private activeNodes: Node[] = [] // 当前可见的节点

  onLoad() {
    // 初始化池——创建 15 个 item 就够覆盖可见区域
    const visibleCount = Math.ceil(this.scrollView.node.height / this.itemHeight) + 2
    for (let i = 0; i &lt; visibleCount; i++) {
      const item = instantiate(this.itemPrefab)
      item.active = false
      this.pool.push(item)
    }

    this.scrollView.node.on('scrolling', this.onScroll, this)
  }

  setData(data: { name: string; score: number }[]) {
    this.data = data
    this.refreshView()
  }

  private onScroll() {
    this.refreshView()
  }

  private refreshView() {
    const scrollOffset = this.scrollView.getScrollOffset().y
    const startIndex = Math.max(0, Math.floor(scrollOffset / this.itemHeight))
    const visibleCount = Math.ceil(this.scrollView.node.height / this.itemHeight)

    // 回收所有当前节点
    for (const node of this.activeNodes) {
      node.active = false
      this.pool.push(node)
    }
    this.activeNodes = []

    // 显示可见范围的节点
    for (let i = startIndex; i &lt; startIndex + visibleCount + 1 && i &lt; this.data.length; i++) {
      const item = this.pool.pop()
      if (!item) break  // 池不够用（理论上不应发生）

      item.active = true
      item.setPosition(0, -i * this.itemHeight, 0)
      item.getComponent(LeaderboardItem).setup(i + 1, this.data[i].name, this.data[i].score)
      this.activeNodes.push(item)
    }
  }
}</pre>
      <p><strong>验证：</strong> 造 500 条假数据灌进排行榜，上下快速滑动。观察 Hierarchy 面板——任何时候只有约 15 个活跃的 Item 节点，不是 500 个。这就是虚拟滚动的力量。</p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <p>学完这一节，你应该能回答：</p>
      <ol>
        <li>为什么 Riot Games 把血量条移到屏幕底部能使新手死亡率降低 30%？从人眼中央凹视觉和注意力分布的角度解释。你自己的 HUD 设计会因此做出什么调整？</li>
        <li>Widget 和 CSS 的 <code>position: absolute; transform: translate</code> 在定位逻辑上有什么对应关系？Layout 和 CSS Flexbox 又有什么对应关系？把 Top/Left/Right/Bottom/SpacingX/PaddingLeft 翻译成对应的 CSS 属性。</li>
        <li>为什么虚拟滚动对于性能至关重要？如果有 1000 个排行榜条目，不虚拟化的代价是什么——从 DrawCall、内存、update 三个方面分析。</li>
        <li>游戏中如果有 5 个 UI 层（HUD 血条、漂浮伤害数字、暂停菜单、恭喜弹窗、加载遮罩），你如何管理它们的渲染顺序？如果弹窗出现在暂停菜单下面，问题出在哪？用 CSS z-index + stacking context 的概念来解释 Cocos 的层级管理。</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
