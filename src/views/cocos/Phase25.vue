<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="25" title="纹理压缩与内存优化" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解不同平台的<strong>纹理压缩格式</strong>——ETC2 / ASTC / PVRTC 各适用于什么场景</li>
        <li>在 Cocos Creator 编辑器中<strong>配置纹理导入参数</strong>，做到一图多平台自动适配</li>
        <li><strong>计算纹理内存占用</strong>：<code>宽 x 高 x bpp / 8</code>，并制定 mobile 预算</li>
        <li>使用 <strong>SpriteAtlas 合图</strong> 减少 DrawCall 并进一步优化内存</li>
        <li>根据设备性能<strong>运行时切换纹理质量</strong>（高/中/低三档）</li>
        <li>用 Cocos Profiler 监控纹理内存面板，定位内存瓶颈</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="纹理压缩为什么重要——前端工程师的直觉理解">
      <p>
        如果你做过 Web 性能优化，你一定知道 <strong>WebP vs PNG</strong> 的权衡：
        WebP 体积小但兼容性不是 100%，PNG 通用但体积大。纹理压缩本质上就是游戏版的
        "图片格式选择"——但比 Web 复杂得多，因为<strong>不同 GPU 支持的压缩格式不同</strong>。
      </p>

      <h3>Web 图片优化 vs 游戏纹理压缩</h3>
      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>前端（Web）</th>
            <th>游戏（Cocos）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>无损格式</td>
            <td>PNG</td>
            <td>PNG（导入时转为 GPU 纹理）</td>
          </tr>
          <tr>
            <td>压缩格式</td>
            <td>WebP / AVIF</td>
            <td>ETC2 / ASTC / PVRTC / DXT</td>
          </tr>
          <tr>
            <td>大小计算</td>
            <td>文件体积（KB）</td>
            <td>GPU 内存 = 宽 x 高 x bpp / 8</td>
          </tr>
          <tr>
            <td>自适应</td>
            <td><code>&lt;picture&gt;</code> + <code>srcset</code></td>
            <td>Cocos 编辑器"平台覆盖"纹理设置</td>
          </tr>
          <tr>
            <td>压缩时机</td>
            <td>构建时（Webpack/Rollup）</td>
            <td>构建时（Cocos 编辑器自动转码）</td>
          </tr>
          <tr>
            <td>质量降级</td>
            <td>低分辨率占位图</td>
            <td>运行时切换低质量纹理</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>关键认知：</strong>游戏纹理讨论的不是"文件体积"而是<strong>GPU 显存占用</strong>。
        一个 1024x1024 的 PNG 文件可能只有 200KB，但上传到 GPU 后 RGBA8888 格式占用
        <strong>4MB</strong>。压缩格式的目的就是把 4MB 降到 0.5MB（ETC2）甚至更低——
        这直接决定了你的游戏在低端机型上会不会崩溃。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🗜️" title="纹理压缩格式全家福">
      <p>
        不同 GPU 产品线支持不同的压缩格式。选错格式 = 纹理无法加载或软件解码（慢且占内存）。
        好在 Cocos Creator 在构建时自动为你做格式转换——你只需在编辑器中配置好规则。
      </p>

      <h3>主流纹理压缩格式一览</h3>
      <table>
        <thead>
          <tr>
            <th>格式</th>
            <th>适用平台</th>
            <th>bpp（每像素位数）</th>
            <th>RGBA 支持</th>
            <th>压缩比（相对 RGBA8888）</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>RGBA8888</strong></td>
            <td>所有平台（软件解码）</td>
            <td>32 bpp</td>
            <td>完整</td>
            <td>1:1（基准）</td>
            <td>不压缩——仅用于 UI 文字等需要绝对清晰的纹理</td>
          </tr>
          <tr>
            <td><strong>ETC2 RGB/RGBA</strong></td>
            <td>Android（OpenGL ES 3.0+）</td>
            <td>4 bpp (RGB) / 8 bpp (RGBA)</td>
            <td>支持</td>
            <td>4:1 ~ 8:1</td>
            <td><strong>Android 主力格式</strong>——覆盖率 &gt; 95%</td>
          </tr>
          <tr>
            <td><strong>ETC1 RGB</strong></td>
            <td>Android（OpenGL ES 2.0）</td>
            <td>4 bpp</td>
            <td>仅 RGB（无 Alpha）</td>
            <td>8:1</td>
            <td>老旧设备兼容——Alpha 通道需单独一张图</td>
          </tr>
          <tr>
            <td><strong>ASTC 4x4 ~ 8x8</strong></td>
            <td>Android 5.0+ / iOS 9+ / 现代设备</td>
            <td>2.0 ~ 3.6 bpp</td>
            <td>支持</td>
            <td>8:1 ~ 16:1</td>
            <td><strong>最优格式</strong>——体积小、质量好、使用灵活</td>
          </tr>
          <tr>
            <td><strong>PVRTC 4bpp</strong></td>
            <td>iOS（PowerVR GPU）</td>
            <td>4 bpp</td>
            <td>支持</td>
            <td>8:1</td>
            <td>iOS 传统格式——ASTC 普及后逐渐被替代</td>
          </tr>
          <tr>
            <td><strong>DXT1 / DXT5</strong></td>
            <td>Windows / macOS 桌面</td>
            <td>4 bpp / 8 bpp</td>
            <td>支持</td>
            <td>4:1 ~ 8:1</td>
            <td>桌面端专用——手机 GPU 不支持</td>
          </tr>
        </tbody>
      </table>

      <h3>格式选择策略</h3>
      <pre><code>移动端推荐选型：
  Android（主力）→ ETC2 RGBA（4-8 bpp）—— 95%+ 覆盖率
  Android（最低兼容）→ ETC1 RGB + 单独 Alpha 图 —— 为了那 5%
  iOS → ASTC 6x6（3.6 bpp）—— 兼顾质量与体积
  新项目 → 全平台 ASTC —— 现代设备覆盖率高，体验最优

