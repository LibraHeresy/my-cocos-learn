<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="9" title="微信开放能力接入" duration="1-2 天" :total="17">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>实现<strong>静默登录</strong>——玩家进游戏无需点击授权，自动获取 openid</li>
        <li>用<strong>隐私合规</strong>的方式获取用户昵称和头像（微信 2024+ 审核要求）</li>
        <li>根据设备信息（平台、型号、性能）实现<strong>自适应画质</strong></li>
        <li>搭建<strong>开放数据域</strong>好友排行榜——无需后端服务器</li>
        <li>接入微信<strong>云存储托管排行榜</strong>，实现好友分数排名</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔑" title="微信登录——静默获取 openid">
      <p>
        微信小游戏的登录流程和前端熟悉的 <strong>OAuth 2.0</strong> 授权码模式完全一致。核心区别在于：小游戏用 <code>wx.login</code> 替代了浏览器中的重定向跳转。
      </p>

      <h3>登录流程对比</h3>
      <table>
        <thead>
          <tr>
            <th>步骤</th>
            <th>Web OAuth 2.0</th>
            <th>微信小游戏</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1. 获取临时凭证</td>
            <td>浏览器重定向 → 授权页面 → 返回 <code>code</code></td>
            <td><code>wx.login()</code> 直接返回 <code>code</code></td>
          </tr>
          <tr>
            <td>2. 换取身份标识</td>
            <td><code>POST /oauth/token</code> → <code>access_token</code></td>
            <td><code>code2session</code> → <code>openid</code> + <code>session_key</code></td>
          </tr>
          <tr>
            <td>3. 后续请求鉴权</td>
            <td><code>Authorization: Bearer xxx</code></td>
            <td><code>session_key</code> 签名校验</td>
          </tr>
          <tr>
            <td>4. Token 刷新</td>
            <td><code>refresh_token</code></td>
            <td>重新调用 <code>wx.login()</code>（code 只能用一次）</td>
          </tr>
        </tbody>
      </table>

      <h3>静默登录实现</h3>
      <p>
        你在 "调用后端去换取 openid 并且建立登录态（session）"这件事上需要自己写一个<strong>后端接口</strong>——前端拿到 <code>code</code> 后发给你的服务器，服务器调用微信接口换取 openid，然后返回一个自定义的登录凭证（JWT Token 或自定义 session_id）。这和前端 OAuth 回调中把 <code>code</code> 发给后端完全一样。
      </p>
      <pre><code>// LoginManager.ts —— 静默登录，玩家全程无感知
class LoginManager {
  private static _instance: LoginManager
  private _openid: string = ''
  private _token: string = ''  // 你自己的后端返回的登录凭证

  static get instance() {
    if (!this._instance) this._instance = new LoginManager()
    return this._instance
  }

  get openid() { return this._openid }

  /** 游戏启动时调用一次——静默完成，无需任何用户交互 */
  async silentLogin(): Promise&lt;void&gt; {
    try {
      // 第一步：获取临时 code
      const { code } = await wx.login()

      // 第二步：发给自己的后端，换取 openid 和登录凭证
      const res = await fetch('https://your-server.com/api/wx/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()

      this._openid = data.openid
      this._token = data.token

      console.log('[LoginManager] 静默登录成功, openid:', this._openid)
    } catch (err) {
      console.error('[LoginManager] 静默登录失败:', err)
      // 降级：用设备标识当离线 ID，等网络恢复再重试
      this._openid = wx.getStorageSync('offline_id') || this._generateOfflineId()
    }
  }

  private _generateOfflineId(): string {
    const id = 'offline_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
    wx.setStorageSync('offline_id', id)
    return id
  }
}</code></pre>

