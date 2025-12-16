<template>
  <section class="container">
    <div class="card" style="margin-bottom: 2rem;">
      <div class="card-header">
        <div>
          <h1 class="section-title" style="margin-bottom: 0.25rem">
            Welcome back, Admin
          </h1>
          <p class="section-subtitle" style="margin-bottom: 0">
            Take a look at this...
          </p>
        </div>
        <button @click="showModal = true" class="btn btn-primary">+ Add new Person</button>
      </div>
    </div>

    <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap;">
      <select v-model="sortFilter" class="select" style="min-width:160px;">
        <option value="all">Default order</option>
        <option value="asc">Name: A - Z</option>
        <option value="desc">Name: Z - A</option>
        <option value="newest">Date: Newest first</option>
        <option value="oldest">Date: Oldest first</option>
      </select>
    </div>

    <section class="card" style="margin-bottom:2rem;">
      <div class="card-header">
        <div class="card-title">Recently Added</div>
      </div>
      <transition-group name="fade" tag="ul" class="report-list">
        <li v-for="person in filteredReports" :key="person.id" class="report-list__item" style="align-items:center;">
          <div style="min-width:220px;">
            <h3 style="margin-bottom:0.25rem;">{{ person.name }}</h3>
            <p class="card-subtitle">{{ person.surname }}</p>
            <p class="card-subtitle" style="font-size: 0.85rem;">📧 {{ person.email }}</p>
            <p class="card-subtitle" style="font-size: 0.85rem;">📱 {{ person.phone }}</p>
          </div>
          <div class="report-list__meta">
            <span class="badge" :class="badgeClass(person.risk)">
              Delete data
            </span>
            <span class="card-subtitle" style="margin-left:0.5rem;">{{ person.date }}</span>
            <button
              @click="deletePerson(person.id)"
              class="btn btn-outline"
              style="margin-left:0.5rem; background-color: #fee2e2; color: #dc2626;"
            >
              Delete user
            </button>
          </div>
        </li>
      </transition-group>

    </section>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content card" style="max-width: 400px;">
        <h2 class="card-title" style="margin-bottom: 1rem;">Add New Person</h2>
        <form @submit.prevent="addPerson">
          <div class="form-group">
            <label class="label">First name</label>
            <input v-model="form.name" class="input" type="text" required />
          </div>
          <div class="form-group">
            <label class="label">Surname</label>
            <input v-model="form.surname" class="input" type="text" required />
          </div>
          <div class="form-group">
            <label class="label">Email</label>
            <input v-model="form.email" class="input" type="email" required />
          </div>
          <div class="form-group">
            <label class="label">Password</label>
            <input v-model="form.password" class="input" type="password" required />
          </div>
          <div class="form-group">
            <label class="label">Phone</label>
            <input v-model="form.phone" class="input" type="tel" required />
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">Add</button>
            <button type="button" @click="showModal = false" class="btn btn-outline" style="flex: 1;">Close</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { deletePerson as deletePersonAPI, createPerson as createPersonAPI } from '../api/people'

const people = [
  {
    id: 1,
    name: 'Rohff',
    surname: 'Roh2f',
    email: 'rohff@example.com',
    phone: '+1 (555) 123-4567',
    risk: 'high',
    riskLabel: 'High risk',
    date: '15 Jan 2025'
  },
  {
    id: 2,
    name: 'Booba',
    surname: 'B2oba',
    email: 'booba@example.com',
    phone: '+1 (555) 234-5678',
    risk: 'high',
    riskLabel: 'High risk',
    date: '12 Jan 2025'
  },
  {
    id: 3,
    name: 'Kaaris',
    surname: 'K2aris',
    email: 'kaaris@example.com',
    phone: '+1 (555) 345-6789',
    risk: 'high',
    riskLabel: 'High risk',
    date: '08 Jan 2025'
  }
]

const riskFilter = ref('all')
const monthFilter = ref('all')

const months = ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025']
const currentMonth = 'Nov 2025'

const sortFilter = ref('all')

const filteredReports = computed(() => {
  let filtered = [...people]

  if (sortFilter.value === 'asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortFilter.value === 'desc') {
    filtered.sort((a, b) => b.name.localeCompare(a.name))
  } else if (sortFilter.value === 'newest') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  } else if (sortFilter.value === 'oldest') {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  return filtered
})

const highRiskCount = computed(() => people.filter(r => r.risk === 'high').length)
const thisMonthCount = computed(() => people.filter(r => r.date.includes(currentMonth)).length)

const badgeClass = (risk) => {
  if (risk === 'high') return 'badge-high'
  if (risk === 'medium') return 'badge-medium'
  return 'badge-low'
}

const router = useRouter()
function goToReport(id) {
  router.push({ name: 'report-detail', params: { id } })
}

//code voor adding person
const showModal = ref(false)
const form = reactive({ name: '', surname: '', email: '', phone: '', password: '' })

const addPerson = async () => {
  try {
    await createPersonAPI({
      name: form.name,
      surname: form.surname,
      email: form.email,
      password: form.password,
      phone: form.phone
    })

    // Optioneel: lokaal lijstje updaten voor directe feedback
    const now = new Date()
    const dateLabel = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })

    people.push({
      id: Date.now(),
      name: form.name,
      surname: form.surname,
      email: form.email,
      phone: form.phone,
      risk: 'high',
      riskLabel: 'High risk',
      date: dateLabel
    })

    form.name = ''
    form.surname = ''
    form.email = ''
    form.password = ''
    form.phone = ''
    showModal.value = false
  } catch (error) {
    console.error('Failed to add person:', error)
    alert('Error creating user. Please try again.')
  }
}

// Delete person function - integrated with API
const deletePerson = async (personId) => {
  try {
    // Call the API to delete from database
    await deletePersonAPI(personId)

    // Remove from local array
    const index = people.findIndex(p => p.id === personId)
    if (index > -1) {
      const deletedPerson = people[index]
      people.splice(index, 1)
      console.log(`Deleted person: ${deletedPerson.name} (ID: ${personId})`)
    }
  } catch (error) {
    console.error('Failed to delete person:', error)
    alert('Error deleting user. Please try again.')
  }
}
</script>
