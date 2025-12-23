<template>
  <div class="mistakes-container">
    <!-- 顶部统计 -->
    <el-card class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalMistakes }}</div>
              <div class="stat-label">总错题数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon reviewed">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ reviewedMistakes }}</div>
              <div class="stat-label">已复习</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon today">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ todayMistakes }}</div>
              <div class="stat-label">今日新增</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-icon need-review">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ needReviewMistakes }}</div>
              <div class="stat-label">待复习</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 筛选和操作区 -->
    <el-card class="filter-card">
      <el-form :model="filters" :inline="true">
        <el-form-item label="复习模式">
          <el-select v-model="reviewMode" placeholder="选择复习模式" style="width: 150px">
            <el-option label="全部错题" value="all" />
            <el-option label="艾宾浩斯" value="ebbinghaus" />
            <el-option label="今日复习" value="today" />
            <el-option label="未复习" value="unreviewed" />
          </el-select>
        </el-form-item>

        <el-form-item label="科目">
          <el-select v-model="filters.subject" placeholder="选择科目" clearable style="width: 150px">
            <el-option label="数据结构" value="数据结构" />
            <el-option label="计算机组成原理" value="计算机组成原理" />
            <el-option label="操作系统" value="操作系统" />
            <el-option label="计算机网络" value="计算机网络" />
          </el-select>
        </el-form-item>

        <el-form-item label="错误原因">
          <el-select v-model="filters.reason" placeholder="选择错误原因" clearable style="width: 150px">
            <el-option label="知识点遗忘" value="知识点遗忘" />
            <el-option label="计算失误" value="计算失误" />
            <el-option label="审题错误" value="审题错误" />
            <el-option label="方法错误" value="方法错误" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <div class="filter-actions">
        <el-space>
          <el-button type="primary" @click="startReview">
            <el-icon><Reading /></el-icon>
            开始复习
          </el-button>
          <el-button type="success" @click="exportMistakes">
            <el-icon><Download /></el-icon>
            导出错题
          </el-button>
          <el-button type="warning" @click="clearReviewed">
            <el-icon><Delete /></el-icon>
            清除已复习
          </el-button>
        </el-space>
      </div>
    </el-card>

    <!-- 错题列表 -->
    <el-card class="mistake-list">
      <template #header>
        <div class="list-header">
          <span>错题列表（共 {{ filteredMistakes.length }} 题）</span>
          <el-space>
            <el-switch
              v-model="showAnalysis"
              active-text="显示解析"
              inactive-text="隐藏解析"
            />
            <el-button-group>
              <el-button
                :type="viewMode === 'list' ? 'primary' : ''"
                @click="viewMode = 'list'"
              >
                列表视图
              </el-button>
              <el-button
                :type="viewMode === 'card' ? 'primary' : ''"
                @click="viewMode = 'card'"
              >
                卡片视图
              </el-button>
            </el-button-group>
          </el-space>
        </div>
      </template>

      <!-- 列表视图 -->
      <el-table
        v-if="viewMode === 'list'"
        :data="paginatedMistakes"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="content" label="题干" min-width="300">
          <template #default="scope">
            <div class="question-content" v-html="scope.row.content"></div>
          </template>
        </el-table-column>

        <el-table-column prop="subject" label="科目" width="120" />

        <el-table-column prop="mistakeTime" label="错误时间" width="150">
          <template #default="scope">
            {{ formatDateTime(scope.row.mistakeTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="reviewCount" label="复习次数" width="100">
          <template #default="scope">
            <el-tag size="small">{{ scope.row.reviewCount }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="错误原因" width="120">
          <template #default="scope">
            <el-tag type="warning" size="small">{{ scope.row.reason }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewMistake(scope.row)">
              查看
            </el-button>
            <el-button type="success" size="small" @click="addNote(scope.row)">
              笔记
            </el-button>
            <el-button type="warning" size="small" @click="markReviewed(scope.row)">
              已掌握
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 卡片视图 -->
      <div v-else class="card-view">
        <el-row :gutter="20">
          <el-col :span="8" v-for="mistake in paginatedMistakes" :key="mistake.id">
            <el-card class="mistake-card" shadow="hover">
              <div class="card-header">
                <el-tag type="danger" size="small">错题</el-tag>
                <el-tag type="info" size="small">{{ mistake.subject }}</el-tag>
              </div>

              <div class="card-content">
                <div class="question-title" v-html="mistake.content"></div>
                <div class="mistake-info">
                  <span>错误原因：{{ mistake.reason }}</span>
                  <span>复习次数：{{ mistake.reviewCount }}</span>
                </div>
              </div>

              <div class="card-actions">
                <el-button type="primary" size="small" @click="viewMistake(mistake)">
                  查看
                </el-button>
                <el-button type="success" size="small" @click="addNote(mistake)">
                  笔记
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="totalMistakes"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 错题详情弹窗 -->
    <el-dialog
      v-model="showMistakeDetail"
      title="错题详情"
      width="80%"
      top="5vh"
    >
      <div v-if="selectedMistake" class="mistake-detail">
        <el-row :gutter="20">
          <el-col :span="16">
            <div class="question-section">
              <h3>题目</h3>
              <div class="question-content" v-html="selectedMistake.content"></div>

              <!-- 用户错误答案 -->
              <div class="wrong-answer">
                <h4>你的答案：</h4>
                <el-tag type="danger">{{ formatWrongAnswer(selectedMistake) }}</el-tag>
              </div>

              <!-- 正确答案 -->
              <div class="correct-answer">
                <h4>正确答案：</h4>
                <el-tag type="success">{{ formatCorrectAnswer(selectedMistake) }}</el-tag>
              </div>
            </div>
          </el-col>

          <el-col :span="8">
            <div class="info-section">
              <el-descriptions title="错题信息" :column="1" border>
                <el-descriptions-item label="科目">
                  {{ selectedMistake.subject }}
                </el-descriptions-item>
                <el-descriptions-item label="章节">
                  {{ selectedMistake.chapter }}
                </el-descriptions-item>
                <el-descriptions-item label="错误时间">
                  {{ formatDateTime(selectedMistake.mistakeTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="错误原因">
                  {{ selectedMistake.reason }}
                </el-descriptions-item>
                <el-descriptions-item label="复习次数">
                  {{ selectedMistake.reviewCount }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
        </el-row>

        <!-- 题目解析 -->
        <div class="analysis-section">
          <h3>题目解析</h3>
          <div v-html="selectedMistake.explanation"></div>
        </div>

        <!-- 相关考点 -->
        <div class="knowledge-section">
          <h3>相关考点</h3>
          <el-tag
            v-for="point in selectedMistake.knowledgePoints"
            :key="point"
            type="info"
            style="margin-right: 8px; margin-bottom: 8px;"
            @click="viewKnowledge(point)"
          >
            {{ point }}
          </el-tag>
        </div>

        <!-- 个人笔记 -->
        <div class="notes-section">
          <h3>个人笔记</h3>
          <el-input
            v-model="selectedMistake.notes"
            type="textarea"
            :rows="4"
            placeholder="添加你的学习笔记..."
          />
          <div class="image-upload">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-preview="handlePicturePreview"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <el-dialog v-model="dialogVisible">
              <img w-full :src="dialogImageUrl" alt="Preview Image" />
            </el-dialog>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showMistakeDetail = false">关闭</el-button>
        <el-button type="warning" @click="markReviewed(selectedMistake)">
          标记为已掌握
        </el-button>
        <el-button type="primary" @click="practiceAgain(selectedMistake)">
          重新练习
        </el-button>
      </template>
    </el-dialog>

    <!-- 笔记编辑弹窗 -->
    <el-dialog
      v-model="showNoteEditor"
      title="编辑笔记"
      width="600px"
    >
      <el-form :model="noteForm" label-width="80px">
        <el-form-item label="笔记内容">
          <el-input
            v-model="noteForm.content"
            type="textarea"
            :rows="6"
            placeholder="记录你的理解和要点..."
          />
        </el-form-item>
        <el-form-item label="添加图片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showNoteEditor = false">取消</el-button>
        <el-button type="primary" @click="saveNote">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWrongQuestions, markMastered } from '@/api/mistake'
import {
  Search,
  Refresh,
  Reading,
  Download,
  Delete,
  Check,
  Document,
  Calendar,
  Clock,
  Plus
} from '@element-plus/icons-vue'

export default {
  name: 'Mistakes',
  components: {
    Search,
    Refresh,
    Reading,
    Download,
    Delete,
    Check,
    Document,
    Calendar,
    Clock,
    Plus
  },
  setup() {
    const router = useRouter()

    const mistakes = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const totalMistakes = ref(0)
    const viewMode = ref('list')
    const showAnalysis = ref(true)
    const showMistakeDetail = ref(false)
    const showNoteEditor = ref(false)
    const selectedMistake = ref(null)
    const selectedMistakes = ref([])
    const reviewMode = ref('all')
    const dialogImageUrl = ref('')
    const dialogVisible = ref(false)

    const filters = reactive({
      subject: '',
      reason: ''
    })

    const noteForm = reactive({
      content: ''
    })

    onMounted(async () => {
      await loadMistakes()
    })

    const loadMistakes = async () => {
      try {
        const params = {
          current: currentPage.value,
          size: pageSize.value
        }
        if (filters.subject) params.subject = filters.subject

        const res = await getWrongQuestions(params)
        mistakes.value = res.data.records || []
        totalMistakes.value = res.data.total || 0
      } catch (error) {
        ElMessage.error('加载错题失败')
      }
    }

    const filteredMistakes = computed(() => {
      let filtered = [...mistakes.value]

      // 根据复习模式筛选
      if (reviewMode.value === 'ebbinghaus') {
        // 艾宾浩斯遗忘曲线筛选
        const now = new Date()
        filtered = filtered.filter(mistake => {
          const mistakeDate = new Date(mistake.mistakeTime)
          const daysDiff = Math.floor((now - mistakeDate) / (1000 * 60 * 60 * 24))
          const reviewCount = mistake.reviewCount

          // 艾宾浩斯复习周期：1天、2天、4天、7天、15天
          const reviewPeriods = [1, 2, 4, 7, 15]
          if (reviewCount >= reviewPeriods.length) return false

          const nextReviewDay = reviewPeriods[reviewCount]
          return daysDiff >= nextReviewDay
        })
      } else if (reviewMode.value === 'today') {
        // 今日需要复习的错题
        filtered = filtered.filter(mistake => {
          const today = new Date()
          const mistakeDate = new Date(mistake.mistakeTime)
          return mistakeDate.toDateString() === today.toDateString()
        })
      } else if (reviewMode.value === 'unreviewed') {
        // 未复习的错题
        filtered = filtered.filter(mistake => mistake.reviewCount === 0)
      }

      return filtered
    })

    const paginatedMistakes = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredMistakes.value.slice(start, end)
    })

        const reviewedMistakes = computed(() => mistakes.value.filter(m => m.reviewCount > 0).length)
    const todayMistakes = computed(() => {
      const today = new Date()
      return mistakes.value.filter(m => {
        const mistakeDate = new Date(m.mistakeTime)
        return mistakeDate.toDateString() === today.toDateString()
      }).length
    })
    const needReviewMistakes = computed(() => {
      return filteredMistakes.value.filter(m => m.reviewCount < 3).length
    })

    const handleSearch = () => {
      currentPage.value = 1
      loadMistakes()
    }

    const resetFilters = () => {
      filters.subject = ''
      filters.reason = ''
      reviewMode.value = 'all'
      currentPage.value = 1
      loadMistakes()
    }

    const handleSelectionChange = (selection) => {
      selectedMistakes.value = selection
    }

    const viewMistake = (mistake) => {
      selectedMistake.value = mistake
      showMistakeDetail.value = true
    }

    const addNote = (mistake) => {
      selectedMistake.value = mistake
      noteForm.content = mistake.notes || ''
      showNoteEditor.value = true
    }

    const saveNote = () => {
      if (selectedMistake.value) {
        selectedMistake.value.notes = noteForm.content
        ElMessage.success('笔记已保存')
      }
      showNoteEditor.value = false
    }

    const markReviewed = async (mistake) => {
      try {
        await markMastered(mistake.id)
        mistake.reviewCount++
        ElMessage.success('已标记为已掌握')
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    const startReview = () => {
      ElMessage.info('开始智能复习')
      router.push('/practice/special?review=true')
    }

    const exportMistakes = () => {
      ElMessage.info('导出功能开发中...')
    }

    const clearReviewed = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要清除所有已复习的错题吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        mistakes.value = mistakes.value.filter(m => m.reviewCount === 0)
        ElMessage.success('已清除已复习错题')
      } catch {
        // 用户取消
      }
    }

    const practiceAgain = (mistake) => {
      router.push(`/practice/single?question=${mistake.id}`)
    }

    const viewKnowledge = (point) => {
      router.push(`/knowledge?point=${encodeURIComponent(point)}`)
    }

    const handlePicturePreview = (file) => {
      dialogImageUrl.value = file.url
      dialogVisible.value = true
    }

    const formatDateTime = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleString()
    }

    const formatWrongAnswer = (mistake) => {
      if (mistake.type === 'single') {
        return String.fromCharCode(65 + mistake.wrongAnswer)
      } else if (mistake.type === 'multiple') {
        return mistake.wrongAnswer.map(i => String.fromCharCode(65 + i)).join(', ')
      }
      return mistake.wrongAnswer
    }

    const formatCorrectAnswer = (mistake) => {
      if (mistake.type === 'single') {
        return String.fromCharCode(65 + mistake.correctAnswer)
      } else if (mistake.type === 'multiple') {
        return mistake.correctAnswer.map(i => String.fromCharCode(65 + i)).join(', ')
      }
      return mistake.answer
    }

    return {
      mistakes,
      currentPage,
      pageSize,
      totalMistakes,
      viewMode,
      showAnalysis,
      showMistakeDetail,
      showNoteEditor,
      selectedMistake,
      selectedMistakes,
      reviewMode,
      filters,
      noteForm,
      dialogImageUrl,
      dialogVisible,
      filteredMistakes,
      paginatedMistakes,
      reviewedMistakes,
      todayMistakes,
      needReviewMistakes,
      handleSearch,
      resetFilters,
      handleSelectionChange,
      viewMistake,
      addNote,
      saveNote,
      markReviewed,
      startReview,
      exportMistakes,
      clearReviewed,
      practiceAgain,
      viewKnowledge,
      handlePicturePreview,
      formatDateTime,
      formatWrongAnswer,
      formatCorrectAnswer
    }
  }
}
</script>

<style scoped>
.mistakes-container {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-icon {
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

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.reviewed {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.today {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.need-review {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-actions {
  text-align: right;
}

.mistake-list {
  min-height: 600px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-content {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-view {
  min-height: 400px;
}

.mistake-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.mistake-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.card-content {
  margin-bottom: 15px;
}

.question-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 10px;
  max-height: 40px;
  overflow: hidden;
}

.mistake-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.mistake-detail {
  padding: 20px;
}

.question-section,
.info-section,
.analysis-section,
.knowledge-section,
.notes-section {
  margin-bottom: 20px;
}

.wrong-answer,
.correct-answer {
  margin-top: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.image-upload {
  margin-top: 10px;
}
</style>