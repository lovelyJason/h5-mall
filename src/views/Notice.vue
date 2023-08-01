<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, reactive, onMounted, inject, toRefs } from 'vue'
import { useRouter } from 'vue-router';

const $WEBAPI: any = inject('$WEBAPI')
const WEBAPI = $WEBAPI

const router = useRouter()
const route = router.currentRoute.value

const data = reactive<any>({
  notice: {
    title: '',
    content: ''
  }
})

const getNoticeDetail = () => {
  WEBAPI.noticeDetail(route.query.id).then(function (res) {
    if (res.code == 0) {
      data.notice = res.data
    }
  })
}

onMounted(() => {
  getNoticeDetail()
})

</script>

<template>
  <div class="notice">
    <div class="title">{{data.notice.title}}</div>
    <div class="text">
      <div v-html="data.notice.content"></div>
    </div>
  </div>
</template>


<style scoped lang="scss">
.notice {
  padding: convertRpxToVw(32);
  font-size: convertRpxToVw(26);
  color: #333;
}
.title {
  width: 100%;
  font-weight: bold;
  border-bottom: convertRpxToVw(1) solid #eaeaea;
  padding-bottom: convertRpxToVw(32);
}
.text {
  margin-top: convertRpxToVw(32);
  line-height: convertRpxToVw(64);
}
.text image {
  max-width: 100%;
}
</style>