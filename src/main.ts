import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { Button, Search, Tabbar, TabbarItem, Tab, Tabs, Sidebar, SidebarItem, Row, Col, Card, Cell, CellGroup, Empty, Icon } from 'vant'
// 2. 引入组件样式
import 'vant/lib/index.css';

import WEBAPI from 'apifm-webapi'

import App from './App.vue'
import router from './router'


const app = createApp(App)

WEBAPI.init('wxapi')  // 设置专属域名
app.provide('$wxapi', WEBAPI);

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

app.use(createPinia())
app.use(router)

app.mount('#app')
