<template>
  <section class="container">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Example library</p>
        <h1 class="section-title">Common contracts</h1>
        <p class="section-subtitle">
          Browse ready-made analyses for popular subscriptions, NDAs and employment agreements.
        </p>
      </div>
      <div class="page-header__actions">
        <input
          v-model="query"
          class="input"
          type="search"
          placeholder="Search contracts..."
        />

        <button type="button" class="btn btn-outline" @click="openAddModal" style="margin-left:0.5rem;">
          + Add contract
        </button>
        <RouterLink :to="{ name: 'admin-dashboard' }" class="btn btn-outline">
          Back to dashboard
        </RouterLink>
      </div>
    </header>



    <p class="card-subtitle" style="margin-bottom: 1.5rem">
      Showing {{ filteredContracts.length }} contract(s)
    </p>

    <div class="contracts-grid">
      <article v-for="contract in filteredContracts" :key="contract.id" class="card contract-card" style="margin-bottom:1rem;">
        <header style="margin-bottom:1rem;">
          <p class="page-eyebrow">{{ contract.category }}</p>
          <h2 class="card-title">{{ contract.name }}</h2>
          <p class="card-subtitle">{{ contract.summary }}</p>
        </header>

        <div class="contract-risks" style="margin-bottom:1rem;">
          <span class="badge badge-high" v-if="contract.stats.high">
            High: {{ contract.stats.high }}
          </span>
          <span class="badge badge-medium" v-if="contract.stats.medium">
            Medium: {{ contract.stats.medium }}
          </span>
          <span class="badge badge-low" v-if="contract.stats.low">
            Low: {{ contract.stats.low }}
          </span>
        </div>

        <footer class="contract-card__footer" style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
          <div class="card-subtitle" style="margin-right:auto;">Updated {{ contract.updated }}</div>
          <RouterLink
            class="btn btn-outline"
            :to="{ name: 'report-detail', params: { id: contract.id }, query: { from: 'common' } }"
          >
            View analysis
          </RouterLink>
          <button class="btn btn-outline" type="button" @click="openEditModal(contract)">
            Edit
          </button>
          <button class="btn btn-outline" type="button" style="background:#fee2e2; color:#dc2626;" @click="onDelete(contract.id)">
            Delete
          </button>
        </footer>
      </article>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content card" style="max-width:800px; width:95%; max-height:90vh; overflow-x:hidden; overflow-y:auto; box-sizing:border-box;">
        <h2 class="card-title" style="margin-bottom:1rem;">{{ isEditing ? 'Edit contract' : 'Add contract' }}</h2>
        <form v-if="!isEditing" @submit.prevent="saveContract" class="form" style="display:grid; gap:0.75rem; box-sizing:border-box;">
          <div class="form-group">
            <label class="label">Upload contract file</label>
            <input type="file" accept=".pdf,.doc,.docx,.txt" @change="handleFileChange" :disabled="uploading" />
            <button type="button" class="btn btn-primary" @click="uploadAndAnalyze" :disabled="!uploadedFile || uploading" style="margin-top:0.5rem;">{{ uploading ? 'Analyzing...' : 'Analyze contract' }}</button>
            <p v-if="uploadError" class="card-subtitle" style="color:#dc2626;">{{ uploadError }}</p>
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label class="label">AI summary</label>
            <div class="card-subtitle" style="margin-bottom:0.5rem;">{{ form.summary || 'No summary available.' }}</div>
            <div v-if="form.executiveSummary" class="card-subtitle" style="margin-bottom:0.5rem; font-style:italic;">{{ form.executiveSummary }}</div>
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label class="label">Overall risk</label>
            <input v-model="form.riskLabel" class="input" type="text" placeholder="e.g. Medium risk" />
            <input v-model.number="form.riskScore" class="input" type="number" min="0" placeholder="Risk score" style="margin-top:0.5rem;" />
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label class="label">Key findings</label>
            <textarea v-model="form.keyFindingsString" class="input" rows="3" placeholder="One per line"></textarea>
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label class="label">Focus tags</label>
            <input v-model="form.focusTagsString" class="input" type="text" placeholder="Comma separated tags" />
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label class="label">Recommended actions</label>
            <textarea v-model="form.recommendedActionsString" class="input" rows="3" placeholder="One per line"></textarea>
          </div>
          <div class="form-group" style="box-sizing:border-box;">
            <label class="label">Name</label>
            <input v-model="form.name" class="input" type="text" required style="width:100%; box-sizing:border-box;" />
          </div>
          <div class="form-group" style="box-sizing:border-box;">
            <label class="label">Category</label>
            <template v-if="form.category === 'ai-auto'">
              <input v-model="form.category" class="input" type="text" required style="width:100%; box-sizing:border-box;" placeholder="Type or AI result" />
            </template>
            <template v-else>
              <select v-model="form.category" class="select" required style="width:100%; box-sizing:border-box;">
                <template v-for="c in categories" :key="c.value">
                  <option v-if="c.value !== 'all'" :value="c.value">{{ c.label }}</option>
                </template>
              </select>
            </template>
          </div>
          <div class="form-group" style="box-sizing:border-box;">
            <label class="label">Summary</label>
            <textarea v-model="form.summary" class="input" rows="3" style="width:100%; box-sizing:border-box;"></textarea>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.5rem; box-sizing:border-box;">
            <div class="form-group" style="box-sizing:border-box;">
              <label class="label">High</label>
              <input v-model.number="form.stats.high" class="input" type="number" min="0" style="width:100%; box-sizing:border-box;" />
            </div>
            <div class="form-group" style="box-sizing:border-box;">
              <label class="label">Medium</label>
              <input v-model.number="form.stats.medium" class="input" type="number" min="0" style="width:100%; box-sizing:border-box;" />
            </div>
            <div class="form-group" style="box-sizing:border-box;">
              <label class="label">Low</label>
              <input v-model.number="form.stats.low" class="input" type="number" min="0" style="width:100%; box-sizing:border-box;" />
            </div>
          </div>
          <div style="display:flex; gap:0.5rem; box-sizing:border-box;">
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save' }}
            </button>
            <button class="btn btn-outline" type="button" @click="closeModal">Cancel</button>
          </div>
          <p v-if="errorMessage" class="card-subtitle">{{ errorMessage }}</p>
        </form>
        <form v-else @submit.prevent="saveContract" class="form" style="display:grid; gap:0.75rem; box-sizing:border-box;">
          <div class="form-group" style="box-sizing:border-box;">
            <label class="label">Name</label>
            <input v-model="form.name" class="input" type="text" required style="width:100%; box-sizing:border-box;" />
          </div>
          <div class="form-group" style="box-sizing:border-box;">
            <label class="label">Category</label>
            <template v-if="form.category === 'ai-auto'">
              <input v-model="form.category" class="input" type="text" required style="width:100%; box-sizing:border-box;" placeholder="Type or AI result" />
            </template>
            <template v-else>
              <select v-model="form.category" class="select" required style="width:100%; box-sizing:border-box;">
                <template v-for="c in categories" :key="c.value">
                  <option v-if="c.value !== 'all'" :value="c.value">{{ c.label }}</option>
                </template>
              </select>
            </template>
          </div>
          <div class="form-group" style="box-sizing:border-box;">
            <label class="label">Summary</label>
            <textarea v-model="form.summary" class="input" rows="3" style="width:100%; box-sizing:border-box;"></textarea>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.5rem; box-sizing:border-box;">
            <div class="form-group" style="box-sizing:border-box;">
              <label class="label">High</label>
              <input v-model.number="form.stats.high" class="input" type="number" min="0" style="width:100%; box-sizing:border-box;" />
            </div>
            <div class="form-group" style="box-sizing:border-box;">
              <label class="label">Medium</label>
              <input v-model.number="form.stats.medium" class="input" type="number" min="0" style="width:100%; box-sizing:border-box;" />
            </div>
            <div class="form-group" style="box-sizing:border-box;">
              <label class="label">Low</label>
              <input v-model.number="form.stats.low" class="input" type="number" min="0" style="width:100%; box-sizing:border-box;" />
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; box-sizing:border-box;">
            <div class="form-group" style="box-sizing:border-box;">
              <label class="label">Updated (text)</label>
              <input v-model="form.updated" class="input" type="text" placeholder="Jan 2025" style="width:100%; box-sizing:border-box;" />
            </div>
            <div class="form-group" style="box-sizing:border-box;">
              <label class="label">Sample report ID</label>
              <input v-model.number="form.sampleReport" class="input" type="number" min="1" style="width:100%; box-sizing:border-box;" />
            </div>
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label class="label">Overall risk</label>
            <input v-model="form.riskLabel" class="input" type="text" placeholder="e.g. Medium risk" />
            <input v-model.number="form.riskScore" class="input" type="number" min="0" placeholder="Risk score" style="margin-top:0.5rem;" />
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label class="label">Key findings</label>
            <textarea v-model="form.keyFindingsString" class="input" rows="3" placeholder="One per line"></textarea>
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label class="label">Focus tags</label>
            <input v-model="form.focusTagsString" class="input" type="text" placeholder="Comma separated tags" />
          </div>
          <div class="form-group" style="margin-bottom:1rem;">
            <label class="label">Recommended actions</label>
            <textarea v-model="form.recommendedActionsString" class="input" rows="3" placeholder="One per line"></textarea>
          </div>
          <div style="display:flex; gap:0.5rem; box-sizing:border-box;">
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save' }}
            </button>
            <button class="btn btn-outline" type="button" @click="closeModal">Cancel</button>
          </div>
          <p v-if="errorMessage" class="card-subtitle">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, reactive, onMounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { getCommonContracts, createCommonContract, updateCommonContract, deleteCommonContract, uploadContract } from '../api/contracts'

