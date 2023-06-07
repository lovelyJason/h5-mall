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

const data = reactive<any>({
  createTabs: false,
  active: '', // 滑动时候的tab name
  tabs: [],
  goodsId: null,
  goodsDetail: {
    basicInfo: {},
    properties: []
  },
  selectSizePrice: null,
  selectSizeOPrice: null,
  showShopPopup: false,
  hasMoreSelect: false,
  goodsDetailSkuShowType: null,
  buyNumber: 1,
  buyNumMin: 1,
  buyNumMax: Infinity,
  shopType: null,
  shopSubdetail: {
    info: {}
  },
  curGoodsKanjia: false,
  posterShow: true,
  canvasstyle: {},
  faved: true,
  skuGoodsPic: '',
  curuid: null,
  totalScoreToPay: null,
  showposterImg: false,
  posterImg: ''
})
const isLogined = ref<boolean>(false)

const readConfigVal = () => {
  // 读取系统参数
  const tabs = [{
    tabs_name: '商品简介',
    view_id: 'swiper-container',
    topHeight: 0
  }, {
    tabs_name: '商品详情',
    view_id: 'goods-des-info',
    topHeight: 0,
  }]
  data.tabs = tabs
}

const setData = (_data: any) => {
  for(let key in _data) {
    data[key] = _data[key]
  }
}

const getGoodsDetail = async (goodsId: string | number | null) => {
  const token = wx.getStorage('token')
  const goodsDetailRes = await WEBAPI.goodsDetail(goodsId, token ? token : '')
  if (goodsDetailRes.code == 0) {
    if (!goodsDetailRes.data.pics || goodsDetailRes.data.pics.length == 0) {
      goodsDetailRes.data.pics = [{
        pic: goodsDetailRes.data.basicInfo.pic
      }]
    }
    if (goodsDetailRes.data.properties) {
      data.hasMoreSelect = true
      data.selectSizePrice = goodsDetailRes.data.basicInfo.minPrice
      data.selectSizeOPrice = goodsDetailRes.data.basicInfo.originalPrice
      data.totalScoreToPay = goodsDetailRes.data.basicInfo.minScore
    }
    data.goodsDetail = goodsDetailRes.data
    let _data = {
      goodsDetail: goodsDetailRes.data,
      selectSizePrice: goodsDetailRes.data.basicInfo.minPrice,
      selectSizeOPrice: goodsDetailRes.data.basicInfo.originalPrice,
      totalScoreToPay: goodsDetailRes.data.basicInfo.minScore,
      buyNumMax: goodsDetailRes.data.basicInfo.stores,
      buyNumber: (goodsDetailRes.data.basicInfo.stores > 0) ? 1 : 0
    }
    setData(_data)
  }
}

const goodsAddition = async () => {
  const res = await WEBAPI.goodsAddition(data.goodsId)
  if (res.code == 0) {
    setData({
      goodsAddition: res.data,
      hasMoreSelect: true,
    })
  }
}

const gotoPayOrder = (id: string | number) => {
  if(isLogined.value) {
    router.push('/to-pay-order?id=' + id)
  } else {
    showToast('您还未登录，正在为您登录...') // 路由守卫里的下单页需要权限，会处理登录的
    router.push('/to-pay-order?id=' + id)
    // router.push('/mine?id=' + id)
  }
}

const openCustomerService = () => {
  showToast('开发中')
}

const shareGoods = () => {
  showToast('开发中')
  // wx.updateAppMessageShareData({ 
  //   title: '我分享了一个商品', // 分享标题
  //   desc: '进来购买', // 分享描述
  //   link: 'https://mall.qdovo.com', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
  //   imgUrl: 'https://cdn.qdovo.com/img/timg.jpeg', // 分享图标
  //   success: function () {
  //     // 设置成功
  //   }
  // })
}

