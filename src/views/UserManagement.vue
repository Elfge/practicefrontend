<template>
  <div class="user-management-container">
    <!-- 统计信息卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff;">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total || 0 }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a;">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.active || 0 }}</div>
              <div class="stat-label">活跃用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c;">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.admin || 0 }}</div>
              <div class="stat-label">管理员</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c;">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.disabled || 0 }}</div>
              <div class="stat-label">已禁用</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :model="filters" :inline="true">
        <el-form-item label="搜索">
          <el-input
            v-model="filters.keyword"
            placeholder="用户名/邮箱/手机号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="filters.role" placeholder="选择角色" clearable style="width: 120px">
            <el-option label="管理员" value="ADMIN" />
            <el-option label="普通用户" value="USER" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 120px">
            <el-option label="正常" value="ACTIVE" />
            <el-option label="禁用" value="DISABLED" />
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
        <el-button type="success" @click="batchSetStatus('ACTIVE')" :disabled="selectedUsers.length === 0">
          <el-icon><Unlock /></el-icon>
          批量启用
        </el-button>
        <el-button type="warning" @click="batchSetStatus('DISABLED')" :disabled="selectedUsers.length === 0">
          <el-icon><Lock /></el-icon>
          批量禁用
        </el-button>
        <el-button type="danger" @click="batchDelete" :disabled="selectedUsers.length === 0">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <div style="flex: 1"></div>
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
      </div>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="user-list-card">
      <template #header>
        <span>用户列表（共 {{ total }} 人）</span>
      </template>

      <el-table
        :data="users"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="username" label="用户名" width="150" />

        <el-table-column prop="email" label="邮箱" min-width="200" />

        <el-table-column prop="phone" label="手机号" width="130" />

        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'ADMIN' ? 'danger' : 'primary'" size="small">
              {{ scope.row.role === 'ADMIN' ? '管理员' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'info'" size="small">
              {{ scope.row.status === 'ACTIVE' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="lastLoginAt" label="最后登录" width="180">
          <template #default="scope">
            {{ scope.row.lastLoginAt ? formatDate(scope.row.lastLoginAt) : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewUser(scope.row)">
              查看
            </el-button>
            <el-button type="warning" size="small" @click="editUser(scope.row)">
              编辑
            </el-button>
            <el-button
              :type="scope.row.status === 'ACTIVE' ? 'warning' : 'success'"
              size="small"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 'ACTIVE' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="info" size="small" @click="resetPassword(scope.row)">
              重置密码
            </el-button>
            <el-button type="danger" size="small" @click="deleteUserItem(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="600px"
    >
      <el-form :model="userForm" :rules="formRules" ref="userFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="普通用户" value="USER" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="ACTIVE">正常</el-radio>
            <el-radio label="DISABLED">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="userForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看用户详情对话框 -->
    <el-dialog
      v-model="showViewDialog"
      title="用户详情"
      width="600px"
    >
      <div v-if="currentUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="currentUser.role === 'ADMIN' ? 'danger' : 'primary'" size="small">
              {{ currentUser.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === 'ACTIVE' ? 'success' : 'info'" size="small">
              {{ currentUser.status === 'ACTIVE' ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDate(currentUser.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">
            {{ currentUser.lastLoginAt ? formatDate(currentUser.lastLoginAt) : '未登录' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentUser.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="showViewDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="重置密码"
      width="400px"
    >
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="passwordForm.password" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  SuccessFilled,
  Lock,
  WarningFilled,
  Search,
  Refresh,
  Unlock,
  Delete,
  Plus
} from '@element-plus/icons-vue'
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  setUserStatus,
  batchSetUserStatus,
  resetUserPassword,
  getUserStatistics
} from '@/api/user'

export default {
  name: 'UserManagement',
  components: {
    User,
    SuccessFilled,
    Lock,
    WarningFilled,
    Search,
    Refresh,
    Unlock,
    Delete,
    Plus
  },
  setup() {
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const loading = ref(false)
    const showAddDialog = ref(false)
    const showViewDialog = ref(false)
    const showPasswordDialog = ref(false)
    const isEdit = ref(false)
    const selectedUsers = ref([])
    const currentUser = ref(null)
    const userFormRef = ref(null)
    const passwordFormRef = ref(null)

    const statistics = ref({
      total: 0,
      active: 0,
      admin: 0,
      disabled: 0
    })

    const filters = reactive({
      keyword: '',
      role: '',
      status: ''
    })

    const userForm = reactive({
      id: null,
      username: '',
      password: '',
      email: '',
      phone: '',
      role: 'USER',
      status: 'ACTIVE',
      remark: ''
    })

    const passwordForm = reactive({
      userId: null,
      password: '',
      confirmPassword: ''
    })

    const formRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      email: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ]
    }

    const passwordRules = {
      password: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.password) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }

    const users = ref([])

    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN')
    }

    const loadStatistics = async () => {
      try {
        const { data } = await getUserStatistics()
        statistics.value = data || statistics.value
      } catch (error) {
        console.error('加载统计信息失败', error)
      }
    }

    const loadUsers = async () => {
      loading.value = true
      try {
        const params = {
          current: currentPage.value,
          size: pageSize.value
        }

        if (filters.keyword) params.keyword = filters.keyword
        if (filters.role) params.role = filters.role
        if (filters.status) params.status = filters.status

        const { data } = await getUserList(params)
        users.value = data.records || []
        total.value = data.total || 0
      } catch (error) {
        ElMessage.error('加载用户列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadUsers()
    }

    const resetFilters = () => {
      filters.keyword = ''
      filters.role = ''
      filters.status = ''
      currentPage.value = 1
      loadUsers()
    }

    const handleSelectionChange = (selection) => {
      selectedUsers.value = selection
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
      loadUsers()
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadUsers()
    }

    const viewUser = (user) => {
      currentUser.value = user
      showViewDialog.value = true
    }

    const editUser = (user) => {
      isEdit.value = true
      showAddDialog.value = true
      Object.assign(userForm, {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        remark: user.remark || ''
      })
    }

    const saveUser = async () => {
      try {
        await userFormRef.value.validate()

        const data = {
          username: userForm.username,
          email: userForm.email,
          phone: userForm.phone,
          role: userForm.role,
          status: userForm.status,
          remark: userForm.remark
        }

        if (isEdit.value) {
          await updateUser(userForm.id, data)
          ElMessage.success('用户更新成功')
        } else {
          data.password = userForm.password
          await createUser(data)
          ElMessage.success('用户添加成功')
        }

        showAddDialog.value = false
        resetUserForm()
        await loadUsers()
        await loadStatistics()
      } catch (error) {
        if (error !== false) {
          ElMessage.error('保存失败，请重试')
        }
      }
    }

    const resetUserForm = () => {
      Object.assign(userForm, {
        id: null,
        username: '',
        password: '',
        email: '',
        phone: '',
        role: 'USER',
        status: 'ACTIVE',
        remark: ''
      })
      isEdit.value = false
      userFormRef.value?.clearValidate()
    }

    const toggleStatus = async (user) => {
      const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
      const statusText = newStatus === 'ACTIVE' ? '启用' : '禁用'

      try {
        await ElMessageBox.confirm(
          `确定要${statusText}用户"${user.username}"吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await setUserStatus(user.id, newStatus)
        ElMessage.success(`${statusText}成功`)
        await loadUsers()
        await loadStatistics()
      } catch {
        // 用户取消
      }
    }

    const resetPassword = (user) => {
      passwordForm.userId = user.id
      passwordForm.password = ''
      passwordForm.confirmPassword = ''
      showPasswordDialog.value = true
    }

    const confirmResetPassword = async () => {
      try {
        await passwordFormRef.value.validate()
        await resetUserPassword(passwordForm.userId, passwordForm.password)
        ElMessage.success('密码重置成功')
        showPasswordDialog.value = false
      } catch (error) {
        if (error !== false) {
          ElMessage.error('密码重置失败')
        }
      }
    }

    const deleteUserItem = async (user) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除用户"${user.username}"吗？此操作不可恢复！`,
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await deleteUser(user.id)
        ElMessage.success('删除成功')
        await loadUsers()
        await loadStatistics()
      } catch {
        // 用户取消
      }
    }

    const batchSetStatus = async (status) => {
      const statusText = status === 'ACTIVE' ? '启用' : '禁用'
      const userIds = selectedUsers.value.map(u => u.id)

      try {
        await ElMessageBox.confirm(
          `确定要批量${statusText}选中的 ${userIds.length} 个用户吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await batchSetUserStatus({ ids: userIds, status })
        ElMessage.success(`批量${statusText}成功`)
        await loadUsers()
        await loadStatistics()
      } catch {
        // 用户取消
      }
    }

    const batchDelete = async () => {
      const userIds = selectedUsers.value.map(u => u.id)

      try {
        await ElMessageBox.confirm(
          `确定要批量删除选中的 ${userIds.length} 个用户吗？此操作不可恢复！`,
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await batchDeleteUsers(userIds)
        ElMessage.success('批量删除成功')
        await loadUsers()
        await loadStatistics()
      } catch {
        // 用户取消
      }
    }

    onMounted(() => {
      loadUsers()
      loadStatistics()
    })

    return {
      currentPage,
      pageSize,
      total,
      loading,
      showAddDialog,
      showViewDialog,
      showPasswordDialog,
      isEdit,
      selectedUsers,
      currentUser,
      statistics,
      filters,
      userForm,
      passwordForm,
      userFormRef,
      passwordFormRef,
      formRules,
      passwordRules,
      users,
      formatDate,
      handleSearch,
      resetFilters,
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      viewUser,
      editUser,
      saveUser,
      resetUserForm,
      toggleStatus,
      resetPassword,
      confirmResetPassword,
      deleteUserItem,
      batchSetStatus,
      batchDelete
    }
  }
}
</script>

<style scoped>
.user-management-container {
  max-width: 1600px;
  margin: 0 auto;
}

.statistics-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon .el-icon {
  font-size: 28px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-actions {
  display: flex;
  align-items: center;
  margin-top: 15px;
}

.user-list-card {
  min-height: 500px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.user-detail {
  padding: 10px 0;
}
</style>
