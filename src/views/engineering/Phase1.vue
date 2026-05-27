<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="1" title="微信小游戏适配与发布" duration="2-3 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解<strong>微信小游戏</strong> JS 运行环境和浏览器的核心差异</li>
        <li>适配音频系统——小游戏中最容易出问题的模块</li>
        <li>用 <strong>Bundle 分包</strong>突破 <strong>4MB</strong> 主包限制</li>
        <li>接入微信分享、排行榜、<strong>激励视频</strong>广告</li>
        <li>处理 <strong>onShow/onHide</strong> 生命周期</li>
        <li>完成审核上线全流程</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="JS Core ≠ 浏览器 —— 小游戏运行环境本质">
      <p>
        你在浏览器里开发调试，但微信小游戏的 JS 运行环境<strong>不是浏览器</strong>。iOS 上是
        JavaScriptCore，Android 上是 V8。Web 版能跑的代码 ≠ 小游戏能跑的代码：
      </p>

      <table>
        <thead>
          <tr>
            <th>特性</th>
            <th>Web 版</th>
            <th>小游戏版</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>JS 引擎</td>
            <td>V8（Chrome）</td>
            <td>JSCore（iOS）/ V8（Android）</td>
          </tr>
          <tr>
            <td>DOM API</td>
            <td><code>window</code> / <code>document</code> / <code>navigator</code></td>
            <td>全部不存在——不能碰任何 DOM API</td>
          </tr>
          <tr>
            <td>Canvas</td>
            <td>可创建多个 <code>HTMLCanvasElement</code></td>
            <td><code>wx.createCanvas()</code> 返回唯一主画布</td>
          </tr>
          <tr>
            <td>音频</td>
            <td>Web Audio API（<code>AudioContext</code>）</td>
            <td><code>wx.createInnerAudioContext()</code></td>
          </tr>
          <tr>
            <td>网络</td>
            <td>任意域名</td>
            <td>必须 HTTPS + 后台域名白名单</td>
          </tr>
          <tr>
            <td>localStorage</td>
            <td><code>window.localStorage</code>（5-10MB）</td>
            <td><code>wx.setStorageSync</code>（Cocos 已适配，上限 10MB）</td>
          </tr>
          <tr>
            <td>字体</td>
            <td>系统字体库直接使用</td>
            <td>必须内嵌字体文件或使用位图字体</td>
          </tr>
          <tr>
            <td>包体积</td>
            <td>无硬性限制</td>
            <td>主包 ≤ 4MB，总包 ≤ 20MB</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>核心认知：</strong>Chrome DevTools 里正常运行 ≠ 微信里能跑。很多浏览器 API
        在小游戏环境直接 <code>undefined</code>。每改完一个功能，必须在真机上跑一次。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔄" title="生命周期 —— onShow / onHide">
      <p>
        微信小游戏在用户切后台（聊天、锁屏）时会挂起，切回来时恢复。这和前端熟悉的
        <code>Page Visibility API</code> 完全一样——你应该在 GameManager 中监听：
      </p>

      <pre><code>// GameManager.ts —— onLoad 中注册
wx.onShow(() => {
  if (GameManager.instance.state === GameState.PAUSED) {
    GameManager.instance.resumeGame()
    AudioManager.instance.resumeBGM()
  }
})

wx.onHide(() => {
  if (GameManager.instance.state === GameState.PLAYING) {
    GameManager.instance.pauseGame()
    AudioManager.instance.pauseBGM()
    // 保存临时进度——小游戏有可能被系统杀掉
    sys.localStorage.setItem('tempScore', String(this._score))
  }
})</code></pre>

      <table>
        <thead>
          <tr>
            <th>微信事件</th>
            <th>前端类比</th>
            <th>游戏该做什么</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>wx.onShow</code></td>
            <td>
              <code
                >document.addEventListener('visibilitychange', () => document.hidden ===
                false)</code
              >
            </td>
            <td>恢复游戏、恢复 BGM、检查临时存档</td>
          </tr>
          <tr>
            <td><code>wx.onHide</code></td>
            <td>
              <code
                >document.addEventListener('visibilitychange', () => document.hidden === true)</code
              >
            </td>
            <td>暂停游戏、暂停 BGM、保存临时进度</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>注意：</strong>Cocos 的 <code>director.pause()</code> 和
        <code>director.resume()</code>
        会暂停/恢复所有节点的 update。但如果你的定时器用的是
        <code>setTimeout</code> 而不是
        <code>scheduleOnce</code>，切后台时它仍然在滴答——回来后可能触发意外行为。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔊" title="音频适配 —— 和 Web 版差异最大的模块">
      <p>
        音频是小游戏适配的<strong>P0 级别重灾区</strong>。音频课程阶段 4 的 AudioManager 在 Web
        端完美运行，到了小游戏可能完全无声。
      </p>

      <h3>① 格式：全部用 MP3</h3>
      <p>
        OGG 在部分 Android 小游戏中完全无声（引擎调用链不支持）。构建前把音频课程阶段 2/3
        制作的所有音效和 BGM 统一转 MP3。
      </p>

      <h3>② 无缝 BGM 循环 —— 双 Context 交替播放</h3>
      <p>
        <code>InnerAudioContext.loop = true</code> 在循环末尾有一个微小间隙。标准解法是<strong
          >两个 InnerAudioContext 交替播放</strong
        >：
      </p>
      <pre><code>// WechatBGMPlayer.ts —— 小游戏专用 BGM 播放器
