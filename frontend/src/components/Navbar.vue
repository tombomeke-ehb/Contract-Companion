<template>
  <header class="navbar">
    <div class="navbar-inner">
      <!-- Hamburger menu button (mobile only) -->
      <button
        class="menu-toggle"
        :class="{ active: menuOpen }"
        @click="toggleMenu"
        aria-label="Open menu"
      >
        <span class="menu-toggle-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      <!-- Brand/logo -->
      <RouterLink :to="{ name: 'home' }" class="navbar-brand">
        <span class="brand-logo">CC</span>
        Contract Companion
      </RouterLink>
      <!-- Navigation links -->
      <nav
        :class="['nav-links', { active: menuOpen }]"
        v-if="!isAppRoute"
      >
        <RouterLink :to="{ name: 'home' }">Features</RouterLink>
        <RouterLink :to="{ name: 'docs' }">Documentation</RouterLink>
        <RouterLink :to="{ name: 'about' }">About</RouterLink>
        <RouterLink :to="{ name: 'login' }">Login</RouterLink>
        <RouterLink :to="{ name: 'signup' }">Sign Up</RouterLink>
      </nav>
      <nav
        :class="['nav-links', { active: menuOpen }]"
        v-else
      >
        <RouterLink :to="{ name: 'dashboard' }">Dashboard</RouterLink>
        <RouterLink :to="{ name: 'upload' }">Upload</RouterLink>
        <RouterLink :to="{ name: 'settings' }">Settings</RouterLink>
        <RouterLink :to="{ name: 'common-contracts' }">Common Contracts</RouterLink>
        <RouterLink :to="{ name: 'home' }">Logout</RouterLink>
      </nav>
      <!-- Actions (desktop only) -->
      <div class="nav-actions" v-if="!isMobile">
        <template v-if="!isAppRoute">
          <RouterLink :to="{ name: 'login' }" class="btn btn-outline">Login</RouterLink>
          <RouterLink :to="{ name: 'signup' }" class="btn btn-primary">Sign Up</RouterLink>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'home' }" class="btn btn-outline">Logout</RouterLink>
        </template>
      </div>
    </div>
    <!-- Overlay -->
    <div
      class="nav-overlay"
      :class="{ active: menuOpen }"
      @click="closeMenu"
    ></div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()
const appRouteNames = [
  'dashboard',
  'upload',
  'report-detail',
  'settings',
  'common-contracts'
]
const isAppRoute = computed(() => appRouteNames.includes(route.name))

const menuOpen = ref(false)
const isMobile = ref(window.innerWidth <= 768)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  document.body.classList.toggle('menu-open', menuOpen.value)
}
function closeMenu() {
  menuOpen.value = false
  document.body.classList.remove('menu-open')
}
function handleResize() {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) closeMenu()
}
onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