      <div class="warn-box">
        <strong>核心原则——隐私优先：</strong>千万不要在游戏启动时弹出登录/授权弹窗。<code>wx.login()</code> 是<strong>静默的</strong>，玩家完全无感知。游戏先让玩家玩起来，只有在需要展示头像昵称时（如排行榜），才引导用户点击授权按钮。微信 2024 年后审核非常严格——进游戏就弹授权窗口的，大概率<strong>驳回</strong>。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="👤" title="用户信息获取——隐私合规的正确姿势">
      <p>
        2024 年起，微信不再允许通过 <code>wx.getUserInfo</code> 弹窗获取用户信息。<strong>唯一合规方式</strong>是使用 <code>wx.createUserInfoButton</code> 创建一个原生按钮，玩家主动点击后获取头像和昵称。这类似于前端的<strong>用户主动触发 OAuth 授权点击</strong>——不能自动弹窗，必须是用户有意识的点击行为。
      </p>

      <h3>创建用户信息授权按钮</h3>
      <pre><code>// UserInfoButton.ts —— 合规的用户信息获取
class UserInfoButton {
  private _button: any = null

  /** 在排行榜或设置页面调用 */
  create(onSuccess: (res: { nickName: string; avatarUrl: string }) => void) {
    // 获取微信胶囊按钮底部位置，确保原生按钮不与之重叠
    const sysInfo = wx.getSystemInfoSync()

    this._button = wx.createUserInfoButton({
      type: 'text',          // 文字按钮
      text: '点击获取头像昵称',
      style: {
        left: sysInfo.windowWidth / 2 - 100,   // 居中
        top: sysInfo.windowHeight - 150,
        width: 200,
        height: 48,
        lineHeight: 48,
        backgroundColor: '#4A90D9',
        color: '#ffffff',
        fontSize: 16,
        borderRadius: 24,
        textAlign: 'center',
      },
    })

    this._button.onTap((res: any) => {
      if (res.errMsg === 'getUserInfo:ok') {
        const { nickName, avatarUrl } = res.userInfo
        onSuccess({ nickName, avatarUrl })
        // 获取成功后隐藏按钮
        this._button.hide()
      } else {
        console.log('[UserInfoButton] 用户拒绝授权')
        // 不强制——玩家拒绝也可以用默认头像和 "匿名玩家"
      }
    })
  }

  /** 如果已有用户信息就隐藏按钮 */
  hide() { this._button?.hide() }

  /** 销毁按钮 */
  destroy() { this._button?.destroy() }
}</code></pre>

      <div class="tip-box">
        <strong>按钮样式限制：</strong>微信原生按钮不支持复杂样式——背景色、圆角、文字大小是全部的样式自由度。如果需要自定义 UI，可以在按钮下方放置一个 Cocos 渲染的装饰层（Sprite），但<strong>点击区域必须是原生按钮</strong>。
      </div>

      <h3>前端类比</h3>
      <table>
        <thead>
          <tr>
            <th>Web 前端做法</th>
            <th>微信小游戏做法</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>OAuth 弹窗 / 重定向</td>
            <td><code>wx.createUserInfoButton</code> 原生按钮</td>
          </tr>
          <tr>
            <td>用户点击"微信登录"按钮</td>
            <td>用户在游戏内点击"获取头像昵称"按钮</td>
          </tr>
          <tr>
            <td>拿到 <code>id_token</code> 或 <code>access_token</code></td>
            <td>拿到 <code>userInfo.nickName</code> 和 <code>userInfo.avatarUrl</code></td>
          </tr>
          <tr>
            <td>静默获取（如已授权）</td>
            <td>不存在的——每次都要用户主动点击</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="📱" title="设备信息与自适应策略">
      <p>
        微信小游戏的目标机型从入门级（骁龙 4 系列，2GB RAM）到旗舰机（骁龙 8 Gen 3，12GB RAM）跨度极大。你需要像前端做<strong>响应式布局</strong>那样做<strong>自适应画质</strong>——<code>wx.getSystemInfoSync</code> 就是你的介质查询（media query）。
      </p>

