<template>
  <section class="container" v-if="normalizedReport">
    <header class="card analysis-header" style="margin-bottom:2rem;">
      <div>
        <p class="page-eyebrow">{{ normalizedReport.contractType }} contract</p>
        <h1 class="section-title">{{ normalizedReport.title }}</h1>
        <div style="display:flex; gap:1.5rem; align-items:center; margin:1.5rem 0 0.5rem 0;">
          <!-- Risk score circle component -->
          <RiskScoreCircle :score="normalizedReport.riskScore" :color="getRiskScoreColor(normalizedReport.riskScore)" />
          <span class="badge" :class="riskBadgeClass">{{ normalizedReport.riskLabel }}</span>
          <span class="card-subtitle">Analyzed on {{ normalizedReport.date }}</span>
          <a class="btn btn-outline" href="javascript:void(0)">Download report</a>
        </div>
      </div>
    </header>

    <div style="margin-bottom:2rem;">
      <div class="card" style="background:#f9fafb; margin-bottom:0;">
        <h2 class="card-title" style="font-size:1.1rem; margin-bottom:0.5rem;">Summary</h2>
        <p style="font-size:1rem; color:var(--text);">
          {{ normalizedReport.humanSummary }}
        </p>
      </div>
    </div>

    <div class="two-column analysis-grid" style="margin-bottom:2rem;">
      <article class="card">
        <h2 class="card-title">Key findings</h2>
        <p class="card-subtitle">{{ normalizedReport.keySummary }}</p>
        <ul class="list">
          <li v-for="finding in normalizedReport.keyFindings" :key="finding.title || finding">
            <strong>{{ finding.title || finding }}</strong><br />
            {{ finding.body || '' }}
          </li>
        </ul>
      </article>

      <article class="card">
        <h2 class="card-title">Executive summary</h2>
        <p>{{ normalizedReport.summary }}</p>
        <div class="profile-tags" style="margin-top: 1rem">
          <span class="pill pill-muted" v-for="tag in normalizedReport.focus" :key="tag">
            {{ tag }}
          </span>
        </div>
      </article>
    </div>

    <article class="card" style="margin-bottom:2rem;">
      <h2 class="card-title">Clause breakdown</h2>
      <div class="stats-grid">
        <div class="stat-card" v-for="(value, label) in normalizedReport.breakdown" :key="label">
          <span class="stat-label">{{ label }}</span>
          <span class="stat-value">{{ value }}</span>
        </div>
      </div>
    </article>

    <article class="card" style="margin-bottom:2rem;">
      <h2 class="card-title">Clause details</h2>
      <div v-if="normalizedReport.clauses">
        <div v-for="(clause, key) in normalizedReport.clauses" :key="key" class="clause-block">
          <h3 style="margin-bottom:0.25rem;">{{ key.charAt(0).toUpperCase() + key.slice(1) }}</h3>
          <div v-if="clause.present">
            <p><strong>Text:</strong> {{ clause.text }}</p>
            <p><strong>Risk:</strong> <span :class="'risk-' + clause.risk">{{ clause.risk }}</span></p>
            <ul v-if="clause.issues && clause.issues.length">
              <li v-for="issue in clause.issues" :key="issue">{{ issue }}</li>
            </ul>
          </div>
          <div v-else>
            <em>Not present in contract</em>
          </div>
        </div>
      </div>
      <div v-else>
        <em>No clause details available.</em>
      </div>
    </article>

    <article class="card">
      <h2 class="card-title">Recommended next steps</h2>
      <ol class="doc-list doc-list--numbered">
        <li v-for="action in normalizedReport.actions" :key="action.title || action">
          <strong>{{ action.title || action }}</strong>
          <span>{{ action.body || '' }}</span>
        </li>
      </ol>
    </article>
  </section>
  <section v-else class="container">
    <p class="card-subtitle">No report data available.</p>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import RiskScoreCircle from '../components/RiskScoreCircle.vue'
import { useContractStore } from '../stores/contractStore'

function getRiskScoreColor(score) {
  if (score < 5) return '#16a34a' // green
  if (score < 6) return '#f97316' // orange
  return '#ef4444' // red
}

const route = useRoute()
const contractStore = useContractStore()
const report = ref(null)

