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

// Wrapper around Multer to translate upload/validation errors
// into clean JSON responses for the frontend.
const uploadWithValidation = (req, res, next) => {
  const uploader = upload.single("file");

  uploader(req, res, (err) => {
    if (err) {
      if (err.message === "UNSUPPORTED_FILE_TYPE") {
        return res.status(400).json({
          success: false,
          error: "Only PDF, DOC, DOCX or TXT files are allowed.",
        });
      }

      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        error: "Failed to upload file.",
      });
    }

    next();
  });
};

// Public routes
// Common contracts library - for everyone to view
router.get("/common", getCommonContracts);

// Secured routes -- all routes below require authentication
router.use(authenticate);

// Upload + analyse of a contract (user + admin)
router.post("/upload", uploadWithValidation, analyzeContract);

// Low-level OCR endpoint, useful for debugging / tools
router.post("/upload-raw", uploadWithValidation, async (req, res) => {
  try {
    console.log("[contracts] /upload-raw called, file:", req.file?.originalname);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const document = await processContractPdf(filePath);

    const fullText = document.text || "";
    //Page details
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

// List of contracts
// admin sees all, user only their own
router.get("/", getContracts);

// Admin-manageable "common contracts" library
router.post("/common", isAdmin, createCommonContract);
router.put("/common/:id", isAdmin, updateCommonContract);
router.delete("/common/:id", isAdmin, deleteCommonContract);

export default router;