const contracts = ref([])

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Subscriptions', value: 'Subscriptions' },
  { label: 'Legal', value: 'Legal' },
  { label: 'Housing', value: 'Housing' },
  { label: 'Employment', value: 'Employment' },
  { label: 'Other', value: 'Other' },
  { label: 'AI (auto)', value: 'ai-auto' },
]

const query = ref('')
const activeCategory = ref('all')

const showModal = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const editingId = ref(null)
const isEditing = computed(() => !!editingId.value)
const form = reactive({
  id: '',
  name: '',
  category: 'Subscriptions',
  summary: '',
  stats: { high: 0, medium: 0, low: 0 },
  riskScore: 0,
  riskLabel: '',
  clauses: {},
  keyFindings: [],
  focusTags: [],
  recommendedActions: [],
  executiveSummary: '',
  sampleReport: 1,
  get keyFindingsString() {
    return this.keyFindings.join('\n')
  },
  set keyFindingsString(value) {
    this.keyFindings = value.split('\n').map(v => v.trim()).filter(Boolean)
  },
  get focusTagsString() {
    return this.focusTags.join(', ')
  },
  set focusTagsString(value) {
    this.focusTags = value.split(',').map(v => v.trim()).filter(Boolean)
  },
  get recommendedActionsString() {
    return this.recommendedActions.join('\n')
  },
  set recommendedActionsString(value) {
    this.recommendedActions = value.split('\n').map(v => v.trim()).filter(Boolean)
  },
})
const aiResult = ref(null)
const uploadError = ref('')
const uploading = ref(false)
const uploadedFile = ref(null)

