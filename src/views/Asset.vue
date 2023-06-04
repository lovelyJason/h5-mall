<script setup lang="ts">
import { ref, reactive, onMounted, inject, onBeforeUnmount } from 'vue'
import { showSuccessToast, showFailToast, showToast } from 'vant';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const router = useRouter()

const user = useUserStore()
const $WEBAPI: any = inject('$WEBAPI')
const WEBAPI = $WEBAPI
const wx: any = inject('wx')

const data = reactive<any>({
  wxlogin: true,
  balance: 0.00,
  freeze: 0,
  totleConsumed: 0, // 累计消费
  score: 0,
  score_sign_continuous: 0,

  tabs: ["资金明细", "提现记录"],
  activeIndex: 0,
  sliderOffset: 0,
  sliderLeft: 0,
  cashlogs: [],
  withDrawlogs: [],
  depositlogs: [],

  rechargeOpen: false // 是否开启充值[预存]功能
})

const tabClick = (e: number) => {
  data.activeIndex = e
  fetchTabData()
}

const getUserAmount = async () => {
  const token = wx.getStorage('token')
  let res = await WEBAPI.userAmount(token)
  if (res.code == 700) {
    showToast('当前账户存在异常')
    return
  }
  if (res.code == 2000) {
    data.wxlogin = false
    return
  }
  if (res.code == 0) {
    data.balance = res.data.balance.toFixed(2)
    data.freeze = res.data.freeze.toFixed(2)
    data.totleConsumed = res.data.totleConsumed.toFixed(2)
    data.score = res.data.score
  }
}

const cashLogs = async () => {
  let res = await WEBAPI.cashLogsV2({
    token: wx.getStorage('token'),
    page: 1
  })
  if (res.code == 0) {
    data.cashlogs = res.data.result
  }
}

const withDrawlogs = async () => {
  let res = await WEBAPI.withDrawLogs({
    token: wx.getStorage('token'),
    page: 1,
    pageSize: 50
  })
  if (res.code == 0) {
    data.withDrawlogs = res.data
  }
}


const fetchTabData = () => {
  const activeIndex = data.activeIndex
  if (activeIndex == 0) {
    cashLogs()
  }
  if (activeIndex == 1) {
    withDrawlogs()
  }
}

// TODO:本页面刷新在url结尾加上/导致刷新403
onMounted(() => {
  user.checkHasLogined().then((isLogined: boolean) => {
    data.wxlogin = isLogined
    if (isLogined) {
      getUserAmount()
      fetchTabData()
    }
  })
})

</script>

<template>
  <div class="asset">
    <div class='item'>
      <div>可用余额(元)</div>
      <div>{{ data.balance }}</div>
    </div>
    <div class='item'>
      <div>冻结金额(元)</div>
      <div>{{ data.freeze }}</div>
    </div>
    <div class='item right'>
      <div>累计消费(元)</div>
      <div>{{ data.totleConsumed }}</div>
    </div>
  </div>
  <div class='btn-view'>
    <span class="btn" @click="router.push('/withdrawal')">提现</span>
  </div>
  <van-tabs :active="data.activeIndex" @change="tabClick">
    <van-tab v-for="item in data.tabs" :key="item" :title="item" />
  </van-tabs>
  <van-cell-group v-if="data.activeIndex == 0">
    <van-empty v-if="data.cashlogs.length <= 0" description="暂无资金明细" />
    <van-cell v-for="(item, index) in data.cashlogs" :key="index" :title="item.typeStr" :label="item.dateAdd"
      :value="item.amount" />
  </van-cell-group>
  <van-cell-group v-if="data.activeIndex == 1">
    <van-empty v-if="data.withDrawlogs.length <= 0" description="暂无提现记录" />
    <van-cell v-for="(item, index) in data.withDrawlogs" :key="index" :title="item.statusStr" :label="item.dateAdd"
      :value="item.money" />
  </van-cell-group>
</template>

<style scoped lang="scss">
.asset {
  display: flex;
  padding-top: convertRpxToVw(50);
  height: convertRpxToVw(200);
  background-color: #e85654;
}
.asset .item {
  display: flex;
  flex-direction: column;
  width:convertRpxToVw(250);
  text-align: center;
  font-size: 14px;
  line-height: 30px;
  color:#fff;
}

.btn-view {
  height: convertRpxToVw(88);
  background-color: #e85654;
  padding-bottom: convertRpxToVw(30);  
  width: 100vw;
  display: flex;
  flex-direction: row-reverse;
}
.btn-view .btn {
  width: 62px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  margin-right: convertRpxToVw(20);
  color: #fff;
  background-color: transparent;
  border: 1px solid #fff;
  border-radius: 5px;
}

.no-data {
  margin-top: convertRpxToVw(100);
  text-align: center;
  font-size: 13px;
  color:#ccc;
}

.cashlogs {
  display: flex;
  font-size: 12px;
  margin-top: convertRpxToVw(20);
  padding-bottom: convertRpxToVw(20);
  border-bottom: 1px solid #eee;
  line-height: 20px;
}
.cashlogs .profile {
  width: convertRpxToVw(600);
  padding-left: convertRpxToVw(30);
}
.cashlogs .amount {
  width: convertRpxToVw(150);
}
</style>