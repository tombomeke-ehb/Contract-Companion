<template>
  <section class="container">
    <header class="card analysis-header" style="margin-bottom:2rem;">
      <div>
        <p class="page-eyebrow">{{ report.contractType }} contract</p>
        <h1 class="section-title">{{ report.title }}</h1>
        <div style="display:flex; gap:1.5rem; align-items:center; margin:1.5rem 0 0.5rem 0;">
          <!-- Risk score circle component -->
          <RiskScoreCircle :score="report.riskScore" :color="getRiskScoreColor(report.riskScore)" />
          <span class="badge" :class="riskBadgeClass">{{ report.riskLabel }}</span>
          <span class="card-subtitle">Analyzed on {{ report.date }}</span>
          <a class="btn btn-outline" href="javascript:void(0)">Download report</a>
        </div>
      </div>
    </header>

    <div style="margin-bottom:2rem;">
      <div class="card" style="background:#f9fafb; margin-bottom:0;">
        <h2 class="card-title" style="font-size:1.1rem; margin-bottom:0.5rem;">Summary</h2>
        <p style="font-size:1rem; color:var(--text);">
          {{ report.humanSummary }}
        </p>
      </div>
    </div>

    <div class="two-column analysis-grid" style="margin-bottom:2rem;">
      <article class="card">
        <h2 class="card-title">Key findings</h2>
        <p class="card-subtitle">{{ report.keySummary }}</p>
        <ul class="list">
          <li v-for="finding in report.keyFindings" :key="finding.title">
            <strong>{{ finding.title }}</strong><br />
            {{ finding.body }}
          </li>
        </ul>
      </article>

      <article class="card">
        <h2 class="card-title">Executive summary</h2>
        <p>{{ report.summary }}</p>
        <div class="profile-tags" style="margin-top: 1rem">
          <span class="pill pill-muted" v-for="tag in report.focus" :key="tag">
            {{ tag }}
          </span>
        </div>
      </article>
    </div>

    <article class="card" style="margin-bottom:2rem;">
      <h2 class="card-title">Clause breakdown</h2>
      <div class="stats-grid">
        <div class="stat-card" v-for="(value, label) in report.breakdown" :key="label">
          <span class="stat-label">{{ label }}</span>
          <span class="stat-value">{{ value }}</span>
        </div>
      </div>
    </article>

    <article class="card">
      <h2 class="card-title">Recommended next steps</h2>
      <ol class="doc-list doc-list--numbered">
        <li v-for="action in report.actions" :key="action.title">
          <strong>{{ action.title }}</strong>
          <span>{{ action.body }}</span>
        </li>
      </ol>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import RiskScoreCircle from '../components/RiskScoreCircle.vue'

/**
 * Get color for risk score circle based on score value
 * Green: low risk (<5), Orange: medium (5-6), Red: high (>6)
 * @param {number} score
 * @returns {string} color
 */
function getRiskScoreColor(score) {
  if (score < 5) return '#16a34a' // green
  if (score < 6) return '#f97316' // orange
  return '#ef4444' // red
}

const reports = {
  '1': {
    title: 'Employment Agreement  Tech Corp',
    contractType: 'Employment',
    date: '15 Jan 2025',
    riskScore: 4.2,
    risk: 'high',
    riskLabel: 'High risk',
    keySummary: 'Three high-risk clauses and five medium-risk clauses detected.',
    humanSummary: 'Dit contract bevat een strenge non-compete, eenzijdige beëindigingsvoorwaarden en een variabel bonussysteem zonder duidelijke criteria. Extra aandacht vereist voor de belangen van de werknemer.',
    keyFindings: [
      {
        title: 'Non-compete scope',
        body: 'Geographical limit is undefined and the duration exceeds 24 months.'
      },
      {
        title: 'Termination clause',
        body: 'No mutual notice period and termination for convenience only favours the employer.'
      },
      {
        title: 'Bonus structure',
        body: 'Variable compensation lacks a measurable performance framework.'
      }
    ],
    summary:
      'This agreement outlines the collaboration between Tech Corp and John Doe. The monthly retainer and responsibilities are clear, but risk exposure is driven by a strict non-compete and uneven termination conditions.',
    focus: ['Employment', 'Compensation', 'Non-compete'],
    breakdown: {
      'High-risk clauses': 3,
      'Medium-risk clauses': 5,
      'Low-risk clauses': 4
    },
    actions: [
      {
        title: 'Reduce non-compete window',
        body: 'Limit the non-compete to 12 months and specify the region.'
      },
      {
        title: 'Add mutual notice period',
        body: 'Ensure both parties have equal rights to terminate with notice.'
      },
      {
        title: 'Clarify bonus criteria',
        body: 'Define measurable performance targets for variable pay.'
      }
    ]
  },
  '2': {
    title: 'NDA  Startup Inc',
    contractType: 'Confidentiality',
    date: '12 Jan 2025',
    riskScore: 4.3,
    risk: 'medium',
    riskLabel: 'Medium risk',
    keySummary: 'One obligation mismatch and two clauses worth revisiting.',
    humanSummary: 'Deze NDA bevat een brede definitie van vertrouwelijke informatie, een residu-clausule zonder duidelijke grenzen en een rechtskeuze die niet aansluit bij de operationele regio.',
    keyFindings: [
      {
        title: 'Definition of confidential information',
        body: 'Includes information that was already public knowledge.'
      },
      {
        title: 'Residuals clause',
        body: 'Allows engineers to reuse learnings without clarifying limits.'
      },
      {
        title: 'Governing law',
        body: 'Defaults to US law while both parties operate in Belgium.'
      }
    ],
    summary:
      'Overall the NDA is balanced, but the governing law and residuals clause should align with EU privacy expectations.',
    focus: ['NDA', 'Confidentiality'],
    breakdown: {
      'High-risk clauses': 1,
      'Medium-risk clauses': 2,
      'Low-risk clauses': 6
    },
    actions: [
      {
        title: 'Sharpen confidential definition',
        body: 'Exclude information the receiving party already possessed.'
      },
      {
        title: 'Clarify residuals',
        body: 'Limit use of learnings to anonymised patterns.'
      },
      {
        title: 'Update governing law',
        body: 'Switch to Belgian law for easier enforcement.'
      }
    ]
  }
}

const route = useRoute()
const report = reports[route.params.id || '1']

const riskBadgeClass = computed(() => {
  if (report.risk === 'high') return 'badge-high'
  if (report.risk === 'medium') return 'badge-medium'
  return 'badge-low'
})
</script>
