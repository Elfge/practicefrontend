import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/common/Layout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue')
      },
      {
        path: 'question-bank',
        name: 'QuestionBank',
        component: () => import('@/views/QuestionBank.vue')
      },
      {
        path: 'practice',
        name: 'Practice',
        component: () => import('@/views/Practice.vue')
      },
      {
        path: 'practice/:mode',
        name: 'PracticeMode',
        component: () => import('@/views/PracticeMode.vue')
      },
      {
        path: 'mistakes',
        name: 'Mistakes',
        component: () => import('@/views/Mistakes.vue')
      },
      {
        path: 'import',
        name: 'Import',
        component: () => import('@/views/Import.vue')
      },
      {
        path: 'notes',
        name: 'Notes',
        component: () => import('@/views/Notes.vue')
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/views/Tasks.vue')
      },
      {
        path: 'collections',
        name: 'Collections',
        component: () => import('@/views/Collections.vue')
      },
      {
        path: 'mock-exam',
        name: 'MockExam',
        component: () => import('@/views/MockExam.vue')
      },
      {
        path: 'exam',
        name: 'Exam',
        component: () => import('@/views/Exam.vue')
      },
      {
        path: 'exam/result/:id',
        name: 'ExamResult',
        component: () => import('@/views/ExamResult.vue')
      },
      {
        path: 'exam/review/:id',
        name: 'ExamReview',
        component: () => import('@/views/ExamReview.vue')
      },
      {
        path: 'exam/:type/:id',
        name: 'ExamDetail',
        component: () => import('@/views/ExamDetail.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router