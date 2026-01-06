// backend/src/controllers/contract.controller.js

import AI from "../services/ai.service.js";
import { processContractPdf } from "../services/documentOCR.service.js";
import { createSummary } from "../services/contract.service.js";
import * as commonContractService from "../services/commonContract.service.js";

// Upload + OCR + AI analyse (ingelogde users)
export async function analyzeContract(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }

    const filePath = req.file.path;

    // OCR execute
    const document = await processContractPdf(filePath);
    const fullText = document.text || "";

    // AI analyse execute
    const aiResult = await AI.analyzeContract(filePath, fullText);

    const riskScore = aiResult?.riskScore ?? 5.0;

    // summary saving
    await createSummary({
      idDoc: null,
      text: fullText,
      riskScore
    });

    res.json({
      success: true,
      ocrText: fullText,
      ai: aiResult
    });
  } catch (err) {
    console.error("analyzeContract failed", err);
    res.status(500).json({
      success: false,
      error: "Analysis failed"
    });
  }
}

// fetching contracts
export async function getContracts(req, res) {
  // Admin sees all contracts, normal users only theirs
  if (req.user.isAdmin) {
    return res.json([
      { id: 1, name: "Admin contract A" },
      { id: 2, name: "Admin contract B" }
    ]);
  }

  return res.json([
    { id: 3, name: "User contract" }
  ]);
}

// Database-backed admin common contracts CRUD
export async function getCommonContracts(req, res) {
  try {
    const contracts = await commonContractService.getAllCommonContracts();
    res.json(contracts);
  } catch (err) {
    console.error('getCommonContracts error', err);
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
    console.error('createCommonContract error', err);
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
    console.error('updateCommonContract error', err);
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
    console.error('deleteCommonContract error', err);
    if (err.message === 'Contract not found') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete contract' });
  }
}
