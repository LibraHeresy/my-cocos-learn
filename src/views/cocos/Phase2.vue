<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="2" title="场景、节点、组件" duration="2-3 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解 <strong>Scene</strong> / <strong>Node</strong> / <strong>Component</strong> 三者的关系和各自职责</li>
        <li>用 <strong>Widget</strong> 和 <strong>Layout</strong> 组件搭建响应式 UI（不写一行定位代码）</li>
        <li>用 <strong>ScrollView</strong> 实现排行榜、设置面板等可滚动内容</li>
        <li>用 <strong><code>@property</code></strong> 暴露参数到编辑器面板，运行时实时调整</li>
        <li>创建 <strong>Prefab</strong>（预制体），理解它和 Vue 组件的异同</li>
        <li>在代码中动态创建和销毁节点</li>
        <li>掌握完整的<strong>生命周期</strong>：<code>onLoad → start → update → onDestroy</code></li>
      </ul>
    </ConceptBlock>

    <!-- ============ Scene ============ -->
    <ConceptBlock icon="🎬" title="Scene（场景）—— 类比 Vue 的 Page">
      <p>
        一个 Scene 就是一个<strong>独立的游戏界面</strong>。就像 Vue Router 的一个页面，每个 Scene
        有自己的节点树和资源。
      </p>

      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>Vue 对应</th>
            <th>Cocos 用法</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>场景文件</td>
            <td><code>.vue</code> 文件</td>
            <td><code>.scene</code> 文件（JSON 格式）</td>
          </tr>
          <tr>
            <td>场景切换</td>
            <td><code>router.push('/game')</code></td>
            <td><code>director.loadScene('GameScene')</code></td>
          </tr>
          <tr>
            <td>场景带参数</td>
            <td><code>router.push({ query })</code></td>
            <td>挂一个持久节点 / 全局变量</td>
          </tr>
        </tbody>
      </table>

      <h3>场景切换实战</h3>
      <pre><code>import { director } from 'cc'

// 跳转到游戏场景
director.loadScene('GameScene')

// 预加载场景（带 Loading 界面）
director.preloadScene('GameScene', () => {
  console.log('加载完成，可以切换了')
})</code></pre>

      <div class="tip-box">
        <strong>最佳实践：</strong>Cocos
        的场景切换默认会<strong>销毁当前场景的所有节点</strong>。想要跨场景保留数据（如玩家设置、分数），需要把节点标记为
        <code>game.addPersistRootNode(node)</code>，或者使用单例管理器。
      </div>
    </ConceptBlock>

    <!-- ============ Node ============ -->
    <ConceptBlock icon="🌲" title="Node（节点）—— 类比 DOM 元素">
      <p>
        Node 是场景树的基本单元。<strong>Node 本身没有视觉外观</strong
        >，它只是一个"容器"——有位置（x, y）、旋转（angle）、缩放（scale），但没有颜色、没有形状。
      </p>

      <h3>Node 的核心属性</h3>
      <pre><code>// 位置 —— 相对于父节点
this.node.setPosition(100, 200)
this.node.x = 100
this.node.y = 200

// 旋转 —— 逆时针为正，单位：角度（不是弧度）
this.node.angle = 45

// 缩放
this.node.setScale(1.5, 1.5)   // 等比
this.node.scaleX = 2            // 单轴

// 显隐
this.node.active = false        // 类比 v-if（节点从渲染树移除）
// 注意：和 opacity=0 不同，active=false 的节点不参与渲染和碰撞</code></pre>

      <h3>父子关系</h3>
      <p>
        和 DOM 树一样，Cocos 的节点也可以嵌套。子节点的 transform
        是<strong>相对于父节点</strong>的：
      </p>
      <pre><code>// 创建子节点
const child = new Node('Child')
this.node.addChild(child)
child.setPosition(10, 0)  // 相对于父节点偏移 10px

// 获取父节点
const parent = this.node.parent

