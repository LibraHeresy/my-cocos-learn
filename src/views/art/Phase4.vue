<script setup lang="ts">
import ArtPhaseLayout from '@/components/ArtPhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
import PixelCanvas from '@/components/PixelCanvas.vue'

// ---- helpers ----
function empty(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(''))
}

function fill(
  grid: string[][],
  row: number,
  col: number,
  w: number,
  h: number,
  color: string,
) {
  for (let r = row; r < row + h && r < grid.length; r++) {
    for (let c = col; c < col + w && c < grid[r].length; c++) {
      grid[r][c] = color
    }
  }
}

// ---- 1. Easing comparison: 4 patterns, each 21 cols x 3 rows ----
function makeEasingGrid(positions: number[]): string[][] {
  const g = empty(3, 21)
  for (const pos of positions) fill(g, 0, pos, 2, 3, '#e07b3c')
  return g
}
const easingEven = makeEasingGrid([1, 6, 12, 18])
const easingOut = makeEasingGrid([1, 4, 10, 18])
const easingIn = makeEasingGrid([1, 8, 14, 18])
const easingInOut = makeEasingGrid([1, 5, 13, 18])

// ---- 2. Arc vs straight line: two 17x13 canvases, scale 12 ----
const trajectoryStraight = (() => {
  const g = empty(13, 17)
  for (let c = 2; c <= 14; c++) {
    g[6][c] = '#b0a090'
    g[7][c] = '#b0a090'
  }
  for (const c of [2, 6, 10, 14]) fill(g, 5, c - 1, 3, 3, '#5a4a3a')
  return g
})()

const trajectoryArc = (() => {
  const g = empty(13, 17)
  for (let c = 2; c <= 14; c++) {
    const y = Math.round(0.194 * (c - 8) ** 2 + 3)
    g[y][c] = '#f0b878'
    g[y + 1][c] = '#f0b878'
  }
  const pts: [number, number][] = [[2, 10], [6, 4], [10, 4], [14, 10]]
  for (const [c, r] of pts) fill(g, r - 1, c - 1, 3, 3, '#c56a2d')
  return g
})()

// ---- 3. Squash & stretch: 3 blocks, each 10 cols x 10 rows ----
const blockColor = '#4a90d9'
const squashRest = (() => {
  const g = empty(10, 10)
  fill(g, 2, 2, 6, 6, blockColor)
  return g
})()
const squashSquashed = (() => {
  const g = empty(10, 10)
  fill(g, 3, 1, 8, 4, blockColor)
  return g
})()
const squashStretched = (() => {
  const g = empty(10, 10)
  fill(g, 1, 3, 4, 8, blockColor)
  return g
})()

// ---- 4. Engine flame lag: 5 frames, each 10 cols x 14 rows ----
const planeColor = '#4a90d9'
const flameColor = '#e07b3c'
function makeLagFrame(planeRow: number, flameRow: number): string[][] {
  const g = empty(14, 10)
  fill(g, planeRow, 1, 8, 3, planeColor)
  fill(g, flameRow, 3, 4, 4, flameColor)
  return g
}
const lagFrames = [
  makeLagFrame(2, 6),
  makeLagFrame(0, 6),
  makeLagFrame(0, 4),
  makeLagFrame(2, 4),
  makeLagFrame(2, 7),
]
</script>

