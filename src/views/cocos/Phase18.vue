<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="18" title="性能优化实战" duration="2-3 天">
    <ConceptBlock icon="🧭" title="本节定位">
      <p>编辑器里跑 60fps ≠ 真机上跑 60fps。这一节讲游戏性能优化的三个核心方向——DrawCall、纹理、脚本——以及如何用工具找到瓶颈。</p>
    </ConceptBlock>

    <ConceptBlock icon="📊" title="三大优化方向">
      <table>
        <thead><tr><th>方向</th><th>问题</th><th>工具</th><th>目标</th></tr></thead>
        <tbody>
          <tr><td>DrawCall</td><td>每帧 CPU→GPU 通信次数</td><td>Cocos Profiler / Chrome DevTools</td><td>&lt; 50（移动端）</td></tr>
          <tr><td>纹理内存</td><td>GPU 显存占用</td><td>Cocos 构建面板</td><td>&lt; 200MB（移动端）</td></tr>
          <tr><td>脚本 CPU</td><td>update 中的 JS 耗时</td><td>Chrome Performance 面板</td><td>单帧 JS &lt; 5ms</td></tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="🗜️" title="纹理压缩">
      <pre>// 未压缩：1024×1024 RGBA = 4MB
// ETC2：≈ 1MB（Android）
// ASTC 6×6：≈ 0.5MB（iOS A8+）
// 建议：Cocos 构建时同时勾选 ETC2 和 ASTC，运行时自动选择</pre>
    </ConceptBlock>

    <ConceptBlock icon="⚡" title="脚本性能 Tips">
      <ul>
        <li>减少 update 中的 <code>getComponent()</code> 调用——在 start 中缓存引用</li>
        <li>避免在 update 中创建新对象（new Vec3、字符串拼接）——触发 GC</li>
        <li>用对象池替代 instantiate/destroy</li>
        <li>不需要每帧更新的逻辑用 <code>schedule(callback, interval)</code> 替代</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>移动端 GPU 的 Tile-Based Rendering：</strong> 手机 GPU（Mali、Adreno、Apple GPU）和桌面 GPU 的架构不同。移动端用 TBR（Tile-Based Rendering）——把屏幕切成小块逐块渲染，节省带宽。这解释了为什么粒子特效在手机上比桌面上更贵——每个粒子跨越的 Tile 越多，GPU 工作量越大。</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：三步骤性能优化实战">
      <p>打开你的游戏，按照下面三个步骤逐一排查和优化。每一步都记录优化前后的数据，感受"数字说话"的力量。</p>
      <p><strong>第 1 步：消除 update() 中的不必要分配</strong></p>
      <pre>// 【优化前】update 中每帧创建新对象 —— 每帧 = 一次 GC 压力
update(dt: number) {
  const pos = new Vec3()                    // ❌ 每帧 new
  this.node.getPosition(pos)
  const dir = new Vec3(0, -1, 0)            // ❌ 每帧 new
  Vec3.scaleAndAdd(pos, pos, dir, this.speed * dt)
  this.node.setPosition(pos)
}

// 【优化后】复用对象，只在初始化时分配一次
private _tempPos = new Vec3()
private _dir = new Vec3(0, -1, 0)

update(dt: number) {
  this.node.getPosition(this._tempPos)
  Vec3.scaleAndAdd(this._tempPos, this._tempPos, this._dir, this.speed * dt)
  this.node.setPosition(this._tempPos)
}</pre>
      <p><strong>记录：</strong> 打开 Chrome DevTools → Performance 标签 → 录制 10 秒游戏运行 → 对比优化前后的 JS Heap 曲线。优化后曲线应该更平滑，没有频繁的锯齿状波动（锯齿 = GC 触发）。</p>
      <p><strong>第 2 步：减少 DrawCall——使用 Cocos 内置 Profiler</strong></p>
      <pre>// 打开 Cocos Creator → 运行游戏 → 左下角点击 Profiler 按钮
// 观察 DrawCall 数量。目标：移动端 &lt; 50

// 常见优化手段：
// 1. 把同一纹理的 Sprite 放在同一个父节点下 → 自动合批（Auto Batching）
// 2. 使用 Sprite Atlas（图集）—— 多张图打包到一张纹理，大幅减少纹理切换
// 3. 减少 Label 数量——每个不同字号的 Label 都是一个 DrawCall
// 4. 关闭不可见物体的渲染：sprite.enabled = false 而不是 node.active = false</pre>
      <p><strong>第 3 步：纹理优化</strong></p>
      <pre>// 检查纹理大小 —— Cocos 编辑器里选中纹理资源 → 属性面板看尺寸
// 问题：某张背景图 2048×2048 RGBA8888 = 16MB！
// 优化：
//   1. 缩小到实际显示尺寸（如果屏幕只有 750×1334，1024×1024 就够了）
//   2. 关闭不需要的 Alpha 通道（RGB888 比 RGBA8888 小 25%）
//   3. 构建发布时勾选纹理压缩：
//      - Android: ETC2 (≈ 1/4 大小)
//      - iOS: ASTC 6×6 (≈ 1/2 大小)
//  总结：2048² 未压缩 16MB → 1024² ETC2 ≈ 1MB，缩小了 16 倍！

// 在构建面板设置：
// 项目设置 → 功能裁剪 → 纹理压缩 → 勾选 ETC2 和 ASTC
// 构建时 Cocos 自动为不同平台生成对应的压缩纹理</pre>
      <p><strong>优化结果记录模板（填你自己的数据）：</strong></p>
      <table>
        <thead><tr><th>指标</th><th>优化前</th><th>优化后</th><th>改善</th></tr></thead>
        <tbody>
          <tr><td>FPS（稳定时）</td><td>___</td><td>___</td><td>___</td></tr>
          <tr><td>DrawCall</td><td>___</td><td>___</td><td>___</td></tr>
          <tr><td>纹理总内存</td><td>___</td><td>___</td><td>___</td></tr>
          <tr><td>单帧 JS 耗时</td><td>___</td><td>___</td><td>___</td></tr>
          <tr><td>GC 频率（次/10s）</td><td>___</td><td>___</td><td>___</td></tr>
        </tbody>
      </table>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>什么原因会导致游戏出现"卡顿"（frame stutter）？GC（垃圾回收）在这个过程中扮演什么角色？为什么在 PC 上流畅、手机上卡顿的游戏通常是 GC 问题？</li>
        <li>为什么移动端和桌面端使用不同的纹理压缩格式？ETC2 为什么只能在 Android 上用，ASTC 为什么只能在较新的 iOS 设备上用？纹理格式的选择是由什么决定的？</li>
        <li>你会用什么工具来分析性能问题？FPS 降到了 30 以下，你应该先看哪个指标（DrawCall？JS CPU？GPU 耗时？纹理内存？），先怀疑哪个方向？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
