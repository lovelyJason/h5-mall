import wx from 'weixin-js-sdk'
import WEBAPI from 'apifm-webapi'

/**
 * 根据url获取jssdk sign签名
 */
declare module 'weixin-js-sdk' {
  function configByurl(url: string, jsApiList: string[]): void
}
export interface JssdkSign {
  appid: string
  noncestr: string
  sign: string
  timestamp?: number
}

//存储各个链接的签名信息
const signMap = new Map(); 

wx.setStorage = function(key: string, value: string) {
  localStorage.setItem(key, value)
}
wx.getStorage = function(key: string) {
  return localStorage.getItem(key)
}

function _wxConfigJSSDK(data: JssdkSign, jsApiList: string[]) {
  // console.log(import.meta.env)
  // BASE_URL, DEV, MODE, PROD, SSR
  wx.config({
    debug: import.meta.env.DEV ? true : false,
    appId: data.appid,
    timestamp: data.timestamp,
    nonceStr: data.noncestr,
    signature: data.sign,
    jsApiList: jsApiList
  })
}

// wx.configByurl(encodeURIComponent(location.href.split('#')[0]), ['updateAppMessageShareData'])
wx.configByurl = async function(url: string, jsApiList: string[]) {
  if(signMap.has(url)) {
    _wxConfigJSSDK(signMap.get(url), jsApiList)
  } else {
    // 文档中好像没有做encodeURIComponent处理
    const res = await WEBAPI.jssdkSign(url)
    if(res.code == 0) {
      const data = res.data;
      signMap.set(url, data);
      _wxConfigJSSDK(data, jsApiList);
    }
  }
}

export default wx