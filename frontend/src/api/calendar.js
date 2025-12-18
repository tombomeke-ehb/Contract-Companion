import { saveAs } from './downloadHelper'

const API_BASE_URL = import.meta.env.VITE_API_URL

function buildQuery(params) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, v)
  })
  return search.toString()
}

export async function downloadServerIcs(event, filename = 'contract-reminder.ics') {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not authenticated')

  const query = buildQuery({
    title: event.title,
    description: event.description,
    location: event.location,
    start: event.start,
    end: event.end,
  })
  const res = await fetch(`${API_BASE_URL}/api/calendar/event.ics?${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ICS download failed: ${res.status} ${text}`)
  }

  const blob = await res.blob()
  saveAs(blob, filename)
}
