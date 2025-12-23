import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const request = axios.create({
  baseURL: '',  // API路径已包含/api前缀，开发环境通过vue.config.js代理访问
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { code, message, data } = response.data

    // code为200表示成功
    if (code !== 200) {
      ElMessage.error(message || '请求失败')

      // 401: 未授权，跳转到登录页
      if (response.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      }

      return Promise.reject(new Error(message || '请求失败'))
    }

    return { data, message }
  },
  error => {
    console.error('响应错误:', error)

    // 处理网络错误
    if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试')
    } else if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          router.push('/login')
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || `请求失败: ${status}`)
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

export default request