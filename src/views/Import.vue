<template>
  <div class="import-container">
    <el-card class="import-card">
      <template #header>
        <div class="import-header">
          <span>题目导入</span>
        </div>
      </template>

      <!-- 导入方式选择 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 文件上传 -->
        <el-tab-pane label="文件上传" name="upload">
          <div class="upload-section">
            <el-upload
              ref="uploadRef"
              class="upload-area"
              drag
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              accept=".txt,.md,.docx,.pdf"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 txt、md、docx、pdf 格式，文件大小不超过 10MB
                </div>
              </template>
            </el-upload>

            <div class="subject-selector">
              <span>选择科目：</span>
              <el-select v-model="uploadSubject" placeholder="请选择科目">
                <el-option label="数据结构" value="数据结构" />
                <el-option label="计算机组成原理" value="计算机组成原理" />
                <el-option label="操作系统" value="操作系统" />
                <el-option label="计算机网络" value="计算机网络" />
              </el-select>
            </div>

            <div class="action-buttons">
              <el-button type="primary" :loading="parsing" @click="parseFile" :disabled="!selectedFile">
                解析文件
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 文本粘贴 -->
        <el-tab-pane label="文本粘贴" name="text">
          <div class="text-section">
            <el-input
              v-model="textContent"
              type="textarea"
              :rows="15"
              placeholder="请粘贴题目内容，支持多种格式...

