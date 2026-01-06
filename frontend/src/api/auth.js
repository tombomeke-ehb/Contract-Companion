// frontend/src/api/auth.js

// Gecentraliseerde authenticatie-logica voor alle auth API-calls

// Basisroute voor alle auth-endpoints aan de backend
const BASE_PATH = "/api/auth";

// Logt een gebruiker in met e-mail/wachtwoord (credentials)
// Stuurt een POST-request naar de backend: VITE_API_URL + /api/auth/login
async function login(credentials) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}${BASE_PATH}/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Verstuur de ingevulde login-gegevens als JSON-body
      body: JSON.stringify(credentials),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  const data = await res.json();

  // JWT-token save for secured requests
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  // Optional: user-info save
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}

// Registreert een nieuwe gebruiker
async function signup(userData) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}${BASE_PATH}/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Verstuur de registratiegegevens als JSON-body
      body: JSON.stringify(userData),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  const data = await res.json();

  // JWT-token save for secured requests
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  // Optional: user-info save
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}

// Verwijdert alle auth-informatie van de client
function logout() {
  // Token and user-info deletion for logout
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export default {
  login,
  signup,
  logout,
};
