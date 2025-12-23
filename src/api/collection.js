import request from '@/utils/request'

// 收藏题目
export const collectQuestion = (questionId) => {
  return request({
    url: `/api/collection/${questionId}`,
    method: 'post'
  })
}

// 取消收藏
export const uncollectQuestion = (questionId) => {
  return request({
    url: `/api/collection/${questionId}`,
    method: 'delete'
  })
}

// 检查是否已收藏
export const checkCollected = (questionId) => {
  return request({
    url: `/api/collection/${questionId}`,
    method: 'get'
  })
}