import { createApp } from 'vue'
import './utils/uni-shim.ts' // Explicit extension to avoid cache issues
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import uviewPlus from 'uview-plus'
import 'uview-plus/index.scss'

import App from './App.vue'
import router from './router/index'

import './styles/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(uviewPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
