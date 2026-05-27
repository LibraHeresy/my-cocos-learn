<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="7" title="数据运营分析" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>读懂<strong>DAU / WAU / MAU / 留存率</strong>等核心数据指标，用数据判断游戏健康状况</li>
        <li>使用 <strong>wx.reportMonitor</strong> 自定义打点，追踪玩家行为全链路</li>
        <li>理解<strong>ARPU / ARPPU / LTV</strong>——从"赚多少钱"到"一个玩家值多少钱"</li>
        <li>优化<strong>广告收益</strong>——激励视频的最佳时机、频率控制、A/B 测试</li>
        <li>通过数据定位<strong>流失节点</strong>，用数据指导数值和功能迭代</li>
        <li>满足<strong>微信审核隐私合规</strong>要求——最小化数据收集 + 隐私弹窗 + 数据删除</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="前端视角：游戏数据运营 = Web Analytics + 业务 BI">
      <p>
        如果你用过 <strong>Google Analytics</strong>、百度的 <strong>百度统计</strong>、或者自己埋点做过
        <strong>用户行为追踪</strong>，游戏数据运营就是完全一样的思路。区别只是指标名称变了，方法论不变。
      </p>

      <table>
        <thead>
          <tr>
            <th>Web 前端</th>
            <th>游戏运营</th>
            <th>本质</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>PV / UV</td>
            <td>DAU / MAU</td>
            <td>多少人在用</td>
          </tr>
          <tr>
            <td>Session Duration</td>
            <td>平均游戏时长</td>
            <td>用户用了多久</td>
          </tr>
          <tr>
            <td>Bounce Rate</td>
            <td>首日流失率</td>
            <td>来了就走</td>
          </tr>
          <tr>
            <td>Conversion Rate</td>
            <td>付费转化率 / 广告点击率</td>
            <td>用户是否做了目标行为</td>
          </tr>
          <tr>
            <td>User Journey Funnel</td>
            <td>游戏漏斗（安装→玩→付费）</td>
            <td>用户从哪一步流失了</td>
          </tr>
          <tr>
            <td>Custom Event Tracking</td>
            <td>wx.reportMonitor 自定义打点</td>
            <td>追踪特定行为</td>
          </tr>
          <tr>
            <td>Revenue / GMV</td>
            <td>ARPU / LTV</td>
            <td>每个用户值多少钱</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>核心认知：</strong>游戏上线后，<strong>数据就是你唯一的眼睛</strong>。你没有客服电话、没有用户访谈、没有可用性测试——你只能通过数据了解玩家。
        这和前端项目上线后看 PV/UV 分析是一个逻辑——不埋点，就是盲人。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📊" title="微信后台核心数据指标——看懂小游戏后台">
      <p>
        微信小游戏后台提供了丰富的数据看板。你不需要自己搭建——但你需要<strong>读懂每个指标的含义</strong>：
      </p>

      <h3>用户规模指标</h3>
      <table>
        <thead>
          <tr>
            <th>指标</th>
            <th>全称</th>
            <th>计算公式</th>
            <th>健康标准</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>DAU</td>
            <td>Daily Active Users（日活跃用户）</td>
            <td>当天打开过游戏的去重用户数</td>
            <td>射击小游戏：500+ 算起步</td>
          </tr>
          <tr>
            <td>WAU</td>
            <td>Weekly Active Users（周活跃用户）</td>
            <td>7 天内打开过游戏的去重用户数</td>
            <td>DAU × 3~5 倍合理区间</td>
          </tr>
          <tr>
            <td>MAU</td>
            <td>Monthly Active Users（月活跃用户）</td>
            <td>30 天内打开过游戏的去重用户数</td>
            <td>DAU × 10~20 倍合理区间</td>
          </tr>
          <tr>
            <td>DAU/MAU</td>
            <td>用户粘性比率</td>
            <td>DAU ÷ MAU × 100%</td>
            <td>20%+ 优秀，10% 及格，&lt;5% 危险</td>
          </tr>
        </tbody>
      </table>

      <h3>留存指标——最重要的数据</h3>
      <table>
        <thead>
          <tr>
            <th>指标</th>
            <th>含义</th>
            <th>行业参考值（休闲射击）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>次日留存</td>
            <td>下载后第 2 天还在玩的用户占比</td>
            <td>30%+ 优秀，20% 及格，&lt;15% 需要立即优化</td>
          </tr>
          <tr>
            <td>3 日留存</td>
            <td>下载后第 3 天还在玩的用户占比</td>
            <td>20%+ 优秀，12% 及格</td>
          </tr>
          <tr>
            <td>7 日留存</td>
            <td>下载后第 7 天还在玩的用户占比</td>
            <td>10%+ 优秀，5% 及格——这是判断"游戏好不好玩"的核心指标</td>
          </tr>
          <tr>
            <td>30 日留存</td>
            <td>下载后第 30 天还在玩的用户占比</td>
            <td>3%+ 优秀，1% 及格——代表核心粉丝</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>关键认知：</strong>次日留存反映<strong>"第一印象"</strong>（教程好不好、画面吸不吸引）；
        7 日留存反映<strong>"核心玩法"</strong>（游戏到底好不好玩）；30 日留存反映<strong>"内容深度"</strong>（有没有东西可以反复玩）。
        如果次日留存低——优化教程和画面；如果 7 日留存低——核心玩法有问题（可能是最大麻烦）；如果 30 日留存低——内容不够深。
      </div>

      <h3>变现指标</h3>
      <table>
        <thead>
          <tr>
            <th>指标</th>
            <th>全称</th>
            <th>含义</th>
            <th>计算</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ARPU</td>
            <td>Average Revenue Per User</td>
            <td>每个活跃用户带来的平均收入</td>
            <td>总收入 ÷ DAU（或 MAU）</td>
          </tr>
          <tr>
            <td>ARPPU</td>
            <td>Average Revenue Per Paying User</td>
            <td>每个<strong>付费用户</strong>的平均收入</td>
            <td>总收入 ÷ 付费用户数</td>
          </tr>
          <tr>
            <td>LTV</td>
            <td>Lifetime Value（用户生命周期价值）</td>
            <td>一个用户从安装到流失的<strong>总贡献收入</strong></td>
            <td>ARPU × 平均留存天数</td>
          </tr>
          <tr>
            <td>eCPM</td>
            <td>Effective Cost Per Mille</td>
            <td>每<strong>千次</strong>广告展示的预估收入</td>
            <td>广告收入 ÷ 展示次数 × 1000</td>
          </tr>
          <tr>
            <td>填充率</td>
            <td>Fill Rate</td>
            <td>请求广告时成功获取到广告的比例</td>
            <td>成功展示 ÷ 请求次数 × 100%</td>
          </tr>
          <tr>
            <td>点击率</td>
            <td>CTR (Click Through Rate)</td>
            <td>看到广告后点击的比例</td>
            <td>点击次数 ÷ 展示次数 × 100%</td>
          </tr>
        </tbody>
      </table>

      <h3>漏斗分析——用户从哪一步流失了？</h3>
      <p>标准游戏用户漏斗：</p>
      <pre><code>曝光（看到小游戏入口）  →  100%
    ↓ 点击率 5-15%
