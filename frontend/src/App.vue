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
import { onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()

// Load auth state (token + user) from localStorage on app mount
onMounted(() => {
  authStore.initFromStorage()
})
</script>