// 从父节点中移除
this.node.removeFromParent()</code></pre>

      <div class="warn-box">
        <strong>关键区别：</strong>Vue 中一个组件只有一个根元素。Cocos
        中一个节点可以有<strong>任意多个子节点</strong>。这让你可以把复杂的角色拆成多个子节点——飞机主体
        + 引擎火焰 + 翅膀，每个子节点可以独立旋转/缩放/显隐。
      </div>
      <h3>锚点（Anchor Point）—— 类比 CSS transform-origin</h3>
      <p>
        锚点决定节点
        <strong>transform 的参考点</strong>。锚点在哪里，旋转就围着哪里转，缩放就向哪里缩放：
      </p>
      <pre><code>// Cocos 默认锚点 (0.5, 0.5) = 中心
// 类比 CSS: transform-origin: center center

// 锚点范围：(0, 0) = 左下角 到 (1, 1) = 右上角
this.node.anchorX = 0.5   // 水平中心
this.node.anchorY = 0     // 底部——旋转时围着底部转

// 常见锚点预设
(0.5, 0.5) → 中心（默认，适合对称物体：子弹、道具）
(0.5, 0)   → 底部中心（血条、进度条——从下往上增长）
(0, 1)     → 左上角（UI 面板——定位和 CSS 左上角一致）
(0, 0)     → 左下角</code></pre>

      <div class="warn-box">
        <strong>前端陷阱：</strong>CSS 的 <code>transform-origin</code> 默认是
        <code>center center</code>，和 Cocos 的锚点默认 (0.5, 0.5) 一致。但 CSS 的
        <code>position: absolute</code> 定位参考点通常是左上角——和 Cocos 的 (0, 1)
        对应。这个概念容易混淆，记不住时就在编辑器中修改锚点值，肉眼观察节点的变化。
      </div>

      <h3>UITransform —— 每个 2D 节点都有的尺寸组件</h3>
      <p>
        每个 2D 节点自动挂载 <code>UITransform</code> 组件——它定义节点的
        <strong>width / height / anchor</strong>。在属性检查器最顶部就能看到：
      </p>
      <pre><code>// 代码中访问 UITransform
const ui = this.node.getComponent(UITransform)
ui.width = 50       // 节点宽度（逻辑像素）
ui.height = 30      // 节点高度
ui.anchorX = 0.5   // 修改锚点

// Content Size 和 Scale 的区别
// UITransform.width = 内容尺寸（碰撞检测用这个，Sprite 不拉伸）
// node.scaleX = 显示缩放（Sprite 会被拉伸，碰撞区域不变）</code></pre>

      <div class="tip-box">
        <strong>记住：</strong>要设置节点的"碰撞体积"，改
        <code>UITransform.width/height</code>；要"放大/缩小视觉效果"，改
        <code>node.scale</code>。两者是独立的——一个影响物理体积，一个影响视觉大小。
      </div>
    </ConceptBlock>

    <!-- ============ Component ============ -->
    <ConceptBlock icon="🧩" title="Component（组件）—— 类比 Vue 组件，但可叠加">
      <p>
        这是 Cocos 和 Vue 组件化最大的区别。在 Vue 中，一个
        <code>.vue</code> 文件是自包含的（template + script + style）。在 Cocos 中：
      </p>

      <pre><code>// Vue：一个组件 = 一切
MyButton.vue  →  template（结构）+ script（逻辑）+ style（样式）

// Cocos：一个 Node = 多个 Component 的集合
Node "EnemyPlane"
  ├── Sprite          ← 负责渲染外观
  ├── BoxCollider2D   ← 负责碰撞检测
  ├── EnemyAI         ← 负责行为逻辑（你写的脚本）
  └── AudioSource     ← 负责音效</code></pre>

      <h3>创建和挂载组件</h3>
      <pre><code>// 方式一：编辑器中拖拽（最常用）
// 把 .ts 文件从资源管理器拖到节点的属性检查器上

