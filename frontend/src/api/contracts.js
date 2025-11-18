// frontend/src/api/contracts.js

import axios from "axios";

const API = "http://localhost:3000/api/contracts";

export async function uploadContract(file) {
  const form = new FormData();
  form.append("contract", file);

  const res = await axios.post(`${API}/upload`, form);
  return res.data;
}

export async function getContracts() {
  const res = await axios.get(API);
  return res.data;
}
