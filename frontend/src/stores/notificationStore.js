// frontend/src/stores/notificationStore.js
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

let nextId = 1

export const useNotificationStore = defineStore('notifications', () => {
  const toasts = ref([])

  const visibleToasts = computed(() => toasts.value)

  function push({
    title,
    message = '',
    variant = 'info', // 'success' | 'info' | 'warning' | 'danger'
    timeout = 3500
  }) {
    const id = nextId++
    const toast = { id, title, message, variant, timeout }
    toasts.value = [...toasts.value, toast]

    if (timeout && timeout > 0) {
      window.setTimeout(() => dismiss(id), timeout)
    }

    return id
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function clear() {
    toasts.value = []
  }

  return { toasts: visibleToasts, push, dismiss, clear }
})
