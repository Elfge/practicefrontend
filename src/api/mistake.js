import request from '@/utils/request'

// 获取错题列表
export const getWrongQuestions = (params) => {
  return request({
    url: '/api/wrong-question/list',
    method: 'get',
    params
  })
}

// 添加笔记
export const addNote = (id, note) => {
  return request({
    url: `/api/wrong-question/${id}/note`,
    method: 'post',
    data: { note }
  })
}

// 标记已掌握
export const markMastered = (id) => {
  return request({
    url: `/api/wrong-question/${id}/master`,
    method: 'put'
  })
}

// 删除单个错题
export const deleteWrongQuestion = (id) => {
  return request({
    url: `/api/wrong-question/${id}`,
    method: 'delete'
  })
}

// 批量删除错题
export const batchDeleteWrongQuestions = (ids) => {
  return request({
    url: '/api/wrong-question/batch',
    method: 'delete',
    data: { ids }
  })
}

// 导出错题
export const exportWrongQuestions = (params) => {
  return request({
    url: '/api/wrong-question/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取错题统计
export const getWrongQuestionStats = () => {
  return request({
    url: '/api/wrong-question/statistics',
    method: 'get'
  })
}

// 获取待复习错题（艾宾浩斯）
export const getReviewQuestions = (params) => {
  return request({
    url: '/api/wrong-question/review',
    method: 'get',
    params
  })
}

// 更新复习状态
export const updateReviewStatus = (id, remembered) => {
  return request({
    url: `/api/wrong-question/${id}/review`,
    method: 'put',
    data: { remembered }
  })
}

// 设置错误原因
export const setWrongReason = (id, reason) => {
  return request({
    url: `/api/wrong-question/${id}/reason`,
    method: 'put',
    data: { reason }
  })
}