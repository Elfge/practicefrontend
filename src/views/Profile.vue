<template>
    <div class="profile-container">
      <el-row :gutter="20">
        <!-- 左侧个人信息 -->
        <el-col :span="8">
          <el-card class="profile-card">
            <div class="profile-header">
              <el-avatar :size="80" src="https://via.placeholder.com/80" />
              <h3>{{ userInfo.username }}</h3>
              <p class="role-badge">{{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
            </div>

            <el-divider />

            <div class="profile-info">
              <div class="info-item">
                <span class="label">邮箱：</span>
                <span class="value">{{ userInfo.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">注册时间：</span>
                <span class="value">{{ userInfo.registerTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">考试日期：</span>
                <span class="value">{{ userInfo.examDate || '未设置' }}</span>
              </div>
            </div>

            <el-divider />

            <el-button type="primary" style="width: 100%" @click="editProfile">
              编辑资料
            </el-button>
          </el-card>

          <!-- 学习计划 -->
          <el-card class="plan-card" style="margin-top: 20px;">
            <template #header>
              <span>学习计划</span>
            </template>

            <div class="plan-info">
              <div class="plan-item">
                <span>每日刷题目标</span>
                <el-input-number v-model="plan.dailyQuestions" :min="1" :max="100" size="small" />
              </div>
              <div class="plan-item">
                <span>考试日期</span>
                <el-date-picker
                  v-model="plan.examDate"
                  type="date"
                  placeholder="选择日期"
                  size="small"
                  style="width: 150px"
                />
              </div>
            </div>

            <el-button type="success" style="width: 100%; margin-top: 15px;" @click="savePlan">
              保存计划
            </el-button>
          </el-card>
        </el-col>

        <!-- 右侧统计数据 -->
        <el-col :span="16">
          <!-- 学习统计 -->
          <el-card class="stats-card">
            <template #header>
              <span>学习统计</span>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <div class="stat-item">
                  <h4>总刷题量</h4>
                  <p class="stat-number">{{ stats.totalQuestions }}</p>
                  <p class="stat-desc">累计完成题目</p>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="stat-item">
                  <h4>平均正确率</h4>
                  <p class="stat-number">{{ stats.accuracy }}%</p>
                  <p class="stat-desc">所有题目平均正确率</p>
                </div>
              </el-col>
            </el-row>

            <el-divider />

            <div class="chart-container">
              <div v-if="progressChart.series[0].data.some(v => v > 0)" class="simple-chart">
                <div v-for="(subject, index) in ['数据结构', '计算机组成原理', '操作系统', '计算机网络']" :key="subject" class="chart-item">
                  <div class="chart-label">{{ subject }}</div>
                  <div class="chart-bar">
                    <div class="bar-completed" :style="{ width: (progressChart.series[0].data[index] / Math.max(progressChart.series[0].data[index] + progressChart.series[1].data[index], 1) * 100) + '%' }"></div>
                    <div class="bar-total" :style="{ width: (progressChart.series[1].data[index] / Math.max(progressChart.series[0].data[index] + progressChart.series[1].data[index], 1) * 100) + '%' }"></div>
                  </div>
                  <div class="chart-values">
                    <span class="completed">{{ progressChart.series[0].data[index] }}</span>
                    <span class="total">/{{ progressChart.series[0].data[index] + progressChart.series[1].data[index] }}</span>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无学习数据，开始练习吧！" />
            </div>
          </el-card>

          <!-- 薄弱环节 -->
          <el-card class="weakness-card" style="margin-top: 20px;">
            <template #header>
              <span>薄弱环节分析</span>
            </template>

            <el-table :data="weaknessData" style="width: 100%">
              <el-table-column prop="chapter" label="章节" width="180" />
              <el-table-column prop="subject" label="科目" width="120" />
              <el-table-column prop="errorRate" label="错误率">
                <template #default="scope">
                  <el-tag :type="scope.row.errorRate > 0.5 ? 'danger' : scope.row.errorRate > 0.3 ? 'warning' : 'success'">
                    {{ (scope.row.errorRate * 100).toFixed(1) }}%
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="questionCount" label="题目数" />
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="practiceWeakness(scope.row)">
                    针对练习
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- 学习时长统计 -->
          <el-card class="time-card" style="margin-top: 20px;">
            <template #header>
              <span>学习时长统计</span>
            </template>

            <el-row :gutter="20">
              <el-col :span="8">
                <div class="time-stat">
                  <el-icon><Clock /></el-icon>
                  <div class="time-info">
                    <p class="time-number">{{ stats.todayTime }}h</p>
                    <p class="time-label">今日学习</p>
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="time-stat">
                  <el-icon><Calendar /></el-icon>
                  <div class="time-info">
                    <p class="time-number">{{ stats.weekTime }}h</p>
                    <p class="time-label">本周学习</p>
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="time-stat">
                  <el-icon><TrendCharts /></el-icon>
                  <div class="time-info">
                    <p class="time-number">{{ stats.totalTime }}h</p>
                    <p class="time-label">累计学习</p>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserStatistics, getSubjectStatistics, getWeakChapters } from '@/api/statistics'

export default {
  name: 'Profile',
  setup() {
    const store = useStore()
    const router = useRouter()

    const userInfo = computed(() => store.state.user || {
      username: '测试用户',
      email: 'test@example.com',
      role: 'user',
      registerTime: '2024-01-01',
      examDate: ''
    })

    const plan = ref({
      dailyQuestions: 20,
      examDate: ''
    })

    const stats = ref({
      totalQuestions: 0,
      accuracy: 0,
      todayTime: 0,
      weekTime: 0,
      totalTime: 0
    })

    const weaknessData = ref([])

    const progressChart = ref({
      title: {
        text: '各科目学习进度',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['已完成', '未完成'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 80,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['数据结构', '计算机组成原理', '操作系统', '计算机网络']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '已完成',
          type: 'bar',
          data: [0, 0, 0, 0],
          itemStyle: {
            color: '#67C23A'
          }
        },
        {
          name: '未完成',
          type: 'bar',
          data: [0, 0, 0, 0],
          itemStyle: {
            color: '#E6A23C'
          }
        }
      ]
    })

    const loadStatistics = async () => {
      try {
        const { data } = await getUserStatistics()
        if (data) {
          stats.value.totalQuestions = data.totalQuestions || 0
          stats.value.accuracy = Math.round(data.accuracy * 100) || 0
          stats.value.todayTime = data.todayTime || 0
          stats.value.weekTime = data.weekTime || 0
          stats.value.totalTime = data.totalTime || 0
        }
      } catch (error) {
        console.error('加载统计数据失败', error)
      }
    }

    const loadWeakChapters = async () => {
      try {
        const { data } = await getWeakChapters()
        if (data && Array.isArray(data)) {
          weaknessData.value = data.map(item => ({
            chapter: item.chapter || '未知章节',
            subject: item.subject || '未知科目',
            errorRate: item.errorRate || 0,
            questionCount: item.questionCount || 0
          }))
        }
      } catch (error) {
        console.error('加载薄弱章节失败', error)
      }
    }

    const loadSubjectStatistics = async () => {
      try {
        const { data } = await getSubjectStatistics()
        if (data && Array.isArray(data)) {
          const completed = [0, 0, 0, 0]
          const total = [0, 0, 0, 0]

          data.forEach(item => {
            const index = ['DS', 'CO', 'OS', 'CN'].indexOf(item.subject)
            if (index !== -1) {
              completed[index] = item.completed || 0
              total[index] = item.total || 0
            }
          })

          progressChart.value.series[0].data = completed
          progressChart.value.series[1].data = total.map((t, i) => t - completed[i])
        }
      } catch (error) {
        console.error('加载科目统计失败', error)
      }
    }

    onMounted(() => {
      loadStatistics()
      loadWeakChapters()
      loadSubjectStatistics()
    })

    const editProfile = () => {
      ElMessage.info('编辑功能开发中...')
    }

    const savePlan = () => {
      ElMessage.success('学习计划已保存')
    }

    const practiceWeakness = (chapter) => {
      router.push(`/practice?mode=special&subject=${chapter.subject}&chapter=${chapter.chapter}`)
    }

    return {
      userInfo,
      plan,
      stats,
      weaknessData,
      progressChart,
      editProfile,
      savePlan,
      practiceWeakness
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-card {
  text-align: center;
}

.profile-header {
  padding: 20px 0;
}

.profile-header h3 {
  margin: 15px 0 5px;
  color: #303133;
}

.role-badge {
  display: inline-block;
  padding: 2px 10px;
  background-color: #E6A23C;
  color: #fff;
  border-radius: 10px;
  font-size: 12px;
}

.profile-info {
  text-align: left;
  padding: 0 20px;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
}

.label {
  color: #909399;
}

.value {
  color: #303133;
}

.plan-card .plan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stats-card .stat-item {
  text-align: center;
  padding: 20px 0;
}

.stat-item h4 {
  color: #606266;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
  margin: 10px 0;
}

.stat-desc {
  color: #909399;
  font-size: 14px;
}

.chart-container {
  height: 300px;
  margin-top: 20px;
}

.simple-chart {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.chart-label {
  width: 100px;
  font-size: 14px;
  color: #606266;
  text-align: right;
}

.chart-bar {
  flex: 1;
  height: 24px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}

.bar-completed {
  height: 100%;
  background: #67C23A;
  min-width: 2px;
}

.bar-total {
  height: 100%;
  background: #E6A23C;
  min-width: 2px;
}

.chart-values {
  width: 80px;
  text-align: left;
  font-size: 14px;
}

.chart-values .completed {
  color: #67C23A;
  font-weight: bold;
}

.chart-values .total {
  color: #909399;
}

.time-card .time-stat {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.time-stat .el-icon {
  font-size: 40px;
  color: #409EFF;
  margin-right: 15px;
}

.time-info {
  text-align: left;
}

.time-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.time-label {
  color: #909399;
  margin: 5px 0 0;
}
</style>