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

  // --- PROMPT AANPASSING: executive summary moet een echte samenvatting zijn ---
  const prompt = `You are a legal contract analysis assistant. Given the structured contract data below, generate a JSON report with the following requirements:

1. The executiveSummary field must be a true summary of the contract's content, purpose, parties, and main points. It should be 3–6 sentences and not just a risk overview. If possible, mention the type of contract, the main obligations, and the context.
2. The keySummary and keyFindings fields should focus on the main legal risks and issues.
3. The clauses field must contain for each clause (duration, termination, renewal, liability, payment, confidentiality, jurisdiction):
   - present: true/false
   - text: the full text of the clause (if present)
   - risk: one of 'low', 'medium', 'high'
   - issues: array of strings with concrete issues or empty if none
4. Always include every field in the output, even if empty.
5. Only return valid JSON, no comments or extra text.

Structured contract data:
${JSON.stringify(structuredForLlm2)}
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
