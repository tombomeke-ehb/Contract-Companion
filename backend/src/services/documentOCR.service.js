import fs from 'fs'
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

// Uses the regional endpoint for eu.
//  - eu-documentai.googleapis.com
const client = new documentai.DocumentProcessorServiceClient({
  apiEndpoint: `${location}-documentai.googleapis.com`,
})

// Fully-qualified processor resource name retrieved from .env file
const processorName = client.processorPath(projectId, location, processorId)
console.log('[DocumentAI] processorName:', processorName)
console.log('[DocumentAI] projectId:', projectId, 'location:', location, 'processorId:', processorId)

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
}
