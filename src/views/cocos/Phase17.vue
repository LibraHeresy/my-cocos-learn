<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="17" title="场景管理与转场" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>你打开一个 App——闪屏→首页→详情→返回。这个"页面栈"你每天都在经历，但你有没有想过：<strong>那个闪屏在干嘛？</strong> 它不是装饰——它在加载资源。游戏也一样：Logo→主菜单→游戏中→结算。但游戏多了一个问题：加载。一个场景可能包含几十 MB 的纹理、音频、动画——如果你让玩家在"开始游戏"按钮前等 5 秒，60% 的人会直接关掉。这一节讲怎么像 Vue Router 一样设计场景架构，同时让玩家感觉不到加载。</p>
    </ConceptBlock>

    <ConceptBlock icon="⏳" title="闪屏到底在干什么？——一个前端工程师都能理解的加载之谜">
      <p>你有没有注意过——启动一个大型 App 时，闪屏会停留 1-3 秒。这 3 秒不是设计师觉得 Logo 好看想多给你看看。这 3 秒里发生的事：</p>
      <ol>
        <li><strong>初始化引擎</strong>（加载 JS 运行时、WebGL 上下文）</li>
        <li><strong>加载全局资源</strong>（纹理图集、音频文件、字体）</li>
        <li><strong>初始化全局 Manager</strong>（GameManager、AudioManager）</li>
        <li><strong>验证本地数据</strong>（存档、设置、登录状态）</li>
      </ol>
      <p>这和 Web 前端的"首屏加载"是同一个问题——只不过在游戏里，加载失败不是白屏，是<strong>纹理缺失导致粉红色方块</strong>（Unity 经典 Bug）。解决之道也是一样的：<strong>懒加载 + 预加载 + 骨架屏（游戏里叫 Loading Screen）</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="🗺️" title="场景结构：像 Vue Router 的路由树一样设计">
      <p>单场景 = 所有东西挤在一起。多场景 = 像 Vue Router 一样组织结构——启动场景加载资源，菜单场景选关卡，游戏场景打飞机，结算场景看分数。每一个场景就是一个"页面"，场景之间的跳转就是"路由切换"：</p>
      <pre>Boot.scene      —— 加载全局资源，初始化 GameManager，跳转到 MainMenu
MainMenu.scene  —— 开始按钮、设置、排行榜
Game.scene      —— 核心玩法
GameOver.scene  —— 分数展示、重试按钮、返回菜单</pre>
      <div class="tip-box">
        <strong>前端类比一：</strong> 场景结构 ≈ <strong>Vue Router 路由树</strong>。Boot = 全局 beforeResolve（加载资源→解析→进入首页）；MainMenu = '/'（首页路由）；Game = '/game'（核心页面）；GameOver = '/result'（结果页）。<code>director.loadScene('Game')</code> 就是 <code>router.push('/game')</code>——一个是加载场景，一个是加载组件，概念上完全对称。
      </div>
      <p>为什么需要 Boot 场景？因为 <code>director.loadScene</code> 是异步的——如果在 MainMenu 中才开始加载 30MB 的游戏资源，玩家会在菜单页面等好几秒。Boot 场景在后台静默加载，加载完自动跳转。这和 Webpack 的 Code Splitting + Lazy Loading 是一样的思路：<strong>先让用户看到东西，然后在后台加载重的部分</strong>。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔄" title="场景切换 + 数据传递：router.push + Pinia persist">
      <p>切换场景时怎么传递数据？和前端一样，有两种主要思路：</p>
      <pre>// 方法一：全局 Manager（Pinia store 模式）
GameManager.instance.finalScore = 12500
director.loadScene('GameOver')
// GameOver 场景 onLoad 时直接从 GameManager 读取

