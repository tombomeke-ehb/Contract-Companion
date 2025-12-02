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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
