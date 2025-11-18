// backend/src/controllers/contract.controller.js

// Import your AI service or any other necessary modules
// This is a placeholder import; replace with our actual AI after research

import AI from "../services/ai.service.js";

export async function analyzeContract(req, res) {
  try {
    const filePath = req.file.path;

    const analysis = await AI.analyzeContract(filePath);

    res.json({
      success: true,
      file: filePath,
      analysis
    });
  } catch (err) {
    res.status(500).json({ error: "Analysis failed" });
  }
}

export async function getContracts(req, res) {
  res.json([{ id: 1, name: "Demo Contract" }]);
}
