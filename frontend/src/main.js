import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from './i18n'
import { nextTick } from 'vue'

import App from './App.vue'
import router from './router'

import './css/style.css'

import { applyTheme, loadThemeFromStorage } from './theme'
import { useUserStore } from './stores/userStore'

// Apply saved theme before mounting so all routes keep the same theme
applyTheme(loadThemeFromStorage())

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

// After mounting, if user is logged in, load and apply preferences
app.mount('#app')

nextTick(() => {
  const userStore = useUserStore()
  userStore.loadFromStorage()
  if (userStore.user) {
    userStore.loadPreferences()
  }
})
