import axios from 'axios'

axios.uploadProductImages = function (params, configs, success, callBackError) {
  this.post('http://146.196.67.109:8082/product/upload-img', params, configs)
    .then(response => {
      success(response)
    }).catch(error => {
    if (error.response && error.response.status == 400) {
      if (typeof callBackError !== 'undefined') {
        callBackError(error.response.data)
      }
    }
  })
}

axios.uploadBannerImages = function (params, configs, success, callBackError) {
  this.post('http://146.196.67.109:8082/banner/upload-img', params, configs)
    .then(response => {
      success(response)
    }).catch(error => {
    if (error.response && error.response.status == 400) {
      if (typeof callBackError !== 'undefined') {
        callBackError(error.response.data)
      }
    }
  })
}
export default axios
