import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    settings: {
      workspace: 'Workspace',
      title: 'Settings',
      subtitle: 'Adjust language, theme and security preferences for your account.',
      resetChanges: 'Reset changes',
      reset: 'Reset changes', 
      saveChanges: 'Save changes',
      save: 'Save changes',          
      saving: 'Saving...',
      cancel: 'Cancel',
      savedStatus: 'Settings saved successfully.',
      applicationSettings: 'Application settings',
      language: 'Language',
      languageEnglish: 'English',
      languageDutch: 'Dutch',
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      region: 'Region',
      regionBelgium: 'Belgium',
      regionNetherlands: 'Netherlands',
      regionGermany: 'Germany',

      security: 'Security',
      twoFactor: 'Two-factor authentication',
      twoFactorEmail: 'Email codes',
      twoFactorApp: 'Authenticator app',
      twoFactorDisabled: 'Disabled',
      sessionTimeout: 'Session timeout',
      minutes: 'min',

      notifications: 'Notifications'
    }
  },
  nl: {
    settings: {
      workspace: 'Werkruimte',
      title: 'Instellingen',
      subtitle: 'Pas taal, thema en beveiligingsvoorkeuren voor je account aan.',

      resetChanges: 'Wijzigingen resetten',
      reset: 'Wijzigingen resetten',
      saveChanges: 'Wijzigingen opslaan',
      save: 'Wijzigingen opslaan',
      saving: 'Bezig met opslaan...',
      cancel: 'Annuleren',
      savedStatus: 'Instellingen succesvol opgeslagen.',

      applicationSettings: 'Applicatie-instellingen',
      language: 'Taal',
      languageEnglish: 'Engels',
      languageDutch: 'Nederlands',
      theme: 'Thema',
      themeLight: 'Licht',
      themeDark: 'Donker',
      region: 'Regio',
      regionBelgium: 'België',
      regionNetherlands: 'Nederland',
      regionGermany: 'Duitsland',

      security: 'Beveiliging',
      twoFactor: 'Tweestapsverificatie',
      twoFactorEmail: 'E-mailcodes',
      twoFactorApp: 'Authenticator-app',
      twoFactorDisabled: 'Uitgeschakeld',
      sessionTimeout: 'Sessietime-out',
      minutes: 'min',

      notifications: 'Meldingen'
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages
})
