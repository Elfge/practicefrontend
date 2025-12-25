<template>
  <div class="practice-mode">
    <!-- 顶部工具栏 -->
    <div class="practice-header">
      <div class="left-section">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/practice' }">刷题练习</el-breadcrumb-item>
          <el-breadcrumb-item>{{ modeText }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="center-section">
        <el-tag v-if="currentQuestion" type="primary" size="large">
          {{ currentIndex + 1 }} / {{ totalQuestions }}
        </el-tag>
      </div>

      <div class="right-section">
        <el-space>
          <el-button @click="toggleTimer" v-if="mode === 'single' && timerEnabled">
            <el-icon><Timer /></el-icon>
            {{ formatTime(timer) }}
          </el-button>
          <el-button @click="showQuestionList = true">
            <el-icon><List /></el-icon>
            题目列表
          </el-button>
          <el-button @click="exitPractice">
            <el-icon><Close /></el-icon>
            退出
          </el-button>
        </el-space>
      </div>
    </div>

    <!-- 套题模式计时器 -->
    <div v-if="mode === 'batch'" class="exam-timer">
      <el-progress
        type="circle"
        :percentage="examProgress"
        :width="120"
        :stroke-width="8"
        :color="getTimerColor"
      >
        <template #default>
          <div class="timer-content">
            <div class="time-display">{{ formatTime(examTime) }}</div>
            <div class="time-label">剩余时间</div>
          </div>
        </template>
      </el-progress>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 题目区域 -->
      <el-col :span="showAnalysis ? 16 : 24">
        <el-card class="question-card" v-if="currentQuestion">
          <div class="question-header">
            <div class="question-info">
              <el-tag :type="getDifficultyType(currentQuestion.difficulty)">
                {{ getDifficultyText(currentQuestion.difficulty) }}
              </el-tag>
              <el-tag type="info">{{ currentQuestion.subject }}</el-tag>
              <el-tag type="warning">{{ currentQuestion.chapter }}</el-tag>
            </div>
            <div class="question-actions">
              <el-button
                type="warning"
                :icon="QuestionFilled"
                circle
                @click="toggleMark"
                :class="{ 'is-marked': currentQuestion.isMarked }"
              />
              <el-button
                type="danger"
                :icon="Star"
                circle
                @click="toggleCollect"
                :class="{ 'is-collected': currentQuestion.isCollected }"
              />
            </div>
          </div>

          <div class="question-content">
            <div class="question-stem" v-html="currentQuestion.content"></div>

            <!-- 选择题选项 -->
            <div v-if="currentQuestion.type === 'SINGLE'" class="options-container">
              <el-radio-group v-model="userAnswer" :disabled="showAnalysis">
                <div v-for="(option, index) in currentQuestion.options" :key="index" class="option-item">
                  <el-radio :label="index">
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                    <span v-html="option"></span>
                  </el-radio>
                </div>
              </el-radio-group>
            </div>

            <div v-else-if="currentQuestion.type === 'MULTIPLE'" class="options-container">
              <el-checkbox-group v-model="userAnswer" :disabled="showAnalysis">
                <div v-for="(option, index) in currentQuestion.options" :key="index" class="option-item">
                  <el-checkbox :label="index">
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                    <span v-html="option"></span>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>

            <!-- 填空题 -->
            <div v-else-if="currentQuestion.type === 'BLANK'" class="fill-container">
              <el-input
                v-model="userAnswer"
                type="textarea"
                :rows="2"
                placeholder="请输入答案"
                :disabled="showAnalysis"
              />
            </div>

            <!-- 综合题 -->
            <div v-else-if="currentQuestion.type === 'COMPREHENSIVE'" class="comprehensive-container">
              <el-input
                v-model="userAnswer"
                type="textarea"
                :rows="6"
                placeholder="请详细阐述你的解题思路和答案"
                :disabled="showAnalysis"
              />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="question-footer">
            <el-space>
              <el-button @click="previousQuestion" :disabled="currentIndex === 0">
                上一题
              </el-button>
              <el-button
                type="primary"
                @click="nextQuestion"
                :disabled="!hasAnswer && !showAnalysis"
                v-if="!showAnalysis || (showAnalysis && questionStatus[currentIndex].answered)"
              >
                {{ currentIndex === totalQuestions - 1 ? '完成' : '下一题' }}
              </el-button>
              <el-button
                type="primary"
                @click="submitAnswer"
                v-if="!showAnalysis && hasAnswer"
              >
                提交答案
              </el-button>
            </el-space>
          </div>
        </el-card>

        <!-- 题目为空或加载中 -->
        <el-empty v-else description="暂无题目" />
      </el-col>

      <!-- 解析区域 -->
      <el-col :span="8" v-if="showAnalysis">
        <el-card class="analysis-card">
          <template #header>
            <div class="analysis-header">
              <span>题目解析</span>
              <el-tag :type="answerResult.isCorrect ? 'success' : 'danger'">
                {{ answerResult.isCorrect ? '回答正确' : '回答错误' }}
              </el-tag>
            </div>
          </template>

          <div class="analysis-content">
            <div class="answer-section">
              <h4>标准答案：</h4>
              <div v-if="currentQuestion.type === 'SINGLE'">
                {{ String.fromCharCode(65 + currentQuestion.correctAnswer) }}
              </div>
              <div v-else-if="currentQuestion.type === 'MULTIPLE'">
                {{ currentQuestion.correctAnswer.map(i => String.fromCharCode(65 + i)).join(', ') }}
              </div>
              <div v-else-if="currentQuestion.type === 'BLANK'">
                {{ currentQuestion.answer }}
              </div>
              <div v-else-if="currentQuestion.type === 'COMPREHENSIVE'" class="ref-answer">
                <pre>{{ currentQuestion.answer }}</pre>
              </div>
            </div>

            <div class="explanation-section">
              <h4>解析：</h4>
              <div v-html="currentQuestion.explanation"></div>
            </div>

            <div class="knowledge-section">
              <h4>相关考点：</h4>
              <el-tag
                v-for="point in currentQuestion.knowledgePoints"
                :key="point"
                type="info"
                style="margin-right: 8px; margin-bottom: 8px;"
                @click="viewKnowledge(point)"
              >
                {{ point }}
              </el-tag>
            </div>

            <!-- 综合题评分 -->
            <div v-if="currentQuestion.type === 'COMPREHENSIVE'" class="score-section">
              <h4>主观题评分：</h4>
              <el-rate
                v-model="subjectiveScore"
                :max="10"
                show-score
                text-color="#ff9900"
                score-template="{value} 分"
                @change="saveScore"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 题目列表弹窗 -->
    <el-drawer
      v-model="showQuestionList"
      title="题目列表"
      direction="rtl"
      size="400px"
    >
      <div class="question-list">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="list-item"
          :class="{
            'active': index === currentIndex,
            'answered': questionStatus[index].answered,
            'marked': question.isMarked,
            'collected': question.isCollected
          }"
          @click="jumpToQuestion(index)"
        >
          <div class="item-number">{{ index + 1 }}</div>
          <div class="item-info">
            <div class="item-type">{{ getTypeText(question.type) }}</div>
            <div class="item-status">
              <el-icon v-if="questionStatus[index].answered"><Check /></el-icon>
              <el-icon v-if="question.isMarked"><QuestionFilled /></el-icon>
              <el-icon v-if="question.isCollected"><Star /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 套题模式结束弹窗 -->
    <el-dialog
      v-model="showBatchResult"
      title="练习完成"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="batch-result">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="result-item">
              <div class="result-number">{{ correctCount }}</div>
              <div class="result-label">答对题数</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="result-item">
              <div class="result-number">{{ totalQuestions }}</div>
              <div class="result-label">总题数</div>
            </div>
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px;">
          <el-col :span="12">
            <div class="result-item">
              <div class="result-number">{{ accuracy }}%</div>
              <div class="result-label">正确率</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="result-item">
              <div class="result-number">{{ formatTime(totalTime) }}</div>
              <div class="result-label">用时</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <template #footer>
        <el-button @click="reviewMistakes" type="warning">查看错题</el-button>
        <el-button type="primary" @click="backToPractice">继续练习</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Timer,
  List,
  Close,
  QuestionFilled,
  Star,
  Check
} from '@element-plus/icons-vue'
import { collectQuestion, uncollectQuestion, createPracticeSession, getSessionDetail, updateSessionProgress } from '@/api/practice'
import { submitAnswer as submitAnswerApi } from '@/api/answer'

