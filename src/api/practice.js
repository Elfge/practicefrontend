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

// ============ 练习会话管理 ============

// 创建练习会话（获取批量随机题目）
export const createPracticeSession = (data) => {
  return request({
    url: '/api/practice/session',
    method: 'post',
    data
  })
}

// 获取最近练习记录
export const getRecentSessions = (limit = 10) => {
  return request({
    url: '/api/practice/session/list',
    method: 'get',
    params: { limit }
  })
}

// 获取练习会话详情（用于恢复练习）
export const getSessionDetail = (sessionId) => {
  return request({
    url: `/api/practice/session/${sessionId}`,
    method: 'get'
  })
}

// 更新练习会话进度
export const updateSessionProgress = (sessionId, data) => {
  return request({
    url: `/api/practice/session/${sessionId}`,
    method: 'put',
    data
  })
}

// 完成练习会话
export const completeSession = (sessionId) => {
  return request({
    url: `/api/practice/session/${sessionId}/complete`,
    method: 'put'
  })
}

// 删除练习记录
export const deleteSession = (sessionId) => {
  return request({
    url: `/api/practice/session/${sessionId}`,
    method: 'delete'
  })
}

// ============ 试卷管理（套题模式） ============

// 获取试卷列表
export const getExamPapers = (params) => {
  return request({
    url: '/api/exam/papers',
    method: 'get',
    params
  })
}

// 获取试卷详情
export const getExamPaperDetail = (paperId) => {
  return request({
    url: `/api/exam/papers/${paperId}`,
    method: 'get'
  })
}

// 开始套题练习
export const startExam = (paperId) => {
  return request({
    url: `/api/exam/papers/${paperId}/start`,
    method: 'post'
  })
}


// 导出题目
export const exportQuestions = (params) => {
  return request({
    url: '/api/question/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

