import { query } from "../config/db.js";

// Service for working with contract summaries and risk scores.
// Maps between the SAMENVATTING table and higher level objects used in controllers.

// Create a new summary row for a given document.
export async function createSummary({ idDoc, text, riskScore }) {
  const sql = `
    INSERT INTO SAMENVATTING (SAMENVATTING_ID, ID_DOC, TEKST, RISK_SCORE)
    VALUES (SAMENVATTING_SEQ.NEXTVAL, :idDoc, :text, :riskScore)
    RETURNING SAMENVATTING_ID INTO :outId
  `;

  const binds = {
    idDoc,
    text,
    riskScore,
    outId: { dir: 3003, type: 2010 }, // oracledb.BIND_OUT / NUMBER, but we keep types abstract here
  };

  const result = await query(sql, binds, { autoCommit: true });
  const newId = result.outBinds?.outId?.[0] ?? null;

  return { id: newId, idDoc, text, riskScore };
}

// Fetch a single summary for a given document ID.
export async function getSummaryByDocumentId(idDoc) {
  const sql = `
    SELECT SAMENVATTING_ID, ID_DOC, TEKST, RISK_SCORE
    FROM SAMENVATTING
    WHERE ID_DOC = :idDoc
  `;

  const result = await query(sql, { idDoc });
  if (!result.rows || result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.SAMENVATTING_ID,
    idDoc: row.ID_DOC,
    text: row.TEKST,
    riskScore: row.RISK_SCORE,
  };
}

// List summaries, optionally filtered by user later via joins.
export async function listSummaries(limit = 50) {
  const sql = `
    SELECT SAMENVATTING_ID, ID_DOC, TEKST, RISK_SCORE
    FROM SAMENVATTING
    ORDER BY SAMENVATTING_ID DESC
    FETCH FIRST :limit ROWS ONLY
  `;

  const result = await query(sql, { limit });

  return (result.rows || []).map((row) => ({
    id: row.SAMENVATTING_ID,
    idDoc: row.ID_DOC,
    text: row.TEKST,
    riskScore: row.RISK_SCORE,
  }));
}