桌面端：
  Windows → DXT5
  macOS → ASTC（现代 Mac）+ DXT5（兼容）</code></pre>

      <div class="warn-box">
        <strong>重要警告：</strong>RGB 和 RGBA 的 bpp 相差一倍。如果你的纹理没有 Alpha 通道
        （如背景图、地面图），务必选择 RGB 格式而不是 RGBA 格式，能省一半内存。
        在 Cocos 编辑器中检查纹理属性——如果 Alpha 通道全是 255，就勾选 "Is RGB"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚙️" title="Cocos 编辑器中的纹理配置">
      <p>
        Cocos Creator 提供了精细的纹理导入设置，允许你<strong>按平台覆盖</strong>压缩格式。
        这意味着同一张纹理，构建到 Android 时自动转为 ETC2，构建到 iOS 时自动转为 ASTC，
        不需要你手动维护多套资源。
      </p>

      <h3>纹理属性面板关键设置</h3>
      <table>
        <thead>
          <tr>
            <th>设置项</th>
            <th>推荐值（移动端）</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Type</td>
            <td>Sprite Frame</td>
            <td>普通 2D 纹理选 Sprite Frame</td>
          </tr>
          <tr>
            <td>Premultiply Alpha</td>
            <td>勾选</td>
            <td>预乘 Alpha——减少渲染时的一次乘法运算</td>
          </tr>
          <tr>
            <td>Gen Mipmaps</td>
            <td>视情况（见下方 Mipmap 章节）</td>
            <td>3D 或缩放场景需要，普通 2D UI 不需要</td>
          </tr>
          <tr>
            <td>Wrap Mode</td>
            <td>Clamp（UI）/ Repeat（平铺背景）</td>
            <td>UI 元素用 Clamp 防止边缘出血</td>
          </tr>
          <tr>
            <td>Filter Mode</td>
            <td>Bilinear（普通）/ Point（像素风）</td>
            <td>Point 模式适合像素艺术风格</td>
          </tr>
        </tbody>
      </table>

      <h3>平台覆盖设置</h3>
      <pre><code>在 Cocos Creator 编辑器中，选中纹理资源 → 属性面板 → 点击平台覆盖：

