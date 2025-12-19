// backend/src/services/llm2-legal.service.js
// LLM layer 2: legal-specialised model.
// This service receives the structured, masked and (if needed) translated
// representation from LLM1 and produces the final legal analysis JSON
// (summary, riskScore, clauses, etc.).

import axios from "axios";

const LLM2_BASE_URL = process.env.LLM2_BASE_URL || "http://localhost:8000";

/**
 * Call the LLM2 legal service to analyse structured contract data.
 * @param {object} structuredInput - Output from LLM1.
 * @returns {Promise<object>} Final legal analysis JSON from LLM2.
 */
export async function runLlm2Legal(structuredInput) {
  const url = `${LLM2_BASE_URL}/analyze-legal`;

  const response = await axios.post(url, {
    payload: structuredInput,
  });

  return response.data;
}
