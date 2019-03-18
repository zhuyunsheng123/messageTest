import Axios from 'axios'
import { Alert } from 'react-native'

import configData from '../../app.json'
import * as StorageUtil from './StorageUtil'

const msgCode = {
  200: '成功处理了请求，一般情况下都是返回此状态码',
  201: '请求成功并且服务器创建了新的资源',
  202: '接受请求但没创建资源',
  203: '返回另一资源的请求',
  204: '服务器成功处理了请求，但没有返回任何内容',
  205: '服务器成功处理了请求，但没有返回任何内容',
  206: '处理部分请求',
  300: '针对请求，服务器可执行多种操作，服务器可根据请求者 (user agent) 选择一项操作，或提供操作列表供请求者选择',
  301: '请求的网页已永久移动到新位置，服务器返回此响应（对 GET 或 HEAD 请求的响应）时，会自动将请求者转到新位置',
  302: '服务器目前从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求',
  303: '请求者应当对不同的位置使用单独的 GET 请求来检索响应时，服务器返回此代码',
  304: '自从上次请求后，请求的网页未修改过，服务器返回此响应时，不会返回网页内容',
  305: '请求者只能使用代理访问请求的网页，如果服务器返回此响应，还表示请求者应使用代理',
  307: '服务器目前从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求',
  400: '服务器不理解请求的语法',
  401: '请求要求身份验证，对于需要登录的网页，服务器可能返回此响应',
  403: '服务器拒绝请求',
  404: '服务器找不到请求的网页',
  405: '禁用请求中指定的方法',
  406: '无法使用请求的内容特性响应请求的网页',
  407: '此状态代码与 401类似，但指定请求者应当授权使用代理',
  408: '服务器等候请求时发生超时',
  409: '服务器在完成请求时发生冲突，服务器必须在响应中包含有关冲突的信息',
  410: '如果请求的资源已永久删除，服务器就会返回此响应',
  411: '服务器不接受不含有效内容长度标头字段的请求',
  412: '服务器未满足请求者在请求中设置的其中一个前提条件',
  413: '服务器无法处理请求，因为请求实体过大，超出服务器的处理能力',
  414: '请求的 URI（通常为网址）过长，服务器无法处理',
  415: '请求的格式不受请求页面的支持',
  416: '如果页面无法提供请求的范围，则服务器会返回此状态代码',
  417: '服务器未满足”期望”请求标头字段的要求',
  500: '服务器遇到错误，无法完成请求',
  501: '服务器不具备完成请求的功能，例如，服务器无法识别请求方法时可能会返回此代码',
  502: '服务器作为网关或代理，从上游服务器收到无效响应',
  503: '服务器目前无法使用（由于超载或停机维护），通常，这只是暂时状态',
  504: '服务器作为网关或代理，但是没有及时从上游服务器收到请求',
  505: '服务器不支持请求中所用的 HTTP 协议版本'
}

const service = Axios.create({
  baseURL: configData.remoteUrl,
  timeout: 50000
})

service.interceptors.request.use(req => {
  return StorageUtil.getString('token').then(token => {
    if (token) {
      req.headers.Authorization = token
    }
  }).then(() => {
    return req
  })
}, err => Promise.reject(err))


service.interceptors.response.use(res => {
  const { status, statusText, data } = res
  const errorText = msgCode[status] || statusText

  if (status !== 200) {
    return Promise.reject(errorText)
  } else {
    let { resultStatus, resultMsg, result } = data
    if (resultStatus !== 'SUCCESS') {
      return Promise.reject(resultMsg)
    } else {
      return result
    }
  }
}, err => {
  let errorText = ''

  if (err.response) {
    const { data, status, statusText } = err.response
    errorText = (data && data['exceptionMessage']) || data || msgCode[status] || statusText
  } else {
    errorText = err.message
  }

  Alert.alert(errorText, [
    { text: '确定', onPress: () => console.log(err), style: 'cancel' }
  ])

  return Promise.reject(err)
})

export default service
