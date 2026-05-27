<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="20" title="复杂 UI 与 ScrollView" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>用 <strong>Layout 组件</strong>（Grid、Horizontal、Vertical）实现自动排列——告别手动 setPosition</li>
        <li>搭建<strong>滚动列表（ScrollView）</strong>——背包、商店、设置页面中任意数量的内容</li>
        <li>用<strong>Grid Layout + ScrollView</strong> 组合打造《我的世界》风格的背包界面</li>
        <li>实现<strong>动态增删列表项</strong>——获得道具时自动新增格子、使用道具时自动移除</li>
        <li>用<strong>对象池（Object Pool）</strong>优化长列表滚动性能——100 个道具也能跑 60fps</li>
        <li>写出"前端感"十足的 UI 代码——Layout 就是 Flexbox，ScrollView 就是 overflow:scroll</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="Layout 组件——游戏 UI 的 Flexbox">
      <p>
        如果你写过前端 CSS，你会觉得 Cocos 的 Layout 组件异常亲切——它本质上就是简化版的 <strong>Flexbox + Grid</strong>。不用再手动计算每个子节点的 x、y 位置，Layout 组件会自动帮你排列。
      </p>

      <h3>三种布局模式</h3>
      <table>
        <thead>
          <tr>
            <th>Layout 类型</th>
            <th>排列方式</th>
            <th>CSS 等价</th>
            <th>典型场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Horizontal</strong></td>
            <td>水平排列子节点</td>
            <td><code>display: flex; flex-direction: row</code></td>
            <td>底部技能栏、顶部按钮栏</td>
          </tr>
          <tr>
            <td><strong>Vertical</strong></td>
            <td>垂直排列子节点</td>
            <td><code>display: flex; flex-direction: column</code></td>
            <td>任务列表、设置菜单</td>
          </tr>
          <tr>
            <td><strong>Grid</strong></td>
            <td>网格排列</td>
            <td><code>display: grid</code></td>
            <td>背包格子、商店货架、角色选择</td>
          </tr>
        </tbody>
      </table>

      <h3>Layout 属性对照表</h3>
      <table>
        <thead>
          <tr>
            <th>Layout 属性</th>
            <th>作用</th>
            <th>CSS 对应属性</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>spacingX</code> / <code>spacingY</code></td>
            <td>子节点之间的间距</td>
            <td><code>gap</code> / <code>column-gap</code> / <code>row-gap</code></td>
          </tr>
          <tr>
            <td><code>paddingLeft/Right/Top/Bottom</code></td>
            <td>容器内边距</td>
            <td><code>padding</code></td>
          </tr>
          <tr>
            <td><code>horizontalDirection</code></td>
            <td>水平排列方向（左到右 / 右到左）</td>
            <td><code>flex-direction: row / row-reverse</code></td>
          </tr>
          <tr>
            <td><code>constraint</code></td>
            <td>固定行数/列数（仅 Grid）</td>
            <td><code>grid-template-columns</code></td>
          </tr>
          <tr>
            <td><code>resizeMode</code></td>
            <td>容器是否随子节点数量自动调整大小</td>
            <td><code>height: auto</code> / <code>width: auto</code></td>
          </tr>
        </tbody>
      </table>

      <pre><code>// 动态创建 Layout 并添加子节点
import { _decorator, Component, Node, Layout, Sprite, Color, UITransform } from 'cc'

export class SkillBar extends Component {
  @property(Node)
  container: Node = null  // 在编辑器中拖入容器节点

  onLoad() {
    // 确保容器上有 Horizontal Layout
    let layout = this.container.getComponent(Layout)
    if (!layout) {
      layout = this.container.addComponent(Layout)
    }
    layout.type = Layout.Type.HORIZONTAL
    layout.spacingX = 10
    layout.resizeMode = Layout.ResizeMode.CONTAINER  // 容器随内容扩宽

    // 动态添加技能图标
    const skillIcons = ['fire', 'ice', 'lightning', 'heal']
    skillIcons.forEach((skillName, index) => {
      const iconNode = this._createSkillIcon(skillName, index)
      this.container.addChild(iconNode)
    })

    // Layout 会自动重排——你不需要 setPosition
  }

