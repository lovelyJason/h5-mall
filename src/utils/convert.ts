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