import './assets/main.css'

import { createApp } from 'vue'

import {
  Area,
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
  Divider,
  Sticky,
  Stepper,
  ActionBar, 
  ActionBarIcon, 
  ActionBarButton,
  Swipe, 
  SwipeItem,
  RadioGroup,
  Radio,
  Popup,
  List,
  Tag,
  Dialog
} from 'vant'
// 2. 引入组件样式
import 'vant/lib/index.css'
import '@/assets/override.css'

import App from './App.vue'
import router from './router'

import WEBAPI from 'apifm-webapi'
import wx from '@/lib/wx'
import wxShare from '@/utils/wxShare'
import store from '@/stores/index'
import { useUserStore } from '@/stores/user'
// @ts-ignore
import VueWechatTitle from 'vue-wechat-title'; //引入VueWechatTitle
// import eruda from 'eruda'

// eruda.init()

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $filters: any
    isInWechat: boolean
  }
}

const app = createApp(App)

/**
 * 等价
 * https://api.it120.cc/jasonhuang/shop/goods/list/v2
 * https://mall.qdovo.com/jasonhuang/shop/goods/list/v2
 * 
 */
WEBAPI.init2('https://mall.qdovo.com', 'jasonhuang')
app.provide('$WEBAPI', WEBAPI)
app.provide('wx', wx)
app.provide('wxShare', wxShare)

app.use(Area)
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
app.use(Stepper)
app.use(ActionBar)
app.use(ActionBarIcon)
app.use(ActionBarButton)
app.use(Swipe)
app.use(SwipeItem)
app.use(RadioGroup)
app.use(Radio)
app.use(Popup)
app.use(List)

app.use(store)
app.use(VueWechatTitle);
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

function is_weixn(){
  var ua = navigator.userAgent.toLowerCase();
  if(ua.indexOf('micromessenger') != -1) {
      return true;
  } else {
      return false;
  }
}

app.config.globalProperties.isInWechat = is_weixn()

WEBAPI.queryConfigBatch(
  'mallName,WITHDRAW_MIN,ALLOW_SELF_COLLECTION,order_hx_uids,subscribe_ids,share_profile,adminUserIds,goodsDetailSkuShowType,shopMod,needIdCheck,balance_pay_pwd,shipping_address_gps,shipping_address_region_level,shopping_cart_vop_open,cps_open,recycle_open,categoryMod,hide_reputation,show_seller_number,show_goods_echarts,show_buy_dynamic,goods_search_show_type,show_3_seller,show_quan_exchange_score,show_score_exchange_growth,show_score_sign,fx_subscribe_ids,share_pic,orderPeriod_open,order_pay_user_balance,wxpay_api_url,sphpay_open,fx_type'
).then((res: any) => {
  if (res.code == 0) {
    res.data.forEach((config: any) => {
      wx.setStorage(config.key, config.value)
    })
  }
})

app.mount('#app')
