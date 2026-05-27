<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="22" title="WebSocket 实时通信" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>建立<strong>WebSocket 连接</strong>——让客户端和服务器保持长连接双向通信</li>
        <li>实现<strong>心跳机制</strong>——服务器知道你"还活着"，断了自动重连</li>
        <li>设计<strong>消息协议</strong>——用 JSON + type 字段区分消息类型（就像 Redux Actions）</li>
        <li>实现简单的<strong>回合制对战同步</strong>或<strong>实时位置同步</strong></li>
        <li>封装<strong>NetworkManager 单例</strong>——管理连接生命周期、自动重连、消息路由</li>
        <li>理解<strong>延迟补偿（Lag Compensation）</strong>的基本概念——客户端预测 vs 服务器权威</li>
        <li>建立<strong>安全边界</strong>——为什么永远不能信任客户端发来的数据</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔌" title="WebSocket vs HTTP——为什么游戏需要长连接">
      <p>
        在前端开发中，绝大多数通信走 HTTP——请求 → 响应 → 结束。但实时游戏需要<strong>服务器主动推送</strong>消息给客户端（如"有玩家进入了你的视野"），HTTP 轮询（Polling）太低效。WebSocket 在客户端和服务器之间建立一条<strong>全双工通道</strong>——双方随时可以发送数据，无需等待请求-响应周期。
      </p>

      <h3>HTTP vs WebSocket 对比</h3>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>HTTP 轮询</th>
            <th>WebSocket</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>连接方式</td>
            <td>每次请求建立新连接（或 Keep-Alive 复用）</td>
            <td><strong>一次握手后保持长连接</strong></td>
          </tr>
          <tr>
            <td>服务器推送</td>
            <td>不支持——只能客户端问、服务器答</td>
            <td><strong>支持</strong>——服务器随时可推送给客户端</td>
          </tr>
          <tr>
            <td>延迟</td>
            <td>取决于轮询间隔（通常 200ms+）</td>
            <td><strong>毫秒级</strong>——消息到达即推送</td>
          </tr>
          <tr>
            <td>适合场景</td>
            <td>排行榜数据、配置拉取</td>
            <td>实时对战、聊天、位置同步</td>
          </tr>
          <tr>
            <td>前端类比</td>
            <td><code>fetch()</code> + 定时器轮询</td>
            <td><code>new WebSocket()</code> / Socket.io</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>Socket.io 还是原生 WebSocket：</strong>Socket.io 是 WebSocket 的上层封装，提供了自动重连、房间管理、广播等便利功能。但在微信小游戏环境中，Socket.io 的<strong>客户端不一定能直接用</strong>——微信实现了自己的 <code>wx.connectSocket</code> API，它不是标准的浏览器 WebSocket。本 Phase 我们基于 <code>wx.connectSocket</code> 来讲解——理解底层的 WebSocket 原理后，换成 Socket.io 只是换一层 API 调用。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="连接生命周期——从握手到断开">
      <p>
        WebSocket 连接有三个阶段：<strong>连接（Connect）→ 通信（Message）→ 断开（Close）</strong>。每个阶段都有对应的回调。这就像前端中 <code>&lt;video&gt;</code> 元素的<strong>事件生命周期</strong>——loadstart → canplay → ended。
      </p>

      <pre><code>// WebSocket 连接生命周期
import { _decorator, Component } from 'cc'

export class WsDemo extends Component {
  private _socket: WebSocket | null = null

  onLoad() {
    this._connect()
  }

