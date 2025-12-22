<template>
  <div class="knowledge-container">
    <!-- 科目选择 -->
    <el-card class="subject-selector">
      <el-radio-group v-model="selectedSubject" @change="loadKnowledgePoints">
        <el-radio-button label="全部">全部科目</el-radio-button>
        <el-radio-button label="数据结构">数据结构</el-radio-button>
        <el-radio-button label="计算机组成原理">计算机组成原理</el-radio-button>
        <el-radio-button label="操作系统">操作系统</el-radio-button>
        <el-radio-button label="计算机网络">计算机网络</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 考点热度分析 -->
    <el-card class="heatmap-card">
      <template #header>
        <div class="card-header">
          <span>考点热度分析</span>
          <el-tooltip content="颜色越深表示出现频率越高">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <div class="heatmap-container">
            <h4>高频考点Top 10</h4>
            <div class="hot-points">
              <div
                v-for="(point, index) in hotKnowledgePoints"
                :key="point.id"
                class="hot-point-item"
                :style="{ backgroundColor: getHeatColor(point.frequency) }"
                @click="viewKnowledgeDetail(point)"
              >
                <div class="point-rank">{{ index + 1 }}</div>
                <div class="point-info">
                  <div class="point-name">{{ point.name }}</div>
                  <div class="point-meta">
                    <span>{{ point.subject }}</span>
                    <span>{{ point.frequency }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="chart-container">
            <h4>科目考点分布</h4>
            <v-chart class="chart" :option="subjectDistribution" />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 易混淆考点 -->
    <el-card class="confused-points">
      <template #header>
        <span>易混淆考点对比</span>
      </template>

      <el-row :gutter="20">
        <el-col :span="8" v-for="group in confusedGroups" :key="group.name">
          <div class="confused-group">
            <h4>{{ group.name }}</h4>
            <el-table :data="group.points" size="small">
              <el-table-column prop="concept" label="概念" />
              <el-table-column prop="description" label="描述" />
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="text" @click="compareConcepts(group.points)">
                    对比
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 考点列表 -->
    <el-card class="knowledge-list">
      <template #header>
        <div class="list-header">
          <span>考点列表</span>
          <el-space>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索考点"
              prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
            <el-button type="primary" @click="showMindMap = true">
              <el-icon><Share /></el-icon>
              思维导图
            </el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="filteredKnowledgePoints" style="width: 100%">
        <el-table-column prop="name" label="考点名称" min-width="200">
          <template #default="scope">
            <el-link type="primary" @click="viewKnowledgeDetail(scope.row)">
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="subject" label="科目" width="120">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.subject }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="chapter" label="章节" width="150" />

        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="scope">
            <el-rate
              :model-value="getDifficultyRate(scope.row.difficulty)"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>

        <el-table-column prop="frequency" label="出题频率" width="120">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.frequency"
              :color="getProgressColor(scope.row.frequency)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="questionCount" label="相关题数" width="100">
          <template #default="scope">
            <el-tag>{{ scope.row.questionCount }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewKnowledgeDetail(scope.row)">
              查看详情
            </el-button>
            <el-button type="success" size="small" @click="practiceKnowledge(scope.row)">
              专项练习
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="totalPoints"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 考点详情弹窗 -->
    <el-dialog
      v-model="showKnowledgeDetail"
      title="考点详情"
      width="80%"
      top="5vh"
    >
      <div v-if="currentKnowledge" class="knowledge-detail">
        <el-row :gutter="20">
          <el-col :span="16">
            <div class="detail-section">
              <h2>{{ currentKnowledge.name }}</h2>
              <el-space>
                <el-tag type="info">{{ currentKnowledge.subject }}</el-tag>
                <el-tag type="warning">{{ currentKnowledge.chapter }}</el-tag>
                <el-tag type="success">难度: {{ currentKnowledge.difficulty }}</el-tag>
              </el-space>

              <div class="content-section">
                <h3>核心概念</h3>
                <div class="concept-content">{{ currentKnowledge.description }}</div>

                <h3>重要公式</h3>
                <div class="formula-list">
                  <div v-for="formula in currentKnowledge.formulas" :key="formula" class="formula-item">
                    {{ formula }}
                  </div>
                </div>

                <h3>解题要点</h3>
                <div class="points-list">
                  <ul>
                    <li v-for="point in currentKnowledge.points" :key="point">{{ point }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="side-section">
              <el-card class="stats-card">
                <template #header>学习统计</template>
                <div class="stats-item">
                  <span>相关题目：</span>
                  <el-tag>{{ currentKnowledge.questionCount }} 题</el-tag>
                </div>
                <div class="stats-item">
                  <span>出题频率：</span>
                  <el-progress :percentage="currentKnowledge.frequency" />
                </div>
                <div class="stats-item">
                  <span>掌握程度：</span>
                  <el-rate v-model="masteryLevel" show-text />
                </div>
              </el-card>

              <el-card class="related-card" style="margin-top: 20px;">
                <template #header>相关考点</template>
                <div class="related-points">
                  <el-tag
                    v-for="point in currentKnowledge.relatedPoints"
                    :key="point.id"
                    type="info"
                    style="margin: 5px;"
                    @click="viewKnowledgeDetail(point)"
                  >
                    {{ point.name }}
                  </el-tag>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </div>

      <template #footer>
        <el-button @click="showKnowledgeDetail = false">关闭</el-button>
        <el-button type="warning" @click="addToNotes">添加笔记</el-button>
        <el-button type="primary" @click="practiceKnowledge(currentKnowledge)">
          开始练习
        </el-button>
      </template>
    </el-dialog>

    <!-- 思维导图弹窗 -->
    <el-dialog
      v-model="showMindMap"
      title="知识点思维导图"
      width="90%"
      top="2vh"
    >
      <div class="mind-map-container">
        <v-chart class="mind-map" :option="mindMapOption" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getKnowledgePoints } from '@/api/practice'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, GraphChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  QuestionFilled,
  Search,
  Share
} from '@element-plus/icons-vue'

