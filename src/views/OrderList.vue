<script setup lang="ts">
import Tabbar from '@/components/Tabbar.vue'
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router';
import { showSuccessToast, showLoadingToast, showToast, showFailToast, showConfirmDialog  } from 'vant';
import { useUserStore } from '@/stores/user';
import { wxpay } from '@/utils/wxpay'

const $WEBAPI: any = inject('$WEBAPI')
const WEBAPI = $WEBAPI
const wx: any = inject('wx')
const user = useUserStore()
const router = useRouter()

const page = ref<number>(1)
const orderStatisticsInfo = reactive({})
const sphpay_open = ref<string>('0')
const payButtonClicked = ref<boolean>(false)
const data = reactive<any>({
  orderList: [],
  goodsMap: {},
  listLoading: false,
  finished: false
})

const getOrderStatistics = async () => {
  const res = await WEBAPI.orderStatistics(wx.getStorage('token'))
  if(res.code == 0) {
    Object.assign(orderStatisticsInfo, res.data)
  }
}

const getOrderList = async (loadmore: boolean, req?: Record<string ,any>) => {
  // const orderLoading = showLoadingToast({  // 覆盖了路由里的toast
  //   message: '加载中...',
  //   forbidClick: true,
  //   duration: 0
  // })
  var postData = {
    page: page.value,
    // TODO:无限加载
    pageSize: 20,
    token: wx.getStorage('token'),
    ...req
  }
  let res = await WEBAPI.orderList(postData)
  // orderLoading.close()
  if(res.code == 0) {
    if(loadmore) {
      data.orderList.push(...res.data.orderList)
      Object.assign(data.goodsMap, res.data.goodsMap)
    } else {
      data.orderList = res.data.orderList
      data.goodsMap = res.data.goodsMap
    }

  }
}

const loadList = async () => {
  page.value++
  await getOrderList(true, {page: page.value})
  data.listLoading = false
  data.finished = true
}

const cancelOrderClick = (e: any) => {
  const orderId = e.currentTarget.dataset.id;
  showConfirmDialog({
    title: '确定要取消该订单吗？'
  }).then(async () => {
    const res = await WEBAPI.orderClose(wx.getStorage('token'), orderId)
    if(res.code == 0) {
      page.value = 1
      showSuccessToast('取消成功')
      getOrderList(false)
      getOrderStatistics()
    }
  })
}

const payHelper = (orderId: number, money: number) => {
  if (money <= 0) {
    // 直接使用余额支付
    WEBAPI.orderPay(wx.getStorage('token'), orderId).then(function (res: any) {
      page.value = 1
      getOrderList(false)
      getOrderStatistics()
    })
  } else {
    wxpay('order', money, orderId, router, () => {
      getOrderList(false)
      getOrderStatistics()
    });
  }
}

const onPayClick = async (e: any) => {
  if(payButtonClicked.value) {
    showToast('休息一下吧')
    return
  }
  payButtonClicked.value = true
  setTimeout(() => {
    payButtonClicked.value = false
  }, 3000)
  const orderId = e.currentTarget.dataset.id;
  let money = e.currentTarget.dataset.money;
  const needScore = e.currentTarget.dataset.score;
  let res = await WEBAPI.userAmount(wx.getStorage('token'))
  if(res.code == 0) {
    const order_pay_user_balance = wx.getStorage('order_pay_user_balance')
    const amountInfo = res.data
    if (order_pay_user_balance != '1') {
      amountInfo.balance = 0
    }
    if(amountInfo.score < needScore) {
      showFailToast('您的积分不足，无法支付')
      return
    }
    let _msg = '订单金额: ' + money +' 元'
    if (amountInfo.balance > 0) {
      _msg += ',可用余额为 ' + amountInfo.balance +' 元'
      if (money - amountInfo.balance > 0) {
        _msg += ',仍需微信支付 ' + (money - amountInfo.balance).toFixed(2) + ' 元'
      }          
    }
    if (needScore > 0) {
      _msg += ',并扣除 ' + needScore + ' 积分'
    }
    money = money - amountInfo.balance
    showConfirmDialog({
      title: '请确认支付',
      cancelButtonText: '取消支付',
      confirmButtonText: '确认支付',
    }).then(() => {
      payHelper(orderId, money)
    })

  } else {
    showFailToast('无法获取用户资金信息')
  }

}

