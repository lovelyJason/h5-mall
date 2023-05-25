<script setup lang="ts">
import Topbar from '@/components/Topbar.vue';

</script>

<template>
  <Topbar title="设置" />
  <van-cell title="关于我们" is-link url="/pages/about/index" />
  <van-cell title="管理员入口" is-link />
  <van-cell title="当前版本" value="0.0.1" />
</template>
