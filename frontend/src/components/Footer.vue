<template>
  <footer class="footer">
    <div class="footer-inner">
      <div>© 2025 Contract Companion. All rights reserved.</div>      <div class="footer-links">
        <RouterLink :to="{ name: 'privacy' }">Privacy</RouterLink>
        <RouterLink :to="{ name: 'terms' }">Terms</RouterLink>
        <RouterLink :to="{ name: 'docs' }">Documentation</RouterLink>
        <RouterLink :to="{ name: 'contact' }">Contact</RouterLink>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
