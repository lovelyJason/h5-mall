import type { Router } from "vue-router"

declare function checkHasLogined(): Promise;
declare function redirectToWechatAuth(silent: boolean, redirect_url?: string, state?: string): void;
declare function getNewToken(data: WxmpAuthRequest): Promise;
declare function getMyNewToken(code: string): Promise;
declare function authorize(): Promise;
 
export { checkHasLogined, redirectToWechatAuth, getNewToken, getMyNewToken, wxWebpageLogin, authorize }
