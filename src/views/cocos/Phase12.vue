<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="12" title="游戏数值设计" duration="2-3 天" :total="17">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解射击游戏<strong>四种经典难度曲线</strong>，能根据游戏类型选择合适的曲线</li>
        <li>设计<strong>经济系统</strong>的产出与消耗平衡，避免玩家金币溢出或饥饿</li>
        <li>计算<strong>DPS 与敌人 EHP</strong>，精准控制 TTK（击杀时间）</li>
        <li>编排<strong>关卡节奏</strong>——紧张期与休息区的交替，让玩家始终处于"心流"状态</li>
        <li>建立<strong>数值调优流水线</strong>：Playtest → 表格调整 → 重测 → 迭代</li>
        <li>用好 Excel / Google Sheets 作为数值策划工具</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="前端视角：数值策划 = 配置管理 + 函数设计">
      <p>
        如果你写过 Vue 应用的<strong>配置化表单</strong>或<strong>权限矩阵</strong>，数值策划的思路完全一致：
        把游戏中所有可变参数抽离成数据，用"表格"驱动游戏行为，而不是写死在代码里。
      </p>

      <table>
        <thead>
          <tr>
            <th>前端概念</th>
            <th>游戏数值对应</th>
            <th>类比说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>环境变量 / Config 文件</td>
            <td>数值表（Excel / JSON Config）</td>
            <td>所有参数集中管理，改值不改代码</td>
          </tr>
          <tr>
            <td>Props / 组件参数</td>
            <td>怪物属性（HP、速度、伤害）</td>
            <td>每种敌人是一组预设参数</td>
          </tr>
          <tr>
            <td>computed / 派生状态</td>
            <td>DPS、EHP、TTK</td>
            <td>由基础数值公式推导，不手动填</td>
          </tr>
          <tr>
            <td>CSS Easing Function</td>
            <td>难度曲线函数</td>
            <td>控制"值随时间/关卡如何变化"</td>
          </tr>
          <tr>
            <td>A/B Test 配置开关</td>
            <td>多套数值方案并行测试</td>
            <td>同一关卡加载不同 config，快速对比体验</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>核心原则：</strong>游戏代码中，永远不要出现 <code>if (wave === 5) enemyHP = 500</code> 这种硬编码。
        真正的数值设计是：<code>enemyHP = config.wave[wave].hpMultiplier * baseHP</code>。配置和逻辑分离，和前端"数据驱动视图"完全是一个道理。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📈" title="难度曲线设计——四种经典曲线">
      <p>
        难度曲线的本质是一个<strong>函数</strong>：输入 = 游戏进度（时间/关卡/波次），输出 = 综合难度。
        以下是射击游戏中最常用的四种曲线：
      </p>

      <h3>① 线性曲线（Flat Slope）</h3>
      <p>
        难度匀速增长，每波难度 = 上一波 × 固定系数（如 1.1）。适合<strong>无尽模式</strong>——玩家随时知道自己"差一点"就能破纪录，
        类似前端中的 <code>linear</code> 缓动函数。
      </p>
      <pre><code>// 线性难度——最简单也最可控
function linearDifficulty(wave: number, baseDifficulty: number = 1, slope: number = 0.15) {
  return baseDifficulty * (1 + slope * wave)
}

// 第 1 波 = 1.15，第 50 波 = 8.5 —— 平滑增长</code></pre>

      <h3>② S 型曲线（Sigmoid）——最常用</h3>
      <p>
        前几波平缓（新手保护期）→ 中期难度快速拉升（进入心流挑战）→ 后期增速放缓（防止指数爆炸）。
        这是<strong>关卡制游戏</strong>的标准选择，对应前端缓动函数中的 <code>ease-in-out</code>。
      </p>
      <pre><code>// S 型曲线——平滑的"容易→难→稳定"过渡
function sigmoidDifficulty(progress: number, steepness: number = 5, midpoint: number = 0.5) {
  // progress: 0~1 表示游戏进度百分比
  return 1 / (1 + Math.exp(-steepness * (progress - midpoint)))
}