Android:
  ├─ Override Format: ✓ 勾选
  ├─ Format: ETC2_RGBA（有 Alpha）/ ETC2_RGB（无 Alpha）
  └─ Quality: 80-90%

iOS:
  ├─ Override Format: ✓ 勾选
  ├─ Format: ASTC 6x6
  └─ Quality: 85-95%

Web Desktop:
  ├─ Override Format: ✓ 勾选
  ├─ Format: DXT5
  └─ Quality: 90%</code></pre>

      <h3>纹理内存预算计算</h3>
      <pre><code>GPU 纹理内存 = 宽 × 高 × (bpp / 8) × Mipmap系数

示例计算（移动端预算 50-100MB）：

| 纹理 | 尺寸 | 格式 | bpp | 内存 |
|------|------|------|-----|------|
| 角色精灵图 | 512x512 | ETC2 RGBA | 8 | 0.25 MB |
| 大背景 | 2048x1024 | ETC2 RGB | 4 | 1.0 MB |
| UI 图集 | 1024x1024 | ETC2 RGBA | 8 | 1.0 MB |
| 特效贴图 | 256x256 | ETC2 RGBA | 8 | 64 KB |
| 粒子纹理 | 128x128 | ETC2 RGBA | 8 | 16 KB |

公式：
  memory(MB) = (width × height × bpp) / (8 × 1024 × 1024)

例如 1024x1024 ETC2 RGBA (8bpp)：
  (1024 × 1024 × 8) / (8 × 1048576) = 8,388,608 / 8,388,608 = 1 MB

典型移动端游戏纹理预算分配：
  角色      15 MB
  场景背景   10 MB
  UI 图集   8 MB
  特效       5 MB
  音效       10 MB
  其他      12 MB
  ─────────────────
  总计      ~60 MB（在 50-100 MB 预算内）</code></pre>

      <div class="tip-box">
        <strong>前端类比：</strong>这和做 Web 性能预算（Performance Budget）一模一样——
        先定总预算（如首页 JS bundle &le; 200KB），再分配给各个模块。
        纹理也一样，先定 60MB 总预算，再分给角色、场景、UI、特效各多少。
        超过预算就优化，而不是等玩家说"卡"了你才发现。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🗺️" title="SpriteAtlas 进阶——合图的正确姿势">
      <p>
        SpriteAtlas 把多张小纹理打包成一张大图，作用有两个：
        ① <strong>减少 DrawCall</strong>（同一 Atlas 的 Sprite 可以合批渲染）；
        ② <strong>提高纹理存储效率</strong>（减少碎片化和 GPU 纹理切换）。
      </p>

      <h3>多 Atlas 策略</h3>
      <pre><code>不是所有纹理都塞进一个 Atlas！按"渲染批次"分组：

atlas_ui.spriteAtlas       ← UI 元素（按钮、图标、面板）
atlas_gameplay.spriteAtlas ← 游戏角色（玩家、敌人、子弹）
atlas_effects.spriteAtlas  ← 特效（粒子、爆炸帧）
atlas_environment.spriteAtlas ← 场景背景（地面、天空、装饰）

