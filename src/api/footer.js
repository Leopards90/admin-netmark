import request from '@/utils/request'

export function fetchFooter(query) {
  return request({
    url: 'http://146.196.67.109:8082/footerHeader/'+query.id,
    method: 'get'
  })
}

export function UpdateFooter(data) {
  return request({
    url: 'http://146.196.67.109:8082/footerHeader/update',
    method: 'put',
    data
  })
}
