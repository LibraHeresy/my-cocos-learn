<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="17" title="CI/CD 构建流水线" duration="1-2 天">
    <ConceptBlock icon="🎯" title="学完本节你能做什么">
      <ul>
        <li>用 <strong>Cocos Creator CLI</strong> 命令行构建替代手动点击"构建发布"</li>
        <li>在 <strong>GitHub Actions</strong> 上搭建全自动构建流水线</li>
        <li>实现<strong>多平台矩阵构建</strong>：Web / 微信 / Android / iOS 一键打包</li>
        <li>配置<strong>构建缓存</strong>，将 CI 构建时间从 10 分钟降到 2 分钟</li>
        <li>搭建 <strong>Asset Bundle 热更新</strong> + CDN 分发体系</li>
        <li>制定 <strong>Dev → Staging → Production</strong> 发布流水线和回滚策略</li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="🧠" title="CI/CD 是什么 —— 前端工程师的直觉理解">
      <p>
        如果你用过 Vercel/Netlify 的 <strong>Git Push 自动部署</strong>，你就已经理解 CI/CD 的本质。
        推代码 → 自动构建 → 自动部署 → 拿到可访问的链接。游戏项目的 CI/CD 流程完全一样，
        只是构建工具从 <code>vite build</code> 变成了 <code>cc build</code>。
      </p>

      <h3>前端 CI/CD vs 游戏 CI/CD</h3>
      <table>
        <thead>
          <tr>
            <th>阶段</th>
            <th>前端（Vue 项目）</th>
            <th>游戏（Cocos 项目）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>源码管理</td>
            <td>GitHub / GitLab</td>
            <td><strong>完全相同</strong></td>
          </tr>
          <tr>
            <td>依赖安装</td>
            <td><code>npm ci</code></td>
            <td><code>npm ci</code>（Cocos 插件依赖也是 npm）</td>
          </tr>
          <tr>
            <td>构建命令</td>
            <td><code>vite build</code> / <code>vue-tsc && vite build</code></td>
            <td><code>cc build -p wechatgame</code></td>
          </tr>
          <tr>
            <td>产物</td>
            <td><code>dist/</code>（HTML + JS + CSS）</td>
            <td><code>build/wechatgame/</code>（JS + 资源包）</td>
          </tr>
          <tr>
            <td>部署</td>
            <td>nginx / Vercel / S3 + CDN</td>
            <td>微信小游戏后台上传 / CDN 分发远程资源</td>
          </tr>
          <tr>
            <td>环境</td>
            <td>dev / staging / production</td>
            <td><strong>完全相同</strong></td>
          </tr>
          <tr>
            <td>通知</td>
            <td>Slack / 企业微信 / 钉钉</td>
            <td><strong>完全相同</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>关键认知：</strong>Cocos 项目 = 前端项目 + 一个特殊的构建工具（Cocos CLI）。
        所有前端 CI/CD 的经验——环境区分、缓存策略、矩阵构建、产物归档——全部可以平移。
        你不需要从零学一套新体系。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="Cocos Creator CLI 构建">
      <p>
        Cocos Creator 提供命令行构建接口，让你可以在 CI 服务器上（没有 GUI 环境）
        执行构建。所有你在编辑器里点的按钮，CLI 都能做。
      </p>

      <h3>基础构建命令</h3>
      <pre><code># 基本语法
cc build \
  -p wechatgame \                          # 平台：wechatgame / web-mobile / android / ios
  --configPath=buildConfig.json            # 构建配置文件（可选，推荐使用）

# 最简构建（使用项目默认构建设置）
cc build -p wechatgame

# 指定输出目录
cc build -p wechatgame -o ./output/wechat

