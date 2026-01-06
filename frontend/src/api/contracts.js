import http from './httpClient'

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Base path for all contract-related endpoints on the backend
const BASE_PATH = "/api/contracts";

/**
 * Upload a single contract file to the backend.
 *
 * @param {File} file - The contract file selected in the browser.
 * @param {string} contractType - The type of the contract.
 * @param {string} notes - Additional notes for the contract.
 * @returns {Promise<any>} Parsed JSON response from the backend.
 */
export async function uploadContract(file, contractType = '', notes = '') {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const form = new FormData();
  // Field name MUST match upload.single('file') in backend/src/middleware/upload.js
  form.append("file", file);
  form.append("contractType", contractType);
  form.append("notes", notes);

  const res = await fetch(`${API_BASE_URL}${BASE_PATH}/upload`, {
    method: "POST",
    headers: {
      // JWT-token meesturen voor beveiligde backend routes
      Authorization: `Bearer ${token}`,
    },
    body: form,
    credentials: "include",
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

// Admin common contracts CRUD
export async function getCommonContracts() {
  return http.get(`${BASE_PATH}/common`);
}

export async function createCommonContract(payload) {
  return http.post(`${BASE_PATH}/common`, payload);
}

export async function updateCommonContract(id, payload) {
  return http.put(`${BASE_PATH}/common/${encodeURIComponent(id)}`, payload);
}

export async function deleteCommonContract(id) {
  return http.del(`${BASE_PATH}/common/${encodeURIComponent(id)}`);
}
