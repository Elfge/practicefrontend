<template>
  <div class="exam-result-container">
    <el-card class="result-header">
      <div class="result-title">
        <el-icon class="result-icon" :style="{ color: resultColor }">
          <Trophy v-if="score >= 90" />
          <SuccessFilled v-else-if="score >= 60" />
          <WarningFilled v-else />
        </el-icon>
        <h2>考试完成</h2>
        <p>{{ examInfo.name }}</p>
      </div>
    </el-card>

    <el-row :gutter="20" class="result-content">
      <el-col :span="16">
        <el-card class="score-card">
          <div class="score-display">
            <div class="main-score">
              <span class="score-value">{{ score }}</span>
              <span class="score-total">/ {{ examInfo.totalScore }}</span>
            </div>
            <div class="score-percent">{{ scorePercent }}%</div>
          </div>

          <el-divider />

          <el-row :gutter="40" class="stats-row">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ answeredCount }}</div>
                <div class="stat-label">已答题</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ correctCount }}</div>
                <div class="stat-label">答对题</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ wrongCount }}</div>
                <div class="stat-label">答错题</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ formatTime(timeUsed) }}</div>
                <div class="stat-label">用时</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="analysis-card" style="margin-top: 20px;">
          <template #header>
            <span>各科目得分情况</span>
          </template>
          <div v-for="subject in subjectScores" :key="subject.name" class="subject-item">
            <div class="subject-header">
              <span>{{ subject.name }}</span>
              <span>{{ subject.correct }}/{{ subject.total }} 题</span>
            </div>
            <el-progress
              :percentage="Math.round(subject.correct / subject.total * 100)"
              :color="getProgressColor(subject.correct / subject.total * 100)"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="action-card">
          <template #header>
            <span>下一步</span>
          </template>
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="reviewAnswers">
              <el-icon><View /></el-icon>
              查看解析
            </el-button>
            <el-button size="large" @click="reviewWrong">
              <el-icon><Edit /></el-icon>
              复习错题
            </el-button>
            <el-button size="large" @click="goHome">
              <el-icon><House /></el-icon>
              返回首页
            </el-button>
          </div>
        </el-card>

        <el-card class="tips-card" style="margin-top: 20px;">
          <template #header>
            <span>学习建议</span>
          </template>
          <div class="tips-content">
            <p v-if="score >= 120">🎉 优秀！继续保持这个水平！</p>
            <p v-else-if="score >= 90">👍 良好！再接再厉可以更好！</p>
            <p v-else-if="score >= 60">📚 及格！需要加强薄弱知识点的复习。</p>
            <p v-else>💪 不要灰心！建议先巩固基础知识。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getExamRecordDetail } from '@/api/practice'
import {
  Trophy,
  SuccessFilled,
  WarningFilled,
  View,
  Edit,
  House
} from '@element-plus/icons-vue'

