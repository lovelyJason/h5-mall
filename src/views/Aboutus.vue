<script setup lang="ts">
import { reactive, inject, onMounted } from 'vue'
import Topbar from '@/components/Topbar.vue';

const WEBAPI: any = inject('$WEBAPI')

const cmsPageDetail: any = reactive({})

const getContent = () => {
  const key = 'aboutus'
  WEBAPI.cmsPage(key).then((res: any) => {
    if(res.code == 0) {
      Object.assign(cmsPageDetail, res.data)
    }
  })
}

onMounted(() => {
  getContent()
})
</script>

<template>
  <div class="page">
    <Topbar title="关于我们" />
    <van-empty v-if="!cmsPageDetail.id" description="请在后台添加内容" />
    <div v-else class="content">
      <div v-html="cmsPageDetail.content"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.content {
  padding: convertRpxToVw(32);
  color: #333;
  line-height: convertRpxToVw(64);
}
</style>