// progress=0.0 → 难度 ≈ 0.08 （非常低，新手保护）
// progress=0.5 → 难度 = 0.5  （中期匀速变难）
// progress=1.0 → 难度 ≈ 0.92 （接近最大值但不爆炸）</code></pre>

      <h3>③ 阶梯式曲线（Stepwise）</h3>
      <p>
        每 N 波/每关关卡难度突然跃升，跃升后给 2-3 波适应期。适合<strong>有明确"世界/大关"划分</strong>的游戏。
        类似于 React 中切换页面的<strong>路由守卫</strong>——到达某个里程碑后，一切都变了。
      </p>
      <pre><code>// 阶梯式——每 5 波来一次"质变"
function stepDifficulty(wave: number) {
  const tier = Math.floor(wave / 5)  // 每 5 波一个阶梯
  return 1 + tier * 1.5 + (wave % 5) * 0.15  // 阶梯 + 阶梯内微涨
}
// Wave 1-4: 1~1.6 → Wave 5: 2.5 → Wave 6-9: 2.65~3.1 → Wave 10: 4.0</code></pre>

      <h3>④ 指数型曲线（Exponential）——弹幕地狱</h3>
      <p>
        难度以指数级飙升，适合<strong>硬核弹幕游戏</strong>的后期内容。但需要严格设上限，否则 10 波后根本没法玩。
        类比：如果不设置 <code>Math.max()</code> 上限，CSS <code>scale(10)</code> 会让元素飞出屏幕。
      </p>

      <h3>射击游戏专属：波次 + 休息周期的难度编排</h3>
      <p>
        射击游戏的难度不是平滑连续的——它在<strong>波次内</strong>紧张，在<strong>波次间</strong>放松。
        每波结束后的 10-15 秒休息时间，玩家的心率从高回落到正常，这是"再玩一波"的动力来源。
      </p>

      <h3>难度参数旋钮——改哪个最有效？</h3>
      <table>
        <thead>
          <tr>
            <th>参数旋钮</th>
            <th>对难度的冲击力</th>
            <th>调参建议</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>敌人生成速率</td>
            <td>★★★ 最高</td>
            <td>每次调 ±10%，大调有风险</td>
          </tr>
          <tr>
            <td>敌人子弹数量</td>
            <td>★★★ 最高</td>
            <td>弹幕游戏的核心参数，小心指数爆炸</td>
          </tr>
          <tr>
            <td>敌人 HP</td>
            <td>★★☆ 中等</td>
            <td>影响 TTK，直接关联"手感硬不硬"</td>
          </tr>
          <tr>
            <td>敌人移动速度</td>
            <td>★★☆ 中等</td>
            <td>太快 = 反应不及；太慢 = 无聊</td>
          </tr>
          <tr>
            <td>波次敌人组合</td>
            <td>★☆☆ 精细</td>
            <td>混合兵种比单一种类难得多</td>
          </tr>
          <tr>
            <td>道具掉落率</td>
            <td>★☆☆ 精细</td>
            <td>隐式调节——玩家感觉不到但影响大</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="💰" title="经济系统平衡——金币的产出与消耗">
      <p>
        游戏经济系统和前端应用的<strong>状态管理</strong>（Vuex/Pinia）有相似之处：你要时刻清楚"钱从哪来"（actions/mutations 的来源）
        和"钱去哪了"（状态如何被消费）。一旦某个环节失衡，整个系统就会崩。
      </p>

      <h3>货币类型设计</h3>
      <p>射击游戏的经济系统不宜复杂。推荐 <strong>2 种货币</strong>子：</p>
      <table>
        <thead>
          <tr>
            <th>货币</th>
            <th>用途</th>
            <th>获取方式</th>
            <th>类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>金币</td>
            <td>局内临时升级（攻/速/血）</td>
            <td>击杀敌人、波次奖励</td>
            <td>sessionStorage——单局有效</td>
          </tr>
          <tr>
            <td>钻石 / 道具币</td>
            <td>永久升级、购买皮肤、复活</td>
            <td>看广告、每日签到、成就奖励</td>
            <td>localStorage——持久化存储</td>
          </tr>
        </tbody>
      </table>

      <h3>金币产出 vs 消耗平衡表</h3>
      <p>每一局游戏的"总产出"和"总消耗"必须是<strong>约等于</strong>的关系——玩家不能无限囤积（通胀），也不能永远不够花（饥饿感）。</p>

      <table>
        <thead>
          <tr>
            <th>来源 / 去向</th>
            <th>单局金币量（约）</th>
            <th>占比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>击杀小敌人</td>
            <td>200 - 400</td>
            <td>25%</td>
          </tr>
          <tr>
            <td>击杀精英 / Boss</td>
            <td>300 - 600</td>
            <td>30%</td>
          </tr>
          <tr>
            <td>波次完成奖励</td>
            <td>200 - 500</td>
            <td>25%</td>
          </tr>
          <tr>
            <td>拾取金币道具</td>
            <td>100 - 300</td>
            <td>20%</td>
          </tr>
          <tr>
            <td><strong>总产出</strong></td>
            <td><strong>800 - 1800</strong></td>
            <td><strong>100%</strong></td>
          </tr>
          <tr style="background: var(--color-primary-soft);">
            <td><strong>升级消耗（攻/速/血）</strong></td>
            <td><strong>600 - 1500</strong></td>
            <td><strong>≈ 80% 产出</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>道具定价公式</h3>
      <p>不要拍脑袋定价。用公式：</p>
      <pre><code>// 道具价格 = 期望收益 × 稀有度系数 × 单局经验系数
