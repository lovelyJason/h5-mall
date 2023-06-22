import api from '../lib/request'

export function getWxUserInfo(code: string, id: string) {
  return api.get(`https://mall.qdovo.com/api/v1/wx/user?code=${code}&id=${id}`)
}