export default {
  name: 'ExamResult',
  components: {
    Trophy,
    SuccessFilled,
    WarningFilled,
    View,
    Edit,
    House
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const examId = route.params.id
    const loading = ref(true)

    const examInfo = ref({
      name: '408模拟考试',
      totalScore: 150
    })

    const score = ref(0)
    const answeredCount = ref(0)
    const correctCount = ref(0)
    const wrongCount = ref(0)
    const timeUsed = ref(0)
    const accuracy = ref(0)
    const totalCount = ref(0)

    const subjectScores = ref([])

    const scorePercent = computed(() => {
      if (examInfo.value.totalScore === 0) return 0
      return Math.round((score.value / examInfo.value.totalScore) * 100)
    })

    const resultColor = computed(() => {
      if (accuracy.value >= 80) return '#67C23A'
      if (accuracy.value >= 60) return '#E6A23C'
      return '#F56C6C'
    })

    onMounted(() => {
      loadResult()
    })

    const loadResult = async () => {
      loading.value = true

      // 首先尝试从localStorage读取（交卷时存储的后端数据）
      const savedResult = localStorage.getItem(`exam_${examId}`)
      if (savedResult) {
        try {
          const result = JSON.parse(savedResult)
          parseBackendResult(result)
          loading.value = false
          return
        } catch (e) {
          console.error('解析本地结果失败', e)
        }
      }

      // 如果本地没有，尝试从后端获取
      try {
        const res = await getExamRecordDetail(examId)
        if (res.data) {
          parseBackendResult(res.data)
        }
      } catch (error) {
        console.error('获取考试结果失败', error)
        ElMessage.error('获取考试结果失败')
      } finally {
        loading.value = false
      }
    }

    // 解析后端返回的结果数据
    const parseBackendResult = (result) => {
      // 基本统计
      score.value = result.score || 0
      answeredCount.value = result.answeredCount || 0
      correctCount.value = result.correctCount || 0
      wrongCount.value = result.wrongCount || 0
      timeUsed.value = result.timeUsed || 0
      accuracy.value = result.accuracy || 0
      totalCount.value = result.totalCount || 0

      // 计算总分（根据题目数量估算）
      examInfo.value.totalScore = Math.max(totalCount.value * 2, 150)

      // 解析各科目统计
      const subjectCount = result.subjectCount || {}
      const subjectCorrect = result.subjectCorrect || {}

      const subjects = []
      for (const [name, total] of Object.entries(subjectCount)) {
        const correct = subjectCorrect[name] || 0
        subjects.push({
          name: formatSubjectName(name),
          correct,
          total
        })
      }

      // 如果后端没有返回科目统计，生成默认数据
      if (subjects.length === 0) {
        subjectScores.value = [
          { name: '综合', correct: correctCount.value, total: totalCount.value || answeredCount.value }
        ]
      } else {
        subjectScores.value = subjects
      }
    }

    // 格式化科目名称
    const formatSubjectName = (name) => {
      const nameMap = {
        'DS': '数据结构',
        '数据结构': '数据结构',
        'CO': '计算机组成原理',
        '计算机组成原理': '计算机组成原理',
        'OS': '操作系统',
        '操作系统': '操作系统',
        'CN': '计算机网络',
        '计算机网络': '计算机网络'
      }
      return nameMap[name] || name
    }

    const formatTime = (seconds) => {
      if (!seconds) return '0分钟'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      if (hours > 0) {
        return `${hours}时${minutes}分${secs}秒`
      }
      if (minutes > 0) {
        return `${minutes}分${secs}秒`
      }
      return `${secs}秒`
    }

    const getProgressColor = (percentage) => {
      if (percentage < 60) return '#F56C6C'
      if (percentage < 80) return '#E6A23C'
      return '#67C23A'
    }

    const reviewAnswers = () => {
      router.push(`/exam/review/${examId}`)
    }

    const reviewWrong = () => {
      router.push('/mistakes')
    }

    const goHome = () => {
      router.push('/home')
    }

    return {
      loading,
      examInfo,
      score,
      scorePercent,
      resultColor,
      answeredCount,
      correctCount,
      wrongCount,
      timeUsed,
      accuracy,
      subjectScores,
      formatTime,
      getProgressColor,
      reviewAnswers,
      reviewWrong,
      goHome
    }
  }
}
</script>

<style scoped>
.exam-result-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.result-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  margin-bottom: 20px;
}

.result-title {
  padding: 20px;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.result-title h2 {
  margin: 10px 0;
  font-size: 28px;
}

.result-title p {
  margin: 0;
  opacity: 0.9;
}

.result-content {
  margin-top: 20px;
}

.score-card {
  text-align: center;
}

.score-display {
  padding: 30px;
}

.main-score {
  font-size: 48px;
  font-weight: bold;
}

.score-value {
  color: #409eff;
}

.score-total {
  color: #909399;
  font-size: 24px;
}

.score-percent {
  font-size: 18px;
  color: #606266;
  margin-top: 10px;
}

.stats-row {
  padding: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.subject-item {
  margin-bottom: 20px;
}

.subject-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-buttons .el-button {
  width: 100%;
  height: 50px;
}

.tips-content {
  font-size: 16px;
  line-height: 1.8;
}
</style>
