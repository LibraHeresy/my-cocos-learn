<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="14" title="道具系统" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>如果没有道具，飞机大战就是一个单调的"躲→射→躲"循环。道具给游戏注入<strong>变化和策略</strong>——这一局运气好捡到了火力增强，下一局捡到了护盾，每一局的体验都不同。</p>
    </ConceptBlock>

    <ConceptBlock icon="🎁" title="三种效果类型">
      <ul>
        <li><strong>即时生效：</strong> 拾取后立刻触发一次效果（炸弹——全屏清敌）。拾取后直接销毁道具节点。</li>
        <li><strong>持续生效：</strong> 拾取后在一段时间内改变玩家属性（火力增强——持续 8 秒双倍射速）。需要记录效果开始时间和过期清理。</li>
        <li><strong>叠加触发：</strong> 拾取后积攒次数，需要时手动触发（复活币）。拾取后加计数器，不立即生效。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🎲" title="掉落表（Drop Table）">
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
    if (r <= 0) return entry.type
  }
  return 'none'
}</pre>
      <div class="tip-box"><strong>速通提示：</strong> 权重随机比均匀随机灵活得多——调概率只需要改 weight 值，不需要改任何判断逻辑。加新道具也只需要在表里加一行。</div>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>暗黑破坏神的随机词缀装备：</strong> 《暗黑》的装备系统是游戏史上最有影响力的掉落设计之一。每件装备有多个词缀（属性加成），每个词缀有数值范围，组合几乎无限。玩家会为了"那个词缀完美搭配"刷上千小时。核心原理和这个 DROP_TABLE 是一样的——只是规模大了一万倍。</li>
        <li><strong>Roguelike 的道具组合爆炸：</strong> 《以撒的结合》有 700+ 种道具，许多道具之间有组合效果。这种"组合爆炸"是 Roguelike 游戏的核心乐趣，但也是测试的噩梦。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：设计三种道具并实现加权掉落">
      <p>在 Cocos 里新建一个 <code>PowerUp.ts</code> 脚本和 <code>DropTable.ts</code> 工具。实现三种不同效果类型的道具，以及一个基于稀有度权重的掉落系统。</p>
      <p><strong>1. 三种道具类型</strong></p>
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
      <p><strong>2. 权重随机掉落表</strong></p>
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
    if (r <= 0) return entry.type
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
      <p><strong>3. 验证方法</strong></p>
      <p>在游戏里击杀 100 只敌机，统计三种道具和"不掉"的次数，看是否趋近 35:25:10:30 的比例。然后击杀一只 Boss，看稀有道具的出现率是否明显提高。</p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>即时生效（Bomb）、持续生效（Shield）和触发型（Extra Life）道具在代码实现上最关键的区别是什么？每种类型需要记录什么额外的状态信息？</li>
        <li>权重随机为什么比"均匀随机 + if/else 判断"更好？如果你用 <code>Math.random() &lt; 0.3</code> 来决定掉什么道具，加第 10 种道具时会发生什么？</li>
        <li>如果玩家同时吃到两个护盾道具（一个是刚吃的还剩 3 秒，一个是刚掉落的），应该怎么处理？如果吃到两个不同颜色的护盾呢（比如火盾 + 冰盾）？什么时候叠加，什么时候互斥？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