// String helpers voor keyFindings, focusTags, recommendedActions
form.keyFindingsString = ''
form.focusTagsString = ''
form.recommendedActionsString = ''

const filteredContracts = computed(() => {
  const q = query.value.trim().toLowerCase()
  return contracts.value.filter((contract) => {
    const matchesCategory =
      activeCategory.value === 'all' || contract.category === activeCategory.value
    const matchesQuery =
      !q ||
      [contract.name, contract.summary, contract.category].some((field) =>
        field.toLowerCase().includes(q)
      )
    return matchesCategory && matchesQuery
  })
})

async function loadContracts() {
  try {
    errorMessage.value = ''
    const data = await getCommonContracts()
    contracts.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Failed to load contracts', err)
    errorMessage.value = 'Kon contracts niet laden.'
  }
}

function resetForm() {
  form.id = ''
  form.name = ''
  form.category = 'Subscriptions'
  form.summary = ''
  form.stats.high = 0
  form.stats.medium = 0
  form.stats.low = 0
  form.updated = ''
  form.sampleReport = 1
  aiResult.value = null
  uploadError.value = ''
  uploading.value = false
  uploadedFile.value = null
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    uploadedFile.value = file
    aiResult.value = null
    uploadError.value = ''
  }
}

async function uploadAndAnalyze() {
  console.log('[AdminCommonContracts] uploadAndAnalyze called', uploadedFile.value);
  if (!uploadedFile.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    const result = await uploadContract(uploadedFile.value, form.category, form.summary)
    console.log('[AdminCommonContracts] uploadContract result', result);
    const aiData = result?.ai || {}
    console.log('[AdminCommonContracts] aiData used for form', aiData);
    form.name = aiData.title || aiData.contractType || uploadedFile.value.name || ''
    // Category fix: als AI (auto) is gekozen, probeer te mappen op bestaande category, anders voeg dynamisch toe
    if (form.category === 'ai-auto') {
      const contractType = (aiData.contractType || '').trim()
      let found = null
      for (const c of categories) {
        if (c.value === 'all') continue
        if (
          contractType &&
          ((c.value && contractType.toLowerCase() === c.value.toLowerCase()) ||
           (c.label && contractType.toLowerCase() === c.label.toLowerCase()) ||
           (c.value && contractType.toLowerCase().includes(c.value.toLowerCase())) ||
           (c.label && contractType.toLowerCase().includes(c.label.toLowerCase()))
          )
        ) {
          found = c
          break
        }
      }
      if (found) {
        form.category = found.value
      } else if (contractType) {
        // Voeg alleen toe als contractType niet leeg is en nog niet bestaat
        if (!categories.some(c => c.value === contractType)) {
          categories.push({ label: contractType, value: contractType })
        }
        form.category = contractType
      } else {
        form.category = 'Other'
      }
    }
    // Vul summary en stats altijd na category
    form.summary = aiData.humanSummary || aiData.summary || ''
    form.stats.high = aiData.clauseBreakdown?.highRiskClauses ?? 0
    form.stats.medium = aiData.clauseBreakdown?.mediumRiskClauses ?? 0
    form.stats.low = aiData.clauseBreakdown?.lowRiskClauses ?? 0
    form.riskScore = aiData.overallRiskScore ?? aiData.riskScore ?? 0
    form.riskLabel = aiData.overallRiskLabel ?? aiData.riskLabel ?? ''
    form.clauses = aiData.clauses ?? {}
    form.keyFindings = (aiData.keyFindings && aiData.keyFindings.length) ? aiData.keyFindings : (Array.isArray(aiData.keySummary) ? aiData.keySummary : (typeof aiData.keySummary === 'string' ? aiData.keySummary.split('\n') : []))
    form.focusTags = aiData.focusTags ?? []
    form.recommendedActions = aiData.recommendedActions ?? []
    form.executiveSummary = aiData.executiveSummary || ''
    form.keyFindingsString = form.keyFindings.join('\n')
    form.focusTagsString = form.focusTags.join(', ')
    form.recommendedActionsString = form.recommendedActions.join('\n')
    form.id = Math.random().toString(36).substring(2, 12)
    form.sampleReport = result.docId ?? 1
    form.analysisReport = aiData;
    console.log('[AdminCommonContracts] form after AI', JSON.parse(JSON.stringify(form)));
  } catch (err) {
    uploadError.value = err?.message || 'Upload/analyse failed.'
    aiResult.value = null
    form.riskScore = 0
    form.riskLabel = ''
    form.clauses = {}
    form.keyFindings = []
    form.focusTags = []
    form.recommendedActions = []
    form.executiveSummary = ''
    console.error('[AdminCommonContracts] uploadAndAnalyze error', err);
  } finally {
    uploading.value = false
  }
}

