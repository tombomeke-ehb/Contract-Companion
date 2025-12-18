// frontend/src/utils/calendar.js
// Helpers for calendar links and ICS generation (client-side)

function pad(n) {
  return String(n).padStart(2, '0')
}

function toUtcString(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export function buildGoogleCalendarUrl({ title, description = '', location = '', start, end }) {
  const startUtc = toUtcString(start)
  const endUtc = end ? toUtcString(end) : toUtcString(new Date(new Date(start).getTime() + 60 * 60 * 1000))
  if (!startUtc || !endUtc) return ''

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Contract reminder',
    details: description || '',
    location: location || '',
    dates: `${startUtc}/${endUtc}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function buildIcs({ title, description = '', location = '', start, end }) {
  const startUtc = toUtcString(start)
  const endUtc = end ? toUtcString(end) : toUtcString(new Date(new Date(start).getTime() + 60 * 60 * 1000))
  if (!startUtc || !endUtc) return null
  const nowUtc = toUtcString(new Date())
  const uid = `${Date.now()}-${Math.random().toString(16).slice(2)}@contract-companion`

  const escape = (val = '') => String(val).replace(/,/g, '\\,').replace(/;/g, '\\;')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Contract Companion//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escape(title || 'Contract reminder')}`,
    description ? `DESCRIPTION:${escape(description)}` : null,
    location ? `LOCATION:${escape(location)}` : null,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n')
}

export function downloadIcsClient(event, filename = 'contract-reminder.ics') {
  const ics = buildIcs(event)
  if (!ics) return false
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return true
}
