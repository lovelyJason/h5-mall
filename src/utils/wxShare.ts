/* eslint-disable */
import WEBAPI from 'apifm-webapi'
import wx from 'weixin-js-sdk';

// wx.checkJsApi()
//存储各个链接的签名信息
const signMap = new Map(); 
// 设置默认的分享信息，因为如分享图、请求授权项、隐藏授权项等基本不变，此处设置直接引用，避免使用时繁琐设置
const defaultWxShareConfig = { 
	title: "分享标题（通常是动态的）", 
	desc: '分享描述（通常是动态的）',
	link: window.location.href,
	imgUrl: '分享图片地址',
	jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'hideMenuItems', 'closeWindow'],
	hideMenuList: ['menuItem:editTag', 'menuItem:delete', 'menuItem:originPage', 'menuItem:readMode','menuItem:openWithQQBrowser', 'menuItem:openWithSafari', 'menuItem:share:email', 'menuItem:share:brand']
} 
//存储临时的分享信息
type wxShareConfigType = {
	title?: string,
	desc?: string,
	link?: string,
	imgUrl?: string,
	jsApiList?: any,
	hideMenuList?: any
}
type shareSignType = {
	debug: boolean,
	appid: number | string,
	timestamp: number | string,
	noncestr: string,
	sign: string,
	jsAppList: []
}
const wxShareConfig: wxShareConfigType = {
	
}
 
const wxShare = {
    //各个页面加载后，调用此方法，传入的参数config是对象，其属性参考defaultWxShareConfig
	updateWxShareConfig(config: wxShareConfigType = {}) {
		wxShareConfig.title = config.title || defaultWxShareConfig.title;
		wxShareConfig.desc = config.desc || defaultWxShareConfig.desc;
        wxShareConfig.link = config.link || defaultWxShareConfig.link;
		wxShareConfig.imgUrl = config.imgUrl || defaultWxShareConfig.imgUrl;
        wxShareConfig.jsApiList = config.jsApiList || defaultWxShareConfig.jsApiList;
        wxShareConfig.hideMenuList = config.hideMenuList || defaultWxShareConfig.hideMenuList;

		var authUrl = window.location.href
		const ua = navigator.userAgent
		const isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1
		const isiOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
		if (isiOS) {
			authUrl = 'ios系统，授权地址必须使用第一次打开时候的地址，中途换的地址不识别'
		}
        //判断是否已经签名了
		if (signMap.has(authUrl)) {
			this._wxConfigJSSDK(signMap.get(authUrl));
		} else {
			this.wxShareAuth(authUrl);
		}
 
	},
 
    //从服务器获取某分享链接的签名信息，并存储起来
	async wxShareAuth(authUrl: string) {
        //此处我使用的是自己封装的网络请求方法
		// var postData = {
		// 	url: authUrl
		// }
		const res = await WEBAPI.jssdkSign(authUrl)
		if (res.code == 0) {
			//分享链接授权签名信息
			const sign = res.data;
			signMap.set(authUrl, sign);
			this._wxConfigJSSDK(sign);
		}
	},
 
    //将签名信息更新到微信的SDK中
	_wxConfigJSSDK(shareSign: shareSignType) {	// TODO:这个传入的是sign字符串，怎么这里成了对象？
		wx.config({
			debug: false,
			appId: shareSign.appid,	// TODO:值appid?
			timestamp: shareSign.timestamp,
			nonceStr: shareSign.noncestr,
			signature: shareSign.sign,
			jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline']
		})
        // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
		wx.ready(function() {
		    const {title,desc,link,imgUrl} = wxShareConfig;
			wx.onMenuShareAppMessage({
			    title,
				desc,
				link,
				imgUrl,
				success: function() {
					console.log("分享成功");
				},
				fail: function() {
					console.log("分享失败");
				},
				cancel: function() {
					console.log("取消分享");
				}
			})
			wx.onMenuShareTimeline({
				title,
				link,
				imgUrl,
				success: function() {
					console.log("分享成功");
				},
				cancel: function() {
				    console.log("取消分享");
				}
			})
			
		});
				  
		// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。	
		wx.error(function(res: object) {
			console.log("分享失败: error", res);
		});
		
	}
}
//导出工具类
export default wxShare;