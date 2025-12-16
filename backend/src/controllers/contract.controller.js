// backend/src/controllers/contract.controller.js

// Placeholder AI service - later you can replace the implementation
import AI from "../services/ai.service.js";
import { processContractPdf } from "../services/documentOCR.service.js";
import { createSummary } from "../services/contract.service.js";

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
