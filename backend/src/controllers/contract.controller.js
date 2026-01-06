// backend/src/controllers/contract.controller.js

import fs from "fs/promises";
import { processContractPdf } from "../services/documentOCR.service.js";
import { createDocumentWithSummary, listUserContracts, getContractWithSummary } from "../services/contract.service.js";
import { analyzeContractText } from "../services/ai-orchestrator.service.js";
import { mapLlm2ToReport } from "../services/report-mapper.service.js";

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

    // OCR uitvoeren
    const document = await processContractPdf(filePath);
    const fullText = document.text || "";

    // Uploaded bestand opruimen - we bewaren enkel de tekst/AI-resultaten
    try {
      await fs.unlink(filePath);
    } catch (e) {
      console.warn("Could not delete uploaded file", e);
    }

    const contractType = req.body?.contractType || "";
    const notes = req.body?.notes || "";

    // 2. Run new two-stage AI pipeline on the OCR text, passing contractType and notes
    const aiResult = await analyzeContractText(fullText, contractType, notes);

    // 3. Extract risk score from LLM2 for persistence
    const riskScore = aiResult?.llm2?.overallRiskScore ?? 5.0;

    // Use the JWT payload field "id" for the current user
    const userId = req.user?.id || null;
    const docType = contractType || 1; // Optionally map contractType to docType if needed
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
    });

    // 4. Map LLM2 output to a report shape expected by the frontend
    const report = mapLlm2ToReport(aiResult.llm2, docId);

    // 5. Respond to the frontend with all building blocks
    res.json({
      success: true,
      docId,
      ocrText: fullText,
      ai: aiResult,
      report,
    });
  } catch (err) {
    console.error("analyzeContract failed", err);
    res.status(500).json({
      success: false,
      error: "Analysis failed"
    });
  }
}

// Contracten ophalen
export async function getContracts(req, res) {
  try {
    const isAdmin = !!req.user?.isAdmin;
    const userId = req.user?.id ?? null;

    const contracts = await listUserContracts({ userId, isAdmin });

    res.json(contracts);
  } catch (err) {
    console.error("getContracts failed", err);
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

    const contract = await getContractWithSummary(numericId);
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    res.json(contract);
  } catch (err) {
    console.error("getContractDetail failed", err);
    res.status(500).json({ error: "Failed to fetch contract" });
  }
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
