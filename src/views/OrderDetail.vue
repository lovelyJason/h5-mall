<script setup lang="ts">
import { ref, reactive, onMounted, inject, computed } from 'vue'
import Topbar from '@/components/Topbar.vue'
import { useRouter } from 'vue-router';
import { showSuccessToast, showLoadingToast, showToast, showFailToast, showConfirmDialog } from 'vant';
import { useUserStore } from '@/stores/user';
// @ts-ignore
import { redirectToWechatAuth } from '@/utils/index'

const $WEBAPI: any = inject('$WEBAPI')
const WEBAPI = $WEBAPI
const wx: any = inject('wx')
const user = useUserStore()
const router = useRouter()
const route = router.currentRoute.value


const data = reactive<Record<string, any>>({
  orderId: null,
  orderDetail: {
    orderInfo: {},
    goodsCoupons: [],
    logistics: {},
    logisticsTraces: []
  }
})

const getOrderDetail = async () => {
  const res = await WEBAPI.orderDetail(wx.getStorage('token'), data.orderId)
  if(res.code !== 0) {
    showConfirmDialog({
      title: '错误',
      showCancelButton: false,
      message: res.msg
    })
    return
  }
  // 子快递单信息
  if (res.data.orderLogisticsShippers) {
    res.data.orderLogisticsShippers.forEach((ele: any) => {
      if (ele.traces) {
        ele.tracesArray = JSON.parse(ele.traces)
        if (ele.tracesArray && ele.tracesArray.length > 0) {
          ele.tracesLast = ele.tracesArray[ele.tracesArray.length - 1].AcceptStation + '\n' + ele.tracesArray[ele.tracesArray.length - 1].AcceptTime
        }
      }
    })
  }
  data.orderDetail = res.data
}

onMounted(() => {
  let orderId = route.query.id
  data.orderId = orderId
  getOrderDetail()
})
  ; (function test() {
    // data.hasMoreSelect = true 
    // data.goodsDetailSkuShowType = 0
    // data.goodsDetail.properties = [{id: 1, name: '11'},{id: 2, name: '22'}]
    // data.goodsAddition = [{id: 1, name: '33'},{id: 2, name: '55'}]
  }())
</script>

