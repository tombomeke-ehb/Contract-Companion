import { query, execute } from "../config/db.js";

// Service for working with contract summaries and risk scores.
// Maps between the SAMENVATTING (summary) table and higher level objects used in controllers.

// Create a new summary row for a given document, now with JSON analysis
export async function createSummary({ idDoc, text, analysisJson }) {
  const result = await execute(
    `INSERT INTO SAMENVATTING (ID_DOC, SUMMARY, KEY_CLAUSES, RED_FLAGS)
     VALUES (:idDoc, :text, :keyClauses, :redFlags)`,
    {
      idDoc,
      text,
      keyClauses: analysisJson?.clauses ? JSON.stringify(analysisJson.clauses) : null,
      redFlags: analysisJson?.keyFindings ? JSON.stringify(analysisJson.keyFindings) : null,
    }
  );

  return { id: result.lastID, idDoc, text };
}

// Fetch a single summary for a given document ID, now with JSON analysis
export async function getSummaryByDocumentId(idDoc) {
  const result = await query(
    `SELECT ID_SUMMARY, ID_DOC, SUMMARY
     FROM SAMENVATTING
     WHERE ID_DOC = :idDoc`,
    { idDoc }
  );

  if (!result.rows || result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.ID_SUMMARY,
    idDoc: row.ID_DOC,
    text: row.SUMMARY,
  };
}

// List summaries, optionally filtered by user later via joins.
export async function listSummaries(limit = 50) {
  const result = await query(
    `SELECT ID_SUMMARY, ID_DOC, SUMMARY
     FROM SAMENVATTING
     ORDER BY ID_SUMMARY DESC
     LIMIT :limit`,
    { limit }
  );

  return (result.rows || []).map((row) => ({
    id: row.ID_SUMMARY,
    idDoc: row.ID_DOC,
    text: row.SUMMARY,
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
  // 1) Insert into DOCUMENTEN
  const docResult = await execute(
    `INSERT INTO DOCUMENTEN (ID_USER, FILE_NAME, FILE_PATH, FILE_TYPE, TITLE, DESCRIPTION, RISK_SCORE, STATUS)
     VALUES (:userId, :title, '', :docType, :title, :description, :riskScore, 'completed')`,
    {
      userId,
      title,
      description,
      docType: docType || 'unknown',
      riskScore: riskScore || 0,
    }
  );

  const newDocId = docResult.lastID;

  // 2) Optional insert into EINDDATUM if endDate is provided
  if (endDate) {
    await execute(
      `INSERT INTO EINDDATUM (ID_DOC, END_DATE)
       VALUES (:idDoc, :endDate)`,
      {
        idDoc: newDocId,
        endDate,
      }
    );
  }

  // 3) Insert into SAMENVATTING for this document
  const parsedAnalysis = typeof analysisJson === 'string' ? JSON.parse(analysisJson) : analysisJson;
  
  await execute(
    `INSERT INTO SAMENVATTING (ID_DOC, SUMMARY, KEY_CLAUSES, RED_FLAGS)
     VALUES (:idDoc, :text, :keyClauses, :redFlags)`,
    {
      idDoc: newDocId,
      text: fullText || '',
      keyClauses: parsedAnalysis?.clauses ? JSON.stringify(parsedAnalysis.clauses) : null,
      redFlags: parsedAnalysis?.keyFindings ? JSON.stringify(parsedAnalysis.keyFindings) : null,
    }
  );

  // 4) Insert into CONTRACT_REPORTS for the full JSON
  await execute(
    `INSERT INTO CONTRACT_REPORTS (ID_DOC, REPORT_JSON)
     VALUES (:idDoc, :reportJson)`,
    {
      idDoc: newDocId,
      reportJson: typeof analysisJson === 'string' ? analysisJson : JSON.stringify(analysisJson),
    }
  );

  return {
    docId: newDocId,
  };
}

export async function createDocumentWithPendingStatus({
  userId,
  docType,
  title,
  description,
  fullText
}) {
  console.log('[createDocumentWithPendingStatus] fullText length:', fullText ? fullText.length : 0);

  const result = await execute(
    `INSERT INTO DOCUMENTEN (ID_USER, FILE_NAME, FILE_PATH, FILE_TYPE, TITLE, DESCRIPTION, STATUS)
     VALUES (:userId, :title, '', :docType, :title, :description, 'pending')`,
    {
      userId,
      title,
      description,
      docType: docType || 'unknown',
    }
  );

  return { docId: result.lastID };
}

export async function listUserContracts({ userId, isAdmin }) {
  const sql = isAdmin
    ? `SELECT d.ID_DOC, d.TITLE, d.DESCRIPTION, d.CREATED_AT, d.RISK_SCORE, d.STATUS,
              u.NAME AS USER_NAME, u.SURNAME AS USER_SURNAME, u.EMAIL AS USER_EMAIL
       FROM DOCUMENTEN d
       LEFT JOIN USERS u ON u.ID_USER = d.ID_USER
       WHERE d.STATUS != 'deleted'
       ORDER BY d.CREATED_AT DESC, d.ID_DOC DESC`
    : `SELECT d.ID_DOC, d.TITLE, d.DESCRIPTION, d.CREATED_AT, d.RISK_SCORE, d.STATUS,
              u.NAME AS USER_NAME, u.SURNAME AS USER_SURNAME, u.EMAIL AS USER_EMAIL
       FROM DOCUMENTEN d
       LEFT JOIN USERS u ON u.ID_USER = d.ID_USER
       WHERE d.ID_USER = :userId AND d.STATUS != 'deleted'
       ORDER BY d.CREATED_AT DESC, d.ID_DOC DESC`;

  const params = isAdmin ? {} : { userId };
  const result = await query(sql, params);

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
      title: row.TITLE || "Contract",
      subtitle: `Uploaded by ${displayName} ${row.DESCRIPTION || ""}`.trim(),
      riskScore: score ?? null,
      risk,
      riskLabel,
      date: row.CREATED_AT,
      status: row.STATUS || (score == null ? 'pending' : 'done'),
    };
  });
}