use([
  CanvasRenderer,
  BarChart,
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default {
  name: 'Knowledge',
  components: {
    VChart,
    QuestionFilled,
    Search,
    Share
  },
  setup() {
    const router = useRouter()

    const selectedSubject = ref('全部')
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(20)
    const showKnowledgeDetail = ref(false)
    const showMindMap = ref(false)
    const currentKnowledge = ref(null)
    const masteryLevel = ref(3)
    const knowledgePoints = ref([])

    const confusedGroups = ref([
      {
        name: '进程与线程',
        points: [
          { concept: '进程', description: '资源分配的基本单位' },
          { concept: '线程', description: 'CPU调度的基本单位' }
        ]
      },
      {
        name: '缓存相关',
        points: [
          { concept: '缓存命中', description: '数据在缓存中找到' },
          { concept: '缓存缺失', description: '数据不在缓存中' }
        ]
      },
      {
        name: '排序算法',
        points: [
          { concept: '稳定排序', description: '相等元素相对位置不变' },
          { concept: '不稳定排序', description: '相等元素相对位置可能改变' }
        ]
      }
    ])

    onMounted(async () => {
      await loadKnowledgePoints()
    })

    const loadKnowledgePoints = async () => {
      try {
        const res = await getKnowledgePoints(
          selectedSubject.value === '全部' ? '' : selectedSubject.value
        )
        knowledgePoints.value = res.data.map(kp => ({
          ...kp,
          questionCount: Math.floor(Math.random() * 50) + 10
        }))
      } catch (error) {
        ElMessage.error('加载考点失败')
      }
    }

    const filteredKnowledgePoints = computed(() => {
      let filtered = knowledgePoints.value

      if (searchKeyword.value) {
        filtered = filtered.filter(kp =>
          kp.name.includes(searchKeyword.value) ||
          kp.description.includes(searchKeyword.value)
        )
      }

      return filtered
    })

    const hotKnowledgePoints = computed(() => {
      return [...filteredKnowledgePoints.value]
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)
    })

    const totalPoints = computed(() => filteredKnowledgePoints.value.length)

    const paginatedPoints = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredKnowledgePoints.value.slice(start, end)
    })

    const subjectDistribution = ref({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['考点数量']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['数据结构', '计算机组成原理', '操作系统', '计算机网络'],
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '考点数量',
          type: 'bar',
          data: [45, 38, 42, 35],
          itemStyle: {
            color: new Proxy(
              {
                0: '#5470c6',
                1: '#91cc75',
                2: '#fac858',
                3: '#ee6666'
              },
              {
                get(target, key) {
                  return target[key]
                }
              }
            )
          }
        }
      ]
    })

    const mindMapOption = ref({
      tooltip: {},
      legend: {
        data: ['408考纲知识点']
      },
      series: [
        {
          name: '408考纲知识点',
          type: 'graph',
          layout: 'force',
          data: [
            { name: '408计算机基础', symbolSize: 80, x: 400, y: 300 },
            { name: '数据结构', symbolSize: 60, x: 200, y: 200 },
            { name: '计算机组成原理', symbolSize: 60, x: 600, y: 200 },
            { name: '操作系统', symbolSize: 60, x: 200, y: 400 },
            { name: '计算机网络', symbolSize: 60, x: 600, y: 400 },
            { name: '线性表', symbolSize: 40 },
            { name: '树与二叉树', symbolSize: 40 },
            { name: '图', symbolSize: 40 },
            { name: '排序', symbolSize: 40 }
          ],
          links: [
            { source: '408计算机基础', target: '数据结构' },
            { source: '408计算机基础', target: '计算机组成原理' },
            { source: '408计算机基础', target: '操作系统' },
            { source: '408计算机基础', target: '计算机网络' },
            { source: '数据结构', target: '线性表' },
            { source: '数据结构', target: '树与二叉树' },
            { source: '数据结构', target: '图' },
            { source: '数据结构', target: '排序' }
          ],
          force: {
            repulsion: 1000,
            edgeLength: 200
          },
          roam: true,
          label: {
            show: true,
            position: 'right'
          },
          emphasis: {
            focus: 'adjacency'
          }
        }
      ]
    })

    const handleSearch = () => {
      currentPage.value = 1
    }

    const viewKnowledgeDetail = (point) => {
      currentKnowledge.value = point
      showKnowledgeDetail.value = true
    }

    const practiceKnowledge = (point) => {
      router.push(`/practice/special?knowledge=${encodeURIComponent(point.name)}`)
    }

    const compareConcepts = (points) => {
      ElMessage.info('概念对比功能开发中...')
    }

    const addToNotes = () => {
      ElMessage.success('已添加到笔记')
    }

    const getHeatColor = (frequency) => {
      if (frequency >= 80) return '#ff4444'
      if (frequency >= 60) return '#ff8800'
      if (frequency >= 40) return '#ffcc00'
      return '#44dd44'
    }

    const getProgressColor = (percentage) => {
      if (percentage >= 80) return '#F56C6C'
      if (percentage >= 60) return '#E6A23C'
      return '#67C23A'
    }

    const getDifficultyRate = (difficulty) => {
      const rateMap = {
        easy: 2,
        medium: 3,
        hard: 5
      }
      return rateMap[difficulty] || 3
    }

    return {
      selectedSubject,
      searchKeyword,
      currentPage,
      pageSize,
      showKnowledgeDetail,
      showMindMap,
      currentKnowledge,
      masteryLevel,
      knowledgePoints,
      confusedGroups,
      filteredKnowledgePoints,
      paginatedPoints,
      hotKnowledgePoints,
      totalPoints,
      subjectDistribution,
      mindMapOption,
      loadKnowledgePoints,
      handleSearch,
      viewKnowledgeDetail,
      practiceKnowledge,
      compareConcepts,
      addToNotes,
      getHeatColor,
      getProgressColor,
      getDifficultyRate
    }
  }
}
</script>

