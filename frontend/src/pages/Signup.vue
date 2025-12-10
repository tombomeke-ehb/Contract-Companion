<template>
  <section class="container auth-grid">
    <article class="card" style="margin-bottom:2rem;">
      <p class="page-eyebrow">Welcome</p>
      <h1 class="section-title">Create your account</h1>
      <p class="section-subtitle">
        Start analysing contracts with AI-powered insights in just a few clicks.
      </p>

      <form class="form" @submit.prevent="handleSignup">
        <div class="form-group">
          <label class="label" for="signup-name">Full name</label>
          <input
            id="signup-name"
            v-model="form.name"
            class="input"
            type="text"
            placeholder="Jane Doe"
            required
          />
        </div>
        <div class="form-group">
          <label class="label" for="signup-email">Email</label>
          <input
            id="signup-email"
            v-model="form.email"
            class="input"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div class="form-group">
          <label class="label" for="signup-password">Password</label>
          <input
            id="signup-password"
            v-model="form.password"
            class="input"
            type="password"
            placeholder="At least 8 characters"
            minlength="8"
            required
          />
        </div>

        <button class="btn btn-primary" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating account...' : 'Create account' }}
        </button>
        <button class="btn btn-outline" type="button" @click="continueWithGoogle" style="margin-top:0.5rem;">
          Continue with Google
        </button>
        <p v-if="error" class="card-subtitle" style="color: var(--danger)">
          {{ error }}
        </p>
        <p class="card-subtitle">
          Already have an account?
          <RouterLink :to="{ name: 'login' }">Log in here</RouterLink>
        </p>
      </form>
    </article>

    <article class="card">
      <h2 class="card-title">Why people sign up</h2>
      <ul class="list">
        <li>
          <strong>Faster reviews</strong><br />
          Upload any PDF or DOCX and get a digestible report in minutes.
        </li>
        <li>
          <strong>Risk radar</strong><br />
          We flag red clauses so you can focus on what matters.
        </li>
        <li>
          <strong>Team-friendly</strong><br />
          Share reports with classmates or colleagues in one click.
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: ''
})

const isSubmitting = ref(false)
const error = ref('')

const handleSignup = async () => {
  if (!form.name || !form.email || form.password.length < 8) {
    error.value = 'Please fill in all fields (password needs 8+ characters).'
    return
  }

  isSubmitting.value = true
  error.value = ''

  await new Promise((resolve) => setTimeout(resolve, 800))

  isSubmitting.value = false
  router.push({ name: 'dashboard' })
}

const continueWithGoogle = () => {
  router.push({ name: 'dashboard' })
}
</script>