onMounted(() => {
  wx.configByurl(location.href, ['updateAppMessageShareData'])
  // 商品id携带在query.id
  // 读取分享链接中的邀请人编号,但是如果之前已经被邀请过了还是不用再换绑了
  // TODO:如果用户在后台没有数据，为其注册，并绑定邀请人
  if (route.query && route.query.inviter_id) {
    wx.setStorage('referrer', route.query.inviter_id)
  }
  // TODO:路由导航守卫里每次跳转都会checkToken，这里不再调了，全局获取登录状态
  user.checkHasLogined().then(async (_isLogined: boolean) => {
    isLogined.value = _isLogined
    if (_isLogined) {
    } else {
    }
  })
  data.goodsId = route.query.id
  let goodsDetailSkuShowType = wx.getStorage('goodsDetailSkuShowType')
  if (!goodsDetailSkuShowType) {
    goodsDetailSkuShowType = 0
  }
  data.goodsDetailSkuShowType = goodsDetailSkuShowType
  data.curuid = wx.getStorage('uid')
  readConfigVal()
  getGoodsDetail(data.goodsId)
  goodsAddition()
})
;(function test() {
  // data.hasMoreSelect = true 
  // data.goodsDetailSkuShowType = 0
  // data.goodsDetail.properties = [{id: 1, name: '11'},{id: 2, name: '22'}]
  // data.goodsAddition = [{id: 1, name: '33'},{id: 2, name: '55'}]
}())
</script>

