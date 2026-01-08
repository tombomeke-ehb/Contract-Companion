// backend/src/services/report-mapper.service.js
// Helper to map the LLM2 legal analysis output into the "report" shape
// expected by the Vue pages (AnalysisDetail.vue, Dashboard.vue).

/**
 * Map LLM2 legal analysis into a frontend-friendly report object.
 * This does not persist anything; it only reshapes fields.
 *
 * @param {object} llm2 - LLM2 legal analysis output
 * @param {number|string} id - Optional identifier for the report
 */
export function mapLlm2ToReport(llm2, id = null) {
  if (!llm2) return null;

  // Direct mapping, no fallback to 0/[] if field exists
  const breakdown = llm2.clauseBreakdown || llm2.breakdown || null;
  const actionsRaw = llm2.recommendedActions || llm2.actions || null;

  // Key findings: altijd array van objecten
  let keyFindings = [];
  if (Array.isArray(llm2.keyFindings)) {
    keyFindings = llm2.keyFindings.map(f => typeof f === 'string' ? { title: f, body: '' } : f);
  } else if (typeof llm2.keyFindings === 'string') {
    keyFindings = [{ title: llm2.keyFindings, body: '' }];
  }

  // Clause breakdown: direct mapping, geen fallback naar 0 als Gemini het veld levert
  let clauseBreakdown = undefined;
  if (breakdown && typeof breakdown === 'object' &&
      ('highRiskClauses' in breakdown || 'mediumRiskClauses' in breakdown || 'lowRiskClauses' in breakdown)) {
    clauseBreakdown = {
      "High-risk clauses": breakdown.highRiskClauses,
      "Medium-risk clauses": breakdown.mediumRiskClauses,
      "Low-risk clauses": breakdown.lowRiskClauses,
    };
  } else if (breakdown && typeof breakdown === 'object') {
    clauseBreakdown = breakdown;
  } else {
    clauseBreakdown = undefined;
  }

  // RISK SCORE FIX: Robuustere check
  const rawScore = (llm2.overallRiskScore !== undefined && llm2.overallRiskScore !== null)
    ? llm2.overallRiskScore
    : llm2.riskScore;

  let riskScore = undefined;
  if (rawScore !== undefined && rawScore !== null) {
    const parsed = Number(rawScore);
    if (!isNaN(parsed)) {
      riskScore = parsed;
    }
  }

  // Risk label: neem expliciet Gemini's overallRiskLabel, anders overallRisk, anders undefined
  let riskLabel = llm2.overallRiskLabel || llm2.riskLabel || llm2.overallRisk || undefined;

  return {
    id,
    title: llm2.title,
    contractType: llm2.contractType,
    date: llm2.analyzedAt || new Date().toISOString(),
    riskScore,
    risk: llm2.overallRisk,
    riskLabel,
    humanSummary: llm2.humanSummary,
    keySummary: Array.isArray(llm2.keySummary) ? llm2.keySummary.join(' ') : llm2.keySummary,
    keyFindings,
    summary: llm2.executiveSummary || llm2.summary,
    focus: llm2.focusTags,
    breakdown: clauseBreakdown,
    actions: Array.isArray(actionsRaw) ? actionsRaw.map(a => typeof a === 'string' ? { title: a, body: '' } : a) : [],
    clauses: llm2.clauses,
  };
}