class WechatBGMPlayer {
  private _ctxA = wx.createInnerAudioContext()
  private _ctxB = wx.createInnerAudioContext()
  private _current: 'A' | 'B' = 'A'
  private _bgmPath = ''

  init(path: string) {
    this._bgmPath = path
    this._ctxA.src = path
    this._ctxB.src = path

    // 监听：当前 Context 快播完时，启动备用 Context
    this._ctxA.onTimeUpdate(() => {
      const remain = this._ctxA.duration - this._ctxA.currentTime
      if (this._current === 'A' && remain < 0.5) {
        this._ctxB.seek(0)
        this._ctxB.play()
        this._current = 'B'
      }
    })
    this._ctxB.onTimeUpdate(() => {
      const remain = this._ctxB.duration - this._ctxB.currentTime
      if (this._current === 'B' && remain < 0.5) {
        this._ctxA.seek(0)
        this._ctxA.play()
        this._current = 'A'
      }
    })
  }

  play() {
    this._ctxA.play()
    this._current = 'A'
  }

  stop() {
    this._ctxA.stop()
    this._ctxB.stop()
  }
}</code></pre>

      <h3>③ SFX 的 InnerAudioContext 池</h3>
      <p>
        小游戏中同时存在的 InnerAudioContext <strong>上限约 10 个</strong>。射击 + 爆炸 + 道具 + UI
        音效很容易超出——需要做<strong>音频 Context 池</strong>（和 Phase 6 对象池一个思路）：
      </p>
      <pre><code>// SFXPool.ts —— 预创建 8 个 Context，用完回收
class SFXPool {
  private _pool: InnerAudioContext[] = []
  private _index = 0

  constructor(size: number = 8) {
    for (let i = 0; i < size; i++) {
      this._pool.push(wx.createInnerAudioContext())
    }
  }

  play(path: string, volume: number = 1) {
    const ctx = this._pool[this._index]
    this._index = (this._index + 1) % this._pool.length
    ctx.src = path
    ctx.volume = volume
    ctx.play()
  }
}</code></pre>

      <div class="tip-box">
        <strong>池子耗尽怎么办：</strong>超过上限时，低优先级的音效（拾取、UI
        点击）直接丢弃，保射击和爆炸。可以用优先级队列实现，也可以用最简单的"循环覆盖"——最新音效覆盖最老的
        Context。
      </div>

      <h3>④ 自动播放限制</h3>
      <p>
        浏览器和微信都禁止在用户交互前播放音频。务必把
        <code>playBGM</code> 放在菜单"开始游戏"按钮的<strong>触摸回调</strong>中，而不是
        <code>onLoad</code> 中。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="📦" title="分包 —— 突破 4MB 主包限制">
      <p>
        微信小游戏主包硬性限制 4MB。Cocos 的
        <strong>Bundle</strong> 自动映射为小游戏分包——前端直觉直接平移：这就是
        <strong>Webpack 的 Code Splitting</strong>。
      </p>

      <h3>分包方案</h3>
      <pre><code>主包（≤ 4MB）：               分包 game（子包）：
├── 引擎核心                   ├── Game.scene
├── Menu.scene                 ├── 飞机/敌机/子弹 Sprite
├── Result.scene               ├── 爆炸帧动画 SpriteSheet
├── UI Sprite（按钮/数字）       ├── 道具 Sprite
├── 核心脚本                    └── 星空背景图
│   ├── GameManager.ts
│   ├── EventBus.ts            分包 audio（远程）：
│   ├── ObjectPool.ts          ├── bgm_battle.mp3
│   └── AudioManager.ts       ├── bgm_menu.mp3
└── 启动加载脚本                ├── bgm_boss.mp3
    └── 所有 SFX.mp3</code></pre>

      <h3>Cocos 操作</h3>
      <ol>
        <li>在资源管理器中，右键对应文件夹 → <strong>配置为 Bundle</strong></li>
        <li>设置 Bundle 名称和优先级</li>
        <li>构建面板中，把 Bundle 设为<strong>子包</strong>类型</li>
        <li>远程资源：把大体积的音频 Bundle 设为<strong>远程包</strong>（构建时填 CDN 地址）</li>
      </ol>

      <h3>运行时加载子包</h3>
      <pre><code>import { assetManager } from 'cc'

