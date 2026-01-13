<template>
  <section class="container" v-if="normalizedReport">
    <header class="card analysis-header" style="margin-bottom:2rem;">
      <div>
        <p class="page-eyebrow">
          <template v-if="!editMode">
            {{ normalizedReport.contractType }} contract
          </template>
          <template v-else>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <select v-if="!customTypeMode" v-model="editContractType" class="input contract-type-select" style="min-width:160px; max-width:220px;">
                <option v-for="type in contractTypes" :key="type" :value="type">{{ type }}</option>
                <option value="__custom__">Anders...</option>
              </select>
              <input v-else v-model="editContractType" class="input contract-type-input" style="min-width:160px; max-width:220px;" placeholder="Eigen type invullen..." />
              <button v-if="!customTypeMode && editContractType === '__custom__'" class="btn btn-outline" style="margin-left:0.5rem;" @click="customTypeMode = true; editContractType = aiSuggestedType || ''">Zelf invullen</button>
              <button v-if="customTypeMode" class="btn btn-outline" style="margin-left:0.5rem;" @click="customTypeMode = false; editContractType = contractTypes[0]">Annuleer</button>
              <span v-if="aiSuggestedType && customTypeMode" class="card-subtitle" style="margin-left:0.5rem; color:#888; font-size:0.95em;">AI suggestie: {{ aiSuggestedType }}</span>
            </div>
          </template>
        </p>
        <h1 class="section-title">
          <template v-if="!editMode">
            {{ normalizedReport.title }}
          </template>
          <template v-else>
            <input v-model="editTitle" class="input" style="font-size:1.5rem; max-width:400px;" />
          </template>
        </h1>
        <div style="display:flex; gap:1.5rem; align-items:center; margin:1.5rem 0 0.5rem 0;">
          <!-- Risk score circle component -->
          <RiskScoreCircle :score="normalizedReport.riskScore" :color="getRiskScoreColor(normalizedReport.riskScore)" />
          <span class="badge" :class="riskBadgeClass">{{ normalizedReport.riskLabel }}</span>
          <span class="card-subtitle">Analyzed on {{ normalizedReport.date }}</span>
          <a class="btn btn-outline" href="javascript:void(0)">Download report</a>
        </div>
        <div style="margin-top:1rem;">
          <button v-if="!editMode" class="btn btn-outline" @click="editMode = true">Edit contract info</button>
          <button v-else class="btn btn-primary" @click="saveContractInfo">Save</button>
          <button v-if="editMode" class="btn btn-outline" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </header>

    <article v-if="!isCommonPage" class="card" style="margin-bottom:2rem;">
      <h2 class="card-title">Contract Dates & Calendar</h2>
      <p class="card-subtitle">Set contract start/end and schedule a reminder in one place.</p>

      <div
        style="display:grid; gap:1rem; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); align-items:flex-start; margin-top:1rem;"
      >
        <div class="form-group" style="margin:0;">
          <label class="label">Contract Start Date & Time</label>
          <input v-model="contractStartDate" type="datetime-local" class="input" />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="label">Contract End Date & Time</label>
          <input v-model="contractEndDate" type="datetime-local" class="input" />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="label">Reminder Date & Time (prefilled with contract end)</label>
          <input v-model="eventDate" type="datetime-local" class="input" />
        </div>
        <div class="form-group" style="margin:0;">
          <label class="label">Duration (minutes)</label>
          <input v-model.number="durationMinutes" type="number" min="15" class="input" />
        </div>
      </div>

      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:1rem; align-items:center;">
        <button class="btn btn-primary" type="button" @click="saveContractDates">
          Save Contract Dates
        </button>
        <a
          class="btn btn-outline"
          :href="googleLink || 'javascript:void(0)'"
          target="_blank"
          rel="noopener"
          :aria-disabled="!googleLink"
          :style="!googleLink ? 'pointer-events:none; opacity:0.6;' : ''"
        >
          Add to Google Calendar
        </a>
        <button class="btn btn-outline" type="button" :disabled="!eventPayload" @click="downloadClientIcs">
          Download .ics (client)
        </button>
        <button class="btn btn-outline" type="button" :disabled="!eventPayload || downloading" @click="downloadServerIcs">
          {{ downloading ? 'Downloading...' : 'Download .ics (server)' }}
        </button>
        <p v-if="dateSaveSuccess" class="card-subtitle" style="color:var(--success); margin:0;">
          {{ dateSaveSuccess }}
        </p>
        <p v-if="dateSaveError" class="card-subtitle" style="color:var(--danger); margin:0;">
          {{ dateSaveError }}
        </p>
        <p v-if="calendarError" class="card-subtitle" style="color:var(--danger); margin:0;">
          {{ calendarError }}
        </p>
        <p v-else-if="calendarSuccess" class="card-subtitle" style="color:var(--success); margin:0;">
          {{ calendarSuccess }}
        </p>
      </div>
    </article>

    <div style="margin-bottom:2rem;">
      <div class="card" style="margin-bottom:0;">
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
            <p>
              <strong>Risk:</strong>
              <span :class="'risk-' + clause.risk">{{ clause.risk }}</span>
            </p>
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
    <article class="card">
      <h2 class="card-title">Loading report…</h2>
      <p v-if="loading" class="card-subtitle">Please wait while we load your contract analysis.</p>
      <p v-else class="card-subtitle" style="color:var(--danger);">
        {{ loadError || 'Report could not be loaded.' }}
      </p>
    </article>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import RiskScoreCircle from '../components/RiskScoreCircle.vue'
