<template>
  <el-container class="layout-container">
    <el-header class="top-header">
      <div class="logo">
        <h3>408题库系统</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="top-menu"
        mode="horizontal"
        :ellipsis="false"
        background-color="transparent"
        text-color="#606266"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <el-menu-item index="/question-bank">
          <el-icon><Document /></el-icon>
          <span>题库管理</span>
        </el-menu-item>

        <el-sub-menu index="practice">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>刷题练习</span>
          </template>
          <el-menu-item index="/practice">刷题模式</el-menu-item>
          <el-menu-item index="/mistakes">错题本</el-menu-item>
          <el-menu-item index="/knowledge">考点溯源</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/exam">
          <el-icon><EditPen /></el-icon>
          <span>模拟考试</span>
        </el-menu-item>

        <el-menu-item index="/collections">
          <el-icon><Star /></el-icon>
          <span>收藏题目</span>
        </el-menu-item>

        <el-menu-item index="/notes">
          <el-icon><Notebook /></el-icon>
          <span>学习笔记</span>
        </el-menu-item>

        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>

      <div class="header-right">
        <theme-switcher />
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-icon><UserFilled /></el-icon>
            {{ user?.username || '用户' }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  Document,
  Reading,
  EditPen,
  Star,
  Notebook,
  User,
  UserFilled,
  ArrowDown
} from '@element-plus/icons-vue'
import ThemeSwitcher from './ThemeSwitcher.vue'

export default {
  name: 'Layout',
  components: {
    ThemeSwitcher,
    HomeFilled,
    Document,
    Reading,
    EditPen,
    Star,
    Notebook,
    User,
    UserFilled,
    ArrowDown
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const activeMenu = computed(() => route.path)
    const user = computed(() => store.state.user)

    const breadcrumb = computed(() => {
      const breadcrumbMap = {
        '/home': '首页',
        '/question-bank': '题库管理',
        '/profile': '个人中心'
      }
      return breadcrumbMap[route.path] || ''
    })

    const handleCommand = async (command) => {
      switch (command) {
        case 'profile':
          router.push('/profile')
          break
        case 'settings':
          ElMessage.info('设置功能开发中...')
          break
        case 'logout':
          try {
            await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })

            store.dispatch('logout')
            ElMessage.success('退出成功')
            router.push('/login')
          } catch {
            // 用户取消
          }
          break
      }
    }

    return {
      activeMenu,
      user,
      breadcrumb,
      handleCommand
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  flex-direction: column;
  background-color: #f5f7fa;
}

.top-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  padding: 0;
  height: 64px;
  border-bottom: 1px solid #e4e7ed;
  position: relative;
}

.top-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 50%, #E6A23C 100%);
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  min-width: 200px;
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
}

.logo::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(30deg);
}

.logo h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

.top-menu {
  flex: 1;
  border-bottom: none;
  background: transparent;
  display: flex;
  justify-content: center;
}

.top-menu :deep(.el-menu-item) {
  color: #606266;
  font-weight: 500;
  font-size: 16px;
  height: 64px;
  line-height: 64px;
  border-bottom: none !important;
  transition: all 0.3s ease;
  margin: 0 8px;
  border-radius: 6px;
  padding: 0 20px;
}

.top-menu :deep(.el-menu-item:hover) {
  background-color: rgba(64, 158, 255, 0.1) !important;
  color: #409EFF;
}

.top-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.15) !important;
  color: #409EFF;
  position: relative;
}

.top-menu :deep(.el-sub-menu__title) {
  color: #606266;
  font-weight: 500;
  font-size: 16px;
  height: 64px;
  line-height: 64px;
  border-bottom: none !important;
  transition: all 0.3s ease;
  margin: 0 8px;
  border-radius: 6px;
  padding: 0 20px;
}

.top-menu :deep(.el-sub-menu__title:hover) {
  background-color: rgba(64, 158, 255, 0.1) !important;
  color: #409EFF;
}

.header-right {
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.user-info:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.main-content {
  background-color: #f5f7fa;
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

/* 护眼模式样式 */
[data-theme="eye-care"] .layout-container {
  background-color: #FDF6E3;
}

[data-theme="eye-care"] .top-header {
  background: linear-gradient(135deg, #FFF8E7 0%, #FFFAF0 100%);
  border-bottom-color: #D4C4A8;
}

[data-theme="eye-care"] .logo {
  background: linear-gradient(135deg, #CD853F 0%, #DAA520 100%);
}

[data-theme="eye-care"] .top-menu :deep(.el-menu-item:hover),
[data-theme="eye-care"] .top-menu :deep(.el-sub-menu__title:hover) {
  background-color: rgba(205, 133, 63, 0.15) !important;
  color: #CD853F;
}

[data-theme="eye-care"] .top-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(205, 133, 63, 0.2) !important;
  color: #CD853F;
}

[data-theme="eye-care"] .user-info:hover {
  background-color: rgba(205, 133, 63, 0.15);
  color: #CD853F;
}

[data-theme="eye-care"] .main-content {
  background-color: #FDF6E3;
}
</style>