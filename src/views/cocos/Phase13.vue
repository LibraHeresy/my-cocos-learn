<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="13" title="留存系统设计" duration="2-3 天" :total="17">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>设计<strong>每日签到</strong>系统——7 天奖励递增循环，让玩家每天都想回来</li>
        <li>搭建<strong>每日任务</strong>系统——给玩家明确的"今天该做什么"</li>
        <li>实现<strong>成就系统</strong>——用 Observer 模式让游戏事件自动触发成就检测</li>
        <li>设计<strong>新手引导</strong>流程——5-7 步引导新玩家快速上手，降低流失</li>
        <li>策划<strong>七日留存活动</strong>——新用户首周日历 + 补签 + 回归奖励</li>
        <li>理解留存系统背后的<strong>行为心理学</strong>——习惯养成、损失厌恶、进度效应</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="前端视角：留存系统 = 用户运营 + 状态持久化">
      <p>
        留存系统的本质和前端应用的用户运营完全一致——你写过的<strong>签到弹窗</strong>、<strong>任务列表</strong>、
        <strong>新手引导遮罩层</strong>就是游戏留存系统的前端版。区别只是游戏多了一层"数值奖励"。
      </p>

      <table>
        <thead>
          <tr>
            <th>前端功能</th>
            <th>游戏留存系统</th>
            <th>核心技术点</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>每日签到弹窗</td>
            <td>7 天签到日历</td>
            <td>日期判断、补签逻辑、状态持久化</td>
          </tr>
          <tr>
            <td>任务列表 / TODO</td>
            <td>每日任务系统</td>
            <td>进度追踪、5:00 AM 刷新、批量领取</td>
          </tr>
          <tr>
            <td>勋章 / 等级徽章</td>
            <td>成就系统</td>
            <td>条件检测、Observer 模式、解锁通知</td>
          </tr>
          <tr>
            <td>Onboarding 引导</td>
            <td>新手教程流程</td>
            <td>步骤机（State Machine）、遮罩高亮、强制/跳过</td>
          </tr>
          <tr>
            <td>Push 通知 / 邮件召回</td>
            <td>7 日留存活动 + 回归奖励</td>
            <td>wx.requestSubscribeMessage、离线天数计算</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>核心原则：</strong>留存系统不是"做完了事"的功能堆砌——它们服务于同一个目的：
        <strong>给玩家"明天再回来"的理由</strong>。签到的第 7 天大奖没领、任务还差 2 个完成、成就 18/20——
        这些"未完成感"比任何弹窗都更能留住玩家。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📅" title="每日签到系统——7 天奖励循环">
      <p>
        签到系统的核心不是"每天给东西"，而是<strong>制造连续的登录习惯</strong>。7 天一个周期，
        奖励逐日递增——第 1 天小恩小惠，第 7 天大惊喜。心理学原理：<strong>损失厌恶</strong>——"断签就没了"比"签到有奖励"更有效。
      </p>

      <h3>7 天签到奖励设计</h3>
      <table>
        <thead>
          <tr>
            <th>天数</th>
            <th>奖励内容</th>
            <th>价值梯度</th>
            <th>设计意图</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Day 1</td>
            <td>50 金币</td>
            <td>★☆☆☆☆</td>
            <td>"来都来了"——零门槛领取</td>
          </tr>
          <tr>
            <td>Day 2</td>
            <td>100 金币 + 1 个炸弹道具</td>
            <td>★★☆☆☆</td>
            <td>道具教学——让玩家知道炸弹怎么用</td>
          </tr>
          <tr>
            <td>Day 3</td>
            <td>150 金币 + 2 钻石</td>
            <td>★★★☆☆</td>
            <td>引入高级货币——钻石的使用场景</td>
          </tr>
          <tr>
            <td>Day 4</td>
            <td>200 金币 + 攻击力 buff（下一局）</td>
            <td>★★★☆☆</td>
            <td>Buff 引导——"有了 buff 能打更远"</td>
          </tr>
          <tr>
            <td>Day 5</td>
            <td>300 金币 + 5 钻石</td>
            <td>★★★★☆</td>
            <td>加速奖励——快到终点了</td>
          </tr>
          <tr>
            <td>Day 6</td>
            <td>400 金币 + 8 钻石 + 护盾道具</td>
            <td>★★★★☆</td>
            <td>倒数第二天——"明天有更好的"</td>
          </tr>
          <tr>
            <td>Day 7</td>
            <td>1000 金币 + 20 钻石 + 限定皮肤</td>
            <td>★★★★★</td>
            <td>终极奖励——限定 = 稀缺感 = 必须签到</td>
          </tr>
        </tbody>
      </table>

      <h3>数据模型</h3>
      <pre><code>// SignInManager.ts —— 签到系统核心数据模型
