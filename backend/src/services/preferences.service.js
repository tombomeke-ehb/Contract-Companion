import db from "../config/db.js";
// Service to manage user preferences
export async function findByUserId(userId) {
  const sql = `
    SELECT PREF_ID, ID_USER, THEME, LANG, REGION, NVL(SESSION_TIMEOUT, 30) AS SESSION_TIMEOUT
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
export async function updateForUser(userId, { theme, language, region, sessionTimeout }) {
  console.log('[preferences.service] updateForUser', { userId, theme, language, region, sessionTimeout })

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
        SESSION_TIMEOUT = :sessionTimeout
    WHERE ID_USER = :userId
  `;

  const binds = {
    theme,
    lang: language,
    region,
    sessionTimeout: sessionTimeout ?? 30,
    userId,
  };

  // Log hex van oude waarde vóór update
  const oldResult = await db.query(
    `SELECT THEME FROM PREFERENCES WHERE ID_USER = :userId`,
    { userId }
  );
  if (oldResult.rows && oldResult.rows[0]) {
    const oldTheme = oldResult.rows[0].THEME || '';
    console.log('[preferences.service] oude theme vóór update:', oldTheme, Array.from(oldTheme).map(c => c.charCodeAt(0).toString(16)).join(' '));
  }
  // Log hex van nieuwe waarde
  const newTheme = theme || '';
  console.log('[preferences.service] nieuwe theme voor update:', newTheme, Array.from(newTheme).map(c => c.charCodeAt(0).toString(16)).join(' '));

  // --- Fix: update werkt niet als ID_USER geen unieke waarde is ---
  // Probeer eerst update op basis van PREF_ID als fallback
  let updateResult = await db.query(updateSql, binds);
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
            SESSION_TIMEOUT = :sessionTimeout
        WHERE PREF_ID = :prefId
      `;
      updateResult = await db.query(updateByIdSql, { ...binds, prefId });
      console.log('[preferences.service] updateForUser (by PREF_ID) updateResult', updateResult)
    }
  }

  // Direct na update: lees de actuele waarde uit de database en log deze
  const checkResult = await db.query(
    `SELECT THEME, LANG, REGION, SESSION_TIMEOUT FROM PREFERENCES WHERE ID_USER = :userId`,
    { userId }
  );
  console.log('[preferences.service] actuele waarde na update:', checkResult.rows)

  if (updateResult.rowsAffected === 0) {
    console.log('[preferences.service] updateForUser: no row updated, inserting new row')
    const insertSql = `
      INSERT INTO PREFERENCES (ID_USER, THEME, LANG, REGION, SESSION_TIMEOUT)
      VALUES (:userId, :theme, :lang, :region, :sessionTimeout)
    `;
    // Insert moet PREF_ID automatisch genereren, maar ID_USER moet geldig zijn (FK!)
    try {
      await db.query(insertSql, binds);
      console.log('[preferences.service] insert succesvol voor user', userId)
    } catch (err) {
      console.error('[preferences.service] insert error', err)
    }
  }
}