// 方式二：代码中动态添加
const sprite = this.node.addComponent(Sprite)

// 方式三：获取已有组件
const collider = this.node.getComponent(BoxCollider2D)
const scripts = this.node.getComponents(Component)  // 获取所有组件</code></pre>
    </ConceptBlock>

    <!-- ============ @property ============ -->
    <ConceptBlock icon="🎛️" title="@property —— 连接编辑器和代码的桥梁">
      <p>
        这是 Cocos 的 <strong>杀手级特性</strong>。<code>@property</code>
        让你定义的变量直接出现在属性检查器中，可以<strong>可视化编辑 + 运行时实时修改</strong>。类比
        Vue 的 props，但功能更强——它支持运行时热更新。
      </p>

      <pre><code>import { Component, _decorator, Sprite, SpriteFrame, Node } from 'cc'
const { ccclass, property } = _decorator

@ccclass('Player')
export class Player extends Component {

  // ---- 基本类型：数字、字符串、布尔 ----
  @property
  speed: number = 300           // 属性面板出现一个数字输入框

  @property
  playerName: string = 'P1'     // 字符串输入框

  @property
  isAlive: boolean = true       // 复选框

  // ---- 节点/组件引用：拖拽赋值 ----
  @property({ type: Node })
  bulletPrefab: Node = null     // 属性面板出现一个可拖入节点的槽位

  @property({ type: SpriteFrame })
  icon: SpriteFrame = null      // 可拖入 SpriteFrame 资源

  // ---- 带提示和范围限制 ----
  @property({ tooltip: '移动速度（像素/秒）', range: [100, 1000, 10] })
  moveSpeed: number = 300       // 带滑块

  // ---- 下拉选择 ----
  @property({ type: Enum([
    'EASY', 'NORMAL', 'HARD'
  ]) })
  difficulty: string = 'NORMAL'

  update(dt: number) {
    const move = this.speed * dt
    this.node.x += move  // 在属性面板改 speed，立刻生效！
  }
}</code></pre>

      <div class="tip-box">
        <strong>运行时调试利器：</strong>游戏运行中，打开属性检查器，修改
        <code>speed</code>
        的值——游戏中的行为<strong>立刻改变</strong>。不需要重新编译，不需要刷新页面。这在调试手感（移速、子弹速度等）时极其高效。
      </div>
    </ConceptBlock>

    <!-- ============ Widget + Layout ============ -->
    <ConceptBlock icon="📐" title="Widget 与 Layout —— 响应式布局（CSS 直觉直接平移）">
      <p>
        前端工程师最熟悉的两个概念——<strong>position 定位</strong>和
        <strong>Flexbox 排列</strong>——在 Cocos 中有几乎一一对应的组件：
      </p>

      <h3>Widget 组件 —— 类比 CSS position + flex 对齐</h3>
      <p>
        Widget
        让节点<strong>自动对齐到父容器的边缘或居中</strong>，不需要写代码手动算坐标。给节点挂上
        Widget 组件后，勾选对应的对齐方向即可：
      </p>

      <table>
        <thead>
          <tr>
            <th>Widget 配置</th>
            <th>效果</th>
            <th>CSS 类比</th>
            <th>典型场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Top + Stretch（左右对齐）</td>
            <td>顶部贴边，宽度自适应</td>
            <td><code>position: fixed; top: 0; left: 0; right: 0</code></td>
            <td>顶部 HUD（分数栏）</td>
          </tr>
          <tr>
            <td>Bottom + Center</td>
            <td>底部居中</td>
            <td><code>position: fixed; bottom: 0; left: 50%; transform: translateX(-50%)</code></td>
            <td>底部按钮</td>
          </tr>
          <tr>
            <td>Top + Left</td>
            <td>左上角固定</td>
            <td><code>position: fixed; top: 0; left: 0</code></td>
            <td>生命值图标</td>
          </tr>
          <tr>
            <td>Center（水平+垂直）</td>
            <td>始终居中</td>
            <td><code>display: grid; place-items: center</code></td>
            <td>弹窗/对话框</td>
          </tr>
          <tr>
            <td>Safe Area</td>
            <td>避开刘海屏和底部横条</td>
            <td><code>env(safe-area-inset-top)</code></td>
            <td>全面屏手机适配</td>
          </tr>
        </tbody>
      </table>

      <pre><code>// Widget 也可以在代码中动态设置
