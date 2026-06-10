<script setup lang="ts">
import PhaseLayout from '@/components/PhaseLayout.vue'
import ConceptBlock from '@/components/ConceptBlock.vue'
</script>

<template>
  <PhaseLayout :phase="13" title="CI/CD 构建流水线" duration="1-2 天">
    <ConceptBlock icon="🧭" title="本节定位"><p>每次改完代码手动构建→上传→测试→发布？做 20 次之后你恨不得有个机器人帮你。<strong>CI/CD 就是那个机器人——你负责写代码，它负责"不让你犯错"。</strong></p></ConceptBlock>

    <ConceptBlock icon="📖" title="你花了 4 个小时修一个“在我电脑上能跑”的 Bug——CI 能在 2 分钟内告诉你">
      <p>2018 年，一个 Node.js 后端团队花了整个下午调试一个问题：生产环境报错"Primise is not defined"，但所有开发者的电脑上一切正常。最终发现——有一个 commit 里手滑把 "Promise" 写成了 "Primise"。TypeScript 编译不报错（any 类型），但运行时爆炸。如果他们有 CI 跑一次 <code>npm test</code>，这个拼写错误会在推代码的 2 分钟内被揪出来。</p>
      <p>这是 CI（持续集成）的核心价值——<strong>不是说"帮你构建"，而是"在你把错误传播给其他人之前，拦住你"。</strong>你 push 代码到 GitHub → CI 自动拉代码 → npm install → type check → run tests → build → 全部绿色？merge。有一个红色？你立刻收到通知"你的测试挂了，修它"。</p>
      <p>CD（持续部署）是 CI 的下一步——CI 通过后，自动把构建产物发布到服务器/应用商店/微信小游戏后台。你不需要"手动上传"这一步。你的完整发布流程变成：<strong>写代码 → push → 等 10 分钟 → 刷新微信小游戏 → 新版本已经上线了。</strong>这就是 Vercel/Netlify 给前端项目的感觉——push 到 main，30 秒后生产环境更新。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔍" title="GitHub Actions——游戏 CI 的“普惠”工具">
      <p>GitHub Actions 免费提供每月 2000 分钟的运行时间（公开仓库）。对独立游戏开发者来说，这<strong>完全够用</strong>。一个完整的 workflow 只需要一个 YAML 文件：</p>
      <ul>
        <li><strong>触发条件（on）——什么时候跑？</strong>push 到 main 分支、创建 Pull Request、每天凌晨 2 点定时构建（Nightly Build）。和前端一样——main 分支的每次更新都应该自动构建。</li>
        <li><strong>Jobs（任务）——跑什么？</strong>多个 job 可以并行：① test job（跑 lint + type check + unit test）② build job（Cocos 构建 + Vite 构建 + 产物品控）③ deploy job（上传到微信小游戏后台 / Vercel / Releases）③ 只在 test 和 build 都通过后才执行。</li>
        <li><strong>Steps（步骤）——怎么跑？</strong>checkout 代码 → 设置 Node 版本 → npm install → npx vue-tsc --noEmit → npx vitest run → npm run build。每一步如果失败，后面的都跳过。</li>
      </ul>
      <p>游戏 CI 比 Web CI 更复杂的点是：游戏构建通常涉及大量二进制资产的转换——Cocos 的纹理压缩、音频转码、Bundle 打包——这些流程可能需要 10-30 分钟。但 GitHub Actions 的免费额度（2000 分钟/月）足够你每天构建 3-4 次。</p>
    </ConceptBlock>

    <ConceptBlock icon="🚀" title="缓存——从 30 分钟构建到 3 分钟">
      <p>游戏 CI 最耗时的不是代码——是<strong>重复编译引擎</strong>。Cocos 引擎的编译产物（library/ 和 temp/ 目录）如果每次 CI 都从头编译，轻松吃掉 20 分钟。但如果把编译产物缓存起来——第二次构建只需 2-3 分钟。</p>
      <p>GitHub Actions 的 cache action：</p>
      <div style="background:var(--color-surface);padding:12px;border-radius:8px;margin:8px 0;font-family:monospace;font-size:0.85em;">
- name: Cache Cocos build<br/>
&nbsp;&nbsp;uses: actions/cache@v4<br/>
&nbsp;&nbsp;with:<br/>
&nbsp;&nbsp;&nbsp;&nbsp;path: |<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;library/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;temp/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;node_modules/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;key: cocos-$&#123;&#123; hashFiles('package-lock.json') &#125;&#125;
      </div>
      <p>缓存 key 用 package-lock.json 的 hash——依赖变了，缓存自动失效重建。这和 Webpack/Vite 的 node_modules 缓存完全一致的逻辑。</p>
    </ConceptBlock>

    <ConceptBlock icon="🔧" title="动手：为项目搭建 CI/CD 流水线">
      <ol>
        <li><strong>创建 workflow 文件：</strong>在项目根目录创建 <code>.github/workflows/ci.yml</code>：
          <div style="background:var(--color-surface);padding:12px;border-radius:8px;margin:8px 0;font-family:monospace;font-size:0.85em;">
