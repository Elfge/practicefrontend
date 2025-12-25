<template>
    <div class="home-container" v-loading="loading">
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.totalQuestions }}</div>
                <div class="stats-label">总题数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon completed">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.completedQuestions }}</div>
                <div class="stats-label">已完成</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon correct">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.correctRate }}%</div>
                <div class="stats-label">正确率</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon days">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.studyDays }}</div>
                <div class="stats-label">备考天数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 学习进度和快速操作 -->
      <el-row :gutter="20" class="content-row">
        <el-col :span="16">
          <el-card class="progress-card">
            <template #header>
              <div class="card-header">
                <span>学习进度</span>
                <el-button type="primary" size="small">继续学习</el-button>
              </div>
            </template>

            <div class="subject-progress">
              <div class="progress-item" v-for="subject in subjects" :key="subject.name">
                <div class="progress-header">
                  <span class="subject-name">{{ subject.name }}</span>
                  <span class="progress-text">{{ subject.completed }}/{{ subject.total }}</span>
                </div>
                <el-progress
                  :percentage="subject.percentage"
                  :color="subject.color"
                />
              </div>
            </div>
          </el-card>

          <el-card class="chart-card" style="margin-top: 20px;">
            <template #header>
              <span>正确率趋势</span>
            </template>

            <div class="chart-container">
              <v-chart class="chart" :option="chartOption" />
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="quick-actions-card">
            <template #header>
              <span>快速操作</span>
            </template>

            <div class="quick-actions">
              <el-button type="primary" @click="goToQuestionBank">
                开始刷题
              </el-button>
              <el-button type="success" @click="startExam">
                模拟考试
              </el-button>
              <el-button type="warning" @click="viewMistakes">
                错题本
              </el-button>
              <el-button type="info" @click="viewNotes">
                笔记收藏
              </el-button>
            </div>
          </el-card>

          <el-card class="todo-card" style="margin-top: 20px;">
            <template #header>
              <div class="card-header-small">
                <span>今日任务</span>
                <el-link type="primary" @click="goToTasks">管理</el-link>
              </div>
            </template>

            <div class="todo-list-simple">
              <div class="todo-item-simple" v-for="todo in todoList.slice(0, 3)" :key="todo.id">
                <el-checkbox :model-value="todo.completed" @change="toggleTaskStatus(todo)" size="small">
                  <span class="todo-text" :class="{ 'completed': todo.completed }">{{ todo.title || todo.text }}</span>
                </el-checkbox>
              </div>
              <div v-if="todoList.length === 0" class="empty-todo">
                <el-empty description="暂无任务" :image-size="60" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { getUserStatistics, getSubjectStatistics, getCorrectRateTrend } from '@/api/statistics'