点击（进入加载页）      →  70%
    ↓ 加载成功率 ~90%
安装/授权              →  50%
    ↓ 首次体验完成率 ~60%
首次游玩（完成第 1 局）  →  30%
    ↓ 次日留存 20-30%
第 2 天回访             →  20%
    ↓ 付费转化率 2-5%（广告 10-20%）
付费 / 看广告           →  3%

每个箭头之间的落差 = 优化空间</code></pre>

      <div class="tip-box">
        <strong>最大优化机会：</strong>从"安装"到"首次游玩"的 40% 流失——这不是游戏不好玩，是<strong>加载太慢或首次体验太差</strong>。
        优化主包体积 + 新手教程质量 = 直接提升留存，比花钱买量有效十倍。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📡" title="wx.reportMonitor —— 自定义数据打点">
      <p>
        微信后台会给你基础数据（DAU、留存），但你需要<strong>更细粒度的游戏内行为数据</strong>来指导优化。
        <code>wx.reportMonitor</code> 是微信提供的自定义打点 API——和前端 <code>analytics.track()</code>（友盟/神策/GrowingIO）完全一致。
      </p>

      <h3>API 使用方法</h3>
      <pre><code>// 基础用法
wx.reportMonitor('key_name', value)

// 示例：追踪关卡数据
wx.reportMonitor('level_start', 1)       // 关卡编号
wx.reportMonitor('level_complete', 1)    // 哪一关完成
wx.reportMonitor('level_fail', 3)        // 在第几波失败</code></pre>

      <h3>推荐打点事件清单</h3>
      <table>
        <thead>
          <tr>
            <th>事件 Key</th>
            <th>触发时机</th>
            <th>Value 含义</th>
            <th>分析用途</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>game_start</code></td>
            <td>每局开始</td>
            <td>1</td>
            <td>统计总局数</td>
          </tr>
          <tr>
            <td><code>game_end</code></td>
            <td>每局结束</td>
            <td>最终波次</td>
            <td>波次分布——哪一波流失最多</td>
          </tr>
          <tr>
            <td><code>boss_encounter</code></td>
            <td>遇到 Boss</td>
            <td>Boss 编号</td>
            <td>哪个 Boss 最劝退</td>
          </tr>
          <tr>
            <td><code>item_used</code></td>
            <td>使用道具</td>
            <td>道具类型</td>
            <td>哪个道具最受欢迎 / 没人用</td>
          </tr>
          <tr>
            <td><code>ad_shown</code></td>
            <td>广告展示</td>
            <td>广告场景（1=复活，2=双倍奖励...）</td>
            <td>哪个场景的广告展示最多</td>
          </tr>
          <tr>
            <td><code>ad_completed</code></td>
            <td>广告看完</td>
            <td>广告场景</td>
            <td>完播率——广告有没有被中途关闭</td>
          </tr>
          <tr>
            <td><code>purchase</code></td>
            <td>付费</td>
            <td>金额（分）</td>
            <td>付费总额和分布</td>
          </tr>
          <tr>
            <td><code>sign_in</code></td>
            <td>签到</td>
            <td>签到天数</td>
            <td>签到在各天数的参与率</td>
          </tr>
          <tr>
            <td><code>task_complete</code></td>
            <td>完成任务</td>
            <td>任务类型</td>
            <td>哪种任务完成率最高</td>
          </tr>
          <tr>
            <td><code>share</code></td>
            <td>分享</td>
            <td>分享场景（1=炫耀分数，2=求助...）</td>
            <td>分享意愿和场景偏好</td>
          </tr>
        </tbody>
      </table>

      <h3>事件数据模型——本地增强版</h3>
      <p>
        <code>wx.reportMonitor</code> 只能传 key+value，信息有限。建议在本地<strong>额外记录完整日志</strong>，
        定期通过云函数批量上传到自己的数据库：
      </p>
      <pre><code>// AnalyticsManager.ts —— 本地数据采集 + 批量上传
