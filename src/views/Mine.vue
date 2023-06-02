<script setup lang="ts">
import Tabbar from '@/components/Tabbar.vue'
import Topbar from '@/components/Topbar.vue';
import { ref, reactive, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast, showToast } from 'vant';
import { useUserStore } from '@/stores/user';

const $WEBAPI: any = inject('$WEBAPI')
const wx: any = inject('wx')
const WEBAPI = $WEBAPI

const router = useRouter()
const route = router.currentRoute.value

const amountInfo = reactive<any>({})
const nickShow = ref(false)
const nick = ref('')
const config = reactive<any>({
  order_hx_uids: '',
  cps_open: '',
  recycle_open: '',
  show_3_seller: '',
  show_quan_exchange_score: '',
  show_score_exchange_growth: '',
  show_score_sign: '',
  fx_type: ''
})

const user = useUserStore()

const gotoApply = () => {
  router.push('/apply')
}

const editNick = async () => {
  if(!nick.value) {
    showToast('请填写昵称')
    return
  }
  const postData = {
    token: wx.getStorage('token'),
    nick: nick.value
  }
  const res = await WEBAPI.modifyUserInfo(postData)
  if (res.code != 0) {
    showToast(res.msg)
    return
  }
  user.getUserApiInfo()
  showSuccessToast('设置成功')
}

const userAmount = async () => {
  const res = await WEBAPI.userAmount(wx.getStorage('token'))
  if (res.code == 0) {
    Object.assign(amountInfo, res.data)
    return res.data
  }
}

const readConfigVal = () => {
  config.order_hx_uids = wx.getStorage('order_hx_uids'),
  config.cps_open = wx.getStorage('cps_open'),
  config.recycle_open = wx.getStorage('recycle_open'),
  config.show_3_seller = wx.getStorage('show_3_seller'),
  config.show_quan_exchange_score = wx.getStorage('show_quan_exchange_score'),
  config.show_score_exchange_growth = wx.getStorage('show_score_exchange_growth'),
  config.show_score_sign = wx.getStorage('show_score_sign'),
  config.fx_type = wx.getStorage('fx_type')
}

const gotoAssets = () => {
  router.push('/assets')
}

onMounted(() => {
  readConfigVal()
  user.checkHasLogined().then(async (isLogined: boolean) => {
    if (isLogined) {
      Promise.all([user.getUserApiInfo(), userAmount()])
    } else {
     
    }
  })
})

</script>

<template>
  <div class="mine">
    <Topbar v-if="!isInWechat" title="会员中心" :show-back="false" />
    <div class="header-box">
      <div class="header-box-left">
        <div class="avatar" :style="{backgroundImage: `url(${user.userData.base.avatarUrl})`}"></div>
        <div class="r">
          <div class="uid">用户ID: {{ user.userData.base.id }}</div>
          <div class="nick" @click="nickShow = true">{{ user.userData.base.nick ? user.userData.base.nick : '点击设置昵称' }}</div>
        </div>
      </div>
    </div>
    <div class="asset">
      <div class="item" @click="gotoAssets">
        <div class="amount">{{ amountInfo.balance }}</div>
        <div>余额</div>
      </div>
      <div class="item right" @click="gotoAssets">
        <div class="amount">{{ amountInfo.freeze }}</div>
        <div>冻结</div>
      </div>
      <div class="item right">
        <div class="amount">{{ amountInfo.score }}</div>
        <div>积分</div>
      </div>
      <div class="item right">
        <div class="amount">{{ amountInfo.growth }}</div>
        <div>成长值</div>
      </div>
    </div>
    <div class="space"></div>
    <van-cell v-if="config.fx_type == 'hehuoren'" title="分销中心" is-link />
    <van-cell-group v-else-if="config.show_3_seller == 1" title="三级分销">
      <van-cell v-if="!user.userData.base.isSeller" title="成为分销商" :is-link="true" @click="router.push('/apply')" />
      <van-cell v-else title="分销中心" is-link @click="router.push('/distribution')" />
      <van-cell v-if="user.userData.base.isSeller" title="我的团队" is-link @click="router.push('/myusers')" />
      <van-cell v-if="user.userData.base.isSeller" title="推广订单" is-link @click="router.push('/commision-orderlist')" />
    </van-cell-group>
    <van-cell-group title="其他功能">
      <van-cell title="个人信息" />
      <van-cell title="系统设置" is-link @click="router.push('/settings')" />
    </van-cell-group>
  </div>
  <Tabbar />
  <van-dialog
    use-slot
    title="修改昵称"
    v-model:show="nickShow"
    show-cancel-button
    @confirm="editNick"
  >
    <van-field
      v-model="nick"
      placeholder="请输入昵称"
      size="large"
      clearable
    />
  </van-dialog>
</template>

<style scoped lang="scss">
.mine {
  height: 100vh;
  background-color: #fff;
}
.header-box {
  padding-right: 10vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #333;
}
.header-box-left {
  display: flex;
  align-items: center;
}
.avatar {
  width: 16vw;
  height: 16vw;
  margin: 2.8vw;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
.header-box .r {
  margin-left: 5vw;
}
.asset {
  width: 100vw;
  display: flex;
  border-top: 1px solid #eee;
  padding-top: 1.2vw;
  padding-bottom: 1.2vw;
  .amount {
    font-size: 15px;
  }
}
.asset .item {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  color: #666;
}
.asset .right {
  border-left: 1px solid #eee;
}
.asset .item .amount {
  color: #333;
  /* font-size: 2vw; */
  padding-bottom: 0.5vw;
}
.space {
  width: 100vw;
  height: 0.1vw;
  background: #F4F5F9;
}
</style>