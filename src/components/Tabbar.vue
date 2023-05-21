<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter()
const route = router.currentRoute.value
const currentTab = ref(route.path.substring(1))

const onTabbarChange = (index: any) => {
  router.push('/' + index)
}

</script>

<template>
  <van-tabbar v-model="currentTab" @change="onTabbarChange">
    <van-tabbar-item name="" icon="shop-o">产品</van-tabbar-item>
    <van-tabbar-item name="order" icon="orders-o">订单</van-tabbar-item>
    <van-tabbar-item name="mine" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template>