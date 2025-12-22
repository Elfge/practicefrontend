<template>
    <div class="question-bank-container">
      <!-- 筛选栏 -->
      <el-card class="filter-card">
        <el-form :model="filters" :inline="true">
          <el-form-item label="科目">
            <el-select v-model="filters.subject" placeholder="选择科目" clearable style="width: 150px">
              <el-option label="数据结构" value="ds" />
              <el-option label="计算机组成原理" value="cs" />
              <el-option label="操作系统" value="os" />
              <el-option label="计算机网络" value="cn" />
            </el-select>
          </el-form-item>

          <el-form-item label="章节">
            <el-select v-model="filters.chapter" placeholder="选择章节" clearable style="width: 150px">
              <el-option
                v-for="chapter in chapters"
                :key="chapter.value"
                :label="chapter.label"
                :value="chapter.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="题型">
            <el-select v-model="filters.questionType" placeholder="选择题型" clearable style="width: 150px">
              <el-option label="单选题" value="single" />
              <el-option label="多选题" value="multiple" />
              <el-option label="填空题" value="fill" />
              <el-option label="综合题" value="comprehensive" />
            </el-select>
          </el-form-item>

          <el-form-item label="难度">
            <el-select v-model="filters.difficulty" placeholder="选择难度" clearable style="width: 150px">
              <el-option label="基础" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
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
          :data="paginatedQuestions"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />

          <el-table-column prop="id" label="ID" width="80" />

          <el-table-column prop="content" label="题干" min-width="300">
            <template #default="scope">
              <div class="question-content" v-html="scope.row.content"></div>
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
        <div v-else class="card-view">
          <el-row :gutter="20">
            <el-col :span="8" v-for="question in paginatedQuestions" :key="question.id">
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
                  <div class="question-title" v-html="question.content"></div>
                  <div class="question-meta">
                    <span>{{ question.subject }}</span>
                    <span>{{ question.year }}</span>
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
                  <el-option label="数据结构" value="数据结构" />
                  <el-option label="计算机组成原理" value="计算机组成原理" />
                  <el-option label="操作系统" value="操作系统" />
                  <el-option label="计算机网络" value="计算机网络" />
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
                  <el-option label="单选题" value="single" />
                  <el-option label="多选题" value="multiple" />
                  <el-option label="填空题" value="fill" />
                  <el-option label="综合题" value="comprehensive" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="难度">
                <el-select v-model="questionForm.difficulty" style="width: 100%">
                  <el-option label="基础" value="easy" />
                  <el-option label="中等" value="medium" />
                  <el-option label="困难" value="hard" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="年份">
                <el-input v-model="questionForm.year" placeholder="如：2024" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="题干">
            <el-input
              v-model="questionForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入题干内容"
            />
          </el-form-item>

          <el-form-item label="选项" v-if="questionForm.type === 'single' || questionForm.type === 'multiple'">
            <div class="options-container">
              <div v-for="(option, index) in questionForm.options" :key="index" class="option-item">
                <el-input
                  v-model="option.content"
                  :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
                  style="width: 300px; margin-right: 10px"
                />
                <el-checkbox v-model="option.isCorrect" v-if="questionForm.type === 'multiple'">
                  正确答案
                </el-checkbox>
                <el-radio v-model="questionForm.correctAnswer" :label="index" v-else>
                  正确答案
                </el-radio>
                <el-button type="danger" size="small" @click="removeOption(index)" v-if="questionForm.options.length > 2">
                  删除
                </el-button>
              </div>
              <el-button type="primary" @click="addOption" size="small">添加选项</el-button>
            </div>
          </el-form-item>

          <el-form-item label="答案" v-if="questionForm.type === 'fill' || questionForm.type === 'comprehensive'">
            <el-input
              v-model="questionForm.answer"
              type="textarea"
              :rows="2"
              placeholder="请输入标准答案"
            />
          </el-form-item>

          <el-form-item label="解析">
            <el-input
              v-model="questionForm.explanation"
              type="textarea"
              :rows="4"
              placeholder="请输入题目解析"
            />
          </el-form-item>

          <el-form-item label="考点">
            <el-input
              v-model="questionForm.knowledgePoints"
              placeholder="请输入相关考点，多个考点用逗号分隔"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveQuestion">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getQuestions, addQuestion, updateQuestion, deleteQuestion as deleteQuestionApi } from '@/api/practice'