      <h3>获取设备信息</h3>
      <pre><code>// DeviceInfo.ts —— 设备信息获取与分档
interface DeviceInfo {
  platform: string        // 'ios' | 'android' | 'devtools' | 'ohos'
  model: string           // 'iPhone 14 Pro Max' / 'M2012K11AC' (红米K40)
  brand: string           // 'Apple' / 'Xiaomi'
  screenWidth: number     // 逻辑像素宽
  screenHeight: number    // 逻辑像素高
  pixelRatio: number      // 设备像素比（DPR）
  benchmarkLevel: number  // 微信性能评级 -1 ~ 50+
  tier: 'low' | 'mid' | 'high'
}

export function getDeviceInfo(): DeviceInfo {
  const sys = wx.getSystemInfoSync()

  // 微信内置的性能评级（-1 表示未知，值越大性能越好）
  const benchmark = sys.benchmarkLevel ?? -1

  // 分档逻辑（类比前端基于 screen.width 的响应式断点）
  let tier: 'low' | 'mid' | 'high' = 'high'
  if (benchmark &lt; 10) {
    tier = 'low'       // 骁龙 4xx/6xx，2GB RAM 以下
  } else if (benchmark &lt; 30) {
    tier = 'mid'       // 骁龙 7xx，3-4GB RAM
  }

  return {
    platform: sys.platform,
    model: sys.model,
    brand: sys.brand,   // Android 上有值，iOS 返回空
    screenWidth: sys.windowWidth,
    screenHeight: sys.windowHeight,
    pixelRatio: sys.pixelRatio,
    benchmarkLevel: benchmark,
    tier,
  }
}</code></pre>

      <h3>自适应画质配置</h3>
      <pre><code>// QualityConfig.ts —— 基于设备分档的画质策略
export const QUALITY_CONFIG = {
  low: {
    particleCount: 30,      // 粒子上限：低端机 30
    enemyCount: 5,          // 同屏敌机上限
    animationFps: 15,       // 帧动画减半播放
    shadowEnabled: false,   // 关闭阴影
    bgScrollSpeed: 0.5,     // 降低背景滚动速率，减少重绘
  },
  mid: {
    particleCount: 80,
    enemyCount: 10,
    animationFps: 30,
    shadowEnabled: false,   // 中端机也不开阴影
    bgScrollSpeed: 1.0,
  },
  high: {
    particleCount: 200,
    enemyCount: 15,
    animationFps: 60,
    shadowEnabled: true,
    bgScrollSpeed: 1.5,
  },
}

// 游戏中应用配置
const device = getDeviceInfo()
const config = QUALITY_CONFIG[device.tier]
console.log(`[Quality] 设备: ${device.model} → 分档: ${device.tier}`)</code></pre>

      <div class="tip-box">
        <strong>前端类比：</strong><code>wx.getSystemInfoSync().benchmarkLevel</code> 就像前端的 <code>navigator.hardwareConcurrency</code> 或 <strong>Lighthouse Performance Score</strong>——你不用自己去跑 benchmark，微信已经替你做好了设备性能评级。直接用它做自适应断点。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🏆" title="开放数据域——好友排行榜">
      <p>
        开放数据域（Open Data Context）是微信小游戏中最独特的一个概念。<strong>它在浏览器中完全不存在对应物</strong>。它是一个<strong>独立的 JS 运行环境</strong>，只能访问有限的微信 API（画布、排行榜、用户信息），<strong>不能访问游戏主域的任何对象</strong>。你更可以把它理解为前端里一个<strong>无 DOM 访问权的 Web Worker</strong>，主域通过 <code>postMessage</code> 与它通信。
      </p>

      <h3>架构图（主域 ↔ 开放数据域）</h3>
      <table>
        <thead>
          <tr>
            <th>特性</th>
            <th>主域（游戏逻辑）</th>
            <th>开放数据域（排行榜渲染）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>JS 引擎</td>
            <td>同一个 V8/JSCore 实例</td>
            <td><strong>独立实例</strong>（隔离沙箱）</td>
          </tr>
          <tr>
            <td>访问 wx API</td>
            <td>全部 API 可用</td>
            <td>仅 <code>wx.getFriendCloudStorage</code> 等排行相关</td>
          </tr>
          <tr>
            <td>Canvas</td>
            <td><code>wx.createCanvas()</code></td>
            <td><code>wx.getSharedCanvas()</code></td>
          </tr>
          <tr>
            <td>与主域通信</td>
            <td><code>openDataContext.postMessage()</code></td>
            <td><code>wx.onMessage()</code> 接收</td>
          </tr>
          <tr>
            <td>前端类比</td>
            <td>主线程</td>
            <td>Web Worker + iframe sandbox 的结合体</td>
          </tr>
        </tbody>
      </table>

