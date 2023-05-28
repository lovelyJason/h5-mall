import wx from 'weixin-js-sdk'

wx.setStorage = function(key: string, value: string) {
  localStorage.setItem(key, value)
}
wx.getStorage = function(key: string) {
  return localStorage.getItem(key)
}

export default wx