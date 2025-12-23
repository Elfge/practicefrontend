import request from '@/utils/request'

// 提交答案
export const submitAnswer = (data) => {
  return request({
    url: '/api/answer/submit',
    method: 'post',
    data
  })
}