name: CI<br/>
on:<br/>
&nbsp;&nbsp;push:<br/>
&nbsp;&nbsp;&nbsp;&nbsp;branches: [main]<br/>
&nbsp;&nbsp;pull_request:<br/>
&nbsp;&nbsp;&nbsp;&nbsp;branches: [main]<br/>
jobs:<br/>
&nbsp;&nbsp;check:<br/>
&nbsp;&nbsp;&nbsp;&nbsp;runs-on: ubuntu-latest<br/>
&nbsp;&nbsp;&nbsp;&nbsp;steps:<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- uses: actions/checkout@v4<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- uses: actions/setup-node@v4<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;with: { node-version: '20' }<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- run: npm ci<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- run: npx vue-tsc -b --noEmit<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- run: npx vitest run<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- run: npm run build
          </div>
        </li>
        <li><strong>推送并观察：</strong>git add → git commit → git push。打开 GitHub 仓库页面的 Actions 标签——你可以实时看到 workflow 的运行日志。如果有步骤报错（红色 ❌）——看日志，找到错误信息，修掉，重新 push。</li>
        <li><strong>加缓存优化：</strong>在 steps 的 npm ci 之前加上缓存步骤——缓存 node_modules。第二次 push 后观察 build job 的时间——应该从几分钟缩短到几十秒（如果 node_modules 命中缓存）。</li>
        <li><strong>加 artifact 上传：</strong>最后一步加上 <code>actions/upload-artifact@v4</code>，把 build 产物（Vite 的 dist/ 目录）上传到 workflow 的 artifact 存档中。这样你每次 push 之后的构建产物都能在 GitHub Actions 页面下载——不需要本地构建。</li>
        <li><strong>（可选）自动部署 Vercel：</strong>这个项目是 Vite + Vue 3，可以直接部署到 Vercel。在 Vercel 控制台关联 GitHub 仓库后——每次 push main 自动部署。你的文档站 CI/CD 就完整闭环了：推代码 → 自动 type check + test + build → 自动发布 → 30 秒后站点更新。</li>
      </ol>
    </ConceptBlock>

    <ConceptBlock icon="🔗" title="课外延伸">
      <ul>
        <li><strong>游戏 CI 比 Web CI 复杂的根源——资产管线：</strong>Web 前端构建通常只涉及 JS 打包（Webpack/Vite，1-3 分钟）和少量静态资源压缩。但游戏构建要走一整套"资产管线"（Asset Pipeline）：纹理压缩（PNG→ETC2/ASTC，每种格式 5-10 分钟）→ 音频转码（WAV→MP3/AAC）→ 精灵图集打包（TexturePacker）→ Bundle 分包。一套完整管线轻轻松松 30 分钟。大型游戏的 CI 可能每天只在凌晨 2 点跑一次 Nightly Build——因为太慢了。对独立游戏来说，<strong>只跑你需要的步骤</strong>——如果你没有改纹理，缓存纹理编译产物，只重新编译改过的部分。</li>
        <li><strong>微软收购 GitHub 之后 Actions 的免费额度不断扩——独立开发者的福音：</strong>GitHub Actions 2019 年上线时只有 2000 分钟的免费额度，到 2025 年已经扩展到 3000 分钟（公开仓库无限免费）。这和 GitLab CI（免费 400 分钟/月）和 CircleCI（免费 6000 分钟/月）在竞争同一批用户。对于你的项目规模——任何平台的免费额度都绰绰有余。</li>
        <li><strong>CI 不是"做完就完了"——是"每一次 commit 都在保护你"：</strong>你的测试可能一个月前写的，现在代码重构了——测试挂了。如果你没有 CI，你可能 3 个月后才发现"这个测试原来早就挂了，我一直以为它过呢"。有 CI 的 commit 机制：<strong>每次 push 必跑测试——挂了的测试不会默默烂掉，而是每次都提醒你"修我或删我"。</strong></li>
      </ul>
    </ConceptBlock>

    <ConceptBlock icon="✅" title="自测清单">
      <ol>
        <li>CI（持续集成）和 CD（持续部署）分别解决什么问题？游戏开发中为什么 CI 比 CD 更需要优先实施？</li>
        <li>GitHub Actions workflow 的三个核心要素（触发条件、Jobs、Steps）分别是什么？在你的 ci.yml 中各对应什么？</li>
        <li>游戏 CI 为什么比 Web CI 更复杂？缓存策略能解决什么问题？</li>
      </ol>
    </ConceptBlock>
  </PhaseLayout>
</template>
