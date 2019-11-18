import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: 'http://146.196.67.109:8082/admin/banner/list',
    method: 'get',
    params: query
  })
}

export function addBanner(data) {
  return request({
    url: 'http://146.196.67.109:8082/banner/add',
    method: 'post',
    data
  })
}

export function fetchBanner(query) {
  return request({
    url: 'http://146.196.67.109:8082/admin/banner/' + query.id,
    method: 'get',
    params: query
  })
}

export function updateBanner(data) {
  return request({
    url: 'http://146.196.67.109:8082/banner/update',
    method: 'put',
    data
  })
}


