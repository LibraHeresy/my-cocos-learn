<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="10" title="数据持久化与云开发" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>了解<strong>微信云开发</strong>的三大核心能力，告别"从零搭建后端"的焦虑</li>
        <li>用<strong>云数据库</strong>存储玩家档案、装备、进度——像用 Firestore 一样简单</li>
        <li>用<strong>云函数</strong>实现游戏逻辑校验（排行榜反作弊、每日奖励计算）</li>
        <li>实现<strong>多端进度同步</strong>——换手机/换 iPad 都能读到同一份存档</li>
        <li>用<strong>云存储</strong>托管玩家上传的自定义内容（头像、关卡等）</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="☁️" title='微信云开发概览——你的第一个"后端"'>
      <p>
        作为前端工程师，我们习惯了写界面但不太想管服务器。微信云开发就是你的"零运维后端"——它把数据库、计算、文件存储打包成了一个开箱即用的 BaaS（Backend as a Service），和前端熟悉的 <strong>Firebase</strong> 或 <strong>Supabase</strong> 是同一类产品。
      </p>

      <h3>三大能力</h3>
      <table>
        <thead>
          <tr>
            <th>能力</th>
            <th>做什么</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>云数据库</strong></td>
            <td>一个 MongoDB-like 文档数据库，无需安装、不用写 SQL</td>
            <td>Firestore / MongoDB</td>
          </tr>
          <tr>
            <td><strong>云函数</strong></td>
            <td>在微信服务器上运行的 Node.js 函数，天然免鉴权</td>
            <td>AWS Lambda / Vercel Serverless Functions</td>
          </tr>
          <tr>
            <td><strong>云存储</strong></td>
            <td>文件上传/下载 + CDN 加速，托管图片、存档等</td>
            <td>AWS S3 + CloudFront / Firebase Storage</td>
          </tr>
        </tbody>
      </table>

      <h3>对比：自建后端 vs 云开发</h3>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>自建后端</th>
            <th>微信云开发</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>服务器</td>
            <td>买云服务器、配置 Nginx、搞 SSL 证书</td>
            <td><strong>零配置</strong>——微信帮你管</td>
          </tr>
          <tr>
            <td>鉴权</td>
            <td>自己实现 JWT / session 校验</td>
            <td><strong>天然免鉴权</strong>——微信自动注入 openid</td>
          </tr>
          <tr>
            <td>数据库</td>
            <td>装 MySQL/PostgreSQL，写 Schema，做迁移</td>
            <td>自动创建，Mongo-like，无需 Schema 预设</td>
          </tr>
          <tr>
            <td>扩容</td>
            <td>手动加机器或配置 Auto Scaling</td>
            <td><strong>自动弹性伸缩</strong></td>
          </tr>
          <tr>
            <td>费用</td>
            <td>服务器月租 + 数据库 + 带宽</td>
            <td>免费额度充足（详见下文），个人开发者几乎不花钱</td>
          </tr>
        </tbody>
      </table>

      <h3>免费额度</h3>
      <table>
        <thead>
          <tr>
            <th>资源</th>
            <th>免费额度</th>
            <th>适合什么规模</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>云数据库容量</td>
            <td>2 GB</td>
            <td>万级 DAU 足够</td>
          </tr>
          <tr>
            <td>云数据库读次数</td>
            <td>5 万次/天</td>
            <td>5000 玩家 × 10 次读取</td>
          </tr>
          <tr>
            <td>云函数调用</td>
            <td>20 万次/月</td>
            <td>DAU 2000 × 3 次调用</td>
          </tr>
          <tr>
            <td>云存储容量</td>
            <td>5 GB</td>
            <td>数千张头像/截图</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>决策参考：</strong>如果你的小游戏不需要排行榜反作弊、不需要跨设备进度同步，用 Phase 9 的云存储托管排行榜（<code>setUserCloudStorage</code>）就够了，<strong>不需要开通云开发</strong>。一旦你需要"自己的数据库、自己的计算逻辑、自己的文件存储"，云开发就是最佳选择。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🗄️" title="云数据库——像操作 JSON 一样操作数据库">
      <p>
        微信云数据库是一个<strong>文档型数据库</strong>，它和传统 SQL 数据库最大区别是：不需要预定义表结构（Schema），直接存 JSON 对象。前端工程师天然亲切——这和操作 <code>localStorage</code> 里的 JSON 几乎是同一种心智模型。
      </p>

      <h3>数据模型</h3>
      <table>
        <thead>
          <tr>
            <th>云数据库概念</th>
            <th>说明</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>集合 Collection</strong></td>
            <td>一组文档的容器，如 <code>players</code>、<code>levels</code></td>
            <td>一个 JSON 数组 / NoSQL 表</td>
          </tr>
          <tr>
            <td><strong>文档 Document</strong></td>
            <td>一条记录，JSON 格式，有唯一 <code>_id</code></td>
            <td>数组中的一个对象</td>
          </tr>
          <tr>
            <td><strong>字段 Field</strong></td>
            <td>文档中的一个属性，如 <code>highScore</code></td>
            <td>对象的 key</td>
          </tr>
          <tr>
            <td><strong>_openid</strong></td>
            <td>每个文档自动绑定创建者的 openid</td>
            <td>内建的"用户归属"字段（零配置）</td>
          </tr>
        </tbody>
      </table>

      <h3>初始化与 CRUD</h3>
      <pre><code>// 初始化云开发（在小游戏入口调用一次）
