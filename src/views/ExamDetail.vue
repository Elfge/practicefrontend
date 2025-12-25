<template>
  <div class="exam-detail">
    <!-- 考试头部 -->
    <div class="exam-header">
      <div class="exam-info">
        <h2>{{ examInfo.name }}</h2>
        <el-space>
          <el-tag type="info">{{ examInfo.subject }}</el-tag>
          <el-tag>{{ examInfo.totalQuestions }}题</el-tag>
          <el-tag type="warning">{{ examInfo.totalScore }}分</el-tag>
        </el-space>
      </div>

      <div class="exam-timer">
        <el-progress
          type="circle"
          :percentage="timeProgress"
          :width="100"
          :stroke-width="8"
          :color="getTimerColor"
        >
          <template #default>
            <div class="timer-content">
              <div class="time-display">{{ formatTime(remainingTime) }}</div>
              <div class="time-label">剩余时间</div>
            </div>
          </template>
        </el-progress>
      </div>

      <div class="exam-actions">
        <el-space>
          <el-button @click="showQuestionList = true">
            <el-icon><List /></el-icon>
            答题卡
          </el-button>
          <el-button @click="submitExam" type="danger">
            <el-icon><Upload /></el-icon>
            交卷
          </el-button>
        </el-space>
      </div>
    </div>

    <!-- 考试主体 -->
    <div class="exam-body">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="question-card">
            <div class="question-header">
              <span class="question-title">
                第 {{ currentQuestionIndex + 1 }} 题
                <el-tag :type="getQuestionTypeTag(currentQuestion?.type)" size="small">
                  {{ getQuestionTypeText(currentQuestion?.type) }}
                </el-tag>
              </span>
              <span class="question-score">{{ currentQuestion?.score || 2 }}分</span>
            </div>

            <div v-if="currentQuestion" class="question-content">
              <div class="question-stem" v-html="currentQuestion.content"></div>

              <!-- 选择题选项 -->
              <div v-if="currentQuestion.type === 'single'" class="options-container">
                <el-radio-group v-model="answers[currentQuestion.id]">
                  <div v-for="(option, index) in currentQuestion.options" :key="index" class="option-item">
                    <el-radio :label="index">
                      <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                      <span v-html="option"></span>
                    </el-radio>
                  </div>
                </el-radio-group>
              </div>

              <div v-else-if="currentQuestion.type === 'multiple'" class="options-container">
                <el-checkbox-group v-model="answers[currentQuestion.id]">
                  <div v-for="(option, index) in currentQuestion.options" :key="index" class="option-item">
                    <el-checkbox :label="index">
                      <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                      <span v-html="option"></span>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>

              <!-- 填空题 -->
              <div v-else-if="currentQuestion.type === 'fill'" class="fill-container">
                <div v-for="(blank, index) in currentQuestion.blanks" :key="index" class="blank-item">
                  <span>填空{{ index + 1 }}：</span>
                  <el-input
                    v-model="answers[currentQuestion.id][index]"
                    placeholder="请输入答案"
                  />
                </div>
              </div>

              <!-- 综合题 -->
              <div v-else-if="currentQuestion.type === 'comprehensive'" class="comprehensive-container">
                <el-input
                  v-model="answers[currentQuestion.id]"
                  type="textarea"
                  :rows="8"
                  placeholder="请详细阐述你的解题思路和答案"
                />
              </div>
            </div>

            <!-- 题目导航 -->
            <div class="question-nav">
              <el-button
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0"
              >
                上一题
              </el-button>
              <div class="nav-info">
                {{ currentQuestionIndex + 1 }} / {{ examInfo.totalQuestions }}
              </div>
              <el-button
                @click="nextQuestion"
                :disabled="currentQuestionIndex === examInfo.totalQuestions - 1"
              >
                下一题
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="exam-sidebar">
            <template #header>
              <span>答题情况</span>
            </template>

            <div class="answer-overview">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="overview-item">
                    <div class="overview-number">{{ answeredCount }}</div>
                    <div class="overview-label">已答题</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="overview-item">
                    <div class="overview-number">{{ unansweredCount }}</div>
                    <div class="overview-label">未答题</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="overview-item">
                    <div class="overview-number">{{ markedCount }}</div>
                    <div class="overview-label">已标记</div>
                  </div>
                </el-col>
              </el-row>
            </div>

            <el-divider />

            <div class="time-distribution">
              <h4>各科目用时</h4>
              <div v-for="subject in timeDistribution" :key="subject.name" class="time-item">
                <span>{{ subject.name }}</span>
                <span>{{ formatTime(subject.time) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 答题卡弹窗 -->
    <el-drawer
      v-model="showQuestionList"
      title="答题卡"
      direction="rtl"
      size="500px"
    >
      <div class="answer-sheet">
        <div class="sheet-header">
          <span>答题卡</span>
          <div class="sheet-status">
            <el-tag type="success">{{ answeredCount }}题已答</el-tag>
            <el-tag type="danger">{{ unansweredCount }}题未答</el-tag>
          </div>
        </div>

        <div class="question-grid">
          <div
            v-for="(question, index) in questions"
            :key="question.id"
            class="grid-item"
            :class="{
              'answered': isAnswered(question.id),
              'current': index === currentQuestionIndex,
              'marked': question.marked
            }"
            @click="jumpToQuestion(index)"
          >
            {{ index + 1 }}
          </div>
        </div>

        <div class="sheet-footer">
          <el-space>
            <el-button @click="markCurrentQuestion">
              <el-icon><Star /></el-icon>
              标记当前题
            </el-button>
            <el-button @click="clearAnswers">
              <el-icon><Delete /></el-icon>
              清空答案
            </el-button>
            <el-button type="danger" @click="submitExam">
              提交试卷
            </el-button>
          </el-space>
        </div>
      </div>
    </el-drawer>

    <!-- 交卷确认弹窗 -->
    <el-dialog
      v-model="showSubmitConfirm"
      title="确认交卷"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="submit-confirm">
        <el-alert
          title="请确认是否交卷？"
          type="warning"
          :description="`还有 ${unansweredCount} 题未答，交卷后将无法修改答案。`"
          show-icon
          :closable="false"
        />
        <div class="submit-stats" style="margin-top: 20px;">
          <p>已答题：{{ answeredCount }} 题</p>
          <p>未答题：{{ unansweredCount }} 题</p>
          <p>用时：{{ formatTime(examInfo.duration * 60 - remainingTime) }}</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="showSubmitConfirm = false">继续答题</el-button>
        <el-button type="danger" @click="confirmSubmit">确认交卷</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  List,
  Upload,
  Star,
  Delete
} from '@element-plus/icons-vue'
import { getQuestions, submitExamResult } from '@/api/practice'