分组原则：
  ① 同一帧内高频共现的纹理 → 放进同一个 Atlas（利于合批）
  ② 永不共现的纹理 → 分开到不同 Atlas（避免占着无用空间）
  ③ 高频更新 vs 静态 → 分开（静态场景 Atlas 可以一直留在 GPU 上）</code></pre>

      <h3>Atlas 配置参数</h3>
      <table>
        <thead>
          <tr>
            <th>参数</th>
            <th>推荐值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Max Width / Height</td>
            <td>2048 x 2048（移动端）</td>
            <td>太大 = 低端机不支持；太小 = 放不下</td>
          </tr>
          <tr>
            <td>Padding</td>
            <td>2-4 px</td>
            <td>防止边缘颜色出血到相邻 Sprite</td>
          </tr>
          <tr>
            <td>Allow Rotation</td>
            <td>勾选</td>
            <td>允许旋转 Sprite 以提高空间利用率</td>
          </tr>
          <tr>
            <td>Trim Whitespace</td>
            <td>勾选</td>
            <td>裁切空白像素，减小 Atlas 体积</td>
          </tr>
          <tr>
            <td>Compress Type</td>
            <td>同纹理压缩格式</td>
            <td>整个 Atlas 统一用一种压缩格式</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>常见错误：</strong>把不相关的纹理塞进同一个 Atlas "为了省事"。
        结果：每次你加载这个 Atlas，都会把里面所有纹理加载到 GPU 内存，
        哪怕其中一半在当前的场景中根本用不到。Atlas 加载是<strong>全有或全无</strong>的，
        请用"渲染批次共现"的原则来分组——而不是"美术分类"来分组。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🪜" title="Mipmap——层层缩放的纹理">
      <p>
        Mipmap 是纹理的预缩放版本链。例如一张 512x512 的纹理，会自动生成
        256x256、128x128、64x64、32x32、16x16、8x8、4x4、2x2、1x1 的缩小版。
        当物体远离相机时，GPU 自动选择合适大小的版本，提升性能并减少锯齿。
      </p>

      <h3>Mipmap 什么时候需要，什么时候不需要？</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>需要 Mipmap？</th>
            <th>原因</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>3D 场景中远近变化物体</td>
            <td>需要</td>
            <td>远处物体用低级别 mip，减少走样</td>
          </tr>
          <tr>
            <td>2D 场景中缩放动画</td>
            <td>需要</td>
            <td>缩小时自动降级，减少带宽</td>
          </tr>
          <tr>
            <td>UI 元素（固定大小不缩放）</td>
            <td>不需要</td>
            <td>永远用原始大小——mip 是浪费</td>
          </tr>
          <tr>
            <td>像素艺术风格</td>
            <td>不需要</td>
            <td>Mip 会把像素模糊化——破坏风格</td>
          </tr>
        </tbody>
      </table>

      <h3>Mipmap 内存代价</h3>
      <pre><code>Mipmap 增加内存约 +33%（等比数列求和 1 + 1/4 + 1/16 + ... ≈ 1.33）

原始 1024x1024 RGBA8888：4 MB
加 Mipmap 后：            4 × 1.33 ≈ 5.33 MB（+1.33 MB）

在移动端纹理预算紧张的情况下，+33% 是值得仔细考虑的。
只给确实需要缩放的纹理开 Mipmap。</code></pre>

      <div class="tip-box">
        <strong>前端类比：</strong>Mipmap 就是 <code>srcset</code> 的 GPU 版本。
        浏览器根据屏幕 DPR 选择 <code>image@2x.jpg</code> 还是 <code>image@1x.jpg</code>；
        GPU 根据物体到相机的距离选择 mip level 0（原始）还是 mip level 3（1/8 大小）。
        都是"离得远就不需要高分辨率"这个简单道理。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎚️" title="运行时纹理质量切换">
      <p>
        同一款游戏在 iPhone 15 Pro Max 和 Redmi 入门机上，纹理质量不应该一样。
        运行时根据设备性能动态切换纹理质量——高/中/低三档——是移动端优化的必备手段。
      </p>

      <h3>设备分档逻辑</h3>
      <pre><code>// DeviceTierManager.ts
export enum TextureQuality {
  Low = 0,     // 低端机：512 以下纹理、ETC1
  Medium = 1,  // 中端机：1024 以下纹理、ETC2
  High = 2,    // 高端机：2048+ 纹理、ASTC
}

export class DeviceTierManager {
  private static _instance: DeviceTierManager
  private _quality: TextureQuality = TextureQuality.Medium

  static get instance(): DeviceTierManager {
    if (!this._instance) this._instance = new DeviceTierManager()
    return this._instance
  }

