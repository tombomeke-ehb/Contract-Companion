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
      maxOutputTokens: 4096 // Zet maxOutputTokens weer hoger voor maximale output
    },
    tools: [
      { googleSearch: {} }
    ]
  });
  // Defensive: try to find the first string content in the response
  const candidates = response.data.candidates;
  if (!candidates || !Array.isArray(candidates) || !candidates[0]) {
    throw new Error('Gemini API: No candidates in response');
  }
  // Try to find a text part in any candidate (robust fallback)
  let text = null;
  for (const cand of candidates) {
    if (cand.content && Array.isArray(cand.content.parts)) {
      for (const part of cand.content.parts) {
        if (typeof part.text === 'string' && part.text.trim().length > 0) {
          text = part.text;
          break;
        }
      }
    }
    if (text) break;
  }
  if (!text) {
    // Verwijder debug-log, gooi alleen error
    throw new Error('Gemini API: No text part in response');
  }
  return text;
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
  // GEEN truncatie, stuur de volledige tekst naar Gemini
  // Prompt optimalisatie: dwing alleen JSON af
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
- Only return valid JSON. No explanation, no markdown, no extra text before or after the JSON. Do not add any plain text, comments, or explanations before or after the JSON. The output must be strictly valid JSON only.
- If a clause is not present, set "present": false and leave other fields empty.
- Be as complete and detailed as possible, but keep the output strictly valid JSON.
- If the contract text is empty or missing, return a JSON object with a field "error": "No contract text provided" and do not generate a sample analysis.

Contract text:
${rawText}
`;

  const resultText = await runGeminiLegal({ prompt });
  let llm2Result;
  try {
    // Probeer direct te parsen
    llm2Result = JSON.parse(resultText);
  } catch (e) {
    // Fallback: probeer alleen het JSON-gedeelte te extraheren
    try {
      const start = resultText.indexOf('{');
      const end = resultText.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        llm2Result = JSON.parse(resultText.slice(start, end + 1));
      } else {
        throw new Error('No JSON object found in Gemini response');
      }
    } catch (fallbackErr) {
      throw new Error('Gemini JSON parse error');
    }
  }
  return llm2Result;
}
