import express from 'express'
import { getUserNotifications, markNotificationRead } from '../services/notification.service.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// GET /api/notifications - alle ongelezen notificaties voor ingelogde user
router.get('/', requireAuth, async (req, res) => {
  const userId = req.user.id
  const notifications = await getUserNotifications(userId)
  res.json(notifications)
})

// POST /api/notifications/:id/read - markeer als gelezen
router.post('/:id/read', requireAuth, async (req, res) => {
  await markNotificationRead(Number(req.params.id))
  res.json({ success: true })
})

export default router
