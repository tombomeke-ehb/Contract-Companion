// frontend/src/stores/notificationStore.js
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

let nextId = 1

export const useNotificationStore = defineStore('notifications', () => {
  const toasts = ref([])
  const inbox = ref([]) // persistent list of all notifications
  const expiringContractCount = ref(0)

  const visibleToasts = computed(() => toasts.value)
  const inboxItems = computed(() => inbox.value)

  function push({
    title,
    message = '',
    variant = 'info', // 'success' | 'info' | 'warning' | 'danger'
    timeout = 3500,
    isContractExpiry = false
  }) {
    const id = nextId++
    const toast = { id, title, message, variant, timeout, isContractExpiry, createdAt: Date.now() }
    toasts.value = [...toasts.value, toast]
    inbox.value = [toast, ...inbox.value]

    // If it's a contract expiry notification, increment the count
    if (isContractExpiry) {
      expiringContractCount.value++
    }

    if (timeout && timeout > 0) {
      window.setTimeout(() => dismiss(id), timeout)
    }

    return id
  }

  function dismiss(id) {
    const toast = toasts.value.find(t => t.id === id)
    if (toast?.isContractExpiry && expiringContractCount.value > 0) {
      expiringContractCount.value--
    }
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function clear() {
    toasts.value = []
    inbox.value = []
    expiringContractCount.value = 0
  }

  function setExpiringContractCount(count) {
    expiringContractCount.value = count
  }

  return { 
    toasts: visibleToasts, 
    inbox: inboxItems,
    expiringContractCount: computed(() => expiringContractCount.value),
    push, 
    dismiss, 
    clear,
    setExpiringContractCount
  }
})

