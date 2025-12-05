// backend/src/routes/contract.routes.js

import express from 'express'
import { upload } from '../middleware/upload.js'
import { processContractPdf } from '../services/documentOCR.service.js'

const router = express.Router()

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('[contracts] /upload called, file:', req.file?.originalname)
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = req.file.path
    const document = await processContractPdf(filePath)

    const fullText = document.text || ''

    const pages = (document.pages || []).map((p, index) => ({
      pageNumber: index + 1,
      width: p.dimension?.width,
      height: p.dimension?.height,
      numParagraphs: (p.paragraphs || []).length,
      numTables: (p.tables || []).length
    }))

    return res.json({
      success: true,
      fullText,
      pages
    })
  } catch (err) {
    console.error('Error processing document:', err)
    return res.status(500).json({
      success: false,
      error: 'Failed to process document',
      details: err.message
    })
  }
})

export default router