// 方法二：Scene 回调参数（router.push 的 query/params 模式）
director.loadScene('GameOver', (err, scene) => {
  const ui = scene.getComponentInChildren(GameOverUI)
  ui.finalScore = 12500
})</pre>
      <div class="tip-box">
        <strong>前端类比二：</strong> 跨场景数据传递 ≈ <strong>Pinia persist plugin + router.push params</strong>。<code>GameManager.instance.score</code> = Pinia store（跨"页面"持久化），<code>director.addPersistRootNode()</code> = Pinia persist plugin（即使路由切换也不销毁）。loadScene 回调传参 = <code>router.push({ path: '/result', query: { score: 12500 } })</code>。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✨" title="转场动画：游戏世界的 Vue Transition">
      <p>场景直接切过去——黑屏半秒——新场景出现。这种体验像是"游戏卡了"。加一个 0.5 秒的淡入淡出转场，体验立刻变成"场景流畅切换"。这和 Vue 的 <code>&lt;Transition&gt;</code> 组件的设计意图完全一致：</p>
      <div class="tip-box">
        <strong>前端类比三：</strong> 转场动画 ≈ <strong>Vue <code>&lt;Transition&gt;</code> 组件</strong>。<code>fadeOut</code> = <code>leave-active</code> 过渡（旧场景淡出），<code>fadeIn</code> = <code>enter-active</code> 过渡（新场景淡入）。Vue Transition 通过 CSS opacity + duration 来平滑切换；Cocos 转场同样通过 tween opacity + duration——连参数名都一样。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>GTA V 和《塞尔达传说：旷野之息》的开放世界流式加载——场景管理的终极形态：</strong> 2013 年，《GTA V》的 Los Santos 地图大约 127 平方公里，包含超过 20 万种不同的模型和纹理。如果一次性加载，需要约 80GB 内存——没有消费级 PC 装得下。Rockstar 的解决方案是<strong>World Streaming</strong>：以玩家为中心的 300 米半径内加载高精度模型，300-500 米加载低精度版本，500 米外只加载地形轮廓。玩家开车时，加载系统需要在每一帧判断"哪些区域该加载了、哪些该卸载了"——而且不能让玩家感觉到建筑在"凭空出现"。2017 年《旷野之息》更进一步——它在玩家向地平线眺望时提前加载远景的地形和敌人营地。你在开发微信小游戏时不需要 World Streaming（场景太小了），但理解"加载不是一次性完成的"这个思想，会让你在设计 Boot 场景时更有想象力。</li>
        <li><strong>Unity Addressable Assets vs Cocos Bundle——不止是"加载资源"：</strong> 2018 年，Unity 推出了 Addressable Assets 系统，核心理念是"资源不再绑定在场景上，而是一个独立的、可寻址的资产包"。这和 Cocos Creator 的 Bundle 系统（2019 年推出）目标一致——允许你按需加载资源包，而不是在启动时一次性加载所有东西。但两个系统背后都藏着一个更深的哲学问题：<strong>如何管理资源的生命周期</strong>。哪些资源是全局永驻的（UI 材质、音效管理器）？哪些是场景限定的（Boss 的纹理、BGM）？哪些是可以随时释放的（上一关的场景数据）？这和前端 Webpack 的 Code Splitting（<code>import()</code>动态导入 + chunk 分割）完全是一种思路——只是游戏的资源体积通常是前端的 10-100 倍，所以做错更疼。</li>
        <li><strong>《战神》（2018）的"一镜到底"——当场景切换变成艺术：</strong> 2018 年 Santa Monica Studio 的《战神》做出了一个惊人的技术决定：全游戏<strong>没有任何场景切换</strong>。没有加载画面、没有黑屏、没有"传送点"——从开场到结尾，摄像机始终跟随着奎托斯，像一个连续的长镜头。为了实现这一点，技术团队在<strong>玩家走路的 2 秒内</strong>，在后台卸载身后刚走过的场景、加载面前即将到达的场景——玩家在上一个区域战斗，下一个区域的 Boss 已经在内存里等着了。这种"无缝加载"是目前游戏场景管理的巅峰之作，但它的核心原理和你 Boot.scene 的预加载是一模一样的：<strong>提前加载，让用户感觉不到等待</strong>。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：创建三场景 + 淡入淡出转场 + 跨场景数据传递">
      <p>在你的 Cocos 项目中新建三个场景文件，实现完整的场景流转。每个场景都绑定对应的脚本：</p>
      <p><strong>1. 创建三个场景</strong></p>
      <pre>// Boot.scene 脚本 —— 加载资源，自动跳转
@ccclass('BootController')
export class BootController extends Component {
  onLoad() {
    // 初始化 GameManager 后自动跳转
    director.loadScene('MainMenu')
  }
}

