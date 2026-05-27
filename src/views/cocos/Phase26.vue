<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="26" title="内存泄漏排查实战" duration="1 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>识别 Cocos 游戏中最常见的<strong>5 种内存泄漏场景</strong></li>
        <li>理解 <code>node.destroy()</code> 和 <code>node.removeFromParent()</code> 的<strong>本质区别</strong></li>
        <li>建立<strong>事件清理检查清单</strong>——systemEvent、node.on、director.on 全部覆盖</li>
        <li>正确处理<strong>定时器清理</strong>：schedule、setInterval、setTimeout</li>
        <li>用 Chrome DevTools Memory 面板<strong>做 Heap Snapshot 对比</strong>，定位泄漏源</li>
        <li>编写 <strong>SafeDestroy</strong> 工具和<strong>自动清理 Mixin</strong> 防止人为遗忘</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="为什么游戏特别容易内存泄漏——前端工程师的直觉理解">
      <p>
        前端 SPA 中的内存泄漏往往来自"忘记 removeEventListener"或"忘记 clearInterval"。
        Cocos 游戏中的泄漏和这<strong>完全一样</strong>——只是事件API名字不同，
        而且你还多了 <strong>node.destroy() 不完备</strong> 和
        <strong>场景切换不清空</strong> 两个游戏专属的坑。
      </p>

      <h3>前端泄漏 vs 游戏泄漏对照</h3>
      <table>
        <thead>
          <tr>
            <th>泄漏根源</th>
            <th>前端（Vue/React）</th>
            <th>游戏（Cocos）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>事件监听</td>
            <td><code>addEventListener</code> 未 <code>removeEventListener</code></td>
            <td><code>node.on()</code> 未 <code>node.off()</code> / <code>systemEvent.on()</code> 未清理</td>
          </tr>
          <tr>
            <td>定时器</td>
            <td><code>setInterval</code> 未 <code>clearInterval</code></td>
            <td><code>this.schedule()</code> 未清理 / <code>setInterval</code> 未清理</td>
          </tr>
          <tr>
            <td>DOM / 节点</td>
            <td><code>v-if</code> 切换后旧 DOM 引用未释放</td>
            <td><code>node.destroy()</code> 后外部仍持有引用</td>
          </tr>
          <tr>
            <td>全局引用</td>
            <td>全局 Store 中存储了组件实例</td>
            <td>单例中缓存了已销毁节点的引用</td>
          </tr>
          <tr>
            <td>场景切换</td>
            <td>路由跳转后旧组件的副作用未清理</td>
            <td><code>director.loadScene()</code> 后旧场景的定时器/监听仍在运行</td>
          </tr>
          <tr>
            <td>闭包</td>
            <td>闭包持有大对象引用</td>
            <td>回调闭包持有 node 引用，阻止 GC</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>关键认知：</strong>游戏内存泄漏的排查思维和前端完全一致。
        如果你会用 Chrome DevTools 的 Memory 面板在前端中找泄漏，
        你就能用同样的工具在 Cocos 游戏中找泄漏。游戏只是多了一个维度——
        场景切换（等价于路由跳转）需要你是额外的警惕。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="💀" title="node.destroy() vs node.removeFromParent()——绝大多数人都搞错">
      <p>
        这是 Cocos 新手最容易犯的错，也是内存泄漏的第一大源头。
      </p>

      <h3>核心区别</h3>
      <table>
        <thead>
          <tr>
            <th>方法</th>
            <th>做了什么</th>
            <th>释放组件？</th>
            <th>释放节点？</th>
            <th>释放事件？</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>node.destroy()</code></td>
            <td><strong>完全销毁</strong>——移除子节点、调用所有组件的 <code>onDestroy()</code>、释放所有引用</td>
            <td>是</td>
            <td>是</td>
            <td>是（触发 onDestroy）</td>
          </tr>
          <tr>
            <td><code>node.removeFromParent()</code></td>
            <td><strong>仅从父节点移除</strong>——节点和组件仍在内存中！</td>
            <td><strong>否！！！</strong></td>
            <td><strong>否！！！</strong></td>
            <td><strong>否！！！</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>实际效果对比</h3>
      <pre><code>// ❌ 错误：只用 removeFromParent——节点还在内存中！
