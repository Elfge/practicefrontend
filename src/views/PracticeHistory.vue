<template>
  <div class="practice-history-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
            <h2>练习历史</h2>
          </div>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="练习模式">
            <el-select v-model="filterForm.mode" placeholder="全部模式" clearable @change="handleFilterChange">
              <el-option label="单题模式" value="single" />
              <el-option label="套题模式" value="batch" />
              <el-option label="专项模式" value="special" />
            </el-select>
          </el-form-item>

          <el-form-item label="科目">
            <el-select v-model="filterForm.subject" placeholder="全部科目" clearable @change="handleFilterChange">
              <el-option label="数据结构" value="数据结构" />
              <el-option label="计算机组成原理" value="计算机组成原理" />
              <el-option label="操作系统" value="操作系统" />
              <el-option label="计算机网络" value="计算机网络" />
            </el-select>
          </el-form-item>

          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable @change="handleFilterChange">
              <el-option label="进行中" value="in_progress" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="loadPracticeHistory" :icon="Refresh">刷新</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 练习记录列表 -->
      <el-table
        :data="filteredHistory"
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无练习记录"
      >
        <el-table-column prop="mode" label="练习模式" width="120">
          <template #default="scope">
            <el-tag :type="getModeTagType(scope.row.mode)">
              {{ getModeText(scope.row.mode) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="subject" label="科目" width="150" />

        <el-table-column prop="chapter" label="章节" width="180" show-overflow-tooltip />

        <el-table-column label="进度" width="200">
          <template #default="scope">
            <div class="progress-wrapper">
              <el-progress
                :percentage="scope.row.progress"
                :color="getProgressColor(scope.row.progress)"
              />
              <span class="progress-text">{{ scope.row.currentIndex || 0 }}/{{ scope.row.totalCount || 0 }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="accuracy" label="正确率" width="120">
          <template #default="scope">
            <span v-if="scope.row.accuracy !== undefined" :style="{ color: getAccuracyColor(scope.row.accuracy) }">
              {{ scope.row.accuracy }}%
            </span>
            <span v-else class="text-placeholder">-</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.completed ? 'success' : 'warning'">
              {{ scope.row.completed ? '已完成' : '进行中' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="练习时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="studyTime" label="用时" width="100">
          <template #default="scope">
            {{ formatStudyTime(scope.row.studyTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-if="!scope.row.completed"
              type="primary"
              size="small"
              @click="continuePractice(scope.row)"
            >
              继续练习
            </el-button>
            <el-button
              v-if="scope.row.completed"
              type="success"
              size="small"
              @click="reviewPractice(scope.row)"
            >
              查看详情
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteRecord(scope.row)"
            >
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
import { getRecentSessions, deleteSession } from '@/api/practice'

export default {
  name: 'PracticeHistory',
  components: {
    ArrowLeft
    // eslint-disable-next-line vue/no-unused-components
    , Refresh
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const historyList = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)

    const filterForm = reactive({
      mode: '',
      subject: '',
      status: ''
    })

    // 筛选后的数据（不含分页）
    const filteredData = computed(() => {
      let result = [...historyList.value]

      if (filterForm.mode) {
        result = result.filter(item => item.mode === filterForm.mode)
      }

      if (filterForm.subject) {
        result = result.filter(item => item.subject === filterForm.subject)
      }

      if (filterForm.status) {
        if (filterForm.status === 'completed') {
          result = result.filter(item => item.completed)
        } else {
          result = result.filter(item => !item.completed)
        }
      }

      // 排序：最新的在前
      return result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
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

    // 加载练习历史
    const loadPracticeHistory = async () => {
      loading.value = true
      try {
        // 获取所有练习记录，不限制数量
        const res = await getRecentSessions(1000)
        if (res.data && Array.isArray(res.data)) {
          historyList.value = res.data.map(session => ({
            id: session.id,
            mode: session.mode || 'single',
            subject: session.subject || '综合',
            chapter: session.chapter || '-',
            totalCount: session.totalCount || 0,
            currentIndex: session.currentIndex || 0,
            correctCount: session.correctCount || 0,
            accuracy: session.accuracy !== undefined ? Math.round(session.accuracy) : undefined,
            completed: session.completed || false,
            createTime: session.createTime,
            studyTime: session.studyTime || 0,
            progress: session.totalCount
              ? Math.round(((session.currentIndex || 0) / session.totalCount) * 100)
              : 0
          }))
        } else {
          historyList.value = []
        }
      } catch (error) {
        console.error('加载练习历史失败', error)
        ElMessage.error('加载练习历史失败')
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

    // 继续练习
    const continuePractice = (record) => {
      router.push(`/practice/${record.mode}?continue=${record.id}`)
    }

    // 查看详情
    const reviewPractice = (record) => {
      // 跳转到练习模式，以复习模式查看
      router.push(`/practice/${record.mode}?review=${record.id}`)
    }

    // 删除记录
    const deleteRecord = async (record) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除这条练习记录吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await deleteSession(record.id)
        ElMessage.success('删除成功')
        loadPracticeHistory()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败', error)
          ElMessage.error('删除失败')
        }
      }
    }

    // 返回
    const goBack = () => {
      router.push('/practice')
    }

    // 辅助函数
    const getModeText = (mode) => {
      const modeMap = {
        single: '单题模式',
        batch: '套题模式',
        special: '专项模式'
      }
      return modeMap[mode] || mode
    }

    const getModeTagType = (mode) => {
      const typeMap = {
        single: 'primary',
        batch: 'success',
        special: 'warning'
      }
      return typeMap[mode] || ''
    }

    const getProgressColor = (percentage) => {
      if (percentage < 30) return '#F56C6C'
      if (percentage < 70) return '#E6A23C'
      return '#67C23A'
    }

    const getAccuracyColor = (accuracy) => {
      if (accuracy < 60) return '#F56C6C'
      if (accuracy < 80) return '#E6A23C'
      return '#67C23A'
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

    const formatStudyTime = (minutes) => {
      if (!minutes) return '-'
      if (minutes < 60) {
        return `${minutes}分钟`
      }
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
    }

    onMounted(() => {
      loadPracticeHistory()
    })

    return {
      loading,
      filteredHistory,
      filterForm,
      currentPage,
      pageSize,
      total,
      loadPracticeHistory,
      handleFilterChange,
      handlePageChange,
      handleSizeChange,
      continuePractice,
      reviewPractice,
      deleteRecord,
      goBack,
      getModeText,
      getModeTagType,
      getProgressColor,
      getAccuracyColor,
      formatDateTime,
      formatStudyTime
    }
  }
}
</script>

<style scoped>
.practice-history-container {
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

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
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
