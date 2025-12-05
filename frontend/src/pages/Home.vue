<!--frontend/src/pages/Home.vue-->

<template>
  <section class="container hero">
    <div>
      <h1 class="hero-title">AI-Powered Contract Analysis</h1>
      <p class="hero-subtitle">
        Analyze legal contracts instantly with AI-powered insights. Identify
        risks, understand obligations, and make informed decisions with confidence.
      </p>
      <div style="display: flex; gap: 1rem; flex-wrap: wrap">
        <RouterLink :to="{ name: 'signup' }" class="btn btn-primary">
          Start Reviewing Contracts
        </RouterLink>
        <RouterLink :to="{ name: 'common-contracts' }" class="btn btn-outline">
          View Example Analyses
        </RouterLink>
      </div>
      <div class="hero-badges">
        <span class="hero-badge">AI Risk Detection</span>
        <span class="hero-badge">Instant Clause Analysis</span>
        <span class="hero-badge">GDPR Compliant</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Sample Analysis Result</div>
          <div class="card-subtitle">
            Employment Agreement – Jan 15, 2025
          </div>
        </div>
        <span class="badge badge-high">High Risk</span>
      </div>
      <ul class="list">
        <li>
          <strong>Non-compete clause</strong><br />
          Overly restrictive geographic and time limitations identified.
        </li>
        <li>
          <strong>Termination procedures</strong><br />
          Unclear notice periods and exit conditions require review.
        </li>
        <li>
          <strong>Compensation structure</strong><br />
          Variable bonus criteria lack specific performance metrics.
        </li>
      </ul>
    </div>
  </section>

  <section class="container">
    <h2 class="section-title">Powerful Features for Contract Review</h2>
    <p class="section-subtitle">
      Everything you need to understand your contracts at a glance.
    </p>
    <div class="stats-grid">
      <div class="card">
        <div class="card-title">Deep Clause Analysis</div>
        <p class="card-subtitle">
          AI examines every clause with legal precision, highlighting important terms and potential issues.
        </p>
      </div>
      <div class="card">
        <div class="card-title">Risk Assessment</div>
        <p class="card-subtitle">
          Automatically identify high, medium, and low-risk clauses before you sign any agreement.
        </p>
      </div>
      <div class="card">
        <div class="card-title">Clear Obligations</div>
        <p class="card-subtitle">
          See exactly what you're agreeing to with plain-language summaries of your responsibilities.
        </p>
      </div>
      <div class="card">
        <div class="card-title">Centralized Dashboard</div>
        <p class="card-subtitle">
          Track and manage all your contract analyses in one organized workspace.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