wx.cloud.init({
  env: 'your-env-id',  // 云开发环境 ID，在微信开发者工具中创建
  traceUser: true,     // 记录用户访问
})

const db = wx.cloud.database()

// ==================== 创建（Create）====================
async function createPlayer(profile: { nickName: string; avatarUrl: string }) {
  const result = await db.collection('players').add({
    data: {
      nickName: profile.nickName,
      avatarUrl: profile.avatarUrl,
      highScore: 0,
      totalGames: 0,
      level: 1,
      coins: 0,
      createdAt: db.serverDate(),  // 使用服务端时间（防作弊）
      updatedAt: db.serverDate(),
    },
  })
  // result._id → 新文档的自动 ID
  console.log('玩家档案创建成功:', result._id)
}

// ==================== 查询（Read）====================
async function getMyProfile() {
  const result = await db.collection('players')
    .where({
      _openid: '{openid}',  // 微信自动替换为当前用户的 openid
    })
    .limit(1)
    .get()

  return result.data[0] || null
}

// ==================== 更新（Update）====================
async function updateHighScore(newScore: number) {
  // 先查出当前最高分
  const profile = await getMyProfile()
  if (!profile || newScore <= profile.highScore) {
    return  // 不是新纪录，不做无意义写操作
  }

  await db.collection('players')
    .doc(profile._id)        // 通过 _id 定位文档
    .update({
      data: {
        highScore: newScore,
        updatedAt: db.serverDate(),
      },
    })
  console.log('最高分已更新为:', newScore)
}

