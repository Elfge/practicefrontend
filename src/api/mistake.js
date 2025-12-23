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