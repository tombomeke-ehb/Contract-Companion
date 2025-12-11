import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    settings: {
      workspace: 'Workspace',
      title: 'Settings',
      subtitle: 'Adjust language, theme and security preferences for your account.',
      applicationSettings: 'Application settings',
      security: 'Security',
      notifications: 'Notifications',
      reset: 'Reset changes',
      save: 'Save changes',
      cancel: 'Cancel',
      savedStatus: 'Settings saved successfully.',
      language: 'Language',
      theme: 'Theme',
      region: 'Region',
      twoFactor: 'Two-factor authentication',
      sessionTimeout: 'Session timeout'
    }
  },
  nl: {
    settings: {
      workspace: 'Werkruimte',
      title: 'Instellingen',
      subtitle: 'Pas taal, thema en beveiligingsvoorkeuren voor je account aan.',
      applicationSettings: 'Applicatie-instellingen',
      security: 'Beveiliging',
      notifications: 'Meldingen',
      reset: 'Wijzigingen resetten',
      save: 'Wijzigingen opslaan',
      cancel: 'Annuleren',
      savedStatus: 'Instellingen succesvol opgeslagen.',
      language: 'Taal',
      theme: 'Thema',
      region: 'Regio',
      twoFactor: 'Tweestapsverificatie',
      sessionTimeout: 'Sessietime-out'
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages
})