<template>
  <div class="page">
    <Topbar title="商品详情" v-if="!isInWechat" />
    <div class="container">
      <van-sticky v-if="data.createTabs">
        <div id="tabs" class="tabs-container">
          <van-tabs sticky bind:click="onTabsChange" custom-class="" :active="data.active">
            <van-tab v-for="item in data.tabs" :title="item.tabs_name" :name="item.tabs_name" />
          </van-tabs>
        </div>
      </van-sticky>
      <!-- 这是一段scroll-view -->
      <div style="overflow: scroll" class="scroll-container"  bindscroll="bindscroll">
        <div class="swiper-container" id="swiper-container">
          <!-- 这是一段轮播图 -->
  
          <van-swipe class="swiper_box" :autoplay="3000" indicator-color="white">
            <van-swipe-item v-for="item in data.goodsDetail.pics" :key="item.id">
              <img :src="item.pic" class="slide-image" mode="aspectFill" lazy-load="true" bindtap="previewImage2"
                :data-url="item.pic" />
            </van-swipe-item>
          </van-swipe>
          <!-- <swiper class="swiper_box" indicator-dots="true" indicator-active-color="#fff"
            autoplay="!data.goodsDetail.basicInfo.videoId" circular>
            <swiper-item wx:if="goodsDetail.basicInfo.videoId">
              <video src="videoMp4Src" autoplay="true" loop="true" style='width:100%;height:100%;'></video>
            </swiper-item>
            <swiper-item wx:for="goodsDetail.pics" wx:key="id">
              <image src="item.pic" class="slide-image" mode="aspectFill" lazy-load="true" bindtap="previewImage2"
                data-url="item.pic" />
            </swiper-item>
          </swiper> -->
        </div>
        <div class="goods-info">
          <div class="goods-info-top-container">
            <div class="goods-profile">
              <div class="p"><text>¥</text> {{ data.selectSizePrice }}</div>
              <div v-if="data.goodsDetail.basicInfo.originalPrice && data.goodsDetail.basicInfo.originalPrice > 0"
                class="goods-price" style="color:#aaa;text-decoration:line-through;padding: 15rpx 0rpx 0rpx 15rpx;">
                <span>¥</span> {{ data.selectSizeOPrice }}
              </div>
            </div>
            <div class="goods-info-fx">
              <!-- TODO:分享无效 -->
              <!-- <div class='item left' @click="shareGoods">
                <van-icon name="share-o" size="24px" />
                <div class="icon-title">分享</div>
                <button></button>
              </div> -->
              <!-- <div class='item' bindtap="drawSharePic">
                <van-icon name="qr" size="24px"/>
                <div class="icon-title">二维码</div>            
              </div> -->
            </div>
          </div>
          <div class="goods-title">{{ data.goodsDetail.basicInfo.name }}</div>
          <div class="characteristic">{{ data.goodsDetail.basicInfo.characteristic }}</div>
          <div class="goods-share" v-if="data.goodsDetail.basicInfo.commissionType == 1">分享有赏，好友下单后可得
            {{ data.goodsDetail.basicInfo.commission }} 积分奖励</div>
          <div class="goods-share" v-if="data.goodsDetail.basicInfo.commissionType == 2">分享有赏，好友下单后可得
            {{ data.goodsDetail.basicInfo.commission }}元 现金奖励</div>
        </div>
  
        <div class="goods-des-info" id="goods-des-info">
          <div class="label-title">
            <div class="left">商品详情</div>
          </div>
          <div class="goods-text">  
            <div v-html="data.goodsDetail.content"></div>
          </div>
        </div>
      </div>
      <van-action-bar v-if="!data.curGoodsKanjia">
        <!-- TODO:路径跳转 -->
        <van-action-bar-icon icon="home-o" text="首页" @click="router.push('/')" />
        <van-action-bar-icon @click="openCustomerService" icon="service-o" text="客服" open-type="contact"
          :send-message-title="data.goodsDetail.basicInfo.name" :send-message-img="data.goodsDetail.basicInfo.pic"
          :send-message-path="`/pages/goods-details/index?id=${data.goodsDetail.basicInfo.id}`" :show-message-card="true" />
        <van-action-bar-button type="danger" v-if="!data.goodsDetail.basicInfo.pingtuan" text="立即购买" :data-shopType="data.shopType"
        @click="gotoPayOrder(data.goodsDetail.basicInfo.id)" />
      </van-action-bar>
    </div>
  
    <!-- poster是wxa-plugin-canvas插件中的，生成精美海报 -->
    <!-- <template v-if="data.posterShow">
      <div class="poster-mask"></div>
      <div class="poster">
        <canvas class="canvas" style="data.canvasstyle" canvas-id="firstCanvas"></canvas>
      </div>
      <div class="poster-btn">
        <van-button type="primary" size="mini" bindtap='_saveToMobile'> 保存图片 </van-button>
        <van-button type="warning" size="mini" bindtap='closePop'> 关闭 </van-button>
      </div>
    </template>
    <poster id="poster" config="{{posterConfig}}" bind:success="onPosterSuccess" bind:fail="onPosterFail"></poster>
    <div v-if="data.showposterImg" class="popup-mask"></div>
    <div v-if="data.showposterImg" class="posterImg-box">
      <img mode="widthFix" class="posterImg" :src="data.posterImg" />
      <div class="btn-create" bindtap="savePosterPic">保存到相册</div>
    </div> -->
  
    <van-popup v-model:show="data.showShopPopup" round closeable position="bottom"
      custom-style="padding-top:48rpx;max-height: 80%;" bind:close="closePopupTap">
      <!-- TODO:selectSizePrice != selectSizePrice 啥意思？ -->
      <van-card centered :price="data.selectSizePrice"
        :origin-price="data.selectSizePrice != data.selectSizePrice ? data.selectSizeOPrice : ''"
        :title="data.goodsDetail.basicInfo.name" :thumb="data.skuGoodsPic" />
      <!-- <div class="size-label-box">
            <div wx:for="{{goodsDetail.properties}}" wx:for-item="property" wx:for-index="idx" wx:key="id">
              <div class="label">{{ property.name }}</div>
              <div class="label-item-box">
                <div class="label-item {{item.active ? 'active' : '' }}" wx:for="{{property.childsCurGoods}}"
                  hidden="{{ item.hidden }}" wx:key="id" bindtap="labelItemTap" data-propertyindex="{{idx}}"
                  data-propertychildindex="{{index}}">
                  {{ item.name }}
                </div>
              </div>
            </div>
            <div wx:for="{{goodsAddition}}" wx:for-item="property" wx:for-index="idx" wx:key="id">
              <div class="label">{{ property.name }}</div>
              <div class="label-item-box">
                <div class="label-item {{item.active ? 'active' : '' }}" wx:for="{{property.items}}" wx:key="id"
                  bindtap="labelItemTap2" data-propertyindex="{{idx}}" data-propertychildindex="{{index}}">
                  {{ item.name }}
                </div>
              </div>
            </div>
          </div> -->
      <van-cell title="购买数量">
        <div>
          <van-stepper :value="data.buyNumber" :min="data.buyNumMin" :max="data.buyNumMax" bind:change="stepChange" />
        </div>
      </van-cell>
      <van-button v-if="data.shopType == 'addShopCar'" bindtap="addShopCar" type="danger" block>加入购物车</van-button>
      <van-button v-if="data.shopType == 'tobuy' || data.shopType == 'toPingtuan'" :data-shopType="data.shopType"
        @click="gotoPayOrder(data.goodsDetail.basicInfo.id)" type="danger" block>立即购买</van-button>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
.van-cell {
  padding: 10px convertRpxToVw(38);
}

.container {
  background-color: #F2f2f2;
  min-height: 100vh;
  padding-bottom: convertRpxToVw(100);
}

.scroll-container {
  box-sizing: border-box;
  height: 100vh;
  padding-bottom: convertRpxToVw(64);
}

