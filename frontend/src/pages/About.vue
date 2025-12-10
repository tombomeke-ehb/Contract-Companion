<template>
  <section class="container">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Our story</p>
        <h1 class="section-title">About Contract Companion</h1>
        <p class="section-subtitle">
          A student-built platform that turns lengthy contracts into actionable insights.
        </p>
      </div>
      <RouterLink :to="{ name: 'contact' }" class="btn btn-outline">
        Get in touch
      </RouterLink>
    </header>

    <div class="two-column about-grid" style="margin-bottom:2rem;">
      <article class="card">
        <h2 class="card-title">Built during our IT project</h2>
        <p class="card-subtitle">
          We started Contract Companion to make contract analysis less intimidating for people who are not lawyers.
        </p>
        <p>
          Through dozens of interviews with students, freelancers and SMEs we found the same pattern: contracts take too long to read and it is easy to miss a dangerous clause.
          Our prototype focuses on clarity, surfacing only the red-flag clauses and giving people a safe checklist before they sign.
        </p>
        <ul class="list">
          <li v-for="milestone in milestones" :key="milestone.label">
            <strong>{{ milestone.label }}</strong><br />
            {{ milestone.body }}
          </li>
        </ul>
      </article>

      <article class="card">
        <h2 class="card-title">Values that guide every screen</h2>
        <p class="card-subtitle">
          Good UX, transparent AI and simple language.
        </p>
        <ul class="list">
          <li v-for="value in values" :key="value.title">
            <strong>{{ value.title }}</strong><br />
            {{ value.body }}
          </li>
        </ul>
      </article>
    </div>

    <div class="team-grid">
      <article
        v-for="member in team"
        :key="member.name"
        class="profile-card card"
        style="margin-bottom:1rem;"
      >
        <div class="profile-avatar">{{ member.initials }}</div>
        <h3>{{ member.name }}</h3>
        <p class="card-subtitle">{{ member.role }}</p>
        <p>{{ member.bio }}</p>
        <div class="profile-tags">
          <span v-for="skill in member.skills" :key="skill" class="pill pill-muted">
            {{ skill }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const milestones = [
  {
    label: 'Research started',
    body: 'We mapped more than 20 real-life contracts and noted the most confusing clauses.'
  },
  {
    label: 'Prototype v1',
    body: 'Clickable Figma screens that focused on documentation and onboarding.'
  },
  {
    label: 'Pilot with students',
    body: 'Tested the app with classmates who need help understanding rental and gym contracts.'
  }
]

const values = [
  {
    title: 'Clarity first',
    body: 'We avoid legal jargon and present every clause in plain Dutch or English.'
  },
  {
    title: 'Assist, not replace',
    body: 'AI highlights risks but final decisions stay with the user or their lawyer.'
  },
  {
    title: 'Trust & privacy',
    body: 'Contracts contain sensitive data, so security is built into every feature.'
  }
]

const team = [
  {
    name: 'Wail',
    role: 'Product strategist',
    initials: 'W',
    bio: 'Keeps everyone aligned and protects the scope so we deliver a polished experience.',
    skills: ['Strategy', 'Research', 'Planning']
  },
  {
    name: 'Fariss',
    role: 'Technical lead',
    initials: 'F',
    bio: 'Turns ideas into robust features, from the router to the analysis detail view.',
    skills: ['Full-stack', 'DevOps']
  },
  {
    name: 'Ahmed',
    role: 'UX & frontend',
    initials: 'A',
    bio: 'Designs every screen for readability, making sure the prototype matches reality.',
    skills: ['Design', 'Accessibility']
  },
  {
    name: 'Tom',
    role: 'Content & testing',
    initials: 'T',
    bio: 'Writes documentation, scripts usability sessions and translates feedback into tasks.',
    skills: ['Documentation', 'QA']
  },
  {
    name: 'Lars',
    role: 'Operations',
    initials: 'L',
    bio: 'Coordinates deadlines, demos and keeps the backlog organised.',
    skills: ['Coordination', 'Facilitation']
  }
]
</script>
