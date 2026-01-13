// backend/src/services/llm2-legal.service.js
// LLM layer 2: legal-specialised model.
// This service receives the structured, masked and (if needed) translated
// representation from LLM1 and produces the final legal analysis JSON
// (summary, riskScore, clauses, etc.).

// This file is deprecated and no longer used. LLM2 analysis is now handled by Gemini in ai-orchestrator.service.js.
// You can safely delete this file.

import axios from "axios";

const LLM2_BASE_URL = "http://127.0.0.1:1234";

/**
 * Call the LM Studio SaulLM model to analyse structured contract data.
 * @param {object} param0 - { prompt: string }
 * @returns {Promise<string>} Final legal analysis JSON from LM Studio SaulLM.
 */
export async function runLlm2Legal({ prompt }) {
  // LM Studio API call (SaulLM)
  const response = await axios.post(`${LLM2_BASE_URL}/v1/completions`, {
    prompt,
    max_tokens: 2048,
    temperature: 0.2,
  });
  return response.data.choices[0].text;
}
