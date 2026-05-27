<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="13" title="国际化 i18n" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>搭建<strong>JSON 字符串表</strong>——所有文案集中管理、按语言 key-value 映射</li>
        <li>实现<strong>运行时语言切换</strong>——玩家切换语言后，所有 Label 自动刷新</li>
        <li>处理<strong>字体回退</strong>（Font Fallback）——中文/日文/韩文使用不同的字体子集</li>
        <li>在微信小游戏中<strong>自动检测系统语言</strong>（<code>wx.getSystemInfoSync().language</code>）</li>
        <li>编写 <strong>I18nManager</strong>——加载 locale JSON、应用到所有 Label</li>
        <li>了解 <strong>RTL（从右到左）</strong>布局的考量——阿拉伯语/希伯来语的特殊处理</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="游戏 i18n vs 前端 i18n——惊人的相似">
      <p>
        如果你用过 <code>vue-i18n</code> 或 <code>react-intl</code>，游戏国际化就是
        <strong>完全相同的思路</strong>。只是"DOM"变成了"Label 组件"，"template 中的
        <code v-pre>{{ $t }}</code>"变成了"代码中的 <code>I18nManager.t('key')</code>"。
      </p>

      <h3>概念对照</h3>
      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>vue-i18n / react-intl</th>
            <th>Cocos 游戏 i18n</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>翻译文件</td>
            <td><code>zh-CN.json</code> / <code>en.json</code></td>
            <td><strong>完全相同的 JSON 结构</strong></td>
          </tr>
          <tr>
            <td>翻译函数</td>
            <td><code>$t('menu.start')</code> / <code>t('menu.start')</code></td>
            <td><code>I18nManager.t('menu.start')</code></td>
          </tr>
          <tr>
            <td>参数插值</td>
            <td><code>$t('score', { n: 100 })</code></td>
            <td><code>I18nManager.t('score', { n: 100 })</code></td>
          </tr>
          <tr>
            <td>语言检测</td>
            <td><code>navigator.language</code></td>
            <td><code>wx.getSystemInfoSync().language</code></td>
          </tr>
          <tr>
            <td>动态切换</td>
            <td>Vue 响应式——模板自动更新</td>
            <td>刷新所有 Label 组件（手动触发）</td>
          </tr>
          <tr>
            <td>复数规则</td>
            <td><code>$tc('apple', count)</code></td>
            <td>数据驱动——按 key 区分 <code>apple_singular</code>/<code>apple_plural</code></td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>关键认知：</strong>游戏 i18n 和前端 i18n 唯一的区别是"响应式"。
        Vue 中切换语言后，所有模板自动重新渲染，因为 <code>$t()</code> 是响应式的。
        而在 Cocos 中，Label 的 <code>string</code> 属性不是响应式的——你需要
        手动遍历所有 Label 组件并更新它们的 <code>string</code>。仅此而已。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📋" title="JSON 字符串表——所有文案一处管">
      <p>
        和前端项目一样，游戏中的所有用户可见文案都应该集中管理在 JSON 文件中，
        而不是散落在各个脚本的字符串字面量里。这样做有三个好处：
        ① 翻译人员不需要看代码；② 同一个 key 在多个地方使用自动保持一致；
        ③ 可以工具化检查缺失翻译。
      </p>

      <h3>翻译文件结构</h3>
      <pre><code>// resources/i18n/zh-CN.json
{
  "menu": {
    "title": "像素飞机大战",
    "start": "开始游戏",
    "settings": "设置",
    "continue": "继续游戏"
  },
  "game": {
    "score": "分数: {0}",
    "wave": "第 {0} 波",
    "pause": "暂停",
    "resume": "继续",
    "quit": "退出"
  },
  "result": {
    "win": "胜利！",
    "lose": "失败",
    "finalScore": "最终分数: {0}",
    "bestScore": "最高分: {0}",
    "replay": "再来一局",
    "share": "分享成绩"
  },
  "shop": {
    "title": "商店",
    "buy": "购买",
    "equip": "装备",
    "owned": "已拥有",
    "insufficient": "金币不足"
  },
  "settings": {
    "title": "设置",
    "music": "音乐",
    "sfx": "音效",
    "language": "语言",
    "on": "开",
    "off": "关"
  }
}