  private _createSkillIcon(name: string, index: number): Node {
    const node = new Node(`Skill_${name}`)
    const transform = node.addComponent(UITransform)
    transform.setContentSize(64, 64)

    // 给图标加点颜色区分（实际项目中会挂 Sprite 组件用真实图片）
    const sprite = node.addComponent(Sprite)
    const colors = [Color.RED, Color.BLUE, Color.YELLOW, Color.GREEN]
    sprite.color = colors[index]

    return node
  }
}</code></pre>

      <div class="tip-box">
        <strong>黄金法则：</strong>任何需要"自动排列"子节点的容器，都请使用 Layout 组件。<strong>永远不要</strong>在代码里手动 <code>setPosition(i * 80 + offsetX, 0)</code> 来排列元素——你在前端不会用 JS 去给每个 div 手动设置 left/top，为什么在游戏 UI 里要这么做？Layout 组件就是做这件事的。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📜" title="ScrollView——滚动的世界">
      <p>
        ScrollView 是游戏中最常用的 UI 组件之一。它的核心结构是一组<strong>节点嵌套关系</strong>，理解这个结构是实现一切滚动功能的前提。
      </p>

      <h3>ScrollView 的节点结构</h3>
      <table>
        <thead>
          <tr>
            <th>节点</th>
            <th>职责</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>ScrollView 根节点</strong></td>
            <td>包含 ScrollView 组件、响应触摸事件、管理滚动逻辑</td>
            <td>带有 <code>overflow: scroll</code> 的容器 div</td>
          </tr>
          <tr>
            <td><strong>Viewport（视口）</strong></td>
            <td>滚动内容的<strong>可见区域</strong>，超出部分被裁剪（通过 Mask 组件）</td>
            <td>容器的 <code>width/height</code> 限定可视范围</td>
          </tr>
          <tr>
            <td><strong>Content（内容）</strong></td>
            <td>挂载 Layout 组件，包含所有实际内容。它的<strong>高度/宽度可以超过 Viewport</strong></td>
            <td>一个高度很大的子 div——被外层裁剪</td>
          </tr>
        </tbody>
      </table>

      <h3>关键属性</h3>
      <pre><code>import { ScrollView } from 'cc'

// 获取 ScrollView 组件
const scrollView = this.node.getComponent(ScrollView)

// 滚动方向
scrollView.horizontal = false  // 垂直列表（如背包）
scrollView.vertical = true

scrollView.horizontal = true   // 水平列表（如技能轮盘）
scrollView.vertical = false

// 惯性——松手后是否继续滑
scrollView.inertia = true
scrollView.brake = 0.75        // 减速系数（0-1，越大减速越快）

// 弹性效果——滚到边界后是否"弹一下"
scrollView.elastic = true
scrollView.bounceDuration = 0.3  // 弹性动画时长（秒）

// 滚动条
scrollView.horizontalScrollBar = scrollBarNode // 拖入滚动条节点
scrollView.verticalScrollBar = scrollBarNode

// 事件回调
scrollView.node.on('scrolling', () => {
  // 滚动中——持续触发，可以做视差效果、懒加载
})
scrollView.node.on('scroll-ended', () => {
  // 滚动结束——可以做"吸附到最近项"（snap）
})
scrollView.node.on('scroll-to-top', () => {
  // 滚动到顶部时触发
})</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🎒" title="实战：背包 Grid + ScrollView">
      <p>
        背包界面是 Grid Layout + ScrollView 的经典组合。每个物品占一个格子，按照固定列数排列，超出可视范围后可以上下滚动。
      </p>

      <h3>搭建步骤</h3>
      <ol>
        <li>创建 ScrollView 根节点 → 挂载 ScrollView 组件 + Mask 组件</li>
        <li>创建 Viewport 子节点 → 设置好大小（如 400x300 的可视区域）</li>
        <li>创建 Content 子节点（在 Viewport 下）→ 挂载 <strong>Grid Layout</strong> 组件</li>
        <li>设置 Grid Layout：列数固定（如 5 列），spacing 适当，<strong>resizeMode = CONTAINER</strong>（内容越多，Content 自动变高）</li>
        <li>创建 Item Prefab（单个物品格子的预制体）→ 挂载适当的 UI 组件</li>
      </ol>

      <pre><code>// InventoryUI.ts —— 背包界面核心逻辑
