// 先放这里待定，位置可能要挪一下
import { useUserStore } from '@/stores/user';
import { showFailToast } from 'vant';
import type { Router } from 'vue-router';

const user = useUserStore()

/**
 * 重定向到微信授权页
 * @param silent 是否静默授权
 * @param redirect_uri 授权后的回调地址，内部会encodeURI
 * @param state 重定向后的参数
 */
export const redirectToWechatAuth = (silent: boolean, redirect_uri?: string,  state?: string) => {
  state = state || 'STATE'
  let appid = 'wx57cc82fcf2f0c868'
  let scope = silent ? 'snsapi_base' : 'snsapi_userinfo'
  // redirect_uri需要urlEncode处理
  if(redirect_uri) {
    redirect_uri = encodeURI(redirect_uri) 
  } else {
    redirect_uri = 'http%3A%2F%2F127.0.0.1:5173/invite?t=eyJpZCI6ODQ3MzUwOH0='
  }
  location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
  // alert(location.href) // 不是跳转后的带有code参数的页面
}

export const wxWebpageLogin = async (router: Router) => {
  // 1.重定向到微信授权页，静默或非静默
  const route = router.currentRoute.value
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
    // 邀请参数非法
    showFailToast('参数非法')
  }
}

