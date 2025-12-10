<template>
  <section class="container">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Policies</p>
        <h1 class="section-title">Privacy policy</h1>
        <p class="section-subtitle">
          We treat every contract as confidential and explain in plain language how we handle your data.
        </p>
      </div>
      <a class="btn btn-outline" href="mailto:privacy@contractcompanion.com">
        privacy@contractcompanion.com
      </a>
    </header>

    <AccordionCard
      v-for="section in sections"
      :key="section.title"
      :title="section.title"
      :subtitle="section.subtitle"
      :items="section.items"
    />

    <AccordionCard title="Your rights">
      <template #item>
        <ul class="list">
          <li>Request a copy of all data we store about your account.</li>
          <li>Ask us to delete your account or specific uploads at any time.</li>
          <li>Export your reports via PDF, DOCX or CSV.</li>
          <li>Object to certain processing activities.</li>
        </ul>
      </template>
      <p class="card-subtitle" style="margin-top: 1rem">
        Email privacy@contractcompanion.com with the subject line <strong>Privacy request</strong> and we will respond within 72 hours.
      </p>
    </AccordionCard>
  </section>
</template>

<script setup>
import AccordionCard from '../components/AccordionCard.vue'
const sections = [
  {
    title: 'Information we collect',
    items: [
      'Account details such as name, email and encrypted password.',
      'Contracts and notes you upload for analysis.',
      'Usage analytics so we understand which features are helpful.'
    ]
  },
  {
    title: 'How we use your information',
    items: [
      'Provide AI-powered contract analysis and reporting.',
      'Deliver product updates, alerts and support responses.',
      'Improve models and user experience with aggregated metrics (never the contract text itself).'
    ]
  },
  {
    title: 'Security practices',
    subtitle: 'Security is built into every layer.',
    items: [
      'Data is encrypted in transit and at rest.',
      'Access is limited to the small student team maintaining this prototype.',
      'Uploads are automatically removed after 30 days unless you pin them.'
    ]
  }
]
</script>
