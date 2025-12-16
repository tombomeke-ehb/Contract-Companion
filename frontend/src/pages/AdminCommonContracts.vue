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
            :to="{ name: 'report-detail', params: { id: contract.sampleReport } }"
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
      <div class="modal-content card" style="max-width:560px;">
        <h2 class="card-title" style="margin-bottom:1rem;">{{ isEditing ? 'Edit contract' : 'Add contract' }}</h2>
        <form @submit.prevent="saveContract" class="form" style="display:grid; gap:0.75rem;">
          <div class="form-group">
            <label class="label">Name</label>
            <input v-model="form.name" class="input" type="text" required />
          </div>
          <div class="form-group">
            <label class="label">Category</label>
            <select v-model="form.category" class="select" required>
              <option v-for="c in categories" :key="c.value" :value="c.value" v-if="c.value !== 'all'">{{ c.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label">Summary</label>
            <textarea v-model="form.summary" class="input" rows="3"></textarea>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <div class="form-group" style="flex:1;">
              <label class="label">High</label>
              <input v-model.number="form.stats.high" class="input" type="number" min="0" />
            </div>
            <div class="form-group" style="flex:1;">
              <label class="label">Medium</label>
              <input v-model.number="form.stats.medium" class="input" type="number" min="0" />
            </div>
            <div class="form-group" style="flex:1;">
              <label class="label">Low</label>
              <input v-model.number="form.stats.low" class="input" type="number" min="0" />
            </div>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <div class="form-group" style="flex:1;">
              <label class="label">Updated (text)</label>
              <input v-model="form.updated" class="input" type="text" placeholder="Jan 2025" />
            </div>
            <div class="form-group" style="flex:1;">
              <label class="label">Sample report ID</label>
              <input v-model.number="form.sampleReport" class="input" type="number" min="1" />
            </div>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-primary" type="submit" :disabled="submitting">{{ submitting ? 'Saving...' : 'Save' }}</button>
            <button class="btn btn-outline" type="button" @click="closeModal">Cancel</button>
          </div>
          <p v-if="errorMessage" class="card-subtitle">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getCommonContracts, createCommonContract, updateCommonContract, deleteCommonContract } from '../api/contracts'

const contracts = ref([])

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Subscriptions', value: 'Subscriptions' },
  { label: 'Legal', value: 'Legal' },
  { label: 'Housing', value: 'Housing' }
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
  updated: '',
  sampleReport: 1,
})

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
    const payload = {
      id: form.id || undefined,
      name: form.name,
      category: form.category,
      summary: form.summary,
      stats: { high: form.stats.high, medium: form.stats.medium, low: form.stats.low },
      updated: form.updated,
      sampleReport: form.sampleReport,
    }

    if (isEditing.value) {
      const updated = await updateCommonContract(editingId.value, payload)
      const idx = contracts.value.findIndex(c => c.id === editingId.value)
      if (idx !== -1) contracts.value[idx] = updated
    } else {
      const created = await createCommonContract(payload)
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