// resources/i18n/en.json
{
  "menu": {
    "title": "Pixel Airplane War",
    "start": "Start Game",
    "settings": "Settings",
    "continue": "Continue"
  },
  "game": {
    "score": "Score: {0}",
    "wave": "Wave {0}",
    "pause": "Pause",
    "resume": "Resume",
    "quit": "Quit"
  },
  "result": {
    "win": "Victory!",
    "lose": "Defeat",
    "finalScore": "Final Score: {0}",
    "bestScore": "Best Score: {0}",
    "replay": "Play Again",
    "share": "Share"
  },
  "shop": {
    "title": "Shop",
    "buy": "Buy",
    "equip": "Equip",
    "owned": "Owned",
    "insufficient": "Not Enough Coins"
  },
  "settings": {
    "title": "Settings",
    "music": "Music",
    "sfx": "SFX",
    "language": "Language",
    "on": "On",
    "off": "Off"
  }
}</code></pre>

      <h3>Key 命名约定</h3>
      <pre><code>推荐的 key 层级结构：
  {场景}.{区域}.{元素}

  menu.start         ← 菜单场景 / 开始按钮
  game.score         ← 游戏场景 / 分数
  result.finalScore  ← 结算场景 / 最终分数
  settings.music     ← 设置场景 / 音乐

避免：
  ❌ start_game_button —— 扁平，没有层级，多了就乱
  ❌ menu_start_button_zh —— key 不应包含语言信息
  ❌ 中文 key —— key 应该是语言无关的标识符</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🌐" title="I18nManager 核心实现">
      <p>
        I18nManager 是整个 i18n 系统的中枢——加载翻译文件、提供翻译方法、
        通知组件更新。设计思路和 vue-i18n 插件几乎一模一样。
      </p>

      <h3>I18nManager 完整实现</h3>
      <pre><code>// I18nManager.ts
import { _decorator, Component, Label, resources, JsonAsset } from 'cc'

export type LocaleData = Record&lt;string, any&gt;

const SUPPORTED_LOCALES = ['zh-CN', 'en', 'ja', 'ko', 'ar'] as const
export type Locale = typeof SUPPORTED_LOCALES[number]

export class I18nManager extends Component {
  private static _instance: I18nManager

  private _locale: Locale = 'zh-CN'
  private _data: LocaleData = {}
  private _labels: Label[] = []              // 已注册的需要自动更新的 Label
  private _labelKeys: WeakMap&lt;Label, string&gt; = new WeakMap()  // Label → i18n key

  static get instance(): I18nManager {
    return I18nManager._instance
  }

  onLoad() {
    I18nManager._instance = this
  }

  // ========== 初始化 ==========

  /** 初始化 i18n——加载语言文件 */
  async init(locale?: Locale): Promise&lt;void&gt; {
    if (locale) this._locale = locale
    await this.loadLocale(this._locale)
    this.refreshAllLabels()
  }

  /** 加载指定语言的 JSON 文件 */
  private async loadLocale(locale: Locale): Promise&lt;void&gt; {
    return new Promise((resolve, reject) => {
      resources.load(`i18n/${locale}`, JsonAsset, (err, asset) => {
        if (err) {
          console.warn(`[I18n] 未找到语言文件: ${locale}，使用默认中文`)
          this._data = {}
          resolve()
          return
        }
        this._data = asset.json as LocaleData
        console.log(`[I18n] 语言加载完成: ${locale}`)
        resolve()
      })
    })
  }

  // ========== 翻译 API ==========

  /**
   * 获取翻译文本
   * @param key 点号分隔的 key 路径，如 'menu.start'
   * @param args 插值参数，按 {0} {1} 顺序替换
   */
  t(key: string, ...args: any[]): string {
    const raw = this.getRawText(key) ?? key
    if (args.length === 0) return raw

    // 参数插值：'分数: {0}' + [100] → '分数: 100'
    return raw.replace(/\{(\d+)\}/g, (_, index) => {
      return String(args[parseInt(index)] ?? `{${index}}`)
    })
  }

