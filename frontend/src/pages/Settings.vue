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
        </form>
      </article>

      <article class="card">
        <h2 class="card-title">{{ $t('settings.security') }}</h2>
        <form class="form">
          <div class="form-group">
            <label class="label" for="twofactor">{{ $t('settings.twoFactor') }}</label>
            <select id="twofactor" v-model="form.twoFactor" class="select">
              <option value="Email">{{ $t('settings.twoFactorEmail') }}</option>
              <option value="Authenticator">{{ $t('settings.twoFactorApp') }}</option>
              <option value="Disabled">{{ $t('settings.twoFactorDisabled') }}</option>
            </select>
          </div>
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
      <h2 class="card-title">{{ $t('settings.notifications') }}</h2>
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
import { reactive, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

import { applyTheme, persistThemeToStorage } from '../theme'

const { locale, t } = useI18n()

// tijdelijk hardcoded; later uit login halen
const userId = 1

// Keys for localStorage so we can persist across navigations
const STORAGE_KEYS = {
  theme: 'cc_theme_v2', // new multi-theme key
  language: 'cc_language',
  twoFactor: 'cc_twoFactor',
  sessionTimeout: 'cc_sessionTimeout'
}

const defaultForm = {
  language: 'English',
  theme: 'light',
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

// --- helpers for localStorage persistence ---
function loadFromStorage() {
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEYS.theme)
    const storedLangCode = localStorage.getItem(STORAGE_KEYS.language)
    const storedTwoFactor = localStorage.getItem(STORAGE_KEYS.twoFactor)
    const storedSession = localStorage.getItem(STORAGE_KEYS.sessionTimeout)

    if (storedTheme && THEME_CLASS_MAP[storedTheme]) {
      form.theme = storedTheme
    }
    if (storedLangCode === 'en' || storedLangCode === 'nl') {
      form.language = mapCodeToUi(storedLangCode)
    }
    if (storedTwoFactor) {
      form.twoFactor = storedTwoFactor
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
    localStorage.setItem(STORAGE_KEYS.twoFactor, form.twoFactor)
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
  // 1) lokaal laden
  loadFromStorage()

  // 2) meteen toepassen
  applyTheme(form.theme)
  veranderTaal(form.language)

  // 3) backend sync
  try {
    const { data } = await axios.get(`http://localhost:3000/api/preferences/${userId}`)

    if (data.THEME && THEME_CLASS_MAP[data.THEME]) {
      form.theme = data.THEME
    }
    if (data.LANG) {
      form.language = mapCodeToUi(data.LANG)
    }

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

  notifications.productNews = true
  notifications.weeklyDigest = false
  notifications.riskAlerts = true

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
    language: mapUiToCode(form.language)
  }

  try {
    await axios.put(`http://localhost:3000/api/preferences/${userId}`, payload)
    status.value = t('settings.savedStatus')
    saveToStorage()
  } catch (err) {
    console.error(err)
    status.value = t('settings.saveError')
  } finally {
    isSaving.value = false
  }
}
</script>
