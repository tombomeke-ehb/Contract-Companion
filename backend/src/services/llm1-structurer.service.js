// backend/src/services/llm1-structurer.service.js
// LLM layer 1: general multilingual pre-processor + structurer.
// This service is responsible for sending OCR text to the first LLM
// which will (1) normalise / translate to English if needed,
// (2) mask sensitive entities like names and amounts, and
// (3) return a structured JSON object with basic sections.

import axios from "axios";

const LLM1_BASE_URL = process.env.LLM1_BASE_URL || "http://localhost:8000";

/**
 * Call the LLM1 service to pre-process and structure raw contract text.
 * @param {string} text - Raw OCR text from the contract.
 * @param {string} language - ISO code of detected language (e.g. "en", "nl", "fr").
 * @returns {Promise<object>} Structured JSON from LLM1.
 */
export async function runLlm1Structurer({ text, language }) {
  const url = `${LLM1_BASE_URL}/analyze`;

  const response = await axios.post(url, {
    text,
    language,
  });

  return response.data;
}