function calculatePrice(
  expectedBenefit: number,   // 该道具带来的"战力提升百分比"（0~1）
  rarity: number,             // 稀有度：普通=1, 稀有=2, 史诗=3, 传说=5
  sessionMultiplier: number,  // 单局经济量级系数（临时道具=0.3，永久道具=3）
): number {
  return Math.round(expectedBenefit * rarity * sessionMultiplier * 100)
}

// 示例：一个"攻击力+50%持续10秒"的临时道具
// price = 0.5 * 2 * 0.3 * 100 = 30 金币
// 示例：永久解锁一个"开局+1条命"的被动
// price = 0.3 * 3 * 3 * 100 = 270 钻石</code></pre>

      <div class="warn-box">
        <strong>避免无限累积：</strong>如果玩家打了 50 局，钻石已经 10000 个但商店只有 3 样东西可买，
        经济系统就失效了。解决方案：(1) 设计足够多的"钻石回收点"——皮肤、升级、限时商品；(2) 允许钻石兑换金币（但要设置每日上限）；
        (3) 策划高价值的长期消耗目标（如"9999 钻石解锁隐藏角色"）。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚔️" title="DPS 与敌人血量——TTK 是手感的核心">
      <p>
        TTK（Time To Kill，击杀时间）决定了游戏的<strong>"手感硬度"</strong>。TTK 太长 = 刮痧，TTK 太短 = 割草。
        好的射击游戏通过精确的 DPS 和 HP 数值来控制这个体验。
      </p>

      <h3>玩家 DPS 计算</h3>
      <pre><code>// 玩家 DPS（每秒伤害输出）
// DPS = 子弹伤害 × 射速(发/秒) × 命中率
function calculatePlayerDPS(
  bulletDamage: number,   // 单发子弹伤害，如 10
  fireRate: number,       // 射速，如 5 发/秒（= 每 0.2s 一发）
  accuracy: number,       // 命中率：新手 0.3，熟手 0.7，大佬 0.95
): number {
  return bulletDamage * fireRate * accuracy
}

// 初期：10 × 5 × 0.4 = 20 DPS
// 中期：25 × 8 × 0.7 = 140 DPS（有了散射和攻速道具）
// 后期：80 × 12 × 0.9 = 864 DPS（满改+暴击）</code></pre>

      <h3>敌人 EHP（有效血量）</h3>
      <p>
        EHP 不是简单的 HP 数值。它需要考虑护甲减伤、闪避率等。简化方案：直接用 HP 代表 EHP，
        护甲效果通过乘法系数体现：
      </p>
      <pre><code>// EHP = 基础HP × (1 + 护甲减伤率)
