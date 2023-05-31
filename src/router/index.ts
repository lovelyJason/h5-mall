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
      path: '/goods-detail',
      name: 'goodesDetail',
      component: () => import('../views/GoodsDetail.vue')
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
    },
    {
      path: '/settings/aboutus',
      name: 'aboutus',
      component: () => import('../views/Aboutus.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue')
    },
    {
      path: '/apply/form',
      name: 'applyForm',
      component: () => import('../views/ApplyForm.vue')
    },
    {
      path: '/invite',
      name: 'invite',
      component: () => import('../views/Invite.vue')
    },
    {
      path: '/myusers',
      name: 'myusers',
      component: () => import('../views/MyUsers.vue')
    },
    {
      path: '/myusers-detail',
      name: 'myusers-detail',
      component: () => import('../views/MyUsersDetail.vue')
    },
    {
      path: '/commision-orderlist',
      name: 'commision-orderlist',
      component: () => import('../views/CommisionOrderList.vue')
    },
    {
      path: '/distribution',
      name: 'distribution',
      component: () => import('../views/distribution/Distribution.vue')
    },
    {
      path: '/assets',
      name: 'assets',
      component: () => import('../views/Assets.vue')
    }
  ]
})

export default router
