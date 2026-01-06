// This file.js provides functions to download calendar events in ICS format from the server
import { saveAs } from './downloadHelper'

const API_BASE_URL = import.meta.env.VITE_API_URL
// Helper function to build query string from parameters
function buildQuery(params) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, v)
  })
  return search.toString()
}

// Function to download ICS file for a calendar event from the server
export async function downloadServerIcs(event, filename = 'contract-reminder.ics') {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('Not authenticated')
  // Build query parameters from event details
  const query = buildQuery({
    title: event.title,
    description: event.description,
    location: event.location,
    start: event.start,
    end: event.end,
  })
  // Make GET request to download the ICS file
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