  /** 获取原始翻译文本（不含参数插值） */
  private getRawText(key: string): string | null {
    const parts = key.split('.')
    let current: any = this._data
    for (const part of parts) {
      if (current == null) return null
      current = current[part]
    }
    return typeof current === 'string' ? current : null
  }

  // ========== 语言切换 ==========

  /** 切换语言 */
  async setLocale(locale: Locale): Promise&lt;void&gt; {
    if (locale === this._locale) return
    this._locale = locale
    await this.loadLocale(locale)
    this.refreshAllLabels()

    // 保存用户偏好
    sys.localStorage.setItem('i18n_locale', locale)
  }

  get locale(): Locale {
    return this._locale
  }

  /** 获取支持的语言列表 */
  get supportedLocales(): readonly Locale[] {
    return SUPPORTED_LOCALES
  }

  // ========== Label 绑定 ==========

  /**
   * 将一个 Label 绑定到某个 i18n key
   * 调用后 Label 的 string 会被自动设置，切换语言时也会自动更新
   */
  bindLabel(label: Label, key: string, ...args: any[]): void {
    this._labels.push(label)
    this._labelKeys.set(label, key)
    label.string = this.t(key, ...args)
  }

  /** 解绑 Label */
  unbindLabel(label: Label): void {
    const idx = this._labels.indexOf(label)
    if (idx !== -1) this._labels.splice(idx, 1)
    this._labelKeys.delete(label)
  }

  /** 刷新所有已绑定的 Label */
  refreshAllLabels(): void {
    for (const label of this._labels) {
      if (!label.isValid) continue
      const key = this._labelKeys.get(label)
      if (key) {
        label.string = this.t(key)
      }
    }
  }

  // ========== 便捷方法 ==========

  /** 场景中快速绑定——给所有 Label 设置 i18n */
  setupSceneLabels(root: Node): void {
    const labels = root.getComponentsInChildren(Label)
    for (const label of labels) {
      // 从 Label 节点的名称推断 key（命名约定）
      // 例如节点名 "menu.start" → i18n key "menu.start"
      const nodeName = label.node.name
      if (SUPPORTED_LOCALES.includes(nodeName as any)) continue  // 跳过语言节点本身
      if (nodeName.includes('.')) {
        this.bindLabel(label, nodeName)
      }
    }
  }
}</code></pre>

      <h3>组件中使用</h3>
      <pre><code>// 在任何脚本中使用 i18n
import { _decorator, Component, Label } from 'cc'
import { I18nManager } from './I18nManager'

export class MenuUI extends Component {
  onLoad() {
    const i18n = I18nManager.instance

    // 方式一：直接设置文本
    const titleLabel = this.node.getChildByName('Title')!.getComponent(Label)!
    titleLabel.string = i18n.t('menu.title')

    // 方式二：绑定 Label（切换语言时自动更新）
    const startLabel = this.node.getChildByName('StartBtn')!.getComponent(Label)!
    i18n.bindLabel(startLabel, 'menu.start')

    // 带参数插值
    const scoreLabel = this.node.getChildByName('Score')!.getComponent(Label)!
    scoreLabel.string = i18n.t('game.score', 1250)  // → "分数: 1250"
  }
}</code></pre>

      <div class="tip-box">
        <strong>前端类比：</strong><code>bindLabel()</code> 就是 Cocos 版的
        <code>v-text="$t('key')"</code>。区别在于 Vue 是响应式自动跟踪的，
        Cocos 中你需要手动维护这个绑定关系。但这也能用一个简单的装饰器或者
        <code>@property</code> 自定义 Inspector 面板来改善开发体验。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔤" title="字体回退与多语言字体">
      <p>
        不同语言需要不同的字体。中文需要覆盖 6763+ 常用汉字，日文需要假名字体，
        英文只需要 26 个字母。如果把所有字符集塞进一个字体文件，单字体文件就十几 MB——
        对小游戏来说是不可接受的。解决方案：<strong>按语言加载不同字体</strong>。
      </p>

      <h3>字体分包策略</h3>
      <pre><code>字体策略：

zh-CN（中文）：使用系统默认中文字体（0 MB）
  → 微信小游戏：系统默认字体已包含完整 CJK 字符集
  → 无需额外字体文件——节省大量空间