export default {
  name: 'QuestionBank',
  setup() {
    const store = useStore()

    const viewMode = ref('list')
    const currentPage = ref(1)
    const pageSize = ref(20)
    const showAddDialog = ref(false)
    const isEdit = ref(false)
    const selectedQuestions = ref([])

    const filters = reactive({
      subject: '',
      chapter: '',
      questionType: '',
      difficulty: '',
      year: ''
    })

    const questionForm = reactive({
      id: null,
      subject: '',
      chapter: '',
      type: 'single',
      difficulty: 'easy',
      year: '',
      content: '',
      options: [
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
      ],
      correctAnswer: 0,
      answer: '',
      explanation: '',
      knowledgePoints: ''
    })

    const chapters = ref([
      { label: '第一章 绪论', value: 'chapter1' },
      { label: '第二章 线性表', value: 'chapter2' },
      { label: '第三章 栈和队列', value: 'chapter3' },
      { label: '第四章 树与二叉树', value: 'chapter4' },
      { label: '第五章 图', value: 'chapter5' }
    ])

    const years = ref([])
    for (let i = 2025; i >= 1998; i--) {
      years.value.push(i.toString())
    }

    const questions = ref([])
    const total = ref(0)

    const filteredQuestions = computed(() => {
      return questions.value.filter(q => {
        return (!filters.subject || q.subject.includes(filters.subject)) &&
               (!filters.questionType || q.type === filters.questionType) &&
               (!filters.difficulty || q.difficulty === filters.difficulty) &&
               (!filters.year || q.year === filters.year)
      })
    })

    const paginatedQuestions = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredQuestions.value.slice(start, end)
    })

    const getTypeLabel = (type) => {
      const typeMap = {
        single: '单选',
        multiple: '多选',
        fill: '填空',
        comprehensive: '综合'
      }
      return typeMap[type] || type
    }

    const getTypeTagType = (type) => {
      const typeMap = {
        single: 'primary',
        multiple: 'success',
        fill: 'warning',
        comprehensive: 'danger'
      }
      return typeMap[type] || ''
    }

    const getDifficultyLabel = (difficulty) => {
      const difficultyMap = {
        easy: '基础',
        medium: '中等',
        hard: '困难'
      }
      return difficultyMap[difficulty] || difficulty
    }

    const getDifficultyTagType = (difficulty) => {
      const difficultyMap = {
        easy: 'success',
        medium: 'warning',
        hard: 'danger'
      }
      return difficultyMap[difficulty] || ''
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadQuestions()
    }

    const loadQuestions = async () => {
      try {
        const params = {
          current: currentPage.value,
          size: pageSize.value,
          subject: filters.subject,
          difficulty: filters.difficulty?.toUpperCase(),
          type: filters.questionType?.toUpperCase(),
          year: filters.year
        }

        const { data } = await getQuestions(params)
        questions.value = data.records.map(q => ({
          ...q,
          options: JSON.parse(q.options || '{}')
        }))
        total.value = data.total
      } catch (error) {
        ElMessage.error('加载题目失败')
      }
    }

    const resetFilters = () => {
      Object.keys(filters).forEach(key => {
        filters[key] = ''
      })
      currentPage.value = 1
    }

    const handleSelectionChange = (selection) => {
      selectedQuestions.value = selection
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
    }

    const viewQuestion = (question) => {
      ElMessage.info(`查看题目：${question.id}`)
    }

    const editQuestion = (question) => {
      isEdit.value = true
      showAddDialog.value = true
      Object.assign(questionForm, question)
      if (question.type === 'single' || question.type === 'multiple') {
        questionForm.options = question.options.map((opt, index) => ({
          content: opt,
          isCorrect: question.correctAnswer.includes(index)
        }))
      }
    }

    const deleteQuestionItem = async (question) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除题目"${question.content.substring(0, 20)}..."吗？`,
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
      questionForm.options.push({ content: '', isCorrect: false })
    }

    const removeOption = (index) => {
      questionForm.options.splice(index, 1)
    }

    const saveQuestion = async () => {
      try {
        const data = {
          subject: mapSubject(questionForm.subject),
          type: mapType(questionForm.type),
          difficulty: mapDifficulty(questionForm.difficulty),
          year: questionForm.year,
          topic: questionForm.content,
          options: JSON.stringify(
            questionForm.type === 'single' || questionForm.type === 'multiple'
              ? questionForm.options.map(o => o.content)
              : {}
          ),
          answer: formatAnswer(),
          analysis: questionForm.explanation,
          tags: questionForm.knowledgePoints,
          chapter: questionForm.chapter
        }

        if (isEdit.value) {
          data.id = questionForm.id
          await updateQuestion(data)
          ElMessage.success('题目更新成功')
          await loadQuestions()
        } else {
          await addQuestion(data)
          ElMessage.success('题目添加成功')
          await loadQuestions()
        }

        showAddDialog.value = false
        resetQuestionForm()
      } catch (error) {
        ElMessage.error('保存失败，请重试')
      }
    }

    const mapSubject = (subject) => {
      const map = {
        '数据结构': 'DS',
        '计算机组成原理': 'CO',
        '操作系统': 'OS',
        '计算机网络': 'CN'
      }
      return map[subject] || subject
    }

    const mapType = (type) => {
      return type?.toUpperCase()
    }

    const mapDifficulty = (difficulty) => {
      return difficulty?.toUpperCase()
    }

    const formatAnswer = () => {
      if (questionForm.type === 'single') {
        return String.fromCharCode(65 + questionForm.correctAnswer)
      } else if (questionForm.type === 'multiple') {
        return questionForm.correctAnswer
          .filter((_, i) => questionForm.options[i]?.isCorrect)
          .map(i => String.fromCharCode(65 + i))
          .join(',')
      } else {
        return questionForm.answer
      }
    }

    const resetQuestionForm = () => {
      Object.assign(questionForm, {
        id: null,
        subject: '',
        chapter: '',
        type: 'single',
        difficulty: 'easy',
        year: '',
        content: '',
        options: [
          { content: '', isCorrect: false },
          { content: '', isCorrect: false }
        ],
        correctAnswer: 0,
        answer: '',
        explanation: '',
        knowledgePoints: ''
      })
      isEdit.value = false
    }

    const importQuestions = () => {
      ElMessage.info('批量导入功能开发中...')
    }

    const exportQuestions = () => {
      ElMessage.info('导出功能开发中...')
    }

    onMounted(() => {
      loadQuestions()
    })

    return {
      viewMode,
      currentPage,
      pageSize,
      total,
      showAddDialog,
      isEdit,
      filters,
      questionForm,
      chapters,
      years,
      questions,
      filteredQuestions,
      paginatedQuestions,
      getTypeLabel,
      getTypeTagType,
      getDifficultyLabel,
      getDifficultyTagType,
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
</style>