import { buildGoogleCalendarUrl, downloadIcsClient } from '../utils/calendar'
import { downloadServerIcs as downloadServerIcsApi } from '../api/calendar'
import { useContractStore } from '../stores/contractStore'
import { getContractById, updateContractInfo } from '../api/contracts'
import { useNotificationStore } from '../stores/notificationStore'
import { getCommonContractReport } from '../api/commonContracts'

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

const route = useRoute()
const contractStore = useContractStore()
const notificationStore = useNotificationStore()

// Calendar/reminder feature refs (verwijder dubbele definities!)
const contractStartDate = ref('')
const contractEndDate = ref('')
const dateSaveSuccess = ref('')
const dateSaveError = ref('')
const eventDate = ref('')
const durationMinutes = ref(60)
const calendarError = ref('')
const calendarSuccess = ref('')
const downloading = ref(false)

// Prepare event payload for calendar links and ICS files
const eventPayload = computed(() => {
  if (!eventDate.value) return null
  const start = new Date(eventDate.value)
  if (Number.isNaN(start.getTime())) return null
  const durationMs = Math.max(15, Number(durationMinutes.value) || 60) * 60 * 1000
  const end = new Date(start.getTime() + durationMs)
  if (!normalizedReport.value) return null
  return {
    title: `${normalizedReport.value.title} review`,
    description: normalizedReport.value.summary || normalizedReport.value.keySummary,
    location: '',
    start: start.toISOString(),
    end: end.toISOString(),
  }
})

