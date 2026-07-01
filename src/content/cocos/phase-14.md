---
phase: 14
title: 道具系统
duration: 1-2 天
---

## 🧭 本节定位

1985 年，马力欧吃了一个蘑菇——变大了。这是游戏史上最重要的道具。它没有教程、没有文字说明——你看到蘑菇，走过去，碰到了，变大了。**道具设计的第一原则："让玩家本能地知道它有用。"** 这一节我们要做的道具系统，同样追求这个原则：掉落有规律、效果有层次、组合有惊喜。

## 🍄 超级蘑菇教给游戏设计的一切

马力欧的超级蘑菇堪称游戏史上最成功的道具设计——不是因为它"让角色变大"，是因为它用最少的视觉信息传达了最多的意思：

- **颜色鲜艳（红色黄点）：** 在棕色砖块的背景下极其醒目——"我有好东西"
- **它会动（从砖块中跳出，沿地面滚动）：** "你要追我"——给了玩家一个本能的动力：去碰它
- **碰到 = 变大：** 不需要任何文字，"碰一下试试"是所有玩家面对蘑菇时的本能反应
- **变大后你更"大"了，但受击面积也更大了：** 有得必有失——这才是成熟的道具设计

宫本茂在设计这个蘑菇时说过一句话："最好的教学是让玩家自己发现。"你在设计道具时也请记住——不要让道具弹出一段文字解释自己。让它的外观、动效、音效本能地告诉玩家："捡我。"

## 🎁 三种效果类型：从即时到持续到累积

道具有三种本质上不同的生效方式。理解它们的区别，是设计道具系统的基础：

<table>
<thead><tr><th>类型</th><th>时机</th><th>例子</th><th>需要记录的状态</th><th>Vue 类比</th></tr></thead>
<tbody>
<tr><td><strong>即时生效</strong></td><td>拾取瞬间</td><td>全屏炸弹——清屏</td><td>无（用完即忘）</td><td>点击按钮触发 method</td></tr>
<tr><td><strong>持续生效</strong></td><td>拾取后一段时间</td><td>火力增强——8 秒双倍射速</td><td>激活时间、剩余时间</td><td><code>setTimeout</code> / <code>setInterval</code></td></tr>
<tr><td><strong>叠加触发</strong></td><td>拾取时积累，需要时手动释放</td><td>复活币——攒到死时才用</td><td>当前数量</td><td>队列/计数器 (ref)</td></tr>
</tbody>
</table>

<div class="tip-box">
<strong>前端类比：</strong> 即时道具 = <code>onClick</code> 事件处理（触发一次，不需要跟踪状态）；持续道具 = <code>setTimeout(cb, 8000)</code> + 计时器管理（需要跟踪开始时间和清理定时器）；叠加道具 = <code>ref(count)</code>（需要追踪累积值，在特定条件下消费）。
</div>

## 🎲 掉落表：游戏世界的 CSS 特异性权重

CSS 选择器的优先级不是均匀的——`#id` > `.class` > `element`，每个选择器有自己的"权重"。道具掉落也是同样的逻辑：不是所有道具应该有相同的掉落概率。我们需要一个**权重系统**：

<div class="tip-box">
<strong>前端类比一：</strong> 掉落表 ≈ <strong>CSS Specificity</strong>。就像 CSS 的 <code>#id</code> 权重（100）远大于 <code>.class</code>（10），Boss 击杀掉落稀有道具的权重也远大于小怪击杀。伤害值 100 的炸弹和伤害值 10000 的黑洞弹不应该有相同的概率——它们的 <code>weight</code> 值就相当于 CSS 的 <code>specificity</code> 值。调概率就像调 CSS 优先级：改一个数字就够了。
</div>

<pre>const DROP_TABLE = [
  { type: 'firePower', weight: 40 },  // 40% 概率
  { type: 'shield',    weight: 30 },  // 30%
  { type: 'bomb',      weight: 20 },  // 20%
  { type: 'none',      weight: 10 },  // 10% 不掉落
]

function rollDrop(): string {
  const total = DROP_TABLE.reduce((s, d) => s + d.weight, 0)
  let r = Math.random() * total
  for (const entry of DROP_TABLE) {
    r -= entry.weight
    if (r &lt;= 0) return entry.type
  }
  return 'none'
}</pre>

权重随机比均匀随机灵活得多——调概率只需要改 weight 值，不需要改任何判断逻辑。加新道具也只需要在表里加一行。

