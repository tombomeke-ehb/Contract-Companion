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
            :to="{ name: 'report-detail', params: { id: contract.sampleReport }, query: { from: 'common' } }"
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