enemyDie(wrongWay: Node) {
  wrongWay.removeFromParent()  // 从场景树移除，但节点和组件仍在内存中
  // 如果在别处还持有这个节点的引用，它永远不会被 GC
}

// ✅ 正确：用 destroy 彻底销毁
enemyDie(correctWay: Node) {
  correctWay.destroy()  // 完全销毁：移除 + 释放组件 + 触发 onDestroy
  // 节点和所有子节点都被销毁
}

// ✅ 配合对象池的正确做法
enemyDieWithPool(enemyNode: Node) {
  enemyNode.removeFromParent()  // 从场景树移除（但不销毁）
  this.enemyPool.put(enemyNode)  // 放回对象池——稍后复用
  // 注意：这里不能用 destroy！destroy 后节点就没了，对象池没法复用
}</code></pre>

      <h3>什么场景下该用哪个？</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>用 <code>destroy()</code></th>
            <th>用 <code>removeFromParent()</code></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>敌人死亡（非对象池）</td>
            <td>是</td>
            <td></td>
          </tr>
          <tr>
            <td>子弹飞出屏幕（非对象池）</td>
            <td>是</td>
            <td></td>
          </tr>
          <tr>
            <td>UI 弹窗关闭</td>
            <td>是（如果不再需要）</td>
            <td></td>
          </tr>
          <tr>
            <td>对象池回收</td>
            <td></td>
            <td>是（只移除，保留复用）</td>
          </tr>
          <tr>
            <td>场景切换临时隐藏</td>
            <td></td>
            <td>是（addChild 即可恢复）</td>
          </tr>
        </tbody>
      </table>

      <div class="warn-box">
        <strong>最最常见的泄漏：</strong>用 <code>removeFromParent()</code> 来代替
        <code>destroy()</code>。你以为节点"删了"，实际上它还在内存里，带着它的
        组件、事件监听、定时器一起活着。每波敌人都这样"移除"一波，5 分钟后
        内存里积压了几百个僵尸节点。这就是为什么有些游戏玩 5 分钟就卡——每帧都在
        update 这些本该死掉的僵尸。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎧" title="事件清理检查清单">
      <p>
        每一种事件监听都需要在适当时机取消。下面是一份完整的检查清单
        （也是你可以放到 Code Review 中的 checklist）。
      </p>

      <h3>系统事件清理</h3>
      <pre><code>// ✅ 正确的系统事件清理
import { _decorator, Component, systemEvent, SystemEventType } from 'cc'
const { ccclass } = _decorator

@ccclass('InputHandler')
export class InputHandler extends Component {
  onLoad() {
    // 注册系统级事件
    systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this)
    systemEvent.on(SystemEventType.KEY_UP, this.onKeyUp, this)
    systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this)
  }

  onDestroy() {
    // 🔑 关键：必须在 onDestroy 中清理！
    systemEvent.off(SystemEventType.KEY_DOWN, this.onKeyDown, this)
    systemEvent.off(SystemEventType.KEY_UP, this.onKeyUp, this)
    systemEvent.off(SystemEventType.TOUCH_START, this.onTouchStart, this)
  }

  onKeyDown(event: any) { /* ... */ }
  onKeyUp(event: any) { /* ... */ }
  onTouchStart(event: any) { /* ... */ }
}</code></pre>

      <h3>节点事件清理</h3>
      <pre><code>// node.on / node.off 配对
export class BulletComponent extends Component {
  start() {
    this.node.on('explode', this.onExplode, this)
    this.node.on(Node.EventType.POSITION_CHANGED, this.onPosChanged, this)
  }

