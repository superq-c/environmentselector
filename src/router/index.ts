import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
    },
    {
      path: '/environments',
      name: 'environments',
      component: () => import('../views/Environment.vue'),
    },
    {
      path: '/tools',
      name: 'tools',
      component: () => import('../views/Tool.vue'),
    },
    {
      path: '/profiles',
      name: 'profiles',
      component: () => import('../views/Profile.vue'),
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('../views/Group.vue'),
    },
  ],
})

export default router