# 使用构建配置文件的完整示例
cc build -p wechatgame --configPath=./ci/build-configs/wechat-prod.json</code></pre>

      <h3>buildConfig.json 配置文件</h3>
      <pre><code>// ci/build-configs/wechat-prod.json —— 微信生产环境构建配置
{
  "platform": "wechatgame",
  "buildPath": "./build",
  "outputName": "wechatgame",
  "debug": false,
  "md5Cache": true,
  "mainBundleIsRemote": false,
  "startScene": "db://assets/scenes/Menu.scene",
  "scenes": [
    { "url": "db://assets/scenes/Menu.scene", "uuid": "..." },
    { "url": "db://assets/scenes/Game.scene", "uuid": "..." },
    { "url": "db://assets/scenes/Result.scene", "uuid": "..." }
  ],
  "packages": {
    "wechatgame": {
      "appid": "wxYOUR_APP_ID",
      "orientation": "portrait",
      "separateEngine": false,
      "subpackageBuildType": "subpackage"
    }
  },
  "bundleConfigs": [
    {
      "name": "game",
      "isRemote": false,
      "priority": 1
    },
    {
      "name": "audio",
      "isRemote": true,
      "priority": 2
    }
  ]
}</code></pre>

      <h3>平台专属选项</h3>
      <table>
        <thead>
          <tr>
            <th>平台</th>
            <th>关键配置</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>wechatgame</code></td>
            <td><code>appid</code>, <code>orientation</code>, <code>subpackageBuildType</code></td>
            <td>小游戏 appid 必填，横竖屏在此指定</td>
          </tr>
          <tr>
            <td><code>web-mobile</code></td>
            <td><code>webOrientation</code>, <code>polyfills</code></td>
            <td>Web 版额外需要 babel polyfills 兼容旧浏览器</td>
          </tr>
          <tr>
            <td><code>android</code></td>
            <td><code>packageName</code>, <code>apiLevel</code>, <code>keystore</code></td>
            <td>需要 Java SDK + Android SDK 环境</td>
          </tr>
          <tr>
            <td><code>ios</code></td>
            <td><code>bundleId</code>, <code>teamId</code>, <code>provisioningProfile</code></td>
            <td>需要 macOS + Xcode 环境</td>
          </tr>
        </tbody>
      </table>

      <h3>版本号管理</h3>
      <pre><code>// package.json 中维护版本号
{
  "name": "pixel-airplane-war",
  "version": "1.2.3",   // 语义化版本：major.minor.patch
  "buildNumber": 47      // CI 构建编号（自增，用于小游戏上传）
}

// 构建时注入版本号和构建时间
// 在 cc build 前用脚本生成 version.ts：
// node ci/generate-version.js
// → 生成 src/version.ts：
//   export const GAME_VERSION = '1.2.3'
//   export const BUILD_NUMBER = 47
//   export const BUILD_TIME = '2026-05-27T10:30:00Z'</code></pre>

      <div class="warn-box">
        <strong>环境要求：</strong>Cocos CLI 需要 Cocos Creator 编辑器已安装。
        在 CI 服务器上，你需要预先安装 Cocos Creator（或使用 Docker 镜像）。
        社区有非官方的 Cocos CLI Docker 镜像，也可以自行构建。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚙️" title="GitHub Actions 自动构建">
      <p>
        以下是一份完整可用的 GitHub Actions Workflow，推送到 main 分支时自动构建
        微信小游戏，打包产物，上传到 GitHub Artifacts。
      </p>

      <h3>完整 Workflow 文件</h3>
      <pre><code># .github/workflows/build.yml
name: Build Game

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:      # 允许手动触发
    inputs:
      platform:
        description: '构建平台'
        required: true
        default: 'wechatgame'
        type: choice
        options: ['wechatgame', 'web-mobile', 'android']

