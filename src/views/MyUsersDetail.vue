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
  userInfoMap: {
    base: {},
    userLevel: {}
  }
})

const userDetailSpreadUser = async () => {
  const uid = route.query.id
  const res = await WEBAPI.userDetailSpreadUser(wx.getStorage('token'), uid)
  if (res.code != 0) {
    showConfirmDialog({
      title: '出错了',
      message: res.msg,
      showCancelButton: false
    })
    return
  }
  data.userInfoMap = res.data
}

onMounted(() => {
  userDetailSpreadUser()
})

</script>

<template>
  <view class="avatar">
    <image :src="data.userInfoMap.base.avatarUrl" mode="widthFix"></image>
  </view>
  <van-cell-group title="会员信息">
    <van-cell title="会员编号" :value="data.userInfoMap.base.id" />
    <van-cell title="手机号码" :value="data.userInfoMap.base.mobile" />
    <van-cell title="昵称" :value="data.userInfoMap.base.nick" />
    <van-cell wx:if="data.userInfoMap.userLevel" title="等级" :value="data.userInfoMap.userLevel.name" />
    <van-cell title="分销商">
      <view>
        <view v-if="!data.userInfoMap.base.isSeller">否</view>
        <van-tag v-else type="success">是</van-tag>
      </view>
    </van-cell>
  </van-cell-group>
</template>

<style scoped lang="scss">
.avatar {
  width: 100vw;
  text-align: center;
  margin-top: convertRpxToVw(32);
}

.avatar image {
  width: convertRpxToVw(280);
  border-radius: 50%;
}
</style>