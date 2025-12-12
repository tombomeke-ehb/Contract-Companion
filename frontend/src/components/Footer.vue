<template>
  <footer class="footer">
    <div class="footer-inner">
      <div>© 2025 Contract Companion. {{ $t('footer.rights') }}</div>

      <div class="footer-links">
        <RouterLink :to="{ name: 'privacy' }">{{ $t('footer.privacy') }}</RouterLink>
        <RouterLink :to="{ name: 'terms' }">{{ $t('footer.terms') }}</RouterLink>
        <RouterLink :to="{ name: 'docs' }">{{ $t('footer.docs') }}</RouterLink>
        <RouterLink :to="{ name: 'contact' }">{{ $t('footer.contact') }}</RouterLink>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
