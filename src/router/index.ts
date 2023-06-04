import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// import { useUserStore } from '@/stores/user'; // store在router之前注册的，不能这么用
import { checkHasLogined, redirectToWechatAuth, getNewToken } from '@/utils/auth'
import { showFailToast, showToast } from 'vant';

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
      path: '/order-detail',
      name: 'orderDetail',
      meta: {
        title: '订单详情'
      },
      component: () => import('../views/OrderDetail.vue')
    },
    {
      path: '/apply',
      name: 'apply',
      meta: {
        title: '申请成为分销商'
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
      component: () => import('../views/ToPayOrder.vue'),
      beforeEnter: (to, from) => {
        const title = from.meta.title
        if(title === '产品' || title === '商品详情' || !from.name) {
          return true
        } else {
          return false
        }
      },
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
        title: '关于我们'
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
      meta: {
        title: '申请分销商',
        auth: true
      },
      component: () => import('../views/ApplyForm.vue')
    },
    {
      path: '/myusers',
      name: 'myusers',
      meta: {
        title: '我的团队',
        auth: true
      },
      component: () => import('../views/MyUsers.vue')
    },
    {
      path: '/myusers-detail',
      name: 'myusers-detail',
      meta: {
        title: '会员信息',
        auth: true
      },
      component: () => import('../views/MyUsersDetail.vue')
    },
    {
      path: '/commision-orderlist',
      name: 'commision-orderlist',
      meta: {
        title: '推广订单',
        auth: true
      },
      component: () => import('../views/CommisionOrderList.vue')
    },
    {
      path: '/distribution',
      name: 'distribution',
      meta: {
        title: '分销中心',
        auth: true
      },
      component: () => import('../views/distribution/Distribution.vue')
    },
    {
      path: '/asset',
      name: 'asset',
      meta: {
        title: '资产',
        auth: true
      },
      component: () => import('../views/Asset.vue')
    },
    {
      path: '/withdrawal',
      name: 'withdrawal',
      meta: {
        title: '资产',
        auth: true
      },
      component: () => import('../views/Withdrawal.vue')
    }
  ]
})
let n = 0
router.beforeEach(async (to, from) => {
  n = n + 1
  let code = to.query.code
  let t = to.query.t
  let path = to.path
  if(code) {
    let req: any = { 
      code: code as string
    }
    let newQuery = JSON.parse(JSON.stringify(to.query))
    if(t) {
      try {
        const params = JSON.parse(window.atob(to.query.t as string))
        req.referrer = params.id
      } catch (error) {
        // 邀请参数非法
        showFailToast('参数非法')
      }

    }
    // 至此任意path携带t参数就可以完成邀请，但是只有auth: true的路由页才会wxmpAuth
    // 如http://127.0.0.1:5173/mine?t=eyJpZCI6ODQ3MzUwOH0=
    let res = await getNewToken(req) // 这个code只能用一次，下一次就是500
    if(res.code !== 0) {
      // alert(res.msg)
      showFailToast(res.msg)
    }
    delete newQuery.code
    delete newQuery.t
    // replace了也会触发一次导航守卫
    return {
      path,
      query: newQuery
    }
  } else {
    if(to.meta.auth) {
      // TODO:怎么在router中访问pinia是个问题
      let isLogined = await checkHasLogined()
      if(!isLogined) {
        showToast('检测到您未登录，正在为您登录中...')
        setTimeout(() => {
          let redirect_url = location.href  // 等于from的地址
          redirectToWechatAuth(false, redirect_url) // ③
        }, 800)
      } else {
        return true
      }
    }
  }
  // 经测试， 如果不带code且未登录时，①执行完以后，页面url会发生改变，但是此时没有正式导航到那个页面，再执行了②，然后导航到③的页面
  // 所以不用担心页面导航到其他页面甚至其他域名下的页面时，后续代码会不会执行的问题
  console.log(n, 'router end')  // ②
})

export default router
