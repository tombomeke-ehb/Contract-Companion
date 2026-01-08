import oracledb from "oracledb";
import { query } from "../config/db.js";

// Helper: Read Oracle LOB (CLOB) to string
async function readLobToString(lob) {
  return new Promise((resolve, reject) => {
    if (!lob) return resolve(null);
    let str = '';
    lob.setEncoding('utf8');
    lob.on('data', (chunk) => { str += chunk; });
    lob.on('end', () => resolve(str));
    lob.on('error', reject);
  });
}

// Service for working with contract summaries and risk scores.
// Maps between the SAMENVATTING (summary) table and higher level objects used in controllers.

// Create a new summary row for a given document, now with JSON analysis
export async function createSummary({ idDoc, text, riskScore, analysisJson }) {
  const sql = `
    INSERT INTO SAMENVATTING (ID_DOC, TEKST, RISK_SCORE, ANALYSE_JSON)
    VALUES (:idDoc, :text, :riskScore, :analysisJson)
    RETURNING SAMENVATTING_ID INTO :outId
  `;

  const binds = {
    // Explicit types so oracledb doesn't complain about bind data.
    idDoc: { val: idDoc, type: oracledb.NUMBER },
    text: { val: text, type: oracledb.STRING },
    riskScore: { val: riskScore, type: oracledb.NUMBER },
    analysisJson: { val: analysisJson, type: oracledb.CLOB },
    outId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
  };

  const result = await query(sql, binds, { autoCommit: true });
  const newId = result.outBinds?.outId?.[0] ?? null;

  return { id: newId, idDoc, text, riskScore };
}

