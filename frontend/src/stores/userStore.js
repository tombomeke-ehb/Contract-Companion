// frontend/src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPreferences } from '../api/preferences'
import { applyTheme } from '../theme'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAdmin = ref(false)
  const preferences = ref({ theme: 'light', lang: 'nl' })

  function setUser(userData) {
    user.value = userData
    isAdmin.value = userData?.isAdmin ?? false
    // Persist to localStorage
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  async function loadPreferences() {
    if (!user.value?.id) {
      return
    }
    try {
      const prefsRaw = await getPreferences(user.value.id)
      // Map backend fields (uppercase) to frontend expected fields (lowercase)
      const prefs = {
        theme: prefsRaw.THEME || 'light',
        lang: prefsRaw.LANG || 'nl',
        region: prefsRaw.REGION ?? null,
        sessionTimeout: prefsRaw.SESSION_TIMEOUT ?? 30
      }
      preferences.value = prefs
      applyTheme(prefs.theme)
    } catch (err) {
      preferences.value = { theme: 'light', lang: 'nl' }
      applyTheme('light')
    }
  }

  function logout() {
    user.value = null
    isAdmin.value = false
    localStorage.removeItem('user')
    // Remove theme preference and reset to default
    localStorage.removeItem('cc_theme_v2')
    preferences.value = { theme: 'light', lang: 'nl' }
    if (typeof window !== 'undefined') {
      document.body.classList.remove('theme-dark', 'theme-dark-purple', 'theme-dark-blue', 'theme-light-blue', 'theme-high-contrast')
    }
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const userData = JSON.parse(stored)
        setUser(userData)
      } catch (err) {
        logout()
      }
    }
  }

  return {
    user,
    isAdmin,
    preferences,
    setUser,
    logout,
    loadFromStorage,
    loadPreferences
  }
})