.tabs-container {
  width: 100%;
  display: flex;
  background-color: white;
}

.home-o {
  width: 20%;
}

.swiper-container {
  width: 100%;
  position: relative;
}

.swiper_box {
  width: 100%;
  height: convertRpxToVw(748);
}

.van-swipe-item img {
  width: 100%;
  display: inline-block;
  overflow: hidden;
  height: convertRpxToVw(748);
}

.goods-info {
  background-color: #fff;
  padding-top: convertRpxToVw(35);
  width: 100%;
  position: relative;
}

.goods-info-top-container {
  display: flex;
  justify-content: space-between;
}

.goods-info-fx {
  bottom: convertRpxToVw(60);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: convertRpxToVw(35);
  position: relative;
}

.goods-info-fx .item {
  /* height: 50rpx; */
  right: convertRpxToVw(130);
  top: convertRpxToVw(100);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: convertRpxToVw(24);
  background: #fff;
  z-index: 20;
}

.goods-info-fx .left {
  margin-right: 10px;
}

.goods-info-fx .icon-title {
  padding-top: 5px;
  font-size: 11px;
}

.goods-info-fx .item img {
  width: convertRpxToVw(50);
  height: convertRpxToVw(50);
}

.goods-info-fx .item button {
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: 0;
  z-index: 99;
}

.goods-info .goods-title {
  box-sizing: border-box;
  padding: 0 convertRpxToVw(30);
  font-size: convertRpxToVw(32);
  line-height: 1.4;
  color: #000;
  /* padding-bottom: convertRpxToVw(26); */
}

.goods-info .goods-share {
  box-sizing: border-box;
  padding: 0 convertRpxToVw(30);
  font-size: convertRpxToVw(25);
  line-height: 1.4;
  color: #CC0000;
  padding-top: convertRpxToVw(26);
}

.vcell {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.goods-profile {
  display: flex;
  align-items: center;
}

.goods-profile .p {
  color: #e64340;
  font-size: 20pt;
  margin-left: convertRpxToVw(30);
}

.goods-profile .p text {
  font-size: 12pt;
}

.goods-profile .r {
  color: #ccc;
  font-size: 10pt;
  margin-left: convertRpxToVw(30);
}

.row-arrow {
  width: 100vw;
  padding: 0 convertRpxToVw(32);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: convertRpxToVw(102);
  font-size: convertRpxToVw(28);
  line-height: convertRpxToVw(102);
  background: #fff;
  margin-bottom: convertRpxToVw(32);
}

.row-arrow img {
  width: convertRpxToVw(40);
  height: convertRpxToVw(40);
}

.goods-des-info {
  width: 100%;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 12px;
}

.label-title {
  font-size: convertRpxToVw(28);
  color: #000000;
  padding: convertRpxToVw(30);
  display: flex;
  justify-content: space-between;
}

.label-title .left {
  border-left: 3px solid #e64340;
  height: auto;
  padding-left: 10px;
}

.goods-text {
  padding: 0 convertRpxToVw(10);
  font-size: convertRpxToVw(28);
  color: #666666;
  line-height: convertRpxToVw(56);
  margin-bottom: convertRpxToVw(30);
  :deep(img) {
    width: 100%;
    max-width: 100%;
  }
}


.des-imgs {
  width: 100%;
}

.des-imgs img {
  width: 100%;
}

.footer-box {
  width: 100%;
  height: convertRpxToVw(100);
  background-color: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  box-shadow: 0 0 convertRpxToVw(1) 0;
  align-items: center;
}

.footer-box .contact {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: convertRpxToVw(32);
}

.footer-box .contact button {
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: 0;
  z-index: 99;
}

.footer-box .contact img {
  width: convertRpxToVw(60);
  height: convertRpxToVw(60);
}

.footer-box .shop-cart-btn {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: convertRpxToVw(32);
}

.footer-box .shop-cart-btn img {
  width: convertRpxToVw(55);
  height: convertRpxToVw(55);
}

.fav-icon {
  width: convertRpxToVw(60);
  height: convertRpxToVw(60);
  margin-left: convertRpxToVw(32);
  /*707070*/
}

.footer-box .shop-cart-btn .shop-num {
  position: absolute;
  color: #fff;
  left: convertRpxToVw(32);
  top: convertRpxToVw(10);

  width: convertRpxToVw(40);
  height: convertRpxToVw(40);
  line-height: convertRpxToVw(40);
  text-align: center;
  border-radius: 50%;
  background: #e64340;
  font-size: convertRpxToVw(24);
}

.footer-box .join-shop-cart {
  text-align: center;
  height: 100%;
  line-height: convertRpxToVw(100);
  background-color: #ff6850;
  color: #fff;
  font-size: convertRpxToVw(34);
  flex: 1;
  margin-left: convertRpxToVw(32);
}

.footer-box .now-buy {
  text-align: center;
  height: 100%;
  width: convertRpxToVw(250);
  line-height: convertRpxToVw(100);
  background-color: #e64340;
  color: #fff;
  font-size: convertRpxToVw(34);
  flex: 1;
}

.show-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 5;
}

