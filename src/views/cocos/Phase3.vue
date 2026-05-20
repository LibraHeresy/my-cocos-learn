<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="3" title="资源与渲染" duration="2-3 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>规范组织 <code>assets/</code> 目录结构</li>
        <li>导入图片资源，创建 SpriteFrame、Scale9Sprite 和 Atlas 图集</li>
        <li>用 Profiler 面板监控 FPS/DrawCall/渲染耗时</li>
        <li>用 Animation Editor 制作帧动画（爆炸、行走等）</li>
        <li>用 <code>cc.tween</code> 写 UI 动效（弹窗、按钮反馈）</li>
        <li>理解资源动态加载 <code>resources.load()</code> 的异步流程</li>
        <li>搭建 Loading 场景预加载资源</li>
      </ul>
    </ConceptBlock>

    <!-- ============ 资源目录 ============ -->
    <ConceptBlock icon="📁" title="资源目录组织规范">
      <p>
        Cocos 项目的 <code>assets/</code> 就是项目的资源根目录。和 Vue 项目的
        <code>src/</code> 一样，良好的目录结构决定了项目的可维护性：
      </p>

      <pre><code>assets/
├── scenes/           # 场景文件 (.scene)
│   ├── Menu.scene
│   ├── Game.scene
│   └── Result.scene
├── scripts/          # TypeScript 脚本
│   ├── player/
│   ├── enemy/
│   └── manager/
├── textures/         # 图片资源
│   ├── planes/       # 飞机相关
│   ├── bullets/      # 子弹相关
│   └── ui/           # UI 元素
├── atlas/            # 图集文件 (.pac)
├── animations/       # 动画文件 (.anim)
├── audio/            # 音频
│   ├── sfx/          # 音效
│   └── bgm/          # 背景音乐
├── prefabs/          # 预制体
│   ├── player/
│   ├── enemies/
│   └── ui/
└── fonts/            # 字体</code></pre>

      <div class="tip-box">
        <strong>前端习惯直接平移：</strong><code>scripts/</code> 就是
        <code>src/components/</code>，<code>prefabs/</code> 就是可复用的组件模板，<code
          >scenes/</code
        >
        就是 <code>src/views/</code>。照这个思维来组织，不需要重新学习。
      </div>
    </ConceptBlock>

    <!-- ============ 常用数学类型 ============ -->
    <ConceptBlock icon="🧮" title="常用数学类型速览 —— Vec2 / Vec3 / Color">
      <p>这三个类型在 Cocos 中无处不在——移动、定位、着色。花 10 分钟熟悉它们的 API：</p>

      <h3>Vec2 —— 二维向量</h3>
      <pre><code>import { Vec2 } from 'cc'

const pos = new Vec2(100, 200)    // 创建
const dir = new Vec2(1, 0)        // 方向向量

// 常用运算
const sum = pos.add(dir)          // 加法（返回新对象）
pos.addSelf(dir)                  // 原地加法（不创建新对象——性能更好）
const dist = Vec2.distance(a, b)  // 两点距离
const len = dir.length()          // 向量长度
const norm = dir.normalize()      // 归一化（保持方向，长度变 1）</code></pre>

      <h3>Vec3 —— 三维向量</h3>
      <p>
        Cocos 的 <code>node.position</code> 和 <code>node.setPosition()</code> 用的就是 Vec3。2D
        游戏中 z 始终填 0：
      </p>
      <pre><code>import { Vec3 } from 'cc'

const pos = new Vec3(100, 200, 0)  // 3D 坐标（z=0 表示在 2D 平面上）
this.node.setPosition(pos)
this.node.position = pos            // 也可以直接赋值

// Vec3 也有 add / subtract / length / normalize 等方法</code></pre>

      <h3>Color —— 颜色</h3>
      <pre><code>import { Color } from 'cc'

// 四种创建方式
const c1 = new Color(255, 128, 0)         // RGB（0-255）
const c2 = new Color(255, 128, 0, 200)    // RGBA
const c3 = new Color('#FF8000')            // 十六进制字符串
const c4 = Color.WHITE                     // 预设常量：WHITE / BLACK / RED / GREEN / BLUE / YELLOW / CYAN / MAGENTA