  private _connect() {
    // 微信小游戏中的 WebSocket
    const socket = wx.connectSocket({
      url: 'wss://your-server.com/game',
      header: {
        'content-type': 'application/json'
      },
      protocols: ['game-protocol-v1'],  // 子协议（可选）
    })

    // ===== 生命周期回调 =====

    // 1. 连接建立
    socket.onOpen((_res) => {
      console.log('[WS] 连接已建立')
      // 连接成功后发送鉴权消息
      this._sendAuth(socket)
    })

    // 2. 收到消息
    socket.onMessage((res) => {
      const message = JSON.parse(res.data as string)
      console.log('[WS] 收到消息:', message)
      this._handleMessage(message)
    })

    // 3. 连接关闭
    socket.onClose((res) => {
      console.log(`[WS] 连接关闭, code: ${res.code}, reason: ${res.reason}`)
      this._socket = null
      // 尝试重连（非主动关闭的情况下）
      if (res.code !== 1000) {
        this._reconnect()
      }
    })

    // 4. 连接错误
    socket.onError((res) => {
      console.error('[WS] 连接错误:', res.errMsg)
    })

    this._socket = socket
  }

  private _sendAuth(socket: any) {
    socket.send({
      data: JSON.stringify({
        type: 'auth',
        payload: { token: 'player-auth-token' },
      }),
    })
  }

  private _handleMessage(msg: any) {
    // 根据 type 分发消息
  }

  private _reconnect() {
    // 重连逻辑
  }
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="💓" title='心跳与重连——保持连接不"死亡"'>
      <p>
        WebSocket 连接可能会因为网络切换（WiFi → 4G）、手机锁屏、服务器重启等原因断开。心跳机制的目的就是<strong>快速发现断开</strong>并在检测到后<strong>自动重连</strong>。这就像前端中的 <code>navigator.onLine</code> + <code>window.addEventListener('online', ...)</code> 的结合体。
      </p>

      <h3>心跳策略</h3>
      <table>
        <thead>
          <tr>
            <th>机制</th>
            <th>频率</th>
            <th>作用</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>客户端 Ping</td>
            <td>每 30 秒发送一次</td>
            <td>告诉服务器"我还活着"——服务器超时未收到 Ping 则断开此客户端</td>
          </tr>
          <tr>
            <td>客户端 Pong 超时检测</td>
            <td>发 Ping 后等 5 秒</td>
            <td>如果 5 秒内没收到服务器的 Pong 回应 → 主动断开并重连</td>
          </tr>
          <tr>
            <td>指数退避重连</td>
            <td>重连间隔递增</td>
            <td>第 1 次 1 秒后重连、第 2 次 2 秒、第 3 次 4 秒... 避免"重连风暴"</td>
          </tr>
        </tbody>
      </table>