.popup-contents {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  z-index: 6;
}

.pop-goods-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: convertRpxToVw(32);
  margin-right: convertRpxToVw(32);
  padding: convertRpxToVw(30) 0;
  border-bottom: 1px solid #eee;
}

.pop-img-box {
  width: convertRpxToVw(120);
  height: convertRpxToVw(120);
  overflow: hidden;
  margin-right: convertRpxToVw(26);
}

.pop-img-box .goods-thumbnail {
  width: convertRpxToVw(120);
  height: convertRpxToVw(120);
}

.pop-goods-title {
  width: convertRpxToVw(484);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: convertRpxToVw(26);
  color: #000000;
}

.pop-goods-price {
  font-size: convertRpxToVw(26);
  color: #e64340;
  margin-top: convertRpxToVw(20);
}

.pop-goods-price .t1 {
  font-size: convertRpxToVw(50);
}

.pop-goods-price-original {
  font-size: convertRpxToVw(26);
  color: #aaa;
  text-decoration: line-through;
  margin-left: convertRpxToVw(16);
}

.pop-goods-close {
  width: convertRpxToVw(36);
  height: convertRpxToVw(36);
}

.goods-property-container {
  height: 56px;
  align-items: center;
  border-radius: 12px;
  padding: 0 16px;
}

.size-label-box2 {
  width: 100vw;
  background: #fff;
}

.size-label-box .label {
  font-size: convertRpxToVw(26);
  color: #000;
  padding-left: convertRpxToVw(30);
  padding: convertRpxToVw(30) 0 convertRpxToVw(20) convertRpxToVw(30);
}

.size-label-box .label-item-box {
  display: flex;
  margin-left: convertRpxToVw(30);
  flex-direction: row;
  flex-wrap: wrap;
}

.size-label-box .label-item {
  font-size: convertRpxToVw(26);
  color: #000;
  padding: convertRpxToVw(14) convertRpxToVw(20);
  border: 1px solid #ddd;
  border-radius: convertRpxToVw(6);
  margin: 0 convertRpxToVw(20) convertRpxToVw(20) 0;
}

.size-label-box .label-item.active {
  color: #e64340;
  border: 1px solid #e64340;
}

.buy-num-box {
  display: flex;
  justify-content: space-between;
  padding: convertRpxToVw(30) convertRpxToVw(30) convertRpxToVw(48) 0;
  margin-left: convertRpxToVw(30);
  border-top: 1px solid #eee;
  margin-top: convertRpxToVw(30);
  align-items: center;
}

.num-label {
  font-size: convertRpxToVw(26);
  color: #000000;
}

.buy-num-box .num-box {
  display: flex;
}

.buy-num-box .num-box .num-jian,
.buy-num-box .num-box .num-input,
.buy-num-box .num-box .num-jia {
  width: convertRpxToVw(80);
  height: convertRpxToVw(64);
  line-height: convertRpxToVw(62);
  text-align: center;
  border: 1px solid #eee;
}

.buy-num-box .num-box .num-input {
  font-size: convertRpxToVw(28);
}

.buy-num-box .num-box .num-input input {
  height: 100%;
}

.popup-join-btn {
  width: 100%;
  height: convertRpxToVw(89);
  text-align: center;
  line-height: convertRpxToVw(89);
  font-size: convertRpxToVw(34);
  color: #ffffff;
  background-color: #e64340;
}

.buy-num-box .num-box .hui {
  background-color: #f5f5f9;
}

.curKanjiaprogress {
  width: 100%;
  background-color: #fff;
  margin-top: convertRpxToVw(20);
}

