<template>
    <div class="profile-container">
      <!-- 资料编辑对话框 -->
      <el-dialog
        v-model="editDialogVisible"
        title="编辑资料"
        width="500px"
        @close="handleDialogClose"
      >
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editRules"
          label-width="80px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="考试日期" prop="examDate">
            <el-date-picker
              v-model="editForm.examDate"
              type="date"
              placeholder="选择考试日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSaveProfile">保存</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 修改密码对话框 -->
      <el-dialog
        v-model="passwordDialogVisible"
        title="修改密码"
        width="450px"
        @close="handlePasswordDialogClose"
      >
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="90px"
        >
          <el-form-item label="原密码" prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码(至少6位)"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="passwordDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
          </span>
        </template>
      </el-dialog>

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

            <div class="action-buttons">
              <el-button type="primary" @click="editProfile">
                编辑资料
              </el-button>
              <el-button type="warning" @click="changePassword">
                修改密码
              </el-button>
            </div>
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

          <!-- 今日任务管理 -->
          <el-card class="tasks-card" style="margin-top: 20px;">
            <template #header>
              <div class="card-header">
                <span>今日任务</span>
                <el-button type="primary" size="small" :icon="Plus" @click="showAddTaskDialog">
                  添加任务
                </el-button>
              </div>
            </template>

            <div class="tasks-list">
              <div v-if="tasks.length === 0" class="empty-tasks">
                <el-empty description="暂无任务，点击上方按钮添加" :image-size="60" />
              </div>
              <div v-else>
                <div
                  v-for="task in tasks"
                  :key="task.id"
                  class="task-item"
                  :class="{ 'task-completed': task.completed }"
                >
                  <div class="task-left">
                    <el-checkbox v-model="task.completed" @change="toggleTask(task)" size="large" />
                    <span class="task-text">{{ task.text }}</span>
                  </div>
                  <div class="task-actions">
                    <el-button type="danger" size="small" :icon="Delete" circle @click="deleteTask(task.id)" />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="tasks.length > 0" class="task-summary">
              <span>完成进度: {{ completedTasksCount }}/{{ tasks.length }}</span>
              <el-progress :percentage="taskProgress" :stroke-width="8" />
            </div>
          </el-card>

          <!-- 添加任务对话框 -->
          <el-dialog
            v-model="addTaskDialogVisible"
            title="添加新任务"
            width="400px"
          >
            <el-form :model="taskForm" label-width="80px">
              <el-form-item label="任务内容">
                <el-input
                  v-model="taskForm.text"
                  placeholder="请输入任务内容"
                  maxlength="50"
                  show-word-limit
                  @keyup.enter="addTask"
                />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="addTaskDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="addTask">确定</el-button>
            </template>
          </el-dialog>
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
import { ref, computed, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { getUserStatistics, getSubjectStatistics, getWeakChapters } from '@/api/statistics'
import { updateProfile, changePassword as changePasswordApi } from '@/api/auth'

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

    // 任务管理
    const tasks = ref([])
    const addTaskDialogVisible = ref(false)
    const taskForm = reactive({
      text: ''
    })

    // 从 localStorage 加载任务
    const loadTasks = () => {
      const savedTasks = localStorage.getItem('todayTasks')
      if (savedTasks) {
        tasks.value = JSON.parse(savedTasks)
      } else {
        // 默认任务
        tasks.value = [
          { id: 1, text: '完成数据结构章节练习', completed: false },
          { id: 2, text: '复习计算机网络知识点', completed: false },
          { id: 3, text: '整理错题本', completed: false }
        ]
      }
    }

    // 保存任务到 localStorage
    const saveTasks = () => {
      localStorage.setItem('todayTasks', JSON.stringify(tasks.value))
    }

    const completedTasksCount = computed(() => tasks.value.filter(t => t.completed).length)
    const taskProgress = computed(() => {
      if (tasks.value.length === 0) return 0
      return Math.round((completedTasksCount.value / tasks.value.length) * 100)
    })

    const showAddTaskDialog = () => {
      taskForm.text = ''
      addTaskDialogVisible.value = true
    }

    const addTask = () => {
      if (!taskForm.text.trim()) {
        ElMessage.warning('请输入任务内容')
        return
      }
      tasks.value.push({
        id: Date.now(),
        text: taskForm.text.trim(),
        completed: false
      })
      saveTasks()
      addTaskDialogVisible.value = false
      ElMessage.success('任务添加成功')
    }

    const deleteTask = (taskId) => {
      ElMessageBox.confirm('确定要删除这个任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        tasks.value = tasks.value.filter(t => t.id !== taskId)
        saveTasks()
        ElMessage.success('任务删除成功')
      }).catch(() => {})
    }

    const toggleTask = (task) => {
      saveTasks()
      if (task.completed) {
        ElMessage.success('任务完成！')
      }
    }

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
      loadTasks()
      loadStatistics()
      loadWeakChapters()
      loadSubjectStatistics()
    })

    // 资料编辑对话框
    const editDialogVisible = ref(false)
    const editFormRef = ref(null)
    const editForm = reactive({
      username: '',
      email: '',
      examDate: ''
    })

    // 表单验证规则
    const editRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ]
    }

    const editProfile = () => {
      editForm.username = userInfo.value.username || ''
      editForm.email = userInfo.value.email || ''
      editForm.examDate = userInfo.value.examDate || ''
      editDialogVisible.value = true
    }

    const handleDialogClose = () => {
      editFormRef.value?.resetFields()
    }

    const handleSaveProfile = async () => {
      if (!editFormRef.value) return

      await editFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const { data } = await updateProfile(editForm)
            if (data) {
              // 更新 Vuex store 中的用户信息
              await store.dispatch('updateUserInfo', {
                ...userInfo.value,
                username: editForm.username,
                email: editForm.email,
                examDate: editForm.examDate
              })
              ElMessage.success('资料更新成功')
              editDialogVisible.value = false
            }
          } catch (error) {
            ElMessage.error(error.response?.data?.message || '更新失败，请重试')
          }
        }
      })
    }

    // 修改密码对话框
    const passwordDialogVisible = ref(false)
    const passwordFormRef = ref(null)
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入新密码'))
      } else if (value !== passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, validator: validateConfirmPassword, trigger: 'blur' }
      ]
    }

    const changePassword = () => {
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      passwordDialogVisible.value = true
    }

    const handlePasswordDialogClose = () => {
      passwordFormRef.value?.resetFields()
    }

    const handleChangePassword = async () => {
      if (!passwordFormRef.value) return

      await passwordFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const { data } = await changePasswordApi({
              oldPassword: passwordForm.oldPassword,
              newPassword: passwordForm.newPassword
            })
            if (data) {
              ElMessage.success('密码修改成功，请重新登录')
              passwordDialogVisible.value = false
              // 延迟后退出登录
              setTimeout(() => {
                store.dispatch('logout')
                router.push('/login')
              }, 1500)
            }
          } catch (error) {
            ElMessage.error(error.response?.data?.message || '修改失败，请检查原密码是否正确')
          }
        }
      })
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
      tasks,
      addTaskDialogVisible,
      taskForm,
      completedTasksCount,
      taskProgress,
      Plus,
      Delete,
      editDialogVisible,
      editFormRef,
      editForm,
      editRules,
      passwordDialogVisible,
      passwordFormRef,
      passwordForm,
      passwordRules,
      editProfile,
      handleDialogClose,
      handleSaveProfile,
      changePassword,
      handlePasswordDialogClose,
      handleChangePassword,
      savePlan,
      practiceWeakness,
      showAddTaskDialog,
      addTask,
      deleteTask,
      toggleTask
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

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-buttons .el-button {
  flex: 1;
  min-width: 0;
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

/* 任务管理样式 */
.tasks-card {
  margin-top: 20px;
}

.tasks-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tasks-list {
  max-height: 300px;
  overflow-y: auto;
}

.empty-tasks {
  text-align: center;
  padding: 20px 0;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 10px;
  background: var(--bg-color-page, #fff);
  border-radius: 8px;
  border: 1px solid var(--border-color-light, #e4e7ed);
  transition: all 0.3s ease;
}

.task-item:hover {
  border-color: var(--primary-color, #409EFF);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.task-item.task-completed {
  opacity: 0.6;
}

.task-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.task-text {
  font-size: 14px;
  color: var(--text-color-primary, #303133);
}

.task-completed .task-text {
  text-decoration: line-through;
  color: var(--text-color-secondary, #909399);
}

.task-actions {
  display: flex;
  gap: 8px;
}

.task-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color-light, #e4e7ed);
}

.task-summary span {
  display: block;
  font-size: 13px;
  color: var(--text-color-regular, #606266);
  margin-bottom: 8px;
}
</style>