// 加载子包（类比 import() 动态加载）
assetManager.loadBundle('game', (err, bundle) => {
  if (err) { console.error('分包加载失败:', err); return }
  // 分包加载完成后，才能使用其中的场景和资源
  bundle.loadScene('GameScene')
})</code></pre>

      <div class="tip-box">
        <strong>验证方法：</strong>构建后在微信开发者工具 → 代码质量 →
        拆包分析，查看每个包的体积。主包超过 4MB 时，先从音频 Bundle 拆起——音频总是最大的。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📤" title="分享 —— 小游戏的核心获客渠道">
      <p>小游戏没有应用商店，分享是最主要的传播方式。飞机大战天然适合"炫耀分数"这个社交场景：</p>

      <h3>分享给好友</h3>
      <pre><code>// ResultUI.ts —— 结算场景中绑定"炫耀一下"按钮
wx.shareAppMessage({
  title: '我在像素飞机大战打了 9999 分！来挑战我 🚀',
  imageUrl: '',  // 分享图（5:4 比例），用 Aseprite 画一张游戏截图拼贴
  query: '',     // 可带参数，如 'inviter=xxx'
})

// 显示分享按钮（需要在游戏启动时调用）
wx.showShareMenu({
  menus: ['shareAppMessage', 'shareTimeline'],
})</code></pre>

      <h3>好友排行榜</h3>
      <p>微信云开发提供了免费的托管排行榜，<strong>不需要自建后端</strong>：</p>
      <pre><code>// 游戏结束时上传分数
wx.setUserCloudStorage({
  KVDataList: [{
    key: 'highScore',
    value: String(score),
  }],
})

// 获取好友排名（在排行榜 UI 中调用）
wx.getFriendCloudStorage({
  keyList: ['highScore'],
  success: (res) => {
    // res.data = [{ openid, nickname, avatarUrl, KVDataList }]
    // 按 highScore 降序排列 → 渲染排行榜
  },
})</code></pre>

      <div class="tip-box">
        <strong>体验原则：</strong>排行榜不要强制弹窗。放在结算页底部一个独立的"好友排行"Tab
        里——想看就点，不想看完全不干扰游戏。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📢" title="激励视频广告 —— 看广告复活一次">
      <p>
        激励视频是唯一<strong>不打断游戏体验</strong>的广告形式——用户主动选择看广告来获取奖励。对飞机大战来说，最自然的接入点是<strong>死亡后复活</strong>：
      </p>

      <h3>① 申请广告位</h3>
      <ol>
        <li>微信公众平台 → 流量主 → 广告管理 → 新建激励视频广告位</li>
        <li>获得 <code>adUnitId</code>（形如 <code>adunit-xxxxxxxxx</code>）</li>
      </ol>

      <h3>② 预加载</h3>
      <pre><code>// 在 GameManager.onLoad 中预加载
const videoAd = wx.createRewardedVideoAd({
  adUnitId: 'adunit-xxxxxxxxx',
})

videoAd.load()  // 提前加载，玩家点击时秒开
videoAd.onError(() => {
  // 无广告填充 → 降级方案：直接给复活
  videoAd.load()  // 重新尝试加载
})</code></pre>

      <h3>③ 死亡后触发</h3>
      <pre><code>// Player.ts → onDeath
