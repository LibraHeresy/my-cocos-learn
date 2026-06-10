<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="10" title="变现设计" duration="1 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>免费游戏怎么赚钱？从"强制广告 + 付费下载"到"激励视频 + IAP 混合变现"。变现不是"怎么榨取玩家"——是<strong>怎么让玩家"愿意"付费</strong>。</p></ConceptBlock>

    <ConceptBlock icon="📖" title="15 秒 = 一次复活——这笔交易你接受吗？">
      <p>2013 年，芬兰公司 Supercell 年收入 8.92 亿美元——靠的是两款"免费"游戏：《部落冲突》和《卡通农场》。免费？是的。但他们的变现设计让<strong>玩家主动花钱</strong>，没有人觉得"被宰了"。</p>
      <p>在《部落冲突》里，升级一个建筑需要等 12 天。你可以等——也可以花 5 颗宝石（约相当于 0.5 美元）立刻完成。"等 12 天还是花 5 块钱？"这不是 Supercell 逼你选——是你自己做的决定。而且你把这个问题抛给朋友，他们会说"当然等啊，急什么"——但总有一部分人会"现在就想要"。</p>
      <p>这就是变现设计的第一性原理：<strong>不是剥夺玩家的东西，而是给玩家一个"更想要"的选择。</strong></p>
      <p>反过来，2010 年代的很多免费手游走的是另一条路——"能量满了，等 30 分钟或花 10 块钱"。这本质上是在惩罚免费玩家——"不付费就停下来"。这种粗暴变现的后果是：免费玩家流失（游戏没有社交热度），付费玩家也流失（没人可以炫耀）。<strong>好的变现应该是"锦上添花"，而不是"雪中送炭"。</strong> 玩家应该能免费获得完整的游戏体验，付费是为了"更好"而不是"能用"。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔍" title="IAA、IAP 与混合变现——三张桌子">
      <p>游戏变现只有三种模式——所有花里胡哨的名字都是这三种的变体：</p>

      <p><strong>1. IAA（In-App Advertising，广告变现）——你卖的是"玩家的注意力"。</strong></p>
      <table><thead><tr><th>广告形式</th><th>收益水平</th><th>体验影响</th><th>最适合的场景</th></tr></thead><tbody>
        <tr><td><strong>激励视频</strong></td><td>eCPM ¥5-15</td><td>低（玩家主动选择）</td><td>复活、双倍奖励、每日免费道具</td></tr>
        <tr><td><strong>插屏广告</strong></td><td>eCPM ¥2-5</td><td>中（被动弹出，打断体验）</td><td>关卡切换、结算页、返回主菜单</td></tr>
        <tr><td><strong>Banner 广告</strong></td><td>eCPM ¥0.5-2</td><td>低（底部常驻）</td><td>游戏过程中底部、主菜单</td></tr></tbody></table>
      <p>激励视频是黄金标准——因为它把"看广告"变成了"做交易"。玩家主动选择用 15-30 秒注意力换取游戏内价值。<strong>关键是：让玩家觉得这是"我赚了"，不是"你抢了我 30 秒"。</strong></p>
      <p>这里有一个你熟悉的前端类比：<strong>eCPM 竞价本质上和 Google AdSense 的程序化广告竞价是同一套逻辑</strong>——广告主在毫秒级实时竞价，你的"广告位"（玩家看视频的那 15 秒）被出价最高的广告主拿下。区别在于<strong>游戏广告位的注意力价值更高</strong>——用户在浏览网页时注意力是分散的，但玩到关键时刻被问"复活还是放弃"时是高度投入的，所以游戏 eCPM（¥5-15）通常比普通网页展示广告的 CPM 高出几倍。</p>
      <p>激励视频的"看广告 = 获得奖励"模式，在前端中有一个精确的对应物：<strong>内容门控（Content Gating）</strong>。媒体网站让你"免费读 3 篇，想看更多？注册或付费"——这和游戏里"免费复活 1 次，还想复活？看广告"是同一个转化漏斗。两者的共同设计原则：<strong>免费体验本身是完整的，付费 / 看广告是"加速"或"更多"——不是"否则不能用"。</strong></p>

      <p><strong>2. IAP（In-App Purchase，内购）——你卖的是"游戏内价值"。</strong>包括：消耗品（金币、钻石——用完还能再买）、非消耗品（皮肤、角色解锁——永久拥有）、订阅（月卡、战令——持续收益）。</p>
      <p>为什么玩家买"虚拟物品"？不是为了那个像素皮肤——是满足三种需求：<strong>功能性</strong>（更强）、<strong>加速性</strong>（更快）、<strong>炫耀性</strong>（更特别）。皮肤卖的不是像素——是"这是我的标志"的表达。</p>

      <p><strong>3. 混合变现 = IAA + IAP。</strong>现代最成功的免费游戏（《堡垒之夜》《原神》《PUBG Mobile》）都采用混合变现。免费玩家看广告、付费玩家买皮肤——两类玩家的体验都被尊重。这和 SaaS 产品的"免费 + 付费功能升级"的 Freemium 模式是完全同构的。</p>
    </ConceptBlock>

    <ConceptBlock icon="🚀" title="Battle Pass——一个改变了游戏行业的设计">
      <p>2018 年，Epic Games 在《堡垒之夜》Season 2 推出了 Battle Pass（战斗通行证）：付 950 V-Bucks（约 $9.50），解锁 100 级奖励列表——包括皮肤、舞蹈动作、游戏货币。如果你升满 100 级，拿到的总价值远超 $9.50。</p>
      <p>但在那之前，所有人都认为"大逃杀游戏怎么变现？卖武器？那就不公平了。"Epic 证明了——<strong>卖"成就感 + 时间压力"是最成功的变现设计。</strong></p>
      <p>Battle Pass 同时解决了四个问题：① 首次付费转化——$9.50 的门槛低到"试试也不亏"；② 长期留存——买了就得打满，不打满就亏了（损失厌恶）；③ 玩家分化——免费玩家也有奖励（免费线），付费玩家更多（付费线），两者都被尊重；④ 持续收入——每个赛季出新 Pass，付费玩家每赛季续费，像订阅一样稳定。</p>
      <p>直到今天，Battle Pass 是手游行业最广泛使用的变现框架——<strong>它不是"最赚钱的"，是"体验最好的"。</strong>你的飞机大战可能不需要完整的 Battle Pass，但"免费线 + 付费线"的双轨思路值得参考。</p>
      <p>这种分层付费模式有一个你每天都在用的前端对应物：<strong>SaaS 订阅分级（Free / Pro / Enterprise）</strong>。Notion、Figma、GitHub 都采用同样的结构——免费用户获得完整核心体验，付费用户获得更多存储/协作/高级功能。Battle Pass 无非是把"存储空间"换成了"皮肤和奖励"——<strong>底层都是"用免费体验建立用户基数，用付费层级满足深度需求"。</strong></p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：调研并写出你的变现策略">
      <ol>
        <li><strong>调研 3 款微信小游戏排行榜 Top 10：</strong>打开微信→发现→游戏→小游戏。选 3 款不同类型的（消除、跑酷、射击各一个）。各玩 10 分钟，带一个笔记本记录：
          <ul>
            <li>广告出现的位置、频率、形式（激励/插屏/Banner）</li>
            <li>内购项目有哪些——价格是多少——哪一个让你觉得"便宜"？哪一个"贵"？</li>
            <li>你"愿意"看广告的时刻是哪些？（比如"死了之后弹'看广告复活'"——你点了。——为什么？因为"差一点就能过了"的遗憾让你愿意付出 15 秒）</li>
            <li>你"烦躁"的时刻是哪些？（比如"正在打一个难 Boss，突然弹了个插屏广告"——你关了游戏）</li>
          </ul>
        </li>
        <li><strong>分析调研结果：</strong>三个游戏中，哪个变现让你体验最好？为什么？哪个最差？写出具体原因——不是"广告太多"这种模糊评价，而是"Boss 战中弹插屏=破坏沉浸感=反感"这种精准分析。</li>
        <li><strong>写一句话的变现策略：</strong>基于你的调研结果，为飞机大战写一句话："我的飞机大战主要靠 ___ 赚钱，通过 ___ 设计让玩家愿意 ___，同时永远不在 ___ 的时候弹广告。"这<strong>一句话就是你所有变现决策的指导原则</strong>——以后每次加广告都要回头对照这句话：我这样加，和我的变现策略一致吗？</li>
        <li><strong>实现一个激励视频复活流程（代码任务）：</strong>即使没有微信流量主权限，你也可以用 Mock 函数跑通整个逻辑流程。在你的 GameManager 中添加以下代码：
        <pre>// 模拟激励视频广告——返回 Promise，3 秒后自动"看完广告"