// MainMenu.scene 脚本 —— 显示 UI，点击开始
@ccclass('MainMenuController')
export class MainMenuController extends Component {
  onStartGame() {
    // 方法一：通过全局 Manager 传初始数据
    GameManager.instance.score = 0
    GameManager.instance.lives = 3
    GameManager.instance.currentWave = 1

    // 方法二：通过 loadScene 回调传数据
    director.loadScene('Game', (err, scene) => {
      if (err) { console.error('场景加载失败:', err); return }
      // 场景加载完成后，拿到 Game 场景的根节点配置
      const gameCtrl = scene.getComponentInChildren(GameController)
      if (gameCtrl) {
        gameCtrl.difficulty = 'normal'
      }
    })
  }
}

// Game.scene 脚本 —— 核心玩法
@ccclass('GameController')
export class GameController extends Component {
  difficulty: string = 'normal'  // 由 MainMenu 通过回调设置

  onGameOver() {
    director.loadScene('GameOver')
  }
}

// GameOver.scene 脚本 —— 显示分数，重试或返回菜单
@ccclass('GameOverController')
export class GameOverController extends Component {
  @property(Label) scoreLabel: Label = null!

  onLoad() {
    // 从 GameManager 读取最终分数
    this.scoreLabel.string = `最终得分: ${GameManager.instance.score}`
  }

  onRetry() {
    director.loadScene('Game')
  }

  onBackToMenu() {
    director.loadScene('MainMenu')
  }
}</pre>
      <p><strong>2. 淡入淡出转场效果</strong></p>
      <pre>// TransitionManager.ts —— 挂在一个持久化节点上
@ccclass('TransitionManager')
export class TransitionManager extends Component {
  @property(Node) fadeOverlay: Node = null!  // 一个全屏黑色 Sprite

  onLoad() {
    // 初始：完全不透明 → 淡入显示
    this.fadeIn(1.0, () => {
      console.log('场景准备就绪')
    })
  }

  fadeOut(duration: number, onComplete?: () => void) {
    // 从透明 → 不透明（离开场景）
    const sprite = this.fadeOverlay.getComponent(Sprite)
    const from = new Color(0, 0, 0, 0)
    const to = new Color(0, 0, 0, 255)

    tween(sprite)
      .to(duration, { color: to }, { onUpdate: (target: Sprite, ratio: number) => {
        // tween color 的插值
      }})
      .call(() => onComplete?.())
      .start()
  }

  fadeIn(duration: number, onComplete?: () => void) {
    // 从不透明 → 透明（进入场景）
    const sprite = this.fadeOverlay.getComponent(Sprite)
    const from = new Color(0, 0, 0, 255)
    const to = new Color(0, 0, 0, 0)

    tween(sprite)
      .to(duration, { color: to })
      .call(() => onComplete?.())
      .start()
  }
}

// 使用：切换场景前先 fadeOut，加载完新场景再 fadeIn
export function loadSceneWithTransition(sceneName: string) {
  TransitionManager.instance.fadeOut(0.5, () => {
    director.loadScene(sceneName, () => {
      TransitionManager.instance.fadeIn(0.5)
    })
  })
}</pre>
      <p><strong>验证：</strong> 运行后你应该看到 Boot → MainMenu（自动跳转）→ 点击按钮 → 屏幕变黑 0.5s → Game 场景出现并淡入 → 游戏结束 → GameOver 场景显示分数。整个流程像完整游戏一样流畅。</p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <p>学完这一节，你应该能回答：</p>
      <ol>
        <li>为什么要把游戏拆成多个场景，而不是在一个场景里切换不同的预制体/Panel？从资源加载（内存占用）、代码组织（关注点分离）和团队协作（多人并行开发）三个角度思考。</li>
        <li><code>director.loadScene</code> 是异步的——场景加载过程中旧场景还在运行吗？如果玩家在加载过程中疯狂点击按钮会发生什么？如何用一个"加载中"遮罩来阻止这种边界情况？（提示：这和 Vue Router 的 <code>beforeEach</code> + Loading 状态是同一个思路）</li>
        <li>跨场景传递数据有全局 Manager 和 loadScene 回调两种方式。它们各自适合什么场景？如果 GameOver 场景需要读取"玩家使用的角色皮肤 ID"和"本局击杀数"——你会用哪种方式？为什么？</li>
        <li>转场动画在功能上不是必需的——没有淡入淡出照样能切换场景。为什么几乎每个商业游戏都有转场动画？它解决的是设计问题还是技术问题？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