export default {
  name: 'ExamDetail',
  components: {
    List,
    Upload,
    Star,
    Delete
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const examType = route.params.type // 'past' 或 'custom'
    const examId = route.params.id
    const sessionId = ref(route.query.session || null)

    const questions = ref([])
    const currentQuestionIndex = ref(0)
    const answers = reactive({})
    const showQuestionList = ref(false)
    const showSubmitConfirm = ref(false)
    const remainingTime = ref(10800) // 3小时

    const examInfo = ref({
      name: examType === 'past' ? '2024年408真题' : '自定义模拟卷',
      subject: '408综合',
      totalQuestions: 40,
      totalScore: 150,
      duration: 180 // 分钟
    })

    const currentQuestion = computed(() => {
      return questions.value[currentQuestionIndex.value]
    })

    const answeredCount = computed(() => {
      return Object.values(answers).filter(answer => {
        if (Array.isArray(answer)) {
          return answer.length > 0
        }
        return answer !== null && answer !== undefined && answer !== ''
      }).length
    })

    const unansweredCount = computed(() => {
      return questions.value.length - answeredCount.value
    })

    const markedCount = computed(() => {
      return questions.value.filter(q => q.marked).length
    })

    const timeProgress = computed(() => {
      return ((examInfo.value.duration * 60 - remainingTime.value) / (examInfo.value.duration * 60)) * 100
    })

    const getTimerColor = computed(() => {
      if (remainingTime.value < 600) return '#F56C6C' // 少于10分钟红色
      if (remainingTime.value < 1800) return '#E6A23C' // 少于30分钟橙色
      return '#67C23A' // 绿色
    })

    const timeDistribution = ref([
      { name: '数据结构', time: 1800 },
      { name: '计算机组成原理', time: 1200 },
      { name: '操作系统', time: 900 },
      { name: '计算机网络', time: 600 }
    ])

    let timerInterval = null

    onMounted(async () => {
      await loadExamData()
      startTimer()
      initAnswers()
    })

    onBeforeUnmount(() => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    })

    const loadExamData = async () => {
      try {
        const res = await getQuestions({
          count: examInfo.value.totalQuestions
        })
        if (res.data && res.data.list) {
          questions.value = res.data.list.map((q) => ({
            ...q,
            content: q.topic || q.content, // 后端用topic，前端用content
            options: parseOptions(q.options),
            score: getQuestionScore(q.type),
            marked: false
          }))
          examInfo.value.totalQuestions = questions.value.length
        }
      } catch (error) {
        console.error('加载试卷失败', error)
        ElMessage.error('加载试卷失败')
        router.push('/exam')
      }
    }

    // 解析选项JSON
    const parseOptions = (optionsStr) => {
      if (!optionsStr) return []
      try {
        const parsed = JSON.parse(optionsStr)
        if (Array.isArray(parsed)) return parsed
        // 如果是对象格式 {A: "...", B: "..."}
        return Object.values(parsed)
      } catch {
        return []
      }
    }

    const getQuestionScore = (type) => {
      const scoreMap = {
        single: 2,
        multiple: 4,
        fill: 2,
        comprehensive: 10
      }
      return scoreMap[type] || 2
    }

    const initAnswers = () => {
      questions.value.forEach(question => {
        if (question.type === 'multiple') {
          answers[question.id] = []
        } else if (question.type === 'fill') {
          answers[question.id] = new Array(question.blanks || 1).fill('')
        } else {
          answers[question.id] = null
        }
      })
    }

    const startTimer = () => {
      timerInterval = setInterval(() => {
        remainingTime.value--
        if (remainingTime.value <= 0) {
          clearInterval(timerInterval)
          forceSubmit()
        }
      }, 1000)
    }

    const previousQuestion = () => {
      if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--
      }
    }

    const nextQuestion = () => {
      if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++
      }
    }

    const jumpToQuestion = (index) => {
      currentQuestionIndex.value = index
      showQuestionList.value = false
    }

    const markCurrentQuestion = () => {
      if (currentQuestion.value) {
        currentQuestion.value.marked = !currentQuestion.value.marked
        ElMessage.info(currentQuestion.value.marked ? '已标记' : '已取消标记')
      }
    }

    const isAnswered = (questionId) => {
      const answer = answers[questionId]
      if (Array.isArray(answer)) {
        return answer.length > 0
      }
      return answer !== null && answer !== undefined && answer !== ''
    }

    const clearAnswers = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要清空所有答案吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        initAnswers()
        ElMessage.success('已清空所有答案')
      } catch {
        // 用户取消
      }
    }

    const submitExam = () => {
      showSubmitConfirm.value = true
    }

    const confirmSubmit = () => {
      showSubmitConfirm.value = false
      finishExam()
    }

    const forceSubmit = () => {
      ElMessage.warning('考试时间到，系统将自动交卷')
      finishExam()
    }

    const finishExam = async () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }

      const timeUsed = examInfo.value.duration * 60 - remainingTime.value

      // 调用后端API提交考试
      if (sessionId.value) {
        try {
          const res = await submitExamResult(sessionId.value, {
            answers: { ...answers },
            timeUsed
          })
          if (res.data) {
            // 保存结果到localStorage供结果页使用
            localStorage.setItem(`exam_${sessionId.value}`, JSON.stringify(res.data))
          }
        } catch (error) {
          console.error('提交考试失败', error)
        }
      } else {
        // 无sessionId时，本地模拟结果
        const result = {
          examId,
          examType,
          answers,
          timeUsed,
          answeredCount: answeredCount.value,
          score: calculateScore()
        }
        localStorage.setItem(`exam_${examId}`, JSON.stringify(result))
      }

      ElMessage.success('考试已完成，正在生成报告...')
      router.push(`/exam/result/${sessionId.value || examId}`)
    }

    const calculateScore = () => {
      // 模拟计算得分
      return Math.floor(Math.random() * 40) + 110 // 110-150分
    }

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getQuestionTypeTag = (type) => {
      if (!type) return 'info'
      const tagMap = {
        'single': 'primary',
        'SINGLE': 'primary',
        'multiple': 'success',
        'MULTIPLE': 'success',
        'fill': 'warning',
        'BLANK': 'warning',
        'comprehensive': 'danger',
        'COMPREHENSIVE': 'danger'
      }
      return tagMap[type] || 'info'
    }

    const getQuestionTypeText = (type) => {
      if (!type) return '未知'
      const textMap = {
        'single': '单选题',
        'SINGLE': '单选题',
        'multiple': '多选题',
        'MULTIPLE': '多选题',
        'fill': '填空题',
        'BLANK': '填空题',
        'comprehensive': '综合题',
        'COMPREHENSIVE': '综合题'
      }
      return textMap[type] || type
    }

    return {
      examInfo,
      questions,
      currentQuestionIndex,
      currentQuestion,
      answers,
      showQuestionList,
      showSubmitConfirm,
      remainingTime,
      timeDistribution,
      answeredCount,
      unansweredCount,
      markedCount,
      timeProgress,
      getTimerColor,
      previousQuestion,
      nextQuestion,
      jumpToQuestion,
      markCurrentQuestion,
      isAnswered,
      clearAnswers,
      submitExam,
      confirmSubmit,
      formatTime,
      getQuestionTypeTag,
      getQuestionTypeText
    }
  }
}
</script>

