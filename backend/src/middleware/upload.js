// backend/src/middleware/upload.js

import multer from 'multer'
import fs from 'fs'
import path from 'path'

// Ensure the upload directory exists at startup so Multer and
// downstream services (OCR, AI) can safely access uploaded files.
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'contracts')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure Multer disk storage for uploaded contract files.
// Files are written to public/uploads/contracts so they can be
// accessed by the backend for further processing (e.g. OCR).
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the absolute upload directory to avoid ENOENT errors.
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Use a timestamp prefix to avoid filename collisions.
    const unique = Date.now() + '-' + file.originalname
    cb(null, unique)
  }
})

// Base Multer instance used by routes that need raw access
// to req.file via upload.single('file').
const upload = multer({ storage })

export { upload }

// Legacy helper kept for compatibility: uploads a single file
// from a field named "contract" instead of "file".
// Newer routes should prefer upload.single('file').
export const uploadContract = upload.single('contract')
