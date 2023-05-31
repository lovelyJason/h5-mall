<script setup lang="ts">
import { ref, reactive, onMounted, inject, onBeforeUnmount } from 'vue'
import { showSuccessToast, showFailToast, showToast } from 'vant';
import { useUserStore } from '@/stores/user';

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

  tabs: ["资金明细", "提现记录", "押金记录"],
  activeIndex: 0,
  sliderOffset: 0,
  sliderLeft: 0,
  cashlogs: [],
  withDrawlogs: [],
  depositlogs: [],

  rechargeOpen: false // 是否开启充值[预存]功能
})

const tabClick = () => {

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

const depositlogs = async () => {
  let res = await WEBAPI.depositList({
    token: wx.getStorage('token'),
    page: 1,
    pageSize: 50
  })
  if (res.code == 0) {
    data.depositlogs = res.data.result
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
  if (activeIndex == 2) {
    depositlogs()
  }
}

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
  <view class="asset">
    <view class='item'>
      <view>可用余额(元)</view>
      <view>{{ data.balance }}</view>
    </view>
    <view class='item'>
      <view>冻结金额(元)</view>
      <view>{{ data.freeze }}</view>
    </view>
    <view class='item right'>
      <view>累计消费(元)</view>
      <view>{{ data.totleConsumed }}</view>
    </view>
  </view>
  <view class='btn-view'>
    <form bindsubmit="recharge" report-submit="true">
      <button class="btn" size="mini" form-type="submit" hover-class="btn-hover" plain="true">
        充值
      </button>
    </form>
    <form bindsubmit="payDeposit" report-submit="true">
      <button class='btn' size="mini" form-type="submit" hover-class="btn-hover" plain="true">
        押金
      </button>
    </form>
    <form bindsubmit="withdraw" report-submit="true">
      <button class='btn' size="mini" form-type="submit" hover-class="btn-hover" plain="true">
        提现
      </button>
    </form>
  </view>
  <van-tabs :active="data.activeIndex" @change="tabClick">
    <van-tab v-for="item in data.tabs" :key="item" :title="item" />
  </van-tabs>
  <van-cell-group v-if="data.activeIndex == 0">
    <van-empty v-if="!data.cashlogs" description="暂无资金明细" />
    <van-cell v-for="(item, index) in data.cashlogs" :key="index" :title="item.typeStr" :label="item.dateAdd"
      :value="item.amount" />
  </van-cell-group>
  <van-cell-group v-if="data.activeIndex == 1">
    <van-empty v-if="!data.withDrawlogs" description="暂无提现记录" />
    <van-cell v-for="(item, index) in data.withDrawlogs" :key="index" :title="item.statusStr" :label="item.dateAdd"
      :value="item.money" />
  </van-cell-group>
  <van-cell-group v-if="data.activeIndex == 2">
    <van-empty v-if="!data.depositlogs" description="暂无押金记录" />
    <van-cell v-for="(item, index) in data.depositlogs" :key="index" :title="item.statusStr" :label="item.dateAdd"
      :value="item.amount" />
  </van-cell-group>
</template>

<style scoped lang="scss">
.asset {
  display: flex;
  padding-top:50rpx;
  height: 150rpx;
  background-color: #e85654;
}
.asset .item {
  display: flex;
  flex-direction: column;
  width:250rpx;
  text-align: center;
  font-size: 14px;
  line-height: 30px;
  color:#fff;
}

.btn-view {
  height: 88rpx;
  background-color: #e85654;
  padding-right:40rpx;
  padding-bottom:30rpx;  
  width: 100vw;
  display: flex;
  flex-direction: row-reverse;
}
.btn-view .btn {
  border-color: #fff !important;
  color:#fff !important;
  margin-right:20rpx;  
}

.btn-hover {
  border-color: #fff;
  color:#fff;
}

.no-data {
  margin-top: 100rpx;
  text-align: center;
  font-size: 13px;
  color:#ccc;
}

.cashlogs {
  display: flex;
  font-size: 12px;
  margin-top: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
  line-height: 20px;
}
.cashlogs .profile {
  width:600rpx;
  padding-left: 30rpx;
}
.cashlogs .amount {
  width:150rpx;
}
</style>