export default {
  name: 'PracticeMode',
  components: {
    Timer,
    List,
    Close,
    QuestionFilled,
    Star,
    Check
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const mode = ref(route.params.mode || 'single')
    const questions = ref([])
    const currentIndex = ref(0)
    const userAnswer = ref(null)
    const showAnalysis = ref(false)
    const showQuestionList = ref(false)
    const showBatchResult = ref(false)
    const timerEnabled = ref(true)
    const timer = ref(0)
    const examTime = ref(10800) // 3小时 = 10800秒
    const subjectiveScore = ref(7)
    const sessionId = ref(null) // 练习会话ID

    const questionStatus = reactive([])
    const userAnswers = reactive([]) // 存储每个题目的用户答案

    const currentQuestion = computed(() => {
      return questions.value[currentIndex.value] || null
    })

    const totalQuestions = computed(() => questions.value.length)

    const hasAnswer = computed(() => {
      if (!currentQuestion.value) return false
      if (currentQuestion.value.type === 'SINGLE') {
        return userAnswer.value !== null && userAnswer.value !== ''
      }
      if (currentQuestion.value.type === 'MULTIPLE') {
        return userAnswer.value && userAnswer.value.length > 0
      }
      return userAnswer.value !== null && userAnswer.value !== ''
    })

    const examProgress = computed(() => {
      return ((10800 - examTime.value) / 10800) * 100
    })

    const getTimerColor = computed(() => {
      if (examTime.value < 1800) return '#F56C6C' // 少于30分钟红色
      if (examTime.value < 3600) return '#E6A23C' // 少于1小时橙色
      return '#67C23A' // 绿色
    })

    const answerResult = reactive({
      isCorrect: false
    })

    const modeText = computed(() => {
      const modeMap = {
        single: '单题模式',
        batch: '套题模式',
        special: '专项模式'
      }
      return modeMap[mode.value] || '练习模式'
    })

    const showAnswerMode = computed(() => {
      return route.query.showAnswer || 'immediate'
    })

    let timerInterval = null

    onMounted(async () => {
      await loadQuestions()
      initTimer()
      if (route.query.continue) {
        // 恢复之前的练习进度
      }
    })

    onBeforeUnmount(() => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    })

    const loadQuestions = async () => {
      try {
        const count = parseInt(route.query.count) || 20
        const subject = route.query.subject || undefined
        const difficulty = route.query.difficulty || undefined
        const chapter = route.query.chapter || undefined

        // 检查是否是恢复练习
        if (route.query.continue) {
          const resumeId = parseInt(route.query.continue)
          try {
            const res = await getSessionDetail(resumeId)
            if (res.data) {
              sessionId.value = resumeId
              questions.value = res.data.questions.map(q => parseQuestionData(q))
              questions.value.forEach(() => {
                questionStatus.push({
                  answered: false,
                  isCorrect: false
                })
                userAnswers.push(null)
              })
              // 恢复已答题的状态
              if (res.data.userAnswers) {
                Object.keys(res.data.userAnswers).forEach(qid => {
                  const idx = questions.value.findIndex(q => q.id === parseInt(qid))
                  if (idx >= 0) {
                    questionStatus[idx].answered = true
                  }
                })
              }
              return
            }
          } catch (e) {
            console.error('恢复练习失败', e)
          }
        }

        // 创建新的练习会话
        const res = await createPracticeSession({
          mode: mode.value,
          subject: subject,
          chapter: chapter,
          difficulty: difficulty,
          count: count
        })

        if (res.data && res.data.questions) {
          sessionId.value = res.data.sessionId
          questions.value = res.data.questions.map(q => parseQuestionData(q))
          questions.value.forEach(() => {
            questionStatus.push({
              answered: false,
              isCorrect: false
            })
            userAnswers.push(null)
          })
        } else {
          ElMessage.error('未找到符合条件的题目')
        }
      } catch (error) {
        ElMessage.error('加载题目失败: ' + (error.message || '请检查网络连接'))
      }
    }

    const parseQuestionData = (q) => {
      // 解析题目数据
      const question = {
        id: q.id,
        subject: q.subject,
        type: q.type,
        difficulty: q.difficulty,
        chapter: q.chapter,
        year: q.year,
        topic: q.topic,
        answer: q.answer,
        analysis: q.analysis,
        tags: q.tags,
        isMarked: false,
        isCollected: false
      }

      // 解析选项
      if (q.type === 'SINGLE' || q.type === 'MULTIPLE') {
        try {
          const options = typeof q.options === 'string'
            ? JSON.parse(q.options)
            : q.options
          question.options = Object.values(options)
        } catch {
          question.options = []
        }

        // 解析正确答案
        if (q.type === 'SINGLE') {
          question.correctAnswer = q.answer.charCodeAt(0) - 65 // 'A' -> 0
        } else if (q.type === 'MULTIPLE') {
          question.correctAnswer = q.answer.split(',').map(a => a.charCodeAt(0) - 65)
        }
      } else {
        question.options = []
        question.correctAnswer = q.answer
      }

      // 知识点
      if (q.tags) {
        question.knowledgePoints = q.tags.split(',').filter(t => t)
      } else {
        question.knowledgePoints = []
      }

      // 向后兼容字段
      question.content = q.topic
      question.explanation = q.analysis

      return question
    }

    const initTimer = () => {
      if (mode.value === 'single' && timerEnabled.value) {
        timerInterval = setInterval(() => {
          timer.value++
        }, 1000)
      } else if (mode.value === 'batch') {
        timerInterval = setInterval(() => {
          examTime.value--
          if (examTime.value <= 0) {
            forceSubmit()
          }
        }, 1000)
      }
    }

    const toggleTimer = () => {
      timerEnabled.value = !timerEnabled.value
      if (timerEnabled.value && !timerInterval) {
        timerInterval = setInterval(() => {
          timer.value++
        }, 1000)
      } else if (!timerEnabled.value && timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }

    const submitAnswer = async () => {
      if (!hasAnswer.value) {
        ElMessage.warning('请先完成题目')
        return
      }

      try {
        let answerText = ''
        if (currentQuestion.value.type === 'SINGLE') {
          answerText = String.fromCharCode(65 + userAnswer.value)
        } else if (currentQuestion.value.type === 'MULTIPLE') {
          answerText = userAnswer.value.map(i => String.fromCharCode(65 + i)).join(',')
        } else {
          answerText = userAnswer.value
        }

        const res = await submitAnswerApi({
          questionId: currentQuestion.value.id,
          userAnswer: answerText
        })

        // 判断答案是否正确
        if (res.data && res.data.isCorrect !== undefined) {
          answerResult.isCorrect = res.data.isCorrect
        } else {
          // 如果后端没有返回isCorrect，自己判断
          if (currentQuestion.value.type === 'SINGLE') {
            answerResult.isCorrect = userAnswer.value === currentQuestion.value.correctAnswer
          } else if (currentQuestion.value.type === 'MULTIPLE') {
            const userSet = new Set(userAnswer.value)
            const correctSet = new Set(currentQuestion.value.correctAnswer)
            answerResult.isCorrect = userSet.size === correctSet.size &&
              [...userSet].every(x => correctSet.has(x))
          } else {
            answerResult.isCorrect = answerText === currentQuestion.value.answer
          }
        }

        // 保存用户答案（多选题需要深拷贝）
        if (currentQuestion.value.type === 'MULTIPLE' && Array.isArray(userAnswer.value)) {
          userAnswers[currentIndex.value] = [...userAnswer.value]
        } else {
          userAnswers[currentIndex.value] = userAnswer.value
        }

        // 更新题目状态
        questionStatus[currentIndex.value].answered = true
        questionStatus[currentIndex.value].isCorrect = answerResult.isCorrect

        // 更新服务器端的进度
        if (sessionId.value) {
          try {
            await updateSessionProgress(sessionId.value, {
              currentIndex: currentIndex.value,
              userAnswer: answerText,
              isCorrect: answerResult.isCorrect
            })
          } catch (e) {
            console.error('更新进度失败', e)
          }
        }

        showAnalysis.value = true
      } catch (error) {
        ElMessage.error('提交答案失败')
      }
    }

    const nextQuestion = async () => {
      // 只有当前题目未答过题时才提交答案
      if (!questionStatus[currentIndex.value].answered) {
        if (mode.value === 'single' && showAnswerMode.value === 'delay') {
          // 延迟查看模式，先提交答案
          await submitAnswer()
        } else if (!showAnalysis.value && hasAnswer.value) {
          await submitAnswer()
        }
      }

      if (currentIndex.value < totalQuestions.value - 1) {
        currentIndex.value++
        // 恢复下一题的答案状态
        if (questionStatus[currentIndex.value].answered) {
          showAnalysis.value = true
          // 多选题需要深拷贝，否则会引用同一个数组
          if (currentQuestion.value?.type === 'MULTIPLE' && Array.isArray(userAnswers[currentIndex.value])) {
            userAnswer.value = [...userAnswers[currentIndex.value]]
          } else {
            userAnswer.value = userAnswers[currentIndex.value]
          }
        } else {
          showAnalysis.value = false
          userAnswer.value = null
        }
        answerResult.isCorrect = questionStatus[currentIndex.value].isCorrect
      } else {
        // 最后一题，完成练习
        completePractice()
      }
    }

    const previousQuestion = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
        // 恢复之前的答案和解析状态
        if (questionStatus[currentIndex.value].answered) {
          showAnalysis.value = true
          // 多选题需要深拷贝，否则会引用同一个数组
          if (currentQuestion.value?.type === 'MULTIPLE' && Array.isArray(userAnswers[currentIndex.value])) {
            userAnswer.value = [...userAnswers[currentIndex.value]]
          } else {
            userAnswer.value = userAnswers[currentIndex.value]
          }
          answerResult.isCorrect = questionStatus[currentIndex.value].isCorrect
        } else {
          showAnalysis.value = false
          userAnswer.value = null
          answerResult.isCorrect = false
        }
      }
    }

    const toggleMark = () => {
      currentQuestion.value.isMarked = !currentQuestion.value.isMarked
      ElMessage.info(currentQuestion.value.isMarked ? '已标记' : '已取消标记')
    }

    const toggleCollect = async () => {
      try {
        const question = currentQuestion.value
        if (question.isCollected) {
          await uncollectQuestion(question.id)
          question.isCollected = false
          ElMessage.success('已取消收藏')
        } else {
          await collectQuestion(question.id)
          question.isCollected = true
          ElMessage.success('已收藏')
        }
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    const jumpToQuestion = (index) => {
      currentIndex.value = index
      showQuestionList.value = false
      // 恢复该题的答案和解析状态
      if (questionStatus[index].answered) {
        showAnalysis.value = true
        // 多选题需要深拷贝，否则会引用同一个数组
        if (questions.value[index]?.type === 'MULTIPLE' && Array.isArray(userAnswers[index])) {
          userAnswer.value = [...userAnswers[index]]
        } else {
          userAnswer.value = userAnswers[index]
        }
        answerResult.isCorrect = questionStatus[index].isCorrect
      } else {
        showAnalysis.value = false
        userAnswer.value = null
        answerResult.isCorrect = false
      }
    }

    const exitPractice = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要退出练习吗？当前进度将被保存。',
          '提示',
          {
            confirmButtonText: '确定退出',
            cancelButtonText: '继续练习',
            type: 'warning'
          }
        )
        router.push('/practice')
      } catch {
        // 用户取消
      }
    }

    const completePractice = () => {
      if (mode.value === 'batch') {
        showBatchResult.value = true
      } else {
        ElMessage.success('练习完成！')
        router.push('/practice')
      }
    }

    const forceSubmit = () => {
      ElMessage.warning('考试时间到，系统将自动提交')
      completePractice()
    }

    const reviewMistakes = () => {
      router.push('/mistakes')
    }

    const backToPractice = () => {
      router.push('/practice')
    }

    const viewKnowledge = (point) => {
      router.push(`/knowledge?point=${encodeURIComponent(point)}`)
    }

    const saveScore = (score) => {
      // 保存主观题评分
      ElMessage.success(`评分已保存：${score}分`)
    }

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getDifficultyType = (difficulty) => {
      const typeMap = {
        EASY: 'success',
        MEDIUM: 'warning',
        HARD: 'danger'
      }
      return typeMap[difficulty] || ''
    }

    const getDifficultyText = (difficulty) => {
      const textMap = {
        EASY: '基础',
        MEDIUM: '中等',
        HARD: '困难'
      }
      return textMap[difficulty] || difficulty
    }

    const getTypeText = (type) => {
      const textMap = {
        SINGLE: '单选',
        MULTIPLE: '多选',
        BLANK: '填空',
        COMPREHENSIVE: '综合'
      }
      return textMap[type] || type
    }

    const correctCount = computed(() => {
      return questionStatus.filter(q => q.isCorrect).length
    })

    const accuracy = computed(() => {
      if (totalQuestions.value === 0) return 0
      return Math.round((correctCount.value / totalQuestions.value) * 100)
    })

    const totalTime = computed(() => {
      return timer.value || (10800 - examTime.value)
    })

    return {
      mode,
      modeText,
      questions,
      currentIndex,
      userAnswer,
      showAnalysis,
      showQuestionList,
      showBatchResult,
      timerEnabled,
      timer,
      examTime,
      subjectiveScore,
      questionStatus,
      currentQuestion,
      totalQuestions,
      hasAnswer,
      examProgress,
      getTimerColor,
      answerResult,
      showAnswerMode,
      correctCount,
      accuracy,
      totalTime,
      nextQuestion,
      previousQuestion,
      submitAnswer,
      toggleMark,
      toggleCollect,
      jumpToQuestion,
      exitPractice,
      reviewMistakes,
      backToPractice,
      viewKnowledge,
      saveScore,
      formatTime,
      getDifficultyType,
      getDifficultyText,
      getTypeText,
      toggleTimer
    }
  }
}
</script>

