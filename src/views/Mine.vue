<script setup lang="ts">
import Tabbar from '@/components/Tabbar.vue'  // TODO:不加后缀没识别
import Topbar from '@/components/Topbar.vue'
import { useRouter } from 'vue-router';

const router = useRouter()

const gotoApply = () => {
  router.push('/apply')
}

</script>

<template>
  <div class="mine">
    <Topbar />
    <div class="header-box">
      <div class="header-box-left">
        <div class="avatar"></div>
        <div class="r">
          <div class="uid">用户ID: 8443137</div>
          <div class="nick">点击设置昵称</div>
        </div>
      </div>
    </div>
    <div class="asset">
      <div class="item">
        <div class="amount">0.00</div>
        <div>余额</div>
      </div>
      <div class="item right">
        <div class="amount">0.00</div>
        <div>冻结</div>
      </div>
      <div class="item right">
        <div class="amount">1</div>
        <div>积分</div>
      </div>
      <div class="item right">
        <div class="amount">0</div>
        <div>成长值</div>
      </div>
    </div>
    <div class="space"></div>
    <van-cell-group title="三级分销">
      <van-cell title="成为分销商" :is-link="true" @click="gotoApply" />
    </van-cell-group>
  </div>
  <Tabbar />
</template>

<style scoped>
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
  background: url('https://cdn.qdovo.com/img/timg.jpeg') no-repeat center;
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
}
.asset .item {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: center;
  font-size: 1.5vw;
  line-height: 20px;
  color: #666;
}
.asset .right {
  border-left: 1px solid #eee;
}
.asset .item .amount {
  color: #333;
  font-size: 2vw;
  padding-bottom: 0.5vw;
}
.space {
  width: 100vw;
  height: 0.1vw;
  background: #F4F5F9;
}
</style>