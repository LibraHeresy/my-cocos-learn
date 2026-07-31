import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { applyRouteMeta } from './router/meta'
import { initTheme } from './composables/useTheme'
import './styles/main.css'

// 挂载前同步应用主题，避免首帧浅色闪烁
initTheme()

const app = createApp(App)
app.use(router)

// 兼容旧的 hash 书签/分享链接（.../#/cocos/phase/3 → history 模式路径）
if (location.hash.startsWith('#/')) {
  router.replace(location.hash.slice(1))
}

// 路由级 title/description（JS 导航 + 预渲染双保障）
router.afterEach((to) => {
  applyRouteMeta(to)
})

app.mount('#app')
