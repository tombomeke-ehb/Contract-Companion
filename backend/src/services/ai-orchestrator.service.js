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
  const prompt = `Je bent een expert in juridische contractanalyse. Analyseer de onderstaande contracttekst en genereer een zeer gedetailleerd JSON-rapport in het Nederlands met de volgende structuur:

{
  "title": "Een korte, beschrijvende titel voor dit contract.",
  "contractType": "Het type contract (bijv. NDA, Dienstverleningsovereenkomst, Arbeidsovereenkomst, etc.)",
  "analyzedAt": "De huidige datum en tijd in ISO-formaat.",
  "overallRiskScore": "Een getal van 1 (zeer laag risico) tot 10 (zeer hoog risico) dat het algemene juridische risico samenvat.",
  "overallRisk": "Een risicolabel van één woord: 'low', 'medium', of 'high'.",
  "overallRiskLabel": "Een gebruiksvriendelijk risicolabel (bijv. 'Laag risico', 'Gemiddeld risico', 'Hoog risico').",
  "humanSummary": "Een beknopte samenvatting van het contract in begrijpelijk Nederlands (4-8 zinnen). Focus op de essentie voor de gebruiker.",
  "keySummary": "Een puntsgewijze samenvatting van de belangrijkste juridische risico's en aandachtspunten.",
  "executiveSummary": "Een zeer gedetailleerde samenvatting van de inhoud, het doel, de partijen en de belangrijkste bepalingen van het contract (10-20 zinnen). Wees zeer specifiek.",
  "focusTags": ["Relevante trefwoorden of onderwerpen, bijv. 'geheimhouding', 'aansprakelijkheid', 'beëindiging', ..."],
  "keyFindings": [
    { "title": "Titel van de bevinding", "body": "Gedetailleerde uitleg van de bevinding, waarom het belangrijk is en wat het risico is." }
  ],
  "clauseBreakdown": {
    "highRiskClauses": "Aantal clausules met een hoog risico.",
    "mediumRiskClauses": "Aantal clausules met een gemiddeld risico.",
    "lowRiskClauses": "Aantal clausules met een laag risico."
  },
  "clauses": {
    "duration": { "present": true/false, "text": "De letterlijke of geparafraseerde tekst uit het contract.", "risk": "low/medium/high", "issues": ["Lijst met specifieke problemen of risico's bij deze clausule"] },
    "termination": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "renewal": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "liability": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "payment": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "confidentiality": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "jurisdiction": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "intellectualProperty": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] },
    "nonSolicitation": { "present": true/false, "text": "...", "risk": "low/medium/high", "issues": ["..."] }
  },
  "recommendedActions": [
    { "title": "Korte titel van de actie", "body": "Gedetailleerde uitleg van wat de gebruiker moet doen of onderhandelen." }
  ]
}

Instructies:
- Vul elk veld in, zelfs als het leeg is (gebruik een lege string, 0 of [] waar nodig).
- Gebruik GEEN placeholders zoals [PARTIJ_1], [DATUM], [OPTIONEEL], [VOLGT], etc. Gebruik alleen echte waarden uit het contract.
- Lever enkel geldige JSON op. Geen uitleg, geen markdown, geen extra tekst voor of na de JSON.
- Als een clausule niet aanwezig is, zet "present": false en laat de andere velden leeg of standaard.
- Wees zo volledig en gedetailleerd mogelijk. Geef minimaal 5 'keyFindings' en 3 'recommendedActions'.
- De taal van de output MOET Nederlands zijn.

Contracttekst:
${rawText}
`;;

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
