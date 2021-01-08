import axios from 'axios'
import router from 'umi/router'
import {message} from 'antd'
import urlFn from '@/untils/method'
let baseURL
switch(window.location.hostname) {
 case 'localhost':
    baseURL = ''
  break
  case 'testht.liantuotui.com':
    baseURL = 'http://testht.liantuotui.com'
  break
  default:
    baseURL = 'http://houtai.liantuotui.com'
  break
}
const instance = axios.create({
  baseURL,
  xhrFields: {
    withCredentials: true,
  },
  credentials:'include',
  timeout: 35000,
  headers: {
    'Access-Control-Allow-Origin': '*',
    //'Content-Type': 'application/json;charset=UTF-8',
    //'Content-type': 'multipart/form-data'
  }
});
instance.interceptors.response.use(
  (res) => {
    //console.log(res)
    if (res.data.code === 100000 || res.data.code === 100006) {
      window.localStorage.clear()
      router.push('/login')
      return false
    }
    let link = res.config.url
    const url = window.location.hostname === 'localhost' ? link.substr(5, link.length) : link.substr(28, link.length)
    if (!res.data.success) {
      switch (url) {
        case '/login':
          message.error('用户名或密码错误')
        break
        case '/api/topup/orderQuery':
        break
        case '/api/flow/mission/add':
        break
        default:
          message.error(res.data.message)
        break
      }
    }
    return res.data;
  }, (error) => {
    return Promise.reject(error)
  }
);
//export default instance
export default {
  post(url, data, headers) {
    let form, urlObj = urlFn()
    if (urlObj.token) {
      form = urlObj.token !== null ? data !== undefined ? Object.assign(data, {token: urlObj.token}) : {token: urlObj.token} : data
    } else {
      const token = window.localStorage.getItem('token')
      if (data !== undefined && data.token !== undefined) {
        form = data
      } else {
        //ltt
        form = token !== null ? data !== undefined ? Object.assign(data, {token}) : {token} : data
      }
    }
    return instance({
      method: 'post',
      url,
      data: form,
    })
  },
  uploadFile(url, data) {
    const formData = new FormData()
    for (let i in data) {
      formData.append(i, data[i])
    }
    return instance({
      method: 'post',
      url,
      data:formData,
      headers: {
        'Content-type': 'multipart/form-data',
      },
    })
  },
  get(url, data) {
    console.log(data)
    return instance.get(url, { params: data })
  }
}
