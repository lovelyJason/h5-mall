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
const aliAccount = ref<string>('')

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
  if (amount.value <= 0) {
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
  if (!name.value) {
    showToast('请输入姓名')
    return
  }
  if (!aliAccount.value) {
    showToast('请输入支付宝账号')
    return
  }
  const extJson = {
    name: name.value,
    aliAccount: aliAccount.value
  }
  const res = await WEBAPI.withDrawApplyV2({
    token: wx.getStorage('token'),
    money: amount.value,
    pwd: pwd.value ? pwd.value : '',
    name: name.value ? name.value : '',
    extJsonStr: JSON.stringify(extJson)
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
  <van-field label="真实姓名" v-model="name" placeholder="需要和支付宝账号名一致" clearable />
  <van-field label="支付宝账号" v-model="aliAccount" placeholder="填写支付宝账号" clearable />
  <van-field v-if="balance_pay_pwd == '1'" label="交易密码" password v-model="pwd" placeholder="请输入交易密码" clearable />
  <div class="block-btn btn">
    <van-button type="primary" block @click="bindSave">申请提现</van-button>
  </div>
  <div class="prompt">
    <div style="margin-bottom: 10px;">
      <strong>温馨提示</strong>
    </div>
    <ul>
      <li>1、每月24号结算上月订单，请耐心等待</li>
      <li>2、最低提现金额100元</li>
      <li>3、每天提现一次，申请提现后24小时到账</li>
      <li>4、提现时务必确认好提现金额，到账号注意核实，有问题联系客服</li>
      <li>5、姓名要和支付宝账户一致</li>
    </ul>

  </div>
  
</template>
<style scoped lang="scss">
.btn {
  margin-top: convertRpxToVw(32);
}
.prompt {
  padding: 20px;
  strong {
    font-weight: 800;
  }
}
</style>