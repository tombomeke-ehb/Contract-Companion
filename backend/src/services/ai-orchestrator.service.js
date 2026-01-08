// backend/src/services/ai-orchestrator.service.js
// High-level AI orchestrator that wires together OCR text preprocessing,
// LLM1 (structurer) and LLM2 (legal analysis) into a single call
// used by the contract controller.

import { detectLanguage, maskEntities } from "./text-preprocess.service.js";
import { runLlm1Structurer } from "./llm1-structurer.service.js";
import { mapLlm2ToReport } from "./report-mapper.service.js";
import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function runGeminiLegal({ prompt }) {
  const model = "gemini-3-pro-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not set. Please set GEMINI_API_KEY in your environment variables.");
  }
  const response = await axios.post(url, {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      thinkingConfig: { thinkingLevel: "high" },
      temperature: 1.0,
      maxOutputTokens: 4096
    },
    tools: [
      { googleSearch: {} }
    ]
  });
  return response.data.candidates[0].content.parts[0].text;
}

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

  // Alleen relevante data naar Gemini sturen (geen maskMap)
  const structuredForLlm2 = {
    normalizedText: llm1Result.normalizedText,
    language,
    contractType,
    notes
  };

  // Prompt voor Gemini (uitgebreid, duidelijk, alles invullen, geen placeholders)
  const prompt = `You are a legal contract analysis assistant. Given the contract text below, generate a detailed JSON report with the following structure:

{
  "title": "A short, descriptive title for this contract.",
  "contractType": "The type of contract (e.g. NDA, Service Agreement, Employment Contract, etc.)",
  "analyzedAt": "The current date and time in ISO format.",
  "overallRiskScore": "A number from 1 (very low risk) to 10 (very high risk) summarizing the overall legal risk.",
  "overallRisk": "A one-word risk label: 'low', 'medium', or 'high'.",
  "overallRiskLabel": "A human-friendly risk label (e.g. 'Low risk', 'Medium risk', 'High risk').",
  "humanSummary": "A concise summary of the contract in plain English (3-6 sentences).",
  "keySummary": "A bullet-point summary of the main legal risks and issues.",
  "executiveSummary": "A longer, detailed summary of the contract's content, purpose, parties, and main points (6-12 sentences).",
  "focusTags": ["Relevant keywords or topics, e.g. 'confidentiality', 'liability', 'termination', ..."],
  "keyFindings": ["List of the most important legal findings, issues, or unusual clauses."],
  "clauseBreakdown": {
    "highRiskClauses": "Number of high-risk clauses.",
    "mediumRiskClauses": "Number of medium-risk clauses.",
    "lowRiskClauses": "Number of low-risk clauses."
  },
  "clauses": {
    "duration": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "termination": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "renewal": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "liability": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "payment": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "confidentiality": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "jurisdiction": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] }
  },
  "recommendedActions": ["Concrete, actionable legal recommendations for the user."]
}

Instructions:
- Fill in every field, even if empty (use empty string, 0, or [] as appropriate).
- Do NOT use placeholders like [PARTY_1], [DATUM], [OPTIONEEL], [VOLGT], etc. Only use real values from the contract.
- Only return valid JSON. No explanation, no markdown, no extra text before or after the JSON.
- If a clause is not present, set "present": false and leave other fields empty.
- Be as complete and detailed as possible, but keep the output strictly valid JSON.

Contract text:
${llm1Result.normalizedText}
`;

  // Gemini API call
  const resultText = await runGeminiLegal({ prompt });
  console.log("[ai-orchestrator] Gemini antwoord:", resultText);
  let llm2Result;
  try {
    const start = resultText.indexOf("{");
    const end = resultText.lastIndexOf("}");
    llm2Result = JSON.parse(resultText.slice(start, end + 1));
  } catch (e) {
    llm2Result = {
      title: "Contract analysis",
      contractType: "Contract",
      analyzedAt: new Date().toISOString(),
      overallRiskScore: 5.0,
      overallRisk: "medium",
      overallRiskLabel: "Medium risk",
      humanSummary: "",
      keySummary: "",
      executiveSummary: "",
      focusTags: [],
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

  // Mapping stap: zet het LLM2-resultaat om naar frontend rapport shape
  const report = mapLlm2ToReport(llm2Result);

  return {
    language,
    maskMap,
    llm1: llm1Result,
    llm2: report,
  };
}
