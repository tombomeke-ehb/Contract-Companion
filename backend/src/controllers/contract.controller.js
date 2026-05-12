// backend/src/controllers/contract.controller.js

import fs from "fs/promises";
import { processContractPdf } from "../services/documentOCR.service.js";
import { createDocumentWithSummary, listUserContracts, getContractWithSummary, deleteContractById, createDocumentWithPendingStatus } from "../services/contract.service.js";
import { analyzeContractText } from "../services/ai-orchestrator.service.js";
import { mapLlm2ToReport } from "../services/report-mapper.service.js";
import * as commonContractService from "../services/commonContract.service.js";
import app from '../app.js';

// Upload + OCR + AI analyse (ingelogde users)
export async function analyzeContract(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }

    const filePath = req.file.path;

    // DEBUG: Log file info
    console.log('[analyzeContract] filePath:', filePath, 'originalname:', req.file.originalname, 'mimetype:', req.file.mimetype);

    // OCR execute
    const document = await processContractPdf(filePath);
    const fullText = document.text || "";

    // DEBUG: Log OCR result length
    console.log('[analyzeContract] OCR text length:', fullText.length);

    // Uploaded bestand opruimen - we bewaren enkel de tekst/AI-resultaten
    try {
      await fs.unlink(filePath);
    } catch (e) {}

    const contractType = req.body?.contractType || "";
    const notes = req.body?.notes || "";

    // DEBUG: Log contractType and notes
    console.log('[analyzeContract] contractType:', contractType, 'notes:', notes);

    // 2. Run new two-stage AI pipeline on the OCR text, passing contractType and notes
    const aiResult = await analyzeContractText(fullText, contractType, notes);

    // DEBUG: Log AI result keys
    console.log('[analyzeContract] aiResult keys:', Object.keys(aiResult));

    // 3. Extract risk score from LLM2 for persistence
    // Defensive: report kan null zijn
    let report = null;
    try {
      report = mapLlm2ToReport(aiResult.llm2);
    } catch (e) {
      report = {};
    }
    const riskScore = (report && typeof report.riskScore !== 'undefined' && report.riskScore !== null)
      ? report.riskScore
      : (aiResult?.llm2?.riskScore ?? aiResult?.llm2?.overallRiskScore ?? 0);

    // DEBUG: Log report and riskScore
    console.log('[analyzeContract] report:', report, 'riskScore:', riskScore);

    // Use the JWT payload field "id" for the current user
    const userId = req.user?.id || null;
    // Als contractType leeg is, gebruik AI type, anders user input
    let docType = contractType && contractType.trim() ? contractType.trim() : (report.contractType || aiResult.llm2?.contractType || 'Unknown');

    // Validate docType (contractType): only allow safe characters, max length 100
    if (typeof docType !== 'string' || !/^[\w\s\-\/&()\.]{2,100}$/i.test(docType)) {
      return res.status(400).json({ error: 'Invalid contract type. Only letters, numbers, spaces, and basic punctuation allowed.' });
    }

    const title = req.file.originalname || "Uploaded contract";
    const description = notes;

    const { docId } = await createDocumentWithSummary({
      userId,
      docType,
      title,
      description,
      fullText,
      riskScore,
      endDate: null,
      analysisJson: JSON.stringify(aiResult.llm2)
    });

    // Notify all SSE clients that a contract analysis is finished
    if (typeof app.broadcastContractAnalyzed === 'function') {
      app.broadcastContractAnalyzed(docId);
    }

    // 5. Respond to the frontend with all building blocks
    res.json({
      success: true,
      docId,
      ocrText: fullText,
      ai: aiResult,
      report,
    });
  } catch (err) {
    console.error('[analyzeContract] ERROR:', err);
    next(err);
  }
}

// Nieuwe asynchrone upload endpoint
export async function uploadContractAsync(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    const filePath = req.file.path;
    const document = await processContractPdf(filePath);
    const fullText = document.text || "";
    try { await fs.unlink(filePath); } catch {}
    const contractType = req.body?.contractType || "";
    const notes = req.body?.notes || "";
    const userId = req.user?.id || null;
    let docType = contractType && contractType.trim() ? contractType.trim() : 'Unknown';
    const title = req.file.originalname || "Uploaded contract";
    const description = notes;
    // Alleen DOCUMENTEN aanmaken, geen analyse
    const { docId } = await createDocumentWithPendingStatus({ userId, docType, title, description, fullText });
    res.json({ success: true, docId });
  } catch (err) {
    next(err);
  }
}

