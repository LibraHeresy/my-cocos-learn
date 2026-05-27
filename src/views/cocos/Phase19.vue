<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="19" title="Tilemap 关卡编辑" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>用 <strong>Tiled 编辑器</strong>可视化绘制游戏关卡——告别"代码手摆方块"的噩梦</li>
        <li>理解 Tilemap 的核心概念：<strong>图块集（Tileset）、图层（Layer）、对象层（Object Layer）</strong></li>
        <li>将 <code>.tmx</code> 地图文件导入 Cocos，通过 <strong>TiledMap 组件</strong>渲染</li>
        <li>给图块添加<strong>碰撞属性</strong>——玩家自动与墙壁/地面碰撞，无需手写碰撞检测</li>
        <li>在运行时<strong>动态更换图块</strong>——开关门、可破坏墙壁、环境变化</li>
        <li>理解 Tilemap 的<strong>批处理渲染</strong>——为什么 10000 块地图砖也能跑 60fps</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🗺️" title="Tilemap 是什么——每个经典 2D 游戏背后的技术">
      <p>
        Tilemap（瓦片地图）是 2D 游戏关卡设计的基础技术。从超级马里奥到星露谷物语，所有看起来像"网格排列"的关卡都是 Tilemap。它的核心思想很简单：把世界切成一格一格的<strong>瓷砖（Tile）</strong>，每格放一张图片，拼在一起就构成了整个关卡。
      </p>

      <h3>前端类比</h3>
      <p>
        Tilemap 本质上就是前端的 <strong>CSS Grid</strong>——你有一个 M x N 的网格，每个格子（Cell）放一个背景图。区别在于：
      </p>
      <table>
        <thead>
          <tr>
            <th>概念</th>
            <th>CSS Grid</th>
            <th>Tilemap</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>网格定义</td>
            <td><code>grid-template-columns: repeat(100, 32px)</code></td>
            <td>Tiled 编辑器中设定地图宽高（以 tile 为单位）</td>
          </tr>
          <tr>
            <td>每个格子</td>
            <td><code>background-image: url(tile-42.png)</code></td>
            <td>存储 GID（全局图块 ID）——一个数字代表一张图</td>
          </tr>
          <tr>
            <td>图层概念</td>
            <td><code>z-index</code> 叠加</td>
            <td>多个 Layer——地面层、装饰层、碰撞层</td>
          </tr>
          <tr>
            <td>可视化编辑</td>
            <td>Figma / 浏览器 DevTools</td>
            <td>Tiled Map Editor（免费开源）</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>核心价值：</strong>用 Tilemap 设计关卡，就像用 Figma 画界面——可视化、所见即所得、零代码。关卡策划（或你自己）在 Tiled 编辑器中画地图，导出 <code>.tmx</code> 文件，Cocos 直接加载渲染。修改关卡不再需要改代码，只需要<strong>重新打开 Tiled 改地图</strong>。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🎨" title="Tiled 编辑器基础操作">
      <p>
        <strong>Tiled Map Editor</strong> 是一个免费、开源、跨平台的 2D 关卡编辑器。你需要下载它（mapeditor.org），然后按以下流程操作：
      </p>

      <h3>创建地图的步骤</h3>
      <ol>
        <li><strong>新建地图：</strong>文件 → 新建 → 设置地图大小（如 50x30 tiles），Tile 大小（如 32x32 px）</li>
        <li><strong>创建图块集（Tileset）：</strong>将你的资源图片（如 PNG tileset）导入 Tiled，切割成单个 tile</li>
        <li><strong>添加图层（Layer）：</strong>至少三个图层——Ground（地面）、Decorations（装饰）、Collision（碰撞）</li>
        <li><strong>绘制地图：</strong>选中图块，在网格上"画"出来——像 Windows 画图一样简单</li>
        <li><strong>添加对象层：</strong>用于标记特殊位置——玩家出生点、敌人刷新点、传送门</li>
        <li><strong>导出：</strong>保存为 <code>.tmx</code> 文件（XML 格式），连同图块集图片一起放入 Cocos 项目</li>
      </ol>

      <h3>图块集（Tileset）概念</h3>
      <p>
        图块集就是一张<strong>大图（Sprite Sheet）</strong>，里面包含了所有类型的小图块。每个小图块有一个唯一的 GID（Global ID）。在 Tiled 中，你把这张大图导入，告诉 Tiled "每 32x32 像素是一个 tile"，Tiled 就会自动切割。
      </p>

      <pre><code>// Tiled .tmx 文件本质上是 XML，你可以直接阅读它