// Haal contract met samenvatting op
export async function getContractWithSummary(idDoc) {
  const result = await query(
    `SELECT d.ID_DOC, d.TITLE, d.DESCRIPTION, d.CREATED_AT, d.RISK_SCORE,
            s.ID_SUMMARY, s.SUMMARY, s.KEY_CLAUSES, s.RED_FLAGS,
            cr.REPORT_JSON
     FROM DOCUMENTEN d
     LEFT JOIN SAMENVATTING s ON s.ID_DOC = d.ID_DOC
     LEFT JOIN CONTRACT_REPORTS cr ON cr.ID_DOC = d.ID_DOC
     WHERE d.ID_DOC = :idDoc`,
    { idDoc }
  );

  if (!result.rows || result.rows.length === 0) {
    console.log('[getContractWithSummary] No contract found for ID_DOC:', idDoc);
    return null;
  }

  const row = result.rows[0];
  let analysisJson = null;

  try {
    if (row.REPORT_JSON) {
      analysisJson = JSON.parse(row.REPORT_JSON);
    } else {
      analysisJson = {
        keyClauses: row.KEY_CLAUSES ? JSON.parse(row.KEY_CLAUSES) : [],
        redFlags: row.RED_FLAGS ? JSON.parse(row.RED_FLAGS) : [],
      };
    }
  } catch (e) {
    console.warn('[getContractWithSummary] JSON parse error:', e.message);
  }

  return {
    id: row.ID_DOC,
    title: row.TITLE || "Contract",
    description: row.DESCRIPTION || "",
    uploadedAt: row.CREATED_AT,
    text: row.SUMMARY,
    riskScore: row.RISK_SCORE,
    analysisJson
  };
}

// Verwijder een contract en bijbehorende samenvatting
export async function deleteContractById(idDoc) {
  console.log('[deleteContractById] Start for ID_DOC:', idDoc);

  const tables = ['KALENDER', 'EINDDATUM', 'SAMENVATTING', 'CONTRACT_REPORTS', 'DOCUMENTEN'];
  for (const table of tables) {
    await execute(
      `DELETE FROM ${table} WHERE ID_DOC = :idDoc`,
      { idDoc }
    );
  }

  console.log('[deleteContractById] Done for ID_DOC:', idDoc);
}

