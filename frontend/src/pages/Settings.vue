<template>
  <section class="container">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Workspace</p>
        <h1 class="section-title">Settings</h1>
        <p class="section-subtitle">
          Adjust language, theme and security preferences for your account.
        </p>
      </div>
      <button class="btn btn-outline" type="button" @click="resetSettings">
        Reset changes
      </button>
    </header>

    <div class="settings-grid" style="margin-bottom:2rem;">
      <article class="card">
        <h2 class="card-title">Application settings</h2>
        <form class="form">
          <div class="form-group">
            <label class="label" for="language">Language</label>
            <select id="language" v-model="form.language" class="select">
              <option value="English">English</option>
              <option value="Nederlands">Nederlands</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label" for="theme">Theme</label>
            <select id="theme" v-model="form.theme" class="select">
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label" for="region">Region</label>
            <select id="region" v-model="form.region" class="select">
              <option value="Belgium">Belgium</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Germany">Germany</option>
            </select>
          </div>
        </form>
      </article>

      <article class="card">
        <h2 class="card-title">Security</h2>
        <form class="form">
          <div class="form-group">
            <label class="label" for="twofactor">Two-factor authentication</label>
            <select id="twofactor" v-model="form.twoFactor" class="select">
              <option value="Email">Email codes</option>
              <option value="Authenticator">Authenticator app</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label">Session timeout</label>
            <select v-model="form.sessionTimeout" class="select">
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="60">60 min</option>
            </select>
          </div>
        </form>
      </article>
    </div>

    <article class="card">
      <h2 class="card-title">Notifications</h2>
      <div class="toggle-row" v-for="(value, key) in notifications" :key="key">
        <div>
          <strong>{{ notificationLabels[key].title }}</strong><br />
          <span class="card-subtitle">{{ notificationLabels[key].body }}</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="notifications[key]" />
          <span class="switch-indicator"></span>
        </label>
      </div>
      <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem">
        <button class="btn btn-primary" type="button" :disabled="isSaving" @click="saveSettings">
          {{ isSaving ? 'Saving...' : 'Save changes' }}
        </button>
        <button class="btn btn-outline" type="button" @click="resetSettings">
          Cancel
        </button>
      </div>
      <p v-if="status" class="card-subtitle" style="margin-top: 0.5rem">
        {{ status }}
      </p>
    </article>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'

const defaultForm = {
  language: 'English',
  theme: 'Light',
  region: 'Belgium',
  twoFactor: 'Email',
  sessionTimeout: '30'
}

const form = reactive({ ...defaultForm })

const notifications = reactive({
  productNews: true,
  weeklyDigest: false,
  riskAlerts: true
})

const notificationLabels = {
  productNews: {
    title: 'Product updates',
    body: 'Feature launches, roadmap and changelog.'
  },
  weeklyDigest: {
    title: 'Weekly digest',
    body: 'Summary of analyses and outstanding tasks.'
  },
  riskAlerts: {
    title: 'Risk alerts',
    body: 'Immediate emails when a high-risk clause is found.'
  }
}

const isSaving = ref(false)
const status = ref('')

const resetSettings = () => {
  Object.assign(form, defaultForm)
  notifications.productNews = true
  notifications.weeklyDigest = false
  notifications.riskAlerts = true
  status.value = ''
}

const saveSettings = async () => {
  isSaving.value = true
  status.value = ''
  await new Promise((resolve) => setTimeout(resolve, 800))
  isSaving.value = false
  status.value = 'Settings saved successfully.'
}
</script>
