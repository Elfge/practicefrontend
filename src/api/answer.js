import request from '@/utils/request'

// 提交答案
export const submitAnswer = (data) => {
  return request({
    url: '/api/answer/submit',
    method: 'post',
    data
  })
}

// 批量提交答案
export const batchSubmitAnswer = (data) => {
  return request({
    url: '/api/answer/batch',
    method: 'post',
    data
  })
}

// 获取答题历史
export const getAnswerHistory = (params) => {
  return request({
    url: '/api/answer/history',
    method: 'get',
    params
  })
}

// 获取答题分析
export const getAnswerAnalysis = (id) => {
  return request({
    url: `/api/answer/analysis/${id}`,
    method: 'get'
  })
}