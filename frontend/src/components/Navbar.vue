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
        <RouterLink :to="{ name: isAdmin ? 'admin-dashboard' : 'dashboard' }">
          {{ $t('nav.dashboard') }}
        </RouterLink>
        <RouterLink :to="{ name: 'upload' }">
          {{ $t('nav.upload') }}
        </RouterLink>
        <RouterLink :to="{ name: 'settings' }">
          {{ $t('nav.settings') }}
        </RouterLink>
        <RouterLink :to="{ name: isAdmin ? 'admin-common-contracts' : 'common-contracts' }">
          {{ $t('nav.commonContracts') }}
        </RouterLink>
      </nav>
      <!-- Actions (desktop only) -->
      <div class="nav-actions" v-if="!isMobile">
        <!-- Notification badge & dropdown -->
        <div
          v-if="isLoggedIn"
          class="notification-badge-wrapper"
          ref="notificationPanel"
        >
          <button
            type="button"
            class="notification-bell"
            :aria-expanded="showNotifications.toString()"
            aria-haspopup="true"
            @click="toggleNotifications"
          >
            <svg class="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span
              v-if="badgeCount > 0"
              class="notification-badge"
              :title="`${badgeCount} notification(s)`"
            >
              {{ badgeCount }}
            </span>
          </button>
          <div v-if="showNotifications" class="notification-dropdown" role="menu">
            <p class="notification-dropdown__title">Notifications</p>
            <div v-if="inboxList.length === 0" class="notification-dropdown__empty">
              No notifications
            </div>
            <ul v-else class="notification-list">
              <li
                v-for="toast in inboxList"
                :key="toast.id"
                class="notification-item"
              >
                <button
                  type="button"
                  class="notification-item__button"
                  @click="handleNotificationClick(toast)"
                >
                  <div class="notification-item__title">{{ toast.title }}</div>
                  <div v-if="toast.message" class="notification-item__body">{{ toast.message }}</div>
                </button>
              </li>
            </ul>
          </div>
        </div>
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
import { storeToRefs } from 'pinia'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const notifications = useNotificationStore()
const { inbox: inboxRef, expiringContractCount } = storeToRefs(notifications)

// Ensure user is hydrated on first render (idempotent)
userStore.loadFromStorage()
const { t } = useI18n()

const inboxList = computed(() => inboxRef?.value ?? [])
const badgeCount = computed(() => inboxList.value.length)
const showNotifications = ref(false)
const notificationPanel = ref(null)

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
const isAdmin = computed(() => userStore.user?.isAdmin === true)

const menuOpen = ref(false)
const isMobile = ref(window.innerWidth <= 768)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  document.body.classList.toggle('menu-open', menuOpen.value)
}
function toggleNotifications() {
  showNotifications.value = !showNotifications.value
}
function closeNotifications() {
  showNotifications.value = false
}
function resolveToastRoute(toast) {
  if (toast?.route) return toast.route
  if (toast?.contractId) return { name: 'report-detail', params: { id: toast.contractId } }
  return null
}
function handleNotificationClick(toast) {
  const target = resolveToastRoute(toast)
  if (target) {
    router.push(target)
  }
  closeNotifications()
}
function handleClickOutside(event) {
  if (!showNotifications.value) return
  const el = notificationPanel.value
  if (el && !el.contains(event.target)) {
    closeNotifications()
  }
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
  const name = userStore.user?.name || userStore.user?.email || ''
  userStore.logout()
  notifications.push({
    title: t('toast.loggedOutTitle'),
    message: name ? t('toast.goodbye', { name }) : t('toast.loggedOutBody'),
    variant: 'info'
  })
  closeMenu()
  router.push({ name: 'home' })
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
})
</script>