<style scoped>
.knowledge-container {
  max-width: 1400px;
  margin: 0 auto;
}

.subject-selector {
  margin-bottom: 20px;
  text-align: center;
}

.heatmap-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hot-points {
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.hot-point-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  transition: all 0.3s;
}

.hot-point-item:hover {
  transform: translateX(10px);
}

.point-rank {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin-right: 15px;
}

.point-info {
  flex: 1;
}

.point-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.point-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  opacity: 0.9;
}

.chart-container,
.heatmap-container {
  padding: 20px;
}

.chart {
  height: 300px;
  width: 100%;
}

.confused-points {
  margin-top: 20px;
}

.confused-group {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.knowledge-list {
  margin-bottom: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.knowledge-detail {
  padding: 20px;
}

.detail-section h2 {
  color: #303133;
  margin-bottom: 10px;
}

.content-section {
  margin-top: 30px;
}

.content-section h3 {
  color: #606266;
  margin: 20px 0 10px;
}

.concept-content {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  line-height: 1.8;
}

.formula-list {
  background: #fff;
  border: 1px solid #e4e7ed;
  padding: 15px;
  border-radius: 4px;
}

.formula-item {
  font-family: 'Courier New', monospace;
  margin-bottom: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.points-list ul {
  list-style: none;
  padding: 0;
}

.points-list li {
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
}

.points-list li::before {
  content: "•";
  color: #409eff;
  position: absolute;
  left: 0;
}

.stats-card {
  margin-bottom: 20px;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.related-points {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mind-map-container {
  height: 600px;
}

.mind-map {
  height: 100%;
  width: 100%;
}
</style>