<style scoped>
.exam-detail {
  min-height: calc(100vh - 120px);
}

.exam-header {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.exam-info h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.exam-timer {
  flex: 1;
  display: flex;
  justify-content: center;
}

.timer-content {
  text-align: center;
}

.time-display {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.time-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.question-card {
  min-height: 600px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.question-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.question-score {
  font-size: 16px;
  color: #E6A23C;
}

.question-content {
  min-height: 400px;
}

.question-stem {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 30px;
  color: #303133;
}

.options-container {
  padding-left: 20px;
}

.option-item {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.option-item:hover {
  background-color: #f5f7fa;
}

.option-label {
  font-weight: bold;
  margin-right: 10px;
}

.fill-container {
  margin-top: 20px;
}

.blank-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.blank-item span {
  width: 80px;
  font-weight: bold;
}

.comprehensive-container {
  margin-top: 20px;
}

.question-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.nav-info {
  font-size: 16px;
  color: #606266;
}

.exam-sidebar {
  height: fit-content;
}

.answer-overview {
  margin-bottom: 20px;
}

.overview-item {
  text-align: center;
}

.overview-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.overview-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.time-distribution h4 {
  margin-bottom: 15px;
  color: #303133;
}

.time-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.answer-sheet {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sheet-status {
  display: flex;
  gap: 10px;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  flex: 1;
  margin-bottom: 20px;
}

.grid-item {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.grid-item:hover {
  background-color: #f5f7fa;
}

.grid-item.current {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

.grid-item.answered {
  background-color: #f0f9ff;
  border-color: #409eff;
  color: #409eff;
}

.grid-item.marked {
  background-color: #fdf6ec;
  border-color: #E6A23C;
  color: #E6A23C;
}

.sheet-footer {
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.submit-confirm {
  text-align: center;
}

.submit-stats {
  text-align: left;
}

.submit-stats p {
  margin: 8px 0;
}
</style>