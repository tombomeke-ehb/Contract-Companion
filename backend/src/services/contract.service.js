import oracledb from "oracledb";
import { query } from "../config/db.js";

// Service for working with contract summaries and risk scores.
// Maps between the SAMENVATTING (summary) table and higher level objects used in controllers.

// Create a new summary row for a given document.
export async function createSummary({ idDoc, text, riskScore }) {
  const sql = `
    INSERT INTO SAMENVATTING (ID_DOC, TEKST, RISK_SCORE)
    VALUES (:idDoc, :text, :riskScore)
    RETURNING SAMENVATTING_ID INTO :outId
  `;

  const binds = {
    // Explicit types so oracledb doesn't complain about bind data.
    idDoc: { val: idDoc, type: oracledb.NUMBER },
    text: { val: text, type: oracledb.STRING },
    riskScore: { val: riskScore, type: oracledb.NUMBER },
    outId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
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
