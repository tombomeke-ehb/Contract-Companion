<template>
  <header class="navbar">
    <div class="navbar-inner">
      <!-- Hamburger menu button (mobile only) -->
      <button
        class="menu-toggle"
        :class="{ active: menuOpen }"
        @click="toggleMenu"
        :aria-expanded="menuOpen.toString()"
        aria-controls="primary-navigation"
        :aria-label="menuOpen ? $t('nav.closeMenu') : $t('nav.openMenu')"
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
        {{ $t('nav.brand') }}
      </RouterLink>

      <!-- PUBLIC NAV -->
      <nav v-if="!isAuthenticated" class="nav-links">
        <RouterLink :to="{ name: 'home' }">
          {{ $t('nav.features') }}
        </RouterLink>
        <RouterLink :to="{ name: 'docs' }">
          {{ $t('nav.docs') }}
        </RouterLink>
        <RouterLink :to="{ name: 'about' }">
          {{ $t('nav.about') }}
        </RouterLink>
        <!-- Login / Sign Up blijven alleen voor mobiel in de drawer -->
        <template v-if="!isLoggedIn">
          <RouterLink :to="{ name: 'login' }" class="nav-link-auth-mobile">
            {{ $t('nav.login') }}
          </RouterLink>
          <RouterLink :to="{ name: 'signup' }" class="nav-link-auth-mobile">
            {{ $t('nav.signup') }}
          </RouterLink>
        </template>
        <button
          v-else
          type="button"
          class="nav-link-auth-mobile"
          @click="handleLogout"
        >
          {{ $t('nav.logout') }}
        </button>
      </nav>
      <nav
        v-else
        :id="'primary-navigation'"
        :class="['nav-links', { active: menuOpen }]"
      >
        <RouterLink :to="{ name: 'dashboard' }">
          {{ $t('nav.dashboard') }}
        </RouterLink>
        <RouterLink :to="{ name: 'upload' }">
          {{ $t('nav.upload') }}
        </RouterLink>
        <RouterLink :to="{ name: 'settings' }">
          {{ $t('nav.settings') }}
        </RouterLink>
        <RouterLink :to="{ name: 'common-contracts' }">
          {{ $t('nav.commonContracts') }}
        </RouterLink>
      </nav>
      <!-- Actions (desktop only) -->
      <div class="nav-actions" v-if="!isMobile">
        <template v-if="!isAppRoute">
          <template v-if="!isLoggedIn">
            <RouterLink :to="{ name: 'login' }" class="btn btn-outline">Login</RouterLink>
            <RouterLink :to="{ name: 'signup' }" class="btn btn-primary">Sign Up</RouterLink>
          </template>
          <button v-else type="button" class="btn btn-outline" @click="handleLogout">
            {{ $t('nav.logout') }}
          </button>
        </template>
        <template v-else>
          <button type="button" class="btn btn-outline" @click="handleLogout">
            {{ $t('nav.logout') }}
          </button>
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
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const appRouteNames = [
  'dashboard',
  'upload',
  'report-detail',
  'settings',
  'common-contracts',
  'admin-dashboard'
]
const isAppRoute = computed(() => appRouteNames.includes(route.name))
const isLoggedIn = computed(() => !!userStore.user)
const isAuthenticated = computed(() => !!userStore.user)

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
function handleLogout() {
  userStore.logout()
  closeMenu()
  router.push({ name: 'home' })
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