const widget = this.node.addComponent(Widget)
widget.left = 20
widget.bottom = 20
widget.right = 20        // 底部通栏：左右各留 20px
widget.isAbsoluteBottom = true  // 绝对对齐底部</code></pre>

      <h3>Layout 组件 —— 类比 CSS Flexbox</h3>
      <p>
        Widget 管的是<strong>自己怎么对齐父容器</strong>，Layout
        管的是<strong>子节点怎么排列</strong>。挂上 Layout
        组件后，子节点自动水平/垂直排列，支持间距和内边距：
      </p>

      <table>
        <thead>
          <tr>
            <th>Layout 属性</th>
            <th>CSS 类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Type: HORIZONTAL / VERTICAL</td>
            <td><code>flex-direction: row / column</code></td>
          </tr>
          <tr>
            <td>Spacing X / Spacing Y</td>
            <td><code>gap: Npx</code></td>
          </tr>
          <tr>
            <td>Padding Left/Top/Right/Bottom</td>
            <td><code>padding</code></td>
          </tr>
          <tr>
            <td>Horizontal/Vertical Direction</td>
            <td><code>justify-content</code>（左到右/右到左/居中）</td>
          </tr>
          <tr>
            <td>Resize Mode: CONTAINER</td>
            <td>容器尺寸随子元素自动调整</td>
          </tr>
          <tr>
            <td>Resize Mode: CHILDREN</td>
            <td>子元素尺寸随容器自动调整</td>
          </tr>
        </tbody>
      </table>

      <pre><code>// 典型场景：分数数字自动并排
// ScorePanel 节点挂 Layout（Horizontal, Spacing=4）
// → 把数字 Sprite 作为子节点丢进去 → 自动从左到右排列好

// 道具栏自动竖排
// ItemPanel 节点挂 Layout（Vertical, Spacing=8）
// → 道具图标子节点自动从下到上排列</code></pre>

      <div class="warn-box">
        <strong>Widget vs Layout 的区别：</strong>Widget
        管<strong>自己</strong>（我贴父容器的哪条边），Layout
        管<strong>子节点</strong>（子节点在容器内怎么排列）。一个节点上可以同时挂 Widget 和
        Layout——先把自己钉在屏幕底部（Widget），再让子节点水平排列（Layout）。
      </div>
    </ConceptBlock>

    <!-- ============ Label ============ -->
    <ConceptBlock icon="🔤" title="Label（文字）—— 游戏中最基础的 UI 组件">
      <p>
        Label 负责在屏幕上显示文字——分数、生命值、标题、提示文本。它是<strong
          >使用频率最高的 UI 组件</strong
        >：
      </p>

      <h3>编辑器创建 Label</h3>
      <ol>
        <li>在层级管理器右键 → 创建 → 2D 对象 → <strong>Label</strong></li>
        <li>节点自动挂载 Label 和 UITransform 组件</li>
        <li>在属性检查器中设置 String（文字内容）、Font Size（字号）、Color（颜色）</li>
      </ol>

      <h3>核心属性</h3>
      <table>
        <thead>
          <tr>
            <th>属性</th>
            <th>说明</th>
            <th>常见值</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>string</code></td>
            <td>显示的文字</td>
            <td><code>'得分：999'</code></td>
          </tr>
          <tr>
            <td><code>fontSize</code></td>
            <td>字号（像素）</td>
            <td>24 / 32 / 48</td>
          </tr>
          <tr>
            <td><code>color</code></td>
            <td>文字颜色</td>
            <td><code>new Color(255,255,255)</code></td>
          </tr>
          <tr>
            <td><code>lineHeight</code></td>
            <td>行高</td>
            <td>通常 = fontSize × 1.2</td>
          </tr>
          <tr>
            <td><code>horizontalAlign</code></td>
            <td>水平对齐</td>
            <td>LEFT / CENTER / RIGHT</td>
          </tr>
          <tr>
            <td><code>overflow</code></td>
            <td>超出尺寸后的行为</td>
            <td>CLAMP（截断）/ SHRINK（缩小）/ RESIZE_HEIGHT（自动换行）</td>
          </tr>
        </tbody>
      </table>

      <h3>代码中操作 Label</h3>
      <pre><code>import { Label } from 'cc'

