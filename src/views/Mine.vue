<script setup lang="ts">
import Tabbar from '@/components/Tabbar.vue'
import Topbar from '@/components/Topbar.vue';
import { ref, reactive, inject, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast, showToast } from 'vant';
import { useUserStore } from '@/stores/user';
import { checkHasLogined, redirectToWechatAuth, getNewToken } from '@/utils/auth'
import { generateInvitationLink } from '@/utils';
import Clipboard from "clipboard";
import axios from 'axios'

const btnCopy = new Clipboard("#copyUid");
const $WEBAPI: any = inject('$WEBAPI')
const wx: any = inject('wx')
const WEBAPI = $WEBAPI
const initialAvatar = 'data:image/png;base64,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'

const router = useRouter()
const route = router.currentRoute.value

const amountInfo = reactive<any>({})
const nickShow = ref(false)
const showQRCode = ref(false)
const isLogined = ref(true)
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
  router.push('/asset')
}
// TODO:关注公众号
const openDialog = () => {
  showQRCode.value = true
}

const login = () => {
  let redirect_url = location.href  // 等于from的地址
  redirectToWechatAuth(false, redirect_url) 
}

const copyInviteLink = () => {
  showToast({
    position: 'top',
    message: '已复制到剪切板，分享给好友吧！'
  })
}

const getWxUserInfo = async () => {
  let redirect_url = location.href  // 等于from的地址
  redirectToWechatAuth(false, redirect_url, '1') 
}

const loadEruda = () => {
  const src = '/lib/eruda.js';
  const body = document.body
  let count = 0
  function handle(e: any) {
    count++
    if(count >= 16) {
      body.removeEventListener('click', handle, true)
      if(e.target.id !== 'mineDebug') return
      const script1 = document.createElement('script')
      script1.src = src
      script1.id = 'erudaPackage'
      const script2 = document.createElement('script')
      script2.innerHTML = 'eruda.init()'
      body.appendChild(script1)
      alert('脚本正在初始化，稍候')
      setTimeout(() => {
        body.appendChild(script2)
      }, 2000);
    }
  }
  body.addEventListener('click', handle, true)
}

onMounted(() => {
  // wx.configByurl(location.href, ['showAllNonBaseMenuItem'])
  // wx.ready(() => {
  // })
  readConfigVal()
  user.checkHasLogined().then(async (_isLogined: boolean) => {
    isLogined.value = _isLogined
    if (_isLogined) {
      await Promise.all([user.getUserApiInfo(), userAmount()])  
    }
  })
  
})

onBeforeUnmount(() => {
  btnCopy.destroy()
})

</script>

<template>
  <div class="mine">
    <Topbar v-if="!isInWechat" title="会员中心" :show-back="false" />
    <div class="header-box">
      <div v-if="isLogined" class="header-box-left">
        <div class="avatar" v-if="user.userData.base.avatarUrl" :style="{backgroundImage: `url(${user.userData.base.avatarUrl})`}"></div>
        <div class="avatar" v-else @click="getWxUserInfo" :style="{backgroundImage: `url(${initialAvatar})`}"></div>
        <div class="r">
          <div class="uid">用户ID: {{ user.userData.base.id }}</div>
          <!-- <div class="nick" @click="nickShow = true">{{ user.userData.base.nick ? user.userData.base.nick : '点击设置昵称' }}</div> -->
          <div class="nick">{{ user.userData.base.nick ? user.userData.base.nick : '点击设置昵称' }}</div>
        </div>
      </div>
      <div v-else class="header-box-left">
        <div @click="login" class="avatar" :style="{backgroundImage: `url(${initialAvatar})`}"></div>
        <div class="r">
          <div @click="login" class="login">登录/注册</div>
        </div>
      </div>
      <div class="header-box-right">
        <van-button @click="openDialog" size="mini" round type="success">关注公众号</van-button>
        <van-button 
          id="copyUid" 
          v-if="isLogined" 
          @click="copyInviteLink" 
          size="mini" 
          round 
          type="success"
          :data-clipboard-text="generateInvitationLink(user.userData.base.id)"
        >
          复制推荐码
        </van-button>
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
      <van-cell v-if="user.userData.base.isSeller" title="分销中心" is-link @click="router.push('/distribution')" />
      <!-- <van-cell v-else title="成为分销商" :is-link="true" @click="router.push('/apply')" /> -->
      <van-cell v-if="user.userData.base.isSeller" title="我的团队" is-link @click="router.push('/myusers')" />
      <van-cell v-if="user.userData.base.isSeller" title="推广订单" is-link @click="router.push('/commision-orderlist')" />
    </van-cell-group>
    <van-cell-group title="其他功能">
      <van-cell title="设备信息" is-link @click="router.push('/info')" />
      <van-cell title="系统设置" is-link @click="router.push('/settings')" />
    </van-cell-group>
    <div id="mineDebug" style="height: 100px;"></div>
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
  <van-dialog class-name="qdcode-dialog" style="width: 300px;height: 360px;" teleport=".mine" v-model:show="showQRCode">
    <img  style="width: 100%; object-fit: fill;" src="/images/qrcode_for_gh.jpg" />
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
  .nick {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 180px;
  }
}
.header-box-left {
  display: flex;
  align-items: center;
}
.header-box-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .van-button {
    line-height: 24px;
    margin-left: 0;
    margin-top: 0.5em;
  }
}
.qdcode-dialog {
  .van-button__content {
    color: red;
  }
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