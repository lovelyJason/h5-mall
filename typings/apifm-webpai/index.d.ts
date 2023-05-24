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
  }
  export = MyLib
}