interface SignInData {
  lastSignDate: string       // 最后签到日期 'YYYY-MM-DD'
  signCount: number          // 当前周期已签到天数 0~7
  signHistory: number[]      // 最近 7 天的签到记录（按位存储或数组）
  cycleStartDate: string     // 当前周期起始日期
  totalSignDays: number      // 历史总签到天数（成就系统用）
}

// 存储方式：wx.setStorageSync('signData', JSON.stringify(data))</code></pre>

      <h3>签到检测与更新逻辑</h3>
      <pre><code>// SignInManager.ts —— 核心签到逻辑
class SignInManager {
  private static _data: SignInData

  // 进入游戏时调用——检查今天是否可以签到
  static canSignToday(): boolean {
    const today = this.getTodayStr()           // '2026-01-15'
    return today !== this._data.lastSignDate   // 今天还没签到
  }

  // 执行签到
  static sign(): SignReward | null {
    const today = this.getTodayStr()
    const yesterday = this.getDateStr(-1)      // '2026-01-14'

    // 判断是否连续签到
    if (this._data.lastSignDate === yesterday) {
      // 连续签到 → 计数 +1
      this._data.signCount = Math.min(this._data.signCount + 1, 7)
    } else if (this._data.lastSignDate !== today) {
      // 断签 → 重置为第 1 天
      this._data.signCount = 1
      this._data.cycleStartDate = today
    }

    this._data.lastSignDate = today
    this._data.totalSignDays++
    this._data.signHistory.push(this._data.signCount)

    // 持久化
    wx.setStorageSync('signData', JSON.stringify(this._data))

    // 返回对应天数的奖励
    return this.getReward(this._data.signCount)
  }

  // 奖励配置（对应上表）
  private static getReward(day: number): SignReward {
    const rewards: Record&lt;number, SignReward&gt; = {
      1: { gold: 50,  diamond: 0,  items: [] },
      2: { gold: 100, diamond: 0,  items: ['bomb'] },
      3: { gold: 150, diamond: 2,  items: [] },
      4: { gold: 200, diamond: 0,  items: [], buff: 'attack' },
      5: { gold: 300, diamond: 5,  items: [] },
      6: { gold: 400, diamond: 8,  items: ['shield'] },
      7: { gold: 1000, diamond: 20, items: ['skin_limited_01'] },
    }
    return rewards[day] ?? rewards[1]
  }

