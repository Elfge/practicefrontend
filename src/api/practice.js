import request from '@/utils/request'

// 获取题目列表（分页+筛选）
export const getQuestions = (params) => {
  return request({
    url: '/api/question/list',
    method: 'get',
    params
  })
}

// 根据ID获取题目
export const getQuestion = (id) => {
  return request({
    url: `/api/question/${id}`,
    method: 'get'
  })
}

// 获取随机题目
export const getRandomQuestion = (params) => {
  return request({
    url: '/api/question/random',
    method: 'get',
    params
  })
}

// 获取章节列表
export const getChapters = (subject) => {
  return request({
    url: '/api/question/chapters',
    method: 'get',
    params: { subject }
  })
}

// 新增题目（管理员）
export const addQuestion = (data) => {
  return request({
    url: '/api/question',
    method: 'post',
    data
  })
}

// 更新题目（管理员）
export const updateQuestion = (data) => {
  return request({
    url: '/api/question',
    method: 'put',
    data
  })
}

// 删除题目（管理员）
export const deleteQuestion = (id) => {
  return request({
    url: `/api/question/${id}`,
    method: 'delete'
  })
}

// 获取知识点列表
export const getKnowledgePoints = (subject) => {
  return request({
    url: '/api/knowledge/list',
    method: 'get',
    params: { subject }
  })
}

// 上传题目文件（PDF OCR处理可能需要较长时间）
export const uploadQuestions = (data) => {
  return request({
    url: '/api/import/upload',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 5分钟超时
    data
  })
}

// 确认导入
export const confirmImport = (importId) => {
  return request({
    url: `/api/import/confirm/${importId}`,
    method: 'post'
  })
}

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

