<template>
  <section class="container">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Knowledge base</p>
        <h1 class="section-title">Documentation</h1>
        <p class="section-subtitle">
          Everything you need to prepare, upload and interpret AI-powered contract analyses.
        </p>
      </div>
      <div class="page-header__actions">
        <input
          v-model="query"
          type="search"
          class="input"
          placeholder="Search topics..."
        />
        <RouterLink :to="{ name: 'contact' }" class="btn btn-outline">
          Contact support
        </RouterLink>
      </div>
    </header>

    <div v-if="filteredSections.length">
      <AccordionCard
        v-for="section in filteredSections"
        :key="section.id"
        :title="section.title"
        :subtitle="section.summary"
        :items="section.items.map(item => `${item.title}: ${item.body}`)"
      >
        <template v-if="section.extra && section.extra.length">
          <p v-for="paragraph in section.extra" :key="paragraph">{{ paragraph }}</p>
        </template>
        <template v-if="section.meta || section.category">
          <div class="doc-card__meta" style="margin-top: 1rem;">
            <span class="pill pill-muted">{{ section.meta }}</span>
            <span class="pill pill-ghost">{{ section.category }}</span>
          </div>
        </template>
      </AccordionCard>
    </div>
    <div v-else class="card doc-empty">
      <p class="card-title">No topics found</p>
      <p class="card-subtitle">
        Try another keyword or reach out to our team if you cannot find the answer you need.
      </p>
      <RouterLink :to="{ name: 'contact' }" class="btn btn-primary">
        Contact support
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AccordionCard from '../components/AccordionCard.vue'

const docSections = [
  {
    id: 'getting-started',
    title: 'Getting started',
    summary: 'Create your workspace, verify your account and run your first analysis.',
    category: 'Onboarding',
    icon: '',
    meta: '3 min read',
    ordered: true,
    items: [
      {
        title: 'Create and verify your account',
        body: 'Sign up with your email address, confirm the message we send and secure your password.'
      },
      {
        title: 'Complete your profile',
        body: 'Add your organisation name and preferred language so reports match your branding.'
      },
      {
        title: 'Explore the dashboard',
        body: 'Navigate to Upload Contract to send your first file into the AI pipeline.'
      }
    ],
    extra: [
      'Tip: invite teammates once your own profile is ready so they inherit your base configuration.'
    ]
  },
  {
    id: 'uploading',
    title: 'Uploading a contract',
    summary: 'Supported formats, drag-and-drop tips and how we keep your files secure.',
    category: 'Workflow',
    icon: '',
    meta: '2 min read',
    ordered: true,
    items: [
      {
        title: 'Choose a supported file',
        body: 'Upload PDF, DOCX, DOC or TXT up to 10MB. Larger files can be split before upload.'
      },
      {
        title: 'Add helpful context',
        body: 'Select the contract type and add optional notes so the AI knows what to look for.'
      },
      {
        title: 'Start the analysis',
        body: 'We convert the contract to structured text, check for encryption and queue it for review.'
      }
    ],
    extra: [
      'All files are encrypted in transit and deleted automatically 30 days after the analysis finishes.'
    ]
  },
  {
    id: 'ai-analysis',
    title: 'How AI analysis works',
    summary: 'Understand each phase of the pipeline so you can trust the output.',
    category: 'Technology',
    icon: '',
    meta: '4 steps',
    ordered: true,
    items: [
      {
        title: 'Document parsing',
        body: 'We extract the plain text, detect headings and map clauses while preserving numbering.'
      },
      {
        title: 'Clause identification',
        body: 'Key clauses are detected with transformers and labelled by category (IP, liability, etc.).'
      },
      {
        title: 'Risk scoring',
        body: 'Each clause receives a low / medium / high rating based on red flags and missing language.'
      },
      {
        title: 'Report generation',
        body: 'We summarise obligations, highlight risks and suggest follow-up questions.'
      }
    ],
    extra: [
      'Our AI never trains on your data. Models are isolated per tenant and refreshed weekly.'
    ]
  },
  {
    id: 'risk-levels',
    title: 'Understanding risk levels',
    summary: 'Learn how to interpret the red, amber and green signals in every report.',
    category: 'Insights',
    icon: '',
    meta: 'Risk keys',
    ordered: false,
    items: [
      {
        title: 'High risk',
        body: 'Clauses that could cause significant liability or limit your ability to terminate agreements.'
      },
      {
        title: 'Medium risk',
        body: 'Terms that are negotiable or could become problematic depending on the circumstances.'
      },
      {
        title: 'Low risk',
        body: 'Standard clauses that match market norms and rarely need edits.'
      }
    ],
    extra: [
      'You can customise the thresholds for each risk level under Settings > Analysis preferences.'
    ]
  },
  {
    id: 'red-flags',
    title: 'Red-flag categories explained',
    summary: 'The most common clause types we prioritise during a scan.',
    category: 'Insights',
    icon: '',
    meta: '4 categories',
    ordered: false,
    items: [
      {
        title: 'Financial terms',
        body: 'Payment obligations, automatic renewals, penalties and liability caps.'
      },
      {
        title: 'Termination clauses',
        body: 'Notice periods, auto-renewal logic and what happens when either party exits the contract.'
      },
      {
        title: 'Liability & indemnity',
        body: 'Risk allocation, damages limits and whether insurance coverage is required.'
      },
      {
        title: 'Intellectual property',
        body: 'Ownership of deliverables, licensing language and restrictions on future use.'
      }
    ],
    extra: [
      'Need another risk preset (for example GDPR or vendor security)? Duplicate one of the default profiles and tune it.'
    ]
  },
  {
    id: 'exporting',
    title: 'Exporting and sharing results',
    summary: 'Download or share the finished analysis with clients and colleagues.',
    category: 'Workflow',
    icon: '',
    meta: 'Exports',
    ordered: false,
    items: [
      {
        title: 'PDF report',
        body: 'Includes the executive summary, risk table and full clause commentary.'
      },
      {
        title: 'DOCX export',
        body: 'Redlines and comments ready for your legal team to adjust.'
      },
      {
        title: 'CSV / JSON',
        body: 'Perfect for pushing obligations into project management tools.'
      }
    ],
    extra: [
      'Share a secure link from the My Reports page to avoid sending attachments over email.'
    ]
  }
]

const query = ref('')
const openSections = ref([docSections[0].id])

const normalizedQuery = computed(() => query.value.trim().toLowerCase())

const filteredSections = computed(() => {
  if (!normalizedQuery.value) {
    return docSections
  }

  return docSections.filter((section) => {
    const haystack = [
      section.title,
      section.summary,
      section.category,
      ...(section.items?.map((item) => `${item.title} ${item.body}`) ?? []),
      ...(section.extra ?? [])
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery.value)
  })
})

const isSectionOpen = (id) => openSections.value.includes(id)

watch(
  filteredSections,
  (sections) => {
    if (!sections.length) return
    const visibleOpen = sections.some((section) => isSectionOpen(section.id))
    if (!visibleOpen) {
      openSections.value = [sections[0].id]
    }
  },
  { immediate: true }
)

const toggleSection = (id) => {
  if (isSectionOpen(id)) {
    openSections.value = openSections.value.filter((sectionId) => sectionId !== id)
    return
  }
  openSections.value = [...openSections.value, id]
}
</script>
