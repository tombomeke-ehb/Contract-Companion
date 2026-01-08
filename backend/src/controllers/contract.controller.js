// backend/src/controllers/contract.controller.js

import fs from "fs/promises";
import { processContractPdf } from "../services/documentOCR.service.js";
import { createDocumentWithSummary, listUserContracts, getContractWithSummary, deleteContractById } from "../services/contract.service.js";
import { analyzeContractText } from "../services/ai-orchestrator.service.js";
import { mapLlm2ToReport } from "../services/report-mapper.service.js";
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
    const riskScore = aiResult?.llm2?.overallRiskScore;

    // Use the JWT payload field "id" for the current user
    const userId = req.user?.id || null;
    const docType = Number(contractType) || 1; // Ensure docType is a number
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
    res.status(500).json({
      success: false,
      error: "Analysis failed"
    });
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
