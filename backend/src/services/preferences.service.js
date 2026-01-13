import db from "../config/db.js";
// Service to manage user preferences
export async function findByUserId(userId) {
  const sql = `
    SELECT PREF_ID, ID_USER, THEME, LANG, REGION, NVL(SESSION_TIMEOUT, 30) AS SESSION_TIMEOUT,
      NVL(EXPIRY_REMINDER_DAYS, 7) AS EXPIRY_REMINDER_DAYS,
      NVL(AUTO_DELETE_DAYS, 30) AS AUTO_DELETE_DAYS,
      NVL(RISK_ALERTS, 1) AS RISK_ALERTS,
      NVL(RISK_ALERTS_EMAIL, 1) AS RISK_ALERTS_EMAIL
    FROM PREFERENCES
    WHERE ID_USER = :userId
  `;

  try {
    const result = await db.query(sql, { userId });

    if (result.rows.length === 0) return null;

    return result.rows[0];
  } catch (err) {
    const msg = String(err.message || err);
    if (/ORA-|invalid identifier/i.test(msg)) {
      const fallback = await db.query(
        `SELECT PREF_ID, ID_USER, THEME, LANG, REGION
         FROM PREFERENCES
         WHERE ID_USER = :userId`,
        { userId }
      );

      if (!fallback.rows || fallback.rows.length === 0) return null;

      const row = fallback.rows[0];
      return {
        ...row,
        SESSION_TIMEOUT: 30,
      };
    }

    throw err;
  }
}
// Update or insert user preferences
export async function updateForUser(userId, { theme, language, region, sessionTimeout, expiryReminderDays, autoDeleteDays, riskAlerts, riskAlertsEmail }) {
  // Check of user bestaat in USERS
  const userCheck = await db.query('SELECT 1 FROM USERS WHERE ID_USER = :userId', { userId });
  if (!userCheck.rows || userCheck.rows.length === 0) {
    throw new Error('User does not exist in USERS. Preferences cannot be set.');
  }

  const updateSql = `
    UPDATE PREFERENCES
    SET THEME = :theme,
        LANG = :lang,
        REGION = :region,
        SESSION_TIMEOUT = :sessionTimeout,
        EXPIRY_REMINDER_DAYS = :expiryReminderDays,
        AUTO_DELETE_DAYS = :autoDeleteDays,
        RISK_ALERTS = :riskAlerts,
        RISK_ALERTS_EMAIL = :riskAlertsEmail
    WHERE ID_USER = :userId
  `;

  const binds = {
    theme,
    lang: language,
    region,
    sessionTimeout: sessionTimeout ?? 30,
    expiryReminderDays: expiryReminderDays ?? 7,
    autoDeleteDays: autoDeleteDays ?? 30,
    riskAlerts: riskAlerts ?? 1,
    riskAlertsEmail: riskAlertsEmail ?? 1,
    userId,
  };

  let updateResult = await db.query(updateSql, binds, { autoCommit: true });
  if (updateResult.rowsAffected === 0) {
    // Zoek PREF_ID voor deze user
    const prefIdResult = await db.query(
      `SELECT PREF_ID FROM PREFERENCES WHERE ID_USER = :userId`,
      { userId }
    );
    if (prefIdResult.rows && prefIdResult.rows[0]) {
      const prefId = prefIdResult.rows[0].PREF_ID;
      const updateByIdSql = `
        UPDATE PREFERENCES
        SET THEME = :theme,
            LANG = :lang,
            REGION = :region,
            SESSION_TIMEOUT = :sessionTimeout,
            EXPIRY_REMINDER_DAYS = :expiryReminderDays,
            AUTO_DELETE_DAYS = :autoDeleteDays,
            RISK_ALERTS = :riskAlerts,
            RISK_ALERTS_EMAIL = :riskAlertsEmail
        WHERE PREF_ID = :prefId
      `;
      updateResult = await db.query(updateByIdSql, { ...binds, prefId }, { autoCommit: true });
    }
  }

  // Insert only if no update happened at all
  if (updateResult.rowsAffected === 0) {
    const insertSql = `
      INSERT INTO PREFERENCES (ID_USER, THEME, LANG, REGION, SESSION_TIMEOUT, EXPIRY_REMINDER_DAYS, AUTO_DELETE_DAYS, RISK_ALERTS, RISK_ALERTS_EMAIL)
      VALUES (:userId, :theme, :lang, :region, :sessionTimeout, :expiryReminderDays, :autoDeleteDays, :riskAlerts, :riskAlertsEmail)
    `;
    try {
      await db.query(insertSql, binds, { autoCommit: true });
    } catch (err) {
      throw err;
    }
  }
}
