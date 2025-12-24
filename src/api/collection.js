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
    url: `/api/collection/check/${questionId}`,
    method: 'get'
  })
}

// 获取收藏列表（分页）
export const getCollectionList = (params) => {
  return request({
    url: '/api/collection',
    method: 'get',
    params
  })
}

// 获取收藏分类列表
export const getCollectionFolders = () => {
  return request({
    url: '/api/collection/folder',
    method: 'get'
  })
}

// 创建收藏分类
export const createCollectionFolder = (data) => {
  return request({
    url: '/api/collection/folder',
    method: 'post',
    data
  })
}

// 更新收藏分类
export const updateCollectionFolder = (id, data) => {
  return request({
    url: `/api/collection/folder/${id}`,
    method: 'put',
    data
  })
}

// 删除收藏分类
export const deleteCollectionFolder = (id) => {
  return request({
    url: `/api/collection/folder/${id}`,
    method: 'delete'
  })
}

// 移动题目到分类
export const moveQuestionToFolder = (questionId, folderId) => {
  return request({
    url: `/api/collection/${questionId}/folder`,
    method: 'put',
    data: { folderId }
  })
}

// 批量移动题目到分类
export const batchMoveToFolder = (questionIds, folderId) => {
  return request({
    url: '/api/collection/batch/move',
    method: 'put',
    data: { questionIds, folderId }
  })
}

// 获取收藏统计
export const getCollectionStats = () => {
  return request({
    url: '/api/collection/stats',
    method: 'get'
  })
}
