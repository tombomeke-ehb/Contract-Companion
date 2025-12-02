<template>
  <header class="navbar">
    <div class="navbar-inner">
      <RouterLink :to="{ name: 'home' }" class="navbar-brand">
        <span class="brand-logo">CC</span>
        Contract Companion
      </RouterLink>

      <!-- PUBLIC NAV -->
      <nav v-if="!isAppRoute" class="nav-links">
        <RouterLink :to="{ name: 'home' }">Features</RouterLink>
        <RouterLink :to="{ name: 'docs' }">Documentation</RouterLink>
        <RouterLink :to="{ name: 'about' }">About</RouterLink>
      </nav>

      <!-- APP NAV -->
      <nav v-else class="nav-links">
        <RouterLink :to="{ name: 'dashboard' }">Dashboard</RouterLink>
        <RouterLink :to="{ name: 'upload' }">Upload</RouterLink>
        <RouterLink :to="{ name: 'settings' }">Settings</RouterLink>
        <RouterLink :to="{ name: 'common-contracts' }">
          Common Contracts
        </RouterLink>
      </nav>

      <div class="nav-actions">
        <!-- PUBLIC ACTIONS -->
        <template v-if="!isAppRoute">
          <RouterLink :to="{ name: 'login' }" class="btn btn-outline">
            Login
          </RouterLink>
          <RouterLink :to="{ name: 'signup' }" class="btn btn-primary">
            Sign Up
          </RouterLink>
        </template>

        <!-- APP ACTIONS -->
        <template v-else>
          <RouterLink :to="{ name: 'home' }" class="btn btn-outline">
            Logout
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()

// Detect if current route is an app route for navigation
const appRouteNames = [
  'dashboard',
  'upload',
  'report-detail',
  'settings',
  'common-contracts'
]

const isAppRoute = computed(() => appRouteNames.includes(route.name))
</script>
