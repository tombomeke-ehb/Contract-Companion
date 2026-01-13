import http from './httpClient'

const BASE_PATH = '/api/preferences'

export async function getPreferences(userId) {
  return http.get(`${BASE_PATH}/${userId}`)
}

export async function updatePreferences(userId, payload) {
  return http.put(`${BASE_PATH}/${userId}`, payload)
}
