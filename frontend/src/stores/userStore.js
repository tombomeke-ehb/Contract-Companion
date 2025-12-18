// frontend/src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAdmin = ref(false)

  function setUser(userData) {
    user.value = userData
    isAdmin.value = userData?.isAdmin ?? false
    // Persist to localStorage
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  function logout() {
    user.value = null
    isAdmin.value = false
    localStorage.removeItem('user')
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const userData = JSON.parse(stored)
        setUser(userData)
      } catch (err) {
        console.error('Failed to parse stored user', err)
        logout()
      }
    }
  }

  return {
    user,
    isAdmin,
    setUser,
    logout,
    loadFromStorage
  }
})