interface AnalyticsEvent {
  event: string           // 事件名
  timestamp: number       // 毫秒时间戳
  userId: string          // 用户 openId（匿名化）
  sessionId: string       // 本次游戏会话 ID
  data: Record&lt;string, any&gt; // 扩展数据
}

class AnalyticsManager {
  private static _buffer: AnalyticsEvent[] = []
  private static _sessionId: string = ''
  private static _userId: string = ''

  static init(userId: string) {
    this._userId = userId
    this._sessionId = `${userId}_${Date.now()}`
  }

  // 记录事件
  static track(event: string, data: Record&lt;string, any&gt; = {}) {
    const ev: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      userId: this._userId,
      sessionId: this._sessionId,
      data,
    }

    // 1. 同步上报到微信（轻量）
    wx.reportMonitor(event, data.value ?? 1)

    // 2. 本地缓存（完整数据），批量上传
    this._buffer.push(ev)
    if (this._buffer.length >= 20) {
      this.flush()
    }
  }

  // 批量上传到云函数
  private static flush() {
    const batch = [...this._buffer]
    this._buffer = []

    wx.cloud.callFunction({
      name: 'uploadAnalytics',
      data: { events: batch },
      success: () => { /* 上传成功 */ },
      fail: (err) => {
        // 上传失败 → 放回缓冲区，下次重试
        this._buffer.unshift(...batch)
      }
    })
  }

  // 游戏退出 / onHide 时强制上传
  static forceFlush() {
    if (this._buffer.length > 0) {
      this.flush()
    }
  }
}</code></pre>

      <div class="tip-box">
        <strong>批量上传 vs 实时上报：</strong>单条上报太耗网络（每局可能有几十个事件），批量聚合每 20 条或每次游戏结束上传一次。
        这和前端里 <code>navigator.sendBeacon</code> 的批量发送是一个道理——减少请求次数，提高可靠性。
        <br /><br />
        这个批量上传模式本质上就是 <strong>Phase 10（数据持久化与云开发）</strong>中 OfflineQueue 的变体——一个离线队列用于游戏存档，一个用于数据埋点，思路完全一致。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="💰" title='广告收益优化——把"看广告"变成玩家自愿的选择'>
      <p>
        广告是小游戏最核心的收入来源。但广告放不对地方 = 用户体验崩坏 = 用户流失 =
        <strong>长期收入归零</strong>。好的广告设计是让玩家"想"看广告，而不是"被迫"看广告。
      </p>

      <h3>三种广告形式的取舍</h3>
      <table>
        <thead>
          <tr>
            <th>广告类型</th>
            <th>eCPM（参考）</th>
            <th>对体验的影响</th>
            <th>射击游戏建议</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Banner 广告</td>
            <td>1 - 5 元</td>
            <td>中等——持续占用屏幕空间</td>
            <td>❌ 不推荐（竖屏空间紧张，遮挡游戏）</td>
          </tr>
          <tr>
            <td>插屏广告</td>
            <td>10 - 30 元</td>
            <td>差——突然弹出，打断操作</td>
            <td>❌ 不推荐（战斗中出现 = 玩家怒卸）</td>
          </tr>
          <tr>
            <td>激励视频</td>
            <td>20 - 60 元</td>
            <td>好——用户主动选择观看</td>
            <td>✅ 首选——eCPM 最高 + 体验最好</td>
          </tr>
        </tbody>
      </table>

      <h3>激励视频的高价值场景设计</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>触发时机</th>
            <th>用户动机强度</th>
            <th>预估完播率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>死亡后复活</strong></td>
            <td>飞机坠毁瞬间</td>
            <td>★★★★★ 最强</td>
            <td>90%+</td>
          </tr>
          <tr>
            <td>奖励翻倍</td>
            <td>波次/关卡结算页面</td>
            <td>★★★★☆ 很强</td>
            <td>80%+</td>
          </tr>
          <tr>
            <td>每日签到额外奖励</td>
            <td>签到领取后</td>
            <td>★★★☆☆ 中等</td>
            <td>60%+</td>
          </tr>
          <tr>
            <td>商店折扣道具</td>
            <td>波间休息商店</td>
            <td>★★☆☆☆ 较弱</td>
            <td>40%+</td>
          </tr>
          <tr>
            <td>开局 Buff 选择</td>
            <td>新一局开始前</td>
            <td>★★☆☆☆ 较弱</td>
            <td>35%+</td>
          </tr>
        </tbody>
      </table>

      <h3>广告频率控制——避免疲劳</h3>
      <pre><code>// AdManager.ts —— 广告频率与冷却管理