// 以下是一个简化版的 .tmx 文件结构：
&lt;map version="1.10" width="50" height="30" tilewidth="32" tileheight="32"&gt;

  &lt;!-- 1. 引用的图块集 --&gt;
  &lt;tileset firstgid="1" name="terrain" tilewidth="32" tileheight="32"&gt;
    &lt;image source="terrain.png" width="256" height="256"/&gt;
  &lt;/tileset&gt;

  &lt;!-- 2. 图层：地面 --&gt;
  &lt;layer name="Ground" width="50" height="30"&gt;
    &lt;data encoding="csv"&gt;
      1,1,1,1,2,3,1,1,1,1,...
    &lt;/data&gt;
  &lt;/layer&gt;

  &lt;!-- 3. 图层：碰撞（在 Tiled 中给 tile 添加 custom property） --&gt;
  &lt;layer name="Collision" width="50" height="30"&gt;
    ...
  &lt;/layer&gt;

  &lt;!-- 4. 对象层：特殊位置 --&gt;
  &lt;objectgroup name="Spawns"&gt;
    &lt;object id="1" name="PlayerSpawn" x="320" y="640"/&gt;
    &lt;object id="2" name="EnemySpawn" x="960" y="640"/&gt;
  &lt;/objectgroup&gt;
&lt;/map&gt;</code></pre>

      <div class="tip-box">
        <strong>类比理解：</strong><code>.tmx</code> 文件就像前端的 <code>index.html</code>——它描述了页面的结构和内容引用，但不包含图片资源本身。图片（tileset 的 .png）像 CSS 中的 <code>background-image</code>，是独立加载的外部资源。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="在 Cocos 中加载和使用 Tilemap">
      <p>
        将 .tmx 文件和对应的图块集图片放入 Cocos 项目的 <code>assets/</code> 目录后，Cocos 会自动识别并可以拖入场景。
      </p>

      <h3>导入与渲染</h3>
      <pre><code>import { _decorator, Component, TiledMap, TiledLayer, Vec2, Vec3 } from 'cc'

export class TilemapLoader extends Component {
  onLoad() {
    const tiledMap = this.node.getComponent(TiledMap)
    if (!tiledMap) {
      console.error('节点上未找到 TiledMap 组件')
      return
    }

    // 获取指定图层
    const groundLayer = tiledMap.getLayer('Ground')
    const collisionLayer = tiledMap.getLayer('Collision')

    console.log('地图大小:', tiledMap.getMapSize())        // (50, 30) tiles
    console.log('图块大小:', tiledMap.getTileSize())       // (32, 32) px
    console.log('图层列表:', tiledMap.getLayers())

    // 获取对象层中的对象
    const objectGroup = tiledMap.getObjectGroup('Spawns')
    if (objectGroup) {
      objectGroup.getObjects().forEach(obj => {
        console.log(`对象: ${obj.name} 位置: (${obj.x}, ${obj.y})`)
        // 在这里根据对象名称创建对应的游戏实体
        if (obj.name === 'PlayerSpawn') {
          this._spawnPlayer(new Vec3(obj.x, obj.y, 0))
        }
      })
    }
  }

  private _spawnPlayer(pos: Vec3) {
    // 在指定位置生成玩家角色
  }
}</code></pre>

      <h3>碰撞层——Tile 级别的碰撞</h3>
      <p>
        在 Tiled 编辑器中，给需要碰撞的图块（如墙壁、平台）添加一个<strong>自定义属性</strong> <code>collidable = true</code>。Cocos 加载 .tmx 后，会自动为这些 tile 生成碰撞体。你不再需要手动给每个障碍物挂 Collider2D——物理引擎会自动识别。
      </p>

      <pre><code>// 运行时获取某个 tile 的信息
const layer = tiledMap.getLayer('Ground')
const tileSize = tiledMap.getTileSize()

