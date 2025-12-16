// backend/src/controllers/contract.controller.js

// Placeholder AI service - later you can replace the implementation
import AI from "../services/ai.service.js";
import { processContractPdf } from "../services/documentOCR.service.js";
import { createSummary } from "../services/contract.service.js";
import * as commonContractService from "../services/commonContract.service.js";

// Handle upload + OCR + AI analysis and prepare persistence
export async function analyzeContract(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const filePath = req.file.path;

    // 1. Run OCR via DocumentAI
    const document = await processContractPdf(filePath);
    const fullText = document.text || "";

    // 2. Run (future) AI model on the OCR text
    const aiResult = await AI.analyzeContract(filePath, fullText);

    // 3. Prepare persistence into SAMENVATTING table (future-proof)
    const riskScore = aiResult?.riskScore ?? 5.0; // default placeholder score

    // For now we don't have a real DOCUMENTEN.ID_DOC flow yet
    await createSummary({ idDoc: null, text: fullText, riskScore });

    // 4. Respond to the frontend with all building blocks
    res.json({
      success: true,
      file: filePath,
      ocrText: fullText,
      ai: aiResult,
    });
  } catch (err) {
    console.error("analyzeContract failed", err);
    res.status(500).json({ success: false, error: "Analysis failed" });
  }
}

// Placeholder: later this can return real data from SAMENVATTING/DOCUMENTEN
export async function getContracts(req, res) {
  res.json([{ id: 1, name: "Demo Contract" }]);
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
