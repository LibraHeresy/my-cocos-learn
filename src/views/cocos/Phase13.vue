<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="13" title="波次系统" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>如果敌机只是随机掉落，玩家很快会失去兴趣。波次系统给游戏注入<strong>节奏感</strong>——战斗→喘息→更强的战斗→Boss→奖励。这一节讲如何用<strong>数据驱动</strong>的方式设计波次。</p>
    </ConceptBlock>

    <ConceptBlock icon="📊" title="数据驱动：把波次配成 JSON">
      <pre>const WAVES = [
  { wave: 1, enemies: [
    { type: 'small', count: 5, interval: 1.5 }
  ], restTime: 3 },
  { wave: 2, enemies: [
    { type: 'small', count: 8, interval: 1.2 },
    { type: 'medium', count: 2, interval: 2.0 }
  ], restTime: 4 },
  { wave: 5, enemies: [  // Boss 关
    { type: 'boss', count: 1, interval: 0 }
  ], restTime: 8 }
]</pre>
      <p>数据驱动的最大好处：<strong>调难度不需要改代码</strong>。策划改一个 JSON 文件就能调整波次参数，程序员不需要参与。</p>
    </ConceptBlock>

    <ConceptBlock icon="🎵" title="波次节奏：高潮与呼吸">
      <p>好的波次设计像音乐——有前奏、有高潮、有间奏。不要每波都是匀速变难：</p>
      <pre>Wave 1-2：热身（敌机少而慢）
Wave 3：第一次增压（加入中型敌机）
Wave 4：喘息（稍微降低密度）
Wave 5：Boss 关（完全不同的节奏）
Wave 6-7：恢复后再次增压
...</pre>
    </ConceptBlock>

    <ConceptBlock icon="📈" title="难度曲线">
      <p>四种难度曲线各有适用场景：</p>
      <ul>
        <li><strong>线性：</strong> 每波稳定变难。适合无限模式。</li>
        <li><strong>指数：</strong> 后期急剧变难。适合 Roguelike。</li>
        <li><strong>S 曲线：</strong> 前期平滑→中期加速→后期天花板。适合有限关卡。</li>
        <li><strong>阶梯：</strong> Boss 关突增，普通关回落。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：把波次数据提取到 JSON 并实现加载器">
      <p>把波次数据从代码里抽出来放到一个 JSON 文件，然后写一个 WaveManager 来读它。整个过程分三步：</p>
      <p><strong>第 1 步：创建 <code>assets/resources/waves.json</code></strong></p>
      <pre>[
  {
    "wave": 1,
    "description": "热身——5 只小兵，间隔宽裕",
    "enemies": [
      { "type": "small", "count": 5, "interval": 1.5 }
    ],
    "restTime": 4
  },
  {
    "wave": 2,
    "description": "加强——8 小兵 + 2 中兵",
    "enemies": [
      { "type": "small", "count": 8, "interval": 1.2 },
      { "type": "medium", "count": 2, "interval": 2.0 }
    ],
    "restTime": 5
  },
  {
    "wave": 3,
    "description": "首次压力——10 小兵 + 3 中兵 + 1 大兵",
    "enemies": [
      { "type": "small", "count": 10, "interval": 1.0 },
      { "type": "medium", "count": 3, "interval": 1.8 },
      { "type": "large", "count": 1, "interval": 0 }
    ],
    "restTime": 6
  },
  {
    "wave": 4,
    "description": "喘息——稍微回调难度",
    "enemies": [
      { "type": "small", "count": 6, "interval": 1.3 },
      { "type": "medium", "count": 4, "interval": 1.5 }
    ],
    "restTime": 4
  },
  {
    "wave": 5,
    "description": "BOSS 关——一决胜负",
    "enemies": [
      { "type": "boss", "count": 1, "interval": 0 }
    ],
    "restTime": 10
  }
]</pre>
      <p><strong>第 2 步：创建 <code>WaveManager.ts</code> 加载 JSON 并逐波生成</strong></p>
      <pre>// WaveManager.ts
