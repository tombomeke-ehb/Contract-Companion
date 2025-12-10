// frontend/src/api/contracts.js

// Centralized API helpers for working with contract resources from the frontend.
// Keeps HTTP calls in one place so components can stay focused on UI logic.

import http from './httpClient';

// Base path for all contract-related endpoints on the backend.
// The full URL is: VITE_API_URL + BASE_PATH + route
const BASE_PATH = '/api/contracts';

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
  const form = new FormData();
  // Field name MUST match upload.single('file') in backend/src/middleware/upload.js
  form.append('file', file);

  const res = await fetch(`${import.meta.env.VITE_API_URL}${BASE_PATH}/upload`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * Fetch the list of stored contracts from the backend.
 *
 * This assumes there is a GET /api/contracts route that returns
 * an array of contract summaries.
 */
export async function getContracts() {
  return http.get(BASE_PATH);
}
