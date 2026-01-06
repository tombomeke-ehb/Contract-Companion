<!-- src/App.vue -->
<template>
  <div class="page">
    <Navbar />

    <main>
      <RouterView />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { useUserStore } from './stores/userStore'
import { useRouter } from 'vue-router'
import { startSessionTimeout, stopSessionTimeout } from './utils/sessionTimeout'

const API_BASE_URL = import.meta.env.VITE_API_URL

const userStore = useUserStore()
const router = useRouter()

const sessionTimeoutMinutes = ref(30)
let sessionCleanup = null

// --- helper to get auth headers ---
function getAuthHeaders() {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

function handleSessionTimeout() {
  // perform logout
  userStore.logout()
  router.push({ name: 'login' })
  alert('You have been logged out due to inactivity')
}

function startSessionTimeoutWithMinutes() {
  stopSessionTimeoutMonitoring()
  sessionCleanup = startSessionTimeout(
    () => Number(sessionTimeoutMinutes.value) || 30,
    handleSessionTimeout
  )
}

function stopSessionTimeoutMonitoring() {
  if (sessionCleanup) {
    sessionCleanup()
    sessionCleanup = null
  }
  stopSessionTimeout()
}


function sessionListener(e) {
  const val = Number(e?.detail ?? window.sessionTimeoutChanged ?? sessionTimeoutMinutes.value)
  if (!isNaN(val) && val > 0) {
    sessionTimeoutMinutes.value = val
    startSessionTimeoutWithMinutes()
  }
}

onMounted(async () => {
  userStore.loadFromStorage()

  // If a user is already logged in, fetch their preferences to get session timeout
  if (userStore.user?.id) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/preferences/${userStore.user.id}`,
        { headers: getAuthHeaders(), credentials: 'include' }
      )
      if (response.ok) {
        const data = await response.json()
        if (data?.SESSION_TIMEOUT) {
          sessionTimeoutMinutes.value = Number(data.SESSION_TIMEOUT)
        }
      }
    } catch (err) {
      // ignore - fallback to default
    }
  }

  // start listening to activity if user logged in
  if (userStore.user) {
    startSessionTimeoutWithMinutes()
  }

  // Listen for settings changes (session timeout updates)
  window.addEventListener('sessionTimeoutChanged', sessionListener)
})


onBeforeUnmount(() => {
  stopSessionTimeoutMonitoring()
  window.removeEventListener('sessionTimeoutChanged', sessionListener)
})

// If the user logs in/out later, add/remove listeners and (re)schedule
watch(
  () => userStore.user,
  (newUser) => {
    stopSessionTimeoutMonitoring()

    if (newUser) {
      // try to fetch user preferences
      fetch(`${API_BASE_URL}/api/preferences/${newUser.id}`, { 
        headers: getAuthHeaders(),
        credentials: 'include' 
      })
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(data => {
          if (data?.SESSION_TIMEOUT) sessionTimeoutMinutes.value = Number(data.SESSION_TIMEOUT)
          startSessionTimeoutWithMinutes()
        })
        .catch(() => {
          startSessionTimeoutWithMinutes()
        })
    }
  }
)
</script>