// 示例：HP=100, 护甲减伤30% → EHP = 100 / (1 - 0.3) = 143
// 这意味着 100 HP 的敌人需要实际打出 143 点伤害才能击杀
function calculateEHP(baseHP: number, armorPercent: number): number {
  return baseHP / (1 - armorPercent)
}</code></pre>

      <h3>TTK 设计标准</h3>
      <p>不同类型的敌人应该有明确的 TTK 区间：</p>

      <table>
        <thead>
          <tr>
            <th>敌人类型</th>
            <th>目标 TTK</th>
            <th>设计意图</th>
            <th>HP = DPS × TTK</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>杂兵（Popcorn）</td>
            <td>1 - 2 秒</td>
            <td>一碰就碎，提供爽感</td>
            <td>20 × 1.5 = 30 HP</td>
          </tr>
          <tr>
            <td>中型敌人</td>
            <td>3 - 5 秒</td>
            <td>需要集中火力，制造威胁</td>
            <td>20 × 4 = 80 HP</td>
          </tr>
          <tr>
            <td>精英敌人</td>
            <td>8 - 15 秒</td>
            <td>小型挑战，考验走位</td>
            <td>140 × 12 = 1680 HP</td>
          </tr>
          <tr>
            <td>Boss</td>
            <td>30 - 60 秒</td>
            <td>阶段演出 + 大考</td>
            <td>累计 DPS × 45 = 数千 HP（分阶段）</td>
          </tr>
        </tbody>
      </table>

      <h3>TTK 随游戏进度的变化</h3>
      <p>
        杂兵的 TTK 应该<strong>始终保持在 1-3 秒</strong>——即使到了后期，杂兵也不该变"硬"，而应该变"多"。
        如果把杂兵的血量也翻了 10 倍，玩家会觉得武器越升级越弱——这是数值设计的经典错误。
      </p>
      <pre><code>// TTK 曲线表（简化为 JSON 配置）
const ttkConfig = {
  waves: {
    "1-5":   { gruntTTK: 1.0, eliteTTK: 0,   bossTTK: 0 },      // 只有杂兵
    "6-10":  { gruntTTK: 1.5, eliteTTK: 8,   bossTTK: 0 },      // 引入精英
    "11-15": { gruntTTK: 1.8, eliteTTK: 10,  bossTTK: 40 },     // Boss 登场
    "16-20": { gruntTTK: 2.0, eliteTTK: 12,  bossTTK: 50 },     // 全面升级
    "21+":   { gruntTTK: 2.2, eliteTTK: 15,  bossTTK: 60 },     // 弹幕地狱
  }
}</code></pre>

      <h3>道具的 DPS 倍率影响</h3>
      <p>设计道具时，要清楚它对 DPS 的数学影响，而不是凭感觉：</p>
      <table>
        <thead>
          <tr>
            <th>道具效果</th>
            <th>DPS 倍率</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>攻击力 × 2</td>
            <td>× 2.0</td>
            <td>最直观</td>
          </tr>
          <tr>
            <td>射速翻倍</td>
            <td>× 2.0</td>
            <td>但子弹消耗也翻倍（如果有弹药限制）</td>
          </tr>
          <tr>
            <td>双发（+1 弹道）</td>
            <td>× 2.0</td>
            <td>覆盖面积增大，命中率提升</td>
          </tr>
          <tr>
            <td>暴击 30% 概率 ×3 伤害</td>
            <td>× 1.6</td>
            <td>0.7 × 1 + 0.3 × 3 = 1.6</td>
          </tr>
          <tr>
            <td>攻击 × 1.5 + 射速 × 1.3</td>
            <td>× 1.95</td>
            <td>乘法叠加——比单个大，但不是简单加法</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🎼" title="关卡节奏编排——紧张与放松的呼吸">
      <p>
        优秀的关卡节奏就像一首好听的音乐——有<strong>主歌（Verse）</strong>、<strong>副歌（Chorus）</strong>和<strong>间奏（Bridge）</strong>。
        玩家在"紧张 → 放松 → 紧张"的循环中始终处于<strong>心流通道</strong>（Flow Channel）之内。
      </p>

      <h3>波次张力曲线</h3>
      <pre><code>// 理想的关卡张力曲线：山峰 + 山谷交替