## 🔄 道具叠加：CSS 自定义属性的级联逻辑

多个道具同时作用于一个玩家时，怎么处理？这和 CSS 自定义属性的级联逻辑是一样的——"后到的覆盖先到的"是最简单的策略，但还有更多选择：

<div class="tip-box">
<strong>前端类比二：</strong> 道具堆叠 ≈ <strong>CSS Custom Properties 的 Cascade</strong>。就像 <code>--shield-color: red</code>（第一个护盾）被 <code>--shield-color: blue</code>（第二个护盾）覆盖，道具的叠加策略也有"覆盖""延长""共存"三种。CSS 级联默认"后者覆盖前者"，但游戏可以更灵活——火盾和冰盾可以是两个不同的 CSS 变量（<code>--fire-shield</code> 和 <code>--ice-shield</code>），各自独立存在。
</div>

<table>
<thead><tr><th>策略</th><th>行为</th><th>适合的道具类型</th></tr></thead>
<tbody>
<tr><td><strong>覆盖（Override）</strong></td><td>新道具替换旧道具的效果</td><td>同类护盾（更新持续时间）</td></tr>
<tr><td><strong>延长（Extend）</strong></td><td>新道具延长旧道具的时间</td><td>火力增强（+5 秒）</td></tr>
<tr><td><strong>叠加（Stack）</strong></td><td>新旧效果同时存在</td><td>复活币（+1 条命）</td></tr>
<tr><td><strong>互斥（Conflict）</strong></td><td>新道具移除旧效果再应用</td><td>不同属性的护盾（火盾 vs 冰盾）</td></tr>
</tbody>
</table>

## 🔗 课外延伸

- **马力欧的蘑菇到底教了什么？——道具即教程：** 1985 年《超级马力欧兄弟》的 1-1 关卡是世界公认的游戏教学设计典范。在你玩的第一个 30 秒里，宫本茂安排了三个关键教学：1) 一个蘑菇从砖块里跳出来——教会你"碰砖块有东西"；2) 那蘑菇在地面上滚——教会你"地上的东西可以追"；3) 你碰到了蘑菇，变大了——教会你"有东西是好的，碰到了就生效"。全程没有一行文字、没有一个弹窗。这种"道具即教程"的设计哲学至今仍然是所有游戏 UI/UX 设计师的必修课。你的道具设计也应该追求这个标准——不要写"按 E 键拾取"，让道具看起来就让人想走过去。
- **《暗黑破坏神》的随机词缀装备——概率的组合爆炸：** 1996 年暴雪北方的《暗黑破坏神》发售时，没有人预见到它的装备系统会彻底改变整个游戏产业。暗黑的每件装备有 6-8 个词缀（属性加成），每个词缀有类别（力量、敏捷、暴击、吸血……）和数值范围（+1~+100），不同词缀之间可以组合——一件装备理论上能有数百万种组合。玩家为了"那个词缀完美搭配"愿意刷上千小时。这和你这节写的 DROP_TABLE 原理完全一样——区别只在于暗黑的掉落表挂了一万个条目，每个条目有更多维度的权重。2012 年《暗黑破坏神 3》的拍卖行灾难（暴雪试图用 RMT 经济来承接这套随机系统，结果玩崩了）更是给所有游戏开发者的警告：道具系统的设计会影响整个游戏的经济体系。
- **《以撒的结合》的道具组合爆炸——700 种道具的排列组合：** 2011 年 Edmund McMillen 的《以撒的结合》以 700+ 种道具闻名。但它真正的设计奇迹不是数量——是**道具之间的组合效果**。比如"硫磺火"（射出激光）配上"三眼"（三发子弹），结果不是"激光+三发"，是三道激光；配上"科技"（电击枪），结果是激光变成电击鞭。每种组合都是手工设计的——这种组合爆炸是 Roguelike 游戏的核心乐趣，但也是测试的噩梦：700 种道具的配对组合数是 244,650 种，三件套的组合数就超过 5700 万。McMillen 的解决方案是"接受不完美"——有些组合非常弱，有些极其强，但"找到那个极强的组合"本身就是玩家的驱动力。你的道具系统不需要 700 种道具，但你需要理解这个设计哲学：不能让每种道具都只是"+10% 攻击力"——要给玩家组合的空间和惊喜。

## 🔧 动手：设计三种道具并实现加权掉落