// 获取并修改 Label
const label = this.node.getComponent(Label)
label.string = `分数: ${score}`
label.color = new Color(255, 200, 0)   // 金色
label.fontSize = 36</code></pre>

      <div class="tip-box">
        <strong>像素游戏字体：</strong>Cocos 默认使用系统字体。要做像素风数字，需要在
        <code>assets/fonts/</code> 中导入位图字体（.fnt + .png），或者在美术课程中手绘数字后改用
        Sprite 显示。Phase 7 实战时用系统字体先跑起来，后面再替换。
      </div>
    </ConceptBlock>

    <!-- ============ Button ============ -->
    <ConceptBlock icon="🔘" title="Button（按钮）—— 用户交互的基础">
      <p>主菜单的"开始游戏"、结算页的"重新开始"、设置中的"静音"——全都是 Button 组件：</p>

      <h3>编辑器创建 Button</h3>
      <ol>
        <li>在层级管理器右键 → 创建 → UI → <strong>Button</strong></li>
        <li>这个节点有：Label（按钮文字）+ Sprite（按钮背景）+ Button（点击响应）</li>
        <li>在 Button 组件的 <strong>Click Events</strong> 区域添加回调</li>
      </ol>

      <h3>Button 的核心配置</h3>
      <table>
        <thead>
          <tr>
            <th>属性</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Transition</strong></td>
            <td>交互反馈类型：COLOR（变色）、SCALE（缩放）、SPRITE（换图）</td>
          </tr>
          <tr>
            <td><strong>Click Events</strong></td>
            <td>点击回调列表——点击后触发哪个节点的哪个脚本的哪个方法</td>
          </tr>
          <tr>
            <td><strong>Interactable</strong></td>
            <td>是否可交互——设为 false 表现为灰色且不可点击（类比 <code>:disabled</code>）</td>
          </tr>
        </tbody>
      </table>

      <h3>代码中绑定点击回调</h3>
      <pre><code>import { Button, Node } from 'cc'

@ccclass('MenuUI')
export class MenuUI extends Component {

  @property({ type: Button })
  startBtn: Button = null   // 属性面板拖入 Button 组件

  onLoad() {
    // 方式一：直接绑定（推荐）
    this.startBtn.node.on(Button.EventType.CLICK, this.onStartClick, this)
  }

  onStartClick() {
    console.log('开始游戏！')
    director.loadScene('GameScene')
  }