@ccclass('WaveManager')
export class WaveManager extends Component {
  private waves: WaveData[] = []
  private currentWave: number = 0
  private waveTimer: number = 0
  private spawnTimer: number = 0
  private enemiesInWave: { type: string; count: number; interval: number }[] = []
  private isResting: boolean = false

  onLoad() {
    // 从 resources 加载 JSON
    resources.load('waves', (err, asset) => {
      if (err) { console.error('加载波次数据失败:', err); return }
      this.waves = asset.json as WaveData[]
      this.startWave(0)  // 开始第一波
    })
  }

  startWave(index: number) {
    if (index >= this.waves.length) {
      console.log('所有波次完成！')
      return
    }
    this.currentWave = index
    this.enemiesInWave = [...this.waves[index].enemies]
    console.log(`开始第 ${index + 1} 波：${this.waves[index].description}`)
  }

  update(dt: number) {
    if (this.isResting) {
      this.waveTimer += dt
      if (this.waveTimer >= this.waves[this.currentWave].restTime) {
        this.isResting = false
        this.waveTimer = 0
        this.startWave(this.currentWave + 1)
      }
      return
    }

    if (this.enemiesInWave.length === 0) return

    this.spawnTimer += dt
    const current = this.enemiesInWave[0]

    if (this.spawnTimer >= current.interval && current.count > 0) {
      this.spawnTimer = 0
      this.spawnEnemy(current.type)
      current.count--
      if (current.count <= 0) {
        this.enemiesInWave.shift()  // 这个类型生成了，移除
        if (this.enemiesInWave.length === 0) {
          this.isResting = true  // 进入休息时间
        }
      }
    }
  }

  private spawnEnemy(type: string) {
    const enemy = EnemyPool.instance.get()
    const comp = enemy.getComponent(Enemy)
    // 根据 JSON 里的 type 字符串来配置敌机属性
    switch (type) {
      case 'small': comp.init({ hp: 1, speed: 250, moveType: 'straight' }); break
      case 'medium': comp.init({ hp: 3, speed: 180, moveType: 'sine' }); break
      case 'large': comp.init({ hp: 8, speed: 120, moveType: 'chase' }); break
      case 'boss': comp.init({ hp: 50, speed: 80, moveType: 'sine' }); break
    }
    enemy.setPosition(Math.random() * 400 - 200, 600, 0)
  }
}</pre>
      <p><strong>第 3 步：验证数据驱动</strong></p>
      <p>改动 <code>waves.json</code> 文件，比如把第 3 波的 enemy count 从 10 改成 20，保存后直接运行游戏——不需要重新编译 TypeScript 代码，难度就翻倍了。这就是数据驱动的核心优势：<strong>策划改 JSON = 改游戏，程序员不用介入。</strong></p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>不同游戏的难度曲线哲学：</strong> 《黑暗之魂》用几乎平坦的难度曲线——第一个 Boss 和第一个精英怪差不多难，靠"你学会了"让难度主观下降。放置类游戏用指数曲线——前期秒秒钟变强，后期等一天才涨 1%。三消游戏（Candy Crush）用随机难度——简单关和困难关交替出现，像老虎机一样利用你的"差一点就过了"心理。没有"对的"难度曲线，只有"适合你游戏"的难度曲线。</li>
        <li><strong>心流理论（Flow）与游戏难度：</strong> 心理学家 Csikszentmihalyi 提出"心流"——当挑战难度和你的能力刚好匹配时，人会进入一种忘记时间、完全沉浸的状态。太简单→无聊，太难→焦虑，刚好在能力边界上→心流。好的波次系统本质上就是在做这件事：让每一波都刚好在玩家的能力边界上，维持"差一点就死了但就是没死"的紧张感。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>为什么数据驱动（JSON 配置）比硬编码波次数据更好？如果波次数据硬编码在 WaveManager.ts 里，策划想微调第 3 波的敌人数量，流程会变成什么样？</li>
        <li>什么是一个"好"的难度曲线？如果你玩一个游戏，前 10 分钟都在秒杀一切，第 11 分钟突然死活过不去——问题出在哪里？</li>
        <li>如果要设计一个波次系统的 JSON 结构，至少需要哪些字段？提示：想想除了敌人类型和数量之外，还需要什么信息来让每波游戏体验完整。</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
