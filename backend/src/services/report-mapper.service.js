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

  const breakdown = llm2.clauseBreakdown || {};

  return {
    id,
    title: llm2.title || "Contract analysis",
    contractType: llm2.contractType || "Contract",
    date: llm2.analyzedAt || new Date().toISOString(),
    riskScore: typeof llm2.overallRiskScore === "number" ? llm2.overallRiskScore : 5.0,
    risk: llm2.overallRisk || "medium",
    riskLabel: llm2.overallRiskLabel || "Medium risk",

    humanSummary: llm2.humanSummary || "",
    keySummary: llm2.keySummary || "",
    keyFindings: llm2.keyFindings || [],

    summary: llm2.executiveSummary || "",
    focus: llm2.focusTags || [],

    breakdown: {
      "High-risk clauses": breakdown.highRiskClauses ?? 0,
      "Medium-risk clauses": breakdown.mediumRiskClauses ?? 0,
      "Low-risk clauses": breakdown.lowRiskClauses ?? 0,
    },

    actions: llm2.recommendedActions || [],
  };
}
