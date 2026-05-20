<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="1" title="Cocos 世界观" duration="1-2 天">
    <!-- ============ 本节目标 ============ -->
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>独立安装 Cocos Creator 并创建第一个项目</li>
        <li>认识编辑器六大面板，知道每个面板的作用</li>
        <li>理解"帧驱动"的运行方式，能写出第一个 <code>update(dt)</code></li>
        <li>创建一个在屏幕内来回弹跳的小球</li>
      </ul>
    </ConceptBlock>

    <!-- ============ 前置准备 ============ -->
    <ConceptBlock icon="🔧" title="前置准备：安装与第一个项目">
      <h3>1. 下载 Cocos Dashboard</h3>
      <p>
        去 <strong>Cocos 官网</strong> 下载 Cocos Dashboard（仪表盘），这是 Cocos
        的项目管理工具。安装完成后打开它。
      </p>

      <h3>2. 安装编辑器版本</h3>
      <p>
        在 Dashboard 中点击"编辑器"标签 → 选择一个 Cocos Creator 版本安装。推荐安装
        <strong>3.8.x</strong>（最新的 3.x LTS 版本）。
      </p>

      <h3>3. 创建项目</h3>
      <p>
        点击"项目"标签 → "新建项目" → 选择 <strong>Empty（空白）</strong> 模板 → 填写项目名 →
        选择存储路径 → 创建。
      </p>

      <div class="warn-box">
        <strong>注意：</strong>路径不要有中文或空格。Cocos 项目和前端项目一样，英文路径最安全。
      </div>

      <h3>4. 项目设置：设计分辨率</h3>
      <p>
        项目创建好后，第一件事是<strong>设定游戏画面的尺寸</strong>。这和前端中设置
        <code>viewport</code> 或设计稿宽度是同一个道理：
      </p>
      <ol>
        <li>顶部菜单 → <strong>Project → Project Settings</strong></li>
        <li>左侧选择 <strong>Macro Configuration</strong>（宏配置）</li>
        <li>
          找到 <code>Design Resolution</code>：设置宽高。飞机大战建议
          <strong>480 × 800</strong>（竖屏手机比例）
        </li>
        <li><strong>Fit Height</strong>：勾选后画面始终撑满屏幕高度（推荐竖屏游戏勾选）</li>
        <li><strong>Fit Width</strong>：勾选后画面始终撑满屏幕宽度（横屏游戏常用）</li>
      </ol>

      <table>
        <thead>
          <tr>
            <th>设置</th>
            <th>作用</th>
            <th>前端类比</th>
            <th>建议</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Design Resolution</code></td>
            <td>游戏的设计参考尺寸——所有坐标和素材都以这个尺寸为基准</td>
            <td>设计稿宽度（如 375px iPhone）</td>
            <td>480×800</td>
          </tr>
          <tr>
            <td><code>Fit Height</code></td>
            <td>高度优先——不同宽度的设备自动加黑边或裁切宽度</td>
            <td><code>height: 100vh; width: auto</code></td>
            <td>勾选（竖屏游戏）</td>
          </tr>
          <tr>
            <td><code>Fit Width</code></td>
            <td>宽度优先——不同高度的设备自动加黑边或裁切高度</td>
            <td><code>width: 100vw; height: auto</code></td>
            <td>不勾选（竖屏游戏）</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>前置习惯平移：</strong>这和你在 Vue 项目中设定设计稿宽度（375 / 750）完全一样。Cocos
        用这个分辨率作为所有坐标和素材的基准，然后根据实际屏幕<strong>等比例缩放</strong>。你只需要关心
        480×800 这个坐标系。
      </div>

      <h3>5. 认识编辑器六大面板</h3>
      <p>项目打开后你会看到以下面板，<strong>花 10 分钟逐个摸一遍</strong>：</p>

      <table>
        <thead>
          <tr>
            <th>面板</th>
            <th>位置</th>
            <th>作用</th>
            <th>类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>场景编辑器</strong></td>
            <td>中央</td>
            <td>可视化编辑场景，拖拽节点</td>
            <td>设计器 / 画布</td>
          </tr>
          <tr>
            <td><strong>层级管理器</strong></td>
            <td>左侧</td>
            <td>场景节点树，父子关系</td>
            <td>Elements 面板</td>
          </tr>
          <tr>
            <td><strong>资源管理器</strong></td>
            <td>左下</td>
            <td>项目文件：脚本、图片、场景</td>
            <td>VS Code 文件树</td>
          </tr>
          <tr>
            <td><strong>属性检查器</strong></td>
            <td>右侧</td>
            <td>选中节点的属性、挂载的组件</td>
            <td>Vue DevTools</td>
          </tr>
          <tr>
            <td><strong>控制台</strong></td>
            <td>底部</td>
            <td>log / error / warn 输出</td>
            <td>Chrome Console</td>
          </tr>
          <tr>
            <td><strong>动画编辑器</strong></td>
            <td>底部Tab</td>
            <td>制作帧动画和曲线动画</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <!-- ============ 核心概念 ============ -->
    <ConceptBlock icon="🔄" title="核心概念一：帧驱动 vs 事件驱动">
      <p>这是从 Vue 到 Cocos <strong>最重要的认知转变</strong>，值得花 20 分钟真正理解。</p>

      <h3>你熟悉的 Vue 是"事件驱动"</h3>
      <p>代码的执行由<strong>用户交互</strong>触发。用户不点按钮，相关代码就永远不执行：</p>
      <pre><code>// Vue: 代码被动等待交互