      <h3>实现步骤</h3>

      <p><strong>第 1 步：创建开放数据域子项目</strong></p>
      <p>
        在 Cocos 项目根目录下创建一个 <code>open-data-context/</code> 目录，里面放一个独立的 JS 文件作为开放数据域的入口。Cocos 构建时会将此目录复制到小游戏构建目录中。
      </p>
      <pre><code>// open-data-context/index.js —— 开放数据域入口文件
const sharedCanvas = wx.getSharedCanvas()
const ctx = sharedCanvas.getContext('2d')

// 监听主域发来的消息
wx.onMessage((data) => {
  if (data.type === 'showFriendRank') {
    renderFriendRank()
  } else if (data.type === 'hideRank') {
    clearCanvas()
  }
})

function renderFriendRank() {
  // 获取好友云存储数据
  wx.getFriendCloudStorage({
    keyList: ['highScore'],
    success: (res) => {
      // res.data: [{ openid, nickName, avatarUrl, KVDataList }]
      const sorted = res.data.sort((a, b) => {
        const scoreA = parseInt(a.KVDataList[0]?.value || '0')
        const scoreB = parseInt(b.KVDataList[0]?.value || '0')
        return scoreB - scoreA  // 降序
      })
      drawRankList(sorted, sharedCanvas, ctx)
    },
  })
}

function drawRankList(players, canvas, ctx) {
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)

  // 背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
  ctx.fillRect(0, 0, width, height)

  // 标题
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🏆 好友排行榜', width / 2, 40)

