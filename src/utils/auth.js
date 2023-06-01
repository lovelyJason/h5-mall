import WEBAPI from 'apifm-webapi'
import { showFailToast } from 'vant';

// user store本来能处理的，但是路由文件中使用store好像会报错，调用这里先
// 检测登录状态，返回 true / false
export async function checkHasLogined() {
  const token = localStorage.getItem('token')
  if (!token) {
    return false
  }
  const checkTokenRes = await WEBAPI.checkToken(token)
  if (checkTokenRes.code != 0) {
    localStorage.removeItem('token')
    return false
  }
  return true
}

/**
 * 重定向到微信授权页
 * @param silent 是否静默授权
 * @param redirect_uri 授权后的回调地址，内部会encodeURI
 * @param state 重定向后的参数
 */
export const redirectToWechatAuth = (silent, redirect_uri, state) => {
  state = state || 'STATE'
  let appid = 'wx57cc82fcf2f0c868'
  let scope = silent ? 'snsapi_base' : 'snsapi_userinfo'
  // redirect_uri需要urlEncode处理
  if(redirect_uri) {
    redirect_uri = encodeURI(redirect_uri) 
  } else {
    redirect_uri = 'http%3A%2F%2F127.0.0.1:5173/order?t=eyJpZCI6ODQ3MzUwOH0='
    // redirect_uri = 'http://127.0.0.1:5173/order?t=eyJpZCI6ODQ3MzUwOH0='
  }
  location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
  // alert(location.href) // 不是跳转后的带有code参数的页面
}

export async function getNewToken(data) {
  // const wxcode = route.query.code
  const authIno = await WEBAPI.wxmpAuth(data)
  if(authIno.code != 0) return null
  const token = authIno.data.token
  localStorage.setItem('token', token)
  return token 
}

export const wxWebpageLogin = async (router) => {
  // 1.重定向到微信授权页，静默或非静默
  const route = router.currentRoute.value
  try {
    // ?t=eyJpZCI6ODQ3MzUwOH0= 一串base64编码，含有邀请人的用户编号
    const params = JSON.parse(window.atob(route.query.t))
    let data  = {
      code: route.query.code,
      referrer: params.id
    }
    await user.getNewToken(data)
    router.push('/mine')
  } catch (error) {
    // 邀请参数非法
    showFailToast('参数非法')
  }
}

export async function authorize() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: function (res) {
        const code = res.code
        let referrer = '' // 推荐人
        let referrer_storge = wx.getStorage('referrer');
        if (referrer_storge) {
          referrer = referrer_storge;
        }
        // 下面开始调用注册接口
        const extConfigSync = wx.getExtConfigSync()
        if (extConfigSync.subDomain) {
          WEBAPI.wxappServiceAuthorize({
            code: code,
            referrer: referrer
          }).then(function (res) {
            if (res.code == 0) {
              wx.setStorageSync('token', res.data.token)
              wx.setStorageSync('uid', res.data.uid)
              resolve(res)
            } else {
              wx.showToast({
                title: res.msg,
                icon: 'none'
              })
              reject(res.msg)
            }
          })
        } else {
          WEBAPI.authorize({
            code: code,
            referrer: referrer
          }).then(function (res) {
            if (res.code == 0) {
              wx.setStorageSync('token', res.data.token)
              wx.setStorageSync('uid', res.data.uid)
              resolve(res)
            } else {
              wx.showToast({
                title: res.msg,
                icon: 'none'
              })
              reject(res.msg)
            }
          })
        }
      },
      fail: err => {
        reject(err)
      }
    })
  })
}
