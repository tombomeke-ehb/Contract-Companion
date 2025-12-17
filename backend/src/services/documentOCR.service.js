import fs from 'fs'
import path from 'path'
import { v1 as documentai } from '@google-cloud/documentai'
import dotenv from 'dotenv'

// Load environment variables from backend/.env
dotenv.config()

// Project configuration for the Document AI processor.
// These values are configured in backend/.env so they can be changed
// without touching code.
const projectId = process.env.PROJECT_ID
const location = process.env.LOCATION
const processorId = process.env.PROCESSOR_ID

// Lazily initialised Document AI client and processor name.
let client = null
let processorName = null

function initDocumentAIClient() {
  try {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS

    if (!projectId || !location || !processorId) {
      console.warn('[DocumentAI] Missing PROJECT_ID / LOCATION / PROCESSOR_ID, using fallback OCR.')
      return
    }

    if (!credentialsPath) {
      console.warn('[DocumentAI] GOOGLE_APPLICATION_CREDENTIALS not set, using fallback OCR.')
      return
    }

    const resolvedCredentialsPath = path.isAbsolute(credentialsPath)
      ? credentialsPath
      : path.join(process.cwd(), credentialsPath)

    if (!fs.existsSync(resolvedCredentialsPath)) {
      console.warn('[DocumentAI] Credentials file not found at', resolvedCredentialsPath, '- using fallback OCR.')
      return
    }

    // Ensure the env var contains an absolute path
    process.env.GOOGLE_APPLICATION_CREDENTIALS = resolvedCredentialsPath

    // Uses the regional endpoint for eu.
    //  - eu-documentai.googleapis.com
    client = new documentai.DocumentProcessorServiceClient({
      apiEndpoint: `${location}-documentai.googleapis.com`,
    })

    // Fully-qualified processor resource name retrieved from .env file
    processorName = client.processorPath(projectId, location, processorId)
    console.log('[DocumentAI] Initialised. processorName:', processorName)
    console.log('[DocumentAI] projectId:', projectId, 'location:', location, 'processorId:', processorId)
  } catch (err) {
    console.error('[DocumentAI] Failed to initialise client, falling back to dummy OCR.', err)
    client = null
    processorName = null
  }
}

// Try to initialise once at startup; if this fails we will use fallbacks.
initDocumentAIClient()

/**
 * Sends a local PDF file to Document AI and returns the Document object.
 *
 * The PDF is read from disk, base64-encoded and sent in the rawDocument
 * payload. The response contains the structured Document representation
 * used later by the upload route to build fullText and page metadata.
 *
 * @param {string} filePath - Absolute/relative path to the uploaded file on disk.
 * @returns {Promise<import('@google-cloud/documentai').protos.google.cloud.documentai.v1.Document>}
 */
export async function processContractPdf(filePath) {
  console.log('[DocumentAI] processContractPdf filePath:', filePath)

  // If Document AI is not configured, return a minimal fallback Document
  // so the rest of the pipeline (summary + AI placeholder) can continue.
  if (!client || !processorName) {
    console.warn('[DocumentAI] Client not configured - returning fallback document without external OCR.')
    // We still ensure the file exists to avoid confusing errors later on.
    if (!fs.existsSync(filePath)) {
      console.warn('[DocumentAI] Fallback: file does not exist at', filePath)
    }

    return {
      text: 'OCR is not configured in this environment. This is fallback text.',
    }
  }

  try {
    // Read the file into memory
    const fileBuffer = fs.readFileSync(filePath)

    // Base64-encode the file content, matching the REST sample from the console
    const encodedFile = Buffer.from(fileBuffer).toString('base64')

    const request = {
      name: processorName,
      rawDocument: {
        mimeType: 'application/pdf',
        content: encodedFile,
      },
      // For this application we skip human review; everything is fully automated.
      skipHumanReview: true,
    }

    console.log('[DocumentAI] request.mimeType:', request.rawDocument.mimeType)
    console.log('[DocumentAI] request.contentLength:', fileBuffer.length)

    // Call the Document AI "processDocument" method and return the
    // structured Document object from the result.
    const [result] = await client.processDocument(request)
    return result.document
  } catch (err) {
    console.error('[DocumentAI] processDocument failed, returning fallback document.', err)
    return {
      text: 'OCR processing failed; using fallback text.',
    }
  }
}