  // 逐个绘制玩家排行
  players.slice(0, 20).forEach((player, index) => {
    const y = 80 + index * 50
    const score = player.KVDataList[0]?.value || '0'

    // 排名
    ctx.fillStyle = index &lt; 3 ? '#FFD700' : '#ffffff'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${index + 1}.`, 20, y)

    // 昵称（截断过长昵称）
    const name = player.nickName.length &gt; 8
      ? player.nickName.slice(0, 8) + '…'
      : player.nickName
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px sans-serif'
    ctx.fillText(name, 60, y)

    // 分数
    ctx.fillStyle = '#FF6600'
    ctx.textAlign = 'right'
    ctx.fillText(score, width - 20, y)
  })
}

function clearCanvas() {
  ctx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height)
}</code></pre>

      <p><strong>第 2 步：主域将 SharedCanvas 渲染到 Cocos 场景</strong></p>
      <p>
        开放数据域把自己的内容画在 SharedCanvas 上，主域需要把 SharedCanvas 作为<strong>纹理（Texture）</strong>贴在 Cocos 的 Sprite 上，这样才能显示在游戏画面中。
      </p>
      <pre><code>// LeaderboardUI.ts —— 主域中的排行榜组件
import { _decorator, Component, Sprite, Texture2D, ImageAsset } from 'cc'

export class LeaderboardUI extends Component {
  private _openDataContext: any = null
  private _sharedCanvas: any = null
  private _texture: Texture2D = null

  onLoad() {
    // 获取开放数据域引用（仅在微信环境）
    this._openDataContext = wx.getOpenDataContext()
    this._sharedCanvas = this._openDataContext.canvas

    // 创建 Texture，定时刷新 SharedCanvas 内容
    this._texture = new Texture2D()
    this._texture.reset({
      width: this._sharedCanvas.width,
      height: this._sharedCanvas.height,
    })

    // 把纹理设置到 Sprite 上
    const sprite = this.node.getComponent(Sprite)
    sprite.spriteFrame.texture = this._texture

    // 每帧更新 SharedCanvas 纹理（60fps 更新）
    this.schedule(() => {
      this._updateSharedCanvasTexture()
    }, 0)
  }

  private _updateSharedCanvasTexture() {
    // 把 SharedCanvas 像素数据上传到 Cocos 纹理
    const img = new ImageAsset(this._sharedCanvas)
    const texture = new Texture2D()
    texture.image = img
    this._texture = texture

    const sprite = this.node.getComponent(Sprite)
    if (sprite?.spriteFrame) {
      sprite.spriteFrame.texture = texture
    }
  }

  /** 显示排行榜——通知开放数据域绘制 */
  show() {
    this.node.active = true
    this._openDataContext.postMessage({ type: 'showFriendRank' })
  }

  /** 隐藏排行榜 */
  hide() {
    this.node.active = false
    this._openDataContext.postMessage({ type: 'hideRank' })
  }
}</code></pre>

      <div class="warn-box">
        <strong>关键限制：</strong>开放数据域<strong>只能访问好友数据</strong>。你不能向里面传游戏对象的引用，不能调用游戏引擎的 API，也不能读取游戏本地存储。如果你需要全局排行榜（非好友），必须用自己的后端实现。开放数据域最适用于<strong>异步渲染并定时通过纹理同步</strong>的场景。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="☁️" title="云存储托管排行榜——零后端方案">
      <p>
        微信提供了<strong>无需自建后端</strong>的云端排行榜服务——KV 数据模型。<code>wx.setUserCloudStorage</code>上传玩家数据，<code>wx.getFriendCloudStorage</code>读取好友数据。这相当于前端常用的 <strong>Firebase Realtime Database</strong> 或者 <strong>LocalStorage 的云端版</strong>，数据结构是最简单的 Key-Value。
      </p>

      <h3>数据模型</h3>
      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>说明</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>key</code></td>
            <td>字段名，如 <code>"highScore"</code>、<code>"level"</code></td>
            <td><code>localStorage.setItem(key, value)</code></td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td>字段值，<strong>必须是 string</strong> 类型</td>
            <td><code>JSON.stringify()</code> 序列化后的字符串</td>
          </tr>
          <tr>
            <td><code>KVDataList</code></td>
            <td>一次可上传多个 KV 对（最多 50 个）</td>
            <td><code>Object.entries(data).map(...)</code></td>
          </tr>
          <tr>
            <td>数据范围</td>
            <td>仅限<strong>微信好友关系链</strong></td>
            <td>类似 Facebook Friend Graph API</td>
          </tr>
        </tbody>
      </table>

      <h3>上传分数</h3>
      <pre><code>// ScoreManager.ts —— 游戏结束/刷新记录时调用
class ScoreManager {
  /** 上传玩家最高分到微信云端 */
  static uploadHighScore(score: number) {
    wx.setUserCloudStorage({
      KVDataList: [{
        key: 'highScore',
        value: String(score),         // 值必须是字符串
      }, {
        key: 'maxLevel',
        value: String(Math.floor(score / 1000)),  // 假设每 1000 分一关
      }],
      success: () => {
        console.log('[ScoreManager] 成绩已同步到云端')
      },
      fail: (err) => {
        console.error('[ScoreManager] 成绩同步失败:', err)
      },
    })
  }

  /** 读取好友排行榜（在排行榜 UI 中调用） */
  static fetchFriendRank(
    onSuccess: (list: Array&lt;{ name: string; score: number; avatar: string }&gt;) => void
  ) {
    wx.getFriendCloudStorage({
      keyList: ['highScore', 'maxLevel'],
      success: (res) => {
        const sorted = res.data
          .map((item: any) => ({
            name: item.nickname,
            avatar: item.avatarUrl,
            score: parseInt(item.KVDataList.find((kv: any) =&gt; kv.key === 'highScore')?.value || '0'),
            level: parseInt(item.KVDataList.find((kv: any) =&gt; kv.key === 'maxLevel')?.value || '0'),
          }))
          .sort((a, b) =&gt; b.score - a.score)

        onSuccess(sorted)
      },
      fail: (err) => {
        console.error('[ScoreManager] 获取好友排行失败:', err)
      },
    })
  }
}</code></pre>

      <h3>更新时机策略</h3>
      <ul>
        <li><strong>本地最高分更新时：</strong>立即调用 <code>setUserCloudStorage</code>——好友排行榜需要你的数据</li>
        <li><strong>网络不可用时：</strong>先存本地，下次 <code>wx.onNetworkStatusChange</code> 监听到联网后再上传</li>
        <li><strong>频率限制：</strong>微信未公开限制，但实测每秒不超过 <strong>5 次</strong> 写入为宜</li>
      </ul>

      <div class="tip-box">
        <strong>数据可见性：</strong>云存储数据只对<strong>玩家的微信好友</strong>可见。如果你想做"全服排行榜"，需要自建后端 + 数据库（见 Phase 10）。小游戏初学者建议先用云存储跑通<strong>好友排行榜</strong>，它是成本最低、最快速的验证方案，不需要部署任何服务就能看到效果。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: <code>wx.login()</code> 获取的 code 能重复使用吗？</h3>
      <p>
        不能。每个 code 只能使用<strong>一次</strong>，且有效期只有 <strong>5 分钟</strong>。这和 OAuth 2.0 的 <code>authorization_code</code> 完全一样——用完后立即失效，需要重新调用 <code>wx.login()</code> 获取新的。
      </p>

      <h3>Q2: 为什么 <code>wx.getUserInfo</code> 在新版微信上不能用了？</h3>
      <p>
        微信在 2024 年调整了隐私政策——<code>wx.getUserInfo</code> 不再弹出授权窗口，直接返回匿名信息。获取真实昵称和头像必须用 <code>wx.createUserInfoButton</code>，并且必须由<strong>用户主动点击</strong>触发。这类似于苹果的 App Tracking Transparency——锅是隐私法规的，不是微信的。
      </p>

      <h3>Q3: 开放数据域的 SharedCanvas 为什么是黑屏？</h3>
      <p>
        检查以下几点：
      </p>
      <ol>
        <li><code>open-data-context/index.js</code> 文件的路径是否正确——Cocos 构建后应在 <code>minigame/open-data-context/</code> 目录下</li>
        <li>在 <code>game.json</code> 中是否配置了 <code>"openDataContext": "open-data-context"</code></li>
        <li>SharedCanvas 的宽高是否与主域中创建的 Texture 一致——不一致会导致缩放问题</li>
        <li>真机上测试——开发者工具的开放数据域模拟和真机行为可能不同</li>
      </ol>

      <h3>Q4: 如何在不自建后端的情况下实现"全服排行榜"？</h3>
      <p>
        纯粹的微信能力做不到。好友排行榜只能看好友的数据。全服排行榜（全局 Top 100）需要你自己的数据库。但有一个取巧方案：使用<strong>微信云开发</strong>的云数据库做排名（Phase 10 会详细讲），无需自己管理服务器，微信提供了免费额度。
      </p>

      <h3>Q5: <code>wx.setUserCloudStorage</code> 写入后好友什么时候能看到？</h3>
      <p>
        通常<strong>几秒内</strong>。微信有自己的同步机制，不需要你手动触发。但如果你在开发者工具中频繁测试，可能会遇到缓存延迟——换一个微信测试号或等待 <strong>1-2 分钟</strong>。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li><code>wx.login()</code> 的流程是什么？code 发给谁？后端怎么换取 openid？</li>
        <li>为什么不能游戏一启动就弹出授权窗口？微信审核对隐私有什么要求？</li>
        <li><code>wx.createUserInfoButton</code> 的作用是什么？和传统的 <code>wx.getUserInfo</code> 有什么区别？</li>
        <li>设备分档用哪个 API？<code>benchmarkLevel</code> 的含义是什么？</li>
        <li>低端机和中端机的分档阈值一般设多少？你的游戏针对不同分档做了哪些画质调整？</li>
        <li>开放数据域的本质是什么？它和主域之间是怎样隔离的？</li>
        <li>开放数据域和主域如何通信？SharedCanvas 的绘制流程是怎样的？</li>
        <li><code>wx.setUserCloudStorage</code> 的数据限制有哪些？（类型、数量）</li>
        <li>好友排行榜和全服排行榜的实现差异是什么？分别需要哪些能力？</li>
        <li>用户拒绝授权头像昵称时，你的降级方案是什么？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
