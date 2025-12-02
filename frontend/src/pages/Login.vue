<!--frontend/src/pages/Login.vue-->

<template>
  <section class="container" style="max-width: 500px">
    <div class="card" style="margin-bottom:2rem;">
      <h1 class="section-title">Welcome Back</h1>
      <p class="section-subtitle">
        Sign in to your Contract Companion account.
      </p>

      <form class="form" @submit.prevent="onLogin">
        <div class="form-group">
          <label class="label" for="email">Email Address</label>
          <input
            id="email"
            class="input"
            type="email"
            placeholder="you@example.com"
            v-model="email"
            required
          />
        </div>

        <div class="form-group">
          <label class="label" for="password">Password</label>
          <input
            id="password"
            class="input"
            type="password"
            placeholder="Enter your password"
            v-model="password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom:0.5rem;">
          Sign In
        </button>

        <button
          type="button"
          class="btn btn-outline"
          style="width: 100%; margin-bottom:0.5rem;"
          @click="onLoginWithGoogle"
        >
          Continue with Google
        </button>

        <p class="section-subtitle" style="text-align: center; margin-top: 0.5rem">
          Don't have an account?
          <RouterLink :to="{ name: 'signup' }">Create one here</RouterLink>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')

const onLogin = () => {
  // Mock login - navigate to dashboard
  router.push({ name: 'dashboard' })
}

const onLoginWithGoogle = () => {
  // Mock Google login
  router.push({ name: 'dashboard' })
}
</script>
