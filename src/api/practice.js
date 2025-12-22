import request from '@/utils/request'

// 获取题目列表（分页+筛选）
export const getQuestions = (params) => {
  return request({
    url: '/question/list',
    method: 'get',
    params
  })
}

// 根据ID获取题目
export const getQuestion = (id) => {
  return request({
    url: `/question/${id}`,
    method: 'get'
  })
}

// 获取随机题目
export const getRandomQuestion = (params) => {
  return request({
    url: '/question/random',
    method: 'get',
    params
  })
}

// 获取章节列表
export const getChapters = (subject) => {
  return request({
    url: '/question/chapters',
    method: 'get',
    params: { subject }
  })
}

// 新增题目（管理员）
export const addQuestion = (data) => {
  return request({
    url: '/question',
    method: 'post',
    data
  })
}

// 更新题目（管理员）
export const updateQuestion = (data) => {
  return request({
    url: '/question',
    method: 'put',
    data
  })
}

// 删除题目（管理员）
export const deleteQuestion = (id) => {
  return request({
    url: `/question/${id}`,
    method: 'delete'
  })
}