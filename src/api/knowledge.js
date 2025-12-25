import request from '@/utils/request'

// 获取知识点列表
export const getKnowledgeList = (params) => {
  return request({
    url: '/api/knowledge/list',
    method: 'get',
    params
  })
}

// 获取知识点详情
export const getKnowledgeDetail = (id) => {
  return request({
    url: `/api/knowledge/${id}`,
    method: 'get'
  })
}

// 获取知识点树状结构
export const getKnowledgeTree = (params) => {
  return request({
    url: '/api/knowledge/tree',
    method: 'get',
    params
  })
}

// 获取相关知识点
export const getRelatedKnowledge = (id) => {
  return request({
    url: `/api/knowledge/related/${id}`,
    method: 'get'
  })
}

// 创建知识点（管理员）
export const createKnowledge = (data) => {
  return request({
    url: '/api/knowledge',
    method: 'post',
    data
  })
}

// 更新知识点（管理员）
export const updateKnowledge = (id, data) => {
  return request({
    url: `/api/knowledge/${id}`,
    method: 'put',
    data
  })
}

// 删除知识点（管理员）
export const deleteKnowledge = (id) => {
  return request({
    url: `/api/knowledge/${id}`,
    method: 'delete'
  })
}
