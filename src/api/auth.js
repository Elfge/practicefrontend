import request from '@/utils/request'

// 用户注册
export const register = (data) => {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data
  })
}

// 用户登录
export const login = (data) => {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/api/user/info',
    method: 'get'
  })
}

// 更新用户资料
export const updateProfile = (data) => {
  return request({
    url: '/api/user/profile',
    method: 'put',
    data
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: '/api/user/password',
    method: 'put',
    data
  })
}