const googleLink = computed(() => {
  if (!eventPayload.value) return ''
  // Google Calendar expects: YYYYMMDDTHHmmssZ
  function toGoogleDate(dt) {
    if (!dt) return ''
    const pad = (n) => String(n).padStart(2, '0')
    return (
      dt.getUTCFullYear() +
      pad(dt.getUTCMonth() + 1) +
      pad(dt.getUTCDate()) + 'T' +
      pad(dt.getUTCHours()) +
      pad(dt.getUTCMinutes()) +
      pad(dt.getUTCSeconds()) + 'Z'
    )
  }
  const start = new Date(eventPayload.value.start)
  const end = new Date(eventPayload.value.end)
  const title = encodeURIComponent(eventPayload.value.title || 'Contract Reminder')
  const details = encodeURIComponent(eventPayload.value.description || '')
  const location = ''
  const dates = `${toGoogleDate(start)}/${toGoogleDate(end)}`
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`
})

// Demo reports used only for the "Common contracts" examples
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
  },
  '3': {
    title: 'Lease Agreement  Office Space',
    contractType: 'Lease',
    date: '08 Jan 2025',
    riskScore: 4.8,
    risk: 'medium',
    riskLabel: 'Medium risk',
    keySummary: 'Standard office lease with a few landlord-friendly clauses.',
    humanSummary:
      'This lease sets out a typical office rental, but contains some clauses on maintenance and early termination that are more favourable to the landlord.',
    keyFindings: [
      {
        title: 'Maintenance obligations',
        body: 'Tenant is responsible for almost all repairs, including structural items.'
      },
      {
        title: 'Early termination',
        body: 'Termination is possible only for the landlord in the first 24 months.'
      }
    ],
    summary:
      'The agreement is workable but could be rebalanced around repairs and termination rights to give the tenant more protection.',
    focus: ['Lease', 'Office', 'Termination'],
    breakdown: {
      'High-risk clauses': 1,
      'Medium-risk clauses': 3,
      'Low-risk clauses': 7
    },
    actions: [
      {
        title: 'Share repair costs',
        body: 'Limit tenant duties to non-structural elements and cap yearly repair spend.'
      },
      {
        title: 'Mutual termination option',
        body: 'Introduce a break option that both parties can use after year one.'
      }
    ]
  },
  '4': {
    title: 'Service Agreement  Marketing Support',
    contractType: 'Services',
    date: '03 Mar 2024',
    riskScore: 3.9,
    risk: 'low',
    riskLabel: 'Low risk',
    keySummary: 'Clear scope of work and milestones with balanced responsibilities.',
    humanSummary:
      'This service agreement describes a recurring marketing engagement with defined deliverables and reasonable service levels.',
    keyFindings: [
      {
        title: 'Scope clarity',
        body: 'Deliverables and timelines are listed in an annex, which reduces ambiguity.'
      },
      {
        title: 'IP ownership',
        body: 'Campaign assets are owned by the client once invoices are paid.'
      }
    ],
    summary:
      'The overall risk is limited, with most clauses following standard market practice.',
    focus: ['Services', 'Marketing'],
    breakdown: {
      'High-risk clauses': 0,
      'Medium-risk clauses': 2,
      'Low-risk clauses': 8
    },
    actions: [
      {
        title: 'Clarify reporting rhythm',
        body: 'Specify how often performance reports will be shared.'
      }
    ]
  },
  '5': {
    title: 'Consulting Agreement  Data Strategy',
    contractType: 'Consulting',
    date: '21 Nov 2024',
    riskScore: 6.4,
    risk: 'high',
    riskLabel: 'High risk',
    keySummary: 'Broad liability and limited confidentiality around data usage.',
    humanSummary:
      'The agreement gives the consultant wide discretion to reuse anonymised data and limits liability only slightly, which creates elevated risk.',
    keyFindings: [
      {
        title: 'Liability cap',
        body: 'Cap is set at three times annual fees with multiple carve-outs.'
      },
      {
        title: 'Data reuse',
        body: 'Consultant may reuse data for benchmarking without clear safeguards.'
      }
    ],
    summary:
      'Key risks lie in liability and data handling; both can be improved with targeted amendments.',
    focus: ['Consulting', 'Data'],
    breakdown: {
      'High-risk clauses': 2,
      'Medium-risk clauses': 3,
      'Low-risk clauses': 5
    },
    actions: [
      {
        title: 'Lower liability cap',
        body: 'Align the cap with 100% of fees paid in the last 12 months.'
      },
      {
        title: 'Tighten data language',
        body: 'Require true anonymisation and prohibit re-identification.'
      }
    ]
  },
  '6': {
    title: 'NDA  Global Pharma',
    contractType: 'Confidentiality',
    date: '09 Feb 2023',
    riskScore: 3.2,
    risk: 'low',
    riskLabel: 'Low risk',
    keySummary: 'Balanced pharma NDA with standard confidentiality carve-outs.',
    humanSummary:
      'This NDA tracks closely with industry templates and contains typical carve-outs for regulatory disclosures.',
    keyFindings: [
      {
        title: 'Regulatory disclosures',
        body: 'Allows disclosure to regulators where legally required.'
      }
    ],
    summary:
      'The main focus is ensuring correct handling of clinical data and patient information, which is adequately covered.',
    focus: ['NDA', 'Pharma'],
    breakdown: {
      'High-risk clauses': 0,
      'Medium-risk clauses': 1,
      'Low-risk clauses': 9
    },
    actions: [
      {
        title: 'Add data processing addendum',
        body: 'Reference a separate DPA if personal data is processed.'
      }
    ]
  },
  '7': {
    title: 'Partnership Agreement  FinTech Alliance',
    contractType: 'Partnership',
    date: '27 Aug 2023',
    riskScore: 5.5,
    risk: 'medium',
    riskLabel: 'Medium risk',
    keySummary: 'Revenue sharing is clear, but exit provisions need attention.',
    humanSummary:
      'This agreement creates a joint go-to-market partnership with shared revenue but has limited detail on exit and transition.',
    keyFindings: [
      {
        title: 'Exit mechanics',
        body: 'No structured mechanism for unwinding joint customers.'
      }
    ],
    summary:
      'Commercially attractive but should be refined around termination and customer handling on exit.',
    focus: ['Partnership', 'FinTech'],
    breakdown: {
      'High-risk clauses': 1,
      'Medium-risk clauses': 3,
      'Low-risk clauses': 6
    },
    actions: [
      {
        title: 'Define exit plan',
        body: 'Add clauses on how to split or transition shared customers.'
      }
    ]
  },
  '8': {
    title: 'Lease Agreement  Warehouse',
    contractType: 'Lease',
    date: '11 Dec 2022',
    riskScore: 6.1,
    risk: 'high',
    riskLabel: 'High risk',
    keySummary: 'Long fixed term with strict break conditions and indexation.',
    humanSummary:
      'Warehouse lease with a long initial term, automatic indexation and narrow termination rights for the tenant.',
    keyFindings: [
      {
        title: 'Indexation formula',
        body: 'Rent increases yearly using a broad inflation index without a cap.'
      }
    ],
    summary:
      'The contract favours the landlord on duration and rent adjustments; negotiate caps and clearer break options.',
    focus: ['Lease', 'Warehouse'],
    breakdown: {
      'High-risk clauses': 2,
      'Medium-risk clauses': 2,
      'Low-risk clauses': 5
    },
    actions: [
      {
        title: 'Cap indexation',
        body: 'Introduce a maximum annual increase percentage.'
      }
    ]
  },
  '9': {
    title: 'Employment Agreement  Sales Team',
    contractType: 'Employment',
    date: '06 Jun 2022',
    riskScore: 3.7,
    risk: 'low',
    riskLabel: 'Low risk',
    keySummary: 'Standard sales contract with commission scheme.',
    humanSummary:
      'This contract sets out fixed salary plus commission with clear territory definitions.',
    keyFindings: [
      {
        title: 'Territory clarity',
        body: 'Sales territories are listed in an annex, reducing overlap.'
      }
    ],
    summary:
      'Risk level is modest, mainly focused on getting the commission and territory schedules correct.',
    focus: ['Employment', 'Sales'],
    breakdown: {
      'High-risk clauses': 0,
      'Medium-risk clauses': 2,
      'Low-risk clauses': 8
    },
    actions: [
      {
        title: 'Align commission with targets',
        body: 'Ensure yearly sales targets are documented and agreed in writing.'
      }
    ]
  }
}

const routeId = computed(() => String(route.params.id || ''))
const isCommonPage = computed(() => String(route.query?.from || '') === 'common')

// Active report: backend data when available, otherwise demo for common contracts
const report = computed(() => {
  if (isCommonPage.value) {
    return currentReport.value
  }
  return currentReport.value
})

const loading = ref(false)
const loadError = ref('')
const currentReport = ref(null)

async function loadReport() {
  loadError.value = ''
  const id = routeId.value
  if (isCommonPage.value) {
    try {
      const report = await getCommonContractReport(id)
      if (!report) {
        loadError.value = 'Report not found.'
        currentReport.value = null
        return
      }
      currentReport.value = report
    } catch (e) {
      loadError.value = e?.message || 'Failed to load report.'
      currentReport.value = null
    }
    return
  }

  // Load any saved contract dates for this report
  try {
    const saved = localStorage.getItem(`contract_dates_${id}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      contractStartDate.value = parsed.startDate || ''
      contractEndDate.value = parsed.endDate || ''
      if (parsed.endDate) {
        eventDate.value = parsed.endDate
      }
    }
  } catch (e) {
    // ignore malformed localStorage
  }

  // If we already have the report in the store (after upload), reuse it
  if (contractStore.currentReport && String(contractStore.currentReport.id) === id) {
    currentReport.value = contractStore.currentReport
    return
  }

  loading.value = true
  try {
    const data = await getContractById(id)
    if (!data || !data.report) {
      loadError.value = 'Report not found.'
      return
    }

    const r = data.report
    currentReport.value = {
      id: data.id,
      title: r.title || data.title || 'Contract',
      contractType: r.contractType || '',
      date: r.date || data.uploadedAt,
      riskScore: r.riskScore ?? data.riskScore,
      risk: r.risk,
      riskLabel: r.riskLabel,
      humanSummary: r.humanSummary,
      keySummary: r.keySummary,
      keyFindings: r.keyFindings || [],
      summary: r.summary,
      focus: r.focus || [],
      breakdown: r.breakdown || {},
      actions: r.actions || [],
      clauses: r.clauses || {},
    }
  } catch (e) {
    loadError.value = e?.message || 'Failed to load report.'
  } finally {
    loading.value = false
  }
}