const demoReports = {
  'demo-1': {
    title: 'Employment Agreement  Tech Corp',
    contractType: 'Employment',
    date: '15 Jan 2025',
    riskScore: 4.2,
    risk: 'high',
    riskLabel: 'High risk',
    keySummary: 'Three high-risk clauses and five medium-risk clauses detected.',
    humanSummary: 'Dit contract bevat een strenge non-compete, eenzijdige beëindigingsvoorwaarden en een variabel bonussysteem zonder duidelijke criteria. Extra aandacht vereist voor de belangen van de werknemer.',
    keyFindings: [
      { title: 'Non-compete scope', body: 'Geographical limit is undefined and the duration exceeds 24 months.' },
      { title: 'Termination clause', body: 'No mutual notice period and termination for convenience only favours the employer.' },
      { title: 'Bonus structure', body: 'Variable compensation lacks a measurable performance framework.' }
    ],
    summary: 'This agreement outlines the collaboration between Tech Corp and John Doe. The monthly retainer and responsibilities are clear, but risk exposure is driven by a strict non-compete and uneven termination conditions.',
    focus: ['Employment', 'Compensation', 'Non-compete'],
    breakdown: {
      'High-risk clauses': 3,
      'Medium-risk clauses': 5,
      'Low-risk clauses': 4
    },
    actions: [
      { title: 'Reduce non-compete window', body: 'Limit the non-compete to 12 months and specify the region.' },
      { title: 'Add mutual notice period', body: 'Ensure both parties have equal rights to terminate with notice.' },
      { title: 'Clarify bonus criteria', body: 'Define measurable performance targets for variable pay.' }
    ]
  },
  'demo-2': {
    title: 'NDA  Startup Inc',
    contractType: 'Confidentiality',
    date: '12 Jan 2025',
    riskScore: 4.3,
    risk: 'medium',
    riskLabel: 'Medium risk',
    keySummary: 'One obligation mismatch and two clauses worth revisiting.',
    humanSummary: 'Deze NDA bevat een brede definitie van vertrouwelijke informatie, een residu-clausule zonder duidelijke grenzen en een rechtskeuze die niet aansluit bij de operationele regio.',
    keyFindings: [
      { title: 'Definition of confidential information', body: 'Includes information that was already public knowledge.' },
      { title: 'Residuals clause', body: 'Allows engineers to reuse learnings without clarifying limits.' },
      { title: 'Governing law', body: 'Defaults to US law while both parties operate in Belgium.' }
    ],
    summary: 'Overall the NDA is balanced, but the governing law and residuals clause should align with EU privacy expectations.',
    focus: ['NDA', 'Confidentiality'],
    breakdown: {
      'High-risk clauses': 1,
      'Medium-risk clauses': 2,
      'Low-risk clauses': 6
    },
    actions: [
      { title: 'Sharpen confidential definition', body: 'Exclude information the receiving party already possessed.' },
      { title: 'Clarify residuals', body: 'Limit use of learnings to anonymised patterns.' },
      { title: 'Update governing law', body: 'Switch to Belgian law for easier enforcement.' }
    ]
  }
}

onMounted(async () => {
  const id = route.params.id?.toString() || 'demo-1'
  // Prefer report from store (set after upload), fallback to demo
  if (contractStore.currentReport && contractStore.currentReport.id?.toString() === id) {
    report.value = contractStore.currentReport
  } else {
    // Fetch from backend if not in store
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:3443';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/api/contracts/${id}`, {
        credentials: 'include',
        headers
      })
      if (res.ok) {
        const data = await res.json()
        if (data.report) {
          report.value = data.report
        } else if (data.analysisJson) {
          report.value = data.analysisJson
        } else {
          report.value = data
        }
      } else {
        report.value = demoReports[id] || null
      }
    } catch (e) {
      report.value = demoReports[id] || null
    }
  }
})

const normalizedReport = computed(() => {
  // If backend returns a full report, use it. If only summary, map to expected shape.
  const r = report.value
  if (!r) return null
  // If r has all expected fields, return as is
  if (
    typeof r.riskScore === 'number' &&
    r.breakdown && Object.keys(r.breakdown).length > 0 &&
    Array.isArray(r.actions) && r.actions.length > 0
  ) {
    return r
  }
  // Otherwise, map legacy/summary shape to expected fields
  return {
    title: r.title || 'Contract',
    contractType: r.contractType || 'Contract',
    date: r.date || r.uploadedAt || '',
    riskScore: typeof r.riskScore === 'number' ? r.riskScore : 0,
    risk: r.risk || 'medium',
    riskLabel: r.riskLabel || 'Medium risk',
    keySummary: r.keySummary || '',
    humanSummary: r.humanSummary || r.description || '',
    keyFindings: r.keyFindings || [],
    summary: r.summary || r.text || '',
    focus: r.focus || [],
    breakdown: r.breakdown || { 'High-risk clauses': 0, 'Medium-risk clauses': 0, 'Low-risk clauses': 0 },
    actions: r.actions || [],
    clauses: r.clauses || {},
  }
})

const riskBadgeClass = computed(() => {
  if (!normalizedReport.value) return ''
  if (normalizedReport.value.risk === 'high') return 'badge-high'
  if (normalizedReport.value.risk === 'medium') return 'badge-medium'
  return 'badge-low'
})
</script>
