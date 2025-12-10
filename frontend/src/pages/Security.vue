<template>
  <section class="container">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Trust</p>
        <h1 class="section-title">Security & data handling</h1>
        <p class="section-subtitle">
          Contracts are sensitive, so the prototype was designed with privacy-first defaults.
        </p>
      </div>
      <RouterLink :to="{ name: 'privacy' }" class="btn btn-outline">
        View privacy policy
      </RouterLink>
    </header>

    <div class="stats-grid" style="margin-bottom:2rem;">
      <article class="card" v-for="highlight in highlights" :key="highlight.title">
        <h2 class="card-title">{{ highlight.title }}</h2>
        <p class="card-subtitle">{{ highlight.body }}</p>
      </article>
    </div>

    <article class="card" style="margin-bottom:2rem;">
      <h2 class="card-title">Security checklist</h2>
      <ul class="list">
        <li v-for="item in checklist" :key="item">
          {{ item }}
        </li>
      </ul>
    </article>

    <article class="card">
      <h2 class="card-title">Data retention</h2>
      <p>
        Uploaded contracts are stored in an encrypted bucket. By default they are deleted after 30 days
        unless you favourite the report. You can delete any document manually at any time – removal is immediate.
      </p>
    </article>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const highlights = [
  {
    title: 'Encryption',
    body: 'TLS 1.3 in transit and AES-256 at rest. Keys rotate automatically.'
  },
  {
    title: 'Access control',
    body: 'Only the project team can view metadata; contract text is never opened manually.'
  },
  {
    title: 'Audit trail',
    body: 'Every analysis and download is logged so you know who accessed a document.'
  }
]

const checklist = [
  'Two-factor authentication support (email + authenticator apps).',
  'IP-based alerts if someone tries to log in from a new device.',
  'Weekly dependency updates and automated vulnerability scanning.',
  'Backups stored in a separate region with the same encryption profile.'
]
</script>