// 设置到组件
// Sprite.color / Label.color 都需要 Color 类型</code></pre>

      <table>
        <thead>
          <tr>
            <th>类型</th>
            <th>用途</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Vec2</code></td>
            <td>方向、速度向量、2D 坐标</td>
            <td><code>{ x: number, y: number }</code></td>
          </tr>
          <tr>
            <td><code>Vec3</code></td>
            <td>节点位置 position、缩放 scale</td>
            <td><code>translate3d(x, y, 0)</code></td>
          </tr>
          <tr>
            <td><code>Color</code></td>
            <td>Sprite / Label / Graphics 颜色</td>
            <td><code>#rrggbb</code> CSS 颜色</td>
          </tr>
          <tr>
            <td><code>Rect</code></td>
            <td>矩形区域（x, y, w, h）</td>
            <td><code>{ left, top, width, height }</code></td>
          </tr>
          <tr>
            <td><code>Size</code></td>
            <td>尺寸（width, height）</td>
            <td><code>{ width, height }</code></td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>性能提示：</strong>在 <code>update</code> 中频繁 <code>new Vec3()</code> 会造成 GC
        压力。优先使用 <code>tempVec.set(x, y, z)</code> 复用一个静态向量，或使用原地方法（如
        <code>addSelf</code>）避免创建新对象。
      </div>
    </ConceptBlock>

    <!-- ============ Sprite ============ -->
    <ConceptBlock icon="🖼️" title="Sprite（精灵）—— 类比 &lt;img&gt; 标签">
      <p>Sprite 是 2D 游戏中最基础的渲染组件，负责在屏幕上显示一张图片。</p>

      <h3>导入图片</h3>
      <ol>
        <li>直接把 PNG 图片拖到 <code>assets/textures/</code> 目录下</li>
        <li>Cocos 会自动导入并生成对应的 <code>.meta</code> 文件</li>
        <li>选中图片 → 在属性检查器中可以看到导入设置</li>
      </ol>

      <h3>三种使用方式</h3>
      <pre><code>// 方式一：编辑器中拖拽（最简单）
// 把图片从资源管理器拖到层级管理器的节点上，自动创建 Sprite

// 方式二：编辑器中替换
// 选中已有 Sprite 节点 → 属性检查器 → SpriteFrame 槽拖入图片

// 方式三：代码动态替换
import { Component, _decorator, Sprite, SpriteFrame, resources } from 'cc'
const { ccclass, property } = _decorator

@ccclass('DynamicSprite')
export class DynamicSprite extends Component {

  @property({ type: SpriteFrame })
  sprite1: SpriteFrame = null  // 编辑器中拖入

  @property({ type: SpriteFrame })
  sprite2: SpriteFrame = null

  switchSprite() {
    const sprite = this.node.getComponent(Sprite)
    sprite.spriteFrame = this.sprite2  // 运行时切换图片
  }
}</code></pre>
    </ConceptBlock>

    <!-- ============ Scale9Sprite ============ -->
    <ConceptBlock icon="🪟" title="Scale9Sprite（九宫格）—— 类比 CSS border-image">
      <p>
        UI 面板、按钮背景、弹窗边框——它们需要<strong>拉伸但四角不变形</strong>。这和 CSS 的
        <code>border-image</code> 完全一样：
      </p>

      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>Cocos</th>
            <th>CSS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>组件</td>
            <td>Scale9Sprite</td>
            <td><code>border-image</code></td>
          </tr>
          <tr>
            <td>四角</td>
            <td>保持原始像素不变形</td>
            <td>四角区域不拉伸</td>
          </tr>
          <tr>
            <td>中间</td>
            <td>水平/垂直重复拉伸填充</td>
            <td><code>repeat / stretch</code></td>
          </tr>
          <tr>
            <td>切边</td>
            <td>Border 属性（左/右/上/下）</td>
            <td><code>border-image-slice</code></td>
          </tr>
        </tbody>
      </table>

      <h3>使用步骤</h3>
      <ol>
        <li>在 Aseprite 中画 UI 面板素材——确保四角是固定装饰</li>
        <li>导入到 Cocos，选中图片 → 属性检查器 → Type 选 <strong>Scale9Sprite</strong></li>
        <li>设置 Border 切边值（左/右/上/下各切多少像素）</li>
        <li>节点挂 Scale9Sprite 组件 → 拖入 SpriteFrame → 调整节点宽高即可看到效果</li>
      </ol>

      <pre><code>// 代码中使用