示例格式：
1. 题目内容
A. 选项A
B. 选项B
C. 选项C
D. 选项D
答案：A
解析：解析内容..."
            />

            <div class="action-buttons">
              <el-button type="primary" :loading="parsing" @click="parseText" :disabled="!textContent">
                解析文本
              </el-button>
              <el-button @click="textContent = ''">清空</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 解析结果预览 -->
      <div v-if="parsedResult" class="preview-section">
        <el-divider>解析结果预览</el-divider>

        <!-- 解析摘要 -->
        <div class="result-summary">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-label">解析状态</div>
                <div class="summary-value">
                  <el-tag :type="parsedResult.overallConfidence > 0.8 ? 'success' : 'warning'">
                    {{ parsedResult.overallConfidence > 0.8 ? '良好' : '需检查' }}
                  </el-tag>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-label">题目总数</div>
                <div class="summary-value">{{ parsedResult.totalCount }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-label">成功解析</div>
                <div class="summary-value success">{{ parsedResult.successCount }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-label">警告数量</div>
                <div class="summary-value warning">{{ parsedResult.warningCount }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 题目列表 -->
        <div class="questions-preview">
          <el-table :data="parsedResult.questions" style="width: 100%" max-height="500">
            <el-table-column type="index" width="50" label="序号" />
            <el-table-column prop="topic" label="题目内容" min-width="200" show-overflow-tooltip />
            <el-table-column prop="type" label="题型" width="100">
              <template #default="scope">
                <el-tag size="small">{{ getTypeLabel(scope.row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="difficulty" label="难度" width="100">
              <template #default="scope">
                <el-tag :type="getDifficultyTagType(scope.row.difficulty)" size="small">
                  {{ scope.row.difficulty }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="confidence" label="置信度" width="100">
              <template #default="scope">
                <el-progress
                  :percentage="Math.round(scope.row.confidence * 100)"
                  :stroke-width="8"
                  :color="getConfidenceColor(scope.row.confidence)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="warning" label="警告" width="100">
              <template #default="scope">
                <el-tag v-if="scope.row.warning" type="warning" size="small">需检查</el-tag>
                <el-tag v-else type="success" size="small">正常</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button link type="primary" @click="editQuestion(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 确认按钮 -->
        <div class="confirm-actions">
          <el-button @click="cancelImportHandler">取消</el-button>
          <el-button type="primary" :loading="importing" @click="confirmImport">
            确认导入 ({{ parsedResult.successCount }}题)
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 编辑题目对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑题目" width="600px">
      <el-form :model="editingQuestion" label-width="100px">
        <el-form-item label="题目内容">
          <el-input v-model="editingQuestion.topic" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="题型">
          <el-select v-model="editingQuestion.type">
            <el-option label="单选题" value="SINGLE" />
            <el-option label="多选题" value="MULTIPLE" />
            <el-option label="判断题" value="JUDGE" />
            <el-option label="填空题" value="FILL" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="editingQuestion.difficulty">
            <el-option label="简单" value="EASY" />
            <el-option label="中等" value="MEDIUM" />
            <el-option label="困难" value="HARD" />
          </el-select>
        </el-form-item>
        <el-form-item label="年份">
          <el-input-number v-model="editingQuestion.year" :min="2000" :max="2030" />
        </el-form-item>
        <el-form-item label="答案">
          <el-input v-model="editingQuestion.answer" />
        </el-form-item>
        <el-form-item label="解析">
          <el-input v-model="editingQuestion.analysis" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="章节">
          <el-input v-model="editingQuestion.chapter" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveQuestionEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import {
  uploadFile,
  parseText as parseTextApi,
  confirmImport as confirmImportApi,
  cancelImport,
  updatePreviewQuestion
} from '@/api/import'

const activeTab = ref('upload')
const selectedFile = ref(null)
const uploadSubject = ref('')
const textContent = ref('')
const parsing = ref(false)
const importing = ref(false)
const parsedResult = ref(null)
const editDialogVisible = ref(false)
const editingQuestion = reactive({})
const editingIndex = ref(-1)

// 处理文件选择
const handleFileChange = (file) => {
  selectedFile.value = file.raw
}

// 解析文件
const parseFile = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  if (!uploadSubject.value) {
    ElMessage.warning('请选择科目')
    return
  }

  parsing.value = true
  try {
    const res = await uploadFile(selectedFile.value, uploadSubject.value)
    if (res.code === 0) {
      parsedResult.value = res.data
      ElMessage.success('解析成功')
    }
  } catch (error) {
    ElMessage.error('文件解析失败')
  } finally {
    parsing.value = false
  }
}

// 解析文本
const parseText = async () => {
  if (!textContent.value.trim()) {
    ElMessage.warning('请输入题目内容')
    return
  }

  parsing.value = true
  try {
    const res = await parseTextApi({ text: textContent.value })
    if (res.code === 0) {
      parsedResult.value = res.data
      ElMessage.success('解析成功')
    }
  } catch (error) {
    ElMessage.error('文本解析失败')
  } finally {
    parsing.value = false
  }
}

// 编辑题目
const editQuestion = (question) => {
  editingIndex.value = question.index
  Object.assign(editingQuestion, question)
  editDialogVisible.value = true
}

// 保存题目编辑
const saveQuestionEdit = async () => {
  try {
    const res = await updatePreviewQuestion(
      parsedResult.value.importId,
      editingIndex.value,
      editingQuestion
    )
    if (res.code === 0) {
      parsedResult.value.questions[editingIndex.value] = { ...editingQuestion }
      ElMessage.success('保存成功')
      editDialogVisible.value = false
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 确认导入
const confirmImport = async () => {
  importing.value = true
  try {
    const res = await confirmImportApi(parsedResult.value.importId)
    if (res.code === 0) {
      ElMessage.success('导入成功')
      parsedResult.value = null
      selectedFile.value = null
      textContent.value = ''
    }
  } catch (error) {
    ElMessage.error('导入失败')
  } finally {
    importing.value = false
  }
}

// 取消导入
const cancelImportHandler = async () => {
  if (parsedResult.value?.importId) {
    try {
      await cancelImport(parsedResult.value.importId)
    } catch (error) {
      console.error('取消导入失败', error)
    }
  }
  parsedResult.value = null
  selectedFile.value = null
  textContent.value = ''
  ElMessage.info('已取消导入')
}

const handleTabChange = () => {
  parsedResult.value = null
  selectedFile.value = null
}

// 工具函数
const getTypeLabel = (type) => {
  const map = {
    SINGLE: '单选',
    MULTIPLE: '多选',
    JUDGE: '判断',
    FILL: '填空'
  }
  return map[type] || type
}

const getDifficultyTagType = (difficulty) => {
  const map = {
    EASY: 'success',
    MEDIUM: 'warning',
    HARD: 'danger'
  }
  return map[difficulty] || ''
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return '#67c23a'
  if (confidence >= 0.5) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style scoped>
.import-container {
  padding: 20px;
}

.import-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-area {
  margin-bottom: 20px;
}

.subject-selector {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.preview-section {
  margin-top: 30px;
}

.result-summary {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.summary-value.success {
  color: #67c23a;
}

.summary-value.warning {
  color: #e6a23c;
}

.questions-preview {
  margin-bottom: 20px;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
