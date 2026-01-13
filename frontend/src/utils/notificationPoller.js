import http from '../api/httpClient'
import { useNotificationStore } from '../stores/notificationStore'
import { useUserStore } from '../stores/userStore'

export async function pollNotifications() {
  const notificationStore = useNotificationStore()
  const userStore = useUserStore()
  if (!userStore.user?.id) return
  try {
    const res = await http.get('/api/notifications')
    if (Array.isArray(res)) {
      // Voeg alleen nieuwe notificaties toe
      res.forEach(n => {
        if (!notificationStore.inbox.some(i => i.id === n.ID)) {
          notificationStore.push({
            title: n.TITLE,
            message: n.MESSAGE,
            variant: n.VARIANT || 'info',
            contractId: n.CONTRACT_ID,
            timeout: 6000
          })
        }
      })
    }
  } catch (e) {
    // ignore
  }
}
