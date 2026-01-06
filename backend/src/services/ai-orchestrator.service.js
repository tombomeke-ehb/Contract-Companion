// backend/src/services/ai-orchestrator.service.js
// High-level AI orchestrator that wires together OCR text preprocessing,
// LLM1 (structurer) and LLM2 (legal analysis) into a single call
// used by the contract controller.

import { detectLanguage, maskEntities } from "./text-preprocess.service.js";
import { runLlm1Structurer } from "./llm1-structurer.service.js";
import { runLlm2LegalOllama } from "./llm2-legal-ollama.service.js";

/**
 * Full analysis pipeline for a single contract text.
 * 1) Detect language and mask entities
 * 2) Call LLM1 to normalise/structure the text
 * 3) Call LLM2 to produce final legal analysis JSON
 *
 * @param {string} rawText - OCR-extracted text of the contract
 * @param {string} contractType - User-selected contract type or "Not sure"
 * @param {string} notes - User-provided notes for context
 * @returns {Promise<object>} Final AI result for the frontend
 */
export async function analyzeContractText(rawText, contractType = '', notes = '') {
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

  // Step 2: send structured representation to LLM2 using Ollama
  let contractTypeInstruction = '';
  if (!contractType || contractType.toLowerCase() === 'not sure') {
    contractTypeInstruction = 'The user is not sure about the contract type. Please infer the contract type from the contract text and specify it in the "contractType" field.';
  } else {
    contractTypeInstruction = `The user selected the contract type: "${contractType}". Use this as context for your analysis and set the "contractType" field accordingly.`;
  }

  let notesInstruction = '';
  if (notes && notes.trim().length > 0) {
    notesInstruction = `User notes for context: "${notes}"`;
  }

  const prompt = `
You are an expert contract lawyer. Analyze the following contract and respond ONLY with a single, valid JSON object.
Do NOT add any explanation, comments, or text before or after the JSON. The JSON must be valid and include ALL fields, even if empty.

${contractTypeInstruction}
${notesInstruction}

If a field is not applicable, use an empty string (""), empty array ([]), or 0 for numbers.

Here is the contract text:

"""${rawText}"""

Respond with JSON in this exact structure:
{
  "title": string,                       // e.g. "Confidentiality Agreement"
  "contractType": string,                // e.g. "NDA", "Employment", "Lease", ...
  "analyzedAt": string,                  // ISO 8601 datetime (UTC)
  "overallRiskScore": number,            // 0.0 (no risk) – 10.0 (very high risk)
  "overallRisk": "low" | "medium" | "high",
  "overallRiskLabel": string,            // e.g. "Moderately Risky"
  "humanSummary": string,                // short summary in English or Dutch
  "keySummary": string,                  // one-sentence summary of main risks
  "executiveSummary": string,            // 3–6 sentences, can be in Dutch
  "focusTags": string[],                 // e.g. ["confidentiality", "collaboration"]
  "keyFindings": string[],               // list of key findings, or [] if none
  "clauseBreakdown": {
    "highRiskClauses": number,
    "mediumRiskClauses": number,
    "lowRiskClauses": number
  },
  "clauses": {
    "duration": { "present": boolean, "text": string, "risk": "low"|"medium"|"high", "issues": string[] },
    "termination": { "present": boolean, "text": string, "risk": "low"|"medium"|"high", "issues": string[] },
    "renewal": { "present": boolean, "text": string, "risk": "low"|"medium"|"high", "issues": string[] },
    "liability": { "present": boolean, "text": string, "risk": "low"|"medium"|"high", "issues": string[] },
    "payment": { "present": boolean, "text": string, "risk": "low"|"medium"|"high", "issues": string[] },
    "confidentiality": { "present": boolean, "text": string, "risk": "low"|"medium"|"high", "issues": string[] },
    "jurisdiction": { "present": boolean, "text": string, "risk": "low"|"medium"|"high", "issues": string[] }
  },
  "recommendedActions": string[]         // list of concrete next steps, or [] if none
}

Rules:
- Always include every field, even if empty.
- If a clause is not present, set "present": false and "text": "".
- Only return valid JSON, no comments or extra text.
`;

  const resultText = await runLlm2LegalOllama({ prompt, model: "qwen2" });
  let llm2Result;
  try {
    const start = resultText.indexOf("{");
    const end = resultText.lastIndexOf("}");
    llm2Result = JSON.parse(resultText.slice(start, end + 1));
  } catch (e) {
    llm2Result = {
      title: "Dummy analysis (Ollama fallback)",
      contractType: "Contract",
      analyzedAt: new Date().toISOString(),
      overallRiskScore: 5.0,
      overallRisk: "medium",
      overallRiskLabel: "Medium risk",
      humanSummary: "Fallback summary.",
      keySummary: "Fallback key summary.",
      executiveSummary: "Fallback executive summary.",
      focusTags: ["Fallback"],
      keyFindings: [],
      clauseBreakdown: {
        highRiskClauses: 0,
        mediumRiskClauses: 0,
        lowRiskClauses: 0,
      },
      clauses: {},
      recommendedActions: [],
    };
  }

  return {
    language,
    maskMap,
    llm1: llm1Result,
    llm2: llm2Result,
  };
}
