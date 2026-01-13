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
    INSERT INTO DOCUMENTEN (ID_DOC, ID_USER, DOC_TYPE, TITEL, BESCHRIJVING, UPLOADDATUM, EIND_DATEBOOL, STATUS, FULLTEXT)
    VALUES ((SELECT NVL(MAX(ID_DOC), 0) + 1 FROM DOCUMENTEN), :userId, :docType, :title, :description, SYSDATE, :endDateBool, 'pending', :fullText)
    RETURNING ID_DOC INTO :outIdDoc
  `;

  const docBinds = {
    userId: { val: userId, type: oracledb.NUMBER },
    docType: { val: docType, type: oracledb.STRING },
    title: { val: title, type: oracledb.STRING },
    description: { val: description, type: oracledb.STRING },
    endDateBool: { val: endDate ? 1 : 0, type: oracledb.NUMBER },
    fullText: { val: fullText, type: oracledb.CLOB },
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

export async function createDocumentWithPendingStatus({
  userId,
  docType,
  title,
  description,
  fullText
}) {
  console.log('[createDocumentWithPendingStatus] fullText length:', fullText ? fullText.length : 0, '| preview:', fullText ? fullText.slice(0, 200) : 'EMPTY');
  // Insert only DOCUMENTEN, status 'pending', no summary/AI
  const insertDocSql = `
    INSERT INTO DOCUMENTEN (ID_DOC, ID_USER, DOC_TYPE, TITEL, BESCHRIJVING, UPLOADDATUM, EIND_DATEBOOL, STATUS, FULLTEXT)
    VALUES ((SELECT NVL(MAX(ID_DOC), 0) + 1 FROM DOCUMENTEN), :userId, :docType, :title, :description, SYSDATE, 0, 'pending', :fullText)
    RETURNING ID_DOC INTO :outIdDoc
  `;
  const docBinds = {
    userId: { val: userId, type: oracledb.NUMBER },
    docType: { val: docType, type: oracledb.STRING },
    title: { val: title, type: oracledb.STRING },
    description: { val: description, type: oracledb.STRING },
    fullText: { val: fullText, type: oracledb.CLOB },
    outIdDoc: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
  };
  const docResult = await query(insertDocSql, docBinds, { autoCommit: true });
  const newDocId = docResult.outBinds?.outIdDoc?.[0];
  return { docId: newDocId };
}

export async function listUserContracts({ userId, isAdmin }) {
  const sql = `
    SELECT
      d.ID_DOC,
      d.TITEL,
      d.BESCHRIJVING,
      d.UPLOADDATUM,
      s.RISK_SCORE,
      s.ANALYSE_JSON,
      u.NAME AS USER_NAME,
      u.SURNAME AS USER_SURNAME,
      u.EMAIL AS USER_EMAIL
    FROM DOCUMENTEN d
    LEFT JOIN SAMENVATTING s ON s.ID_DOC = d.ID_DOC
    LEFT JOIN USERS u ON u.ID_USER = d.ID_USER
    WHERE (:isAdmin = 1 OR d.ID_USER = :userId)
      AND d.STATUS != 'deleted'
    ORDER BY d.UPLOADDATUM DESC, d.ID_DOC DESC
  `;

  const binds = {
    isAdmin: isAdmin ? 1 : 0,
    userId: userId ?? null,
  };

  const result = await query(sql, binds);

  return Promise.all((result.rows || []).map(async (row) => {
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

    // Parse ANALYSE_JSON (AI analysis) if present, to extract AI title
    let aiTitle = undefined;
    if (row.ANALYSE_JSON) {
      let json = row.ANALYSE_JSON;
      if (typeof json !== 'string' && typeof json === 'object' && typeof json.on === 'function') {
        // Oracle LOB
        const lobStr = await readLobToString(json);
        try {
          json = JSON.parse(lobStr);
        } catch (e) {
          json = undefined;
        }
      } else if (typeof json === 'string') {
        try {
          json = JSON.parse(json);
        } catch (e) {
          json = undefined;
        }
      }
      if (json && json.title) aiTitle = json.title;
    }

    return {
      id: row.ID_DOC,
      title: row.TITEL || "Contract",
      aiTitle, // <-- AI-generated title from Gemini
      subtitle: `Uploaded by ${displayName}  ${row.BESCHRIJVING || ""}`.trim(),
      riskScore: score ?? null,
      risk,
      riskLabel,
      date: row.UPLOADDATUM,
      status: row.STATUS || (row.RISK_SCORE == null ? 'pending' : 'done') // status from DB or fallback
    };
  }));
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
  // Hard delete: verwijder uit alle relevante tabellen
  const tables = ['KALENDER', 'EINDDATUM', 'SAMENVATTING', 'DOCUMENTEN'];
  for (const table of tables) {
    await query(`DELETE FROM ${table} WHERE ID_DOC = :idDoc`, { idDoc }, { autoCommit: true });
  }
  console.log('[deleteContractById] Done for ID_DOC:', idDoc);
}

export async function updateContractInfo({ id, title, contractType, userId, isAdmin }) {
  const sql = isAdmin
    ? `UPDATE DOCUMENTEN SET TITEL = :title, DOC_TYPE = :contractType WHERE ID_DOC = :id`
    : `UPDATE DOCUMENTEN SET TITEL = :title, DOC_TYPE = :contractType WHERE ID_DOC = :id AND ID_USER = :userId`;
  const binds = isAdmin
    ? { id, title, contractType }
    : { id, title, contractType, userId };
  const result = await query(sql, binds, { autoCommit: true });
  return result;
}

export async function getPendingContracts() {
  const sql = `SELECT d.*, d.FULLTEXT, u.EMAIL AS USER_EMAIL FROM DOCUMENTEN d JOIN USERS u ON u.ID_USER = d.ID_USER WHERE d.STATUS = 'pending'`;
  const result = await query(sql, {});
  return result.rows || [];
}

export async function markContractDone(idDoc) {
  await query(`UPDATE DOCUMENTEN SET STATUS = 'done' WHERE ID_DOC = :idDoc`, { idDoc }, { autoCommit: true });
}

export async function runAnalysisForContract(contract) {
  // Haal de tekst op uit de samenvatting (TEKST) of uit fullText (voor nieuwe contracts)
  let text = contract.TEKST || contract.text || contract.FULLTEXT || contract.fullText || '';
  if (text && typeof text === 'object' && typeof text.on === 'function') {
    text = await readLobToString(text);
  }
  if (!text && contract.ID_DOC) {
    // Fallback: probeer tekst op te halen uit de database
    const result = await query('SELECT TEKST FROM SAMENVATTING WHERE ID_DOC = :idDoc', { idDoc: contract.ID_DOC });
    if (result.rows && result.rows[0] && result.rows[0].TEKST) {
      text = result.rows[0].TEKST;
      if (text && typeof text === 'object' && typeof text.on === 'function') {
        text = await readLobToString(text);
      }
    }
  }
  // Roep direct Gemini aan met alleen de tekst (geen LLM1 meer)
  const orchestrator = await import('../services/ai-orchestrator.service.js');
  let aiResult;
  try {
    aiResult = await orchestrator.analyzeContractText(text, contract.DOC_TYPE || contract.docType || '', '');
  } catch (e) {
    throw e;
  }
  // Gebruik de Gemini output direct als analysisJson
  return {
    summary: aiResult.humanSummary || aiResult.summary || '',
    riskScore: aiResult.overallRiskScore || aiResult.riskScore || 5,
    analysisJson: aiResult
  };
}

// Worker: update ook de titel in DOCUMENTEN na analyse
export async function updateDocumentTitleAndType(idDoc, title, docType) {
  await query(
    `UPDATE DOCUMENTEN SET TITEL = :title, DOC_TYPE = :docType WHERE ID_DOC = :idDoc`,
    { idDoc, title, docType },
    { autoCommit: true }
  );
}

export async function saveAnalysisResult(idDoc, { summary, riskScore, analysisJson }) {
  console.log('[saveAnalysisResult] idDoc:', idDoc, 'summary:', summary, 'riskScore:', riskScore, 'analysisJson:', analysisJson)
  // Verwijder eerst bestaande samenvatting voor dit document (1-op-1 relatie)
  await query(`DELETE FROM SAMENVATTING WHERE ID_DOC = :idDoc`, { idDoc }, { autoCommit: true });
  try {
    const insertResult = await query(
      `INSERT INTO SAMENVATTING (ID_DOC, TEKST, RISK_SCORE, ANALYSE_JSON)
       VALUES (:idDoc, :summary, :riskScore, :analysisJson)`,
      {
        idDoc,
        summary,
        riskScore,
        analysisJson: analysisJson ? JSON.stringify(analysisJson) : null
      },
      { autoCommit: true }
    );
    console.log('[saveAnalysisResult] Inserted SAMENVATTING result:', insertResult)
    const check = await query('SELECT SAMENVATTING_ID, ANALYSE_JSON FROM SAMENVATTING WHERE ID_DOC = :idDoc', { idDoc });
    console.log('[saveAnalysisResult] ANALYSE_JSON direct na insert:', check.rows)
  } catch (err) {
    console.error('[saveAnalysisResult] ERROR during insert:', err)
  }
}