// ==================== 删除（Delete）====================
async function deletePlayer() {
  const profile = await getMyProfile()
  if (profile) {
    await db.collection('players').doc(profile._id).remove()
  }
}</code></pre>

      <h3>安全规则</h3>
      <p>和 Firestore 一样，你需要设置数据访问权限。在微信云开发控制台 → 数据库 → 权限设置中配置：</p>
      <table>
        <thead>
          <tr>
            <th>权限模式</th>
            <th>含义</th>
            <th>适用场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>仅创建者可读写</td>
            <td>只有文档的创建者（_openid 匹配）才能读写</td>
            <td>玩家个人数据（profile、背包）</td>
          </tr>
          <tr>
            <td>所有用户可读，仅创建者可写</td>
            <td>谁都能看，但只有作者能改</td>
            <td>排行榜（只读）、自定义关卡分享</td>
          </tr>
          <tr>
            <td>所有用户可读（管理端写）</td>
            <td>前端能看不能改，只有云函数能写</td>
            <td>全局配置表（活动、商品价格）</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>安全告警：</strong>不要把敏感操作放在客户端。比如给玩家加金币的逻辑<strong>不要在前端直接写数据库</strong>——懂技术的玩家可以抓包改请求。正确的做法是：前端发请求 → 云函数做校验 → 云函数写数据库。云函数是不可篡改的服务端逻辑。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚡" title="云函数——Serverless 计算">
      <p>
        云函数就是在微信服务器上跑的 <strong>Node.js 函数</strong>。它最核心的价值：<strong>前端改不了服务端逻辑</strong>。你在前端如果是调用 <code>localStorage.setItem('coins', 9999)</code>——玩家可以直接改。但如果你用云函数去计算和发放金币，前端只负责调用——安全边界就这样建立起来了。
      </p>

      <h3>常见云函数用例</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>为什么需要云函数（而不是前端直接操作）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>排行榜提交验证</td>
            <td>防止玩家伪造分数提交（如直接修改内存值 999999）</td>
          </tr>
          <tr>
            <td>每日登录奖励</td>
            <td>确保一天只发一次奖励——前端无法保证"时间不可回拨"</td>
          </tr>
          <tr>
            <td>战斗回放验证</td>
            <td>校验操作序列的合法性——防止加速/穿墙外挂</td>
          </tr>
          <tr>
            <td>抽卡/开箱概率</td>
            <td>概率逻辑必须跑在服务端——客户端概率可以被反复读取和利用</td>
          </tr>
          <tr>
            <td>敏感数据聚合</td>
            <td>如果一个查询需要访问所有玩家的数据，不能从前端发起</td>
          </tr>
        </tbody>
      </table>

      <h3>创建和调用</h3>
      <p><strong>第 1 步：创建云函数</strong></p>
      <p>在微信开发者工具中，右键 <code>cloudfunctions/</code> 目录 → 新建 Node.js 云函数：</p>
      <pre><code>// cloudfunctions/submitScore/index.js
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  // event 是前端传来的参数
  // context 中包含调用者的 OPENID（自动注入，无需前端传）
  const { score, level, checksum } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  // ===== 反作弊校验 =====
  // 1. 分数合理性：单局最高不超过 99999
  if (score > 99999) {
    return { success: false, reason: '分数异常' }
  }

  // 2. 校验和：前端传一个 checksum，后端用 session_key 验证
  //    （实际实现需要更复杂的签名算法，这里简化示意）
  if (!verifyChecksum(score, level, checksum)) {
    return { success: false, reason: '数据校验失败' }
  }

  // 3. 功率验证：前后两次提交间隔是否合理（防速刷）
  //    （需要查数据库中的上次提交时间）

  const db = cloud.database()

  // 切换到服务端数据库操作（权限最高）
  const player = await db.collection('players')
    .where({ _openid: openid })
    .limit(1)
    .get()

  if (player.data.length === 0) {
    return { success: false, reason: '玩家不存在' }
  }

  // 更新最高分（如果超过记录）
  const current = player.data[0]
  if (score > (current.highScore || 0)) {
    await db.collection('players').doc(current._id).update({
      data: {
        highScore: score,
        updatedAt: db.serverDate(),
      },
    })
  }

  return { success: true, newHighScore: Math.max(score, current.highScore || 0) }
}

function verifyChecksum(score, level, checksum) {
  // 实际项目中应使用 session_key 做 HMAC
  // 这里是示意——真做反作弊不要只用简单的拼接
  return true
}</code></pre>

      <p><strong>第 2 步：前端调用</strong></p>
      <pre><code>// ScoreManager.ts —— 前端提交分数的正确方式
