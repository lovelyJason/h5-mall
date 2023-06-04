import WEBAPI from 'apifm-webapi'  // 注意还有个apifm-WEBAPI
import wx from '@/lib/wx';
import { showConfirmDialog  } from 'vant';
import { showSuccessToast, showFailToast, showToast } from 'vant';

import type { Router } from 'vue-router';

// https://www.yuque.com/apifm/nu0f75/mghxuo

/**
 * type: order 支付订单 recharge 充值 paybill 优惠买单
 * data: 扩展数据对象，用于保存参数
 */

/**
  WEBAPI.wxpayJsapi({
    code: '',
    token: '000',
    money: 0.01,
    remark: '优惠买单 ：0.01',
    payName: '优惠买单'
  })
  ● code 微信网页授权返回的临时凭证，如果当前登陆用户已经绑定了服务号openid，则不需要传该参数，否则必传
  ● token 登陆凭证
  ● money 支付金额
  ● payName 支付界面显示的购买名称
  ● remark 备注信息，会记录到后台支付记录中的备注字段，可不传
  ● nextAction 支付成功以后，需要进行的下一步操作，可不传
  ● shopId 收款门店ID，可不传

  返回示例
  {
    "code": 0,
    "data": {
      "timeStamp": "1639303298714",
      "outTradeId": "ZF2112120443589175",
      "appid": "wxb3218336ce0c0966",
      "sign": "A405790D534A73BFE26B59503BF67328",
      "signType": "MD5",
      "prepayId": "wx12180138641891714e4f187581b25d0000",
      "nonceStr": "avXDO8rLjUQNwLFlvhsrhQbdGNmVsY"
  },
    "msg": "success"
  }

  收到接口返回以后，使用WeixinJSBridge调用发起支付 或 wxjssdk
 * 
 */

export interface WxPayJsApiConfig {
  code?: string
  token: string
  money: number
  payName: string
  remark?: string
  content: string
  nextAction?: any  // 支付成功后续动作https://www.it120.cc/help/aetmlb.html
  shopId?: number
}

export function wxpay(type: string, money: number, orderId: number, router: Router, redirectUrl: string, data?: any, content?: any) {
  const postData: WxPayJsApiConfig = {
    token: wx.getStorage('token') as string,
    money: money,
    remark: "在线充值",
    content: content ? content : '',
    payName: ''
  }
  if (type === 'order') {
    postData.remark = "支付订单 ：" + orderId;
    postData.nextAction = {
      type: 0,
      id: orderId
    };
  }
  if (type === 'paybill') {
    postData.remark = "优惠买单 ：" + data.money;
    postData.nextAction = {
      type: 4,
      uid: wx.getStorage('uid'),
      money: data.money
    };
  }
  if (type === 'fxsBuy') {
    postData.remark = "购买分销资格";
    postData.nextAction = {
      type: 13
    };
  }
  if (type === 'payTz') {
    postData.remark = "购买团长 ：" + money;
    postData.nextAction = {
      type: 14
    };
  }
  postData.payName = postData.remark as string;
  if (postData.nextAction) {
    postData.nextAction = JSON.stringify(postData.nextAction);  
  }
  // const url = wx.getStorage('wxpay_api_url')   // 错了
  // 调webapi通用或具体的pay api皆可
  // WEBAPI.payVariableUrl('/pay/wx/jsapi', postData).then(function(res: any) {
  WEBAPI.wxpayJsapi(postData).then(function(res: any) {
    if (res.code == 0) {
      // 收到接口返回以后，使用WeixinJSBridge调用发起支付 or jssdk
      // 发起支付，两种方法都可以
  
      // console.log(wxpayConfig)
      // @ts-ignore
      window.WeixinJSBridge.invoke('getBrandWCPayRequest', {
        'appId': res.data.appid,
        'timeStamp': res.data.timeStamp,
        'nonceStr': res.data.nonceStr,
        'package': 'prepay_id=' + res.data.prepayId,
        'signType': 'MD5',
        'paySign': res.data.sign
      },
      function(res: any) {
        if (res.err_msg === 'get_brand_wcpay_request:ok') {
          // this.$router.replace({ path: '/order-detail', query: { id: orderId }})
        }
        router.push(redirectUrl)
      })

      // let wxpayConfig = {
      //   appId: res.data.appid,
      //   timeStamp: res.data.timeStamp,
      //   nonceStr: res.data.nonceStr,
      //   package: 'prepay_id=' + res.data.prepayId,
      //   signType: res.data.signType,
      //   paySign: res.data.sign,
      // }
      // wx.chooseWXPay({
      //   ...wxpayConfig,
      //   success: function() {
      //     showSuccessToast('支付成功')
      //     router.push(redirectUrl)
      //   },
      //   fail: function(error: any) {
      //     console.log(error)
      //     showFailToast('支付失败' + error.msg || error.message)
      //     router.push(redirectUrl)

      //   }
      // })

    } else {
      showConfirmDialog({
        title: '出错了',
        message: JSON.stringify(res),
        showCancelButton: false
      }).then(() => {
        router.push(redirectUrl)
      })
    }
  })
}