  onDestroy() {
    this.startBtn.node.off(Button.EventType.CLICK, this.onStartClick, this)
  }
}</code></pre>

      <div class="warn-box">
        <strong>注意：</strong>Button 的
        <code>Click Events</code> 可以在编辑器中配置（拖节点+选方法），也可以在代码中通过
        <code>node.on()</code>
        绑定。编辑器方式适合简单的"点按钮→加载场景"，代码方式适合需要传参或条件判断的场景。两者<strong>不要同时用</strong>——会触发两次。
      </div>
    </ConceptBlock>

    <!-- ============ ScrollView ============ -->
    <ConceptBlock icon="📜" title="ScrollView —— 类比 CSS overflow: scroll">
      <p>
        排行榜、设置面板、图鉴列表——这些超出屏幕的内容需要滚动。ScrollView 组件就是 Cocos
        的滚动容器：
      </p>

      <h3>创建步骤</h3>
      <ol>
        <li>层级管理器 → 创建 → UI → <strong>ScrollView</strong></li>
        <li>自动生成结构：ScrollView 节点 → content 节点（内容容器）</li>
        <li>把需要滚动的内容放在 <strong>content</strong> 节点下</li>
        <li>在 ScrollView 的组件上设置滚动方向和边界</li>
      </ol>

      <h3>核心属性</h3>
      <table>
        <thead>
          <tr>
            <th>属性</th>
            <th>说明</th>
            <th>CSS 类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Horizontal / Vertical</td>
            <td>是否允许水平 / 垂直滚动</td>
            <td><code>overflow-x / overflow-y</code></td>
          </tr>
          <tr>
            <td>Inertia</td>
            <td>惯性滚动（手指离开后继续滑动）</td>
            <td><code>-webkit-overflow-scrolling: touch</code></td>
          </tr>
          <tr>
            <td>Elastic</td>
            <td>橡皮筋回弹效果</td>
            <td><code>overscroll-behavior</code></td>
          </tr>
          <tr>
            <td>Bounce Duration</td>
            <td>回弹持续时间</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Scroll To (API)</td>
            <td>代码控制滚动到指定位置</td>
            <td><code>element.scrollTo()</code></td>
          </tr>
        </tbody>
      </table>

      <h3>代码操作</h3>
      <pre><code>import { ScrollView } from 'cc'

const scrollView = this.node.getComponent(ScrollView)
scrollView.scrollToTop()      // 滚到顶部
scrollView.scrollToBottom()   // 滚到底部
scrollView.scrollToPercentX(0.5)  // 滚到水平 50% 位置</code></pre>

      <h3>Mask 组件 —— 顺便理解裁剪</h3>
      <p>
        ScrollView 自动挂载了 <strong>Mask 组件</strong>——它让超出容器的内容被裁剪掉。类比 CSS
        <code>overflow: hidden</code> + <code>border-radius</code>。Mask
        也可以单独使用——圆形头像、进度条、不规则形状裁剪。
      </p>

      <div class="tip-box">
        <strong>性能注意：</strong>Mask 会触发额外的渲染步骤（Stencil Buffer）。一个场景中 Mask
        数量不要太多（建议 &lt; 5 个）。简单的裁剪场景优先考虑用代码控制 content 区域而不是堆 Mask。
        <br /><br />
        本节讲的是 ScrollView 的<strong>基础使用</strong>。更高级的 Grid Layout + ScrollView 背包、水平滚动商店、虚拟列表优化见 <strong>Phase 20（复杂 UI 与 ScrollView）</strong>。
      </div>
    </ConceptBlock>

    <!-- ============ 生命周期 ============ -->
    <ConceptBlock icon="🪢" title="组件生命周期完整解析">
      <p>Cocos Component 的生命周期和 Vue 高度相似，但多了两个游戏专用的钩子：</p>

      <table>
        <thead>
          <tr>
            <th>钩子</th>
            <th>调用时机</th>
            <th>Vue 对应</th>
            <th>典型用途</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>onLoad()</code></td>
            <td>组件首次激活时，只执行一次</td>
            <td><code>setup()</code></td>
            <td>获取组件引用、注册事件监听</td>
          </tr>
          <tr>
            <td><code>onEnable()</code></td>
            <td>组件/节点每次变为 active=true 时</td>
            <td>—</td>
            <td>重新激活时的初始化</td>
          </tr>
          <tr>
            <td><code>start()</code></td>
            <td>第一次 update 之前</td>
            <td><code>onMounted()</code></td>
            <td>需要等所有 onLoad 完成的操作</td>
          </tr>
          <tr>
            <td><code>update(dt)</code></td>
            <td><strong>每帧</strong></td>
            <td>—</td>
            <td>移动、碰撞检测、持续逻辑</td>
          </tr>
          <tr>
            <td><code>lateUpdate()</code></td>
            <td>所有 update 之后</td>
            <td>—</td>
            <td>摄像机跟随、动画后处理</td>
          </tr>
          <tr>
            <td><code>onDisable()</code></td>
            <td>组件/节点变为 active=false 时</td>
            <td>—</td>
            <td>暂停逻辑</td>
          </tr>
          <tr>
            <td><code>onDestroy()</code></td>
            <td>节点销毁时</td>
            <td><code>onUnmounted()</code></td>
            <td>解绑事件、清理资源</td>
          </tr>
        </tbody>
      </table>

      <h3>一个完整的生命周期示例</h3>
      <pre><code>import { Component, _decorator, systemEvent, EventKeyboard, KeyCode } from 'cc'