class AdManager {
  private static _reviveCount = 0       // 本局复活次数
  private static _lastAdTime = 0        // 上次展示广告的时间戳
  private static _dayAdCount = 0        // 今日广告总次数

  // 检查是否可以展示广告
  static canShowAd(context: AdContext): boolean {
    // 规则 1：每局最多复活 2 次
    if (context === 'revive' && this._reviveCount >= 2) return false

    // 规则 2：两次广告间隔至少 60 秒
    const now = Date.now()
    if (now - this._lastAdTime < 60000) return false

    // 规则 3：每日广告总次数上限 10 次
    if (this._dayAdCount >= 10) return false

    return true
  }

  // 展示广告后记录
  static onAdShown(context: AdContext) {
    if (context === 'revive') this._reviveCount++
    this._lastAdTime = Date.now()
    this._dayAdCount++
  }

  // 新一局开始 → 重置局内计数
  static onNewGame() {
    this._reviveCount = 0
  }

  // 每日重置
  static onNewDay() {
    this._dayAdCount = 0
  }
}</code></pre>

      <h3>A/B 测试广告方案</h3>
      <p>同一个场景，可能有多个广告方案——例如"死亡复活"的广告视频时长选择：</p>
      <table>
        <thead>
          <tr>
            <th>方案</th>
            <th>视频时长</th>
            <th>奖励</th>
            <th>测试结果</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A 组</td>
            <td>15 秒</td>
            <td>复活 + 2 秒无敌</td>
            <td>完播率 95%，但 eCPM 较低</td>
          </tr>
          <tr>
            <td>B 组</td>
            <td>30 秒</td>
            <td>复活 + 5 秒无敌 + 炸弹</td>
            <td>完播率 82%，eCPM × 2</td>
          </tr>
          <tr>
            <td>C 组（最终采用）</td>
            <td>30 秒</td>
            <td>复活 + 5 秒无敌 + 炸弹 + "下次复活永久免费"</td>
            <td>完播率 88%，eCPM × 1.8</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>广告红线：</strong>(1) 不要伪造点击、不要诱导误点——微信会封禁流量主资格；(2) 不要在战斗核心区域放置 Banner；
        (3) 插屏广告只在自然切换场景时展示（如结算→菜单），永远不可以在战斗中弹出；(4) 必须提供"关闭广告"或"不看广告"的明确按钮。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔄" title='数据驱动迭代——用数据找到"哪里不对"'>
      <p>
        数据不只是后台看数字——它是<strong>指导你下一步做什么</strong>的唯一依据。
        以下是具体的数据分析场景和对应的优化行动：
      </p>

      <h3>场景一：定位流失节点</h3>
      <pre><code>// AnalyticsManager.ts —— 追踪关卡流失
