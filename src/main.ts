import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { initTheme } from './utils/theme'

// 初始化主题，防止页面闪烁
initTheme()

createApp(App).mount('#app')
