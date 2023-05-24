<script setup lang="ts">
import { ref, reactive, onMounted, inject, toRefs } from 'vue'
import Topbar from '@/components/Topbar.vue'
import { showSuccessToast, showFailToast, showToast } from 'vant';

const $wxapi: any = inject('$wxapi')
const WXAPI = $wxapi

const bindMobileStatus = ref<number>(0) // 0 未判断 1 已绑定手机号码 2 未绑定手机号码
const mobile = ref<number>(0) // 0 未判断 1 已绑定手机号码 2 未绑定手机号码

bindMobileStatus.value = 2

const getPhoneNumber = () => {

}

const getUserApiInfo = async () => {
  const token = '68_KAwddxiQCUNu57ytvscdyV8-8xWDdxYFIxjpK-m9belrTzXuAxhcekeYKRb56gqd2DDcH_6hLyqDe3Fz9TD9JM9MIar-5zF3E24FmLGq9sfvr1gpe_wWHqzJH-IPBWaAJAAMH'
  const res = await WXAPI.userDetail(token) // TODO:传入用户token，小程序是wx.getStorageSync
  if (res.code == 0) {
    bindMobileStatus.value = res.data.base.mobile ? 1 : 2 // 账户绑定的手机号码状态
    mobile.value = res.data.base.mobile
  } else {
    showToast({
      position: 'top',
      message: res.msg
    })
  }
}

onMounted(() => {
  getUserApiInfo()
})

</script>

<template>
  <div class="page">
    <Topbar title="确认订单" />
    <template v-if="bindMobileStatus == 2">
      <div class="login-box">
        <img class="logo" src="/images/wx.jpg" mode="widthFix" />
        <div class="line"></div>
        <div class="title">申请获取以下权限</div>
        <div class="profile">授权绑定手机号码</div>
        <div class="btn">
          <van-button @click="getPhoneNumber" type="primary" block round open-type="getPhoneNumber" bind:getphonenumber="getPhoneNumber">绑定手机号码</van-button>
        </div>
      </div>
    </template>
    <template v-if="bindMobileStatus == 1">
      <div> <!-- 立即购买 -->
        <van-card wx:for="goodsList" wx:key="index" num="item.number" price="item.price" title="item.name"
          thumb=" item.pic " centered>
          <div slot="desc">
            item.label
            <div wx:for="item.sku" wx:for-item="option" wx:key="index">
              option.optionName:option.optionValueName
            </div>
            <div wx:for="item.additions" wx:for-item="option" wx:key="index">
              option.pname:option.name
            </div>
          </div>
        </van-card>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.page, div, img, input, textarea {
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

.goods-list  .a-goods {
  width: convertRpxToVw(720);
  margin-left: convertRpxToVw(30);
  display: flex;
  /*justify-content: space-between;*/
  border-top: 1px solid #eee;
  padding: convertRpxToVw(30) convertRpxToVw(30) convertRpxToVw(30) 0;
}

.goods-list  .a-goods .img-box {
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

.goods-list  .a-goods .text-box {
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
}

.peisong-way .row-box {
  width: convertRpxToVw(720);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: convertRpxToVw(24) 0 convertRpxToVw(24) convertRpxToVw(30);
  border-bottom: convertRpxToVw(1) solid #eee;
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

.jiesuan-box  .left-price {
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