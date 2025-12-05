import fs from 'fs'
import { v1 as documentai } from '@google-cloud/documentai'
import dotenv from 'dotenv'

dotenv.config()

const projectId = process.env.PROJECT_ID
const location = process.env.LOCATION // e.g. 'eu'
const processorId = process.env.PROCESSOR_ID

// Use the regional endpoint for EU processors
const client = new documentai.DocumentProcessorServiceClient({
  apiEndpoint: `${location}-documentai.googleapis.com`,
})

const processorName = client.processorPath(projectId, location, processorId)
console.log('[DocumentAI] processorName:', processorName)
console.log('[DocumentAI] projectId:', projectId, 'location:', location, 'processorId:', processorId)

/**
 * Sends a local PDF file to Document AI and returns the Document object.
 * @param {string} filePath - Path to the uploaded file on disk.
 */
export async function processContractPdf(filePath) {
  console.log('[DocumentAI] processContractPdf filePath:', filePath)

  // Read the file into memory
  const fileBuffer = fs.readFileSync(filePath)

  // Base64-encode the file content, matching the REST sample
  const encodedFile = Buffer.from(fileBuffer).toString('base64')

  const request = {
    name: processorName,
    rawDocument: {
      mimeType: 'application/pdf',
      content: encodedFile,
    },
    skipHumanReview: true,
  }

  console.log('[DocumentAI] request.mimeType:', request.rawDocument.mimeType)
  console.log('[DocumentAI] request.contentLength:', fileBuffer.length)

  const [result] = await client.processDocument(request)
  return result.document
}