      <pre><code>// 指数退避（Exponential Backoff）——前端也熟悉的模式
// 类似 fetch 失败后的重试策略
function getReconnectDelay(attempt: number, maxDelay: number = 30000): number {
  // 1s, 2s, 4s, 8s, 16s, 30s, 30s, 30s...（上限 30 秒）
  const delay = Math.min(1000 * Math.pow(2, attempt), maxDelay)
  // 加一点随机抖动（Jitter）——防止大量客户端同时重连冲击服务器
  return delay + Math.random() * 1000
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="📨" title="消息协议设计——让消息可读、可扩展">
      <p>
        你需要定义客户端和服务器之间的"通信语言"——消息协议。最通用的做法是 JSON 格式 + <code>type</code> 字段区分消息类型。这个设计模式和前端中 <strong>Redux Actions</strong> 的结构几乎一致——每个 Action 都有一个 <code>type</code> 字段标识要做什么，以及一个 <code>payload</code> 携带数据。
      </p>

      <h3>协议结构</h3>
      <pre><code>// Protocol.ts —— 消息协议定义
// 所有消息的统一信封格式
interface Message&lt;T = any&gt; {
  type: string       // 消息类型——像 Redux action.type
  seq: number        // 消息序列号——用于追踪和去重
  timestamp: number  // 发送时间戳（ms）
  payload: T         // 消息数据——像 Redux action.payload
}

// ===== 客户端 → 服务器 =====
type ClientMessage =
  | { type: 'auth';      payload: { token: string } }
  | { type: 'ping';      payload: {} }
  | { type: 'move';      payload: { x: number; y: number; rotation: number } }
  | { type: 'attack';    payload: { targetId: string; skillId: string } }
  | { type: 'chat';      payload: { content: string } }

// ===== 服务器 → 客户端 =====
type ServerMessage =
  | { type: 'auth_ok';       payload: { playerId: string; roomId: string } }
  | { type: 'pong';          payload: {} }
  | { type: 'player_moved';  payload: { playerId: string; x: number; y: number } }
  | { type: 'player_attack'; payload: { fromId: string; toId: string; damage: number } }
  | { type: 'player_joined'; payload: { playerId: string; nickname: string } }
  | { type: 'player_left';   payload: { playerId: string } }
  | { type: 'error';         payload: { code: number; message: string } }</code></pre>

      <h3>序列号（seq）的作用</h3>
      <p>
        每条消息带上一个递增的序列号，可以做到：(1) <strong>去重</strong>——如果收到了 seq=5 的消息两次（重连后重发），忽略重复；(2) <strong>检测丢包</strong>——如果 seq=1,2,3,4,7，知道 5 和 6 丢了，可能需要请求重发；(3) <strong>RPC 回调匹配</strong>——客户端发 seq=100 的请求，服务器在回复中带 seq=100，客户端就知道"这个回复对应哪个请求"。
      </p>

      <div class="tip-box">
        <strong>JSON vs 二进制：</strong>大多数小游戏的实时通信用 JSON 完全够用——解析简单、可读性强、调试友好。如果到了"每秒需要发送 60 个位置同步包"的程度（如实时射击游戏），再考虑用 <strong>Protobuf</strong> 或自定义二进制协议压缩数据。对于回合制卡牌、简易多人、聊天等场景，JSON 就是最优解——<strong>不要过早优化</strong>。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🏗️" title="NetworkManager 单例——管理一切网络操作">
      <p>
        网络管理的代码不应该散落在各个游戏逻辑文件中。你需要一个<strong>单例 NetworkManager</strong>，统一管理连接生命周期、心跳、重连、消息收发、消息路由。这和前端项目中的 <code>axios instance</code> 或是 <code>WebSocket Service</code> 封装是同一个思路。
      </p>

      <pre><code>// NetworkManager.ts —— 网络管理单例
import { EventTarget } from 'cc'

export class NetworkManager {
  private static _instance: NetworkManager
  static get instance() {
    if (!this._instance) this._instance = new NetworkManager()
    return this._instance
  }

  private _socket: any = null
  private _eventTarget: EventTarget = new EventTarget()
  private _reconnectAttempt: number = 0
  private _maxReconnectAttempts: number = 10
  private _pingTimer: number = 0
  private _pingTimeout: number = 0
  private _seq: number = 0
  private _connected: boolean = false

  get connected() { return this._connected }

  /** 连接到服务器 */
  connect(url: string, token: string) {
    if (this._socket) {
      console.warn('[NetworkManager] 已有连接，先断开旧连接')
      this.disconnect()
    }

    this._socket = wx.connectSocket({ url })

    this._socket.onOpen(() => {
      console.log('[NetworkManager] 连接成功')
      this._connected = true
      this._reconnectAttempt = 0
      this._startHeartbeat()
      this._send({ type: 'auth', payload: { token } })
      this._emit('connected')
    })

    this._socket.onMessage((res: any) => {
      const msg = JSON.parse(res.data as string)
      // 通过 type 分发到具体的事件频道
      this._emit(msg.type, msg)
    })

    this._socket.onClose((res: any) => {
      console.warn(`[NetworkManager] 断开: code=${res.code}`)
      this._connected = false
      this._stopHeartbeat()
      this._emit('disconnected')
      if (res.code !== 1000) this._tryReconnect()
    })

    this._socket.onError((res: any) => {
      console.error('[NetworkManager] 错误:', res.errMsg)
    })
  }

  /** 发送消息 */
  send(type: string, payload: any = {}) {
    this._send({ type, payload })
  }

  private _send(data: any) {
    if (!this._socket || !this._connected) {
      console.warn('[NetworkManager] 未连接——消息未发送')
      return
    }
    const message: Message = {
      ...data,
      seq: ++this._seq,
      timestamp: Date.now(),
    }
    this._socket.send({ data: JSON.stringify(message) })
  }

  /** 监听指定类型的消息 */
  on(type: string, callback: Function, target?: any) {
    this._eventTarget.on(type, callback, target)
  }

  off(type: string, callback: Function, target?: any) {
    this._eventTarget.off(type, callback, target)
  }

  /** 断开连接 */
  disconnect() {
    this._stopHeartbeat()
    this._maxReconnectAttempts = 0  // 阻止自动重连
    if (this._socket) {
      this._socket.close({ code: 1000, reason: 'client disconnect' })
      this._socket = null
    }
    this._connected = false
  }

  // ===== 心跳 =====
  private _startHeartbeat() {
    this._pingTimer = setInterval(() => {
      this._send({ type: 'ping', payload: {} })
      // 等 5 秒看有没有 pong
      this._pingTimeout = setTimeout(() => {
        console.warn('[NetworkManager] Ping 超时——连接可能已断开')
        this._socket?.close({ code: 4001, reason: 'ping timeout' })
      }, 5000)
    }, 30000)
  }

  private _stopHeartbeat() {
    if (this._pingTimer) { clearInterval(this._pingTimer); this._pingTimer = 0 }
    if (this._pingTimeout) { clearTimeout(this._pingTimeout); this._pingTimeout = 0 }
  }

  // ===== 自动重连 =====
  private _tryReconnect() {
    if (this._reconnectAttempt >= this._maxReconnectAttempts) {
      console.error('[NetworkManager] 超过最大重连次数，放弃重连')
      this._emit('reconnect_failed')
      return
    }

    const delay = getReconnectDelay(this._reconnectAttempt)
    console.log(`[NetworkManager] ${delay / 1000}s 后尝试第 ${this._reconnectAttempt + 1} 次重连`)

    setTimeout(() => {
      this._reconnectAttempt++
      this.connect(this._url, this._token)  // 重新连接
    }, delay)
  }

  private _emit(type: string, data?: any) {
    this._eventTarget.emit(type, data)
  }
}

// ===== 游戏中使用 =====
// // 初始化
// NetworkManager.instance.connect('wss://your-server.com/game', authToken)
//
// // 注册消息处理器
// NetworkManager.instance.on('player_moved', (msg) => {
//   const { playerId, x, y } = msg.payload
//   otherPlayer.setPosition(x, y)
// })
//
// NetworkManager.instance.on('player_attack', (msg) => {
//   const { fromId, toId, damage } = msg.payload
//   if (toId === myPlayerId) takeDamage(damage)
// })
//
// // 发送消息
// NetworkManager.instance.send('move', { x: 100, y: 200, rotation: 45 })
// NetworkManager.instance.send('attack', { targetId: 'player_2', skillId: 'fireball' })</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="⏱️" title="延迟补偿——让玩家感受不到网络延迟">
      <p>
        网络延迟是实时游戏中最大的敌人。玩家按下"移动"键时，数据要经过：客户端 → 网络 → 服务器处理 → 网络 → 客户端，需要 <strong>50-200ms</strong>。如果玩家要等服务器"批准"后才能看到自己的角色移动，就会感觉"操作不跟手"。
      </p>

      <h3>客户端预测（Client-Side Prediction）</h3>
      <p>
        这是延迟补偿最核心的思想：客户端<strong>立即</strong>响应用户输入（移动、攻击），同时服务器也在处理——如果服务器确认的结果和客户端一致，什么都不用改；如果不一致（被其他玩家推开、服务器判定移动非法），<strong>服务器覆盖客户端</strong>。
      </p>

      <h3>服务器和解（Server Reconciliation）</h3>
      <p>
        客户端维护一个"未确认的输入"列表。当服务器回复说"seq=42 之前的输入都已确认"，客户端就从列表中移除这些输入，并以服务器的权威状态为基准，<strong>重新模拟</strong>剩余的未确认输入。这保证了：玩家看到的是"即时响应"，但一旦服务器说"不对"，客户端会<strong>静默修正</strong>。
      </p>

      <table>
        <thead>
          <tr>
            <th>技术</th>
            <th>解决什么问题</th>
            <th>复杂度</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>客户端预测</td>
            <td>操作延迟（按下键到看到角色动）</td>
            <td>中</td>
            <td>Optimistic UI——先更新本地状态，API 返回后再同步</td>
          </tr>
          <tr>
            <td>服务器和解</td>
            <td>客户端和服务器状态不一致</td>
            <td>高</td>
            <td>类似 Redux 的 state reconciliation——以服务器为准重建状态</td>
          </tr>
          <tr>
            <td>插值（Interpolation）</td>
            <td>远程玩家移动不平滑</td>
            <td>低</td>
            <td>CSS <code>transition</code> 或动画补帧</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>现实建议：</strong>客户端预测 + 服务器和解是竞技游戏级别的技术，实现复杂度很高。对于你的第一个联网小游戏，建议：(1) <strong>回合制游戏</strong>——完全不需要延迟补偿，等服务器确认后再播动画；(2) <strong>非竞技实时游戏（如一起种菜）</strong>——只用简单的客户端预测，不做服务器和解，偶尔的"回弹/瞬移"玩家可以接受；(3) <strong>竞技实时游戏</strong>——这才是延迟补偿全套技术的舞台。本 Phase 的目标是<strong>理解这些概念</strong>，而不是现在就实现完整的客户端预测系统。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔒" title="安全边界——永远不要信任客户端数据">
      <p>
        这是一个必须反复强调的原则：<strong>任何从客户端发来的数据都可以被伪造</strong>。玩家可以修改游戏内存、抓包修改 WebSocket 消息、用脚本自动发送消息。服务器的职责是"验证一切"。
      </p>

      <h3>常见的客户端作弊方式</h3>
      <table>
        <thead>
          <tr>
            <th>作弊方式</th>
            <th>表现</th>
            <th>服务器防御</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>修改内存值</td>
            <td>攻击力 99999，血量 99999</td>
            <td>服务器验证伤害计算公式——客户端输入违反公式上限 → 拒绝</td>
          </tr>
          <tr>
            <td>抓包修改消息</td>
            <td>发送 <code>{type: 'attack', damage: 99999}</code></td>
            <td>服务器不信任客户端传来的伤害值——<strong>服务器自己算</strong></td>
          </tr>
          <tr>
            <td>加速外挂</td>
            <td>移动速度是正常 3 倍</td>
            <td>服务器验证位置变化速率——超过最大速度 → 踢下线</td>
          </tr>
          <tr>
            <td>脚本自动操作</td>
            <td>每秒点击 100 次（机器人刷分）</td>
            <td>频率限制——同一玩家 1 秒内同类型消息不超过 N 条</td>
          </tr>
        </tbody>
      </table>

      <h3>设计安全的网络协议</h3>
      <pre><code>// ❌ 不安全——客户端告诉服务器造成了多少伤害
// 客户端: { type: 'attack', payload: { targetId: 'enemy_5', damage: 99999 } }
// 服务器: 直接扣 99999 血? 太天真了!

// ✅ 安全——服务器自己算伤害
// 客户端: { type: 'attack', payload: { targetId: 'enemy_5', skillId: 'fireball' } }
// 服务器: 查询技能 "fireball" 的伤害公式 → 计算 → 扣除

// ✅ 安全的移动验证
// 客户端: { type: 'move', payload: { x: 1200, y: 800, seq: 42 } }
// 服务器检查:
//   1. 玩家上次位置是 (1190, 800)——x 移动了 10px，这是合理的速度 ✓
//   2. 如果玩家说 (2000, 800)——x 移动了 810px，但最大速度是 15px/帧 → 拒绝 ✗
//   3. 是否穿过了墙壁？在服务器端也做一遍碰撞检测 → 拒绝 ✗</code></pre>

      <div class="warn-box">
        <strong>核心原则：</strong>把客户端看作一个<strong>"远程控制器"</strong>——它发送的是"意图"（我想移动、我想攻击），而不是"结果"（我造成了 999 点伤害）。服务器负责把"意图"转化为"结果"并发送回来。这就像 Web 开发中："<strong>不要在前端做权限判断</strong>"——后端永远要再验证一遍。前端的权限判断只是为了更好的用户体验（隐藏不该点的按钮），真正的安全边界在后端。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: wx.connectSocket 和浏览器 WebSocket 有什么区别？</h3>
      <p>
        微信的 <code>wx.connectSocket</code> 是微信封装的 WebSocket API，行为和标准略有不同：(1) 它返回的不是标准的 WebSocket 对象，而是微信自己的 socket 对象；(2) 消息的 <code>data</code> 可能是 string 或 ArrayBuffer；(3) 不支持标准的 <code>addEventListener</code>，必须用 <code>onOpen/onMessage/onClose/onError</code> 设置回调。如果你在为<strong>浏览器写代码</strong>，直接用标准的 <code>new WebSocket()</code> 即可。
      </p>

      <h3>Q2: 为什么需要心跳？服务器难道不知道客户端断开了吗？</h3>
      <p>
        不一定。TCP 连接在某些情况下可以"半断开"——一方断了另一端不知道。例如：手机锁屏、WiFi 断开但 TCP 连接还没超时。服务器可能需要 <strong>30-120 秒</strong>才能检测到 TCP 层面的断开。在这期间，服务器以为这个玩家还在线——其他玩家也以为他在线。心跳缩短这个检测窗口到<strong>几秒</strong>。
      </p>

      <h3>Q3: 重连时未发送的消息怎么办？</h3>
      <p>
        在 NetworkManager 中维护一个<strong>离线消息队列</strong>——发送失败时入队，重连成功后重发。注意：有些消息不能重发（如 "跳跃"——你不想重连后角色突然跳起来）。给消息加上 <code>isResendable</code> 标记：<code>move</code> 不重发（位置信息已过时），<code>chat</code> 可以重发，"提交战斗结果"必须重发。
      </p>

      <h3>Q4: 局域网测试连接不上服务器？</h3>
      <p>
        开发者工具中 WebSocket 默认只能连接 <strong>wss://</strong>（加密连接）。如果测试用本地服务器 <code>ws://localhost:8080</code>，需要在开发者工具 → 详情 → 本地设置中 <strong>勾选"不校验合法域名"</strong>。真机调试则需要申请 wss 域名并配置 SSL 证书。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>WebSocket 和 HTTP 的核心区别是什么？全双工是什么意思？</li>
        <li>WebSocket 连接的四个生命周期回调（onOpen、onMessage、onClose、onError）各在什么时机触发？</li>
        <li>心跳机制为什么需要 Ping + Pong 双向？只用 Ping 不检测 Pong 有什么问题？</li>
        <li>什么是指数退避（Exponential Backoff）重连？为什么需要随机抖动（Jitter）？</li>
        <li>消息协议中的 <code>type</code> 字段和 Redux Action 的 <code>type</code> 有什么相似之处？<code>seq</code> 序列号的作用是什么？</li>
        <li>NetworkManager 的架构应该包含哪些功能模块？（连接管理、心跳、重连、消息路由...）</li>
        <li>什么是客户端预测？为什么需要它？服务器和解（Reconciliation）又是做什么的？</li>
        <li>为什么服务器不能信任客户端传来的伤害值？"以服务器的计算结果为准"应该怎么实现？</li>
        <li>微信的 <code>wx.connectSocket</code> 和浏览器标准 WebSocket 有什么区别？</li>
        <li>重连后哪些消息应该重发？哪些不应该？为什么？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