const nineSlice = this.node.addComponent(Scale9Sprite)
nineSlice.spriteFrame = myFrame
// 调整 UITransform 的 width/height → 自动九宫格缩放</code></pre>

      <div class="tip-box">
        <strong>前端直觉：</strong>做过组件库的按钮/弹窗封装，一定用过
        <code>border-image</code> 或类似的切图方案。Scale9Sprite 就是那个概念，只是目标不是 CSS 而是
        GPU 纹理采样。Aseprite 画素材时，四角装饰要放在切边范围内，中间区域保持纯色/简单纹理。
      </div>
    </ConceptBlock>

    <!-- ============ Graphics ============ -->
    <ConceptBlock icon="✏️" title="Graphics 组件 —— 用代码画形状">
      <p>
        Sprite
        需要用图片，但有时候你只是想<strong>用代码画一个矩形/圆形/线条</strong>——调试碰撞框、画血条、画简单的
        UI 指示器。Graphics 就是干这个的：
      </p>

      <h3>基础绘制</h3>
      <pre><code>import { Graphics, Color } from 'cc'

const g = this.node.addComponent(Graphics)

// 画实心矩形
g.fillColor = new Color(255, 0, 0, 100)  // 半透明红色
g.rect(-25, -15, 50, 30)                 // (x, y, w, h) —— 以节点位置为锚点
g.fill()

// 画边框矩形
g.strokeColor = Color.GREEN
g.lineWidth = 2
g.rect(-25, -15, 50, 30)
g.stroke()

// 画圆形
g.circle(0, 0, 20)   // (cx, cy, radius)
g.fill()

// 画线
g.moveTo(0, 0)
g.lineTo(100, 50)
g.stroke()

// 清空所有绘制内容（每帧重绘前必须 clear）
g.clear()</code></pre>

      <h3>典型场景：碰撞调试框</h3>
      <pre><code>// 在 DebugDrawer 中每帧重绘碰撞框（Phase 5 详讲）
lateUpdate() {
  const g = this.node.getComponent(Graphics)
  g.clear()
  g.strokeColor = Color.RED
  g.lineWidth = 1

  for (const obj of collidables) {
    const b = obj.getBBox()
    g.rect(b.x - b.width/2, b.y - b.height/2, b.width, b.height)
    g.stroke()
  }
}</code></pre>

      <div class="tip-box">
        <strong>Graphics vs Sprite：</strong>Graphics 适合开发调试（碰撞框可视化）和极简
        UI（纯色血条）。正式游戏素材还是用 Sprite——Graphics 每次
        <code>stroke()/fill()</code> 都生成几何顶点，频繁重绘比 Sprite 开销大。
      </div>
    </ConceptBlock>

    <!-- ============ Atlas ============ -->
    <ConceptBlock icon="🗂️" title="Atlas 图集 —— 性能优化的关键">
      <p>
        Atlas（图集/合图）是 2D 游戏最重要的资源优化手段。把多张小图合并成一张大图，一次 GPU
        提交就能绘制所有元素：
      </p>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>独立图片</th>
            <th>Atlas 图集</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GPU 纹理切换</td>
            <td>每张图切换一次</td>
            <td>无需切换</td>
          </tr>
          <tr>
            <td>DrawCall</td>
            <td>每张图一次</td>
            <td>可批量合并</td>
          </tr>
          <tr>
            <td>内存占用</td>
            <td>分散</td>
            <td>集中管理</td>
          </tr>
          <tr>
            <td>适用场景</td>
            <td>大背景图、单张 UI</td>
            <td>角色帧、子弹、道具</td>
          </tr>
        </tbody>
      </table>

      <h3>创建 Atlas</h3>
      <pre><code>// Cocos 3.x 中的 Auto Atlas 使用步骤：

// 1. 把所有小 PNG 放到一个文件夹中
//    例如：assets/atlas/explosion/
//          ├── frame_01.png
//          ├── frame_02.png
//          ├── ...
//          └── frame_16.png

// 2. 右键该文件夹 → 新建 → Auto Atlas
//    生成一个 .pac 文件

// 3. 选中 .pac 文件，在属性检查器中配置：
//    - Max Width / Height: 图集最大尺寸（建议 2048）
//    - Padding: 帧间距（建议 2px）
//    - Allow Rotation: 是否允许旋转以节省空间
//    - Filter Mode: 像素风选 Point，其他选 Bilinear