  /** 自动检测设备等级 */
  detectDeviceTier(): TextureQuality {
    // 1. 获取设备信息
    const info = sys.getSystemInfo()
    const ramMB = (info.memorySize ?? 2048)  // MB，微信 API 返回

    // 2. 分级策略
    if (ramMB >= 4096) {
      this._quality = TextureQuality.High
    } else if (ramMB >= 2048) {
      this._quality = TextureQuality.Medium
    } else {
      this._quality = TextureQuality.Low
    }

    // 3. 也可结合 GPU 型号判断（微信小游戏可用 wx.getDeviceInfo()）
    console.log(`[DeviceTier] RAM=${ramMB}MB → Quality=${TextureQuality[this._quality]}`)
    return this._quality
  }

  /** 获取当前纹理质量对应的最大尺寸 */
  get maxTextureSize(): number {
    switch (this._quality) {
      case TextureQuality.Low:    return 512
      case TextureQuality.Medium:  return 1024
      case TextureQuality.High:   return 2048
    }
  }

  /** 获取当前是否启用高质量特效 */
  get enableHighQualityEffects(): boolean {
    return this._quality >= TextureQuality.Medium
  }

  /** 获取建议的纹理压缩格式 */
  get compressionFormat(): string {
    switch (this._quality) {
      case TextureQuality.Low:    return 'ETC1_RGB'    // 最小体积
      case TextureQuality.Medium:  return 'ETC2_RGBA'  // 标准
      case TextureQuality.High:   return 'ASTC_6x6'   // 最优
    }
  }
}</code></pre>

      <h3>Cocos 运行时质量切换</h3>
      <pre><code>// RuntimeQualityManager.ts
import { _decorator, Component, Sprite, assetManager, SpriteFrame } from 'cc'
const { ccclass } = _decorator

@ccclass('RuntimeQualityManager')
export class RuntimeQualityManager extends Component {
  private _currentQuality: TextureQuality = TextureQuality.Medium

  onLoad() {
    this._currentQuality = DeviceTierManager.instance.detectDeviceTier()
    this.applyQuality()
  }

  /** 应用质量设置到所有 Sprite */
  private applyQuality(): void {
    const spriteFrames = this.collectAllSpriteFrames()

    for (const sf of spriteFrames) {
      // 如果当前质量太低，尝试换低分辨率版本
      if (this._currentQuality === TextureQuality.Low) {
        this.replaceWithLowRes(sf)
      }
      // 高端机——可以开启额外的视觉效果（如法线贴图、HDR 纹理）
      if (this._currentQuality === TextureQuality.High) {
        this.enableHighQualityFeatures(sf)
      }
    }
  }

  /** 替换低分辨率纹理 */
  private replaceWithLowRes(sf: SpriteFrame): void {
    // 按命名约定查找低分辨率版本：hero.png → hero_low.png
    // 或限制纹理最大尺寸
    const texture = sf.texture
    if (texture && (texture.width > 512 || texture.height > 512)) {
      // 简单方法：设置 texture 的 filter mode 为 Point（像素化）
      // 更好的方法：动态加载 _low 后缀的资源
      texture.setFilters(/* Point */ 0, /* Point */ 0)
    }
  }

  /** 高端机开启高质量特性 */
  private enableHighQualityFeatures(sf: SpriteFrame): void {
    // 开启各向异性过滤、法线贴图等
    // 具体取决于项目需要
  }

  /** 收集场景中所有 SpriteFrame */
  private collectAllSpriteFrames(): SpriteFrame[] {
    const results: SpriteFrame[] = []
    const sprites = this.node.scene.getComponentsInChildren(Sprite)
    for (const sprite of sprites) {
      const sf = sprite.spriteFrame
      if (sf) results.push(sf)
    }
    return results
  }
}</code></pre>

      <h3>Cocos Profiler 纹理面板解读</h3>
      <pre><code>Cocos Creator → 项目预览 → 左下角 Profiler 按钮 → Texture 面板：

关注指标：
  Texture Memory: 当前 GPU 纹理总内存（MB）
    → 目标 &le; 60 MB（移动端）

  Texture Count:  当前加载的纹理总数
    → 目标 &le; 100 个（移动端）

  Atlas Count:    SpriteAtlas 数量
    → 每个 Atlas 对应一次 GPU 纹理上传