en（英文）：BitmapFont / 轻量 TTF（100-300 KB）
  → 只需要 26 字母 + 数字 + 常见标点

ja（日文）：系统字体 + 假名补丁（若有特殊风格需求）
  → 系统字体通常已覆盖平假名和片假名

ko（韩文）：系统字体
  → 谚文字母在主流系统中都有覆盖

ar（阿拉伯语）：特殊字体（RTL + 连字）
  → 阿拉伯语是连笔书写，需要支持连字（Ligature）的字体</code></pre>

      <h3>运行时字体切换</h3>
      <pre><code>// FontManager.ts —— 按语言加载字体
import { _decorator, Label, Font, resources } from 'cc'

interface FontConfig {
  locale: string
  fontPath: string       // 自定义字体资源路径（空字符串表示用系统默认）
  fontSize: number       // 可能需要调整（中文字小，英文字大）
  lineHeight: number
}

const FONT_CONFIGS: Record&lt;string, FontConfig&gt; = {
  'zh-CN': { locale: 'zh-CN', fontPath: '', fontSize: 24, lineHeight: 32 },
  'en':    { locale: 'en',    fontPath: 'fonts/en/font-en', fontSize: 26, lineHeight: 34 },
  'ja':    { locale: 'ja',    fontPath: '', fontSize: 24, lineHeight: 32 },
  'ko':    { locale: 'ko',    fontPath: '', fontSize: 24, lineHeight: 32 },
  'ar':    { locale: 'ar',    fontPath: 'fonts/ar/font-ar', fontSize: 26, lineHeight: 36 },
}

export class FontManager {
  /** 应用语言对应的字体到所有 Label */
  static async applyLocaleFont(locale: string, root: Node): Promise&lt;void&gt; {
    const config = FONT_CONFIGS[locale]
    if (!config) return

    const labels = root.getComponentsInChildren(Label)

    if (config.fontPath) {
      // 加载自定义字体
      const font = await FontManager.loadFont(config.fontPath)
      for (const label of labels) {
        label.font = font
        label.fontSize = config.fontSize
        label.lineHeight = config.lineHeight
      }
    } else {
      // 使用系统默认字体
      for (const label of labels) {
        label.fontSize = config.fontSize
        label.lineHeight = config.lineHeight
      }
    }
  }

  private static loadFont(path: string): Promise&lt;Font&gt; {
    return new Promise((resolve, reject) => {
      resources.load(path, Font, (err, font) => {
        if (err) reject(err)
        else resolve(font)
      })
    })
  }
}</code></pre>

      <div class="warn-box">
        <strong>字体体积警告：</strong>一个完整的中文 TTF 字体（如思源黑体）约 15-20 MB。
        在微信小游戏 4MB 主包限制和 20MB 分包限制下，你不可能把它打包进去。
        这也是为什么绝大多数小游戏都<strong>使用系统默认字体</strong>——0 MB，性能最好。
        只有英文字体因为体积小（几十 KB），可以考虑打包一个自定义字体来提升风格。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📱" title="微信小游戏语言检测">
      <p>
        微信小游戏可以自动检测系统语言，这样玩家不需要手动选择——进入游戏时
        自动匹配系统语言，体验更好。
      </p>

      <h3>自动检测实现</h3>
      <pre><code>// LanguageDetector.ts
export class LanguageDetector {
  /** 检测微信小游戏系统语言并映射到我们的 locale */
  static detect(): string {
    // 微信小游戏环境
    if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
      try {
        const info = wx.getSystemInfoSync()
        return LanguageDetector.mapWxLanguage(info.language)
      } catch (e) {
        console.warn('[I18n] 微信语言检测失败:', e)
      }
    }

    // Web 环境 —— navigator.language
    if (typeof navigator !== 'undefined') {
      const lang = navigator.language  // 如 'zh-CN', 'en-US', 'ja-JP'
      return LanguageDetector.mapBrowserLanguage(lang)
    }