async function submitScore(score: number, level: number) {
  const result = await wx.cloud.callFunction({
    name: 'submitScore',           // 云函数名称
    data: {
      score,
      level,
      checksum: generateChecksum(score, level),  // 简单的防篡改签名
    },
  })

  if (result.result.success) {
    console.log('成绩验证通过，最高分:', result.result.newHighScore)
  } else {
    console.warn('成绩被拒绝:', result.result.reason)
  }
}</code></pre>

      <div class="tip-box">
        <strong>前置条件：</strong>云函数需要先在微信开发者工具中<strong>上传并部署</strong>才能调用（右键云函数目录 → "上传并部署：云端安装依赖"）。开发阶段可以用<strong>本地调试</strong>模式来节省部署时间。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="💾" title="玩家进度同步——跨设备玩同一份存档">
      <p>
        玩家在手机上打了 100 关，换了 iPad 后希望进度还在——这就是<strong>云存档</strong>的价值。实现上，核心就是前端里<strong>自动保存</strong>的逻辑 + 云端 <strong>last-write-wins</strong> 的合并策略。
      </p>

      <h3>存档数据结构设计</h3>
      <pre><code>// 玩家云存档文档结构
interface GameSave {
  _id: string
  _openid: string
  highScore: number
  level: number
  unlockedPlanes: string[]     // 已解锁的飞机皮肤 ID 列表
  coins: number
  inventory: {                 // 道具库存
    bomb: number
    shield: number
    revive: number
  }
  settings: {                  // 玩家设置
    bgmVolume: number
    sfxVolume: number
    vibration: boolean
  }
  version: number              // 存档版本号（用于冲突检测）
  updatedAt: Date
}</code></pre>

      <h3>自动保存策略</h3>
      <table>
        <thead>
          <tr>
            <th>触发时机</th>
            <th>策略</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>关卡通关时</td>
            <td>立即保存进度（最高优先级）</td>
            <td>表单提交后保存</td>
          </tr>
          <tr>
            <td>游戏暂停时</td>
            <td>保存临时状态</td>
            <td>草稿自动保存</td>
          </tr>
          <tr>
            <td>定时保存（每 60 秒）</td>
            <td>仅保存变化过的数据（脏标记 dirty flag）</td>
            <td>Debounce + 脏检查</td>
          </tr>
          <tr>
            <td><code>wx.onHide</code></td>
            <td>保存临时进度 + 数据（游戏可能被杀死）</td>
            <td><code>beforeunload</code> 事件</td>
          </tr>
        </tbody>
      </table>

      <h3>冲突解决</h3>
      <p>
        如果玩家在手机上打了一关，又在平板上打了一关，两个设备的数据不一致——这就是分布式系统里的经典 <strong>conflict resolution</strong> 问题。对于小游戏存档，最简单的方案是 <strong>last-write-wins（最后一次写入胜出）</strong> + <strong>版本号</strong>。具体做法：
      </p>
      <ul>
        <li>每次写入时带上版本号，更新条件设为 <code>version === 当前版本</code>（乐观锁）</li>
        <li>如果更新失败（版本号不匹配），说明有并发写入——下拉最新数据，本地做合并</li>
        <li>合并策略：<strong>数字类型取 max</strong>（如最高分、关卡）、<strong>数组类型取并集</strong>（如已解锁飞机）</li>
      </ul>

      <h3>离线队列</h3>
      <pre><code>// OfflineQueue.ts —— 网络断开时排队，恢复后批量上传
class OfflineQueue {
  private static QUEUE_KEY = 'offline_sync_queue'

  /** 添加一条待同步的操作 */
  static enqueue(operation: { type: string; data: any }) {
    const queue = this._getQueue()
    queue.push({
      ...operation,
      timestamp: Date.now(),
    })
    wx.setStorageSync(this.QUEUE_KEY, JSON.stringify(queue))
  }

