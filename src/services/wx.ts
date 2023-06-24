import api from '../lib/request'

export function getMyNewToken(code: string, id: string) {
  return api.get(`https://mall.qdovo.com/api/v1/wx/user?code=${code}`)
}