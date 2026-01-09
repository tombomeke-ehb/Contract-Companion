// backend/src/services/text-preprocess.service.js
// Lightweight preprocessing helpers: language detection stub and
// optional masking of sensitive entities before sending text to LLM1.

/**
 * Detect the language of a given text.
 * For now this is a simple stub based on heuristics; later you can
 * replace it with a proper language detection library or model.
 * @param {string} text
 * @returns {"en" | "nl" | "fr"}
 */
export function detectLanguage(text) {
  const lower = text.toLowerCase();
  if (/[éèàç]/.test(lower) || lower.includes("accord") || lower.includes("contrat")) {
    return "fr";
  }
  if (lower.includes("overeenkomst") || lower.includes("dienst") || lower.includes("verhuur")) {
    return "nl";
  }
  return "en";
}

/**
 * Very simple masking implementation to hide obvious names and amounts.
 * This is intentionally basic and can be improved later with NER models.
 * @param {string} text
 * @returns {{ maskedText: string, maskMap: Record<string,string> }}
 */
export function maskEntities(text) {
  const maskMap = {};
  let maskedText = text;

  // Example: mask euro amounts like "€ 1.000" or "EUR 5000"
  const priceRegex = /(€\s?[0-9.,]+|\bEUR\s?[0-9.,]+)/gi;
  let priceIndex = 1;
  maskedText = maskedText.replace(priceRegex, (match) => {
    const key = `[PRICE_${priceIndex++}]`;
    maskMap[key] = match;
    return key;
  });

  // Example: mask all-caps words of length >= 3 as potential party names
  const partyRegex = /\b([A-Z][A-Z0-9&]{2,})\b/g;
  let partyIndex = 1;
  maskedText = maskedText.replace(partyRegex, (match) => {
    const key = `[PARTY_${partyIndex++}]`;
    maskMap[key] = match;
    return key;
  });

  return { maskedText, maskMap };
}
