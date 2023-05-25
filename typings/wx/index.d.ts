// Project: apifi-webapi  1.6.0
// Definitions by: jasonhuang <https://github.com/lovelyJason>
// wx-js-sdk: http://res.wx.qq.com/open/js/jweixin-1.6.0.js
// 这个仅仅只是公众号的网页开发sdk,我理解的是不需要access_token,没有实质的url，使用手机系统功能和微信特有能力，还有其他接口如管理用户 卡券之类的接口不在这里
// 公众号开发文档：https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html

/************************************************
*                                               *
*                 微信公众号 jssdk                *
*                                               *
************************************************/

/**
 * jssdk操作步骤
 * 一：“公众号设置”的“功能设置”里填写“JS接口安全域名”
 * 二：引入js文件
 * 三：通过config接口注入权限验证配置
 * 四：通过ready接口处理成功验证
 * 五：通过error接口处理失败验证
 * https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html
 */

type MiniProgramType = {
  /**
   * 
   * @param e 
   * @returns 111这里会显示在vscode智能感知上
   */
  getEnv: (e: any) => void
  navigateBack: (e: any) => void
  navigateTo: (e: any) => void
  postMessage: (e: any) => void
  reLaunch: (e: any) => void
  redirectTo: (e: any) => void
  switchTab: (e: any) => void
}
type AddCardType = {    // TODO: extends公共的类型比如success，fail，complete,cancel
  cardList: [],
  success?: (e: object) => object
}
declare module 'weixin-js-sdk' {
  namespace jssdk {
    /**
     * 微信卡券
     * 批量添加卡券接口
     * @param e
     */
    function addCard(e: AddCardType): void
    /**
     * 基础接口
     * 判断当前客户端版本是否支持指定JS接口
     * @param e 
     */
    function checkJsApi(e: any): void
    /**
     * 微信卡券
     * 拉取适用卡券列表并获取用户选择信息
     * @param e 
     */
    function chooseCard(e: any): void
    /**
     * 图像接口
     * 拍照或从手机相册中选图接口
     * @param e 
     */
    function chooseImage(e: any): void
    /**
     * 微信支付
     * 发起一个微信支付请求
     * @param e 
     */
    function chooseWXPay(e: any): void
    /**
     * 界面操作
     * 关闭当前网页窗口接口
     * @param e 
     */    
    function closeWindow(e: any): void
    /**
     * 注入权限验证配置
     * 所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用
     * @param e 
     */
    function config(e: any): void
    
    function consumeAndShareCard(e: any): void
    /**
     * 图像接口
     * 下载图片接口
     * @param e 
     */
    function downloadImage(e: any): void
    /**
     * 音频接口
     * 下载语音接口
     * @param e 
     */
    function downloadVoice(e: any): void
    /**
     * 通过error接口处理失败验证
     * @param e 
     */
    function error(e: any): void
    /**
     * 图像接口
     * 获取本地图片接口
     * @param e 
     */
    function getLocalImgData(e: any): void
    /**
     * 地理位置
     * 获取地理位置接口
     * @param e 
     */
    function getLocation(e: any): void
    /**
     * 设备信息
     * 获取网络状态接口
     * @param e 
     */
    function getNetworkType(e: any): void
    /**
     * 界面操作
     * 隐藏所有非基础按钮接口
     * @param e 
     */
    function hideAllNonBaseMenuItem(e: any): void
    /**
     * 界面操作
     * 批量隐藏功能按钮接口
     * @param e 
     */
    function hideMenuItems(e: any): void

    function hideOptionMenu(e: any): void

    function launchMiniProgram(e: any): void

