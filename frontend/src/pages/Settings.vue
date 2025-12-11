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
              <option value="Light">{{ $t('settings.themeLight') }}</option>
              <option value="Dark">{{ $t('settings.themeDark') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label" for="region">{{ $t('settings.region') }}</label>
            <select id="region" v-model="form.region" class="select">
              <option value="Belgium">{{ $t('settings.regionBelgium') }}</option>
              <option value="Netherlands">{{ $t('settings.regionNetherlands') }}</option>
              <option value="Germany">{{ $t('settings.regionGermany') }}</option>
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

const { locale, t } = useI18n()

// tijdelijk hardcoded; later uit login halen
const userId = 1
//dit stuk hardcoded later eruit halen
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

const veranderThema = (theme) => {
  const html = document.documentElement // <html>

  if (theme === 'Dark') {
    html.classList.add('theme-dark')
  } else {
    html.classList.remove('theme-dark')
  }
}


const mapUiToCode = (languageLabel) => {
  return languageLabel === 'Nederlands' ? 'nl' : 'en'
}

const mapCodeToUi = (langCode) => {
  return langCode === 'nl' ? 'Nederlands' : 'English'
}

const veranderTaal = (languageLabel) => {
  const code = mapUiToCode(languageLabel)
  locale.value = code
}

watch(
  () => form.theme,
  (newTheme) => {
    veranderThema(newTheme)
  }
)

watch(
  () => form.language,
  (newLanguageLabel) => {
    veranderTaal(newLanguageLabel)
  }
)

onMounted(async () => {
  try {
    const { data } = await axios.get(`http://localhost:3000/api/preferences/${userId}`)

    form.theme = data.THEME || 'Light'
    form.language = mapCodeToUi(data.LANG || 'en')
    form.region = data.REGION || 'Belgium'
    veranderThema(form.theme)
    veranderTaal(form.language)
  } catch (err) {
    console.error('Kon preferences niet laden', err)

    veranderThema(form.theme)
    veranderTaal(form.language)
  }
})


const resetSettings = () => {
  Object.assign(form, defaultForm)
  notifications.productNews = true
  notifications.weeklyDigest = false
  notifications.riskAlerts = true
  status.value = ''

  veranderThema(form.theme)
  veranderTaal(form.language)
}

const saveSettings = async () => {
  isSaving.value = true
  status.value = ''

  const payload = {
    theme: form.theme,
    language: mapUiToCode(form.language),
    region: form.region
  }

  try {
    await axios.put(`http://localhost:3000/api/preferences/${userId}`, payload)
    status.value = t('settings.savedStatus')
  } catch (err) {
    console.error(err)
    status.value = 'Er ging iets mis bij het opslaan.'
  } finally {
    isSaving.value = false
  }
}
</script>