onMounted(loadReport)
watch([routeId, isCommonPage], loadReport)

// Normalize the active report shape (backend/store/demo) for the template
const normalizedReport = computed(() => {
  const id = route.params.id
  // Try to load edited info from localStorage
  const editedInfo = JSON.parse(localStorage.getItem(`contract_info_${id}`) || '{}')
  // Use currentReport if available, else fallback to store/demo
  const r = currentReport.value || contractStore.getReportById(id) || reports[id] || {}
  const risk = r.risk || (r.riskLabel ? r.riskLabel.toLowerCase().includes('high') ? 'high' : r.riskLabel.toLowerCase().includes('medium') ? 'medium' : 'low' : 'low')
  const riskLabel = r.riskLabel || (risk === 'high' ? 'High risk' : risk === 'medium' ? 'Medium risk' : 'Low risk')
  const normalized = {
    title: editedInfo.title || r.title || 'Contract',
    contractType: editedInfo.contractType || r.contractType || 'Contract',
    date: r.date || r.uploadedAt || '',
    riskScore: typeof r.riskScore === 'number' ? r.riskScore : 0,
    risk,
    riskLabel,
    keySummary: r.keySummary || '',
    humanSummary: r.humanSummary || r.description || '',
    keyFindings: r.keyFindings || [],
    summary: r.summary || r.text || '',
    focus: r.focus || [],
    breakdown: r.breakdown || { 'High-risk clauses': 0, 'Medium-risk clauses': 0, 'Low-risk clauses': 0 },
    actions: r.actions || [],
    clauses: r.clauses || {},
  }
  return normalized
})

