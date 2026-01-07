<template>
  <section class="container" style="max-width: 500px; margin-top: 4rem;">
    <div class="card">
      <h1 class="section-title">Welcome Back</h1>
      <p class="section-subtitle">
        Sign in to your Contract Companion account.
      </p>

      <form class="form" @submit.prevent="onLogin">
        <div class="form-group">
          <label class="label">Email Address</label>
          <input
            class="input"
            type="email"
            placeholder="you@example.com"
            v-model="email"
            required
          />
        </div>

        <div class="form-group">
          <label class="label">Password</label>
          <input
            class="input"
            type="password"
            placeholder="Enter your password"
            v-model="password"
            required
          />
        </div>

        <button class="btn btn-primary" style="width:100%">
          Sign In
        </button>

        <p style="text-align:center; margin-top:1rem">
          Don’t have an account?
          <RouterLink to="/signup">Create one</RouterLink>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import authApi from '@/api/auth'
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const userStore = useUserStore()
const notifications = useNotificationStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')

const onLogin = async () => {
  try {
    const data = await authApi.login({
      email: email.value,
      password: password.value
    })

    userStore.setUser(data.user)
    await userStore.loadPreferences() // Load and apply theme from backend

    const name = data.user?.name || data.user?.email || ''
    notifications.push({
      title: t('toast.welcome', { name }),
      variant: 'success'
    })

    const redirectName = userStore.isAdmin ? 'admin-dashboard' : 'dashboard'
    router.push({ name: redirectName })
  } catch (err) {
    alert(err?.error || 'Invalid email or password')
  }
}
</script>