const { ccclass } = _decorator

@ccclass('Player')
export class Player extends Component {

  onLoad() {
    console.log('1. onLoad: 初始化 —— 注册事件')
    // 类比 Vue setup(): 做初始化，注册事件
    systemEvent.on(EventKeyboard.KEY_DOWN, this.onKeyDown, this)
    // ⚠️ 此时其他组件的 onLoad 可能还没执行完
  }

  start() {
    console.log('3. start: 所有 onLoad 都完成了')
    // 类比 Vue onMounted(): 可以安全访问其他组件了
  }

  update(dt: number) {
    // 4. 每帧执行！这是 Cocos 独有的
    // dt 保证稳定，通常不需要判空
  }

  onDestroy() {
    console.log('5. onDestroy: 清理资源')
    // 类比 Vue onUnmounted(): 解绑事件，防止内存泄漏
    systemEvent.off(EventKeyboard.KEY_DOWN, this.onKeyDown, this)
  }

  private onKeyDown() { /* ... */ }
}</code></pre>

      <div class="warn-box">
        <strong>最容易犯的错：</strong>在 <code>update</code> 中创建节点或加载资源。update 每秒执行
        60 次，任何"只做一次"的操作都不该放在里面。创建/加载放在 onLoad 或 start 中。
      </div>
    </ConceptBlock>

    <!-- ============ Prefab ============ -->
    <ConceptBlock icon="📦" title="Prefab（预制体）—— 类比 Vue 组件模板">
      <p>
        Prefab 是 Cocos
        中最重要的资源类型之一。它就像一个"节点模板"——把一个配置好的节点及其子节点保存为文件，然后<strong>反复实例化</strong>。
      </p>

      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>Vue 类比</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>创建 Prefab</td>
            <td>定义一个 <code>.vue</code> 组件</td>
            <td>把场景中的节点拖到资源管理器</td>
          </tr>
          <tr>
            <td>实例化 Prefab</td>
            <td><code>&lt;MyComponent /&gt;</code></td>
            <td><code>instantiate(prefab)</code></td>
          </tr>
          <tr>
            <td>Prefab 属性覆盖</td>
            <td>传入 props</td>
            <td>实例化后修改节点属性</td>
          </tr>
          <tr>
            <td>修改 Prefab 源文件</td>
            <td>修改 <code>.vue</code> 源文件</td>
            <td>所有实例自动更新</td>
          </tr>
        </tbody>
      </table>

      <h3>创建和使用 Prefab</h3>
      <pre><code>import { Component, _decorator, Node, Prefab, instantiate } from 'cc'
const { ccclass, property } = _decorator

@ccclass('EnemySpawner')
export class EnemySpawner extends Component {

  @property({ type: Prefab })
  enemyPrefab: Prefab = null  // 属性面板拖入预制体

  spawn() {
    // 实例化（类比 Vue 的 <Enemy />）
    const enemy = instantiate(this.enemyPrefab)
    enemy.setPosition(Math.random() * 400 - 200, 300)
    this.node.addChild(enemy)  // 必须 addChild 才会出现在场景中
  }

