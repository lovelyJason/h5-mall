/**
 * userDetail
 * /user/detail
 * 获取用户详情
 * base 数据存放了用户的基础信息；
  idcard 数据存放了用户的实名认证信息[如果用户有通过实名认证的话]
  ext 数据存放了用户的扩展属性
  referrer: 我的邀请人信息
  userLevel: 我的等级信息
  https://api.it120.cc/doc.html#/%E5%89%8D%E7%AB%AFapi%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3/%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86/detailUsingGET_102
 * 
 */

interface userDetail {
  base: object,
  referrer: object,
  userLevel: Objct
}

/**
 * cardMyList
 * /card/my
 * 我的会员卡
 * https://api.it120.cc/doc.html#/%E5%89%8D%E7%AB%AFapi%E6%8E%A5%E5%8F%A3%E6%96%87%E6%A1%A3/%E4%BC%9A%E5%91%98%E5%8D%A1/myUsingGET_1
 */

/**
 * checkToken
 * /user/check-token
 * 检测token是否有效
 */

/**
 * shippingCarInfo
 * /shopping-cart/info
 * 读取购物车数据
 */

/**
 * goodsDetail
 * /shop/goods/detail
 * 商品详情
 */