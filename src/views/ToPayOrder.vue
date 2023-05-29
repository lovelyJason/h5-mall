<script setup lang="ts">
import { ref, reactive, onMounted, inject, toRefs } from 'vue'
import Topbar from '@/components/Topbar.vue'
import { showSuccessToast, showFailToast, showToast, showConfirmDialog } from 'vant';
import { useRouter } from 'vue-router';
// import AUTH from '@/utils/auth.js'
import { useUserStore } from '@/stores/user';
import { wxpay } from '@/utils/wxpay'

interface GoodsItem {
  basicInfo: object
  category: object
  content: string // 商品详情html字符串
  extJson: object
  extJson2: object
  logistics: object
  pics: [],
  pics2: [],
  subPics: []
}

const router = useRouter()
const route = router.currentRoute.value

const $WEBAPI: any = inject('$WEBAPI')
const WEBAPI = $WEBAPI
const wx: any = inject('wx')

const bindMobileStatus = ref<number>(0) // 0 未判断 1 已绑定手机号码 2 未绑定手机号码
const mobile = ref<number>(0) // 0 未判断 1 已绑定手机号码 2 未绑定手机号码
const orderType = ref<string>('buyNow') // 立即下单还是购物车下单
const goodsDetail = reactive<any>({
  basicInfo: {},
  category: {},
  content: '',
  extJson: {},
  extJson2: {},
  logistics: {},
  pics: [],
  pics2: [],
  subPics: []
})
const goodsList = reactive<any[]>([])
const remark = ref<string>('')
const amountInfo = ref<any>({})
const btnLoading = ref<boolean>(false)
const preorderInfo = reactive<any>({
})


const user = useUserStore()
const isLogined = user.isLogined

const getPhoneNumber = async () => {
  router.push('/register')
}

const getGoodesDetail = async () => {
  const id = route.query.id
  const token = user.getStorage('token')
  if (orderType.value === 'buyNow') {
    const res = await WEBAPI.goodsDetail(id, token)
    if(res.code == 0) {
      const { data } = res
      Object.assign(goodsDetail, data)
      goodsList.push(data)
      return goodsDetail
    }
  }
}

const userAmount = async () => {
  const res = await WEBAPI.userAmount(user.getStorage('token'))
  if (res.code == 0) {
    Object.assign(amountInfo, res.data)
    return res.data
  }
}

const processAfterCreateOrder = (orderInfo: any) => {
  const { balance } = amountInfo
  const { amountReal, id: orderId } = orderInfo
  // 有余额
  if(balance || amountReal) {
    const money = Number.parseFloat((amountReal * 1 - balance * 1).toFixed(2))
    // 余额充足
    if(money <= 0) {
      showConfirmDialog({
        title: '请确认支付',
        message: `您当前可用余额￥${balance},使用余额支付${amountReal}`,
        cancelButtonText: '暂不付款',
        confirmButtonText: '确认支付',
      }).then(() => {
        const token = user.getStorage('token')
        WEBAPI.orderPay(token, orderId).then((payRes: any) => {
          if(payRes.code != 0) {
            showToast(payRes.msg);
            return
          }
          router.push('/order')
        })
      }).catch(() => {
        router.push('/order')
      })
    } else {
      // 余额不足
      showConfirmDialog({
        title: '请确认支付',
        message: `您当前可用余额￥${balance},仍需支付${amountReal}`,
        cancelButtonText: '暂不付款',
        confirmButtonText: '确认支付',
      }).then(() => {
        wxpay('order', money, orderId, router, "/order");

      }).catch(() => {
        router.push('/order')
      })
    }
  } else {
    // 无余额
    wxpay('order', amountReal, orderId, router, "/order");

  }

}

const createOrder = async (preorder: boolean) => {
  btnLoading.value = true
  // shopCarType: 0 //0自营购物车，1云货架购物车
  const token = user.getStorage('token') // 用户登录 token
  const goodsJsonStr = JSON.stringify(goodsList.map((goodes) => {
    return {
      goodsId: goodsDetail.basicInfo.id,
      number: 1,
      inviter_id: 0,
      logisticsType: '0', // 0 自己送货 1 快递
      goodsType: '0'
    }
  }))
  const postData = {
    token,
    goodsJsonStr,
    remark: remark.value,
    calculate: false,
    goodsType: '0', // 自营或者京东之类的
    // peisongType: this.data.peisongType, // 配送类型
    // cardId: this.data.cardId // 会员卡记录id
    // TODO: extJsonStr，可以填写联系人，联系电话啥的
  }
  if (preorder) {
    postData.calculate = true
  } else {
    // const extJsonStr = {}
  }
  try {
    const res = await WEBAPI.orderCreate(postData)
    btnLoading.value = false
    if(res.code == 0) {
      Object.assign(preorderInfo, res.data)
      if(!preorder) {
        processAfterCreateOrder(res.data)
      }
    }
  } catch (error) {
    btnLoading.value = false
  }
}

