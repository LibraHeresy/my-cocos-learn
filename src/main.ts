import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { applyRouteMeta } from './router/meta'
import { initTheme } from './composables/useTheme'
import './styles/main.css'

// 挂载前同步应用主题，避免首屏浅色闪烁。
initTheme()

const app = createApp(App)
app.use(router)

// 路由级 title/description。
router.afterEach((to) => {
  applyRouteMeta(to)
})

app.mount('#app')