import { getTodayTasks, toggleTaskComplete } from '@/api/tasks'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default {
  name: 'Home',
  components: {
    VChart
  },
  setup() {
    const router = useRouter()

    // 统计数据
    const stats = ref({
      totalQuestions: 0,
      completedQuestions: 0,
      correctRate: 0,
      studyDays: 0
    })

    const subjects = ref([])
    const loading = ref(true)

    const todoList = ref([])

    // 从后端加载任务
    const loadTasks = async () => {
      try {
        const res = await getTodayTasks()
        if (res.data && res.data.length > 0) {
          todoList.value = res.data
        } else {
          // 如果没有任务，显示默认空状态
          todoList.value = []
        }
      } catch (error) {
        console.error('加载任务失败:', error)
        // 如果API调用失败，使用本地缓存作为后备
        const savedTasks = localStorage.getItem('todayTasks')
        if (savedTasks) {
          todoList.value = JSON.parse(savedTasks)
        } else {
          todoList.value = []
        }
      }
    }

    // 切换任务完成状态
    const toggleTaskStatus = async (task) => {
      try {
        await toggleTaskComplete(task.id, !task.completed)
        task.completed = !task.completed
        // 同步到本地存储作为备份
        localStorage.setItem('todayTasks', JSON.stringify(todoList.value))
      } catch (error) {
        ElMessage.error('更新任务状态失败')
      }
    }

    onMounted(() => {
      loadTasks()
    })

    const chartOption = ref({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: []
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: []
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100
      },
      series: []
    })

    // 加载统计数据
    const loadStatistics = async () => {
      try {
        loading.value = true

        // 获取用户基础统计
        const userStatsRes = await getUserStatistics()
        if (userStatsRes.data) {
          stats.value = {
            totalQuestions: userStatsRes.data.totalAnswered || 0,
            completedQuestions: userStatsRes.data.totalCorrect || 0,
            correctRate: userStatsRes.data.correctRate || 0,
            studyDays: 45 // 这个需要后端添加字段统计
          }
        }

        // 获取各科目统计
        const subjectStatsRes = await getSubjectStatistics()
        if (subjectStatsRes.data) {
          subjects.value = subjectStatsRes.data.map(item => ({
            name: item.subjectName,
            completed: item.correct || 0,
            total: item.total || 0,
            percentage: item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0,
            color: getSubjectColor(item.subject)
          }))
        }

        // 获取正确率趋势（近7天）
        const trendRes = await getCorrectRateTrend(7)
        if (trendRes.data && trendRes.data.length > 0) {
          chartOption.value.xAxis.data = trendRes.data.map(item => item.date)
          
          // 按科目组织数据（这里简化处理，实际需要后端返回按科目分组的趋势数据）
          chartOption.value.series = [{
            name: '整体正确率',
            type: 'line',
            data: trendRes.data.map(item => item.correctRate || 0)
          }]
          chartOption.value.legend.data = ['整体正确率']
        }

      } catch (error) {
        console.error('加载统计数据失败:', error)
        ElMessage.error('加载数据失败')
      } finally {
        loading.value = false
      }
    }

    // 获取科目对应的颜色
    const getSubjectColor = (subject) => {
      const colorMap = {
        'DS': '#409EFF',
        'CO': '#67C23A',
        'OS': '#E6A23C',
        'CN': '#F56C6C'
      }
      return colorMap[subject] || '#909399'
    }

    onMounted(() => {
      loadStatistics()
    })

    const goToQuestionBank = () => {
      router.push('/question-bank')
    }

    const startExam = () => {
      router.push('/exam')
    }

    const viewMistakes = () => {
      router.push('/mistakes')
    }

    const viewNotes = () => {
      router.push('/notes')
    }

    const goToTasks = () => {
      router.push('/profile')
    }

    return {
      stats,
      subjects,
      todoList,
      chartOption,
      loading,
      goToQuestionBank,
      startExam,
      viewMistakes,
      viewNotes,
      goToTasks,
      toggleTaskStatus
    }
  }
}
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: #fff;
}

.stats-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.completed {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.correct {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.days {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-info {
  flex: 1;
}

.stats-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stats-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-card {
  height: 300px;
}

.subject-progress {
  height: 200px;
}

.progress-item {
  margin-bottom: 25px;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.subject-name {
  font-weight: 500;
  color: #303133;
}

.progress-text {
  color: #909399;
  font-size: 14px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: 320px;
}

.chart {
  height: 100%;
  width: 100%;
}

.quick-actions-card {
  height: 280px;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.quick-actions .el-button {
  height: 50px;
  font-size: 14px;
  min-width: 0;
  flex: 1;
  width: 100%;
  text-align: center;
  justify-content: center;
}

.todo-card {
  height: 220px;
}

.card-header-small {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-list-simple {
  padding: 5px 0;
}

.todo-item-simple {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--bg-color-page, #fff);
  border-radius: 6px;
  transition: all 0.2s;
}

.todo-item-simple:hover {
  background: #f5f7fa;
}

.todo-text {
  font-size: 14px;
  color: var(--text-color-primary, #303133);
}

.todo-text.completed {
  text-decoration: line-through;
  color: var(--text-color-secondary, #909399);
}

.empty-todo {
  text-align: center;
  padding: 20px 0;
}

.completed {
  text-decoration: line-through;
  color: #c0c4cc;
}
</style>