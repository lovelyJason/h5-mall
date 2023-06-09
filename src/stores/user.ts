import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import WEBAPI from 'apifm-webapi'
import _ from 'lodash'
// import AUTH from '@/utils/auth.js'

// 设置store的值可以通过$patch或者调用这里的函数

export const useUserStore = defineStore('user', () => {
  let localUserData: Record<string, any> = {}
  try {
    const localUserDataStr = localStorage.getItem('userData')
    if (localUserDataStr) {
      localUserData = JSON.parse(localUserDataStr)
    }
  } catch (error) {
    
  }
  let data = !_.isEmpty(localUserData) ? localUserData : {
    base: {
      id: 0,
      nick: '',
      referrer: '',// 邀请人
      isSeller: false,
      avatarUrl: ''
    },
    ext: {},
    userLevel: {},
    saleDistributionTeam: {
      name: '',
      leader: 0,
      deputyLeader: 0,
      standardSaleroom: '',
      curSaleroom: ''
    },
    // 邀请人的信息
    referrer: {
      avatarUrl: '',
      nick: '',
      uid: 0  // 用户uid就是编号
    }  
  }
  const userData = reactive(data)

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

  async function getNewToken(data: WxmpAuthRequest): Promise<any> {
    // const wxcode = route.query.code
    const authInfo = await WEBAPI.wxmpAuth(data)
    if(authInfo.code != 0) {

    } else {
      const token = authInfo.data.token
      localStorage.setItem('token', token)
    }
    return authInfo
  }
  // 要保证调用之前token是有效的
  async function getUserApiInfo(): Promise<object | null> {
    const token = localStorage.getItem('token')
    const res = await WEBAPI.userDetail(token as string)
    // const userWxinfo = await WEBAPI.userWxinfo(token) // 只返回openid,userId
    if (res.code == 0) {
      userData.base = res.data.base
      userData.ext = res.data.ext
      userData.userLevel = res.data.userLevel
      userData.saleDistributionTeam = res.data.saleDistributionTeam
      userData.referrer = res.data.referrer
      localStorage.setItem('userData', JSON.stringify(res.data))
      return userData
    } else {
      return null
    }
  }

  return { userData, checkHasLogined, getNewToken, getUserApiInfo }
})