  onDestroy() {
    // 清理当前节点上的事件
    this.node.off('explode', this.onExplode, this)
    this.node.off(Node.EventType.POSITION_CHANGED, this.onPosChanged, this)
  }

  onExplode() { /* ... */ }
  onPosChanged() { /* ... */ }
}</code></pre>

      <h3>全局事件总线清理</h3>
      <pre><code>// 如果项目中有自定义 EventBus（见 Phase6），也必须在 onDestroy 中清理
export class GameUI extends Component {
  onLoad() {
    EventBus.on('score-changed', this.onScoreChanged, this)
    EventBus.on('game-over', this.onGameOver, this)
  }

  onDestroy() {
    EventBus.off('score-changed', this.onScoreChanged, this)
    EventBus.off('game-over', this.onGameOver, this)
  }

  onScoreChanged(score: number) { /* ... */ }
  onGameOver() { /* ... */ }
}</code></pre>

      <h3>director 事件的清理</h3>
      <pre><code>export class SceneWatcher extends Component {
  onLoad() {
    director.on(Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLoaded, this)
  }

  onDestroy() {
    director.off(Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLoaded, this)
  }

  onSceneLoaded() { /* ... */ }
}</code></pre>

      <div class="warn-box">
        <strong>最重要的一条：</strong>如果你在 <code>componentA</code> 中监听
        <code>otherNodeB.on('xxx', callback, componentA)</code>，
        那么 <code>componentA.onDestroy()</code> 中不需要手动 <code>off</code>——
        Cocos 引擎会<strong>自动</strong>清理以 componentA 为 target 的节点事件。
        但 <strong>systemEvent</strong> 和 <strong>director</strong> 的事件不会自动清理！
        这是最容易忽略的泄漏源。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⏲️" title="定时器清理——被遗忘的schedule">
      <p>
        定时器是内存泄漏的第二大源头。无论是 Cocos 自带的 <code>schedule</code> 系列，
        还是原生的 <code>setInterval</code> / <code>setTimeout</code>，在组件销毁时
        如果还在运行，就会导致整个闭包引用的对象无法被 GC 回收。
      </p>

      <h3>schedule 清理</h3>
      <pre><code>export class EnemySpawner extends Component {
  private _spawnTimerId: number = -1

  start() {
    // schedule(callback, interval, repeat, delay)
    // 每个 schedule 都返回一个 timer ID，用于取消
    this._spawnTimerId = this.schedule(
      () => this.spawnEnemy(),
      2,        // 每 2 秒
      Infinity,  // 重复无限次
      0,         // 无延迟
    )
  }

  onDestroy() {
    // 🔑 停止所有 schedule
    if (this._spawnTimerId !== -1) {
      this.unschedule(this._spawnTimerId)
    }
    // 或一键取消该组件注册的所有 schedule
    // this.unscheduleAllCallbacks()
  }

  spawnEnemy() { /* ... */ }
}</code></pre>

      <h3>setInterval / setTimeout 清理</h3>
      <pre><code>export class TimerExample extends Component {
  private _intervalId: number = -1
  private _timeoutId: number = -1

  start() {
    // setInterval
    this._intervalId = setInterval(() => {
      this.updateHUD()
    }, 1000)

    // setTimeout
    this._timeoutId = setTimeout(() => {
      this.lateInit()
    }, 5000)
  }

  onDestroy() {
    // 🔑 必须清理！
    if (this._intervalId !== -1) {
      clearInterval(this._intervalId)
      this._intervalId = -1
    }
    if (this._timeoutId !== -1) {
      clearTimeout(this._timeoutId)
      this._timeoutId = -1
    }
  }

  updateHUD() { /* ... */ }
  lateInit() { /* ... */ }
}</code></pre>

      <h3>this.scheduleOnce 要不要清理？</h3>
      <pre><code>// scheduleOnce 在 onDestroy 时会自动取消——引擎会帮你清理
