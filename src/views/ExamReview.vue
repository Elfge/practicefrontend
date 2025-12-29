<template>
  <div class="exam-review-container">
    <el-page-header @back="goBack" content="查看解析" />
    
    <div class="review-content">
      <el-card v-for="(question, index) in questions" :key="question.id" class="question-card">
        <template #header>
          <div class="question-header">
            <span>第 {{ index + 1 }} 题 - {{ getQuestionTypeText(question.type) }}</span>
            <el-tag :type="getUserAnswerStatus(question)">
              {{ getUserAnswerStatus(question) === 'success' ? '正确' : '错误' }}
            </el-tag>
          </div>
        </template>

        <div class="question-content">
          <div class="question-stem" v-html="question.topic || question.content"></div>

          <!-- 选择题选项 -->
          <div v-if="question.type === 'SINGLE' || question.type === 'MULTIPLE'" class="options-list">
            <div v-for="(option, idx) in parseOptions(question.options)" :key="idx" 
                 class="option-item"
                 :class="{
                   'correct-option': isCorrectOption(question.answer, idx),
                   'user-option': isUserOption(question.id, idx)
                 }">
              <span class="option-label">{{ String.fromCharCode(65 + idx) }}.</span>
              <span v-html="option"></span>
            </div>
          </div>

          <!-- 答案和解析 -->
          <div class="answer-section">
            <div class="answer-item">
              <strong>正确答案：</strong>{{ question.answer }}
            </div>
            <div class="answer-item" v-if="userAnswers[question.id]">
              <strong>你的答案：</strong>{{ userAnswers[question.id] }}
            </div>
            <div class="analysis-item" v-if="question.analysis">
              <strong>解析：</strong>
              <div v-html="question.analysis"></div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSessionDetail } from '@/api/practice'
import { ElMessage } from 'element-plus'

export default {
  name: 'ExamReview',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const sessionId = route.params.id
    
    const questions = ref([])
    const userAnswers = ref({})

    onMounted(async () => {
      await loadReviewData()
    })

    const loadReviewData = async () => {
      try {
        const res = await getSessionDetail(sessionId)
        if (res.data) {
          questions.value = res.data.questions || []
          userAnswers.value = res.data.userAnswers || {}
        }
      } catch (error) {
        console.error('加载解析失败', error)
        ElMessage.error('加载解析失败')
      }
    }

    const parseOptions = (optionsStr) => {
      if (!optionsStr) return []
      try {
        const parsed = JSON.parse(optionsStr)
        if (Array.isArray(parsed)) return parsed
        return Object.values(parsed)
      } catch {
        return []
      }
    }

    const getQuestionTypeText = (type) => {
      const typeMap = {
        'SINGLE': '单选题',
        'MULTIPLE': '多选题',
        'BLANK': '填空题',
        'COMPREHENSIVE': '综合题'
      }
      return typeMap[type] || type
    }

    const getUserAnswerStatus = (question) => {
      const userAns = userAnswers.value[question.id]
      if (!userAns) return 'info'
      return userAns.trim().toUpperCase() === question.answer.trim().toUpperCase() ? 'success' : 'danger'
    }

    const isCorrectOption = (answer, index) => {
      const answers = answer.split(',').map(a => a.trim())
      const optionLetter = String.fromCharCode(65 + index)
      return answers.includes(optionLetter)
    }

    const isUserOption = (questionId, index) => {
      const userAns = userAnswers.value[questionId]
      if (!userAns) return false
      const answers = userAns.split(',').map(a => a.trim())
      const optionLetter = String.fromCharCode(65 + index)
      return answers.includes(optionLetter)
    }

    const goBack = () => {
      router.back()
    }

    return {
      questions,
      userAnswers,
      parseOptions,
      getQuestionTypeText,
      getUserAnswerStatus,
      isCorrectOption,
      isUserOption,
      goBack
    }
  }
}
</script>

<style scoped>
.exam-review-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.review-content {
  margin-top: 20px;
}

.question-card {
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-content {
  padding: 20px 0;
}

.question-stem {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.options-list {
  margin: 20px 0;
}

.option-item {
  padding: 12px;
  margin: 8px 0;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.option-label {
  font-weight: bold;
  margin-right: 10px;
}

.correct-option {
  background-color: #f0f9ff;
  border-color: #67c23a;
}

.user-option {
  background-color: #fef0f0;
  border-color: #f56c6c;
}

.user-option.correct-option {
  background-color: #f0f9ff;
  border-color: #67c23a;
}

.answer-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}

.answer-item {
  margin: 10px 0;
  font-size: 15px;
}

.analysis-item {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  line-height: 1.8;
}

.analysis-item strong {
  display: block;
  margin-bottom: 10px;
  color: #303133;
}
</style>
