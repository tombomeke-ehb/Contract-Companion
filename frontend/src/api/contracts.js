// frontend/src/api/contracts.js

// Centralised API helpers for working with contract resources from the frontend.
// Keeps axios calls in one place so components can stay focused on UI logic.
import axios from 'axios'

// Base URL for all contract-related endpoints on the backend.
const API = 'http://localhost:3000/api/contracts'

/**
 * Upload a single contract file to the backend.
 *
 * The backend route expects a multipart/form-data POST request to
 * POST /api/contracts/upload with a field named "file" that contains
 * the PDF (or other supported document type).
 *
 * @param {File} file - The contract file selected in the browser.
 * @returns {Promise<any>} Parsed JSON response from the backend.
 */
export async function uploadContract(file) {
  const form = new FormData()
  // Field name MUST match upload.single('file') in backend/src/middleware/upload.js
  form.append('file', file)

  const res = await axios.post(`${API}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

/**
 * Fetch the list of stored contracts from the backend.
 *
 * This assumes there is a GET /api/contracts route that returns
 * an array of contract summaries.
 */
export async function getContracts() {
  const res = await axios.get(API)
  return res.data
}