const gotoOrderDetail = (id: any) => {
  router.push('/order-detail?id=' + id)
}

onMounted(() => {
  wx.configByurl(location.href, ['chooseWXPay'])
  getOrderStatistics()
  getOrderList(false)
  sphpay_open.value = wx.getStorage('sphpay_open')
})
</script>

<template>
  <van-empty v-if="data.orderList.length <= 0" description="暂无订单" />
  <div v-else class="order-list">
    <div class="a-order">
      <van-list
        v-model:loading="data.listLoading"
        :finished="data.finished"
        finished-text="没有更多了"
        @load="loadList"
      >
        <div v-for="order in data.orderList" :key="order.id" class="order-item">
          <!-- <van-cell @click="gotoOrderDetail(order.id)" :title="order.orderNumber" :value="order.statusStr" size="large" /> -->
          <van-cell is-link>
            <template #title>
              <div style="display: flex;align-items: center;" @click="gotoOrderDetail(order.id)">
                <span style="margin-right: 8px;" class="custom-title">{{ order.orderNumber }}</span>
                <svg t="1687507035250" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1298" id="mx_n_1687507035250" width="16" height="16z  "><path d="M692.906667 887.466667H296.96c-34.133333 0-61.44-27.306667-61.44-61.44 0-44.373333 34.133333-81.92 78.506667-88.746667l174.08-27.306667-296.96-296.96c-30.72-30.72-30.72-78.506667 0-109.226666 30.72-30.72 81.92-30.72 112.64 0l81.92 81.92c3.413333-13.653333 10.24-27.306667 20.48-40.96 27.306667-27.306667 78.506667-30.72 105.813333-3.413334 3.413333-13.653333 10.24-27.306667 20.48-40.96 27.306667-27.306667 78.506667-27.306667 105.813333 0 3.413333-13.653333 10.24-27.306667 20.48-40.96 30.72-30.72 81.92-30.72 109.226667 0l160.426667 177.493334c37.546667 40.96 61.44 98.986667 61.44 153.6 0 61.44-23.893333 119.466667-68.266667 163.84l-68.266667 68.266666c-40.96 40.96-98.986667 64.853333-160.426666 64.853334zM249.173333 314.026667c-10.24 0-20.48 3.413333-30.72 13.653333-17.066667 17.066667-17.066667 44.373333 0 61.44l320.853334 320.853333c3.413333 3.413333 6.826667 10.24 3.413333 17.066667s-6.826667 10.24-13.653333 10.24l-204.8 34.133333c-30.72 3.413333-51.2 27.306667-51.2 54.613334 0 17.066667 10.24 27.306667 23.893333 27.306666h395.946667c51.2 0 102.4-20.48 139.946666-58.026666l68.266667-68.266667c37.546667-37.546667 58.026667-85.333333 58.026667-139.946667 0-47.786667-17.066667-95.573333-51.2-133.12l-160.426667-174.08c-13.653333-13.653333-44.373333-17.066667-61.44 0s-17.066667 44.373333 0 61.44l3.413333 3.413334c6.826667 6.826667 6.826667 17.066667 0 23.893333-6.826667 6.826667-17.066667 6.826667-23.893333 0l-44.373333-44.373333c-17.066667-17.066667-44.373333-17.066667-61.44 0s-17.066667 44.373333 0 61.44l44.373333 44.373333c6.826667 6.826667 6.826667 17.066667 0 23.893333s-17.066667 6.826667-23.893333 0L532.48 409.6l-40.96-40.96c-17.066667-17.066667-44.373333-17.066667-61.44 0s-17.066667 44.373333 0 61.44l88.746667 88.746667c6.826667 6.826667 6.826667 17.066667 0 23.893333s-17.066667 6.826667-23.893334 0l-88.746666-88.746667-126.293334-126.293333c-10.24-6.826667-20.48-13.653333-30.72-13.653333z" fill="#00a5f5" p-id="1299"></path><path d="M150.186667 498.346667h-6.826667c-68.266667-30.72-109.226667-98.986667-109.226667-170.666667C34.133333 221.866667 119.466667 136.533333 221.866667 136.533333c75.093333 0 139.946667 44.373333 170.666666 109.226667 3.413333 10.24 0 17.066667-10.24 23.893333-10.24 3.413333-17.066667 0-23.893333-10.24C337.92 204.8 279.893333 170.666667 221.866667 170.666667 136.533333 170.666667 68.266667 238.933333 68.266667 324.266667c0 61.44 34.133333 116.053333 92.16 139.946666 6.826667 3.413333 10.24 13.653333 6.826666 23.893334-3.413333 3.413333-10.24 10.24-17.066666 10.24z" fill="#00a5f5" p-id="1300"></path></svg>
              </div>
            </template>
          </van-cell>
          <div class="goods-img-container">
            <div v-for="(item, index) in data.goodsMap[order.id]" :key="index" class="img-box">
              <img :src="item.pic" >
            </div>
          </div>
          <div class="goods-price">共 {{ order.goodsNumber }} 件商品 合计：
            <span v-if="order.score <= 0" class="price">¥ {{ order.amountReal }}</span>
            <span v-else class="price">¥ {{ order.amountReal }} + {{ order.score }} 积分</span>
          </div>
          <div class="goods-info">
            <div class="goods-des">
              {{ order.dateAdd }}
            </div>
          </div>
          <div class="price-box">
            <div v-if="order.status == 0" @click="cancelOrderClick" class="btn"  :data-id="order.id">取消订单</div>
            <div v-if="order.status == 0" @click="onPayClick" class="btn active"  :data-id="order.id" :data-money="order.amountReal" :data-score="order.score">马上付款</div>
            <div v-if="order.status == 0 && sphpay_open == '1'" class="btn active" :data-id="order.id" :data-money="order.amountReal" :data-score="order.score">视频号支付</div>
            <!-- <div class="btn active" :hidden="order.status == 0 || order.status == -1" :data-id="order.id" :data-amount='order.amountReal'>退换货</div> -->
          </div>
        </div>
      </van-list>
    </div>
  </div>

  <Tabbar />
  
