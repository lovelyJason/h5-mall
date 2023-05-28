<script setup lang="ts">
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter()
const user = useUserStore()
const route = router.currentRoute.value

// /invite?t=eyJpZCI6ODQ3MzUwOH0= 一串base64编码，含有邀请人的用户编号
const wxWebpageLogin = async () => {
  try {
    const params = JSON.parse(window.atob(route.query.t as string))
    let data: WxmpAuthRequest  = {
      code: route.query.code as string,
      referrer: params.id
    }
    await user.getNewToken(data)
    router.push('/mine')
    // 然后url
  } catch (error) {
    
  }
}

onMounted(() => {
  wxWebpageLogin()
})
</script>

<template>

</template>