<template>
  <ArtPhaseLayout :phase="4" title="运动规律与帧数设计" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>理解<strong>帧间距</strong>如何决定动画的"快慢节奏"，而非单纯加减帧数</li>
        <li>用<strong>缓动曲线</strong>设计子弹、引擎、爆炸等不同物体的运动节奏</li>
        <li>判断一个动作该<strong>逐帧</strong>画（<strong>Aseprite</strong>）还是用代码做（<strong>Cocos</strong> tween）</li>
        <li>给飞机大战的每个动作选对帧数——不过度、不寒酸</li>
      </ul>
    </ConceptBlock>

    <!-- ============ 帧间距与缓动 ============ -->
    <ConceptBlock icon="📏" title="帧间距与缓动 —— 动画的'节奏感'从这里来">
      <p>
        同一段位移、同样的帧数，<strong>帧之间的间距不同 → 运动感觉完全不同</strong>。下面四个图中，每行橙色方块代表物体在 4 个关键帧的位置——间距模式不同，运动感觉就不同：
      </p>

      <h3>匀速：等间距（子弹 / 激光）</h3>
      <PixelCanvas :grid="easingEven" :scale="10" />
      <p class="px-desc">4 帧间距相等 → 不加速不减速，适合"不在乎惯性"的机械运动</p>

      <h3>缓出：间距递增（导弹发射 / 碎片飞溅）</h3>
      <PixelCanvas :grid="easingOut" :scale="10" />
      <p class="px-desc">间距越来越大 → 在加速。前几帧密 = 蓄力，后几帧疏 = 释放</p>

      <h3>缓入：间距递减（敌机入场停稳 / 道具落地）</h3>
      <PixelCanvas :grid="easingIn" :scale="10" />
      <p class="px-desc">间距越来越小 → 在减速。前几帧疏 = 快速冲入，后几帧密 = 慢慢停稳</p>

      <h3>缓入缓出：两端密、中间疏（最自然的运动）</h3>
      <PixelCanvas :grid="easingInOut" :scale="10" />
      <p class="px-desc">间距：小 → 大 → 小（慢→快→慢）。任何有生命的物体都这样动——飞机悬停、敌机飘入、道具弹跳</p>

      <h3>帧间距实用模板</h3>
      <table>
        <thead>
          <tr>
            <th>运动类型</th>
            <th>间距模式</th>
            <th>关键帧分布</th>
            <th>飞机大战案例</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>直线稳定运动</td>
            <td>匀速（均匀）</td>
            <td>4 帧间距相等</td>
            <td>子弹飞行、引擎脉动、星空闪烁</td>
          </tr>
          <tr>
            <td>加速运动</td>
            <td>缓出（递增）</td>
            <td>前 2 帧密 + 后 2 帧疏</td>
            <td>子弹出膛瞬间、导弹加速、碎片飞溅</td>
          </tr>
          <tr>
            <td>减速运动</td>
            <td>缓入（递减）</td>
            <td>前 2 帧疏 + 后 2 帧密</td>
            <td>敌机入场停稳、道具落地</td>
          </tr>
          <tr>
            <td>往复／循环</td>
            <td>缓入缓出（两端密）</td>
            <td>4 帧：密→疏→疏→密</td>
            <td>飞机悬停浮动、火焰呼吸感</td>
          </tr>
          <tr>
            <td>冲击／爆发</td>
            <td>极速缓入（前疏后密）</td>
            <td>帧 1-2 变化 70%，帧 3-6 消散</td>
            <td>爆炸、受击闪光、命中火花</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>Aseprite 中的操作：</strong>时间轴上右键某一帧 → Frame Properties → 设置 Duration（毫秒）。比如爆炸帧 1 设 50ms（快速闪光），帧 5 设 150ms（慢慢消散）。<strong>同一动画不同帧可以不同时长</strong>——这是专业动画师的日常操作。
      </div>
    </ConceptBlock>

    <!-- ============ 运动弧线 ============ -->
    <ConceptBlock icon="🔄" title="运动弧线 —— 物体很少走直线">
      <p>像素动画帧数有限，每帧的位置选择比高清动画更关键。弧线轨迹是避免"僵硬感"的最省帧手段：</p>

      <h3>直线 vs 弧线轨迹对比</h3>
      <p>同样的起止点（左→右），浅色 = 轨迹路径，深色方块 = 4 个关键帧位置：</p>

      <div class="px-compare">
        <div>
          <p class="px-label">直线轨迹 —— 传送带感</p>
          <PixelCanvas :grid="trajectoryStraight" :scale="12" />
          <p class="px-desc">物体沿水平线等距移动，没有弧度</p>
        </div>
        <div>
          <p class="px-label">弧线轨迹 —— 被抛出去的感觉</p>
          <PixelCanvas :grid="trajectoryArc" :scale="12" />
          <p class="px-desc">物体沿抛物线上抛下落，运动有弧度</p>
        </div>
      </div>

      <p class="px-desc">
        高清动画用模糊和运动线掩盖直线僵硬，像素画没有模糊——<strong>弧线是你唯一让运动不僵硬的武器</strong>。注意：子弹通常不需要弧线——直线才符合"高速射击"的心理预期。
      </p>

      <h3>三种弧线场景</h3>
      <table>
        <thead>
          <tr>
            <th>弧线类型</th>
            <th>轨迹形状</th>
            <th>帧数</th>
            <th>飞机大战案例</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>抛物线</strong></td>
            <td>⌒ 形（先升后降）</td>
            <td>4-5 帧</td>
            <td>碎片飞出、敌机被击飞、道具弹出</td>
          </tr>
          <tr>
            <td><strong>正弦浮动</strong></td>
            <td>∿ 形（上下或左右摇摆）</td>
            <td>3-4 帧循环</td>
            <td>玩家飞机悬停（y ±2px）、Boss 待机晃动</td>
          </tr>
          <tr>
            <td><strong>螺旋／S 形</strong></td>
            <td>盘旋轨迹</td>
            <td>6-8 帧</td>
            <td>追踪导弹、旋转道具、Boss 特殊攻击</td>
          </tr>
        </tbody>
      </table>

      <h3>弧线画法步骤</h3>
      <ol>
        <li>先画起点 A 和终点 B</li>
        <li>在 AB 之间画一条弧线（不是直线）</li>
        <li>在弧线上标出关键帧的位置——不是等分，而是按缓动规律分配</li>
        <li>在每帧位置上画物体</li>
      </ol>
    </ConceptBlock>

    <!-- ============ 挤压与拉伸 ============ -->
    <ConceptBlock icon="🎈" title="挤压与拉伸 —— 用形变传达'力'">
      <p>
        动画 12 原则之首。对像素画来说特别划算——<strong>不需要逐帧重画整个物体</strong>，只改变几行像素的宽高比就能传达受力感：
      </p>

      <h3>基本原理</h3>
      <div class="px-compare">
        <div>
          <p class="px-label">原始（静止）</p>
          <PixelCanvas :grid="squashRest" :scale="12" />
          <p class="px-hex">6×6 方块</p>
        </div>
        <div>
          <p class="px-label">挤压（受力）</p>
          <PixelCanvas :grid="squashSquashed" :scale="12" />
          <p class="px-hex">8×4 压扁</p>
        </div>
        <div>
          <p class="px-label">拉伸（释放）</p>
          <PixelCanvas :grid="squashStretched" :scale="12" />
          <p class="px-hex">4×8 拉长</p>
        </div>
      </div>
      <p class="px-desc">体积不变，形状变。三个状态用 3 帧即可完成一个完整的"受力→释放"过程。</p>

      <h3>三个实战案例</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>挤压帧</th>
            <th>拉伸帧</th>
            <th>总帧数</th>
            <th>单帧时长</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>子弹命中敌机</strong></td>
            <td>1 帧水平压扁（宽 ×1.3, 高 ×0.7）</td>
            <td>1 帧纵向拉长反弹</td>
            <td>3 帧（压→拉→正常）</td>
            <td>50ms / 100ms / 100ms</td>
          </tr>
          <tr>
            <td><strong>道具落地弹跳</strong></td>
            <td>1 帧触地压扁（高 ×0.6）</td>
            <td>1 帧弹起拉长（高 ×1.3）</td>
            <td>2 帧弹跳 + 3 帧上浮</td>
            <td>60ms 挤压 / 80ms 拉伸</td>
          </tr>
          <tr>
            <td><strong>引擎推力骤增</strong></td>
            <td>—</td>
            <td>火焰纵向拉长 1 帧</td>
            <td>1 帧拉伸 + 恢复正常</td>
            <td>50ms（瞬间）</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>不要过度使用：</strong>挤压拉伸是"强调瞬间受力"的语言——相当于动画里的感叹号。每帧都挤压 = 没有挤压。只在关键事件触发时用：命中、死亡、弹跳、爆炸。
      </div>
    </ConceptBlock>

    <!-- ============ 次级运动 ============ -->
    <ConceptBlock icon="🪶" title="次级运动 —— 让物体'有重量'">
      <p>
        主体运动时，附属物跟随但有<strong>延迟和衰减</strong>。这是区分"新手动画"和"专业动画"的最少成本手段——通常只需多画 1-2 帧：
      </p>

      <h3>引擎火焰滞后演示</h3>
      <p>下面 5 帧展示了飞机（蓝色）上下浮动时，引擎火焰（橙色）始终<strong>慢 1 帧</strong>到达目标位置：</p>
      <div class="px-compare">
        <div v-for="(f, i) in lagFrames" :key="i">
          <p class="px-label">帧 {{ i + 1 }}</p>
          <PixelCanvas :grid="f" :scale="10" />
        </div>
      </div>
      <p class="px-desc">
        帧 1：静止 → 帧 2：飞机上移，火焰停在原位 → 帧 3：火焰追上 → 帧 4：飞机回落，火焰还在上面 →
        帧 5：火焰惯性下冲超过飞机。火焰始终比机身慢一步 → <strong>"有惯性、有重量"</strong>
      </p>

      <h3>四种次级运动场景</h3>
      <table>
        <thead>
          <tr>
            <th>主体</th>
            <th>附属物</th>
            <th>延迟量</th>
            <th>效果</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>飞机机身</td>
            <td>引擎火焰</td>
            <td>滞后 1 帧</td>
            <td>火焰不是钉死在机身上——飞机上移时火焰先留在原位 1 帧再跟上</td>
          </tr>
          <tr>
            <td>敌机身体</td>
            <td>翅膀／触角</td>
            <td>独立循环</td>
            <td>翅膀扇动帧数 ≠ 身体移动帧数，各跑各的</td>
          </tr>
          <tr>
            <td>爆炸中心</td>
            <td>外围碎片</td>
            <td>大块先飞、小块后飞</td>
            <td>帧 1-3：中心火光 + 大碎片；帧 4-6：小块碎片继续飞远 + 烟尘</td>
          </tr>
          <tr>
            <td>道具主体</td>
            <td>周围光晕</td>
            <td>光晕缩放滞后 1 帧</td>
            <td>道具上下浮动，光晕跟着放大缩小但慢半拍</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>实现技巧：</strong>在 Aseprite 中，把引擎火焰画在<strong>单独图层</strong>上。动画时，机身图层移动 1 帧后，火焰图层再跟进。导出时合并图层。这样做比逐帧手算火焰位置省心得多。
      </div>
    </ConceptBlock>

    <!-- ============ 逐帧 vs 代码 ============ -->
    <ConceptBlock icon="🧠" title="逐帧画 vs 代码做 —— 分工原则">
      <p>这是像素动画最容易浪费时间的陷阱——<strong>把应该在 Cocos 里用代码做的运动，硬是逐帧画了出来</strong>：</p>

      <table>
        <thead>
          <tr>
            <th>判断标准</th>
            <th>逐帧画（Aseprite）</th>
            <th>代码做（Cocos tween）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>形状变化</strong></td>
            <td>✅ 火焰跳动、爆炸膨胀、受击压扁</td>
            <td>❌ 代码改变不了像素形状</td>
          </tr>
          <tr>
            <td><strong>颜色变化</strong></td>
            <td>✅ 闪光、变色、褪色</td>
            <td>⚠️ 可以 tween Sprite.color，但效果粗糙</td>
          </tr>
          <tr>
            <td><strong>位置移动</strong></td>
            <td>⚠️ 小幅浮动（±3px）可以</td>
            <td>✅ 角色移动、敌机飞行、道具掉落</td>
          </tr>
          <tr>
            <td><strong>旋转</strong></td>
            <td>❌ 逐帧旋转工作量巨大</td>
            <td>✅ node.angle = tween</td>
          </tr>
          <tr>
            <td><strong>缩放</strong></td>
            <td>⚠️ 像素缩放会变模糊</td>
            <td>✅ node.scale = tween（保持清晰）</td>
          </tr>
          <tr>
            <td><strong>透明度</strong></td>
            <td>❌ 逐帧画淡出效率极低</td>
            <td>✅ UIOpacity / Sprite.color.a = tween</td>
          </tr>
        </tbody>
      </table>

      <h3>常见组合策略</h3>
      <pre><code>敌机死亡 = 爆炸帧动画（逐帧） + 碎片飞出（代码 tween） + 屏幕震动（代码 tween）