    var miniProgram: MiniProgramType
    /**
     * 分享接口
     * 获取“分享给朋友”按钮点击状态及自定义分享内容接口（即将废弃）
     * @param e
     */
    function onMenuShareAppMessage(e: any): void
    /**
     * 分享接口
     * 获取“分享到QQ”按钮点击状态及自定义分享内容接口（即将废弃）
     * @param e
     */
    function onMenuShareQQ(e: any): void
    /**
     * 分享接口
     * 获取“分享到QQ空间”按钮点击状态及自定义分享内容接口（即将废弃）
     * @param e
     */
    function onMenuShareQZone(e: any): void
    /**
     * 分享接口
     * 获取“分享到朋友圈”按钮点击状态及自定义分享内容接口（即将废弃）
     * @param e
     */
    function onMenuShareTimeline(e: any): void
    /**
     * 分享接口
     * 获取“分享到腾讯微博”按钮点击状态及自定义分享内容接口
     * @param e
     */
    function onMenuShareWeibo(e: any): void
    /**
     * 摇一摇周边
     * 监听周边ibeacon设备接口
     * @param e
     */
    function onSearchBeacons(e: any): void
    /**
     * 音频接口
     * 监听语音播放完毕接口
     * @param e
     */
    function onVoicePlayEnd(e: any): void
    /**
     * 监听录音自动停止接口
     * @param e
     */
    function onVoiceRecordEnd(e: any): void
    /**
     * 共享收货地址接口
     * @param e
     */
    function openAddress(e: any): void

    function openBusinessView(e: any): void
    /**
     * 查看微信卡包中的卡券接口
     * @param e
     */
    function openCard(e: any): void

    function openEnterpriseChat(e: any): void

    function openEnterpriseRedPacket(e: any): void
    /**
     * 使用微信内置地图查看位置接口
     * @param e
     */
    function openLocation(e: any): void
    /**
     * 微信小店
      跳转微信商品页接口
     * @param e
     */
    function openProductSpecificView(e: any): void
    /**
     * 音频接口
      暂停播放接口
     * @param e
     */
    function pauseVoice(e: any): void
    /**
     * 音频接口
      播放语音接口
     * @param e
     */
    function playVoice(e: any): void
    /**
     * 图像接口
      预览图片接口
     * @param e
     */
    function previewImage(e: any): void
    /**
     * 通过ready接口处理成功验证
     * @param e
     */
    function ready(e: any): void
    /**
     * 微信扫一扫
     * 调起微信扫一扫接口
     * @param e
     */
    function scanQRCode(e: any): void
    /**
     * 界面操作
     * 显示所有功能按钮接口
     * @param e
     */
    function showAllNonBaseMenuItem(e: any): void
    /**
     * 界面操作
     * 批量显示功能按钮接口
     * @param e
     */
    function showMenuItems(e: any): void

    function showOptionMenu(e: any): void
    /**
     * 音频接口
     * 开始录音接口
     * @param e
     */
    function startRecord(e: any): void
    /**
     * 摇一摇周边
     * 开启查找周边ibeacon设备接口
     * @param e
     */
    function startSearchBeacons(e: any): void
    /**
     * 音频接口
     * 停止录音接口
     * @param e
     */
    function stopRecord(e: any): void
    /**
     * 摇一摇周边
     * 关闭查找周边ibeacon设备接口
     * @param e
     */
    function stopSearchBeacons(e: any): void
    /**
     * 音频接口
     * 停止播放接口
     * @param e
     */
    function stopVoice(e: any): void
    /**
     * 智能接口
     * 识别音频并返回识别结果接口
     * @param e
     */
    function translateVoice(e: any): void
    /**
     * 分享接口
     * 自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
     * @param e
     */
    function updateAppMessageShareData(e: any): void
    /**
     * 分享接口
     * 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0）
     * @param e
     */
    function updateTimelineShareData(e: any): void
    /**
     * 图像接口
     * 上传图片接口.4.0）
     * @param e
     */
    function uploadImage(e: any): void
    /**
     * 音频接口
     * 上传语音接口
     * @param e
     */
    function uploadVoice(e: any): void
  }
  export = jssdk
}
// 这样以后，在组件中未导入wx，使用wx变量不会报红；但是微信公众号网页开发应该是要导入wx的
// declare var wx: {

// }