// 4. 使用：SpriteFrame 的引用方式和单张图完全一样
//    区别是底层它在同一张纹理上</code></pre>

      <div class="tip-box">
        <strong>像素飞机大战最佳实践：</strong>把所有飞机、子弹、道具、爆炸帧分别放在各自的 Atlas
        中。像素素材通常很小，一个 1024×1024 的 Atlas 可以塞很多帧。像素风格记得把 Filter Mode 设为
        <strong>Point</strong>，否则会模糊。
      </div>
    </ConceptBlock>

    <!-- ============ Profiler ============ -->
    <ConceptBlock icon="📊" title="性能度量：Profiler 面板 —— 类比 React DevTools Profiler">
      <p>
        Cocos 左下角有一个 <strong>Profiler</strong> 按钮（齿轮图标旁）。点击后显示三行核心指标：
      </p>

      <table>
        <thead>
          <tr>
            <th>指标</th>
            <th>含义</th>
            <th>前端类比</th>
            <th>健康值</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>FPS</strong></td>
            <td>每秒帧数</td>
            <td>Chrome Performance 面板的 FPS</td>
            <td>60（稳定）</td>
          </tr>
          <tr>
            <td><strong>DrawCall</strong></td>
            <td>GPU 绘制提交次数</td>
            <td>React re-render 次数——越少越好</td>
            <td>&lt; 30（Web）/ &lt; 50（原生）</td>
          </tr>
          <tr>
            <td><strong>Render</strong></td>
            <td>每帧渲染耗时（ms）</td>
            <td>Performance 中的 Scripting + Rendering 时间</td>
            <td>&lt; 10ms（留 6ms 给逻辑）</td>
          </tr>
        </tbody>
      </table>

      <h3>DrawCall —— 游戏性能的"re-render 次数"</h3>
      <p>
        每次 GPU 切换纹理/材质，就产生一次 DrawCall。Atlas 图集的目的就是
        <strong>减少 DrawCall</strong>——把多个 Sprite 合到一张纹理上，GPU 一次提交全部画完：
      </p>
      <pre><code>无 Atlas（10 个独立图片）：
Sprite → DrawCall 1
Sprite → DrawCall 2
...
Sprite → DrawCall 10    → 共 10 次 GPU 提交

有 Atlas（10 个 Sprite 用同一张图集）：
Sprite → ┐
Sprite → ┤
...      ├→ DrawCall 1（批量合并）→ 仅 1 次 GPU 提交
Sprite → ┘</code></pre>

      <div class="warn-box">
        <strong>小游戏特别注意：</strong>低端 Android 手机的 DrawCall 预算约
        50-80，远低于桌面浏览器（200+）。你的飞机大战场景应该控制在
        <strong>30 DrawCall 以下</strong>。打开 Profiler 看着它开发——每加一个 Atlas
        之外的独立素材就多一次 DrawCall。
      </div>
    </ConceptBlock>

    <!-- ============ Animation ============ -->
    <ConceptBlock icon="🎬" title="两种动画：帧动画 + Tween">
      <p>Cocos 提供两种动画方式，各有适用场景：</p>

      <h3>方式一：帧动画（SpriteFrame 序列）</h3>
      <p>适合：爆炸效果、角色走路、敌人闪烁——任何需要<strong>逐帧切换图片</strong>的场景。</p>

      <pre><code>// 用代码实现帧动画（轻量，不需要 Animation 组件）
import { Component, _decorator, Sprite, SpriteFrame } from 'cc'
const { ccclass, property } = _decorator

@ccclass('FrameAnimator')
export class FrameAnimator extends Component {

  @property({ type: [SpriteFrame] })
  frames: SpriteFrame[] = []       // 属性面板拖入序列帧

  @property frameRate: number = 12  // 每秒播放帧数

  private _sprite: Sprite = null
  private _currentIndex = 0
  private _timer = 0

  onLoad() {
    this._sprite = this.node.getComponent(Sprite)
  }

  update(dt: number) {
    if (this.frames.length === 0) return

    this._timer += dt
    const interval = 1 / this.frameRate  // 每帧间隔

    if (this._timer >= interval) {
      this._timer -= interval
      this._currentIndex = (this._currentIndex + 1) % this.frames.length
      this._sprite.spriteFrame = this.frames[this._currentIndex]
    }
  }
}</code></pre>

      <h3>方式二：cc.tween 补间动画</h3>
      <p>
        适合：UI 弹出、按钮反馈、道具飞向玩家——任何需要<strong>数值平滑过渡</strong>的场景。类比 CSS
        <code>transition</code> + <code>@keyframes</code>。
      </p>

      <pre><code>import { tween, Vec3, UIOpacity } from 'cc'