function openAddModal() {
  editingId.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(contract) {
  editingId.value = contract.id
  form.id = contract.id
  form.name = contract.name
  form.category = contract.category
  form.summary = contract.summary
  form.stats.high = contract.stats?.high ?? 0
  form.stats.medium = contract.stats?.medium ?? 0
  form.stats.low = contract.stats?.low ?? 0
  form.updated = contract.updated
  form.sampleReport = contract.sampleReport ?? 1
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function saveContract() {
  try {
    submitting.value = true
    errorMessage.value = ''
    // DEBUG: log aiResult before payload
    console.log('[saveContract] aiResult.value direct voor opslaan:', aiResult.value);
    const payload = {
      id: form.id || undefined,
      name: form.name,
      category: form.category,
      summary: form.summary,
      stats: { high: form.stats.high, medium: form.stats.medium, low: form.stats.low },
      updated: form.updated,
      sampleReport: form.sampleReport,
      analysisReport: !isEditing.value ? form.analysisReport : undefined,
    }
    // DEBUG: log payload before sending
    console.log('[saveContract] payload:', payload);
    if (isEditing.value) {
      const updated = await updateCommonContract(editingId.value, payload)
      const idx = contracts.value.findIndex(c => c.id === editingId.value)
      if (idx !== -1) contracts.value[idx] = updated
    } else {
      const created = await createCommonContract(payload)
      console.log('[AdminCommonContracts] created contract:', created)
      contracts.value.unshift(created)
    }
    showModal.value = false
  } catch (err) {
    console.error('Failed to save contract', err)
    errorMessage.value = err?.message || 'Opslaan mislukt.'
  } finally {
    submitting.value = false
  }
}

async function onDelete(id) {
  if (!confirm('Delete this contract?')) return
  try {
    await deleteCommonContract(id)
    const idx = contracts.value.findIndex(c => c.id === id)
    if (idx !== -1) contracts.value.splice(idx, 1)
  } catch (err) {
    console.error('Failed to delete contract', err)
    alert('Delete failed')
  }
}

onMounted(loadContracts)
</script>

<style scoped>
.contracts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2rem;
  align-items: stretch;
}
.contract-card {
  min-width: 0;
  max-width: 600px;
  width: 100%;
  padding: 1.5rem 1.25rem;
  box-sizing: border-box;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.75rem;
}
.contract-card .page-eyebrow {
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.contract-card .card-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  line-height: 1.2;
  word-break: break-word;
  max-height: 2.6em;
  overflow: hidden;
  text-overflow: ellipsis;
}
.contract-card .card-subtitle {
  font-size: 0.98rem;
  color: #334155;
  margin-bottom: 0.5rem;
  line-height: 1.5;
  max-height: 8em;
  overflow: hidden;
  text-overflow: ellipsis;
}
.contract-risks {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.badge {
  font-size: 0.95rem;
  padding: 0.35em 1em;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;
}
.badge-high {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.badge-medium {
  background: #fef9c3;
  color: #ca8a04;
  border: 1px solid #fde68a;
}
.badge-low {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #6ee7b7;
}
@media (max-width: 900px) {
  .contracts-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
