<template>
  <div class="tasks-container">
    <el-card class="tasks-card">
      <template #header>
        <div class="tasks-header">
          <span>学习任务</span>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog">新建任务</el-button>
        </div>
      </template>

      <!-- 任务统计 -->
      <div class="tasks-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ stats.total || 0 }}</div>
              <div class="stat-label">全部任务</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value success">{{ stats.completed || 0 }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value warning">{{ stats.pending || 0 }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value danger">{{ stats.overdue || 0 }}</div>
              <div class="stat-label">已逾期</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 筛选器 -->
      <div class="tasks-filter">
        <el-select v-model="filterStatus" placeholder="全部状态" clearable @change="loadTasks">
          <el-option label="全部状态" value="" />
          <el-option label="待完成" value="pending" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
        </el-select>
        <el-select v-model="filterCategory" placeholder="全部分类" clearable @change="loadTasks">
          <el-option label="全部分类" value="" />
          <el-option label="日常练习" value="daily" />
          <el-option label="专项突破" value="special" />
          <el-option label="模拟考试" value="exam" />
          <el-option label="复习计划" value="review" />
        </el-select>
      </div>

      <!-- 任务列表 -->
      <div class="tasks-list">
        <el-table :data="taskList" style="width: 100%" v-loading="loading">
          <el-table-column width="50">
            <template #default="scope">
              <el-checkbox
                v-model="scope.row.completed"
                :true-label="1"
                :false-label="0"
                @change="toggleComplete(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="title" label="任务名称" min-width="200">
            <template #default="scope">
              <span :class="{ completed: scope.row.completed }">{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="120">
            <template #default="scope">
              <el-tag :type="getCategoryTagType(scope.row.category)" size="small">
                {{ getCategoryLabel(scope.row.category) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="100">
            <template #default="scope">
              <el-tag :type="getPriorityTagType(scope.row.priority)" size="small">
                {{ getPriorityLabel(scope.row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="targetDate" label="目标日期" width="120">
            <template #default="scope">
              <span :class="{ overdue: isOverdue(scope.row.targetDate) && !scope.row.completed }">
                {{ formatDate(scope.row.targetDate) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" width="120">
            <template #default="scope">
              <el-progress :percentage="getProgress(scope.row)" :stroke-width="8" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button link type="primary" :icon="Edit" @click="editTask(scope.row)">编辑</el-button>
              <el-button link type="danger" :icon="Delete" @click="deleteTask(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="taskList.length === 0 && !loading" description="暂无任务" />
      </div>
    </el-card>

    <!-- 创建/编辑任务对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑任务' : '新建任务'"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="taskForm" :rules="formRules" ref="taskFormRef" label-width="100px">
        <el-form-item label="任务名称" prop="title">
          <el-input v-model="taskForm.title" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="任务分类" prop="category">
          <el-select v-model="taskForm.category" placeholder="请选择分类">
            <el-option label="日常练习" value="daily" />
            <el-option label="专项突破" value="special" />
            <el-option label="模拟考试" value="exam" />
            <el-option label="复习计划" value="review" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="taskForm.priority" placeholder="请选择优先级">
            <el-option label="高" :value="3" />
            <el-option label="中" :value="2" />
            <el-option label="低" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标日期" prop="targetDate">
          <el-date-picker
            v-model="taskForm.targetDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTask">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskApi,
  toggleTaskComplete,
  getTaskStatistics
} from '@/api/tasks'

const loading = ref(false)
const taskList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const taskFormRef = ref(null)

const filterStatus = ref('')
const filterCategory = ref('')

const stats = reactive({
  total: 0,
  completed: 0,
  pending: 0,
  overdue: 0
})

const taskForm = reactive({
  id: null,
  title: '',
  description: '',
  category: '',
  priority: 2,
  targetDate: ''
})

const formRules = {
  title: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择任务分类', trigger: 'change' }],
  targetDate: [{ required: true, message: '请选择目标日期', trigger: 'change' }]
}

// 加载任务列表
const loadTasks = async () => {
  loading.value = true
  try {
    const params = {}
    if (filterStatus.value) params.status = filterStatus.value
    if (filterCategory.value) params.category = filterCategory.value

    const res = await getTasks(params)
    if (res.code === 0) {
      taskList.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('加载任务列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getTaskStatistics()
    if (res.code === 0) {
      Object.assign(stats, res.data)
    }
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑任务
const editTask = (task) => {
  isEdit.value = true
  Object.assign(taskForm, {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    priority: task.priority,
    targetDate: task.targetDate
  })
  dialogVisible.value = true
}

// 提交任务
const submitTask = async () => {
  try {
    await taskFormRef.value.validate()
    const data = { ...taskForm }
    delete data.id

    const res = isEdit.value
      ? await updateTask(taskForm.id, data)
      : await createTask(data)

    if (res.code === 0) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadTasks()
      loadStats()
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
    }
  }
}

// 切换完成状态
const toggleComplete = async (task) => {
  try {
    const res = await toggleTaskComplete(task.id, task.completed)
    if (res.code === 0) {
      ElMessage.success(task.completed ? '任务已完成' : '任务已恢复')
      loadStats()
    }
  } catch (error) {
    ElMessage.error('操作失败')
    task.completed = task.completed ? 0 : 1
  }
}

// 删除任务
const deleteTask = (task) => {
  ElMessageBox.confirm('确定要删除这个任务吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteTaskApi(task.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        loadTasks()
        loadStats()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 重置表单
const resetForm = () => {
  taskFormRef.value?.resetFields()
  Object.assign(taskForm, {
    id: null,
    title: '',
    description: '',
    category: '',
    priority: 2,
    targetDate: ''
  })
}

// 工具函数
const getCategoryLabel = (category) => {
  const map = {
    daily: '日常练习',
    special: '专项突破',
    exam: '模拟考试',
    review: '复习计划'
  }
  return map[category] || category
}

const getCategoryTagType = (category) => {
  const map = {
    daily: '',
    special: 'success',
    exam: 'warning',
    review: 'info'
  }
  return map[category] || ''
}

const getPriorityLabel = (priority) => {
  const map = { 3: '高', 2: '中', 1: '低' }
  return map[priority] || '中'
}

const getPriorityTagType = (priority) => {
  const map = { 3: 'danger', 2: 'warning', 1: 'info' }
  return map[priority] || ''
}

const getProgress = (task) => {
  return task.completed ? 100 : 0
}

const formatDate = (date) => {
  if (!date) return '-'
  return date.split(' ')[0]
}

const isOverdue = (targetDate) => {
  if (!targetDate) return false
  return new Date(targetDate) < new Date()
}

onMounted(() => {
  loadTasks()
  loadStats()
})
</script>

<style scoped>
.tasks-container {
  padding: 20px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tasks-stats {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.danger {
  color: #f56c6c;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.tasks-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tasks-list {
  min-height: 300px;
}

.completed {
  text-decoration: line-through;
  color: #909399;
}

.overdue {
  color: #f56c6c;
}
</style>
