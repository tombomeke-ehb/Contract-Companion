// backend/src/services/report.service.js
// Service for storing and retrieving contract analysis reports

import { query, execute } from "../config/db.js";

export async function createReport(reportJson) {
  const result = await execute(
    `INSERT INTO CONTRACT_REPORTS (REPORT_JSON)
     VALUES (:reportJson)`,
    { reportJson: JSON.stringify(reportJson) }
  );
  return result.lastID;
}

export async function getReportById(reportId) {
  const sql = `SELECT REPORT_JSON FROM CONTRACT_REPORTS WHERE ID_REPORT = :reportId`;
  const result = await query(sql, { reportId });
  if (!result.rows.length) return null;
  const lob = result.rows[0].REPORT_JSON;
  if (lob === null) return null;
  if (typeof lob === 'string') {
    try {
      return JSON.parse(lob);
    } catch (e) {
      return null;
    }
  }
  // Oracle LOB: read stream to string
  return await new Promise((resolve, reject) => {
    let jsonStr = '';
    lob.setEncoding('utf8');
    lob.on('data', (chunk) => { jsonStr += chunk; });
    lob.on('end', () => {
      try {
        resolve(JSON.parse(jsonStr));
      } catch (e) {
        resolve(null);
      }
    });
    lob.on('error', (err) => {
      reject(err);
    });
  });
}