在 Cocos 里新建一个 `PowerUp.ts` 脚本和 `DropTable.ts` 工具。实现三种不同效果类型的道具，以及一个基于稀有度权重的掉落系统。

**1. 三种道具类型**

<pre>// PowerUp.ts
export enum PowerUpType {
  BOMB = 'bomb',           // 即时——拾取立刻清屏
  SHIELD = 'shield',       // 持续——护盾 5 秒
  EXTRA_LIFE = 'extraLife' // 触发——加一条命
}

@ccclass('PowerUp')
export class PowerUp extends Component {
  @property type: PowerUpType = PowerUpType.BOMB
  private duration: number = 0

  apply(player: Node) {
    switch (this.type) {
      case PowerUpType.BOMB: {
        // 即时生效：全屏清敌
        const enemies = find('Canvas').children.filter(c => c.name.startsWith('Enemy'))
        enemies.forEach(e => {
          eventBus.emit('enemy-killed', { type: 'bomb', score: 0 })
          EnemyPool.instance.put(e)
        })
        break
      }

      case PowerUpType.SHIELD: {
        // 持续生效：给玩家套护盾 5 秒
        const shield = player.getComponent(Shield)
        if (shield.isActive) {
          shield.duration += 5  // 如果已有护盾，叠加时间
        } else {
          shield.activate(5)    // 5 秒后自动消失
        }
        break
      }

      case PowerUpType.EXTRA_LIFE: {
        // 触发型：加一条命，不立即生效
        GameManager.instance.lives += 1
        eventBus.emit('life-changed', GameManager.instance.lives)
        break
      }
    }
    // 道具被拾取后销毁
    this.node.destroy()
  }
}</pre>

**2. 权重随机掉落表**

<pre>// DropTable.ts
export interface DropEntry {
  type: PowerUpType | 'none'
  weight: number      // 权重越大，被选中的概率越高
  rarity: 'common' | 'uncommon' | 'rare'
}

const DROP_TABLE: DropEntry[] = [
  { type: PowerUpType.BOMB,        weight: 35, rarity: 'common' },
  { type: PowerUpType.SHIELD,      weight: 25, rarity: 'common' },
  { type: PowerUpType.EXTRA_LIFE,  weight: 10, rarity: 'uncommon' },
  { type: 'none',                   weight: 30, rarity: 'common' },  // 30% 什么都不掉
]

// 根据权重随机选一个道具
function rollDrop(enemyType: string): PowerUpType | 'none' {
  // Boss 击杀可以给额外加权
  const modifier = enemyType === 'boss' ? 2.0 : 1.0

  const entries = DROP_TABLE.map(e => ({
    ...e,
    weight: e.rarity === 'rare' ? e.weight * modifier : e.weight
  }))

  const total = entries.reduce((s, e) => s + e.weight, 0)
  let r = Math.random() * total

  for (const entry of entries) {
    r -= entry.weight
    if (r &lt;= 0) return entry.type
  }
  return 'none'
}

// 在敌机击杀事件中调用
eventBus.on('enemy-killed', (data) => {
  const drop = rollDrop(data.type)
  if (drop !== 'none') {
    spawnPowerUpDrop(data.position, drop)
  }
})</pre>

**3. 验证方法**

在游戏里击杀 100 只敌机，统计三种道具和"不掉"的次数，看是否趋近 35:25:10:30 的比例。然后击杀一只 Boss，看稀有道具的出现率是否明显提高。

## ✅ 自测清单

学完这一节，你应该能回答：

1. 为什么马力欧的超级蘑菇被认为是"史上最佳道具设计"？它用了哪些设计技巧让玩家本能地知道"这个东西有用"？你的道具设计可以从中学到什么？
2. 即时生效（Bomb）、持续生效（Shield）和触发型（Extra Life）道具在代码实现上最关键的区别是什么？每种类型需要记录什么额外的状态信息？如何管理多个持续道具的同时存在？
3. 权重随机为什么比"均匀随机 + if/else 判断"更好？以 CSS 选择器优先级（specificity）为参照，解释权重系统的设计思路。
4. 如果玩家同时吃到两个护盾道具（一个是刚吃的还剩 3 秒，一个是刚掉落的），应该采用哪种叠加策略（覆盖、延长、叠加、互斥）？如果吃到两个不同颜色的护盾呢（火盾 + 冰盾）？
