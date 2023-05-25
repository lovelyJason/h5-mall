import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/order',
      name: 'orderList',
      component: () => import('../views/OrderList.vue')
    },
    {
      path: '/apply',
      name: 'apply',
      component: () => import('../views/Apply.vue')
    },
    {
      path: '/mine',
      name: 'mine',
      component: () => import('../views/Mine.vue')
    },
    {
      path: '/demo',
      name: 'demo',
      component: () => import('../views/Demo.vue')
    },
    {
      path: '/to-pay-order',
      name: 'toPayOrder',
      component: () => import('../views/ToPayOrder.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue')
    }
  ]
})

export default router