// Keep reminder date in sync with contract end date by default
watch(
  () => contractEndDate.value,
  (val) => {
    if (val) {
      eventDate.value = val
    }
  }
)

function saveContractDates() {
  dateSaveSuccess.value = ''
  dateSaveError.value = ''
  const id = routeId.value || '1'
  if (!contractStartDate.value && !contractEndDate.value) {
    dateSaveError.value = 'Please enter at least one date.'
    return
  }
  const contractData = {
    contractId: id,
    title: normalizedReport.value?.title,
    startDate: contractStartDate.value,
    endDate: contractEndDate.value,
    savedAt: new Date().toISOString()
  }
  try {
    localStorage.setItem(`contract_dates_${id}`, JSON.stringify(contractData))
    const allContracts = JSON.parse(localStorage.getItem('all_contract_dates') || '[]')
    const existingIndex = allContracts.findIndex(c => c.contractId === id)
    if (existingIndex >= 0) {
      allContracts[existingIndex] = contractData
    } else {
      allContracts.push(contractData)
    }
    localStorage.setItem('all_contract_dates', JSON.stringify(allContracts))
    dateSaveSuccess.value = 'Contract dates saved successfully!'
    setTimeout(() => {
      dateSaveSuccess.value = ''
    }, 3000)
  } catch (e) {
    dateSaveError.value = 'Failed to save dates.'
  }
}

// Download ICS file on client side
function downloadClientIcs() {
  calendarError.value = ''
  calendarSuccess.value = ''
  if (!eventPayload.value) {
    calendarError.value = 'Choose a date and duration first.'
    return
  }
  const ok = downloadIcsClient(eventPayload.value)
  if (ok) {
    calendarSuccess.value = 'ICS file downloaded.'
  }
}
// Download ICS file from server
async function downloadServerIcs() {
  calendarError.value = ''
  calendarSuccess.value = ''
  if (!eventPayload.value) {
    calendarError.value = 'Choose a date and duration first.'
    return
  }
  try {
    downloading.value = true
    await downloadServerIcsApi(eventPayload.value)
    calendarSuccess.value = 'ICS file downloaded from server.'
  } catch (err) {
    calendarError.value = err?.message || 'Download failed'
  } finally {
    downloading.value = false
  }
}

const riskBadgeClass = computed(() => {
  if (!normalizedReport.value) return 'badge-low'
  if (normalizedReport.value.risk === 'high') return 'badge-high'
  if (normalizedReport.value.risk === 'medium') return 'badge-medium'
  return 'badge-low'
})