this.scheduleOnce(() => {
  // 如果组件在 3 秒内被 destroy 了，这里的代码永远不会执行
  this.doSomething()
}, 3)   // ✅ 安全：引擎自动取消

// 但如果是 setTimeout ——引擎不会管！
setTimeout(() => {
  this.doSomething()  // ❌ 危险：组件销毁后仍可能执行，this 已无效
}, 3000)</code></pre>

      <div class="tip-box">
        <strong>最佳实践：</strong>在 Cocos 项目中，<strong>只使用 <code>this.schedule</code> 系列</strong>，
        不要用原生 <code>setInterval</code> / <code>setTimeout</code>。<code>schedule</code> 是引擎管理的——
        <code>onDestroy</code> 时自动取消，不需要手动清理。如果你确实需要原生定时器，
        必须在 <code>onDestroy</code> 中手动 <code>clearInterval</code> / <code>clearTimeout</code>。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔬" title="用 Chrome DevTools 排查内存泄漏">
      <p>
        Chrome DevTools 的 Memory 面板是排查内存泄漏最强大的工具。
        步骤就是前端性能分析的标准流程——只是分析对象从 DOM 节点变成了 Cocos 节点。
      </p>

      <h3>四步排查法</h3>
      <pre><code>第一步：建立基准 Snapshot
  1. 打开 Chrome DevTools → Memory 页签
  2. 游戏刚启动，打开 Menu 场景
  3. 点击"Take heap snapshot" → Snapshot 1（基准）

第二步：产生负载
  4. 进入游戏场景 → 玩 3 波敌人 → 回到 Menu 场景
  5. 再进游戏场景 → 玩 3 波 → 回 Menu
  6. 反复 5 次（制造明显的泄漏曲线）

第三步：对比 Snapshot
  7. 回到 Menu 场景后，再拍 Snapshot 2
  8. 在 Snapshot 2 上选择"Comparison"视图
  9. 选择对比基准 Snapshot 1
  10. 按 "Delta"（增量）排序

第四步：定位泄漏源
  11. 找到数量异常增长的类（如 BulletComponent 本应 0 个却剩 50 个）
  12. 展开该对象 → 查看 "Retainers"（谁在引用它）
  13. 沿着引用链往上找，找到阻止 GC 的根引用
  14. 在那个根引用处添加清理逻辑</code></pre>

      <h3>典型泄漏的 Retainer 特征</h3>
      <table>
        <thead>
          <tr>
            <th>泄漏类型</th>
            <th>Retainer 链特征</th>
            <th>修复位置</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>事件未清理</td>
            <td><code>node → _eventTarget → _bubblingListeners → [callback] → 旧组件</code></td>
            <td>在 <code>onDestroy</code> 中 <code>node.off()</code></td>
          </tr>
          <tr>
            <td>schedule 未清理</td>
            <td><code>component → _scheduler → _timer → [callback]</code></td>
            <td>在 <code>onDestroy</code> 中 <code>unscheduleAllCallbacks()</code></td>
          </tr>
          <tr>
            <td>全局单例引用</td>
            <td><code>GameManager.instance → _enemies → [Node array]</code></td>
            <td>在节点 destroy 时从数组中移除</td>
          </tr>
          <tr>
            <td>闭包引用</td>
            <td><code>闭包 → [captured: node] → component</code></td>
            <td>将闭包封装为方法，在 onDestroy 中置 null</td>
          </tr>
          <tr>
            <td>removeFromParent</td>
            <td><code>Window → GC roots → Detached Node tree</code></td>
            <td>将 <code>removeFromParent</code> 改为 <code>destroy</code></td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>前端类比：</strong>这和调试 Vue SPA 内存泄漏的步骤完全一样——
        也是 Snapshot → 操作 → Snapshot → Comparison → Retainers。
        只是 Vue 中看到的泄漏对象是 VueComponent、Watcher、Dep，
        而 Cocos 中看到的是 Component、Node、Scheduler。工具和方法论完全通用。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🛡️" title="SafeDestroy 工具与自动清理模式">
      <p>
        依赖人工检查每个组件的 <code>onDestroy</code> 容易遗漏。更好的方案是
        <strong>工具化</strong>——让销毁流程自动处理好清理工作。
      </p>

      <h3>SafeDestroy 工具</h3>
      <pre><code>// SafeDestroy.ts —— 安全的节点销毁工具