const tensionCurve = `
  难度
  |          /\      /\        /\  ← 每 3-5 波一个峰值
  |    /\   /  \    /  \  /\  /
  |   /  \_/    \  /    \/  \/
  |  /           \/
  | /
  +--------------------------------→ 时间
     波1  波2  波3  波4  波5  波6
      ↑    ↑    ↑    ↑    ↑    ↑
    引入  升温 峰值  休息  升温 峰值</code></pre>

      <h3>四种波次类型及其混排</h3>
      <table>
        <thead>
          <tr>
            <th>波次类型</th>
            <th>敌人特点</th>
            <th>持续时间</th>
            <th>在节奏中的位置</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>爆米花波（Popcorn Wave）</td>
            <td>大量弱杂兵，一碰就碎</td>
            <td>15 - 20s</td>
            <td>热身 / 节奏低谷后的"爽"</td>
          </tr>
          <tr>
            <td>坦克波（Tank Wave）</td>
            <td>少量高血量敌人，弹幕密集</td>
            <td>25 - 40s</td>
            <td>节奏峰值——核心挑战</td>
          </tr>
          <tr>
            <td>解密波（Puzzle Wave）</td>
            <td>特定走位模式才能通过的弹幕阵</td>
            <td>20 - 30s</td>
            <td>变化节奏，防止单调</td>
          </tr>
          <tr>
            <td>Boss 波</td>
            <td>单一 Boss + 小兵助阵</td>
            <td>45 - 90s</td>
            <td>阶段高潮——关卡终极大考</td>
          </tr>
        </tbody>
      </table>

      <h3>波次间距设计</h3>
      <p>波次之间的<strong>休息时间</strong>不是"空白"——它是玩家状态管理的关键窗口：</p>
      <pre><code>// 波次间隔配置
const wavePacing = {
  breakDuration: 12,        // 休息时间（秒）
  breakContent: {
    showWaveResult: true,   // 显示"第 X 波 通过！"→ 正向反馈
    showShop: true,         // 休息时弹出商店——鼓励消费
    dropItems: true,        // 休息时散落道具——给玩家"期待下一波"的理由
    showNextPreview: false, // 初期不预告（惊喜），后期才预告（策略）
  },
  peakSpacing: 3,           // 每 3 波一个难度峰值
}</code></pre>

      <h3>前期 vs 后期的波次时长变化</h3>
      <table>
        <thead>
          <tr>
            <th>阶段</th>
            <th>每波时长</th>
            <th>休息时长</th>
            <th>节奏感受</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>前期（1-5 波）</td>
            <td>15 - 20s</td>
            <td>15s</td>
            <td>快节奏 → 引导入门</td>
          </tr>
          <tr>
            <td>中期（6-15 波）</td>
            <td>25 - 35s</td>
            <td>12s</td>
            <td>中速 → 心流状态</td>
          </tr>
          <tr>
            <td>后期（16+ 波）</td>
            <td>30 - 45s</td>
            <td>10s</td>
            <td>持久战 → 硬核挑战</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>前端类比：</strong>关卡节奏编排就像设计 SPA 应用的<strong>页面过渡动画</strong>——太快用户晕，太慢用户急。
        好的过渡（easing + duration）让用户感知不到"等待"，关卡节奏同理——好的休息期让玩家感觉"刚刚好"而不是"怎么还没开始"。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="数值调优流程——从拍脑袋到数据驱动">
      <p>
        数值设计的核心秘密：<strong>不要觉得一次就能填对</strong>。即使是资深数值策划，也是在 Playtest → 调参 → 再测的循环中找到正确区间的。
        这和前端写 CSS 调布局是完全一样的——不是一个像素一个像素手写，而是边看 DevTools 边改。
      </p>

      <h3>标准调优流水线</h3>
      <pre><code>1. 第一版数值（拍脑袋）
   ↓ 填入 Excel 表格，检查公式是否有溢出/NaN
2. Playtest（自己玩 3-5 遍）
   ↓ 记录感受："第 7 波太硬""憋屈，金币不够花"
3. 调整表格参数（只改数据，不改代码）
   ↓ 重新导出 config.json
4. 重新 Playtest
   ↓ 对比感受是否改善
5. 团队交叉测试（让别人玩，观察表情）
   ↓ 记录哪里皱眉、哪里"啊！"
6. 迭代直到手感达标 → 冻结版本</code></pre>

      <h3>Excel / Google Sheets 作为数值策划工具</h3>
      <p>
        不管是 3A 还是独立游戏，数值策划都用 Excel。你不需要学 Python 或专门的数值工具——一张表足够了：
      </p>
      <pre><code>// 数值表格结构示例（导出为 config.json）
// Sheet "EnemyHP"
// | 波次 | 杂兵HP | 精英HP | BossHP | DPS参考 |
// |------|--------|--------|--------|-----------|
// | 1    | =B1*1  | 0      | 0      | 20        |
// | 2    | =B2*1.1| 0      | 0      | 22        |
// | 3    | =B3*1.1| =C3*5  | 0      | 25        |
// | ...  |        |        |        |           |
// 第 N 行的 HP = 公式，不是手填的——改一个系数，全部联动</code></pre>

      <h3>参数提取——让一切可配置</h3>
      <p>游戏中所有"硬编码的数字"都是数值调优的障碍。以下是必须抽离的参数清单：</p>
      <table>
        <thead>
          <tr>
            <th>类别</th>
            <th>必须配置化的参数</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>玩家</td>
            <td>移速、初始 HP、碰撞体积半径、无敌帧时长、子弹伤害、射速、子弹速度</td>
          </tr>
          <tr>
            <td>敌人</td>
            <td>HP、移速、伤害、子弹伤害、子弹速度、射击间隔、分数价值、掉落率</td>
          </tr>
          <tr>
            <td>道具</td>
            <td>效果倍率、持续时间、稀有度、价格、冷却时间</td>
          </tr>
          <tr>
            <td>关卡</td>
            <td>波次时长、休息时长、敌人生成间隔、每种敌人的生成权重</td>
          </tr>
        </tbody>
      </table>

      <pre><code>// ConfigManager.ts —— 数值配置加载器（前端思路：类似读取 .env）
import { resources, JsonAsset } from 'cc'

class ConfigManager {
  private static _config: any = null

  static load() {
    return new Promise&lt;void&gt;((resolve, reject) => {
      resources.load('config/balance', JsonAsset, (err, asset) => {
        if (err) { reject(err); return }
        this._config = asset.json
        resolve()
      })
    })
  }

  // 获取某波次杂兵的 HP（前端熟悉的"配置读值"模式）
  static getGruntHP(wave: number): number {
    const row = this._config.enemyHP.find((r: any) => r.wave === wave)
    return row?.gruntHP ?? 30  // fallback 默认值——防御性编程
  }
}</code></pre>

      <h3>A/B 配置切换——快速对比两种数值方案</h3>
      <p>
        想在两种数值方案间快速切换感受？准备两套配置文件，通过一个开关切换。这在前端就是
        <strong>Feature Flag / A/B Test</strong> 的经典模式：
      </p>
      <pre><code>// 开发期快速切换数值方案
const USE_BALANCE_V2 = true  // 开关

if (USE_BALANCE_V2) {
  resources.load('config/balance_v2', JsonAsset, ...)  // 激进方案
} else {
  resources.load('config/balance_v1', JsonAsset, ...)  // 保守方案
}</code></pre>

      <div class="tip-box">
        <strong>调参经验：</strong>每次只改<strong>一个</strong>参数。如果同时调了"敌人生成速率 +20%"和"玩家伤害 +15%"，
        你永远不知道哪个改动导致了手感变化。这和前端 debug 一样——一次只动一个变量，才能定位问题根源。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 我是个前端，没做过数值策划，怎么下手？</h3>
      <p>
        换个角度：你每天都在做"数值平衡"。Vue 组件里的 Props 默认值、CSS 的 padding/margin、动画的 duration——这些都是"调参"。
        游戏数值只是参数更多、公式更复杂，但<strong>调优流程完全一样</strong>：先填个初始值 → 跑起来看效果 → 微调 → 重复。从"杂兵 HP = 30"开始，玩一遍觉得太脆就改 40，太硬就改 25。
      </p>

      <h3>Q2: 杂兵的血量到底要不要随波次增长？</h3>
      <p>
        少量增长（每波 +5%~8%）是可以的，但<strong>永远不要</strong>让杂兵 TTK 超过 3 秒。后期难度应该通过"更多杂兵 + 更密集弹幕 + 精英混合"来体现，而不是把杂兵变成"小坦克"。参考前端："卡片多了可以翻页"，而不是把每个卡片放大到占满屏幕。
      </p>

      <h3>Q3: 玩家金币太多怎么办？</h3>
      <p>
        设计金币的<strong>精确消耗点</strong>：在波次休息商店中，确保玩家每次都能花掉约 80% 的当波收入。
        如果商店里最好的东西只花 50 金币，而玩家手里有 500——降价不是办法，要<strong>增加消耗深度</strong>（高价的强力道具、限时 buff、商品轮换）。
        前端类比：如果 Pinia Store 里的数据越积越多却没有消费出口——内存泄漏；游戏金币同理——通胀。
      </p>

      <h3>Q4: Excel 公式写错了，导出到游戏才发现，怎么避免？</h3>
      <p>
        建立<strong>数值校验脚本</strong>：在导出 config.json 后，用一个简单的校验函数检查关键约束：
      </p>
      <pre><code>// balanceValidator.ts —— 数值合理性校验（类比前端的 prop validator）
function validateBalance(config: any): string[] {
  const errors: string[] = []

  // 检查：每 5 波必须有难度提升（不能后一波比前一波弱）
  for (let i = 1; i < config.enemyHP.length; i++) {
    if (i % 5 === 0 && config.enemyHP[i].gruntHP <= config.enemyHP[i-5].gruntHP) {
      errors.push(`第 ${i} 波杂兵 HP 未增长`)
    }
  }

  // 检查：TTK 不超过上限
  const maxTTK = config.enemyHP[i].bossHP / (config.playerDPS || 20)
  if (maxTTK > 90) errors.push(`Boss TTK 超过 90 秒`)

  return errors
}</code></pre>

      <h3>Q5: 做数值表需要什么工具？</h3>
      <p>
        Google Sheets（免费）或 Excel 就足够了。不需要任何"数值策划专业软件"。
        关键操作：公式联动（改了 A1，B1:C10 全部自动更新）→ 导出 CSV → 用一个小脚本转成 JSON。
        如果你会写 Node.js 脚本，甚至可以写一个 <code>csv-to-config.js</code>，每次改完 Sheet 一键导出。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>四种难度曲线（线性、S 型、阶梯式、指数型）各适合什么类型的游戏？</li>
        <li>射击游戏的"波次 + 休息"节奏中，波次间隔一般设置多少秒？</li>
        <li>难度参数旋钮中，哪一个调参对难度冲击最大？</li>
        <li>游戏中金币系统的"产出 vs 消耗"比例应该控制在什么范围？</li>
        <li>道具定价公式的三个变量分别是什么？</li>
        <li>TTK 是什么？杂兵、精英、Boss 的目标 TTK 分别是多少？</li>
        <li>玩家 DPS 的计算公式包含哪三个变量？</li>
        <li>EHP（有效血量）和普通 HP 的区别是什么？护甲减伤 30% 意味着 EHP 是多少？</li>
        <li>四种波次类型（爆米花/坦克/解密/Boss）如何交替编排？</li>
        <li>数值调优的标准流程是什么？为什么每次只能改一个参数？</li>
        <li>哪些游戏参数必须配置化、不能硬编码？至少说出 5 个类别。</li>
        <li>Excel 做数值表的核心优势是什么？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
