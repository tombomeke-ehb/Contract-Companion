// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Signup from '../pages/Signup.vue'
import Dashboard from '../pages/Dashboard.vue'
import Upload from '../pages/Upload.vue'
import AnalysisDetail from '../pages/AnalysisDetail.vue'
import Settings from '../pages/Settings.vue'
import CommonContracts from '../pages/CommonContracts.vue'
import About from '../pages/About.vue'
import Privacy from '../pages/Privacy.vue'
import Terms from '../pages/Terms.vue'
import Docs from '../pages/Docs.vue'
import Contact from '../pages/Contact.vue'
import Security from '../pages/Security.vue'
import { useAuthStore } from '../stores/authStore'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: Login },
  { path: '/signup', name: 'signup', component: Signup },

  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/upload', name: 'upload', component: Upload },
  { path: '/reports/:id', name: 'report-detail', component: AnalysisDetail },

  { path: '/settings', name: 'settings', component: Settings },
  { path: '/contracts/examples', name: 'common-contracts', component: CommonContracts },

  { path: '/docs', name: 'docs', component: Docs },

  { path: '/about', name: 'about', component: About },
  { path: '/privacy', name: 'privacy', component: Privacy },
  { path: '/terms', name: 'terms', component: Terms },
  { path: '/contact', name: 'contact', component: Contact },
  { path: '/security', name: 'security', component: Security },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('../pages/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/common-contracts',
    name: 'admin-common-contracts',
    component: () => import('../pages/AdminCommonContracts.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Lazy init from localStorage if needed
  if (!authStore.token && !authStore.user) {
    authStore.initFromStorage()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // User is logged in but not admin: send to home
    return next({ name: 'home' })
  }

  return next()
})

export default router