&lt;button @click="fire"&gt;发射子弹&lt;/button&gt;

const fire = () => {
  // 这行代码只有点击时才执行
  // 不点击 = 不执行 = 子弹不出现
  bullets.push(createBullet())
}</code></pre>

      <h3>Cocos 是"帧驱动"</h3>
      <p>
        引擎以每秒 60 次的频率<strong>主动调用</strong>
        <code>update(dt)</code>。你的代码被"推着跑"：
      </p>
      <pre><code>// Cocos: 代码被引擎每秒执行 60 次
update(dt: number) {
  // 你什么都不做，这行也会每秒执行 60 次
  // dt = 距离上一帧的时间（秒），60fps 下约 0.016
  this.node.y += this.speed * dt
}</code></pre>

      <div class="tip-box">
        <strong>心态转变：</strong>在 Vue 中你思考"什么时候执行这段代码"；在 Cocos
        中你思考"这段代码每帧执行时应该做什么"。游戏世界是<strong>持续的模拟循环</strong>，不是等待事件的离散快照。
      </div>

      <h3>一个实验来感受帧驱动</h3>
      <p>在 Cocos 中创建一个空节点，挂上这个脚本，然后运行：</p>
      <pre><code>import { Component, _decorator } from 'cc'
const { ccclass } = _decorator

@ccclass('FrameDemo')
export class FrameDemo extends Component {
  private _elapsed = 0

  update(dt: number) {
    this._elapsed += dt
    // 每秒打印一次
    if (Math.floor(this._elapsed) !== Math.floor(this._elapsed - dt)) {
      console.log(`游戏已运行 ${Math.floor(this._elapsed)} 秒`)
    }
  }
}</code></pre>
      <p>
        你会看到控制台每秒自动输出一行——<strong>不需要任何点击，代码自己在跑</strong>。这就是帧驱动。
      </p>

      <h3>理解 Cocos 脚本的结构</h3>
      <p>
        上面这段代码可能让你看到了几个陌生的东西。拆开来看每行在干什么——这以后你每次新建脚本都会写：
      </p>
      <pre><code>// 1. 从 Cocos 引擎包中导入需要的类
import { Component, _decorator } from 'cc'
//    Component = 所有脚本的基类——类比 Vue 的 defineComponent
//    _decorator = 装饰器工厂——用来给类添加元数据

// 2. 解构出 ccclass 装饰器
const { ccclass } = _decorator
//    @ccclass('ClassName') 把这个类注册到 Cocos 的类系统中
//    括号里的字符串是编辑器里显示的名字，通常和类名一致

// 3. 用 @ccclass 装饰器声明一个 Cocos 组件类
@ccclass('FrameDemo')
export class FrameDemo extends Component {
  // 继承 Component → 拥有 onLoad / start / update 等生命周期

  private _elapsed = 0  // 普通 TS 属性——不会出现在编辑器中