const goCreateOrder = () => {
  // 检测实名认证状态
  if(wx.getStorage('needIdCheck') == 1) {
    // 先不处理实名认证
  }
  createOrder(false)
}

onMounted(() => {
  user.checkHasLogined().then(async (isLogined: boolean) => {
    if (isLogined) {
      const token = localStorage.getItem('token')
      user.getUserApiInfo()
      await Promise.all([getGoodesDetail(), userAmount()])
      createOrder(true)
    } else {
      user.getNewToken({ code: route.query.code as string })
      // TODO:调用授权后再获取页面数据
      showFailToast({
        message: '登录失效，需要重新获取授权信息' // 只是网页授权登录
      })
      // TODO:跳到微信中转页静默授权
    }
  })
})

</script>

<template>
  <div class="page">
    <Topbar title="确认订单" v-if="isLogined" />
    <template v-if="!isLogined">
      <div class="login-box">
        <img class="logo" src="/images/wx.jpg" mode="widthFix" />
        <div class="line"></div>
        <div class="title">申请获取以下权限</div>
        <div class="profile">授权绑定手机号码</div>
        <div class="btn">
          <van-button @click="getPhoneNumber" type="primary" block round open-type="getPhoneNumber"
            bind:getphonenumber="getPhoneNumber">绑定手机号码</van-button>
        </div>
      </div>
    </template>
    <template v-else>
      <div> <!-- 立即购买 -->
        <!-- TODO:怎么往ts添加这种全局变量防止波浪线提示 -->
        <van-card 
          v-for="(item, index) in goodsList" 
          :key="index" 
          :num="1" 
          :price="$filters.numFormat(item.basicInfo.minPrice)"
          :title="item.basicInfo.name" 
          :thumb="item.pics2[item.pics2.length - 1]" 
          centered
        >
          <template #desc>
            {{ item.basicInfo.characteristic }}
          </template>
        </van-card>
      </div>
      <div class="container-box cell-group">
        <div class="peisong-way">
          <div class="row-box">
            <div class="row-label">备注</div>
            <div class="right-text">
              <van-field v-model="remark" placeholder="如需备注请输入" />
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-box"></div>
      <van-submit-bar 
        :price="preorderInfo.amountReal * 100" s
        uffix-label="" 
        button-text="提交订单" 
        :loading="btnLoading"
        @submit="goCreateOrder"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.page,
div,
img,
input,
textarea {
  display: block;
  box-sizing: border-box;
}

.page {
  background-color: #f2f2f2;
}

.address-box {
  width: 100vw;
  margin: convertRpxToVw(20) 0;
  border-bottom: convertRpxToVw(1) solid #eee;
}

.add-address {
  width: 100vw;
  display: flex;
  align-items: center;
  padding-left: convertRpxToVw(32);
}

.add-address img {
  width: convertRpxToVw(40);
  height: convertRpxToVw(40);
}

.add-address view {
  margin-left: convertRpxToVw(16);
  font-size: convertRpxToVw(28);
  color: #000;
  padding: convertRpxToVw(40) 0;
}

