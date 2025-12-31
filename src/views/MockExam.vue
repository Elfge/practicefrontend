<template>
  <div class="mock-exam-container">
    <el-card class="page-header">
      <h2>模拟考试</h2>
      <p>历年真题模拟 · 自定义组卷 · 查看考试记录</p>
    </el-card>

    <el-tabs v-model="activeTab" class="exam-tabs">
      <!-- 历年真题 -->
      <el-tab-pane label="历年真题" name="papers">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>真题试卷</span>
              <el-select v-model="filterYear" placeholder="选择年份" clearable style="width: 120px;">
                <el-option label="2024" :value="2024" />
                <el-option label="2023" :value="2023" />
                <el-option label="2022" :value="2022" />
                <el-option label="2021" :value="2021" />
                <el-option label="2020" :value="2020" />
              </el-select>
            </div>
          </template>

          <el-table :data="filteredPapers" style="width: 100%" v-loading="loadingPapers">
            <el-table-column prop="title" label="试卷名称" />
            <el-table-column prop="year" label="年份" width="80" />
            <el-table-column prop="subject" label="科目" width="120" />
            <el-table-column prop="questionCount" label="题数" width="80" />
            <el-table-column prop="duration" label="时长" width="100">
              <template #default="scope">
                {{ scope.row.duration }}分钟
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button type="primary" size="small" @click="startExam(scope.row)">
                  开始考试
                </el-button>
                <el-button size="small" @click="downloadPaper(scope.row)">
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 自定义模拟 -->
      <el-tab-pane label="自定义模拟" name="custom">
        <el-card>
          <template #header>
            <span>自定义组卷设置</span>
          </template>

          <el-form :model="customSettings" label-width="120px" style="max-width: 600px; margin: 0 auto;">
            <el-form-item label="科目选择">
              <el-select v-model="customSettings.subject" placeholder="选择科目" clearable>
                <el-option label="全部科目" value="" />
                <el-option label="数据结构" value="数据结构" />
                <el-option label="计算机组成原理" value="计算机组成原理" />
                <el-option label="操作系统" value="操作系统" />
                <el-option label="计算机网络" value="计算机网络" />
              </el-select>
            </el-form-item>

            <el-form-item label="难度选择">
              <el-select v-model="customSettings.difficulty" placeholder="选择难度" clearable>
                <el-option label="全部难度" value="" />
                <el-option label="基础" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
              </el-select>
            </el-form-item>

            <el-form-item label="题目数量">
              <el-input-number v-model="customSettings.count" :min="10" :max="100" :step="5" />
            </el-form-item>

            <el-form-item label="考试时长">
              <el-input-number v-model="customSettings.duration" :min="30" :max="240" :step="15" />
              <span style="margin-left: 10px;">分钟</span>
            </el-form-item>

            <el-divider content-position="left">题型数量设置</el-divider>

            <el-form-item label="单选题数量">
              <el-input-number v-model="customSettings.typeCounts.SINGLE" :min="0" :max="100" />
              <span style="margin-left: 10px; color: #909399;">0表示不抽取</span>
            </el-form-item>

            <el-form-item label="多选题数量">
              <el-input-number v-model="customSettings.typeCounts.MULTIPLE" :min="0" :max="100" />
              <span style="margin-left: 10px; color: #909399;">0表示不抽取</span>
            </el-form-item>

            <el-form-item label="填空题数量">
              <el-input-number v-model="customSettings.typeCounts.BLANK" :min="0" :max="100" />
              <span style="margin-left: 10px; color: #909399;">0表示不抽取</span>
            </el-form-item>

            <el-form-item label="综合题数量">
              <el-input-number v-model="customSettings.typeCounts.COMPREHENSIVE" :min="0" :max="50" />
              <span style="margin-left: 10px; color: #909399;">0表示不抽取</span>
            </el-form-item>

            <el-form-item>
              <el-alert
                :title="`预计总题数：${totalCount} 题`"
                type="info"
                :closable="false"
                show-icon
                style="margin-top: 10px;"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" size="large" @click="startCustomExam" :loading="creatingExam">
                开始模拟考试
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 考试记录 -->
      <el-tab-pane label="最近记录" name="records">
        <el-card>
          <template #header>
            <span>考试记录</span>
          </template>

          <el-table :data="examRecords" style="width: 100%" v-loading="loadingRecords">
            <el-table-column prop="subject" label="科目" width="150" />
            <el-table-column prop="totalCount" label="题目数" width="80" />
            <el-table-column label="正确率" width="120">
              <template #default="scope">
                <el-progress
                  :percentage="scope.row.accuracy || 0"
                  :color="getAccuracyColor(scope.row.accuracy)"
                  :stroke-width="10"
                />
              </template>
            </el-table-column>
            <el-table-column label="进度" width="150">
              <template #default="scope">
                <el-progress
                  :percentage="scope.row.progress"
                  :color="getProgressColor(scope.row.progress)"
                />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.completed ? 'success' : 'warning'">
                  {{ scope.row.completed ? '已完成' : '进行中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="考试时间" width="180">
              <template #default="scope">
                {{ formatTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button
                  size="small"
                  :type="scope.row.completed ? 'info' : 'primary'"
                  @click="viewRecord(scope.row)"
                >
                  {{ scope.row.completed ? '查看详情' : '继续考试' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExamPapers, startExam as startExamApi, createCustomExam, getExamRecords } from '@/api/practice'

export default {
  name: 'MockExam',
  setup() {
    const router = useRouter()
    const activeTab = ref('papers')

    // 历年真题
    const examPapers = ref([])
    const loadingPapers = ref(false)
    const filterYear = ref(null)

    const filteredPapers = computed(() => {
      if (!filterYear.value) return examPapers.value
      return examPapers.value.filter(p => p.year === filterYear.value)
    })

    const loadPapers = async () => {
      loadingPapers.value = true
      try {
        const res = await getExamPapers()
        if (res.data) {
          examPapers.value = res.data
        }
      } catch (error) {
        ElMessage.error('加载试卷列表失败')
      } finally {
        loadingPapers.value = false
      }
    }

    const startExam = async (paper) => {
      try {
        const res = await startExamApi(paper.id)
        if (res.data && res.data.sessionId) {
          router.push(`/practice/batch?session=${res.data.sessionId}&paper=${paper.id}`)
        }
      } catch (error) {
        ElMessage.error('开始考试失败')
      }
    }

    const downloadPaper = (paper) => {
      window.open(`/api/exam/papers/${paper.id}/download`, '_blank')
    }

    // 自定义模拟
    const customSettings = ref({
      subject: '',
      difficulty: '',
      duration: 120,
      typeCounts: {
        SINGLE: 20,
        MULTIPLE: 15,
        BLANK: 0,
        COMPREHENSIVE: 0
      }
    })
    const creatingExam = ref(false)

    // 计算总题数
    const totalCount = computed(() => {
      const tc = customSettings.value.typeCounts
      return (tc.SINGLE || 0) + (tc.MULTIPLE || 0) + (tc.BLANK || 0) + (tc.COMPREHENSIVE || 0)
    })

    const startCustomExam = async () => {
      // 验证至少选择一种题型
      if (totalCount.value === 0) {
        ElMessage.warning('请至少选择一种题型')
        return
      }

      creatingExam.value = true
      try {
        // 构建请求数据，过滤掉空字符串
        const requestData = {
          duration: customSettings.value.duration,
          typeCounts: customSettings.value.typeCounts
        }

        // 只有非空时才添加科目和难度
        if (customSettings.value.subject) {
          requestData.subject = customSettings.value.subject
        }
        if (customSettings.value.difficulty) {
          requestData.difficulty = customSettings.value.difficulty
        }

        const res = await createCustomExam(requestData)
        if (res.data && res.data.sessionId) {
          router.push(`/practice/batch?session=${res.data.sessionId}`)
        }
      } catch (error) {
        console.error('创建模拟考试失败:', error)
        const errorMsg = error.response?.data?.message || error.message || '创建失败'

        // 使用 MessageBox 显示详细错误信息
        ElMessageBox.alert(
          errorMsg.replace(/\\n/g, '<br/>'),
          '创建模拟考试失败',
          {
            confirmButtonText: '我知道了',
            dangerouslyUseHTMLString: true,
            type: 'warning'
          }
        )
      } finally {
        creatingExam.value = false
      }
    }

    // 考试记录
    const examRecords = ref([])
    const loadingRecords = ref(false)

    const loadRecords = async () => {
      loadingRecords.value = true
      try {
        const res = await getExamRecords()
        if (res.data) {
          examRecords.value = res.data
        }
      } catch (error) {
        console.error('加载考试记录失败', error)
      } finally {
        loadingRecords.value = false
      }
    }

    const viewRecord = (record) => {
      if (record.completed) {
        router.push(`/exam/result/${record.id}`)
      } else {
        router.push(`/practice/batch?continue=${record.id}`)
      }
    }

    // 辅助函数
    const getAccuracyColor = (accuracy) => {
      if (accuracy < 60) return '#F56C6C'
      if (accuracy < 80) return '#E6A23C'
      return '#67C23A'
    }

    const getProgressColor = (percentage) => {
      if (percentage < 30) return '#F56C6C'
      if (percentage < 70) return '#E6A23C'
      return '#67C23A'
    }

    const formatTime = (time) => {
      if (!time) return '-'
      const date = new Date(time)
      return date.toLocaleString('zh-CN')
    }

    onMounted(() => {
      loadPapers()
      loadRecords()
    })

    return {
      activeTab,
      examPapers,
      loadingPapers,
      filterYear,
      filteredPapers,
      startExam,
      downloadPaper,
      customSettings,
      creatingExam,
      startCustomExam,
      totalCount,
      examRecords,
      loadingRecords,
      viewRecord,
      getAccuracyColor,
      getProgressColor,
      formatTime
    }
  }
}
</script>

<style scoped>
.mock-exam-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.page-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.page-header p {
  margin: 0;
  opacity: 0.9;
}

.exam-tabs {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-tabs__content) {
  padding: 0;
}

:deep(.el-card) {
  margin-bottom: 20px;
}
</style>