<style scoped>
.practice-mode {
  min-height: calc(100vh - 120px);
}

.practice-header {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.exam-timer {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.timer-content {
  text-align: center;
}

.time-display {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.time-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.question-card {
  min-height: 500px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.question-info {
  display: flex;
  gap: 10px;
}

.question-actions {
  display: flex;
  gap: 10px;
}

.is-marked {
  color: #E6A23C !important;
  background-color: #FDF6EC !important;
  border-color: #F5DAB1 !important;
}

.is-collected {
  color: #F56C6C !important;
  background-color: #FEF0F0 !important;
  border-color: #FBC4C4 !important;
}

.question-content {
  margin-bottom: 20px;
}

.question-stem {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 20px;
  color: #303133;
}

.options-container {
  padding-left: 20px;
}

.option-item {
  margin-bottom: 15px;
  padding: 10px;
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

.fill-container,
.comprehensive-container {
  margin-top: 20px;
}

.ref-answer {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
}

.question-footer {
  text-align: center;
  margin-top: 20px;
}

.analysis-card {
  height: fit-content;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-content {
  max-height: 600px;
  overflow-y: auto;
}

.analysis-content h4 {
  color: #303133;
  margin: 20px 0 10px 0;
}

.answer-section {
  background: #f0f9ff;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.knowledge-section .el-tag {
  cursor: pointer;
}

.knowledge-section .el-tag:hover {
  transform: translateY(-2px);
  transition: all 0.3s;
}

.score-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.question-list {
  padding: 10px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.list-item:hover {
  background-color: #f5f7fa;
}

.list-item.active {
  background-color: #409eff;
  color: #fff;
}

.list-item.answered {
  background-color: #f0f9ff;
}

.list-item.marked {
  border-left: 3px solid #E6A23C;
}

.list-item.collected {
  border-left: 3px solid #F56C6C;
}

.item-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
}

.item-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-type {
  font-size: 12px;
  color: #909399;
}

.item-status {
  display: flex;
  gap: 5px;
}

.batch-result {
  text-align: center;
  padding: 20px;
}

.result-item {
  padding: 20px;
}

.result-number {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
}

.result-label {
  font-size: 14px;
  color: #909399;
  margin-top: 10px;
}
</style>