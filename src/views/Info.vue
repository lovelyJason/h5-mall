<template>
  <div class="info-page">
    <van-cell-group>
      <van-cell v-for="(item, index) in infoList" :key="index" :title="item.label" :value="item?.value ? String(item.value) : '-'" />
    </van-cell-group>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getBrowserInfo } from '@/utils/getBrowserInfo';
import type { BrowserInfo } from '@/utils/getBrowserInfo';

const clientInfo: Readonly<BrowserInfo> = getBrowserInfo();
const infoList = ref(
  Object.keys(clientInfo).map((k) => ({
    label: k,
    value: clientInfo[k],
  })),
);
console.log(infoList.value)
</script>

<stye scoped lang="scss">
  .info-page {
    margin-top: 8px;
  }
</stye>