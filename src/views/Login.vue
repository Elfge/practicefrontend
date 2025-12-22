<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">408考研题库系统</h2>
      </template>

      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="0">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名/邮箱"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <span>还没有账号？</span>
          <router-link to="/register" class="register-link">立即注册</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const store = useStore()
    const loginFormRef = ref()
    const loading = ref(false)

    const loginForm = reactive({
      username: '',
      password: '',
      remember: false
    })

    const rules = {
      username: [
        { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
      ]
    }

    const handleLogin = async () => {
      if (!loginFormRef.value) return

      await loginFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const token = 'mock-jwt-token-' + Date.now()
            const user = {
              id: 1,
              username: loginForm.username,
              email: loginForm.username + '@example.com',
              role: 'user'
            }

            store.dispatch('login', { token, user })

            ElMessage.success('登录成功')
            router.push('/home')
          } catch (error) {
            ElMessage.error('登录失败，请检查用户名和密码')
          } finally {
            loading.value = false
          }
        }
      })
    }

    return {
      loginForm,
      rules,
      loginFormRef,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-title {
  text-align: center;
  color: #333;
  font-size: 24px;
  font-weight: bold;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-link {
  color: #409EFF;
  text-decoration: none;
  margin-left: 5px;
}

.register-link:hover {
  text-decoration: underline;
}
</style>