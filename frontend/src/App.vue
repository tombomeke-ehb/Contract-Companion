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
import { useUserStore } from './stores/userStore'

const userStore = useUserStore()

// Load user from localStorage on app mount
onMounted(() => {
  userStore.loadFromStorage()
})
</script>