    return 'zh-CN'  // 默认中文
  }

  /** 微信系统语言 → 我们的 locale */
  private static mapWxLanguage(wxLang: string): string {
    const map: Record&lt;string, string&gt; = {
      'zh_CN': 'zh-CN',
      'zh_TW': 'zh-CN',  // 繁体先映射到简体（后续可扩展）
      'en': 'en',
      'ja': 'ja',
      'ko': 'ko',
      'ar': 'ar',
    }
    return map[wxLang] ?? 'en'  // 未知语言默认英语
  }

  /** 浏览器语言 → 我们的 locale */
  private static mapBrowserLanguage(browserLang: string): string {
    const lang = browserLang.split('-')[0].toLowerCase()
    const map: Record&lt;string, string&gt; = {
      'zh': 'zh-CN',
      'en': 'en',
      'ja': 'ja',
      'ko': 'ko',
      'ar': 'ar',
    }
    return map[lang] ?? 'en'
  }
}

// ===== 启动时使用 =====
// app.ts 或 main entry
async function initGame() {
  const detected = LanguageDetector.detect()
  const saved = sys.localStorage.getItem('i18n_locale')  // 用户上次手动选择的
  const locale = saved || detected
  await I18nManager.instance.init(locale as any)
}</code></pre>

      <h3>语言设置 UI</h3>
      <pre><code>// LanguagePickerUI.ts —— 设置页面的语言选择器
import { _decorator, Component, Node, Label, Button } from 'cc'
import { I18nManager, Locale } from './I18nManager'

export class LanguagePickerUI extends Component {
  /** 创建语言选择按钮 */
  createLanguageButtons(): void {
    const i18n = I18nManager.instance
    const container = this.node

    for (const locale of i18n.supportedLocales) {
      const btnNode = this.createButton(locale)
      const label = btnNode.getComponentInChildren(Label)!

      // 显示语言名（用 native name）
      label.string = this.getLocaleNativeName(locale)

      btnNode.on(Button.EventType.CLICK, async () => {
        await i18n.setLocale(locale)
        this.highlightSelected(locale)
      })

      container.addChild(btnNode)
    }
  }

  private getLocaleNativeName(locale: string): string {
    const names: Record&lt;string, string&gt; = {
      'zh-CN': '简体中文',
      'en': 'English',
      'ja': '日本語',
      'ko': '한국어',
      'ar': 'العربية',
    }
    return names[locale] ?? locale
  }
}</code></pre>

      <div class="tip-box">
        <strong>前端类比：</strong>这和 <code>navigator.language</code> + <code>localStorage</code>
        的检测策略完全一致：先读用户上次手动选择（<code>localStorage</code>），
        如果没有再读系统语言（<code>navigator.language</code>），最后 fallback 到默认语言。
        vue-i18n 和 react-intl 都是这么做的。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="↔️" title="RTL（从右到左）——阿拉伯语/希伯来语的挑战">
      <p>
        RTL（Right-to-Left）语言是一个容易被忽略但非常重要的话题。
        如果你的目标市场包括中东地区（巨大的游戏市场！），就必须处理 RTL。
      </p>

      <h3>RTL 需要处理的内容</h3>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>LTR（中文/英文）</th>
            <th>RTL（阿拉伯语/希伯来语）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>文字方向</td>
            <td>从左到右</td>
            <td>从右到左</td>
          </tr>
          <tr>
            <td>UI 布局</td>
            <td>返回按钮在左上角</td>
            <td>返回按钮在右上角（镜像）</td>
          </tr>
          <tr>
            <td>进度条方向</td>
            <td>从左到右填充</td>
            <td>从右到左填充</td>
          </tr>
          <tr>
            <td>图标方向</td>
            <td>箭头指向右（表示"下一步"）</td>
            <td>箭头指向左（表示"下一步"）</td>
          </tr>
          <tr>
            <td>数值增长</td>
            <td>分数向左增长</td>
            <td>分数向右增长</td>
          </tr>
        </tbody>
      </table>

      <h3>简单 RTL 处理方案</h3>
      <pre><code>// RTLUtils.ts
export class RTLUtils {
  /** 判断当前语言是否为 RTL */
  static isRTL(locale: string): boolean {
    return ['ar', 'he', 'fa', 'ur'].includes(locale.slice(0, 2))
  }

  /** RTL 镜像偏移——将 x 坐标翻转到对面 */
  static mirrorX(x: number, containerWidth: number): number {
    return containerWidth - x
  }

