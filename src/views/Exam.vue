<template>
  <div class="exam-container">
    <!-- 考试模式选择 -->
    <el-card class="mode-selector">
      <template #header>
        <h2>模拟考试</h2>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="mode-card" shadow="hover" @click="enterPastExam">
            <div class="mode-content">
              <div class="mode-icon past">
                <el-icon><Clock /></el-icon>
              </div>
              <h3>历年真题</h3>
              <p>完整还原历年408真题试卷</p>
              <ul class="mode-features">
                <li>涵盖1998-2025年真题</li>
                <li>标准考试时长180分钟</li>
                <li>自动判分生成答题报告</li>
                <li>对比全国平均分水平</li>
              </ul>
              <el-button type="primary">选择真题</el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="mode-card" shadow="hover" @click="enterCustomExam">
            <div class="mode-content">
              <div class="mode-icon custom">
                <el-icon><Setting /></el-icon>
              </div>
              <h3>自定义模拟</h3>
              <p>灵活组卷，适配不同复习阶段</p>
              <ul class="mode-features">
                <li>自由选择科目组合</li>
                <li>设置题目难度分布</li>
                <li>指定题型比例</li>
                <li>自定义考试时长</li>
              </ul>
              <el-button type="success">创建模拟卷</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 最近考试记录 -->
    <el-card class="recent-exams">
      <template #header>
        <div class="card-header">
          <span>最近考试记录</span>
          <el-link type="primary" @click="viewAllHistory">查看全部</el-link>
        </div>
      </template>

      <el-table :data="recentExams" style="width: 100%">
        <el-table-column prop="type" label="考试类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'past' ? 'primary' : 'success'">
              {{ scope.row.type === 'past' ? '真题' : '模拟' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="试卷名称" min-width="200" />

        <el-table-column prop="date" label="考试日期" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>

        <el-table-column prop="score" label="得分" width="100">
          <template #default="scope">
            <span :style="{ color: getScoreColor(scope.row.score, scope.row.totalScore) }">
              {{ scope.row.score }}/{{ scope.row.totalScore }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="accuracy" label="正确率" width="100">
          <template #default="scope">
            <el-progress
              type="circle"
              :percentage="scope.row.accuracy"
              :width="50"
              :color="getAccuracyColor(scope.row.accuracy)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="time" label="用时" width="100">
          <template #default="scope">
            {{ formatTime(scope.row.usedTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="rank" label="排名" width="100">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.rank }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewReport(scope.row)">
              查看报告
            </el-button>
            <el-button type="warning" size="small" @click="reviewMistakes(scope.row)">
              复习错题
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 真题选择弹窗 -->
    <el-dialog
      v-model="showPastExamSelector"
      title="选择历年真题"
      width="800px"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="按年份选择" name="year">
          <el-row :gutter="20">
            <el-col :span="8" v-for="exam in pastExamsByYear" :key="exam.id">
              <el-card
                class="exam-card"
                shadow="hover"
                @click="selectPastExam(exam)"
              >
                <div class="exam-card-content">
                  <h4>{{ exam.year }}年真题</h4>
                  <p>{{ exam.totalQuestions }}题 | {{ exam.totalScore }}分</p>
                  <div class="exam-stats">
                    <span>平均分: {{ exam.averageScore }}</span>
                    <span>难度: {{ exam.difficulty }}</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <el-tab-pane label="按科目选择" name="subject">
          <el-radio-group v-model="selectedSubject">
            <el-radio-button label="all">全部科目</el-radio-button>
            <el-radio-button label="ds">数据结构</el-radio-button>
            <el-radio-button label="cs">计算机组成原理</el-radio-button>
            <el-radio-button label="os">操作系统</el-radio-button>
            <el-radio-button label="cn">计算机网络</el-radio-button>
          </el-radio-group>

          <div class="subject-exams" style="margin-top: 20px;">
            <el-table :data="filteredPastExams" style="width: 100%">
              <el-table-column prop="year" label="年份" width="100" />
              <el-table-column prop="subject" label="科目" width="150" />
              <el-table-column prop="questionCount" label="题数" width="100" />
              <el-table-column prop="score" label="分值" width="100" />
              <el-table-column prop="difficulty" label="难度" width="100">
                <template #default="scope">
                  <el-rate
                    :model-value="getDifficultyRate(scope.row.difficulty)"
                    disabled
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="primary" @click="selectPastExam(scope.row)">
                    选择
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="showPastExamSelector = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- 自定义模拟卷弹窗 -->
    <el-dialog
      v-model="showCustomExamForm"
      title="创建模拟卷"
      width="600px"
    >
      <el-form :model="customExamForm" label-width="120px">
        <el-form-item label="试卷名称">
          <el-input v-model="customExamForm.name" placeholder="请输入试卷名称" />
        </el-form-item>

        <el-form-item label="考试时长">
          <el-input-number
            v-model="customExamForm.duration"
            :min="30"
            :max="300"
            :step="30"
          />
          <span style="margin-left: 10px;">分钟</span>
        </el-form-item>

        <el-form-item label="科目选择">
          <el-checkbox-group v-model="customExamForm.subjects">
            <el-checkbox value="ds">数据结构</el-checkbox>
            <el-checkbox value="cs">计算机组成原理</el-checkbox>
            <el-checkbox value="os">操作系统</el-checkbox>
            <el-checkbox value="cn">计算机网络</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="题目数量">
          <el-input-number
            v-model="customExamForm.questionCount"
            :min="10"
            :max="100"
          />
          <span style="margin-left: 10px;">题</span>
        </el-form-item>

        <el-form-item label="难度分布">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-input-number
                v-model="customExamForm.difficulty.easy"
                :min="0"
                :max="100"
                placeholder="基础"
              />
              <div class="difficulty-label">基础题</div>
            </el-col>
            <el-col :span="8">
              <el-input-number
                v-model="customExamForm.difficulty.medium"
                :min="0"
                :max="100"
                placeholder="中等"
              />
              <div class="difficulty-label">中等题</div>
            </el-col>
            <el-col :span="8">
              <el-input-number
                v-model="customExamForm.difficulty.hard"
                :min="0"
                :max="100"
                placeholder="困难"
              />
              <div class="difficulty-label">困难题</div>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="题型比例">
          <el-row :gutter="10">
            <el-col :span="6">
              <el-input-number
                v-model="customExamForm.questionTypes.single"
                :min="0"
                :max="100"
              />
              <div class="type-label">单选题</div>
            </el-col>
            <el-col :span="6">
              <el-input-number
                v-model="customExamForm.questionTypes.multiple"
                :min="0"
                :max="100"
              />
              <div class="type-label">多选题</div>
            </el-col>
            <el-col :span="6">
              <el-input-number
                v-model="customExamForm.questionTypes.fill"
                :min="0"
                :max="100"
              />
              <div class="type-label">填空题</div>
            </el-col>
            <el-col :span="6">
              <el-input-number
                v-model="customExamForm.questionTypes.comprehensive"
                :min="0"
                :max="100"
              />
              <div class="type-label">综合题</div>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCustomExamForm = false">取消</el-button>
        <el-button type="primary" @click="createCustomExam">创建试卷</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { startExam, createCustomExam as createCustomExamApi, getExamRecords } from '@/api/practice'
import {
  Clock,
  Setting
} from '@element-plus/icons-vue'

export default {
  name: 'Exam',
  components: {
    Clock,
    Setting
  },
  setup() {
    const router = useRouter()

    const showPastExamSelector = ref(false)
    const showCustomExamForm = ref(false)
    const activeTab = ref('year')
    const selectedSubject = ref('all')

    const customExamForm = reactive({
      name: '',
      duration: 180,
      subjects: ['ds', 'cs', 'os', 'cn'],
      questionCount: 40,
      difficulty: {
        easy: 30,
        medium: 50,
        hard: 20
      },
      questionTypes: {
        single: 40,
        multiple: 20,
        fill: 20,
        comprehensive: 20
      }
    })

    const recentExams = ref([])

    const pastExamsByYear = ref([
      {
        id: 1,
        year: 2024,
        totalQuestions: 40,
        totalScore: 150,
        averageScore: 98.5,
        difficulty: '中等'
      },
      {
        id: 2,
        year: 2023,
        totalQuestions: 40,
        totalScore: 150,
        averageScore: 95.2,
        difficulty: '中等'
      },
      {
        id: 3,
        year: 2022,
        totalQuestions: 40,
        totalScore: 150,
        averageScore: 92.8,
        difficulty: '中等偏难'
      },
      {
        id: 4,
        year: 2021,
        totalQuestions: 40,
        totalScore: 150,
        averageScore: 96.5,
        difficulty: '中等'
      },
      {
        id: 5,
        year: 2020,
        totalQuestions: 40,
        totalScore: 150,
        averageScore: 94.3,
        difficulty: '中等'
      },
      {
        id: 6,
        year: 2019,
        totalQuestions: 40,
        totalScore: 150,
        averageScore: 91.7,
        difficulty: '中等偏难'
      }
    ])

    const pastExamsBySubject = ref([
      {
        id: 1,
        year: 2024,
        subject: '数据结构',
        questionCount: 11,
        score: 45,
        difficulty: 3
      },
      {
        id: 2,
        year: 2024,
        subject: '计算机组成原理',
        questionCount: 11,
        score: 45,
        difficulty: 3
      },
      {
        id: 3,
        year: 2024,
        subject: '操作系统',
        questionCount: 8,
        score: 35,
        difficulty: 3
      },
      {
        id: 4,
        year: 2024,
        subject: '计算机网络',
        questionCount: 10,
        score: 25,
        difficulty: 2
      }
    ])

    const filteredPastExams = computed(() => {
      if (selectedSubject.value === 'all') {
        return pastExamsBySubject.value
      }
      const subjectMap = {
        ds: '数据结构',
        cs: '计算机组成原理',
        os: '操作系统',
        cn: '计算机网络'
      }
      return pastExamsBySubject.value.filter(
        exam => exam.subject === subjectMap[selectedSubject.value]
      )
    })

    const enterPastExam = () => {
      showPastExamSelector.value = true
    }

    const enterCustomExam = () => {
      showCustomExamForm.value = true
    }

    const selectPastExam = async (exam) => {
      try {
        const res = await startExam(exam.id)
        if (res.data && res.data.sessionId) {
          showPastExamSelector.value = false
          router.push(`/exam/past/${exam.id}?session=${res.data.sessionId}`)
        } else {
          ElMessage.error('创建考试会话失败')
        }
      } catch (error) {
        console.error('开始考试失败', error)
        ElMessage.error('开始考试失败')
      }
    }

    const createCustomExam = async () => {
      // 验证表单
      if (!customExamForm.name) {
        ElMessage.warning('请输入试卷名称')
        return
      }
      if (customExamForm.subjects.length === 0) {
        ElMessage.warning('请至少选择一个科目')
        return
      }

      // 映射科目代码
      const subjectMap = {
        ds: 'DS',
        cs: 'CO',
        os: 'OS',
        cn: 'CN'
      }
      const subjects = customExamForm.subjects.map(s => subjectMap[s] || s)

      try {
        const res = await createCustomExamApi({
          subject: subjects.join(','),
          difficulty: Object.keys(customExamForm.difficulty).find(k => customExamForm.difficulty[k] > 50) || 'MEDIUM',
          count: customExamForm.questionCount,
          duration: customExamForm.duration,
          types: Object.keys(customExamForm.questionTypes).filter(k => customExamForm.questionTypes[k] > 0).join(',')
        })

        if (res.data && res.data.sessionId) {
          ElMessage.success('模拟卷创建成功')
          showCustomExamForm.value = false
          router.push(`/exam/custom/new?session=${res.data.sessionId}`)
        } else {
          ElMessage.error('创建模拟卷失败')
        }
      } catch (error) {
        console.error('创建模拟卷失败', error)
        ElMessage.error('创建模拟卷失败')
      }
    }

    const viewReport = (exam) => {
      router.push(`/exam/result/${exam.id}`)
    }

    const reviewMistakes = (exam) => {
      router.push(`/mistakes?exam=${exam.id}`)
    }

    const viewAllHistory = () => {
      router.push('/exam/history')
    }

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString()
    }

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h${minutes}m`
    }

    const getScoreColor = (score, total) => {
      const percentage = (score / total) * 100
      if (percentage >= 80) return '#67C23A'
      if (percentage >= 60) return '#E6A23C'
      return '#F56C6C'
    }

    const getAccuracyColor = (accuracy) => {
      if (accuracy >= 80) return '#67C23A'
      if (accuracy >= 60) return '#E6A23C'
      return '#F56C6C'
    }

    const getDifficultyRate = (difficulty) => {
      return difficulty
    }

    const loadRecentExams = async () => {
      try {
        const res = await getExamRecords(5)
        if (res.data && Array.isArray(res.data)) {
          recentExams.value = res.data
            .filter(session => session.completed) // 只显示已完成的
            .map(session => ({
              id: session.id,
              type: 'custom',
              name: `模拟考试 - ${session.subject || '408综合'}`,
              date: session.createTime,
              score: Math.round((session.correctCount / session.totalCount) * 150),
              totalScore: 150,
              accuracy: Math.round(session.accuracy || 0),
              usedTime: session.studyTime ? session.studyTime * 60 : 0,
              rank: '-'
            }))
        }
      } catch (error) {
        console.error('加载考试记录失败', error)
      }
    }

    onMounted(() => {
      loadRecentExams()
    })

    return {
      showPastExamSelector,
      showCustomExamForm,
      activeTab,
      selectedSubject,
      customExamForm,
      recentExams,
      pastExamsByYear,
      pastExamsBySubject,
      filteredPastExams,
      enterPastExam,
      enterCustomExam,
      selectPastExam,
      createCustomExam,
      viewReport,
      reviewMistakes,
      viewAllHistory,
      formatDate,
      formatTime,
      getScoreColor,
      getAccuracyColor,
      getDifficultyRate
    }
  }
}
</script>

<style scoped>
.exam-container {
  max-width: 1200px;
  margin: 0 auto;
}

.mode-selector {
  margin-bottom: 20px;
}

.mode-selector h2 {
  text-align: center;
  color: #303133;
}

.mode-card {
  height: 400px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.mode-card:hover {
  transform: translateY(-5px);
}

.mode-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mode-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 36px;
  color: #fff;
}

.mode-icon.past {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.mode-icon.custom {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.mode-content h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #303133;
}

.mode-content p {
  color: #606266;
  margin-bottom: 20px;
}

.mode-features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  text-align: left;
}

.mode-features li {
  padding: 5px 0;
  color: #909399;
  font-size: 14px;
}

.mode-features li::before {
  content: "✓";
  color: #67C23A;
  margin-right: 8px;
}

.recent-exams {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exam-card {
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.exam-card:hover {
  transform: translateY(-3px);
}

.exam-card-content h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.exam-card-content p {
  margin: 0 0 10px 0;
  color: #606266;
}

.exam-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.difficulty-label,
.type-label {
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>