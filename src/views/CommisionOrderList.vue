<script setup lang="ts">
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { showLoadingToast, showToast, showFailToast, showConfirmDialog } from 'vant';

const router = useRouter()
const route = router.currentRoute.value
const user = useUserStore()
const $WEBAPI: any = inject('$WEBAPI')
const WEBAPI = $WEBAPI
const wx: any = inject('wx')

const data = reactive<any>({
  orderList: [],
  userInviter: [],
  dateBegin: undefined,
  dateEnd: undefined,
  sellerMobile: undefined
})
const getCommisionLog = async () => {
  const postData = {
    token: wx.getStorage('token'),
    dateAddBegin: data.dateBegin ? data.dateBegin : '',
    dateAddEnd: data.dateEnd ? data.dateEnd : '',
    sellerMobile: data.sellerMobile ? data.sellerMobile : ''
  }
  let res = await WEBAPI.fxCommisionLog(postData)
  if (res.code == 0) {
    const goodsMap = res.data.goodsMap
    const commisionLog = res.data.result
    if (goodsMap) {
      res.data.orderList.forEach((ele: any) => {
        const _goods = goodsMap[ele.id] // 该订单下的商品列表
        if (_goods) {
          let totalCommision = 0
          _goods.forEach((c: any) => {
            const commisionRecord = commisionLog.find((d: any) => {
              return d.orderId == ele.id && d.goodsName == c.goodsName //  FIXME 要么根据销售额，还是别的来匹配返佣记录
            })
            if (commisionRecord) {
              totalCommision += commisionRecord.money
              c.commisionRecord = commisionRecord
              ele.buyerUserNick = commisionRecord.nicks ? commisionRecord.nicks : '用户' + commisionRecord.uids
            }
          })
          ele.goodsList = _goods
          ele.totalCommision = totalCommision
        }
      })
    }
    data.commisionLog = commisionLog
    data.orderList = res.data.orderList
    data.logisticsMap = res.data.logisticsMap
    data.goodsMap = goodsMap
    data.aggregate = res.data.aggregate
    data.userInviter = res.data.userInviter
  } else {
    data.commisionLog = []
    data.orderList = []
    data.logisticsMap = []
    data.goodsMap = []
  }
}
onMounted(() => {
  getCommisionLog()
})
</script>

<template>
  <div class="page">
    <div class="container">
      <van-empty v-if="!data.orderList || data.orderList.length == 0" description="暂无订单" />
      <div class="order-list" :hidden="data.orderList.length > 0 ? false : true">
        <div class="a-order" v-for="item in data.orderList" :key="item.id">
          <van-cell :title="'订单号：' + item.orderNumber" :value="item.statusStr" :label="'购买用户:' + item.buyerUserNick"
            title-style="flex:3" />
          <van-card v-for="g in item.goodsList" :key="g.id" :num="g.number" :price="g.amountSingle" desc=""
            :title="g.goodsName" :thumb="g.pic" centered>
            <div slot="bottom" style="color: #ee0a24;">
              {{ g.commisionRecord.bili }}% 返佣
              {{ g.commisionRecord.money }} {{ g.commisionRecord.unit == 0 ? '元' : '积分' }}
              <text v-if="g.commisionRecord.isSettlement"
                style="color: green;margin-left: 10px;font-size: 14px;">已结算</text>
              <text v-else-if="item.status != -1" style="color: gray;margin-left: 10px;font-size: 14px;">待结算</text>
            </div>
          </van-card>
          <div class="goods-price">
            共 {{ item.goodsNumber }} 件商品 合计：
            <text class="p" v-if="item.score <= 0">¥ {{ item.amountReal }}</text>
            <text class="p" v-if="item.score > 0">¥ {{ item.amountReal }} + {{ item.score }} 积分</text>
            ，累计佣金 <text class="p" v-if="item.score <= 0">{{ item.totalCommision }}</text>
          </div>
          <van-cell v-if="item.goodsList && item.goodsList.length && data.userInviter[item.goodsList[0].commisionRecord.uids]"
            title="销售员:{{ userInviter[item.goodsList[0].commisionRecord.uids].nick }}" />
          <div class="goods-info">
            <div class="goods-des">
              <div class="remark" v-if="item.remark && item.remark != ''">{{ item.remark }}</div>
              <div style="font-size: 24rpx;color: #666;">下单日期：{{ item.dateAdd }} </div>
            </div>
          </div>
        </div>
      </div>
      <div class="safeAreaOldMarginBttom safeAreaNewMarginBttom"></div>
    </div>

  </div>
</template>

<style scoped lang="scss">
.page {
  background-color: #f5f5f5;
}

.container {
  width: 100%;
  background-color: #F5f5f5;
}

.status-box {
  width: 100%;
  height: convertRpxToVw(88);
  line-height: convertRpxToVw(88);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
}

.status-box .status-label {
  width: convertRpxToVw(150);
  height: 100%;
  text-align: center;
  font-size: convertRpxToVw(28);
  color: #353535;
  box-sizing: border-box;
  position: relative;
}

.status-box .status-label.active {
  color: #393640;
  border-bottom: convertRpxToVw(6) solid #393640;
}

.order-list {
  width: 100%;
}

.order-list .a-order {
  width: 100%;
  background-color: #fff;
  margin-top: convertRpxToVw(20);
}

.a-order .goods-info,
.goods-img-container {
  width: convertRpxToVw(720);
  margin-left: convertRpxToVw(30);
  border-top: convertRpxToVw(1) solid #eee;
  padding: convertRpxToVw(30) 0;
  display: flex;
  align-items: center;
}

.goods-price {
  font-size: convertRpxToVw(26);
  width: convertRpxToVw(720);
  text-align: right;
}

.goods-price .p {
  font-size: convertRpxToVw(36);
  color: #e64340;
}

.goods-info .img-box {
  width: convertRpxToVw(120);
  height: convertRpxToVw(120);
  overflow: hidden;
  margin-right: convertRpxToVw(30);
  background-color: #f7f7f7;
}

.goods-info .img-box .goods-img,
.goods-img-container .img-box .goods-img {
  width: convertRpxToVw(120);
  height: convertRpxToVw(120);
}

.goods-info .goods-des {
  font-size: convertRpxToVw(26);
  color: #000000;
}

.goods-img-container {
  height: convertRpxToVw(180);
  box-sizing: border-box;
  white-space: nowrap;
}

.goods-img-container .img-box {
  width: convertRpxToVw(120);
  height: convertRpxToVw(120);
  overflow: hidden;
  margin-right: convertRpxToVw(20);
  background-color: #f7f7f7;
  display: inline-block;
}

.price-box {
  width: convertRpxToVw(720);
  display: flex;
  flex-direction: row-reverse;
  padding-bottom: convertRpxToVw(30);
}

.price-box .btn {
  width: convertRpxToVw(166);
  height: convertRpxToVw(60);
  box-sizing: border-box;
  text-align: center;
  line-height: convertRpxToVw(60);
  border: convertRpxToVw(1) solid #ccc;
  border-radius: convertRpxToVw(6);
  margin-left: convertRpxToVw(20);
  font-size: convertRpxToVw(26);

  width: convertRpxToVw(160);
  height: convertRpxToVw(60);
  border-radius: convertRpxToVw(30);

}

.price-box .active {
  border: convertRpxToVw(1) solid #e64340;
  color: #e64340;
}

.remark {
  color: #e64340;
  margin-bottom: convertRpxToVw(20);
}

.btn-box {
  padding: convertRpxToVw(32);
}
</style>