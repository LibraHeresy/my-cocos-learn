<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="15" title="国际化" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>你的飞机大战在中国有玩家。不做国际化，日本玩家打开看到中文——还没玩就走了。<strong>国际化不是翻译——是让你的游戏"在不同文化中感觉像是为他们做的"。</strong></p></ConceptBlock>

    <ConceptBlock icon="📖" title="你花了 3 个月打磨手感——但 30% 的海外玩家因为看不懂“开始游戏”而走了">
      <p>2016 年，一款中国独立游戏《ICEY》在 Steam 上架。英文版上线第一天，评论区被一条评论刷屏："界面中文，我按 ESC 退出了。"开发团队连夜找人翻译了 UI 文本，重新提交。3 天后 Steam 评分从"褒贬不一"变成了"特别好评"。</p>
      <p>他们什么都没改——只改了<strong>语言</strong>。游戏好不好玩没变，但"能不能懂"决定了玩家给不给你机会。</p>
      <p>你可能想："我的飞机大战才几十个中文字，翻译一下不就完了？" 翻译是最简单的部分——真正的国际化有四个挑战，翻译只占了 1/4：</p>
      <ol>
        <li><strong>文本提取（i18n）：</strong>把所有硬编码的文字抽成 key-value 翻译表</li>
        <li><strong>布局自适应（L10n）：</strong>英文比中文长 30-40%，UI 能不能容纳？</li>
        <li><strong>文化适配（Culturalization）：</strong>颜色、图标、数字格式在不同文化中含义不同</li>
        <li><strong>字体问题：</strong>你的字体文件包含日文/韩文/阿拉伯文的字形吗？</li>
      </ol>
      <p>这和前端 i18n（Vue I18n / react-i18next）面临的问题一模一样——只不过前端还有 RTL（阿拉伯语/希伯来语从右到左排版），游戏因为 Canvas 渲染反而更自由（没有 CSS direction 的限制，但需要手动处理文字对齐）。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔍" title="四个挑战——绝不是“翻译一下”">
      <p><strong>1. 文本提取——告别硬编码。</strong>你现在的飞机大战可能有这样的代码：<code>label.string = '击杀：' + kills</code>。把它改成 <code>label.string = I18n.t('kills_count', { count: kills })</code>。对应的翻译表 entry：<code>{ kills_count: '击杀：{count}' }</code>。英语：<code>{ kills_count: 'Kills: {count}' }</code>。日语：<code>{ kills_count: '撃破：{count}' }</code>。</p>
      <p>关键原则：<strong>不要用"拼接"方式处理带变量的文本</strong>——不是 "击杀：" + kills，而是用占位符 {count}。因为不同语言的语序不同——日语可能是 "敵を{count}体撃破"（变量夹在中间），中文是"击杀：{count}"（变量在末尾）。拼接会炸掉所有非英语语序的语言。</p>

      <p><strong>2. 布局自适应——英文是魔鬼。</strong>同一个概念，英文比中文长 30-40%。"开始游戏"4 个字符，"START GAME" 10 个字符——宽度差了 2.5 倍。如果按钮宽度是按"开始游戏"设计的——英文版文字溢出按钮。解决方案：按钮宽度用 padding + min-width，不写死固定宽度；小于 10 个字符的翻译用一个 <code>MAX_BUTTON_CHARS</code> 配置限制翻译文本长度。</p>

      <p><strong>3. 文化适配——红色在中国是"好运"，在西方是"危险"。</strong>你的飞机爆炸特效是红色+金色——在中国文化中这是"激烈+辉煌"，没有问题。但在某些西方文化中，红色 = 警告/停止/危险。如果你做的是恐怖游戏——红色合适。但休闲飞机大战——考虑用橙色/黄色替代高饱和度红色。这和 UI 设计中的"颜色语义"是同一套规则——只不过跨文化后需要重新校准。</p>

      <p><strong>4. 字体——CJK 字体文件动辄 5-15MB。</strong>如果你的飞机大战用的是自定义字体——一个包含中日韩全字符集的字体文件可能有 15MB。微信小游戏主包限制 4MB——这意味着你必须用系统默认字体（wx.getSystemInfoSync().system 返回手机系统语言决定了可用字体），或者做字体子集化——只保留你实际用到的字。</p>
    </ConceptBlock>

    <ConceptBlock icon="🛠" title="伪本地化——不翻译就能提前发现问题的魔法">
      <p>伪本地化（Pseudolocalization）是游戏国际化最聪明的技巧。在真正翻译之前，用一个自动脚本把所有文本替换成带有重音符号和特殊字符的"伪翻译"版本：</p>
      <div style="background:var(--color-surface);padding:12px;border-radius:8px;margin:8px 0;font-family:monospace;font-size:0.85em;">