// 将世界坐标转换为 tile 坐标
function worldToTile(worldPos: Vec3): Vec2 {
  return new Vec2(
    Math.floor(worldPos.x / tileSize.width),
    Math.floor(worldPos.y / tileSize.height),
  )
}

// 获取指定 tile 位置的 GID
const tilePos = worldToTile(playerPos)
const gid = layer.getTileGIDAt(tilePos.x, tilePos.y)

// 读取 tile 的自定义属性
if (gid !== 0) {
  const properties = tiledMap.getPropertiesForGID(gid)
  if (properties && properties.collidable) {
    console.log('玩家站在可碰撞的 tile 上')
  }
  if (properties && properties.damage) {
    console.log(`玩家踩到了伤害 tile，伤害值: ${properties.damage}`)
  }
}</code></pre>
    </ConceptBlock>

    <ConceptBlock icon="🔄" title="动态 Tile 操作——运行时改变世界">
      <p>
        关卡不一定是静态的。你可以运行时"替换"图块——这就像前端 JS 中动态修改 DOM 的属性或内容。
      </p>

      <h3>动态换 Tile 实战场景</h3>
      <table>
        <thead>
          <tr>
            <th>场景</th>
            <th>操作</th>
            <th>前端类比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>开关门</td>
            <td>把"关闭的门" tile 替换为"打开的门" tile</td>
            <td>切换元素的 <code>background-image</code></td>
          </tr>
          <tr>
            <td>可破坏墙壁</td>
            <td>把墙 tile 替换为"碎墙" tile → 再替换为空</td>
            <td><code>element.style.display = 'none'</code></td>
          </tr>
          <tr>
            <td>季节变换</td>
            <td>批量更换所有"绿树" tile 为"红叶树" tile</td>
            <td>CSS 主题切换 / 替换 class</td>
          </tr>
          <tr>
            <td>血迹/焦痕</td>
            <td>在特定 tile 上叠加装饰层 tile</td>
            <td>在元素上追加 <code>::after</code> 伪元素</td>
          </tr>
        </tbody>
      </table>

      <pre><code>// 动态替换 Tile
export class TileSwapper extends Component {
  /** 替换指定位置的图块 */
  static swapTile(
    tiledMap: TiledMap,
    layerName: string,
    tilePos: Vec2,
    newGID: number
  ) {
    const layer = tiledMap.getLayer(layerName)
    if (!layer) return

    // 移除旧 tile
    layer.removeTileAt(tilePos.x, tilePos.y)

    // 设置新 tile
    layer.setTileGIDAt(newGID, tilePos.x, tilePos.y, 0)  // flags=0 表示不翻转/旋转
  }

