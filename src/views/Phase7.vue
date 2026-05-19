<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="7" title="像素飞机大战实战" duration="5-7 天">
    <ConceptBlock icon="🎯" title="项目概览">
      <p>这是最终实战——运用前六个阶段的所有知识，从零写出一款完整可玩的<strong>像素飞机大战</strong>。</p>

      <h3>核心玩法</h3>
      <ul>
        <li>玩家控制飞机在屏幕底部移动和射击</li>
        <li>敌机从屏幕顶部出现，向下移动并发起攻击</li>
        <li>消灭敌机获得分数，随机掉落道具</li>
        <li>生命耗尽游戏结束</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧩" title="模块拆解">
      <table>
        <thead>
          <tr><th>模块</th><th>内容</th><th>涉及知识点</th></tr>
        </thead>
        <tbody>
          <tr><td>🎮 玩家飞机</td><td>移动、射击、受击闪烁</td><td>输入、Sprite、tween</td></tr>
          <tr><td>🔫 子弹系统</td><td>玩家/敌机子弹，对象池</td><td>Object Pool</td></tr>
          <tr><td>👾 敌机系统</td><td>小/中/大型敌机，移动模式</td><td>状态机、对象池</td></tr>
          <tr><td>💥 碰撞系统</td><td>子弹 vs 敌机，敌机 vs 玩家</td><td>AABB 碰撞</td></tr>
          <tr><td>🎁 道具系统</td><td>火力升级、炸弹、加血</td><td>事件总线</td></tr>
          <tr><td>📊 UI 系统</td><td>分数、生命、菜单、结算</td><td>Label、场景切换</td></tr>
          <tr><td>🔊 音效系统</td><td>射击、爆炸、拾取音效</td><td>AudioSource</td></tr>
          <tr><td>✨ 特效系统</td><td>爆炸粒子、道具发光</td><td>帧动画 / ParticleSystem2D</td></tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🪜" title="推荐开发顺序">
      <ol>
        <li><strong>搭骨架：</strong>创建 GameScene，写 GameManager 单例，定义 GameState 枚举</li>
        <li><strong>玩家飞机：</strong>移动控制 + 射击（先不做碰撞），感受帧驱动的节奏</li>
        <li><strong>子弹对象池：</strong>实现对象池，射击时从池中取子弹</li>
        <li><strong>第一架敌机：</strong>从屏幕上方出现、向下移动、被击中消失</li>
        <li><strong>碰撞检测：</strong>手写 AABB，让子弹击毁敌机、敌机撞到玩家扣血</li>
        <li><strong>多种敌机 + 波次：</strong>小/中/大型敌机，不同移动模式，难度递增</li>
        <li><strong>道具系统：</strong>敌机掉落道具，玩家拾取增益</li>
        <li><strong>UI + 音效：</strong>分数/生命显示，菜单/暂停/结算场景</li>
        <li><strong>打磨：</strong>爆炸动画、受击闪烁、屏幕震动、难度曲线</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="🌳" title="场景结构建议">
      <pre><code>GameScene（游戏主场景）
├── Canvas
│   ├── GameManager（挂 GameManager 脚本）
│   ├── Background（背景层——滚动星空）
│   ├── Player（玩家飞机）
│   ├── BulletPool（子弹对象池容器）
│   ├── EnemyPool（敌机对象池容器）
│   ├── ItemPool（道具对象池容器）
│   ├── Effects（特效层——爆炸、粒子）
│   └── UI（HUD——分数、生命、暂停按钮）

MenuScene（主菜单）
ResultScene（结算）</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见坑点">
      <ul>
        <li><strong>对象池不忘回收：</strong>飞出屏幕的子弹/敌机要及时放回池子</li>
        <li><strong>碰撞体稍小于图片：</strong>给玩家留一点"擦弹"的容错空间，体验更好</li>
        <li><strong>位移永远乘 dt：</strong>否则不同帧率下移动速度不一致</li>
        <li><strong>音频预加载：</strong>别在射击瞬间才加载音效，会出现延迟</li>
      </ul>
    </ConceptBlock>
  </PhaseLayout>
</template>
