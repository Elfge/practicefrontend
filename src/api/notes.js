import request from '@/utils/request'

// 获取笔记列表
export const getNotes = (params) => {
  return request({
    url: '/api/notes',
    method: 'get',
    params
  })
}

// 获取单个笔记详情
export const getNoteById = (id) => {
  return request({
    url: `/api/notes/${id}`,
    method: 'get'
  })
}

// 创建笔记
export const createNote = (data) => {
  return request({
    url: '/api/notes',
    method: 'post',
    data
  })
}

// 更新笔记
export const updateNote = (id, data) => {
  return request({
    url: `/api/notes/${id}`,
    method: 'put',
    data
  })
}

// 删除笔记
export const deleteNote = (id) => {
  return request({
    url: `/api/notes/${id}`,
    method: 'delete'
  })
}

// 搜索笔记
export const searchNotes = (keyword) => {
  return request({
    url: '/api/notes/search',
    method: 'get',
    params: { keyword }
  })
}

// 关联题目到笔记
export const relateQuestion = (noteId, questionId) => {
  return request({
    url: `/api/notes/${noteId}/questions`,
    method: 'post',
    data: { questionId }
  })
}

// 取消关联题目
export const unrelateQuestion = (noteId, questionId) => {
  return request({
    url: `/api/notes/${noteId}/questions/${questionId}`,
    method: 'delete'
  })
}

// 获取笔记的分类统计
export const getCategoryStats = () => {
  return request({
    url: '/api/notes/stats',
    method: 'get'
  })
}
