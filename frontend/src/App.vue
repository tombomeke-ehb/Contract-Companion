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

const API_BASE_URL = import.meta.env.VITE_API_URL

const userStore = useUserStore()
const router = useRouter()

const sessionTimeoutMinutes = ref(30)
let idleTimer = null

// --- helper to get auth headers ---
function getAuthHeaders() {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
}

function scheduleIdleLogout() {
  clearIdleTimer()
  const ms = (Number(sessionTimeoutMinutes.value) || 30) * 60 * 1000
  idleTimer = setTimeout(() => {
    // perform logout
    userStore.logout()
    router.push({ name: 'login' })
    alert('You have been logged out due to inactivity')
  }, ms)
}

function resetIdleTimer() {
  if (!userStore.user) return
  scheduleIdleLogout()
}

function addActivityListeners() {
  const events = ['mousemove', 'mousedown', 'keydown', 'touchstart']
  events.forEach((ev) => window.addEventListener(ev, resetIdleTimer))
}

function removeActivityListeners() {
  const events = ['mousemove', 'mousedown', 'keydown', 'touchstart']
  events.forEach((ev) => window.removeEventListener(ev, resetIdleTimer))
}


function sessionListener(e) {
  const val = Number(e?.detail ?? window.sessionTimeoutChanged ?? sessionTimeoutMinutes.value)
  if (!isNaN(val) && val > 0) {
    sessionTimeoutMinutes.value = val
    scheduleIdleLogout()
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
    addActivityListeners()
    scheduleIdleLogout()
  }

  // Listen for settings changes (session timeout updates)
  window.addEventListener('sessionTimeoutChanged', sessionListener)
})


onBeforeUnmount(() => {
  clearIdleTimer()
  removeActivityListeners()
  window.removeEventListener('sessionTimeoutChanged', sessionListener)
})

// If the user logs in/out later, add/remove listeners and (re)schedule
watch(
  () => userStore.user,
  (newUser) => {
    clearIdleTimer()
    removeActivityListeners()

    if (newUser) {
      // try to fetch user preferences
      fetch(`${API_BASE_URL}/api/preferences/${newUser.id}`, { 
        headers: getAuthHeaders(),
        credentials: 'include' 
      })
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(data => {
          if (data?.SESSION_TIMEOUT) sessionTimeoutMinutes.value = Number(data.SESSION_TIMEOUT)
          scheduleIdleLogout()
          addActivityListeners()
        })
        .catch(() => {
          scheduleIdleLogout()
          addActivityListeners()
        })
    }
  }
)
</script>
