<template>
  <section class="container">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">{{ $t('settings.workspace') }}</p>
        <h1 class="section-title">{{ $t('settings.title') }}</h1>
        <p class="section-subtitle">
          {{ $t('settings.subtitle') }}
        </p>
      </div>
      <button class="btn btn-outline" type="button" @click="resetSettings">
        {{ $t('settings.resetChanges') }}
      </button>
    </header>

    <div class="settings-grid" style="margin-bottom:2rem;">
      <article class="card">
        <h2 class="card-title">{{ $t('settings.applicationSettings') }}</h2>
        <form class="form">
          <div class="form-group">
            <label class="label" for="language">{{ $t('settings.language') }}</label>
            <select id="language" v-model="form.language" class="select">
              <option value="English">{{ $t('settings.languageEnglish') }}</option>
              <option value="Nederlands">{{ $t('settings.languageDutch') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label" for="theme">{{ $t('settings.theme') }}</label>
            <select id="theme" v-model="form.theme" class="select">
              <option value="dark">Donker</option>
              <option value="light">Licht</option>
              <option value="dark-purple">Donker – Paars</option>
              <option value="dark-blue">Donker – Blauw</option>
              <option value="high-contrast">High contrast</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label" for="expiryReminderDays">Aantal dagen op voorhand voor contractverval-notificatie</label>
            <input
              id="expiryReminderDays"
              type="number"
              min="1"
              max="60"
              v-model.number="form.expiryReminderDays"
              class="input"
              style="max-width: 120px;"
            />
          </div>
          <div class="form-group">
            <label class="label" for="autoDeleteDays">Aantal dagen na vervaldatum voor automatische verwijdering</label>
            <input
              id="autoDeleteDays"
              type="number"
              min="1"
              max="365"
              v-model.number="form.autoDeleteDays"
              class="input"
              style="max-width: 120px;"
            />
          </div>
        </form>
      </article>

      <article class="card">
        <h2 class="card-title">{{ $t('settings.security') }}</h2>
        <form class="form">
          <div class="form-group">
            <label class="label">{{ $t('settings.sessionTimeout') }}</label>
            <select v-model="form.sessionTimeout" class="select">
              <option value="15">15 {{ $t('settings.minutes') }}</option>
              <option value="30">30 {{ $t('settings.minutes') }}</option>
              <option value="60">60 {{ $t('settings.minutes') }}</option>
            </select>
          </div>
        </form>
      </article>
    </div>

    <article class="card">
      <h2 class="card-title">Notificaties</h2>
      <div class="toggle-row">
        <div>
          <strong>Risk alerts</strong><br />
          <span class="card-subtitle">Directe notificatie en e-mail bij high-risk contracten</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="notifications.riskAlerts" />
          <span class="switch-indicator"></span>
        </label>
      </div>
      <div class="toggle-row">
        <div>
          <strong>E-mail bij risk alerts</strong><br />
          <span class="card-subtitle">Ontvang ook een e-mail bij high-risk contracten</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="notifications.riskAlertsEmail" />
          <span class="switch-indicator"></span>
        </label>
      </div>
      <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem">
        <button class="btn btn-primary" type="button" :disabled="isSaving" @click="saveSettings">
          {{ isSaving ? $t('settings.saving') : $t('settings.saveChanges') }}
        </button>
        <button class="btn btn-outline" type="button" @click="resetSettings">
          {{ $t('settings.cancel') }}
        </button>
      </div>
      <p v-if="status" class="card-subtitle" style="margin-top: 0.5rem">
        {{ status }}
      </p>
    </article>
  </section>
</template>

<script setup>
import { reactive, ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'

import { applyTheme, persistThemeToStorage } from '../theme'

const API_BASE_URL = import.meta.env.VITE_API_URL

const { locale, t } = useI18n()
const authStore = useAuthStore()

const userStore = useUserStore()

const userId = computed(() => userStore.user?.id)

// Keys for localStorage so we can persist across navigations
const STORAGE_KEYS = {
  theme: 'cc_theme_v2', // new multi-theme key
  language: 'cc_language',
  sessionTimeout: 'cc_sessionTimeout'
}

const defaultForm = {
  language: 'English',
  theme: 'light',
  sessionTimeout: '30',
  expiryReminderDays: 7,
  autoDeleteDays: 30 // standaard 30 dagen na vervaldatum
}

const form = reactive({ ...defaultForm })

const notifications = reactive({
  riskAlerts: true,
  riskAlertsEmail: true
})

const notificationLabels = {
  riskAlerts: {
    title: 'Risk alerts',
    body: 'Immediate emails when a high-risk clause is found.'
  }
}

const isSaving = ref(false)
const status = ref('')

// Map our theme keys to body classes
const THEME_CLASS_MAP = {
  dark: 'theme-dark',
  'dark-purple': 'theme-dark-purple',
  'dark-blue': 'theme-dark-blue',
  light: 'theme-light',
  'light-blue': 'theme-light-blue',
  'high-contrast': 'theme-high-contrast'
}

const mapUiToCode = (languageLabel) => (languageLabel === 'Nederlands' ? 'nl' : 'en')
const mapCodeToUi = (langCode) => (langCode === 'nl' ? 'Nederlands' : 'English')

const veranderTaal = (languageLabel) => {
  locale.value = mapUiToCode(languageLabel)
}

// --- helper to get auth headers ---
function getAuthHeaders() {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// --- helpers for localStorage persistence ---
function loadFromStorage() {
  try {
    // keep Settings storage keys for backwards compatibility
    const storedTheme = localStorage.getItem(STORAGE_KEYS.theme)
    const storedLangCode = localStorage.getItem(STORAGE_KEYS.language)
    const storedSession = localStorage.getItem(STORAGE_KEYS.sessionTimeout)

    if (storedTheme && THEME_CLASS_MAP[storedTheme]) {
      form.theme = storedTheme
    }
    if (storedLangCode === 'en' || storedLangCode === 'nl') {
      form.language = mapCodeToUi(storedLangCode)
    }
    if (storedSession) {
      form.sessionTimeout = storedSession
    }
  } catch (e) {
    console.warn('Kon settings niet uit localStorage laden', e)
  }
}

function saveToStorage() {
  try {
    // keep Settings storage keys for backwards compatibility
    localStorage.setItem(STORAGE_KEYS.theme, form.theme)
    localStorage.setItem(STORAGE_KEYS.language, mapUiToCode(form.language))
    localStorage.setItem(STORAGE_KEYS.sessionTimeout, form.sessionTimeout)

    // also save theme via shared helper (used by app startup)
    persistThemeToStorage(form.theme)
  } catch (e) {
    console.warn('Kon settings niet in localStorage opslaan', e)
  }
}

watch(
  () => ({ ...form }),
  () => {
    saveToStorage()
  },
  { deep: true }
)

watch(
  () => form.theme,
  (newTheme) => {
    console.debug('[Settings] theme changed', newTheme)
    applyTheme(newTheme)
  }
)

watch(
  () => form.language,
  (newLanguageLabel) => {
    veranderTaal(newLanguageLabel)
  }
)

onMounted(async () => {
  // step 1: load from localStorage
  loadFromStorage()
  applyTheme(form.theme)
  veranderTaal(form.language)
  if (!userId.value) {
    console.warn('Geen geldige gebruiker, sla settings laden over')
    return
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/preferences/${userId.value}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to load preferences')
    const data = await response.json()
    // Map backend fields to frontend
    if (data.theme && THEME_CLASS_MAP[data.theme]) {
      form.theme = data.theme
    }
    if (data.language) {
      form.language = mapCodeToUi(data.language)
    }
    if (data.sessionTimeout !== undefined && data.sessionTimeout !== null) {
      form.sessionTimeout = String(data.sessionTimeout)
    }
    if (data.expiryReminderDays !== undefined && data.expiryReminderDays !== null) {
      form.expiryReminderDays = Number(data.expiryReminderDays)
    }
    if (data.autoDeleteDays !== undefined && data.autoDeleteDays !== null) {
      form.autoDeleteDays = Number(data.autoDeleteDays)
    }
    if (data.riskAlerts !== undefined) notifications.riskAlerts = !!data.riskAlerts
    if (data.riskAlertsEmail !== undefined) notifications.riskAlertsEmail = !!data.riskAlertsEmail
    applyTheme(form.theme)
    veranderTaal(form.language)
    saveToStorage()
  } catch (err) {
    console.error('Kon preferences niet laden', err)
  }
})

const resetSettings = () => {
  // reset to LIGHT + English
  Object.assign(form, defaultForm)

  notifications.riskAlerts = true
  notifications.riskAlertsEmail = true

  status.value = ''

  applyTheme(form.theme)
  veranderTaal(form.language)
  saveToStorage()
}

const saveSettings = async () => {
  isSaving.value = true
  status.value = ''

  const payload = {
    theme: form.theme,
    lang: mapUiToCode(form.language),
    sessionTimeout: Number(form.sessionTimeout),
    expiryReminderDays: Number(form.expiryReminderDays),
    autoDeleteDays: Number(form.autoDeleteDays),
    riskAlerts: notifications.riskAlerts ? 1 : 0,
    riskAlertsEmail: notifications.riskAlertsEmail ? 1 : 0
  }
  console.debug('[Settings] saveSettings payload', payload)

  try {
    const response = await fetch(`${API_BASE_URL}/api/preferences/${userId.value}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to save preferences')
    status.value = t('settings.savedStatus')
    saveToStorage()

    // Notify the app about session timeout change so idle timer can update
    const sessionTimeoutValue = Number(form.sessionTimeout)
    window.dispatchEvent(new CustomEvent('sessionTimeoutChanged', { detail: sessionTimeoutValue }))
  } catch (err) {
    console.error(err)
    status.value = t('settings.saveError')
  } finally {
    isSaving.value = false
  }
}
</script>
