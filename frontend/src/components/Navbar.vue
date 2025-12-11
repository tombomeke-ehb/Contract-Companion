<template>
  <header class="navbar">
    <div class="navbar-inner">
      <RouterLink :to="{ name: 'home' }" class="navbar-brand">
        <span class="brand-logo">CC</span>
        {{ $t('nav.brand') }}
      </RouterLink>

      <!-- PUBLIC NAV -->
      <nav v-if="!isAppRoute" class="nav-links">
        <RouterLink :to="{ name: 'home' }">
          {{ $t('nav.features') }}
        </RouterLink>
        <RouterLink :to="{ name: 'docs' }">
          {{ $t('nav.docs') }}
        </RouterLink>
        <RouterLink :to="{ name: 'about' }">
          {{ $t('nav.about') }}
        </RouterLink>
      </nav>

      <!-- APP NAV -->
      <nav v-else class="nav-links">
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

      <div class="nav-actions">
        <!-- PUBLIC ACTIONS -->
        <template v-if="!isAppRoute">
          <RouterLink :to="{ name: 'login' }" class="btn btn-outline">
            {{ $t('nav.login') }}
          </RouterLink>
          <RouterLink :to="{ name: 'signup' }" class="btn btn-primary">
            {{ $t('nav.signup') }}
          </RouterLink>
        </template>

        <!-- APP ACTIONS -->
        <template v-else>
          <RouterLink :to="{ name: 'home' }" class="btn btn-outline">
            {{ $t('nav.logout') }}
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
