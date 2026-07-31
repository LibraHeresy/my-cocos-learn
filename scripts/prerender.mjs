/**
 * 浏览器快照式预渲染：为每个 SEO 路由生成独立静态 HTML。
 * - 用真浏览器（puppeteer）逐页抓取，规避「workshopStore 模块顶层读 localStorage」导致的 SSR 不安全。
 * - 输出：dist/<route>/index.html + dist/404.html（SPA 回退）+ dist/sitemap.xml。
 * 仅 CI 运行（需要 puppeteer 已安装）。
 */
import { buildSync } from 'esbuild'
import { pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createServer } from 'node:http'
import fs from 'node:fs'
import puppeteer from 'puppeteer'

const DIST = path.resolve('dist')
const baseArg = process.argv.find((a) => a.startsWith('--base='))?.slice(7) ?? '/'
const BASE = baseArg.endsWith('/') ? baseArg : baseArg + '/'
const SITE_URL = (process.env.SITE_URL ?? 'https://example.com').replace(/\/$/, '') + BASE

// Node 不能直接 import TS；用 esbuild 打包单一起源的路由表
const tmpOut = path.join(tmpdir(), `seo-routes-${process.pid}.mjs`)
buildSync({
  entryPoints: ['src/router/seo-routes.ts'],
  bundle: true,
  format: 'esm',
  outfile: tmpOut,
  alias: { '@': path.resolve('src') },
})
const { SEO_ROUTES } = await import(`${pathToFileURL(tmpOut).href}?t=${process.pid}`)

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.wasm': 'application/wasm',
}

// 静态服务器 + SPA 回退
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  let p = decodeURIComponent(url.pathname)
  if (p.startsWith(BASE)) p = p.slice(BASE.length - 1)
  let file = path.join(DIST, p === '/' ? 'index.html' : p)
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(DIST, 'index.html')
  }
  const ext = path.extname(file)
  res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream')
  fs.createReadStream(file).pipe(res)
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const port = server.address().port
const origin = `http://127.0.0.1:${port}`

const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()
page.setDefaultTimeout(30000)

for (const route of SEO_ROUTES) {
  const urlPath = route === '/' ? BASE : `${BASE}${route.slice(1)}`
  await page.goto(origin + urlPath, { waitUntil: 'networkidle0' })
  // 强制 reveal：绕开滚动渐入动画的 opacity:0 默认态，否则正文在快照里不可见
  await page.evaluate(() => {
    document.querySelectorAll('.concept-block, .phase-group').forEach((el) => el.classList.add('revealed'))
  })
  const html = await page.content()
  const outPath = route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, html)
  console.log('prerendered', route)
}
await browser.close()

// 404.html = SPA 壳（history 模式深链回退）
fs.copyFileSync(path.join(DIST, 'index.html'), path.join(DIST, '404.html'))

// sitemap.xml
const urls = SEO_ROUTES.map((r) => {
  const loc = SITE_URL + (r === '/' ? '' : r.slice(1))
  return `  <url><loc>${loc}</loc></url>`
}).join('\n')
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)

server.close()
console.log(`prerender done: ${SEO_ROUTES.length} pages + 404.html + sitemap.xml`)