如果 Texture Memory 持续增长 → 纹理泄漏（忘记释放）
如果 Texture Count 很大 → 考虑合并为 Atlas
如果 Atlas Count 很多 → 检查是否有重复加载的问题</code></pre>

      <div class="tip-box">
        <strong>前端类比：</strong>运行时纹理质量切换就是 <strong>Adaptive Loading</strong>。
        就像 Web 中根据 <code>navigator.connection.effectiveType</code> 决定加载
        高清图还是缩略图，游戏根据 <code>sys.getSystemInfo().memorySize</code> 决定用
        ASTC 还是 ETC1。本质上都是"能力越大，责任（资源）越大"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: ASTC 比 ETC2 好那么多，为什么不是所有设备都用 ASTC？</h3>
      <p>
        ASTC 需要 OpenGL ES 3.1 / Metal 支持。虽然 2026 年绝大多数设备都支持了，
        但仍然有一些入门级 Android Go 设备和老旧 iOS 设备（iPhone 5s 及更早）不支持。
        策略：ASTC 作为主力格式，ETC2 作为 fallback。Cocos 构建时可以为同一张纹理
        输出多份压缩格式，运行时引擎自动选择设备支持的格式。
      </p>

      <h3>Q2: 纹理内存超过预算了，从哪里开始砍？</h3>
      <p>
        优先级排序（从影响最小到最大）：
        ① 关闭不需要的 Mipmap（省 33%）；
        ② 将背景大图尺寸从 2048 降到 1024（省 75%）；
        ③ RGBA 转 RGB（有 Alpha 的检查是否真的需要——省 50%）；
        ④ 将叠放 UI 拆分，每个只保留可见部分；
        ⑤ 将粒子纹理从 256 降到 128；
        ⑥ ETC2 RGBA 转 ETC1 RGB + 单独 Alpha 通道（老设备才需要——省 50%）。
        这和前端砍 JS Bundle 一样——先找最大的模块下手。
      </p>

      <h3>Q3: ETC1 不支持 Alpha 通道，半透明贴图怎么办？</h3>
      <p>
        两种方案：① 将 Alpha 信息单独存一张灰度纹理（ETC1 A 通道分离法），
        Shader 中采样两张纹理合成 RGBA——代价是双倍纹理读取和额外的 Shader 开销；
        ② 直接放弃 ETC1，使用 ETC2（覆盖率 &gt; 95%）。2026 年了，
        为了极少数老旧设备牺牲质量和代码复杂度通常不划算。
      </p>

      <h3>Q4: 为什么要在意 DrawCall？</h3>
      <p>
        DrawCall 是 CPU 告诉 GPU "画这个"的指令。同一 Atlas 里的 Sprite 可以被合批
        （Batch）——一次 DrawCall 画好多张。不同 Atlas 的 Sprite 无法合批——
        每张一个 DrawCall。目标：DrawCall &le; 50。这就像前端的 HTTP 请求合并——
        CSS Sprite 把好多小图标拼成一张大图，一次请求加载所有，SpriteAtlas 就是
        CSS Sprite 的 GPU 版本。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>ETC2、ASTC、PVRTC 各自适用于什么平台？bpp 分别是多少？</li>
        <li>如何计算一张纹理的 GPU 内存占用？公式是什么？</li>
        <li>移动端纹理内存预算一般是多少？如果超了应该从哪里开始优化？</li>
        <li>SpriteAtlas 的分组原则是什么？为什么不能用"美术分类"来分组？</li>
        <li>Mipmap 的内存代价是多少？什么场景需要、什么场景不需要？</li>
        <li>如何在 Cocos 编辑器中为不同平台设置不同的纹理压缩格式？</li>
        <li>运行时如何根据设备内存自动切换纹理质量？分档策略的依据是什么？</li>
        <li>Cocos Profiler 纹理面板中应该关注哪三个关键指标？</li>
        <li>为什么 RGBA 内存是 RGB 的两倍？什么情况下可以安全地关掉 Alpha 通道？</li>
        <li>前端 srcset 图片自适应和游戏纹理压缩格式选择在思想上有哪些共同点？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
