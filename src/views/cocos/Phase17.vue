<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="17" title="场景管理与转场" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>单场景 = 所有东西挤在一起。多场景 = 像 Vue Router 一样组织结构——启动场景加载资源，菜单场景选关卡，游戏场景打飞机，结算场景看分数。这一节讲怎么设计多场景架构。</p>
    </ConceptBlock>

    <ConceptBlock icon="🗺️" title="场景结构：像 Vue Router 一样设计">
      <pre>Boot.scene      —— 加载全局资源，初始化 GameManager，跳转到 MainMenu
MainMenu.scene  —— 开始按钮、设置、排行榜
Game.scene      —— 核心玩法
GameOver.scene  —— 分数展示、重试按钮、返回菜单</pre>
      <p>为什么需要 Boot 场景？因为 <code>director.loadScene</code> 是异步的——如果在 MainMenu 中才开始加载 30MB 的游戏资源，玩家会在菜单页面等好几秒。Boot 场景在后台静默加载，加载完自动跳转。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔄" title="场景切换 + 数据传递">
      <pre>// 方法一：全局 Manager（简单）
GameManager.instance.finalScore = 12500
director.loadScene('GameOver')

// 方法二：Scene 参数（标准）
director.loadScene('GameOver', (err, scene) => {
  const ui = scene.getComponentInChildren(GameOverUI)
  ui.finalScore = 12500
})</pre>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>开放世界的流式加载：</strong> 《塞尔达传说》的海拉鲁大陆不可能一次加载进内存。它用 World Streaming 技术——只加载玩家周围一定范围内的场景，远处的卸载，近处的加载。这种技术在小游戏里不需要，但了解它能让你理解"场景管理"不是一个简单问题。</li>
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
      <ol>
        <li>为什么要把游戏拆成多个场景，而不是一个场景里切换不同的预制体/Panel？从资源加载、代码组织和团队协作三个角度思考。</li>
        <li><code>director.loadScene</code> 是异步的——场景加载过程中旧场景还在运行吗？如果玩家在加载过程中疯狂点击按钮会发生什么？怎么处理这种边界情况？</li>
        <li>跨场景传递数据有哪几种方式？全局 Manager 单例和 loadScene 回调各适合什么场景？它们各自的缺点是什么？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