原文：开始游戏<br/>
伪翻译：[Ķªī Šħī Ýóú Xī] ← 加了前缀/后缀和重音符号<br/>
英文：START GAME<br/>
伪翻译：[ŠŦÄŘŤ ĞÄMĔ] ← 比原文长 30%（模拟翻译后长度）
      </div>
      <p>伪本地化能立刻暴露三个问题——<strong>不需要任何翻译人员参与</strong>：① 字符集不支持——如果某些重音字符显示为方框乱码，说明你的字体/编码不支持非 ASCII 字符。② 文本溢出——伪翻译比原文长，如果 UI 布局用伪翻译就溢出了，真实的翻译（如德语——通常比英语还长 20%）也会溢出。③ 硬编码文本——那些你没放进翻译表的中文文字——仍然显示为中文而不是"[伪翻译]"——被你立刻发现。</p>
      <p>这和前端使用 <code>pseudolocale</code> 库在开发环境模拟不同语言长度是一样的——提前发现问题，而不是等 QA 说"德语版按钮文字出来了"。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：为飞机大战做国际化">
      <ol>
        <li><strong>创建翻译文件：</strong>新建 <code>src/i18n/zh.ts</code> 和 <code>src/i18n/en.ts</code>。把游戏中<strong>所有</strong>可见文字提取出来——按钮标签、提示文字、分数标签、波次公告、道具名称、错误信息。格式：
          <div style="background:var(--color-surface);padding:8px;border-radius:8px;margin:8px 0;font-family:monospace;font-size:0.85em;">
// zh.ts<br/>
export default {<br/>
&nbsp;&nbsp;gameTitle: '像素飞机大战',<br/>
&nbsp;&nbsp;btnStart: '开始游戏',<br/>
&nbsp;&nbsp;waveN: '第 {n} 波来袭！',<br/>
&nbsp;&nbsp;score: '分数：{value}',<br/>
&nbsp;&nbsp;gameOver: '游戏结束',<br/>
&nbsp;&nbsp;btnRevive: '看广告复活',<br/>
&nbsp;&nbsp;itemBomb: '全屏炸弹',<br/>
&nbsp;&nbsp;itemShield: '护盾'<br/>
}
          </div>
          <strong>不要漏掉任何一个硬编码的中文字符串</strong>——包括 debug 日志中的提示文字。把所有 key 列在另一个文件里作为"翻译清单"——以后加新文字时先查这个清单，避免重复 key。
        </li>
        <li><strong>实现 I18nManager：</strong>创建单例类 <code>I18nManager</code>：
          <ul>
            <li>构造函数读取 <code>wx.getSystemInfoSync().language</code>（或 <code>localStorage</code> 用户选择的语言）</li>
            <li>对外暴露 <code>t(key: string, params?: Record&lt;string, string|number&gt;)</code>——支持 {n} 占位符替换</li>
            <li>切换语言时触发 <code>EventBus.emit('language-changed', { lang })</code>——所有 UI 组件监听这个事件并刷新显示</li>
          </ul>
        </li>
        <li><strong>替换所有硬编码：</strong>搜索项目中所有中文字符串——用 <code>I18n.t('key')</code> 替换。这是一项枯燥但不可跳过的工作——做完后你会惊讶"原来我有这么多硬编码的中文"。</li>
        <li><strong>特别测试——英文溢出：</strong>切换到英文版，检查以下场景：按钮文字是否溢出？（"START GAME" vs "开始游戏"——宽度差 2.5 倍）、长数字文本是否正常？（"Score: 999999" vs "分数：999999"——英文多 1 个字符）、波次公告是否正常？（"Wave {n} incoming!" vs "第{n}波来袭！"——英文长得多）。如果溢出——调整 UI 布局：按钮加 min-width + padding 自动化宽度，标签用多行文本或者缩写英文。</li>
        <li><strong>（可选）伪本地化自检：</strong>写一个简单的替换函数——把所有中文文本临时替换成加长版 + 重音符号的伪翻译。运行游戏——如果有乱码→字符集问题。有文字溢出→布局问题。有中文没变成伪翻译→硬编码没覆盖到。</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>伪本地化不只是技巧——是行业标配：</strong>微软、EA、任天堂都在使用伪本地化作为"国际化第一步"。它让开发者在<strong>不花翻译费、不等翻译周期</strong>的情况下提前发现 80% 的国际化问题。EA 的 FIFA 系列在正式翻译之前会跑一轮伪本地化——发现的字符集问题和布局溢出的数量经常多到"原来我们这么多地方没考虑非英语"。这和前端开发在 CI 中跑 Lighthouse 性能检查是一样的——在问题"变贵"之前把它揪出来。</li>
        <li><strong>RTL 语言（阿拉伯语、希伯来语）——CSS 的 direction: rtl 在 Canvas 里不存在：</strong>浏览器用 direction: rtl 自动镜像整个页面布局——所有 text-align 右对齐、所有 flexbox 方向反转。但 Canvas 没有 direction 属性——<strong>你需要在代码中手动翻转所有 UI 元素的坐标。</strong>对飞机大战来说暂时不需要支持 RTL（阿拉伯语市场对休闲游戏的接受度还较低），但如果你将来做的是 RPG 或策略游戏（中东市场很大），RTL 是必须过的坎。</li>
        <li><strong>字体子集化——把 15MB 字体压到 300KB：</strong>CJK 字体包含 20000+ 个字形。但你的游戏实际用到的汉字可能只有 50 个（"开始游戏" "分数" "波" "炸弹" ...）。字体子集化工具（如 fontmin / FontSpider）可以扫描你的翻译表，只保留你实际用到的字形——把 15MB 的 CJK 字体压到 300KB。这对微信小游戏的 4MB 主包限制至关重要。这也是为什么像素字体天然比矢量字体更适合小游戏——它不仅风格复古，文件也更小。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>国际化（i18n）、本地化（L10n）、文化适配（Culturalization）分别是什么意思？它们之间的关系是什么？</li>
        <li>为什么带变量的文本必须用占位符（{n}）而不是字符串拼接？举一个语序不同的实际例子。</li>
        <li>伪本地化（Pseudolocalization）能帮你提前发现哪些问题？为什么翻译之前就值得做？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
