import WEBAPI from 'apifm-webapi'

// 检测登录状态，返回 true / false
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
  console.log(checkTokenRes)
  if (checkTokenRes.code != 0) {
    localStorage.removeItem('token')
    return false
  }
  return true
}

async function authorize() {
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

export default {
  checkHasLogined,
  authorize
}