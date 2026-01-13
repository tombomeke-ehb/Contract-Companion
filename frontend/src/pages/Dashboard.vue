<!-- src/views/DashboardView.vue -->
<template>
  <section class="container">
    <div class="card" style="margin-bottom: 2rem;">
      <div class="card-header">
        <div>
          <h1 class="section-title" style="margin-bottom: 0.25rem">
            {{ $t('dashboard.welcomeBack') }}<span v-if="displayName">, {{ displayName }}</span>
          </h1>
          <p class="section-subtitle" style="margin-bottom: 0">
            {{ $t('dashboard.subtitle') }}
          </p>
        </div>
        <RouterLink :to="{ name: 'upload' }" class="btn btn-primary">
          {{ $t('dashboard.uploadNewContract') }}
        </RouterLink>
      </div>
    </div>

    <div class="stats-grid" style="margin-bottom: 2rem;">
      <div class="stat-card" @click="filterRisk('all')" style="cursor:pointer;">
        <span class="stat-label">{{ $t('dashboard.totalAnalyses') }}</span>
        <span class="stat-value">{{ reports.length }}</span>
      </div>
      <div class="stat-card" @click="filterRisk('high')" style="cursor:pointer;">
        <span class="stat-label">{{ $t('dashboard.highRiskFound') }}</span>
        <span class="stat-value">{{ highRiskCount }}</span>
      </div>
      <div class="stat-card" @click="filterCurrentMonth" style="cursor:pointer;">
        <span class="stat-label">{{ $t('dashboard.thisMonth') }}</span>
        <span class="stat-value">{{ thisMonthCount }}</span>
      </div>
    </div>

    <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; align-items:center;">
      <select v-model="riskFilter" class="select" style="min-width:160px;">
        <option value="all">{{ $t('dashboard.filterRiskAll') }}</option>
        <option value="high">{{ $t('dashboard.filterRiskHigh') }}</option>
        <option value="medium">{{ $t('dashboard.filterRiskMedium') }}</option>
        <option value="low">{{ $t('dashboard.filterRiskLow') }}</option>
      </select>
      <select v-model="yearFilter" class="select" style="min-width:140px;">
        <option value="all">{{ $t('dashboard.filterYearAll') }}</option>
        <option
          v-for="year in years"
          :key="year"
          :value="year"
        >
          {{ year }}
        </option>
      </select>
      <select v-model="monthFilter" class="select" style="min-width:140px;">
        <option value="all">{{ $t('dashboard.filterMonthAll') }}</option>
        <option
          v-for="month in availableMonths"
          :key="month"
          :value="month"
        >
          {{ month }}
        </option>
      </select>
      <div style="flex:1; min-width:200px;">
        <input
          v-model="searchQuery"
          type="text"
          class="input"
          placeholder="Search your contracts and analyses…"
          style="width:100%;"
        />
      </div>
      <button
        type="button"
        class="btn btn-outline"
        :disabled="!isFiltering"
        @click="resetFilters"
      >
        Reset filters
      </button>
    </div>

    <section class="card" style="margin-bottom:2rem;">
      <div class="card-header">
        <div class="card-title">{{ $t('dashboard.recentAnalyses') }}</div>
      </div>
      <transition-group name="fade" tag="ul" class="report-list">
        <li
          v-for="report in filteredReports"
          :key="report.id"
          class="report-list__item"
          style="align-items:center;"
          @click="report.status === 'done' ? goToReport(report.id) : null"
          tabindex="0"
          @keydown.enter="report.status === 'done' ? goToReport(report.id) : null"
          @keydown.space="report.status === 'done' ? goToReport(report.id) : null"
        >
          <div style="min-width:220px;">
            <h3 style="margin-bottom:0.25rem;">
              {{ report.generatedTitle || report.title || report.fileName }}
              <span v-if="report.status === 'pending'" class="pending-label">(Analyse bezig...)</span>
              <span v-if="report.status === 'done'" :class="['badge', badgeClass(report.risk)]" style="margin-left:0.5em;">{{ report.riskLabel }}</span>
              <span v-if="report.status === 'done' && typeof report.riskScore === 'number'" class="risk-score-badge" style="margin-left:0.5em; font-size:0.95em; color:#888;">Score: {{ report.riskScore }}</span>
            </h3>
            <p class="card-subtitle"
               v-if="report.fileName && (report.generatedTitle || report.title) && report.fileName !== (report.generatedTitle || report.title)">
              <span style="color:#888; font-size:0.95em;">{{ report.fileName }}</span>
            </p>
            <p class="card-subtitle">{{ report.subtitle }}</p>
            <p class="card-subtitle" v-if="hasDates(report.id)">
              {{ formatDate(contractDates[report.id]?.startDate) }}
              <span aria-hidden="true">→</span>
              {{ formatDate(contractDates[report.id]?.endDate) }}
            </p>
            <p class="card-subtitle" v-else-if="report.date">
              {{ formatDate(report.date) }}
            </p>
            <p class="card-subtitle" v-else>Dates not set</p>
          </div>
          <div class="report-list__meta">
            <RouterLink
              v-if="report.status === 'done'"
              class="btn btn-outline view-btn"
              :to="{ name: 'report-detail', params: { id: report.id } }"
              style="margin-left:0.5rem;"
            >
              {{ $t('dashboard.view') }}
            </RouterLink>
            <span v-else class="btn btn-outline view-btn disabled" style="margin-left:0.5rem; opacity:0.6; cursor:not-allowed;">Analyse bezig...</span>
            <button class="btn btn-danger delete-btn" style="margin-left:0.5rem; padding-left:1.2em; padding-right:1.2em;" @click.stop="handleDelete(report.id)">
              <span class="icon-trash" aria-hidden="true"></span>
              <span>Verwijder</span>
            </button>
          </div>
        </li>
      </transition-group>
      <p v-if="!filteredReports.length" class="card-subtitle">
        {{ $t('dashboard.noReports') }}
      </p>
    </section>
    <ConfirmModal
      v-if="showDeleteModal"
      :title="$t('dashboard.confirmDeleteTitle')"
      :message="$t('dashboard.confirmDeleteMessage')"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
    <ConfirmModal
      :visible="showDeleteModal"
      title="Contract verwijderen"
      message="Weet je zeker dat je dit contract permanent wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
      confirmText="Verwijderen"
      cancelText="Annuleren"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { getContracts as fetchContracts, deleteContract } from '../api/contracts'