import { Node, Component } from 'cc'

export class SafeDestroy {
  /**
   * 安全销毁节点——先遍历清理，再 destroy
   */
  static node(target: Node): void {
    if (!target || !target.isValid) return

    // 1. 先递归清理所有子组件的事件和定时器
    SafeDestroy.cleanupSubtree(target)

    // 2. 再销毁节点
    target.destroy()
  }

  /**
   * 递归清理节点的所有子组件
   */
  private static cleanupSubtree(node: Node): void {
    // 清理当前节点的所有组件
    const components = node.getComponents(Component)
    for (const comp of components) {
      if (!comp.isValid) continue

      // 清理 schedule
      if ((comp as any).unscheduleAllCallbacks) {
        (comp as any).unscheduleAllCallbacks()
      }

      // 清理 systemEvent
      // （systemEvent 无法以组件为单位批量清理，需要在组件自身 onDestroy 中处理）
    }

    // 递归清理子节点
    for (const child of node.children) {
      SafeDestroy.cleanupSubtree(child)
    }
  }
}</code></pre>

      <h3>自动清理 Mixin 模式</h3>
      <pre><code>// AutoCleanup.ts —— 自动跟踪和清理资源的 Mixin
type CleanupFn = () => void

export function AutoCleanup&lt;T extends new (...args: any[]) =&gt; Component&gt;(Base: T) {
  return class extends Base {
    private __cleanupFns: CleanupFn[] = []

    /**
     * 注册一个清理函数——在 onDestroy 时自动调用
     * 用法：this.autoCleanup(() => systemEvent.off(...))
     */
    protected autoCleanup(fn: CleanupFn): void {
      this.__cleanupFns.push(fn)
    }

    /**
     * 注册一个 Cocos 事件监听——自动配对的 on/off
     */
    protected onAuto(
      target: any,
      event: string,
      callback: Function,
      thisArg?: any,
    ): void {
      target.on(event, callback, thisArg)
      this.autoCleanup(() => target.off(event, callback, thisArg))
    }

    onDestroy() {
      // 先执行所有注册的清理函数
      for (const fn of this.__cleanupFns) {
        try { fn() } catch (e) { console.warn('[AutoCleanup] 清理函数出错:', e) }
      }
      this.__cleanupFns = []

      // 调用原始类的 onDestroy（如果有的话）
      if (super.onDestroy) {
        super.onDestroy()
      }
    }
  }
}

// ===== 使用示例 =====
// const MyComp = AutoCleanup(Component)
// @ccclass('MyComp')
// export class MyComp extends AutoCleanup(Component) {
//   onLoad() {
//     // 自动配对的 systemEvent 监听——onDestroy 时自动 off
//     this.onAuto(systemEvent, SystemEventType.KEY_DOWN, this.onKeyDown, this)
//   }
//   onKeyDown() {}
// }</code></pre>

      <h3>onDestroy 检查清单模板</h3>
      <pre><code>// 每个 Component 的 onDestroy 检查清单（Code Review 用）
