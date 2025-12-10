<template>
  <section class="container">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Policies</p>
        <h1 class="section-title">Terms of Service</h1>
        <p class="section-subtitle">
          Last updated 15 January 2025. These terms explain what you can expect from us and what we expect from you.
        </p>
      </div>
      <a class="btn btn-outline" href="mailto:legal@contractcompanion.com">
        Contact legal
      </a>
    </header>

    <AccordionCard
      v-for="section in sections"
      :key="section.title"
      :title="section.title"
      :subtitle="section.subtitle"
      :items="section.items"
    />

    <AccordionCard title="Liability">
      <p>
        Contract Companion is an educational prototype. Use the output as guidance, not as a substitute for professional legal advice.
        To the extent permitted by law our liability is capped at the amount paid for the service in the previous 12 months.
      </p>
    </AccordionCard>
  </section>
</template>

<script setup>
import AccordionCard from '../components/AccordionCard.vue'
const sections = [
  {
    title: 'Using the service',
    items: [
      'Only upload documents you have the right to share.',
      'Do not use the platform for illegal or harmful activities.',
      'Respect other users when collaborating on shared workspaces.'
    ]
  },
  {
    title: 'Account responsibilities',
    items: [
      'Keep your password secret and use a unique passphrase.',
      'Enable two-factor authentication to protect sensitive data.',
      'Notify us immediately if you detect suspicious activity.'
    ]
  },
  {
    title: 'Intellectual property',
    subtitle: 'Your contracts stay yours.',
    items: [
      'We do not claim ownership of the content you upload.',
      'You grant us a limited licence to analyse the document and produce the report.',
      'Aggregated insights may be used to improve the platform, but never in a way that reveals your data.'
    ]
  }
]
</script>