// 平移动画（类比 CSS transition: transform）
tween(this.node)
  .to(0.5, { position: new Vec3(0, 100, 0) })  // 0.5秒移到目标位置
  .start()

// 缩放弹跳（类比 CSS @keyframes）
tween(this.node)
  .to(0.15, { scale: new Vec3(1.3, 1.3, 1) })  // 先放大
  .to(0.1, { scale: new Vec3(1, 1, 1) })        // 再缩回
  .start()

// 淡入淡出（类比 CSS opacity transition）
const uiOpacity = this.node.getComponent(UIOpacity)
tween(uiOpacity)
  .to(0.5, { opacity: 0 })   // 0.5秒淡出
  .call(() => this.node.active = false)  // 淡出后隐藏
  .start()

// 链式动画系列
tween(this.node)
  .delay(0.5)                 // 等待 0.5 秒
  .to(1, { position: targetPos })
  .to(0.2, { scale: new Vec3(1.5, 1.5, 1) })
  .to(0.15, { scale: new Vec3(0, 0, 1) })
  .call(() => this.node.destroy())  // 动画结束后销毁
  .start()</code></pre>

      <div class="warn-box">
        <strong>注意：</strong>tween 会在后台持续运行。如果节点在 tween
        执行期间被销毁，会报错。务必在 <code>onDestroy</code> 中调用
        <code>tween(this.node).stop()</code> 停止所有动画。
      </div>
    </ConceptBlock>

    <!-- ============ 资源加载 ============ -->
    <ConceptBlock icon="📥" title="资源动态加载">
      <p>
        Cocos 中的资源加载和 Vue 的 <code>import()</code> 一样是异步的。理解三种加载方式的使用场景：
      </p>

      <h3>方式一：编辑器中引用（同步，最推荐）</h3>
      <pre><code>// 用 @property 在编辑器中拖入，不需要代码加载
@property({ type: SpriteFrame })
mySprite: SpriteFrame = null    // 拖入资源即可</code></pre>

      <h3>方式二：resources.load（异步）</h3>
      <pre><code>import { resources, SpriteFrame, Sprite } from 'cc'

// 资源必须放在 assets/resources/ 目录下
// 路径相对于 resources/，不写扩展名
resources.load('textures/plane/spriteFrame', SpriteFrame, (err, sf) => {
  if (err) {
    console.error('加载失败:', err)
    return
  }
  this.node.getComponent(Sprite).spriteFrame = sf
})</code></pre>

      <h3>方式三：resources.loadDir（批量加载）</h3>
      <pre><code>// 加载整个目录的资源，适合 Loading 场景
resources.loadDir('textures/explosion', SpriteFrame, (err, frames) => {
  if (err) { console.error(err); return }
  this.explosionFrames = frames  // 所有爆炸帧
})

// Promise 风格
const frames = await new Promise&lt;SpriteFrame[]&gt;((resolve, reject) => {
  resources.loadDir('textures/explosion', SpriteFrame,
    (err, frames) => err ? reject(err) : resolve(frames)
  )
})</code></pre>

      <div class="warn-box">
        <strong>关键约束：</strong><code>resources.load()</code> 只能加载
        <code>assets/resources/</code> 目录下的资源。放在 resources 之外的资源不会被动态加载 API
        找到。如果你发现 load 报错 "找不到资源"，先检查文件是否在 resources 目录下。
      </div>
    </ConceptBlock>

    <!-- ============ Loading 场景 ============ -->
    <ConceptBlock icon="⏳" title="Loading 场景骨架 —— 预加载 + 进度条">
      <p>
        游戏启动或切换场景时，如果有超过 2-3 秒的资源加载，需要显示 Loading
        界面——否则玩家会以为游戏卡死了。给一个最小可用骨架：
      </p>

      <h3>场景结构</h3>
      <pre><code>Loading.scene 节点树：
Canvas
├── Background（深色纯色背景）
├── LoadingBar（ProgressBar 组件 + Sprite 填充条）
├── TipLabel（"正在加载游戏资源..."）
└── LoadingCtrl（脚本——控制加载流程）</code></pre>

      <h3>LoadingCtrl.ts</h3>
      <pre><code>import { Component, _decorator, director, ProgressBar, resources } from 'cc'
