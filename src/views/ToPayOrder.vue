<script setup lang="ts">
import { ref, reactive, onMounted, inject, toRefs, computed, getCurrentInstance } from 'vue'
import Topbar from '@/components/Topbar.vue'
import { showSuccessToast, showFailToast, showToast, showConfirmDialog } from 'vant';
import { useRouter } from 'vue-router';
// import AUTH from '@/utils/auth.js'
import { useUserStore } from '@/stores/user';
import { wxpay } from '@/utils/wxpay'
// @ts-ignore
import { areaList } from '@vant/area-data';

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
const showArea = ref<boolean>(false)
const areaCode = ref<string>('')
const areaSelectedText = ref<string>('')
const preorderInfo = reactive<any>({
})
const data = reactive<any>({
  peisongType: 'kd',
  recipientInfo: {
    linkMan: '',
    mobile: '',
    idcard: '',
    address: ''
  },
  virtualGoodsInfo: {
    mobile: ''
  },
  areaCodeList: []
})
const isLogined = ref<boolean>(true)

let formInstance: any = null
const formRef = ref(null)

const user = useUserStore()

const getPhoneNumber = async () => {
  router.push('/register')
}

const getGoodesDetail = async () => {
  const id = route.query.id
  const token = wx.getStorage('token')
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

const onAreaConfirm = (selectedValues: any) => {
  console.log(selectedValues)
  areaSelectedText.value = selectedValues.selectedOptions?.map((val: any) => val.text).join('，')
  data.areaCodeList = selectedValues.selectedOptions?.map((val: any) => val.value)
  showArea.value = false
}

const isNeedLogistics = computed(() => {
  return goodsDetail.logistics && Object.keys(goodsDetail.logistics).length > 0
})

const userAmount = async () => {
  const res = await WEBAPI.userAmount(wx.getStorage('token'))
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
        const token = wx.getStorage('token')
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
    //TODO:0元商品 + 积分，购买时提示金额错误？
    wxpay('order', amountReal, orderId, router, "/order");

  }

}

const createOrder = async (preorder: boolean) => {
  btnLoading.value = true
  // shopCarType: 0 //0自营购物车，1云货架购物车
  const token = wx.getStorage('token') // 用户登录 token
  const goodsJsonStr = JSON.stringify(goodsList.map((goods) => {
    const _logistics = (goods.logistics && Object.keys(goods.logistics).length > 0) ? true : false
    return {
      goodsId: goodsDetail.basicInfo.id,
      number: 1,
      // inviter_id: 0,  // 邀请用户ID, 这个对应的是后台营销辅助/分享奖励。和分销无关 https://www.it120.cc/help/uzf2xp.html
      logisticsType: _logistics ? '1' : '0', // 0 自己送货 1 快递
      goodsType: '0'  // 0 自营商品； 1 京东vop商品; 2 京东权益商品
    }
  }))
  const postData: any = {
    token,
    goodsJsonStr,
    remark: remark.value,
    calculate: false,
    goodsType: '0', // 自营或者京东之类的
    // peisongType: this.data.peisongType, // 配送类型 ， 快递 or 到店自取
    // cardId: this.data.cardId // 会员卡记录id
  
  }
  if(isNeedLogistics.value) {
    postData.peisongType = data.peisongType
    postData.provinceId = data.areaCodeList[0]
    postData.cityId = data.areaCodeList[1]
    postData.districtId = data.areaCodeList[2]
    postData.address = data.recipientInfo.address
    postData.linkMan = data.recipientInfo.linkMan
    postData.mobile = data.recipientInfo.mobile
    postData.idcard = data.recipientInfo.idcard
  } else {
    postData.mobile = data.virtualGoodsInfo.mobile
  }

  if (preorder) {
    postData.calculate = true
  } else {
    // const extJsonStr = {}
    showToast({
      message: '订单提交中',
      position: 'top',
    })
  }
  try {
    /**
     * https://api.it120.cc/doc.html#/%E5%89%8D%E7%AB%AFapi%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3/%E8%AE%A2%E5%8D%95%E7%AE%A1%E7%90%86/createUsingPOST
     * https://www.yuque.com/apifm/doc/itys0m
     */
    const res = await WEBAPI.orderCreate(postData)
    btnLoading.value = false
    if(res.code == 0) {
      Object.assign(preorderInfo, res.data)
      if(!preorder) {
        processAfterCreateOrder(res.data)
      }
    } else {
      showFailToast(res.msg)
    }
  } catch (error) {
    btnLoading.value = false
  }
}

const goCreateOrder = () => {
  if(wx.getStorage('needIdCheck') == 1) {
    // 先不处理实名认证
  }
  (formRef.value as any).validate().then(() => {
    createOrder(false)
  })
  // 这里有个奇怪的问题，正式环境这里报错，formInstance.ctx.$refs undefined
  // formInstance.ctx.$refs.form.validate().then(() => {
  //   // 检测实名认证状态
  //   createOrder(false)
  // })

}

onMounted(() => {
  // formInstance = getCurrentInstance()
  wx.configByurl(location.href, ['chooseWXPay'])
  user.checkHasLogined().then(async (_isLogined: boolean) => {
    if (_isLogined) {
      isLogined.value = _isLogined
      user.getUserApiInfo()
      await Promise.all([getGoodesDetail(), userAmount()])
      await createOrder(true)
    } else {

    }
  })
})