import { _decorator, Component, Node, ScrollView, Layout, Prefab, instantiate, UITransform } from 'cc'

interface InventoryItem {
  id: string
  name: string
  count: number
  icon: string   // 资源路径
}

export class InventoryUI extends Component {
  @property(Prefab)
  itemPrefab: Prefab = null

  @property(Node)
  contentNode: Node = null    // ScrollView 的 Content 节点

  @property(ScrollView)
  scrollView: ScrollView = null

  private _items: Map&lt;string, Node&gt; = new Map()

  /** 添加物品到背包 */
  addItem(itemData: InventoryItem) {
    if (this._items.has(itemData.id)) {
      // 已有该物品——更新数量
      this._updateItemCount(itemData.id, itemData.count)
      return
    }

    const itemNode = instantiate(this.itemPrefab)
    itemNode.name = `Item_${itemData.id}`

    // 设置 UI 显示
    // itemNode.getChildByName('NameLabel').getComponent(Label).string = itemData.name
    // itemNode.getChildByName('CountLabel').getComponent(Label).string = `x${itemData.count}`

    // 挂到 Content 下——Grid Layout 会自动排列
    this.contentNode.addChild(itemNode)
    this._items.set(itemData.id, itemNode)
  }

  /** 移除物品 */
  removeItem(itemId: string) {
    const node = this._items.get(itemId)
    if (node) {
      node.destroy()
      this._items.delete(itemId)
    }
  }

  /** 滚动到指定物品 */
  scrollToItem(itemId: string) {
    const node = this._items.get(itemId)
    if (!node) return

    // 获取 Content 的 Layout 组件来计算准确位置
    const layout = this.contentNode.getComponent(Layout)
    layout.updateLayout()  // 确保 Layout 数据是最新的

    // 计算目标位置
    const contentHeight = this.contentNode.getComponent(UITransform).height
    const targetY = node.position.y

    // 归一化滚动位置 [0, 1]
    const normalizedPosition = Math.abs(targetY) / (contentHeight - this.scrollView.node.getComponent(UITransform).height)

    // 滚动到目标位置
    this.scrollView.scrollToPercentVertical(normalizedPosition, 0.3, true)
  }

  private _updateItemCount(itemId: string, newCount: number) {
    const node = this._items.get(itemId)
    if (node) {
      // node.getChildByName('CountLabel').getComponent(Label).string = `x${newCount}`
    }
  }
}</code></pre>

      <div class="tip-box">
        <strong>UI 节点结构建议：</strong>Item 预制体的结构应该是：<code>Item (Node)</code> → <code>Background (Sprite)</code> + <code>Icon (Sprite)</code> + <code>CountLabel (Label)</code> + <code>Border (Sprite)</code>。其中 Background 和 Border 用于显示选中状态（高亮边框），选中时激活 Border 节点即可。这和前端中 <code>Card</code> 组件的结构几乎一模一样。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🏪" title="实战：商店页面——水平滚动货架">
      <p>
        商店页面通常采用"横向滚动"展示商品——一排商品卡片可以左右滑动浏览，类似前端中常见的<strong>水平滚动画廊</strong>（Image Carousel + Horizontal Scroll）。
      </p>

      <pre><code>// ShopUI.ts —— 商店界面
