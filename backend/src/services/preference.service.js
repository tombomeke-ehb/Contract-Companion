import db from "../config/db.js";
// Service to manage user preferences
async function getPreferences(userId) {
  const result = await db.query(
    `SELECT THEME, LANG, EXPIRY_REMINDER_DAYS FROM PREFERENCES WHERE ID_USER = :userId`,
    { userId }
  );

  if (result.rows.length === 0) {
    return { theme: "light", lang: "nl", expiryReminderDays: 7 };
  }
  const row = result.rows[0];
  return {
    theme: row.THEME,
    lang: row.LANG,
    expiryReminderDays: row.EXPIRY_REMINDER_DAYS ?? 7
  };
}
// Update or insert user preferences
async function updatePreferences(userId, theme, lang, expiryReminderDays) {
  const existing = await db.query(
    `SELECT PREF_ID FROM PREFERENCES WHERE ID_USER = :userId`,
    { userId }
  );

  if (existing.rows.length === 0) {
    await db.query(
      `INSERT INTO PREFERENCES (ID_USER, THEME, LANG, EXPIRY_REMINDER_DAYS)
       VALUES (:userId, :theme, :lang, :expiryReminderDays)`,
      { userId, theme, lang, expiryReminderDays }
    );
  } else {
    await db.query(
      `UPDATE PREFERENCES
       SET THEME = :theme, LANG = :lang, EXPIRY_REMINDER_DAYS = :expiryReminderDays
       WHERE ID_USER = :userId`,
      { userId, theme, lang, expiryReminderDays }
    );
  }
}

export default { getPreferences, updatePreferences };