// Fetch a single summary for a given document ID, now with JSON analysis
export async function getSummaryByDocumentId(idDoc) {
  const sql = `
    SELECT SAMENVATTING_ID, ID_DOC, TEKST, RISK_SCORE, ANALYSE_JSON
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
    analysisJson: row.ANALYSE_JSON ? JSON.parse(row.ANALYSE_JSON) : null,
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

// Create a new document along with its summary, now with JSON analysis
export async function createDocumentWithSummary({
  userId,
  docType,
  title,
  description,
  fullText,
  riskScore,
  endDate,
  analysisJson
}) {
  // 1) Insert into DOCUMENTEN with a generated ID_DOC using a sequence-less pattern
  const insertDocSql = `
    INSERT INTO DOCUMENTEN (ID_DOC, ID_USER, DOC_TYPE, TITEL, BESCHRIJVING, UPLOADDATUM, EIND_DATEBOOL)
    VALUES ((SELECT NVL(MAX(ID_DOC), 0) + 1 FROM DOCUMENTEN), :userId, :docType, :title, :description, SYSDATE, :endDateBool)
    RETURNING ID_DOC INTO :outIdDoc
  `;

  const docBinds = {
    userId: { val: userId, type: oracledb.NUMBER },
    docType: { val: docType, type: oracledb.NUMBER },
    title: { val: title, type: oracledb.STRING },
    description: { val: description, type: oracledb.STRING },
    endDateBool: { val: endDate ? 1 : 0, type: oracledb.NUMBER },
    outIdDoc: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
  };

  const docResult = await query(insertDocSql, docBinds, { autoCommit: true });
  const newDocId = docResult.outBinds?.outIdDoc?.[0];

  // 2) Optional insert into EINDDATUM if endDate is provided
  if (endDate) {
    const insertEndSql = `
      INSERT INTO EINDDATUM (ID_DATE, ID_DOC, EIND_DATE)
      VALUES ((SELECT NVL(MAX(ID_DATE), 0) + 1 FROM EINDDATUM), :idDoc, :endDate)
    `;

    await query(
      insertEndSql,
      {
        idDoc: { val: newDocId, type: oracledb.NUMBER },
        endDate: { val: endDate, type: oracledb.DATE },
      },
      { autoCommit: true }
    );
  }

  // 3) Insert into SAMENVATTING for this document
  const insertSummarySql = `
    INSERT INTO SAMENVATTING (ID_DOC, TEKST, RISK_SCORE, ANALYSE_JSON)
    VALUES (:idDoc, :text, :riskScore, :analysisJson)
    RETURNING SAMENVATTING_ID INTO :outId
  `;

  const summaryBinds = {
    idDoc: { val: newDocId, type: oracledb.NUMBER },
    text: { val: fullText, type: oracledb.STRING },
    riskScore: { val: riskScore, type: oracledb.NUMBER },
    analysisJson: { val: analysisJson, type: oracledb.CLOB },
    outId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
  };

  const summaryResult = await query(insertSummarySql, summaryBinds, { autoCommit: true });
  const newSummaryId = summaryResult.outBinds?.outId?.[0];

  return {
    docId: newDocId,
    summaryId: newSummaryId,
  };
}

export async function listUserContracts({ userId, isAdmin }) {
  const sql = `
    SELECT
      d.ID_DOC,
      d.TITEL,
      d.BESCHRIJVING,
      d.UPLOADDATUM,
      s.RISK_SCORE,
      u.NAME AS USER_NAME,
      u.SURNAME AS USER_SURNAME,
      u.EMAIL AS USER_EMAIL
    FROM DOCUMENTEN d
    LEFT JOIN SAMENVATTING s ON s.ID_DOC = d.ID_DOC
    LEFT JOIN USERS u ON u.ID_USER = d.ID_USER
    WHERE (:isAdmin = 1 OR d.ID_USER = :userId)
    ORDER BY d.UPLOADDATUM DESC, d.ID_DOC DESC
  `;

  const binds = {
    isAdmin: isAdmin ? 1 : 0,
    userId: userId ?? null,
  };

  const result = await query(sql, binds);

  return (result.rows || []).map((row) => {
    const nameParts = [];
    if (row.USER_NAME) nameParts.push(row.USER_NAME);
    if (row.USER_SURNAME) nameParts.push(row.USER_SURNAME);
    const displayName = nameParts.join(" ") || row.USER_EMAIL || "Unknown";

    let risk = "medium";
    let riskLabel = "Medium risk";
    const score = row.RISK_SCORE;
    if (typeof score === "number") {
      if (score >= 7) {
        risk = "high";
        riskLabel = "High risk";
      } else if (score <= 3) {
        risk = "low";
        riskLabel = "Low risk";
      }
    }

    return {
      id: row.ID_DOC,
      title: row.TITEL || "Contract",
      subtitle: `Uploaded by ${displayName}  ${row.BESCHRIJVING || ""}`.trim(),
      riskScore: score ?? null,
      risk,
      riskLabel,
      date: row.UPLOADDATUM,
    };
  });
}

// Pas ook getContractWithSummary aan zodat analysisJson wordt meegegeven
export async function getContractWithSummary(idDoc) {
  const sql = `
    SELECT
      d.ID_DOC,
      d.TITEL,
      d.BESCHRIJVING,
      d.UPLOADDATUM,
      s.TEKST,
      s.RISK_SCORE,
      s.ANALYSE_JSON
    FROM DOCUMENTEN d
    LEFT JOIN SAMENVATTING s ON s.ID_DOC = d.ID_DOC
    WHERE d.ID_DOC = :idDoc
  `;

  const result = await query(sql, { idDoc });
  if (!result.rows || result.rows.length === 0) {
    console.log('[getContractWithSummary] No contract found for ID_DOC:', idDoc);
    return null;
  }

  const row = result.rows[0];
  // Handle Oracle LOBs for text and analysisJson
  let parsedJson = null;
  let textStr = null;
  if (row.ANALYSE_JSON) {
    if (typeof row.ANALYSE_JSON === 'string') {
      try {
        parsedJson = JSON.parse(row.ANALYSE_JSON);
      } catch (e) {
        console.error('[getContractWithSummary] Failed to parse ANALYSE_JSON for ID_DOC:', idDoc, e, row.ANALYSE_JSON);
      }
    } else if (typeof row.ANALYSE_JSON === 'object' && row.ANALYSE_JSON !== null && typeof row.ANALYSE_JSON.on === 'function') {
      // It's a LOB
      const lobStr = await readLobToString(row.ANALYSE_JSON);
      try {
        parsedJson = JSON.parse(lobStr);
      } catch (e) {
        console.error('[getContractWithSummary] Failed to parse LOB ANALYSE_JSON for ID_DOC:', idDoc, e, lobStr);
      }
    }
  } else {
    console.log('[getContractWithSummary] No ANALYSE_JSON for ID_DOC:', idDoc);
  }
  if (row.TEKST) {
    if (typeof row.TEKST === 'string') {
      textStr = row.TEKST;
    } else if (typeof row.TEKST === 'object' && row.TEKST !== null && typeof row.TEKST.on === 'function') {
      textStr = await readLobToString(row.TEKST);
    }
  }
  return {
    id: row.ID_DOC,
    title: row.TITEL || "Contract",
    description: row.BESCHRIJVING || "",
    uploadedAt: row.UPLOADDATUM,
    text: textStr,
    riskScore: row.RISK_SCORE,
    analysisJson: parsedJson,
  };
}

// Verwijder een contract en bijbehorende samenvatting
export async function deleteContractById(idDoc) {
  console.log('[deleteContractById] Start for ID_DOC:', idDoc);
  const tables = ['KALENDER', 'EINDDATUM', 'ANALYSE_JSON', 'SAMENVATTING', 'DOCUMENTEN'];
  for (const table of tables) {
    const result = await query(`DELETE FROM ${table} WHERE ID_DOC = :idDoc`, { idDoc }, { autoCommit: true });
    console.log(`[deleteContractById] Deleted from ${table}:`, result.rowsAffected);
  }
  console.log('[deleteContractById] Done for ID_DOC:', idDoc);
}
