<template>
  <div class="collections-container">
    <!-- 收藏分类管理 -->
    <el-card class="folder-card">
      <template #header>
        <div class="card-header">
          <span>我的收藏</span>
          <el-button type="primary" size="small" @click="showFolderDialog = true">
            <el-icon><FolderAdd /></el-icon>
            新建分类
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeFolder" @tab-change="handleFolderChange">
        <el-tab-pane label="全部收藏" name="all">
          <template #label>
            <el-space>
              <el-icon><Collection /></el-icon>
              <span>全部收藏</span>
              <el-tag size="small" type="info">{{ totalCount }}</el-tag>
            </el-space>
          </template>
        </el-tab-pane>
        <el-tab-pane
          v-for="folder in folders"
          :key="folder.id"
          :name="String(folder.id)"
        >
          <template #label>
            <el-space>
              <el-icon><Folder /></el-icon>
              <span>{{ folder.name }}</span>
              <el-tag size="small" type="info">{{ folder.questionCount }}</el-tag>
            </el-space>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 筛选和操作区 -->
    <el-card class="filter-card">
      <el-form :model="filters" :inline="true">
        <el-form-item label="科目">
          <el-select v-model="filters.subject" placeholder="选择科目" clearable style="width: 150px" @change="handleSearch">
            <el-option label="数据结构" value="DS" />
            <el-option label="计算机组成原理" value="CO" />
            <el-option label="操作系统" value="OS" />
            <el-option label="计算机网络" value="CN" />
          </el-select>
        </el-form-item>

        <el-form-item label="题型">
          <el-select v-model="filters.type" placeholder="选择题型" clearable style="width: 150px" @change="handleSearch">
            <el-option label="单选题" value="SINGLE" />
            <el-option label="多选题" value="MULTIPLE" />
            <el-option label="填空题" value="BLANK" />
            <el-option label="综合题" value="COMPREHENSIVE" />
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
          <el-button type="danger" :disabled="selectedQuestions.length === 0" @click="batchCancelCollect">
            <el-icon><Delete /></el-icon>
            批量取消收藏
          </el-button>
          <el-button type="success" @click="batchMoveToFolder" :disabled="selectedQuestions.length === 0">
            <el-icon><FolderOpened /></el-icon>
            移动到分类
          </el-button>
          <el-button type="warning" @click="exportCollections">
            <el-icon><Download /></el-icon>
            导出收藏
          </el-button>
        </el-space>
      </div>
    </el-card>

    <!-- 收藏题目列表 -->
    <el-card class="question-list-card">
      <template #header>
        <div class="list-header">
          <span>收藏题目（共 {{ total }} 题）</span>
          <el-radio-group v-model="viewMode">
            <el-radio-button label="list">列表视图</el-radio-button>
            <el-radio-button label="card">卡片视图</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 列表视图 -->
      <el-table
        v-if="viewMode === 'list'"
        :data="questions"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="topic" label="题干" min-width="300">
          <template #default="scope">
            <div class="question-content" v-html="scope.row.topic"></div>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="题型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="scope">
            <el-tag :type="getDifficultyTagType(scope.row.difficulty)">
              {{ getDifficultyLabel(scope.row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="subject" label="科目" width="120" />

        <el-table-column prop="folderName" label="分类" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.folderName" type="info">{{ scope.row.folderName }}</el-tag>
            <span v-else class="text-muted">未分类</span>
          </template>
        </el-table-column>

        <el-table-column prop="collectedAt" label="收藏时间" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.collectedAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewQuestion(scope.row)">
              查看
            </el-button>
            <el-button type="success" size="small" @click="practiceQuestion(scope.row)">
              练习
            </el-button>
            <el-button type="info" size="small" @click="moveToFolder(scope.row)">
              移动
            </el-button>
            <el-button type="danger" size="small" @click="cancelCollect(scope.row)">
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 卡片视图 -->
      <div v-else class="card-view" v-loading="loading">
        <el-row :gutter="20">
          <el-col :span="8" v-for="question in questions" :key="question.id">
            <el-card class="question-card" shadow="hover">
              <div class="card-header">
                <el-tag :type="getTypeTagType(question.type)" size="small">
                  {{ getTypeLabel(question.type) }}
                </el-tag>
                <el-tag :type="getDifficultyTagType(question.difficulty)" size="small">
                  {{ getDifficultyLabel(question.difficulty) }}
                </el-tag>
                <el-tag v-if="question.folderName" type="info" size="small">
                  {{ question.folderName }}
                </el-tag>
              </div>

              <div class="card-content">
                <div class="question-title" v-html="question.topic"></div>
                <div class="question-meta">
                  <span>{{ question.subject }}</span>
                  <span>{{ formatDate(question.collectedAt) }}</span>
                </div>
              </div>

              <div class="card-actions">
                <el-button type="primary" size="small" @click="practiceQuestion(question)">
                  练习
                </el-button>
                <el-button type="info" size="small" @click="moveToFolder(question)">
                  移动
                </el-button>
                <el-button type="danger" size="small" @click="cancelCollect(question)">
                  取消
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
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 查看题目详情弹窗 -->
    <el-dialog
      v-model="showViewDialog"
      title="题目详情"
      width="70%"
      top="5vh"
    >
      <div v-if="currentQuestion" class="question-detail">
        <div class="detail-header">
          <el-tag :type="getTypeTagType(currentQuestion.type)">
            {{ getTypeLabel(currentQuestion.type) }}
          </el-tag>
          <el-tag :type="getDifficultyTagType(currentQuestion.difficulty)">
            {{ getDifficultyLabel(currentQuestion.difficulty) }}
          </el-tag>
          <span class="meta-info">{{ currentQuestion.subject }}</span>
          <span class="meta-info">{{ currentQuestion.chapter }}</span>
        </div>

        <el-divider />

        <div class="detail-content">
          <h3>题干</h3>
          <div class="topic-content" v-html="currentQuestion.topic"></div>

          <div v-if="currentQuestion.options" class="options-list">
            <h4>选项</h4>
            <div v-for="(option, index) in parsedOptions" :key="index" class="option-item-detail">
              <span class="option-label-detail">{{ String.fromCharCode(65 + index) }}.</span>
              <span>{{ option }}</span>
            </div>
          </div>

          <div class="answer-section">
            <h4>答案</h4>
            <el-tag type="success">{{ currentQuestion.answer }}</el-tag>
          </div>

          <div class="analysis-section">
            <h4>解析</h4>
            <div v-html="currentQuestion.analysis"></div>
          </div>

          <div v-if="currentQuestion.note" class="note-section">
            <h4>收藏笔记</h4>
            <div>{{ currentQuestion.note }}</div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showViewDialog = false">关闭</el-button>
        <el-button type="primary" @click="practiceQuestion(currentQuestion)">去练习</el-button>
      </template>
    </el-dialog>

    <!-- 新建分类弹窗 -->
    <el-dialog
      v-model="showFolderDialog"
      title="新建收藏分类"
      width="400px"
    >
      <el-form :model="folderForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="folderForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="folderForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述（可选）"
          />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="folderForm.color" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showFolderDialog = false">取消</el-button>
        <el-button type="primary" @click="createFolder">确定</el-button>
      </template>
    </el-dialog>

    <!-- 移动到分类弹窗 -->
    <el-dialog
      v-model="showMoveDialog"
      title="移动到分类"
      width="400px"
    >
      <el-radio-group v-model="selectedFolderId" class="folder-list">
        <el-radio :label="null" size="large">
          <el-space>
            <el-icon><FolderOpened /></el-icon>
            <span>未分类</span>
          </el-space>
        </el-radio>
        <el-radio
          v-for="folder in folders"
          :key="folder.id"
          :label="folder.id"
          size="large"
        >
          <el-space>
            <el-icon><Folder /></el-icon>
            <span>{{ folder.name }}</span>
            <el-tag size="small" type="info">{{ folder.questionCount }}</el-tag>
          </el-space>
        </el-radio>
      </el-radio-group>

      <template #footer>
        <el-button @click="showMoveDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmMove">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Collection,
  FolderAdd,
  Folder,
  FolderOpened,
  Search,
  Refresh,
  Delete,
  Download
} from '@element-plus/icons-vue'
import {
  getCollectionList,
  getCollectionFolders,
  createCollectionFolder,
  moveQuestionToFolder
} from '@/api/collection'

export default {
  name: 'Collections',
  components: {
    Collection,
    FolderAdd,
    Folder,
    FolderOpened,
    Search,
    Refresh,
    Delete,
    Download
  },
  setup() {
    const router = useRouter()

    const viewMode = ref('list')
    const currentPage = ref(1)
    const pageSize = ref(20)
    const loading = ref(false)
    const total = ref(0)
    const totalCount = ref(0)

    const activeFolder = ref('all')
    const folders = ref([])
    const questions = ref([])
    const selectedQuestions = ref([])

    const showViewDialog = ref(false)
    const showFolderDialog = ref(false)
    const showMoveDialog = ref(false)
    const currentQuestion = ref(null)
    const moveQuestions = ref([])

    const filters = reactive({
      subject: '',
      type: ''
    })

    const folderForm = reactive({
      name: '',
      description: '',
      color: '#409EFF'
    })

    const selectedFolderId = ref(null)

    const parsedOptions = computed(() => {
      if (!currentQuestion.value?.options) return []
      try {
        const options = typeof currentQuestion.value.options === 'string'
          ? JSON.parse(currentQuestion.value.options)
          : currentQuestion.value.options
        return Object.values(options)
      } catch {
        return []
      }
    })

    const getTypeLabel = (type) => {
      const typeMap = {
        SINGLE: '单选',
        MULTIPLE: '多选',
        BLANK: '填空',
        COMPREHENSIVE: '综合'
      }
      return typeMap[type] || type
    }

    const getTypeTagType = (type) => {
      const typeMap = {
        SINGLE: 'primary',
        MULTIPLE: 'success',
        BLANK: 'warning',
        COMPREHENSIVE: 'danger'
      }
      return typeMap[type] || ''
    }

    const getDifficultyLabel = (difficulty) => {
      const difficultyMap = {
        EASY: '基础',
        MEDIUM: '中等',
        HARD: '困难'
      }
      return difficultyMap[difficulty] || difficulty
    }

    const getDifficultyTagType = (difficulty) => {
      const difficultyMap = {
        EASY: 'success',
        MEDIUM: 'warning',
        HARD: 'danger'
      }
      return difficultyMap[difficulty] || ''
    }

    const loadFolders = async () => {
      try {
        const res = await getCollectionFolders()
        folders.value = res.data || []
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    }

    const loadCollections = async () => {
      loading.value = true
      try {
        const params = {
          current: currentPage.value,
          size: pageSize.value
        }

        if (activeFolder.value !== 'all') {
          params.folderId = activeFolder.value
        }
        if (filters.subject) params.subject = filters.subject
        if (filters.type) params.type = filters.type

        const res = await getCollectionList(params)
        questions.value = res.data.records || []
        total.value = res.data.total || 0
        totalCount.value = res.data.totalCount || total.value
      } catch (error) {
        ElMessage.error('加载收藏列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleFolderChange = () => {
      currentPage.value = 1
      loadCollections()
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadCollections()
    }

    const resetFilters = () => {
      filters.subject = ''
      filters.type = ''
      currentPage.value = 1
      loadCollections()
    }

    const handleSelectionChange = (selection) => {
      selectedQuestions.value = selection
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
      loadCollections()
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadCollections()
    }

    const viewQuestion = (question) => {
      currentQuestion.value = question
      showViewDialog.value = true
    }

    const practiceQuestion = (question) => {
      router.push(`/practice/single?question=${question.id}`)
    }

    const cancelCollect = async (question) => {
      try {
        await ElMessageBox.confirm(
          `确定要取消收藏"${question.topic?.substring(0, 20)}..."吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const { uncollectQuestion } = await import('@/api/practice')
        await uncollectQuestion(question.id)
        ElMessage.success('已取消收藏')
        await loadCollections()
      } catch {
        // 用户取消
      }
    }

    const batchCancelCollect = async () => {
      try {
        await ElMessageBox.confirm(
          `确定要取消收藏 ${selectedQuestions.value.length} 道题目吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const { uncollectQuestion } = await import('@/api/practice')
        await Promise.all(selectedQuestions.value.map(q => uncollectQuestion(q.id)))
        ElMessage.success('已取消收藏')
        selectedQuestions.value = []
        await loadCollections()
      } catch {
        // 用户取消
      }
    }

    const moveToFolder = (question) => {
      moveQuestions.value = [question]
      selectedFolderId.value = question.folderId || null
      showMoveDialog.value = true
    }

    const batchMoveToFolder = () => {
      moveQuestions.value = [...selectedQuestions.value]
      selectedFolderId.value = null
      showMoveDialog.value = true
    }

    const confirmMove = async () => {
      try {
        await Promise.all(
          moveQuestions.value.map(q => moveQuestionToFolder(q.id, selectedFolderId.value))
        )
        ElMessage.success('移动成功')
        showMoveDialog.value = false
        await loadCollections()
      } catch (error) {
        ElMessage.error('移动失败')
      }
    }

    const createFolder = async () => {
      if (!folderForm.name) {
        ElMessage.warning('请输入分类名称')
        return
      }

      try {
        await createCollectionFolder(folderForm)
        ElMessage.success('创建成功')
        showFolderDialog.value = false
        folderForm.name = ''
        folderForm.description = ''
        folderForm.color = '#409EFF'
        await loadFolders()
      } catch (error) {
        ElMessage.error('创建失败')
      }
    }

    const exportCollections = () => {
      ElMessage.info('导出功能开发中...')
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString()
    }

    onMounted(() => {
      loadFolders()
      loadCollections()
    })

    return {
      viewMode,
      currentPage,
      pageSize,
      total,
      totalCount,
      loading,
      activeFolder,
      folders,
      questions,
      selectedQuestions,
      filters,
      folderForm,
      showViewDialog,
      showFolderDialog,
      showMoveDialog,
      currentQuestion,
      selectedFolderId,
      parsedOptions,
      getTypeLabel,
      getTypeTagType,
      getDifficultyLabel,
      getDifficultyTagType,
      handleFolderChange,
      handleSearch,
      resetFilters,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      viewQuestion,
      practiceQuestion,
      cancelCollect,
      batchCancelCollect,
      moveToFolder,
      batchMoveToFolder,
      confirmMove,
      createFolder,
      exportCollections,
      formatDate
    }
  }
}
</script>

<style scoped>
.collections-container {
  max-width: 1400px;
  margin: 0 auto;
}

.folder-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-actions {
  margin-top: 15px;
}

.question-list-card {
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
  min-height: 500px;
}

.question-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.question-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
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

.question-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.question-detail {
  padding: 10px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-header .meta-info {
  color: #606266;
  font-size: 14px;
}

.detail-content h3,
.detail-content h4 {
  color: #303133;
  margin-top: 15px;
  margin-bottom: 10px;
}

.topic-content {
  color: #303133;
  font-size: 15px;
  line-height: 1.8;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.options-list {
  margin-top: 15px;
}

.option-item-detail {
  padding: 8px 15px;
  margin-bottom: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
}

.option-label-detail {
  font-weight: bold;
  margin-right: 10px;
  min-width: 25px;
}

.answer-section,
.analysis-section,
.note-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.analysis-section {
  background-color: #fef9f0;
  border-left-color: #e6a23c;
}

.note-section {
  background-color: #f0f9ff;
  border-left-color: #67c23a;
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.folder-list .el-radio {
  height: auto;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-right: 0;
}

.folder-list .el-radio:hover {
  background-color: #f5f7fa;
}

.folder-list .el-radio.is-checked {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.text-muted {
  color: #909399;
}
</style>
