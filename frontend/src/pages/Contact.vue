<template>
  <section class="container contact-grid">
    <article class="card" style="margin-bottom:2rem;">
      <p class="page-eyebrow">Support</p>
      <h1 class="section-title">Contact us</h1>
      <p class="section-subtitle">
        Send us a quick message and we will get back within one business day.
      </p>

      <form class="form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="label" for="contact-name">Name</label>
          <input
            id="contact-name"
            v-model="form.name"
            class="input"
            type="text"
            placeholder="Your full name"
            required
          />
        </div>
        <div class="form-group">
          <label class="label" for="contact-email">Email</label>
          <input
            id="contact-email"
            v-model="form.email"
            class="input"
            type="email"
            placeholder="your.email@example.com"
            required
          />
        </div>
        <div class="form-group">
          <label class="label" for="contact-message">Message</label>
          <textarea
            id="contact-message"
            v-model="form.message"
            class="textarea"
            placeholder="How can we help you?"
            required
          ></textarea>
        </div>

        <button class="btn btn-primary" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send message' }}
        </button>
        <p v-if="status" class="card-subtitle" style="margin-top: 0.5rem">
          {{ status }}
        </p>
      </form>
    </article>

    <article class="card">
      <h2 class="card-title">Other ways to reach us</h2>
      <ul class="list">
        <li>
          <strong>Email</strong><br />
          support@contractcompanion.com
        </li>
        <li>
          <strong>Office hours</strong><br />
          Mon–Fri 09:00–17:00 CET
        </li>
        <li>
          <strong>Location</strong><br />
          Erasmus Hogeschool Brussel<br />
          Nijverheidskaai 170, 1070 Brussel
        </li>
      </ul>
      <p class="card-subtitle" style="margin-top: 1rem">
        Prefer documentation? Visit the knowledge base for quick answers.
      </p>
      <RouterLink :to="{ name: 'docs' }" class="btn btn-outline">
        Open documentation
      </RouterLink>
    </article>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

const form = reactive({
  name: '',
  email: '',
  message: ''
})

const isSubmitting = ref(false)
const status = ref('')

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.message = ''
}

const handleSubmit = async () => {
  isSubmitting.value = true
  status.value = ''
  await new Promise((resolve) => setTimeout(resolve, 600))
  resetForm()
  status.value = 'Message received. We will reach out soon.'
  isSubmitting.value = false
}
</script>
