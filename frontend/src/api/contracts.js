// frontend/src/api/contracts.js

import axios from 'axios'

const API = 'http://localhost:3000/api/contracts'

export async function uploadContract(file) {
  const form = new FormData()
  // Field name must match upload.single('file') in the backend
  form.append('file', file)

  const res = await axios.post(`${API}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function getContracts() {
  const res = await axios.get(API)
  return res.data
}
