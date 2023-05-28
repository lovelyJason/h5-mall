<script setup lang="ts">
import { reactive, ref } from 'vue';

const mobile = ref('')
const password = ref('')
const code = ref('')  // 手机验证码

const onSubmit = () => {

}

const sendCode = () => {
  
}
</script>

<template>
  <div class="page">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field v-model="mobile" name="手机号码" label="手机号码" placeholder="手机号码"
          :rules="[{ required: true, message: '请填写手机号码' }]" />
        <van-field v-model="password" type="password" name="密码" label="密码" placeholder="密码"
          :rules="[{ required: true, message: '请填写密码' }]" />
        <van-field v-model="code" name="验证码" label="验证码" placeholder="验证码"
          :rules="[{ required: true, message: '请填写密码' }]" />
      </van-cell-group>
      <van-button class="cell-padding" type="primary" size="small" @click="sendCode">发送</van-button>

      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          提交
          <!-- WEBAPI.bindMobileSms(token, mobile, code, pwd) -->
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped lang="scss">
.page {
  height: 100vh;
  position: relative;
  .van-form {
    width: 100%;
    position: relative;
    top: 30%;
    transform: translateY(-50%);
  }
  .cell-padding {
    margin: var(--van-cell-group-inset-padding);
    margin-top: 10px;
  }
}
</style>