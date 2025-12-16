// backend/src/routes/contract.routes.js

import express from "express";
import { upload } from "../middleware/upload.js";
import { authenticate, isAdmin } from "../middleware/auth.js";
import { processContractPdf } from "../services/documentOCR.service.js";
import {
  analyzeContract,
  getContracts,
  getCommonContracts,
  createCommonContract,
  updateCommonContract,
  deleteCommonContract,
} from "../controllers/contract.controller.js";

const router = express.Router();

// Alle contract-routes vereisen een ingelogde gebruiker
router.use(authenticate);

// Upload + analyse van een contract (user + admin)
router.post("/upload", upload.single("file"), analyzeContract);

// Low-level OCR endpoint (zonder AI), handig voor debugging / tools
router.post("/upload-raw", upload.single("file"), async (req, res) => {
  try {
    console.log("[contracts] /upload-raw called, file:", req.file?.originalname);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const document = await processContractPdf(filePath);

    const fullText = document.text || "";

    const pages = (document.pages || []).map((p, index) => ({
      pageNumber: index + 1,
      width: p.dimension?.width,
      height: p.dimension?.height,
      numParagraphs: (p.paragraphs || []).length,
      numTables: (p.tables || []).length,
    }));

    return res.json({
      success: true,
      fullText,
      pages,
    });
  } catch (err) {
    console.error("Error processing document:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to process document",
      details: err.message,
    });
  }
});

// Lijst van contracten
// Admin ziet alles, user ziet enkel zijn eigen (placeholder)
router.get("/", getContracts);

// Admin-manageable "common contracts" library (admin only)
router.get("/common", isAdmin, getCommonContracts);
router.post("/common", isAdmin, createCommonContract);
router.put("/common/:id", isAdmin, updateCommonContract);
router.delete("/common/:id", isAdmin, deleteCommonContract);

export default router;