// 每局结束时上报最终波次
AnalyticsManager.track('game_end', { wave: finalWave, score: finalScore })

// 分析结果示例（一周数据）：
// 波次 1-3:  完成率 92%（正常）
// 波次 4:    完成率 85%（轻微下降）
// 波次 7:    完成率 60%（大幅下降 ← 流失节点！）
// 波次 8+:   完成率 28%

// → 行动：检查第 7 波发生了什么
// → 发现：Boss 第一次登场，HP 太高、弹幕太密
// → 修正：降低第 7 波 Boss HP 15%，增加 3 个道具掉落
// → 结果：下一周波次 7 完成率回升至 78%</code></pre>

      <h3>场景二：道具使用率分析</h3>
      <table>
        <thead>
          <tr>
            <th>道具</th>
            <th>使用率</th>
            <th>诊断</th>
            <th>行动</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>炸弹</td>
            <td>85%</td>
            <td>正常——核心道具</td>
            <td>保持</td>
          </tr>
          <tr>
            <td>护盾</td>
            <td>12%</td>
            <td>太低——玩家不重视防御</td>
            <td>降低价格 or 增强效果</td>
          </tr>
          <tr>
            <td>攻击 buff</td>
            <td>67%</td>
            <td>正常——玩家喜欢攻击力</td>
            <td>增加 buff 种类（散射/贯穿/减速）</td>
          </tr>
          <tr>
            <td>时间减速</td>
            <td>3%</td>
            <td>几乎没人用——要么太贵、要么效果不明显</td>
            <td>降价 50% or 重做效果</td>
          </tr>
        </tbody>
      </table>

      <h3>场景三：会话分析——找到"无聊时刻"</h3>
      <pre><code>// 追踪每局的时长分布
