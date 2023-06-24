export function convertOrderStatus(status: number) {
  switch (status) {
    case -1:
      return '已关闭'
    case 0:
      return '待支付'
    case 1:
      return '已支付代发货'
    case 2:
      return '已发货待确认'
    case 3:
      return '确认收货待评价'
    case 4:
      return '已评价'
  }
}
export function convertGantanhaoOrderStatus(status: number | string) {
  if(typeof status === 'string') {
    status = Number.parseInt(status)
  }
  switch (status) {
    case -460:
      return '开卡失败'
    case 550:
      return '已发货'
    case 120:
      return '初步审核'
    case 0:
      return '订单终止'
    case 100:
      return '已支付'
    case 125:
      return '敏感地区待审核'
    case 200:
      return '待审核'
    case 450:
      return '待开卡'
    case 460:
      return '已领取'
    case 470:
      return '开卡中'
    case 500:
      return '待发货'
    case -120:
      return '信息审核失败'
  }
}