  update(dt: number) {
    // 引擎每帧自动调用——dt 是距离上一帧的秒数
  }
}</code></pre>

      <table>
        <thead>
          <tr>
            <th>元素</th>
            <th>作用</th>
            <th>Vue 类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>@ccclass('Name')</code></td>
            <td>把 TS 类注册为 Cocos 组件——必须写</td>
            <td><code>defineComponent({})</code></td>
          </tr>
          <tr>
            <td><code>extends Component</code></td>
            <td>继承生命周期：onLoad/start/update/onDestroy</td>
            <td><code>extends Vue</code>（Options API）</td>
          </tr>
          <tr>
            <td><code>_decorator</code></td>
            <td>Cocos 的装饰器工具集，提供 @ccclass / @property 等</td>
            <td>—</td>
          </tr>
          <tr>
            <td><code>from 'cc'</code></td>
            <td>Cocos 引擎的主入口包，几乎所有 API 都从这里导</td>
            <td><code>from 'vue'</code></td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>记忆技巧：</strong>新建一个 Cocos 脚本 = 写一个 <code>@ccclass</code> +
        <code>extends Component</code>
        的类。其余都是业务逻辑。这个模板你会在整个课程中反复使用，两周后就是肌肉记忆。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📐" title="核心概念二：坐标系差异">
      <p>前端程序员迁移到 Cocos 时，坐标系是最容易写反的地方。Y 轴方向是颠倒的：</p>

      <table>
        <thead>
          <tr>
            <th>特性</th>
            <th>Web / DOM</th>
            <th>Cocos Creator</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>原点位置</td>
            <td>左上角 (0, 0)</td>
            <td>画布中心 (0, 0)——默认配置下</td>
          </tr>
          <tr>
            <td>Y 轴正方向</td>
            <td><strong>向下</strong> ↓</td>
            <td><strong>向上</strong> ↑</td>
          </tr>
          <tr>
            <td>节点位置含义</td>
            <td>相对于定位父元素</td>
            <td>相对于父节点</td>
          </tr>
          <tr>
            <td>旋转正方向</td>
            <td>顺时针（CSS）</td>
            <td><strong>逆时针</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>前端直觉陷阱：</strong>想让节点往下移动 → <code>node.y -= speed * dt</code>（在
        Cocos 中往下是减 Y）。这和 DOM 的
        <code>top</code> 增加是反的。几乎每个前端转过来的新手都会在这里踩坑。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚙️" title="核心概念三：渲染管线">
      <p>Cocos 不使用 HTML/CSS 渲染。它通过 Canvas / WebGL 直接向 GPU 提交绘制指令：</p>

      <pre><code>浏览器渲染：DOM → CSS 计算 → Layout → Paint → Composite（全自动）
Cocos 渲染：节点树 → RenderComponent → 渲染管线 → GPU（引擎可控）

总结：Cocos 中没有 div / span / p / img。
      所有视觉输出靠 Sprite / Label / Graphics 等渲染组件。</code></pre>
    </ConceptBlock>

    <!-- ============ 动手练习 ============ -->
    <ConceptBlock icon="🔨" title="动手练习：弹跳小球">
      <p>
        这是你的第一个 Cocos
        小项目。目标是：<strong>一个小球在屏幕内来回弹跳</strong>。完成这个练习，你就真正理解了帧驱动和坐标系。
      </p>

      <h3>步骤 1：创建场景和节点</h3>
      <ol>
        <li>在资源管理器右键 → 新建 → Scene，命名为 <code>BounceScene</code></li>
        <li>双击打开场景</li>
        <li>在层级管理器右键 → 创建 → 2D 对象 → Sprite，命名为 <code>Ball</code></li>
        <li>选中 Ball，在属性检查器中把 Color 改成你喜欢的颜色（白色方块也行，先不纠结图片）</li>
      </ol>

      <h3>步骤 2：写第一个脚本</h3>
      <ol>
        <li>资源管理器右键 → 新建 → TypeScript，命名为 <code>BounceBall</code></li>
        <li>双击打开，写入以下代码：</li>
      </ol>

      <pre><code>import { Component, _decorator, view } from 'cc'
const { ccclass } = _decorator

