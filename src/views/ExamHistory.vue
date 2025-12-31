<template>
  <div class="exam-history-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
            <h2>考试历史</h2>
          </div>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="考试类型">
            <el-select v-model="filterForm.type" placeholder="全部类型" clearable @change="handleFilterChange">
              <el-option label="真题" value="past" />
              <el-option label="模拟" value="custom" />
            </el-select>
          </el-form-item>

          <el-form-item label="科目">
            <el-select v-model="filterForm.subject" placeholder="全部科目" clearable @change="handleFilterChange">
              <el-option label="数据结构" value="数据结构" />
              <el-option label="计算机组成原理" value="计算机组成原理" />
              <el-option label="操作系统" value="操作系统" />
              <el-option label="计算机网络" value="计算机网络" />
              <el-option label="408综合" value="408综合" />
            </el-select>
          </el-form-item>

          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="handleFilterChange"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="loadExamHistory">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 考试记录列表 -->
      <el-table
        :data="filteredHistory"
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无考试记录"
      >
        <el-table-column prop="type" label="考试类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'past' ? 'primary' : 'success'">
              {{ scope.row.type === 'past' ? '真题' : '模拟' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="试卷名称" min-width="200" show-overflow-tooltip />

        <el-table-column prop="subject" label="科目" width="120" />

        <el-table-column prop="date" label="考试日期" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.date) }}
          </template>
        </el-table-column>

        <el-table-column prop="score" label="得分" width="100">
          <template #default="scope">
            <span :style="{ color: getScoreColor(scope.row.score, scope.row.totalScore) }" class="score-text">
              {{ scope.row.score }}/{{ scope.row.totalScore }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="accuracy" label="正确率" width="120">
          <template #default="scope">
            <div class="accuracy-wrapper">
              <el-progress
                type="circle"
                :percentage="scope.row.accuracy"
                :width="50"
                :color="getAccuracyColor(scope.row.accuracy)"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="time" label="用时" width="100">
          <template #default="scope">
            {{ formatTime(scope.row.usedTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="rank" label="排名" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.rank && scope.row.rank !== '-'" type="info">
              第{{ scope.row.rank }}名
            </el-tag>
            <span v-else class="text-placeholder">-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewReport(scope.row)">
              查看报告
            </el-button>
            <el-button type="warning" size="small" @click="reviewMistakes(scope.row)">
              复习错题
            </el-button>
            <el-button type="danger" size="small" @click="deleteRecord(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'
import { getExamRecords, deleteSession } from '@/api/practice'

export default {
  name: 'ExamHistory',
  components: {
    ArrowLeft,
    // eslint-disable-next-line vue/no-unused-components
    Refresh
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const historyList = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)

    const filterForm = reactive({
      type: '',
      subject: '',
      dateRange: null
    })

    // 筛选后的数据（不含分页）
    const filteredData = computed(() => {
      let result = [...historyList.value]

      if (filterForm.type) {
        result = result.filter(item => item.type === filterForm.type)
      }

      if (filterForm.subject) {
        result = result.filter(item => {
          if (filterForm.subject === '408综合') {
            return !item.subject || item.subject === '408综合'
          }
          return item.subject === filterForm.subject
        })
      }

      if (filterForm.dateRange && filterForm.dateRange.length === 2) {
        const [start, end] = filterForm.dateRange
        result = result.filter(item => {
          const itemDate = item.date ? new Date(item.date).toISOString().split('T')[0] : ''
          return itemDate >= start && itemDate <= end
        })
      }

      // 排序：最新的在前
      return result.sort((a, b) => new Date(b.date) - new Date(a.date))
    })

    // 计算总数
    watch(filteredData, (newData) => {
      total.value = newData.length
    }, { immediate: true })

    // 筛选后的数据（含分页）
    const filteredHistory = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredData.value.slice(start, end)
    })

    // 加载考试历史
    const loadExamHistory = async () => {
      loading.value = true
      try {
        const res = await getExamRecords(1000)
        if (res.data && Array.isArray(res.data)) {
          historyList.value = res.data
            .filter(session => session.completed) // 只显示已完成的
            .map(session => ({
              id: session.id,
              type: session.type || 'custom',
              name: session.paperName || `模拟考试 - ${session.subject || '408综合'}`,
              subject: session.subject || '408综合',
              date: session.createTime,
              score: session.totalCount
                ? Math.round((session.correctCount / session.totalCount) * 150)
                : 0,
              totalScore: 150,
              accuracy: Math.round(session.accuracy || 0),
              usedTime: session.studyTime ? session.studyTime * 60 : 0,
              rank: session.rank || '-'
            }))
        } else {
          historyList.value = []
        }
      } catch (error) {
        console.error('加载考试历史失败', error)
        ElMessage.error('加载考试历史失败')
      } finally {
        loading.value = false
      }
    }

    // 筛选变化
    const handleFilterChange = () => {
      currentPage.value = 1
    }

    // 分页变化
    const handlePageChange = (page) => {
      currentPage.value = page
    }

    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
    }

    // 查看报告
    const viewReport = (exam) => {
      router.push(`/exam/result/${exam.id}`)
    }

    // 复习错题
    const reviewMistakes = (exam) => {
      router.push(`/mistakes?exam=${exam.id}`)
    }

    // 删除记录
    const deleteRecord = async (exam) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除这条考试记录吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await deleteSession(exam.id)
        ElMessage.success('删除成功')
        loadExamHistory()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败', error)
          ElMessage.error('删除失败')
        }
      }
    }

    // 返回
    const goBack = () => {
      router.push('/exam')
    }

    // 辅助函数
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

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }

    const formatTime = (seconds) => {
      if (!seconds) return '-'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      if (hours > 0) {
        return `${hours}h${minutes}m`
      }
      return `${minutes}m`
    }

    onMounted(() => {
      loadExamHistory()
    })

    return {
      loading,
      filteredHistory,
      filterForm,
      currentPage,
      pageSize,
      total,
      loadExamHistory,
      handleFilterChange,
      handlePageChange,
      handleSizeChange,
      viewReport,
      reviewMistakes,
      deleteRecord,
      goBack,
      getScoreColor,
      getAccuracyColor,
      formatDateTime,
      formatTime
    }
  }
}
</script>

<style scoped>
.exam-history-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-icon {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.back-icon:hover {
  color: #409eff;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.filter-form {
  margin: 0;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.score-text {
  font-weight: bold;
}

.accuracy-wrapper {
  display: flex;
  justify-content: center;
}

.text-placeholder {
  color: #c0c4cc;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