</template>

<style scoped lang="scss">
.order-list {
  padding-top: 20px;
  padding-bottom: 50px;
  --van-cell-large-title-font-size: 14px;
}
.order-item {
  width: 100%;
  background-color: #fff;
  margin-bottom: 20px;
  overflow: hidden;
  /* 解决垂直下边距塌陷 */
}
.goods-img-container {
  margin-left: 16px;
  border-top: 1px solid #eee;
  padding: 30px 0;
  display: flex;
  align-items: center;
  white-space: nowrap;
}
.img-box {
  width: 50px;
  height: 50px;
  overflow: hidden;
  margin-right: 20px;
  background-color: #f7f7f7;
  display: inline-block;
  img {
    width: 100%;
    height: 100%;
  }
}
.goods-price {
  width: 96%;
  font-size: 14px;
  text-align: right;
  margin-bottom: 10px;
}
.price {
  font-size: 16px;
  color: #e64340;
}
.goods-info {
  width: 96%;
  margin-left: 4%;
  border-top: 1px solid #eee;
  padding: 4% 0;
  display: flex;
  align-items: center;
}
.goods-des {
  font-size: 12px;
  color: #000000;
}

.price-box{
  width: convertRpxToVw(720);
  display: flex;
  flex-direction:row-reverse;
  padding-bottom: convertRpxToVw(30);
}
.price-box .btn{
  width: convertRpxToVw(166);
  height: convertRpxToVw(60);
  box-sizing: border-box;
  text-align: center;
  line-height: convertRpxToVw(60);
  border: convertRpxToVw(1) solid #ccc;
  border-radius: convertRpxToVw(6);
  margin-left: convertRpxToVw(20);
  font-size: convertRpxToVw(26);
}
.price-box .active{
  border:1px solid #e64340;
  color: #e64340;
}
</style>