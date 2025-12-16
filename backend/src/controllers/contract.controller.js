// backend/src/controllers/contract.controller.js

import { processContractPdf } from "../services/documentOCR.service.js";
import { createSummary } from "../services/contract.service.js";
import { analyzeContractText } from "../services/ai-orchestrator.service.js";
import { mapLlm2ToReport } from "../services/report-mapper.service.js";

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

    // 2. Run new two-stage AI pipeline on the OCR text
    const aiResult = await analyzeContractText(fullText);

    // 3. Extract risk score from LLM2 for persistence
    const riskScore = aiResult?.llm2?.overallRiskScore ?? 5.0;
    await createSummary({ idDoc: null, text: fullText, riskScore });

    // 4. Map LLM2 output to a report shape expected by the frontend
    const report = mapLlm2ToReport(aiResult.llm2, null);

    // 5. Respond to the frontend with all building blocks
    res.json({
      success: true,
      file: filePath,
      ocrText: fullText,
      ai: aiResult,
      report,
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