.show-address {
  width: convertRpxToVw(750);
  box-sizing: border-box;
  padding: 0 convertRpxToVw(32);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.show-address .name-tel {
  font-size: convertRpxToVw(28);
  color: #000;
  padding: convertRpxToVw(30) 0 convertRpxToVw(20) 0;
}

.show-address .addr-text {
  font-size: convertRpxToVw(24);
  color: #888;
  padding-bottom: convertRpxToVw(34);
  line-height: convertRpxToVw(36);
}

.show-address .next {
  width: convertRpxToVw(40);
  height: convertRpxToVw(40);
}

form {
  width: 100%;
}

.goods-list {
  width: 100%;
  background-color: #fff;
  margin-bottom: convertRpxToVw(20);
}

.goods-list .list-title {
  font-size: convertRpxToVw(28);
  color: #000;
  padding: convertRpxToVw(30) 0 convertRpxToVw(25) convertRpxToVw(30);
}

.goods-list .a-goods {
  width: convertRpxToVw(720);
  margin-left: convertRpxToVw(30);
  display: flex;
  /*justify-content: space-between;*/
  border-top: 1px solid #eee;
  padding: convertRpxToVw(30) convertRpxToVw(30) convertRpxToVw(30) 0;
}

.goods-list .a-goods .img-box {
  width: convertRpxToVw(160);
  height: convertRpxToVw(160);
  overflow: hidden;
  margin-right: convertRpxToVw(20);
  background-color: #d8d8d8;
}

.goods-list .img-box .img {
  width: convertRpxToVw(160);
  height: convertRpxToVw(160);
}

.goods-list .a-goods .text-box {
  width: convertRpxToVw(510);
  box-sizing: border-box;
  padding-top: convertRpxToVw(10);
}

.a-goods .text-box .arow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.a-goods .text-box .arow .goods-name {
  width: convertRpxToVw(360);
  font-size: convertRpxToVw(26);
  height: convertRpxToVw(74);
  color: #000;
  line-height: 1.6;
  overflow: hidden;
}

.a-goods .text-box .arow01 {
  margin-bottom: convertRpxToVw(30);
}

.a-goods .text-box .arow .goods-price {
  font-size: convertRpxToVw(26);
  color: #000;
  align-self: flex-start;
}

.a-goods .text-box .arow .goods-label {
  font-size: convertRpxToVw(26);
  color: #999;
}

.a-goods .text-box .arow .goods-num {
  font-size: convertRpxToVw(26);
  color: #999;
}

.peisong-way {
  width: 100%;
  background-color: #fff;
  margin-bottom: convertRpxToVw(20);

  .row-box {
    width: convertRpxToVw(720);
    height: 42px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    padding: convertRpxToVw(24) 0 convertRpxToVw(24) convertRpxToVw(30);
    border-bottom: convertRpxToVw(1) solid #eee;
  }
}


.peisong-way .row-label.t {
  color: #333;
}

.peisong-way .row-label {
  font-size: convertRpxToVw(28);
  color: #666;
}

.peisong-way .right-text {
  font-size: convertRpxToVw(28);
  color: #666;
  padding-right: convertRpxToVw(30);
}

.peisong-way .liuyan {
  width: convertRpxToVw(510);
  font-size: convertRpxToVw(28);
}

.goods-info {
  width: 100%;
  background-color: #fff;
  margin-bottom: convertRpxToVw(120);
  padding-bottom: convertRpxToVw(24);
}

.goods-info .row-box {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: convertRpxToVw(24) convertRpxToVw(30) 12rpx convertRpxToVw(30);
  font-size: convertRpxToVw(28);
  color: #000;
}

.goods-info .row-box .right-text {
  text-align: right;
}

.row-box .next {
  width: convertRpxToVw(40);
  height: convertRpxToVw(40);
}

.jiesuan-box {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: convertRpxToVw(100);
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) / 2);
  left: 0;
  border-top: 1px solid #eee;
  background-color: #fff;
  z-index: 999;
}

.jiesuan-box .to-pay-btn {
  width: convertRpxToVw(250);
  text-align: center;
  height: 100%;
  line-height: convertRpxToVw(100);
  background-color: #e64340;
  font-size: convertRpxToVw(32);
  color: #fff;
  border-radius: 0;
}

.jiesuan-box .left-price {
  display: flex;
  width: convertRpxToVw(500);
  justify-content: flex-end;
  line-height: convertRpxToVw(100);
  padding: 0 convertRpxToVw(30) 0 0;
  font-size: convertRpxToVw(28);
  box-sizing: border-box;
}

.jiesuan-box .total {
  color: #e64340;
  text-align: right;
}

.box-v2 {
  width: 100vw;
}

.bottom-box {
  height: convertRpxToVw(120);
}

.cell-group {
  margin-top: convertRpxToVw(16);
}


.login-box .logo {
  width: convertRpxToVw(200, false);
  margin: convertRpxToVw(64) convertRpxToVw(275);
}

.login-box .line {
  height: convertRpxToVw(2);
  width: convertRpxToVw(686);
  background-color: #ebedf0;
  margin: 0 convertRpxToVw(32);
}

.login-box .title {
  margin: convertRpxToVw(64) 0 0 convertRpxToVw(32);
  color: #333;
  font-size: convertRpxToVw(36);
}

.login-box .profile {
  margin: convertRpxToVw(32) 0 0 convertRpxToVw(32);
  color: #999;
  font-size: convertRpxToVw(28);
}

.login-box .btn {
  margin: convertRpxToVw(200) convertRpxToVw(32);

  .van-button {
    background-color: #07c160;
    border: none;
  }
}
</style>