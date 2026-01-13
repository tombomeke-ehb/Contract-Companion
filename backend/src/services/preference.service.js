import db from "../config/db.js";
// Service to manage user preferences
async function getPreferences(userId) {
  const result = await db.query(
    `SELECT THEME, LANG, EXPIRY_REMINDER_DAYS, RISK_ALERTS, RISK_ALERTS_EMAIL, AUTO_DELETE_DAYS FROM PREFERENCES WHERE ID_USER = :userId`,
    { userId }
  );

  if (result.rows.length === 0) {
    return { theme: "light", lang: "nl", expiryReminderDays: 7, riskAlerts: 1, riskAlertsEmail: 1, autoDeleteDays: 30 };
  }
  const row = result.rows[0];
  return {
    theme: row.THEME,
    lang: row.LANG,
    expiryReminderDays: row.EXPIRY_REMINDER_DAYS ?? 7,
    riskAlerts: row.RISK_ALERTS ?? 1,
    riskAlertsEmail: row.RISK_ALERTS_EMAIL ?? 1,
    autoDeleteDays: row.AUTO_DELETE_DAYS ?? 30
  };
}
// Update or insert user preferences
async function updatePreferences(userId, theme, lang, expiryReminderDays, riskAlerts = 1, riskAlertsEmail = 1, autoDeleteDays = 30) {
  const existing = await db.query(
    `SELECT PREF_ID FROM PREFERENCES WHERE ID_USER = :userId`,
    { userId }
  );

  if (existing.rows.length === 0) {
    await db.query(
      `INSERT INTO PREFERENCES (ID_USER, THEME, LANG, EXPIRY_REMINDER_DAYS, RISK_ALERTS, RISK_ALERTS_EMAIL, AUTO_DELETE_DAYS)
       VALUES (:userId, :theme, :lang, :expiryReminderDays, :riskAlerts, :riskAlertsEmail, :autoDeleteDays)`,
      { userId, theme, lang, expiryReminderDays, riskAlerts, riskAlertsEmail, autoDeleteDays }
    );
  } else {
    await db.query(
      `UPDATE PREFERENCES
       SET THEME = :theme, LANG = :lang, EXPIRY_REMINDER_DAYS = :expiryReminderDays, RISK_ALERTS = :riskAlerts, RISK_ALERTS_EMAIL = :riskAlertsEmail, AUTO_DELETE_DAYS = :autoDeleteDays
       WHERE ID_USER = :userId`,
      { userId, theme, lang, expiryReminderDays, riskAlerts, riskAlertsEmail, autoDeleteDays }
    );
  }
}

export default { getPreferences, updatePreferences };