import { _decorator, Component, Node, ScrollView, Layout, Prefab, instantiate } from 'cc'

interface ShopItem {
  id: string
  name: string
  price: number
  currency: 'gold' | 'diamond'
  icon: string
}

export class ShopUI extends Component {
  @property(Prefab)
  shopItemPrefab: Prefab = null

  @property(Node)
  contentNode: Node = null      // 已挂载 Horizontal Layout

  onLoad() {
    // 确保 Horizontal Layout 配置正确
    const layout = this.contentNode.getComponent(Layout)
    layout.type = Layout.Type.HORIZONTAL
    layout.spacingX = 16
    layout.resizeMode = Layout.ResizeMode.CONTAINER  // 内容自动拓宽
  }

  /** 加载商店商品列表 */
  loadShopItems(items: ShopItem[]) {
    // 清空旧数据
    this.contentNode.removeAllChildren()

    items.forEach(item => {
      const itemNode = instantiate(this.shopItemPrefab)
      itemNode.name = `ShopItem_${item.id}`

      // 设置商品信息（实际项目通过子节点和组件设置）
      // itemNode.getChildByName('NameLabel').getComponent(Label).string = item.name
      // itemNode.getChildByName('PriceLabel').getComponent(Label).string = `${item.price}`

      this.contentNode.addChild(itemNode)
    })
  }
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🏊" title="对象池优化——ScrollView 性能进阶">
      <p>
        当背包/商店可能有数百个物品时，一次性创建数百个节点会严重影响性能——特别是滚动时每帧都在渲染所有节点。解决方案是<strong>对象池（Object Pool）</strong>——只创建<strong>可见区域</strong>内的节点，滚出视野的节点回收复用。
      </p>

      <h3>对象池的核心思想</h3>
      <p>
        这就像前端虚拟列表（Virtual Scroll / react-window）的原理——渲染一个 1000 行的表格，绝不是创建 1000 个 DOM 元素。你只渲染可见的那 10-20 行，滚出视野的 DOM 复用给新进入视野的行。
      </p>

      <pre><code>// ObjectPool.ts —— 通用对象池
export class ObjectPool&lt;T extends Node&gt; {
  private _pool: T[] = []
  private _prefab: Prefab

  constructor(prefab: Prefab, initialSize: number = 10) {
    this._prefab = prefab
    // 预热——预先创建一批对象
    for (let i = 0; i < initialSize; i++) {
      const obj = instantiate(prefab) as T
      obj.active = false  // 放入池中时设为非激活
      this._pool.push(obj)
    }
  }

  /** 从池中获取一个对象 */
  get(): T {
    let obj = this._pool.find(o => !o.active)
    if (!obj) {
      // 池子空了——创建新的
      obj = instantiate(this._prefab) as T
      this._pool.push(obj)
    }
    obj.active = true
    return obj
  }

  /** 回收对象 */
  put(obj: T) {
    obj.active = false
    // 不销毁，留着下次复用
  }

  /** 清空池 */
  clear() {
    this._pool.forEach(obj => obj.destroy())
    this._pool = []
  }
}</code></pre>

      <pre><code>// VirtualInventory.ts —— 虚拟滚动背包（简化版）
// 核心思路：只显示 Content 可见范围内的 item，其余回收
export class VirtualInventory {
  private _pool: ObjectPool&lt;Node&gt;
  private _visibleItems: Node[] = []
  private _allData: InventoryItem[] = []

  /** 滚动时调用——根据 scrollOffset 决定显示哪些 item */
  onScroll(contentTopY: number) {
    const visibleStartIndex = Math.floor(contentTopY / ITEM_HEIGHT)
    const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT) + 2 // +2 为缓冲

    // 回收所有当前显示的 item
    this._visibleItems.forEach(node => this._pool.put(node))
    this._visibleItems = []