env:
  COCOS_VERSION: '3.8.4'
  NODE_VERSION: '20'

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        platform: [wechatgame, web-mobile]  # 矩阵构建：两个平台并行

    steps:
      - name: Checkout 源码
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: 安装 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: $&#123;&#123; env.NODE_VERSION }}
          cache: 'npm'

      - name: 安装项目依赖
        run: npm ci

      - name: 安装 Cocos Creator CLI
        run: |
          # 注意：此处假设 CI 环境已预装 Cocos Creator
          # 实际使用中需要 Cocos Creator 的 Docker 镜像
          # 或在 self-hosted runner 上预装
          echo "Cocos Creator $COCOS_VERSION ready"

      - name: 还原构建缓存
        uses: actions/cache@v4
        with:
          path: |
            library/
            temp/
            native/
          key: cocos-build-$&#123;&#123; runner.os }}-$&#123;&#123; matrix.platform }}-$&#123;&#123; hashFiles('settings/**') }}
          restore-keys: |
            cocos-build-$&#123;&#123; runner.os }}-$&#123;&#123; matrix.platform }}-

      - name: 生成版本号
        run: node ci/generate-version.js

      - name: 运行测试
        run: npm run test:unit

      - name: 检查主包体积
        run: npm run check:bundle

      - name: 构建 $&#123;&#123; matrix.platform }}
        run: |
          cc build \
            -p $&#123;&#123; matrix.platform }} \
            --configPath=ci/build-configs/$&#123;&#123; matrix.platform }}-prod.json

      - name: 检查构建产物
        run: |
          echo "构建产物列表："
          ls -lh build/$&#123;&#123; matrix.platform }}/

      - name: 归档构建产物
        uses: actions/upload-artifact@v4
        with:
          name: game-$&#123;&#123; matrix.platform }}-$&#123;&#123; github.sha }}
          path: build/$&#123;&#123; matrix.platform }}/
          retention-days: 30

      - name: 通知构建结果
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const status = '$&#123;&#123; job.status }}'
            const platform = '$&#123;&#123; matrix.platform }}'
            console.log(`[${platform}] 构建${status === 'success' ? '成功' : '失败'}`)</code></pre>

      <h3>构建缓存策略</h3>
      <table>
        <thead>
          <tr>
            <th>缓存目录</th>
            <th>内容</th>
            <th>大小</th>
            <th>缓存效果</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>library/</code></td>
            <td>资源导入缓存（纹理压缩、脚本编译结果）</td>
            <td>100~500MB</td>
            <td>命中后跳过资源重新导入——节省 60% 时间</td>
          </tr>
          <tr>
            <td><code>temp/</code></td>
            <td>构建中间产物</td>
            <td>50~200MB</td>
            <td>增量构建时复用</td>
          </tr>
          <tr>
            <td><code>native/</code></td>
            <td>原生平台编译缓存</td>
            <td>50~100MB</td>
            <td>仅在原生平台（Android/iOS）构建时有效</td>
          </tr>
          <tr>
            <td><code>node_modules/</code></td>
            <td>npm 依赖</td>
            <td>~200MB</td>
            <td><code>npm ci</code> 本身就快，cache 额外节省有限</td>
          </tr>
        </tbody>
      </table>

      <div class="tip-box">
        <strong>cache key 设计原则：</strong>key 中必须包含 <strong>settings/ 目录的 hash</strong>。
        当你在 Cocos 编辑器中修改项目设置（如模块裁剪、纹理压缩格式），缓存必须失效。
        这和前端项目的 <code>hashFiles('**/package-lock.json')</code> 是一个道理——
        输入变了，缓存就必须重建。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="📦" title="多平台构建策略">
      <p>
        一个 Cocos 项目可能需要同时发布到多个平台。在 CI 中通过
        <strong>构建矩阵（Matrix Build）</strong> 可以并行构建所有平台，大幅缩短总时间。
      </p>

      <h3>构建矩阵配置</h3>
      <pre><code># .github/workflows/build-multi-platform.yml