AnalyticsManager.track('game_end', { duration: elapsedSeconds })

// 分析结果：
// 0-30s:  28%（大量快速死亡——可能是新人或不会玩）
// 30-60s: 18%
// 1-3min: 35%（主力区间）
// 3-5min: 15%
// 5min+:  4%

// → 关注 0-30s 的 28%：这些玩家可能根本没理解怎么玩
// → 行动：检查教程完成率、添加"为什么死了"的提示
// → 关注 5min+ 的 4%：老玩家觉得没挑战？
// → 行动：设计更高难度的内容 or 无尽模式</code></pre>

      <h3>低成本数据看板方案</h3>
      <p>
        不需要自建后端。对于独立小游戏，最简单的数据看板方案：
        <strong>Google Sheets + 微信云函数 + 定时脚本</strong>：
      </p>
      <pre><code>// 云函数：每小时汇总数据写入 Google Sheets
// cloud/functions/analyticsReport/index.js
exports.main = async (event) => {
  const db = cloud.database()
  const yesterday = new Date(Date.now() - 86400000)

  // 1. 从数据库查询昨日数据
  const totalGames = await db.collection('analytics')
    .where({ event: 'game_start', timestamp: _.gte(yesterday.getTime()) })
    .count()

  const avgWave = await db.collection('analytics')
    .where({ event: 'game_end' })
    .aggregate()
    .group({ _id: null, avg: $.avg('$data.wave') })
    .end()

  // 2. 调用 Google Sheets API 写入汇总数据
  // 或者：导出 CSV → 手动粘贴到 Google Sheets（最省事）
  return { totalGames: totalGames.total, avgWave: avgWave.list[0]?.avg }
}</code></pre>

      <div class="tip-box">
        <strong>最简方案：</strong>如果不想写云函数、不想连 API，那就<strong>每周手动导出微信后台 CSV → 导入 Google Sheets</strong>。
        用 =AVERAGE() / =COUNTIF() 等公式做分析。对于日活 500 以下的小游戏，手动分析完全够用。
        不要"过度工程化"——先有数据驱动决策的习惯，再考虑自动化。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔒" title="隐私合规——微信审核与法规要求">
      <p>
        2024 年以后，微信对<strong>小游戏隐私合规</strong>审核进入了严管期。不了解合规要求 =
        审核被拒 = 无法上线 = 所有开发白费。这比任何 Bug 都严重。
      </p>

      <h3>微信审核五大合规要点</h3>
      <table>
        <thead>
          <tr>
            <th>要求</th>
            <th>具体做法</th>
            <th>严重程度</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>最小化数据收集</strong></td>
            <td>只收集游戏运行必需的数据（openId、分数）。不碰通讯录、位置、相册</td>
            <td>一票否决</td>
          </tr>
          <tr>
            <td><strong>隐私弹窗</strong></td>
            <td>首次启动弹出《隐私保护指引》，必须含"同意"和"不同意"按钮（不同意 = 退出）</td>
            <td>一票否决</td>
          </tr>
          <tr>
            <td><strong>不强制收集信息</strong></td>
            <td>不能不授权就无法进入游戏——必须提供"游客模式"或最小授权后即可正常游玩</td>
            <td>一票否决</td>
          </tr>
          <tr>
            <td><strong>数据删除能力</strong></td>
            <td>提供"注销账号 / 删除数据"入口。一般在设置页的底部</td>
            <td>严重</td>
          </tr>
          <tr>
            <td><strong>第三方 SDK 声明</strong></td>
            <td>如果集成了第三方 SDK（如统计、广告），必须在隐私指引中说明用途</td>
            <td>中等</td>
          </tr>
        </tbody>
      </table>

      <h3>隐私弹窗实现</h3>
      <pre><code>// PrivacyPopup.ts —— 首次启动必须显示的隐私弹窗