  /** 网络恢复时批量执行 */
  static async flush() {
    const queue = this._getQueue()
    if (queue.length === 0) return

    console.log(`[OfflineQueue] 开始同步 ${queue.length} 条操作`)

    for (const op of queue) {
      try {
        await this._execute(op)
      } catch (err) {
        console.warn('[OfflineQueue] 操作失败，保留在队列:', op.type)
        return  // 失败则保留，等下次网络恢复
      }
    }

    // 全部成功——清空队列
    wx.removeStorageSync(this.QUEUE_KEY)
    console.log('[OfflineQueue] 全部同步完成')
  }

  private static _getQueue(): any[] {
    try {
      return JSON.parse(wx.getStorageSync(this.QUEUE_KEY) || '[]')
    } catch {
      return []
    }
  }

  private static async _execute(op: { type: string; data: any }) {
    switch (op.type) {
      case 'saveScore':
        await ScoreManager.uploadHighScore(op.data.score)
        break
      case 'saveProgress':
        await db.collection('players').doc(op.data.id).update({
          data: { level: op.data.level, updatedAt: db.serverDate() }
        })
        break
      // 更多操作类型...
    }
  }
}

// 在 onLoad 中监听网络变化
wx.onNetworkStatusChange((res) => {
  if (res.isConnected) {
    OfflineQueue.flush()  // 网络恢复 → 尝试同步离线队列
  }
})</code></pre>

      <div class="tip-box">
        <strong>存储分层策略：</strong>敏感/付费数据 → 云数据库（<code>wx.cloud.database()</code>）；好友可见数据 → 云存储托管排行榜（<code>setUserCloudStorage</code>）；临时/非关键数据 → 本地 Storage（<code>wx.setStorageSync</code>）。不要所有数据都往云端写——每次写操作都计费。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📁" title="云存储——文件上传与 CDN 分发">
      <p>
        云存储是微信提供的<strong>文件存储 + CDN</strong>服务，类似 <strong>AWS S3 + CloudFront 一体化</strong>。适合存放玩家头像、游戏截图、自定义关卡、战斗回放文件等。
      </p>

      <h3>上传文件</h3>
      <pre><code>// 上传玩家自定义关卡截图
async function uploadLevelSnapshot(filePath: string): Promise&lt;string&gt; {
  try {
    const result = await wx.cloud.uploadFile({
      cloudPath: `snapshots/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`,
      filePath,  // 本地临时文件路径
    })

    // result.fileID → 云文件 ID（cloud://xxx 格式）
    // result.fileID 可以直接存入云数据库，用于后续读取
    console.log('截图上传成功:', result.fileID)
    return result.fileID
  } catch (err) {
    console.error('截图上传失败:', err)
    return ''
  }
}</code></pre>

      <h3>下载/显示文件</h3>
      <pre><code>// 将云文件 ID 转为临时 HTTPS 链接（有有效期）
