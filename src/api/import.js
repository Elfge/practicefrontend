import request from '@/utils/request'

// 上传文件并解析
export const uploadFile = (file, subject) => {
  const formData = new FormData()
  formData.append('file', file)
  if (subject) {
    formData.append('subject', subject)
  }

  return request({
    url: '/import/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 直接粘贴文本解析
export const parseText = (data) => {
  return request({
    url: '/import/text',
    method: 'post',
    data
  })
}

// 获取导入预览
export const getImportPreview = (importId) => {
  return request({
    url: `/import/preview/${importId}`,
    method: 'get'
  })
}

// 更新预览中的单个题目
export const updatePreviewQuestion = (importId, questionIndex, data) => {
  return request({
    url: `/import/preview/${importId}/question/${questionIndex}`,
    method: 'put',
    data
  })
}

// 确认导入
export const confirmImport = (importId) => {
  return request({
    url: `/import/confirm/${importId}`,
    method: 'post'
  })
}

// 取消导入
export const cancelImport = (importId) => {
  return request({
    url: `/import/cancel/${importId}`,
    method: 'delete'
  })
}
