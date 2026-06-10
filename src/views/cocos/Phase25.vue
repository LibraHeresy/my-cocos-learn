<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="25" title="像素飞机大战实战" duration="4-6 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>这是 Cocos 课程的<strong>收官项目</strong>。前面的 Phase 1-24 讲的是"零件"——场景、节点、碰撞、动画、粒子。这一节把零件装起来，从零开始搭建一个完整的像素飞机大战。</p>
    </ConceptBlock>

    <ConceptBlock icon="🏗️" title="项目架构总览">
      <pre>pixel-plane-battle/
├── assets/
│   ├── scenes/          —— Boot / MainMenu / Game / GameOver
│   ├── scripts/
│   │   ├── manager/     —— GameManager / AudioManager / WaveManager
│   │   ├── player/      —— PlayerController / Bullet / BulletPool
│   │   ├── enemy/       —— Enemy / EnemySpawner / EnemyPool
│   │   ├── ui/          —— ScoreUI / HealthBar / WaveAnnouncer / PausePanel
│   │   ├── powerup/     —— PowerUp / PowerUpSpawner
│   │   └── util/        —— EventBus / ObjectPool / GameFSM
│   ├── textures/        —— 精灵图集（Auto Atlas 配置）
│   └── audio/           —— SFX + BGM
└── settings/</pre>
    </ConceptBlock>

    <ConceptBlock icon="📋" title="开发阶段（5 天）">
      <table>
        <thead><tr><th>天</th><th>内容</th><th>产出</th></tr></thead>
        <tbody>
          <tr><td>Day 1</td><td>项目初始化 + 场景骨架 + 玩家控制</td><td>飞机能在屏幕上移动</td></tr>
          <tr><td>Day 2</td><td>子弹系统 + 敌机生成 + 碰撞检测</td><td>可以射击、击杀敌机</td></tr>
          <tr><td>Day 3</td><td>波次系统 + 道具系统 + 分数 UI</td><td>完整的游戏循环</td></tr>
          <tr><td>Day 4</td><td>场景切换 + 主菜单 + 结算 + 音效</td><td>完整的游戏流程</td></tr>
          <tr><td>Day 5</td><td>粒子特效 + 手感打磨 + 性能优化</td><td>可以展示给别人的游戏</td></tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🎯" title="关键协作模式">
      <p>各 Manager 通过事件总线通信，而不是互相调用：</p>
      <pre>Enemy.ts 被击杀
  → emit 'enemy-killed' { type, position }
  → GameManager: addScore()
  → WaveManager: checkWaveComplete()
  → UIManager: showKillEffect()
  → AudioManager: playSFX('explosion')</pre>
      <p>新增一个功能（比如成就系统）只需监听已有事件，不改已有代码。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：搭建最简可玩原型">
      <p>Step 1: 新建项目，搭建场景骨架（Boot/MainMenu/Game/GameOver 四个场景）。Step 2: 实现玩家飞机：用键盘控制移动，按空格发射子弹。Step 3: 添加一个静态敌机，用碰撞检测实现子弹命中逻辑。这就是"最简可玩"的 2 小时目标。后续步骤参考本节"开发阶段"表格。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li>独立游戏开发的时间尺度：Flappy Bird 3 天做出来，《星露谷物语》一个人做了 4 年，《空洞骑士》3 人做了 3 年。不要因为自己的项目简单就沮丧——先做出能玩的，再迭代。</li>
        <li>上线之后才是开始：用 GameAnalytics 或 Firebase Analytics 追踪玩家行为（哪个关卡死最多人？什么道具没人用？），数据驱动迭代比凭感觉改游戏有效十倍。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="完成后检查">
      <ol>
        <li>游戏可以正常运行（开始→游玩→死亡→结算→重来）</li>
        <li>Web 版部署到 Vercel，可以发给朋友试玩</li>
        <li>FPS 稳定在 50+（Chrome DevTools 检查）</li>
        <li>DrawCall 在 30 以内</li>
        <li>音效和 BGM 正常播放</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