import { useNotificationStore } from '../stores/notificationStore'
import { pollNotifications } from '../utils/notificationPoller'
import ConfirmModal from '../components/ConfirmModal.vue'

// Demo data: gebruik string-id's om botsing met echte contracten te voorkomen
const demoReports = [
  {
    id: 'demo-1',
    title: 'Employment Agreement  Tech Corp',
    subtitle: 'Uploaded by John Doe  Employment contract',
    risk: 'high',
    riskLabel: 'High risk',
    date: '15 Jan 2025'
  },
  {
    id: 'demo-2',
    title: 'NDA  Startup Inc',
    subtitle: 'Uploaded by Sarah Lee  NDA',
    risk: 'medium',
    riskLabel: 'Medium risk',
    date: '12 Jan 2025'
  },
  {
    id: 'demo-3',
    title: 'Lease Agreement  Office Space',
    subtitle: 'Uploaded by Tom Jacobs  Housing',
    risk: 'medium',
    riskLabel: 'Medium risk',
    date: '08 Jan 2025'
  },
  {
    id: 'demo-4',
    title: 'Service Agreement  Marketing Support',
    subtitle: 'Uploaded by Emma Verhoeven  Service agreement',
    risk: 'low',
    riskLabel: 'Low risk',
    date: '03 Mar 2024'
  },
  {
    id: 'demo-5',
    title: 'Consulting Agreement  Data Strategy',
    subtitle: 'Uploaded by Liam Peeters  Consulting',
    risk: 'high',
    riskLabel: 'High risk',
    date: '21 Nov 2024'
  },
  {
    id: 'demo-6',
    title: 'NDA  Global Pharma',
    subtitle: 'Uploaded by Anna Janssens  NDA',
    risk: 'low',
    riskLabel: 'Low risk',
    date: '09 Feb 2023'
  },
  {
    id: 'demo-7',
    title: 'Partnership Agreement  FinTech Alliance',
    subtitle: 'Uploaded by Noah Willems  Partnership',
    risk: 'medium',
    riskLabel: 'Medium risk',
    date: '27 Aug 2023'
  },
  {
    id: 'demo-8',
    title: 'Lease Agreement  Warehouse',
    subtitle: 'Uploaded by Julie Dubois  Real estate',
    risk: 'high',
    riskLabel: 'High risk',
    date: '11 Dec 2022'
  },
  {
    id: 'demo-9',
    title: 'Employment Agreement  Sales Team',
    subtitle: 'Uploaded by Mark De Smet  Employment',
    risk: 'low',
    riskLabel: 'Low risk',
    date: '06 Jun 2022'
  }
]

const reports = ref([])

const notificationStore = useNotificationStore()
const userStore = useUserStore()

let eventSource = null;

// Helper to refresh contracts (must be async for SSE)
async function refreshContracts() {
  try {
    const backendContracts = await fetchContracts();
    const mapped = backendContracts.map((c) => {
      let risk = c.risk;
      if (!risk && c.riskLabel) {
        const label = c.riskLabel.toLowerCase();
        if (label.includes('high')) risk = 'high';
        else if (label.includes('medium')) risk = 'medium';
        else if (label.includes('low')) risk = 'low';
        else risk = 'medium';
      }
      return {
        ...c,
        risk,
        generatedTitle: c.aiTitle || c.title || c.fileName,
        date: typeof c.date === 'string' ? c.date : new Date(c.date).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        }),
        status: c.status || 'pending' // default to pending if not set
      };
    });
    reports.value = mapped.length > 0 ? mapped : demoReports;
  } catch (e) {
    reports.value = demoReports;
  }
}

