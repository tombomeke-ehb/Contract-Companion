import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isAdmin: (state) => Boolean(state.user?.isAdmin),
  },

  actions: {
    initFromStorage() {
      const token = localStorage.getItem('token')
      const userRaw = localStorage.getItem('user')

      this.token = token || null
      this.user = userRaw ? JSON.parse(userRaw) : null
    },

    setAuth({ token, user }) {
      this.token = token || null
      this.user = user || null
    },

    clearAuth() {
      this.token = null
      this.user = null
    },
  },
})
