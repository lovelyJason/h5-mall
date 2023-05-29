<script setup lang="ts">
import { ref, reactive, onMounted, inject, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { showLoadingToast, showToast, showFailToast, showConfirmDialog } from 'vant';
import Clipboard from "clipboard";

const btnCopy = new Clipboard("#copyUid");
const router = useRouter()
const route = router.currentRoute.value
const user = useUserStore()
const $WEBAPI: any = inject('$WEBAPI')
const WEBAPI = $WEBAPI
const wx: any = inject('wx')

const data = reactive<any>({
  fxCommisionPaying: '',
  freeze: null,
  balance: null,
  commisionData: {
    today: 0,
    yesday: 0,
    thisMonth: 0,
    lastMonth: 0,
    todayXiaoshou: 0,
    yesdayXiaoshou: 0,
    thisMonthXiaoshou: 0,
    lastMonthXiaoshou: 0
  },
  fxIndexAdPos: {

  },
  fxCities: [],
  canvasHeight: 0,
  applyStatus: null,
  applyInfo: {}
})

Date.prototype.format = function (content: any) {
  var date = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S+": this.getMilliseconds()
  };
  if (/(y+)/i.test(content)) {
    content = content.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in date) {
    if (new RegExp("(" + k + ")").test(content)) {
      // @ts-ignore
      content = content.replace(RegExp.$1, RegExp.$1.length == 1 ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
    }
  }
  return content;
}

const convertRpxToVw = (point: number) => {
  return point / 750 * 100 + 'vw'
}

const adPosition = async () => {
  const res = await WEBAPI.adPosition('fx_index')
  if (res.code == 0) {
    data.fxIndexAdPos = res.data
  }
}

const getAmount = () => {
  const token = wx.getStorage('token')
  if (!token) {
    return
  }
  WEBAPI.userAmount(token).then(function (res: any) {
    if (res.code == 700) {
      showToast('当前账户存在异常')
      return
    }
    if (res.code == 2000) {
      return
    }
    if (res.code == 0) {
      data.balance = res.data.balance.toFixed(2)
      data.freeze = res.data.freeze.toFixed(2)
      data.fxCommisionPaying = res.data.fxCommisionPaying.toFixed(2)
      data.totleConsumed = res.data.totleConsumed.toFixed(2)
      data.score = res.data.score
    }
  })
}

/**
  * @params containerDom: 包裹待转化的DOM，
  * 即本例中的 <div class="container" ref="containerDom">
  */
const makePoster = async (containerDom: HTMLElement | null | undefined) => {
  // let posterUrl = '';
  // if (!containerDom) {
  //   console.error('containerDom为空: ');
  //   return posterUrl;
  // }
 
  // // 设置配置项，可以在官方文档查
  // const options = {
  //   scale: window.devicePixelRatio, // 放大倍数，消除截图锯齿
  //   width: gradesDom?.offsetWidth, // 生成的图片宽度，单位px
  //   height: posterDom.offsetHeight + 60, // 生成的图片高度，单位px
  //   backgroundColor: null, // 设置背景色，null表示透明。若不设置此项，默认是白色背景
  // };
  // try {
  //   const canvas = await html2canvas(containerDom, options);
  //   posterUrl = canvas.toDataURL('image/png');
  // } catch (err) {
  //   console.info('制作海报出错了:', err);
  // }
  // return posterUrl;
}

const showCanvas = (qrcode: string) => {
  // wx.getImageInfo({
  //   src: qrcode,
  //   success: (res) => {
  //     const imageSize = ImageUtil.imageUtil(res.width, res.height)
  //     const qrcodeWidth = imageSize.windowWidth / 2
  //     _this.setData({
  //       canvasHeight: qrcodeWidth
  //     })
  //     ctx = wx.createCanvasContext('firstCanvas')
  //     ctx.setFillStyle('#FDF3E7')
  //     ctx.fillRect(0, 0, imageSize.windowWidth, imageSize.imageHeight + qrcodeWidth)
  //     ctx.drawImage(res.path, 0, 0, qrcodeWidth, qrcodeWidth)
  //     setTimeout(function () {
  //       wx.hideLoading()
  //       ctx.draw()
  //     }, 1000)
  //   }
  // })
}

const fetchQrcode = () => {
  showLoadingToast('加载中')
  // 这是小程序的api
  // WEBAPI.wxaQrcode({
  //   scene: 'inviter_id=' + wx.getStorageSync('uid'),
  //   page: 'pages/index/index',
  //   is_hyaline: true,
  //   autoColor: true,
  //   expireHours: 1
  // }).then(res => {
  //   wx.hideLoading()
  //   if (res.code == 41030) {
  //     wx.showToast({
  //       title: '上线以后才可以获取二维码',
  //       icon: 'none'
  //     })
  //     return
  //   }
  //   if (res.code == 0) {
  //     _this.showCanvas(res.data)
  //   }
  // })
}
const getApplyProcess = async () => {
  WEBAPI.fxApplyProgress(wx.getStorage('token')).then((res: any) => {
    let applyStatus = user.userData.base.isSeller ? 2 : -1
    if (res.code == 2000) {
      return
    }
    if (res.code === 700) {
      data.applyStatus = applyStatus
    }
    if (res.code === 0) {
      if (user.userData.base.isSeller) {
        applyStatus = 2
      } else {
        applyStatus = res.data.status
      }
      data.applyStatus = applyStatus
      data.applyInfo = res.data
    }
    if (applyStatus == 2) {
      fetchQrcode()
    }
  })
}

const commision = async () => {
  const uid = user.userData.base.id
  var commisionData = data.commisionData
  const nowDate = new Date()
  console.log('今天', nowDate.format('yyyyMMdd'))
  console.log('本月', nowDate.format('yyyyMM'))
  const yestoday = new Date(nowDate.getTime() - 24 * 60 * 60 * 1000)
  console.log('昨天', yestoday.format('yyyyMMdd'))
  // 上个月
  let year = nowDate.getFullYear()
  let month = nowDate.getMonth() + 1
  if (month == 1) {
    month = 12
    year--
  } else {
    month--
  }
  const lastMonth = year + "" + (month < 10 ? ('0' + month) : month)
  console.log('上个月', lastMonth)
  let res = await WEBAPI.siteStatisticsSaleroom({
    dateBegin: nowDate.format('yyyyMMdd'),
    dateEnd: nowDate.format('yyyyMMdd'),
    uid: uid
  })
  if (res.code === 0) {
    commisionData.today = res.data[0].estimateCommission
    commisionData.todayXiaoshou = res.data[0].saleroom
  }
  res = await WEBAPI.siteStatisticsSaleroom({
    dateBegin: yestoday.format('yyyyMMdd'),
    dateEnd: yestoday.format('yyyyMMdd'),
    uid: uid
  })
  if (res.code === 0) {
    commisionData.yesday = res.data[0].estimateCommission
    commisionData.yesdayXiaoshou = res.data[0].saleroom
  }
  res = await WEBAPI.siteStatisticsSaleroom({
    dateBegin: nowDate.format('yyyyMM'),
    dateEnd: nowDate.format('yyyyMM'),
    uid: uid
  })
  if (res.code === 0) {
    commisionData.thisMonth = res.data[0].estimateCommission
    commisionData.thisMonthXiaoshou = res.data[0].saleroom
  }
  res = await WEBAPI.siteStatisticsSaleroom({
    dateBegin: lastMonth,
    dateEnd: lastMonth,
    uid: uid
  })
  if (res.code === 0) {
    commisionData.lastMonth = res.data[0].estimateCommission
    commisionData.lastMonthXiaoshou = res.data[0].saleroom
  }
  data.commisionData = commisionData
}

const fxCities = () => {

}

const handleUserInfo = async () => {
  const userData = user.userData
  commision();
  if (userData.base.isSeller) {
    // 判断是否是市区合伙人
    fxCities()
  }
}

const copyContent = (e: any) => {
  showToast('已复制到剪切板')
}

const saveToMobile = () => {

}

onMounted(() => {
  adPosition()
  user.checkHasLogined().then(async (isLogined: boolean) => {
    if (isLogined) {
      await user.getUserApiInfo()
      console.log(user.userData)
      handleUserInfo()
      getAmount()
      getApplyProcess()
    } else {
      showFailToast({
        message: '登录失效，需要重新获取授权信息'
      })
    }
  })
})

onBeforeUnmount(() => {
  btnCopy.destroy()
})

</script>
<template>
  <div class="page">
    <div>
      <img :style="{ width: '100%', height: '206px' }" mode="aspectFit" src="/images/index-top-bg.png" />
    </div>

    <!-- 如果当前用户是分销商 -->
    <div v-if="user.userData.base && user.userData.base.isSeller">
      <div class="tabTop" :style="{ 'margin-top': '-180px' }">
        <div class="header-box">
          <img class="avatar" :src="user.userData.base.avatarUrl" mode="aspectFill" />
          <div class="r">
            <div class="uid">用户编号: {{ user.userData.base.id }}</div>
            <div style="display: flex">
              <div class="nick">{{ user.userData.base.nick }}</div>
            </div>
          </div>
        </div>
        <div class="header-box2"> </div>
        <div class="line"></div>
        <div class="asset">
          <div class='item' bindtap='goAsset' :style="{ width: '72px' }">
            <div class="Count">{{ data.fxCommisionPaying }}</div>
            <div>未结算金额</div>
          </div>
          <div class='item' bindtap='goAsset' :style="{ width: '72px' }">
            <div class="Count">{{ data.freeze }}</div>
            <div>冻结金额</div>
          </div>
          <div class='item right' bindtap='goAsset' :style="{ width: '72px' }">
            <div class="Count" style="color:#FF444A">{{ data.balance }}</div>
            <div>可用金额</div>
          </div>
        </div>
        <div class="line"></div>
        <div class="titleXS">
          我的业绩
        </div>
        <div class="asset">
          <div class='item'>
            <div class="Count">{{ data.commisionData.todayXiaoshou }}</div>
            <div>今日销售</div>
            <div class="yjP">{{ data.commisionData.today ? data.commisionData.today : 0 }}</div>
            <div class="yjT">（佣金）</div>
          </div>
          <div class='item right'>
            <div class="Count">{{ data.commisionData.yesdayXiaoshou }}</div>
            <div>昨天销售</div>
            <div class="yjP">{{ data.commisionData.yesday ? data.commisionData.yesday : 0 }}</div>
            <div class="yjT">（佣金）</div>
          </div>
          <div class='item right'>
            <div class="Count">{{ data.commisionData.thisMonthXiaoshou }}</div>
            <div>本月销售</div>
            <div class="yjP">{{ data.commisionData.thisMonth ? data.commisionData.thisMonth : 0 }}</div>
            <div class="yjT">（佣金）</div>
          </div>
          <div class='item right'>
            <div class="Count">{{ data.commisionData.lastMonthXiaoshou }}</div>
            <div>上月销售</div>
            <div class="yjP">{{ data.commisionData.lastMonth ? data.commisionData.lastMonth : 0 }}</div>
            <div class="yjT">（佣金）</div>
          </div>
        </div>
      </div>
      <div v-if="user.userData.referrer.uid" class="tuan">
        <div>我的邀请人</div>
        <div class="line2"></div>
        <div style="display: flex">
          <img
            :style="{ width: convertRpxToVw(80), height: convertRpxToVw(80), margin: '10px 20px 0px 0', 'border-radius': '100%' }"
            :src="user.userData.referrer.avatarUrl" />
          <div
            :style="{ height: convertRpxToVw(120), 'line-height': convertRpxToVw(120), 'font-size': convertRpxToVw(26) }">
            {{
              user.userData.referrer.nick }}</div>
        </div>
      </div>
      <img v-if="data.fxIndexAdPos" :src="data.fxIndexAdPos.val" mode="widthFix" class="adpos" :data-url="data.fxIndexAdPos.url" bindtap="goUrl" />
      <van-cell-group title="分销信息" custom-class="cell-class">
        <van-field v-model="user.userData.base.id" readonly center clearable label="我的邀请码">
          <template #button>
            <van-button 
              id="copyUid"
              slot="button" 
              size="small" 
              type="primary" 
              round 
              bindtap="copyContent"
              :data-id="user.userData.base.id"
              :data-clipboard-text="user.userData.base.id"
              @click="copyContent"
            >
            复制
            </van-button>
          </template>
        </van-field>
        <van-cell title="我的团队" value="查看" is-link @click="router.push('/myusers')" />
        <van-cell title="推广订单" value="查看" is-link @click="router.push('/commision-orderlist')" />
        <van-cell title="账单明细" value="查看" is-link />
      </van-cell-group>

      <!-- 团队长、副队长 -->
      <van-cell-group
        v-if="user.userData.saleDistributionTeam && (user.userData.saleDistributionTeam.leader == user.userData.base.id || user.userData.saleDistributionTeam.deputyLeader == user.userData.base.id)"
        custom-class="cell-class" title="我的团队">
        <van-cell :title="user.userData.saleDistributionTeam.name" />
        <van-cell title="身份"
          :value="user.userData.saleDistributionTeam.leader == user.userData.base.id ? '队长' : '副队长'" />
        <van-cell title="销售目标" :value="'¥' + user.userData.saleDistributionTeam.standardSaleroom + '/月'" />
        <van-cell title="本月销售" :value="'¥' + user.userData.saleDistributionTeam.curSaleroom" />
        <van-cell title="月度报表" is-link />
      </van-cell-group>

      <!-- 城市合伙人 -->
      <van-cell-group v-for="item in data.fxCities" :key="item.id" custom-class="cell-class"
        :title="item.provinceName + item.cityName + '合伙人'">
        <van-cell title="销售目标" :value="'¥' + item.standardSaleroom + '/月'" />
        <van-cell title="本月销售" :value="'¥' + item.curSaleroom" />
        <van-cell title="月度报表" is-link />
      </van-cell-group>

      <div class='noApply' style="padding-top: 10px;padding-bottom: 20px">
        <div class="download-img" style="text-align: center;">
          <div class="canvas-box">
            <canvas class="canvas" :style="{ width: data.canvasHeight + 'px', height: data.canvasHeight + 'px' }"
              canvas-id="firstCanvas"></canvas>
          </div>
          <div class="tzBtn" @click="saveToMobile" :style="{ 'margin-top': convertRpxToVw(10), background: '#F5D795', padding: `0 ${convertRpxToVw(16)}` }">
            保存到相册
          </div>
        </div>
      </div>

    </div>

    <!-- 还不是分销商 -->
    <div v-if="user.userData.base && !user.userData.base.isSeller" class="tabTop" :style="{ 'margin-top': '192px' }">
      <div class="header-box">
        <image class="avatar" :src="user.userData.base.avatarUrl" mode="aspectFill"></image>
        <div class="r">
          <div class="uid">用户ID: {{ user.userData.base.id }}</div>
          <div class="nick">{{ user.userData.base.nick }}</div>
        </div>
      </div>
      <div class="header-box2">您当前还不是分销商</div>
      <div class="line"></div>
      <div class="header-box2" bindtap="goApply">立即前往申请成为分销商 ></div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.page {
  background: #FDF3E7
}

.asset {
  display: flex;
  padding: convertRpxToVw(20) convertRpxToVw(32);
  justify-content: space-between;
}

.asset .item {
  display: flex;
  flex-direction: column;
  text-align: center;
  font-size: convertRpxToVw(26);
  color: #3F240A;
}

.btn-view {
  height: convertRpxToVw(88);
  /* background-color: #e85654; */
  padding-right: convertRpxToVw(40);
  padding-bottom: convertRpxToVw(30);
  width: 100vw;
  display: flex;
  flex-direction: row-reverse;
}

.btn-view .btn {
  border-color: #fff !important;
  color: #fff !important;
  margin-right: convertRpxToVw(20);
}

.btn-hover {
  border-color: #fff;
  color: #fff;
}

.no-data {
  margin-top: convertRpxToVw(100);
  text-align: center;
  font-size: 13px;
  color: #ccc;
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

.tabTop {
  width: convertRpxToVw(710);
  /* height: 500rpx; */
  background: linear-gradient(270deg, #F6C173 0%, #FFECC0 100%);
  border-radius: convertRpxToVw(20);
  margin-left: convertRpxToVw(20);
  /* margin-top: -380rpx; */
  position: relative;
  padding-bottom: convertRpxToVw(20);
  margin-bottom: 10px;
}

.tabTop2 {
  margin-top: 10px;
  width: convertRpxToVw(710);
  /* height: 500rpx; */
  background: linear-gradient(270deg, #F6C173 0%, #FFECC0 100%);
  border-radius: convertRpxToVw(20);
  margin-left: convertRpxToVw(20);
  /* margin-top: -380rpx; */
  position: relative;
  padding-bottom: convertRpxToVw(20);
  margin-bottom: 10px;
}

.ava {
  width: convertRpxToVw(100);
  height: convertRpxToVw(100);
}

.header-box {
  padding: convertRpxToVw(32) convertRpxToVw(32) 0 convertRpxToVw(32);
  display: flex;
  align-items: center;
}

.header-box2 {
  padding: convertRpxToVw(16) convertRpxToVw(32);
  display: flex;
  align-items: center;
  margin-left: convertRpxToVw(10);
  font-size: convertRpxToVw(26);
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #3E240D;
}

.header-box .avatar {
  width: convertRpxToVw(128);
  height: convertRpxToVw(128);
  border-radius: 50%;
  border: 2px solid white;
  flex-shrink: 0;
}

.header-box .avatar2 {
  width: convertRpxToVw(130);
  height: convertRpxToVw(130);
  position: absolute;
}

.header-box .btn {
  margin-left: convertRpxToVw(32);
}

.header-box .r {
  margin-left: convertRpxToVw(32);
  color: #333;
  font-size: convertRpxToVw(28);
}

.line {
  width: convertRpxToVw(558);
  height: 2px;
  background: linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 1px;
  margin-left: 20px;
}

.txBtn {
  width: convertRpxToVw(160);
  height: convertRpxToVw(56);

  border-radius: 28px;
  border: convertRpxToVw(2) solid #3F240A;
  line-height: convertRpxToVw(56);
  position: absolute;
  right: 16px;
  text-align: center;
  font-size: 14px;
  padding-top: 2px;
}
.tzBtn {
  width: convertRpxToVw(230);
  height: convertRpxToVw(70);
  line-height: convertRpxToVw(70);
  margin: auto;
  border-radius: 28px;
  border: convertRpxToVw(2) solid #3F240A;
  right: 16px;
  text-align: center;
  font-size: 14px;
  padding-top: 2px;
}

.Count {
  height: 38px;
  font-size: convertRpxToVw(40);
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #3F240A;
  line-height: 38px;
}

.tuan {
  margin-left: convertRpxToVw(20);
  margin-right: convertRpxToVw(20);
  background: #FFFFFF;
  border-radius: convertRpxToVw(8);
  // padding: convertRpxToVw(40);
  padding: convertRpxToVw(40) convertRpxToVw(40) convertRpxToVw(20) convertRpxToVw(40)
}

.tuan2 {
  margin-left: convertRpxToVw(20);
  width: convertRpxToVw(630);
  background: #FFFFFF;
  border-radius: convertRpxToVw(8);
  padding: convertRpxToVw(26) 40rpx;
}

.line2 {
  width: convertRpxToVw(630);
  height: 1px;
  background: #E6E6E6;
  border-radius: 1px;
  margin-top: convertRpxToVw(20);
}

.tuanItem {
  width: convertRpxToVw(315);
  text-align: center;
  padding-top: convertRpxToVw(42)
}

.tI1 {
  font-size: convertRpxToVw(38);
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #333333;
  margin: 0 0 convertRpxToVw(8) 0;
}

.tI2 {
  font-size: convertRpxToVw(28);
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #666666;
}

.yqCode {
  background: #F2F5FF;
  height: convertRpxToVw(37);
  font-size: convertRpxToVw(26);
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #182442;
  line-height: convertRpxToVw(37);
  padding: convertRpxToVw(2) convertRpxToVw(20);
  margin-left: convertRpxToVw(20);
}

.cybtn {
  width: convertRpxToVw(140);
  height: convertRpxToVw(50);
  background: #FFD43E;
  border-radius: 28px;
  line-height: convertRpxToVw(50);
  text-align: center;
  font-size: 14px;
}

.yjP {
  height: convertRpxToVw(37);
  font-size: convertRpxToVw(26);
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #FF444A;
  line-height: convertRpxToVw(37);
}

.yjT {
  height: convertRpxToVw(30);
  font-size: convertRpxToVw(22);
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #666666;
  line-height: convertRpxToVw(30);
}

.titleXS {
  /* width: 140px; */
  height: convertRpxToVw(40);
  font-size: convertRpxToVw(28);
  /* font-family: PingFangSC-Medium, PingFang SC; */
  /* font-weight: 400; */
  color: #3F240A;
  line-height: convertRpxToVw(40);
  margin-left: 22px;
  margin-top: 10px
}

.textsjtz {
  height: convertRpxToVw(40);
  font-size: convertRpxToVw(28);
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #999999;
  line-height: convertRpxToVw(40);
  margin-top: 10px;
}

.next {
  width: convertRpxToVw(40);
  height: convertRpxToVw(40);
  position: absolute;
  right: 20px;
}


/* -----------商品列表------------- */
.goods-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  box-sizing: content-box;
  padding: convertRpxToVw(22);
  margin-bottom: convertRpxToVw(100);
}

.goods-box {
  width: convertRpxToVw(339);
  height: convertRpxToVw(472);
  background-color: #fff;
  overflow: hidden;
  margin-bottom: convertRpxToVw(24);
  border-radius: 5px;
}

.goods-box .img-box {
  width: convertRpxToVw(339);
  height: convertRpxToVw(339);
  overflow: hidden;
}

.goods-box .img-box image {
  width: convertRpxToVw(339);
  height: convertRpxToVw(339);
}

.goods-box .goods-title {
  width: convertRpxToVw(280);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  font-size: convertRpxToVw(26);
  padding: convertRpxToVw(20) 0 0rpx 0;
  color: #000;
  margin-left: convertRpxToVw(24);
}

.goods-box .goods-price {
  /* width: 280rpx; */
  overflow: hidden;
  font-size: convertRpxToVw(36);
  padding: convertRpxToVw(8) 0;
  color: #e64340;
  margin-left: convertRpxToVw(24);
}

/* -------商品列表------------- */

.cell-class {
  padding: 0 convertRpxToVw(24);
}

.canvas-box {
  width: 100vw;
  display: flex;
  justify-content: center;
}

.adpos {
  padding: 0 convertRpxToVw(24);
  width: 100vw;
  box-sizing: border-box;
  border-radius: convertRpxToVw(16);
}
</style>