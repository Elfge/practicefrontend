<template>
    <div class="question-bank-container">
      <!-- 筛选栏 -->
      <el-card class="filter-card">
        <el-form :model="filters" :inline="true">
          <el-form-item label="科目">
            <el-select v-model="filters.subject" placeholder="选择科目" clearable style="width: 150px" @change="handleSubjectChange">
              <el-option label="数据结构" value="DS" />
              <el-option label="计算机组成原理" value="CO" />
              <el-option label="操作系统" value="OS" />
              <el-option label="计算机网络" value="CN" />
            </el-select>
          </el-form-item>

          <el-form-item label="章节">
            <el-select v-model="filters.chapter" placeholder="选择章节" clearable style="width: 200px" :loading="chapterLoading">
              <el-option
                v-for="chapter in chapters"
                :key="chapter"
                :label="chapter"
                :value="chapter"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="题型">
            <el-select v-model="filters.type" placeholder="选择题型" clearable style="width: 150px">
              <el-option label="单选题" value="SINGLE" />
              <el-option label="多选题" value="MULTIPLE" />
              <el-option label="填空题" value="BLANK" />
              <el-option label="综合题" value="COMPREHENSIVE" />
            </el-select>
          </el-form-item>

          <el-form-item label="难度">
            <el-select v-model="filters.difficulty" placeholder="选择难度" clearable style="width: 150px">
              <el-option label="基础" value="EASY" />
              <el-option label="中等" value="MEDIUM" />
              <el-option label="困难" value="HARD" />
            </el-select>
          </el-form-item>

          <el-form-item label="年份">
            <el-select v-model="filters.year" placeholder="选择年份" clearable style="width: 150px">
              <el-option
                v-for="year in years"
                :key="year"
                :label="year"
                :value="year"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetFilters">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>

        <el-divider />

        <div class="filter-actions">
          <el-button type="success" @click="importQuestions">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button type="warning" @click="exportQuestions">
            <el-icon><Download /></el-icon>
            导出题目
          </el-button>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加题目
          </el-button>
        </div>
      </el-card>

      <!-- 题目列表 -->
      <el-card class="question-list-card">
        <template #header>
          <div class="list-header">
            <span>题目列表（共 {{ total }} 题）</span>
            <div class="view-modes">
              <el-radio-group v-model="viewMode">
                <el-radio-button label="list">列表视图</el-radio-button>
                <el-radio-button label="card">卡片视图</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>

        <!-- 列表视图 -->
        <el-table
          v-if="viewMode === 'list'"
          :data="questions"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          v-loading="loading"
        >
          <el-table-column type="selection" width="55" />

          <el-table-column prop="id" label="ID" width="80" />

          <el-table-column prop="topic" label="题干" min-width="300">
            <template #default="scope">
              <div class="question-content" v-html="scope.row.topic"></div>
            </template>
          </el-table-column>

          <el-table-column prop="type" label="题型" width="100">
            <template #default="scope">
              <el-tag :type="getTypeTagType(scope.row.type)">
                {{ getTypeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="difficulty" label="难度" width="100">
            <template #default="scope">
              <el-tag :type="getDifficultyTagType(scope.row.difficulty)">
                {{ getDifficultyLabel(scope.row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="subject" label="科目" width="120" />

          <el-table-column prop="year" label="年份" width="100" />

          <el-table-column prop="chapter" label="章节" width="150" />

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewQuestion(scope.row)">
                查看
              </el-button>
              <el-button type="warning" size="small" @click="editQuestion(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="deleteQuestionItem(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 卡片视图 -->
        <div v-else class="card-view" v-loading="loading">
          <el-row :gutter="20">
            <el-col :span="8" v-for="question in questions" :key="question.id">
              <el-card class="question-card" shadow="hover">
                <div class="card-header">
                  <el-tag :type="getTypeTagType(question.type)" size="small">
                    {{ getTypeLabel(question.type) }}
                  </el-tag>
                  <el-tag :type="getDifficultyTagType(question.difficulty)" size="small">
                    {{ getDifficultyLabel(question.difficulty) }}
                  </el-tag>
                </div>

                <div class="card-content">
                  <div class="question-title" v-html="question.topic"></div>
                  <div class="question-meta">
                    <span>{{ question.subject }}</span>
                    <span>{{ question.year ? question.year + '年' : '非真题' }}</span>
                    <span>{{ question.chapter }}</span>
                  </div>
                </div>

                <div class="card-actions">
                  <el-button type="primary" size="small" @click="viewQuestion(question)">
                    查看
                  </el-button>
                  <el-button type="warning" size="small" @click="editQuestion(question)">
                    编辑
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>

      <!-- 添加/编辑题目对话框 -->
      <el-dialog
        v-model="showAddDialog"
        :title="isEdit ? '编辑题目' : '添加题目'"
        width="80%"
        top="5vh"
      >
        <el-form :model="questionForm" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="科目">
                <el-select v-model="questionForm.subject" style="width: 100%">
                  <el-option label="数据结构" value="DS" />
                  <el-option label="计算机组成原理" value="CO" />
                  <el-option label="操作系统" value="OS" />
                  <el-option label="计算机网络" value="CN" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="章节">
                <el-input v-model="questionForm.chapter" placeholder="请输入章节" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="题型">
                <el-select v-model="questionForm.type" style="width: 100%">
                  <el-option label="单选题" value="SINGLE" />
                  <el-option label="多选题" value="MULTIPLE" />
                  <el-option label="填空题" value="BLANK" />
                  <el-option label="综合题" value="COMPREHENSIVE" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="难度">
                <el-select v-model="questionForm.difficulty" style="width: 100%">
                  <el-option label="基础" value="EASY" />
                  <el-option label="中等" value="MEDIUM" />
                  <el-option label="困难" value="HARD" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="年份">
                <el-input-number v-model="questionForm.year" :min="1998" :max="2030" placeholder="如：2024" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="题干">
            <el-input
              v-model="questionForm.topic"
              type="textarea"
              :rows="4"
              placeholder="请输入题干内容"
            />
          </el-form-item>

          <el-form-item label="选项" v-if="questionForm.type === 'SINGLE' || questionForm.type === 'MULTIPLE'">
            <div class="options-container">
              <div v-for="(option, index) in questionForm.optionsList" :key="index" class="option-item">
                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                <el-input
                  v-model="questionForm.optionsList[index]"
                  :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
                  style="flex: 1; margin-right: 10px"
                />
                <el-button type="danger" size="small" @click="removeOption(index)" v-if="questionForm.optionsList.length > 2">
                  删除
                </el-button>
              </div>
              <el-button type="primary" @click="addOption" size="small">添加选项</el-button>
            </div>
          </el-form-item>

          <el-form-item label="答案">
            <el-input
              v-model="questionForm.answer"
              type="textarea"
              :rows="2"
              placeholder="请输入标准答案（如：A 或 A,B,C）"
            />
          </el-form-item>

          <el-form-item label="解析">
            <el-input
              v-model="questionForm.analysis"
              type="textarea"
              :rows="4"
              placeholder="请输入题目解析"
            />
          </el-form-item>

          <el-form-item label="考点">
            <el-input
              v-model="questionForm.tags"
              placeholder="请输入相关考点，多个考点用逗号分隔"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveQuestion">保存</el-button>
        </template>
      </el-dialog>

      <!-- 查看题目详情对话框 -->
      <el-dialog
        v-model="showViewDialog"
        title="题目详情"
        width="70%"
        top="5vh"
      >
        <div v-if="currentQuestion" class="question-detail">
          <div class="detail-header">
            <el-tag :type="getTypeTagType(currentQuestion.type)">
              {{ getTypeLabel(currentQuestion.type) }}
            </el-tag>
            <el-tag :type="getDifficultyTagType(currentQuestion.difficulty)">
              {{ getDifficultyLabel(currentQuestion.difficulty) }}
            </el-tag>
            <span class="meta-info">{{ currentQuestion.subject }}</span>
            <span class="meta-info">{{ currentQuestion.year ? currentQuestion.year + '年' : '非真题' }}</span>
            <span class="meta-info">{{ currentQuestion.chapter }}</span>
          </div>

          <el-divider />

          <div class="detail-content">
            <h3>题干</h3>
            <div class="topic-content" v-html="currentQuestion.topic"></div>

            <div v-if="currentQuestion.options" class="options-list">
              <h4>选项</h4>
              <div v-for="(option, index) in parsedOptions" :key="index" class="option-item-detail">
                <span class="option-label-detail">{{ String.fromCharCode(65 + index) }}.</span>
                <span>{{ option }}</span>
              </div>
            </div>

            <div class="answer-section">
              <h4>答案</h4>
              <el-tag type="success">{{ currentQuestion.answer }}</el-tag>
            </div>

            <div class="analysis-section">
              <h4>解析</h4>
              <div v-html="currentQuestion.analysis"></div>
            </div>

            <div v-if="currentQuestion.tags" class="tags-section">
              <h4>考点</h4>
              <el-tag v-for="tag in currentQuestion.tags.split(',')" :key="tag" style="margin-right: 5px">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <template #footer>
          <el-button @click="showViewDialog = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getQuestions, addQuestion, updateQuestion, deleteQuestion as deleteQuestionApi, getChapters } from '@/api/practice'

export default {
  name: 'QuestionBank',
  setup() {
    const viewMode = ref('list')
    const currentPage = ref(1)
    const pageSize = ref(20)
    const showAddDialog = ref(false)
    const showViewDialog = ref(false)
    const isEdit = ref(false)
    const selectedQuestions = ref([])
    const loading = ref(false)
    const chapterLoading = ref(false)
    const currentQuestion = ref(null)

    const filters = reactive({
      subject: '',
      chapter: '',
      type: '',
      difficulty: '',
      year: ''
    })

    const questionForm = reactive({
      id: null,
      subject: '',
      chapter: '',
      type: 'SINGLE',
      difficulty: 'EASY',
      year: null,
      topic: '',
      options: '',
      optionsList: ['', ''],
      answer: '',
      analysis: '',
      tags: ''
    })

    const chapters = ref([])
    const years = ref([])
    for (let i = new Date().getFullYear(); i >= 1998; i--) {
      years.value.push(i)
    }

    const questions = ref([])
    const total = ref(0)

    const parsedOptions = computed(() => {
      if (!currentQuestion.value?.options) return []
      try {
        const options = typeof currentQuestion.value.options === 'string'
          ? JSON.parse(currentQuestion.value.options)
          : currentQuestion.value.options
        return Object.values(options)
      } catch {
        return []
      }
    })

    const getTypeLabel = (type) => {
      const typeMap = {
        SINGLE: '单选',
        MULTIPLE: '多选',
        BLANK: '填空',
        COMPREHENSIVE: '综合'
      }
      return typeMap[type] || type
    }

    const getTypeTagType = (type) => {
      const typeMap = {
        SINGLE: 'primary',
        MULTIPLE: 'success',
        BLANK: 'warning',
        COMPREHENSIVE: 'danger'
      }
      return typeMap[type] || ''
    }

    const getDifficultyLabel = (difficulty) => {
      const difficultyMap = {
        EASY: '基础',
        MEDIUM: '中等',
        HARD: '困难'
      }
      return difficultyMap[difficulty] || difficulty
    }

    const getDifficultyTagType = (difficulty) => {
      const difficultyMap = {
        EASY: 'success',
        MEDIUM: 'warning',
        HARD: 'danger'
      }
      return difficultyMap[difficulty] || ''
    }

    const handleSubjectChange = async () => {
      filters.chapter = ''
      if (filters.subject) {
        await loadChapters()
      } else {
        chapters.value = []
      }
    }

    const loadChapters = async () => {
      chapterLoading.value = true
      try {
        const { data } = await getChapters(filters.subject)
        chapters.value = data || []
      } catch (error) {
        ElMessage.error('加载章节失败')
      } finally {
        chapterLoading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadQuestions()
    }

    const loadQuestions = async () => {
      loading.value = true
      try {
        const params = {
          current: currentPage.value,
          size: pageSize.value
        }

        if (filters.subject) params.subject = filters.subject
        if (filters.difficulty) params.difficulty = filters.difficulty
        if (filters.type) params.type = filters.type
        if (filters.year) params.year = filters.year

        const { data } = await getQuestions(params)
        questions.value = data.records || []
        total.value = data.total || 0
      } catch (error) {
        ElMessage.error('加载题目失败')
      } finally {
        loading.value = false
      }
    }

    const resetFilters = () => {
      Object.keys(filters).forEach(key => {
        filters[key] = ''
      })
      chapters.value = []
      currentPage.value = 1
      loadQuestions()
    }

    const handleSelectionChange = (selection) => {
      selectedQuestions.value = selection
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
      loadQuestions()
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadQuestions()
    }

    const viewQuestion = (question) => {
      currentQuestion.value = question
      showViewDialog.value = true
    }

    const editQuestion = (question) => {
      isEdit.value = true
      showAddDialog.value = true

      Object.assign(questionForm, {
        id: question.id,
        subject: question.subject,
        chapter: question.chapter,
        type: question.type,
        difficulty: question.difficulty,
        year: question.year,
        topic: question.topic,
        answer: question.answer,
        analysis: question.analysis,
        tags: question.tags
      })

      if (question.options) {
        try {
          const options = typeof question.options === 'string'
            ? JSON.parse(question.options)
            : question.options
          questionForm.optionsList = Object.values(options)
        } catch {
          questionForm.optionsList = ['', '']
        }
      }
    }

    const deleteQuestionItem = async (question) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除题目"${question.topic?.substring(0, 20)}..."吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await deleteQuestionApi(question.id)
        ElMessage.success('删除成功')
        await loadQuestions()
      } catch {
        // 用户取消
      }
    }

    const addOption = () => {
      questionForm.optionsList.push('')
    }

    const removeOption = (index) => {
      questionForm.optionsList.splice(index, 1)
    }

    const saveQuestion = async () => {
      try {
        const optionsObj = {}
        questionForm.optionsList.forEach((opt, index) => {
          optionsObj[String.fromCharCode(65 + index)] = opt
        })

        const data = {
          subject: questionForm.subject,
          type: questionForm.type,
          difficulty: questionForm.difficulty,
          year: questionForm.year || 0,
          topic: questionForm.topic,
          options: JSON.stringify(optionsObj),
          answer: questionForm.answer,
          analysis: questionForm.analysis,
          tags: questionForm.tags,
          chapter: questionForm.chapter
        }

        if (isEdit.value) {
          data.id = questionForm.id
          await updateQuestion(data)
          ElMessage.success('题目更新成功')
        } else {
          await addQuestion(data)
          ElMessage.success('题目添加成功')
        }

        showAddDialog.value = false
        resetQuestionForm()
        await loadQuestions()
      } catch (error) {
        ElMessage.error('保存失败，请重试')
      }
    }

    const resetQuestionForm = () => {
      Object.assign(questionForm, {
        id: null,
        subject: '',
        chapter: '',
        type: 'SINGLE',
        difficulty: 'EASY',
        year: null,
        topic: '',
        options: '',
        optionsList: ['', ''],
        answer: '',
        analysis: '',
        tags: ''
      })
      isEdit.value = false
    }

    const importQuestions = () => {
      ElMessage.info('批量导入功能开发中...')
    }

    const exportQuestions = () => {
      ElMessage.info('导出功能开发中...')
    }

    watch(() => showAddDialog.value, (newVal) => {
      if (!newVal) {
        resetQuestionForm()
      }
    })

    onMounted(() => {
      loadQuestions()
    })

    return {
      viewMode,
      currentPage,
      pageSize,
      total,
      showAddDialog,
      showViewDialog,
      isEdit,
      filters,
      questionForm,
      chapters,
      years,
      questions,
      loading,
      chapterLoading,
      currentQuestion,
      parsedOptions,
      getTypeLabel,
      getTypeTagType,
      getDifficultyLabel,
      getDifficultyTagType,
      handleSubjectChange,
      handleSearch,
      resetFilters,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      viewQuestion,
      editQuestion,
      deleteQuestionItem,
      addOption,
      removeOption,
      saveQuestion,
      importQuestions,
      exportQuestions
    }
  }
}
</script>

<style scoped>
.question-bank-container {
  max-width: 1400px;
  margin: 0 auto;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-actions {
  margin-top: 15px;
}

.question-list-card {
  min-height: 600px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-content {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-view {
  min-height: 500px;
}

.question-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.question-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-content {
  margin-bottom: 15px;
}

.question-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 10px;
  max-height: 40px;
  overflow: hidden;
}

.question-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
}

.question-meta span {
  margin-right: 10px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.options-container {
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 20px;
}

/* 题目详情对话框样式 */
.question-detail {
  padding: 10px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-header .meta-info {
  color: #606266;
  font-size: 14px;
}

.detail-content h3,
.detail-content h4 {
  color: #303133;
  margin-top: 15px;
  margin-bottom: 10px;
}

.topic-content {
  color: #303133;
  font-size: 15px;
  line-height: 1.8;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.options-list {
  margin-top: 15px;
}

.option-item-detail {
  padding: 8px 15px;
  margin-bottom: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
}

.option-label-detail {
  font-weight: bold;
  margin-right: 10px;
  min-width: 25px;
}

.answer-section,
.analysis-section,
.tags-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.analysis-section {
  background-color: #fef9f0;
  border-left-color: #e6a23c;
}

.tags-section {
  background-color: #f0f9ff;
  border-left-color: #67c23a;
}
</style>