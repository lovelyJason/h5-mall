// Project: apifi-webapi
// Definitions by: jasonhuang <https://github.com/lovelyJason>

/************************************************
*                                               *
*                 api工厂  API                *
*                                               *
************************************************/
declare module 'apifm-webapi' {
  namespace MyLib {
    function init2(a: string, b: string): void
    function init(b: string): void
    /**
     * 
     * @param url 当前url，可通过location.href获取
     * @param token 登录接口返回的token
     */
    function jssdkSign(b: string, token?: string): void
  }
  export = MyLib
}
