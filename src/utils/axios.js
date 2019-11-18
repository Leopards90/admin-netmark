import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import apiUpload from '../api/uploadImage'
// create an axios instance
const upload = axios.create({
  // baseURL: 'http://146.196.67.109:8082/', // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests

  timeout: 5000 // request timeout
})
// upload.defaults.baseURL = 'http://146.196.67.109:8082/'
upload.defaults.headers.post['Content-Type'] = 'application/json'
upload.defaults.headers.common['SiteID'] = 'ST001';
// request interceptor
upload.interceptors.request.use(
  config => {
    debugger
    // do something before request is sent
    if(config.config && config.config.headers && config.config.headers['Content-Type']){
      config.headers.post['Content-Type'] = config.config.headers['Content-Type']
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
upload.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      if(res.resultCode && (res.resultCode == '00' || res.resultCode == '01'))
        return res
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message ?  resmessage : res.resultMsg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

upload.apiUpload = apiUpload

export default upload
