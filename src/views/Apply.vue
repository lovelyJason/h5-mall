<script setup lang="ts">
import { ref, reactive } from 'vue';
import Topbar from '@/components/Topbar.vue'

const applyStatus = ref(-1)
const setting: Record<'canBuy' | 'price', any> = reactive({
  canBuy: true,
  price: 200
})

</script>

<template>
  <div style="overflow: hidden;">
    <Topbar title="申请成为分销商" />
    <div class="noApply" v-if="applyStatus == -1">
      <van-empty description="诚邀您成为分销商" />
      <div class="block-btn">
        <van-button type="primary" block round bind:click="goForm">免费申请 等待管理员审核</van-button>
      </div>
      <div v-if="setting.canBuy" class="block-btn">
        <van-button type="warning" block round bind:click="buy">直接支付{{ setting.price }}元，立即免审开通</van-button>
      </div>
    </div>
  
    <div class='noApply' v-if="applyStatus == 0">
        <van-empty description="感谢您的支持，请等待管理员审核" />
        <div class="block-btn">
          <van-button type="primary" block round bind:click="goShop">先去逛逛</van-button>
        </div>
    </div>
  
    <div class='noApply' v-if="applyStatus == 1">
      <van-empty description="很遗憾，您的申请没有通过 {{applyInfo.remark}}" />
      <div class="block-btn">
        <van-button type="danger" block round bind:click="goShop">回首页</van-button>
      </div>
    </div>
  
    <div class='noApply' v-if="applyStatus == 2">
      <van-icon name="checked" color="#07c160" size="240rpx" />
      <div>恭喜您成为分销商</div>
      <div class="block-btn" style="margin-top:240rpx;">
        <van-button type="primary" block round bind:click="goFx">前往分销中心</van-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.noApply {
  margin-top: 10vw;
  text-align: center;
}
.noApply image {
  width: 20vw;
}
.profile {
  text-align: center;
  margin-top: 2vw;
  font-size: 14px;
  color:#888;
}
.mini-btn{
  margin-top: 3vw;
  margin-left: 50px;
  margin-right: 50px;
}
.qrcode-button {
  padding: 2vw;
}
.canvas {
  width: 100vw;
}
.block-btn {
  padding: 0.5vw 2vw;
}
</style>