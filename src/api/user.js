import request from '@/utils/request'

// 获取用户列表
export const getUserList = (params) => {
  return request({
    url: '/api/admin/users',
    method: 'get',
    params
  })
}

// 获取用户详情
export const getUserDetail = (id) => {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'get'
  })
}

// 创建用户
export const createUser = (data) => {
  return request({
    url: '/api/admin/users',
    method: 'post',
    data
  })
}

// 更新用户
export const updateUser = (id, data) => {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export const deleteUser = (id) => {
  return request({
    url: `/api/admin/users/${id}`,
    method: 'delete'
  })
}

// 批量删除用户
export const batchDeleteUsers = (ids) => {
  return request({
    url: '/api/admin/users/batch',
    method: 'delete',
    data: ids
  })
}

// 设置用户状态
export const setUserStatus = (id, status) => {
  return request({
    url: `/api/admin/users/${id}/status`,
    method: 'put',
    params: { status }
  })
}

// 批量设置用户状态
export const batchSetUserStatus = (data) => {
  return request({
    url: '/api/admin/users/batch/status',
    method: 'put',
    data
  })
}

// 重置用户密码
export const resetUserPassword = (id, password) => {
  return request({
    url: `/api/admin/users/${id}/password`,
    method: 'put',
    data: { password }
  })
}

// 获取用户统计信息
export const getUserStatistics = () => {
  return request({
    url: '/api/admin/users/statistics',
    method: 'get'
  })
}
