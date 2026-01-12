// frontend/src/api/people.js
// Centralized API helpers for managing people/users resources from the frontend.

import http from './httpClient'

// Base path for all people-related endpoints on the backend.
const BASE_PATH = '/api/people'

/**
 * Delete a person by ID from the database.
 *
 * The backend route expects a DELETE request to:
 * DELETE /api/people/:id
 *
 * Backend SQL query template (when database is ready):
 * DELETE FROM users WHERE id = ?
 *
 * @param {number} personId - The ID of the person to delete
 * @returns {Promise<any>} Response from the backend
 */
export async function deletePerson(personId) {
  return await http.del(`${BASE_PATH}/${personId}`)
}

// Delete only the contract data for a person (keep the account)
export async function deletePersonData(personId) {
  return await http.del(`${BASE_PATH}/${personId}/data`)
}

/**
 * Get all people from the database.
 *
 * The backend route expects a GET request to:
 * GET /api/people
 *
 * @returns {Promise<any>} Array of people objects
 */
export async function getPeople() {
  return await http.get(BASE_PATH)
}

/**
 * Create a new person in the database.
 *
 * The backend route expects a POST request to:
 * POST /api/people
 *
 * Backend SQL query template (when database is ready):
 * INSERT INTO users (name, surname, email, phone, password) VALUES (?, ?, ?, ?, ?)
 *
 * @param {Object} personData - The person data
 * @param {string} personData.name - Person's first name
 * @param {string} personData.surname - Person's last name
 * @param {string} personData.email - Person's email
 * @param {string} personData.phone - Person's phone number
 * @param {string} personData.password - Person's hashed password
 * @returns {Promise<any>} Created person object with ID
 */
export async function createPerson(personData) {
  return await http.post(BASE_PATH, personData)
}
