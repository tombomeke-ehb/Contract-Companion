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
      <div class="stat-card" @click="filterMonth(currentMonth)" style="cursor:pointer;">
        <span class="stat-label">{{ $t('dashboard.thisMonth') }}</span>
        <span class="stat-value">{{ thisMonthCount }}</span>
      </div>
    </div>

    <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap;">
      <select v-model="riskFilter" class="select" style="min-width:160px;">
        <option value="all">{{ $t('dashboard.filterRiskAll') }}</option>
        <option value="high">{{ $t('dashboard.filterRiskHigh') }}</option>
        <option value="medium">{{ $t('dashboard.filterRiskMedium') }}</option>
        <option value="low">{{ $t('dashboard.filterRiskLow') }}</option>
      </select>
      <select v-model="monthFilter" class="select" style="min-width:160px;">
        <option value="all">{{ $t('dashboard.filterMonthAll') }}</option>
        <option
          v-for="month in months"
          :key="month"
          :value="month"
        >
          {{ month }}
        </option>
      </select>
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
          @click="goToReport(report.id)"
          tabindex="0"
          @keydown.enter="goToReport(report.id)"
          @keydown.space="goToReport(report.id)"
        >
          <div style="min-width:220px;">
            <h3 style="margin-bottom:0.25rem;">{{ report.title }}</h3>
            <p class="card-subtitle">{{ report.subtitle }}</p>
          </div>
          <div class="report-list__meta">
            <span class="badge" :class="badgeClass(report.risk)">
              {{ report.riskLabel }}
            </span>
            <span class="card-subtitle" style="margin-left:0.5rem;">{{ report.date }}</span>
            <RouterLink
              class="btn btn-outline"
              :to="{ name: 'report-detail', params: { id: report.id } }"
              style="margin-left:0.5rem;"
            >
              {{ $t('dashboard.view') }}
            </RouterLink>
            <button class="btn btn-danger" style="margin-left:0.5rem;" @click.stop="handleDelete(report.id)">
              {{ $t('dashboard.delete') || 'Delete' }}
            </button>
          </div>
        </li>
      </transition-group>
      <p v-if="!filteredReports.length" class="card-subtitle">
        {{ $t('dashboard.noReports') }}
      </p>
    </section>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { getContracts as fetchContracts, deleteContract } from '../api/contracts'

const demoReports = [
  {
    id: 1,
    title: 'Employment Agreement  Tech Corp',
    subtitle: 'Uploaded by John Doe  Employment contract',
    risk: 'high',
    riskLabel: 'High risk',
    date: '15 Jan 2025'
  },
  {
    id: 2,
    title: 'NDA  Startup Inc',
    subtitle: 'Uploaded by Sarah Lee  NDA',
    risk: 'medium',
    riskLabel: 'Medium risk',
    date: '12 Jan 2025'
  },
  {
    id: 3,
    title: 'Lease Agreement  Office Space',
    subtitle: 'Uploaded by Tom Jacobs  Housing',
    risk: 'medium',
    riskLabel: 'Medium risk',
    date: '08 Jan 2025'
  }
]

const reports = ref([])

onMounted(async () => {
  try {
    const backendContracts = await fetchContracts()
    const mapped = backendContracts.map((c) => {
      // Normalize risk from riskLabel if needed
      let risk = c.risk
      if (!risk && c.riskLabel) {
        const label = c.riskLabel.toLowerCase()
        if (label.includes('high')) risk = 'high'
        else if (label.includes('medium')) risk = 'medium'
        else if (label.includes('low')) risk = 'low'
        else risk = 'medium'
      }
      return {
        ...c,
        risk,
        date: typeof c.date === 'string' ? c.date : new Date(c.date).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        })
      }
    })
    // Fallback: toon demoReports alleen als er geen echte contracten zijn
    reports.value = mapped.length > 0 ? mapped : demoReports
  } catch (e) {
    // Fallback: als backend faalt, toon demoReports
    reports.value = demoReports
  }
})

const riskFilter = ref('all')
const monthFilter = ref('all')

const months = ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025']
const currentMonth = 'Nov 2025'

const userStore = useUserStore()
const displayName = computed(() => userStore.user?.name || userStore.user?.email || '')

const filteredReports = computed(() => {
  let filtered = reports.value
  if (riskFilter.value !== 'all') {
    filtered = filtered.filter((report) => report.risk === riskFilter.value)
  }
  if (monthFilter.value !== 'all') {
    filtered = filtered.filter((report) => report.date.includes(monthFilter.value))
  }
  return filtered
})

const highRiskCount = computed(() => reports.value.filter(r => r.risk === 'high').length)
const thisMonthCount = computed(() => reports.value.filter(r => r.date.includes(currentMonth)).length)

function filterRisk(risk) {
  riskFilter.value = risk
  if (risk === 'all') {
    monthFilter.value = 'all'
  }
}
function filterMonth(month) {
  monthFilter.value = month
  riskFilter.value = 'all'
}

const badgeClass = (risk) => {
  if (risk === 'high') return 'badge-high'
  if (risk === 'medium') return 'badge-medium'
  return 'badge-low'
}

const router = useRouter()
function goToReport(id) {
  router.push({ name: 'report-detail', params: { id } })
}

function handleDelete(reportId) {
  if (confirm('Are you sure you want to delete this contract?')) {
    deleteContract(reportId)
      .then(() => {
        reports.value = reports.value.filter(r => r.id !== reportId)
      })
      .catch(() => alert('Failed to delete contract.'))
  }
}
</script>
