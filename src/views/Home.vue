<template>
    <div class="home-container">
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">1,234</div>
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
                <div class="stats-number">856</div>
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
                <div class="stats-number">78%</div>
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
                <div class="stats-number">45</div>
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
              <el-button type="primary" icon="Document" @click="goToQuestionBank">
                开始刷题
              </el-button>
              <el-button type="success" icon="DataAnalysis" @click="startExam">
                模拟考试
              </el-button>
              <el-button type="warning" icon="Notebook" @click="viewMistakes">
                错题本
              </el-button>
              <el-button type="info" icon="Collection" @click="viewNotes">
                笔记收藏
              </el-button>
            </div>
          </el-card>

          <el-card class="todo-card" style="margin-top: 20px;">
            <template #header>
              <span>今日任务</span>
            </template>

            <div class="todo-list">
              <div class="todo-item" v-for="todo in todoList" :key="todo.id">
                <el-checkbox v-model="todo.completed">
                  <span :class="{ 'completed': todo.completed }">{{ todo.text }}</span>
                </el-checkbox>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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

    const subjects = ref([
      { name: '数据结构', completed: 120, total: 200, percentage: 60, color: '#409EFF' },
      { name: '计算机组成原理', completed: 150, total: 250, percentage: 60, color: '#67C23A' },
      { name: '操作系统', completed: 180, total: 300, percentage: 60, color: '#E6A23C' },
      { name: '计算机网络', completed: 100, total: 150, percentage: 67, color: '#F56C6C' }
    ])

    const todoList = ref([
      { id: 1, text: '完成数据结构章节练习', completed: false },
      { id: 2, text: '复习计算机网络知识点', completed: false },
      { id: 3, text: '做一套模拟试卷', completed: false },
      { id: 4, text: '整理错题本', completed: true }
    ])

    const chartOption = ref({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['数据结构', '计算机组成原理', '操作系统', '计算机网络']
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
        data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周']
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100
      },
      series: [
        {
          name: '数据结构',
          type: 'line',
          data: [65, 68, 70, 75, 78, 82]
        },
        {
          name: '计算机组成原理',
          type: 'line',
          data: [60, 62, 65, 70, 72, 75]
        },
        {
          name: '操作系统',
          type: 'line',
          data: [70, 72, 75, 78, 80, 83]
        },
        {
          name: '计算机网络',
          type: 'line',
          data: [75, 78, 80, 85, 88, 90]
        }
      ]
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

    return {
      subjects,
      todoList,
      chartOption,
      goToQuestionBank,
      startExam,
      viewMistakes,
      viewNotes
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
}

.todo-card {
  height: 250px;
}

.todo-list {
  height: 160px;
  overflow-y: auto;
}

.todo-item {
  margin-bottom: 15px;
}

.todo-item:last-child {
  margin-bottom: 0;
}

.completed {
  text-decoration: line-through;
  color: #c0c4cc;
}
</style>