  /** 销毁指定区域的 tile（模拟爆炸破坏） */
  static destroyTilesInRadius(
    tiledMap: TiledMap,
    layerName: string,
    center: Vec2,
    radius: number
  ) {
    const layer = tiledMap.getLayer(layerName)
    if (!layer) return

    for (let x = center.x - radius; x <= center.x + radius; x++) {
      for (let y = center.y - radius; y <= center.y + radius; y++) {
        if (Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2) <= radius) {
          layer.removeTileAt(x, y)
        }
      }
    }
  }
}</code></pre>

      <div class="warn-box">
        <strong>性能提醒：</strong>频繁调用 <code>setTileGIDAt</code> 或 <code>removeTileAt</code> 会触发图层的顶点数据重建（类似 React 的 re-render）。如果你需要每帧更新大量 tile（如流动的岩浆河），考虑用<strong>自定义 Shader</strong> 或 <strong>粒子系统</strong> 代替，而不是每帧修改 tile。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚡" title="Tilemap 性能——为什么能渲染上万个 tile">
      <p>
        Tilemap 的性能优势来自<strong>批处理（Batching）</strong>。和前端中 SVG 绘制 10000 个小矩形的渲染方式不同，Tilemap 把所有 tile 拼成<strong>一个或少数几个网格</strong>，GPU 一次性渲染整个图层。
      </p>

      <h3>性能背后的原理</h3>
      <table>
        <thead>
          <tr>
            <th>渲染方式</th>
            <th>Draw Call 数量</th>
            <th>10000 个块的结果</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>10000 个独立 Sprite 节点</td>
            <td>10000</td>
            <td>帧率跌到个位数</td>
          </tr>
          <tr>
            <td>Tilemap（同图块集）</td>
            <td>1-3 个</td>
            <td>60fps 毫无压力</td>
          </tr>
          <tr>
            <td>前端类比</td>
            <td>10000 个 div vs 一张大图</td>
            <td>CSS Sprite 雪碧图思路</td>
          </tr>
        </tbody>
      </table>

      <p>Tilemap 的渲染机制本质上就是<strong>将你的 tile 排列成一张巨大的网格顶点数据，然后一次性提交给 GPU</strong>。只要你的图块集在同一张纹理（texture）上，它们就能在一个 Draw Call 中完成。这就像 CSS Sprite——把 50 个小图标放在一张图里，浏览器只需要一次 HTTP 请求和一个渲染上下文。</p>

      <div class="tip-box">
        <strong>分层建议：</strong>不同的图块集图片会打断批处理。如果你的地面图块和装饰图块来自<strong>不同的 PNG</strong>，它们会各自占用一个 Draw Call。合理的做法是：同类 tile 尽量放在同一张图块集图片中，或者合并图块集。但也不要把所有东西堆进一张 4096x4096 的大图——超大纹理会增加显存占用和加载时间。一般来说，一张 1024x1024 或 2048x2048 的图块集是 sweet spot。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: .tmx 文件导入 Cocos 后显示空白怎么办？</h3>
      <p>
        最常见的原因是图块集图片找不到。检查 .tmx 文件中 <code>&lt;image source="xxx.png"/&gt;</code> 的路径是否正确。Tiled 导出时使用的是<strong>相对路径</strong>——你需要确保 .tmx 和图块集图片的相对位置和在 Cocos 中一致。
      </p>

      <h3>Q2: 碰撞不生效——角色直接穿过了墙壁？</h3>
      <p>
        按顺序检查：(1) 在 Tiled 中给需要碰撞的 tile 添加了自定义属性（如 <code>collidable = true</code>）；(2) Cocos 项目中启用了 2D 物理引擎；(3) 角色节点挂载了 Collider2D + RigidBody2D；(4) TiledMap 组件的 "Enable Collision" 选项已勾选。注意：Tilemap 碰撞<strong>依赖物理引擎</strong>——如果没有启用物理，碰撞不会生效。
      </p>

      <h3>Q3: Tilemap 的坐标系和世界坐标系如何转换？</h3>
      <p>
        Tilemap 使用左上角为原点、Y 轴向下。Cocos 使用左下角为原点、Y 轴向上。获取 tile 坐标时注意翻转 Y 轴：<code>tileY = Math.floor(mapHeight - worldY / tileHeight)</code>。这和前端 canvas 坐标系 vs 页面坐标系的转换是同一个问题。
      </p>

      <h3>Q4: 地图太大了（如 500x500），影响性能吗？</h3>
      <p>
        渲染性能不会有问题（批处理保证了低 Draw Call），但<strong>内存占用</strong>会显著增加——500x500 的地图需要存储 250,000 个 tile 的数据。解决方案：(1) 把大地图分成多个<strong>小块（Chunk）</strong>，只加载玩家附近的 Chunk；(2) 使用<strong>对象池</strong>复用 tile 节点；(3) 如果地图中有大量重复的"背景填充"区域，用一张大背景图代替 tile——减少 tile 数量。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>Tilemap 的三个核心组成部分是什么（Tileset、Layer、Object Layer）？各有什么作用？</li>
        <li><code>.tmx</code> 文件的本质是什么格式？它包含哪些信息？</li>
        <li>如何在 Tiled 编辑器中给 tile 添加自定义属性？碰撞属性是怎么实现的？</li>
        <li>Cocos 中加载 Tilemap 需要使用什么组件？如何按名称获取某个图层？</li>
        <li>如何通过世界坐标反查玩家所在的 tile？说出坐标转换公式。</li>
        <li>动态更换 tile 的 API 是什么？需要注意什么性能问题？</li>
        <li>Tilemap 为什么能高效渲染上万个 tile？什么是<strong>批处理（Batching）</strong>？</li>
        <li>不同的图块集图片为什么会打断批处理？合理图块集图片大小是多少？</li>
        <li>Tilemap 碰撞依赖什么系统？如何启用？</li>
        <li>Tilemap 坐标系和 Cocos 世界坐标系有什么区别？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
