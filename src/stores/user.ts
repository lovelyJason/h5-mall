import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import WEBAPI from 'apifm-webapi'
// import AUTH from '@/utils/auth.js'

// 设置store的值可以通过$patch或者调用这里的函数

export const useUserStore = defineStore('user', () => {
  const isLogined = ref(true)
  const userData = reactive({
    base: {
      id: null,
      nick: '',
      referrer: '',// 邀请人
      isSeller: false,
      avatarUrl: ''
    }
  })

  async function checkHasLogined() {
    const token = localStorage.getItem('token')
    if (!token) {
      return false
    }
    // const loggined = await checkSession()
    // if (!loggined) {   // 小程序有用
    //   localStorage.removeItem('token')
    //   return false
    // }
    const checkTokenRes = await WEBAPI.checkToken(token)
    if (checkTokenRes.code != 0) {
      localStorage.removeItem('token')
      return false
    }
    return true
  }

  
  // TODO: 应作为common store
  function getStorage(key: string) {
    return localStorage.getItem(key)
  }

  function setStorage(key: string, value: string) {
    localStorage.setItem(key, value)
  }

  async function getNewToken(data: WxmpAuthRequest): Promise<string | null> {
    // const wxcode = route.query.code
    const authIno = await WEBAPI.wxmpAuth(data)
    if(authIno.code != 0) return null
    const token = authIno.data.token
    localStorage.setItem('token', token)
    return token
  }
  // 要保证调用之前token是有效的
  async function getUserApiInfo(): Promise<object | null> {
    const token = localStorage.getItem('token')
    const res = await WEBAPI.userDetail(token as string)
    // const userWxinfo = await WEBAPI.userWxinfo(token) // 只返回openid,userId
    if (res.code == 0) {
      userData.base = res.data.base
      return userData
    } else {
      // TODO:可以跳到微信授权页再回来
      return null
    }
  }

  return { userData, getStorage, setStorage, isLogined, checkHasLogined, getNewToken, getUserApiInfo }
})
