<script setup lang="ts">
import { ref, reactive, onMounted, inject, toRefs } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const $WEBAPI: any = inject('$WEBAPI')
const WEBAPI = $WEBAPI
const user = useUserStore()

const adPositionFxTopPic = reactive<any>({})

const adPosition = async () => {
  const res = await WEBAPI.adPosition('fx-top-pic')
  if (res.code == 0) {
    Object.assign(adPositionFxTopPic, res.data)
  }
}


onMounted(() => {
  adPosition()
  user.getUserApiInfo()
})
</script>

<template>
  <div class="page">
    <img v-if="adPositionFxTopPic" class="logo" :src="adPositionFxTopPic.val" mode="widthFix" />
    <van-divider contentPosition="center">申请成为分销商</van-divider>
    <van-cell-group>
      <van-field
        v-if="user.userData.base.referrer"
        label="邀请人"
        value="{{ userDetail.referrer.nick }}"
        readonly
      />
      <van-field
        label="姓名"
        model:value="{{ name }}"
        clearable
        required
        placeholder="请输入真实姓名"
      />
      <van-field
        label="手机"
        model:value="{{ mobile }}"
        clearable
        required
        type="number"
        placeholder="请输入手机号码"
      />
    </van-cell-group>
    <div class="tips">成为分销商后卖出商品，您可以获得佣金</div>
    <div class="btns">
      <van-button type="primary" size="large">申请成为分销商</van-button>
    </div>

  </div>

</template>

<style scoped lang="scss">
.page {
  height: 100vh;
  background-color: #fff;
}
.logo {
  width: convertRpxToVw(750);
}
.tips {
  color: #666;
  font-size: convertRpxToVw(28);
  padding: convertRpxToVw(32);
}
.btns {
  padding: convertRpxToVw(32);
  .van-button--primary {
    background-color: #47A992;
  }
}
</style>
