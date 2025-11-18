import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../pages/Dashboard.vue'
import Upload from '../pages/Upload.vue'
import ContractDetail from '../pages/ContractDetail.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/upload', component: Upload },
  { path: '/contracts/:id', component: ContractDetail },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
