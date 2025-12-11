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
    },

     dashboard: {
      welcomeBack: 'Welcome back, John',
      subtitle: 'Here’s what’s happening with your contracts.',
      uploadNewContract: 'Upload New Contract',

      totalAnalyses: 'Total Analyses',
      highRiskFound: 'High Risk Found',
      thisMonth: 'This Month',

      filterRiskAll: 'All risk levels',
      filterRiskHigh: 'High risk',
      filterRiskMedium: 'Medium risk',
      filterRiskLow: 'Low risk',
      filterMonthAll: 'All months',

      recentAnalyses: 'Recent Contract Analyses',
      view: 'View',
      noReports: 'No reports match this filter yet.'
    },
    upload: {
      eyebrow: 'Upload',
      title: 'Upload contract',
      subtitle:
        'Drag, drop or browse for a contract. We will take care of formatting and highlight the clauses that matter.',

      fileReady: 'File ready to analyse',
      dragDrop: 'Drag & drop your contract',
      fileHint: 'PDF, DOC, DOCX or TXT up to 10MB',
      browseFiles: 'Browse files',

      contractType: 'Contract type',
      contractTypePlaceholder: 'Select contract type...',
      notesLabel: 'Notes for the AI',
      notesPlaceholder:
        'Share context, deadlines or clauses we should prioritise (optional).',

      notificationsLabel: 'Notifications',
      notifyByEmail: 'Email me when the analysis is done',

      analyzing: 'Analyzing...',
      analyzeButton: 'Analyze contract',
      reset: 'Reset',

      whatHappensNext: 'What happens next',

      loaderAria: 'Uploading contract',
      loaderText: 'Uploading and analyzing your contract...'
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
    },
    dashboard: {
      welcomeBack: 'Welkom terug, John',
      subtitle: 'Dit is de huidige status van je contracten.',
      uploadNewContract: 'Nieuw contract uploaden',

      totalAnalyses: 'Totaal aantal analyses',
      highRiskFound: 'Hoog risico gevonden',
      thisMonth: 'Deze maand',

      filterRiskAll: 'Alle risiconiveaus',
      filterRiskHigh: 'Hoog risico',
      filterRiskMedium: 'Gemiddeld risico',
      filterRiskLow: 'Laag risico',
      filterMonthAll: 'Alle maanden',

      recentAnalyses: 'Recente contractanalyses',
      view: 'Bekijken',
      noReports: 'Er zijn nog geen rapporten die bij deze filter passen.'
    },
    upload: {
      eyebrow: 'Upload',
      title: 'Contract uploaden',
      subtitle:
        'Sleep een contract hierheen of blader naar een bestand. Wij zorgen voor de opmaak en lichten de belangrijkste clausules uit.',

      fileReady: 'Bestand klaar om te analyseren',
      dragDrop: 'Sleep je contract hierheen',
      fileHint: 'PDF, DOC, DOCX of TXT tot 10MB',
      browseFiles: 'Bestanden bladeren',

      contractType: 'Contracttype',
      contractTypePlaceholder: 'Kies een contracttype...',
      notesLabel: 'Notities voor de AI',
      notesPlaceholder:
        'Deel context, deadlines of clausules die we moeten prioriteren (optioneel).',

      notificationsLabel: 'Meldingen',
      notifyByEmail: 'Mail mij wanneer de analyse klaar is',

      analyzing: 'Bezig met analyseren...',
      analyzeButton: 'Contract analyseren',
      reset: 'Resetten',

      whatHappensNext: 'Wat gebeurt er daarna',

      loaderAria: 'Contract uploaden',
      loaderText: 'Contract wordt geüpload en geanalyseerd...'
    }

  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages
})
