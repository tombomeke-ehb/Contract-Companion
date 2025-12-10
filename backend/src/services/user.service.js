// Dit service-bestand wordt later ingevuld door de DB-developer.
// Hier komen de Oracle queries (user opzoeken / user aanmaken).

export async function findUserByEmail(email) {
  // TODO: Oracle-query om user te vinden op email.
  return null; // placeholder
}

export async function createUser({ name, email, passwordHash }) {
  // TODO: Oracle INSERT-query om user op te slaan.
  return { id: 1, name, email }; // placeholder
}
