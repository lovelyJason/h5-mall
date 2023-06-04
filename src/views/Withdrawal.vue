<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { showToast, showConfirmDialog, showFailToast } from 'vant';
import { useRouter } from 'vue-router';

const router = useRouter()

const $WEBAPI: any = inject('$WEBAPI')
const WEBAPI = $WEBAPI
const wx: any = inject('wx')

const balance = ref<number>(0)
const amount = ref<number>(0)
const name = ref<string>('')
const balance_pay_pwd = ref<string>('0')
const pwd = ref<string>('')

const userAmount = async () => {
  const res = await WEBAPI.userAmount(wx.getStorage('token'))
  if (res.code === 0) {
    balance.value = res.data.balance
  }
}

const bindSave = async () => {
  let minWidthAmount = wx.getStorage('WITHDRAW_MIN');
  if (!minWidthAmount) {
    minWidthAmount = 0
  }
  if (!amount.value) {
    showToast('请填写正确的提现金额')
    return
  }
  if (balance_pay_pwd.value == '1' && pwd.value) {
    showToast('请输入交易密码')
    return
  }
  if (amount.value * 1 < minWidthAmount) {
    showToast('提现金额不能低于' + minWidthAmount)
    return
  }
  if (amount.value * 1 > 2000) {
    if (!name.value) {
      showToast('请输入真实姓名')
      return
    }
  } else {
    name.value = ''
  }
  const res = await WEBAPI.withDrawApplyV2({
    token: wx.getStorage('token'),
    money: amount.value,
    pwd: pwd.value ? pwd.value : '',
    name: name.value ? name.value : '',
  })
  if(res.code == 0) {
    showConfirmDialog({
      title: '成功',
      showCancelButton: false,
      message: '您的提现申请已提交，等待财务打款'
    }).then(() => {
      router.go(-1)
    })
  } else {
    showFailToast(res.msg)
  }
}

onMounted(() => {
  balance_pay_pwd.value = wx.getStorage('balance_pay_pwd')
  userAmount()
})

</script>

<template>
  <van-cell title="可用余额" :value="balance" />
  <van-field label="提现金额" type="digit" v-model="amount" placeholder="请输入本次提现金额" clearable />
  <van-field v-if="amount > 2000" label="真实姓名" v-model="name" placeholder="超过2000需要校验真实姓名" clearable />
  <van-field v-if="balance_pay_pwd == '1'" label="交易密码" password v-model="pwd" placeholder="请输入交易密码" clearable />
  <div class="block-btn btn">
    <van-button type="primary" block @click="bindSave">申请提现</van-button>
  </div>
</template>
<style scoped lang="scss">
.btn {
  margin-top: convertRpxToVw(32);
}
</style>