jobs:
  build:
    strategy:
      fail-fast: false     # 一个平台失败不影响其他
      matrix:
        include:
          - platform: wechatgame
            config: ci/build-configs/wechat-prod.json
            artifact: wechatgame
            os: ubuntu-latest
          - platform: web-mobile
            config: ci/build-configs/web-prod.json
            artifact: web-mobile
            os: ubuntu-latest
          - platform: android
            config: ci/build-configs/android-prod.json
            artifact: android
            os: ubuntu-latest
            # Android 构建需要额外的 JDK + SDK setup
          - platform: ios
            config: ci/build-configs/ios-prod.json
            artifact: ios
            os: macos-latest     # iOS 只能在 macOS 上构建</code></pre>

      <h3>各平台部署目标</h3>
      <table>
        <thead>
          <tr>
            <th>平台</th>
            <th>部署方式</th>
            <th>工具</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Web</td>
            <td>静态文件托管 + CDN</td>
            <td>Vercel CLI / AWS S3 / 阿里云 OSS</td>
          </tr>
          <tr>
            <td>微信小游戏</td>
            <td>微信公众平台后台上传 + 提审</td>
            <td><code>miniprogram-ci</code>（微信官方 CI 工具）</td>
          </tr>
          <tr>
            <td>Android</td>
            <td>APK → 内测分发渠道</td>
            <td>蒲公英 / fir.im / 腾讯 Bugly</td>
          </tr>
          <tr>
            <td>iOS</td>
            <td>IPA → TestFlight</td>
            <td>App Store Connect API / Fastlane</td>
          </tr>
        </tbody>
      </table>

      <h3>微信小游戏自动上传（CI 集成）</h3>
      <pre><code># .github/workflows/deploy-wechat.yml —— 微信小游戏自动上传
jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
      - name: 下载构建产物
        uses: actions/download-artifact@v4
        with:
          name: game-wechatgame-$&#123;&#123; github.sha }}

      - name: 安装 miniprogram-ci
        run: npm install -g miniprogram-ci

      - name: 上传到微信后台
        run: |
          miniprogram-ci upload \
            --pp ./ \
            --pkp ./ci/private.key \
            --appid $&#123;&#123; secrets.WX_APPID }} \
            --uv $&#123;&#123; github.run_number }} \
            --ud "CI自动构建 #$&#123;&#123; github.run_number }}" \
            --enable-es6 false \
            --enable-autoprefixwxss false</code></pre>

      <div class="tip-box">
        <strong>条件构建：</strong>不要每次 push 都构建所有平台——浪费时间。根据分支或变更路径
        <strong>条件触发</strong>：<code>if: contains(github.event.head_commit.message, '[build-all]')</code>
        或 <code>paths: ['assets/**']</code>。这和前端项目中只重新构建改动的模块是一个思路。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🔥" title="版本管理与热更新">
      <p>
        游戏发布后不可能每次都让玩家重新下载整个包。Cocos 的
        <strong>Asset Bundle 热更新</strong>机制让你可以无感推送资源更新——
        和 Web 项目的 CDN 缓存更新逻辑完全一致：改了什么就只下发什么。
      </p>

      <h3>版本号规范</h3>
      <pre><code>语义化版本：major.minor.patch-buildNumber
例：1.2.3-47

major（主版本）：需要重新下载完整包的重构（几乎不发）
minor（次版本）：新增关卡/角色/玩法 → 需要提交审核
patch（补丁版本）：Bug 修复、数值调整 → 热更新即可（不审核）
buildNumber：CI 构建编号，自动递增</code></pre>

      <h3>热更新架构</h3>
      <pre><code>客户端（游戏运行时）
  │
  ├─ 1. 启动时检查版本清单
  │     GET https://cdn.example.com/game/version.json
  │     → { "bundles": { "game": "v12", "audio": "v5" } }
  │
  ├─ 2. 对比本地版本号
  │     localStorage.getItem('bundle_game_version') === 'v12' ?
  │
  ├─ 3. 下载变更的 Bundle
  │     下载 https://cdn.example.com/game/bundles/game_v12.zip
  │     → 解压到 wx.env.USER_DATA_PATH + '/bundles/game/'
  │
  └─ 4. 使用更新后的资源
        assetManager.loadBundle('game_from_update')</code></pre>

      <h3>Bundle 更新上传脚本</h3>
      <pre><code>// ci/upload-bundles.js —— 对比 hash，只上传变更的 Bundle
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')

