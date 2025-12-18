<template>
  <div class="toast-host" aria-live="polite" aria-relevant="additions">
    <div
      v-for="toast in store.toasts"
      :key="toast.id"
      class="toast"
      :class="`toast--${toast.variant}`"
      role="status"
    >
      <div class="toast__content">
        <div class="toast__title">{{ toast.title }}</div>
        <div v-if="toast.message" class="toast__message">{{ toast.message }}</div>
      </div>
      <button class="toast__close" type="button" @click="store.dismiss(toast.id)" aria-label="Close">
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notificationStore'

const store = useNotificationStore()
</script>
