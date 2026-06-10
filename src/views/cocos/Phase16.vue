<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="16" title="UI 系统深入" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>如果有人告诉你"游戏 UI 就是前端的 CSS 布局"，他只说对了一半。布局确实像，但游戏 UI 在渲染机制、输入事件、层级管理上和 Web 有本质不同。这一节讲清楚。</p>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="Widget：游戏世界的 position: absolute">
      <p>Widget 组件让节点可以<strong>相对父节点或屏幕边缘</strong>定位。选中一个节点，添加 Widget 组件，你会看到 Top/Bottom/Left/Right 四个边距属性：</p>
      <ul>
        <li>设置 Top = 50, Center X = 0 → 节点固定在屏幕顶部居中，距顶部 50px</li>
        <li>设置 Left = 20, Bottom = 20 → 节点固定在屏幕左下角</li>
        <li>设置所有四条边对齐 → 节点随父节点缩放（类似 CSS width: 100%）</li>
      </ul>
      <p>这和 CSS 的 <code>position: absolute; top: 50px; left: 50%; transform: translateX(-50%)</code> 是同样的设计思路。</p>
    </ConceptBlock>

    <ConceptBlock icon="📏" title="Layout：游戏世界的 Flexbox">
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
      <p>但和 CSS Flexbox 有一个关键区别：<strong>Layout 的子节点位置由 engine 在 update 后自动计算</strong>，不是在 Layout/Paint 阶段算的。这意味着频繁修改子节点位置时，Layout 可能成为性能瓶颈。</p>
    </ConceptBlock>

    <ConceptBlock icon="📜" title="ScrollView + Item 复用">
      <p>如果你做一个排行榜列表，有 1000 条记录，你会创建 1000 个 Node 吗？不会——和前端虚拟滚动的原理一样，只创建可见区域的少量节点，滚动时复用：</p>
      <pre>// ScrollView + 对象池 = 无限列表
scrollView.node.on('scrolling', () => {
  // 检测哪些 Item 滚出视野 → 回收
  // 检测哪些区域需要新 Item → 从池中取出并设置数据
})</pre>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>Immediate Mode GUI vs Retained Mode GUI：</strong> 游戏 UI 有两种流派。Immediate Mode（如 Dear ImGui）每帧重新绘制整个 UI——简单但低效。Retained Mode（如 Cocos/Unity UGUI）保持 UI 树，只更新变化的部分——高效但复杂。Cocos 属于 Retained Mode。</li>
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
    for (let i = 0; i < visibleCount; i++) {
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
    for (let i = startIndex; i < startIndex + visibleCount + 1 && i < this.data.length; i++) {
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
      <ol>
        <li>Widget 组件和 CSS 的 <code>position: absolute</code> 在设计思想上有什么相似之处？如果你理解"相对父元素偏移"和"相对屏幕边缘锚定"，Widget 的 Top/Left/Right/Bottom 分别对应 CSS 的哪些属性组合？</li>
        <li>为什么虚拟滚动对于性能至关重要？如果有 1000 个排行榜条目，不虚拟化的代价是什么——从 DrawCall、内存、update 三个方面分析。</li>
        <li>游戏中如果有 5 个 UI 层（HUD 血条、漂浮伤害数字、暂停菜单、恭喜弹窗、加载遮罩），你如何管理它们的 Z 轴顺序？如果弹窗出现在暂停菜单下面怎么办？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