@ccclass('BounceBall')
export class BounceBall extends Component {
  // 速度：属性面板可调
  @property speedX: number = 200
  @property speedY: number = 150

  update(dt: number) {
    // 1. 移动（注意：乘 dt）
    this.node.x += this.speedX * dt
    this.node.y += this.speedY * dt

    // 2. 获取屏幕边界
    const screenSize = view.getVisibleSize()
    const halfW = screenSize.width / 2
    const halfH = screenSize.height / 2

    // 3. 碰到边界就反弹（反转速度）
    if (this.node.x > halfW) {
      this.node.x = halfW
      this.speedX = -Math.abs(this.speedX)  // 向左
    } else if (this.node.x < -halfW) {
      this.node.x = -halfW
      this.speedX = Math.abs(this.speedX)    // 向右
    }

    if (this.node.y > halfH) {
      this.node.y = halfH
      this.speedY = -Math.abs(this.speedY)  // 向下
    } else if (this.node.y < -halfH) {
      this.node.y = -halfH
      this.speedY = Math.abs(this.speedY)    // 向上
    }
  }
}</code></pre>

      <ol start="3">
        <li>
          把 <code>BounceBall</code> 脚本从资源管理器<strong>拖到</strong> Ball 节点的属性检查器上
        </li>
        <li>点击顶部工具栏的"运行"按钮 ▶</li>
      </ol>

      <h3>你应该看到</h3>
      <p>
        小球在屏幕内来回弹跳。<strong>注意：</strong>在属性检查器中可以修改 <code>Speed X</code> 和
        <code>Speed Y</code>，改了立刻生效——这就是 <code>@property</code> 的作用。
      </p>

      <h3>动脑时间</h3>
      <ul>
        <li>把 <code>speedX</code> 改成 0，会发生什么？</li>
        <li>
          把 <code>update</code> 中的 <code>* dt</code> 去掉，会发生什么？（帧率不同时速度不一致）
        </li>
        <li>如果边界判断用 <code>&gt;=</code> 而不是 <code>&gt;</code>，有问题吗？</li>
      </ul>

      <div class="tip-box">
        <strong>完成标准：</strong
        >小球在四个边界之间平滑反弹，不会飞出屏幕。如果做到了，说明你已经理解了帧驱动和 Cocos
        坐标系。
      </div>
    </ConceptBlock>

    <!-- ============ 常见坑点 ============ -->
    <ConceptBlock icon="⚠️" title="前端转 Cocos 常见坑点">
      <table>
        <thead>
          <tr>
            <th>坑点</th>
            <th>前端直觉</th>
            <th>Cocos 实际</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Y 轴方向</td>
            <td>往下是正</td>
            <td>往上是正，移动方向和直觉反的</td>
          </tr>
          <tr>
            <td>坐标原点</td>
            <td>默认左上角</td>
            <td>画布中心（子节点相对父节点）</td>
          </tr>
          <tr>
            <td>dt 忘记乘</td>
            <td>不乘也正常</td>
            <td>不乘的话，不同帧率速度不一致</td>
          </tr>
          <tr>
            <td>脚本不运行</td>
            <td>以为写了就能用</td>
            <td>必须把脚本拖到节点上（或 addComponent）</td>
          </tr>
          <tr>
            <td>节点看不见</td>
            <td>以为是代码问题</td>
            <td>可能是 active=false，或没有渲染组件（Sprite等）</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <!-- ============ .meta 文件 ============ -->
    <ConceptBlock icon="🪪" title="理解 .meta 文件——Cocos 的资源身份证">
      <p>
        打开资源管理器，你会发现<strong
          >每个文件和文件夹旁边都有一个同名的 <code>.meta</code> 文件</strong
        >。这是 Cocos 特有的机制：
      </p>

      <table>
        <thead>
          <tr>
            <th>特性</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>作用</strong></td>
            <td>存储每个资源的 UUID（唯一 ID）、导入设置、引用关系</td>
          </tr>
          <tr>
            <td><strong>自动生成</strong></td>
            <td>任何资源拖入 <code>assets/</code> 后 Cocos 自动创建对应的 .meta</td>
          </tr>
          <tr>
            <td><strong>必须提交 Git</strong></td>
            <td>.meta 文件包含 UUID——丢失它 = 所有引用断裂 = 场景中大量资源变红</td>
          </tr>
          <tr>
            <td><strong>不要手动编辑</strong></td>
            <td>Cocos 编辑器自动管理——手动改 .meta 有风险</td>
          </tr>
          <tr>
            <td><strong>删除需谨慎</strong></td>
            <td>删 .meta = Cocos 重新生成 = UUID 变了 = 所有引用失效</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>重要：</strong><code>.gitignore</code> 中<strong>不要</strong>忽略
        <code>.meta</code> 文件。这和前端项目中 <code>node_modules</code> 应该忽略完全不同——<code
          >.meta</code
        >
        是源码的一部分。
      </div>
    </ConceptBlock>

    <!-- ============ DevTools 调试 ============ -->
    <ConceptBlock icon="🛠️" title="利用 Chrome DevTools 调试——前端工程师的优势">
      <p>
        Cocos 的 Web 预览模式本质上是在浏览器中运行你的游戏。这意味着你可以<strong
          >直接使用 Chrome DevTools</strong
        >
        的全部能力：
      </p>

      <ul>
        <li>
          <strong>console.log：</strong>直接在脚本中写
          <code>console.log(this.node.position)</code>——和前端完全一样
        </li>
        <li>
          <strong>断点调试：</strong>在 Sources 面板中找到
          <code>.ts</code> 文件，点击行号打断点——游戏运行到该行会暂停
        </li>
        <li><strong>Performance：</strong>录制帧率——找出哪一段代码造成了卡顿</li>
        <li>
          <strong>Elements（部分支持）：</strong>可以看到 Canvas 元素但看不到节点树（Cocos 节点不是
          DOM）
        </li>
      </ul>

      <h3>运行按钮的两种模式</h3>
      <table>
        <thead>
          <tr>
            <th>模式</th>
            <th>快捷键</th>
            <th>作用</th>
            <th>何时用</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>浏览器预览</strong></td>
            <td>Ctrl+P</td>
            <td>在系统默认浏览器中打开——可以使用 DevTools</td>
            <td>日常开发——调试逻辑、查看 log、Profile 性能</td>
          </tr>
          <tr>
            <td><strong>编辑器预览</strong></td>
            <td>▶ 按钮</td>
            <td>在编辑器内置窗口中运行——可实时修改属性</td>
            <td>调试 Anim/UI 布局时——运行时修改属性面板即时看到效果</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>推荐工作流：</strong>开发逻辑（脚本）用浏览器预览 +
        DevTools；调试布局/动画/材质用编辑器预览。两者的预览结果是完全一致的——引擎相同，只是运行容器不同。
      </div>

      <div class="warn-box">
        <strong>小游戏适配提示：</strong
        >后期发布到微信小游戏时，微信开发者工具就是你新的"DevTools"——同样支持 Sources 断点、Console
        日志、Network 面板。你现在的调试习惯可以完全平移过去。
      </div>
    </ConceptBlock>

    <!-- ============ 自检清单 ============ -->
    <ConceptBlock icon="✅" title="自检清单">
      <p>完成本节后，你应该能回答以下问题：</p>
      <ul>
        <li>Cocos 编辑器的六大面板分别叫什么、各自干什么？</li>
        <li>设计分辨率（Design Resolution）是什么？Fit Height 和 Fit Width 有什么区别？</li>
        <li><code>@ccclass</code> 和 <code>extends Component</code> 各自的作用是什么？</li>
        <li>".meta 文件"是干什么的？为什么必须提交到 Git？</li>
        <li>"帧驱动"和"事件驱动"的本质区别是什么？用你自己的话说一遍。</li>
        <li><code>dt</code> 是什么？为什么所有位移都要乘它？</li>
        <li>Cocos 的 Y 轴正方向是朝上还是朝下？要让节点向下移动，Y 坐标应该加还是减？</li>
        <li>要给一个节点添加自定义逻辑，需要哪两个步骤？（建脚本 + 拖到节点）</li>
        <li><code>@property</code> 的作用是什么？把它去掉会有什么变化？</li>
        <li>浏览器预览和编辑器预览有什么区别？各适合什么场景？</li>
      </ul>
    </ConceptBlock>
  </PhaseLayout>
</template>
