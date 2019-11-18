import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: 'http://146.196.67.109:8082/product/find-all',
    method: 'get',
    params: query
  })
}

export function fetchProduct(query) {
  return request({
    url: 'http://146.196.67.109:8082/admin/product/'+query.id,
    method: 'get'
  })
}

export function UpdateProduct(data) {
  return request({
    url: 'http://146.196.67.109:8082/product/update',
    method: 'put',
    data
  })
}

export function insertProduct(data) {
  return request({
    url: 'http://146.196.67.109:8082/product/add',
    method: 'post',
    data
  })
}

export function uploadImage(data,config) {
  return request({
    url: 'http://146.196.67.109:8082/product/upload-img',
    method: 'post',
    data,
    config
  })
}


export function getCategory() {
  return request({
    url: 'http://146.196.67.109:8082/category/list',
    method: 'get'
  })
}

export function deleteProduct() {
  return request({
    url: 'http://146.196.67.109:8082/product/delete',
    method: 'delete'
  })
}