class PrivacyPopup {
  static show() {
    // 检查是否已经同意过
    if (wx.getStorageSync('privacy_agreed') === true) {
      return // 已同意，跳过
    }

    // 显示隐私弹窗
    wx.showModal({
      title: '隐私保护指引',
      content: '欢迎使用像素飞机大战！\n\n'
        + '我们会收集你的游戏数据（如分数、关卡进度）用于提供游戏服务和优化体验。\n\n'
        + '我们不会收集你的个人身份信息（如姓名、手机号、位置）。\n\n'
        + '你可以随时在【设置 → 删除数据】中删除所有数据。\n\n'
        + '点击"同意"表示你已阅读并同意《隐私保护指引》。',
      confirmText: '同意并继续',
      cancelText: '不同意',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('privacy_agreed', true)
          // 继续进入游戏
        } else {
          // 用户不同意 → 退出小游戏
          wx.exitMiniProgram()
        }
      }
    })
  }
}</code></pre>

      <h3>设置页数据删除入口</h3>
      <pre><code>// SettingsUI.ts —— 设置页的数据删除按钮
// 这是一个必须有的功能——审核会检查
function onDeleteData() {
  wx.showModal({
    title: '确认删除',
    content: '删除后你的所有游戏数据将被清除（包括分数、道具、皮肤），且无法恢复。',
    confirmText: '确认删除',
    confirmColor: '#ff0000',
    success: (res) => {
      if (res.confirm) {
        wx.clearStorage()           // 清除所有本地数据
        wx.setStorageSync('privacy_agreed', true)  // 保留隐私同意状态
        wx.showToast({ title: '数据已删除', icon: 'success' })
        // 可选：调用云函数删除服务器端数据
        wx.cloud.callFunction({ name: 'deleteUserData' })
      }
    }
  })
}</code></pre>

      <h3>《个人信息保护法》与 GDPR 对游戏开发者的意义</h3>
      <p>
        作为个人开发者，你不需要成为法务专家——但你需要知道中国《个人信息保护法》的<strong>三个核心原则</strong>：
      </p>
      <ol>
        <li><strong>告知 + 同意：</strong>收集什么、为什么收集、怎么用——必须在收集前告知并获取同意</li>
        <li><strong>最小必要：</strong>只收集实现游戏功能必需的数据。不需要 GPS 就别碰 GPS</li>
        <li><strong>删除权：</strong>用户有权要求删除数据——你必须提供这个入口</li>
      </ol>

      <div class="warn-box">
        <strong>红线警告：</strong>微信会在审核时手动测试隐私弹窗。如果弹窗可以跳过、
        或者点了"不同意"还能继续玩——直接拒审。另外，<strong>不要偷偷收集设备信息、剪贴板内容</strong>——这些行为会被
        iOS 的"隐私记录"功能暴露，后果严重。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 数据好多，我只关心最重要的 3 个指标，是什么？</h3>
      <p>
        <strong>(1) 次日留存率：</strong>判断第一印象好不好——这个低了什么都不用讨论。
        <strong>(2) 7 日留存率：</strong>判断游戏好不好玩——这是游戏质量的"判决书"。
        <strong>(3) ARPU / 用户平均收入：</strong>判断有没有商业价值。这三个指标组成一个"铁三角"：
        次日留存看潜力，7 日留存看质量，ARPU 看变现。任何一个崩了，游戏都跑不远。
      </p>

      <h3>Q2: wx.reportMonitor 打点有上限吗？</h3>
      <p>
        微信官方文档没有公开打点数量上限，但建议<strong>控制在 15-20 个 Key 以内</strong>。
        每个 Key 代表一类事件分类——不要为每个具体关卡建独立的 Key（如 level_1、level_2...level_50），
        应该用 <code>level_start</code> + value=关卡编号。像写 CSS
        class 一样——用语义化命名而不是数字序列。
      </p>

      <h3>Q3: 用户量还很小（DAU &lt; 100），做数据分析有用吗？</h3>
      <p>
        有用，但方式要调整。小数据量下，<strong>不要说"百分比"</strong>（100 个用户里 3 个付费 = "付费率 3%"是<strong>不可靠的</strong>——
        第 4 个用户付费了就变成 4%）。小数据量下的做法：
        <strong>看"绝对趋势"而不是比例</strong>——"上周有 5 人付费，这周有 8 人"比"付费率从 3% 涨到 4%"更有意义。
        类比前端：A/B 测试 100 个用户没有统计学意义，但 10,000 个用户就有。
      </p>

      <h3>Q4: 隐私弹窗必须做吗？我的游戏根本不收集个人信息。</h3>
      <p>
        <strong>必须做。</strong>微信审核不看"你觉得自己收不收集"——微信认为只要用了
        <code>wx.setStorageSync</code>（本地存储）和 <code>wx.getUserInfo</code>（哪怕是头像），
        就属于"数据处理"，必须弹隐私弹窗。这是审核的<strong>一票否决项</strong>。不做 = 无法上线，没有例外。
      </p>

      <h3>Q5: 激励视频 eCPM 一直很低怎么办？</h3>
      <p>
        eCPM 的核心影响因素是<strong>完播率</strong>（有多少人看完了整个视频）和<strong>用户画像</strong>（广告主愿意为这类用户出多少钱）。
        你无法控制用户画像，但你可以控制：
        (1) <strong>提高完播率：</strong>把广告放在"用户最想获得奖励"的时刻——死亡后复活的完播率永远最高；
        (2) <strong>提高展示量：</strong>合理增加广告场景（但不要堆砌——见频率控制）；
        (3) <strong>测试不同广告位：</strong>微信支持创建多个广告位，分别看看 eCPM 差异——有时候换个广告位 eCPM 能翻倍。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>DAU、WAU、MAU 分别是什么？DAU/MAU 比率多少算健康？</li>
        <li>次日留存、7 日留存、30 日留存分别反映什么问题？行业参考值是多少？</li>
        <li>ARPU、ARPPU、LTV 分别是什么？它们之间有什么关系？</li>
        <li>eCPM 是什么？影响 eCPM 的最重要因素是什么？</li>
        <li>游戏用户漏斗分析中，"安装"到"首次游玩"的流失率一般最高——这是为什么？</li>
        <li>wx.reportMonitor 的 API 格式是什么？推荐打点哪 10 个核心事件？</li>
        <li>为什么建议批量上传事件数据而不是实时单条上报？</li>
        <li>激励视频的 5 个高价值场景分别是什么？哪个场景的完播率最高？</li>
        <li>广告频率控制的三个维度分别是什么？（每局次数、间隔时间、每日上限）</li>
        <li>如何通过数据定位流失节点？具体的分析流程是什么？</li>
        <li>微信隐私合规的 5 大审核要点是什么？</li>
        <li>隐私弹窗中"不同意"按钮的处理逻辑是什么？</li>
        <li>数据删除功能的要求是什么？应该放在哪里？</li>
        <li>《个人信息保护法》的三个核心原则是什么？</li>
        <li>小数据量（DAU &lt; 100）做数据分析的核心注意事项是什么？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