  update(dt: number) {
    // 每 2 秒生成一个敌人
    this._timer += dt
    if (this._timer >= 2) {
      this._timer = 0
      this.spawn()
    }
  }

  private _timer = 0
}</code></pre>

      <div class="tip-box">
        <strong>实践建议：</strong>Cocos 项目中和 Vue 一样，Prefab 应该放在
        <code>assets/prefabs/</code> 目录下统一管理。子弹、敌机、道具、UI 弹窗——这些都应该是
        Prefab。
      </div>
    </ConceptBlock>

    <!-- ============ 动手练习 ============ -->
    <ConceptBlock icon="🔨" title="动手练习：敌机生成器">
      <p>用学到的知识做一个"敌机生成器"——每 2 秒从屏幕上方随机位置掉落一个敌机方块。</p>

      <h3>步骤</h3>
      <ol>
        <li>在场景中创建一个 Sprite 节点，调整颜色/大小，作为敌机模板</li>
        <li>给敌机节点挂一个 Enemy 脚本，让它每帧向下移动，超出屏幕自动销毁</li>
        <li>把敌机节点从层级管理器<strong>拖到资源管理器</strong>，创建 Prefab</li>
        <li>删除场景中的敌机节点（Prefab 已保存，节点不需要了）</li>
        <li>创建一个空节点叫 Spawner，挂 EnemySpawner 脚本</li>
        <li>把刚创建的 enemyPrefab 拖到 Spawner 的 Enemy Prefab 属性槽中</li>
        <li>运行！你应该看到敌人不断从上方掉落</li>
      </ol>

      <h3>Enemy 脚本参考</h3>
      <pre><code>import { Component, _decorator, view } from 'cc'
const { ccclass } = _decorator

@ccclass('Enemy')
export class Enemy extends Component {

  @property speed: number = 150

  update(dt: number) {
    this.node.y -= this.speed * dt  // 向下移动

    // 超出屏幕底部就销毁
    const halfH = view.getVisibleSize().height / 2
    if (this.node.y < -halfH - 50) {
      this.node.destroy()  // 类比 Vue 的组件卸载
    }
  }
}</code></pre>

      <div class="tip-box">
        <strong>完成标准：</strong>敌机持续从顶部掉落，超出屏幕后自动销毁。在属性面板中修改
        <code>speed</code> 和生成间隔，效果实时变化。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>Scene、Node、Component 三者是什么关系？用自己的话给同事解释一遍。</li>
        <li>锚点（Anchor Point）是干什么的？修改锚点会影响什么？（旋转中心、位置参考点）</li>
        <li>UITransform 的 width/height 和 node.scale 的区别是什么？</li>
        <li>Widget 和 Layout 的区别是什么？各自类比 CSS 的什么概念？</li>
        <li>Widget 的 Safe Area 是干什么的？前端对应什么 CSS 属性？</li>
        <li>Label 组件怎么在代码中修改文字内容和颜色？</li>
        <li>Button 组件如何在代码中绑定点击回调？编辑器配置和代码绑定的区别是什么？</li>
        <li>ScrollView 怎么创建？content 节点的作用是什么？</li>
        <li><code>@property</code> 有哪几种常见用法？怎么让一个属性在面板上显示为滑块？</li>
        <li>
          <code>onLoad</code> 和 <code>start</code> 的区别是什么？什么操作该放在 start 而不是
          onLoad？
        </li>
        <li>创建 Prefab 需要几步？实例化 Prefab 后，还需要做什么才能让节点出现在场景中？</li>
        <li><code>node.active = false</code> 和 <code>node.destroy()</code> 的区别是什么？</li>
        <li>为什么不可以在 <code>update</code> 中做节点创建/资源加载？</li>
      </ul>
    </ConceptBlock>
  </PhaseLayout>
</template>