// Notificatie: contract verloopt bijna (binnen 7 dagen)
watch(
  () => contractEndDate.value,
  (val) => {
    if (val) {
      const end = new Date(val)
      const now = new Date()
      const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      if (end > now && end <= soon) {
        notificationStore.push({
          title: 'Contract loopt bijna af',
          message: `${normalizedReport.value?.title || 'Contract'} verloopt op ${end.toLocaleDateString()}`,
          variant: 'warning',
          isContractExpiry: true
        })
      }
    }
  },
  { immediate: true }
)

const editMode = ref(false)
const editTitle = ref('')
const editContractType = ref('')
const customTypeMode = ref(false)
const contractTypes = [
  'Employment', 'Confidentiality', 'Lease', 'Service', 'Consulting', 'Partnership', 'NDA', 'Other'
]

const aiSuggestedType = computed(() => {
  // Toon AI suggestie als die beschikbaar is
  return normalizedReport.value?.aiTitle || normalizedReport.value?.contractType || ''
})

watch(
  () => normalizedReport.value,
  (val) => {
    if (val) {
      editTitle.value = val.title || ''
      editContractType.value = val.contractType || contractTypes[0]
    }
  },
  { immediate: true }
)

function validateContractType(type) {
  // Only allow letters, numbers, spaces, and -/&()., min 2, max 100
  return typeof type === 'string' && /^[\w\s\-\/&()\.]{2,100}$/i.test(type)
}
function validateTitle(title) {
  // Only allow letters, numbers, spaces, and basic punctuation, min 2, max 120
  return typeof title === 'string' && /^[\w\s\-\/&()\.\,\'\"]{2,120}$/i.test(title)
}

function saveContractInfo() {
  // Frontend validation
  let contractTypeToSend = editContractType.value
  if (contractTypeToSend === "I'm not sure (let AI choose)") {
    contractTypeToSend = '' // Let backend/AI choose
  }
  if (!validateTitle(editTitle.value)) {
    notificationStore.push({
      title: 'Ongeldige titel',
      message: 'Titel mag alleen letters, cijfers, spaties en enkele leestekens bevatten (2-120 tekens).',
      variant: 'danger'
    })
    return
  }
  if (contractTypeToSend && !validateContractType(contractTypeToSend)) {
    notificationStore.push({
      title: 'Ongeldig contracttype',
      message: 'Type mag alleen letters, cijfers, spaties en -/&(). bevatten (2-100 tekens).',
      variant: 'danger'
    })
    return
  }
  const id = route.params.id
  updateContractInfo(id, {
    title: editTitle.value,
    contractType: contractTypeToSend
  })
    .then(() => {
      // Optionally update localStorage for instant UI
      const contractData = JSON.parse(localStorage.getItem(`contract_info_${id}`) || '{}')
      contractData.title = editTitle.value
      contractData.contractType = contractTypeToSend
      localStorage.setItem(`contract_info_${id}` , JSON.stringify(contractData))
      editMode.value = false
      notificationStore.push({
        title: 'Contract info bijgewerkt',
        message: `Titel en type succesvol opgeslagen`,
        variant: 'success'
      })
    })
    .catch((err) => {
      notificationStore.push({
        title: 'Update mislukt',
        message: err?.message || 'Kon contract info niet opslaan op de server',
        variant: 'danger'
      })
    })
}
function cancelEdit() {
  editMode.value = false
  // Reset to last saved
  const id = route.params.id
  const contractData = JSON.parse(localStorage.getItem(`contract_info_${id}`) || '{}')
  editTitle.value = contractData.title || normalizedReport.value.title
  editContractType.value = contractData.contractType || normalizedReport.value.contractType
}
</script>

<style scoped>
.analysis-header {
  background: var(--card-bg, #fff);
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 2rem 2.5rem 2rem 2rem;
  margin-bottom: 2rem;
}
.contract-type-select, .contract-type-input {
  font-size: 1rem;
  padding: 0.4em 1em 0.4em 0.7em;
  border-radius: 0.5em;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  color: #222;
  transition: border 0.2s;
  margin-right: 0.5em;
}
.contract-type-select:focus, .contract-type-input:focus {
  border-color: #6366f1;
  outline: none;
}
.btn-outline {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #222;
  transition: border 0.2s, background 0.2s;
}
.btn-outline:hover {
  border-color: #6366f1;
  background: #f3f4f6;
}
</style>
