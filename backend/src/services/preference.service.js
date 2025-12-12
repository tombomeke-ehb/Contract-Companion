import db from "../config/db.js";

async function getPreferences(userId) {
  const result = await db.query(
    `SELECT THEME, LANG FROM PREFERENCES WHERE ID_USER = :userId`,
    { userId }
  );

  if (result.rows.length === 0) {
    return { theme: "light", lang: "nl" }; // default values for a new account
  }

  return result.rows[0];
}

async function updatePreferences(userId, theme, lang) {
  const existing = await db.query(
    `SELECT PREF_ID FROM PREFERENCES WHERE ID_USER = :userId`,
    { userId }
  );

  if (existing.rows.length === 0) {
    await db.query(
      `INSERT INTO PREFERENCES (ID_USER, THEME, LANG)
       VALUES (:userId, :theme, :lang)`,
      { userId, theme, lang }
    );
  } else {
    await db.query(
      `UPDATE PREFERENCES
       SET THEME = :theme, LANG = :lang
       WHERE ID_USER = :userId`,
      { userId, theme, lang }
    );
  }
}

export default { getPreferences, updatePreferences };
