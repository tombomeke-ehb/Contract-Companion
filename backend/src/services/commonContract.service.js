// backend/src/services/commonContract.service.js
// Database operations for the admin-managed common contracts library

import oracledb from "oracledb";
import { query } from "../config/db.js";

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
  
  // Transform Oracle rows to frontend-friendly format
  return result.rows.map(row => ({
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
    sampleReport = 1,
  } = contract;

  // Generate slug from name if no ID provided
  const slugBase = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const contractKey = id && String(id).trim() ? String(id) : `${slugBase}-${Date.now().toString(36)}`;

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
    updatedText: updated || new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    sampleReportId: Number(sampleReport),
  };

  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(sql, bindParams, { autoCommit: true });
    
    // Return the created contract
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
  } finally {
    if (conn) await conn.close();
  }
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

  const sql = `
    UPDATE COMMON_CONTRACTS
    SET 
      NAME = NVL(:name, NAME),
      CATEGORY = NVL(:category, CATEGORY),
      SUMMARY = NVL(:summary, SUMMARY),
      RISK_HIGH = NVL(:riskHigh, RISK_HIGH),
      RISK_MEDIUM = NVL(:riskMedium, RISK_MEDIUM),
      RISK_LOW = NVL(:riskLow, RISK_LOW),
      UPDATED_TEXT = NVL(:updatedText, UPDATED_TEXT),
      SAMPLE_REPORT_ID = NVL(:sampleReportId, SAMPLE_REPORT_ID),
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

  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(sql, bindParams, { autoCommit: true });
    
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
    const selectResult = await conn.execute(selectSql, { contractKey }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
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
  } finally {
    if (conn) await conn.close();
  }
}

/**
 * Delete a common contract by key
 * @param {string} contractKey - The CONTRACT_KEY identifier
 */
export async function deleteCommonContract(contractKey) {
  const sql = `DELETE FROM COMMON_CONTRACTS WHERE CONTRACT_KEY = :contractKey`;

  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(sql, { contractKey }, { autoCommit: true });
    
    if (result.rowsAffected === 0) {
      throw new Error('Contract not found');
    }

    return { success: true, contractKey };
  } finally {
    if (conn) await conn.close();
  }
}
