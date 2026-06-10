<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="9" title="数据驱动运营" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>不知道玩家怎么玩你的游戏 = 闭着眼睛开车。埋点让你"看见"玩家行为——他们在哪死了、在哪走了、在哪付了钱。数据不是冰冷的数字，是<strong>玩家的集体行为投票</strong>。</p></ConceptBlock>

    <ConceptBlock icon="📖" title="5000 个玩家在第 3 波消失了——你怎么知道的？">
      <p>2012 年，独立游戏《FTL: Faster Than Light》发布。开发团队 Subset Games 只有两个人——Justin Ma 和 Matthew Davis。他们没有数据系统，只能靠论坛帖子和 Steam 评价来判断游戏表现。</p>
      <p>有一天 Justin 在 Steam Forum 看到一个帖子："游戏太难了，第三关就被 AI 无人机灭了 20 次。"他数了数——146 个玩家回帖说"我也是"。但 Justin 不知道的是：这 146 个人只占总玩家的 0.5%。<strong>论坛抱怨者不等于主流玩家——他们只是嗓门最大的那一小撮。</strong></p>
      <p>如果 Justin 有埋点系统，他会看到：</p>
      <ul>
        <li>60% 的玩家第一次死亡在第 3 关——说明前两关难度合适，第 3 关有跳跃</li>
        <li>但从第 3 关活下来的玩家中，80% 能打到第 6 关——说明只要"跨过第 3 关的坎"，后续就顺了</li>
        <li>第 3 关死亡玩家中，70% 死于"无人机"这个敌人——精准定位了问题</li>
      </ul>
      <p>有了数据，Justin 不用猜——他知道<strong>只需要调一下第 3 关无人机的伤害值</strong>，就能大幅提升全链路留存。</p>
      <p>这和前端开发中"不知道用户为什么在 checkout 页面流失"的困境一模一样——你加了 Google Analytics 才看到真相。游戏数据分析和 Web 分析的底层逻辑完全一致：<strong>建立漏斗 → 找到最大泄漏点 → 修复它。</strong></p>
    </ConceptBlock>

    <ConceptBlock icon="🔍" title="五个核心指标——你的游戏健康仪表盘">
      <p>数据指标多如牛毛。如果你试图看所有指标——你什么也看不到。游戏运营最关键的只有五个：</p>
      <ul>
        <li><strong>DAU（Daily Active Users，日活跃用户）：</strong>每天多少人打开你的游戏。这是"游戏还活着吗"的体温计。DAU 持续下降→游戏在流失热度。DAU 稳定或上升→健康。小游戏首周 DAU 目标：>100。对独立游戏来说，DAU 500 就是不错的起步。</li>
        <li><strong>Retention（留存率，D1/D7/D30）：</strong>今天来的玩家，第 N 天还在的比例。这是<strong>最重要的单一指标</strong>——比 DAU 重要。因为 DAU 可以靠买量虚高（花广告费拉一堆人当天来），但留存是"产品力"的真实反映。D1 30%=及格，D7 15%=不错，D30 10%=优秀。</li>
        <li><strong>ARPU（Average Revenue Per User，单用户平均收入）：</strong>总收入 ÷ 总用户数。免费游戏中 ARPU 通常在 ¥0.5-5。ARPU × DAU × 30 = 月收入预估。这个数字决定了"我能不能靠这个游戏生活"。</li>
        <li><strong>LTV（Lifetime Value，用户生命周期价值）：</strong>一个玩家从"第一次打开"到"永远不再回来"之间的总收入贡献。LTV 必须大于获客成本（CAC，Customer Acquisition Cost）才有利润。如果花 3 块钱广告费拉一个用户下载，他的 LTV 只有 2 块钱——你在给广告平台打工。</li>
        <li><strong>转化漏斗：</strong>从"打开游戏"到"完成第一局"到"D1 留存"到"首次付费"——每一步的转化率。漏斗形状是你的游戏体验的 X 光片——每一步的"脖子"缩窄处就是问题所在。</li>
      </ul>
      <p>这五个指标之间的关系构成了一个完整的商业模型：<strong>DAU × Retention = 活跃用户基数 → 活跃用户基数的 N% × ARPU → 收入 → 收入 ÷ LTV = 健康度。</strong>你不用一开始就天天盯着这五个数字——但从游戏上线第一天就开始记录它们，3 个月后你就能看到清晰的趋势。</p>
    </ConceptBlock>

    <ConceptBlock icon="📊" title="埋点设计——不是“越多越好”，是“问对问题”">
      <p>埋点最大的误区："把所有事件都记下来，以后慢慢分析。"结果：攒了 100 万条数据，不知道看什么。</p>
      <p><strong>正确的做法：先列问题，再设计埋点。</strong>你想知道的不是"所有数据"，而是回答 5 个关键问题：</p>
      <ol>
        <li>玩家在第几波死得最多？（埋点：player_death + wave 字段）</li>
        <li>玩家第一次打开后，有多少人点了"开始游戏"？（埋点：game_start）</li>
        <li>哪些道具最常被购买？哪些从来没人买？（埋点：purchase_item + itemId 字段）</li>
        <li>复活广告的完播率是多少？（埋点：ad_show + ad_complete）</li>
        <li>玩家平均玩多久退出？（埋点：game_end + duration 字段）</li>
      </ol>
      <p>5 个问题 → 5-8 个埋点。不要多——多了你自己都看不完。这和前端埋点（Google Analytics 的 page_view、click_event 等）是一样的——<strong>收集数据便宜，分析数据贵。</strong></p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：搭建你的飞机大战数据系统">
      <ol>
        <li><strong>设计 5 个关键埋点：</strong>
          <ul>
            <li><code>game_start</code>——游戏开始。字段：timestamp, playerId</li>
            <li><code>player_death</code>——玩家死亡。字段：timestamp, wave（死在第几波）, score（当时分数）, cause（碰撞/子弹/边界）</li>
            <li><code>game_end</code>——游戏结束（死亡后退出或主动退出）。字段：timestamp, wave, score, kills_total, duration_sec</li>
            <li><code>ad_watch</code>——看广告。字段：timestamp, adType（rewarded/interstitial）, scene（revive/double_reward）, completed（是否完播）</li>
            <li><code>purchase</code>——购买（道具/升级/复活）。字段：timestamp, itemId, price, currency</li>
          </ul>
        </li>
        <li><strong>实现 Analytics 类：</strong>写一个单例 AnalyticsManager，对外暴露 <code>track(eventName, params)</code> 方法。内部用 <code>wx.request()</code> 把事件 POST 到你的服务器。如果你还没有后端，用 <code>wx.reportEvent()</code> 上报到微信后台的"数据分析"模块——微信提供了基础的埋点分析能力（事件统计、漏斗、留存）。</li>
        <li><strong>生成测试数据：</strong>玩 10 局游戏，每局尝试不同的行为（正常打、故意送死、看广告复活、买道具）。确认你有 50+ 条事件。在后台检查：你能看到玩家的分数分布吗？能看到在哪一波死亡最集中吗？</li>
        <li><strong>回答你的 5 个问题：</strong>在数据中找出每个问题的答案。比如"死亡波次分布"——如果 70% 的玩家死在第 3 波，第 3 波有什么特别之处？难度跳跃太大？新敌机没给玩家适应时间？找出来，修掉。</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>A/B 测试在游戏中——和前端 A/B 测试一模一样：</strong>你想知道"道具价格 50 金币还是 80 金币更好"？别猜。把 50% 玩家分到 A 组（价格 50）、50% 到 B 组（价格 80）。跑一周，看数据。哪个组购买率高？哪个组金币消耗更健康？哪个组留存更高？这和前端领域的 A/B 测试（Google Optimize、LaunchDarkly）是同样的方法论——<strong>用数据替代直觉。</strong>区别是游戏 A/B 测试的周期更长（1-2 周 vs 前端 1-2 天），因为玩家行为受"养成周期"影响。</li>
        <li><strong>《糖果粉碎传奇》的数据驱动文化：</strong>King（糖果粉碎的开发商）有超过 200 人专门做数据分析——每个关卡的通关率、每个道具的使用率、每个价格点的购买率都有实时仪表盘。如果一个关卡在 3 天内通关率低于 30%——他们立刻线上调难度，不需要发新版本。这就是"数据驱动运营"的极致——<strong>游戏上线之后的"更新"不再是"功能更新"，而是"数据更新"。</strong></li>
        <li><strong>漏斗分析不是"找流失"——是"找惊喜"：</strong>你建了一个"打开游戏→完成新手引导→完成第一局→D1 留存→首次付费"的漏斗。流失最大的环节，是你最需要优化的。但反过来，<strong>转化率高于预期的环节也是宝藏</strong>——比如"从完成第一局到 D1 留存"转化率高达 60%（远高于行业 30%），说明你的核心玩法对"第一天的人"有极强的吸引力——你的获客策略应该侧重"让人打完第一局"而不是"让人下载就完"。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>游戏运营最关键的五个核心指标是什么？它们之间有什么关系？为什么 D1 留存比 DAU 更重要？</li>
        <li>什么是"漏斗分析"？怎么用漏斗找到游戏体验中的最大问题——也找到最大优势？</li>
        <li>A/B 测试在游戏和在前端 Web 应用中有什么异同？为什么游戏 A/B 测试的周期更长？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
