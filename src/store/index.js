import { createStore } from 'vuex'

// 从localStorage恢复user信息
const storedUser = localStorage.getItem('user')
const initialUser = storedUser ? JSON.parse(storedUser) : null

export default createStore({
  state: {
    user: initialUser,
    token: localStorage.getItem('token') || null,
    theme: localStorage.getItem('theme') || 'default',
    questions: [],
    filters: {
      subject: '',
      chapter: '',
      difficulty: '',
      questionType: '',
      year: ''
    }
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_THEME(state, theme) {
      state.theme = theme
    },
    SET_QUESTIONS(state, questions) {
      state.questions = questions
    },
    UPDATE_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters }
    }
  },
  actions: {
    login({ commit }, { token, user }) {
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
    },
    logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
    },
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme)
    },
    updateUserInfo({ commit, state }, userInfo) {
      const updatedUser = { ...state.user, ...userInfo }
      commit('SET_USER', updatedUser)
    },
    updateFilters({ commit }, filters) {
      commit('UPDATE_FILTERS', filters)
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    isAdmin: state => state.user?.role === 'ADMIN',
    filteredQuestions: state => {
      return state.questions.filter(question => {
        return (!state.filters.subject || question.subject === state.filters.subject) &&
          (!state.filters.chapter || question.chapter === state.filters.chapter) &&
          (!state.filters.difficulty || question.difficulty === state.filters.difficulty) &&
          (!state.filters.questionType || question.type === state.filters.questionType) &&
          (!state.filters.year || question.year === state.filters.year)
      })
    }
  }
})