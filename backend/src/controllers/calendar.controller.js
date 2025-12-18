// backend/src/controllers/calendar.controller.js
// Generates ICS calendar events for contract reminders

import { authenticate } from '../middleware/auth.js'

function toIcsDate(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  // Ensure UTC format without separators: YYYYMMDDTHHmmssZ
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function sanitize(text = '') {
  // Escape commas and semicolons per RFC5545
  return String(text).replace(/,/g, '\\,').replace(/;/g, '\\;')
}

export async function generateIcs(req, res) {
  // Auth handled by route; simple validation here
  const { title = 'Contract reminder', description = '', location = '', start, end } = req.query

  const startUtc = toIcsDate(start)
  if (!startUtc) {
    return res.status(400).json({ error: 'Invalid or missing start date' })
  }

  let endUtc = toIcsDate(end)
  if (!endUtc) {
    // Default duration: 1 hour
    const startDate = new Date(start)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
    endUtc = toIcsDate(endDate)
  }

  const nowUtc = toIcsDate(new Date())
  const uid = `${Date.now()}-${Math.random().toString(16).slice(2)}@contract-companion`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Contract Companion//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${sanitize(title)}`,
    description ? `DESCRIPTION:${sanitize(description)}` : null,
    location ? `LOCATION:${sanitize(location)}` : null,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n')

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="contract-reminder.ics"')
  return res.status(200).send(ics)
}