const BUNDLE_NAMES = ['game', 'audio']
const CDN_BASE = 'https://cdn.example.com/game'

function hashFile(filePath) {
  const content = fs.readFileSync(filePath)
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
}

function hashBundle(bundlePath) {
  // 遍历 bundle 目录下所有文件，计算整体 hash
  const files = walkSync(bundlePath)
  const combinedHash = crypto.createHash('md5')
  files.sort().forEach(f => combinedHash.update(f + hashFile(f)))
  return combinedHash.digest('hex').slice(0, 8)
}

const manifest = { bundles: {} }

for (const name of BUNDLE_NAMES) {
  const bundleDir = path.join(__dirname, '../build/wechatgame/assets', name)
  const hash = hashBundle(bundleDir)

  // 读取 CDN 上已有的版本清单
  const remoteManifest = fetchRemoteManifest()  // GET CDN/version.json
  const remoteHash = remoteManifest?.bundles?.[name]

  if (hash !== remoteHash) {
    // Bundle 有变更 → 打包上传
    const zipPath = `${name}_${hash}.zip`
    zipBundle(bundleDir, zipPath)
    uploadToCDN(zipPath, `${CDN_BASE}/bundles/${zipPath}`)
    console.log(`[${name}] 已更新: ${remoteHash || '(new)'} → ${hash}`)
  } else {
    console.log(`[${name}] 无变更，跳过`)
  }

  manifest.bundles[name] = hash
}

// 上传新的版本清单
uploadToCDN(JSON.stringify(manifest), `${CDN_BASE}/version.json`)</code></pre>

      <h3>客户端更新检测代码</h3>
      <pre><code>// HotUpdateManager.ts
export class HotUpdateManager {
  private static _instance: HotUpdateManager

  async checkUpdate(): Promise&lt;string[]&gt; {
    const changed: string[] = []

    // 获取远端版本清单
    const remote = await this.fetchJSON(`${CDN_BASE}/version.json`)
    if (!remote) return changed

    for (const [bundleName, remoteHash] of Object.entries(remote.bundles)) {
      const localHash = sys.localStorage.getItem(`bundle_${bundleName}_hash`)
      if (localHash !== remoteHash) {
        // 下载更新包
        await this.downloadAndExtract(
          `${CDN_BASE}/bundles/${bundleName}_${remoteHash}.zip`,
          `${wx.env.USER_DATA_PATH}/bundles/${bundleName}/`
        )
        sys.localStorage.setItem(`bundle_${bundleName}_hash`, remoteHash as string)
        changed.push(bundleName)
      }
    }

    return changed
  }
}</code></pre>

      <h3>微信小游戏审核更新（wx.getUpdateManager）</h3>
      <pre><code>// 小游戏代码包本身的更新（非热更新，需要审核通过后才生效）
const updateManager = wx.getUpdateManager()

updateManager.onCheckForUpdate((res) => {
  if (res.hasUpdate) {
    // 有新版本——可以在这里提示用户重启
  }
})

updateManager.onUpdateReady(() => {
  // 新版本已下载完成，调用 applyUpdate 重启
  wx.showModal({
    title: '更新提示',
    content: '新版本已就绪，是否重启应用？',
    success: (res) => {
      if (res.confirm) {
        updateManager.applyUpdate()  // 重启小游戏 → 新版本生效
      }
    },
  })
})

