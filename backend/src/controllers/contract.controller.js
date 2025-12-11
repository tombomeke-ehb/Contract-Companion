// backend/src/controllers/contract.controller.js

import AI from "../services/ai.service.js";
import { processContractPdf } from "../services/documentOCR.service.js";
import { createSummary, getSummaryByDocumentId, listSummaries } from "../services/contract.service.js";

// Handle upload + OCR + AI analysis and persist the result
export async function analyzeContract(req, res) {
  try {
    const filePath = req.file?.path;
    if (!filePath) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // 1. Run OCR via Google DocumentAI
    const document = await processContractPdf(filePath);

    const fullText = document.text || "";

    // 2. (Future) Run your own AI model on fullText
    // For now we call the placeholder AI service so the API shape is stable.
    const aiResult = await AI.analyzeContract(filePath, fullText);

    // Derive a numeric riskScore for persistence, placeholder logic for now
    const riskScore = aiResult?.riskScore ?? 5.0;

    // TODO: link to real DOCUMENTEN.ID_DOC once you have that flow wired.
    // For now we store with a null or dummy ID_DOC so the table is exercised.
    const idDoc = aiResult?.documentId ?? null;

    const saved = await createSummary({ idDoc, text: fullText, riskScore });

    res.json({
      success: true,
      file: filePath,
      ocrText: fullText,
      ai: aiResult,
      summaryId: saved.id,
    });
  } catch (err) {
    console.error("analyzeContract failed", err);
    res.status(500).json({ success: false, error: "Analysis failed" });
  }
}

// Return a list of stored summaries (for dashboards etc.)
export async function getContracts(req, res) {
  try {
    const items = await listSummaries();
    res.json({ success: true, items });
  } catch (err) {
    console.error("getContracts failed", err);
    res.status(500).json({ success: false, error: "Failed to fetch contracts" });
  }
}

// Fetch a single summary by associated document id
export async function getContractSummaryByDocument(req, res) {
  try {
    const { idDoc } = req.params;
    const summary = await getSummaryByDocumentId(Number(idDoc));
    if (!summary) {
      return res.status(404).json({ success: false, error: "Summary not found" });
    }
    res.json({ success: true, summary });
  } catch (err) {
    console.error("getContractSummaryByDocument failed", err);
    res.status(500).json({ success: false, error: "Failed to fetch summary" });
  }
}
