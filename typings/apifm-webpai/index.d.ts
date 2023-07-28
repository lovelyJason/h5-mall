// Project: apifi-webapi
// Definitions by: jasonhuang <https://github.com/lovelyJason>

/************************************************
*                                               *
*                 api工厂  API                *
*                                               *
************************************************/
interface ApifmResponse {
  code: number;
  data: any
}
interface WxmpAuthRequest {
  code: string, // 微信登录接口返回的 code 参数数据
  postJsonString?: string  // 用户的扩展数据
  referrer?: number // 邀请人用户id， 还是用户编号？？
}
declare module 'apifm-webapi' {
  namespace ApifmWebapi {
    function init2(a: string, b: string): void
    function init(b: string): void
    /**
     * 
     * @param url 当前url，可通过location.href获取
     * @param token 登录接口返回的token，用户登录凭证
     */
    function jssdkSign(b: string, token?: string): Promise<ApifmResponse>
    /**
     * 获取用户可用余额、积分等资产
     * @param token 用户登录凭证
     */
    function userAmount(token: string): Promise<ApifmResponse>
    /**
     * 获取用户微信绑定的手机号码，好像是小程序接口，h5用不了
     * @param code 网页授权的code
     */
    // function fetchWxaMobile(code: string): Promise<ApifmResponse>
    /**
     * 检测 token是否有效
     * @param token 用户登录凭证
    */
    function checkToken(token: string): Promise<ApifmResponse>
    /**
     * 用code交换token
     *  @param code 网页验证授权的code
     * 
     */
    function wxmpAuth(data: WxmpAuthRequest): Promise<ApifmResponse>
    /**
     *  @param token 用户登录凭证
     */
    function userDetail(token: string): Promise<ApifmResponse>
    /**
     *  @param id 商品id
     *  @param token 用户登录凭证
     */
    function goodsDetail(id: string, token: string): Promise<ApifmResponse>
    /**
     * 获取用户可用余额、积分等资产
     *  @param token 用户登录凭证
     */
    function userAmount(token: string): Promise<ApifmResponse>
    /**
     * 创建预下单或者订单
     *  @param token 用户登录凭证
     */
    function userAmount(token: string): Promise<ApifmResponse>
    /**
     * 读取系统参数（批量）
     *  @param config 配置参数，逗号分割
     */
    function queryConfigBatch(config: string): Promise
    /**
     * 提交订单
     *  @param data 配置参数，逗号分割
        ● id 订单
        ● orderNumber 订单号
        ● amount 货款
        ● amountTotleOriginal 优惠钱商品金额
        ● amountReal 实际需要支付金额
        ● amountCoupons 优惠券抵扣金额
        ● amountCard 会员卡抵扣金额
        ● amountLogistics 运费
        ● deductionMoney 优惠金额
        ● couponUserList 本次下单可以选择使用的优惠券数组
        ● amountTotle 订单总金额
        ● goodsNumber 商品数量
        ● score 需要扣除多少积分
     */
    function orderCreate(data: any): Promise<ApifmResponse>
    /**
     * 用余额支付订单
     * @param token 登录凭证
     * @param orderId 6位数订单id
     */
    function orderPay(token: string, orderId: stirng): Promise<ApifmResponse>
    /**
     * 微信公众号支付
     * @param data 支付数据
     */
    function wxpayJsapi(data: any): Promise<ApifmResponse>
    /**
     * 发起支付通用方法，所有的在线支付接口，均可以使用该接口发起支付，和使用具体的支付接口实现的功能是一样的
     * @param url 
     * @param data 
     */
    function payVariableUrl(url: string, data: any): Promise<ApifmResponse>
    /**
     * 订单统计
     * @param token 登录凭证
     */
    function orderStatistics(token: string): Promise<ApifmResponse>
    /**
     * 获取订单列表
     * @param token 登录凭证
     */
    function orderList(token: string): Promise<ApifmResponse>
    /**
     * 关闭订单
     * @param token 登录凭证
     * @param orderId 订单id
     */
    function orderClose(token: string, orderId: string | number): Promise<ApifmResponse>
    /**
     * 读取广告位
     * @param key key
     */
    function adPosition(key: string): Promise<ApifmResponse>
    /**
     * 
     * @param token 登录凭证
     * @param uid 用户编号，member里的uids
     */
    function userDetailSpreadUser(token: string, uid: string): Promise<ApifmResponse>
    /**
     * 获取佣金记录
     * @param data 
     */
    function fxCommisionLog(data: any): Promise<ApifmResponse>
    /**
     * 申请成为分销商进度
     * @param token 登录凭证
     */
    function fxApplyProgress(token: string): Promise<ApifmResponse>
    /**
     * 无限生成小程序码
     * @param token 
     */
    function wxaQrcode(token: string): Promise<ApifmResponse>
    /**
     * 获取资金明细
     * @param data 包含token的一些数据
     */
    function cashLogsV2(data: any): Promise<ApifmResponse>
    /**
     * 获取订单详情
     * @param token 
     * @param id 订单id
     */
    function orderDetail(token: string, id: number | string): Promise<ApifmResponse>
    /**
     * 获取商品交易动态，返回最新的10条数据
     * @param data 
     */
    function goodsDynamic(data: Record<string, any>): Promise<ApifmResponse>
    /**
     * 读取Banner轮播图
     * @param data 
     */
    function banners(data: Record<string, any>): Promise<ApifmResponse>
    /**
     * 获取订单退款记录
     * @param token 登录返回的token 
     * @param orderId 订单id 
     */
    function orderRefunds(token: string, orderId: string): Promise<ApifmResponse>
  }
  export = ApifmWebapi
}