  private static getTodayStr(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  private static getDateStr(offset: number): string {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
}</code></pre>

      <h3>UI 设计要点</h3>
      <ul>
        <li><strong>日历式网格：</strong>7 个格子排成一行，已签到 = 打钩 + 绿色，今日可签 = 高亮闪烁，未来 = 灰色 + 奖励预览</li>
        <li><strong>进度条：</strong>显示"3/7 天"的进度——未完成感驱动继续签到</li>
        <li><strong>7 天后的处理：</strong>重置循环但保持总签到计数；或者改为"每签到 7 天给一次额外大奖"</li>
      </ul>

      <div class="tip-box">
        <strong>补签机制：</strong>允许玩家用<strong>钻石</strong>补签（消耗 5 钻 = 前进 1 天）。
        这是钻石的<strong>核心消耗出口</strong>之一——在收入设计中非常重要。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📋" title='每日任务系统——玩家的"今日待办"'>
      <p>
        签到只能让玩家"打开游戏"，但任务能让玩家<strong>"玩起来"</strong>。每日任务回答一个问题：
        "我今天进游戏应该做什么？"——这和前端应用中的<strong>新手任务清单</strong>完全一样。
      </p>

      <h3>任务类型设计</h3>
      <table>
        <thead>
          <tr>
            <th>任务类型</th>
            <th>示例</th>
            <th>难度</th>
            <th>奖励（金币）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>击杀计数</td>
            <td>击败 50 / 100 / 200 个敌人</td>
            <td>★☆☆</td>
            <td>50 / 100 / 200</td>
          </tr>
          <tr>
            <td>生存挑战</td>
            <td>单局存活 60 / 120 / 180 秒</td>
            <td>★★☆</td>
            <td>80 / 150 / 250</td>
          </tr>
          <tr>
            <td>收集任务</td>
            <td>收集 100 / 300 / 500 金币</td>
            <td>★☆☆</td>
            <td>40 / 80 / 120</td>
          </tr>
          <tr>
            <td>道具使用</td>
            <td>使用 1 / 3 / 5 次炸弹</td>
            <td>★★☆</td>
            <td>60 / 120 / 200</td>
          </tr>
          <tr>
            <td>波次推进</td>
            <td>通过第 3 / 5 / 10 波</td>
            <td>★★★</td>
            <td>100 / 200 / 400</td>
          </tr>
          <tr>
            <td>看广告</td>
            <td>观看 1 / 2 次激励视频</td>
            <td>★☆☆</td>
            <td>30 / 50</td>
          </tr>
        </tbody>
      </table>

      <h3>数据模型与刷新机制</h3>
      <pre><code>// DailyTaskManager.ts —— 每日任务系统
interface TaskData {
  id: string            // 任务唯一标识
  type: TaskType        // 任务类型枚举
  target: number        // 目标数量（如击败 100 个敌人）
  progress: number      // 当前进度
  claimed: boolean      // 是否已领取奖励
}

interface DailyTaskState {
  date: string          // 任务生成日期 'YYYY-MM-DD'
  tasks: TaskData[]     // 当天的任务列表
  allBonusClaimed: boolean  // 是否已领取"全部完成"额外奖励
}

// 每天凌晨 5:00 刷新（微信小游戏惯例：避开 0 点高峰期）
class DailyTaskManager {
  private static _state: DailyTaskState

  // 进入游戏时检查——是否需要刷新任务
  static checkAndRefresh() {
    const today = this.getTaskDate()  // 注意：凌晨 5 点为分界
    if (this._state.date !== today) {
      this.generateNewTasks(today)
    }
  }

  // 生成新任务——随机抽取 6 个，保证类型不重复
  private static generateNewTasks(date: string) {
    this._state = {
      date,
      tasks: this.pickRandomTasks(6),
      allBonusClaimed: false,
    }
    wx.setStorageSync('dailyTasks', JSON.stringify(this._state))
  }

  // 更新进度（由游戏事件驱动）
  static updateProgress(type: TaskType, amount: number = 1) {
    this._state.tasks.forEach(task => {
      if (task.type === type && !task.claimed) {
        task.progress = Math.min(task.progress + amount, task.target)
      }
    })
    wx.setStorageSync('dailyTasks', JSON.stringify(this._state))
  }

  // 检查"全部完成"
  static isAllComplete(): boolean {
    return this._state.tasks.every(t => t.progress >= t.target && t.claimed)
  }

  // 领取全部完成的额外奖励
  static claimAllBonus(): number {
    if (this.isAllComplete() && !this._state.allBonusClaimed) {
      this._state.allBonusClaimed = true
      return 500  // 额外奖励 500 金币
    }
    return 0
  }
}</code></pre>

      <h3>前端类比：EventBus + 任务监听</h3>
      <p>
        每日任务的进度更新和你写过的<strong>事件监听</strong>完全一样：
      </p>
      <pre><code>// EventBus 驱动任务进度（前端直觉：EventBus.emit → listener 更新状态）
// 在 GameManager 中，发生事件时同时更新任务进度
EventBus.on('enemy_killed', () => {
  DailyTaskManager.updateProgress('kill', 1)      // 击杀计数 +1
  AchievementManager.check('kill_enemies')         // 成就检测（见下一节）
})

EventBus.on('bomb_used', () => {
  DailyTaskManager.updateProgress('use_bomb', 1)
})

EventBus.on('wave_cleared', (wave: number) => {
  if (wave > DailyTaskManager.getMaxWaveTarget()) {
    DailyTaskManager.updateProgress('wave_clear', 1)
  }
})</code></pre>

      <div class="tip-box">
        <strong>奖励结构建议：</strong>6 个任务各自给少量金币，<strong>全部完成后额外给 500 金币 + 2 钻石</strong>。
        这个"全部完成"的额外奖励才是真正的驱动力——前端中叫 <strong>"Complete All Bonus"</strong>，几乎所有任务系统都用这个套路。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🏆" title="成就系统——Observer 模式的最佳实践">
      <p>
        成就系统的本质：<strong>游戏中的每一个事件都可能触发一次成就检测</strong>。这不是靠手动调用实现的——
        你需要用<strong>Observer 模式</strong>让成就管理器"监听"游戏事件，自动完成检测。
        前端类比：Vue 的 <code>watch</code> 或 React 的 <code>useEffect</code>——数据变了，自动执行副作用。
      </p>

      <h3>成就分类</h3>
      <table>
        <thead>
          <tr>
            <th>类别</th>
            <th>成就示例</th>
            <th>解锁条件</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>战斗成就</td>
            <td>百人斩、千人斩、Boss 首杀、Boss 十杀</td>
            <td>累计击杀 / Boss 击杀计数</td>
          </tr>
          <tr>
            <td>收集成就</td>
            <td>财主（1000 金币）、富翁（10000 金币）、道具全收集</td>
            <td>累计收集 / 道具解锁数量</td>
          </tr>
          <tr>
            <td>挑战成就</td>
            <td>无伤通关前 5 波、一命通 10 波、5 分钟内通关</td>
            <td>特定条件下的游戏行为</td>
          </tr>
          <tr>
            <td>进度成就</td>
            <td>通过第 10/20/30 波、总得分突破 10 万/50 万</td>
            <td>关卡进度 / 分数阈值</td>
          </tr>
          <tr>
            <td>社交成就</td>
            <td>首次分享、排行榜前 10、连续签到 30 天</td>
            <td>社交行为 / 连续登录</td>
          </tr>
        </tbody>
      </table>

      <h3>数据模型</h3>
      <pre><code>// AchievementManager.ts —— Observer 模式的成就系统
interface AchievementDef {
  id: string           // 唯一标识，如 'kill_100'
  name: string         // 显示名称，如 '百人斩'
  desc: string         // 描述，如 '累计击败 100 个敌人'
  icon: string         // 图标资源路径
  condition: {         // 检测条件
    event: string      // 监听的事件名
    count: number      // 需要的累计数量
  }
  reward: {
    gold: number
    diamond: number
  }
}

interface AchievementState {
  id: string
  progress: number     // 当前进度
  completed: boolean   // 是否达成
  claimed: boolean     // 是否已领取奖励
}

class AchievementManager {
  private static _defs: AchievementDef[] = []
  private static _states: Record&lt;string, AchievementState&gt; = {}

  // 注册成就监听——Observer 模式的核心
  static init() {
    // 定义所有成就
    this._defs = [
      {
        id: 'kill_100', name: '百人斩', desc: '累计击败 100 个敌人', icon: '',
        condition: { event: 'total_kills', count: 100 },
        reward: { gold: 200, diamond: 5 }
      },
      {
        id: 'kill_1000', name: '千人斩', desc: '累计击败 1000 个敌人', icon: '',
        condition: { event: 'total_kills', count: 1000 },
        reward: { gold: 1000, diamond: 20 }
      },
      {
        id: 'no_hit_5', name: '无伤专家', desc: '无伤通过前 5 波', icon: '',
        condition: { event: 'no_hit_waves', count: 5 },
        reward: { gold: 500, diamond: 10 }
      },
      // ... 更多成就定义
    ]

    // 加载状态
    this._states = JSON.parse(wx.getStorageSync('achievements') || '{}')

    // 注册 Observer：每个成就监听对应事件
    EventBus.on('total_kills', this.onTotalKills.bind(this))
    EventBus.on('no_hit_waves', this.onNoHitWaves.bind(this))
    EventBus.on('total_coins', this.onTotalCoins.bind(this))
    // ...
  }

  // 事件处理：遍历所有相关成就，更新进度
  private static onTotalKills(total: number) {
    this._defs
      .filter(d => d.condition.event === 'total_kills')
      .forEach(def => {
        const state = this.getOrCreate(def.id)
        state.progress = Math.min(total, def.condition.count)

        // 达成条件 → 弹出通知
        if (state.progress >= def.condition.count && !state.completed) {
          state.completed = true
          this.showUnlockToast(def.name)  // UI 弹出："恭喜！解锁成就：百人斩！"
        }

        this.save(def.id, state)
      })
  }

  private static showUnlockToast(name: string) {
    // 创建浮动通知节点（Toast 样式）
    console.log(`🏆 成就解锁: ${name}`)
  }
}</code></pre>

      <h3>成就 UI 入口与红点</h3>
      <p>
        成就有未领取奖励时，主界面"成就"按钮必须有<strong>红点</strong>——这和前端里面的
        <strong>消息未读 Badge</strong>完全一样。前端项目里你大概率用过 <code>uni.$badge</code> 或
        <code>el-badge</code> 组件，思路一致：
      </p>
      <pre><code>// 获取可领取的成就数量（用于红点显示）
static getClaimableCount(): number {
  return Object.values(this._states)
    .filter(s => s.completed && !s.claimed)
    .length
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🧭" title="新手引导流程——Step-by-Step 教程设计">
      <p>
        新手引导是<strong>留存漏斗最关键的环节</strong>。75% 的玩家在安装后的 3 分钟内决定是否留下——
        如果前 3 分钟他们不知道"玩什么、怎么玩、为什么好玩"，就会离开。
      </p>

      <h3>触发条件</h3>
      <pre><code>// TutorialManager.ts —— 新手引导状态机
// 触发条件：首次启动 OR 版本大更新后
const shouldShowTutorial = !wx.getStorageSync('tutorial_completed')
if (shouldShowTutorial) {
  TutorialManager.start()
}</code></pre>

      <h3>5 - 7 步引导标准流程</h3>
      <table>
        <thead>
          <tr>
            <th>步骤</th>
            <th>引导内容</th>
            <th>操作要求</th>
            <th>UI 表现</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Step 1</td>
            <td>拖动飞机移动</td>
            <td>手指滑动手势</td>
            <td>高亮飞机 + 手指标识动画</td>
          </tr>
          <tr>
            <td>Step 2</td>
            <td>自动射击——观察子弹</td>
            <td>移动到敌人方向</td>
            <td>高亮子弹轨迹 + "自动射击"文字提示</td>
          </tr>
          <tr>
            <td>Step 3</td>
            <td>击杀第一个敌人</td>
            <td>将飞机对准敌人</td>
            <td>1 个杂兵从正面慢慢飞过来</td>
          </tr>
          <tr>
            <td>Step 4</td>
            <td>拾取掉落道具</td>
            <td>移动到道具上方</td>
            <td>敌人死后掉落 1 个金币道具</td>
          </tr>
          <tr>
            <td>Step 5</td>
            <td>使用炸弹</td>
            <td>点击炸弹按钮</td>
            <td>高亮炸弹按钮 + 全屏清敌效果</td>
          </tr>
          <tr>
            <td>Step 6</td>
            <td>通过第 1 波</td>
            <td>消灭所有敌人</td>
            <td>简单的第 1 波——3 个杂兵</td>
          </tr>
          <tr>
            <td>Step 7</td>
            <td>查看结算</td>
            <td>观察分数和金币</td>
            <td>弹出结算面板，高亮分数数字</td>
          </tr>
        </tbody>
      </table>

      <h3>引导 UI 实现：遮罩 + 高亮 + 锁定</h3>
      <pre><code>// TutorialMask.ts —— 引导遮罩组件
// 原理：一个全屏半透明黑色遮罩，在目标区域"挖洞"
// 前端类比：CSS clip-path 或 mask-image 实现镂空效果

class TutorialMask {
  // 高亮某个区域，其余区域暗化
  static highlight(rect: { x: number, y: number, w: number, h: number }, text: string) {
    // 1. 绘制全屏半透明黑色遮罩
    // 2. 用 Graphics.clear() 在 rect 区域"挖洞"（透明）
    // 3. 在高亮区下方显示引导文字（如"拖动飞机移动"）
    // 4. 锁定当前步骤外的所有交互——
    //    event propagation stopped until current step completes
  }

  static hide() {
    // 移除遮罩
  }
}</code></pre>

      <h3>引导流程状态机</h3>
      <pre><code>// 引导流程：严格顺序执行，每一步完成后才能进入下一步
class TutorialFlow {
  private steps: TutorialStep[] = [
    { id: 'move',      desc: '拖动飞机',      check: () => this._hasMoved },
    { id: 'kill',      desc: '击败敌人',      check: () => this._kills >= 1 },
    { id: 'collect',   desc: '拾取道具',      check: () => this._collected >= 1 },
    { id: 'bomb',      desc: '使用炸弹',      check: () => this._bombUsed },
    { id: 'wave1',     desc: '通过第 1 波',   check: () => this._currentWave >= 2 },
    { id: 'result',    desc: '查看结算',      check: () => this._resultShown },
  ]
  private _currentIdx = 0
  private _hasMoved = false

  start() {
    this._currentIdx = 0
    this.showStep(this._currentIdx)
  }

  // 玩家完成当步条件后 → 进入下一步
  onStepComplete() {
    const step = this.steps[this._currentIdx]
    if (step.check()) {
      this._currentIdx++
      if (this._currentIdx < this.steps.length) {
        this.showStep(this._currentIdx)
      } else {
        this.complete()  // 全部完成
      }
    }
  }

  private showStep(idx: number) {
    // 播放引导动画 + 高亮区域 + 文字提示
    TutorialMask.highlight(this.getTargetRect(idx), this.steps[idx].desc)
  }

  private complete() {
    TutorialMask.hide()
    wx.setStorageSync('tutorial_completed', true)
    GameManager.instance.startGame()  // 正式进入游戏
  }
}</code></pre>

      <h3>跳过选项</h3>
      <p>
        右上角始终显示<strong>"跳过"按钮</strong>——老玩家或二次安装的用户不需要被强制看教程。
        点击跳过 → 直接标记 <code>tutorial_completed = true</code> → 进入游戏。
        这相当于前端 Onboarding 引导页的"Skip"按钮，标准做法，缺了这个会被玩家骂。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="🎁" title="七日留存活动——新玩家首周日历">
      <p>
        七日留存活动和签到不同——签到是<strong>所有人</strong>都能参与的无尽循环，
        而七日留存是<strong>仅限新玩家</strong>，从注册日起算 7 天的一次性活动。
        每天的奖励是固定的，第 7 天的大奖是整个活动的高潮。
      </p>

      <h3>7 日留存活动与每日签到的区别</h3>
      <table>
        <thead>
          <tr>
            <th>维度</th>
            <th>每日签到</th>
            <th>7 日留存活动</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>目标用户</td>
            <td>所有玩家</td>
            <td>仅新玩家（注册 ≤ 7 天）</td>
          </tr>
          <tr>
            <td>周期</td>
            <td>7 天一循环，无限重复</td>
            <td>一次性的 7 天</td>
          </tr>
          <tr>
            <td>奖励力度</td>
            <td>日常级别</td>
            <td><strong>更丰厚</strong>——首周留存决定长期数据</td>
          </tr>
          <tr>
            <td>第 7 天大奖</td>
            <td>金币 + 钻石 + 皮肤（会循环）</td>
            <td><strong>限定角色 / 限定皮肤 / 大量钻石</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>回归奖励——老玩家复活机制</h3>
      <p>
        如果一个玩家<strong>超过 7 天未登录</strong>，再回来时触发回归奖励：
      </p>
      <pre><code>// ComebackManager.ts —— 回归检测与奖励
class ComebackManager {
  static checkComeback(): ComebackReward | null {
    const lastLogin = wx.getStorageSync('lastLoginDate')
    if (!lastLogin) return null

    const daysAway = this.calcDaysAway(lastLogin)

    if (daysAway >= 7) {
      // 回归奖励——奖励力度与离开天数成正比
      const goldBonus = Math.min(daysAway * 200, 3000)   // 上限 3000
      const diamondBonus = Math.min(daysAway * 3, 50)     // 上限 50
      return { gold: goldBonus, diamond: diamondBonus, message: `欢迎回来！离开 ${daysAway} 天，这是给你的回归礼物` }
    }
    return null
  }

  private static calcDaysAway(lastDate: string): number {
    const last = new Date(lastDate).getTime()
    const now = Date.now()
    return Math.floor((now - last) / (1000 * 60 * 60 * 24))
  }
}</code></pre>

      <h3>推送通知提醒</h3>
      <p>
        微信小游戏支持<strong>订阅消息推送</strong>——在游戏内触发 <code>wx.requestSubscribeMessage</code>，
        用户授权后，你可以在服务器端发送每日提醒："你的七天大奖还没领，快回来！"
      </p>
      <pre><code>// 在签到界面的第 3-6 天，弹出订阅引导
wx.requestSubscribeMessage({
  tmplIds: ['模板ID——在微信后台申请'],
  success: (res) => {
    // 用户同意订阅 → 云函数可以发送每日签到提醒
  },
  fail: () => {
    // 用户拒绝 → 不强迫，通过游戏内图标红点提醒
  }
})</code></pre>

      <div class="warn-box">
        <strong>重要：</strong>微信对订阅消息的审核很严。模板必须符合"签到提醒"场景，
        每天最多推送 1 条。滥用推送 = 用户关闭授权 = 永久失去触达能力。善用红点 > 过度推送。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 签到断签了就真的重置为第 1 天吗？会不会太伤玩家心了？</h3>
      <p>
        这正是<strong>损失厌恶</strong>发挥作用的地方——如果随便断签都没惩罚，签到系统的驱动力就消失了。
        但可以优化：断签 1 天从第 3 天掉到第 2 天（而不是第 1 天）；断签 2 天以上才重置。
        另外，提供<strong>补签</strong>功能（消耗钻石），让有支付意愿的玩家"买回"连续天数。
        类比前端：网站连续签到 7 天送会员——你会因为怕断签而每天登录。
      </p>

      <h3>Q2: 每日任务做完了，剩下的时间玩家做什么？</h3>
      <p>
        每日任务的设计目标是<strong>15-20 分钟</strong>的游戏时长。任务不是"今天必须完成"，而是"今天可以完成"。
        做完任务后，玩家应该有事可做——刷高分冲击排行榜、挑战无伤通关、或者单纯享受弹幕乐趣。
        如果做完任务后无事可做，说明核心玩法深度不够，不是在任务设计上能解决的。
      </p>

      <h3>Q3: 新手引导太长了玩家会烦，太短了不会玩——怎么平衡？</h3>
      <p>
        <strong>5-7 步是甜点区</strong>。超过 7 步的教程应该在游戏流程中自然引入（Step 8+ 不用遮罩，改为首次触发时的浮动提示）。
        关键原则：<strong>教程里只教"活下来"，不教"变强"</strong>。移动 + 射击 = 生存基础（教程覆盖）；道具组合 + 战术走位 = 进阶技巧（让玩家自己探索）。
        类比前端 Onboarding：注册页面教填表单，不教怎么用高级搜索——那是 Help Center 的事。
      </p>

      <h3>Q4: 成就系统有 50 个成就，全部检测对性能有影响吗？</h3>
      <p>
        不用担心。Observer 模式中，每个事件触发时，<code>filter</code> 遍历的是成就 <strong>定义</strong>（50 个对象的数组），
        而不是每个成就都执行复杂逻辑。50 次 <code>filter</code> 的运算量微乎其微——在 60 FPS 的游戏中完全可以忽略。
        如果实在担心，可以把成就按事件类型建索引：<code>eventIndex['total_kills'] = [成就1, 成就2, ...]</code>，
        这样每个事件只遍历相关成就，而不是全部 50 个。但说实话——没必要过早优化。
      </p>

      <h3>Q5: 七日留存活动结束后，就什么都没有了吗？</h3>
      <p>
        不。七日留存活动的结束标志着一个新阶段的开始——此时签到系统、每日任务、成就系统已经全面接手。
        第七天结束时的弹出消息可以是："恭喜完成新手之旅！每天签到、完成每日任务，继续获取丰富奖励！"
        ——把玩家<strong>从一次性的七日活动，平稳过渡到日常留存系统</strong>，这个衔接很重要。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>签到系统的"连续"和"断签"逻辑分别怎么处理？断签后回到第几天？</li>
        <li>7 天签到的奖励递增设计原则是什么？第 7 天给什么类型的奖励最有吸引力？</li>
        <li>补签机制的消耗是什么？为什么补签是钻石的重要出口？</li>
        <li>每日任务推荐几种类型？每种类型举例 1 个具体任务。</li>
        <li>每日任务为什么在凌晨 5:00 刷新而不是 0:00？</li>
        <li>每日任务的"全部完成"额外奖励机制的目的是什么？</li>
        <li>成就系统为什么适合用 Observer 模式？如果用轮询（每帧检查）会有什么问题？</li>
        <li>成就分类有哪几种？每种举例 1 个成就。</li>
        <li>新手引导的目标步骤数是多少？第一步该教什么操作？</li>
        <li>引导遮罩的实现原理是什么？（全屏遮罩 + 镂空高亮区域）</li>
        <li>新手引导的"跳过"按钮放在哪里？为什么必须有跳过？</li>
        <li>七日留存活动和每日签到有何不同？（目标用户、周期、奖励力度三个维度）</li>
        <li>回归奖励的判定条件是什么？奖励力度和目标的关系是什么？</li>
        <li>wx.requestSubscribeMessage 的使用注意事项是什么？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
