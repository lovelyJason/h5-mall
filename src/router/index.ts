import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// import { useUserStore } from '@/stores/user'; // store在router之前注册的，不能这么用
import { checkHasLogined } from '@/utils/auth'
import { redirectToWechatAuth } from '@/utils/index'

// const user = useUserStore()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '产品'
      },
    },
    {
      path: '/goods-detail',
      name: 'goodesDetail',
      meta: {
        title: '商品详情'
      },
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
      meta: {
        title: '订单'
      },
      component: () => import('../views/OrderList.vue')
    },
    {
      path: '/apply',
      name: 'apply',
      meta: {
        title: '申请分销商'
      },
      component: () => import('../views/Apply.vue')
    },
    {
      path: '/mine',
      name: 'mine',
      meta: {
        title: '会员中心',
        auth: true
      },
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
      meta: {
        title: '提交订单',
        auth: true
      },
      component: () => import('../views/ToPayOrder.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      meta: {
        title: '个人设置'
      },
      component: () => import('../views/Settings.vue')
    },
    {
      path: '/settings/aboutus',
      name: 'aboutus',
      meta: {
        title: '关于我'
      },
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
      meta: {
        title: '我的团队'
      },
      component: () => import('../views/MyUsers.vue')
    },
    {
      path: '/myusers-detail',
      name: 'myusers-detail',
      meta: {
        title: '会员信息'
      },
      component: () => import('../views/MyUsersDetail.vue')
    },
    {
      path: '/commision-orderlist',
      name: 'commision-orderlist',
      meta: {
        title: '推广订单'
      },
      component: () => import('../views/CommisionOrderList.vue')
    },
    {
      path: '/distribution',
      name: 'distribution',
      meta: {
        title: '分销中心'
      },
      component: () => import('../views/distribution/Distribution.vue')
    },
    {
      path: '/assets',
      name: 'assets',
      meta: {
        title: '资产'
      },
      component: () => import('../views/Assets.vue')
    }
  ]
})

router.beforeEach(async (to, from) => {
  if(to.meta.auth) {
    if(to.query.code) {
      
    }
    let isLogined = await checkHasLogined()
    if(!isLogined) {
      redirectToWechatAuth(false)
    }
  }
})

export default router
