// frontend/src/api/auth.js

// Centralized authentication API logic

const BASE_PATH = "/api/auth";

async function login(credentials) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}${BASE_PATH}/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  const data = await res.json();

  // JWT-token opslaan voor beveiligde requests
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  // Optioneel: user-info opslaan
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}

function logout() {
  // Token en user-info verwijderen bij logout
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export default {
  login,
  logout,
};
