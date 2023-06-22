import axios from 'axios'
import _ from 'lodash'
import Promise from 'bluebird'

const NETWORK_ERROR_MESSAGE = '网络异常'
const SERVER_ERROR_MESSAGE = '系统异常'
const UNEXPETED_STATUS = -1
const SUCCESS_STATUS = 0
const EMPTY_LIST = 6003

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  baseURL: '/',
  timeout: 1000 * 60 * 5,
  transformResponse: [
    (data) => {
      if (data) {
        try {
          data = JSON.parse(data)
        } catch (e) {
          // alert('服务器异常,请重试!');
        }
      }
      return data
    }
  ]
})

api.interceptors.request.use((config) => {
  const ret = _.assign({}, config, {
    headers: _.assign({}, config.headers, {
      // 'X-Token': token
    })
  })
  return ret
})

api.interceptors.response.use(
  (response) => {
    const code =
      typeof response.data.code !== 'undefined' ? response.data.code : UNEXPETED_STATUS
    if (typeof code !== 'number' || (code !== SUCCESS_STATUS && code !== EMPTY_LIST)) {
      const newData = _.defaults({}, response.data, {
        msg: SERVER_ERROR_MESSAGE,
        code: UNEXPETED_STATUS
      })
      return Promise.reject(newData)
    }
    return response.data || {}
  },
  () => {
    return Promise.reject({
      msg: NETWORK_ERROR_MESSAGE,
      code: UNEXPETED_STATUS
    })
  }
)

export default api
