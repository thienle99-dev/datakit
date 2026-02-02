import { createApp } from 'vue'
import '@/style.css'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/700.css'
import '@fontsource/outfit/900.css'
import App from '@/App.vue'
import router from '@router/index'

const app = createApp(App)
app.use(router)
app.mount('#app')