updateManager.onUpdateFailed(() => {
  // 更新失败——通常是网络问题，静默忽略
  console.warn('小游戏更新失败')
})</code></pre>

      <div class="warn-box">
        <strong>注意区分两种更新：</strong>
        ① <strong>热更新</strong>（Asset Bundle）：你在 CDN 上换资源，客户端自动拉取，不需要审核；
        ② <strong>代码包更新</strong>（小游戏本体）：你需要提交审核，审核通过后用户端才生效。
        数值调整、新贴图、新音效可以用热更新；改了游戏逻辑（TS 脚本编译后的 JS）
        就必须走审核流程。这和前端的"静态资源换 CDN"vs"SPA 重新部署"是完全一样的道理。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="🚀" title="发布流水线">
      <p>
        完整的发布流水线分为三个环境，功能逐步验证，风险逐步降低。这和前端项目的
        <strong>Preview → Staging → Production</ strong> 三环境策略完全一致。
      </p>

      <h3>三环境发布流水线</h3>
      <table>
        <thead>
          <tr>
            <th>环境</th>
            <th>触发方式</th>
            <th>验证内容</th>
            <th>受众</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Dev</strong></td>
            <td>每次 push 到 <code>feature/*</code> 分支</td>
            <td>构建通过、单元测试通过、包大小检查</td>
            <td>仅开发者</td>
          </tr>
          <tr>
            <td><strong>Staging</strong></td>
            <td>PR 合并到 <code>develop</code> 后</td>
            <td>微信开发者工具验证 + 真机功能回归</td>
            <td>内部测试群（2~5 人）</td>
          </tr>
          <tr>
            <td><strong>Production</strong></td>
            <td>手动打 Tag（<code>v1.2.3</code>）后</td>
            <td>完整兼容性矩阵测试 → 上传微信后台 → 提交审核</td>
            <td>全体玩家</td>
          </tr>
        </tbody>
      </table>

      <h3>Production 发布步骤（微信小游戏）</h3>
      <ol>
        <li>确认 Staging 环境测试通过</li>
        <li>Git Tag <code>v1.2.3</code> → 触发 Production 构建</li>
        <li>CI 构建微信小游戏包</li>
        <li>CI 自动上传到微信后台（开发版）</li>
        <li>内部测试群扫码验证开发版</li>
        <li>手动在微信后台点击"提交审核"</li>
        <li>审核通过（1~7 天）→ 点击"发布"→ 全量生效</li>
        <li>同时上传变更的 Bundle 到 CDN（热更新部分）</li>
      </ol>

      <h3>回滚策略</h3>
      <pre><code>回滚方案（按严重程度排序）：

1. 轻微问题（数值/贴图）→ 热更新回滚：
   - CDN 上保留上一个版本的 Bundle 文件
   - 修改 version.json 指向旧版本 hash
   - 客户端下次启动自动拉旧资源（无需审核！）

2. 中度问题（部分功能异常）→ 微信后台版本回退：
   - 微信公众平台 → 版本管理 → 选择上一个稳定版本 → 回退
   - 全量生效约 5~30 分钟

3. 严重问题（游戏崩溃）→ 紧急下线：
   - 微信公众平台 → 设置 → 暂停服务
   - 全量立即生效（用户端显示"该小游戏已暂停服务"）

4. 预防措施：
   - CDN 永远保留最近 3 个版本的 Bundle（不要覆盖旧文件）
   - version.json 设计为 append-only 结构
   - 发布后至少保留 24 小时观察期，再删旧版本</code></pre>

      <h3>自动化 Release Notes</h3>
      <pre><code># .github/workflows/release.yml
# 从 git commit 自动生成 Release Notes
jobs:
  release:
    steps:
      - name: 生成 Changelog
        uses: orhun/git-cliff-action@v3
        with:
          config: cliff.toml
          args: --verbose --tag $&#123;&#123; github.ref_name }}

      - name: 创建 GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          body_path: CHANGELOG.md
          files: |
            build/wechatgame/*.zip
            build/web-mobile/*.zip</code></pre>

      <div class="tip-box">
        <strong>灰度发布：</strong>微信小游戏不支持按地区/用户比例灰度，但你可以用"分段发布"策略：
        先在微信后台发布<strong>开发版</strong> → 内部验证 → 提交审核 → 审核通过后点击"发布"。
        这实际上就是灰度——审核期间只有你能看到新版本，发布后才全量。
      </div>
    </ConceptBlock>

    <ConceptBlock icon="⚠️" title="常见问题">
      <h3>Q1: 我的项目在 Cocos 编辑器中构建没问题，但在 CI 中构建报错？</h3>
      <p>
        最常见的原因是<strong>环境差异</strong>：CI 服务器上没有 Cocos Creator 编辑器，
        或者版本号不一致。解决方案：使用 Docker 镜像固定 Cocos 版本，
        或者使用 self-hosted runner（一台安装了 Cocos Creator 的专用机器）。
        这和前端项目 CI 中必须指定 <code>node-version: '20'</code> 是一样的道理——
        运行时版本必须锁定。
      </p>

      <h3>Q2: 热更新 Bundle 下载失败，客户端怎么办？</h3>
      <p>
        热更新必须是<strong>可降级的</strong>。如果 Bundle 下载失败（网络问题、CDN 故障），
        客户端应该<strong>静默回退到内置资源</strong>，而不是弹出错误框打断游戏。
        这和前端 Service Worker 缓存策略一样——网络优先，缓存降级。
      </p>

      <h3>Q3: 构建缓存在 CI 中 hit 率很低，大部分时候还是全量构建？</h3>
      <p>
        检查缓存 key 是否包含了<strong>所有构建输入</strong>。Cocos 构建的输入包括：
        <code>assets/</code> 目录、<code>settings/</code> 目录、Cocos 引擎版本。
        仅仅缓存 <code>library/</code> 是不够的——也要缓存 <code>temp/</code> 目录。
        另外，如果你的 <code>assets/</code> 目录每次提交都有变化（如 Sprite 重新导出），
        那缓存命中率自然低——这是正常的。
      </p>

      <h3>Q4: 多平台构建时，要不要每个平台独立维护 buildConfig.json？</h3>
      <p>
        <strong>强烈建议</strong>。每个平台的配置项差异很大（appid、屏幕方向、压缩格式），
        混在一起容易出错。用 <code>ci/build-configs/{platform}-{env}.json</code> 的命名约定，
        每个平台每种环境一个文件。类比前端项目的 <code>.env.development</code>、
        <code>.env.production</code>——你不会把开发和生产的配置写在同一个文件里。
      </p>

      <h3>Q5: iOS 构建必须在 macOS 上跑，这会拖慢 CI 速度怎么办？</h3>
      <p>
        GitHub Actions 提供 <code>macos-latest</code> runner，但比 Linux runner 贵
        （按分钟计费时）。优化策略：
        ① iOS 构建只在打 Tag 时触发（不是每次 push）；
        ② 如果暂时不需要原生平台，CI 只构建 wechatgame 和 web-mobile（都在 Linux 上跑）；
        ③ 使用 incremental build + 缓存最大限度缩短构建时间。
        很多 Cocos 团队的实际做法是：Android 和 iOS 构建留给本地打包，CI 只负责
        微信小游戏。
      </p>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自检清单">
      <ol>
        <li>Cocos Creator CLI 构建命令的基本语法是什么？<code>-p</code> 和 <code>--configPath</code> 各起什么作用？</li>
        <li>buildConfig.json 中哪些字段是微信小游戏特有的？</li>
        <li>CI Workflow 中构建缓存的 key 里为什么必须包含 <code>settings/</code> 的 hash？</li>
        <li>矩阵构建（Matrix Build）如何配置？<code>fail-fast: false</code> 的作用是什么？</li>
        <li>热更新和代码包更新在审核流程上有什么区别？分别适用于哪些场景？</li>
        <li>Bundle 热更新的完整流程（客户端→CDN→客户端）分哪 4 步？</li>
        <li><code>wx.getUpdateManager()</code> 和 Asset Bundle 更新分别解决什么问题？</li>
        <li>三环境发布流水线（Dev → Staging → Production）各自的触发条件和验证内容是什么？</li>
        <li>热更新回滚的策略是什么？CDN 上应该保留几个旧版本？</li>
        <li>iOS 构建为什么必须在 macOS 上跑？有什么优化策略？</li>
        <li>如果热更新 Bundle 下载失败，客户端应该怎么处理？为什么不能弹错误框？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
