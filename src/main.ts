import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import {
  Button,
  Search,
  Tabbar,
  TabbarItem,
  Tab,
  Tabs,
  Sidebar,
  SidebarItem,
  Row,
  Col,
  Card,
  Cell,
  CellGroup,
  Empty,
  Icon,
  Form,
  Field,
  SubmitBar,
  Dialog,
  Divider,
  Sticky,
  Tag
} from 'vant'
// 2. 引入组件样式
import 'vant/lib/index.css'
import '@/assets/override.css'

import App from './App.vue'
import router from './router'

import WEBAPI from 'apifm-webapi'
import wx from '@/lib/wx'
import wxShare from '@/utils/wxShare'
import { useUserStore } from '@/stores/user'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $filters: any
  }
}

const app = createApp(App)

WEBAPI.init('jasonhuang') // 设置专属域名
app.provide('$WEBAPI', WEBAPI)
app.provide('wx', wx)
app.provide('wxShare', wxShare)

app.use(Button)
app.use(Search)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Tab)
app.use(Tabs)
app.use(Sidebar)
app.use(SidebarItem)
app.use(Row)
app.use(Col)
app.use(Card)
app.use(Cell)
app.use(CellGroup)
app.use(Empty)
app.use(Icon)
app.use(Form)
app.use(Field)
app.use(SubmitBar)
app.use(Dialog)
app.use(Divider)
app.use(Sticky)
app.use(Tag)

app.use(createPinia())
app.use(router)

const user = useUserStore()


app.config.globalProperties.$filters = {
  numFormat(value: number) {
    let str = value + ''
    if (!value) return '0.00'
    if (str.indexOf('.') != -1) {
      let value2Array = str.split('.')
      let str0 = ''
      if (value2Array[1].length == 1) {
        str0 = value + '0'
      }
      if (value2Array[1].length == 2) {
        str0 = value + ''
      }
      return str0
    } else {
      return value + '.00'
    }
  }
}

// TODO:邀请页面也调用了，可以优化一下
WEBAPI.queryConfigBatch(
  'mallName,WITHDRAW_MIN,ALLOW_SELF_COLLECTION,order_hx_uids,subscribe_ids,share_profile,adminUserIds,goodsDetailSkuShowType,shopMod,needIdCheck,balance_pay_pwd,shipping_address_gps,shipping_address_region_level,shopping_cart_vop_open,cps_open,recycle_open,categoryMod,hide_reputation,show_seller_number,show_goods_echarts,show_buy_dynamic,goods_search_show_type,show_3_seller,show_quan_exchange_score,show_score_exchange_growth,show_score_sign,fx_subscribe_ids,share_pic,orderPeriod_open,order_pay_user_balance,wxpay_api_url,sphpay_open,fx_type'
).then((res: any) => {
  if (res.code == 0) {
    res.data.forEach((config: any) => {
      user.setStorage(config.key, config.value)
    })
  }
})

app.mount('#app')
