// backend/src/services/commonContract.service.js
// Database operations for the admin-managed common contracts library

import { query, execute } from "../config/db.js";
import { createReport, getReportById } from "./report.service.js";

/**
 * Get all common contracts from the database
 * Returns array of contract objects with stats merged
 */
export async function getAllCommonContracts() {
  const sql = `
    SELECT
      ID_CONTRACT,
      CONTRACT_KEY,
      NAME,
      CATEGORY,
      SUMMARY,
      RISK_HIGH,
      RISK_MEDIUM,
      RISK_LOW,
      UPDATED_TEXT,
      SAMPLE_REPORT_ID,
      CREATED_AT,
      UPDATED_AT
    FROM COMMON_CONTRACTS
    ORDER BY CREATED_AT DESC
  `;

  const result = await query(sql);

  // Transform rows to frontend-friendly format
  return (result.rows || []).map(row => ({
    id: row.CONTRACT_KEY,
    name: row.NAME,
    category: row.CATEGORY,
    summary: row.SUMMARY || '',
    stats: {
      high: row.RISK_HIGH || 0,
      medium: row.RISK_MEDIUM || 0,
      low: row.RISK_LOW || 0,
    },
    updated: row.UPDATED_TEXT || (row.CREATED_AT ? new Date(row.CREATED_AT).toLocaleDateString('nl-BE', { month: 'short', year: 'numeric' }) : ''),
    sampleReport: row.SAMPLE_REPORT_ID || 1,
  }));
}

/**
 * Create a new common contract
 * @param {Object} contract - Contract data with name, category, summary, stats, etc.
 */
export async function createCommonContract(contract) {
  const {
    id,
    name,
    category,
    summary = '',
    stats = {},
    updated = '',
    analysisReport = null,
  } = contract;

  // Generate slug from name if no ID provided
  const slugBase = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const contractKey = id && String(id).trim() ? String(id) : `${slugBase}-${Date.now().toString(36)}`;

  let sampleReportId = 1;
  if (analysisReport) {
    sampleReportId = await createReport(analysisReport);
  }

  const sql = `
    INSERT INTO COMMON_CONTRACTS (
      CONTRACT_KEY, NAME, CATEGORY, SUMMARY,
      RISK_HIGH, RISK_MEDIUM, RISK_LOW,
      UPDATED_TEXT, SAMPLE_REPORT_ID
    ) VALUES (
      :contractKey, :name, :category, :summary,
      :riskHigh, :riskMedium, :riskLow,
      :updatedText, :sampleReportId
    )
  `;

  const bindParams = {
    contractKey,
    name,
    category,
    summary,
    riskHigh: Number(stats.high || 0),
    riskMedium: Number(stats.medium || 0),
    riskLow: Number(stats.low || 0),
    updatedText: updated || new Date().toLocaleString('nl-BE', { month: 'short', year: 'numeric' }),
    sampleReportId: Number(sampleReportId),
  };

  await execute(sql, bindParams);

  return {
    id: contractKey,
    name,
    category,
    summary,
    stats: {
      high: bindParams.riskHigh,
      medium: bindParams.riskMedium,
      low: bindParams.riskLow,
    },
    updated: bindParams.updatedText,
    sampleReport: bindParams.sampleReportId,
  };
}

/**
 * Update an existing common contract by key
 * @param {string} contractKey - The CONTRACT_KEY identifier
 * @param {Object} updates - Fields to update
 */