onDestroy() {
  // □ systemEvent.off —— 系统事件
  // □ director.off —— 全局导演事件
  // □ EventBus.off —— 全局事件总线
  // □ node.off —— 节点事件（非本节点 target）
  // □ this.unscheduleAllCallbacks() —— Cocos 定时器
  // □ clearInterval / clearTimeout —— 原生定时器
  // □ 从全局单例 / 数组中移除自身引用
  // □ 取消未完成的 assetManager 加载请求
  // □ 释放手动创建的资源（audioClip?.decRef(), texture?.decRef()）
}</code></pre>

      <div class="warn-box">
        <strong>容错处理：</strong>在 onDestroy 的清理代码中，<strong>不要假设其他对象仍然存在</strong>。
        比如你持有 <code>eventBus</code> 的引用，但在 onDestroy 时 eventBus 可能已经
        被销毁了。用 <strong>防御式编程</strong>：加 try-catch 或者判空。
        这和 Vue 的 <code>onUnmounted</code> 一样——你不能假设 store 还活着。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 我已经调了 node.destroy()，但 Memory 面板中还是显示泄漏？</h3>
      <p>
        <code>node.destroy()</code> 只管 Cocos 内部的资源释放，但如果有<strong>外部引用</strong>
        （全局变量、闭包、数组等）仍然持有该节点的引用，那么 GC 就不会回收它。
        排查方法：在 Comparison Snapshot 中搜索该 node 的类型名，找到后查看 Retainers，
        看是什么在"拽着"它不放。这和前端排查 Vue 组件泄漏的步骤完全一样。
      </p>

      <h3>Q2: 每次场景切换后内存涨一点，这是泄漏吗？</h3>
      <p>
        不一定——可能是正常的资源缓存。但如果每次涨的量越来越大（加速增长），那就是泄漏。
        判断方法：在 Snapshot 2 和 Snapshot 3 之间比较增量（切换场景 2 次 vs 切换 10 次）。
        如果 10 次切换的内存增量 &gt; 2 次切换的增量的 5 倍（而不是线性的 5 倍），
        就是泄漏。线性增长可能是缓存积累——检查 assetManager 的缓存策略。
      </p>

      <h3>Q3: 对象池回收用 removeFromParent，后来又不需要 pool 了，怎么清理？</h3>
      <p>
        对象池应该有 <code>pool.clear()</code> 方法，内部对池中所有节点都调用
        <code>node.destroy()</code>。在场景切换或游戏退出时，调用
        <code>pool.clear()</code> 彻底释放池中资源。
      </p>

      <h3>Q4: 微信小游戏的真机上能排查内存泄漏吗？</h3>
      <p>
        微信开发者工具的 Performance 面板提供内存监控，但不提供 Heap Snapshot。
        最可靠的方法是在 <strong>本地浏览器预览模式下排查</strong>（Cocos 编辑器预览），
        用 Chrome DevTools 的完整 Memory 面板。因为 Cocos 项目在浏览器和微信小游戏中的
        内存行为几乎一致——浏览器中排查出来的泄漏，在小游戏上一般也同样存在。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li><code>node.destroy()</code> 和 <code>node.removeFromParent()</code> 的本质区别是什么？各适用于什么场景？</li>
        <li>为什么 <code>systemEvent.on()</code> 不能在 <code>onDestroy</code> 时自动清理？</li>
        <li>事件清理检查清单包含哪几类事件？</li>
        <li>为什么在 Cocos 中应该用 <code>this.schedule()</code> 而不是原生 <code>setInterval</code>？</li>
        <li>如何用 Chrome Memory 面板做 Heap Snapshot 对比来定位泄漏源？Retainers 怎么看？</li>
        <li>SafeDestroy 工具的核心职责是什么？它解决什么问题？</li>
        <li>自动清理 Mixin 模式如何减少人工遗忘的清理逻辑？</li>
        <li>对象池中的节点，应该用 destroy 还是 removeFromParent？为什么？</li>
        <li>场景切换后内存线性增长是泄漏吗？如何判断？</li>
        <li>onDestroy 中的清理代码，为什么需要防御式编程（try-catch / 判空）？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