async function getTempUrl(fileID: string): Promise&lt;string&gt; {
  const result = await wx.cloud.getTempFileURL({
    fileList: [fileID],
  })
  return result.fileList[0]?.tempFileURL || ''
}</code></pre>

      <h3>常用场景</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>玩家头像</td>
            <td>上传到云存储 → fileID 写入玩家文档 → 任何地方都能显示</td>
          </tr>
          <tr>
            <td>自定义关卡</td>
            <td>关卡数据 JSON → 上传为文件 → 其他玩家通过 fileID 下载</td>
          </tr>
          <tr>
            <td>战斗回放</td>
            <td>操作序列数组 → 上传 → 分享给好友回看</td>
          </tr>
          <tr>
            <td>游戏截图分享</td>
            <td>Canvas 导出图片 → 上传 → 生成分享链接</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>费用提醒：</strong>云存储免费额度 5GB / 月 CDN 流量 5GB。如果你的游戏截图分享很频繁，注意监控流量消耗。<strong>不要用云存储托管游戏资源包</strong>（音频、图片 Bundle）——那些应该走 Cocos 的远程资源加载通道，更便宜且支持断点续传。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 云开发需要付费吗？</h3>
      <p>
        免费额度足够个人开发者验证产品和初期运营。配额见上方免费额度表格。超出后按量付费，价格很低——云数据库超出后约 0.07 元/万次读。对于大部分 independent 小游戏来说，<strong>上线前期基本不花钱</strong>。
      </p>

      <h3>Q2: 我不写后端，云函数能跳过吗？只用云数据库行不行？</h3>
      <p>
        能，但不安全。直接从客户端写数据库相当于把数据库密码放在前端 JS 里——抓包就能看到你的数据结构和 API 地址。如果只存不敏感数据（如非排行榜的游戏设置），可以客户端直连。但凡涉及分数、金币、道具<strong>一定</strong>要走云函数校验。
      </p>

      <h3>Q3: 云数据库和 <code>wx.setUserCloudStorage</code> 有什么区别？</h3>
      <table>
        <thead>
          <tr>
            <th>特性</th>
            <th>云存储托管排行榜</th>
            <th>云数据库</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>数据结构</td>
            <td>固定 KV（key-value）</td>
            <td>完整 JSON 文档</td>
          </tr>
          <tr>
            <td>查询能力</td>
            <td>只能按 key 查</td>
            <td>支持条件查询、排序、分页</td>
          </tr>
          <tr>
            <td>数据范围</td>
            <td>仅好友</td>
            <td>全部玩家（取决于权限）</td>
          </tr>
          <tr>
            <td>需要开通云开发？</td>
            <td>不需要</td>
            <td>需要</td>
          </tr>
          <tr>
            <td>适合场景</td>
            <td>好友排行榜</td>
            <td>全服排行榜、玩家档案、物品系统</td>
          </tr>
        </tbody>
      </table>

      <h3>Q4: 云函数冷启动慢怎么办？</h3>
      <p>
        首次调用或长时间不调用后，云函数需要冷启动（几百毫秒 ~ 2 秒）。优化方法：
      </p>
      <ul>
        <li>在 <code>onLoad</code> 时用一个小 ping 调用"预热"云函数</li>
        <li>合理设置云函数的内存大小（默认 256MB，可调到 512MB 减少启动时间）</li>
        <li>把多个小逻辑合并到一个云函数中（减少冷启动次数）</li>
      </ul>

      <h3>Q5: 云数据库的查询有哪几种方式？</h3>
      <p>
        支持 <code>where()</code>、<code>orderBy()</code>、<code>limit()</code>、<code>skip()</code>、<code>field()</code>。
        这些操作可以链式调用——和 Lodash 的链式操作或 MongoDB 的查询语法基本一致。举例：
      </p>
      <pre><code>// 查询关卡 > 10 的玩家，按最高分降序，取前 20 条
const result = await db.collection('players')
  .where({ level: db.command.gt(10) })  // greater than 10
  .orderBy('highScore', 'desc')
  .limit(20)
  .field({ nickName: true, highScore: true, level: true })  // 只取这三列
  .get()</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>微信云开发的三大能力是什么？各自对应什么前端/后端概念？</li>
        <li>云数据库是关系型数据库还是文档型数据库？和 SQL 数据库的核心差异是什么？</li>
        <li><code>db.serverDate()</code> 的作用是什么？为什么不能用客户端的 <code>Date.now()</code>？</li>
        <li>云函数和客户端直接操作数据库的区别是什么？什么场景<strong>必须</strong>用云函数？</li>
        <li>玩家存档的冲突解决有哪几种策略？小游戏推荐哪种？为什么？</li>
        <li>离线队列的实现思路是什么？网络恢复后如何触发同步？</li>
        <li>云存储适合存放什么内容？不适合存放什么内容？</li>
        <li>云数据库的安全规则有哪几种模式？各适用于什么数据？</li>
        <li><code>wx.cloud.uploadFile</code> 返回的 <code>fileID</code> 格式是什么？如何转成可访问的 URL？</li>
        <li>云开发的免费额度是多少？超出的部分贵吗？</li>
        <li>如果玩家分数被云函数拒绝（反作弊），前端应该如何告知玩家？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
