// Centrale HTTP-client die de basis-URL uit de Vite-omgeving gebruikt
// In development komt dit uit .env(.development): VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  // Get the token from localStorage
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Include the Authorization header if the token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Standaard fetch-call naar de backend met basis-URL + pad
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    credentials: 'include',
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${text}`);
  }

  try {
    // Probeer de response als JSON te parsen
    return await res.json();
  } catch {
    // Als er geen geldige JSON terugkomt, gewoon null retourneren
    return null;
  }
}

export default {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};
