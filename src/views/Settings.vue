<script setup lang="ts">
import Topbar from '@/components/Topbar.vue';
import { useRouter } from 'vue-router';
import { version } from '../../package.json'
import { showSuccessToast } from 'vant';

const router = useRouter()

const clearStorage = () => {
  localStorage.clear()
  showSuccessToast('已清除')
}

</script>

<template>
  <Topbar title="设置" v-if="!isInWechat" />
  <van-cell title="关于我们" is-link @click="router.push('/settings/aboutus')" />
  <van-cell title="清除缓存" is-link @click="clearStorage" />
  <!-- <van-cell title="管理员入口" is-link /> -->
  <van-cell title="当前版本" :value="version" />
</template>
