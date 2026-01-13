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
        <RouterLink :to="{ name: 'upload' }" class="btn btn-primary">
          Upload yours
        </RouterLink>
      </div>
    </header>

    <div class="filters" style="margin-bottom:1.5rem;">
      <button
        v-for="category in categories"
        :key="category.value"
        type="button"
        class="chip"
        :class="{ 'chip--active': activeCategory === category.value }"
        @click="activeCategory = category.value"
      >
        {{ category.label }}
      </button>
    </div>

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

        <footer class="contract-card__footer">
          <div class="card-subtitle">Updated {{ contract.updated }}</div>
          <RouterLink
            class="btn btn-outline"
            :to="{ name: 'report-detail', params: { id: contract.id }, query: { from: 'common' } }"
          >
            View analysis
          </RouterLink>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getCommonContracts } from '../api/contracts'

const contracts = ref([])

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Subscriptions', value: 'Subscriptions' },
  { label: 'Legal', value: 'Legal' },
  { label: 'Housing', value: 'Housing' }
]

const query = ref('')
const activeCategory = ref('all')

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
// Load common contracts from API
async function loadContracts() {
  try {
    const data = await getCommonContracts()
    contracts.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Failed to load contracts', err)
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
