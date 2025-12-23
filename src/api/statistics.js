import request from '@/utils/request'

// 获取用户统计数据
export const getUserStatistics = () => {
  return request({
    url: '/api/statistics/user',
    method: 'get'
  })
}

// 获取各科目统计
export const getSubjectStatistics = () => {
  return request({
    url: '/api/statistics/subject',
    method: 'get'
  })
}

// 获取正确率趋势
export const getCorrectRateTrend = (days = 30) => {
  return request({
    url: '/api/statistics/trend',
    method: 'get',
    params: { days }
  })
}

// 获取薄弱章节
export const getWeakChapters = () => {
  return request({
    url: '/api/statistics/weak-chapters',
    method: 'get'
  })
}