// fetching contracts
export async function getContracts(req, res) {
  try {
    const isAdmin = !!req.user?.isAdmin;
    const userId = req.user?.id ?? null;

    const contracts = await listUserContracts({ userId, isAdmin });

    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contracts" });
  }
}

export async function getContractDetail(req, res) {
  try {
    const { id } = req.params;
    const numericId = Number(id);
    if (!numericId) {
      return res.status(400).json({ error: "Invalid contract id" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const contract = await getContractWithSummary(numericId);
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const report = contract.analysisJson ? mapLlm2ToReport(contract.analysisJson, contract.id) : null;
    const responseObj = { ...contract, report };
    res.setHeader('Content-Type', 'application/json');
    const safeResponse = { ...responseObj };
    if (safeResponse.text && typeof safeResponse.text !== 'string') safeResponse.text = undefined;
    if (safeResponse.analysisJson && typeof safeResponse.analysisJson !== 'object' && typeof safeResponse.analysisJson !== 'string') safeResponse.analysisJson = undefined;
    res.json(safeResponse);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contract" });
  }
}

// Verwijder contract (user + admin)
export async function deleteContract(req, res) {
  try {
    const { id } = req.params;
    const numericId = Number(id);
    if (!numericId) {
      return res.status(400).json({ error: 'Invalid contract id' });
    }
    await deleteContractById(numericId);
    res.json({ success: true, removed: { id: numericId } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contract' });
  }
}

// Update contract title and type
export async function updateContractInfo(req, res) {
  try {
    const { id } = req.params;
    const { title, contractType } = req.body;
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!id || !title || !contractType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Only allow update if user owns contract or is admin
    const userId = req.user.id;
    const isAdmin = !!req.user.isAdmin;
    
    // Update query - corrected column names to match schema (TITLE, FILE_TYPE)
    const sql = isAdmin
      ? `UPDATE DOCUMENTEN SET TITLE = :title, FILE_TYPE = :contractType WHERE ID_DOC = :id`
      : `UPDATE DOCUMENTEN SET TITLE = :title, FILE_TYPE = :contractType WHERE ID_DOC = :id AND ID_USER = :userId`;
    
    const binds = isAdmin
      ? { id, title, contractType }
      : { id, title, contractType, userId };
    
    // Ensure contractType is a string
    if (typeof binds.contractType !== 'string') {
      binds.contractType = String(binds.contractType)
    }
    
    const result = await execute(sql, binds);
    if (result.rowsAffected === 0) {
      return res.status(403).json({ error: "Not allowed or contract not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[updateContractInfo] Error:', err);
    res.status(500).json({ error: "Failed to update contract info" });
  }
}


// Database-backed admin common contracts CRUD
export async function getCommonContracts(req, res) {
  try {
    const contracts = await commonContractService.getAllCommonContracts();
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
}

export async function createCommonContract(req, res) {
  try {
    const body = req.body || {};
    const { name, category } = body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Missing required fields: name, category' });
    }

    const contract = await commonContractService.createCommonContract(body);
    res.status(201).json(contract);
  } catch (err) {
    if (err.message?.includes('unique constraint')) {
      return res.status(409).json({ error: 'Contract with this id already exists' });
    }
    res.status(500).json({ error: 'Failed to create contract' });
  }
}
// Update common contract
export async function updateCommonContract(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const updated = await commonContractService.updateCommonContract(id, body);
    res.json(updated);
  } catch (err) {
    if (err.message === 'Contract not found') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to update contract' });
  }
}
// Delete common contract
export async function deleteCommonContract(req, res) {
  try {
    const { id } = req.params;
    const result = await commonContractService.deleteCommonContract(id);
    res.json({ success: true, removed: { id } });
  } catch (err) {
    if (err.message === 'Contract not found') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete contract' });
  }
}