export async function updateContractInfo({ id, title, contractType, userId, isAdmin }) {
  const sql = isAdmin
    ? `UPDATE DOCUMENTEN SET TITLE = :title, FILE_TYPE = :contractType WHERE ID_DOC = :id`
    : `UPDATE DOCUMENTEN SET TITLE = :title, FILE_TYPE = :contractType WHERE ID_DOC = :id AND ID_USER = :userId`;

  const params = isAdmin
    ? { id, title, contractType }
    : { id, title, contractType, userId };

  const result = await execute(sql, params);
  return result;
}

export async function getPendingContracts() {
  const result = await query(
    `SELECT d.*, u.EMAIL AS USER_EMAIL
     FROM DOCUMENTEN d
     JOIN USERS u ON u.ID_USER = d.ID_USER
     WHERE d.STATUS = 'pending'`
  );

  return result.rows || [];
}

export async function markContractDone(idDoc) {
  await execute(
    `UPDATE DOCUMENTEN SET STATUS = 'done' WHERE ID_DOC = :idDoc`,
    { idDoc }
  );
}

export async function runAnalysisForContract(contract) {
  // Get text from summary or fulltext
  let text = contract.SUMMARY || contract.summary || contract.FULLTEXT || contract.fullText || '';

  // Fallback: fetch from database if needed
  if (!text && contract.ID_DOC) {
    const result = await query(
      `SELECT SUMMARY FROM SAMENVATTING WHERE ID_DOC = :idDoc`,
      { idDoc: contract.ID_DOC }
    );
    if (result.rows && result.rows[0] && result.rows[0].SUMMARY) {
      text = result.rows[0].SUMMARY;
    }
  }

  // Call AI orchestrator
  const orchestrator = await import('../services/ai-orchestrator.service.js');
  let aiResult;
  try {
    aiResult = await orchestrator.analyzeContractText(text, contract.FILE_TYPE || contract.docType || '', '');
  } catch (e) {
    throw e;
  }

  return {
    summary: aiResult.humanSummary || aiResult.summary || '',
    riskScore: aiResult.overallRiskScore || aiResult.riskScore || 5,
    analysisJson: aiResult,
  };
}

// Update document title and type after analysis
export async function updateDocumentTitleAndType(idDoc, title, docType) {
  await execute(
    `UPDATE DOCUMENTEN SET TITLE = :title, FILE_TYPE = :docType WHERE ID_DOC = :idDoc`,
    { idDoc, title, docType }
  );
}

export async function saveAnalysisResult(idDoc, { summary, riskScore, analysisJson }) {
  console.log('[saveAnalysisResult] idDoc:', idDoc, 'riskScore:', riskScore);

  // Delete existing summary for this document
  await execute(
    `DELETE FROM SAMENVATTING WHERE ID_DOC = :idDoc`,
    { idDoc }
  );

  try {
    // Insert new summary
    const insertResult = await execute(
      `INSERT INTO SAMENVATTING (ID_DOC, SUMMARY, RISK_SCORE, KEY_CLAUSES, RED_FLAGS)
       VALUES (:idDoc, :summary, :riskScore, :keyClauses, :redFlags)`,
      {
        idDoc,
        summary,
        riskScore,
        keyClauses: analysisJson?.keyClauses ? JSON.stringify(analysisJson.keyClauses) : null,
        redFlags: analysisJson?.redFlags ? JSON.stringify(analysisJson.redFlags) : null,
      }
    );

    console.log('[saveAnalysisResult] Inserted SAMENVATTING result:', insertResult);

    // Update document risk score
    await execute(
      `UPDATE DOCUMENTEN SET RISK_SCORE = :riskScore, STATUS = 'done' WHERE ID_DOC = :idDoc`,
      { idDoc, riskScore }
    );
  } catch (err) {
    console.error('[saveAnalysisResult] ERROR during insert:', err);
  }
}