function showRewardedAd(): Promise&lt;boolean&gt; {
  return new Promise(resolve => {
    console.log('[广告] 激励视频开始播放...')
    setTimeout(() => {
      console.log('[广告] 玩家看完了广告，发放奖励')
      resolve(true) // true = 玩家完整看完
    }, 3000)
  })
}

// 玩家死亡时调用
async function onPlayerDeath() {
  const choice = confirm('你死了！看一段广告来复活吗？')
  if (!choice) return gameOver()

  const watched = await showRewardedAd()
  if (watched) {
    resumeGame() // 复活并继续游戏
    // 或者 addCoins(200)——取决于你的设计
  } else {
    gameOver()
  }
}</pre>
        这个 Mock 的价值在于：它让你在<strong>不需要真实广告 SDK</strong> 的情况下验证整个"死亡 → 选择看广告 → 等 3 秒 → 复活"的 UX 流程。当你接入真实微信激励视频 SDK 时，只需要替换 <code>showRewardedAd()</code> 的实现——<strong>所有调用方代码不用改一行</strong>。这正是依赖注入 / 接口隔离的核心思想：把"外部依赖"封装在函数签名后面，上游代码只依赖 Promise&lt;boolean&gt; 接口。</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>"心理账户"（Mental Accounting）——为什么激励视频是"划算交易"：</strong>2017 年诺贝尔经济学奖得主 Richard Thaler 提出的"心理账户"理论——人们会在心里把钱分到不同"账户"里。玩家在游戏中有两个账户："现实钱包"（人民币）和"游戏钱包"（金币/钻石）。激励视频的美妙之处在于——玩家<strong>不需要动用"现实钱包"</strong>，只需要用"时间钱包"（15 秒注意力）换取"游戏钱包"的收益。跨账户交易让人感觉"我赚了"——即使理性上 15 秒的时间价值大于游戏里的 200 金币。同样的，花 68 元买皮肤（现实→游戏）的痛苦感远小于花 68 元买日用品——因为"游戏钱包"是平行世界，心理上不受现实预算约束。</li>
        <li><strong>Fortnite 的变现突破可能永远不会再现——但它的设计原则可以：</strong>《堡垒之夜》在 2018-2019 两年的收入超过 90 亿美元——靠的竟然只是皮肤和 Battle Pass。它证明了最高明的变现是"让玩家心甘情愿"。游戏史上很多失败的反面教材——EA 的《星战前线 2》因为"开箱 = 内购 = 能变强"被玩家骂到改系统（花了 2100 小时或 $2100 才能解锁所有内容）；这让整个行业意识到 <strong>P2W（Pay to Win）</strong> 是变现的死路。 玩家的底线很清楚：<strong>你可以卖好看的，但不能卖"更强"。</strong></li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>IAA（广告变现）和 IAP（内购）的核心区别是什么？为什么现代游戏大多采用混合变现？</li>
        <li>激励视频广告为什么比插屏广告体验好？用"心理账户"或"主动选择"的概念解释。</li>
        <li>你的飞机大战应该主要靠广告还是内购盈利？为什么？调研的三款微信小游戏中，哪个最像你的变现模型？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