  /** 对场景中的所有节点应用 RTL 镜像布局 */
  static applyRTLLayout(root: Node, screenWidth: number): void {
    // 简单方案：将 Canvas 根节点 scaleX = -1（镜像翻转）
    // 警告：这也会翻转文字！需要再给 Label 节点设置 scaleX = -1 翻回来
    root.setScale(-1, 1, 1)

    const labels = root.getComponentsInChildren(Label)
    for (const label of labels) {
      // Label 本身翻回来，文字可读
      label.node.setScale(-1, 1, 1)

      // 调整文本水平对齐
      label.horizontalAlign = label.horizontalAlign === 0 ? 1 : 0  // LEFT ↔ RIGHT
    }
  }
}</code></pre>

      <div class="warn-box">
        <strong>简单方案 vs 完整方案：</strong>上面 <code>scaleX = -1</code> 的方案
        可以快速让游戏支持 RTL（1 行代码），但有一些副作用：触摸坐标需要额外翻转、
        粒子方向会被镜像、物理碰撞体的坐标可能出错。如果你的项目确定要进入中东市场，
        建议从一开始就<strong>设计 layout-anchor 系统</strong>（类似 CSS 的
        <code>direction: rtl</code>），而不是事后打补丁。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 翻译文件超过 10KB，会不会影响游戏启动速度？</h3>
      <p>
        文本文件 10KB = 几乎零成本。真正影响启动速度的是<strong>字体文件</strong>。
        策略：语言 JSON 文件始终内包在主包中（10KB 占 4MB 的 0.25%），
        自定义字体放在 Asset Bundle 中按需加载——不是所有玩家都需要阿拉伯语字体。
      </p>

      <h3>Q2: 如何保证所有翻译 key 都有对应的翻译？</h3>
      <p>
        编写一个简单的脚本检查：遍历所有的 locale 文件，确保每个 key 在所有语言中
        都存在对应的值。可以在 CI 中运行这个检查——如果有缺失翻译，CI 直接警告。
        这和前端 i18n 的 "missing key" 检查工具完全一样。
      </p>

      <h3>Q3: 参数插值要考虑语法顺序吗？</h3>
      <p>
        推荐使用位置参数 <code>{0}</code>，而不是命名参数——因为不同语言的语序不同。
        中文："分数: {0}"，英文："Score: {0}"（顺序相同，没问题）。但如果遇到语序差异：
        中文："{0} 摧毁了 {1}"（玩家先，敌人后），日语："{1}を{0}が破壊した"（敌人先，玩家后）。
        用位置参数可以灵活调整顺序。命名参数（<code>{player}</code>）则不行。
      </p>

      <h3>Q4: 日文和韩文可以用中文字体渲染吗？</h3>
      <p>
        部分可以，但不推荐。中文字体包含大部分日文汉字和韩文汉字，但缺少日文假名
        （平假名/片假名）和韩文谚文。如果你的游戏中有假名或谚文字符，中文字体会显示
        为方框（tofu）。同样，日文字体中不包含中文独有的汉字。最佳实践：
        每种语言用各自的系统默认字体——0MB，完美覆盖。只有在需要品牌字体风格时
        才单独打包。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>游戏 i18n 的 JSON 字符串表应该如何组织 key 的层级结构？</li>
        <li>I18nManager 的 <code>bindLabel()</code> 和 vue-i18n 的 <code>$t()</code> 有什么本质区别？</li>
        <li>运行时切换语言后，如何让所有 Label 自动更新文本？</li>
        <li>为什么大型中文字体不适合打包在小游戏中？系统默认字体有什么优势？</li>
        <li>微信小游戏中如何自动检测系统语言？检测到的语言标识和我们自己的 locale 如何映射？</li>
        <li>RTL 语言（阿拉伯语/希伯来语）需要处理哪 5 个维度的变化？</li>
        <li><code>scaleX = -1</code> 快速 RTL 方案有什么副作用？</li>
        <li>参数插值应该使用位置参数 <code>{0}</code> 还是命名参数？为什么？</li>
        <li>翻译文件应该放在主包还是 Asset Bundle 中？为什么？</li>
        <li>如何自动检测缺失的翻译 key？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