.curKanjiaprogress .name {
  font-size: convertRpxToVw(40);
  padding: convertRpxToVw(20);
  text-align: center;
}

.curKanjiaprogress .placeholder {
  margin-left: convertRpxToVw(30);
  margin-right: convertRpxToVw(30);
  text-align: center;
  font-size: convertRpxToVw(26);
  width: convertRpxToVw(100);
  color: #999;
}

.kjBuyButton {
  position: fixed;
  left: 0;
  bottom: calc(env(safe-area-inset-bottom) / 2);
  width: 100%;
  display: flex;
}

.kjBuyButton .item {
  flex: 1;
}

.shareFloatDiv1 {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background-color: #555;
  filter: Alpha(Opacity=60);
  opacity: 0.6;
  z-index: 99998;
}

.shareFloatDiv2 {
  position: fixed;
  width: 100%;
  height: convertRpxToVw(400);
  background-color: #ffffff;
  bottom: 0;
  z-index: 99999;
}

.shareFloatDiv2 .p1 {
  height: convertRpxToVw(260);
}

.shareFloatDiv2 .p2 {
  height: convertRpxToVw(20);
  background-color: #EEEEEE;
}

.shareFloatDiv2 .p3 {
  height: convertRpxToVw(120);
  line-height: convertRpxToVw(120);
  text-align: center;
  color: #555555;
  font-size: 16px;
}

.qrcode-button {
  padding: convertRpxToVw(30);
  margin-top: convertRpxToVw(50);
}

.qrcode {
  width: convertRpxToVw(300);
  height: convertRpxToVw(300);
  margin-top: convertRpxToVw(50);
}



.posterImg-box {
  position: absolute;
  top: convertRpxToVw(104);
  left: convertRpxToVw(32);
  width: convertRpxToVw(686);
  margin-bottom: convertRpxToVw(100);
  z-index: 999999;
}

.posterImg {
  width: 100%;
}

.btn-create {
  margin: convertRpxToVw(32);
  margin-bottom: 0;
  height: convertRpxToVw(88);
  line-height: convertRpxToVw(88);
  background: #e64340;
  color: #fff;
  text-align: center;
  border-radius: convertRpxToVw(8);
}

.clearfix:after {
  /*伪元素是行内元素 正常浏览器清除浮动方法*/
  content: "";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}

.shop-container {
  width: 100vw;
  margin: convertRpxToVw(16) 0;
  padding: convertRpxToVw(32);
  display: flex;
  align-items: center;
  background: #fff;
}

.shop-container img {
  width: convertRpxToVw(90);
  height: convertRpxToVw(90);
}

.shop-container .info {
  margin-left: convertRpxToVw(32);
}

.shop-container .info .title {
  font-size: convertRpxToVw(30);
  color: #333;
}

.shop-container .info .address {
  font-size: convertRpxToVw(26);
  color: #666;
}

.reputation-cell-group {
  background-color: white !important;
  border-radius: 12px;
}

.reputation-cell {
  padding-bottom: 0px !important;
  --cell-icon-size: convertRpxToVw(88);
}

.reputation-cell .van-icon {
  top: convertRpxToVw(16) !important;
}

.reputation-cell .avatarUrl-img {
  width: 40px;
  height: 40px;
  border-radius: 100%;
  margin-right: convertRpxToVw(26);
}

.reputation-cell-reamrk {
  /* padding-left: 96rpx; */
}

.reputation-pics {
  width: 100vw;
  display: flex;
  flex-wrap: wrap;
  background: #ffffff;
}

.reputation-pics img {
  width: convertRpxToVw(207);
  height: convertRpxToVw(207);
  margin: convertRpxToVw(32) 0 0 convertRpxToVw(32);
  border-radius: convertRpxToVw(16);
}

.characteristic {
  padding: convertRpxToVw(8) convertRpxToVw(32);
  color: #666;
  font-size: convertRpxToVw(26);
}

.van-progress {
  margin: convertRpxToVw(32) 0;
}

.flex {
  display: flex;
  width: 100vw;
}

.kjbutton {
  flex: 1;
  padding: convertRpxToVw(30);
}

.kjlj {
  display: flex;
  background-color: #ffffff;
  padding: 0 convertRpxToVw(32);
  align-items: center;
}

.kjlj-l {
  width: convertRpxToVw(88);
  height: convertRpxToVw(88);
  border-radius: 50%;
  flex-shrink: 0;
}
.slide-image {
  object-fit: cover;
}
</style>