const actions =  [
      { text: '选项一' },
      { text: '选项二' },
      { text: '选项三' },
    ]
</script>

<template>
  <div :class="{page: true, 'need-logistics': isNeedLogistics}">
    <Topbar title="确认订单" v-if="isLogined && !isInWechat" />
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
          <van-form ref="formRef" >
            <van-cell-group v-if="!!isNeedLogistics">
              <van-cell title="配送方式">
                <template #value>
                  <van-radio-group v-model="data.peisongType" bindchange="radioChange">
                    <van-radio name="kd" :checked="data.peisongType == 'kd'"> 快递</van-radio>
                  </van-radio-group>
                </template>
              </van-cell>
              <van-field
                v-model="data.recipientInfo.linkMan"
                name="linkMan"
                required
                label="姓名"
                placeholder="请输入姓名"
                :rules="[{ required: true, message: '请输入姓名' }, { pattern: /^[\u4e00-\u9fa5]{2,4}$/, message: '请输入正确格式姓名' }]"
              />
              <van-field
                v-model="data.recipientInfo.mobile"
                name="mobile"
                required
                label="联系方式"
                placeholder="请输入手机号"
                :error-message="''"
                :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确格式手机号' }]"
              />
              <van-field
                v-model="data.recipientInfo.idcard"
                name="idcard"
                required
                label="身份证号"
                placeholder="请输入身份证号"
                :rules="[{ required: true, message: '请输入身份证号' }]"
              />
              <van-cell class="area-cell"  @click="showArea = !showArea" title="收货地址" is-link error-message="111" :error="true">
                <template  #value>
                  <span v-if="!areaCode">请选择</span>
                  <span v-else>{{ areaSelectedText }}</span>
                  <van-popup
                    teleport="body"
                    required
                    round
                    v-model:show="showArea"
                    position="bottom"
                    :close-on-click-overlay="true"
                    safe-area-inset-bottom
                  >
                    <!-- <div style="height: 200px;">11</div> -->
                    <van-area v-model="areaCode" :area-list="areaList" @confirm="onAreaConfirm" @cancel="showArea = false" />
                  </van-popup>
                </template>
              </van-cell>
              <van-field
                v-model="data.recipientInfo.address"
                name="address"
                required
                label="详细地址"
                placeholder="请输入详细地址"
                :rules="[{ required: true, message: '请输入详细地址' }]"
              />
              <van-field
                v-model="remark"
                style="padding-left: 24px;"
                label="备注"
                placeholder="如需备注请输入"
              />
            </van-cell-group>
            <van-cell-group v-else>
              <van-field
                v-model="data.virtualGoodsInfo.mobile"
                name="rechargeMobile"
                required
                label="充值手机"
                placeholder="请输入充值手机号"
                :error-message="''"
                :rules="[{ required: true, message: '请输入充值手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确格式手机号' }]"
              />
              <van-field
                v-model="remark"
                style="padding-left: 24px;"
                label="备注"
                placeholder="如需备注请输入"
              />
            </van-cell-group>
          </van-form>

        </div>
      </div>
      <div v-if="!isNeedLogistics" class="card recharge-explain">
        <van-icon class="icon-desc" name="description"></van-icon>
        <span class="title">充值说明</span>
        <ul>
          <li>1、支持中国移动，中国电信，中国联通</li>
          <li>2、0-48小时到账</li>
          <li>3、充值失败会退款</li>
        </ul>
      </div>
      <!-- <div class="bottom-box"></div> -->
      <van-submit-bar 
        v-if="!isNeedLogistics"
        :price="preorderInfo.amountReal * 100"
        uffix-label="" 
        button-text="提交订单" 
        :loading="btnLoading"
        @submit="goCreateOrder"
      />
      <van-submit-bar 
        v-else
        uffix-label="" 
        button-text="0.01元领取，包邮到家" 
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
  box-sizing: border-box;
}

.page {
  background-color: #f2f2f2;
  &.need-logistics {
    --van-submit-bar-button-width: 200px;
    --van-submit-bar-button-width: 100%;
    // van-submit-bar
   .van-submit-bar {
      width: 100%;
    }
  }
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

.peisong-way  {
  width: 100%;
  background-color: #fff;
  margin-bottom: convertRpxToVw(20);
  .van-radio-group {
    display: flex;
    justify-content: flex-end;
    .van-radio {
      margin-right: 6px;
    }
  }
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
  .row-label.t {
    color: #333;
  }
  .row-label {
    font-size: convertRpxToVw(28);
    color: #666;
  }

  .right-text {
    font-size: convertRpxToVw(28);
    color: #666;
    padding-right: convertRpxToVw(30);
    height: 42px;
    line-height: 42px;
    display: flex;
    align-items: center;
    .van-cell {
      height: 42px;
    }

    .liuyan {
      width: convertRpxToVw(510);
      font-size: convertRpxToVw(28);
    }
  }
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

.goods-info .row-box {
  .right-text {
    text-align: right;
    
  }
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
.area-cell {
  &::before {
    margin-right: 2px;
    color: var(--van-field-required-mark-color);
    content: "*";
  }
}

// TODO: to be global
.card {
  padding: var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);
  background-color: #fff;
  .icon-desc {
    font-size: 16px;
  }
  .title {
    font-weight: 600;
    margin-left: 6px;
  }

  li {
    color: #666;
    line-height: 30px;
  }
}
</style>