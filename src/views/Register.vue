<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h2 class="register-title">用户注册</h2>
      </template>

      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请设置用户名"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请设置密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker
            v-model="registerForm.examDate"
            type="date"
            placeholder="选择预计考试日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意《用户协议》和《隐私政策》
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            style="width: 100%"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>

        <div class="register-footer">
          <span>已有账号？</span>
          <router-link to="/login" class="login-link">立即登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const registerFormRef = ref()
    const loading = ref(false)

    const registerForm = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      examDate: '',
      agreement: false
    })

    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (value.length < 6) {
        callback(new Error('密码长度不能少于6位'))
      } else {
        if (registerForm.confirmPassword !== '') {
          registerFormRef.value.validateField('confirmPassword')
        }
        callback()
      }
    }

    const validateConfirmPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }

    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      password: [
        { validator: validatePass, trigger: 'blur' }
      ],
      confirmPassword: [
        { validator: validateConfirmPass, trigger: 'blur' }
      ],
      agreement: [
        { required: true, message: '请同意用户协议', trigger: 'change' }
      ]
    }

    const handleRegister = async () => {
      if (!registerFormRef.value) return

      await registerFormRef.value.validate(async (valid) => {
        if (valid) {
          if (!registerForm.agreement) {
            ElMessage.warning('请先同意用户协议')
            return
          }

          loading.value = true
          try {
            await new Promise(resolve => setTimeout(resolve, 1000))

            console.log('注册信息:', registerForm)

            ElMessage.success('注册成功，请登录')
            router.push('/login')
          } catch (error) {
            ElMessage.error('注册失败，请稍后重试')
          } finally {
            loading.value = false
          }
        }
      })
    }

    return {
      registerForm,
      rules,
      registerFormRef,
      loading,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

.register-card {
  width: 500px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.register-title {
  text-align: center;
  color: #333;
  font-size: 24px;
  font-weight: bold;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-link {
  color: #409EFF;
  text-decoration: none;
  margin-left: 5px;
}

.login-link:hover {
  text-decoration: underline;
}
</style>