    // 显示新的可见 item
    for (let i = visibleStartIndex; i < visibleStartIndex + visibleCount; i++) {
      if (i >= this._allData.length) break

      const node = this._pool.get()
      node.position.y = -i * ITEM_HEIGHT
      // 设置 item 的显示内容：this._setItemData(node, this._allData[i])
      this._visibleItems.push(node)
    }
  }
}</code></pre>

      <div class="warn-box">
        <strong>何时需要虚拟列表：</strong>如果你的列表项少于 <strong>50 个</strong>，直接创建全部节点通常没问题——Cocos 的 UI 渲染对几十个简单节点毫无压力。但超过 100 个 item、或者每个 item 很复杂（多层嵌套、多个 Sprite），一定要用对象池 + 虚拟滚动。判断标准：在目标最低端机（如 benchmarkLevel < 10）上测试——如果 ScrollView 滚动时明显卡顿，就该上优化了。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: Grid Layout 的 Content 高度不随 item 数量自动变化？</h3>
      <p>
        检查 Layout 组件的 <code>resizeMode</code>。设为 <code>CONTAINER</code> 时，Content 节点会根据<strong>子节点数量</strong>自动调整大小。设为 <code>NONE</code> 时，大小固定——超出部分不可见也无法滚动。这和 CSS 中 <code>height: auto</code> vs <code>height: 300px</code> 的区别是一样的。
      </p>

      <h3>Q2: ScrollView 滚动时 item 位置不对（重叠/偏移）？</h3>
      <p>
        通常是因为 Content 的<strong>锚点（Anchor）</strong>设置问题。ScrollView 的 Content 锚点一般设为 <strong>(0.5, 1)</strong>——即中上位置。如果锚点设在中心，当 Content 高度增加时，它会以<strong>中心为基准</strong>扩展，导致顶部 item 位置偏移。这和 CSS 中 <code>transform-origin</code> 影响缩放行为的原理类似。
      </p>

      <h3>Q3: Layout 组件的子节点不按预期排列？</h3>
      <p>
        Layout 依赖子节点的 <code>UITransform</code> 组件获取大小信息。如果子节点没有 UITransform，Layout 无法计算间距。另外，Layout 需要<strong>手动触发更新</strong>——当你通过代码添加子节点后，需要调用 <code>layout.updateLayout()</code> 来强制刷新布局。这类似于前端中修改 DOM 后需要手动触发 <code>getBoundingClientRect()</code> 重新计算。
      </p>

      <h3>Q4: ScrollView 的惯性滚动太"滑"或太"涩"？</h3>
      <p>
        调整两个属性：(1) <code>inertia</code>——是否启用惯性（松手后继续滑）；(2) <code>brake</code>——减速系数，范围 0-1。brake 越接近 0，松手后滑得越远（像在冰面上滑动）；brake 越接近 1，松手后几乎立刻停止。默认值 0.75 适合大多数场景。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>Cocos Layout 组件有哪三种类型？分别对应什么 CSS 布局？</li>
        <li>Grid Layout 的 <code>constraint</code> 属性控制什么？和 CSS Grid 的 <code>grid-template-columns</code> 有什么关系？</li>
        <li>ScrollView 的三个核心节点（根节点、Viewport、Content）各承担什么职责？</li>
        <li>如何让 Content 的高度随着 item 数量自动增长？<code>resizeMode</code> 应该设为什么？</li>
        <li>如何实现 ScrollView 滚动到指定 item？<code>scrollToPercentVertical</code> 的参数怎么计算？</li>
        <li>ScrollView 的 <code>inertia</code> 和 <code>brake</code> 分别控制什么？如何实现"冰面滑动"效果？</li>
        <li>对象池（Object Pool）的设计模式是什么？为什么比反复 instantiate/destroy 更好？</li>
        <li>虚拟滚动（Virtual Scroll）的核心原理是什么？什么时候需要用？</li>
        <li>Content 的锚点（Anchor）为什么会影响滚动表现？应该设为什么值？</li>
        <li>通过代码动态添加子节点后，为什么需要调用 <code>layout.updateLayout()</code>？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