<template>
  <div class="page">
    <div class="container">
      <div class="sec-wrap">
        <div class="order-status">
          <div class="icon-box">
            <img v-if="data.orderDetail.orderInfo.status ==- 1" class="icon" src="/images/order-details/icon-ddgb.png" />
            <img v-else-if="data.orderDetail.orderInfo.status == 0" class="icon" src="/images/order-details/icon-ddfk.png" />
            <img v-else-if="data.orderDetail.orderInfo.status == 1" class="icon" src="/images/order-details/icon-ddfh.png" />
            <img v-else-if="data.orderDetail.orderInfo.status == 2" class="icon" src="/images/order-details/icon-ddsh.png" />
            <img v-else-if="data.orderDetail.orderInfo.status == 3 || data.orderDetail.orderInfo.status == 4" class="icon" src="/images/order-details/icon-jycg.png" />
          </div>
          <div class="right-text">
            <div class="status red">{{ data.orderDetail.orderInfo.statusStr }}</div>
            <div class="des" hidden="true">请于11时59分59秒内付款，超时订单将自动关闭</div>
          </div>
        </div>
        <template v-if="data.orderDetail.logistics">
          <div v-if=" data.orderDetail.logisticsTraces && data.orderDetail.logisticsTraces.length" class="wuliu-box">
            <div class="icon-box">
              <img class="icon" src="/images/order-details/icon-wuliu.png" />
            </div>
            <div class="right-text" bindtap="wuliuDetailsTap" :data-id="data.orderDetail.orderInfo.id">
              <div class="order-number">快递单号：{{ data.orderDetail.logistics.trackingNumber }}</div>
              <template v-if="data.orderDetail.logisticsTraces">
                <div class="wuliu-text">
                  {{ data.orderDetail.logisticsTraces[data.orderDetail.logisticsTraces.length - 1].AcceptStation }}</div>
                <div class="wuliu-date">{{ data.orderDetail.logisticsTraces[data.orderDetail.logisticsTraces.length - 1].AcceptTime }}
                </div>
              </template>
            </div>
            <div class="arrow-right">
              <van-icon name="arrow" />
            </div>
          </div>
          <div v-else class="wuliu-box">
            <div class="icon-box">
              <img class="icon" src="/images/order-details/icon-wuliu.png" />
            </div>
            <div class="right-text">
              <div class="order-number">快递单号：{{ data.orderDetail.logistics.trackingNumber }}</div>
              <div class="wuliu-text">暂无物流信息</div>
            </div>
          </div>
          <van-cell-group
            v-if="data.orderDetail.orderLogisticsShippers && data.orderDetail.orderLogisticsShippers.length > 0">
            <van-cell v-for="item in data.orderDetail.orderLogisticsShippers" :key="item.id"
              :title="`${item.shipperName}: ${item.trackingNumber}`" :label="item.tracesLast" center is-link
            />
          </van-cell-group>
          <div class="address-sec">
            <div class="icon-box">
              <img class="icon" src="/images/order-details/icon-address.png" />
            </div>
            <div class="right-box">
              <div class="name-tel">{{ data.orderDetail.logistics.linkMan }} {{ data.orderDetail.logistics.mobile }}</div>
              <div class="text">
                {{ data.orderDetail.logistics.provinceStr }} {{ data.orderDetail.logistics.cityStr }} {{ data.orderDetail.logistics.areaStr }}
                {{ data.orderDetail.logistics.address }}
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="goods-list">
        <div class="list-title">商品信息</div>
        <form bindsubmit="submitReputation">
          <van-card 
            v-for="item in data.orderDetail.goods" :key="item.id"
            :num="item.number" 
            :price="$filters.numFormat(item.amount)" 
            :desc="item.property" 
            :title="item.goodsName" 
            :thumb="item.pic"
            centered 
          />
        </form>
      </div>
      <div class="goods-info">
        <div class="row-box">
          <div class="row-label">商品金额</div>
          <div class="right-text">¥ {{ data.orderDetail.orderInfo.amount }}</div>
        </div>
        <div class="row-box">
          <div class="row-label">运费</div>
          <div class="right-text">+ ¥ {{ data.orderDetail.orderInfo.amountLogistics }}</div>
        </div>
        <div class="row-box">
          <div class="row-label">应付总额</div>
          <div class="right-text">¥ {{ data.orderDetail.orderInfo.amountReal }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page {
  min-height: 100%;
  background-color: #F2f2f2;
}

.container {
  min-height: 100%;
  overflow: hidden;
  overflow-y: hidden;
}

.sec-wrap {
  background-color: #fff;
  margin-top: convertRpxToVw(20);
}

.bottom-fiexd {
  position: fixed;
  bottom: 0;
  left: 0;
}

.sec-wrap .order-status {
  width: convertRpxToVw(720);
  margin-left: convertRpxToVw(30);
  border-bottom: convertRpxToVw(1) solid #eee;
  height: convertRpxToVw(140);
  display: flex;
  align-items: center;
}

.order-status .icon-box {
  width: convertRpxToVw(80);
  height: convertRpxToVw(80);
  overflow: hidden;
  margin-right: convertRpxToVw(30);
}

.order-status .icon-box .icon {
  width: convertRpxToVw(80);
  height: convertRpxToVw(80);
}

.order-status .right-text {
  width: convertRpxToVw(580);
  overflow: hidden;
}

.order-status .right-text .status {
  font-size: convertRpxToVw(28);
  color: #000;
  margin-bottom: convertRpxToVw(10);
}

.order-status .right-text .red {
  color: #e64340;
}

.order-status .right-text .des {
  font-size: convertRpxToVw(24);
  color: #999;
}

.address-sec {
  width: convertRpxToVw(720);
  margin-left: convertRpxToVw(30);
  display: flex;
  align-items: center;
  padding: convertRpxToVw(30) 0;
}

.address-sec .icon-box {
  width: convertRpxToVw(30);
  align-self: flex-start;
  overflow: hidden;
  margin-right: convertRpxToVw(35);
}

.address-sec .icon-box .icon {
  width: convertRpxToVw(30);
  height: convertRpxToVw(30);
}

.address-sec .right-box {
  width: convertRpxToVw(620);
}

.address-sec .right-box .name-tel {
  font-size: convertRpxToVw(28);
  color: #000000;
  margin-bottom: convertRpxToVw(20);
}

.address-sec .right-box .text {
  font-size: convertRpxToVw(24);
  color: #888888;
  line-height: convertRpxToVw(36);
  height: convertRpxToVw(72);
  overflow: hidden;
}

.wuliu-box {
  width: convertRpxToVw(720);
  margin-left: convertRpxToVw(30);
  border-bottom: convertRpxToVw(1) solid #eee;
  display: flex;
  align-items: center;
  padding: convertRpxToVw(30) 0;
}

.wuliu-box .icon-box {
  width: convertRpxToVw(40);
  height: convertRpxToVw(40);
  overflow: hidden;
  margin-right: convertRpxToVw(31);
  align-self: flex-start;
}

.wuliu-box .icon-box .icon {
  width: convertRpxToVw(40);
  height: convertRpxToVw(40);
}

.wuliu-box .arrow-right {
  width: convertRpxToVw(15);
  height: convertRpxToVw(24);
}

.wuliu-box .arrow-right .arrow {
  width: convertRpxToVw(15);
  height: convertRpxToVw(24);
}

.wuliu-box .right-text {
  width: convertRpxToVw(575);
  margin-right: convertRpxToVw(30);
}

.wuliu-box .right-text .order-number {
  font-size: convertRpxToVw(28);
  color: #000;
  margin-bottom: convertRpxToVw(14);
}

.wuliu-box .right-text .wuliu-text,
.wuliu-box .right-text .wuliu-date {
  font-size: convertRpxToVw(24);
  color: #888888;
  line-height: convertRpxToVw(36);
}

.goods-list {
  width: 100%;
  background-color: #fff;
  margin-bottom: convertRpxToVw(20);
  margin-top: convertRpxToVw(20);
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

.goods-list .btn-row {
  width: convertRpxToVw(720);
  margin-left: convertRpxToVw(30);
  border-top: convertRpxToVw(1) solid #eee;
}

.confirm-btn {
  background: #ffffff;
  border: convertRpxToVw(1) solid #e64340;
  border-radius: convertRpxToVw(6);
  width: convertRpxToVw(164);
  height: convertRpxToVw(60);
  line-height: convertRpxToVw(60);
  margin: convertRpxToVw(20) convertRpxToVw(30) convertRpxToVw(20) auto;
  font-size: convertRpxToVw(26);
  color: #e64340;
  text-align: center;
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
  color: #000000;
  line-height: 1.6;
  overflow: hidden;
}

.a-goods .text-box .arow01 {
  margin-bottom: convertRpxToVw(30);
}

.a-goods .text-box .arow .goods-price {
  font-size: convertRpxToVw(26);
  color: #000000;
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
  padding: convertRpxToVw(24) 0;
  border-bottom: convertRpxToVw(1) solid #eee;
  margin-left: convertRpxToVw(30);
}

.peisong-way .row-label {
  font-size: convertRpxToVw(28);
  color: #000;
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
  padding-bottom: convertRpxToVw(24);
}

.goods-info .row-box {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: convertRpxToVw(24) convertRpxToVw(30) convertRpxToVw(12) convertRpxToVw(30);
  font-size: convertRpxToVw(28);
  color: #000;
}

.goods-info .row-box .right-text {
  text-align: right;
}

.jiesuan-box {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: convertRpxToVw(100);
  position: fixed;
  bottom: 0;
  left: 0;
  border-top: 1px solid #eee;
  background-color: #fff;
  z-index: 4;
}

.jiesuan-box .to-pay-btn {
  width: convertRpxToVw(250);
  text-align: center;
  height: 100%;
  line-height: convertRpxToVw(100);
  background-color: #e64340;
  font-size: convertRpxToVw(32);
  color: #ffffff;
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

.hx-title {
  text-align: center;
}

.hx-canvas {
  width: convertRpxToVw(650);
  height: convertRpxToVw(650);
  margin-left: convertRpxToVw(50);
}</style>