onMounted(() => {
  eventSource = new EventSource(import.meta.env.VITE_API_URL + '/api/contracts/events');
  eventSource.addEventListener('ping', (event) => {
    // geen logging
  });
  eventSource.addEventListener('contractAnalyzed', (event) => {
    refreshContracts();
  });

  notificationStore.clear();
  setInterval(pollNotifications, 30000);
  refreshContracts();
});

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
});

const riskFilter = ref('all')
const yearFilter = ref('all')
const monthFilter = ref('all')
const searchQuery = ref('')
const contractDates = ref({})

function loadContractDates() {
  try {
    const all = JSON.parse(localStorage.getItem('all_contract_dates') || '[]')
    const map = {}
    all.forEach((c) => {
      if (c?.contractId) {
        map[c.contractId] = c
      }
    })
    contractDates.value = map
  } catch (err) {
    contractDates.value = {}
  }
}

loadContractDates()

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function extractMonthYear(dateStr) {
  const parts = dateStr.split(' ')
  if (parts.length >= 3) {
    return {
      day: parts[0],
      month: parts[1],
      year: parts[2]
    }
  }
  return { day: null, month: null, year: null }
}

const years = computed(() => {
  const set = new Set()
  ;(reports.value || []).forEach(r => {
    const { year } = extractMonthYear(r.date)
    if (year) set.add(year)
  })
  return Array.from(set).sort()
})

const availableMonths = computed(() => {
  if (yearFilter.value === 'all') {
    return months
  }
  const set = new Set()
  ;(reports.value || []).forEach(r => {
    const { month, year } = extractMonthYear(r.date)
    if (year === yearFilter.value && month) {
      set.add(month)
    }
  })
  return months.filter(m => set.has(m))
})

const now = new Date()
const currentYear = String(now.getFullYear())
const currentMonthName = months[now.getMonth()]

const displayName = computed(() => userStore.user?.name || userStore.user?.email || '')

const filteredReports = computed(() => {
  let filtered = reports.value
  if (riskFilter.value !== 'all') {
    filtered = filtered.filter((report) => report.risk === riskFilter.value)
  }
  if (yearFilter.value !== 'all' || monthFilter.value !== 'all') {
    filtered = filtered.filter((report) => {
      const { month, year } = extractMonthYear(report.date)

      const matchYear = yearFilter.value === 'all' || year === yearFilter.value
      const matchMonth = monthFilter.value === 'all' || month === monthFilter.value

      return matchYear && matchMonth
    })
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    const startsWith = (text) => text.toLowerCase().startsWith(q)
    filtered = filtered.filter((report) =>
      startsWith(report.title) ||
      startsWith(report.subtitle)
    )
  }
  return filtered
})

const isFiltering = computed(() => {
  const hasRisk = riskFilter.value !== 'all'
  const hasYear = yearFilter.value !== 'all'
  const hasMonth = monthFilter.value !== 'all'
  const hasSearch = searchQuery.value.trim().length > 0
  return hasRisk || hasYear || hasMonth || hasSearch
})

const highRiskCount = computed(() => reports.value.filter(r => r.risk === 'high').length)
const thisMonthCount = computed(() => reports.value.filter(r => {
  const { month, year } = extractMonthYear(r.date)
  return month === currentMonthName && year === currentYear
}).length)

function filterRisk(risk) {
  riskFilter.value = risk
  if (risk === 'all') {
    yearFilter.value = 'all'
    monthFilter.value = 'all'
  }
}
function filterCurrentMonth() {
  yearFilter.value = currentYear
  monthFilter.value = currentMonthName
  riskFilter.value = 'all'
}

function resetFilters() {
  riskFilter.value = 'all'
  yearFilter.value = 'all'
  monthFilter.value = 'all'
  searchQuery.value = ''
}

const badgeClass = (risk) => {
  if (risk === 'high') return 'badge-high'
  if (risk === 'medium') return 'badge-medium'
  return 'badge-low'
}

const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const hasDates = (id) => {
  const c = contractDates.value[id]
  return Boolean(c?.startDate || c?.endDate)
}

const router = useRouter()
function goToReport(id) {
  router.push({ name: 'report-detail', params: { id } })
}

const showDeleteModal = ref(false)
const deleteTargetId = ref(null)

function handleDelete(reportId) {
  deleteTargetId.value = reportId
  showDeleteModal.value = true
}

function confirmDelete() {
  deleteContract(deleteTargetId.value)
    .then(() => {
      reports.value = reports.value.filter(r => r.id !== deleteTargetId.value)
      showDeleteModal.value = false
      deleteTargetId.value = null
    })
    .catch(() => {
      showDeleteModal.value = false
      deleteTargetId.value = null
      notificationStore.push({
        title: 'Verwijderen mislukt',
        message: 'Het contract kon niet worden verwijderd.',
        variant: 'danger',
        timeout: 6000
      })
    })
}

function cancelDelete() {
  showDeleteModal.value = false
  deleteTargetId.value = null
}
</script>

<style scoped>
.pending-label {
  font-size: 0.95em;
  color: #f59e42;
  margin-left: 0.5em;
  font-weight: 500;
}
.view-btn.disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>
