import request from '@/utils/request'

// 获取任务列表
export const getTasks = (params) => {
  return request({
    url: '/api/tasks',
    method: 'get',
    params
  })
}

// 获取单个任务详情
export const getTaskById = (id) => {
  return request({
    url: `/api/tasks/${id}`,
    method: 'get'
  })
}

// 创建任务
export const createTask = (data) => {
  return request({
    url: '/api/tasks',
    method: 'post',
    data
  })
}

// 更新任务
export const updateTask = (id, data) => {
  return request({
    url: `/api/tasks/${id}`,
    method: 'put',
    data
  })
}

// 删除任务
export const deleteTask = (id) => {
  return request({
    url: `/api/tasks/${id}`,
    method: 'delete'
  })
}

// 标记任务完成/未完成
export const toggleTaskComplete = (id, completed) => {
  return request({
    url: `/api/tasks/${id}/complete`,
    method: 'put',
    data: { completed }
  })
}

// 批量删除任务
export const batchDeleteTasks = (ids) => {
  return request({
    url: '/api/tasks/batch',
    method: 'delete',
    data: { ids }
  })
}

// 获取任务统计
export const getTaskStatistics = () => {
  return request({
    url: '/api/tasks/statistics',
    method: 'get'
  })
}

// 获取今日任务
export const getTodayTasks = () => {
  return request({
    url: '/api/tasks/today',
    method: 'get'
  })
}
