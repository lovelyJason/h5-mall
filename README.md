# 微信公众号网页开发步骤

以下接口有微信的api请求形式和api工厂的sdk apifm-webapi调用形式；另外下文的access_token与基础支持的access_token不同
只是公众号的网页开发，不涉及微信公众号的其他接口

## 网页授权

场景：如果用户在微信客户端中访问第三方网页，公众号可以通过微信网页授权机制，来获取用户基本信息，进而实现业务逻辑。


首先要在公众后台增加回调域名，现在只有认证的服务号和测试号才能有权限调用这个功能，个人订阅号，个人订阅号未认证，未认证服务号都不能调用。在测试公众号的网页服务---网页账号---网页授权获取用户基本信息，修改回调页面域名

### 开发指南

> 网页授权流程分为四步：
    1. 引导用户进入授权页面同意授权，获取code
    2. 通过code换取网页授权access_token（与基础支持中的access_token不同）
    3. 如果需要，开发者可以刷新网页授权access_token，避免过期
    4. 通过网页授权access_token和openid获取用户基本信息（支持UnionID机制）

#### 引导用户进入授权页面同意授权，获取code

在确保微信公众账号拥有授权作用域（scope参数）的权限的前提下（已认证服务号，默认拥有scope参数中的snsapi_base和snsapi_userinfo 权限），引导关注者打开如下页面：

> 参考链接(请在微信客户端中打开此链接体验)：

> scope为snsapi_base：

> https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx520c15f417810387&redirect_uri=https%3A%2F%2Fchong.qq.com%2Fphp%2Findex.php%3Fd%3D%26c%3DwxAdapter%26m%3DmobileDeal%26showwxpaytitle%3D1%26vb2ctag%3D4_2030_5_1194_60&response_type=code&scope=snsapi_base&state=123#wechat_redirect

> scope为snsapi_userinfo：

> https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx807d86fb6b3d4fd2&redirect_uri=http%3A%2F%2Fdevelopers.weixin.qq.com&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect

前者是静默授权自动跳到回调页，后者需要用户手动同意授权

尤其注意：由于授权操作安全等级较高，所以在发起授权请求时，微信会对授权链接做正则强匹配校验，如果链接的参数顺序不对，授权页面将无法正常访问

如果用户同意授权，页面将跳转至 `{redirect_uri}/?code=CODE&state=STATE`。

#### 通过code换取网页授权access_token

这里的access_token同普通的access_token不一样，只能调用jssdk中的接口。如果网页授权的作用域为snsapi_base，则本步骤中获取到网页授权access_token的同时，也获取到了openid，snsapi_base式的网页授权流程即到此为止。该access_token过期时间同样是7200s

> https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code

请求参数：
- appid
- secret: 公众号的appSecret
- code: 上一步返回的code
- grant_type: authorization_code

返回的JSON数据

```json
{
  "access_token":"ACCESS_TOKEN",
  "expires_in":7200,
  "refresh_token":"REFRESH_TOKEN",
  "openid":"OPENID",  // 用户唯一标识
  "scope":"SCOPE",
  "is_snapshotuser": 1,
  "unionid": "UNIONID"
}
```

使用sdk:
```javascript
WEBAPI.wxmpAuth({code: 'url中的code参数'})
// 返回data: openid, token, uid
```

#### 拉取用户信息

同 用户管理 > 获取用户基本信息(UnionID机制)处的接口不同， ACCESS_TOKEN也不是一样的作用范围

需要网页授权作用域为snsapi_userinfo，拿上一步返回的ACCESS_TOKEN，openid请求接口

> http：GET（请使用https协议）：

> https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN

返回数据

```json
{   
  "openid": "OPENID",
  "nickname": "NICKNAME",
  "sex": 1,
  "province":"PROVINCE",
  "city":"CITY",
  "country":"COUNTRY",
  "headimgurl":"https://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
  "privilege":[ "PRIVILEGE1" "PRIVILEGE2"     ],
  "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
}
```

| 参数       | 描述                                                         |
| ---------- | ------------------------------------------------------------ |
| openid     | 用户的唯一标识                                               |
| nickname   | 用户昵称                                                     |
| sex        | 用户的性别，值为1时是男性，值为2时是女性，值为0时是未知      |
| province   | 用户个人资料填写的省份                                       |
| city       | 普通用户个人资料填写的城市                                   |
| country    | 国家，如中国为CN                                             |
| headimgurl | 用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空。若用户更换头像，原有头像URL将失效。 |
| privilege  | 用户特权信息，json 数组，如微信沃卡用户为（chinaunicom）     |
| unionid    | 只有在用户将公众号绑定到微信开放平台帐号后，才会出现该字段。 |

使用sdk：

```javascript
WEBAPI.userWxinfo(token) // token 当前用户登陆凭证?应该是网页授权返回的token吧, 
// 返回userId == 下面接口的base.id（后台里的用户编号）, openId

WEBAPI.userDetail(token) // 这个是拉去的后台里面的用户信息；用户首次访问绑定过appId的公众号，会自动注册为用户
// 返回base.id, base.nick，base.userId != base.id
```
```json
{
  "code": 0,
  "data": {
    "unionid": "oFqSRwf0Bw2Qy2Dm3M0HIgbFRtHM",
    "openid": "om3AQ0YaRp3RZtFuZ1Wgk0OdQjvA"
  },
  "msg": "success"
}
```

#### 一些其他接口

- 检验授权凭证access_token是否有效，需要传入access_token和openid

> http：GET（请使用https协议）：

> https://api.weixin.qq.com/sns/auth?access_token=ACCESS_TOKEN&openid=OPENID

```javascript
WEBAPI.checkToken(token)
```

## js sdk

通过使用微信JS-SDK，网页开发者可借助微信高效地使用拍照、选图、语音、位置等手机系统的能力，同时可以直接使用微信分享、扫一扫、卡券、支付等微信特有的能力，为微信用户提供更优质的网页体验。

使用步骤

1. 公众号设置 --- 功能设置，填写js安全域名
2. 引入js，暴漏全局变量wx
3. 调用wx.config，每个页面必须注入配置信息才能调用接口
4. 通过wx.ready处理成功验证

wx.config其中涉及到加密，加密需要在后端执行

```javascript
wx.config({
  debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
  appId: '', // 必填，公众号的唯一标识
  timestamp: null, // 必填，生成签名的时间戳
  nonceStr: '', // 必填，生成签名的随机串
  signature: '',// 必填，签名
  jsApiList: [] // 必填，需要使用的JS接口列表
});
```

如果使用api工厂的sdk，则

```typescript
type SignType = {
  appid: string // 小写吗？
  timestamp: number,
  noncestr: string,
  sign: string
}

const res = await WEBAPI.jssdkSign('/jasonhuang/wx/jssdk/sign', 'post', postData)
const { code, data: SignType } = res
```

这样就可以调用wx js sdk的所有接口了，当然前提是你的公众号符号接口的调用资质

## web开发者工具

使用注意事项，在打开授权链接时，如果成功授权，则会跳到最终页面带上code参数，code只能使用一次,但是access_token有两个小时使用期，可以先缓存起来

## 一些变更

WEBAPI.goodsDetail，即shop/goods/detail接口入参少了token参数