const { ccclass, property } = _decorator

@ccclass('LoadingCtrl')
export class LoadingCtrl extends Component {

  @property({ type: ProgressBar })
  progressBar: ProgressBar = null

  // 需要预加载的资源列表
  private _assets: Array&lt;{ path: string; type: any }&gt; = [
    { path: 'textures/explosion', type: null },
    // ... 更多资源
  ]

  start() {
    this.loadAssets()
  }

  private loadAssets() {
    let loaded = 0
    const total = this._assets.length

    if (total === 0) {
      this.onComplete()
      return
    }

    for (const asset of this._assets) {
      resources.loadDir(asset.path, asset.type || undefined, (err) => {
        if (err) { console.error('加载失败:', asset.path, err) }
        loaded++
        this.progressBar.progress = loaded / total

        if (loaded >= total) {
          this.scheduleOnce(() => this.onComplete(), 0.2)
        }
      })
    }
  }

  private onComplete() {
    director.loadScene('MenuScene')
  }
}</code></pre>

      <div class="tip-box">
        <strong>小游戏注意：</strong>小游戏启动时微信自己有 Loading 画面，但如果你有额外的 Bundle
        分包或 CDN 资源要加载，仍需要做自己的 Loading 界面。用
        <code>assetManager.loadBundle()</code> 加载分包时可以拿到百分比，更新进度条。
      </div>
    </ConceptBlock>

    <!-- ============ 动手练习 ============ -->
    <ConceptBlock icon="🔨" title="动手练习：爆炸特效 + UI 弹窗">
      <p>结合本章知识做两个小练习：</p>

      <h3>练习 A：播放一段爆炸帧动画</h3>
      <ol>
        <li>
          找一套爆炸序列帧（或者用不同颜色的方块代替），放到
          <code>assets/resources/textures/explosion/</code>
        </li>
        <li>创建 Auto Atlas，生成图集</li>
        <li>创建 Explosion 节点 + Sprite + FrameAnimator 脚本</li>
        <li>运行时动态加载爆炸帧，播放一次后自动销毁</li>
      </ol>

      <h3>练习 B：得分提示弹出动画</h3>
      <pre><code>// ScorePopup.ts：得分时弹出一个 +100 的动画
import { Component, _decorator, Label, tween, UIOpacity, Vec3 } from 'cc'
const { ccclass } = _decorator

@ccclass('ScorePopup')
export class ScorePopup extends Component {

  show(score: number, worldPos: Vec3) {
    this.node.setPosition(worldPos)
    this.node.active = true

    const label = this.node.getComponent(Label)
    label.string = `+${score}`

    const uiOpacity = this.node.addComponent(UIOpacity)
    tween(this.node)
      .to(0.8, { position: new Vec3(worldPos.x, worldPos.y + 80, 0) })
      .start()
    tween(uiOpacity)
      .delay(0.3)
      .to(0.5, { opacity: 0 })
      .call(() => this.node.active = false)
      .start()
  }
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>Vec2 和 Vec3 的区别是什么？为什么 Cocos 节点的 position 用 Vec3？</li>
        <li>Color 有哪几种创建方式？如何在 update 中复用向量避免 GC？</li>
        <li>Graphics 组件适合什么场景？它和 Sprite 的性能差异是什么？</li>
        <li>Atlas 图集为什么能提升性能？什么情况下不需要 Atlas？</li>
        <li>帧动画和 Tween 动画各自适合什么场景？</li>
        <li><code>resources.load()</code> 加载的路径是相对于哪个目录的？</li>
        <li>给节点挂 <code>UIOpacity</code> 组件后，如何用 tween 做淡入效果？</li>
        <li>在 <code>onDestroy</code> 中需要如何处理正在运行的 tween？</li>
        <li>像素风素材的 Filter Mode 应该设为什么？为什么？</li>
        <li>Scale9Sprite 类比 CSS 的什么属性？切边（Border）的作用是什么？</li>
        <li>DrawCall 是什么？它和 Atlas 图集的关系是什么？怎么查看 DrawCall？</li>
        <li>小游戏中 DrawCall 建议控制在多少以下？为什么？</li>
        <li>Loading 场景的本质是什么？如何用 ProgressBar 更新加载进度？</li>
      </ul>
    </ConceptBlock>
  </PhaseLayout>
</template>
