import db from "../config/db.js";

export async function findByUserId(userId) {
  const sql = `
    SELECT PREF_ID, ID_USER, THEME, LANG, REGION
    FROM PREFERENCES
    WHERE ID_USER = :userId
  `;

  const result = await db.query(sql, { userId });

  if (result.rows.length === 0) return null;

  return result.rows[0];
}

export async function updateForUser(userId, { theme, language, region }) {
  const updateSql = `
    UPDATE PREFERENCES
    SET THEME = :theme,
        LANG = :lang,
        REGION = :region
    WHERE ID_USER = :userId
  `;

  const binds = {
    theme,
    lang: language,
    region,
    userId,
  };

  const updateResult = await db.query(updateSql, binds);

  if (updateResult.rowsAffected === 0) {
    const insertSql = `
      INSERT INTO PREFERENCES (ID_USER, THEME, LANG, REGION)
      VALUES (:userId, :theme, :lang, :region)
    `;

    await db.query(insertSql, binds);
  }
}