export async function updateCommonContract(contractKey, updates) {
  const {
    name,
    category,
    summary,
    stats = {},
    updated,
    sampleReport,
  } = updates;

  // SQLite doesn't have NVL or easy conditional updates in one go like this with named params easily
  // but we can use COALESCE and our helper translates NVL to COALESCE
  const sql = `
    UPDATE COMMON_CONTRACTS
    SET
      NAME = COALESCE(:name, NAME),
      CATEGORY = COALESCE(:category, CATEGORY),
      SUMMARY = COALESCE(:summary, SUMMARY),
      RISK_HIGH = COALESCE(:riskHigh, RISK_HIGH),
      RISK_MEDIUM = COALESCE(:riskMedium, RISK_MEDIUM),
      RISK_LOW = COALESCE(:riskLow, RISK_LOW),
      UPDATED_TEXT = COALESCE(:updatedText, UPDATED_TEXT),
      SAMPLE_REPORT_ID = COALESCE(:sampleReportId, SAMPLE_REPORT_ID),
      UPDATED_AT = CURRENT_TIMESTAMP
    WHERE CONTRACT_KEY = :contractKey
  `;

  const bindParams = {
    contractKey,
    name: name || null,
    category: category || null,
    summary: summary || null,
    riskHigh: stats.high !== undefined ? Number(stats.high) : null,
    riskMedium: stats.medium !== undefined ? Number(stats.medium) : null,
    riskLow: stats.low !== undefined ? Number(stats.low) : null,
    updatedText: updated || null,
    sampleReportId: sampleReport !== undefined ? Number(sampleReport) : null,
  };

  const result = await execute(sql, bindParams);

  if (result.rowsAffected === 0) {
    throw new Error('Contract not found');
  }

  // Fetch and return the updated contract
  const selectSql = `
    SELECT
      CONTRACT_KEY, NAME, CATEGORY, SUMMARY,
      RISK_HIGH, RISK_MEDIUM, RISK_LOW,
      UPDATED_TEXT, SAMPLE_REPORT_ID
    FROM COMMON_CONTRACTS
    WHERE CONTRACT_KEY = :contractKey
  `;
  const selectResult = await query(selectSql, { contractKey });

  const row = selectResult.rows[0];
  return {
    id: row.CONTRACT_KEY,
    name: row.NAME,
    category: row.CATEGORY,
    summary: row.SUMMARY || '',
    stats: {
      high: row.RISK_HIGH || 0,
      medium: row.RISK_MEDIUM || 0,
      low: row.RISK_LOW || 0,
    },
    updated: row.UPDATED_TEXT || '',
    sampleReport: row.SAMPLE_REPORT_ID || 1,
  };
}

/**
 * Delete a common contract by key
 * @param {string} contractKey - The CONTRACT_KEY identifier
 */
export async function deleteCommonContract(contractKey) {
  const sql = `DELETE FROM COMMON_CONTRACTS WHERE CONTRACT_KEY = :contractKey`;
  const result = await execute(sql, { contractKey });

  if (result.rowsAffected === 0) {
    throw new Error('Contract not found');
  }

  return { success: true, contractKey };
}

// Helper to map string[] to {title, body}[]
function toFindingObjects(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item =>
    typeof item === 'string'
      ? { title: item, body: '' }
      : item
  );
}
function toActionObjects(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(item =>
    typeof item === 'string'
      ? { title: item, body: '' }
      : item
  );
}

/**
 * Get the analysis report for a common contract by key
 * @param {string} contractKey - The CONTRACT_KEY identifier
 */
export async function getCommonContractReport(contractKey) {
  const sql = `SELECT SAMPLE_REPORT_ID FROM COMMON_CONTRACTS WHERE CONTRACT_KEY = :contractKey`;
  const result = await query(sql, { contractKey });
  if (!result.rows.length) {
    return null;
  }
  const sampleReportId = result.rows[0].SAMPLE_REPORT_ID;
  if (!sampleReportId) {
    return null;
  }
  const report = await getReportById(sampleReportId);
  if (!report) {
    return null;
  }
  // Map backend fields to frontend expected fields
  const mapped = {
    title: report.title,
    contractType: report.contractType,
    date: report.analyzedAt || report.date,
    riskScore: report.riskScore ?? report.overallRiskScore ?? 0,
    risk: report.risk ?? report.overallRisk ?? '',
    riskLabel: report.riskLabel ?? report.overallRiskLabel ?? '',
    keySummary: report.keySummary ?? '',
    humanSummary: report.humanSummary ?? '',
    keyFindings: toFindingObjects(report.keyFindings ?? []),
    summary: report.summary ?? report.executiveSummary ?? '',
    focus: report.focus ?? report.focusTags ?? [],
    breakdown: report.breakdown ?? report.clauseBreakdown ?? {},
    actions: toActionObjects(report.actions ?? report.recommendedActions ?? []),
    clauses: report.clauses ?? {},
  };
  return mapped;
}

