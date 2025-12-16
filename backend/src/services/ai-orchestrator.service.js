// backend/src/services/ai-orchestrator.service.js
// High-level AI orchestrator that wires together OCR text preprocessing,
// LLM1 (structurer) and LLM2 (legal analysis) into a single call
// used by the contract controller.

import { detectLanguage, maskEntities } from "./text-preprocess.service.js";
import { runLlm1Structurer } from "./llm1-structurer.service.js";
import { runLlm2Legal } from "./llm2-legal.service.js";

/**
 * Full analysis pipeline for a single contract text.
 * 1) Detect language and mask entities
 * 2) Call LLM1 to normalise/structure the text
 * 3) Call LLM2 to produce final legal analysis JSON
 *
 * @param {string} rawText - OCR-extracted text of the contract
 * @returns {Promise<object>} Final AI result for the frontend
 */
export async function analyzeContractText(rawText) {
  const language = detectLanguage(rawText);
  const { maskedText, maskMap } = maskEntities(rawText);

  // Step 1: send masked text + language to LLM1
  const llm1Result = await runLlm1Structurer({ text: maskedText, language });

  // Ensure the mask map is included so LLM2 can know entities were masked
  const structuredForLlm2 = {
    ...llm1Result,
    language,
    maskMap,
  };

  // Step 2: send structured representation to LLM2
  const llm2Result = await runLlm2Legal(structuredForLlm2);

  return {
    language,
    maskMap,
    llm1: llm1Result,
    llm2: llm2Result,
  };
}