onDeath() {
  // 弹出选择：看广告复活 / 直接结算
  videoAd.show()
    .then(() => {
      // 看完了 → 复活 + 2 秒无敌
      this._lives = 1
      this._invincible = true
      this.scheduleOnce(() => this._invincible = false, 2)
      videoAd.load()  // 预加载下一条
    })
    .catch(() => {
      // 没看完或没广告填充 → 不复活
      GameManager.instance.gameOver()
    })
}</code></pre>

      <h3>④ 投放节奏</h3>
      <ul>
        <li>每局最多给 <strong>2 次</strong>复活机会（不是每次死亡都弹）</li>
        <li>两次广告之间至少间隔 <strong>60 秒</strong></li>
        <li>第 1 次死亡就给广告（不要等玩到后面才给——用户留存最佳）</li>
      </ul>

      <h3>⑤ 其他广告形式——不推荐</h3>
      <table>
        <thead>
          <tr>
            <th>类型</th>
            <th>为什么飞机大战不推荐</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Banner 广告</td>
            <td>竖屏 480×800 空间紧张，Banner 会遮挡游戏/UI</td>
          </tr>
          <tr>
            <td>插屏广告</td>
            <td>战斗中弹出 = 直接打断操作 = 玩家怒卸</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>红线：</strong>不要每死一次就弹一次广告——那是逼用户卸载。2 次复活机会 + 60
        秒间隔是最低底线。另外必须提供"不看广告直接结算"的按钮——不能强制看广告。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🛠️" title="调试与常见问题速查">
      <p>
        这里给出发布阶段<strong>最常用</strong>的调试工具概览。更详细的真机调试、设备分档、性能面板分析见 <strong>Phase 11（真机调试与性能适配）</strong>。
      </p>

      <h3>调试工具链</h3>
      <table>
        <thead>
          <tr>
            <th>工具</th>
            <th>用途</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>微信开发者工具</td>
            <td>模拟器调试、查看 wx API 调用、断点调试</td>
          </tr>
          <tr>
            <td>真机调试（扫码）</td>
            <td>音频和性能必须真机测——模拟器音频实现和真机不同</td>
          </tr>
          <tr>
            <td>vConsole</td>
            <td>在真机上内嵌控制台，查看 log 和报错</td>
          </tr>
        </tbody>
      </table>

      <h3>常见问题速查</h3>
      <table>
        <thead>
          <tr>
            <th>现象</th>
            <th>最可能的原因</th>
            <th>解法</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>BGM 无声</td>
            <td>OGG 格式在 Android 小游戏中无声</td>
            <td>全部换 MP3</td>
          </tr>
          <tr>
            <td>SFX 播放几个后全哑</td>
            <td>InnerAudioContext 超过 10 个上限</td>
            <td>实现 AudioContext 池</td>
          </tr>
          <tr>
            <td>远程资源加载失败</td>
            <td>域名不在微信白名单</td>
            <td>加白名单或开发期"跳过校验"</td>
          </tr>
          <tr>
            <td>切后台回来崩溃</td>
            <td>onHide 时没停止 update 循环</td>
            <td>监听 onShow/onHide，正确暂停/恢复</td>
          </tr>
          <tr>
            <td>首场景启动超 5 秒</td>
            <td>主包太大</td>
            <td>Bundle 分包 + 音频上 CDN</td>
          </tr>
          <tr>
            <td>iOS 音频延迟 200ms+</td>
            <td>iOS AudioContext 冷启动延迟</td>
            <td>用一个空音频文件预热 AudioContext</td>
          </tr>
          <tr>
            <td>超过 4MB 无法上传</td>
            <td>主包体积超标</td>
            <td>拆分 Bundle 子包</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="提审前自检清单">
      <ol>
        <li>所有音频转为 MP3（无 OGG 残留）</li>
        <li>主包 &lt; 4MB（微信开发者工具 → 代码质量查看）</li>
        <li>真机测试过 iOS + Android 各一台</li>
        <li>onShow/onHide 生命周期正确：切后台暂停，切回来恢复</li>
        <li>HTTPS 域名白名单已配置（生产环境）</li>
        <li>激励视频广告位已申请 + 填充率测试通过</li>
        <li>分享文案和图片配置正确</li>
        <li>
          游戏内有"退出"功能（微信审核强制要求——Cocos 中调用 <code>wx.exitMiniProgram()</code>）
        </li>
        <li>隐私协议弹窗已接入（2024+ 微信审核要求）</li>
        <li>无强制登录/授权逻辑（审核红线——进游戏不能先弹授权）</li>
        <li>包名 → 版本号 → 小游戏分类 → 内容介绍在微信后台填写完整</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>小游戏 JS 环境和浏览器有哪些核心差异？（至少说出 4 个）</li>
        <li>为什么小游戏音频要用 MP3 而不是 OGG？</li>
        <li>InnerAudioContext 并发上限是多少？超出后怎么处理？</li>
        <li>双 Context 交替播放 BGM 的原理是什么？什么阶段切换播放？</li>
        <li>onShow / onHide 生命周期在游戏中应该做什么？前端对应的是什么 API？</li>
        <li>主包 4MB 限制如何突破？Cocos 中怎么配置？</li>
        <li>Bundle 分包和 Webpack Code Splitting 的类比是什么？</li>
        <li>激励视频广告的最佳触发时机是什么？有什么限制？</li>
        <li>为什么飞机大战只推荐激励视频，不推荐 Banner 和插屏？</li>
        <li>提审前最重要的 4 个检查项是什么？</li>
      </ul>
    </ConceptBlock>
  </PhaseLayout>
</template>
