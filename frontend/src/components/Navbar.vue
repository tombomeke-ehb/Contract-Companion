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

      <!-- PUBLIC NAV: only informational links on desktop -->
      <nav
        v-if="!isAppRoute"
        :id="'primary-navigation'"
        :class="['nav-links', { active: menuOpen }]"
      >
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
        <RouterLink :to="{ name: 'login' }" class="nav-link-auth-mobile">
          {{ $t('nav.login') }}
        </RouterLink>
        <RouterLink :to="{ name: 'signup' }" class="nav-link-auth-mobile">
          {{ $t('nav.signup') }}
        </RouterLink>
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
        <!-- <RouterLink :to="{ name: 'home' }">Logout</RouterLink> -->
      </nav>
      <!-- Actions (desktop only) -->
      <div class="nav-actions" v-if="!isMobile">
        <template v-if="!isAppRoute">
          <RouterLink :to="{ name: 'login' }" class="btn btn-outline">Login</RouterLink>
          <RouterLink :to="{ name: 'signup' }" class="btn btn-primary">Sign Up</RouterLink>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'home' }" class="btn btn-outline">
            {{ $t('nav.logout') }}
          </RouterLink>
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