道具拾取 = 道具缩小消失（代码 scale tween） + 光效闪烁（逐帧 2-3 帧）

玩家受击 = 闪烁 3 帧（逐帧颜色变化） + 后退位移（代码 position tween）

Boss 登场 = 从屏幕外飘入（代码 move tween） + 引擎火焰渐亮（逐帧循环）</code></pre>

      <div class="warn-box">
        <strong>不要在 Aseprite 里逐帧画"敌机从屏幕上方飞到下方"：</strong>一整条飞行路径逐帧画下来需要几十帧，而在 Cocos 里一个
        <code>cc.tween(node).to(2, &#123; y: -500 &#125;).start()</code>
        就搞定了。逐帧画的是<strong>原地发生的形状变化</strong>，代码做的是<strong>节点在空间中的位置变化</strong>。
      </div>
    </ConceptBlock>

    <!-- ============ 帧数设计速查表 ============ -->
    <ConceptBlock icon="⏱️" title="帧数设计速查表 —— 及格与流畅的量化标准">
      <p>
        像素动画帧数不以"越多越好"为标准。核心公式：<strong>帧数 × 单帧时长 = 动画节奏感</strong>。游戏通常在 60fps 运行，帧动画的每帧在屏幕上停留 N 个游戏帧：
      </p>

      <h3>射击与命中（极其简短）</h3>
      <table>
        <thead>
          <tr>
            <th>动作</th>
            <th>及格</th>
            <th>流畅</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>玩家子弹（小光点）</td>
            <td><strong>2 帧</strong></td>
            <td>3-4 帧</td>
            <td>2 帧交替=经典 STG 闪烁弹</td>
          </tr>
          <tr>
            <td>激光束</td>
            <td><strong>1-2 帧</strong></td>
            <td>3 帧</td>
            <td>激光是瞬间的，多了反而"软"</td>
          </tr>
          <tr>
            <td>敌机子弹</td>
            <td><strong>2 帧</strong></td>
            <td>3-4 帧</td>
            <td>同玩家子弹</td>
          </tr>
          <tr>
            <td>子弹命中闪光</td>
            <td><strong>2-3 帧</strong></td>
            <td>4-5 帧</td>
            <td>超 5 帧→"命中感"变弱</td>
          </tr>
          <tr>
            <td>受击闪烁</td>
            <td><strong>2 帧</strong></td>
            <td>3-4 帧</td>
            <td>正常↔白色，2 帧够用</td>
          </tr>
        </tbody>
      </table>

      <h3>引擎火焰（短循环）</h3>
      <table>
        <thead>
          <tr>
            <th>动作</th>
            <th>及格</th>
            <th>流畅</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>小飞机引擎（稳定推力）</td>
            <td><strong>3-4 帧</strong></td>
            <td>6-8 帧</td>
            <td>3 帧极限：大→中→小→中循环</td>
          </tr>
          <tr>
            <td>大飞机/Boss 引擎</td>
            <td><strong>4-6 帧</strong></td>
            <td>8-12 帧</td>
            <td>火焰更大，帧少了重复感太强</td>
          </tr>
          <tr>
            <td>推进器蓄力</td>
            <td><strong>4 帧</strong></td>
            <td>6-8 帧</td>
            <td>从小到大渐进，间距先密后疏</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>引擎 3 帧为什么不卡：</strong>火焰是湍流、天然不规则。肉眼接受火焰的"跳跃感"。3 帧只要明暗差大（白→橙→红），看起来是"在燃烧"而非"在卡顿"。
      </div>

      <h3>爆炸（一次性高潮）</h3>
      <table>
        <thead>
          <tr>
            <th>动作</th>
            <th>及格</th>
            <th>流畅</th>
            <th>时间分配建议</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>小型爆炸（敌机）</td>
            <td><strong>4-6 帧</strong></td>
            <td>8-10 帧</td>
            <td>前 1/3 帧=闪光膨胀，后 2/3=消散</td>
          </tr>
          <tr>
            <td>大型爆炸（Boss）</td>
            <td><strong>6-8 帧</strong></td>
            <td>12-16 帧</td>
            <td>闪光→膨胀→碎片→烟尘→消散，每阶段≥1 帧</td>
          </tr>
          <tr>
            <td>全屏炸弹效果</td>
            <td><strong>3-4 帧</strong></td>
            <td>5-6 帧</td>
            <td>白屏闪 1 帧→恢复，多了挡视线</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>爆炸帧不要平均分配！</strong>以 6 帧爆炸为例：帧 1-2 闪光（50ms/帧，快）→ 帧 3-4 火球（80ms/帧）→ 帧 5-6 烟尘（120ms/帧，慢）。前 1/3 帧=70% 视觉冲击力。新手最容易搞反——把 6 帧平均分配，结果像"慢动作烟花"。
      </div>

      <h3>道具与 UI 反馈</h3>
      <table>
        <thead>
          <tr>
            <th>动作</th>
            <th>及格</th>
            <th>流畅</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>道具待拾取闪烁</td>
            <td><strong>2 帧</strong></td>
            <td>3-4 帧</td>
            <td>明暗交替，带轻微颜色变化</td>
          </tr>
          <tr>
            <td>道具拾取消失</td>
            <td><strong>3-4 帧</strong></td>
            <td>5-6 帧</td>
            <td>缩小+上浮+淡出同时进行</td>
          </tr>
          <tr>
            <td>得分弹出（+100）</td>
            <td><strong>3 帧</strong></td>
            <td>5-6 帧</td>
            <td>出现→上浮→消失，总时长 100-200ms</td>
          </tr>
          <tr>
            <td>按钮 hover 反馈</td>
            <td><strong>2 帧</strong></td>
            <td>3 帧</td>
            <td>变色或微放大</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>道具动画金句：</strong>存在感要低。太快玩家看不见（白做），太慢挡住操作（烦人）。100-200ms 是最佳窗口。
      </div>

      <h3>背景与环境</h3>
      <table>
        <thead>
          <tr>
            <th>动作</th>
            <th>及格</th>
            <th>流畅</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>星空闪烁</td>
            <td><strong>2-3 帧</strong></td>
            <td>4-5 帧</td>
            <td>随机亮灭数颗星，错开帧位</td>
          </tr>
          <tr>
            <td>云层飘动</td>
            <td><strong>不逐帧画</strong></td>
            <td>—</td>
            <td>两张云图+代码平移循环</td>
          </tr>
          <tr>
            <td>UI 边框呼吸</td>
            <td><strong>2 帧</strong></td>
            <td>3-4 帧</td>
            <td>交替明暗</td>
          </tr>
        </tbody>
      </table>
    </ConceptBlock>

    <!-- ============ 飞机大战总表 ============ -->
    <ConceptBlock icon="🚀" title="飞机大战动作帧数总表">
      <p>把你游戏中每个需要动画的物体一一对号入座：</p>

      <table>
        <thead>
          <tr>
            <th>物体</th>
            <th>运动规律</th>
            <th>推荐帧数</th>
            <th>单帧时长</th>
            <th>实现方式</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>玩家子弹飞行</td>
            <td>匀速直线</td>
            <td>2 帧循环</td>
            <td>80-100ms</td>
            <td>逐帧</td>
          </tr>
          <tr>
            <td>小型引擎火焰</td>
            <td>匀速脉动，明暗交替</td>
            <td>4 帧循环</td>
            <td>100ms</td>
            <td>逐帧（图层独立）</td>
          </tr>
          <tr>
            <td>大型引擎火焰</td>
            <td>多色渐变脉动</td>
            <td>6-8 帧循环</td>
            <td>80-100ms</td>
            <td>逐帧（图层独立）</td>
          </tr>
          <tr>
            <td>小型爆炸</td>
            <td>爆发→膨胀→消散</td>
            <td>6 帧一次性</td>
            <td>50/50/80/80/120/120ms</td>
            <td>逐帧</td>
          </tr>
          <tr>
            <td>大型爆炸</td>
            <td>闪光→膨胀→碎片→烟尘→消散</td>
            <td>8-12 帧一次性</td>
            <td>阶段式不均分</td>
            <td>逐帧 + 碎片代码飞出</td>
          </tr>
          <tr>
            <td>命中闪光</td>
            <td>骤亮→速灭</td>
            <td>3 帧一次性</td>
            <td>50/80/100ms</td>
            <td>逐帧</td>
          </tr>
          <tr>
            <td>玩家飞机悬停</td>
            <td>正弦缓动（y ±2px）</td>
            <td>4 帧循环</td>
            <td>120ms</td>
            <td>逐帧 or 代码 tween</td>
          </tr>
          <tr>
            <td>玩家飞机移动</td>
            <td>匀速（跟手）</td>
            <td>—</td>
            <td>—</td>
            <td>代码 position update</td>
          </tr>
          <tr>
            <td>敌机入场</td>
            <td>缓入（慢→快）</td>
            <td>—</td>
            <td>—</td>
            <td>代码 tween</td>
          </tr>
          <tr>
            <td>敌机子弹飞行</td>
            <td>匀速直线</td>
            <td>2 帧循环</td>
            <td>100ms</td>
            <td>逐帧</td>
          </tr>
          <tr>
            <td>受击闪烁</td>
            <td>正常↔白色交替</td>
            <td>2 帧重复 3 次</td>
            <td>80ms</td>
            <td>代码 Sprite.color tween</td>
          </tr>
          <tr>
            <td>受击后退</td>
            <td>缓入（快→慢停）</td>
            <td>—</td>
            <td>—</td>
            <td>代码 position tween</td>
          </tr>
          <tr>
            <td>道具待拾取闪烁</td>
            <td>明暗循环</td>
            <td>2-3 帧循环</td>
            <td>150ms</td>
            <td>逐帧</td>
          </tr>
          <tr>
            <td>道具拾取消失</td>
            <td>缩小+上浮同时</td>
            <td>—</td>
            <td>—</td>
            <td>代码 scale + position tween</td>
          </tr>
          <tr>
            <td>道具掉落</td>
            <td>缓入（重力加速）</td>
            <td>—</td>
            <td>—</td>
            <td>代码 tween + 落地弹跳逐帧 2 帧</td>
          </tr>
          <tr>
            <td>屏幕震动</td>
            <td>左右高频抖动</td>
            <td>—</td>
            <td>—</td>
            <td>代码 camera position tween</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>使用方式：</strong>开发时对照此表——每个新动作先看"实现方式"列，决定在 Aseprite 画还是在 Cocos
        写。弄混了就是双倍工作量。
      </div>
    </ConceptBlock>

    <!-- ============ 动手练习 ============ -->
    <ConceptBlock icon="🔨" title="动手练习：给你的素材加上运动">
      <ol>
        <li>打开 Phase 3 绘制的玩家飞机，画一个 4 帧悬停浮动动画（y ±2px，缓入缓出）</li>
        <li>打开引擎火焰，扩到 6 帧（原 4 帧），加 1 帧"推力骤增拉伸"</li>
        <li>打开爆炸动画，调整每帧的持续时间——前 2 帧 50ms，中间 2 帧 80ms，最后 2 帧 120ms</li>
        <li>设计敌机死亡时的组合效果：爆炸逐帧（6 帧） + 碎片飞出（代码） + 受击闪烁（代码）</li>
        <li>对照帧数总表，检查是否有动作帧数过多或过少</li>
      </ol>

      <div class="tip-box">
        <strong>完成标准：</strong>每个动画的帧数和节奏都有明确的理由，不是"随便画的"。能在帧数总表中找到每个动作的对应行，并说出为什么选了"及格"还是"流畅"档位。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ul>
        <li>缓入、缓出、缓入缓出分别适用于什么运动？给每种举一个飞机大战的例子。</li>
        <li>帧间距均匀 vs 帧间距不均匀，在 Aseprite 中如何实现？</li>
        <li>爆炸动画前 1/3 帧和后 2/3 帧的时间分配有什么不同？为什么？</li>
        <li>哪些动作应当在 Aseprite 中逐帧画？哪些应当在 Cocos 中用代码 tween？判断标准是什么？</li>
        <li>引擎火焰为什么 3-4 帧就不算卡？子弹命中为什么超过 5 帧反而变差？</li>
        <li>挤压与拉伸的"挤压帧"和"拉伸帧"各占多长时间？为什么不能每帧都用？</li>
        <li>次级运动中，引擎火焰滞后飞机移动多少帧？在 Aseprite 中怎么通过图层实现？</li>
        <li>帧数选择的三个原则是什么？用自己的话写下来。</li>
      </ul>
    </ConceptBlock>
  </ArtPhaseLayout>
</template>
